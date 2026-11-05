# Changelog

## 1.1.0

### Added

- `hunch drift` names the services the code depends on that no board shows. It reads `package.json`, `requirements*.txt`, `pyproject.toml`, `go.mod`, `Gemfile`, `composer.json`, `pom.xml`, `build.gradle` and compose files. `--base <ref>` only looks at what a change adds. It reads manifests, not the code, and knows a fixed list of services.
- A GitHub Action, `action.yml`, that comments on a pull request when it adds such a service.
- `hunch render --mermaid` prints the board as a Mermaid flowchart, which GitHub draws in a README or a pull request.
- The source of the CLI, in `src/`. `npm run build` makes `hunch.mjs` from it.

### Fixed

- `say`, `payload` and `when` failed when two arrows joined the same boxes. They now take the arrow the flow walks, and accept a label when the flow walks both: `say a -> b "label" "sentence"`.
- A step note on two such arrows was saved as text the parser refused.
- Long notes in the SVG ran across the board on one line. They now wrap, and the box grows.

## 1.0.0

One board for anything. The CLI is `init`, `check`, `render`, `search`, `clone` and `mcp`. The benchmark, the `pack` and `questions` commands and the import checks were removed.
