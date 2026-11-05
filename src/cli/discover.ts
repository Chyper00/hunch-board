import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { HUNCH_SKILL } from "@/core/skills/skill";
import { GITHUB_REPO } from "@/lib/findHunch";

import { writeFiles } from "./files";

interface Result {
  ok: boolean;
  text: string;
}

export const HUNCH_BLOCK = `<!-- hunch -->
This project uses Hunch Board. The plan lives in \`board.hunch\` (and \`boards/\` for a board inside a box), with its files in \`assets/\`. Read \`.claude/skills/hunch/SKILL.md\` before you change a board. Check it with \`npx hunch-board check --json\`, or \`node .hunch/hunch.mjs check --json\` when that file is in the folder. The public CLI and the skill are at ${GITHUB_REPO}.
<!-- /hunch -->
`;

const HUNCH_MD = `# Hunch Board

This folder has a \`board.hunch\`: the plan of this project, as a board anyone can edit. Files on it live in \`assets/\`.

- Read \`.claude/skills/hunch/SKILL.md\` before you change a \`.hunch\` file.
- Check the drawing: \`npx hunch-board check --json\`
- The same CLI, with no install: \`node .hunch/hunch.mjs check --json\`
- Skill, CLI and examples: ${GITHUB_REPO}
- The board in the browser: https://www.hunchboard.dev
`;

const CURSOR_RULE = `---
description: This project uses Hunch Board. Read the skill before changing a .hunch file.
globs: "**/*.hunch"
alwaysApply: false
---

This project uses Hunch Board. The plan is \`board.hunch\`. Read \`.claude/skills/hunch/SKILL.md\` before you change it. Check with \`npx hunch-board check --json\`.
`;

const STARTER = `title Project
`;

/** The one-file CLI, from this process when it is the bundle, or from public/hunch.mjs in the app repo. */
export function readBundledCli(): string | null {
  const self = fileURLToPath(import.meta.url);
  if (basename(self) === "hunch.mjs" && existsSync(self)) return readFileSync(self, "utf8");
  for (const path of [resolve(dirname(self), "../../public/hunch.mjs"), resolve(process.cwd(), "public/hunch.mjs")]) {
    if (existsSync(path)) return readFileSync(path, "utf8");
  }
  return null;
}

/**
 * Makes a project folder findable by any assistant that opens it.
 * An existing board.hunch, HUNCH.md and Cursor rule are left as they are.
 * The skill is written again, so the language stays current.
 */
export function init(root: string): Result {
  const files: Record<string, string> = { ".claude/skills/hunch/SKILL.md": HUNCH_SKILL };
  if (!existsSync(resolve(root, "board.hunch"))) files["board.hunch"] = STARTER;
  if (!existsSync(resolve(root, "HUNCH.md"))) files["HUNCH.md"] = HUNCH_MD;
  if (!existsSync(resolve(root, ".cursor/rules/hunch.mdc"))) files[".cursor/rules/hunch.mdc"] = CURSOR_RULE;
  for (const name of ["AGENTS.md", "CLAUDE.md"] as const) {
    const path = resolve(root, name);
    const current = existsSync(path) ? readFileSync(path, "utf8") : name === "CLAUDE.md" ? "# Claude\n\nFollow AGENTS.md.\n" : "# Agents\n";
    if (!current.includes("<!-- hunch -->")) files[name] = `${current.trimEnd()}\n\n${HUNCH_BLOCK}`;
  }
  const cli = readBundledCli();
  const dot = resolve(root, ".hunch");
  const dotIsFile = existsSync(dot) && !statSync(dot).isDirectory();
  if (cli && !dotIsFile) files[".hunch/hunch.mjs"] = cli;
  const changed = writeFiles(root, files);
  const kept = ["board.hunch", "HUNCH.md", ".cursor/rules/hunch.mdc"].filter((path) => existsSync(resolve(root, path)) && !changed.includes(path));
  const lines = [
    changed.length ? `Hunch Board is in this folder. Written:\n${changed.map((path) => `- ${path}`).join("\n")}` : "Hunch Board is already in this folder.",
    kept.length ? `Left as they were: ${kept.join(", ")}.` : "",
    dotIsFile ? "A file named .hunch is in the way. The board is board.hunch. Remove or rename that file so init can create the .hunch folder." : "",
    cli || dotIsFile ? "" : "The CLI file was not next to this command, so .hunch/hunch.mjs was not copied. npx hunch-board still runs the check.",
  ].filter(Boolean);
  return { ok: true, text: lines.join("\n") };
}
