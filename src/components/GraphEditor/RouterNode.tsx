import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';

function RouterNode({ data, id }: NodeProps) {
  const removeNode = useGraphStore((s) => s.removeNode);
  const updateNodeLabel = useGraphStore((s) => s.updateNodeLabel);
  const recalculateDijkstra = useGraphStore((s) => s.recalculateDijkstra);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      removeNode(id);
      setTimeout(() => recalculateDijkstra(), 0);
    },
    [id, removeNode, recalculateDijkstra]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setEditValue(data.label as string);
      setIsEditing(true);
    },
    [data.label]
  );

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== data.label) {
      updateNodeLabel(id, trimmed);
      setTimeout(() => recalculateDijkstra(), 0);
    }
    setIsEditing(false);
  }, [editValue, id, data.label, updateNodeLabel, recalculateDijkstra]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') setIsEditing(false);
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
    <div
      className="relative px-4 py-2 min-w-[56px] text-center group bg-white rounded-full border-2 border-blue-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white" />
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-14 text-center font-bold outline-none border-b-2 border-blue-500 bg-transparent text-sm text-slate-800"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          style={{ fontFamily: 'inherit' }}
        />
      ) : (
        <div className="font-bold text-sm text-blue-700 cursor-pointer select-none">
          {data.label as string}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white" />
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs 
                   flex items-center justify-center opacity-0 group-hover:opacity-100 
                   transition-opacity hover:bg-red-600 shadow-sm"
        title="Eliminar router"
      >
        ×
      </button>
    </div>
  );
}

export default memo(RouterNode);