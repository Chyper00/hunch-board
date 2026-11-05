---
name: hunch
description: How to read and write Hunch boards (board.hunch). Use when a project has a board.hunch, when someone asks to plan a project or sketch an idea on a board, or to update the board after the plan changes.
---

# Hunch Board

Hunch Board (https://www.hunchboard.dev) is one free board for planning a project. It lives in one
text file, `board.hunch`, next to the code. A box can hold a board of its own, in `boards/`, and files
on the board live in `assets/` next to it.
The person draws on it in the browser or in the editor. You read and change the same file.

Nothing on the board is required, and no shape of plan is expected. It can be a system diagram, a
UML class diagram, a list of decisions, a mockup, a checklist, or all of that together on the same
canvas. Follow what the person is doing with it.

## How you use it

- **Read `board.hunch` and `boards/` before you start.** They say what the person has in mind.
- **Open the files it names.** `src=assets/spec.md` is a real file next to the board: read it. An
  image is a real image: look at it.
- **When the plan changes, change the board.** Edit the lines, keep the keys, and say what changed.
  In a chat, give the changed lines in a ```hunch block so the person can paste them back.
- **Mark what you're unsure of** with `note "…" [question]` instead of stopping to ask. Don't invent
  a part or a rule as if it had been decided.
- **Write only what helps.** A short board that says what matters beats a complete one.
- **Don't write positions.** Hunch arranges new boxes. `@layout` lines are written by Hunch; leave
  the ones that exist.

## The language

One statement per line. `//` starts a comment. Strings are in double quotes; escape `"` and `\` with
a backslash, and write a new line as `\n`. `""` skips a string you don't need.

| Statement | Meaning |
|---|---|
| `title Name` | The title of the board. |
| `key: Type "Title" "Technology" "Text" [name=value]` | A box of any type. The key names it everywhere else: short, lowercase, stable. |
| `a => b "label" "technology"` | An arrow: a call. |
| `a --> b "label"` | An arrow: a message nobody waits for. |
| `a ..> b "label"` | An arrow: planned or optional. |
| `a -\|> b` | UML: implements (dashed, hollow triangle). |
| `a => b [extends]` · `[aggregation]` · `[composition]` | UML: inheritance, and the two diamonds on the side of the whole (`a`). |
| `a => b [both]` · `[none]` | Arrow heads on both ends, or none. |
| `frame "Name" [kind=cloud]: a, b` | A boundary around boxes. Kinds: `docker`, `kubernetes`, `network`, `cloud`, `context`, `team`, `trust`. |
| `flow "Name": a => b "label", b => c` | A named path through arrows that exist. It plays on the board. |
| `note "…"` | A sticky note. Add `[decision status=proposed\|accepted\|superseded context="…" consequences="…"]`, `[question]` or `[out-of-scope]`. |
| `text "…"` | A free label. |
| `type "Fraud scorer" [like=service shape=hexagon color=#ff8787]` | A type of your own, used like any other: `fs: Fraud scorer "Risk"`. |
| `  entity Order(id uuid pk, userId uuid fk=User.id)` | On the line after a box: a table it owns. |
| `  endpoint POST /orders "Create an order"` | On the line after a box: an operation of its API. |
| `  link repo "https://…"` | On the line after a box: `repo`, `dashboard`, `runbook`, `docs` or `other`. |

| `inside api boards/api.hunch` | The board drawn inside the box `api`. See "A diagram inside a diagram". |

**Attributes.** A box takes any `[name=value]` and keeps it, so write what is useful (`[team=core
managed]`). Hunch itself reads `status=planned|building|live|deprecated`, `owner=`, `cloud=`,
`path=src/orders` (the code it stands for), `tags=a,b` and `src=`.

**Lines from older versions.** `requirement`, `nfr`, `simulate`, `style`, `rule`, `inside`, `story`,
`screen` and others are no longer read. A file that has them still opens and saving keeps them, under
a comment at the end. You don't need to write them, and you can delete them if the person agrees.

## A diagram inside a diagram

Any box can open into a board of its own. The outer file stays the map; the inner file is what that box contains, and it can hold anything a board holds. Do it in this order.

1. On `board.hunch`, give the box a key: `api: Service "Orders" "Go"`.
2. On the same file, one line links it: `inside api boards/api.hunch`. The word before the path is the box's key. The path starts at the folder that holds `board.hunch`, whichever file the line is in.
3. Create `boards/api.hunch`. It is a whole board, not a note.
4. A box on that board goes one level down, in its own file: on `boards/api.hunch` write `inside db boards/api/db.hunch`, and create that file. Two levels is usually enough.

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

The box shows **Open inside**, and the inner board shows the boards above it with one click back up, on the site and in the editor. `check` warns about a line whose file is missing and a file in `boards/` that no box links to. Files on an inner board are named from its own folder (`boards/assets/…`).

## What can go on the board

Use the label or the id as the `Type`. An unknown type becomes a `Service`, with a warning.

### Files

| Type | Id | What it shows |
|---|---|---|
| Image file | `image-file` | The picture. |
| Text file | `text-file` | The first lines of a `.txt`, `.md` or other text file. |
| File | `file` | A card with the name, that opens the file. Any type: PDF, zip, spreadsheet. |
| Bookmark | `bookmark` | A link. The address is the text: `doc: Bookmark "Spec" "" "https://…"`. |

`src` is a path inside the board's folder, or an `https://` address. Never `..` or an absolute path.
To add a file, copy it into `assets/` and write the line:

```hunch
logo: Image file "Logo" [src=assets/logo.png]
spec: Text file "Spec" [src=assets/spec.md]
```

### Decisions

| Type | Id | Use for |
|---|---|---|
| Decision | `decision` | A diamond: a choice with paths out of it. Label each arrow. |
| Decision record | `decision-record` | A choice made: what and why. |
| Option | `option` | One of the alternatives. |

```hunch
store: Decision "Which database?"
pg: Option "Postgres" "" "Transactions, joins"
mongo: Option "Mongo" "" "Flexible documents"
chosen: Decision record "Postgres" "" "Orders and payments change together" [status=live]
store => pg
store => mongo
pg => chosen "chosen"
```

### Flowchart

`Start / end` (`flow-terminal`), `Process` (`flow-process`), `Input / output` (`flow-io`),
`Document` (`flow-document`), and `Decision` for the branches.

### UML

| Type | Id | Notes |
|---|---|---|
| Class | `uml-class` | The text is its parts, split by a `--` line. |
| Interface | `uml-interface` | Same. |
| Enum | `uml-enum` | One value per line. |
| Actor | `uml-actor` | A person or a system outside. |
| UML use case | `uml-usecase` | |
| Package | `uml-package` | |
| UML component | `uml-component` | |
| State | `uml-state` | With `Initial state` (`uml-initial`) and `Final state` (`uml-final`). |
| Lifeline | `uml-lifeline` | An object in a sequence. |

```hunch
order: Class "Order" "" "+id: uuid\n+status: Status\n--\n+total(): Money"
item: Class "Item" "" "+price: Money"
base: Class "Entity" "" "+id: uuid"
repo: Interface "OrderRepository" "" "+save(order): void"
pg: Class "PgOrderRepository"
order => item "has" [composition]
order => base [extends]
pg -|> repo
```

### Notes and lists

`Checklist` (`checklist`) has one item per line, `[ ]` or `[x]`, ticked right on the card. `Code`
(`code-snippet`) shows its text in a fixed-width face; the technology is the language.

```hunch
launch: Checklist "Launch" "" "[x] Domain\n[ ] Billing"
call: Code "Calling the API" "TypeScript" "await api.post('/orders', order);"
```

`Data table` (`data-table`) has one row per line, cells split by `|`, the first line the header.
`DB table` (`db-table`) has one column per line: `id uuid pk`. `Milestone`, `Risk`, `Idea`,
`Assumption`, `Metric` and `Team` say what they are.

```hunch
compare: Data table "Where to start" "" "Channel | Effort\nTelegram | Low\nOwn app | High"
orders: DB table "orders" "" "id uuid pk\nstatus text"
limits: Risk "Rate limits" "" "Telegram caps messages per second"
```

### Domain and events

`Domain event`, `Command`, `Aggregate`, `Policy`, `Read model`, `Saga`, `Bounded context`, for event storming and DDD.

### C4

`C4 person`, `C4 system`, `C4 container`, `C4 component`.

### Network and hardware

`Server`, `Data center`, `Region`, `Availability zone`, `Subnet`, `Router`, `Switch`, `NAT gateway`, `Wi-Fi`.

### Screens

A screen is a frame with a device, holding elements: `frame "Cart" [device=mobile route="/cart"
empty="Your cart is empty"]: total, pay`. Devices: `mobile`, `tablet`, `desktop`.

Elements: `Heading`, `Paragraph`, `Label`, `Link`, `Button`, `Icon button`, `Text input`, `Email
input`, `Password input`, `Number input`, `Text area`, `Select`, `Checkbox`, `Radio group`, `Toggle`,
`Slider`, `Date picker`, `Time picker`, `File upload`, `Search`, `Image`, `Avatar`, `Badge`, `Tag`,
`Divider`, `Card`, `Table`, `List`, `Stat`, `Chart`, `Progress bar`, `Empty state`, `Top bar`,
`Sidebar`, `Tabs`, `Bottom tabs`, `Menu`, `Alert`, `Toast`, `Modal`, `Panel`, `Row`, `Column`, `Grid`,
`Section`. They take `[primary]` or `[danger]`, `placeholder="…"`, `options="One|Two"`, `required`,
`goto=<screen>` (the screen's title in lowercase with hyphens), `calls="POST /orders"`, `field=Order.email`.

```hunch
total: Stat "Total $68"
pay: Button "Checkout" [primary goto=checkout]
frame "Cart" [device=mobile route="/cart"]: total, pay
paid: Heading "Paid"
frame "Checkout" [device=mobile route="/checkout"]: paid
```

### Technologies

Any technology works as a type, with its logo: `alerts: Telegram "Alerts"`, `pay: Stripe "Checkout"`,
`bot: WhatsApp "Orders"`, `db: PostgreSQL "Orders"`, `q: Kafka "Events"`, `ai: OpenAI "Summaries"`. It becomes
the usual type of that technology. Or write the type and name the technology: `api: Service "Orders" "Go"`.
Slack, AWS, Azure, OpenAI, Twilio and a few others draw a plain dot in their color: their marks aren't free to use.

### Boxes of a system

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

## All together

```hunch
title Bookings

client: User "Client"
app: Monolith "Bookings" "Next.js" "Pages and the API in one deploy"
  endpoint POST /api/bookings "Create a booking"
db: Relational DB "Database" "Postgres"
  entity Booking(id uuid pk, startsAt timestamp)
mock: Image file "Booking screen" [src=assets/booking.png]
pay: Decision "Paid upfront?"
booking: Class "Booking" "" "+startsAt: Time\n--\n+cancel(): void"
launch: Checklist "Before launch" "" "[x] Domain\n[ ] Reminder emails"

client => app "books" "HTTPS"
app => db "SQL"
app => pay "new booking"
pay => booking "yes"
flow "Book": client => app "books", app => db "SQL"
note "One deployable until something needs to scale on its own." [decision status=accepted]
note "Do coaches set their own prices?" [question]
```

## From the terminal, and as an MCP server

One file, Node 20 or newer. `npx hunch-board` is the same file from npm.

```
npx hunch-board init             # board.hunch, this skill, and a note in AGENTS.md and CLAUDE.md
npx hunch-board check --json     # does every line read, and is every file on the board in the folder: { ok, issues }
npx hunch-board render           # the board as SVG, transparent background, so a chat can show it. Pass boards/api.hunch for that board
npx hunch-board search telegram  # boards other people shared, to learn from or start from
npx hunch-board clone order-bot  # copy a public board into a new folder
npx hunch-board mcp              # an MCP server: read_board, write_board, check_board, render_board, search_community, clone_board
```

## The community

People share boards at https://www.hunchboard.dev/community. Before designing something from nothing,
`search` for it: someone may have worked it out, and you can read how. If one fits, offer it to the person
and `clone` it only if they want it. To publish a board, the person presses Share on the site.

To show the drawing, run `render` (or the `render_board` tool) and display that SVG. Files show as
named cards there. In Claude Code: `claude mcp add hunch -- npx hunch-board mcp`.
