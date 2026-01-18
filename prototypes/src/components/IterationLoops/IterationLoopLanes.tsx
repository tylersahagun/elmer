export interface LoopGroup {
  id: string;
  start: number;
  end: number;
  label?: string;
}

interface IterationLoopLanesProps {
  columns: string[];
  groups: LoopGroup[];
}

export function IterationLoopLanes({ columns, groups }: IterationLoopLanesProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {groups.map((group) => (
        <div
          key={group.id}
          className="col-span-full"
          style={{ gridColumnStart: group.start + 1, gridColumnEnd: group.end + 2 }}
        >
          <div className="h-6 rounded-full border border-dashed border-purple-300/60 bg-purple-200/30 flex items-center px-3">
            <span className="text-[11px] text-purple-700/80">
              {group.label || `Iteration Loop: ${group.id}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
