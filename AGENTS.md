# Agents

This repository is the public CLI and skill for Hunch Board (https://www.hunchboard.dev), the `board.hunch` file.

Read `SKILL.md` before you change a `.hunch` file. The example board is `examples/shop/board.hunch`. Check it with `node hunch.mjs check --json`.

This is not the web app. The app stays in its own repository. `src/` and `SKILL.md` are copied from there, so a fix made only here is lost in the next copy. `hunch.mjs` is built from `src/` with `npm run build`.
