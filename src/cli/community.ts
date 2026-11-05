import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import type { Result } from "./commands";

/** The community, from the terminal and from an AI assistant. Public boards only; no account needed. */

const site = () => (process.env.HUNCH_SITE ?? "https://www.hunchboard.dev").replace(/\/$/, "");

/** A slug as it is on the site, or the end of a link to it. */
function slugOf(value: string): string | null {
  const slug = value.trim().replace(/^https?:\/\/[^/]+\/b\//, "").replace(/[/?#].*$/, "");
  return /^[a-z0-9][a-z0-9-]{1,89}$/.test(slug) ? slug : null;
}

export async function searchCommunity(query: string, tag?: string): Promise<Result> {
  const params = new URLSearchParams({ ...(query ? { q: query } : {}), ...(tag ? { tag } : {}) });
  const response = await fetch(`${site()}/api/community?${params}`);
  if (!response.ok) return { ok: false, text: "The community can't be reached." };
  const { boards } = (await response.json()) as { boards: Array<{ slug: string; title: string; description: string; tags: string[]; likes: number; clones: number; author: string }> };
  if (!boards.length) return { ok: true, text: "Nothing like that yet." };
  return {
    ok: true,
    text: boards.map((board) => `${board.slug}\n  ${board.title}${board.description ? `: ${board.description}` : ""}\n  by ${board.author} · ${board.likes} likes · ${board.clones} clones${board.tags.length ? ` · ${board.tags.join(", ")}` : ""}`).join("\n"),
  };
}

/** Writes a public board into a new folder. Only .hunch files, only inside it, and never over what is there. */
export async function cloneBoard(root: string, value: string, into?: string): Promise<Result> {
  const slug = slugOf(value);
  if (!slug) return { ok: false, text: `Not a board on Hunch: ${value}` };
  const response = await fetch(`${site()}/b/${slug}/files.json`);
  if (!response.ok) return { ok: false, text: `No public board called ${slug}.` };
  const { title, files } = (await response.json()) as { title: string; files: Record<string, unknown> };
  const folder = resolve(root, into ?? slug);
  if (!folder.startsWith(resolve(root))) return { ok: false, text: `Not a folder inside this one: ${into}` };
  const safe = Object.entries(files).filter((entry): entry is [string, string] => typeof entry[1] === "string" && /^[\w./-]+\.hunch$/.test(entry[0]) && !entry[0].startsWith("/") && !entry[0].split("/").includes(".."));
  if (!safe.length) return { ok: false, text: `${slug} has no board in it.` };
  const taken = safe.map(([path]) => path).filter((path) => existsSync(join(folder, path)));
  if (taken.length) return { ok: false, text: `Already there, nothing was written: ${taken.join(", ")}` };
  for (const [path, text] of safe) {
    const target = join(folder, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return { ok: true, text: `Cloned "${title}" into ${into ?? slug}: ${safe.map(([path]) => path).join(", ")}` };
}
