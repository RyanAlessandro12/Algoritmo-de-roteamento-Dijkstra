import { describe, it, expect } from 'vitest';
import { runDijkstra } from '../src/lib/dijkstra';
import type { RouterNode, Connection, DijkstraStep } from '../src/lib/graphModel';

const NODES: RouterNode[] = [
  { id: 'u', label: 'u', x: 0, y: 0 },
  { id: 'v', label: 'v', x: 0, y: 0 },
  { id: 'w', label: 'w', x: 0, y: 0 },
  { id: 'x', label: 'x', x: 0, y: 0 },
  { id: 'y', label: 'y', x: 0, y: 0 },
  { id: 'z', label: 'z', x: 0, y: 0 },
];

const CONNECTIONS: Connection[] = [
  { id: 'uv', source: 'u', target: 'v', cost: 2 },
  { id: 'ux', source: 'u', target: 'x', cost: 1 },
  { id: 'uw', source: 'u', target: 'w', cost: 5 },
  { id: 'vw', source: 'v', target: 'w', cost: 3 },
  { id: 'vx', source: 'v', target: 'x', cost: 2 },
  { id: 'wx', source: 'w', target: 'x', cost: 3 },
  { id: 'wy', source: 'w', target: 'y', cost: 1 },
  { id: 'wz', source: 'w', target: 'z', cost: 5 },
  { id: 'xy', source: 'x', target: 'y', cost: 1 },
  { id: 'yz', source: 'y', target: 'z', cost: 2 },
];

describe('runDijkstra', () => {
  const result = runDijkstra(NODES, CONNECTIONS, 'u');

  it('should have 6 steps (initial + 5 iterations for 6 nodes)', () => {
    expect(result.steps.length).toBe(6);
  });

  it('Step 0: N\'={u} with initial distances', () => {
    const step0 = result.steps[0];
    expect(step0.nPrime).toEqual(['u']);
    expect(step0.dv['v']).toBe(2);
    expect(step0.pv['v']).toBe('u');
    expect(step0.dv['w']).toBe(5);
    expect(step0.pv['w']).toBe('u');
    expect(step0.dv['x']).toBe(1);
    expect(step0.pv['x']).toBe('u');
    expect(step0.dv['y']).toBe(Infinity);
    expect(step0.pv['y']).toBeNull();
    expect(step0.dv['z']).toBe(Infinity);
    expect(step0.pv['z']).toBeNull();
  });

  it('Step 1: N\'={u,x} after picking x (distance 1)', () => {
    const step1 = result.steps[1];
    expect(step1.nPrime).toContain('u');
    expect(step1.nPrime).toContain('x');
    // v: stays 2 via u  (2 < 1+2=3)
    expect(step1.dv['v']).toBe(2);
    expect(step1.pv['v']).toBe('u');
    // w: becomes 4 via x (1+3=4 < 5)
    expect(step1.dv['w']).toBe(4);
    expect(step1.pv['w']).toBe('x');
    // y: becomes 2 via x (1+1=2)
    expect(step1.dv['y']).toBe(2);
    expect(step1.pv['y']).toBe('x');
    // z: still infinity
    expect(step1.dv['z']).toBe(Infinity);
    expect(step1.pv['z']).toBeNull();
  });

  it('Step 2: N\'={u,x,y} after picking y (distance 2)', () => {
    const step2 = result.steps[2];
    expect(step2.nPrime).toContain('u');
    expect(step2.nPrime).toContain('x');
    expect(step2.nPrime).toContain('y');
    // v: stays 2
    expect(step2.dv['v']).toBe(2);
    expect(step2.pv['v']).toBe('u');
    // w: becomes 3 via y (2+1=3 < 4)
    expect(step2.dv['w']).toBe(3);
    expect(step2.pv['w']).toBe('y');
    // z: becomes 4 via y (2+2=4)
    expect(step2.dv['z']).toBe(4);
    expect(step2.pv['z']).toBe('y');
  });

  it('Step 3: N\'={u,x,y,v} after picking v (distance 2)', () => {
    const step3 = result.steps[3];
    expect(step3.nPrime).toContain('u');
    expect(step3.nPrime).toContain('x');
    expect(step3.nPrime).toContain('y');
    expect(step3.nPrime).toContain('v');
    // w: stays 3 (via y) - v would give 2+3=5
    expect(step3.dv['w']).toBe(3);
    expect(step3.pv['w']).toBe('y');
    // z: stays 4
    expect(step3.dv['z']).toBe(4);
    expect(step3.pv['z']).toBe('y');
  });

  it('Step 4: N\'={u,x,y,v,w} after picking w (distance 3)', () => {
    const step4 = result.steps[4];
    expect(step4.nPrime).toContain('u');
    expect(step4.nPrime).toContain('x');
    expect(step4.nPrime).toContain('y');
    expect(step4.nPrime).toContain('v');
    expect(step4.nPrime).toContain('w');
    // z: stays 4 (y) vs 3+5=8 via w
    expect(step4.dv['z']).toBe(4);
    expect(step4.pv['z']).toBe('y');
  });

  it('Step 5: N\'={u,x,y,v,w,z} after picking z (distance 4)', () => {
    const step5 = result.steps[5];
    expect(step5.nPrime.sort()).toEqual(['u', 'v', 'w', 'x', 'y', 'z']);
  });

  it('final predecessors produce correct routing table from u', () => {
    // Reconstruct first hops
    function getFirstHop(dest: string): string | null {
      let current = dest;
      while (result.predecessors[current] !== null && result.predecessors[current] !== 'u') {
        current = result.predecessors[current]!;
      }
      return result.predecessors[current] !== null ? `(${dest} -> ${current})` : null;
    }

    // v -> (u,v)
    expect(getFirstHop('v')).toBe('(v -> v)');
    // Actually let's use the correct reconstruction: first hop from u
    function firstHopFromU(dest: string): string | null {
      if (dest === 'u') return null;
      let current = dest;
      // Walk back through predecessors until we hit u's neighbor
      while (result.predecessors[current] !== null && result.predecessors[current] !== 'u') {
        current = result.predecessors[current]!;
      }
      if (result.predecessors[current] === 'u') {
        return `(${dest},${current})`; // edge from u to current
      }
      return null;
    }

    expect(firstHopFromU('v')).toBe('(v,v)');
    expect(firstHopFromU('w')).toBe('(w,x)');
    expect(firstHopFromU('x')).toBe('(x,x)');
    expect(firstHopFromU('y')).toBe('(y,x)');
    expect(firstHopFromU('z')).toBe('(z,x)');
  });
});