/** The public repository an assistant can reach when hunchboard.dev does not resolve. */
export const GITHUB_REPO = "https://github.com/Chyper00/hunch-board";

/** One line to paste into Claude, ChatGPT, Cursor or Codex. */
export const AI_INSTRUCTION = `Read https://www.hunchboard.dev/HUNCH-SKILL.md and then draw the board of my project in board.hunch before you write code. Hunch Board is the board; the AI I already use writes the code. If that site does not open, use ${GITHUB_REPO}. Check the drawing with npx hunch-board check --json.`;
