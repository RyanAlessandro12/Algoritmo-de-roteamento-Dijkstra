import { useMemo } from 'react';
import { useGraphStore } from '../../store/graphStore';

export default function StepTable() {
  const dijkstraResult = useGraphStore((s) => s.dijkstraResult);
  const nodes = useGraphStore((s) => s.nodes);

  const nodeIds = useMemo(() => nodes.map((n) => n.id), [nodes]);

  if (!dijkstraResult || dijkstraResult.steps.length === 0) {
    return (
      <div className="p-5 text-sm text-slate-400 font-mono">
        Selecciona un nodo origen para ver las iteraciones del algoritmo.
      </div>
    );
  }

  const formatDv = (v: number) => (v === Infinity ? '∞' : v);
  const formatPv = (v: string | null) => v ?? '-';

  return (
    <div className="overflow-x-auto">
      <table className="table-academic">
        <thead>
          <tr>
            <th>Etapa</th>
            <th>N'</th>
            {nodeIds.map((id) => (
              <th key={id}>D({id}),p({id})</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dijkstraResult.steps.map((step, idx) => (
            <tr key={idx}>
              <td className="!text-blue-600">{idx}</td>
              <td className="!text-blue-700">{`{${step.nPrime.join(',')}}`}</td>
              {nodeIds.map((id) => {
                const isInNPrime = step.nPrime.includes(id);
                return (
                  <td
                    key={id}
                    className={isInNPrime ? '!text-slate-300' : ''}
                  >
                    {formatDv(step.dv[id])},{formatPv(step.pv[id])}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}