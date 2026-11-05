export interface NodeBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AlignMode = "left" | "center" | "right" | "top" | "middle" | "bottom";
export type DistributeAxis = "horizontal" | "vertical";

export interface NodeMoveTarget {
  id: string;
  x: number;
  y: number;
}

/** Lines every box up on one edge (or center line) of the selection's bounding box. */
export function alignBoxes(boxes: NodeBox[], mode: AlignMode): NodeMoveTarget[] {
  if (boxes.length < 2) return boxes.map(({ id, x, y }) => ({ id, x, y }));
  const left = Math.min(...boxes.map((b) => b.x));
  const right = Math.max(...boxes.map((b) => b.x + b.w));
  const top = Math.min(...boxes.map((b) => b.y));
  const bottom = Math.max(...boxes.map((b) => b.y + b.h));

  return boxes.map((b) => {
    switch (mode) {
      case "left":
        return { id: b.id, x: left, y: b.y };
      case "center":
        return { id: b.id, x: (left + right) / 2 - b.w / 2, y: b.y };
      case "right":
        return { id: b.id, x: right - b.w, y: b.y };
      case "top":
        return { id: b.id, x: b.x, y: top };
      case "middle":
        return { id: b.id, x: b.x, y: (top + bottom) / 2 - b.h / 2 };
      case "bottom":
        return { id: b.id, x: b.x, y: bottom - b.h };
    }
  });
}

/**
 * Equal gaps between boxes along an axis, keeping the two outermost boxes
 * where they are (the Figma behavior). Needs at least three boxes.
 */
export function distributeBoxes(boxes: NodeBox[], axis: DistributeAxis): NodeMoveTarget[] {
  if (boxes.length < 3) return boxes.map(({ id, x, y }) => ({ id, x, y }));
  const isH = axis === "horizontal";
  const sorted = [...boxes].sort((a, b) => (isH ? a.x - b.x : a.y - b.y));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const span = isH ? last.x + last.w - first.x : last.y + last.h - first.y;
  const occupied = sorted.reduce((sum, b) => sum + (isH ? b.w : b.h), 0);
  const gap = (span - occupied) / (sorted.length - 1);

  let cursor = isH ? first.x : first.y;
  return sorted.map((b) => {
    const target = isH ? { id: b.id, x: cursor, y: b.y } : { id: b.id, x: b.x, y: cursor };
    cursor += (isH ? b.w : b.h) + gap;
    return target;
  });
}

export const GRID_SIZE = 24;

/** Rounds a world coordinate to the nearest grid line. */
export function snapToGrid(value: number, grid = GRID_SIZE): number {
  return Math.round(value / grid) * grid;
}

export interface GuideRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A line to draw while dragging: vertical (x set) or horizontal (y set), spanning `from`..`to`. */
export interface GuideLine {
  axis: "x" | "y";
  at: number;
  from: number;
  to: number;
}

/**
 * Smart guides: when an edge or the center of the moving box comes within
 * `threshold` of another box's edge or center, nudge it onto that line and
 * say which lines to draw.
 */
export function alignmentGuides(moving: GuideRect, others: GuideRect[], threshold: number): { dx: number; dy: number; lines: GuideLine[] } {
  const xs = (rect: GuideRect) => [rect.x, rect.x + rect.w / 2, rect.x + rect.w];
  const ys = (rect: GuideRect) => [rect.y, rect.y + rect.h / 2, rect.y + rect.h];
  let best = { x: { d: Infinity, at: 0 }, y: { d: Infinity, at: 0 } };
  for (const other of others) {
    for (const mine of xs(moving)) for (const theirs of xs(other)) if (Math.abs(theirs - mine) < Math.abs(best.x.d) && Math.abs(theirs - mine) <= threshold) best = { ...best, x: { d: theirs - mine, at: theirs } };
    for (const mine of ys(moving)) for (const theirs of ys(other)) if (Math.abs(theirs - mine) < Math.abs(best.y.d) && Math.abs(theirs - mine) <= threshold) best = { ...best, y: { d: theirs - mine, at: theirs } };
  }
  const dx = Number.isFinite(best.x.d) ? best.x.d : 0;
  const dy = Number.isFinite(best.y.d) ? best.y.d : 0;
  const moved = { ...moving, x: moving.x + dx, y: moving.y + dy };
  const lines: GuideLine[] = [];
  const near = 0.5;
  if (Number.isFinite(best.x.d)) {
    const aligned = others.filter((other) => xs(other).some((value) => Math.abs(value - best.x.at) < near));
    const span = [moved, ...aligned];
    lines.push({ axis: "x", at: best.x.at, from: Math.min(...span.map((rect) => rect.y)) - 12, to: Math.max(...span.map((rect) => rect.y + rect.h)) + 12 });
  }
  if (Number.isFinite(best.y.d)) {
    const aligned = others.filter((other) => ys(other).some((value) => Math.abs(value - best.y.at) < near));
    const span = [moved, ...aligned];
    lines.push({ axis: "y", at: best.y.at, from: Math.min(...span.map((rect) => rect.x)) - 12, to: Math.max(...span.map((rect) => rect.x + rect.w)) + 12 });
  }
  return { dx, dy, lines };
}
