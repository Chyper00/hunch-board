# Report: Clinic, with Hunch, with a plain prompt and with grill-me

Date: 2026-10-10. Hunch commit used to generate the pack: `112144b` (already including the fixes the Shelf benchmark found).

## The test

The app: **Clinic**, the calendar of a small clinic. Doctors open slots of 15 to 120 minutes, with no overlap; patients book (at most 2 upcoming appointments) and cancel up to 24 hours before; the doctor cancels up to the start. It is a Node.js monolith with a JSON API and SQLite, using only the modules that come with Node 24. Inside the app box, the board draws hexagonal architecture.

| | With Hunch | A paragraph | Grill-me |
| --- | --- | --- | --- |
| What the agent received | The Build with AI pack (41 files; `AGENTS.md` alone already holds the whole spec and the patterns) and the one-line prompt. The board left zero questions. | A paragraph with the idea and the main rules. | The same paragraph and the [grill-me](https://github.com/mattpocock/skills) skill (MIT license). Before building, it interviewed "the person". |
| Who answered the questions | Nobody: the agent was not allowed to ask. | Nobody. | A second agent in the person's role, who only knew the Hunch board (`design/`) and answered "yes" to the recommendation when the board said nothing. |
| Shared instructions | Work only in its own folder, record choices in `DECISIONS.md`, only Node modules, `PORT` and `DB_PATH`. | The same | The same, after the interview |

The simulated person knows exactly what the board knows. The comparison between Hunch and grill-me therefore measures **how** the knowledge reaches the AI (a ready pack, or an interview), not who knows more.

## Result

| | With Hunch | A paragraph | Grill-me |
| --- | --- | --- | --- |
| **Agent tokens** | **92,963** | **48,377** | **283,821** (187,281 in the interview and 96,540 building) |
| Tokens of the simulated person | - | - | 115,970 |
| Questions the person answered | 0 | 0 | 39, in 3 rounds |
| Tool calls | 17 | 11 | 24 |
| Time | 5 min 09 s | 2 min 14 s | 11 min 11 s |
| Probe: behavior (29 scenarios) | 28 | 29 | 29 |
| Probe: status codes from the board's contract (10) | 10 | 4 | 10 |
| Robustness: bad input (9 cases) | 9, with no 5xx | 9, with no 5xx | 9, with no 5xx |
| The agent's own tests | 54 passing | 23 passing | 53 passing |
| Line / branch / function coverage | 96.7% / 96% / 94.8% | 98.6% / 94.8% / 88.6% | 97.5% / 96.9% / 96.9% |
| Code (without tests) | 578 lines in 20 files | 376 lines in 4 files | 826 lines in 26 files |
| Largest file | 141 lines | 214 lines | 99 lines |
| Average complexity per function | 2.5 | 3.5 | 2.7 |
| Functions longer than 40 lines | 0 | 0 | 2 |
| Duplicated lines | 5.5% | 5% | 7.1% |
| Imports outside the hexagonal shape | 0 of 19 | Does not apply: 4 files, no layers | 0 of 19 |
| Decisions made alone | 26 | 22 | 20 |
| What it built beyond what the board asked | Nothing | User signup (`POST /users`), because the prompt did not say how users exist | Delete a slot, filters on `GET /slots`, a rule about overlapping patient appointments, slots on multiples of 5 minutes |

The numbers come from `node benchmark/tools/measure.mjs benchmark/clinic` and from the probe `eval/probe.mjs`. What each measure means is in [`../README.md`](../README.md).

## What the numbers say

**Behavior: all three get the rules right.** The only scenario Hunch failed ("a patient does not see the doctor's calendar") was caused by a pattern **I** wrote into Hunch on this round: "who may call" widened access from the permissions table. The agent followed the pattern exactly. The defect was Hunch's and is already fixed (see below).

**Contract: Hunch and grill-me tie at 10 of 10; the paragraph gets 4.** Without the board, the paragraph agent chose reasonable but different codes: 400 instead of 422 for an invalid slot, 404 instead of 403 for someone who may not cancel. Whoever consumes the API notices that difference.

**Cost: Hunch costs 1.9 times the paragraph; grill-me, 5.9 times, plus the person.** The interview alone spent more tokens than the whole build with Hunch. For the person, that was 39 questions in 3 rounds, and each round required reading, thinking and answering. With Hunch, that work is drawing the board, which was not measured in tokens (not here, and not on Shelf).

**Scope: only Hunch built exactly what was asked.** Grill-me recommends an answer for each question, and the person accepted what the board did not say. Four things nobody asked for came in: deleting a slot, filters on the list, overlapping patient appointments and slots on multiples of 5 minutes. It is the same "inventing" Hunch tries to avoid, with a "yes" from the person in the middle.

**Quality: all three are fine.** Nobody has a syntax error, a file mixing HTTP and SQL, or a 5xx on bad input. Line coverage is over 94% on all three. The differences are in shape:
- **The paragraph** puts everything in 4 files (the largest at 214 lines) and has the highest average complexity.
- **Hunch and grill-me** follow the hexagonal shape with no import out of place. On grill-me, the shape came from the person, who read it on the board.
- **Grill-me** wrote more code (826 lines, because of the extra scope) and has the only functions over 40 lines.

**Decisions: Hunch did not reduce the count.** It was 26 against 22 and 20. Read one by one:
- **Many repeat the pack's patterns** ("following the pattern…", "the 500 message is…"). They are not new choices: they record what the agent applied.
- **None is an invented product rule.**
- **On the paragraph, about half are product:** how users come to exist, whether the slot list is public, what the calendar and "my appointments" show, whether a slot can be deleted and whether someone who may not see an appointment gets a 404. On Hunch and grill-me, the board or the person answered that.

## So which was better?

- **To reach the agreed contract, Hunch and grill-me tie on the result.** Hunch gets there with a third of the tokens, half the time, no question to the person and no extra scope. In exchange, someone has to draw the board first.
- **For an app that only has to work, the paragraph is still the cheapest.** It got every behavior right with half of Hunch's tokens. What it does not guarantee is what was agreed with whoever will use the API, or the shape of the code.
- **Grill-me is good for finding out what the person wants,** and its interview found the same gaps the board closes. But it is expensive, it tires the person (39 answers) and it tends to add scope when the person accepts the recommendations. The two complement each other: the interview to write the board the first time, and the board for every time after, without repeating the interview.

## Defects in Hunch found and fixed

**Before the run, looking at Shelf** (commit `112144b`):
- **The pack made the agent open dozens of files.** `AGENTS.md` now carries the whole spec (stories, data, API, rules, permissions, decisions and the shape of the code) and a **patterns** section for what every project repeats. Empty documents leave the pack.
- **`seed` kept only one row per entity.** On Shelf, the partner "Ada" disappeared from the pack. Every row is kept now.
- **The JSON examples were text.** It wrote `"bookId": "1"` for an integer, and that led the Shelf agent to accept ids as text. Numbers, booleans, lists and enum values come out now.
- **An action in the path** (`POST /appointments/{id}/cancel`) was treated as an endpoint with no body, and became 3 "questions".
- **An endpoint could not accept two roles.** `[auth=patient,doctor]` works now.

**From the run** (commit `f267f03`):
- **The "who may call" pattern widened access.** It was the cause of Hunch's only failure. Only the endpoint's roles are included now, and the permissions table says which rows each one sees.
- **The story "Doctor cancels an appointment" did not attach to `/appointments/{id}/cancel`.** A word from the story's id or title now attaches too. On the checkout example board, the story "see paid orders" attached to `GET /orders`.
- **A story with no endpoint and no screen did not show up as a question.** It now appears in `OPEN_QUESTIONS.md` and in "what the AI would have to guess".

**From my board** (not from Hunch): the board gave no message for the doctor who cancels after the start, and the agent reused the 24-hour message.

## Limits of this test

- **One run on each side, with one model,** and results vary from run to run.
- **The simulated person is an agent that read the board.** A real person would get things wrong, change their mind or say "either way". By rule, they accepted the recommendation when the board said nothing, and that favors grill-me's extra scope.
- **Grill-me's tokens are the sum of what each round reported.** The interview was several messages to the same agent.
- **Drawing the board is not measured,** neither in tokens nor in the person's time.
- **The person who drew the board, wrote the probe and scored it also built Hunch.** To compensate, the probe separates behavior (it applies to everyone) from the contract (only the board defined it), and the robustness cases do not come from the board.
- **The quality measures are approximate,** counted with regular expressions and no packages, but they are the same for all three.

## Files

- `design/`: the board (`board.hunch` and `boards/app.hunch`)
- `with-hunch/`: the Hunch pack and the app the agent built
- `simple/`: the prompt and the app
- `grill-me/`: the prompt, the skill, the interview (`GRILL.md`), the plan (`PLAN.md`) and the app
- `eval/probe.mjs` and `eval/result-*.json`: the probe and the results
- `runs.json` and `metrics.json`: the numbers
