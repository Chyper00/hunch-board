/** The Hunch language, the small pieces: comments, quoted strings, attributes and the patterns of a line. */
import { type BoardDocument } from "../document";

export interface DslIssue {
  /** 1-based line number. */
  line: number;
  message: string;
  severity: "error" | "warning";
}

export interface DslParseResult {
  doc: BoardDocument;
  issues: DslIssue[];
}

// --- lexing ----------------------------------------------------------------


/** Removes a `//` comment that is not inside quotes. */
export function stripComment(line: string): string {
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && inQuote) {
      i += 1;
      continue;
    }
    if (ch === '"') inQuote = !inQuote;
    if (!inQuote && ch === "/" && line[i + 1] === "/") return line.slice(0, i);
  }
  return line;
}

export function unescape(value: string): string {
  return value.replace(/\\(.)/g, (_, ch: string) => (ch === "n" ? "\n" : ch));
}

export function quotedStrings(text: string): string[] {
  const out: string[] = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) out.push(unescape(match[1]));
  return out;
}

export function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}

/** Splits into words, quoted strings (unescaped) and one trailing `[...]` attribute block. */
export function lex(text: string): { words: string[]; strings: string[]; attrs: Record<string, string | true>; order: Array<"word" | "string"> } {
  const words: string[] = [];
  const strings: string[] = [];
  const order: Array<"word" | "string"> = [];
  let attrs: Record<string, string | true> = {};
  const re = /"((?:[^"\\]|\\.)*)"|\[([^\]]*)\]|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match[1] !== undefined) {
      strings.push(unescape(match[1]));
      order.push("string");
    } else if (match[2] !== undefined) attrs = { ...attrs, ...parseAttrs(match[2]) };
    else {
      words.push(match[3]);
      order.push("word");
    }
  }
  return { words, strings, attrs, order };
}

export function parseAttrs(text: string): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  const re = /([\w-]+)(?:=(?:"((?:[^"\\]|\\.)*)"|([^\s"]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) out[match[1].toLowerCase()] = match[2] !== undefined ? unescape(match[2]) : (match[3] ?? true);
  return out;
}

export function attrsToText(attrs: Array<[string, string | number | true | undefined]>): string {
  const parts = attrs.flatMap(([key, value]) => {
    if (value === undefined) return [];
    if (value === true) return [key];
    const text = String(value);
    // A bare value can't hold "//": it would start a comment (a web address, say).
    return [`${key}=${/^[\w.:/%#-]+$/.test(text) && !text.includes("//") ? text : quote(text)}`];
  });
  return parts.length ? ` [${parts.join(" ")}]` : "";
}

// --- statements ------------------------------------------------------------

export const KEY = "[A-Za-z0-9_][\\w.-]*";
export const RELATION = new RegExp(`^(${KEY})\\s*(-->|=>|->|-\\|>|\\.\\.>)\\s*(${KEY})(?=\\s|$|\\[|")(.*)$`);
export const DECLARATION = new RegExp(`^(${KEY})\\s*:\\s*(.*)$`);
export const STEP = new RegExp(`^(${KEY})\\s*(?:-->|=>|->|\\.\\.>)\\s*(${KEY})\\s*(?:"((?:[^"\\\\]|\\\\.)*)")?$`);

export function parseNumber(value: string | true | undefined): number | undefined {
  if (value === undefined || value === true) return undefined;
  const parsed = Number(String(value).replace(/[_,]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function findColonOutsideQuotes(text: string): number {
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && inQuote) {
      i += 1;
      continue;
    }
    if (text[i] === '"') inQuote = !inQuote;
    else if (text[i] === ":" && !inQuote) return i;
  }
  return -1;
}

/** Splits on a comma that is not inside quotes, so a label like "notes, links" stays one step. */
export function splitOutsideQuotes(text: string, separator = ","): string[] {
  const parts: string[] = [];
  let start = 0;
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && inQuote) {
      i += 1;
      continue;
    }
    if (text[i] === '"') inQuote = !inQuote;
    else if (text[i] === separator && !inQuote) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

export function unescapeMaybeQuoted(text: string): string {
  const match = text.match(/^"((?:[^"\\]|\\.)*)"$/);
  return match ? unescape(match[1]) : text;
}

// --- print -----------------------------------------------------------------
