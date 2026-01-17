import React from 'react';

/**
 * elmer Logo Iterations
 * Focused exploration based on feedback:
 * - Layered E monogram variations
 * - Stacked Planes abstract mark (5 iterations)
 * - Wave abstract mark (5 iterations, no shadow)
 * - Color palette variations
 */

// ============================================
// COLOR PALETTES
// ============================================

export const palettes = {
  aurora: {
    name: 'Aurora (Original)',
    colors: ['#4fd1c5', '#9f7aea', '#ed64a6', '#ecc94b', '#63b3ed'],
    description: 'Teal → Purple → Pink → Gold → Blue',
  },
  twilight: {
    name: 'Twilight',
    colors: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'],
    description: 'Indigo → Violet → Purple → Lavender → Fuchsia',
  },
  ocean: {
    name: 'Ocean Depth',
    colors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
    description: 'Cyan → Teal monochromatic with depth',
  },
  sunset: {
    name: 'Sunset Glow',
    colors: ['#f97316', '#fb923c', '#fbbf24', '#f472b6', '#ec4899'],
    description: 'Orange → Amber → Yellow → Pink → Rose',
  },
  forest: {
    name: 'Forest Mist',
    colors: ['#10b981', '#34d399', '#6ee7b7', '#5eead4', '#2dd4bf'],
    description: 'Emerald → Mint → Teal greens',
  },
  midnight: {
    name: 'Midnight Aurora',
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#14b8a6'],
    description: 'Blue → Indigo → Violet with cyan accents',
  },
};

type PaletteKey = keyof typeof palettes;

// ============================================
// LAYERED E MONOGRAM ITERATIONS
// ============================================

export const LayeredE_V1: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Original: Diagonal offset, back to front */}
      <text x="36" y="44" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[2]} opacity="0.3">e</text>
      <text x="33" y="46" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[1]} opacity="0.6">e</text>
      <text x="30" y="48" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[0]}>e</text>
    </svg>
  );
};

export const LayeredE_V2: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vertical stack: straight down offset */}
      <text x="32" y="40" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[2]} opacity="0.25">e</text>
      <text x="32" y="44" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[1]} opacity="0.55">e</text>
      <text x="32" y="48" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[0]}>e</text>
    </svg>
  );
};

export const LayeredE_V3: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Horizontal fan: spreading right */}
      <text x="28" y="46" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[2]} opacity="0.3">e</text>
      <text x="32" y="46" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[1]} opacity="0.6">e</text>
      <text x="36" y="46" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="38" fill={colors[0]}>e</text>
    </svg>
  );
};

export const LayeredE_V4: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 4 layers with tighter spacing, more dramatic depth */}
      <text x="38" y="42" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="36" fill={colors[3] || colors[2]} opacity="0.2">e</text>
      <text x="35" y="44" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="36" fill={colors[2]} opacity="0.4">e</text>
      <text x="32" y="46" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="36" fill={colors[1]} opacity="0.7">e</text>
      <text x="29" y="48" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="36" fill={colors[0]}>e</text>
    </svg>
  );
};

export const LayeredE_V5: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Concentric/centered with scale difference */}
      <text x="32" y="44" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="44" fill={colors[2]} opacity="0.2">e</text>
      <text x="32" y="45" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="40" fill={colors[1]} opacity="0.5">e</text>
      <text x="32" y="46" textAnchor="middle" fontFamily="Chillax, system-ui, sans-serif" fontWeight="600" fontSize="36" fill={colors[0]}>e</text>
    </svg>
  );
};

// ============================================
// STACKED PLANES ITERATIONS
// ============================================

export const StackedPlanes_V1: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Original style with more defined glass edges */}
      <rect x="18" y="12" width="36" height="22" rx="4" fill={colors[2]} opacity="0.35" />
      <rect x="14" y="20" width="36" height="22" rx="4" fill={colors[1]} opacity="0.55" />
      <rect x="10" y="28" width="36" height="22" rx="4" fill={colors[0]} opacity="0.85" />
      {/* Glass highlight on front */}
      <rect x="10" y="28" width="36" height="22" rx="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    </svg>
  );
};

export const StackedPlanes_V2: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded pills stacked */}
      <rect x="14" y="14" width="36" height="12" rx="6" fill={colors[2]} opacity="0.4" />
      <rect x="12" y="24" width="40" height="12" rx="6" fill={colors[1]} opacity="0.6" />
      <rect x="10" y="34" width="44" height="14" rx="7" fill={colors[0]} opacity="0.9" />
      <rect x="10" y="34" width="44" height="14" rx="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const StackedPlanes_V3: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Isometric/3D perspective cards */}
      <polygon points="12,38 32,28 52,38 32,48" fill={colors[2]} opacity="0.35" />
      <polygon points="12,32 32,22 52,32 32,42" fill={colors[1]} opacity="0.55" />
      <polygon points="12,26 32,16 52,26 32,36" fill={colors[0]} opacity="0.85" />
      <polygon points="12,26 32,16 52,26 32,36" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const StackedPlanes_V4: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Circles/discs stacked */}
      <ellipse cx="32" cy="40" rx="22" ry="8" fill={colors[2]} opacity="0.35" />
      <ellipse cx="32" cy="32" rx="22" ry="8" fill={colors[1]} opacity="0.55" />
      <ellipse cx="32" cy="24" rx="22" ry="8" fill={colors[0]} opacity="0.85" />
      <ellipse cx="32" cy="24" rx="22" ry="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const StackedPlanes_V5: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Square cards with rotation, fanning out */}
      <g transform="rotate(-10, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[2]} opacity="0.35" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[1]} opacity="0.55" />
      </g>
      <g transform="rotate(10, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[0]} opacity="0.85" />
        <rect x="16" y="16" width="32" height="32" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </g>
    </svg>
  );
};

export const StackedPlanes_V6: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vertical bars side by side with depth */}
      <rect x="8" y="14" width="14" height="36" rx="3" fill={colors[2]} opacity="0.4" />
      <rect x="25" y="10" width="14" height="44" rx="3" fill={colors[1]} opacity="0.6" />
      <rect x="42" y="14" width="14" height="36" rx="3" fill={colors[0]} opacity="0.9" />
      <rect x="42" y="14" width="14" height="36" rx="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const StackedPlanes_V7: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cascading cards, top-right to bottom-left */}
      <rect x="24" y="8" width="32" height="20" rx="4" fill={colors[2]} opacity="0.35" />
      <rect x="16" y="18" width="32" height="20" rx="4" fill={colors[1]} opacity="0.55" />
      <rect x="8" y="28" width="32" height="20" rx="4" fill={colors[0]} opacity="0.85" />
      <rect x="8" y="28" width="32" height="20" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

// ============================================
// WAVE ITERATIONS (No shadow)
// ============================================

export const Wave_V1: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave1-${palette}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Single clean sine wave */}
      <path
        d="M4 32 C12 22, 20 22, 28 32 S44 42, 52 32 S60 22, 60 32"
        stroke={`url(#wave1-${palette})`}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const Wave_V2: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave2-${palette}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Gentle rolling wave with wider curves */}
      <path
        d="M0 36 Q16 20, 32 32 T64 28"
        stroke={`url(#wave2-${palette})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const Wave_V3: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave3-${palette}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Three parallel waves, stacked */}
      <path d="M0 24 Q16 16, 32 24 T64 24" stroke={colors[2]} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M0 32 Q16 24, 32 32 T64 32" stroke={colors[1]} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M0 40 Q16 32, 32 40 T64 40" stroke={colors[0]} strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const Wave_V4: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave4-${palette}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="33%" stopColor={colors[1]} />
          <stop offset="66%" stopColor={colors[2]} />
          <stop offset="100%" stopColor={colors[0]} />
        </linearGradient>
      </defs>
      {/* Ribbon style - filled wave */}
      <path
        d="M0 36 Q16 20, 32 32 Q48 44, 64 28 L64 36 Q48 52, 32 40 Q16 28, 0 44 Z"
        fill={`url(#wave4-${palette})`}
        opacity="0.8"
      />
    </svg>
  );
};

export const Wave_V5: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave5-${palette}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Tight frequency wave - more peaks */}
      <path
        d="M2 32 Q8 24, 14 32 T26 32 T38 32 T50 32 T62 32"
        stroke={`url(#wave5-${palette})`}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const Wave_V6: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave6-${palette}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Flowing S-curve */}
      <path
        d="M8 52 C20 52, 20 12, 32 12 S44 52, 56 52"
        stroke={`url(#wave6-${palette})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const Wave_V7: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette].colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dot-accented wave with dots at peaks */}
      <path
        d="M4 38 Q16 22, 32 32 T60 26"
        stroke={colors[1]}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="4" cy="38" r="4" fill={colors[0]} />
      <circle cx="32" cy="32" r="4" fill={colors[1]} />
      <circle cx="60" cy="26" r="4" fill={colors[2]} />
    </svg>
  );
};

// ============================================
// COLOR PALETTE DISPLAY COMPONENT
// ============================================

export const ColorPaletteDisplay: React.FC<{ paletteKey: PaletteKey }> = ({ paletteKey }) => {
  const palette = palettes[paletteKey];
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {palette.colors.map((color, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg first:rounded-l-xl last:rounded-r-xl"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div>
        <p className="font-medium text-gray-800 text-sm" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          {palette.name}
        </p>
        <p className="text-xs text-gray-500">{palette.description}</p>
      </div>
    </div>
  );
};

// ============================================
// FULL ITERATIONS EXPLORATION COMPONENT
// ============================================

export const ElmerLogoIterations: React.FC = () => {
  const allPalettes = Object.keys(palettes) as PaletteKey[];
  
  return (
    <div className="min-h-screen p-8" style={{ fontFamily: 'Synonym, system-ui, sans-serif' }}>
      {/* Aurora Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%)',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, #4fd1c5, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 60%, #9f7aea, transparent 50%),
              radial-gradient(ellipse 50% 30% at 40% 80%, #ed64a6, transparent 50%)
            `,
            opacity: 0.12,
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 
            className="text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}
          >
            elmer Logo Iterations
          </h1>
          <p className="text-gray-600 text-lg">
            Focused exploration: Layered E, Stacked Planes, Wave, and Color Palettes
          </p>
        </header>

        {/* Color Palettes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            Color Palette Variations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {allPalettes.map((key) => (
              <div key={key} className="p-4 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}>
                <ColorPaletteDisplay paletteKey={key} />
              </div>
            ))}
          </div>
        </section>

        {/* Layered E Monograms */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            Layered E Monogram Iterations
          </h2>
          <div className="grid grid-cols-5 gap-4">
            <IterationCard title="V1: Diagonal" subtitle="Back to front">
              <LayeredE_V1 size={80} />
            </IterationCard>
            <IterationCard title="V2: Vertical" subtitle="Straight down">
              <LayeredE_V2 size={80} />
            </IterationCard>
            <IterationCard title="V3: Horizontal" subtitle="Fan right">
              <LayeredE_V3 size={80} />
            </IterationCard>
            <IterationCard title="V4: 4 Layers" subtitle="More depth">
              <LayeredE_V4 size={80} />
            </IterationCard>
            <IterationCard title="V5: Concentric" subtitle="Scale variation">
              <LayeredE_V5 size={80} />
            </IterationCard>
          </div>
          
          {/* Same variations with different palettes */}
          <h3 className="text-lg font-medium text-gray-700 mt-8" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V1 (Diagonal) in Different Palettes
          </h3>
          <div className="grid grid-cols-6 gap-4">
            {allPalettes.map((key) => (
              <IterationCard key={key} title={palettes[key].name} subtitle="">
                <LayeredE_V1 size={64} palette={key} />
              </IterationCard>
            ))}
          </div>
        </section>

        {/* Stacked Planes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            Stacked Planes Iterations
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <IterationCard title="V1: Classic" subtitle="Rectangle cards">
              <StackedPlanes_V1 size={80} />
            </IterationCard>
            <IterationCard title="V2: Pills" subtitle="Rounded expanding">
              <StackedPlanes_V2 size={80} />
            </IterationCard>
            <IterationCard title="V3: Isometric" subtitle="3D perspective">
              <StackedPlanes_V3 size={80} />
            </IterationCard>
            <IterationCard title="V4: Discs" subtitle="Ellipse stack">
              <StackedPlanes_V4 size={80} />
            </IterationCard>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <IterationCard title="V5: Rotated" subtitle="Fanning cards">
              <StackedPlanes_V5 size={80} />
            </IterationCard>
            <IterationCard title="V6: Vertical Bars" subtitle="Side by side">
              <StackedPlanes_V6 size={80} />
            </IterationCard>
            <IterationCard title="V7: Cascade" subtitle="Top-right flow">
              <StackedPlanes_V7 size={80} />
            </IterationCard>
          </div>
          
          {/* Stacked Planes in different palettes */}
          <h3 className="text-lg font-medium text-gray-700 mt-8" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V1 (Classic) in Different Palettes
          </h3>
          <div className="grid grid-cols-6 gap-4">
            {allPalettes.map((key) => (
              <IterationCard key={key} title={palettes[key].name} subtitle="">
                <StackedPlanes_V1 size={64} palette={key} />
              </IterationCard>
            ))}
          </div>
        </section>

        {/* Wave */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            Wave Iterations (No Shadow)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <IterationCard title="V1: Clean Sine" subtitle="Classic wave">
              <Wave_V1 size={80} />
            </IterationCard>
            <IterationCard title="V2: Rolling" subtitle="Wide curves">
              <Wave_V2 size={80} />
            </IterationCard>
            <IterationCard title="V3: Parallel" subtitle="Three stacked">
              <Wave_V3 size={80} />
            </IterationCard>
            <IterationCard title="V4: Ribbon" subtitle="Filled wave">
              <Wave_V4 size={80} />
            </IterationCard>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <IterationCard title="V5: High Freq" subtitle="More peaks">
              <Wave_V5 size={80} />
            </IterationCard>
            <IterationCard title="V6: S-Curve" subtitle="Vertical flow">
              <Wave_V6 size={80} />
            </IterationCard>
            <IterationCard title="V7: Dot Accents" subtitle="Peak markers">
              <Wave_V7 size={80} />
            </IterationCard>
          </div>
          
          {/* Wave in different palettes */}
          <h3 className="text-lg font-medium text-gray-700 mt-8" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V2 (Rolling) in Different Palettes
          </h3>
          <div className="grid grid-cols-6 gap-4">
            {allPalettes.map((key) => (
              <IterationCard key={key} title={palettes[key].name} subtitle="">
                <Wave_V2 size={64} palette={key} />
              </IterationCard>
            ))}
          </div>
        </section>

        {/* Combination Preview */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            Combination Previews
          </h2>
          <p className="text-gray-600">How different marks pair with the gradient wordmark</p>
          <div className="grid grid-cols-2 gap-6">
            <CombinationPreview 
              title="Layered E + elmer"
              monogram={<LayeredE_V1 size={56} />}
            />
            <CombinationPreview 
              title="Stacked Planes + elmer"
              monogram={<StackedPlanes_V1 size={56} />}
            />
            <CombinationPreview 
              title="Wave + elmer"
              monogram={<Wave_V2 size={56} />}
            />
            <CombinationPreview 
              title="Rotated Planes + elmer"
              monogram={<StackedPlanes_V5 size={56} />}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper Components
const IterationCard: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div 
    className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105"
    style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    }}
  >
    <div className="flex-1 flex items-center justify-center py-2">
      {children}
    </div>
    <div className="text-center mt-2">
      <div className="font-medium text-gray-800 text-xs" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        {title}
      </div>
      {subtitle && <div className="text-gray-400 text-[10px]">{subtitle}</div>}
    </div>
  </div>
);

const CombinationPreview: React.FC<{
  title: string;
  monogram: React.ReactNode;
}> = ({ title, monogram }) => (
  <div 
    className="flex items-center gap-6 p-6 rounded-2xl"
    style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    }}
  >
    <div className="flex-shrink-0">{monogram}</div>
    <div>
      <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="previewGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#4fd1c5" />
            <stop offset="50%" stopColor="#9f7aea" />
            <stop offset="100%" stopColor="#ed64a6" />
          </linearGradient>
        </defs>
        <text
          x="70"
          y="30"
          textAnchor="middle"
          fontFamily="Chillax, system-ui, sans-serif"
          fontWeight="600"
          fontSize="30"
          letterSpacing="-0.02em"
          fill="url(#previewGradient)"
        >
          elmer
        </text>
      </svg>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  </div>
);

export default ElmerLogoIterations;
