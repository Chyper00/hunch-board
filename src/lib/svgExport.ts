import { componentAccent, SOFTWARE_LINK_COLOR } from "./softwareKit";
import type { BoardFrame, BoardLink, BoardNode, ComponentData, LabelData, NoteData } from "./types";

const CARD_W = 240;
const CARD_H = 96;
const NOTE_CHARS = 26;
const NOTE_FIRST_LINE = 28;
const NOTE_LINE = 18;

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** What fits a 200px note in 14px sans-serif. SVG text has no wrapping of its own. */
function noteLines(text: string): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      let rest = word;
      if (line && line.length + 1 + rest.length > NOTE_CHARS) {
        lines.push(line);
        line = "";
      }
      if (line) {
        line += ` ${rest}`;
        continue;
      }
      while (rest.length > NOTE_CHARS) {
        lines.push(rest.slice(0, NOTE_CHARS));
        rest = rest.slice(NOTE_CHARS);
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}

function boxOf(node: BoardNode): { x: number; y: number; w: number; h: number } {
  if (node.kind === "component") {
    const data = node.data as ComponentData;
    return { x: node.x, y: node.y, w: data.width ?? CARD_W, h: data.height ?? CARD_H };
  }
  if (node.kind === "label") return { x: node.x, y: node.y, w: 280, h: 40 };
  const count = noteLines((node.data as NoteData).text).length;
  return { x: node.x, y: node.y, w: 200, h: Math.max(80, NOTE_FIRST_LINE + (count - 1) * NOTE_LINE + 16) };
}

/**
 * Vector snapshot of the diagram: boxes, arrows, title and a color legend.
 * `embed` leaves the background transparent and paints ink with CSS variables
 * (`var(--hunch-ink, currentColor)`), so a chat can show it in light or dark
 * without a browser and without a request.
 */
export function boardToSvg(title: string, nodes: BoardNode[], links: BoardLink[], frames: BoardFrame[] = [], look: { embed?: boolean } = {}): string {
  const embed = look.embed === true;
  const ink = embed ? "var(--hunch-ink, currentColor)" : "#f1f1f4";
  const muted = embed ? "var(--hunch-muted, currentColor)" : "#a3a3ad";
  const card = embed ? "var(--hunch-card, transparent)" : "#1b1b20";
  const boxes = nodes.map(boxOf);
  const minX = Math.min(0, ...boxes.map((box) => box.x), ...frames.map((frame) => frame.x)) - 48;
  const minY = Math.min(-56, ...boxes.map((box) => box.y), ...frames.map((frame) => frame.y)) - 24;
  const maxX = Math.max(320, ...boxes.map((box) => box.x + box.w), ...frames.map((frame) => frame.x + frame.width)) + 48;
  const maxY = Math.max(200, ...boxes.map((box) => box.y + box.h), ...frames.map((frame) => frame.y + frame.height)) + 80;
  const width = maxX - minX;
  const height = maxY - minY;

  const byId = new Map(nodes.map((node, index) => [node.id, boxes[index]]));
  const legend = new Map<string, string>();
  for (const node of nodes) {
    if (node.kind !== "component") continue;
    const data = node.data as ComponentData;
    legend.set(data.variant, componentAccent(data));
  }

  const parts: string[] = [];
  if (embed) {
    parts.push(`<style>svg{color:#121212}@media (prefers-color-scheme:dark){svg{color:#f1f1f4}}</style>`);
  } else {
    parts.push(`<rect width="100%" height="100%" fill="#121212"/>`);
  }
  parts.push(`<text x="${24 - minX}" y="${36 - minY}" fill="${ink}" font-size="28" font-family="sans-serif">${escapeXml(title || "Architecture")}</text>`);
  for (const frame of frames) {
    parts.push(
      `<rect x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" fill="none" stroke="${frame.color}" stroke-dasharray="6 4" rx="12"/>`,
    );
    parts.push(`<text x="${frame.x + 12}" y="${frame.y + 20}" fill="${frame.color}" font-size="14" font-family="sans-serif">${escapeXml(frame.label)}</text>`);
  }
  for (const link of links) {
    const from = byId.get(link.from);
    const to = byId.get(link.to);
    if (!from || !to) continue;
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h / 2;
    const x2 = to.x + to.w / 2;
    const y2 = to.y + to.h / 2;
    const dash = link.style === "dashed" ? ` stroke-dasharray="8 6"` : link.style === "dotted" ? ` stroke-dasharray="2 6"` : "";
    const stroke = embed && link.color === SOFTWARE_LINK_COLOR ? ink : link.color;
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${link.width ?? 2}"${dash}/>`);
    if (link.label) {
      parts.push(
        `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" fill="${ink}" font-size="12" text-anchor="middle" font-family="sans-serif">${escapeXml(link.label)}</text>`,
      );
    }
  }
  for (const node of nodes) {
    const box = byId.get(node.id)!;
    if (node.kind === "component") {
      const data = node.data as ComponentData;
      const color = componentAccent(data);
      parts.push(`<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="14" fill="${card}" stroke="${color}" stroke-width="2"/>`);
      parts.push(`<text x="${box.x + 16}" y="${box.y + 36}" fill="${ink}" font-size="16" font-family="sans-serif">${escapeXml(data.title)}</text>`);
      if (data.tech) parts.push(`<text x="${box.x + 16}" y="${box.y + 58}" fill="${muted}" font-size="11" font-family="ui-monospace, monospace">${escapeXml(data.tech)}</text>`);
    } else if (node.kind === "label") {
      const data = node.data as LabelData;
      parts.push(`<text x="${box.x}" y="${box.y + 24}" fill="${ink}" font-size="22" font-family="sans-serif">${escapeXml(data.text)}</text>`);
    } else {
      const data = node.data as NoteData;
      parts.push(`<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="6" fill="#ffec99"/>`);
      noteLines(data.text).forEach((line, index) => {
        parts.push(`<text x="${box.x + 12}" y="${box.y + NOTE_FIRST_LINE + index * NOTE_LINE}" fill="#3b2f00" font-size="14" font-family="sans-serif">${escapeXml(line)}</text>`);
      });
    }
  }
  let legendX = 24 - minX;
  const legendY = maxY - minY - 28;
  for (const [label, color] of legend) {
    parts.push(`<rect x="${legendX}" y="${legendY}" width="12" height="12" fill="${color}"/>`);
    parts.push(`<text x="${legendX + 18}" y="${legendY + 11}" fill="${embed ? ink : "#c9c9d1"}" font-size="12" font-family="sans-serif">${escapeXml(label)}</text>`);
    legendX += 18 + label.length * 7 + 16;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">\n${parts.join("\n")}\n</svg>\n`;
}
