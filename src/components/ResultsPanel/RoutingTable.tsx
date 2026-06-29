import { useMemo } from 'react';
import { useGraphStore } from '../../store/graphStore';
import { runDijkstra } from '../../lib/dijkstra';

export default function RoutingTable() {
  const nodes = useGraphStore((s) => s.nodes);
  const connections = useGraphStore((s) => s.connections);
  const sourceNodeId = useGraphStore((s) => s.sourceNodeId);

  const routingEntries = useMemo(() => {
    if (!sourceNodeId) return [];

    const result = runDijkstra(nodes, connections, sourceNodeId);
    const { predecessors } = result;

    const entries: { dest: string; link: string }[] = [];

    for (const node of nodes) {
      if (node.id === sourceNodeId) continue;

      let current: string = node.id;
      while (predecessors[current] !== null && predecessors[current] !== sourceNodeId) {
        current = predecessors[current]!;
      }

      if (predecessors[current] === sourceNodeId) {
        entries.push({
          dest: node.id,
          link: `(${sourceNodeId},${current})`,
        });
      } else {
        entries.push({
          dest: node.id,
          link: '—',
        });
      }
    }

    return entries;
  }, [nodes, connections, sourceNodeId]);

  if (routingEntries.length === 0) {
    return (
      <div className="p-5 text-sm text-slate-400 font-mono">
        Selecciona un nodo origen para ver la tabla de enrutamiento.
      </div>
    );
  }

  return (
    <table className="table-academic">
      <thead>
        <tr>
          <th>Destino</th>
          <th>Enlace</th>
        </tr>
      </thead>
      <tbody>
        {routingEntries.map((entry) => (
          <tr key={entry.dest}>
            <td className="!text-blue-700 font-medium">{entry.dest}</td>
            <td className="!text-blue-600">{entry.link}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}