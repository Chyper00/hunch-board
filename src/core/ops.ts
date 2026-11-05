import { COMPONENT_CATALOG, COMPONENT_IDS, type ComponentVariantId } from "@/lib/componentCatalog";
import { createId } from "@/lib/id";
import { SOFTWARE_FRAME_COLORS, SOFTWARE_LINK_COLOR } from "@/lib/softwareKit";
import type {
  BoardFlow,
  BoardFrame,
  BoardLink,
  BoardNode,
  ComponentData,
  DecisionStatus,
  Endpoint,
  Entity,
  LinkStyle,
  NoteData,
  NoteType,
} from "@/lib/types";

import { componentKeys, slugify, type BoardDocument } from "./document";
import { autoArrange, frameAround, placeNewNodes } from "./layout";

/**
 * Edits to a board, as plain data. Components are referred to by their
 * readable key ("orders-api"), never by internal ids, so a person or a model
 * can write a list of operations without knowing anything about storage.
 * `applyOps` is pure: same document + same ops = same result.
 */
export type BoardOp =
  | { op: "set_title"; title: string }
  | {
      op: "add_component";
      key?: string;
      /** Catalog id ("database") or label ("Relational DB"). Unknown = service. */
      type: string;
      title: string;
      tech?: string;
      description?: string;
      entities?: Entity[];
      endpoints?: Endpoint[];
      x?: number;
      y?: number;
    }
  | {
      op: "update_component";
      key: string;
      set: Partial<Pick<ComponentData, "title" | "tech" | "description" | "src" | "entities" | "endpoints">> & { type?: string };
    }
  | { op: "remove_component"; key: string }
  | { op: "connect"; from: string; to: string; label?: string; technology?: string; async?: boolean; style?: LinkStyle; endpoint?: string }
  | { op: "disconnect"; from: string; to: string; label?: string }
  | { op: "add_note"; text: string; noteType?: NoteType; adr?: { status?: DecisionStatus; context?: string; consequences?: string } }
  | { op: "add_frame"; label: string; contains: string[]; color?: string }
  | { op: "add_flow"; name: string; steps: Array<{ from: string; to: string; label?: string }> }
  | { op: "auto_layout" };

export interface OpError {
  /** Index of the op in the list. */
  index: number;
  message: string;
}

export interface ApplyResult {
  doc: BoardDocument;
  errors: OpError[];
}

export function variantFromName(name: string | undefined): ComponentVariantId {
  const needle = (name ?? "").trim().toLowerCase();
  if (!needle) return "service";
  const byId = COMPONENT_IDS.find((id) => id === needle || id.replace(/-/g, " ") === needle);
  if (byId) return byId;
  const byLabel = COMPONENT_IDS.find((id) => COMPONENT_CATALOG[id].label.toLowerCase() === needle);
  if (byLabel) return byLabel;
  const byDefaultTitle = COMPONENT_IDS.find((id) => COMPONENT_CATALOG[id].defaultTitle.toLowerCase() === needle);
  return byDefaultTitle ?? "service";
}

function isKnownVariant(name: string): boolean {
  const needle = name.trim().toLowerCase();
  return COMPONENT_IDS.some(
    (id) => id === needle || id.replace(/-/g, " ") === needle || COMPONENT_CATALOG[id].label.toLowerCase() === needle || COMPONENT_CATALOG[id].defaultTitle.toLowerCase() === needle,
  );
}

export function applyOps(input: BoardDocument, ops: BoardOp[], options: { now?: number } = {}): ApplyResult {
  const now = options.now ?? Date.now();
  const doc: BoardDocument = {
    ...input,
    nodes: [...input.nodes],
    links: [...input.links],
    frames: [...input.frames],
    flows: [...input.flows],
  };
  const errors: OpError[] = [];
  const newNodeIds = new Set<string>();
  const pendingFrames: Array<{ index: number; label: string; contains: string[]; color?: string }> = [];
  let layoutAll = false;

  const idByKey = () => {
    const map = new Map<string, string>();
    for (const [id, key] of componentKeys(doc.nodes)) map.set(key, id);
    return map;
  };
  const resolve = (key: string): string | undefined => idByKey().get(slugify(key)) ?? idByKey().get(key);
  const nextZ = () => doc.nodes.reduce((max, node) => Math.max(max, node.z), 0) + 1;

  ops.forEach((op, index) => {
    const fail = (message: string) => errors.push({ index, message });
    switch (op.op) {
      case "set_title":
        doc.title = op.title.trim() || doc.title;
        return;
      case "add_component": {
        if (!op.title?.trim()) return fail("add_component needs a title.");
        if (op.type && !isKnownVariant(op.type)) fail(`Unknown type "${op.type}". Added as a service. See list_component_types.`);
        const key = slugify(op.key || op.title);
        if (resolve(key)) return fail(`A component with key "${key}" already exists. Use update_component.`);
        const id = createId();
        const data: ComponentData = {
          title: op.title.trim(),
          variant: variantFromName(op.type),
          key,
          ...(op.tech ? { tech: op.tech } : {}),
          ...(op.description ? { description: op.description } : {}),
          ...(op.entities?.length ? { entities: op.entities } : {}),
          ...(op.endpoints?.length ? { endpoints: op.endpoints } : {}),
        };
        const hasPosition = Number.isFinite(op.x) && Number.isFinite(op.y);
        doc.nodes.push({ id, kind: "component", x: op.x ?? 0, y: op.y ?? 0, z: nextZ(), rotation: 0, tags: [], data, createdAt: now, updatedAt: now });
        if (!hasPosition) newNodeIds.add(id);
        return;
      }
      case "update_component": {
        const id = resolve(op.key);
        if (!id) return fail(`No component with key "${op.key}".`);
        const at = doc.nodes.findIndex((node) => node.id === id);
        const node = doc.nodes[at];
        const current = node.data as ComponentData;
        const { type, ...rest } = op.set;
        if (type && !isKnownVariant(type)) fail(`Unknown type "${type}". Kept "${current.variant}".`);
        const next: ComponentData = { ...current, ...rest, ...(type && isKnownVariant(type) ? { variant: variantFromName(type), accent: undefined } : {}) };
        doc.nodes[at] = { ...node, data: next, updatedAt: now };
        return;
      }
      case "remove_component": {
        const id = resolve(op.key);
        if (!id) return fail(`No component with key "${op.key}".`);
        doc.nodes = doc.nodes.filter((node) => node.id !== id);
        const removed = new Set(doc.links.filter((link) => link.from === id || link.to === id).map((link) => link.id));
        doc.links = doc.links.filter((link) => !removed.has(link.id));
        doc.flows = doc.flows.map((flow) => ({ ...flow, linkIds: flow.linkIds.filter((linkId) => !removed.has(linkId)) }));
        return;
      }
      case "connect": {
        const from = resolve(op.from);
        const to = resolve(op.to);
        if (!from) return fail(`No component with key "${op.from}".`);
        if (!to) return fail(`No component with key "${op.to}".`);
        if (from === to) return fail("A component can't connect to itself.");
        const label = op.label?.trim() || undefined;
        if (doc.links.some((link) => link.from === from && link.to === to && (link.label ?? "") === (label ?? ""))) {
          return fail(`${op.from} → ${op.to}${label ? ` "${label}"` : ""} already exists.`);
        }
        const link: BoardLink = {
          id: createId(),
          from,
          to,
          color: SOFTWARE_LINK_COLOR,
          style: op.style ?? (op.async ? "dashed" : "solid"),
          width: 2,
          arrow: "end",
          routing: "elbow",
          ...(label ? { label } : {}),
          ...(op.technology ? { technology: op.technology } : {}),
          ...(op.endpoint ? { endpoint: op.endpoint } : {}),
          createdAt: now,
        };
        doc.links.push(link);
        return;
      }
      case "disconnect": {
        const from = resolve(op.from);
        const to = resolve(op.to);
        const removed = new Set(
          doc.links.filter((link) => link.from === from && link.to === to && (op.label === undefined || link.label === op.label)).map((link) => link.id),
        );
        if (removed.size === 0) return fail(`No connector ${op.from} → ${op.to}.`);
        doc.links = doc.links.filter((link) => !removed.has(link.id));
        doc.flows = doc.flows.map((flow) => ({ ...flow, linkIds: flow.linkIds.filter((linkId) => !removed.has(linkId)) }));
        return;
      }
      case "add_note": {
        if (!op.text?.trim()) return fail("add_note needs text.");
        const data: NoteData = {
          text: op.text.trim(),
          color: op.noteType === "decision" ? "blue" : op.noteType === "question" ? "pink" : op.noteType === "out-of-scope" ? "green" : "yellow",
          ...(op.noteType ? { noteType: op.noteType } : {}),
          ...(op.adr ? { adr: op.adr } : {}),
        };
        const id = createId();
        doc.nodes.push({ id, kind: "note", x: 0, y: 0, z: nextZ(), rotation: 0, tags: [], data, createdAt: now, updatedAt: now });
        newNodeIds.add(id);
        return;
      }
      case "add_frame":
        // Frames wrap their members, so they are sized after everything is placed.
        pendingFrames.push({ index, label: op.label, contains: op.contains, color: op.color });
        return;
      case "add_flow": {
        const linkIds: string[] = [];
        for (const step of op.steps) {
          const from = resolve(step.from);
          const to = resolve(step.to);
          const link = doc.links.find((item) => item.from === from && item.to === to && (step.label === undefined || item.label === step.label));
          if (!link) {
            fail(`Flow "${op.name}": no connector ${step.from} → ${step.to}. Connect them first.`);
            continue;
          }
          linkIds.push(link.id);
        }
        const flow: BoardFlow = { id: createId(), name: op.name.trim() || "Flow", linkIds };
        doc.flows = [...doc.flows.filter((item) => item.name !== flow.name), flow];
        return;
      }
      case "auto_layout":
        layoutAll = true;
        return;
      default:
        fail(`Unknown op "${(op as { op: string }).op}".`);
    }
  });

  doc.nodes = layoutAll ? autoArrange(doc.nodes, doc.links) : placeNewNodes(doc.nodes, doc.links, newNodeIds);

  for (const pending of pendingFrames) {
    const ids = pending.contains.map((key) => ({ key, id: resolve(key) }));
    for (const missing of ids.filter((item) => !item.id)) errors.push({ index: pending.index, message: `Frame "${pending.label}": no component "${missing.key}".` });
    const members = doc.nodes.filter((node) => ids.some((item) => item.id === node.id));
    const rect = frameAround(members);
    if (!rect) continue;
    const frame: BoardFrame = {
      id: createId(),
      label: pending.label,
      ...rect,
      color: pending.color ?? SOFTWARE_FRAME_COLORS[doc.frames.length % SOFTWARE_FRAME_COLORS.length],
      createdAt: now,
    };
    doc.frames = [...doc.frames.filter((item) => item.label !== frame.label), frame];
  }

  return { doc, errors };
}

/** Keeps a board's nodes in the shape the store expects (one record per id). */
export function nodesById(nodes: BoardNode[]): Record<string, BoardNode> {
  return Object.fromEntries(nodes.map((node) => [node.id, node]));
}

/**
 * Adds `incoming` next to `base` (to the right of everything already there),
 * keeping both. Keys that collide get a suffix, so nothing is overwritten.
 */
export function mergeDocuments(base: BoardDocument, incoming: BoardDocument): BoardDocument {
  if (base.nodes.length === 0) return { ...incoming, title: base.title || incoming.title };
  const right = Math.max(...base.nodes.map((node) => node.x + 260));
  const left = Math.min(...incoming.nodes.map((node) => node.x), Infinity);
  const top = Math.min(...base.nodes.map((node) => node.y));
  const incomingTop = Math.min(...incoming.nodes.map((node) => node.y), Infinity);
  const dx = Number.isFinite(left) ? right + 200 - left : 0;
  const dy = Number.isFinite(incomingTop) ? top - incomingTop : 0;
  const taken = new Set(componentKeys(base.nodes).values());
  const z = base.nodes.reduce((max, node) => Math.max(max, node.z), 0);
  const nodes = incoming.nodes.map((node) => {
    let data = node.data;
    if (node.kind === "component") {
      const component = node.data as ComponentData;
      let key = component.key ?? slugify(component.title);
      let n = 2;
      while (taken.has(key)) key = `${component.key ?? slugify(component.title)}-${n++}`;
      taken.add(key);
      data = { ...component, key };
    }
    return { ...node, x: node.x + dx, y: node.y + dy, z: node.z + z, data };
  });
  return {
    ...base,
    nodes: [...base.nodes, ...nodes],
    links: [...base.links, ...incoming.links],
    frames: [...base.frames, ...incoming.frames.map((frame) => ({ ...frame, x: frame.x + dx, y: frame.y + dy }))],
    flows: [...base.flows, ...incoming.flows],
  };
}
