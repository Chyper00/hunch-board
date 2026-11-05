# Hunch Board

One free board for planning a project: boxes and arrows, UML, decisions, flowcharts, event storming, C4, screens, checklists, tables, code, images and any other file, with the logos of 200+ technologies. It is one text file, `board.hunch`, so you and the AI you already use read and change the same thing.

The board itself runs at <https://www.hunchboard.dev/board>, with no account. This repository is the CLI, the skill and an example board an assistant can read without opening the site.

## Run it

Node 20 or newer. Nothing else to install.

```bash
npx hunch-board init
npx hunch-board check --json
```

`init` writes `board.hunch`, copies the skill to `.claude/skills/hunch/SKILL.md`, and adds a note to `AGENTS.md` and `CLAUDE.md`, so the next assistant that opens the folder finds the board.

The same file, with no package registry:

```bash
node hunch.mjs init
node hunch.mjs check --json
node hunch.mjs render
node hunch.mjs render --mermaid
node hunch.mjs drift
node hunch.mjs search telegram
node hunch.mjs clone ride-hailing-like-uber
node hunch.mjs mcp
```

## What is in this repository

| File | What it is |
| --- | --- |
| `hunch.mjs` | The CLI. One file. `check --json` prints `{ ok, issues }` for an assistant to correct the lines. |
| `SKILL.md` | How to read and write a `.hunch` file. |
| `HUNCH.md` | The short note `init` leaves in a project. |
| `examples/shop/` | A project: a board with a decision, a UML class, a checklist and a file, and a board inside one of its boxes. |
| `src/` | The source of the CLI. `npm ci && npm run build` makes `hunch.mjs`, and the CI checks they match. |
| `action.yml` | The GitHub Action for `hunch drift`. |
| `CHANGELOG.md` | What changed in each version. |

The one-page grammar is <https://www.hunchboard.dev/grammar>. Files on a board live in `assets/` next to it, and the board keeps their path.

Any box can open into a board of its own: `inside api boards/api.hunch` on the outer file is the link. Any technology works as a type: `alerts: Telegram "Alerts"`.

## Keep the board true

`hunch drift` names the services the code depends on that no board shows. It reads `package.json`, `requirements*.txt`, `pyproject.toml`, `go.mod`, `Gemfile`, `composer.json`, `pom.xml`, `build.gradle` and compose files, so it works across languages. It reads manifests, not the code, so a raw HTTP call is not seen, and it knows a fixed list of 22 services.

To hear about it on each pull request, add `.github/workflows/hunch.yml`:

```yaml
name: Hunch Board
on: pull_request
permissions:
  contents: read
  pull-requests: write
jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Chyper00/hunch-board@v1
```

It comments only when the pull request adds such a service. Set `fail-on-drift: "true"` under `with:` to fail the check too.

## Community

People share boards at <https://www.hunchboard.dev/community>: Uber, WhatsApp, Netflix, RAG pipelines, SaaS starters and practice for system design interviews. `hunch search` finds them and `hunch clone` copies one into a new folder.

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

Tools: `read_board`, `write_board`, `check_board` (`json: true` for `{ ok, issues }`), `render_board`, `search_community`, `clone_board`.

## Names

Search for **Hunch Board** and **board.hunch**. The npm package name is `hunch-board`. Other projects named Hunch are not this one.
