# Report: Spend, Hunch v0.09 against the production release, a plain prompt and grill-me

Date: 2026-10-10. The v0.09 pack came from commit `25694ab`. The production pack came from commit `3ca8931` (`main`, generated with that code, in a separate copy of the repository).

## The test

The app: **Spend**, expense reimbursement in a small company.
- **The cycle:** a person creates an expense as a draft and submits it; the team manager approves or rejects it (with a reason) up to 500.00; above that, only finance decides; finance pays.
- **The limits:** an expense is from 0.01 to 10,000.00 and cannot be in the future; the monthly cap is 2,000.00 per person, not counting drafts and rejections.
- **The shape:** a Node.js monolith with a JSON API and SQLite, using only the modules that come with Node 24. Inside the app box, the board draws onion architecture.

| | Hunch v0.09 | Hunch in production | A paragraph | Grill-me |
| --- | --- | --- | --- | --- |
| What the agent received | The v0.09 pack (46 files): `AGENTS.md` with the spec and the patterns, 28 contract tests already written, the harness that starts the app, the error codes and `scripts/check-shape.mjs`. | The pack the production release generates from the same board (43 files), with two open questions caused by defects that v0.09 fixes. | A paragraph with the idea and the main rules. | The same paragraph and the [grill-me](https://github.com/mattpocock/skills) skill. Before building, it interviewed "the person": a second agent that only knew the board (`design/`) and accepted the recommendation when the board said nothing. Run after the other three, with the same protocol as Clinic. |

The same board (`design/`) generated both packs and left zero questions in v0.09. The agents were the same model, ran in parallel and received the same instructions.

## Result

| | Hunch v0.09 | Hunch in production | A paragraph | Grill-me |
| --- | --- | --- | --- | --- |
| **Agent tokens** | **82,356** | **97,372** | **43,746** | **223,530** (133,852 in the interview and 89,678 building) |
| Tokens of the simulated person | - | - | - | 116,627 |
| Questions the person answered | 0 | 0 | 0 | 36, in 3 rounds |
| Tool calls | 13 | 20 | 5 | 15 |
| Time | 3 min 37 s | 5 min 37 s | 1 min 45 s | 6 min 19 s, not counting the end of the interview (see the limits) |
| Probe: behavior (34 scenarios) | 34 | 34 | 31 | 34 |
| Probe: status codes from the board's contract (12) | 12 | 12 | 7 | 12 |
| Robustness: bad input (9 cases) | 9, no 5xx | 9, no 5xx | 9, no 5xx | 9, no 5xx |
| Contract tests from the pack | 28 of 28 | it had none | it had none | it had none |
| The project's own tests | 54 (28 generated + 26 by the agent); 4 failed in one of four runs (see the defects) | 106 | 26 | 71 |
| Line / branch / function coverage | 99.1% / 94.3% / 98.5% | 97.1% / 95.9% / 94.3% | 95.2% / 85.6% / 100% | 97.8% / 94.0% / 95.2% |
| Code (without tests) | 558 lines in 19 files | 691 lines in 18 files | 372 lines in 3 files | 865 lines in 20 files |
| Longest function | 34 lines | 35 lines | 146 lines | 84 lines |
| Functions longer than 40 lines | 0 | 0 | 3 | 2 |
| Max / average complexity | 8 / 3.1 | 12 / 2.2 | 35 / 6.6 | 17 / 2.4 |
| Files that mix HTTP and SQL | 0 | 0 | 1 | 0 |
| Duplicated lines | 4.1% | 7.7% | 6.8% | 6.4% |
| Imports outside the onion shape | 0 of 19 | 0 of 18 | does not follow the folders | 0 of 16 |
| Decisions made alone | 7 | 24 | 14 | 24 |

## Is v0.09 better than the production release?

The criterion was written in the roadmap before the run: do not lose on behavior or on the contract, and spend fewer tokens or record fewer decisions, without making coverage or the shape worse.

- **Behavior and contract: a tie,** 34 of 34 and 12 of 12 on both.
- **Cost:** 15% fewer tokens, 36% less time, and 13 tool calls instead of 20.
- **Decisions: 7 instead of 24.** The 24 from the production release include:
  - the two open questions its pack left, from defects already fixed;
  - the whole list of error codes;
  - the 405 and 500 messages;
  - the order of the checks on each endpoint.

  v0.09 already fixes all of that.
- **Shape:** no break on either side.
- **Coverage:** lines (+2 points) and functions (+4.2) improved, but **branches fell 1.6 points** (95.9% to 94.3%). By the letter of the criterion, that is a regression, and it is recorded as one.

**Verdict: better, with that caveat.** The production release wrote 106 tests by hand, almost twice as many, and that shows up in the branches covered. v0.09 received 28 tests ready and wrote 26. It spent less and reached the same behavior.

## And against a paragraph?

- **Hunch wins on what was agreed.** The paragraph got 5 of the 12 status codes wrong (400 instead of 422, 404 instead of 403). It also let a manager create an expense and let a person see the approval queue, both of which the board forbids.
- **And on the shape of the code.** The paragraph has a function of 146 lines with complexity 35, a file that mixes HTTP and SQL, and 3 files in total.
- **The paragraph is still cheaper:** about half the tokens. The ratio (1.9x) is the same as Shelf and Clinic. v0.09 was cheaper than the previous Hunch release, not cheaper than a paragraph. The remaining cost follows the code and the tests the architecture asks for: 558 lines of code and 671 of tests, against 372 and 250.

## And against grill-me?

**Hunch wins.** Both reach 34 of 34 rules and 12 of 12 status codes, but:

- **Cost:** Hunch spends 2.7 times fewer agent tokens (82 thousand against 224 thousand), not counting the 117 thousand of the simulated person in grill-me.
- **The person:** with Hunch, they answer nothing; with grill-me, there were 36 questions in 3 rounds.
- **Code:** simpler with Hunch: longest function 34 lines against 84, max complexity 8 against 17, no function over 40 lines (grill-me has 2) and less duplication.
- **Coverage:** higher with Hunch on all three measures.
- **Decisions:** 7 against 24. The interview settled the product, but left the agent the error codes, the 401 and 405 messages and the order of the checks, which the Hunch pack already contains.

**This time, grill-me built nothing beyond the request.** The person refused the suggestions that went past the board: editing a draft, the payments list and `/me`. On Clinic, they had accepted 4. That depends on who answers, and with a real person it is hard to predict.

Grill-me is still good for finding out what the person wants when there is no board yet. When the board exists, the interview redoes in 36 questions what the pack already hands over.

## Defects in Hunch found and fixed

**While drawing the board** (commit `25694ab`):
- **A story could not find its entity** when only the path named it (`/expenses/{id}/submit`). The path now counts.
- **A `category` field with an enum was asked "which transitions are allowed?"** Now only a status field (status, state, stage) is asked.
- **The same gap appeared twice** in Build with AI.

**From the v0.09 agent** (commit `b6d43c0`):
- **The contract test for a 404 by id sent `reject` with no body,** which contradicted the order of the checks: the 400 would come first. The agent changed the app's order to pass the test. The test now sends a valid body.
- **The app the harness starts had no way to set the clock,** and the date-rule tests used the real date. `startApp({ now })` now passes `NOW` to the app, and the `AGENTS.md` pattern tells the clock to start from it.

**From the measurement** (commit `79d650b`):
- **The harness failed now and then.** On the first measurement, 4 of the 54 v0.09 tests failed, and on a repeat they failed again once in three runs. The test files run in parallel; the harness reserved a port, released it and only then started the app, so two files could take the same port, and it waited only 10 seconds without noticing the app had died. It now tries another port when the app dies, checks that the app itself answered, and if it does not start, fails with a clear message. With the new harness, the same app passed 6 of 6 runs. `metrics.json` keeps the measurement as it came out (50 of 54).

## Limits of this test

- **One run on each side, with one model.** The gain over the production release (15% of tokens) is inside what a second run could change. The difference in decisions (7 against 24) is too large to be only variation.
- **The person who drew the board, wrote the probe and scored it also built Hunch.** The probe separates behavior from the contract, and the robustness cases do not come from the board.
- **The three defects found by the v0.09 agent and by the measurement were fixed after the run,** and the agents were not run again.
- **Grill-me ran after the other three** and was interrupted twice (by the usage limit and by the computer sleeping). The stretch where it wrote round 3 did not report tokens, so its total is a little under the real figure. The time at the end of the interview was left out for the same reason.

## Files

- `design/`: the board (`board.hunch` and `boards/app.hunch`)
- `with-hunch/`: the v0.09 pack and the app
- `hunch-prod/`: the production pack and the app
- `simple/`: the prompt and the app
- `grill-me/`: the prompt, the skill, the interview (`GRILL.md`), the plan (`PLAN.md`) and the app
- `eval/probe.mjs` and `eval/result-*.json`: the probe and the results
- `runs.json` and `metrics.json`: the numbers
