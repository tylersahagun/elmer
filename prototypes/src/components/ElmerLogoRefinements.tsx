import React from 'react';

/**
 * elmer Logo Refinements
 * Focused iterations based on feedback:
 * - V5 Rotated Stacked Planes (5 variations)
 * - V3 Isometric Stacked Planes (5 variations)
 * - Forest Mist & Midnight Aurora colorways
 * - New "Iterative Process" abstract symbols
 */

// ============================================
// REFINED COLOR PALETTES
// ============================================

export const refinedPalettes = {
  forestMist: {
    name: 'Forest Mist',
    colors: ['#10b981', '#34d399', '#6ee7b7', '#5eead4', '#2dd4bf'],
    description: 'Emerald → Mint → Teal greens',
  },
  midnightAurora: {
    name: 'Midnight Aurora',
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#14b8a6'],
    description: 'Blue → Indigo → Violet with cyan accents',
  },
  forestDeep: {
    name: 'Forest Deep',
    colors: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
    description: 'Deep emerald to light mint',
  },
  midnightDeep: {
    name: 'Midnight Deep',
    colors: ['#1e40af', '#3730a3', '#4f46e5', '#6366f1', '#818cf8'],
    description: 'Deep blue to soft indigo',
  },
  forestTwilight: {
    name: 'Forest Twilight',
    colors: ['#10b981', '#14b8a6', '#06b6d4', '#6366f1', '#8b5cf6'],
    description: 'Green transitioning to purple',
  },
  auroraGreen: {
    name: 'Aurora Green',
    colors: ['#10b981', '#2dd4bf', '#06b6d4', '#0891b2', '#0e7490'],
    description: 'Emerald to ocean teal',
  },
};

type PaletteKey = keyof typeof refinedPalettes;

// ============================================
// ROTATED STACKED PLANES VARIATIONS (5)
// ============================================

export const RotatedPlanes_A: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Original V5: ±10 degree rotation */}
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

export const RotatedPlanes_B: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wider spread: ±15 degrees */}
      <g transform="rotate(-15, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[2]} opacity="0.3" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(15, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[0]} opacity="0.85" />
        <rect x="14" y="14" width="36" height="36" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// ============================================
// WIDE SPREAD ITERATIONS (8 variations)
// ============================================

// WS1: Classic wide spread ±15°
export const WideSpread_1: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-15, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[2]} opacity="0.3" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(15, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[0]} opacity="0.85" />
        <rect x="14" y="14" width="36" height="36" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS2: Extra wide ±20°
export const WideSpread_2: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-20, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[2]} opacity="0.25" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(20, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[0]} opacity="0.85" />
        <rect x="14" y="14" width="36" height="36" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS3: 4 layers with ±18° spread
export const WideSpread_3: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-18, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[4] || colors[2]} opacity="0.2" />
      </g>
      <g transform="rotate(-6, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[2]} opacity="0.35" />
      </g>
      <g transform="rotate(6, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[1]} opacity="0.55" />
      </g>
      <g transform="rotate(18, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[0]} opacity="0.85" />
        <rect x="14" y="14" width="36" height="36" rx="5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS4: More rounded corners
export const WideSpread_4: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-15, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="12" fill={colors[2]} opacity="0.3" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="12" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(15, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="12" fill={colors[0]} opacity="0.85" />
        <rect x="12" y="12" width="40" height="40" rx="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS5: Asymmetric rotation (-10°, 0°, +20°)
export const WideSpread_5: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-10, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[2]} opacity="0.3" />
      </g>
      <g transform="rotate(5, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(20, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[0]} opacity="0.85" />
        <rect x="14" y="14" width="36" height="36" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS6: Scale decrease with rotation
export const WideSpread_6: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-15, 32, 32)">
        <rect x="10" y="10" width="44" height="44" rx="6" fill={colors[2]} opacity="0.25" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="5" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(15, 32, 32)">
        <rect x="18" y="18" width="28" height="28" rx="4" fill={colors[0]} opacity="0.9" />
        <rect x="18" y="18" width="28" height="28" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS7: 5 layers, fan effect
export const WideSpread_7: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-20, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[4] || colors[2]} opacity="0.15" />
      </g>
      <g transform="rotate(-10, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[3] || colors[2]} opacity="0.25" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[2]} opacity="0.4" />
      </g>
      <g transform="rotate(10, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[1]} opacity="0.6" />
      </g>
      <g transform="rotate(20, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="4" fill={colors[0]} opacity="0.9" />
        <rect x="16" y="16" width="32" height="32" rx="4" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// WS8: Squircle shape (super-ellipse rounded)
export const WideSpread_8: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-15, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="16" fill={colors[2]} opacity="0.3" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="16" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(15, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="16" fill={colors[0]} opacity="0.85" />
        <rect x="12" y="12" width="40" height="40" rx="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </g>
    </svg>
  );
};

export const RotatedPlanes_C: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 4 layers, tighter rotation increments */}
      <g transform="rotate(-12, 32, 32)">
        <rect x="18" y="18" width="28" height="28" rx="4" fill={colors[4] || colors[2]} opacity="0.2" />
      </g>
      <g transform="rotate(-4, 32, 32)">
        <rect x="18" y="18" width="28" height="28" rx="4" fill={colors[2]} opacity="0.4" />
      </g>
      <g transform="rotate(4, 32, 32)">
        <rect x="18" y="18" width="28" height="28" rx="4" fill={colors[1]} opacity="0.6" />
      </g>
      <g transform="rotate(12, 32, 32)">
        <rect x="18" y="18" width="28" height="28" rx="4" fill={colors[0]} opacity="0.9" />
        <rect x="18" y="18" width="28" height="28" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </g>
    </svg>
  );
};

export const RotatedPlanes_D: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded corners more prominent, asymmetric rotation */}
      <g transform="rotate(-8, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="10" fill={colors[2]} opacity="0.35" />
      </g>
      <g transform="rotate(2, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="10" fill={colors[1]} opacity="0.55" />
      </g>
      <g transform="rotate(12, 32, 32)">
        <rect x="14" y="14" width="36" height="36" rx="10" fill={colors[0]} opacity="0.85" />
        <rect x="14" y="14" width="36" height="36" rx="10" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      </g>
    </svg>
  );
};

export const RotatedPlanes_E: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Scale variation with rotation */}
      <g transform="rotate(-10, 32, 32)">
        <rect x="12" y="12" width="40" height="40" rx="6" fill={colors[2]} opacity="0.25" />
      </g>
      <g transform="rotate(0, 32, 32)">
        <rect x="16" y="16" width="32" height="32" rx="5" fill={colors[1]} opacity="0.5" />
      </g>
      <g transform="rotate(10, 32, 32)">
        <rect x="20" y="20" width="24" height="24" rx="4" fill={colors[0]} opacity="0.9" />
        <rect x="20" y="20" width="24" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </g>
    </svg>
  );
};

// ============================================
// ISOMETRIC STACKED PLANES VARIATIONS (5)
// ============================================

export const IsometricPlanes_A: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Original V3 isometric */}
      <polygon points="12,38 32,28 52,38 32,48" fill={colors[2]} opacity="0.35" />
      <polygon points="12,32 32,22 52,32 32,42" fill={colors[1]} opacity="0.55" />
      <polygon points="12,26 32,16 52,26 32,36" fill={colors[0]} opacity="0.85" />
      <polygon points="12,26 32,16 52,26 32,36" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const IsometricPlanes_B: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tighter vertical spacing */}
      <polygon points="10,36 32,26 54,36 32,46" fill={colors[2]} opacity="0.3" />
      <polygon points="10,32 32,22 54,32 32,42" fill={colors[1]} opacity="0.5" />
      <polygon points="10,28 32,18 54,28 32,38" fill={colors[0]} opacity="0.85" />
      <polygon points="10,28 32,18 54,28 32,38" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
    </svg>
  );
};

export const IsometricPlanes_C: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 4 layers, more dramatic depth */}
      <polygon points="8,44 32,32 56,44 32,56" fill={colors[4] || colors[2]} opacity="0.2" />
      <polygon points="8,38 32,26 56,38 32,50" fill={colors[2]} opacity="0.35" />
      <polygon points="8,32 32,20 56,32 32,44" fill={colors[1]} opacity="0.55" />
      <polygon points="8,26 32,14 56,26 32,38" fill={colors[0]} opacity="0.85" />
      <polygon points="8,26 32,14 56,26 32,38" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const IsometricPlanes_D: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steeper angle, more vertical look */}
      <polygon points="16,42 32,30 48,42 32,54" fill={colors[2]} opacity="0.35" />
      <polygon points="16,34 32,22 48,34 32,46" fill={colors[1]} opacity="0.55" />
      <polygon points="16,26 32,14 48,26 32,38" fill={colors[0]} opacity="0.85" />
      <polygon points="16,26 32,14 48,26 32,38" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

export const IsometricPlanes_E: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wider, flatter perspective */}
      <polygon points="4,36 32,24 60,36 32,48" fill={colors[2]} opacity="0.3" />
      <polygon points="4,32 32,20 60,32 32,44" fill={colors[1]} opacity="0.5" />
      <polygon points="4,28 32,16 60,28 32,40" fill={colors[0]} opacity="0.85" />
      <polygon points="4,28 32,16 60,28 32,40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
};

// ============================================
// ITERATIVE PROCESS SYMBOLS (New concepts)
// ============================================

// Concept 1: Spiral/Growth - represents iterative refinement
export const IterativeSpiral: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`spiral-${palette}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Growing spiral */}
      <path
        d="M32 32 
           C32 28, 36 28, 36 32 
           C36 38, 26 38, 26 32 
           C26 22, 42 22, 42 32 
           C42 46, 18 46, 18 32 
           C18 14, 50 14, 50 32"
        stroke={`url(#spiral-${palette})`}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// Concept 2: Concentric circles expanding - iteration cycles
export const IterativeCycles: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="24" fill="none" stroke={colors[2]} strokeWidth="3" opacity="0.3" />
      <circle cx="32" cy="32" r="18" fill="none" stroke={colors[1]} strokeWidth="3" opacity="0.5" />
      <circle cx="32" cy="32" r="12" fill="none" stroke={colors[0]} strokeWidth="3" opacity="0.7" />
      <circle cx="32" cy="32" r="6" fill={colors[0]} opacity="0.9" />
    </svg>
  );
};

// Concept 3: Loop/Infinity variant - continuous iteration
export const IterativeLoop: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`loop-${palette}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      {/* Rounded infinity/loop shape */}
      <path
        d="M20 32 C20 24, 28 20, 32 28 C36 36, 44 32, 44 32 C44 32, 44 40, 36 40 C28 40, 28 32, 32 32 C36 32, 36 24, 28 24 C20 24, 20 32, 20 32 Z"
        fill={`url(#loop-${palette})`}
        opacity="0.85"
      />
      <path
        d="M20 32 C20 24, 28 20, 32 28 C36 36, 44 32, 44 32 C44 32, 44 40, 36 40 C28 40, 28 32, 32 32 C36 32, 36 24, 28 24 C20 24, 20 32, 20 32 Z"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
    </svg>
  );
};

// Concept 4: Stacked arrows/chevrons - forward momentum
export const IterativeChevrons: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 38 L32 26 L48 38" stroke={colors[2]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35" />
      <path d="M16 32 L32 20 L48 32" stroke={colors[1]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
      <path d="M16 26 L32 14 L48 26" stroke={colors[0]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
    </svg>
  );
};

// Concept 5: Layered dots/nodes - building blocks
export const IterativeNodes: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Triangular arrangement of growing nodes */}
      <circle cx="32" cy="16" r="6" fill={colors[0]} opacity="0.9" />
      <circle cx="20" cy="32" r="7" fill={colors[1]} opacity="0.7" />
      <circle cx="44" cy="32" r="7" fill={colors[1]} opacity="0.7" />
      <circle cx="32" cy="46" r="8" fill={colors[2]} opacity="0.5" />
      {/* Connecting lines */}
      <line x1="32" y1="22" x2="23" y2="27" stroke={colors[0]} strokeWidth="2" opacity="0.4" />
      <line x1="32" y1="22" x2="41" y2="27" stroke={colors[0]} strokeWidth="2" opacity="0.4" />
      <line x1="23" y1="37" x2="28" y2="42" stroke={colors[1]} strokeWidth="2" opacity="0.4" />
      <line x1="41" y1="37" x2="36" y2="42" stroke={colors[1]} strokeWidth="2" opacity="0.4" />
    </svg>
  );
};

// Concept 6: Rising bars/steps - progressive iteration
export const IterativeSteps: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="40" width="12" height="16" rx="3" fill={colors[2]} opacity="0.5" />
      <rect x="26" y="28" width="12" height="28" rx="3" fill={colors[1]} opacity="0.7" />
      <rect x="44" y="16" width="12" height="40" rx="3" fill={colors[0]} opacity="0.9" />
      <rect x="44" y="16" width="12" height="40" rx="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
};

// Concept 7: Rotating/evolving shape - transformation
export const IterativeTransform: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Circle evolving to square */}
      <circle cx="32" cy="32" r="20" fill={colors[2]} opacity="0.25" />
      <rect x="16" y="16" width="32" height="32" rx="10" fill={colors[1]} opacity="0.45" />
      <rect x="18" y="18" width="28" height="28" rx="4" fill={colors[0]} opacity="0.85" />
      <rect x="18" y="18" width="28" height="28" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
};

// Concept 8: Overlapping circles - Venn/iteration overlap
export const IterativeOverlap: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="28" r="14" fill={colors[2]} opacity="0.4" />
      <circle cx="40" cy="28" r="14" fill={colors[1]} opacity="0.4" />
      <circle cx="32" cy="40" r="14" fill={colors[0]} opacity="0.6" />
      <circle cx="32" cy="40" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
};

// Concept 9: Ripple effect - impact spreading outward
export const IterativeRipple: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'midnightAurora'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="26" fill="none" stroke={colors[2]} strokeWidth="2" opacity="0.25" />
      <circle cx="32" cy="32" r="20" fill="none" stroke={colors[2]} strokeWidth="2.5" opacity="0.4" />
      <circle cx="32" cy="32" r="14" fill="none" stroke={colors[1]} strokeWidth="3" opacity="0.6" />
      <circle cx="32" cy="32" r="8" fill={colors[0]} opacity="0.9" />
    </svg>
  );
};

// Concept 10: Ascending petals/leaves - organic growth
export const IterativeGrowth: React.FC<{ size?: number; palette?: PaletteKey }> = ({ 
  size = 64,
  palette = 'forestMist'
}) => {
  const colors = refinedPalettes[palette]?.colors ?? refinedPalettes.midnightAurora.colors;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Growing leaves/petals */}
      <ellipse cx="32" cy="44" rx="10" ry="14" fill={colors[2]} opacity="0.4" transform="rotate(25, 32, 44)" />
      <ellipse cx="32" cy="38" rx="9" ry="12" fill={colors[1]} opacity="0.6" transform="rotate(-15, 32, 38)" />
      <ellipse cx="32" cy="30" rx="7" ry="10" fill={colors[0]} opacity="0.85" transform="rotate(5, 32, 30)" />
      <circle cx="32" cy="18" r="5" fill={colors[0]} opacity="0.9" />
    </svg>
  );
};

// ============================================
// FULL REFINEMENTS EXPLORATION
// ============================================

export const ElmerLogoRefinements: React.FC = () => {
  return (
    <div className="min-h-screen p-8" style={{ fontFamily: 'Synonym, system-ui, sans-serif' }}>
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 20% 40%, #10b981, transparent 50%),
              radial-gradient(ellipse 50% 30% at 80% 60%, #6366f1, transparent 50%)
            `,
            opacity: 0.15,
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 
            className="text-4xl font-semibold tracking-tight text-white"
            style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}
          >
            elmer Logo Refinements
          </h1>
          <p className="text-gray-400 text-lg">
            Focused on Forest Mist, Midnight Aurora, and Iterative Process symbols
          </p>
        </header>

        {/* Color Palettes */}
        <Section title="Color Palettes (Green & Blue Focus)">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(refinedPalettes).map(([key, palette]) => (
              <div key={key} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex gap-1 mb-2">
                  {palette?.colors?.map((color, i) => (
                    <div key={i} className="w-8 h-8 rounded-md" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className="font-medium text-white text-sm">{palette?.name}</p>
                <p className="text-xs text-gray-400">{palette?.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Rotated Planes */}
        <Section title="Rotated Stacked Planes (5 Variations)">
          <h3 className="text-gray-400 text-sm mb-4">Midnight Aurora Colorway</h3>
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card title="A: Original" subtitle="±10°">
              <RotatedPlanes_A size={80} palette="midnightAurora" />
            </Card>
            <Card title="B: Wide Spread" subtitle="±15°">
              <RotatedPlanes_B size={80} palette="midnightAurora" />
            </Card>
            <Card title="C: 4 Layers" subtitle="Tighter increments">
              <RotatedPlanes_C size={80} palette="midnightAurora" />
            </Card>
            <Card title="D: Rounded" subtitle="Asymmetric">
              <RotatedPlanes_D size={80} palette="midnightAurora" />
            </Card>
            <Card title="E: Scale + Rotate" subtitle="Depth variation">
              <RotatedPlanes_E size={80} palette="midnightAurora" />
            </Card>
          </div>
          
          <h3 className="text-gray-400 text-sm mb-4">Forest Mist Colorway</h3>
          <div className="grid grid-cols-5 gap-4">
            <Card title="A: Original"><RotatedPlanes_A size={80} palette="forestMist" /></Card>
            <Card title="B: Wide Spread"><RotatedPlanes_B size={80} palette="forestMist" /></Card>
            <Card title="C: 4 Layers"><RotatedPlanes_C size={80} palette="forestMist" /></Card>
            <Card title="D: Rounded"><RotatedPlanes_D size={80} palette="forestMist" /></Card>
            <Card title="E: Scale + Rotate"><RotatedPlanes_E size={80} palette="forestMist" /></Card>
          </div>
        </Section>

        {/* Isometric Planes */}
        <Section title="Isometric Stacked Planes (5 Variations)">
          <h3 className="text-gray-400 text-sm mb-4">Forest Mist Colorway</h3>
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card title="A: Original" subtitle="Classic iso">
              <IsometricPlanes_A size={80} palette="forestMist" />
            </Card>
            <Card title="B: Tight Stack" subtitle="Less gap">
              <IsometricPlanes_B size={80} palette="forestMist" />
            </Card>
            <Card title="C: 4 Layers" subtitle="More depth">
              <IsometricPlanes_C size={80} palette="forestMist" />
            </Card>
            <Card title="D: Steep" subtitle="Vertical look">
              <IsometricPlanes_D size={80} palette="forestMist" />
            </Card>
            <Card title="E: Wide" subtitle="Flatter perspective">
              <IsometricPlanes_E size={80} palette="forestMist" />
            </Card>
          </div>
          
          <h3 className="text-gray-400 text-sm mb-4">Midnight Aurora Colorway</h3>
          <div className="grid grid-cols-5 gap-4">
            <Card title="A: Original"><IsometricPlanes_A size={80} palette="midnightAurora" /></Card>
            <Card title="B: Tight Stack"><IsometricPlanes_B size={80} palette="midnightAurora" /></Card>
            <Card title="C: 4 Layers"><IsometricPlanes_C size={80} palette="midnightAurora" /></Card>
            <Card title="D: Steep"><IsometricPlanes_D size={80} palette="midnightAurora" /></Card>
            <Card title="E: Wide"><IsometricPlanes_E size={80} palette="midnightAurora" /></Card>
          </div>
        </Section>

        {/* Iterative Process Symbols */}
        <Section title="Iterative Process Symbols (New Concepts)">
          <p className="text-gray-400 text-sm mb-6">Symbols representing iteration, growth, and continuous improvement</p>
          
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card title="Spiral" subtitle="Iterative refinement">
              <IterativeSpiral size={80} palette="midnightAurora" />
            </Card>
            <Card title="Cycles" subtitle="Expanding rings">
              <IterativeCycles size={80} palette="forestMist" />
            </Card>
            <Card title="Loop" subtitle="Continuous flow">
              <IterativeLoop size={80} palette="midnightAurora" />
            </Card>
            <Card title="Chevrons" subtitle="Forward momentum">
              <IterativeChevrons size={80} palette="forestMist" />
            </Card>
            <Card title="Nodes" subtitle="Building blocks">
              <IterativeNodes size={80} palette="midnightAurora" />
            </Card>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <Card title="Steps" subtitle="Progressive growth">
              <IterativeSteps size={80} palette="forestMist" />
            </Card>
            <Card title="Transform" subtitle="Evolution">
              <IterativeTransform size={80} palette="midnightAurora" />
            </Card>
            <Card title="Overlap" subtitle="Venn intersection">
              <IterativeOverlap size={80} palette="forestMist" />
            </Card>
            <Card title="Ripple" subtitle="Impact spreading">
              <IterativeRipple size={80} palette="midnightAurora" />
            </Card>
            <Card title="Growth" subtitle="Organic evolution">
              <IterativeGrowth size={80} palette="forestMist" />
            </Card>
          </div>
        </Section>

        {/* Mixed Colorway Showcase */}
        <Section title="Forest Twilight & Aurora Green (Hybrid Palettes)">
          <div className="grid grid-cols-4 gap-4">
            <Card title="Rotated A"><RotatedPlanes_A size={80} palette="forestTwilight" /></Card>
            <Card title="Isometric C"><IsometricPlanes_C size={80} palette="auroraGreen" /></Card>
            <Card title="Spiral"><IterativeSpiral size={80} palette="forestTwilight" /></Card>
            <Card title="Ripple"><IterativeRipple size={80} palette="auroraGreen" /></Card>
          </div>
        </Section>
      </div>
    </div>
  );
};

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-6">
    <h2 
      className="text-2xl font-semibold tracking-tight text-white"
      style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}
    >
      {title}
    </h2>
    {children}
  </section>
);

const Card: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div 
    className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105"
    style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    <div className="flex-1 flex items-center justify-center py-2">
      {children}
    </div>
    <div className="text-center mt-2">
      <div className="font-medium text-white text-xs">{title}</div>
      {subtitle && <div className="text-gray-500 text-[10px]">{subtitle}</div>}
    </div>
  </div>
);

export default ElmerLogoRefinements;
