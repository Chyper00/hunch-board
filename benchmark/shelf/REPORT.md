# Report: Shelf, with Hunch and without Hunch

Date: 2026-10-10. Hunch commit used to generate the pack: `fc97369`.

## The test

The app: **Shelf**, lending books in an office. It is a Node.js monolith with a JSON API and SQLite, using only the modules that come with Node 24 (`node:http`, `node:sqlite` and `node:test`), with no npm packages.

| | With Hunch | Without Hunch |
| --- | --- | --- |
| What the agent received | The 41 Build with AI files (destination "Coding assistant"), generated from a board with the system and, inside the monolith box, the code diagram in clean architecture. The board left zero questions for the AI. | A paragraph with the idea and the main rules (one book at a time, at most 3 per person, 14 days). |
| Shared instructions | Work only in its own folder, do not ask (record the choices in `DECISIONS.md`), only Node modules, the port from the `PORT` variable. | The same |

Two agents of the same model, in parallel, neither knowing about the other. The scoring was done afterwards, by me.

## Result

| | With Hunch | Without Hunch |
| --- | --- | --- |
| **Agent tokens** | **79,661** | **42,189** |
| Tool calls | 15 | 6 |
| Time | 4 min 05 s | 3 min 37 s |
| The agent's own tests | 27 passing | 15 passing |
| Code (without tests) | 510 lines in 19 files | 258 lines in 4 files |
| Tests (lines) | 380 | 227 |
| Black-box probe: behavior (16 scenarios) | 16 of 16 | 16 of 16 |
| Probe: HTTP status codes from the contract (2 scenarios) | 2 of 2 | 0 of 2 (409 instead of 422, 404 instead of 403) |
| Shape of the code (`hunch check`) | 0 imports outside the shape | Does not apply: there are no layers |
| Where the rules live | In the domain (`src/domain/loan.js`); SQL only in the adapters | Rules and SQL in the same file (`src/shelf.js`) |
| Decisions the agent made alone | 19 | 11 |
| Board updated by the agent | Yes: it added the two extra pieces it created, and the board still reads | Does not apply |

The probe (`eval/probe.mjs`) starts each app as a process, with a fresh database, and runs the same scenarios: add a book, validation, permissions, borrow with a due date in 14 days, a book already borrowed, the limit of 3, return by someone else, return twice, "my loans", overdue and a call with no identity.

## The decisions, one by one

**Without Hunch (11):** 5 were **product** decisions the Hunch board had already made:
- how the API knows who is calling;
- who may return a book;
- whether the book list is open to everyone;
- how the tests control the clock;
- what "my loans" shows.

The other 6 were implementation: the database path, the tests folder, a transaction.

**With Hunch (19):**
- **3 came from contradictions inside the Hunch pack,** and they are defects in Hunch:
  - the acceptance tests used a Bearer token, while the board's decision says `X-Member-Id`;
  - two tasks said "no endpoint attached" to stories that had an endpoint;
  - the tasks cited `server/src/routes/*.ts` in a JavaScript project under `src/`.
- **1 came from an inconsistency in my board:** the books endpoint said `member`, and the permissions matrix let the librarian read.
- **The rest were implementation:** the text of the 401 and 403 errors, the shape of list items, reading ids, the order of the checks, logs, a Dockerfile, the request body limit.

None of them was an invented product rule.

## So was Hunch better?

**On the result, yes, with caveats.** Both apps work and meet every business rule. The one with Hunch:

- follows the API contract to the letter (status codes, routes and the error shape);
- has almost twice the tests, one per story plus the permission and data cases;
- separates the rules from the database the way the architecture asked, and the check confirms it;
- left the drawing up to date;
- did not have to invent a product rule.

The paragraph is smaller, more direct and equally correct on behavior.

**On cost, no:** the agent with Hunch spent **1.9 times more tokens** and 13% more time, because it read 41 files and wrote more code and tests.

**What that means:**
- **For a 250-line app,** a well-written paragraph is enough. Hunch does not change the behavior; it changes the discipline: the contract, the tests, the architecture and the drawing kept in step.
- **Hunch is worth it when the behavior has to match something agreed beforehand:** an API another team consumes, an architecture the team decided, rules that cannot be "chosen by the AI". There, the 5 product items the paragraph agent decided alone become a risk.
- **The Hunch pack still has friction.** The 3 contradictions cost the agent time and tokens. Fixed after this run (see below), the next run should spend less.

## Defects in Hunch found and fixed

**While setting up the test (before running the agents):**
- The boards inside the boxes did not go into the pack or the prompt. They do now, with "Where code goes in…".
- The pack ignored the stack: Vitest, Playwright and Prisma showed up on a `node:test` stack with no screens. The runner, the language of the files, the browser test and Prisma now follow the stack.
- Smaller details:
  - an ADR name ending in a hyphen;
  - the instruction to run `npx depcruise` now says what to do when installing is not allowed;
  - a monolith becomes `src/` in the conventions.

**From the agent with Hunch (after the run):**
- The acceptance tests invented a Bearer token. They now use a `signedInAs(role)` helper that follows the board's decision.
- Stories with no endpoint of the same name stayed "with no endpoint". The story's id in the path (`/loans/mine`) now attaches too.
- The fixed paths `server/src/routes/*.ts` now follow the stack's language, with a note that "Where code goes" is what decides.

## Limits of this test

- One run on each side, with one model, and models vary from one run to the next.
- The board was written by me, and I know Hunch well. A worse board would give another result.
- The person who scored it also built Hunch. To compensate, the probe separates what is behavior (it applies to both) from what is the contract (only the board defined it).
- The tokens are only those of the agent that built. Drawing the board in Hunch spends no tokens: it is the person's work, and it was not measured.

## Files

- `design/`: the board (`board.hunch` and `boards/app.hunch`)
- `with-hunch/`: the Hunch pack and the app the agent built
- `simple/`: the prompt and the app the agent built
- `eval/probe.mjs` and `eval/result-*.json`: the probe and the results
