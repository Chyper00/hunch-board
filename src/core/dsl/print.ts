/** Board to text: writes a board document in the Hunch language, the form people and AIs read and review. */
import { COMPONENT_CATALOG, type ComponentVariantId } from "@/lib/componentCatalog";
import type { BoardLink, ComponentData, LabelData, NoteData } from "@/lib/types";
import { componentKeys, slugify, type BoardDocument } from "../document";
import { screenMembersOf } from "../ui/screens";
import { quote, attrsToText } from "./lex";
import { entityToText } from "./entities";

/** Fields that boards saved by older versions still hold in the browser: written as plain attributes, so a save loses none. */
function legacyAttrs(data: ComponentData): Array<[string, string | number | true | undefined]> {
  const old = data as ComponentData & {
    scope?: string;
    c4?: string;
    layer?: string;
    audience?: { people?: number; perMinute?: number };
    runtime?: { replicas?: number; port?: number; language?: string; framework?: string; managed?: boolean };
  };
  return [
    ["scope", old.scope && old.scope !== "mvp" ? old.scope : undefined],
    ["replicas", old.runtime?.replicas],
    ["managed", old.runtime?.managed ? true : undefined],
    ["port", old.runtime?.port],
    ["language", old.runtime?.language],
    ["framework", old.runtime?.framework],
    ["c4", old.c4],
    ["people", old.audience?.people],
    ["rpm", old.audience?.perMinute],
    ["layer", old.layer],
  ];
}

/**
 * Board → text. With `layout: true` the positions are appended as `@layout`
 * lines, so a file on disk reopens exactly as it was saved.
 */
export function printDsl(doc: BoardDocument, options: { layout?: boolean; inside?: Record<string, string> } = {}): string {
  const out: string[] = [`title ${doc.title || "Untitled board"}`];

  const keys = componentKeys(doc.nodes);
  const comps = doc.nodes.filter((node) => node.kind === "component");
  // Custom types first, so the components below can use them.
  const customs = new Map<string, ComponentData>();
  for (const node of comps) {
    const data = node.data as ComponentData;
    if (data.custom && !customs.has(data.custom.label.toLowerCase())) customs.set(data.custom.label.toLowerCase(), data);
  }
  if (customs.size) out.push("");
  for (const data of customs.values()) {
    out.push(`type ${quote(data.custom!.label)}${attrsToText([["like", data.variant], ["shape", data.custom!.shape], ["color", data.accent]])}`);
  }
  if (comps.length) out.push("");
  for (const node of comps) {
    const data = node.data as ComponentData;
    const type = data.custom?.label ?? COMPONENT_CATALOG[data.variant as ComponentVariantId]?.label ?? "Service";
    const strings = [data.title || type];
    if (data.tech || data.description) strings.push(data.tech ?? "");
    if (data.description) strings.push(data.description);
    const attrs = attrsToText([
      ["status", data.status],
      ["owner", data.owner],
      ["path", data.path],
      ["src", data.src],
      ["cloud", data.cloud],
      [data.ui?.tone ?? "", data.ui?.tone ? true : undefined],
      ["placeholder", data.ui?.placeholder],
      ["options", data.ui?.options?.length ? data.ui.options.join("|") : undefined],
      ["required", data.ui?.required ? true : undefined],
      ["disabled", data.ui?.disabled ? true : undefined],
      ["goto", data.ui?.goto],
      ["calls", data.ui?.calls],
      ["field", data.ui?.field],
      ["collapsed", data.ui?.collapsed ? true : undefined],
      ["tags", node.tags.length ? node.tags.join(",") : undefined],
      ...legacyAttrs(data),
      ...Object.entries(data.attrs ?? {}),
    ]);
    out.push(`${keys.get(node.id)}: ${type} ${strings.map(quote).join(" ")}${attrs}`);
    for (const entity of data.entities ?? []) out.push(`  entity ${entityToText(entity)}`);
    for (const endpoint of data.endpoints ?? []) {
      const endpointAttrs = attrsToText([
        ["auth", endpoint.auth],
        ["idempotent", endpoint.idempotent ? true : undefined],
        ["paginate", endpoint.paginate ? true : undefined],
      ]);
      out.push(`  endpoint ${endpoint.method} ${endpoint.path}${endpoint.summary ? ` ${quote(endpoint.summary)}` : ""}${endpointAttrs}`);
      if (endpoint.body) out.push(`    body ${endpoint.body}`);
      for (const response of endpoint.responses ?? []) {
        const responseBody = response.body ? ` ${response.body}` : "";
        const description = response.description ? ` ${quote(response.description)}` : "";
        out.push(`    ${response.status}${responseBody}${description}`);
      }
    }
    for (const link of data.links ?? []) out.push(`  link ${link.kind} ${quote(link.url)}${link.label ? ` ${quote(link.label)}` : ""}`);
  }

  const insideLines = comps.flatMap((node) => {
    const data = node.data as ComponentData;
    const key = keys.get(node.id);
    if (!key) return [];
    const listed = data.insideFiles?.length ? data.insideFiles : data.insideFile ? [data.insideFile] : [];
    const fromOptions = options.inside?.[key];
    const files = listed.length ? listed : fromOptions ? [fromOptions] : [];
    return files.map((file) => `inside ${key} ${file}`);
  });
  if (insideLines.length) out.push("", ...insideLines);

  const relations = doc.links.filter((link) => keys.has(link.from) && keys.has(link.to));
  if (relations.length) out.push("");
  for (const link of relations) {
    const arrow = link.arrow === "implements" ? "-|>" : link.style === "dashed" ? "-->" : link.style === "dotted" ? "..>" : "=>";
    const strings: string[] = [];
    if (link.label || link.technology) strings.push(link.label ?? "");
    if (link.technology) strings.push(link.technology);
    const attrs = attrsToText([
      ["both", link.arrow === "both" ? true : undefined],
      ["extends", link.arrow === "extends" ? true : undefined],
      ["aggregation", link.arrow === "aggregation" ? true : undefined],
      ["composition", link.arrow === "composition" ? true : undefined],
      ["none", link.arrow === "none" ? true : undefined],
      ["calls", link.endpoint],
    ]);
    out.push(`${keys.get(link.from)} ${arrow} ${keys.get(link.to)}${strings.length ? ` ${strings.map(quote).join(" ")}` : ""}${attrs}`);
  }

  const frameLines = doc.frames.flatMap((frame) => {
    if (frame.device) {
      // A screen lists its elements top to bottom, then left to right: the order the AI reads them in.
      const members = screenMembersOf(frame, comps);
      const states = Object.entries(frame.states ?? {}).map(([name, text]): [string, string] => [name, text]);
      return [`frame ${quote(frame.label)}${attrsToText([["device", frame.device], ["route", frame.route], ...states])}: ${members.map((node) => keys.get(node.id)).join(", ")}`];
    }
    const members = comps.filter((node) => {
      const size = { w: (node.data as ComponentData).width ?? 240, h: (node.data as ComponentData).height ?? 110 };
      const cx = node.x + size.w / 2;
      const cy = node.y + size.h / 2;
      return cx >= frame.x && cx <= frame.x + frame.width && cy >= frame.y && cy <= frame.y + frame.height;
    });
    return members.length ? [`frame ${quote(frame.label)}${attrsToText([["kind", frame.kind]])}: ${members.map((node) => keys.get(node.id)).join(", ")}`] : [];
  });
  if (frameLines.length) out.push("", ...frameLines);

  const linkById = new Map(doc.links.map((link) => [link.id, link]));
  const arrowOf = (link: BoardLink) => (link.style === "dashed" ? "-->" : link.style === "dotted" ? "..>" : "=>");
  const stepText = (link: BoardLink) => `${keys.get(link.from)} ${arrowOf(link)} ${keys.get(link.to)}${link.label ? ` ${quote(link.label)}` : ""}`;
  const flowLines = doc.flows.flatMap((flow) => {
    const steps = flow.linkIds.flatMap((id) => {
      const link = linkById.get(id);
      if (!link || !keys.has(link.from) || !keys.has(link.to)) return [];
      return [stepText(link)];
    });
    if (!steps.length) return [];
    const lines = [`flow ${quote(flow.name)}: ${steps.join(", ")}`];
    const stepById = flow.steps ?? {};
    for (const id of flow.linkIds) {
      const link = linkById.get(id);
      const detail = stepById[id];
      if (!link || !detail) continue;
      // With two arrows between the same boxes, only the label says which one this line is about.
      const hasTwin = doc.links.some((other) => other.id !== link.id && other.from === link.from && other.to === link.to);
      const pair = `${keys.get(link.from)} ${arrowOf(link)} ${keys.get(link.to)}${hasTwin && link.label ? ` ${quote(link.label)}` : ""}`;
      if (detail.probability !== undefined) lines.push(`  when ${pair} ${detail.probability}`);
      if (detail.payload) lines.push(`  payload ${pair} ${quote(detail.payload)}${detail.bytes !== undefined ? ` ${detail.bytes}` : ""}`);
      if (detail.narration) lines.push(`  say ${pair} ${quote(detail.narration)}`);
    }
    for (const group of flow.parallel ?? []) {
      const parts = group.flatMap((id) => {
        const link = linkById.get(id);
        return link && keys.has(link.from) && keys.has(link.to) ? [stepText(link)] : [];
      });
      if (parts.length) lines.push(`  parallel ${parts.join(", ")}`);
    }
    if (flow.errorFlow) lines.push(`  on error ${quote(flow.errorFlow)}`);
    return lines;
  });
  if (flowLines.length) out.push("", ...flowLines);

  const freeLines: string[] = [];
  const layoutLines: string[] = [];
  let noteCount = 0;
  let textCount = 0;
  for (const node of doc.nodes) {
    if (node.kind === "note") {
      const data = node.data as NoteData;
      const type = data.noteType && data.noteType !== "comment" ? data.noteType : undefined;
      freeLines.push(
        `note ${quote(data.text)}${attrsToText([
          [type ?? "", type ? true : undefined],
          ["status", data.adr?.status],
          ["context", data.adr?.context],
          ["consequences", data.adr?.consequences],
        ])}`,
      );
      layoutLines.push(`@layout #note${++noteCount} ${Math.round(node.x)} ${Math.round(node.y)}`);
    } else if (node.kind === "label") {
      freeLines.push(`text ${quote((node.data as LabelData).text)}`);
      layoutLines.push(`@layout #text${++textCount} ${Math.round(node.x)} ${Math.round(node.y)}`);
    }
  }
  if (freeLines.length) out.push("", ...freeLines);

  if (doc.retired?.length) out.push("", "// Kept from an older version of Hunch. The board doesn't read these lines.", ...doc.retired);

  if (options.layout) {
    out.push("", "// Positions. Safe to delete: boxes without one are arranged automatically.");
    for (const node of comps) {
      const data = node.data as ComponentData;
      const size = data.width && data.height ? ` ${Math.round(data.width)} ${Math.round(data.height)}` : "";
      out.push(`@layout ${keys.get(node.id)} ${Math.round(node.x)} ${Math.round(node.y)}${size}`);
    }
    out.push(...layoutLines);
    for (const frame of doc.frames.filter((item) => item.device)) out.push(`@layout frame:${slugify(frame.label)} ${Math.round(frame.x)} ${Math.round(frame.y)}`);
  }
  return `${out.join("\n")}\n`;
}
