export interface RouterNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  cost: number;
}

export interface DijkstraStep {
  /** The set N' (nodes already processed) */
  nPrime: string[];
  /** Distance and predecessor for each node at this step: D(v), p(v) */
  dv: Record<string, number>;
  pv: Record<string, string | null>;
}

export interface DijkstraResult {
  steps: DijkstraStep[];
  /** Final predecessors for all nodes (p(v)) */
  predecessors: Record<string, string | null>;
}

export interface GraphState {
  nodes: RouterNode[];
  connections: Connection[];
  sourceNodeId: string | null;
}