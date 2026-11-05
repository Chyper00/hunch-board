import { type ComponentVariantId } from "@/lib/componentCatalog";
import { COMPONENT_SHAPES } from "@/lib/componentShapes";

import { variantFromName } from "../ops";
import { lex } from "./lex";

/** A type the board defines: type "Fraud scorer" [like=service shape=hexagon color=#ff8787]. */
export interface CustomType {
  label: string;
  base: ComponentVariantId;
  shape?: string;
  color?: string;
}

/**
 * One `type` line. Null when the line is not one; an error when it has no name;
 * otherwise the type, plus warnings for a shape Hunch doesn't know
 * (those are left off the type, and the line still counts).
 */
export function consumeCustomTypeLine(content: string): { type: CustomType; warnings: string[] } | { error: string } | null {
  if (!/^type\s+"/i.test(content)) return null;
  const { strings, attrs } = lex(content.slice(5));
  const label = strings[0]?.trim();
  if (!label) return { error: 'Write a custom type as: type "Fraud scorer" [like=service shape=hexagon]' };
  const shape = typeof attrs.shape === "string" ? attrs.shape : undefined;
  const warnings: string[] = [];
  if (shape && !(COMPONENT_SHAPES as readonly string[]).includes(shape)) warnings.push(`Unknown shape "${shape}". Shapes: ${COMPONENT_SHAPES.join(", ")}.`);
  return {
    warnings,
    type: {
      label,
      base: typeof attrs.like === "string" ? variantFromName(attrs.like) : "service",
      ...(shape && (COMPONENT_SHAPES as readonly string[]).includes(shape) ? { shape } : {}),
      ...(typeof attrs.color === "string" && /^#[0-9a-f]{3,8}$/i.test(attrs.color) ? { color: attrs.color } : {}),
    },
  };
}
