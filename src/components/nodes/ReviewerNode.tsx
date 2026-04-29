import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { UserCheck } from 'lucide-react';

export function ReviewerNode({ data, selected }: any) {
  return (
    <div 
      className={cn(
        "w-[200px] px-3 py-2 rounded-md border bg-white shadow-sm transition-all flex items-center gap-2",
        selected ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"
      )}
    >
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-slate-300" />
      
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
        <UserCheck size={16} />
      </div>
      <div>
        <p className="text-[9px] text-slate-400 font-medium">{data.index ? `审稿人 ${data.index}` : '审稿人 (Reviewers)'}</p>
        <p className="text-[11px] font-bold text-slate-700">{data.label || '提交审稿结论'}</p>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-slate-300" />
    </div>
  );
}
