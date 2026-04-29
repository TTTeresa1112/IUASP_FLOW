import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function PhaseNode({ data, selected }: any) {
  const phaseColors = [
    "border-emerald-200 bg-emerald-50/20 text-emerald-600",
    "border-indigo-200 bg-indigo-50/20 text-indigo-600",
    "border-amber-200 bg-amber-50/10 text-amber-600",
  ];
  
  const colorClass = phaseColors[data.index] || phaseColors[0];

  return (
    <div 
      className={cn(
        "w-full h-full rounded-2xl border-2 border-dashed transition-all p-4",
        colorClass,
        selected ? "border-indigo-400 ring-4 ring-indigo-50/50" : "",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {data.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
            阶段 {data.index + 1}: {data.label}
          </span>
        </div>
      </div>
      
      {/* Target for inter-phase edges */}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}
