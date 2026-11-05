import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

/**
 * Has the code moved away from the board? This reads what the project depends on
 * (package.json, requirements.txt, go.mod, docker-compose…) and names the services
 * no board mentions. It reads manifests, not the code: a raw HTTP call is not seen.
 */

interface Service {
  name: string;
  /** Matches a dependency or an image. */
  dependency: RegExp;
  /** A board that says any of these words has this service. */
  board: string[];
}

const SERVICES: Service[] = [
  { name: "Stripe", dependency: /(^|[/:-])stripe(-|$|\/)/, board: ["stripe", "payment provider"] },
  { name: "Anthropic", dependency: /anthropic/, board: ["anthropic", "claude"] },
  { name: "OpenAI", dependency: /(^|\/)openai(-|$|\/)/, board: ["openai", "chatgpt", "gpt"] },
  { name: "fal.ai", dependency: /(^|[/-])fal(-client|-ai)?(\/|$)|^@fal-ai\//, board: ["fal.ai", "fal"] },
  { name: "PostgreSQL", dependency: /^(pg|postgres|psycopg2?(-binary)?|asyncpg|image:postgres)$|lib\/pq|jackc\/pgx|postgresql$/, board: ["postgres", "postgresql", "relational db", "supabase", "neon"] },
  { name: "MySQL", dependency: /^(mysql2?|pymysql|mysqlclient|image:(mysql|mariadb))$|mysql-connector|go-sql-driver\/mysql/, board: ["mysql", "mariadb", "relational db"] },
  { name: "MongoDB", dependency: /^(mongodb|mongoose|pymongo|motor|mongoid|image:mongo)$|mongo-driver|mongodb-driver/, board: ["mongo", "mongodb", "document db"] },
  { name: "Redis", dependency: /^(redis|ioredis|aioredis|image:(redis|valkey))$|go-redis|jedis|lettuce-core/, board: ["redis", "valkey", "cache"] },
  { name: "Kafka", dependency: /kafka/, board: ["kafka", "event stream"] },
  { name: "RabbitMQ", dependency: /^(amqplib|pika|aio-pika|bunny|image:rabbitmq)$|rabbitmq/, board: ["rabbitmq", "message queue"] },
  { name: "Elasticsearch", dependency: /elasticsearch|opensearch/, board: ["elasticsearch", "elastic", "opensearch", "search index"] },
  { name: "Amazon S3", dependency: /client-s3|aws-sdk-go-v2\/service\/s3|software\.amazon\.awssdk:s3|^boto3$/, board: ["s3", "aws", "object storage"] },
  { name: "Supabase", dependency: /^@supabase\/|^supabase$/, board: ["supabase"] },
  { name: "Firebase", dependency: /firebase/, board: ["firebase", "firestore"] },
  { name: "Clerk", dependency: /^@clerk\//, board: ["clerk", "identity provider"] },
  { name: "Auth0", dependency: /auth0/, board: ["auth0", "identity provider"] },
  { name: "Twilio", dependency: /twilio/, board: ["twilio"] },
  { name: "SendGrid", dependency: /sendgrid/, board: ["sendgrid"] },
  { name: "Resend", dependency: /^resend$/, board: ["resend"] },
  { name: "Sentry", dependency: /sentry/, board: ["sentry", "error tracking"] },
  { name: "Telegram", dependency: /telegram|telegraf|grammy|^aiogram$/, board: ["telegram"] },
  { name: "Pinecone", dependency: /pinecone/, board: ["pinecone", "vector db"] },
];

const SKIPPED = new Set(["node_modules", "vendor", "dist", "build", "target", "out", "coverage", "venv", "__pycache__", "examples"]);
const MAX_DEPTH = 5;

const quotedWords = (text: string) => [...text.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
const pythonName = (spec: string) => spec.trim().match(/^[A-Za-z0-9_.-]+/)?.[0] ?? "";

function jsonKeys(text: string, ...fields: string[]): string[] {
  try {
    const parsed = JSON.parse(text) as Record<string, Record<string, unknown> | undefined>;
    return fields.flatMap((field) => Object.keys(parsed[field] ?? {}));
  } catch {
    return [];
  }
}

function pyproject(text: string): string[] {
  const listed = [...text.matchAll(/^\s*dependencies\s*=\s*\[([\s\S]*?)\]/gm)].flatMap((match) => quotedWords(match[1]).map(pythonName));
  const poetry = text.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?:\n\[|$)/)?.[1] ?? "";
  const keys = [...poetry.matchAll(/^([A-Za-z0-9_.-]+)\s*=/gm)].map((match) => match[1]).filter((name) => name !== "python");
  return [...listed, ...keys];
}

/** The reader for a manifest, by its file name. Dev-only dependencies do not count: they are not part of the system. */
function readerFor(name: string): ((text: string) => string[]) | undefined {
  if (name === "package.json") return (text) => jsonKeys(text, "dependencies", "optionalDependencies");
  if (name === "composer.json") return (text) => jsonKeys(text, "require");
  if (/^requirements.*\.txt$/.test(name)) return (text) => text.split("\n").filter((line) => !/^\s*(#|-)/.test(line)).map(pythonName);
  if (name === "pyproject.toml") return pyproject;
  if (name === "go.mod") return (text) => [...text.matchAll(/^\s*(?:require\s+)?([\w.-]+\.[\w.-]+\/[\w./-]+)\s+v/gm)].map((match) => match[1]);
  if (name === "Gemfile") return (text) => [...text.matchAll(/^\s*gem\s+['"]([^'"]+)/gm)].map((match) => match[1]);
  if (name === "pom.xml") return (text) => [...text.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)].map((match) => match[1]);
  if (/^build\.gradle(\.kts)?$/.test(name)) return (text) => [...text.matchAll(/(?:implementation|api|runtimeOnly)\s*\(?\s*['"]([^'":]+:[^'":]+)/g)].map((match) => match[1]);
  if (/^(docker-)?compose.*\.ya?ml$/.test(name)) {
    return (text) =>
      [...text.matchAll(/^\s*image:\s*['"]?([^\s'"#]+)/gm)].map((match) => `image:${match[1].split("@")[0].replace(/:[^/:]+$/, "").split("/").pop()}`);
  }
  return undefined;
}

function walk(folder: string, depth = 0): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return depth < MAX_DEPTH && !entry.name.startsWith(".") && !SKIPPED.has(entry.name) ? walk(path, depth + 1) : [];
    return entry.isFile() ? [path] : [];
  });
}

/** The words of the boards, without what only comments on them: an open question about Stripe does not draw Stripe. */
function boardText(files: string[]): string {
  return files
    .filter((file) => file.endsWith(".hunch"))
    .flatMap((file) => readFileSync(file, "utf8").split("\n"))
    .filter((line) => !/^\s*(\/\/|@layout\b|note\b|text\b)/.test(line))
    .join("\n")
    .toLowerCase();
}

const mentions = (text: string, word: string) => new RegExp(`(^|[^a-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`).test(text);

export interface DriftIssue {
  service: string;
  dependency: string;
  file: string;
  severity: "warning";
  message: string;
}

export interface DriftResult {
  ok: boolean;
  /** The board or the base could not be read, so nothing was compared. */
  failed?: boolean;
  text: string;
}

function fileAtBase(root: string, base: string, file: string): string {
  try {
    return execFileSync("git", ["show", `${base}:./${file}`], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 32 * 1024 * 1024 });
  } catch {
    return ""; // The manifest is new in this change.
  }
}

/** `base` compares against a git ref, so a pull request only hears about what it adds. */
export function drift(root: string, options: { base?: string; json?: boolean } = {}): DriftResult {
  const stop = (message: string): DriftResult => ({ ok: false, failed: true, text: options.json ? JSON.stringify({ ok: false, issues: [], error: message }, null, 2) : message });
  if (!existsSync(join(root, "board.hunch"))) return stop("No board.hunch in this folder. Run hunch init, or pass --root.");
  const { base } = options;
  if (base !== undefined) {
    let known = !base.startsWith("-");
    if (known) {
      try {
        execFileSync("git", ["rev-parse", "--verify", "--quiet", `${base}^{commit}`], { cwd: root, stdio: "ignore" });
      } catch {
        known = false;
      }
    }
    if (!known) return stop(`Git does not know the base "${base}".`);
  }

  const files = walk(root);
  const board = boardText(files);
  const issues = new Map<string, DriftIssue>();
  for (const path of files) {
    const read = readerFor(basename(path));
    if (!read) continue;
    const file = relative(root, path);
    const before = new Set(base === undefined ? [] : read(fileAtBase(root, base, file)));
    for (const dependency of read(readFileSync(path, "utf8"))) {
      if (!dependency || before.has(dependency)) continue;
      for (const service of SERVICES) {
        if (issues.has(service.name) || !service.dependency.test(dependency.toLowerCase())) continue;
        if (service.board.some((word) => mentions(board, word))) continue;
        const shown = dependency.replace(/^image:/, "");
        issues.set(service.name, { service: service.name, dependency: shown, file, severity: "warning", message: `${service.name} (${shown} in ${file}) is not on the board.` });
      }
    }
  }

  const list = [...issues.values()];
  if (options.json) return { ok: !list.length, text: JSON.stringify({ ok: !list.length, issues: list }, null, 2) };
  if (!list.length) return { ok: true, text: base === undefined ? "Every known service the code depends on is on the board." : `Nothing added since ${base} is missing from the board.` };
  return { ok: false, text: `The code depends on what the board does not show:\n${list.map((issue) => `- ${issue.message}`).join("\n")}\nAdd each one to the board, or remove the dependency.` };
}
