/** Text to board: reads the Hunch language into a board document, with every problem and its line. */
import { FRAME_KINDS, isFrameKind } from "../frameKinds";
import { createId } from "@/lib/id";
import { SOFTWARE_LINK_COLOR } from "@/lib/softwareKit";
import type { BoardFlow, BoardLink, BoardNode, ComponentData, DecisionStatus, Endpoint, LabelData, LinkArrow, LinkStyle, NoteData, NoteType, CloudProvider, ComponentLinkKind, ComponentStatus, Device, UiProps } from "@/lib/types";
import { safeUrl } from "@/lib/safeUrl";
import { techByName } from "@/lib/techCatalog";
import { CLOUD_PROVIDERS, COMPONENT_STATUSES, DEVICES, LINK_KINDS } from "@/lib/types";
import { componentKeys, slugify, type BoardDocument } from "../document";
import { arrangeGrouped, placeNewNodes } from "../layout";
import { variantFromName } from "../ops";
import { consumeCustomTypeLine, type CustomType } from "./customTypes";
import { placeFrames, type PendingFrame } from "./frames";
import { type DslIssue, type DslParseResult, stripComment, unescape, quotedStrings, lex, KEY, RELATION, DECLARATION, STEP, parseNumber, findColonOutsideQuotes, splitOutsideQuotes, unescapeMaybeQuoted } from "./lex";
import { NOTE_TYPES, NOTE_COLOR, type ComponentDecl } from "./shared";
import { parseEntity } from "./entities";

/**
 * Statements of older versions: requirements, simulation, build specs, code rules.
 * The board no longer reads them. A file that has them still opens, and saving writes them back, so nobody loses a line.
 */
const RETIRED = /^(?:requirement|nfr|estimate|simulate|skip|style|layer|rule|code-pattern|repo|product|problem|audience|goal|metric|role|story|given|screen|shows|action|field|state|stack|run|test|check|env|seed|deploy|nav|enum|relation|states|can|event|webhook|token|reference|vibe|skill|pattern|answer)\s+\S/i;

/** A path an `inside` line may name: a board inside the project's folder. */
function isInsidePath(path: string): boolean {
  return /^[\w./-]+\.hunch$/.test(path) && !path.startsWith("/") && !path.split("/").includes("..");
}

/** A file's place on the board: a path next to it, or a web address. Never outside its folder. */
export function isSafeFileSource(src: string): boolean {
  if (/^https?:\/\//i.test(src)) return true;
  return !src.startsWith("/") && !src.includes("\\") && !/^[a-z]+:/i.test(src) && !src.split("/").includes("..");
}

/** Attributes a box reads itself. Any other is kept on `attrs`, as written. */
const KNOWN_ATTRS = new Set(["status", "owner", "path", "cloud", "tags", "src", "placeholder", "options", "required", "disabled", "primary", "secondary", "danger", "goto", "calls", "field", "collapsed"]);

/**
 * Text → board. `previous` keeps what text can't say (exact positions,
 * colors, logos, drill-downs, connector bends): matched by key, then title.
 * Boxes with no known position are placed by the layout.
 */
/** Replaces `include "other.hunch"` with that file. Missing and circular includes are reported. */
export function expandIncludes(text: string, files: Record<string, string> = {}, stack: string[] = []): { text: string; issues: DslIssue[] } {
  const issues: DslIssue[] = [];
  const lines = text.split("\n").map((raw, index) => {
    const content = stripComment(raw).trim();
    const match = content.match(/^include\s+"((?:[^"\\]|\\.)*)"$/i);
    if (!match) return raw;
    const name = unescape(match[1]);
    if (stack.includes(name)) {
      issues.push({ line: index + 1, message: `include "${name}" is circular.`, severity: "error" });
      return "";
    }
    const file = files[name] ?? files[name.replace(/^\.\//, "")];
    if (file === undefined) {
      issues.push({ line: index + 1, message: `include "${name}" was not found. Open the folder that contains it.`, severity: "error" });
      return "";
    }
    const nested = expandIncludes(file, files, [...stack, name]);
    issues.push(...nested.issues);
    return nested.text;
  });
  return { text: lines.join("\n"), issues };
}

export function parseDsl(text: string, previous?: BoardDocument, files?: Record<string, string>): DslParseResult {
  const expanded = expandIncludes(text, files ?? {});
  const issues: DslIssue[] = [...expanded.issues];
  text = expanded.text;
  const now = Date.now();
  const doc: BoardDocument = { title: previous?.title ?? "Untitled board", nodes: [], links: [], frames: [], flows: [] };
  const retired: string[] = [];

  const decls: ComponentDecl[] = [];
  const later: Array<{ line: number; kind: "relation" | "frame" | "flow" | "note" | "text" | "layout"; text: string }> = [];
  const flowMetas: Array<{ flow: string; line: number; kind: "when" | "parallel" | "payload" | "say" | "error"; text: string }> = [];
  let openFlow: string | null = null;
  let openEndpoint: Endpoint | null = null;
  let current: ComponentDecl | null = null;
  const insideFiles = new Map<string, Array<{ path: string; line: number }>>();
  // Types the board defines itself (dsl/customTypes).
  const customTypes = new Map<string, CustomType>();

  const lines = text.split("\n");
  lines.forEach((raw, index) => {
    const line = index + 1;
    const content = stripComment(raw).trim();
    if (!content) return;
    const issue = (message: string, severity: DslIssue["severity"] = "error") => issues.push({ line, message, severity });
    const lower = content.toLowerCase();

    if (/^(when|parallel|payload|say)\s+/i.test(content) || /^on error\s+/i.test(content)) {
      if (!openFlow) return issue("Put when, parallel, payload, say and on error right after the flow they belong to.");
      const kind = lower.startsWith("on error") ? "error" : (lower.split(/\s+/)[0] as "when" | "parallel" | "payload" | "say");
      const rest = lower.startsWith("on error") ? content.slice(content.toLowerCase().indexOf("error") + 5).trim() : content.replace(/^\S+\s+/, "");
      flowMetas.push({ flow: openFlow, line, kind, text: rest });
      return;
    }
    if (/^body\s+/.test(content) || /^\d{3}\b/.test(content)) {
      if (!openEndpoint) return issue("Put body and status lines right after the endpoint they belong to.");
      if (content.startsWith("body ")) openEndpoint.body = content.slice(5).trim();
      else {
        const status = Number(content.slice(0, 3));
        const rest = content.slice(3).trim();
        let responseBody: string | undefined;
        let description: string | undefined;
        if (rest.startsWith("{")) {
          const end = rest.lastIndexOf("}");
          responseBody = end === -1 ? rest : rest.slice(0, end + 1);
          const after = rest.slice((responseBody?.length ?? 0)).trim();
          if (after.startsWith('"')) description = quotedStrings(after)[0];
        } else if (rest.startsWith('"')) description = quotedStrings(rest)[0];
        else if (rest) description = rest;
        openEndpoint.responses = [...(openEndpoint.responses ?? []), { status, ...(responseBody ? { body: responseBody } : {}), ...(description ? { description } : {}) }];
      }
      return;
    }
    openEndpoint = null;
    // Relations first: a key may be any word ("text", "note"), and a label may hold ":" or "->".
    if (RELATION.test(content)) {
      current = null;
      return later.push({ line, kind: "relation", text: content });
    }
    if (lower.startsWith("inside ")) {
      const rest = content.slice(6).trim();
      const space = rest.search(/\s/);
      const key = space === -1 ? rest : rest.slice(0, space);
      const path = space === -1 ? "" : rest.slice(space).trim();
      const id = slugify(key);
      const named = insideFiles.get(id) ?? [];
      if (!/^[A-Za-z0-9_][\w.-]*$/.test(key) || !isInsidePath(path)) issue("Write it as: inside db boards/api/db.hunch");
      else if (named.some((item) => item.path === path)) issue(`inside ${key} already names ${path}.`);
      else insideFiles.set(id, [...named, { path, line }]);
      current = null;
      return;
    }
    if (RETIRED.test(content)) {
      retired.push(content);
      current = null;
      openFlow = null;
      return;
    }
    if (lower.startsWith("title ")) {
      doc.title = unescapeMaybeQuoted(content.slice(6).trim());
      return;
    }
    if (content.startsWith("# ")) {
      doc.title = content.slice(2).trim();
      return;
    }
    // Every board holds everything now, so there is nothing left for a mode to say.
    if (lower.startsWith("mode ")) return;
    // A type the board defines itself (dsl/customTypes).
    const customTypeLine = consumeCustomTypeLine(content);
    if (customTypeLine) {
      if ("error" in customTypeLine) return issue(customTypeLine.error);
      for (const warning of customTypeLine.warnings) issue(warning, "warning");
      customTypes.set(customTypeLine.type.label.toLowerCase(), customTypeLine.type);
      return;
    }
    if (lower.startsWith("link ")) {
      if (!current) return issue('"link" must come right after the component it belongs to.');
      const { words, strings } = lex(content.slice(5));
      const kind = (words[0] ?? "").toLowerCase();
      const url = strings[0] ?? words[1];
      if (!url || !(LINK_KINDS as readonly string[]).includes(kind)) return issue(`Write a link as: link repo "https://…" (kinds: ${LINK_KINDS.join(", ")}).`);
      if (!safeUrl(url)) return issue("A link must start with http://, https:// or mailto:.");
      current.data.links = [...(current.data.links ?? []), { kind: kind as ComponentLinkKind, url, ...(strings[1] ? { label: strings[1] } : {}) }];
      return;
    }
    if (lower.startsWith("entity ") || lower.startsWith("endpoint ")) {
      if (!current) return issue(`"${content.split(" ")[0]}" must come right after the component it belongs to.`);
      if (lower.startsWith("entity ")) {
        const entity = parseEntity(content.slice(7).trim());
        if (!entity) return issue("Write an entity as Name(field type, field type pk, field type fk=Other.id).");
        current.data.entities = [...(current.data.entities ?? []), entity];
      } else {
        const { words, strings, attrs } = lex(content.slice(9));
        if (words.length < 2) return issue('Write an endpoint as: endpoint POST /orders "What it does"');
        const endpoint: Endpoint = {
          method: words[0].toUpperCase(),
          path: words[1],
          ...(strings[0] ? { summary: strings[0] } : {}),
          ...(typeof attrs.auth === "string" ? { auth: attrs.auth } : {}),
          ...(attrs.idempotent ? { idempotent: true } : {}),
          ...(attrs.paginate ? { paginate: true } : {}),
        };
        current.data.endpoints = [...(current.data.endpoints ?? []), endpoint];
        openEndpoint = endpoint;
      }
      return;
    }
    if (content.startsWith("@layout ")) return later.push({ line, kind: "layout", text: content.slice(8).trim() });
    if (lower.startsWith("frame ")) return later.push({ line, kind: "frame", text: content.slice(6).trim() });
    if (lower.startsWith("flow ")) {
      const body = content.slice(5).trim();
      const colon = findColonOutsideQuotes(body);
      openFlow = colon === -1 ? null : unescapeMaybeQuoted(body.slice(0, colon).trim());
      return later.push({ line, kind: "flow", text: body });
    }
    if (lower.startsWith("note ")) return later.push({ line, kind: "note", text: content.slice(5).trim() });
    if (lower.startsWith("text ")) return later.push({ line, kind: "text", text: content.slice(5).trim() });

    const decl = content.match(DECLARATION);
    if (decl) {
      const key = slugify(decl[1]);
      if (decls.some((item) => item.key === key)) return issue(`"${decl[1]}" is declared twice.`);
      const body = lex(decl[2]);
      // Unquoted words before the first quoted string are the type ("Web app").
      const firstString = body.order.indexOf("string");
      const typeWords = firstString === -1 ? body.words : body.words.slice(0, firstString);
      const typeName = typeWords.join(" ");
      const customType = customTypes.get(typeName.toLowerCase());
      const known = customType?.base ?? variantFromName(typeName);
      // A technology works as a type: `alerts: Telegram "Alerts"` is a chat channel with its logo.
      const named = !customType && known === "service" && !["service", "services"].includes(typeName.toLowerCase()) ? techByName(typeName) : undefined;
      const variant = named?.variant ?? known;
      if (!customType && !named && typeName && variant === "service" && !["service", "services"].includes(typeName.toLowerCase())) {
        issue(`Unknown type "${typeName}", using Service.`, "warning");
      }
      const data: ComponentData = { title: body.strings[0] ?? decl[1], variant, key };
      if (customType) {
        data.custom = { label: customType.label, ...(customType.shape ? { shape: customType.shape } : {}) };
        if (customType.color) data.accent = customType.color;
      }
      if (body.strings[1]) data.tech = body.strings[1];
      else if (named) data.tech = named.label;
      if (body.strings[2]) data.description = body.strings[2];
      const a = body.attrs;
      if (typeof a.status === "string") {
        if ((COMPONENT_STATUSES as readonly string[]).includes(a.status)) data.status = a.status as ComponentStatus;
        else issue(`status must be ${COMPONENT_STATUSES.join(", ")}.`);
      }
      if (typeof a.owner === "string") data.owner = a.owner;
      if (typeof a.path === "string") data.path = a.path;
      if (typeof a.src === "string") {
        if (isSafeFileSource(a.src)) data.src = a.src;
        else issue(`src must be a path inside the board's folder or a web address: ${a.src}`);
      }
      const others = Object.entries(a).filter(([name]) => !KNOWN_ATTRS.has(name));
      if (others.length) data.attrs = Object.fromEntries(others) as Record<string, string | true>;
      if (typeof a.cloud === "string") {
        if ((CLOUD_PROVIDERS as readonly string[]).includes(a.cloud.toLowerCase())) data.cloud = a.cloud.toLowerCase() as CloudProvider;
        else issue(`cloud must be one of ${CLOUD_PROVIDERS.join(", ")}.`);
      }
      // An element of a screen: what it says and does.
      const ui: UiProps = {
        ...(typeof a.placeholder === "string" ? { placeholder: a.placeholder } : {}),
        ...(typeof a.options === "string" ? { options: a.options.split("|").map((item) => item.trim()).filter(Boolean) } : {}),
        ...(a.required ? { required: true } : {}),
        ...(a.disabled ? { disabled: true } : {}),
        ...(a.primary ? { tone: "primary" as const } : a.secondary ? { tone: "secondary" as const } : a.danger ? { tone: "danger" as const } : {}),
        ...(typeof a.goto === "string" ? { goto: slugify(a.goto) } : {}),
        ...(typeof a.calls === "string" ? { calls: a.calls } : {}),
        ...(typeof a.field === "string" ? { field: a.field } : {}),
        ...(a.collapsed ? { collapsed: true } : {}),
      };
      if (Object.keys(ui).length) data.ui = ui;
      const tags = typeof a.tags === "string" ? a.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined;
      current = { line, key, data, tags };
      decls.push(current);
      return;
    }
    issue(`Can't read this line. Expected "key: Type \\"Title\\"", "a -> b", or a keyword (title, frame, flow, note, text).`);
  });

  if (retired.length) doc.retired = retired;

  // Components, reusing previous nodes (by key, then title) so ids, positions and looks survive.
  const prevKeys = previous ? componentKeys(previous.nodes) : new Map<string, string>();
  const prevByKey = new Map<string, BoardNode>();
  const prevByTitle = new Map<string, BoardNode>();
  for (const node of previous?.nodes ?? []) {
    if (node.kind !== "component") continue;
    const key = prevKeys.get(node.id);
    if (key) prevByKey.set(key, node);
    prevByTitle.set((node.data as ComponentData).title.toLowerCase(), node);
  }
  const used = new Set<string>();
  const idByKey = new Map<string, string>();
  const placed = new Set<string>();
  let z = 1;
  for (const decl of decls) {
    const candidate = prevByKey.get(decl.key) ?? prevByTitle.get(decl.data.title.toLowerCase());
    const prev = candidate && !used.has(candidate.id) ? candidate : undefined;
    if (prev) used.add(prev.id);
    const prevData = prev?.data as ComponentData | undefined;
    const id = prev?.id ?? createId();
    idByKey.set(decl.key, id);
    const data: ComponentData = {
      ...decl.data,
      // What the text can't say stays as it was.
      ...(prevData?.accent && prevData.variant === decl.data.variant ? { accent: prevData.accent } : {}),
      ...(prevData?.logo !== undefined ? { logo: prevData.logo } : {}),
      ...(prevData?.childBoardId ? { childBoardId: prevData.childBoardId } : {}),
      ...(insideFiles.get(decl.key)?.length
        ? { insideFile: insideFiles.get(decl.key)![0].path, ...(insideFiles.get(decl.key)!.length > 1 ? { insideFiles: insideFiles.get(decl.key)!.map((item) => item.path) } : {}) }
        : {}),
      ...(prevData?.width ? { width: prevData.width, height: prevData.height } : {}),
    };
    if (prev) placed.add(id);
    doc.nodes.push({
      id,
      kind: "component",
      x: prev?.x ?? 0,
      y: prev?.y ?? 0,
      z: z++,
      rotation: 0,
      tags: decl.tags ?? prev?.tags ?? [],
      data,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    });
  }

  // Relations, reusing the previous connector's look and bends when from/to/label match.
  const prevLinks = previous?.links ?? [];
  const layout = new Map<string, { x: number; y: number; w?: number; h?: number }>();
  const freeNodes: Array<{ ref: string; node: BoardNode }> = [];
  const pendingFrames: PendingFrame[] = [];
  const pendingFlows: Array<{ line: number; name: string; steps: Array<{ from: string; to: string; label?: string }> }> = [];
  let noteCount = 0;
  let textCount = 0;

  for (const item of later) {
    const issue = (message: string, severity: DslIssue["severity"] = "error") => issues.push({ line: item.line, message, severity });
    if (item.kind === "relation") {
      const match = item.text.match(RELATION)!;
      const [, fromKey, arrowToken, toKey, rest] = match;
      const from = idByKey.get(slugify(fromKey));
      const to = idByKey.get(slugify(toKey));
      if (!from) {
        issue(`"${fromKey}" is not declared.`);
        continue;
      }
      if (!to) {
        issue(`"${toKey}" is not declared.`);
        continue;
      }
      if (from === to) {
        issue("A component can't connect to itself.");
        continue;
      }
      const body = lex(rest);
      const label = body.strings[0] || undefined;
      const technology = body.strings[1] || undefined;
      if (doc.links.some((link) => link.from === from && link.to === to && (link.label ?? "") === (label ?? ""))) {
        issue(`${fromKey} -> ${toKey}${label ? ` "${label}"` : ""} is written twice.`, "warning");
        continue;
      }
      // -|> : implements an interface (dashed, hollow triangle).
      const implementsArrow = arrowToken === "-|>";
      const style: LinkStyle = arrowToken === "-->" || implementsArrow || body.attrs.async ? "dashed" : arrowToken === "..>" || body.attrs.planned ? "dotted" : "solid";
      const arrow: LinkArrow = implementsArrow ? "implements" : body.attrs.extends ? "extends" : body.attrs.aggregation ? "aggregation" : body.attrs.composition ? "composition" : body.attrs.both ? "both" : body.attrs.none ? "none" : "end";
      const prev = prevLinks.find((link) => link.from === from && link.to === to && (link.label ?? "") === (label ?? ""));
      const link: BoardLink = {
        ...(prev ?? {}),
        id: prev?.id ?? createId(),
        from,
        to,
        color: prev?.color ?? SOFTWARE_LINK_COLOR,
        style,
        width: prev?.width ?? 2,
        arrow,
        routing: prev?.routing ?? "elbow",
        createdAt: prev?.createdAt ?? now,
      };
      delete link.label;
      delete link.technology;
      if (label) link.label = label;
      if (technology) link.technology = technology;
      delete link.endpoint;
      if (typeof body.attrs.calls === "string") link.endpoint = body.attrs.calls;
      doc.links.push(link);
    } else if (item.kind === "frame" || item.kind === "flow") {
      const colon = findColonOutsideQuotes(item.text);
      if (colon === -1) {
        issue(item.kind === "frame" ? 'Write a frame as: frame "Name": key, key' : 'Write a flow as: flow "Name": a -> b, b -> c');
        continue;
      }
      const head = item.text.slice(0, colon).trim();
      const list = splitOutsideQuotes(item.text.slice(colon + 1));
      // A screen of a UI sketch: frame "Cart" [device=mobile route="/cart" empty="Nothing yet"]: a, b
      const headLex = lex(head);
      const name = head.includes("[") && headLex.strings[0] !== undefined ? headLex.strings[0] : unescapeMaybeQuoted(head);
      const device = typeof headLex.attrs.device === "string" && (DEVICES as readonly string[]).includes(headLex.attrs.device) ? (headLex.attrs.device as Device) : undefined;
      if (headLex.attrs.device !== undefined && !device) issue(`device must be ${DEVICES.join(", ")}.`);
      const states = Object.fromEntries(["empty", "loading", "error"].flatMap((state) => (typeof headLex.attrs[state] === "string" ? [[state, headLex.attrs[state] as string]] : [])));
      // A boundary of a system board: frame "API cluster" [kind=kubernetes]: a, b
      const frameKind = isFrameKind(headLex.attrs.kind) ? headLex.attrs.kind : undefined;
      if (item.kind === "frame" && headLex.attrs.kind !== undefined && !frameKind) issue(`kind must be ${FRAME_KINDS.join(", ")}.`, "warning");
      if (item.kind === "frame")
        pendingFrames.push({
          line: item.line,
          label: name,
          keys: list.map(slugify),
          ...(device ? { device } : {}),
          ...(frameKind ? { kind: frameKind } : {}),
          ...(typeof headLex.attrs.route === "string" ? { route: headLex.attrs.route } : {}),
          ...(Object.keys(states).length ? { states } : {}),
        });
      else {
        const steps: Array<{ from: string; to: string; label?: string }> = [];
        for (const part of list) {
          const step = part.match(STEP);
          if (!step) issue(`Flow step "${part}" should look like: a -> b`);
          else steps.push({ from: slugify(step[1]), to: slugify(step[2]), label: step[3] !== undefined ? unescape(step[3]) : undefined });
        }
        pendingFlows.push({ line: item.line, name, steps });
      }
    } else if (item.kind === "note" || item.kind === "text") {
      const body = lex(item.text);
      const value = body.strings[0];
      if (value === undefined) {
        issue(`Put the ${item.kind} in quotes: ${item.kind} "…"`);
        continue;
      }
      const ref = item.kind === "note" ? `#note${++noteCount}` : `#text${++textCount}`;
      const prev = previous?.nodes.find((node) => node.kind === (item.kind === "note" ? "note" : "label") && (node.data as NoteData).text === value);
      let data: NoteData | LabelData;
      if (item.kind === "note") {
        const noteType = NOTE_TYPES.find((type) => body.attrs[type]) ?? (typeof body.attrs.type === "string" ? (body.attrs.type as NoteType) : undefined);
        const note: NoteData = { text: value, color: NOTE_COLOR[noteType ?? "comment"] };
        if (noteType && noteType !== "comment") note.noteType = noteType;
        if (noteType === "decision") {
          const status = body.attrs.status;
          const adr = {
            ...(status === "proposed" || status === "accepted" || status === "superseded" ? { status: status as DecisionStatus } : {}),
            ...(typeof body.attrs.context === "string" ? { context: body.attrs.context } : {}),
            ...(typeof body.attrs.consequences === "string" ? { consequences: body.attrs.consequences } : {}),
          };
          if (Object.keys(adr).length) note.adr = adr;
        }
        data = note;
      } else data = { text: value };
      const node: BoardNode = {
        id: prev?.id ?? createId(),
        kind: item.kind === "note" ? "note" : "label",
        x: prev?.x ?? 0,
        y: prev?.y ?? 0,
        z: z++,
        rotation: 0,
        tags: prev?.tags ?? [],
        data,
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
      };
      if (prev) placed.add(node.id);
      freeNodes.push({ ref, node });
      doc.nodes.push(node);
    } else if (item.kind === "layout") {
      const [ref, ...numbers] = item.text.split(/\s+/);
      const [x, y, w, h] = numbers.map(Number);
      if (!ref || !Number.isFinite(x) || !Number.isFinite(y)) {
        issue("Write a position as: @layout key x y");
        continue;
      }
      layout.set(ref.startsWith("#") ? ref : ref.startsWith("frame:") ? `frame:${slugify(ref.slice(6))}` : slugify(ref), { x, y, ...(Number.isFinite(w) && Number.isFinite(h) ? { w, h } : {}) });
    }
  }

  // Explicit positions win over everything.
  doc.nodes = doc.nodes.map((node) => {
    const key = node.kind === "component" ? (node.data as ComponentData).key : freeNodes.find((item) => item.node.id === node.id)?.ref;
    const at = key ? layout.get(key) : undefined;
    if (!at) return node;
    placed.add(node.id);
    const sized = node.kind === "component" && at.w && at.h ? { ...node, data: { ...(node.data as ComponentData), width: at.w, height: at.h } } : node;
    return { ...sized, x: at.x, y: at.y };
  });
  // Screens of a UI sketch lay out their own elements (below); keep them out of the diagram layout.
  const screenMembers = new Set(pendingFrames.filter((frame) => frame.device).flatMap((frame) => frame.keys.flatMap((key) => (idByKey.has(key) ? [idByKey.get(key)!] : []))));
  const unplaced = new Set(doc.nodes.filter((node) => !placed.has(node.id) && !screenMembers.has(node.id)).map((node) => node.id));
  const nothingPlaced = !doc.nodes.some((node) => node.kind === "component" && placed.has(node.id));
  if (nothingPlaced && pendingFrames.length > 0) {
    // A fresh board with boundaries: keep each boundary's boxes together.
    const groups = pendingFrames.map((frame) => frame.keys.flatMap((key) => (idByKey.has(key) ? [idByKey.get(key)!] : [])));
    doc.nodes = arrangeGrouped(doc.nodes, doc.links, groups);
  } else doc.nodes = placeNewNodes(doc.nodes, doc.links, unplaced);

  // Screens and boundaries (dsl/frames).
  placeFrames(doc, pendingFrames, { idByKey, previous, layout, placed, issues, now });

  for (const [key, named] of insideFiles) {
    if (!idByKey.has(key)) for (const item of named) issues.push({ line: item.line, message: `"${key}" is not declared.`, severity: "error" });
  }

  for (const pending of pendingFlows) {
    const linkIds: string[] = [];
    for (const step of pending.steps) {
      const from = idByKey.get(step.from);
      const to = idByKey.get(step.to);
      const between = doc.links.filter((item) => item.from === from && item.to === to);
      const link = between.find((item) => step.label === undefined || item.label === step.label);
      if (step.label === undefined && between.length > 1) {
        const sample = between.find((item) => item.label)?.label;
        issues.push({
          line: pending.line,
          message: `Flow "${pending.name}": ${step.from} -> ${step.to} names ${between.length} connectors. Cite the label${sample ? `: ${step.from} -> ${step.to} "${sample}"` : ""}.`,
          severity: "error",
        });
      } else if (!link) issues.push({ line: pending.line, message: `Flow "${pending.name}": there is no ${step.from} -> ${step.to}${step.label ? ` "${step.label}"` : ""} connector.`, severity: "error" });
      else linkIds.push(link.id);
    }
    const prev = previous?.flows.find((flow) => flow.name === pending.name);
    const flow: BoardFlow = { id: prev?.id ?? createId(), name: pending.name, linkIds };
    applyFlowMetas(flow, flowMetas.filter((meta) => meta.flow === pending.name), doc, idByKey, issues);
    doc.flows.push(flow);
  }

  issues.sort((a, b) => a.line - b.line);
  return { doc, issues };
}

export const STEP_LOOSE = new RegExp(`^(${KEY})\\s*(?:-->|=>|->|\\.\\.>)\\s*(${KEY})(?:\\s+"((?:[^"\\\\]|\\\\.)*)")?(.*)$`);

function flowLinkId(doc: BoardDocument, idByKey: Map<string, string>, part: string): string | undefined {
  const step = part.trim().match(STEP_LOOSE);
  if (!step) return undefined;
  const from = idByKey.get(slugify(step[1]));
  const to = idByKey.get(slugify(step[2]));
  const label = step[3] !== undefined ? unescape(step[3]) : undefined;
  const matches = doc.links.filter((item) => item.from === from && item.to === to && (label === undefined || item.label === label));
  if (label === undefined && matches.length > 1) return undefined;
  return matches[0]?.id;
}

function applyFlowMetas(
  flow: BoardFlow,
  metas: Array<{ line: number; kind: "when" | "parallel" | "payload" | "say" | "error"; text: string }>,
  doc: BoardDocument,
  idByKey: Map<string, string>,
  issues: DslIssue[],
) {
  for (const meta of metas) {
    const fail = (message: string) => issues.push({ line: meta.line, message, severity: "error" });
    if (meta.kind === "error") {
      const name = unescapeMaybeQuoted(meta.text);
      if (!name) fail('Write it as: on error "Payment failed"');
      else flow.errorFlow = name;
      continue;
    }
    if (meta.kind === "parallel") {
      const ids = splitOutsideQuotes(meta.text).map((part) => flowLinkId(doc, idByKey, part));
      if (ids.some((id) => !id)) fail(`parallel steps must be connectors already in the diagram.`);
      else flow.parallel = [...(flow.parallel ?? []), ids as string[]];
      continue;
    }
    const step = meta.text.match(STEP_LOOSE);
    const from = step ? idByKey.get(slugify(step[1])) : undefined;
    const to = step ? idByKey.get(slugify(step[2])) : undefined;
    const between = doc.links.filter((item) => item.from === from && item.to === to);
    if (!step || !between.length) {
      fail(`"${meta.text}" should name a connector, like a -> b.`);
      continue;
    }
    // say and payload end in their own quoted text, so a label is cited only when a second one comes after it.
    const quoted = lex(meta.text).strings;
    const cited = meta.kind === "when" ? quoted[0] : quoted.length > 1 ? quoted[0] : undefined;
    const pair = `${step[1]} -> ${step[2]}`;
    const named = cited === undefined ? between : between.filter((item) => item.label === cited);
    if (!named.length) {
      fail(`${meta.kind}: there is no ${pair} "${cited}" connector.`);
      continue;
    }
    // Two arrows can join the same boxes. The one this flow walks is the one meant.
    const walked = named.filter((item) => flow.linkIds.includes(item.id));
    const link = named.length === 1 ? named[0] : walked.length === 1 ? walked[0] : undefined;
    if (!link) {
      const sample = named.find((item) => item.label)?.label ?? "label";
      const rest = meta.kind === "say" ? ' "the sentence"' : meta.kind === "payload" ? ' "{ id }"' : " 0.9";
      fail(`${meta.kind} ${pair} names ${walked.length || named.length} connectors. Cite the label: ${meta.kind} ${pair} "${sample}"${rest}`);
      continue;
    }
    const linkId = link.id;
    const detail = { ...flow.steps?.[linkId] };
    if (meta.kind === "when") {
      const probability = parseNumber(step?.[4]?.trim().split(/\s+/)[0]);
      if (probability === undefined) fail("when needs a probability between 0 and 1.");
      else detail.probability = probability > 1 ? probability / 100 : probability;
    } else if (meta.kind === "say") {
      const said = lex(meta.text).strings.at(-1);
      if (!said) fail('say needs the sentence in quotes: say a -> b "Writes the order"');
      else detail.narration = said;
    } else {
      const body = lex(meta.text);
      const description = body.strings.at(-1);
      if (!description) fail('payload needs a description: payload a -> b "{ id }" 240');
      else {
        detail.payload = description;
        const bytes = parseNumber(step[4].replace(/"(?:[^"\\]|\\.)*"/g, "").trim().split(/\s+/).pop());
        if (bytes !== undefined) detail.bytes = bytes;
      }
    }
    flow.steps = { ...flow.steps, [linkId]: detail };
  }
}
