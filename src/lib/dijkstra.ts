import type { RouterNode, Connection, DijkstraStep, DijkstraResult } from './graphModel';

/**
 * Pure implementation of Dijkstra's link-state routing algorithm.
 * Follows the exact pseudocode from Kurose & Ross:
 *
 * Initialization:
 *   N' = {u}
 *   for all nodes v:
 *     if v is neighbor of u: D(v) = c(u,v)
 *     else: D(v) = INFINITY
 *
 * Loop:
 *   find w not in N' such that D(w) is minimum
 *   add w to N'
 *   for each neighbor v of w not in N':
 *     D(v) = min(D(v), D(w) + c(w,v))
 *   until N' = N
 */
export function runDijkstra(
  nodes: RouterNode[],
  connections: Connection[],
  sourceId: string
): DijkstraResult {
  const nodeIds = nodes.map((n) => n.id);
  const INF = Infinity;

  // Build adjacency matrix: cost[source][target] = cost
  const cost: Record<string, Record<string, number>> = {};
  for (const id of nodeIds) {
    cost[id] = {};
    for (const other of nodeIds) {
      cost[id][other] = INF;
    }
    cost[id][id] = 0; // cost to self is 0
  }

  for (const conn of connections) {
    cost[conn.source][conn.target] = conn.cost;
    cost[conn.target][conn.source] = conn.cost;
  }

  // State tracking
  const nPrime = new Set<string>();
  const dv: Record<string, number> = {};
  const pv: Record<string, string | null> = {};

  // Initialization: N' = {u}
  nPrime.add(sourceId);

  for (const v of nodeIds) {
    if (v === sourceId) {
      dv[v] = 0;
      pv[v] = null;
    } else if (cost[sourceId][v] !== INF) {
      dv[v] = cost[sourceId][v];
      pv[v] = sourceId;
    } else {
      dv[v] = INF;
      pv[v] = null;
    }
  }

  const steps: DijkstraStep[] = [];
  // Record step 0
  steps.push({
    nPrime: Array.from(nPrime),
    dv: { ...dv },
    pv: { ...pv },
  });

  // Loop until N' = N
  while (nPrime.size < nodeIds.length) {
    // Find w not in N' with minimum D(w)
    // Iterate in reverse to match textbook tie-breaking (later alphabet wins)
    let minDist = INF;
    let w: string | null = null;

    for (let i = nodeIds.length - 1; i >= 0; i--) {
      const v = nodeIds[i];
      if (!nPrime.has(v) && dv[v] < minDist) {
        minDist = dv[v];
        w = v;
      }
    }

    // If no reachable node remains, break (disconnected graph)
    if (w === null || minDist === INF) break;

    // Add w to N'
    nPrime.add(w);

    // Update distances for neighbors of w not in N'
    for (const v of nodeIds) {
      if (!nPrime.has(v) && cost[w][v] !== INF) {
        const newDist = dv[w] + cost[w][v];
        if (newDist < dv[v]) {
          dv[v] = newDist;
          pv[v] = w;
        }
      }
    }

    // Record this step
    steps.push({
      nPrime: Array.from(nPrime),
      dv: { ...dv },
      pv: { ...pv },
    });
  }

  return {
    steps,
    predecessors: { ...pv },
  };
}