import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

/** The CLI's edge with the disk: read the boards of a project and write files. Everything else is the core. */

/** Never where a board lives. */
const SKIP = new Set(["node_modules", ".git", ".next", ".turbo", "coverage", ".vercel", "__pycache__", "venv", "site-packages"]);
/** The .hunch files of a project folder, by path relative to it. */
export function readProjectFiles(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const visit = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name) || name.startsWith(".")) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        // Only the boards folder of older projects is read below the top: a project's code can be large.
        if (relative(root, path).split(/[\\/]/)[0] === "boards") visit(path);
      } else if (name.endsWith(".hunch")) files[relative(root, path).split("\\").join("/")] = readFileSync(path, "utf8");
    }
  };
  visit(root);
  return files;
}

/** Writes files under root; returns the paths whose content changed (new ones included). */
export function writeFiles(root: string, files: Record<string, string>): string[] {
  const changed: string[] = [];
  for (const [path, text] of Object.entries(files)) {
    const target = join(root, path);
    let before: string | null = null;
    try {
      before = readFileSync(target, "utf8");
    } catch {
      before = null;
    }
    if (before === text) continue;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
    changed.push(path);
  }
  return changed;
}
