import type { ComponentShape } from "./componentShapes";

export type ComponentCategory =
  | "files"
  | "decision"
  | "flowchart"
  | "uml"
  | "notes"
  | "domain"
  | "c4"
  | "network"
  | "clients"
  | "frontend"
  | "edge"
  | "compute"
  | "data"
  | "messaging"
  | "ai"
  | "security"
  | "observability"
  | "devops"
  | "external"
  | "architecture"
  // UI sketch: the elements of a screen, in their own library.
  | "ui-shapes"
  | "ui-text"
  | "ui-actions"
  | "ui-inputs"
  | "ui-display"
  | "ui-navigation"
  | "ui-feedback"
  | "ui-layout";

export interface ComponentCategoryMeta {
  label: string;
  /** Category color = the legend: every box in a category shares it (Excalidraw dark palette). */
  accent: string;
}

export const COMPONENT_CATEGORIES: Record<ComponentCategory, ComponentCategoryMeta> = {
  files: { label: "Files", accent: "#4dabf7" },
  decision: { label: "Decisions", accent: "#fcc419" },
  flowchart: { label: "Flowchart", accent: "#20c997" },
  uml: { label: "UML", accent: "#da77f2" },
  notes: { label: "Notes & lists", accent: "#ff922b" },
  domain: { label: "Domain & events", accent: "#ffa8a8" },
  c4: { label: "C4", accent: "#91a7ff" },
  network: { label: "Network & hardware", accent: "#3bc9db" },
  clients: { label: "Clients & people", accent: "#b197fc" },
  frontend: { label: "Front-end", accent: "#e599f7" },
  edge: { label: "Edge & network", accent: "#66d9e8" },
  compute: { label: "Compute", accent: "#74c0fc" },
  data: { label: "Data & storage", accent: "#69db7c" },
  messaging: { label: "Messaging & events", accent: "#ffa94d" },
  ai: { label: "AI & ML", accent: "#f783ac" },
  security: { label: "Security & identity", accent: "#ff8787" },
  observability: { label: "Observability", accent: "#ffd43b" },
  devops: { label: "DevOps & delivery", accent: "#63e6be" },
  external: { label: "External & SaaS", accent: "#ced4da" },
  architecture: { label: "Code architecture", accent: "#a9e34b" },
  // The board's own palette: each group of a screen's elements has its color, like the diagram's categories.
  "ui-shapes": { label: "Shapes", accent: "#ced4da" },
  "ui-text": { label: "Text", accent: "#ffd43b" },
  "ui-actions": { label: "Actions", accent: "#74c0fc" },
  "ui-inputs": { label: "Inputs", accent: "#b197fc" },
  "ui-display": { label: "Display", accent: "#69db7c" },
  "ui-navigation": { label: "Navigation", accent: "#ffa94d" },
  "ui-feedback": { label: "Feedback", accent: "#ff8787" },
  "ui-layout": { label: "Layout", accent: "#868e96" },
};

/** Every group of the library, in order: one board holds all of them. */
export const COMPONENT_CATEGORY_ORDER: ComponentCategory[] = [
  "files",
  "decision",
  "flowchart",
  "uml",
  "notes",
  "domain",
  "c4",
  "network",
  "clients",
  "frontend",
  "edge",
  "compute",
  "data",
  "messaging",
  "ai",
  "security",
  "observability",
  "devops",
  "external",
  "architecture",
  "ui-shapes",
  "ui-text",
  "ui-actions",
  "ui-inputs",
  "ui-display",
  "ui-navigation",
  "ui-feedback",
  "ui-layout",
];

export interface ComponentTypeMeta {
  label: string;
  category: ComponentCategory;
  shape: ComponentShape;
  defaultTitle: string;
  /** Extra words the library search matches (vendors, synonyms). */
  keywords: string;
}

const t = (
  label: string,
  category: ComponentCategory,
  shape: ComponentShape,
  keywords = "",
  defaultTitle: string = label,
): ComponentTypeMeta => ({ label, category, shape, defaultTitle, keywords });

/**
 * Every component type a software diagram can use. The first ten ids are the
 * original set, kept stable because saved boards reference them.
 */
export const COMPONENT_CATALOG = {
  // files: what the person brings to the board; `src` says where it lives
  "image-file": t("Image file", "files", "box", "image picture photo screenshot png jpg svg upload", "Image"),
  "text-file": t("Text file", "files", "document", "txt md markdown notes readme upload file", "Text file"),
  file: t("File", "files", "document", "pdf attachment upload any document zip csv", "File"),
  bookmark: t("Bookmark", "files", "box", "url link website reference", "Link"),
  // decisions
  decision: t("Decision", "decision", "diamond", "choice branch if yes no question gateway", "Decide?"),
  "decision-record": t("Decision record", "decision", "double-box", "adr choice outcome why trade-off", "We chose…"),
  option: t("Option", "decision", "pill", "alternative candidate pros cons", "Option"),
  // flowchart
  "flow-terminal": t("Start / end", "flowchart", "pill", "begin finish terminator", "Start"),
  "flow-process": t("Process", "flowchart", "box", "step action task", "Step"),
  "flow-io": t("Input / output", "flowchart", "parallelogram", "data read write", "Input"),
  "flow-document": t("Document", "flowchart", "document", "report paper output", "Document"),
  // UML
  "uml-class": t("Class", "uml", "box", "uml attributes methods object", "Class"),
  "uml-interface": t("Interface", "uml", "dashed-box", "uml contract protocol", "Interface"),
  "uml-enum": t("Enum", "uml", "box", "uml enumeration values", "Enum"),
  "uml-actor": t("Actor", "uml", "actor", "uml use case person role", "Actor"),
  "uml-usecase": t("UML use case", "uml", "ellipse", "uml goal behavior", "Use case"),
  "uml-package": t("Package", "uml", "folder", "uml namespace module group", "Package"),
  "uml-component": t("UML component", "uml", "double-box", "uml module part", "Component"),
  "uml-state": t("State", "uml", "pill", "uml state machine status", "State"),
  "uml-initial": t("Initial state", "uml", "dot", "uml start begin state machine", ""),
  "uml-final": t("Final state", "uml", "ring", "uml end stop state machine", ""),
  "uml-lifeline": t("Lifeline", "uml", "lifeline", "uml sequence object participant", "Object"),
  // notes and lists
  checklist: t("Checklist", "notes", "box", "todo tasks list done", "To do"),
  "code-snippet": t("Code", "notes", "box", "snippet source example monospace", "Code"),
  "data-table": t("Data table", "notes", "box", "grid rows columns spreadsheet compare", "Table"),
  "db-table": t("DB table", "notes", "box", "erd entity schema columns sql model", "table"),
  milestone: t("Milestone", "notes", "pill", "date deadline release roadmap", "Milestone"),
  risk: t("Risk", "notes", "octagon", "danger problem concern threat", "Risk"),
  idea: t("Idea", "notes", "cloud", "thought brainstorm hypothesis", "Idea"),
  assumption: t("Assumption", "notes", "dashed-box", "premise hypothesis unknown", "We assume…"),
  metric: t("Metric", "notes", "box", "kpi number goal target measure", "Metric"),
  team: t("Team", "notes", "pill", "people squad owner group", "Team"),
  // domain-driven design and event storming
  "domain-event": t("Domain event", "domain", "box", "event storming ddd something happened", "Order placed"),
  "domain-command": t("Command", "domain", "box", "event storming ddd intent action", "Place order"),
  aggregate: t("Aggregate", "domain", "double-box", "ddd consistency root", "Order"),
  "domain-policy": t("Policy", "domain", "hexagon", "event storming whenever then reaction", "When paid, ship"),
  "read-model": t("Read model", "domain", "document", "cqrs projection view query", "Order list"),
  saga: t("Saga", "domain", "stack", "process manager compensation long-running", "Checkout saga"),
  "bounded-context": t("Bounded context", "domain", "dashed-box", "ddd subdomain language boundary", "Billing"),
  // C4 model
  "c4-person": t("C4 person", "c4", "pill", "c4 user actor", "Person"),
  "c4-system": t("C4 system", "c4", "double-box", "c4 software system context", "System"),
  "c4-container": t("C4 container", "c4", "box", "c4 application data store", "Container"),
  "c4-component": t("C4 component", "c4", "dashed-box", "c4 module part", "Component"),
  // network and hardware
  server: t("Server", "network", "stack", "bare metal host machine physical", "Server"),
  datacenter: t("Data center", "network", "folder", "on-prem colocation rack site", "Data center"),
  region: t("Region", "network", "dashed-box", "cloud geography availability", "Region"),
  "availability-zone": t("Availability zone", "network", "dashed-box", "az failure domain", "Zone A"),
  subnet: t("Subnet", "network", "dashed-box", "private public cidr", "Subnet"),
  router: t("Router", "network", "hexagon", "route gateway internet nat", "Router"),
  "network-switch": t("Switch", "network", "box", "lan ethernet", "Switch"),
  "nat-gateway": t("NAT gateway", "network", "hexagon", "egress outbound", "NAT"),
  wifi: t("Wi-Fi", "network", "pill", "wireless access point", "Wi-Fi"),
  // more ways people reach a product
  wearable: t("Wearable", "clients", "mobile", "watch smartwatch", "Watch"),
  "smart-tv": t("Smart TV", "clients", "browser", "television streaming", "TV app"),
  "voice-assistant": t("Voice assistant", "clients", "pill", "alexa siri google home speaker", "Voice"),
  "game-console": t("Game console", "clients", "box", "playstation xbox nintendo", "Console"),
  // more parts of a system
  "rest-api": t("REST API", "compute", "box", "http json endpoint", "REST API"),
  "grpc-service": t("gRPC service", "compute", "box", "protobuf rpc", "gRPC service"),
  "phone-call": t("Phone / IVR", "messaging", "pill", "voice call sms telephony", "Phone line"),
  "video-call": t("Video call", "messaging", "pill", "meeting conference webrtc stream", "Video call"),
  "kms": t("KMS", "security", "octagon", "encryption keys crypto", "Keys"),
  sso: t("SSO", "security", "box", "saml single sign-on oidc", "SSO"),
  prompt: t("Prompt", "ai", "document", "system prompt template instructions", "Prompt"),
  "rag-pipeline": t("RAG pipeline", "ai", "stack", "retrieval augmented chunks documents", "RAG"),
  "agent-tool": t("Agent tool", "ai", "box", "function calling action", "Tool"),
  "agent-memory": t("Agent memory", "ai", "cylinder", "context history long-term", "Memory"),
  // original ids (do not rename)
  service: t("Service", "compute", "box", "backend api server app", "Service"),
  database: t("Relational DB", "data", "cylinder", "sql postgres postgresql mysql mariadb sql server oracle aurora", "Database"),
  queue: t("Message queue", "messaging", "queue", "sqs rabbitmq amqp activemq job queue", "Queue"),
  cache: t("Cache", "data", "double-box", "redis memcached in-memory valkey", "Cache"),
  client: t("Web app", "clients", "browser", "frontend spa react next vue angular browser site", "Web app"),
  user: t("User", "clients", "pill", "person actor customer end user", "User"),
  external: t("External API", "external", "dashed-box", "third party integration rest", "External API"),
  storage: t("Object storage", "data", "bucket", "s3 gcs blob azure bucket files assets", "Object storage"),
  function: t("Serverless function", "compute", "hexagon", "lambda cloud function faas azure functions edge function", "Function"),
  gateway: t("API gateway", "edge", "hexagon", "kong apigee api management bff", "API Gateway"),

  // clients & people
  "mobile-app": t("Mobile app", "clients", "mobile", "ios android react native flutter", "Mobile app"),
  "desktop-app": t("Desktop app", "clients", "browser", "electron native windows mac", "Desktop app"),
  admin: t("Admin / operator", "clients", "pill", "backoffice staff internal user support", "Admin"),
  "iot-device": t("IoT device", "clients", "octagon", "sensor embedded edge device hardware", "Device"),
  cli: t("CLI / SDK", "clients", "box", "terminal command line sdk library", "CLI"),
  "browser-extension": t("Browser extension", "clients", "browser", "chrome extension firefox addon plugin", "Extension"),
  "chat-channel": t("Chat channel", "clients", "pill", "whatsapp telegram slack discord messenger chatbot channel", "Chat channel"),
  "pos-kiosk": t("POS / kiosk", "clients", "box", "point of sale kiosk terminal totem", "POS"),

  // front-end (front-end system design, design systems)
  "design-tokens": t("Design tokens", "frontend", "document", "tokens theme colors spacing typography style dictionary figma variables", "Design tokens"),
  "component-library": t("Component library", "frontend", "stack", "design system ui kit react components npm package", "Component library"),
  "docs-site": t("Docs / Storybook", "frontend", "browser", "storybook documentation docs site playground", "Docs site"),
  bff: t("Backend for frontend", "frontend", "hexagon", "bff graphql aggregation api layer edge api", "BFF"),
  "client-state": t("Client state / cache", "frontend", "double-box", "redux zustand react query tanstack apollo cache store", "Client state"),
  "service-worker": t("Service worker", "frontend", "box", "offline pwa cache workbox push", "Service worker"),
  "micro-frontend": t("Micro-frontend", "frontend", "browser", "module federation mfe shell remote", "Micro-frontend"),
  analytics: t("Product analytics", "frontend", "box", "analytics segment amplitude mixpanel posthog tracking events rum", "Analytics"),
  cms: t("Headless CMS", "frontend", "document", "contentful sanity strapi wordpress payload cms content", "CMS"),
  "static-site": t("Static site", "frontend", "browser", "ssg astro hugo jekyll gatsby landing page docs", "Static site"),
  widget: t("Embeddable widget", "frontend", "box", "embed widget iframe snippet web component", "Widget"),

  // edge & network
  internet: t("Internet", "edge", "cloud", "public web www", "Internet"),
  dns: t("DNS", "edge", "box", "route53 cloudflare domain", "DNS"),
  cdn: t("CDN", "edge", "cloud", "cloudfront cloudflare fastly akamai edge cache", "CDN"),
  "load-balancer": t("Load balancer", "edge", "hexagon", "alb elb nlb haproxy nginx traffic", "Load balancer"),
  "reverse-proxy": t("Reverse proxy", "edge", "box", "nginx envoy traefik ingress", "Reverse proxy"),
  "service-mesh": t("Service mesh", "edge", "stack", "istio linkerd envoy sidecar", "Service mesh"),
  vpc: t("Network / VPC", "edge", "dashed-box", "subnet vnet private network", "VPC"),
  "rate-limiter": t("Rate limiter", "edge", "hexagon", "throttle quota rate limit token bucket", "Rate limiter"),
  "proxy-pool": t("Proxy pool", "edge", "stack", "rotating proxies residential proxy brightdata scraping ip", "Proxy pool"),

  // compute
  microservice: t("Microservice", "compute", "hexagon", "domain service bounded context", "Microservice"),
  monolith: t("Monolith", "compute", "box", "legacy app rails django laravel spring", "Monolith"),
  container: t("Container", "compute", "box", "docker image pod", "Container"),
  kubernetes: t("Kubernetes cluster", "compute", "stack", "k8s eks gke aks pods cluster", "Kubernetes"),
  worker: t("Worker pool", "compute", "stack", "background jobs consumers sidekiq celery bullmq", "Workers"),
  "cron-job": t("Scheduled job", "compute", "box", "cron scheduler batch nightly", "Cron job"),
  vm: t("Virtual machine", "compute", "box", "ec2 compute engine server host", "VM"),
  "web-scraper": t("Web scraper / crawler", "compute", "stack", "scraper crawler spider scrapy crawlee beautifulsoup apify harvest", "Scraper"),
  "headless-browser": t("Headless browser", "compute", "browser", "playwright puppeteer selenium chromium browserless rendering", "Headless browser"),
  "batch-job": t("Batch job", "compute", "stack", "batch spark job aws batch dataflow backfill", "Batch job"),
  "workflow-engine": t("Workflow engine", "compute", "parallelogram", "temporal step functions n8n zapier inngest trigger.dev durable orchestration saga", "Workflow"),
  "edge-function": t("Edge function", "compute", "hexagon", "cloudflare workers vercel edge lambda@edge deno deploy", "Edge function"),
  "realtime-server": t("WebSocket / realtime server", "compute", "box", "websocket socket.io sse realtime live server", "Realtime server"),
  "graphql-server": t("GraphQL API", "compute", "hexagon", "graphql apollo hasura federation", "GraphQL API"),
  bot: t("Bot", "compute", "box", "discord bot slack bot telegram bot automation", "Bot"),
  "media-processor": t("Media processor", "compute", "stack", "ffmpeg transcoder image resize thumbnail video audio sharp imgproxy", "Media processor"),
  "doc-generator": t("Document generator", "compute", "document", "pdf report invoice generator", "PDF generator"),
  "rules-engine": t("Rules engine", "compute", "box", "rules decision engine pricing eligibility drools", "Rules engine"),
  "game-server": t("Game server", "compute", "box", "multiplayer game server matchmaking", "Game server"),

  // data & storage
  "document-db": t("Document DB", "data", "cylinder", "mongodb dynamodb firestore couchdb nosql", "Document DB"),
  "key-value": t("Key-value store", "data", "cylinder", "dynamodb etcd consul kv", "KV store"),
  "graph-db": t("Graph DB", "data", "cylinder", "neo4j neptune graph", "Graph DB"),
  "timeseries-db": t("Time-series DB", "data", "cylinder", "influxdb timescale prometheus tsdb", "Time-series DB"),
  "search-index": t("Search index", "data", "cylinder", "elasticsearch opensearch algolia meilisearch solr", "Search"),
  warehouse: t("Data warehouse", "data", "cylinder", "snowflake bigquery redshift databricks analytics olap", "Warehouse"),
  "data-lake": t("Data lake", "data", "bucket", "lakehouse delta iceberg parquet", "Data lake"),
  "file-storage": t("File storage", "data", "folder", "nfs efs shared drive disk", "File storage"),
  "etl-pipeline": t("ETL / data pipeline", "data", "parallelogram", "airflow dbt spark fivetran batch transform", "Pipeline"),
  spreadsheet: t("Spreadsheet", "data", "document", "google sheets excel airtable notion nocode database", "Spreadsheet"),
  "geo-index": t("Geospatial index", "data", "cylinder", "postgis h3 geohash redis geo location nearby", "Geo index"),
  ledger: t("Ledger", "data", "cylinder", "ledger double entry accounting balances immutable blockchain", "Ledger"),
  cdc: t("Change data capture", "data", "parallelogram", "cdc debezium binlog wal replication outbox", "CDC"),
  backup: t("Backup vault", "data", "bucket", "backup snapshot restore pitr vault", "Backups"),

  // messaging & events
  "event-stream": t("Event stream", "messaging", "queue", "kafka kinesis pulsar redpanda log", "Event stream"),
  topic: t("Pub/sub topic", "messaging", "queue", "sns pubsub fanout broadcast", "Topic"),
  "event-bus": t("Event bus", "messaging", "parallelogram", "eventbridge event router", "Event bus"),
  "stream-processor": t("Stream processor", "messaging", "parallelogram", "flink kafka streams spark streaming", "Stream processor"),
  webhook: t("Webhook", "messaging", "box", "callback http push", "Webhook"),
  notification: t("Email / SMS / push", "messaging", "box", "notifications email sms push ses twilio", "Notifications"),
  "realtime-channel": t("Realtime channel", "messaging", "queue", "pusher ably supabase realtime pubnub channel", "Realtime channel"),
  "mqtt-broker": t("MQTT broker", "messaging", "queue", "mqtt iot mosquitto emqx hivemq", "MQTT broker"),
  "dead-letter-queue": t("Dead-letter queue", "messaging", "queue", "dlq dead letter poison retry", "DLQ"),
  "inbound-email": t("Inbound email", "messaging", "box", "email parsing inbound routes", "Inbound email"),

  // AI & ML
  llm: t("LLM", "ai", "hexagon", "gpt claude model language model openai anthropic", "LLM"),
  "ai-agent": t("AI agent", "ai", "hexagon", "agent assistant tool use copilot", "Agent"),
  "ml-model": t("ML model", "ai", "hexagon", "inference classifier recommender", "Model"),
  "vector-db": t("Vector DB", "ai", "cylinder", "pinecone weaviate qdrant pgvector embeddings rag", "Vector DB"),
  embeddings: t("Embeddings", "ai", "box", "embedding encoder vectorize", "Embeddings"),
  "feature-store": t("Feature store", "ai", "cylinder", "feast features", "Feature store"),
  "training-pipeline": t("Training pipeline", "ai", "parallelogram", "mlops fine-tune sagemaker vertex", "Training"),
  ocr: t("OCR / document AI", "ai", "document", "ocr textract document ai tesseract extraction invoices", "OCR"),
  speech: t("Speech (STT / TTS)", "ai", "box", "speech to text whisper transcription tts voice elevenlabs deepgram", "Speech"),
  "image-gen": t("Image generation", "ai", "hexagon", "stable diffusion dall-e midjourney flux image generation", "Image generation"),
  "llm-gateway": t("LLM gateway", "ai", "hexagon", "openrouter litellm portkey ai gateway routing fallback cost", "LLM gateway"),
  guardrails: t("Guardrails / evals", "ai", "octagon", "guardrails moderation evals safety filter", "Guardrails"),
  "mcp-server": t("MCP server", "ai", "box", "mcp model context protocol tools claude", "MCP server"),

  // security & identity
  "auth-provider": t("Identity provider", "security", "octagon", "auth0 cognito okta keycloak oauth oidc sso login", "Auth"),
  firewall: t("Firewall / WAF", "security", "octagon", "waf security group ddos", "Firewall"),
  secrets: t("Secrets manager", "security", "octagon", "vault kms keys credentials", "Secrets"),
  iam: t("IAM / policies", "security", "octagon", "roles permissions rbac access", "IAM"),
  certificate: t("Certificate", "security", "document", "tls ssl cert acm", "Certificate"),
  captcha: t("CAPTCHA / bot protection", "security", "octagon", "captcha turnstile recaptcha hcaptcha bot protection", "CAPTCHA"),
  "audit-log": t("Audit log", "security", "document", "audit trail compliance who did what", "Audit log"),
  fraud: t("Fraud detection", "security", "octagon", "fraud risk scoring sift radar", "Fraud detection"),
  vpn: t("VPN / bastion", "security", "octagon", "vpn bastion tailscale wireguard jump host zero trust", "VPN"),

  // observability
  logs: t("Logs", "observability", "document", "logging loki elk cloudwatch splunk", "Logs"),
  metrics: t("Metrics", "observability", "box", "prometheus grafana datadog statsd", "Metrics"),
  tracing: t("Tracing", "observability", "box", "opentelemetry jaeger tempo apm", "Tracing"),
  alerting: t("Alerting / on-call", "observability", "box", "pagerduty opsgenie alerts incidents", "Alerts"),
  dashboard: t("Dashboard", "observability", "browser", "grafana kibana dashboards bi", "Dashboard"),
  "error-tracking": t("Error tracking", "observability", "box", "sentry bugsnag rollbar exceptions crash", "Error tracking"),
  "uptime-monitor": t("Uptime monitor", "observability", "box", "uptime pingdom betterstack health check synthetic", "Uptime"),
  "status-page": t("Status page", "observability", "browser", "status page instatus incidents", "Status page"),

  // devops & delivery
  repo: t("Git repository", "devops", "folder", "github gitlab bitbucket source code", "Repo"),
  "ci-cd": t("CI/CD pipeline", "devops", "parallelogram", "github actions jenkins circleci deploy build", "CI/CD"),
  registry: t("Artifact registry", "devops", "stack", "docker registry ecr npm artifacts packages", "Registry"),
  iac: t("Infrastructure as code", "devops", "document", "terraform pulumi cloudformation", "IaC"),
  "feature-flags": t("Feature flags", "devops", "box", "launchdarkly unleash toggles experiments", "Feature flags"),
  config: t("Config file", "devops", "document", "yaml env settings configuration", "Config"),
  "preview-env": t("Preview environments", "devops", "stack", "preview deploys staging review apps", "Previews"),
  "load-test": t("Load testing", "devops", "box", "k6 locust jmeter gatling load test", "Load test"),

  // external & SaaS
  "payment-provider": t("Payment provider", "external", "dashed-box", "stripe adyen paypal checkout billing", "Payments"),
  saas: t("SaaS tool", "external", "dashed-box", "salesforce hubspot zendesk slack", "SaaS"),
  "legacy-system": t("Legacy system", "external", "dashed-box", "mainframe erp sap old", "Legacy system"),
  partner: t("Partner system", "external", "dashed-box", "b2b partner vendor", "Partner"),
  "cloud-provider": t("Cloud provider", "external", "cloud", "aws gcp azure", "Cloud"),
  "target-website": t("Target website", "external", "dashed-box", "website to scrape external site source page", "Target site"),
  "maps-api": t("Maps / geocoding API", "external", "dashed-box", "google maps mapbox geocoding routing places", "Maps API"),
  "ecommerce-platform": t("E-commerce platform", "external", "dashed-box", "shopify woocommerce vtex magento", "E-commerce"),
  "social-api": t("Social media API", "external", "dashed-box", "twitter x meta instagram facebook linkedin tiktok youtube", "Social API"),
  esign: t("E-signature", "external", "dashed-box", "docusign clicksign dropbox sign", "E-signature"),
  "banking-api": t("Banking / open finance", "external", "dashed-box", "plaid belvo open banking pix", "Banking API"),
  // code architecture: the inside of an app (modules, layers, ports and adapters)
  module: t("Module", "architecture", "folder", "folder package directory code module", "Module"),
  "route-handler": t("Route / handler", "architecture", "parallelogram", "controller endpoint http handler api route next route.ts", "Route"),
  middleware: t("Middleware", "architecture", "octagon", "auth guard interceptor rate limit cors", "Middleware"),
  validator: t("Validator", "architecture", "octagon", "zod yup schema dto validation input", "Validator"),
  "use-case": t("Use case", "architecture", "box", "interactor application service command handler function business logic", "Use case"),
  "domain-entity": t("Entity", "architecture", "document", "domain model aggregate business rules", "Entity"),
  "value-object": t("Value object", "architecture", "pill", "money email immutable domain type", "Value object"),
  port: t("Interface (port)", "architecture", "dashed-box", "interface contract port abstraction gateway type", "Interface"),
  repository: t("Repository", "architecture", "double-box", "data access dao orm prisma drizzle typeorm", "Repository"),
  adapter: t("Adapter", "architecture", "double-box", "client sdk http client integration implementation", "Adapter"),
  "db-connection": t("DB connection", "architecture", "stack", "pool client prisma pg connection pool driver", "DB connection"),
  publisher: t("Event publisher", "architecture", "queue", "emitter producer outbox publish", "Publisher"),
  "event-handler": t("Event handler", "architecture", "box", "consumer subscriber listener job handler", "Event handler"),
  "composition-root": t("Composition root", "architecture", "folder", "dependency injection container wiring di bootstrap main", "Composition root"),
  "server-action": t("Server action", "architecture", "parallelogram", "next.js server action rpc mutation", "Server action"),
  page: t("Page", "architecture", "browser", "route screen view next page.tsx app router", "Page"),
  "ui-widget": t("Widget", "architecture", "box", "feature-sliced widget section block composite component", "Widget"),
  feature: t("Feature", "architecture", "box", "feature-sliced user action interaction", "Feature"),
  "ui-entity": t("UI entity", "architecture", "document", "feature-sliced entity model card type", "UI entity"),
  "shared-module": t("Shared", "architecture", "folder", "shared ui kit utils lib helpers common", "Shared"),
  "test-suite": t("Test suite", "architecture", "document", "tests vitest jest playwright spec", "Tests"),

  // UI sketch: shapes
  "el-rect": t("Rectangle", "ui-shapes", "box", "box square block shape", "Rectangle"),
  "el-ellipse": t("Ellipse", "ui-shapes", "box", "circle oval round shape", "Ellipse"),
  "el-line": t("Line", "ui-shapes", "box", "rule stroke", "Line"),
  "el-arrow": t("Arrow", "ui-shapes", "box", "pointer direction", "Arrow"),
  "el-text": t("Text", "ui-shapes", "box", "free text words copy", "Text"),
  // text
  "el-heading": t("Heading", "ui-text", "box", "title h1 h2 h3 headline", "Heading"),
  "el-paragraph": t("Paragraph", "ui-text", "box", "body copy text description", "Some text that explains this screen."),
  "el-label": t("Label", "ui-text", "box", "caption small text", "Label"),
  "el-link": t("Link", "ui-text", "box", "anchor href url", "Link"),
  // actions
  "el-button": t("Button", "ui-actions", "box", "cta submit action primary secondary", "Button"),
  "el-icon-button": t("Icon button", "ui-actions", "box", "icon action fab", "Icon"),
  "el-button-group": t("Button group", "ui-actions", "box", "segmented toolbar actions", "Buttons"),
  // inputs
  "el-input": t("Text input", "ui-inputs", "box", "field textbox form input", "Name"),
  "el-email": t("Email input", "ui-inputs", "box", "email field form", "Email"),
  "el-password": t("Password input", "ui-inputs", "box", "password secret field form", "Password"),
  "el-number": t("Number input", "ui-inputs", "box", "number quantity amount field", "Amount"),
  "el-textarea": t("Text area", "ui-inputs", "box", "multiline comment notes field", "Notes"),
  "el-select": t("Select", "ui-inputs", "box", "dropdown picker choose options", "Choose one"),
  "el-combobox": t("Combobox", "ui-inputs", "box", "autocomplete typeahead search select", "Search and pick"),
  "el-checkbox": t("Checkbox", "ui-inputs", "box", "check tick agree", "I agree"),
  "el-radio": t("Radio group", "ui-inputs", "box", "radio options choose one", "Pick one"),
  "el-toggle": t("Toggle", "ui-inputs", "box", "switch on off", "Notifications"),
  "el-slider": t("Slider", "ui-inputs", "box", "range volume", "Range"),
  "el-date": t("Date picker", "ui-inputs", "box", "date calendar day", "Date"),
  "el-time": t("Time picker", "ui-inputs", "box", "time hour clock", "Time"),
  "el-upload": t("File upload", "ui-inputs", "box", "upload file drop attach image", "Upload a file"),
  "el-search": t("Search", "ui-inputs", "box", "search find filter query", "Search"),
  // display
  "el-image": t("Image", "ui-display", "box", "picture photo illustration media", "Image"),
  "el-avatar": t("Avatar", "ui-display", "box", "profile picture user photo", "Avatar"),
  "el-icon": t("Icon", "ui-display", "box", "symbol glyph", "Icon"),
  "el-badge": t("Badge", "ui-display", "box", "count status pill", "New"),
  "el-tag": t("Tag", "ui-display", "box", "chip label category", "Tag"),
  "el-divider": t("Divider", "ui-display", "box", "separator hr line", "Divider"),
  "el-card": t("Card", "ui-display", "box", "tile panel item box", "Card"),
  "el-table": t("Table", "ui-display", "box", "grid rows columns data", "Table"),
  "el-list": t("List", "ui-display", "box", "items rows feed", "List"),
  "el-stat": t("Stat", "ui-display", "box", "number metric kpi big number", "1,234"),
  "el-chart": t("Chart", "ui-display", "box", "graph bars line plot", "Chart"),
  "el-progress": t("Progress bar", "ui-display", "box", "progress loading percent", "Progress"),
  "el-empty": t("Empty state", "ui-display", "box", "nothing yet placeholder zero", "Nothing here yet"),
  "el-skeleton": t("Skeleton", "ui-display", "box", "loading placeholder shimmer", "Loading"),
  // navigation
  "el-navbar": t("Top bar", "ui-navigation", "box", "navbar header app bar toolbar", "App name"),
  "el-sidebar": t("Sidebar", "ui-navigation", "box", "side nav menu drawer", "Menu"),
  "el-tabs": t("Tabs", "ui-navigation", "box", "tab bar segments", "Tabs"),
  "el-breadcrumb": t("Breadcrumb", "ui-navigation", "box", "path trail", "Home / Page"),
  "el-pagination": t("Pagination", "ui-navigation", "box", "pages next previous", "Pages"),
  "el-bottom-tabs": t("Bottom tabs", "ui-navigation", "box", "tab bar mobile navigation", "Tabs"),
  "el-menu": t("Menu", "ui-navigation", "box", "dropdown context menu options", "Menu"),
  // feedback
  "el-alert": t("Alert", "ui-feedback", "box", "banner warning error info message", "Something to know"),
  "el-toast": t("Toast", "ui-feedback", "box", "snackbar notification saved", "Saved"),
  "el-modal": t("Modal", "ui-feedback", "box", "dialog popup overlay sheet", "Are you sure?"),
  "el-tooltip": t("Tooltip", "ui-feedback", "box", "hint hover help", "A hint"),
  "el-spinner": t("Spinner", "ui-feedback", "box", "loading busy wait", "Loading"),
  // layout
  "el-container": t("Panel", "ui-layout", "box", "container box wrapper group", "Panel"),
  "el-stack": t("Column", "ui-layout", "box", "stack vertical column flex", "Column"),
  "el-row": t("Row", "ui-layout", "box", "stack horizontal row flex", "Row"),
  "el-grid": t("Grid", "ui-layout", "box", "grid columns tiles gallery", "Grid"),
  "el-section": t("Section", "ui-layout", "box", "section region block area", "Section"),
} satisfies Record<string, ComponentTypeMeta>;

export type ComponentVariantId = keyof typeof COMPONENT_CATALOG;

export const COMPONENT_IDS = Object.keys(COMPONENT_CATALOG) as ComponentVariantId[];

/** The types of a diagram (everything but the UI sketch's elements). */
export type DiagramVariantId = Exclude<ComponentVariantId, `el-${string}`>;
export type UiVariantId = Extract<ComponentVariantId, `el-${string}`>;
export const DIAGRAM_IDS = COMPONENT_IDS.filter((id): id is DiagramVariantId => !id.startsWith("el-"));
export const UI_IDS = COMPONENT_IDS.filter((id): id is UiVariantId => id.startsWith("el-"));
export const isUiVariant = (id: string): boolean => id.startsWith("el-");

/** Safe lookup: unknown ids (typos in an AI-generated board, future types) fall back to a plain service. */
export function componentType(id: string): ComponentTypeMeta {
  return (COMPONENT_CATALOG as Record<string, ComponentTypeMeta>)[id] ?? COMPONENT_CATALOG.service;
}

export function componentTypesByCategory(order: ComponentCategory[] = COMPONENT_CATEGORY_ORDER): Array<{ category: ComponentCategory; ids: ComponentVariantId[] }> {
  return order.map((category) => ({
    category,
    ids: COMPONENT_IDS.filter((id) => COMPONENT_CATALOG[id].category === category),
  }));
}

/** Library search over label, category and keywords (vendors like "postgres", "kafka", "stripe"). */
export function searchComponentTypes(query: string): ComponentVariantId[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return COMPONENT_IDS;
  return COMPONENT_IDS.filter((id) => {
    const meta = COMPONENT_CATALOG[id];
    const haystack = `${id} ${meta.label} ${COMPONENT_CATEGORIES[meta.category].label} ${meta.keywords}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/** Types that show a file: they carry `src`. */
export const isFileVariant = (id: string): boolean => id === "image-file" || id === "text-file" || id === "file";
