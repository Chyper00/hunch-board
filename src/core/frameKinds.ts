/**
 * What a boundary (frame) on a system board is: a Docker host, a Kubernetes
 * cluster, a private network… The kind draws an icon on its tab, so people
 * can tell, and goes to the AI with what it means for the code inside.
 */

import { FRAME_KINDS, type FrameKind } from "@/lib/types";

export { FRAME_KINDS, type FrameKind };

export interface FrameKindInfo {
  id: FrameKind;
  label: string;
  /** A technology logo (Simple Icons slug) or a plain icon name drawn by the app. */
  logo?: string;
  icon?: "network" | "cloud" | "context" | "team" | "trust";
  /** A name to start with when it is dragged from the library. */
  sample: string;
  /** What it tells the AI about the boxes inside. */
  meaning: string;
}

export const FRAME_KIND_INFO: Record<FrameKind, FrameKindInfo> = {
  docker: { id: "docker", label: "Docker", logo: "docker", sample: "docker-compose", meaning: "These parts run as containers on one Docker host, started together (one docker-compose file); they reach each other by service name." },
  kubernetes: { id: "kubernetes", label: "Kubernetes", logo: "kubernetes", sample: "Kubernetes cluster", meaning: "These parts run in one Kubernetes cluster or namespace: each one a Deployment (or StatefulSet) with a Service; they reach each other by service name." },
  network: { id: "network", label: "Private network", icon: "network", sample: "Private network", meaning: "These parts sit in a private network (VPC, subnet): not reachable from the internet; only what is drawn crossing the boundary can talk to them." },
  cloud: { id: "cloud", label: "Cloud account or region", icon: "cloud", sample: "AWS · eu-west-1", meaning: "These parts live in one cloud account and region; they share its permissions, its billing and its outages." },
  context: { id: "context", label: "Domain context", icon: "context", sample: "Orders context", meaning: "These parts form one bounded context: they share one model and one vocabulary, and the rest of the system talks to them only through what crosses the boundary." },
  team: { id: "team", label: "Team", icon: "team", sample: "Payments team", meaning: "One team owns these parts: keep them in one place in the code, and changes across the boundary go through an agreed interface." },
  trust: { id: "trust", label: "Trust boundary", icon: "trust", sample: "Trust boundary", meaning: "Data crossing this line is untrusted: validate and authorize everything that comes in, and never send secrets out." },
};

export const isFrameKind = (value: unknown): value is FrameKind => typeof value === "string" && (FRAME_KINDS as readonly string[]).includes(value);
