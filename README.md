# Hunch Board

Hunch Board (hunchboard.dev): `board.hunch` files. Draw the system, the shape of the code and the screens, then hand that plan to the AI you already use. This repository is the CLI, the skill and a real `board.hunch` an assistant can read without opening the site.

The board itself runs at <https://www.hunchboard.dev>.

## Run the check

Node 20 or newer. Nothing else to install.

```bash
npx hunch-board init
npx hunch-board check --json
```

`init` writes `board.hunch`, copies the skill to `.claude/skills/hunch/SKILL.md`, and adds a note to `AGENTS.md` and `CLAUDE.md`, so the next assistant that opens the folder finds Hunch Board.

The same file, with no package registry:

```bash
node hunch.mjs init
node hunch.mjs check --json
node hunch.mjs questions
node hunch.mjs render
node hunch.mjs pack
node hunch.mjs mcp
```

## What is in this repository

| File | What it is |
| --- | --- |
| `hunch.mjs` | The CLI. One file. `check --json` prints `{ ok, issues }` for an assistant to correct the lines. |
| `SKILL.md` | How to read and write a `.hunch` file. |
| `HUNCH.md` | The short note `init` leaves in a project. |
| `examples/shop/board.hunch` | A board: a shop, one database, one flow. |

A call at runtime is `=>`. An import, only on a code board, is `rule a -> b`. The one-page grammar is <https://www.hunchboard.dev/grammar>. How to point Claude, ChatGPT, Cursor and Codex at a board is <https://www.hunchboard.dev/use>.

## Benchmark

The same app, built three ways and measured from the outside: [`benchmark/RESULTS.md`](benchmark/RESULTS.md). The full write-up of each run is `benchmark/spend/REPORT.md`, `benchmark/clinic/REPORT.md` and `benchmark/shelf/REPORT.md`.

## MCP

The server runs on your machine and reads the `board.hunch` in the folder you opened.

```bash
claude mcp add hunch-board -- npx hunch-board mcp
```

```json
{
  "mcpServers": {
    "hunch-board": {
      "command": "npx",
      "args": ["hunch-board", "mcp"]
    }
  }
}
```

Tools: `read_board`, `write_board`, `check_code` (`json: true` for `{ ok, issues }`), `open_questions`, `render_board`, `build_pack`.

## Names

Search for **Hunch Board** and **board.hunch**. The npm package name is `hunch-board`. Other projects named Hunch are not this one.
