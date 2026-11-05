import { componentType } from "./componentCatalog";
import type { ComponentShape } from "./componentShapes";
import { componentAccent } from "./softwareKit";
import type { BoardFrame, BoardLink, BoardNode, ComponentData, NoteData } from "./types";

/** Closest Mermaid flowchart shape for each sketch shape, as [open, close] around the label. */
const SHAPES: Record<ComponentShape, [string, string]> = {
  box: ["[", "]"],
  "double-box": ["[[", "]]"],
  "dashed-box": ["[", "]"],
  browser: ["[", "]"],
  mobile: ["[", "]"],
  folder: ["[", "]"],
  pill: ["([", "])"],
  cylinder: ["[(", ")]"],
  bucket: ["[(", ")]"],
  queue: ["[[", "]]"],
  hexagon: ["{{", "}}"],
  octagon: ["{{", "}}"],
  stack: ["[[", "]]"],
  parallelogram: ["[/", "/]"],
  document: [">", "]"],
  cloud: ["((", "))"],
  diamond: ["{", "}"],
  ellipse: ["([", "])"],
  actor: ["([", "])"],
  dot: ["((", "))"],
  ring: ["((", "))"],
  lifeline: ["[", "]"],
};

// Rough card size in world px, only used to decide which frame a card sits in.
const CARD_W = 240;
const CARD_H = 110;

function escapeLabel(text: string): string {
  return text.replace(/"/g, "#quot;").replace(/\n+/g, " ").trim();
}

function edgeArrow(link: BoardLink): string {
  const dashed = link.style !== "solid";
  const arrow = link.arrow ?? "end";
  if (arrow === "none") return dashed ? "-.-" : "---";
  if (arrow === "both") return dashed ? "<-.->" : "<-->";
  if (arrow === "implements") return "-.->";
  return dashed ? "-.->" : "-->";
}

function frameContaining(node: BoardNode, frames: BoardFrame[]): BoardFrame | undefined {
  const cx = node.x + CARD_W / 2;
  const cy = node.y + CARD_H / 2;
  return frames.find((f) => cx >= f.x && cx <= f.x + f.width && cy >= f.y && cy <= f.y + f.height);
}

/**
 * Turns a software board into a Mermaid flowchart (paste into a README, a PR,
 * Notion, GitHub…). Components keep their shape and accent color, frames
 * become subgraphs, strings become edges with their label and style.
 * Free text labels are dropped; sticky notes come along as notes.
 */
export function boardToMermaid(nodes: BoardNode[], links: BoardLink[], frames: BoardFrame[], title?: string): string {
  const exported = nodes.filter((n) => n.kind === "component" || n.kind === "note");
  const ids = new Map(exported.map((node, index) => [node.id, `n${index + 1}`]));

  const xs = exported.map((n) => n.x);
  const ys = exported.map((n) => n.y);
  const wide = exported.length === 0 || Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys);

  const lines: string[] = [];
  if (title) lines.push("---", `title: ${escapeLabel(title)}`, "---");
  lines.push(`flowchart ${wide ? "LR" : "TB"}`);

  const declaration = (node: BoardNode): string => {
    const id = ids.get(node.id)!;
    if (node.kind === "note") return `${id}>"${escapeLabel((node.data as NoteData).text || "Note")}"]`;
    const data = node.data as ComponentData;
    const type = componentType(data.variant);
    const [open, close] = SHAPES[type.shape];
    const title = escapeLabel(data.title || type.label);
    const label = data.tech ? `${title}<br/><i>${escapeLabel(data.tech)}</i>` : title;
    return `${id}${open}"${label}"${close}`;
  };

  const byFrame = new Map<BoardFrame | undefined, BoardNode[]>();
  for (const node of exported) {
    const frame = frameContaining(node, frames);
    byFrame.set(frame, [...(byFrame.get(frame) ?? []), node]);
  }

  for (const node of byFrame.get(undefined) ?? []) lines.push(`  ${declaration(node)}`);
  frames.forEach((frame, index) => {
    const members = byFrame.get(frame);
    if (!members?.length) return;
    lines.push(`  subgraph f${index + 1}["${escapeLabel(frame.label)}"]`);
    for (const node of members) lines.push(`    ${declaration(node)}`);
    lines.push("  end");
  });

  for (const link of links) {
    const from = ids.get(link.from);
    const to = ids.get(link.to);
    if (!from || !to) continue;
    const label = link.label ? `|"${escapeLabel(link.label)}"|` : "";
    lines.push(`  ${from} ${edgeArrow(link)}${label} ${to}`);
  }

  // One class per accent color, so the exported diagram keeps the board's color coding.
  const byAccent = new Map<string, string[]>();
  for (const node of exported) {
    if (node.kind !== "component") continue;
    const accent = componentAccent(node.data as ComponentData);
    byAccent.set(accent, [...(byAccent.get(accent) ?? []), ids.get(node.id)!]);
  }
  [...byAccent.entries()].forEach(([accent, members], index) => {
    lines.push(`  classDef c${index + 1} stroke:${accent},stroke-width:2px`);
    lines.push(`  class ${members.join(",")} c${index + 1}`);
  });

  return lines.join("\n");
}
