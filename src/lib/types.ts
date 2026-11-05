import type { ComponentVariantId } from "./componentCatalog";

/**
 * What can sit on a board:
 * - `component`, anything from the catalog: a service, a UML class, a decision, an image… see `componentCatalog.ts`;
 * - `label`, free text (titles, captions);
 * - `note`, a sticky comment (decisions, TODOs, open questions).
 */
export type NodeKind = "component" | "label" | "note";

export type NoteColor = "yellow" | "pink" | "blue" | "green";

/** What a note means. `comment` (the default) is free text; the others show as a small label on the note. */
export type NoteType = "comment" | "decision" | "question" | "out-of-scope";

export type DecisionStatus = "proposed" | "accepted" | "superseded";

export interface NoteData {
  text: string;
  color?: NoteColor;
  noteType?: NoteType;
  /** Only for `decision` notes: what led to it and what follows from it. */
  adr?: { status?: DecisionStatus; context?: string; consequences?: string };
}

export interface LabelData {
  text: string;
}

export type ComponentVariant = ComponentVariantId;

export interface EntityField {
  name: string;
  type: string;
  pk?: boolean;
  /** Reference to another entity's field, e.g. "User.id". */
  fk?: string;
  required?: boolean;
  unique?: boolean;
  /** Token such as `now` or `pending`. */
  default?: string;
  /** Constraint text, such as `>0`. */
  check?: string;
  /** Max length for a string field. */
  max?: number;
}

/** A table / collection / document type that the component owns. */
export interface Entity {
  name: string;
  fields: EntityField[];
  /** Column lists, one per index. */
  indexes?: string[][];
}

export interface EndpointResponse {
  status: number;
  /** Response body shape, e.g. `{ orderId uuid }`. */
  body?: string;
  description?: string;
}

/** One operation of the component's API contract. */
export interface Endpoint {
  /** HTTP verb, or RPC / EVENT / WS for other styles. */
  method: string;
  path: string;
  summary?: string;
  /** Role that may call it, e.g. `shopper`. */
  auth?: string;
  idempotent?: boolean;
  paginate?: boolean;
  /** Request body shape, e.g. `{ cartId uuid }`. */
  body?: string;
  responses?: EndpointResponse[];
}

/** Which side of a box a connector leaves or enters. Absent = pick the facing side. */
export type PortSide = "top" | "right" | "bottom" | "left";

/** One box on the board: name, type, an optional technology and a text. What it holds depends on its type. */
export interface ComponentData {
  title: string;
  variant: ComponentVariant;
  /** Short tech line, e.g. "Node.js · Fastify" or "PostgreSQL 16". */
  tech?: string;
  /** Free text. A UML class separates its compartments with a `--` line; a checklist has one item per line. */
  description?: string;
  /** Hex accent; absent = the category's color. */
  accent?: string;
  /** Technology logo slug (see techCatalog). Absent = detect from tech/title; "" = no logo. */
  logo?: string;
  /** Explicit box size in world pixels. Absent = the card's natural size. */
  width?: number;
  height?: number;
  /** The board drawn inside this box, on the site. */
  childBoardId?: string;
  /** The file of that board: `inside db boards/api/db.hunch`. The first of `insideFiles`. */
  insideFile?: string;
  /** Every board inside this box, when a file names more than one. */
  insideFiles?: string[];
  /** Stable readable id ("orders-api"), used by the text and by tools. Absent = derived from the title. */
  key?: string;
  /** A file on the board: its path next to the board ("assets/logo.png"), or an https URL. */
  src?: string;
  entities?: Entity[];
  endpoints?: Endpoint[];
  /** Where it is in its life: drawn as a plan, being built, running, or on its way out. Absent = not said. */
  status?: ComponentStatus;
  /** Team or person who owns it. */
  owner?: string;
  /** Repository, dashboard, runbook, docs… */
  links?: ComponentLink[];
  /** Cloud it runs on. */
  cloud?: CloudProvider;
  /** A type the board defines itself ("Fraud scorer"), built on `variant`. */
  custom?: CustomComponentType;
  /** The folder or file in the code this box stands for ("src/orders"). */
  path?: string;
  /** UI sketch: what an element of a screen says and does (the title is its text or label). */
  ui?: UiProps;
  /** Any other `[name=value]` written on the box. Hunch doesn't read them; it keeps them, for people and AIs. */
  attrs?: Record<string, string | true>;
}

/** An element of a screen: what it says and does, never how it looks to the pixel. */
export interface UiProps {
  placeholder?: string;
  /** Choices of a select, a radio group, tabs or a menu. */
  options?: string[];
  required?: boolean;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger";
  /** The screen it opens (a frame's key). */
  goto?: string;
  /** The endpoint it calls ("POST /orders"). */
  calls?: string;
  /** The data it shows or edits ("Order.email"). */
  field?: string;
  /** A menu or a sidebar drawn closed: a button for the menu, an icon rail for the sidebar. */
  collapsed?: boolean;
}

export const DEVICES = ["mobile", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

/** A team's own kind of box: its name, and optionally its shape. */
export interface CustomComponentType {
  label: string;
  /** One of the component shapes ("hexagon", "cylinder"…). Absent = the base type's. */
  shape?: string;
}

export const COMPONENT_STATUSES = ["planned", "building", "live", "deprecated"] as const;
export type ComponentStatus = (typeof COMPONENT_STATUSES)[number];

export const LINK_KINDS = ["repo", "dashboard", "runbook", "docs", "other"] as const;
export type ComponentLinkKind = (typeof LINK_KINDS)[number];
export interface ComponentLink {
  kind: ComponentLinkKind;
  url: string;
  label?: string;
}

export const CLOUD_PROVIDERS = ["aws", "gcp", "azure", "cloudflare", "vercel", "fly", "render", "hetzner", "on-prem"] as const;
export type CloudProvider = (typeof CLOUD_PROVIDERS)[number];
export const CLOUD_LABEL: Record<CloudProvider, string> = {
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",
  cloudflare: "Cloudflare",
  vercel: "Vercel",
  fly: "Fly.io",
  render: "Render",
  hetzner: "Hetzner",
  "on-prem": "On-prem",
};

export type BoardNodeData = ComponentData | LabelData | NoteData;

export interface BoardNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  z: number;
  rotation: number;
  tags: string[];
  data: BoardNodeData;
  createdAt: number;
  updatedAt: number;
}

export type LinkStyle = "solid" | "dashed" | "dotted";

/**
 * The end of a connector. The UML ones: `implements` and `extends` end in a hollow triangle (dashed and solid),
 * `aggregation` and `composition` start at a hollow and a filled diamond on the side of the whole.
 */
export type LinkArrow = "end" | "both" | "none" | "implements" | "extends" | "aggregation" | "composition";

/** How a connector travels between boxes: a straight segment, right-angled elbows, or a soft curve. */
export type LinkRouting = "straight" | "elbow" | "curved";

/** A relationship: what happens ("Reads orders") and over what technology ("SQL / TCP"). */
export interface BoardLink {
  id: string;
  from: string;
  to: string;
  color: string;
  /** What the relationship does, e.g. "Publishes order events". */
  label?: string;
  /** Protocol / technology, e.g. "HTTPS · JSON", "gRPC", "SQL". */
  technology?: string;
  style: LinkStyle;
  /** Stroke thickness in px. */
  width?: number;
  /** Absent = "end". */
  arrow?: LinkArrow;
  /** Absent = "straight". */
  routing?: LinkRouting;
  /** Side of the source box. Absent = whichever side faces the target. */
  fromPort?: PortSide;
  /** Side of the target box. Absent = whichever side faces the source. */
  toPort?: PortSide;
  /** Extra corners, in world pixels, so the line can be bent by hand. */
  waypoints?: { x: number; y: number }[];
  /** Destination operation this arrow calls, e.g. "POST /orders". */
  endpoint?: string;
  createdAt: number;
}

/** Extra facts about one step of a flow, keyed by the connector id. */
export interface FlowStepDetail {
  /** Chance this step is taken, from 0 to 1. Absent means certain. */
  probability?: number;
  /** What travels on the connector, e.g. "{ orderId, total }". */
  payload?: string;
  /** Approximate size of that payload, in bytes. */
  bytes?: number;
  /** Sentence shown while this step plays. */
  narration?: string;
}

/** A named dynamic view: an ordered list of relationships played as steps 1…n. */
export interface BoardFlow {
  id: string;
  name: string;
  linkIds: string[];
  /** Per-step probability, payload and narration. */
  steps?: Record<string, FlowStepDetail>;
  /** Groups of connector ids that happen at the same time. */
  parallel?: string[][];
  /** Name of another flow that is the failure path (timeout, retry, fallback). */
  errorFlow?: string;
}

/** What a boundary is; what each one means lives in core/frameKinds. */
export const FRAME_KINDS = ["docker", "kubernetes", "network", "cloud", "context", "team", "trust"] as const;
export type FrameKind = (typeof FRAME_KINDS)[number];

/** A boundary drawn around related boxes (VPC, bounded context, cluster, team…). Dragging it moves its contents. */
export interface BoardFrame {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdAt: number;
  /** What the boundary is (docker, kubernetes, network, cloud, context, team, trust). */
  kind?: FrameKind;
  /** This frame is a screen on a device, with its route and the text of its states. */
  device?: Device;
  route?: string;
  states?: Record<string, string>;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Board {
  id: string;
  title: string;
  viewport: Viewport;
  /** A board drawn inside a box: the board that holds the box. */
  parentBoardId?: string;
  /** The box, on that board. */
  parentNodeId?: string;
  flows?: BoardFlow[];
  /** Lines of an older file that this version doesn't read (`requirement`, `simulate`…). Kept and written back. */
  retired?: string[];
  /** The board in the account, once it has been saved there. */
  cloudId?: string;
  cloudOwner?: string;
  /** What the account last held, to know whether this copy has changed and whether the account has. */
  cloudHash?: string;
  cloudUpdatedAt?: string;
  createdAt: number;
  updatedAt: number;
}

export function isComponentNode(node: BoardNode): node is BoardNode & { data: ComponentData } {
  return node.kind === "component";
}

export function isLabelNode(node: BoardNode): node is BoardNode & { data: LabelData } {
  return node.kind === "label";
}

export function isNoteNode(node: BoardNode): node is BoardNode & { data: NoteData } {
  return node.kind === "note";
}
