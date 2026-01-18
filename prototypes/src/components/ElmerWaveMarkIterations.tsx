import React from 'react';

/**
 * elmer Wave Mark Iterations
 * Focused exploration: Wave V2 (Rolling) and Wave V4 (Ribbon) abstract marks
 * Combined with the gradient wordmark in multiple color palettes
 */

// ============================================
// COLOR PALETTES (existing + new explorations)
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
  // NEW PALETTE EXPLORATIONS
  copper: {
    name: 'Copper Ember',
    colors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
    description: 'Warm copper → amber → gold',
  },
  arctic: {
    name: 'Arctic Dawn',
    colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#e0f2fe', '#f0f9ff'],
    description: 'Sky blue → ice → snow white',
  },
  berry: {
    name: 'Wild Berry',
    colors: ['#be185d', '#db2777', '#ec4899', '#f472b6', '#f9a8d4'],
    description: 'Deep magenta → pink → rose blush',
  },
  sage: {
    name: 'Sage Meadow',
    colors: ['#065f46', '#059669', '#10b981', '#6ee7b7', '#a7f3d0'],
    description: 'Deep green → emerald → mint',
  },
};

export type PaletteKey = keyof typeof palettes;

// ============================================
// WAVE V2 ITERATIONS (Rolling Wave variations)
// ============================================

// Original V2 - Rolling wave with wide curves
export const WaveV2_Original: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave2-orig-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <path
        d="M0 36 Q16 20, 32 32 T64 28"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// V2-A: Softer curve, more horizontal flow
export const WaveV2_A: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave2a-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <path
        d="M2 34 Q20 24, 32 32 Q44 40, 62 30"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// V2-B: Tighter amplitude, more energetic
export const WaveV2_B: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave2b-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="35%" stopColor={colors[1]} />
          <stop offset="65%" stopColor={colors[2]} />
          <stop offset="100%" stopColor={colors[0]} />
        </linearGradient>
      </defs>
      <path
        d="M0 40 Q12 18, 24 32 Q36 46, 48 28 Q54 20, 64 26"
        stroke={`url(#${id})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// V2-C: Elegant ascending wave
export const WaveV2_C: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave2c-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <path
        d="M4 44 Q18 36, 28 40 Q38 44, 48 32 Q58 20, 60 18"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// V2-D: Double stroke wave with depth
export const WaveV2_D: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 38 Q16 22, 32 34 T64 30"
        stroke={colors[2]}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M0 36 Q16 20, 32 32 T64 28"
        stroke={colors[1]}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M0 34 Q16 18, 32 30 T64 26"
        stroke={colors[0]}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// ============================================
// WAVE V4 ITERATIONS (Ribbon Wave variations)
// ============================================

// Original V4 - Ribbon style filled wave
export const WaveV4_Original: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave4-orig-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="33%" stopColor={colors[1]} />
          <stop offset="66%" stopColor={colors[2]} />
          <stop offset="100%" stopColor={colors[0]} />
        </linearGradient>
      </defs>
      <path
        d="M0 36 Q16 20, 32 32 Q48 44, 64 28 L64 36 Q48 52, 32 40 Q16 28, 0 44 Z"
        fill={`url(#${id})`}
        opacity="0.8"
      />
    </svg>
  );
};

// V4-A: Thinner ribbon, more refined
export const WaveV4_A: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave4a-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <path
        d="M0 34 Q16 22, 32 30 Q48 38, 64 26 L64 32 Q48 44, 32 36 Q16 28, 0 40 Z"
        fill={`url(#${id})`}
        opacity="0.85"
      />
    </svg>
  );
};

// V4-B: Dramatic curves with gradient stops
export const WaveV4_B: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave4b-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="25%" stopColor={colors[1]} />
          <stop offset="50%" stopColor={colors[2]} />
          <stop offset="75%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[0]} />
        </linearGradient>
      </defs>
      <path
        d="M-2 42 Q14 16, 32 32 Q50 48, 66 22 L66 32 Q50 58, 32 42 Q14 26, -2 52 Z"
        fill={`url(#${id})`}
        opacity="0.75"
      />
    </svg>
  );
};

// V4-C: Ascending ribbon with glow effect
export const WaveV4_C: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wave4c-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `wave4c-glow-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M2 46 Q18 34, 30 38 Q42 42, 52 28 Q58 20, 62 16 L64 22 Q58 28, 52 36 Q42 50, 30 46 Q18 42, 2 54 Z"
        fill={`url(#${id})`}
        opacity="0.85"
        filter={`url(#${glowId})`}
      />
    </svg>
  );
};

// V4-D: Layered ribbon with transparency
export const WaveV4_D: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'aurora'
}) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back ribbon */}
      <path
        d="M0 40 Q16 24, 32 36 Q48 48, 64 32 L64 40 Q48 56, 32 44 Q16 32, 0 48 Z"
        fill={colors[2]}
        opacity="0.3"
      />
      {/* Middle ribbon */}
      <path
        d="M0 36 Q16 20, 32 32 Q48 44, 64 28 L64 36 Q48 52, 32 40 Q16 28, 0 44 Z"
        fill={colors[1]}
        opacity="0.5"
      />
      {/* Front ribbon */}
      <path
        d="M0 32 Q16 16, 32 28 Q48 40, 64 24 L64 32 Q48 48, 32 36 Q16 24, 0 40 Z"
        fill={colors[0]}
        opacity="0.8"
      />
    </svg>
  );
};

// ============================================
// GRADIENT WORDMARK COMPONENT
// ============================================

export const GradientWordmark: React.FC<{ 
  palette?: PaletteKey;
  width?: number;
}> = ({ palette = 'aurora', width = 120 }) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `wordmark-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  const height = width * 0.3;
  const fontSize = width * 0.22;
  
  return (
    <svg width={width} height={height} viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <text
        x="60"
        y="27"
        textAnchor="middle"
        fontFamily="Chillax, system-ui, sans-serif"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing="-0.02em"
        fill={`url(#${id})`}
      >
        elmer
      </text>
    </svg>
  );
};

// ============================================
// COMBINATION MARK COMPONENT
// ============================================

export const CombinationMark: React.FC<{
  WaveComponent: React.FC<{ size?: number; palette?: PaletteKey }>;
  palette?: PaletteKey;
  variant?: string;
}> = ({ WaveComponent, palette = 'aurora', variant = '' }) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `combo-${palette}-${variant}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center gap-4">
      <WaveComponent size={48} palette={palette} />
      <svg width={100} height={32} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="50%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
        </defs>
        <text
          x="50"
          y="24"
          textAnchor="middle"
          fontFamily="Chillax, system-ui, sans-serif"
          fontWeight="600"
          fontSize="24"
          letterSpacing="-0.02em"
          fill={`url(#${id})`}
        >
          elmer
        </text>
      </svg>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS (moved above for hoisting)
// ============================================

const MarkCard: React.FC<{
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

const CombinationCard: React.FC<{
  title: string;
  palette: PaletteKey;
  WaveComponent: React.FC<{ size?: number; palette?: PaletteKey }>;
}> = ({ title, palette, WaveComponent }) => {
  const colors = palettes[palette]?.colors || palettes.aurora.colors;
  const id = `combo-card-${palette}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div 
      className="flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex-shrink-0">
        <WaveComponent size={52} palette={palette} />
      </div>
      <div>
        <svg width={120} height={36} viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1]} />
              <stop offset="100%" stopColor={colors[2]} />
            </linearGradient>
          </defs>
          <text
            x="60"
            y="27"
            textAnchor="middle"
            fontFamily="Chillax, system-ui, sans-serif"
            fontWeight="600"
            fontSize="26"
            letterSpacing="-0.02em"
            fill={`url(#${id})`}
          >
            elmer
          </text>
        </svg>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
};

const LargePreviewCard: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div 
    className="flex flex-col items-center justify-center p-8 rounded-2xl"
    style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    }}
  >
    <div className="py-4">
      {children}
    </div>
    <div className="text-center mt-4">
      <div className="font-medium text-gray-800" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        {title}
      </div>
      <div className="text-gray-500 text-sm">{subtitle}</div>
    </div>
  </div>
);

const DarkCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50">
    <div className="py-2">
      {children}
    </div>
    <div className="text-white/70 text-xs mt-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
      {title}
    </div>
  </div>
);

// ============================================
// FULL EXPLORATION COMPONENT
// ============================================

export const ElmerWaveMarkIterations: React.FC = () => {
  const allPalettes = Object.keys(palettes) as PaletteKey[];
  const originalPalettes: PaletteKey[] = ['aurora', 'twilight', 'ocean', 'sunset', 'forest', 'midnight'];
  const newPalettes: PaletteKey[] = ['copper', 'arctic', 'berry', 'sage'];
  
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

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 
            className="text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}
          >
            Wave Mark Iterations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Focused exploration of Wave V2 (Rolling) and Wave V4 (Ribbon) abstract marks with the gradient wordmark
          </p>
        </header>

        {/* Wave V2 Iterations */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Wave V2 Iterations
            </h2>
            <p className="text-gray-500">Rolling wave with gentle curves — variations in amplitude, angle, and depth</p>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <MarkCard title="V2 Original" subtitle="Wide rolling curves">
              <WaveV2_Original size={80} />
            </MarkCard>
            <MarkCard title="V2-A Soft" subtitle="More horizontal flow">
              <WaveV2_A size={80} />
            </MarkCard>
            <MarkCard title="V2-B Energetic" subtitle="Tighter amplitude">
              <WaveV2_B size={80} />
            </MarkCard>
            <MarkCard title="V2-C Ascending" subtitle="Elegant upward motion">
              <WaveV2_C size={80} />
            </MarkCard>
            <MarkCard title="V2-D Depth" subtitle="Double stroke layers">
              <WaveV2_D size={80} />
            </MarkCard>
          </div>

          {/* V2 in different palettes */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Wave V2 Original in All Palettes
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {allPalettes.map((key) => (
                <MarkCard key={key} title={palettes[key].name} subtitle="">
                  <WaveV2_Original size={64} palette={key} />
                </MarkCard>
              ))}
            </div>
          </div>

          {/* V2-C (Ascending) in palettes - a popular variant */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Wave V2-C (Ascending) in All Palettes
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {allPalettes.map((key) => (
                <MarkCard key={key} title={palettes[key].name} subtitle="">
                  <WaveV2_C size={64} palette={key} />
                </MarkCard>
              ))}
            </div>
          </div>
        </section>

        {/* Wave V4 Iterations */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Wave V4 Iterations
            </h2>
            <p className="text-gray-500">Ribbon wave with filled form — variations in thickness, curves, and layering</p>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <MarkCard title="V4 Original" subtitle="Classic ribbon fill">
              <WaveV4_Original size={80} />
            </MarkCard>
            <MarkCard title="V4-A Refined" subtitle="Thinner, more elegant">
              <WaveV4_A size={80} />
            </MarkCard>
            <MarkCard title="V4-B Dramatic" subtitle="Bold gradient curves">
              <WaveV4_B size={80} />
            </MarkCard>
            <MarkCard title="V4-C Glow" subtitle="Ascending with glow">
              <WaveV4_C size={80} />
            </MarkCard>
            <MarkCard title="V4-D Layered" subtitle="Transparent depth">
              <WaveV4_D size={80} />
            </MarkCard>
          </div>

          {/* V4 in different palettes */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Wave V4 Original in All Palettes
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {allPalettes.map((key) => (
                <MarkCard key={key} title={palettes[key].name} subtitle="">
                  <WaveV4_Original size={64} palette={key} />
                </MarkCard>
              ))}
            </div>
          </div>

          {/* V4-D (Layered) in palettes */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Wave V4-D (Layered) in All Palettes
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {allPalettes.map((key) => (
                <MarkCard key={key} title={palettes[key].name} subtitle="">
                  <WaveV4_D size={64} palette={key} />
                </MarkCard>
              ))}
            </div>
          </div>
        </section>

        {/* New Palette Exploration */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              New Palette Explorations
            </h2>
            <p className="text-gray-500">Four new color palettes: Copper Ember, Arctic Dawn, Wild Berry, Sage Meadow</p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {newPalettes.map((key) => (
              <div key={key} className="space-y-4">
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="flex gap-1 mb-3">
                    {palettes[key].colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-md first:rounded-l-lg last:rounded-r-lg"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="font-medium text-gray-800 text-sm" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
                    {palettes[key].name}
                  </p>
                  <p className="text-xs text-gray-500">{palettes[key].description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <MarkCard title="V2" subtitle="">
                    <WaveV2_Original size={56} palette={key} />
                  </MarkCard>
                  <MarkCard title="V4" subtitle="">
                    <WaveV4_Original size={56} palette={key} />
                  </MarkCard>
                  <MarkCard title="V2-C" subtitle="">
                    <WaveV2_C size={56} palette={key} />
                  </MarkCard>
                  <MarkCard title="V4-D" subtitle="">
                    <WaveV4_D size={56} palette={key} />
                  </MarkCard>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Combination Marks */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Combination Marks
            </h2>
            <p className="text-gray-500">Wave marks paired with the gradient wordmark in different palettes</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Aurora combinations */}
            <CombinationCard 
              title="V2 Original + elmer" 
              palette="aurora"
              WaveComponent={WaveV2_Original}
            />
            <CombinationCard 
              title="V4 Original + elmer" 
              palette="aurora"
              WaveComponent={WaveV4_Original}
            />
            <CombinationCard 
              title="V2-C Ascending + elmer" 
              palette="aurora"
              WaveComponent={WaveV2_C}
            />
            <CombinationCard 
              title="V4-D Layered + elmer" 
              palette="aurora"
              WaveComponent={WaveV4_D}
            />
          </div>

          {/* Best combinations in different palettes */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              V2-C + Wordmark Across Palettes
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {originalPalettes.map((key) => (
                <CombinationCard 
                  key={key}
                  title={palettes[key].name} 
                  palette={key}
                  WaveComponent={WaveV2_C}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              V4-D + Wordmark Across Palettes
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {originalPalettes.map((key) => (
                <CombinationCard 
                  key={key}
                  title={palettes[key].name} 
                  palette={key}
                  WaveComponent={WaveV4_D}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Large Preview */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              Large Preview
            </h2>
            <p className="text-gray-500">Full-size marks for detailed evaluation</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <LargePreviewCard title="Wave V2 Original" subtitle="Aurora Palette">
              <WaveV2_Original size={160} />
            </LargePreviewCard>
            <LargePreviewCard title="Wave V4 Original" subtitle="Aurora Palette">
              <WaveV4_Original size={160} />
            </LargePreviewCard>
            <LargePreviewCard title="Wave V2-C Ascending" subtitle="Aurora Palette">
              <WaveV2_C size={160} />
            </LargePreviewCard>
            <LargePreviewCard title="Wave V4-D Layered" subtitle="Aurora Palette">
              <WaveV4_D size={160} />
            </LargePreviewCard>
          </div>
        </section>

        {/* Dark Background Preview */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
              On Dark Backgrounds
            </h2>
            <p className="text-gray-500">Testing visibility and impact on dark surfaces</p>
          </div>

          <div 
            className="p-8 rounded-2xl space-y-8"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            }}
          >
            <div className="grid grid-cols-4 gap-4">
              <DarkCard title="V2 Original">
                <WaveV2_Original size={80} />
              </DarkCard>
              <DarkCard title="V4 Original">
                <WaveV4_Original size={80} />
              </DarkCard>
              <DarkCard title="V2-C Ascending">
                <WaveV2_C size={80} />
              </DarkCard>
              <DarkCard title="V4-D Layered">
                <WaveV4_D size={80} />
              </DarkCard>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-slate-800/50">
                <WaveV2_C size={56} />
                <GradientWordmark palette="aurora" width={140} />
              </div>
              <div className="flex items-center gap-4 p-6 rounded-xl bg-slate-800/50">
                <WaveV4_D size={56} />
                <GradientWordmark palette="aurora" width={140} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ElmerWaveMarkIterations;
