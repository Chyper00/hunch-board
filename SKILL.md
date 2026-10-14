---
name: hunch
description: What Hunch is and how to read and write its boards (.hunch files). Use when a project has a board.hunch or a boards/ folder, when someone asks to design a system, draw the shape of the code, or sketch an app's screens in Hunch, or to update the board after the design changes.
---

# Hunch

Hunch (https://www.hunchboard.dev) is a free board that runs in the browser, for thinking a
software project through before it is built, and for seeing where a feature lands when the code
already exists. It does four things:

- **Documents the design:** the system, the shape of the code, the screens and the plan live in
  one text file, `board.hunch`, kept next to the code and reviewed like code.
- **Helps think:** you draw boxes, arrows and screens by hand, from a template or from text.
- **Shows what breaks before it is built:** gaps in the plan, imports that break the chosen shape,
  the part that gives out first under load.
- **Hands an AI an organized prompt:** Build with AI turns a board into a prompt for an AI chat or
  a pack of files for an AI with a terminal, so it builds what was decided instead of guessing.

## The boards, each with its job

| Board | What it is for | What it holds |
| --- | --- | --- |
| **System** | The parts of a system and how they talk | Components, arrows, flows, boundaries, decisions, a load check |
| **Code architecture** | Where code goes and what may import what | A style (clean, onion, hexagonal…), layers, boxes with their folder |
| **UI sketch** (`mode ui`) | The screens of an app, drawn by hand | Phone, tablet and desktop screens, their elements, where each button goes, the look as tokens |
| **MVP** (`mode mvp`) | Paused in the app for now; it comes back later | A `mode mvp` board opens as a System board. Its lines (scope, stories, cost) still work |
| **Interview** (`mode interview`) | Practicing system design | A timed board checked against a reference answer |

## A diagram inside a diagram

A box can open into its own board. The outer file stays the map of the system. The inner file is
what that one box contains: another diagram, the shape of its code, or its screens. Do it in this
order.

1. On `board.hunch`, give the box a key: `api: Service "Orders" "Go"`.
2. On that same file, one line names the file inside the box: `inside api boards/api.hunch`.
   The word before the path is the box's key.
3. Create `boards/api.hunch`. It is a whole board, not a note. Start it as a diagram (boxes and
   `=>`), as code (`style` and `rule`), or as screens (`mode ui`).
4. A box on that inner board goes one level down, in its own file. On `boards/api.hunch` write
   `inside db boards/api/db.hunch`, and create that file. Two levels is the depth to use. Do not
   add a third folder unless the person asked for it.
5. On the site, the box shows **Open inside**. The first time, the empty file asks: Diagram, Code
   architecture, or UI sketch. Drawing a box keeps it a diagram. **Open inside** on a box that
   already has a file opens that file. The title bar names the boards above, and one click goes
   back up.
6. The key in the line and the key of the box are the same. One level is `boards/<key>.hunch`.
   The next is `boards/<key>/<box>.hunch`. Without the line, Hunch still opens a file at that
   path from the key. Write the line anyway, so the file says where the inside board is.

```hunch
title Shop
api: Service "Orders" "Go"
inside api boards/api.hunch
```

```hunch
title Orders
db: Relational DB "Orders DB" "Postgres"
inside db boards/api/db.hunch
```

To give an assistant this skill, save this file as `.claude/skills/hunch/SKILL.md`. The command that
does it, and also writes the note in `AGENTS.md` and `CLAUDE.md`, is `npx hunch-board init`.
By hand:

```
mkdir -p .claude/skills/hunch && curl -fsSL https://www.hunchboard.dev/HUNCH-SKILL.md -o .claude/skills/hunch/SKILL.md
```

When that site does not open, the same files are in the public repository
https://github.com/Chyper00/hunch-board (`SKILL.md` and `hunch.mjs`). The npm package name is
`hunch-board`.

The short grammar, one page, is https://www.hunchboard.dev/grammar. How to point Claude, ChatGPT,
Cursor and Codex at a board is https://www.hunchboard.dev/use.

## From the terminal, and as an MCP server

The CLI is one file that runs with Node 20 or newer. `npx hunch-board` is the same file once the
package is installed from npm. With nothing to install:

```
mkdir -p .hunch && curl -fsSL https://www.hunchboard.dev/hunch.mjs -o .hunch/hunch.mjs
node .hunch/hunch.mjs init        # board.hunch, this skill, and a note in AGENTS.md and CLAUDE.md
node .hunch/hunch.mjs pack        # write the Build with AI pack (AGENTS.md, docs/, tasks/…) from board.hunch
node .hunch/hunch.mjs questions   # drawing errors first, then what the board doesn't say. A map of a system that exists is not asked for screens or a stack
node .hunch/hunch.mjs check       # the drawing first (every .hunch). On a code board, arrows against its style and rules, then TypeScript, JavaScript and Python imports. Other languages are named and not read. --json prints { ok, issues } for an assistant to correct the lines
node .hunch/hunch.mjs render      # print board.hunch as SVG, transparent background, so a chat can show the drawing. Pass boards/api.hunch to draw that board
```

If the curl fails, download `hunch.mjs` from https://github.com/Chyper00/hunch-board.

As an MCP server, it lets an assistant read and change the board, check the code and regenerate
the pack, on this machine: `claude mcp add hunch -- node .hunch/hunch.mjs mcp` in Claude Code, or
`{ "mcpServers": { "hunch": { "command": "node", "args": [".hunch/hunch.mjs", "mcp"] } } }` in other
clients. Its tools: `read_board`, `write_board` (written only when every line reads),
`check_code` (pass `json: true` for `{ ok, issues }`), `open_questions`, `render_board` (the drawing as SVG) and `build_pack`.

## How an AI uses it

- **The board is the source of truth.** Read `board.hunch` (and `boards/`) before you change
  anything, and build what it says.
- **To show the drawing,** run `node .hunch/hunch.mjs render` (or the MCP tool `render_board`) and
  display that SVG. It is the board, with a transparent background. Do not redraw it with another
  diagram tool. If the command cannot run, give the board as a hunch code block.
- **When the board came from a repository,** the code already exists. Read the map inside the
  service. A feature is the difference: what it hangs from, what it adds, and what the code does
  not confirm. Do not treat that board as a project that has not been built, and do not rewrite
  what is already there.
- **When the design changes, change the board too.** Edit the lines, keep the existing keys, and
  say what changed. If you are in a chat, give the changed or added lines in a ```hunch block so
  the person can paste them back.
- **When the board does not say, deliver the drawing and mark the guess.** Write `note "…" [question]`
  for a premise you are not sure of, and ask from those notes after the board exists. Do not stop
  the drawing to interview, and do not invent a component, a screen, a field or a rule as if it
  were decided.
- **When asked to draw a new board,** write one valid `.hunch` file. The example below is a
  reading order. Only a few lines have to sit together; that list is the next section.

The rest of this skill is the language.

## 1. File shape

Write one statement per line. `//` starts a comment. The example further down is a good reading
order. The parser does not require that order. These lines have to sit with the line they
belong to:

- `endpoint` and `entity` on the lines right after their box, before an arrow, an `inside`, or
  the next box.
- `body` and a status line (`201 { id uuid }`) right after their `endpoint`.
- `when`, `parallel`, `payload`, `say` and `on error` on the lines right after their `flow`,
  before the next `flow` or anything else. A comma inside a quoted label does not start a new
  step: `flow "Save": a => b "notes, links"` is one step.

`inside`, `frame`, `skill`, `note`, `simulate` and the arrows can sit anywhere in the file.
`inside db boards/api/db.hunch` names the box key and a path from the folder that holds
`board.hunch`, not from the folder of the file you are writing.

```hunch
title Bookings
mode mvp

requirement "Clients book a session with a coach"
requirement "Coaches set their availability"
nfr dau 2000
nfr peakRps 30
nfr p99Ms 300
nfr availability "99.5%"

client: User "Client"
app: Monolith "Bookings" "Next.js on Vercel" "Pages and API in one deploy" [managed]
  endpoint POST /api/bookings "Create a booking"
  entity Booking(id uuid pk, clientId uuid, startsAt timestamp)
db: Relational DB "Database" "Postgres on Neon" [managed]

client => app "books" "HTTPS"
app => db "SQL"

flow "Book": client => app "books", app => db "SQL"
note "One deployable until something needs to scale on its own." [decision status=accepted]
```

## 2. Statements

| Statement | Meaning |
|---|---|
| `title Name` | Board title. |
| `mode free` / `mode mvp` / `mode interview` | What the board is for. `mvp` turns on scope, cost and the MVP checklist. |
| `requirement "…"` | A functional requirement. One per line. |
| `nfr dau N` · `nfr peakPeople N` · `nfr peakRps N` · `nfr p99Ms N` | Numeric targets: daily users, people at the busiest moment (the Load's answer is for this many; it goes to the AI as `docs/load.md`), peak requests per second, p99 latency. |
| `nfr availability "…"` · `nfr consistency "…"` · `nfr retention "…"` · `nfr storage "…"` | Text targets. |
| `estimate "Label" "Value"` | Any back-of-the-envelope number worth keeping. |
| `key: Type "Title" "Technology" "Description" [attributes]` | A component. See section 3. |
| `  endpoint METHOD /path "summary"` | An API operation of the component right above. |
| `  entity Name(field type, field type pk, field type fk=Other.field)` | A table or document the component right above owns. The type is the word you write: the examples use `uuid`, `text`, `timestamp`, `decimal`, `int` and `bool`. Any other word is stored as it is. |
| `from => to "label" "technology"` | A call at runtime (the caller waits). `->` still reads as a call. This is not an import. |
| `from --> to "label" "technology"` | Asynchronous message or event (nobody waits). |
| `from ..> to "label"` | Planned or optional connection. |
| `frame "Name": key, key, key` | A boundary drawn around those components. |
| `frame "Name" [kind=kubernetes]: key, key` | What the boundary is, for the AI: `docker`, `kubernetes`, `network` (VPC, subnet), `cloud` (account or region), `context` (bounded context), `team`, `trust` (trust boundary). |
| `flow "Name": a => b "label", b => c` | A named path. Every step must match a connection, and it cites the label when that arrow has one. A comma inside the quotes stays in the label. Two arrows between the same boxes stay two steps. |
| `note "…"` | A comment. Add `[decision status=proposed\|accepted\|superseded context="…" consequences="…"]`, `[question]` or `[out-of-scope]` to give it a meaning. |
| `text "…"` | A free label on the board. |
| `simulate …` | Traffic simulation for Play. See section 6. |
| `style id` | The shape the code should have (`onion`, `clean`, `hexagonal`, `layered`, `feature-sliced`, `mvc`, `modular-monolith`, `vertical-slices`, `custom`). See "Drawing the code". |
| `layer id "Name"` | Renames a layer of the style. With `style custom`, declares the layers, top to bottom. |
| `rule a -> b` · `rule a -/-> b` | On a code board: allows or forbids an import. The word `rule` is what makes `->` an import. A bare `a -> b` is always a call. |
| `code-pattern outbox` · `code-pattern outbox off` | Code patterns come from the board on their own (the style, and the queues, payments and databases of the system around it); a plain line turns on one the board doesn't call for, `off` turns off one it does. The anti-patterns (god object, ORM in the controllers…) are always "never". |
| `inside db boards/api/db.hunch` | The board drawn inside that box. One level is `boards/<key>.hunch`. The next is `boards/<key>/<box>.hunch`. |
| `from -\|> to "implements"` | The box implements the interface `to` (dashed). |

**Strings** are in double quotes. Escape `"` and `\` with a backslash. Use `""` to skip a
positional string (for example a description without a technology: `"Title" "" "What it does"`).

**Keys** (`app`, `orders-db`) are short, lowercase, unique, made of letters, digits, `-`, `_`.
They are how everything else refers to a component, so keep them stable.

## 3. Components

`key: Type "Title" "Technology" "Description" [attributes]`

- **Type** is a label or id from the catalog below (`Service`, `Relational DB`, `database`,
  `Message queue`, `web-scraper`…). Unknown types become `Service`, so use the catalog.
- **Title**: what this team calls it (`Orders API`, not `Service 1`).
- **Technology**: what runs it (`Go`, `PostgreSQL 16`, `Stripe`). Logos are detected from it.
- **Description**: one line on what it owns or does.

Attributes, in brackets, any order:

| Attribute | Meaning |
|---|---|
| `managed` | Run by a provider (RDS, SQS, Vercel…). Counts as replicated and backed up. |
| `replicas=N` | Instances running. 2 or more avoids a single point of failure. |
| `port=N` · `language=…` · `framework=…` | Runtime details, used when generating code. |
| `scope=later` · `scope=never` | Not in the MVP / considered and left out. Absent means build it now. |
| `people=N` · `rpm=N` | For a `User` or `Admin`: people active at peak and requests each sends per minute (default 6). Flows that start at this person are simulated with that traffic. |
| `tags=a,b` | Free tags (`pci`, `team:payments`). |
| `c4=context\|container\|component` | C4 box size. |
| `layer=id` · `path=src/orders` | For code boxes: the layer of the style, and the folder or file the box stands for. |

## 4. Rules for a good board

1. **Start from people.** A `User` (or `Admin / operator`) goes first, then the app they use.
2. **Clients never talk to databases.** Put a service (or the monolith) in between.
3. **Every arrow says what and how.** A verb as label (`"places order"`) and a protocol as
   technology (`"HTTPS"`, `"SQL"`, `"gRPC"`).
4. **Calls are `=>`, events are `-->`.** A bare `->` still reads as a call. An import is only `rule a -> b`. Anything going into a queue, topic or stream is `-->`.
5. **Payments need a way back.** Draw the provider calling your service
   (`pay => api "payment succeeded" "webhook"`) and write a decision note about idempotency keys.
6. **State is replicated or managed.** Databases, caches, brokers: add `managed` or `replicas=2`.
7. **Something signs people in** when there are accounts (`Identity provider`), and **something
   sees errors** (`Error tracking` or `Logs`) as soon as there are real users.
8. **MVPs start simple.** One `Monolith` on a platform, managed Postgres, managed auth, Stripe,
   transactional email. Use Kubernetes, Kafka, service meshes or many microservices only if the
   numbers in `nfr` demand them, and say why in a decision note.
9. **Write the decisions down.** Every non-obvious choice gets a `note … [decision]`. Open points
   get `[question]`. What you cut gets `[out-of-scope]`.
10. **Give at least one flow** for the main path, so the board can be played and simulated.
11. **Don't write positions.** Hunch arranges the boxes (left to right by dependencies, and keeps
    each frame together). Lines starting with `@layout` are only written by Hunch itself.

## 5. Interviews

For a system design interview answer (`mode interview`), cover what the interview checks:
3 to 5 `requirement` lines, at least 3 `nfr` targets with numbers, `endpoint` lines on the
service the client calls, `entity` lines on the main store, at least 5 connected components
with a `flow`, the scaling pieces (cache, queue, index, CDN) with a reason in a decision note,
and the trade-offs you made.

## 6. Simulation

`simulate` lines configure what Play simulates: traffic along a flow, with typical latency and
capacity per component type. Overrides and outages show where the design bends.

| Statement | Meaning |
|---|---|
| `simulate on` / `simulate off` | Use the simulation when Play runs. |
| `simulate rps 2000` | Requests per second entering the flow (defaults to the `people × rpm` of the person the flow starts at, then `nfr peakRps`, then 100). |
| `simulate flow "Checkout"` | Which flow to simulate (defaults to the first). |
| `simulate network 2` | Extra milliseconds per hop inside the system. |
| `simulate key latency=40 capacity=800` | Override a component: ms per request, req/s for all replicas. |
| `simulate cache hit=0.9` | Share of reads a cache answers (the database only sees misses). |
| `simulate key errors=0.02` | Share of requests failing on their own. |
| `simulate db down` | An outage: the request fails there, and what it would trigger never happens. |
| `simulate shape ramp` | Traffic over 60 seconds: `steady` (default), `ramp`, or `spike` (a burst from second 24 to 36). |
| `simulate chaos down=db cold=cache latency=api:400 partition=search` | Temporary breakage for this run. |
| `simulate api timeout=200 retries=2 circuit rate=500 scale=4` | Timeout, extra attempts, circuit breaker, rate limit and autoscale. |

After a `flow` line you can add:

| Statement | Meaning |
|---|---|
| `when a => b 0.9` | This step is taken 90% of the time (a cache hit, a failed payment). |
| `parallel a => mail, a => search` | Those connectors happen at the same time. |
| `payload a => b "{ id, total }" 240` | What travels, and its size in bytes (used for bandwidth). |
| `say a => b "The order is stored"` | Narration shown in Play and in presentation mode. |
| `on error "Payment failed"` | Name of the flow that is the failure path. |
| `include "payments.hunch"` | Pulls another file in. The folder has to be open so the file can be found. |

Use it to show a point: the bottleneck at peak traffic, what the cache saves, what an outage of
a dependency does. Work that leaves a queue waits there when the consumer is slower than the
arrival rate. That is a backlog, a delay, not a failed request.

`payload`, `say` and `on error` go on the lines right after their `flow`, with nothing else
between them. The arrow names the two boxes. The quoted text is the payload or the sentence,
not the label of the arrow.

```hunch
app: Web app "Shop"
api: Service "Orders"
app => api "charge"
flow "Pay": app => api "charge"
  payload app => api "{ orderId }" 120
  say app => api "The card is charged"
  on error "Payment failed"
```

## 7. Complete examples

### MVP with payments and a simulated peak

```hunch
title CoachBook
mode mvp
requirement "Clients book paid sessions with coaches"
requirement "Coaches set their availability"
requirement "Clients get a reminder before the session"
nfr dau 5000
nfr peakRps 60
nfr p99Ms 400
nfr availability "99.5%"

client: User "Client" [people=300 rpm=6]
coach: User "Coach"
app: Monolith "CoachBook" "Next.js on Vercel" "Pages and API routes" [managed]
  endpoint POST /api/bookings "Create a booking (idempotency key)"
  endpoint GET /api/coaches/{id}/slots "Free slots"
db: Relational DB "Database" "Postgres on Neon" [managed]
  entity Booking(id uuid pk, clientId uuid, coachId uuid, startsAt timestamp, status text)
  entity Slot(id uuid pk, coachId uuid, startsAt timestamp)
auth: Identity provider "Sign-in" "Clerk"
pay: Payment provider "Payments" "Stripe"
jobs: Worker pool "Reminders" "Inngest"
mail: Email / SMS / push "Email" "Resend"
errors: Error tracking "Errors" "Sentry"

client => app "books" "HTTPS"
coach => app "sets availability" "HTTPS"
app => auth "sign in" "OIDC"
app => db "SQL"
app => pay "checkout"
pay => app "payment succeeded" "webhook"
app --> jobs "schedule reminder"
jobs => mail "send reminder"
app => errors "exceptions"

flow "Book": client => app "books", app => pay "checkout", pay => app "payment succeeded", app => db "SQL", app --> jobs "schedule reminder", jobs => mail "send reminder"
note "Double booking is prevented by a unique index on (coachId, startsAt)." [decision status=accepted]
note "Stripe calls carry an idempotency key; webhooks are deduped by event id." [decision status=accepted]
note "Calendar sync (Google, Outlook)" [out-of-scope]

simulate on
simulate rps 60
simulate flow "Book"
```

### Data pipeline with a cache and an outage to test

```hunch
title Price alerts
requirement "Collect prices from retailer sites every hour"
requirement "Alert people when a watched product gets cheaper"
nfr peakRps 200

user: User "Shopper"
web: Web app "Dashboard" "Next.js"
api: Service "Prices API" "Go" [replicas=2]
  endpoint GET /products/{id}/prices "Price history"
cache: Cache "Hot products" "Redis" [managed]
db: Relational DB "Prices" "Postgres" [managed]
  entity PriceSnapshot(productId uuid, price decimal, seenAt timestamp)
cron: Scheduled job "Hourly crawl"
queue: Message queue "Pages to fetch" "SQS" [managed]
scraper: Web scraper / crawler "Scraper" "Crawlee"
sites: Target website "Retailer sites"

user => web "watches products"
web => api "GET prices" "HTTPS"
api => cache "get"
api => db "SQL"
cron --> queue "enqueue URLs"
queue --> scraper "consume"
scraper => sites "fetch page" "HTTPS"
scraper => db "save price" "SQL"

flow "Read prices": user => web "watches products", web => api "GET prices", api => cache "get", api => db "SQL"
flow "Crawl": cron --> queue "enqueue URLs", queue --> scraper "consume", scraper => sites "fetch page", scraper => db "save price"
note "Check each site's terms and robots.txt; prefer an official feed when one exists." [decision status=accepted]

simulate on
simulate flow "Read prices"
simulate rps 2000
simulate cache hit=0.9
```

## 8. Before you answer, check

- Every key used in a connection, frame, flow or `simulate` line is declared.
- Every `flow` step matches a connection you wrote, in the same direction.
- Types come from the catalog below.
- No client or person connects straight to a database.
- Stateful components are `managed` or have `replicas=2`.
- There is at least one `flow`, and decisions are written as notes.
- A box with a board inside it has an `inside` line, and that file exists. The key in the line is the box's key.

## 9. Component types

Use the label (first column) or the id (second column) as `Type`.

<!-- catalog:start -->
**Clients & people**

| Type | Id | Use for |
|---|---|---|
| Web app | `client` | A web front-end people use in the browser. |
| User | `user` | A person who uses the system. Start every context diagram here. |
| Mobile app | `mobile-app` | An iOS or Android app. |
| Desktop app | `desktop-app` | An installed desktop app (Electron, native). |
| Admin / operator | `admin` | Staff or operators who use internal tools. |
| IoT device | `iot-device` | Hardware that sends telemetry or receives commands. |
| CLI / SDK | `cli` | A command-line tool or SDK developers run. |
| Browser extension | `browser-extension` | Code that runs inside the user's browser on other sites (capture, autofill, overlays). |
| Chat channel | `chat-channel` | People reach the product through WhatsApp, Telegram, Slack or Discord. |
| POS / kiosk | `pos-kiosk` | A point-of-sale terminal or kiosk in a physical place, often with poor connectivity. |

**Front-end**

| Type | Id | Use for |
|---|---|---|
| Design tokens | `design-tokens` | The single source of colors, spacing and type that every platform builds from. |
| Component library | `component-library` | A versioned package of shared UI components consumed by apps. |
| Docs / Storybook | `docs-site` | Storybook or a docs site where components and usage are published. |
| Backend for frontend | `bff` | An API shaped for one front-end, aggregating several backends. |
| Client state / cache | `client-state` | Client-side state or a query cache (Redux, Zustand, React Query) that matters to the design. |
| Service worker | `service-worker` | Offline support, background sync, push or a client-side network cache. |
| Micro-frontend | `micro-frontend` | A separately deployed slice of the UI composed into a shell. |
| Product analytics | `analytics` | Product events and real-user monitoring sent from clients. |
| Headless CMS | `cms` | Editors change content (pages, posts, products) without a deploy. |
| Static site | `static-site` | Pages built ahead of time and served from a CDN (landing, docs, blog). |
| Embeddable widget | `widget` | A snippet other sites embed (chat bubble, booking form, checkout button). |

**Edge & network**

| Type | Id | Use for |
|---|---|---|
| API gateway | `gateway` | One public entry point that routes, authenticates and rate-limits calls to services. |
| Internet | `internet` | The public internet, to show what is exposed. |
| DNS | `dns` | Domain resolution, failover or geo-routing that the design depends on. |
| CDN | `cdn` | Static assets or cacheable pages served close to users. |
| Load balancer | `load-balancer` | Traffic spread across several instances of the same thing. |
| Reverse proxy | `reverse-proxy` | TLS termination, routing or buffering in front of apps (nginx, Envoy). |
| Service mesh | `service-mesh` | Many services needing mTLS, retries and traffic policy without code changes. |
| Network / VPC | `vpc` | A private network boundary, usually better drawn as a boundary frame. |
| Rate limiter | `rate-limiter` | Requests per user, key or IP must be capped to protect the system or a paid API. |
| Proxy pool | `proxy-pool` | Requests must come from many IPs or regions (scraping, geo-specific content). |

**Compute**

| Type | Id | Use for |
|---|---|---|
| Service | `service` | A deployable backend that owns one job and its API. |
| Serverless function | `function` | Short, event-triggered code with spiky or low traffic. |
| Microservice | `microservice` | A service with its own data, deployed independently by its own team. |
| Monolith | `monolith` | One deployable that holds most of the product. The right start for most MVPs. |
| Container | `container` | A specific containerized process when the runtime matters. |
| Kubernetes cluster | `kubernetes` | Many services needing scheduling, autoscaling and self-healing on your own cluster. |
| Worker pool | `worker` | Background consumers that process jobs from a queue or stream. |
| Scheduled job | `cron-job` | Work that runs on a schedule (reports, cleanups, syncs). |
| Virtual machine | `vm` | A long-lived server you manage, or software that needs a full machine. |
| Web scraper / crawler | `web-scraper` | Collecting data from websites that offer no API: crawling pages, parsing HTML, following links. |
| Headless browser | `headless-browser` | Pages that need JavaScript to render, logins, screenshots or PDFs from HTML. |
| Batch job | `batch-job` | Large, finite jobs over many records (backfills, nightly recalculations). |
| Workflow engine | `workflow-engine` | Multi-step processes that must survive crashes and retries (onboarding, payouts, sagas). |
| Edge function | `edge-function` | Light logic close to users: redirects, auth checks, personalization, A/B routing. |
| WebSocket / realtime server | `realtime-server` | Servers that hold open connections and push updates (chat, live dashboards, collaboration). |
| GraphQL API | `graphql-server` | Many clients need different shapes of the same data from several backends. |
| Bot | `bot` | Automation that talks in a chat platform (commands, alerts, support). |
| Media processor | `media-processor` | Transcoding video/audio or resizing images, usually off the request path. |
| Document generator | `doc-generator` | PDFs, invoices or reports generated from templates. |
| Rules engine | `rules-engine` | Business rules (pricing, eligibility) that change often and are owned by non-developers. |
| Game server | `game-server` | Authoritative real-time game state shared by players. |

**Data & storage**

| Type | Id | Use for |
|---|---|---|
| Relational DB | `database` | Relational data with joins, constraints and transactions. The default store for most products. |
| Cache | `cache` | A fast copy of data that already lives elsewhere, to cut latency or load. |
| Object storage | `storage` | Files, images, video, backups and exports: anything addressed by key and served as a whole. |
| Document DB | `document-db` | Self-contained documents read and written whole, with a flexible schema. |
| Key-value store | `key-value` | Lookups by key at very high scale with simple access patterns. |
| Graph DB | `graph-db` | Queries that walk relationships many hops deep (social graphs, fraud). |
| Time-series DB | `timeseries-db` | Metrics, sensor data or events queried by time window. |
| Search index | `search-index` | Full-text search, ranking, filtering and autocomplete. |
| Data warehouse | `warehouse` | Analytics across large history (BI, reporting). |
| Data lake | `data-lake` | Raw data kept cheaply for later processing. |
| File storage | `file-storage` | A shared filesystem that software mounts. |
| ETL / data pipeline | `etl-pipeline` | Moving and transforming data between stores in batches. |
| Spreadsheet | `spreadsheet` | A no-code MVP where a sheet or Airtable is the database, edited by people. |
| Geospatial index | `geo-index` | Queries like 'what is near me' or 'inside this area' (drivers, stores, deliveries). |
| Ledger | `ledger` | Money or balances that must be append-only and auditable (double entry). |
| Change data capture | `cdc` | Streaming database changes to other systems (search index, warehouse, cache) without dual writes. |
| Backup vault | `backup` | Backups kept apart from the primary, with a restore you have tested. |

**Messaging & events**

| Type | Id | Use for |
|---|---|---|
| Message queue | `queue` | Work handed to one consumer that must happen eventually, with retries. |
| Event stream | `event-stream` | An ordered, replayable log read by several independent consumers at high volume (Kafka, Kinesis). |
| Pub/sub topic | `topic` | Fan-out: one message delivered to every subscriber. |
| Event bus | `event-bus` | Routing events between services by rules (EventBridge). |
| Stream processor | `stream-processor` | Continuous computation over streams (windows, joins, aggregations). |
| Webhook | `webhook` | An HTTP callback another system calls when something happens. |
| Email / SMS / push | `notification` | Email, SMS or push delivered to people. |
| Realtime channel | `realtime-channel` | A managed service pushes events to browsers and phones (Pusher, Ably, Supabase Realtime). |
| MQTT broker | `mqtt-broker` | Many devices publish telemetry or receive commands over flaky networks. |
| Dead-letter queue | `dead-letter-queue` | Messages that keep failing are parked for inspection and replay. |
| Inbound email | `inbound-email` | The product receives email (replies, forwarding, parsing attachments). |

**AI & ML**

| Type | Id | Use for |
|---|---|---|
| LLM | `llm` | A language model called for generation, extraction or reasoning. |
| AI agent | `ai-agent` | A loop where a model chooses tools and actions toward a goal. |
| ML model | `ml-model` | A trained model served for predictions (ranking, classification). |
| Vector DB | `vector-db` | Nearest-neighbor search over embeddings (RAG, semantic search). |
| Embeddings | `embeddings` | Turning text or images into vectors. |
| Feature store | `feature-store` | Features shared between training and serving. |
| Training pipeline | `training-pipeline` | Training or fine-tuning models on a schedule. |
| OCR / document AI | `ocr` | Extracting text and fields from images and PDFs (invoices, IDs, receipts). |
| Speech (STT / TTS) | `speech` | Transcribing audio or generating voice. |
| Image generation | `image-gen` | Generating or editing images with a model. |
| LLM gateway | `llm-gateway` | Routing between several model providers with fallbacks, caching and cost tracking. |
| Guardrails / evals | `guardrails` | Checking model inputs and outputs (PII, safety, format) and running evals. |
| MCP server | `mcp-server` | Exposing your system's tools and data to AI assistants via Model Context Protocol. |

**Security & identity**

| Type | Id | Use for |
|---|---|---|
| Identity provider | `auth-provider` | Sign-in, tokens and identity (Auth0, Cognito, Clerk, Keycloak). |
| Firewall / WAF | `firewall` | Blocking traffic by rule (WAF, DDoS protection). |
| Secrets manager | `secrets` | Storing and rotating credentials and keys. |
| IAM / policies | `iam` | Permissions between services and people. |
| Certificate | `certificate` | TLS certificates when issuance or rotation matters. |
| CAPTCHA / bot protection | `captcha` | Public forms and sign-ups that bots will abuse. |
| Audit log | `audit-log` | Recording who did what and when, for compliance or support. |
| Fraud detection | `fraud` | Scoring payments, sign-ups or orders for risk. |
| VPN / bastion | `vpn` | Private access for staff to internal systems (bastion, Tailscale, zero trust). |

**Observability**

| Type | Id | Use for |
|---|---|---|
| Logs | `logs` | Collecting application logs and errors. |
| Metrics | `metrics` | Numbers over time for dashboards and alerts. |
| Tracing | `tracing` | Following one request across services. |
| Alerting / on-call | `alerting` | Paging people when something breaks. |
| Dashboard | `dashboard` | A UI showing the health or business numbers. |
| Error tracking | `error-tracking` | Capturing exceptions with stack traces and alerting on new ones (Sentry). |
| Uptime monitor | `uptime-monitor` | Checking from outside that the product responds, and alerting when it doesn't. |
| Status page | `status-page` | Telling customers about incidents and maintenance. |

**DevOps & delivery**

| Type | Id | Use for |
|---|---|---|
| Git repository | `repo` | Source code when the delivery flow is part of the design. |
| CI/CD pipeline | `ci-cd` | Build, test and deploy automation. |
| Artifact registry | `registry` | Where built images or packages are published. |
| Infrastructure as code | `iac` | Infrastructure defined in Terraform, Pulumi or CloudFormation. |
| Feature flags | `feature-flags` | Turning features on per user or percentage without deploys. |
| Config file | `config` | A configuration file or service the design depends on. |
| Preview environments | `preview-env` | Every pull request gets its own deploy to review. |
| Load testing | `load-test` | Proving the design holds the target RPS before launch. |

**External & SaaS**

| Type | Id | Use for |
|---|---|---|
| External API | `external` | A third-party API you call but do not run. |
| Payment provider | `payment-provider` | Charging cards and handling payouts (Stripe, Adyen). |
| SaaS tool | `saas` | A SaaS tool the system integrates with (CRM, support, chat). |
| Legacy system | `legacy-system` | An older system you must integrate with but cannot change. |
| Partner system | `partner` | Another company's system you exchange data with. |
| Cloud provider | `cloud-provider` | The cloud itself, when a provider-level service matters. |
| Target website | `target-website` | The external sites a scraper reads. Their limits and changes are a risk to design for. |
| Maps / geocoding API | `maps-api` | Geocoding addresses, maps, routes and distances (Google Maps, Mapbox). |
| E-commerce platform | `ecommerce-platform` | Shopify, VTEX or WooCommerce holds the catalog, orders or checkout. |
| Social media API | `social-api` | Publishing to or reading from social networks (X, Meta, LinkedIn, YouTube). |
| E-signature | `esign` | Contracts signed online with a legal trail (DocuSign, Clicksign). |
| Banking / open finance | `banking-api` | Reading accounts or moving money through banks (Plaid, Belvo, Pix). |

**Code architecture**

| Type | Id | Use for |
|---|---|---|
| Module | `module` | A folder of code that belongs together: one area of the app, mapped from the code or planned. |
| Route / handler | `route-handler` | The HTTP entry point: reads the request, calls one use case, maps the result to a status code. |
| Middleware | `middleware` | Something every request passes before the handler: session check, rate limit, logging. |
| Validator | `validator` | The schema of what comes in (zod, DTO): rejects bad input before any logic runs. |
| Use case | `use-case` | One thing the app does (place an order), written against interfaces, not frameworks. |
| Entity | `domain-entity` | A business concept with its rules and no I/O (Order: total must be positive). |
| Value object | `value-object` | A small immutable value with its own rules (Money, Email). |
| Interface (port) | `port` | The contract the inside of the app needs from the outside (OrderRepository, PaymentGateway). |
| Repository | `repository` | Reads and writes one kind of data, implementing a port; the only place that knows the ORM. |
| Adapter | `adapter` | Implements a port with a real service or SDK (Stripe, an email API). |
| DB connection | `db-connection` | The database client and its pool: how many queries can run at once. |
| Event publisher | `publisher` | Sends events out (to a queue, a topic or an outbox table). |
| Event handler | `event-handler` | Reacts to an event from a queue or topic, idempotently. |
| Composition root | `composition-root` | The one place that picks an implementation for each port and wires the app together. |
| Server action | `server-action` | A Next.js server action: the front-end calls it like a function; it checks input and calls a use case. |
| Page | `page` | A route the person opens; it composes widgets and loads what they need. |
| Widget | `ui-widget` | A big self-contained block of a page (a recipe card, a header) built from features and entities. |
| Feature | `feature` | One user action with its UI and state (favorite a recipe, rate it). |
| UI entity | `ui-entity` | How a business object looks and is typed in the UI (recipe card, user avatar). |
| Shared | `shared-module` | Code everything can use and that knows no business: UI kit, utils, API client. |
| Test suite | `test-suite` | Where the tests of a module live, so the map shows what is covered. |
<!-- catalog:end -->

## Drawing the code

When the person wants the shape of the code (an API, a web app), not the systems around it,
boxes are modules. A call is `http => place`. An import is a `rule` line (`rule adapters -> ports`).
A bare `http -> place` is still a call, the same as on a system board; it is not an import.
Pick the style the team says it follows; if it says none, use `layered` for a plain app and
`feature-sliced` for a React front end. Use the "Code architecture" types. The word before the
title is the catalog name or its id (`Entity` or `domain-entity`, `Use case` or `use-case`,
`Port` or `port` for an interface). A word that is neither is stored as Service, and Hunch warns.
Put each box in a layer with `[layer=…]`, and give it a `[path=…]` when the folder exists or is
planned. Draw an interface as a `Port` and its implementation with `-|>`. Do not add a `rule`
the style forbids unless the person wants that import; if they do, write the rule and say why
in a note.

Layers, in order. The first is the center (rings) or the top (bands). A box uses `[layer=]` with
one of these ids. In hexagonal, a use case sits in `ports`, next to the interfaces; the entity
sits in `core`.

| Style | Layers |
|---|---|
| `onion` | `domain`, `domain-services`, `application`, `outer` |
| `clean` | `entities`, `use-cases`, `adapters`, `frameworks` |
| `hexagonal` | `core`, `ports`, `adapters` |
| `layered` | `presentation`, `business`, `data`, `cross` |
| `feature-sliced` | `app`, `pages`, `widgets`, `features`, `entities`, `shared` |
| `mvc` | `controllers`, `views`, `models`, `shared` |
| `modular-monolith` | `modules`, `shared` |
| `vertical-slices` | `slices`, `shared` |

```hunch
style hexagonal
order: Entity "Order" [layer=core path=src/orders]
place: Use case "Place order" [layer=ports path=src/orders]
repo: Port "OrderRepository" [layer=ports path=src/orders/ports]
http: Route handler "Orders HTTP" [layer=adapters path=src/http]
pg: Repository "PgOrderRepository" [layer=adapters path=src/db]
http => place "places order"
place => repo
pg -|> repo "implements"
rule adapters -> ports
```

## Filling a build spec

When the person wants an assistant to *build* the product, not only draw it, add a build spec
to the same `.hunch` file. Do not invent a field, a screen or a rule that the person did not
say. If it is missing, leave it out and say which line would close the gap.

Ask, in this order, only for what is still empty:

1. Problem, audience, goal and the metric that says the MVP worked.
2. Each must-have story as given / when / then.
3. Each screen: route, role, what it shows, the endpoint a button calls, and the error text.
4. Required fields, unique fields, defaults, and what happens when a parent row is deleted.
5. Request body, status codes and who may call each endpoint.
6. Who can do what, including when someone may only see their own rows.
7. Events, webhook signatures, and where each secret comes from.
8. The run command and the test command.

A story without a criterion is not ready. Write `priority=must` only for what the first
version must do. Everything else is `should` or `could`. Out of scope stays a note or
`scope=later`, and is not a story.

## Sketching the screens (UI sketch)

A UI sketch is a board of its own, `mode ui`: the screens of an app, drawn by hand, for an AI
to build. The sketch says what is on each screen, in what order and what it does, never how it
looks to the pixel. How it looks is written as tokens, references and a vibe, for the AI.

- A screen is a `frame` with a device and a route: `frame "Cart" [device=mobile route="/cart" empty="Your cart is empty"]: a, b, c`.
  Devices: `mobile` (390 × 844), `tablet` (820 × 1180), `desktop` (1440 × 900). States: `empty`, `loading`, `error`.
- An element is a box whose type is a screen element: `Heading`, `Paragraph`, `Label`, `Link`,
  `Button`, `Icon button`, `Text input`, `Email input`, `Password input`, `Number input`,
  `Text area`, `Select`, `Checkbox`, `Radio group`, `Toggle`, `Slider`, `Date picker`,
  `Time picker`, `File upload`, `Search`, `Image`, `Avatar`, `Badge`, `Tag`, `Divider`, `Card`,
  `Table`, `List`, `Stat`, `Chart`, `Progress bar`, `Empty state`, `Top bar`, `Sidebar`, `Tabs`,
  `Bottom tabs`, `Menu`, `Alert`, `Toast`, `Modal`, `Panel`, `Row`, `Column`, `Grid`, `Section`.
- What an element says and does goes in its attributes: `[primary]` or `[danger]`,
  `placeholder="…"`, `options="One|Two|Three"`, `required`, `goto=<screen>` (the screen it
  opens). A screen has no key of its own: `goto` is the screen's title in lowercase, with
  accents removed and spaces turned into hyphens. `frame "Carta aberta"` is `goto=carta-aberta`.
  Also `calls="POST /orders"` (the endpoint behind it), `field=Order.email` (the data).
- The look, for the AI: `token color primary #1f6feb`, `token font heading "Inter"`,
  `token size base 16px`, `token size radius 8`, `reference "https://…" "what to take from it"`,
  `vibe "calm, editorial, lots of white space"`.
- Design patterns come from the screens on their own (a form calls for inline validation, a phone
  for thumb-friendly navigation): `pattern fitts` turns on one the sketch doesn't call for,
  `pattern thumb-nav off` turns off one it does. The dark patterns are always "never".

```hunch
title Plant shop
mode ui
cart-total: Stat "Total $68"
pay: Button "Checkout" [primary goto=checkout]
frame "Cart" [device=mobile route="/cart" empty="Your cart is empty"]: cart-total, pay
paid: Heading "Paid"
frame "Checkout" [device=mobile route="/checkout"]: paid
token color primary #2b8a3e
reference "https://www.aesop.com" "the editorial product pages"
```

Reading a UI sketch: the screens hold these elements, in the order they are written; every
`goto` is where an element leads and every `calls` the endpoint behind it; the tokens and the
references describe the look.

## Skills for the project

A board can name skills for the AI that builds it: `skill "name" "https://…/SKILL.md" "what it is for"`.
They are instructions for the AI that builds the project. This skill, the Hunch one, is always
named first.
