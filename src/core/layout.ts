import { layoutNodes } from "@/lib/autoLayout";
import { COMPONENT_CATEGORIES, componentType } from "@/lib/componentCatalog";
import type { BoardFrame, BoardLink, BoardNode } from "@/lib/types";

import { approximateSize, isInsideFrame } from "./document";

/** Space between ranks (left → right) and between boxes in the same rank. */
const RANK_GAP = 360;
const CROSS_GAP = 210;

/**
 * Layered arrangement, left to right, the usual reading order of an
 * architecture diagram (people on the left, data on the right). Notes and
 * labels are left where they are.
 */
export function arrangeLeftToRight(nodes: BoardNode[], links: BoardLink[]): Map<string, { x: number; y: number }> {
  const boxes = nodes.filter((node) => node.kind === "component");
  const placed = layoutNodes(
    boxes.map((node) => ({ id: node.id, x: node.x, y: node.y })),
    links.map((link) => ({ from: link.from, to: link.to })),
    CROSS_GAP,
    RANK_GAP,
  );
  // layoutNodes ranks top → bottom; swap axes for left → right.
  return wrapTallRanks(new Map(placed.map((item) => [item.id, { x: item.y, y: item.x }])), new Map(boxes.map((node) => [node.id, node])));
}

/** A rank taller than this becomes a grid instead of one long column. */
export const MAX_RANK_ROWS = 6;
const GRID_COLUMN_GAP = 300;
const CATEGORY_ORDER = Object.keys(COMPONENT_CATEGORIES);

/**
 * Twenty workers called by one service make a column nobody can read. A rank
 * with more than MAX_RANK_ROWS boxes is laid out as a grid, boxes of the same
 * category next to each other, and the ranks after it move right to make room.
 */
function wrapTallRanks(positions: Map<string, { x: number; y: number }>, byId: Map<string, BoardNode>): Map<string, { x: number; y: number }> {
  const ranks = new Map<number, string[]>();
  for (const [id, at] of positions) ranks.set(at.x, [...(ranks.get(at.x) ?? []), id]);
  const out = new Map(positions);
  let shift = 0;
  for (const x of [...ranks.keys()].sort((a, b) => a - b)) {
    const ids = ranks.get(x)!;
    if (ids.length <= MAX_RANK_ROWS) {
      for (const id of ids) out.set(id, { x: x + shift, y: positions.get(id)!.y });
      continue;
    }
    const categoryOf = (id: string) => {
      const node = byId.get(id);
      const variant = node?.kind === "component" ? (node.data as { variant?: string }).variant : undefined;
      return CATEGORY_ORDER.indexOf(componentType(variant ?? "service").category);
    };
    const sorted = [...ids].sort((a, b) => categoryOf(a) - categoryOf(b) || positions.get(a)!.y - positions.get(b)!.y);
    const columns = Math.ceil(sorted.length / MAX_RANK_ROWS);
    const rows = Math.ceil(sorted.length / columns);
    const centerY = ids.reduce((sum, id) => sum + positions.get(id)!.y, 0) / ids.length;
    const top = centerY - ((rows - 1) * CROSS_GAP) / 2;
    // Fill column by column so a category stays together.
    sorted.forEach((id, index) => {
      const column = Math.floor(index / rows);
      out.set(id, { x: x + shift + column * GRID_COLUMN_GAP, y: Math.round(top + (index % rows) * CROSS_GAP) });
    });
    shift += (columns - 1) * GRID_COLUMN_GAP;
  }
  return out;
}

/** Positions every component from scratch. */
export function autoArrange(nodes: BoardNode[], links: BoardLink[]): BoardNode[] {
  const positions = arrangeLeftToRight(nodes, links);
  const placed = nodes.map((node) => {
    const at = positions.get(node.id);
    return at ? { ...node, x: at.x, y: at.y } : node;
  });
  return placeLooseNotes(placed, new Set(placed.filter((node) => node.kind !== "component").map((node) => node.id)));
}

/**
 * Gives positions to `newIds` only. Existing boxes keep where the person put
 * them; new ones land where a full layout would put them, shifted so the two
 * agree on average, a new database lands to the right of the service that
 * uses it, not at the origin.
 */
export function placeNewNodes(nodes: BoardNode[], links: BoardLink[], newIds: Set<string>): BoardNode[] {
  if (newIds.size === 0) return nodes;
  const kept = nodes.filter((node) => node.kind === "component" && !newIds.has(node.id));
  if (kept.length === 0) return autoArrange(nodes, links);

  const positions = arrangeLeftToRight(nodes, links);
  let dx = 0;
  let dy = 0;
  for (const node of kept) {
    const at = positions.get(node.id)!;
    dx += node.x - at.x;
    dy += node.y - at.y;
  }
  dx /= kept.length;
  dy /= kept.length;

  const occupied = kept.map((node) => ({ x: node.x, y: node.y, ...approximateSize(node) }));
  const fixed = new Map(kept.map((node) => [node.id, node]));
  const placed = nodes.map((node) => {
    if (!newIds.has(node.id) || node.kind !== "component") return node;
    const at = positions.get(node.id)!;
    const size = approximateSize(node);
    // Next to the boxes it is connected to, when some of them are already placed.
    const callers = links.filter((link) => link.to === node.id && fixed.has(link.from)).map((link) => fixed.get(link.from)!);
    const callees = links.filter((link) => link.from === node.id && fixed.has(link.to)).map((link) => fixed.get(link.to)!);
    const neighbors = [...callers, ...callees];
    let x = Math.round(at.x + dx);
    let y = Math.round(at.y + dy);
    if (callers.length > 0) x = Math.max(...callers.map((item) => item.x)) + RANK_GAP;
    else if (callees.length > 0) x = Math.min(...callees.map((item) => item.x)) - RANK_GAP;
    if (neighbors.length > 0) y = Math.round(neighbors.reduce((sum, item) => sum + item.y, 0) / neighbors.length);
    // Step down until it doesn't sit on a box that was already there.
    while (occupied.some((box) => x < box.x + box.w + 20 && x + size.w + 20 > box.x && y < box.y + box.h + 20 && y + size.h + 20 > box.y)) y += CROSS_GAP;
    occupied.push({ x, y, ...size });
    const result = { ...node, x, y };
    fixed.set(node.id, result);
    return result;
  });
  return placeLooseNotes(placed, new Set([...newIds].filter((id) => nodes.find((node) => node.id === id)?.kind !== "component")));
}

/** New notes and labels go in a column under the diagram. */
function placeLooseNotes(nodes: BoardNode[], ids: Set<string>): BoardNode[] {
  if (ids.size === 0) return nodes;
  const boxes = nodes.filter((node) => !ids.has(node.id));
  const minX = boxes.length ? Math.min(...boxes.map((node) => node.x)) : 0;
  const maxY = boxes.length ? Math.max(...boxes.map((node) => node.y + approximateSize(node).h)) : 0;
  let column = 0;
  return nodes.map((node) => {
    if (!ids.has(node.id)) return node;
    const at = { x: minX + column * 240, y: maxY + 120 };
    column += 1;
    return { ...node, ...at };
  });
}

const FRAME_PADDING = 40;
const FRAME_LABEL_SPACE = 28;

/** The rectangle that wraps `members`, with room for the frame's name tab. */
export function frameAround(members: BoardNode[]): Pick<BoardFrame, "x" | "y" | "width" | "height"> | null {
  if (members.length === 0) return null;
  const minX = Math.min(...members.map((node) => node.x));
  const minY = Math.min(...members.map((node) => node.y));
  const maxX = Math.max(...members.map((node) => node.x + approximateSize(node).w));
  const maxY = Math.max(...members.map((node) => node.y + approximateSize(node).h));
  return {
    x: minX - FRAME_PADDING,
    y: minY - FRAME_PADDING - FRAME_LABEL_SPACE,
    width: maxX - minX + FRAME_PADDING * 2,
    height: maxY - minY + FRAME_PADDING * 2 + FRAME_LABEL_SPACE,
  };
}

export function frameMembers(frame: BoardFrame, nodes: BoardNode[]): BoardNode[] {
  return nodes.filter((node) => node.kind === "component" && isInsideFrame(node, frame));
}

const BLOCK_GAP_X = 140;
const BLOCK_GAP_Y = 120;

/**
 * Left-to-right layout that keeps each group together: every group (a frame's
 * members) is arranged on its own, then groups and loose boxes are placed as
 * blocks, column by column in dependency order, so frames never overlap.
 * `groups` lists node ids per frame; a node in several groups stays in the first.
 */
export function arrangeGrouped(nodes: BoardNode[], links: BoardLink[], groups: string[][]): BoardNode[] {
  const boxes = nodes.filter((node) => node.kind === "component");
  const groupOf = new Map<string, number>();
  groups.forEach((ids, index) => ids.forEach((id) => !groupOf.has(id) && boxes.some((node) => node.id === id) && groupOf.set(id, index)));
  if (groupOf.size === 0) return autoArrange(nodes, links);

  // Blocks: one per non-empty group, one per loose box.
  const blockOf = (id: string) => (groupOf.has(id) ? `g${groupOf.get(id)}` : `n${id}`);
  const members = new Map<string, BoardNode[]>();
  for (const node of boxes) members.set(blockOf(node.id), [...(members.get(blockOf(node.id)) ?? []), node]);

  // Arrange inside each block, then measure it.
  const local = new Map<string, { x: number; y: number }>();
  const size = new Map<string, { w: number; h: number }>();
  for (const [block, list] of members) {
    const ids = new Set(list.map((node) => node.id));
    const inner = arrangeLeftToRight(list, links.filter((link) => ids.has(link.from) && ids.has(link.to)));
    const xs = list.map((node) => inner.get(node.id)!.x);
    const ys = list.map((node) => inner.get(node.id)!.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    for (const node of list) local.set(node.id, { x: inner.get(node.id)!.x - minX, y: inner.get(node.id)!.y - minY });
    const maxX = Math.max(...list.map((node) => local.get(node.id)!.x + approximateSize(node).w));
    const maxY = Math.max(...list.map((node) => local.get(node.id)!.y + approximateSize(node).h));
    // Groups get room for the frame padding and name tab.
    const framed = block.startsWith("g");
    size.set(block, { w: maxX + (framed ? 80 : 0), h: maxY + (framed ? 108 : 0) });
  }

  // Order blocks by dependencies between them (cycles broken by the layered layout).
  const blockLinks = links
    .map((link) => ({ from: blockOf(link.from), to: blockOf(link.to) }))
    .filter((link) => link.from !== link.to && members.has(link.from) && members.has(link.to));
  const ranked = layoutNodes([...members.keys()].map((id) => ({ id, x: 0, y: 0 })), blockLinks, 1, 1);
  const columns = new Map<number, Array<{ id: string; order: number }>>();
  for (const item of ranked) columns.set(item.y, [...(columns.get(item.y) ?? []), { id: item.id, order: item.x }]);

  const origin = new Map<string, { x: number; y: number }>();
  let x = 0;
  for (const rank of [...columns.keys()].sort((a, b) => a - b)) {
    const column = columns.get(rank)!.sort((a, b) => a.order - b.order);
    const width = Math.max(...column.map((item) => size.get(item.id)!.w));
    let y = 0;
    for (const item of column) {
      const framed = item.id.startsWith("g");
      origin.set(item.id, { x: x + (framed ? 40 : 0), y: y + (framed ? 68 : 0) });
      y += size.get(item.id)!.h + BLOCK_GAP_Y;
    }
    // Center the column vertically around 0 so columns line up.
    const shift = -(y - BLOCK_GAP_Y) / 2;
    for (const item of column) origin.get(item.id)!.y += shift;
    x += width + BLOCK_GAP_X;
  }

  const placed = nodes.map((node) => {
    if (node.kind !== "component") return node;
    const block = origin.get(blockOf(node.id))!;
    const at = local.get(node.id)!;
    return { ...node, x: Math.round(block.x + at.x), y: Math.round(block.y + at.y) };
  });
  return placeLooseNotes(placed, new Set(placed.filter((node) => node.kind !== "component").map((node) => node.id)));
}
