import { componentType } from "@/lib/componentCatalog";
import type { BoardFrame, BoardNode, ComponentData, Device } from "@/lib/types";
import { CONTAINERS, DEVICE_SIZES, DEVICE_TOP, FULL_WIDTH, PINNED_BOTTOM, SCREEN_PADDING, STACK_GAP, elementSize } from "@/lib/uiSketch";

import { componentKeys, slugify, type BoardDocument } from "../document";

/**
 * The screens of a UI sketch: device frames and the elements drawn in them.
 * Here is everything the sketch means, without the canvas: where an element
 * written as text lands, the order the AI reads a screen in, and the screen
 * as a tree of elements.
 */

type Rect = { x: number; y: number; width: number; height: number };

/** Elements of the same kind that line up side by side when written one after the other. */
const INLINE: ReadonlySet<string> = new Set(["el-stat", "el-badge", "el-tag", "el-icon-button", "el-avatar", "el-card"]);

const sizeOf = (node: BoardNode) => {
  const data = node.data as ComponentData;
  const fallback = elementSize(data.variant);
  return { w: data.width ?? fallback.w, h: data.height ?? fallback.h };
};

/**
 * Elements of a screen that have no position yet go top to bottom, the way a
 * phone or a page reads: full-width bars across, a tab bar pinned at the
 * bottom, a desktop sidebar on the left. Placed elements keep their spot.
 */
export function layoutScreen(nodes: BoardNode[], memberIds: string[], rect: Rect, device: Device, placed: ReadonlySet<string>, options: { from?: number } = {}): BoardNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const members = memberIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
  const sidebar = device === "desktop" ? members.find((node) => (node.data as ComponentData).variant === "el-sidebar") : undefined;
  const left = rect.x + (sidebar ? sizeOf(sidebar).w : 0) + SCREEN_PADDING;
  const inner = rect.x + rect.width - SCREEN_PADDING - left;
  let y = options.from ?? rect.y + DEVICE_TOP[device] + SCREEN_PADDING;
  let line: { variant: string; right: number; y: number; bottom: number } | null = null;
  const moved = new Map<string, BoardNode>();
  for (const node of members) {
    const data = node.data as ComponentData;
    const size = sizeOf(node);
    if (placed.has(node.id)) {
      moved.set(node.id, { ...node, data: { ...data, width: size.w, height: size.h } });
      continue;
    }
    if (node === sidebar) {
      moved.set(node.id, { ...node, x: rect.x, y: rect.y + DEVICE_TOP[device], data: { ...data, width: size.w, height: rect.height - DEVICE_TOP[device] } });
      continue;
    }
    if (PINNED_BOTTOM.has(data.variant)) {
      // Above the phone's home indicator.
      const bottom = device === "mobile" ? 22 : 0;
      moved.set(node.id, { ...node, x: rect.x, y: rect.y + rect.height - size.h - bottom, data: { ...data, width: rect.width, height: size.h } });
      continue;
    }
    const bar = data.variant === "el-navbar";
    const width = bar ? rect.width - (sidebar ? sizeOf(sidebar).w : 0) : FULL_WIDTH.has(data.variant) ? inner : Math.min(size.w, inner);
    // Small things (numbers, buttons, badges) sit side by side while they fit on the line.
    const current = line as { variant: string; right: number; y: number; bottom: number } | null;
    if (INLINE.has(data.variant) && current && current.variant === data.variant && current.right + STACK_GAP + width <= left + inner) {
      moved.set(node.id, { ...node, x: current.right + STACK_GAP, y: current.y, data: { ...data, width, height: size.h } });
      line = { variant: current.variant, right: current.right + STACK_GAP + width, y: current.y, bottom: Math.max(current.bottom, current.y + size.h) };
      y = line.bottom + STACK_GAP;
      continue;
    }
    const x = bar ? rect.x + (sidebar ? sizeOf(sidebar).w : 0) : left;
    if (bar) y = rect.y + DEVICE_TOP[device];
    moved.set(node.id, { ...node, x, y, data: { ...data, width, height: size.h } });
    line = INLINE.has(data.variant) ? { variant: data.variant, right: x + width, y, bottom: y + size.h } : null;
    y += size.h + (bar ? SCREEN_PADDING : STACK_GAP);
  }
  return nodes.map((node) => moved.get(node.id) ?? node);
}

function centerInside(node: BoardNode, rect: Rect): boolean {
  const size = sizeOf(node);
  const cx = node.x + size.w / 2;
  const cy = node.y + size.h / 2;
  return cx >= rect.x && cx <= rect.x + rect.width && cy >= rect.y && cy <= rect.y + rect.height;
}

/** Reading order: top to bottom, and left to right on the same line. */
function readingOrder(a: BoardNode, b: BoardNode): number {
  const rowA = Math.round(a.y / 24);
  const rowB = Math.round(b.y / 24);
  return rowA === rowB ? a.x - b.x : a.y - b.y;
}

/** The elements drawn on a screen, in reading order. */
export function screenMembersOf(frame: BoardFrame, nodes: BoardNode[]): BoardNode[] {
  return nodes.filter((node) => node.kind === "component" && centerInside(node, frame)).sort(readingOrder);
}

export interface ScreenElement {
  node: BoardNode;
  key: string;
  children: ScreenElement[];
}

export interface Screen {
  frame: BoardFrame;
  key: string;
  elements: ScreenElement[];
}

/** Each screen with its elements as a tree: an element inside a card, a row or a modal is its child. */
export function uiScreens(doc: BoardDocument): Screen[] {
  const keys = componentKeys(doc.nodes);
  return doc.frames
    .filter((frame) => frame.device)
    .map((frame) => {
      const members = screenMembersOf(frame, doc.nodes);
      const rectOf = (node: BoardNode): Rect => ({ x: node.x, y: node.y, width: sizeOf(node).w, height: sizeOf(node).h });
      // The smallest container around an element is its parent.
      const parentOf = new Map<string, BoardNode>();
      for (const node of members) {
        const holders = members.filter((other) => other !== node && CONTAINERS.has((other.data as ComponentData).variant) && centerInside(node, rectOf(other)) && rectOf(other).width * rectOf(other).height > rectOf(node).width * rectOf(node).height);
        holders.sort((a, b) => rectOf(a).width * rectOf(a).height - rectOf(b).width * rectOf(b).height);
        if (holders[0]) parentOf.set(node.id, holders[0]);
      }
      const build = (parent?: BoardNode): ScreenElement[] =>
        members.filter((node) => parentOf.get(node.id) === parent).map((node) => ({ node, key: keys.get(node.id) ?? node.id, children: build(node) }));
      return { frame, key: slugify(frame.label), elements: build(undefined) };
    });
}

/** One element in words: its kind, text and what it does. */
export function describeElement(node: BoardNode, screens: Screen[]): string {
  const data = node.data as ComponentData;
  const type = componentType(data.variant).label;
  const ui = data.ui ?? {};
  const target = ui.goto ? screens.find((screen) => screen.key === ui.goto) : undefined;
  const parts = [
    `${type}${data.title ? ` "${data.title}"` : ""}`,
    ui.tone && ui.tone !== "secondary" ? ui.tone : "",
    ui.placeholder ? `placeholder "${ui.placeholder}"` : "",
    ui.options?.length ? `options: ${ui.options.join(", ")}` : "",
    ui.required ? "required" : "",
    ui.disabled ? "disabled" : "",
    ui.field ? `shows ${ui.field}` : "",
    ui.calls ? `calls ${ui.calls}` : "",
    ui.goto ? `opens ${target ? `"${target.frame.label}"` : ui.goto}` : "",
  ].filter(Boolean);
  return parts.join(", ");
}

/** The screens as Markdown: the exact structure, which the picture of each frame can't give. */
export function screensMarkdown(doc: BoardDocument): string {
  const screens = uiScreens(doc);
  if (!screens.length) return "";
  const out: string[] = [];
  const walk = (elements: ScreenElement[], depth: number) => {
    for (const element of elements) {
      out.push(`${"  ".repeat(depth)}- ${describeElement(element.node, screens)}`);
      walk(element.children, depth + 1);
    }
  };
  for (const screen of screens) {
    const { frame } = screen;
    const size = DEVICE_SIZES[frame.device!];
    out.push(`### ${frame.label}`, "", `${size.label} (${size.width} × ${size.height})${frame.route ? `, route \`${frame.route}\`` : ""}`, "");
    walk(screen.elements, 0);
    if (!screen.elements.length) out.push("- _Nothing drawn yet._");
    const states = Object.entries(frame.states ?? {});
    if (states.length) out.push("", ...states.map(([name, text]) => `- When ${name}: "${text}"`));
    out.push("");
  }
  const links = screens.flatMap((screen) =>
    screen.elements.flatMap(function collect(element): string[] {
      const goto = (element.node.data as ComponentData).ui?.goto;
      const target = goto ? screens.find((item) => item.key === goto) : undefined;
      const own = target ? [`- "${screen.frame.label}" → "${target.frame.label}" from ${componentType((element.node.data as ComponentData).variant).label.toLowerCase()} "${(element.node.data as ComponentData).title}"`] : [];
      return [...own, ...element.children.flatMap(collect)];
    }),
  );
  if (links.length) out.push("### Navigation", "", ...links, "");
  return out.join("\n").trim();
}
