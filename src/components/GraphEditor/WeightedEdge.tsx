import { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import { useGraphStore } from '../../store/graphStore';

function WeightedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const updateConnectionCost = useGraphStore((s) => s.updateConnectionCost);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const setSelectedEdgeId = useGraphStore((s) => s.setSelectedEdgeId);
  const inputRef = useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const cost = data?.cost as number;
  const isShortest = data?.isShortest as boolean;
  const isSelected = selectedEdgeId === id;

  const handleLabelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setEditValue(String(cost));
      setIsEditing(true);
      setSelectedEdgeId(id);
    },
    [cost, id, setSelectedEdgeId]
  );

  const handleSave = useCallback(() => {
    const newCost = parseFloat(editValue);
    if (!isNaN(newCost) && newCost > 0) {
      updateConnectionCost(id, newCost);
    }
    setIsEditing(false);
  }, [editValue, id, updateConnectionCost]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [handleSave]
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isShortest ? '#ef4444' : isSelected ? '#3b82f6' : '#94a3b8',
          strokeWidth: isShortest ? 3 : isSelected ? 3 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          onClick={handleLabelClick}
          className="nodrag nopan cursor-pointer transition-all"
          style={{
            position: 'absolute',
            pointerEvents: 'auto',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: isShortest
              ? '#fef2f2'
              : isSelected
                ? '#eff6ff'
                : '#ffffff',
            border: `1.5px solid ${
              isShortest ? '#fca5a5' : isSelected ? '#93c5fd' : '#cbd5e1'
            }`,
            borderRadius: '6px',
            padding: '2px 10px',
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: '12px',
            fontWeight: isShortest || isSelected ? 700 : 500,
            color: isShortest ? '#dc2626' : isSelected ? '#2563eb' : '#64748b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className="w-10 text-center outline-none bg-transparent"
              style={{
                border: 'none',
                borderBottom: '2px solid #3b82f6',
                color: '#2563eb',
                fontFamily: 'inherit',
                fontSize: '12px',
              }}
              type="number"
              min="1"
              step="1"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
            />
          ) : (
            cost
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(WeightedEdge);