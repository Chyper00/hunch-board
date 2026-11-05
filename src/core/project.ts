import type { ComponentData } from "@/lib/types";

import { componentKeys, type BoardDocument } from "./document";
import { parseDsl, printDsl } from "./dsl";

/**
 * A project as a folder of `.hunch` files: the board, and a board for the
 * inside of each box that has one. The `inside` line of the outer file is the
 * link, and its path starts at the folder that holds board.hunch.
 *
 *   board.hunch                 the map                 inside api boards/api.hunch
 *   boards/api.hunch            inside the box `api`    inside db boards/api/db.hunch
 *   boards/api/db.hunch         inside the box `db` of that board
 *
 * Site, editor and CLI all read links through here, so they can't disagree.
 */

export const ROOT_BOARD = "board.hunch";

export interface ProjectBoard {
  /** Where the board lives in the folder. */
  file: string;
  doc: BoardDocument;
  /** Boards inside its boxes: the key of the box and the board. */
  children: Array<{ key: string; nodeId: string; board: ProjectBoard }>;
}

export interface ProjectIssue {
  file: string;
  message: string;
}

export interface ProjectRead {
  root: ProjectBoard | null;
  issues: ProjectIssue[];
  /** How many boards were read, the root included. */
  count: number;
}

/** The usual file for the inside of the box `key` of the board in `file`. */
export function childFile(file: string, key: string): string {
  return file.includes("/") ? `${file.replace(/\.hunch$/, "")}/${key}.hunch` : `boards/${key}.hunch`;
}

/** The files a box names, then the usual file for its key when that one exists. */
function insidePaths(data: ComponentData, conventional: string, exists: (path: string) => boolean): string[] {
  const named = data.insideFiles?.length ? data.insideFiles : data.insideFile ? [data.insideFile] : [];
  return [...new Set(exists(conventional) ? [...named, conventional] : named)];
}

/** Opens a project from its files (path relative to the folder -> text). */
export function readProject(files: Record<string, string>): ProjectRead {
  const issues: ProjectIssue[] = [];
  const hunchFiles = Object.keys(files).filter((path) => path.endsWith(".hunch"));
  const topLevel = hunchFiles.filter((path) => !path.includes("/")).sort();
  const rootFile = hunchFiles.includes(ROOT_BOARD) ? ROOT_BOARD : topLevel[0];
  if (!rootFile) return { root: null, issues: [{ file: "", message: "No board.hunch in this folder." }], count: 0 };

  let count = 0;
  const used = new Set<string>([rootFile]);
  const read = (file: string): ProjectBoard => {
    count++;
    const parsed = parseDsl(files[file], undefined, files);
    for (const issue of parsed.issues.filter((item) => item.severity === "error")) issues.push({ file, message: `Line ${issue.line}: ${issue.message}` });
    const keys = componentKeys(parsed.doc.nodes);
    const children: ProjectBoard["children"] = [];
    for (const node of parsed.doc.nodes) {
      const key = keys.get(node.id);
      if (!key || node.kind !== "component") continue;
      const data = node.data as ComponentData;
      for (const inside of insidePaths(data, childFile(file, key), (path) => path in files)) {
        if (used.has(inside)) continue;
        if (!(inside in files)) {
          issues.push({ file, message: `The box "${key}" names ${inside}, and that file isn't in the folder.` });
          continue;
        }
        used.add(inside);
        const board = read(inside);
        if (!/^title /m.test(files[inside])) board.doc = { ...board.doc, title: `${data.title}: inside` };
        children.push({ key, nodeId: node.id, board });
      }
    }
    return { file, doc: parsed.doc, children };
  };
  const root = read(rootFile);
  for (const file of hunchFiles.filter((path) => path.startsWith("boards/") && !used.has(path)).sort()) {
    issues.push({ file, message: "No box links to this board, so it can't be reached from the board above it." });
  }
  return { root, issues, count };
}

/** A board and what is inside its boxes, as the files of a project folder. */
export interface ProjectTree {
  /** Where its data lives in the browser, when it does. */
  boardId?: string;
  doc: BoardDocument;
  children: Array<{ key: string; file?: string; tree: ProjectTree }>;
}

export function projectFiles(tree: ProjectTree, file = ROOT_BOARD): Record<string, string> {
  const inside: Record<string, string> = {};
  for (const child of tree.children) inside[child.key] = child.file ?? childFile(file, child.key);
  const out: Record<string, string> = { [file]: printDsl(tree.doc, { layout: true, inside }) };
  for (const child of tree.children) Object.assign(out, projectFiles(child.tree, child.file ?? childFile(file, child.key)));
  return out;
}

/** Every board of the project, root first, as a flat list. */
export function projectBoards(root: ProjectBoard): ProjectBoard[] {
  return [root, ...root.children.flatMap((child) => projectBoards(child.board))];
}

/** Each board of a folder from the outside: how much it holds and which box it is drawn inside. */
export interface InsideIndexEntry {
  title: string;
  boxes: number;
  parent?: { file: string; box: string };
}

export function insideIndex(files: Record<string, string>): Record<string, InsideIndexEntry> {
  const index: Record<string, InsideIndexEntry> = {};
  const docs = Object.entries(files).map(([file, text]) => ({ file, doc: parseDsl(text, undefined, files).doc }));
  for (const { file, doc } of docs) index[file] = { title: doc.title, boxes: doc.nodes.filter((node) => node.kind === "component").length };
  for (const { file, doc } of docs) {
    const keys = componentKeys(doc.nodes);
    for (const node of doc.nodes) {
      const key = keys.get(node.id);
      if (!key || node.kind !== "component") continue;
      const data = node.data as ComponentData;
      for (const path of insidePaths(data, childFile(file, key), (candidate) => candidate in files)) {
        if (index[path] && path !== file && !index[path].parent) index[path].parent = { file, box: data.title || key };
      }
    }
  }
  return index;
}

/** The boards above one, from the top: each with the box the next one lives in. A loop in the links stops the walk. */
export function insideTrail(index: Record<string, InsideIndexEntry>, file: string): Array<{ file: string; title: string; box: string }> {
  const steps: Array<{ file: string; title: string; box: string }> = [];
  const seen = new Set([file]);
  let parent = index[file]?.parent;
  while (parent && !seen.has(parent.file)) {
    seen.add(parent.file);
    steps.unshift({ file: parent.file, title: index[parent.file]?.title ?? parent.file, box: parent.box });
    parent = index[parent.file]?.parent;
  }
  return steps;
}
