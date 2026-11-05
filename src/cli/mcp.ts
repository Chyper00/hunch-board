import { check, readBoard, render, writeBoard, type Result } from "./commands";
import { cloneBoard, searchCommunity } from "./community";

/**
 * `hunch mcp`: a Model Context Protocol server over stdio, so an AI assistant
 * (Claude Code, Cursor, Codex…) reads, changes and draws the board, in the
 * person's own folder. It runs on
 * their machine; nothing goes to a server of Hunch's.
 */

export const VERSION = "1.1.0";

interface Request {
  jsonrpc: "2.0";
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

const TOOLS = [
  {
    name: "read_board",
    description: "Read the Hunch board of this project: board.hunch and the boards inside its boxes (boards/<key>.hunch). It says what is planned; files on it are named by their path, like assets/logo.png, so you can open them.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "write_board",
    description: "Replace one board file with new Hunch text. It is written only when every line reads; otherwise the errors come back. Keep the existing keys so the drawing keeps its positions.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "The file, e.g. board.hunch or boards/api.hunch" },
        text: { type: "string", description: "The whole new content of the file, in the Hunch language" },
      },
      required: ["path", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "check_board",
    description: "Read every .hunch file. A line that doesn't read fails the check; a file the board names and the folder doesn't have is a warning. Pass json:true for { ok, issues }.",
    inputSchema: { type: "object", properties: { json: { type: "boolean", description: "Return { ok, issues } instead of text" } }, additionalProperties: false },
  },
  {
    name: "render_board",
    description: "Draw one board as SVG and return the markup. The background is transparent and the ink follows the page, so a chat can show it. No network. Pass path for a file other than board.hunch.",
    inputSchema: { type: "object", properties: { path: { type: "string", description: "The file, e.g. board.hunch or boards/api.hunch. Defaults to board.hunch." } }, additionalProperties: false },
  },
  {
    name: "search_community",
    description: "Find public boards other people shared, to learn from or start from, before designing something from nothing. Returns names you can pass to clone_board.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "What you are looking for, e.g. telegram bot" }, tag: { type: "string" } }, additionalProperties: false },
  },
  {
    name: "clone_board",
    description: "Copy a public board into a new folder here. Ask the person first if they want to start from it. Nothing is overwritten.",
    inputSchema: { type: "object", properties: { name: { type: "string", description: "The name from search_community, or a link" }, folder: { type: "string", description: "Folder inside this project. Defaults to the name." } }, required: ["name"], additionalProperties: false },
  },
];

function run(root: string, name: string, args: Record<string, unknown>): Result | Promise<Result> {
  switch (name) {
    case "read_board":
      return readBoard(root);
    case "write_board":
      return typeof args.path === "string" && typeof args.text === "string" ? writeBoard(root, args.path, args.text) : { ok: false, text: "write_board needs a path and a text." };
    case "check_board":
      return check(root, { json: args.json === true });
    case "render_board":
      return render(root, typeof args.path === "string" && args.path.trim() ? args.path : undefined);
    case "search_community":
      return searchCommunity(typeof args.query === "string" ? args.query : "", typeof args.tag === "string" ? args.tag : undefined);
    case "clone_board":
      return cloneBoard(root, typeof args.name === "string" ? args.name : "", typeof args.folder === "string" ? args.folder : undefined);
    default:
      return { ok: false, text: `No tool called ${name}.` };
  }
}

/** One JSON-RPC message in, one answer out (null for notifications). */
export async function handleMessage(root: string, message: Request): Promise<Record<string, unknown> | null> {
  const reply = (result: unknown) => ({ jsonrpc: "2.0", id: message.id ?? null, result });
  const fail = (code: number, text: string) => ({ jsonrpc: "2.0", id: message.id ?? null, error: { code, message: text } });
  if (message.id === undefined) return null;
  switch (message.method) {
    case "initialize":
      return reply({
        protocolVersion: typeof message.params?.protocolVersion === "string" ? message.params.protocolVersion : "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "hunch", version: VERSION },
        instructions: "Hunch Board keeps what is being planned for this project in board.hunch: anything from boxes and arrows to UML, decisions, screens, checklists and files. Read the board before you work, keep it up to date with write_board when the plan changes, and show it with render_board. Before designing something from nothing, search_community may have a board to start from.",
      });
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call": {
      const name = String(message.params?.name ?? "");
      const args = (message.params?.arguments ?? {}) as Record<string, unknown>;
      try {
        const result = await run(root, name, args);
        return reply({ content: [{ type: "text", text: result.text }], isError: !result.ok });
      } catch (error) {
        return reply({ content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }], isError: true });
      }
    }
    default:
      return fail(-32601, `Method not found: ${message.method}`);
  }
}

/** Reads newline-delimited JSON-RPC from stdin and answers on stdout until stdin closes. */
export function serve(root: string): Promise<void> {
  return new Promise((done) => {
    let buffer = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      buffer += chunk;
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        let request: Request;
        try {
          request = JSON.parse(line) as Request;
        } catch {
          process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })}\n`);
          continue;
        }
        void handleMessage(root, request).then((answer) => {
          if (answer) process.stdout.write(`${JSON.stringify(answer)}\n`);
        });
      }
    });
    process.stdin.on("end", () => done());
  });
}
