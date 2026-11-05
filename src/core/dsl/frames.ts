import { slugify, type BoardDocument } from "../document";
import { frameAround } from "../layout";
import { layoutScreen } from "../ui/screens";
import { createId } from "@/lib/id";
import { SOFTWARE_FRAME_COLORS } from "@/lib/softwareKit";
import type { BoardFrame, Device, FrameKind } from "@/lib/types";
import { DEVICE_SIZES } from "@/lib/uiSketch";

import type { DslIssue } from "./lex";

/** A frame line read from the text, waiting for the boxes to exist: a screen (with a device) or a boundary. */
export interface PendingFrame {
  line: number;
  label: string;
  keys: string[];
  device?: Device;
  route?: string;
  states?: Record<string, string>;
  kind?: FrameKind;
}

/**
 * Turns the frame lines into frames once the boxes exist: each screen a
 * device-sized frame laying out its elements, each boundary drawn around its
 * boxes. Keeps the ids, colors and places of the frames the board had.
 */
export function placeFrames(
  doc: BoardDocument,
  pendingFrames: PendingFrame[],
  { idByKey, previous, layout, placed, issues, now }: { idByKey: Map<string, string>; previous?: BoardDocument; layout: Map<string, { x: number; y: number }>; placed: Set<string>; issues: DslIssue[]; now: number },
): void {
  // Screens: a device-sized frame each, side by side unless placed, and their elements top to bottom.
  let nextScreenX = 0;
  for (const pending of pendingFrames) {
    if (!pending.device) continue;
    const size = DEVICE_SIZES[pending.device];
    const prev = previous?.frames.find((frame) => frame.label === pending.label);
    const at = layout.get(`frame:${slugify(pending.label)}`) ?? (prev ? { x: prev.x, y: prev.y } : { x: nextScreenX, y: 0 });
    nextScreenX = Math.max(nextScreenX, at.x + size.width + 200);
    const rect = { x: at.x, y: at.y, width: size.width, height: size.height };
    const members = pending.keys.flatMap((key) => (idByKey.has(key) ? [idByKey.get(key)!] : []));
    doc.nodes = layoutScreen(doc.nodes, members, rect, pending.device, placed);
    for (const key of pending.keys.filter((item) => !idByKey.has(item))) issues.push({ line: pending.line, message: `Screen "${pending.label}": "${key}" is not declared.`, severity: "error" });
    doc.frames.push({
      id: prev?.id ?? createId(),
      label: pending.label,
      ...rect,
      color: prev?.color ?? "#ced4da",
      createdAt: prev?.createdAt ?? now,
      device: pending.device,
      ...(pending.route ? { route: pending.route } : {}),
      ...(pending.states ? { states: pending.states } : {}),
    });
  }

  for (const pending of pendingFrames) {
    if (pending.device) continue;
    const missing = pending.keys.filter((key) => !idByKey.has(key));
    for (const key of missing) issues.push({ line: pending.line, message: `Frame "${pending.label}": "${key}" is not declared.`, severity: "error" });
    const members = doc.nodes.filter((node) => pending.keys.some((key) => idByKey.get(key) === node.id));
    const prev = previous?.frames.find((frame) => frame.label === pending.label);
    const rect = frameAround(members) ?? (prev ? { x: prev.x, y: prev.y, width: prev.width, height: prev.height } : null);
    if (!rect) continue;
    const frame: BoardFrame = {
      id: prev?.id ?? createId(),
      label: pending.label,
      ...rect,
      color: prev?.color ?? SOFTWARE_FRAME_COLORS[doc.frames.length % SOFTWARE_FRAME_COLORS.length],
      createdAt: prev?.createdAt ?? now,
      ...(pending.kind ? { kind: pending.kind } : {}),
    };
    doc.frames.push(frame);
  }
}
