import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { parseDsl } from "@/core/dsl";
import type { BoardDocument } from "@/core/document";
import { readProject } from "@/core/project";
import { boardToMermaid } from "@/lib/mermaidExport";
import { boardToSvg } from "@/lib/svgExport";
import type { ComponentData } from "@/lib/types";

import { readProjectFiles } from "./files";

/**
 * What the CLI and the MCP server can do, each as a function of a folder:
 * the same core the site runs, on the files next to the code.
 */

export interface Result {
  ok: boolean;
  text: string;
}

const ROOT_BOARD = "board.hunch";
const NO_BOARD = (root: string) => `No .hunch file in ${root}. Run hunch init, or write ${ROOT_BOARD}.`;

/** The board files, as text, for an AI to read. Files on the board are named by their path, so it can open them. */
export function readBoard(root: string): Result {
  const files = readProjectFiles(root);
  const paths = Object.keys(files).sort((a, b) => (a === ROOT_BOARD ? -1 : b === ROOT_BOARD ? 1 : a.localeCompare(b)));
  if (!paths.length) return { ok: false, text: NO_BOARD(root) };
  return { ok: true, text: paths.map((path) => `--- ${path}\n${files[path].trimEnd()}`).join("\n\n") };
}

/** Replaces one board file with new text, only when it reads without errors. */
export function writeBoard(root: string, path: string, text: string): Result {
  if (!/^[\w./-]+\.hunch$/.test(path) || path.includes("..")) return { ok: false, text: `Not a board file inside the project: ${path}` };
  const others = readProjectFiles(root);
  const errors = parseDsl(text, undefined, { ...others, [path]: text }).issues.filter((issue) => issue.severity === "error");
  if (errors.length) return { ok: false, text: `Not written: ${errors.length} line${errors.length === 1 ? "" : "s"} can't be read.\n${errors.map((issue) => `Line ${issue.line}: ${issue.message}`).join("\n")}` };
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text.endsWith("\n") ? text : `${text}\n`);
  return { ok: true, text: `Wrote ${path}.` };
}

/**
 * The board as SVG. Transparent background, no network, so a chat can show the drawing.
 * `mermaid` prints a flowchart instead, which GitHub draws inside a README or a pull request.
 */
export function render(root: string, file = ROOT_BOARD, options: { mermaid?: boolean } = {}): Result {
  if (!/^[\w./-]+\.hunch$/.test(file) || file.includes("..")) return { ok: false, text: `Not a board file: ${file}` };
  const path = resolve(root, file);
  if (!existsSync(path)) return { ok: false, text: `No board at ${file}.` };
  const parsed = parseDsl(readFileSync(path, "utf8"));
  const errors = parsed.issues.filter((issue) => issue.severity === "error");
  if (errors.length) return { ok: false, text: `This board can't be drawn.\n${errors.map((issue) => `Line ${issue.line}: ${issue.message}`).join("\n")}` };
  if (options.mermaid) return { ok: true, text: boardToMermaid(parsed.doc.nodes, parsed.doc.links, parsed.doc.frames, parsed.doc.title) };
  return { ok: true, text: boardToSvg(parsed.doc.title, parsed.doc.nodes, parsed.doc.links, parsed.doc.frames, { embed: true }) };
}

interface CheckIssue {
  file: string;
  line: number;
  severity: "error" | "warning";
  message: string;
}

/** Files the board names that aren't in the folder. A web address is not checked. */
function missingFiles(root: string, doc: BoardDocument): string[] {
  return doc.nodes.flatMap((node) => {
    const src = node.kind === "component" ? (node.data as ComponentData).src : undefined;
    return src && !/^https?:\/\//i.test(src) && !existsSync(resolve(root, src)) ? [src] : [];
  });
}

/** Every board is read: a line that doesn't read fails the command. A file the board names and the folder doesn't have, or a board no box links to, is a warning. */
export function check(root: string, options: { board?: string; json?: boolean } = {}): Result {
  const files = options.board ? { [options.board]: readFileSync(resolve(root, options.board), "utf8") } : readProjectFiles(root);
  if (!Object.keys(files).length) {
    const message = NO_BOARD(root);
    return options.json ? { ok: false, text: JSON.stringify({ ok: false, issues: [{ file: ROOT_BOARD, line: 0, severity: "error", message }] }, null, 2) } : { ok: false, text: message };
  }
  const issues: CheckIssue[] = Object.entries(files).flatMap(([file, text]) => {
    const { doc, issues: found } = parseDsl(text, undefined, files);
    return [
      ...found.map((issue) => ({ file, line: issue.line, severity: issue.severity, message: issue.message })),
      ...missingFiles(resolve(root, dirname(file)), doc).map((src) => ({ file, line: 0, severity: "warning" as const, message: `${src} isn't in this folder.` })),
    ];
  });
  // Links between boards, when the whole folder was read.
  if (!options.board) {
    const named = new Set(Object.values(files).flatMap((text) => [...text.matchAll(/^inside\s+\S+\s+(\S+)\s*$/gm)].map((match) => match[1])));
    for (const path of named) if (!(path in files) && existsSync(resolve(root, path))) files[path] = readFileSync(resolve(root, path), "utf8");
    for (const problem of readProject(files).issues) if (!problem.message.startsWith("Line ")) issues.push({ file: problem.file, line: 0, severity: "warning", message: problem.message });
  }
  const ok = !issues.some((issue) => issue.severity === "error");
  if (options.json) return { ok, text: JSON.stringify({ ok, issues }, null, 2) };
  const listed = issues.map((issue) => `${issue.file}:${issue.line}: ${issue.message}`).join("\n");
  return { ok, text: ok ? ["The drawing reads.", listed].filter(Boolean).join("\n") : listed };
}
