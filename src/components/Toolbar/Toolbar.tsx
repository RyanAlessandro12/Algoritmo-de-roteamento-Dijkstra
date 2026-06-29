import { useCallback } from 'react';
import { useGraphStore } from '../../store/graphStore';

export default function Toolbar() {
  const clearAll = useGraphStore((s) => s.clearAll);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const removeConnection = useGraphStore((s) => s.removeConnection);
  const setSelectedEdgeId = useGraphStore((s) => s.setSelectedEdgeId);
  const recalculateDijkstra = useGraphStore((s) => s.recalculateDijkstra);
  const connections = useGraphStore((s) => s.connections);

  const handleAddRouter = useCallback(() => {
    const handlers = (window as any).__graphEditorHandlers?.current;
    if (handlers?.handleAddRouter) {
      handlers.handleAddRouter();
    }
  }, []);

  const handleAddConnection = useCallback(() => {
    const handlers = (window as any).__graphEditorHandlers?.current;
    if (handlers?.handleStartConnection) {
      handlers.handleStartConnection();
    }
  }, []);

  const handleDeleteSelectedEdge = useCallback(() => {
    if (selectedEdgeId) {
      removeConnection(selectedEdgeId);
      setSelectedEdgeId(null);
      recalculateDijkstra();
    }
  }, [selectedEdgeId, removeConnection, setSelectedEdgeId, recalculateDijkstra]);

  const selectedConn = selectedEdgeId
    ? connections.find((c) => c.id === selectedEdgeId)
    : null;

  const handleClearAll = useCallback(() => {
    if (window.confirm('¿Estás seguro de limpiar todo el grafo?')) {
      clearAll();
    }
  }, [clearAll]);

  return (
    <div className="flex gap-2 px-5 py-2.5 items-center flex-wrap bg-white border-b border-slate-200">
      <button
        onClick={handleAddRouter}
        className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                   text-sm font-medium transition-colors shadow-sm"
      >
        + Router
      </button>
      <button
        id="btn-add-connection"
        onClick={handleAddConnection}
        className="px-4 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 
                   text-sm font-medium transition-colors shadow-sm"
      >
        + Conexión
      </button>

      {selectedConn && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-xs font-mono text-blue-700">
            <strong>{selectedConn.source}—{selectedConn.target}</strong>
            <span className="text-blue-400 ml-1">({selectedConn.cost})</span>
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">Click para editar</span>
          <button
            onClick={handleDeleteSelectedEdge}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors font-medium"
          >
            Eliminar
          </button>
        </div>
      )}

      <button
        onClick={handleClearAll}
        className="px-4 py-1.5 text-red-600 border border-red-200 rounded-md hover:bg-red-50 
                   text-sm font-medium transition-colors ml-auto"
      >
        Limpiar todo
      </button>
    </div>
  );
}