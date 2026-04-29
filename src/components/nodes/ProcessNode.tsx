import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { LucideIcon, User, Search, BookOpen, CheckCircle, Clock } from 'lucide-react';

const roleColors: Record<string, string> = {
  Author: 'border-slate-200 bg-white text-slate-800',
  ME: 'border-emerald-200 bg-emerald-50/30 text-emerald-700',
  AE: 'border-indigo-500 bg-white text-indigo-700 shadow-md ring-2 ring-indigo-50',
  EiC: 'border-amber-200 bg-amber-50/30 text-amber-700',
  Reviewer: 'border-slate-300 bg-slate-50 text-slate-600',
};

const icons: Record<string, LucideIcon> = {
  user: User,
  search: Search,
  book: BookOpen,
  check: CheckCircle,
  clock: Clock
};

const roleNames: Record<string, string> = {
  Author: '作者',
  ME: '管理编辑',
  AE: '学术编辑',
  EiC: '主编',
  Reviewer: '审稿人',
};

export function ProcessNode({ data, selected }: any) {
  const Icon = icons[data.icon as keyof typeof icons] || BookOpen;
  const colorClass = roleColors[data.role as keyof typeof roleColors] || 'border-slate-300 bg-white';
  const displayName = roleNames[data.role as keyof typeof roleNames] || data.role;

  return (
    <div 
      className={cn(
        "w-[200px] px-4 py-3 rounded-lg border-2 shadow-sm transition-all",
        colorClass,
        selected ? "ring-2 ring-offset-2 ring-slate-400 scale-105" : ""
      )}
    >
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="target" position={Position.Left} id="left" className="!opacity-0" />
      
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-white/50">
          <Icon size={14} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-70">
            {displayName}
          </p>
          <p className="text-xs font-semibold leading-tight">
            {data.label}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />
    </div>
  );
}
