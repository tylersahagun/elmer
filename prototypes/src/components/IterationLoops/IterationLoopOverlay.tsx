import { WaveV4_A, WaveV4_B, WaveV4_C, WaveV4_D, WaveV4_Original } from "../ElmerWaveMarkIterations";

export type WaveVariant = "original" | "refined" | "dramatic" | "glow" | "layered";

interface OverlayEdge {
  from: number;
  to: number;
}

interface IterationLoopOverlayProps {
  columns: string[];
  edges: OverlayEdge[];
  variant?: WaveVariant;
}

const waveVariants: Record<WaveVariant, React.FC<{ size?: number }>> = {
  original: WaveV4_Original,
  refined: WaveV4_A,
  dramatic: WaveV4_B,
  glow: WaveV4_C,
  layered: WaveV4_D,
};

function buildPath(fromX: number, toX: number) {
  const y = 24;
  const dx = Math.max(80, Math.abs(toX - fromX) / 2);
  return `M ${fromX} ${y} C ${fromX + dx} ${y}, ${toX - dx} ${y + 8}, ${toX} ${y + 8}`;
}

export function IterationLoopOverlay({ columns, edges, variant = "original" }: IterationLoopOverlayProps) {
  const WaveIcon = waveVariants[variant];
  const columnWidth = 140;
  const columnGap = 24;
  const width = columns.length * columnWidth + (columns.length - 1) * columnGap;

  return (
    <div className="relative w-full overflow-x-auto">
      <style>
        {`@keyframes dash { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -32; } }`}
      </style>
      <div className="relative" style={{ width }}>
        <div className="flex gap-6">
          {columns.map((column) => (
            <div key={column} className="w-[140px] h-24 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur">
              <div className="px-3 py-2 text-xs font-medium text-slate-600">{column}</div>
            </div>
          ))}
        </div>
        <svg className="absolute inset-0" width={width} height={120}>
          <defs>
            <linearGradient id={`loop-wave-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f0abfc" />
            </linearGradient>
          </defs>
          {edges.map((edge, index) => {
            const fromX = edge.from * (columnWidth + columnGap) + columnWidth / 2;
            const toX = edge.to * (columnWidth + columnGap) + columnWidth / 2;
            return (
              <path
                key={`${edge.from}-${edge.to}-${index}`}
                d={buildPath(fromX, toX)}
                fill="none"
                stroke={`url(#loop-wave-${variant})`}
                strokeWidth={2}
                strokeDasharray="6 8"
                style={{ animation: "dash 4s linear infinite" }}
              />
            );
          })}
        </svg>
        {edges.map((edge, index) => {
          const x = edge.from * (columnWidth + columnGap) + columnWidth / 2 - 10;
          return (
            <div key={`marker-${edge.from}-${edge.to}-${index}`} className="absolute" style={{ left: x, top: 6 }}>
              <WaveIcon size={24} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
