import {
  siTelegram,
  siWhatsapp,
  siDiscord,
  siSignal,
  siMessenger,
  siWechat,
  siLine,
  siViber,
  siMatrix,
  siMattermost,
  siZoom,
  siGooglemeet,
  siGmail,
  siInstagram,
  siFacebook,
  siX,
  siTiktok,
  siReddit,
  siYoutube,
  siTwitch,
  siPinterest,
  siBluesky,
  siMastodon,
  siThreads,
  siSnapchat,
  siSpotify,
  siNotion,
  siLinear,
  siJira,
  siConfluence,
  siTrello,
  siAsana,
  siFigma,
  siMiro,
  siZapier,
  siN8n,
  siMake,
  siAirtable,
  siGooglesheets,
  siGoogledrive,
  siDropbox,
  siGooglecalendar,
  siCalendly,
  siLoom,
  siHubspot,
  siZendesk,
  siIntercom,
  siShopify,
  siWoocommerce,
  siWordpress,
  siGooglemaps,
  siMapbox,
  siOpenstreetmap,
  siGoogleads,
  siGoogleanalytics,
  siMixpanel,
  siPosthog,
  siHotjar,
  siPlausibleanalytics,
  siResend,
  siCloudinary,
  siMercadopago,
  siRazorpay,
  siSquare,
  siPix,
  siClerk,
  siSnyk,
  siGooglegemini,
  siMistralai,
  siOllama,
  siPerplexity,
  siReplicate,
  siQdrant,
  siDatabricks,
  siMetabase,
  siLooker,
  siNeon,
  siBackblaze,
  siRailway,
  siRender,
  siFlydotio,
  siHetzner,
  siOvh,
  siVultr,
  siCaddy,
  siAnsible,
  siPulumi,
  siLinux,
  siUbuntu,
  siRaspberrypi,
  siArduino,
  siMqtt,
  siSocketdotio,
  siWebrtc,
  siTemporal,
  siCelery,
  siSidekiq,
  siDrizzle,
  siPostman,
  siSwagger,
  siOpenapiinitiative,
  siGit,
  siCypress,
  siSelenium,
  siJest,
  siVitest,
  siStorybook,
  siJaeger,
  siTailwindcss,
  siSolid,
  siHtmx,
  siAndroid,
  siIos,
  siAngular,
  siAnthropic,
  siApacheairflow,
  siApachecassandra,
  siApacheflink,
  siApachekafka,
  siApachepulsar,
  siApachespark,
  siApollographql,
  siArgo,
  siAstro,
  siAuth0,
  siBitbucket,
  siBun,
  siCircleci,
  siClickhouse,
  siCloudflare,
  siCockroachlabs,
  siConsul,
  siDatadog,
  siDeno,
  siDigitalocean,
  siDjango,
  siDocker,
  siDotnet,
  siElasticsearch,
  siElectron,
  siEnvoyproxy,
  siExpress,
  siFastapi,
  siFastify,
  siFirebase,
  siFlask,
  siFlutter,
  siGithub,
  siGithubactions,
  siGitlab,
  siGo,
  siGooglebigquery,
  siGooglecloud,
  siGrafana,
  siGraphql,
  siHelm,
  siHuggingface,
  siIstio,
  siJenkins,
  siKeycloak,
  siKibana,
  siKong,
  siKotlin,
  siKubernetes,
  siLangchain,
  siLaravel,
  siMailgun,
  siMariadb,
  siMinio,
  siMongodb,
  siMysql,
  siNeo4j,
  siNestjs,
  siNetlify,
  siNewrelic,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNuxt,
  siOkta,
  siOpensearch,
  siOpenjdk,
  siOpentelemetry,
  siPagerduty,
  siPaypal,
  siPhp,
  siPlanetscale,
  siPostgresql,
  siPrisma,
  siPrometheus,
  siPython,
  siPytorch,
  siRabbitmq,
  siReact,
  siRedis,
  siRemix,
  siRuby,
  siRubyonrails,
  siRust,
  siSentry,
  siSnowflake,
  siSplunk,
  siSpringboot,
  siSqlite,
  siStripe,
  siSupabase,
  siSvelte,
  siSwift,
  siTensorflow,
  siTerraform,
  siTraefikproxy,
  siTrpc,
  siTypescript,
  siVault,
  siVercel,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";

import type { ComponentVariantId } from "./componentCatalog";

export type TechGroup =
  | "Databases"
  | "Cache & search"
  | "Messaging"
  | "Cloud & hosting"
  | "Containers & infra"
  | "Backend"
  | "Frontend & mobile"
  | "DevOps"
  | "Observability"
  | "Auth & payments"
  | "AI & data"
  | "Chat & social"
  | "Apps & SaaS";

export const TECH_GROUP_ORDER: TechGroup[] = [
  "Databases",
  "Cache & search",
  "Messaging",
  "Backend",
  "Frontend & mobile",
  "Cloud & hosting",
  "Containers & infra",
  "DevOps",
  "Observability",
  "Auth & payments",
  "AI & data",
  "Chat & social",
  "Apps & SaaS",
];

export interface TechEntry {
  slug: string;
  icon: SimpleIcon;
  label: string;
  /** The component type a box of this tech usually is (Postgres → relational DB). */
  variant: ComponentVariantId;
  group: TechGroup;
  /** Words that identify it in free text ("postgres", "pg"…), used by auto-detection and search. */
  aliases: string[];
}

const e = (
  slug: string,
  icon: SimpleIcon,
  label: string,
  variant: ComponentVariantId,
  group: TechGroup,
  aliases: string[] = [],
): TechEntry => ({ slug, icon, label, variant, group, aliases });

/** A plain dot in the brand's color, for a brand whose mark isn't free to use. */
const plainMark = (hex: string): SimpleIcon => ({ title: "", slug: "", hex, source: "", svg: "", path: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z" }) as SimpleIcon;

/**
 * The most used technologies, with their logos (Simple Icons, CC0). Some big
 * brands (AWS, Azure, OpenAI, Slack, Twilio…) asked Simple Icons to remove
 * their marks: they are here, findable and typed, with a plain dot in their color.
 */
export const TECH_CATALOG: TechEntry[] = [
  // databases
  e("postgresql", siPostgresql, "PostgreSQL", "database", "Databases", ["postgres", "pg", "aurora postgres"]),
  e("mysql", siMysql, "MySQL", "database", "Databases"),
  e("mariadb", siMariadb, "MariaDB", "database", "Databases"),
  e("sqlite", siSqlite, "SQLite", "database", "Databases"),
  e("mongodb", siMongodb, "MongoDB", "document-db", "Databases", ["mongo"]),
  e("cassandra", siApachecassandra, "Cassandra", "document-db", "Databases", ["apache cassandra", "scylla"]),
  e("neo4j", siNeo4j, "Neo4j", "graph-db", "Databases"),
  e("cockroachdb", siCockroachlabs, "CockroachDB", "database", "Databases", ["cockroach"]),
  e("planetscale", siPlanetscale, "PlanetScale", "database", "Databases"),
  e("supabase", siSupabase, "Supabase", "database", "Databases"),
  e("firebase", siFirebase, "Firebase", "document-db", "Databases", ["firestore"]),
  e("clickhouse", siClickhouse, "ClickHouse", "warehouse", "Databases"),
  e("snowflake", siSnowflake, "Snowflake", "warehouse", "Databases"),
  e("bigquery", siGooglebigquery, "BigQuery", "warehouse", "Databases", ["big query"]),
  e("prisma", siPrisma, "Prisma", "service", "Databases", ["orm"]),

  // cache & search
  e("redis", siRedis, "Redis", "cache", "Cache & search", ["valkey", "elasticache"]),
  e("elasticsearch", siElasticsearch, "Elasticsearch", "search-index", "Cache & search", ["elastic", "elk"]),
  e("opensearch", siOpensearch, "OpenSearch", "search-index", "Cache & search"),
  e("minio", siMinio, "MinIO", "storage", "Cache & search", ["s3 compatible"]),

  // messaging
  e("kafka", siApachekafka, "Kafka", "event-stream", "Messaging", ["apache kafka", "msk", "confluent"]),
  e("rabbitmq", siRabbitmq, "RabbitMQ", "queue", "Messaging", ["rabbit", "amqp"]),
  e("pulsar", siApachepulsar, "Pulsar", "event-stream", "Messaging", ["apache pulsar"]),
  e("mailgun", siMailgun, "Mailgun", "notification", "Messaging"),

  // backend
  e("nodejs", siNodedotjs, "Node.js", "service", "Backend", ["node", "nodejs"]),
  e("deno", siDeno, "Deno", "service", "Backend"),
  e("bun", siBun, "Bun", "service", "Backend"),
  e("express", siExpress, "Express", "service", "Backend", ["expressjs"]),
  e("fastify", siFastify, "Fastify", "service", "Backend"),
  e("nestjs", siNestjs, "NestJS", "service", "Backend", ["nest"]),
  e("typescript", siTypescript, "TypeScript", "service", "Backend", ["ts"]),
  e("python", siPython, "Python", "service", "Backend"),
  e("django", siDjango, "Django", "service", "Backend"),
  e("fastapi", siFastapi, "FastAPI", "service", "Backend"),
  e("flask", siFlask, "Flask", "service", "Backend"),
  e("go", siGo, "Go", "service", "Backend", ["golang"]),
  e("rust", siRust, "Rust", "service", "Backend"),
  e("java", siOpenjdk, "Java", "service", "Backend", ["jvm", "openjdk"]),
  e("spring", siSpringboot, "Spring Boot", "service", "Backend", ["spring"]),
  e("kotlin", siKotlin, "Kotlin", "service", "Backend"),
  e("dotnet", siDotnet, ".NET", "service", "Backend", ["dotnet", "c#", "asp.net"]),
  e("ruby", siRuby, "Ruby", "service", "Backend"),
  e("rails", siRubyonrails, "Rails", "monolith", "Backend", ["ruby on rails", "ror"]),
  e("php", siPhp, "PHP", "service", "Backend"),
  e("laravel", siLaravel, "Laravel", "monolith", "Backend"),
  e("graphql", siGraphql, "GraphQL", "gateway", "Backend", ["gql"]),
  e("apollo", siApollographql, "Apollo", "gateway", "Backend", ["apollo graphql"]),
  e("trpc", siTrpc, "tRPC", "service", "Backend"),

  // frontend & mobile
  e("react", siReact, "React", "client", "Frontend & mobile", ["reactjs"]),
  e("nextjs", siNextdotjs, "Next.js", "client", "Frontend & mobile", ["next", "nextjs"]),
  e("vue", siVuedotjs, "Vue", "client", "Frontend & mobile", ["vuejs"]),
  e("nuxt", siNuxt, "Nuxt", "client", "Frontend & mobile"),
  e("angular", siAngular, "Angular", "client", "Frontend & mobile"),
  e("svelte", siSvelte, "Svelte", "client", "Frontend & mobile", ["sveltekit"]),
  e("remix", siRemix, "Remix", "client", "Frontend & mobile"),
  e("astro", siAstro, "Astro", "client", "Frontend & mobile"),
  e("flutter", siFlutter, "Flutter", "mobile-app", "Frontend & mobile"),
  e("swift", siSwift, "Swift / iOS", "mobile-app", "Frontend & mobile", ["ios", "swiftui"]),
  e("electron", siElectron, "Electron", "desktop-app", "Frontend & mobile"),

  // cloud & hosting
  e("gcp", siGooglecloud, "Google Cloud", "cloud-provider", "Cloud & hosting", ["gcp", "google cloud"]),
  e("cloudflare", siCloudflare, "Cloudflare", "cdn", "Cloud & hosting", ["cloudflare workers"]),
  e("vercel", siVercel, "Vercel", "cloud-provider", "Cloud & hosting"),
  e("netlify", siNetlify, "Netlify", "cloud-provider", "Cloud & hosting"),
  e("digitalocean", siDigitalocean, "DigitalOcean", "cloud-provider", "Cloud & hosting", ["digital ocean"]),

  // containers & infra
  e("docker", siDocker, "Docker", "container", "Containers & infra"),
  e("kubernetes", siKubernetes, "Kubernetes", "kubernetes", "Containers & infra", ["k8s", "eks", "gke", "aks"]),
  e("helm", siHelm, "Helm", "iac", "Containers & infra"),
  e("nginx", siNginx, "NGINX", "reverse-proxy", "Containers & infra"),
  e("traefik", siTraefikproxy, "Traefik", "reverse-proxy", "Containers & infra"),
  e("envoy", siEnvoyproxy, "Envoy", "reverse-proxy", "Containers & infra"),
  e("kong", siKong, "Kong", "gateway", "Containers & infra"),
  e("istio", siIstio, "Istio", "service-mesh", "Containers & infra"),
  e("consul", siConsul, "Consul", "key-value", "Containers & infra"),
  e("terraform", siTerraform, "Terraform", "iac", "Containers & infra"),
  e("vault", siVault, "Vault", "secrets", "Containers & infra", ["hashicorp vault"]),

  // devops
  e("github", siGithub, "GitHub", "repo", "DevOps"),
  e("gitlab", siGitlab, "GitLab", "repo", "DevOps"),
  e("bitbucket", siBitbucket, "Bitbucket", "repo", "DevOps"),
  e("github-actions", siGithubactions, "GitHub Actions", "ci-cd", "DevOps", ["gha", "actions"]),
  e("jenkins", siJenkins, "Jenkins", "ci-cd", "DevOps"),
  e("circleci", siCircleci, "CircleCI", "ci-cd", "DevOps"),
  e("argo", siArgo, "Argo CD", "ci-cd", "DevOps", ["argocd", "argo cd"]),

  // observability
  e("grafana", siGrafana, "Grafana", "dashboard", "Observability", ["loki", "tempo"]),
  e("prometheus", siPrometheus, "Prometheus", "metrics", "Observability"),
  e("datadog", siDatadog, "Datadog", "metrics", "Observability"),
  e("newrelic", siNewrelic, "New Relic", "metrics", "Observability", ["new relic"]),
  e("sentry", siSentry, "Sentry", "alerting", "Observability"),
  e("opentelemetry", siOpentelemetry, "OpenTelemetry", "tracing", "Observability", ["otel", "otlp"]),
  e("kibana", siKibana, "Kibana", "dashboard", "Observability"),
  e("splunk", siSplunk, "Splunk", "logs", "Observability"),
  e("pagerduty", siPagerduty, "PagerDuty", "alerting", "Observability"),

  // auth & payments
  e("auth0", siAuth0, "Auth0", "auth-provider", "Auth & payments"),
  e("okta", siOkta, "Okta", "auth-provider", "Auth & payments"),
  e("keycloak", siKeycloak, "Keycloak", "auth-provider", "Auth & payments"),
  e("stripe", siStripe, "Stripe", "payment-provider", "Auth & payments"),
  e("paypal", siPaypal, "PayPal", "payment-provider", "Auth & payments"),

  // AI & data
  e("anthropic", siAnthropic, "Anthropic", "llm", "AI & data", ["claude"]),
  e("huggingface", siHuggingface, "Hugging Face", "ml-model", "AI & data", ["hugging face", "hf"]),
  e("langchain", siLangchain, "LangChain", "ai-agent", "AI & data"),
  e("pytorch", siPytorch, "PyTorch", "ml-model", "AI & data", ["torch"]),
  e("tensorflow", siTensorflow, "TensorFlow", "ml-model", "AI & data"),
  e("spark", siApachespark, "Spark", "etl-pipeline", "AI & data", ["apache spark", "databricks"]),
  e("airflow", siApacheairflow, "Airflow", "etl-pipeline", "AI & data", ["apache airflow"]),
  e("flink", siApacheflink, "Flink", "stream-processor", "AI & data", ["apache flink"]),

  // apps, channels and services people wire into a product
  e("telegram", siTelegram, "Telegram", "chat-channel", "Chat & social", ["telegram bot"]),
  e("whatsapp", siWhatsapp, "WhatsApp", "chat-channel", "Chat & social", ["whatsapp business", "wa"]),
  e("discord", siDiscord, "Discord", "chat-channel", "Chat & social", ["discord bot"]),
  e("signal", siSignal, "Signal", "chat-channel", "Chat & social"),
  e("messenger", siMessenger, "Messenger", "chat-channel", "Chat & social"),
  e("wechat", siWechat, "WeChat", "chat-channel", "Chat & social"),
  e("line", siLine, "LINE", "chat-channel", "Chat & social"),
  e("viber", siViber, "Viber", "chat-channel", "Chat & social"),
  e("matrix", siMatrix, "Matrix", "chat-channel", "Chat & social"),
  e("mattermost", siMattermost, "Mattermost", "chat-channel", "Chat & social"),
  e("zoom", siZoom, "Zoom", "saas", "Chat & social"),
  e("googlemeet", siGooglemeet, "Google Meet", "saas", "Chat & social"),
  e("gmail", siGmail, "Gmail", "notification", "Chat & social"),
  e("instagram", siInstagram, "Instagram", "social-api", "Chat & social"),
  e("facebook", siFacebook, "Facebook", "social-api", "Chat & social", ["meta"]),
  e("x", siX, "X", "social-api", "Chat & social", ["twitter"]),
  e("tiktok", siTiktok, "TikTok", "social-api", "Chat & social"),
  e("reddit", siReddit, "Reddit", "social-api", "Chat & social"),
  e("youtube", siYoutube, "YouTube", "social-api", "Chat & social"),
  e("twitch", siTwitch, "Twitch", "social-api", "Chat & social"),
  e("pinterest", siPinterest, "Pinterest", "social-api", "Chat & social"),
  e("bluesky", siBluesky, "Bluesky", "social-api", "Chat & social"),
  e("mastodon", siMastodon, "Mastodon", "social-api", "Chat & social"),
  e("threads", siThreads, "Threads", "social-api", "Chat & social"),
  e("snapchat", siSnapchat, "Snapchat", "social-api", "Chat & social"),
  e("spotify", siSpotify, "Spotify", "external", "Chat & social"),
  e("notion", siNotion, "Notion", "saas", "Apps & SaaS"),
  e("linear", siLinear, "Linear", "saas", "Apps & SaaS"),
  e("jira", siJira, "Jira", "saas", "Apps & SaaS"),
  e("confluence", siConfluence, "Confluence", "saas", "Apps & SaaS"),
  e("trello", siTrello, "Trello", "saas", "Apps & SaaS"),
  e("asana", siAsana, "Asana", "saas", "Apps & SaaS"),
  e("figma", siFigma, "Figma", "saas", "Apps & SaaS"),
  e("miro", siMiro, "Miro", "saas", "Apps & SaaS"),
  e("zapier", siZapier, "Zapier", "workflow-engine", "Apps & SaaS"),
  e("n8n", siN8n, "n8n", "workflow-engine", "Apps & SaaS"),
  e("make", siMake, "Make", "workflow-engine", "Apps & SaaS"),
  e("airtable", siAirtable, "Airtable", "spreadsheet", "Apps & SaaS"),
  e("googlesheets", siGooglesheets, "Google Sheets", "spreadsheet", "Apps & SaaS"),
  e("googledrive", siGoogledrive, "Google Drive", "storage", "Apps & SaaS"),
  e("dropbox", siDropbox, "Dropbox", "storage", "Apps & SaaS"),
  e("googlecalendar", siGooglecalendar, "Google Calendar", "saas", "Apps & SaaS"),
  e("calendly", siCalendly, "Calendly", "saas", "Apps & SaaS"),
  e("loom", siLoom, "Loom", "saas", "Apps & SaaS"),
  e("hubspot", siHubspot, "HubSpot", "saas", "Apps & SaaS"),
  e("zendesk", siZendesk, "Zendesk", "saas", "Apps & SaaS"),
  e("intercom", siIntercom, "Intercom", "saas", "Apps & SaaS"),
  e("shopify", siShopify, "Shopify", "ecommerce-platform", "Apps & SaaS"),
  e("woocommerce", siWoocommerce, "WooCommerce", "ecommerce-platform", "Apps & SaaS"),
  e("wordpress", siWordpress, "WordPress", "cms", "Apps & SaaS"),
  e("googlemaps", siGooglemaps, "Google Maps", "maps-api", "Apps & SaaS"),
  e("mapbox", siMapbox, "Mapbox", "maps-api", "Apps & SaaS"),
  e("openstreetmap", siOpenstreetmap, "OpenStreetMap", "maps-api", "Apps & SaaS"),
  e("googleads", siGoogleads, "Google Ads", "saas", "Apps & SaaS"),
  e("googleanalytics", siGoogleanalytics, "Google Analytics", "analytics", "Apps & SaaS", ["ga4"]),
  e("mixpanel", siMixpanel, "Mixpanel", "analytics", "Apps & SaaS"),
  e("posthog", siPosthog, "PostHog", "analytics", "Apps & SaaS"),
  e("hotjar", siHotjar, "Hotjar", "analytics", "Apps & SaaS"),
  e("plausible", siPlausibleanalytics, "Plausible", "analytics", "Apps & SaaS"),
  e("resend", siResend, "Resend", "notification", "Apps & SaaS"),
  e("cloudinary", siCloudinary, "Cloudinary", "media-processor", "Apps & SaaS"),
  e("mercadopago", siMercadopago, "Mercado Pago", "payment-provider", "Auth & payments"),
  e("razorpay", siRazorpay, "Razorpay", "payment-provider", "Auth & payments"),
  e("square", siSquare, "Square", "payment-provider", "Auth & payments"),
  e("pix", siPix, "Pix", "banking-api", "Auth & payments"),
  e("clerk", siClerk, "Clerk", "auth-provider", "Auth & payments"),
  e("snyk", siSnyk, "Snyk", "ci-cd", "DevOps"),
  e("googlegemini", siGooglegemini, "Gemini", "llm", "AI & data"),
  e("mistral", siMistralai, "Mistral", "llm", "AI & data"),
  e("ollama", siOllama, "Ollama", "llm", "AI & data"),
  e("perplexity", siPerplexity, "Perplexity", "llm", "AI & data"),
  e("replicate", siReplicate, "Replicate", "ml-model", "AI & data"),
  e("qdrant", siQdrant, "Qdrant", "vector-db", "AI & data"),
  e("databricks", siDatabricks, "Databricks", "data-lake", "AI & data"),
  e("metabase", siMetabase, "Metabase", "dashboard", "AI & data"),
  e("looker", siLooker, "Looker", "dashboard", "AI & data"),
  e("neon", siNeon, "Neon", "database", "Databases"),
  e("backblaze", siBackblaze, "Backblaze", "storage", "Cloud & hosting"),
  e("railway", siRailway, "Railway", "cloud-provider", "Cloud & hosting"),
  e("render", siRender, "Render", "cloud-provider", "Cloud & hosting"),
  e("flyio", siFlydotio, "Fly.io", "cloud-provider", "Cloud & hosting"),
  e("hetzner", siHetzner, "Hetzner", "cloud-provider", "Cloud & hosting"),
  e("ovh", siOvh, "OVH", "cloud-provider", "Cloud & hosting"),
  e("vultr", siVultr, "Vultr", "cloud-provider", "Cloud & hosting"),
  e("caddy", siCaddy, "Caddy", "reverse-proxy", "Containers & infra"),
  e("ansible", siAnsible, "Ansible", "iac", "Containers & infra"),
  e("pulumi", siPulumi, "Pulumi", "iac", "Containers & infra"),
  e("linux", siLinux, "Linux", "vm", "Containers & infra"),
  e("ubuntu", siUbuntu, "Ubuntu", "vm", "Containers & infra"),
  e("raspberrypi", siRaspberrypi, "Raspberry Pi", "iot-device", "Containers & infra"),
  e("arduino", siArduino, "Arduino", "iot-device", "Containers & infra"),
  e("mqtt", siMqtt, "MQTT", "mqtt-broker", "Messaging"),
  e("socketio", siSocketdotio, "Socket.IO", "realtime-server", "Messaging"),
  e("webrtc", siWebrtc, "WebRTC", "realtime-server", "Messaging"),
  e("temporal", siTemporal, "Temporal", "workflow-engine", "Backend"),
  e("celery", siCelery, "Celery", "worker", "Backend"),
  e("sidekiq", siSidekiq, "Sidekiq", "worker", "Backend"),
  e("drizzle", siDrizzle, "Drizzle", "repository", "Backend"),
  e("postman", siPostman, "Postman", "external", "DevOps"),
  e("swagger", siSwagger, "Swagger", "docs-site", "DevOps"),
  e("openapi", siOpenapiinitiative, "OpenAPI", "docs-site", "DevOps"),
  e("git", siGit, "Git", "repo", "DevOps"),
  e("cypress", siCypress, "Cypress", "test-suite", "DevOps"),
  e("selenium", siSelenium, "Selenium", "headless-browser", "DevOps"),
  e("jest", siJest, "Jest", "test-suite", "DevOps"),
  e("vitest", siVitest, "Vitest", "test-suite", "DevOps"),
  e("storybook", siStorybook, "Storybook", "docs-site", "DevOps"),
  e("jaeger", siJaeger, "Jaeger", "tracing", "Observability"),
  e("tailwindcss", siTailwindcss, "Tailwind", "client", "Frontend & mobile"),
  e("solid", siSolid, "Solid", "client", "Frontend & mobile"),
  e("htmx", siHtmx, "htmx", "client", "Frontend & mobile"),
  e("android", siAndroid, "Android", "mobile-app", "Frontend & mobile"),
  e("ios", siIos, "iOS", "mobile-app", "Frontend & mobile"),
  e("slack", plainMark("4A154B"), "Slack", "chat-channel", "Chat & social"),
  e("microsoftteams", plainMark("6264A7"), "Microsoft Teams", "chat-channel", "Chat & social", ["teams"]),
  e("linkedin", plainMark("0A66C2"), "LinkedIn", "social-api", "Chat & social"),
  e("twilio", plainMark("F22F46"), "Twilio", "notification", "Apps & SaaS"),
  e("sendgrid", plainMark("1A82E2"), "SendGrid", "notification", "Apps & SaaS"),
  e("salesforce", plainMark("00A1E0"), "Salesforce", "saas", "Apps & SaaS"),
  e("segment", plainMark("52BD95"), "Segment", "analytics", "Apps & SaaS"),
  e("amplitude", plainMark("1E61F0"), "Amplitude", "analytics", "Apps & SaaS"),
  e("docusign", plainMark("FFCC22"), "DocuSign", "esign", "Apps & SaaS"),
  e("openai", plainMark("10A37F"), "OpenAI", "llm", "AI & data", ["gpt", "chatgpt"]),
  e("pinecone", plainMark("6E56CF"), "Pinecone", "vector-db", "AI & data"),
  e("weaviate", plainMark("00D1A0"), "Weaviate", "vector-db", "AI & data"),
  e("dbt", plainMark("FF694B"), "dbt", "etl-pipeline", "AI & data"),
  e("tableau", plainMark("E97627"), "Tableau", "dashboard", "AI & data"),
  e("powerbi", plainMark("F2C811"), "Power BI", "dashboard", "AI & data"),
  e("aws", plainMark("FF9900"), "AWS", "cloud-provider", "Cloud & hosting", ["amazon web services"]),
  e("s3", plainMark("569A31"), "S3", "storage", "Cloud & hosting", ["amazon s3"]),
  e("lambda", plainMark("FF9900"), "Lambda", "function", "Cloud & hosting", ["aws lambda"]),
  e("sqs", plainMark("FF4F8B"), "SQS", "queue", "Messaging", ["amazon sqs"]),
  e("sns", plainMark("FF4F8B"), "SNS", "topic", "Messaging", ["amazon sns"]),
  e("dynamodb", plainMark("4053D6"), "DynamoDB", "key-value", "Databases"),
  e("rds", plainMark("527FFF"), "RDS", "database", "Databases", ["amazon rds", "aurora"]),
  e("azure", plainMark("0078D4"), "Azure", "cloud-provider", "Cloud & hosting", ["microsoft azure"]),
  e("heroku", plainMark("430098"), "Heroku", "cloud-provider", "Cloud & hosting"),
  e("oracle", plainMark("F80000"), "Oracle", "database", "Databases"),
  e("sqlserver", plainMark("CC2927"), "SQL Server", "database", "Databases", ["mssql"]),
  e("memcached", plainMark("4AA3A2"), "Memcached", "cache", "Cache & search"),
  e("typesense", plainMark("D90368"), "Typesense", "search-index", "Cache & search"),
  e("nats", plainMark("27AAE1"), "NATS", "queue", "Messaging"),
  e("grpc", plainMark("244C5A"), "gRPC", "service", "Backend"),
  e("haproxy", plainMark("106DA9"), "HAProxy", "load-balancer", "Containers & infra"),
  e("playwright", plainMark("2EAD33"), "Playwright", "test-suite", "DevOps"),
  e("sonarqube", plainMark("4E9BCD"), "SonarQube", "ci-cd", "DevOps"),
];

const BY_SLUG = new Map(TECH_CATALOG.map((entry) => [entry.slug, entry]));

export function techBySlug(slug: string | undefined): TechEntry | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest names first, so "Apache Kafka" wins over a shorter alias that also matches.
const DETECTORS = TECH_CATALOG.flatMap((entry) =>
  [entry.label, entry.slug, ...entry.aliases].map((name) => ({
    entry,
    length: name.length,
    // Whole-word match, case-insensitive (so "go" doesn't hit "Google", "ts" doesn't hit "events").
    pattern: new RegExp(`(^|[^a-z0-9])${escapeRegExp(name.toLowerCase())}($|[^a-z0-9])`),
  })),
).sort((a, b) => b.length - a.length);

/** Finds the technology named in free text like "Node.js · Fastify" or "PostgreSQL 16" (first, most specific match). */
export function detectTech(text: string | undefined): TechEntry | undefined {
  if (!text) return undefined;
  const haystack = text.toLowerCase();
  // Earliest mention wins ("Node.js · Fastify" → Node.js); ties go to the longer, more specific name.
  let best: { entry: TechEntry; index: number; length: number } | undefined;
  for (const detector of DETECTORS) {
    const match = detector.pattern.exec(haystack);
    if (!match) continue;
    const index = match.index + match[1].length;
    if (!best || index < best.index || (index === best.index && detector.length > best.length)) {
      best = { entry: detector.entry, index, length: detector.length };
    }
  }
  return best?.entry;
}

/**
 * The logo a component shows: an explicit pick wins; `""` means "no logo";
 * otherwise it's detected from the tech line, then the title.
 */
export function resolveComponentTech(data: { logo?: string; tech?: string; title?: string }): TechEntry | undefined {
  if (data.logo !== undefined) return data.logo === "" ? undefined : techBySlug(data.logo);
  return detectTech(data.tech) ?? detectTech(data.title);
}

/** A technology by its name: "Telegram", "google maps". */
export function techByName(name: string): TechEntry | undefined {
  const needle = name.trim().toLowerCase();
  return needle ? TECH_CATALOG.find((entry) => entry.label.toLowerCase() === needle || entry.slug === needle || entry.aliases.includes(needle)) : undefined;
}

export function searchTech(query: string): TechEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return TECH_CATALOG;
  return TECH_CATALOG.filter((entry) => {
    const haystack = `${entry.label} ${entry.slug} ${entry.group} ${entry.aliases.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/** Brand colors that would vanish on the dark canvas (black logos like Next.js, Kafka, GitHub) are drawn light instead. */
export function logoColorOnDark(hex: string): string {
  const value = Number.parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.28 ? "#f1f1f4" : `#${hex}`;
}
