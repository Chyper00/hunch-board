/**
 * Silhouettes for diagram components, as plain SVG path strings in a w×h box
 * starting at (x, y). `SketchShape` feeds them to roughjs for the hand-drawn
 * look. Each shape also says how much room its decorations take, so the card
 * text never collides with a cylinder lid, a browser bar or a stack's back
 * layers.
 */

export const COMPONENT_SHAPES = ["box", "double-box", "pill", "dashed-box", "cylinder", "queue", "hexagon", "octagon", "parallelogram", "document", "stack", "cloud", "browser", "mobile", "folder", "bucket", "diamond", "ellipse", "actor", "dot", "ring", "lifeline"] as const;

export type ComponentShape =
  | "box"
  | "double-box"
  | "pill"
  | "dashed-box"
  | "cylinder"
  | "queue"
  | "hexagon"
  | "octagon"
  | "parallelogram"
  | "document"
  | "stack"
  | "cloud"
  | "browser"
  | "mobile"
  | "folder"
  | "bucket"
  | "diamond"
  | "ellipse"
  | "actor"
  | "dot"
  | "ring"
  | "lifeline";

export interface ShapeGeometry {
  /** Layers behind the body (e.g. the cards of a stack), solid fill + stroke. */
  back: string[];
  /** The main silhouette: base fill, hachure and outline. */
  body: string;
  /** Extra strokes on top (cylinder lid, browser bar…), no fill. */
  details: string[];
  /** Small filled dots (browser window buttons). */
  dots: Array<{ cx: number; cy: number; r: number }>;
  dashed: boolean;
  /** The details are a dashed line (a UML lifeline). */
  detailsDashed?: boolean;
}

export interface ShapeInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const BASE = { top: 14, right: 18, bottom: 14, left: 18 };

/** Padding the card content needs inside each shape. */
export const SHAPE_INSETS: Record<ComponentShape, ShapeInset> = {
  box: BASE,
  "double-box": { top: 18, right: 22, bottom: 18, left: 22 },
  pill: { top: 12, right: 26, bottom: 12, left: 26 },
  "dashed-box": BASE,
  cylinder: { top: 36, right: 18, bottom: 18, left: 18 },
  queue: { top: 14, right: 38, bottom: 14, left: 24 },
  hexagon: { top: 14, right: 34, bottom: 14, left: 34 },
  octagon: { top: 16, right: 24, bottom: 16, left: 24 },
  parallelogram: { top: 14, right: 34, bottom: 14, left: 34 },
  document: { top: 14, right: 18, bottom: 26, left: 18 },
  stack: { top: 14, right: 30, bottom: 26, left: 18 },
  // The lobes pinch the top corners, so content has to sit lower and further in than a box.
  cloud: { top: 50, right: 48, bottom: 20, left: 56 },
  browser: { top: 32, right: 18, bottom: 14, left: 18 },
  mobile: { top: 26, right: 20, bottom: 20, left: 20 },
  folder: { top: 26, right: 18, bottom: 14, left: 18 },
  bucket: { top: 24, right: 30, bottom: 14, left: 30 },
  // A diamond only has room in its middle.
  diamond: { top: 34, right: 56, bottom: 34, left: 56 },
  ellipse: { top: 22, right: 40, bottom: 22, left: 40 },
  // The figure takes the top of the card; the name sits under it.
  actor: { top: 76, right: 12, bottom: 8, left: 12 },
  dot: { top: 0, right: 0, bottom: 0, left: 0 },
  ring: { top: 0, right: 0, bottom: 0, left: 0 },
  lifeline: { top: 12, right: 14, bottom: 96, left: 14 },
};

export function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} L ${x + rr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - rr} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} Z`;
}

function polygon(points: Array<[number, number]>): string {
  return `M ${points.map(([px, py]) => `${px} ${py}`).join(" L ")} Z`;
}

const empty = (body: string, extra: Partial<ShapeGeometry> = {}): ShapeGeometry => ({
  back: [],
  body,
  details: [],
  dots: [],
  dashed: false,
  ...extra,
});

export function shapeGeometry(shape: ComponentShape, x: number, y: number, w: number, h: number): ShapeGeometry {
  switch (shape) {
    case "box":
      return empty(roundedRectPath(x, y, w, h, 14));
    case "dashed-box":
      return empty(roundedRectPath(x, y, w, h, 14), { dashed: true });
    case "double-box":
      return empty(roundedRectPath(x, y, w, h, 14), { details: [roundedRectPath(x + 6, y + 6, w - 12, h - 12, 9)] });
    case "pill":
      return empty(roundedRectPath(x, y, w, h, h / 2));
    case "cylinder": {
      const rx = w / 2;
      const ry = Math.min(12, h / 6);
      return empty(
        `M ${x} ${y + ry} A ${rx} ${ry} 0 0 1 ${x + w} ${y + ry} L ${x + w} ${y + h - ry} A ${rx} ${ry} 0 0 1 ${x} ${y + h - ry} Z`,
        { details: [`M ${x} ${y + ry} A ${rx} ${ry} 0 0 0 ${x + w} ${y + ry}`] },
      );
    }
    case "queue": {
      // A pipe lying on its side: messages flow in on the left, out on the right.
      const ry = h / 2;
      const rx = Math.min(12, w / 10);
      return empty(
        `M ${x + rx} ${y} L ${x + w - rx} ${y} A ${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h} L ${x + rx} ${y + h} A ${rx} ${ry} 0 0 1 ${x + rx} ${y} Z`,
        {
          details: [
            `M ${x + w - rx} ${y} A ${rx} ${ry} 0 0 0 ${x + w - rx} ${y + h}`,
            `M ${x + w - rx - 9} ${y + 4} L ${x + w - rx - 9} ${y + h - 4}`,
          ],
        },
      );
    }
    case "hexagon": {
      const c = Math.min(22, h / 2);
      return empty(
        polygon([
          [x + c, y],
          [x + w - c, y],
          [x + w, y + h / 2],
          [x + w - c, y + h],
          [x + c, y + h],
          [x, y + h / 2],
        ]),
      );
    }
    case "octagon": {
      const c = Math.min(16, h / 4);
      return empty(
        polygon([
          [x + c, y],
          [x + w - c, y],
          [x + w, y + c],
          [x + w, y + h - c],
          [x + w - c, y + h],
          [x + c, y + h],
          [x, y + h - c],
          [x, y + c],
        ]),
      );
    }
    case "parallelogram": {
      const s = Math.min(20, h / 3);
      return empty(
        polygon([
          [x + s, y],
          [x + w, y],
          [x + w - s, y + h],
          [x, y + h],
        ]),
      );
    }
    case "document": {
      const a = 8;
      return empty(
        `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h - a} Q ${x + w * 0.75} ${y + h - a * 2.4} ${x + w / 2} ${y + h - a} Q ${x + w * 0.25} ${y + h + a * 0.4} ${x} ${y + h - a} Z`,
      );
    }
    case "stack": {
      const o = 7;
      return empty(roundedRectPath(x, y, w - o * 2, h - o * 2, 12), {
        back: [roundedRectPath(x + o * 2, y + o * 2, w - o * 2, h - o * 2, 12), roundedRectPath(x + o, y + o, w - o * 2, h - o * 2, 12)],
      });
    }
    case "cloud":
      return empty(
        `M ${x + w * 0.24} ${y + h * 0.92} C ${x} ${y + h * 0.92} ${x} ${y + h * 0.48} ${x + w * 0.18} ${y + h * 0.46} C ${x + w * 0.16} ${y + h * 0.08} ${x + w * 0.5} ${y} ${x + w * 0.56} ${y + h * 0.26} C ${x + w * 0.66} ${y + h * 0.02} ${x + w * 0.96} ${y + h * 0.1} ${x + w * 0.86} ${y + h * 0.46} C ${x + w * 1.02} ${y + h * 0.5} ${x + w} ${y + h * 0.94} ${x + w * 0.78} ${y + h * 0.92} Z`,
      );
    case "browser":
      return empty(roundedRectPath(x, y, w, h, 10), {
        details: [`M ${x} ${y + 20} L ${x + w} ${y + 20}`],
        dots: [0, 1, 2].map((i) => ({ cx: x + 12 + i * 10, cy: y + 10, r: 2.6 })),
      });
    case "mobile":
      return empty(roundedRectPath(x, y, w, h, 20), {
        details: [`M ${x + w / 2 - 16} ${y + 10} L ${x + w / 2 + 16} ${y + 10}`],
      });
    case "folder": {
      const t = 11;
      const tabEnd = x + Math.min(90, w * 0.4);
      return empty(
        `M ${x} ${y + 4} Q ${x} ${y} ${x + 4} ${y} L ${tabEnd} ${y} L ${tabEnd + 10} ${y + t} L ${x + w - 6} ${y + t} Q ${x + w} ${y + t} ${x + w} ${y + t + 6} L ${x + w} ${y + h - 6} Q ${x + w} ${y + h} ${x + w - 6} ${y + h} L ${x + 6} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 6} Z`,
      );
    }
    case "bucket": {
      const k = Math.min(18, w / 8);
      const ry = 7;
      return empty(
        `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} L ${x + w - k} ${y + h} L ${x + k} ${y + h} Z`,
        { details: [`M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`] },
      );
    }
    case "diamond":
      return empty(polygon([[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]]));
    case "ellipse": {
      const rx = w / 2;
      const ry = h / 2;
      return empty(`M ${x} ${y + ry} A ${rx} ${ry} 0 1 1 ${x + w} ${y + ry} A ${rx} ${ry} 0 1 1 ${x} ${y + ry} Z`);
    }
    case "actor": {
      const cx = x + w / 2;
      const r = 11;
      const head = y + r + 2;
      return empty(`M ${cx - r} ${head} A ${r} ${r} 0 1 1 ${cx + r} ${head} A ${r} ${r} 0 1 1 ${cx - r} ${head} Z`, {
        details: [`M ${cx} ${head + r} L ${cx} ${head + r + 24}`, `M ${cx - 16} ${head + r + 8} L ${cx + 16} ${head + r + 8}`, `M ${cx} ${head + r + 24} L ${cx - 13} ${head + r + 40}`, `M ${cx} ${head + r + 24} L ${cx + 13} ${head + r + 40}`],
      });
    }
    case "dot":
    case "ring": {
      const r = Math.min(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const circle = (radius: number) => `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`;
      return shape === "dot" ? empty(circle(r)) : empty(circle(r), { details: [circle(Math.max(2, r - 6))] });
    }
    case "lifeline": {
      const headHeight = Math.max(34, h - 92);
      return empty(roundedRectPath(x, y, w, headHeight, 8), { details: [`M ${x + w / 2} ${y + headHeight} L ${x + w / 2} ${y + h}`], detailsDashed: true });
    }
  }
}

export const ALL_SHAPES = Object.keys(SHAPE_INSETS) as ComponentShape[];
