import { main } from "./main";

// The bundled entry point (public/hunch.mjs): run and exit with the command's code.
main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(2);
  },
);
