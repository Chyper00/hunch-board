import type { Device } from "./types";
import type { UiVariantId } from "./componentCatalog";

/**
 * Sizes for the UI sketch: the device frames (fixed, so the sketch reads like
 * the real screen) and each element's default size when dropped. The sketch
 * is about intent, so these are starting points, not a design system.
 */

export const DEVICE_SIZES: Record<Device, { width: number; height: number; label: string }> = {
  mobile: { width: 390, height: 844, label: "Mobile" },
  tablet: { width: 820, height: 1180, label: "Tablet" },
  desktop: { width: 1440, height: 900, label: "Desktop" },
};

/** Room the device chrome takes at the top (status bar, browser bar) before content starts. */
export const DEVICE_TOP: Record<Device, number> = { mobile: 44, tablet: 36, desktop: 52 };
export const SCREEN_PADDING = 20;
export const STACK_GAP = 14;

type Size = { w: number; h: number };

export const ELEMENT_SIZES: Record<UiVariantId, Size> = {
  "el-rect": { w: 160, h: 100 },
  "el-ellipse": { w: 120, h: 120 },
  "el-line": { w: 200, h: 16 },
  "el-arrow": { w: 160, h: 24 },
  "el-text": { w: 200, h: 32 },
  "el-heading": { w: 300, h: 44 },
  "el-paragraph": { w: 340, h: 64 },
  "el-label": { w: 140, h: 24 },
  "el-link": { w: 140, h: 28 },
  "el-button": { w: 160, h: 48 },
  "el-icon-button": { w: 48, h: 48 },
  "el-button-group": { w: 280, h: 48 },
  "el-input": { w: 340, h: 72 },
  "el-email": { w: 340, h: 72 },
  "el-password": { w: 340, h: 72 },
  "el-number": { w: 200, h: 72 },
  "el-textarea": { w: 340, h: 128 },
  "el-select": { w: 340, h: 72 },
  "el-combobox": { w: 340, h: 72 },
  "el-checkbox": { w: 240, h: 32 },
  "el-radio": { w: 240, h: 96 },
  "el-toggle": { w: 240, h: 36 },
  "el-slider": { w: 300, h: 56 },
  "el-date": { w: 240, h: 72 },
  "el-time": { w: 200, h: 72 },
  "el-upload": { w: 340, h: 120 },
  "el-search": { w: 340, h: 48 },
  "el-image": { w: 340, h: 200 },
  "el-avatar": { w: 56, h: 56 },
  "el-icon": { w: 32, h: 32 },
  "el-badge": { w: 72, h: 28 },
  "el-tag": { w: 88, h: 30 },
  "el-divider": { w: 340, h: 12 },
  "el-card": { w: 340, h: 180 },
  "el-table": { w: 640, h: 260 },
  "el-list": { w: 340, h: 220 },
  "el-stat": { w: 200, h: 96 },
  "el-chart": { w: 440, h: 240 },
  "el-progress": { w: 300, h: 40 },
  "el-empty": { w: 340, h: 180 },
  "el-skeleton": { w: 340, h: 120 },
  "el-navbar": { w: 390, h: 60 },
  "el-sidebar": { w: 240, h: 600 },
  "el-tabs": { w: 340, h: 48 },
  "el-breadcrumb": { w: 300, h: 28 },
  "el-pagination": { w: 300, h: 44 },
  "el-bottom-tabs": { w: 390, h: 68 },
  "el-menu": { w: 200, h: 180 },
  "el-alert": { w: 340, h: 64 },
  "el-toast": { w: 300, h: 56 },
  "el-modal": { w: 340, h: 240 },
  "el-tooltip": { w: 180, h: 48 },
  "el-spinner": { w: 48, h: 48 },
  "el-container": { w: 340, h: 200 },
  "el-stack": { w: 340, h: 240 },
  "el-row": { w: 340, h: 80 },
  "el-grid": { w: 340, h: 240 },
  "el-section": { w: 340, h: 260 },
};

/** Elements that span the screen's width when a screen is laid out from text. */
export const FULL_WIDTH: ReadonlySet<string> = new Set(["el-navbar", "el-bottom-tabs", "el-divider", "el-tabs", "el-table", "el-chart", "el-image", "el-section", "el-container", "el-alert", "el-search", "el-list", "el-card", "el-empty"]);

/** Elements pinned to the bottom of a mobile screen (the tab bar). */
export const PINNED_BOTTOM: ReadonlySet<string> = new Set(["el-bottom-tabs"]);

/** Elements that hold others: their children are drawn inside them, and the tree for the AI nests them. */
export const CONTAINERS: ReadonlySet<string> = new Set(["el-card", "el-container", "el-stack", "el-row", "el-grid", "el-section", "el-modal", "el-sidebar", "el-rect"]);

export function elementSize(variant: string): Size {
  return (ELEMENT_SIZES as Record<string, Size>)[variant] ?? { w: 200, h: 48 };
}

/** Elements that open and close with a click: a menu (a button when closed) and a sidebar (an icon rail when closed). */
export const COLLAPSIBLE: ReadonlySet<string> = new Set(["el-menu", "el-sidebar"]);

/** The size an element takes when it opens or closes: closed menus are a button, closed sidebars a rail. */
export function toggledSize(variant: string, collapsed: boolean, current: { w: number; h: number }, items: number): { w: number; h: number } {
  if (variant === "el-menu") return collapsed ? { w: current.w, h: 44 } : { w: current.w, h: Math.max(80, 20 + items * 36) };
  if (variant === "el-sidebar") return collapsed ? { w: 64, h: current.h } : { w: 240, h: current.h };
  return current;
}
