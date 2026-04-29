import { cn } from '../../lib/utils';

export function OptionalGroupNode({ selected }: any) {
  return (
    <div className="relative w-full h-full">
      <span
        className={cn(
          "absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50 px-1"
        )}
      >
        可跳过
      </span>
      <div
        className={cn(
          "w-full h-full rounded-xl border-2 border-dashed border-slate-400 bg-transparent",
          selected ? "border-slate-500" : ""
        )}
      />
    </div>
  );
}
