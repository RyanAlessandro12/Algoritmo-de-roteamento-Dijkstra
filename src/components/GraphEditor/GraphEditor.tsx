import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  Connection,
  Node,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import RouterNode from './RouterNode';
import WeightedEdge from './WeightedEdge';
import { useGraphStore } from '../../store/graphStore';

const nodeTypes = { routerNode: RouterNode };
const edgeTypes = { weightedEdge: WeightedEdge };

/** Generate next label: A, B, C, ..., Z, AA, AB, ... */
function nextLabel(counter: number): string {
  let label = '';
  let n = counter;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export default function GraphEditor() {
  const storeNodes = useGraphStore((s) => s.nodes);
  const storeConnections = useGraphStore((s) => s.connections);
  const graphVersion = useGraphStore((s) => s.graphVersion);
  const addNode = useGraphStore((s) => s.addNode);
  const addConnection = useGraphStore((s) => s.addConnection);
  const updateNodePosition = useGraphStore((s) => s.updateNodePosition);
  const dijkstraResult = useGraphStore((s) => s.dijkstraResult);
  const sourceNodeId = useGraphStore((s) => s.sourceNodeId);
  const recalculateDijkstra = useGraphStore((s) => s.recalculateDijkstra);
  const setSelectedEdgeId = useGraphStore((s) => s.setSelectedEdgeId);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [connectingMode, setConnectingMode] = useState(false);
  const [firstNode, setFirstNode] = useState<string | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Compute shortest path edges IDs
  const shortestEdgeIds = useMemo<Set<string>>(() => {
    const ids = new Set<string>();
    if (!dijkstraResult || !sourceNodeId) return ids;

    const { predecessors } = dijkstraResult;
    for (const [node, pred] of Object.entries(predecessors)) {
      if (pred !== null && node !== sourceNodeId) {
        const conn = storeConnections.find(
          (c) =>
            (c.source === pred && c.target === node) ||
            (c.source === node && c.target === pred)
        );
        if (conn) ids.add(conn.id);
      }
    }
    return ids;
  }, [dijkstraResult, storeConnections, sourceNodeId]);

  // Convert store nodes to ReactFlow nodes (only on structural changes via graphVersion)
  const flowNodes: Node[] = useMemo(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        type: 'routerNode',
        position: { x: n.x, y: n.y },
        data: { label: n.label },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphVersion]
  );

  // Convert store connections to ReactFlow edges
  const flowEdges: Edge[] = useMemo(
    () =>
      storeConnections.map((c) => ({
        id: c.id,
        source: c.source,
        target: c.target,
        type: 'weightedEdge',
        data: {
          cost: c.cost,
          isShortest: shortestEdgeIds.has(c.id),
        },
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [storeConnections, shortestEdgeIds]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync store -> reactflow on structural changes (not on position updates)
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const id = `${connection.source}-${connection.target}`;
      addConnection({ id, source: connection.source, target: connection.target, cost: 1 });
      recalculateDijkstra();
    },
    [addConnection, recalculateDijkstra]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedEdgeId(null);

      if (!connectingMode) return;

      if (firstNode === null) {
        setFirstNode(node.id);
      } else if (firstNode !== node.id) {
        const id = `${firstNode}-${node.id}`;
        const exists = storeConnections.some(
          (c) =>
            (c.source === firstNode && c.target === node.id) ||
            (c.source === node.id && c.target === firstNode)
        );
        if (!exists) {
          addConnection({ id, source: firstNode, target: node.id, cost: 1 });
          recalculateDijkstra();
        }
        setFirstNode(null);
        setConnectingMode(false);
      }
    },
    [connectingMode, firstNode, storeConnections, addConnection, recalculateDijkstra, setSelectedEdgeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, [setSelectedEdgeId]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position.x, node.position.y);
    },
    [updateNodePosition]
  );

  const handleAddRouter = useCallback(() => {
    if (!rfInstance) return;
    const center = rfInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    });
    const state = useGraphStore.getState();
    const label = nextLabel(state.routerCounter);
    const id = label;
    useGraphStore.setState({ routerCounter: state.routerCounter + 1 });
    addNode({ id, label, x: center.x, y: center.y });
    recalculateDijkstra();
  }, [rfInstance, addNode, recalculateDijkstra]);

  const handleStartConnection = useCallback(() => {
    setConnectingMode(true);
    setFirstNode(null);
  }, []);

  const handlersRef = useRef({ handleAddRouter, handleStartConnection });
  handlersRef.current = { handleAddRouter, handleStartConnection };

  // @ts-expect-error - exposing to window for toolbar
  window.__graphEditorHandlers = handlersRef;

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setRfInstance(instance);
  }, []);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative" style={{ minHeight: 400 }}>
      {/* Toggle MiniMap button - top right of the graph area */}
      <button
        onClick={() => setShowMiniMap((v) => !v)}
        className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded
                   bg-white border border-slate-200 text-slate-500 hover:text-slate-700 
                   hover:border-slate-300 transition-all shadow-sm text-xs"
        title={showMiniMap ? "Ocultar minimapa" : "Mostrar minimapa"}
      >
        {showMiniMap ? '◀' : '▶'}
      </button>

      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          {showMiniMap && <MiniMap nodeStrokeWidth={3} zoomable pannable />}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}