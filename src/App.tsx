import { useEffect, useRef } from 'react';
import GraphEditor from './components/GraphEditor/GraphEditor';
import Toolbar from './components/Toolbar/Toolbar';
import SourceSelector from './components/SourceSelector';
import StepTable from './components/ResultsPanel/StepTable';
import RoutingTable from './components/ResultsPanel/RoutingTable';
import { useGraphStore } from './store/graphStore';

export default function App() {
  const addNode = useGraphStore((s) => s.addNode);
  const addConnection = useGraphStore((s) => s.addConnection);
  const setSourceNodeId = useGraphStore((s) => s.setSourceNodeId);
  const recalculateDijkstra = useGraphStore((s) => s.recalculateDijkstra);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    addNode({ id: 'u', label: 'u', x: 50, y: 200 });
    addNode({ id: 'v', label: 'v', x: 200, y: 50 });
    addNode({ id: 'w', label: 'w', x: 400, y: 120 });
    addNode({ id: 'x', label: 'x', x: 200, y: 350 });
    addNode({ id: 'y', label: 'y', x: 350, y: 350 });
    addNode({ id: 'z', label: 'z', x: 500, y: 280 });

    addConnection({ id: 'uv', source: 'u', target: 'v', cost: 2 });
    addConnection({ id: 'ux', source: 'u', target: 'x', cost: 1 });
    addConnection({ id: 'uw', source: 'u', target: 'w', cost: 5 });
    addConnection({ id: 'vw', source: 'v', target: 'w', cost: 3 });
    addConnection({ id: 'vx', source: 'v', target: 'x', cost: 2 });
    addConnection({ id: 'wx', source: 'w', target: 'x', cost: 3 });
    addConnection({ id: 'wy', source: 'w', target: 'y', cost: 1 });
    addConnection({ id: 'wz', source: 'w', target: 'z', cost: 5 });
    addConnection({ id: 'xy', source: 'x', target: 'y', cost: 1 });
    addConnection({ id: 'yz', source: 'y', target: 'z', cost: 2 });

    setSourceNodeId('u');
    setTimeout(() => recalculateDijkstra(), 50);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50">
      {/* Header - sin logo */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 shadow-sm">
        <h1 className="text-base font-bold text-slate-800">
          Link State Routing
        </h1>
        <p className="text-[11px] text-slate-500">
          Algoritmo de Dijkstra · Simulación educativa
        </p>
      </header>

      <Toolbar />
      <SourceSelector />

      <div className="flex flex-1 overflow-hidden">
        {/* Graph Editor */}
        <div className="flex-1 relative">
          <GraphEditor />
        </div>

        {/* Results Panel */}
        <div className="w-[520px] flex flex-col overflow-y-auto bg-white border-l border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block" />
              Tabla de Iteraciones
            </h2>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <StepTable />
            </div>
          </div>
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block" />
              Tabla de Enrutamiento
            </h2>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <RoutingTable />
            </div>
          </div>
          {/* GitHub button */}
          <div className="p-4 flex justify-center">
            <a
              href="https://github.com/RyanAlessandro12"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 
                         bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">RyanAlessandro12</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}