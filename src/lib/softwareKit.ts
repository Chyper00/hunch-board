import type { CSSProperties } from "react";

import { COMPONENT_CATEGORIES, componentType, isUiVariant } from "./componentCatalog";
import { elementSize } from "./uiSketch";
import { GRID_SIZE } from "./layoutTools";
import type { ComponentData, ComponentVariant, Viewport } from "./types";

export { COMPONENT_CATALOG, COMPONENT_CATEGORIES, componentType } from "./componentCatalog";

export const SOFTWARE_ACCENTS = ["#74c0fc", "#69db7c", "#ffa94d", "#ff8787", "#b197fc", "#ffd43b", "#63e6be", "#66d9e8", "#f783ac", "#ced4da"];

export const SOFTWARE_LINK_COLOR = "#c9c9d1";
export const SOFTWARE_LINK_COLORS = [SOFTWARE_LINK_COLOR, "#74c0fc", "#69db7c", "#ffa94d", "#ff8787", "#b197fc"];
export const SOFTWARE_FRAME_COLORS = ["#74c0fc", "#b197fc", "#69db7c", "#ffa94d"];

export function componentAccent(data: ComponentData): string {
  return data.accent ?? COMPONENT_CATEGORIES[componentType(data.variant).category].accent;
}

export function defaultComponentData(variant: ComponentVariant): ComponentData {
  // A UI sketch element comes in at its own size (a button, a field), not a diagram card's.
  if (isUiVariant(variant)) {
    const size = elementSize(variant);
    return { title: componentType(variant).defaultTitle, variant, width: size.w, height: size.h };
  }
  return { title: componentType(variant).defaultTitle, variant };
}

/**
 * Dot grid in screen space, stuck to the world grid. The painted area is the
 * window, not a finite square, so panning never runs off the paper.
 * Dot size stays in screen pixels; only spacing and offset follow the camera,
 * so the browser keeps one tiny tile instead of scaling a giant texture.
 */
export function infiniteCanvasStyle(viewport: Viewport): CSSProperties {
  const step = GRID_SIZE * viewport.scale;
  const half = (GRID_SIZE / 2) * viewport.scale;
  return {
    backgroundColor: "var(--canvas-bg, #121212)",
    backgroundImage: "radial-gradient(circle, var(--canvas-dot, #2e2e36) 1.2px, transparent 1.6px)",
    backgroundSize: `${step}px ${step}px`,
    // A tile's dot sits in its center. Shift by half a cell so that center lands on world 0, then on every multiple of the grid.
    backgroundPosition: `${viewport.x - half}px ${viewport.y - half}px`,
  };
}
