import { useState, useRef, useCallback, useEffect } from 'react';
import { Key, Hash, Link, Type, Calendar, ToggleLeft } from 'lucide-react';

const TYPE_ICONS = {
  UUID: Key, INT: Hash, BIGINT: Hash, SERIAL: Hash, BIGSERIAL: Hash,
  VARCHAR: Type, TEXT: Type, CHAR: Type,
  BOOLEAN: ToggleLeft, BOOL: ToggleLeft,
  TIMESTAMP: Calendar, DATE: Calendar, TIMESTAMPTZ: Calendar,
};

function getTypeIcon(type) {
  const upper = (type || '').toUpperCase().split('(')[0].trim();
  return TYPE_ICONS[upper] || Hash;
}

function TableNode({ table, selected, onSelect, style }) {
  const TypeIcon = ({ fieldType }) => {
    const Icon = getTypeIcon(fieldType);
    return <Icon className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />;
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(table.name); }}
      className={`absolute bg-card rounded-lg border shadow-lg cursor-pointer transition-all select-none min-w-[220px] ${
        selected ? 'border-primary shadow-primary/20 shadow-lg' : 'border-border hover:border-border/80'
      }`}
      style={style}
    >
      {/* Table header */}
      <div className={`px-3 py-2 rounded-t-lg border-b border-border ${selected ? 'bg-primary/10' : 'bg-secondary/50'}`}>
        <p className="text-xs font-semibold font-mono text-foreground">{table.name}</p>
        {table.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{table.description}</p>}
      </div>
      {/* Fields */}
      <div className="py-1">
        {(table.fields || []).map(field => (
          <div key={field.name} className="flex items-center gap-2 px-3 py-1 hover:bg-secondary/30 transition-colors">
            <TypeIcon fieldType={field.type} />
            <span className={`text-xs font-mono flex-1 ${field.primary_key ? 'text-warning font-medium' : 'text-foreground'}`}>
              {field.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono opacity-60">{field.type?.split('(')[0]}</span>
            {field.primary_key && <span className="text-xs text-warning">PK</span>}
            {field.unique && !field.primary_key && <span className="text-xs text-primary">UQ</span>}
            {field.nullable && <span className="text-xs text-muted-foreground/50">?</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ERCanvas({ tables = [], relationships = [] }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 40, y: 40, scale: 0.9 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const TABLE_WIDTH = 230;
  const tablePositions = {};
  tables.forEach((t, i) => {
    const cols = Math.max(1, Math.floor(Math.sqrt(tables.length)));
    tablePositions[t.name] = {
      x: t.x !== undefined ? t.x : (i % cols) * 280 + 40,
      y: t.y !== undefined ? t.y : Math.floor(i / cols) * 320 + 40,
    };
  });

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !dragStart) return;
    setTransform(t => ({ ...t, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => { setDragging(false); setDragStart(null); }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(2, Math.max(0.3, t.scale * delta)) }));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const getTableCenter = (name) => {
    const pos = tablePositions[name];
    if (!pos) return { x: 0, y: 0 };
    const table = tables.find(t => t.name === name);
    const height = 40 + (table?.fields?.length || 0) * 24;
    return { x: pos.x + TABLE_WIDTH / 2, y: pos.y + height / 2 };
  };

  return (
    <div
      ref={containerRef}
      className="er-canvas w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => setSelectedTable(null)}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="bg-card border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground">
          {Math.round(transform.scale * 100)}% · Scroll to zoom · Drag to pan
        </div>
        <button
          onClick={() => setTransform({ x: 40, y: 40, scale: 0.9 })}
          className="bg-card border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-card border border-border rounded-md p-3 space-y-1">
        <p className="text-xs font-medium text-foreground mb-2">Legend</p>
        <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-primary/60" /><span className="text-xs text-muted-foreground">1:N</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-warning/60 border-dashed" style={{borderTop: '1px dashed #F0B429'}} /><span className="text-xs text-muted-foreground">N:M</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-success/60" /><span className="text-xs text-muted-foreground">1:1</span></div>
      </div>

      {/* SVG for relationships */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#6C9EFF" opacity="0.6" />
          </marker>
          <marker id="arrow-warn" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#F0B429" opacity="0.6" />
          </marker>
          <marker id="arrow-success" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#3FB950" opacity="0.6" />
          </marker>
        </defs>
        {relationships.map((rel, i) => {
          const from = getTableCenter(rel.from_table);
          const to = getTableCenter(rel.to_table);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const isMany = rel.type === 'many_to_many';
          const isOne = rel.type === 'one_to_one';
          const color = isMany ? '#F0B429' : isOne ? '#3FB950' : '#6C9EFF';
          const marker = isMany ? 'url(#arrow-warn)' : isOne ? 'url(#arrow-success)' : 'url(#arrow)';
          const d = `M ${from.x} ${from.y} Q ${mx} ${from.y} ${to.x} ${to.y}`;
          return (
            <g key={i}>
              <path d={d} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" fill="none"
                strokeDasharray={isMany ? '5,3' : 'none'}
                markerEnd={marker}
              />
              <text x={mx} y={my - 6} fill={color} fontSize="10" textAnchor="middle" opacity="0.8" fontFamily="JetBrains Mono, monospace">
                {rel.from_field}→{rel.to_field}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Table nodes */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0, left: 0,
        }}
      >
        {tables.map(table => (
          <TableNode
            key={table.name}
            table={table}
            selected={selectedTable === table.name}
            onSelect={setSelectedTable}
            style={{ left: tablePositions[table.name]?.x || 0, top: tablePositions[table.name]?.y || 0 }}
          />
        ))}
      </div>

      {tables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          No tables generated yet
        </div>
      )}
    </div>
  );
}