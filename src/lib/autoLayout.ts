export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

export interface LayoutLink {
  from: string;
  to: string;
}

/**
 * Layered layout (a small Sugiyama pass): rank by the longest path from the
 * roots, then one barycenter sweep to cut crossings. Enough for a readable
 * first arrangement; hand positions still win after that.
 */
export function layoutNodes(nodes: LayoutNode[], links: LayoutLink[], xGap = 300, yGap = 200): LayoutNode[] {
  if (nodes.length === 0) return [];
  const ids = nodes.map((node) => node.id);
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const id of ids) {
    incoming.set(id, []);
    outgoing.set(id, []);
  }
  const edges = links.filter((link) => incoming.has(link.from) && incoming.has(link.to) && link.from !== link.to);
  // Drop the edges that close a cycle (a webhook back, a reply), found by a DFS
  // from the roots, otherwise a callback drags its caller to the right of it.
  const forward = new Map<string, string[]>();
  for (const edge of edges) forward.set(edge.from, [...(forward.get(edge.from) ?? []), edge.to]);
  const hasIncoming = new Set(edges.map((edge) => edge.to));
  const back = new Set<string>();
  const state = new Map<string, 1 | 2>();
  const visit = (id: string) => {
    state.set(id, 1);
    for (const next of forward.get(id) ?? []) {
      if (state.get(next) === 1) back.add(`${id}>${next}`);
      else if (!state.has(next)) visit(next);
    }
    state.set(id, 2);
  };
  for (const id of ids) if (!hasIncoming.has(id) && !state.has(id)) visit(id);
  for (const id of ids) if (!state.has(id)) visit(id);
  for (const edge of edges) {
    if (back.has(`${edge.from}>${edge.to}`)) continue;
    outgoing.get(edge.from)!.push(edge.to);
    incoming.get(edge.to)!.push(edge.from);
  }

  const rank = new Map<string, number>();
  const walking = new Set<string>();
  function depth(id: string): number {
    const known = rank.get(id);
    if (known !== undefined) return known;
    if (walking.has(id)) return 0;
    walking.add(id);
    const parents = incoming.get(id) ?? [];
    const value = parents.length === 0 ? 0 : 1 + Math.max(...parents.map(depth));
    walking.delete(id);
    rank.set(id, value);
    return value;
  }
  for (const id of ids) depth(id);

  const layers = new Map<number, string[]>();
  for (const id of ids) {
    const layer = rank.get(id) ?? 0;
    const list = layers.get(layer) ?? [];
    list.push(id);
    layers.set(layer, list);
  }
  const ordered = [...layers.keys()].sort((a, b) => a - b);

  // One sweep: put each node near the average position of its parents.
  const indexInLayer = new Map<string, number>();
  for (const layer of ordered) {
    const row = layers.get(layer)!;
    row.sort((a, b) => {
      const parentsA = incoming.get(a) ?? [];
      const parentsB = incoming.get(b) ?? [];
      const avg = (parents: string[]) =>
        parents.length === 0 ? indexInLayer.size : parents.reduce((sum, id) => sum + (indexInLayer.get(id) ?? 0), 0) / parents.length;
      return avg(parentsA) - avg(parentsB);
    });
    row.forEach((id, index) => indexInLayer.set(id, index));
  }

  const maxWidth = Math.max(...ordered.map((layer) => layers.get(layer)!.length));
  return ids.map((id) => {
    const layer = rank.get(id) ?? 0;
    const row = layers.get(layer)!;
    const index = row.indexOf(id);
    const offset = ((maxWidth - row.length) * xGap) / 2;
    return { id, x: offset + index * xGap, y: layer * yGap };
  });
}
