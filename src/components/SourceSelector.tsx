import { useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';

export default function SourceSelector() {
  const nodes = useGraphStore((s) => s.nodes);
  const sourceNodeId = useGraphStore((s) => s.sourceNodeId);
  const setSourceNodeId = useGraphStore((s) => s.setSourceNodeId);
  const recalculateDijkstra = useGraphStore((s) => s.recalculateDijkstra);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value || null;
      setSourceNodeId(id);
      setTimeout(() => recalculateDijkstra(), 0);
    },
    [setSourceNodeId, recalculateDijkstra]
  );

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-white border-b border-slate-200">
      <label
        htmlFor="source-select"
        className="text-xs font-medium text-slate-600 uppercase tracking-wider"
      >
        Nodo origen
      </label>
      <select
        id="source-select"
        value={sourceNodeId ?? ''}
        onChange={handleChange}
        className="professional-select"
      >
        <option value="">— Seleccionar —</option>
        {nodes.map((node) => (
          <option key={node.id} value={node.id}>
            {node.label}
          </option>
        ))}
      </select>
    </div>
  );
}