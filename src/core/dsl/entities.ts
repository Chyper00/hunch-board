/** Entities in the Hunch language: `entity Order(id uuid pk, total decimal required)`, read and written. */
import type { Entity, EntityField } from "@/lib/types";

/** `Order(id uuid pk, customerId uuid fk=Customer.id, total decimal required check>0) index(customerId)` */
export function parseEntity(text: string): Entity | null {
  const indexes: string[][] = [];
  const body = text
    .replace(/\s+index\(([^)]*)\)/g, (_, cols: string) => {
      indexes.push(cols.split(",").map((col) => col.trim()).filter(Boolean));
      return "";
    })
    .trim();
  const match = body.match(/^([\w.-]+)\s*(?:\((.*)\))?\s*$/);
  if (!match) return null;
  const fields: EntityField[] = (match[2] ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, type = "string", ...flags] = part.split(/\s+/);
      const field: EntityField = { name, type };
      for (const flag of flags) {
        if (flag === "pk") field.pk = true;
        else if (flag === "required") field.required = true;
        else if (flag === "unique") field.unique = true;
        else if (flag.startsWith("fk=")) field.fk = flag.slice(3);
        else if (flag.startsWith("default=")) field.default = flag.slice(8);
        else if (flag.startsWith("max=")) field.max = Number(flag.slice(4));
        else if (flag.startsWith("check")) field.check = flag.slice(5).replace(/^=/, "");
      }
      return field;
    });
  return { name: match[1], fields, ...(indexes.length ? { indexes } : {}) };
}

export function entityToText(entity: Entity): string {
  const fields = entity.fields.map((field) =>
    [
      field.name,
      field.type,
      field.pk ? "pk" : "",
      field.fk ? `fk=${field.fk}` : "",
      field.required ? "required" : "",
      field.unique ? "unique" : "",
      field.default ? `default=${field.default}` : "",
      field.check ? `check${field.check}` : "",
      field.max !== undefined ? `max=${field.max}` : "",
    ]
      .filter(Boolean)
      .join(" "),
  );
  const indexes = (entity.indexes ?? []).map((columns) => ` index(${columns.join(", ")})`).join("");
  return `${entity.name}(${fields.join(", ")})${indexes}`;
}

// --- parse -----------------------------------------------------------------
