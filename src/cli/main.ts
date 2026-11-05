import { resolve } from "node:path";

import { check, render } from "./commands";
import { cloneBoard, searchCommunity } from "./community";
import { init } from "./discover";
import { drift } from "./drift";
import { serve, VERSION } from "./mcp";

/**
 * hunch: the board next to the code, from the terminal.
 */
const USAGE = `hunch ${VERSION}

  hunch init [--root <folder>]                     the skill, AGENTS.md, CLAUDE.md and HUNCH.md, so an assistant finds the board
  hunch check [board.hunch] [--root <folder>] [--json]   does every line read, and is every file on the board in the folder. --json is for an assistant
  hunch render [board.hunch] [--mermaid]           print the board as SVG with a transparent background, or as Mermaid for a README
  hunch drift [--base <ref>] [--root <folder>] [--json]  services the code depends on that the board does not show. --base only looks at what a change adds
  hunch search <words> [--tag <tag>]            find boards in the community to start from
  hunch clone <name or link> [folder]              copy a public board into a new folder
  hunch mcp [--root <folder>]                      run an MCP server (stdio) for your AI assistant

The project folder holds board.hunch and its files in assets/. https://www.hunchboard.dev`;

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

export async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  const root = resolve(option(rest, "--root") ?? ".");
  const positional = rest.filter((arg, index) => !arg.startsWith("--") && rest[index - 1] !== "--root");
  switch (command) {
    case "init": {
      const result = init(root);
      console.log(result.text);
      return result.ok ? 0 : 1;
    }
    case "check": {
      const result = check(root, { board: positional[0], json: rest.includes("--json") });
      console.log(result.text);
      return result.ok ? 0 : 1;
    }
    case "render": {
      const result = render(root, positional[0], { mermaid: rest.includes("--mermaid") });
      (result.ok ? console.log : console.error)(result.text);
      return result.ok ? 0 : 2;
    }
    case "drift": {
      const result = drift(root, { base: option(rest, "--base"), json: rest.includes("--json") });
      (result.failed && !rest.includes("--json") ? console.error : console.log)(result.text);
      return result.ok ? 0 : result.failed ? 2 : 1;
    }
    case "search": {
      const result = await searchCommunity(positional.filter((word) => word !== option(rest, "--tag")).join(" "), option(rest, "--tag"));
      (result.ok ? console.log : console.error)(result.text);
      return result.ok ? 0 : 2;
    }
    case "clone": {
      const result = await cloneBoard(root, positional[0] ?? "", positional[1]);
      (result.ok ? console.log : console.error)(result.text);
      return result.ok ? 0 : 2;
    }
    case "mcp":
      await serve(root);
      return 0;
    case "--version":
    case "version":
      console.log(VERSION);
      return 0;
    default:
      console.log(USAGE);
      return command && command !== "help" && command !== "--help" ? 2 : 0;
  }
}
