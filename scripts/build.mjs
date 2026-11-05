#!/usr/bin/env node
/** Makes hunch.mjs from src/. The CI checks that the committed file is what this makes. */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../hunch.mjs");

await build({
  entryPoints: [resolve(here, "../src/cli/cli.ts")],
  outfile: out,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  alias: { "@": resolve(here, "../src") },
  banner: { js: "#!/usr/bin/env node\n// Hunch CLI: https://www.hunchboard.dev. Built from src/cli; do not edit." },
  minify: true,
  legalComments: "none",
  logLevel: "warning",
});
console.log(`Built ${out}`);
