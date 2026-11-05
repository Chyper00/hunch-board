import type { BoardFlow, BoardFrame, BoardLink, BoardNode, ComponentData, NoteData } from "@/lib/types";

/**
 * A whole board as plain data, what the canvas shows, what a file holds and
 * what tools read and write. No ids of the storage layer, no viewport, no UI
 * state. Every function in `src/core` takes and returns this shape.
 */
export interface BoardDocument {
  title: string;
  nodes: BoardNode[];
  links: BoardLink[];
  frames: BoardFrame[];
  flows: BoardFlow[];
  /** Lines of an older file that this version doesn't read. Kept, so saving never loses them. */
  retired?: string[];
}

export type ComponentNode = BoardNode & { kind: "component"; data: ComponentData };
export type NoteNode = BoardNode & { kind: "note"; data: NoteData };

export function emptyDocument(title = "Untitled board"): BoardDocument {
  return { title, nodes: [], links: [], frames: [], flows: [] };
}

export function components(doc: Pick<BoardDocument, "nodes">): ComponentNode[] {
  return doc.nodes.filter((node): node is ComponentNode => node.kind === "component");
}

export function notes(doc: Pick<BoardDocument, "nodes">): NoteNode[] {
  return doc.nodes.filter((node): node is NoteNode => node.kind === "note");
}

/** Lowercase, dash-separated, ASCII: "Orders DB (primary)" → "orders-db-primary". */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "node"
  );
}

/**
 * The readable key of every component, unique on the board: the stored `key`
 * when there is one, otherwise derived from the title. Duplicates get -2, -3…
 */
export function componentKeys(nodes: BoardNode[]): Map<string, string> {
  const used = new Set<string>();
  const keys = new Map<string, string>();
  const list = nodes.filter((node): node is ComponentNode => node.kind === "component");
  // Explicit keys first, so a derived key never steals one.
  const ordered = [...list.filter((node) => node.data.key), ...list.filter((node) => !node.data.key)];
  for (const node of ordered) {
    const base = slugify(node.data.key || node.data.title || node.data.variant);
    let key = base;
    let n = 2;
    while (used.has(key)) {
      key = `${base}-${n}`;
      n += 1;
    }
    used.add(key);
    keys.set(node.id, key);
  }
  return keys;
}

export function titleOf(node: BoardNode | undefined): string {
  if (!node) return "?";
  if (node.kind === "component") return (node.data as ComponentData).title || (node.data as ComponentData).variant;
  return (node.data as { text: string }).text.split("\n")[0] ?? "";
}

/** Rough box size used where the DOM can't be measured (layout, frames, exports). */
export function approximateSize(node: BoardNode): { w: number; h: number } {
  if (node.kind === "component") {
    const data = node.data as ComponentData;
    return { w: data.width ?? 240, h: data.height ?? 110 };
  }
  if (node.kind === "note") return { w: 208, h: 130 };
  return { w: 280, h: 44 };
}

export function isInsideFrame(node: BoardNode, frame: BoardFrame): boolean {
  const size = approximateSize(node);
  const cx = node.x + size.w / 2;
  const cy = node.y + size.h / 2;
  return cx >= frame.x && cx <= frame.x + frame.width && cy >= frame.y && cy <= frame.y + frame.height;
}
