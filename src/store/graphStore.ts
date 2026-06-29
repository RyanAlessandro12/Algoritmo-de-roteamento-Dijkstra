import { create } from 'zustand';
import type { RouterNode, Connection, DijkstraResult } from '../lib/graphModel';
import { runDijkstra } from '../lib/dijkstra';

interface GraphStore {
  nodes: RouterNode[];
  connections: Connection[];
  sourceNodeId: string | null;
  dijkstraResult: DijkstraResult | null;
  /** Version counter incremented on structural changes (add/remove) */
  graphVersion: number;
  /** Counter for auto-naming routers (A, B, C, ...) */
  routerCounter: number;
  /** Currently selected edge ID (for editing/deleting) */
  selectedEdgeId: string | null;

  addNode: (node: RouterNode) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeLabel: (id: string, label: string) => void;

  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;
  updateConnectionCost: (id: string, cost: number) => void;

  setSourceNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;

  clearAll: () => void;

  recalculateDijkstra: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  connections: [],
  sourceNodeId: null,
  dijkstraResult: null,
  graphVersion: 0,
  routerCounter: 0,
  selectedEdgeId: null,

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      graphVersion: state.graphVersion + 1,
    })),

  removeNode: (id) =>
    set((state) => {
      const newSource =
        state.sourceNodeId === id ? null : state.sourceNodeId;
      return {
        nodes: state.nodes.filter((n) => n.id !== id),
        connections: state.connections.filter(
          (c) => c.source !== id && c.target !== id
        ),
        sourceNodeId: newSource,
        graphVersion: state.graphVersion + 1,
      };
    }),

  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, x, y } : n
      ),
    })),

  updateNodeLabel: (id, label) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, label } : n
      ),
      graphVersion: state.graphVersion + 1,
    })),

  addConnection: (conn) =>
    set((state) => ({
      connections: [...state.connections, conn],
      graphVersion: state.graphVersion + 1,
    })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
      graphVersion: state.graphVersion + 1,
    })),

  updateConnectionCost: (id, cost) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, cost } : c
      ),
    })),

  setSourceNodeId: (id) =>
    set({ sourceNodeId: id }),

  setSelectedEdgeId: (id) =>
    set({ selectedEdgeId: id }),

  clearAll: () =>
    set({
      nodes: [],
      connections: [],
      sourceNodeId: null,
      dijkstraResult: null,
      graphVersion: 0,
      routerCounter: 0,
      selectedEdgeId: null,
    }),

  recalculateDijkstra: () => {
    const state = get();
    if (!state.sourceNodeId) {
      set({ dijkstraResult: null });
      return;
    }
    const result = runDijkstra(
      state.nodes,
      state.connections,
      state.sourceNodeId
    );
    set({ dijkstraResult: result });
  },
}));