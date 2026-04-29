import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';

export function DecisionNode({ data, selected }: any) {
  return (
    <div className="relative w-[136px] h-[136px] flex items-center justify-center">
      {/* The visible diamond */}
      <div 
        className={cn(
          "absolute w-24 h-24 transform rotate-45 border-2 bg-white transition-all shadow-md z-0",
          selected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-300"
        )}
      />
      
      {/* The text content */}
      <div className="relative z-10 text-center px-2">
        <p className="text-[10px] font-bold text-slate-800 leading-tight">
          {data.label}
        </p>
      </div>

      {/* Target handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top" 
        className="!w-2 !h-2 !bg-slate-400 !top-0 !left-1/2 -translate-x-1/2 -translate-y-1/2 !border-none" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left" 
        className="!w-2 !h-2 !bg-slate-400 !left-0 !top-1/2 -translate-x-1/2 -translate-y-1/2 !border-none" 
      />

      {/* Source handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        className="!w-2 !h-2 !bg-slate-400 !top-0 !left-1/2 -translate-x-1/2 -translate-y-1/2 !border-none" 
      />
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        className="!w-2 !h-2 !bg-slate-400 !left-1/2 !top-full -translate-x-1/2 -translate-y-1/2 !border-none" 
      />
      
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        className="!w-2 !h-2 !bg-slate-400 !left-0 !top-1/2 -translate-x-1/2 -translate-y-1/2 !border-none" 
      />
      
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        className="!w-2 !h-2 !bg-slate-400 !left-full !top-1/2 -translate-x-1/2 -translate-y-1/2 !border-none" 
      />
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom-center"
        className="!w-2 !h-2 !bg-slate-400 !left-1/2 !top-full -translate-x-1/2 -translate-y-1/2 !border-none" 
      />

    </div>
  );
}
