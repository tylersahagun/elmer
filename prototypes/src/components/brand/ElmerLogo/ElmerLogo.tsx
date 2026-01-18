import * as React from 'react';
import { cn } from '@/lib/utils';

// Color palettes for elmer brand
export const elmerPalettes = {
  aurora: {
    name: 'Aurora',
    colors: ['#4fd1c5', '#9f7aea', '#ed64a6'],
    description: 'Teal → Purple → Pink gradient',
  },
  forest: {
    name: 'Forest Mist',
    colors: ['#10b981', '#14b8a6', '#06b6d4'],
    description: 'Green → Teal → Cyan gradient',
  },
  midnight: {
    name: 'Midnight Aurora',
    colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
    description: 'Blue → Violet → Pink gradient',
  },
  sunset: {
    name: 'Sunset',
    colors: ['#f59e0b', '#ef4444', '#ec4899'],
    description: 'Amber → Red → Pink gradient',
  },
  ocean: {
    name: 'Ocean Deep',
    colors: ['#06b6d4', '#3b82f6', '#6366f1'],
    description: 'Cyan → Blue → Indigo gradient',
  },
} as const;

export type PaletteKey = keyof typeof elmerPalettes;

export interface ElmerLogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Size in pixels */
  size?: number;
  /** Color palette */
  palette?: PaletteKey;
  /** Variant style */
  variant?: 'layered' | 'wave' | 'simple' | 'gradient';
  /** Show text alongside logo */
  showText?: boolean;
}

// Simple E mark
const SimpleE: React.FC<{ size: number; palette: PaletteKey }> = ({ size, palette }) => {
  const colors = elmerPalettes[palette]?.colors ?? elmerPalettes.aurora.colors;
  
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`simple-gradient-${palette}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="12" fill={`url(#simple-gradient-${palette})`} />
      <path
        d="M20 20h24M20 32h20M20 44h24"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Layered E mark
const LayeredE: React.FC<{ size: number; palette: PaletteKey }> = ({ size, palette }) => {
  const colors = elmerPalettes[palette]?.colors ?? elmerPalettes.aurora.colors;
  
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="12" width="40" height="40" rx="8" fill={colors[0]} opacity="0.8" />
      <rect x="12" y="8" width="40" height="40" rx="8" fill={colors[1]} opacity="0.8" />
      <rect x="20" y="16" width="40" height="40" rx="8" fill={colors[2]} opacity="0.9" />
      <path
        d="M32 28h16M32 36h12M32 44h16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Wave E mark
const WaveE: React.FC<{ size: number; palette: PaletteKey }> = ({ size, palette }) => {
  const colors = elmerPalettes[palette]?.colors ?? elmerPalettes.aurora.colors;
  
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wave-gradient-${palette}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <path
        d="M8 20c8-4 16 4 24 0s16-4 24 0v24c-8 4-16-4-24 0s-16 4-24 0V20z"
        fill={`url(#wave-gradient-${palette})`}
      />
      <path
        d="M16 26h32M16 34h24M16 42h32"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Gradient text E
const GradientE: React.FC<{ size: number; palette: PaletteKey }> = ({ size, palette }) => {
  const colors = elmerPalettes[palette]?.colors ?? elmerPalettes.aurora.colors;
  
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`text-gradient-${palette}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <text
        x="32"
        y="50"
        textAnchor="middle"
        fontSize="48"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        fill={`url(#text-gradient-${palette})`}
      >
        E
      </text>
    </svg>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ElmerLogo = React.forwardRef<SVGSVGElement, ElmerLogoProps>(
  function ElmerLogoComponent({ className, size = 40, palette = 'aurora', variant = 'simple', showText }) {
    const LogoComponent = {
      simple: SimpleE,
      layered: LayeredE,
      wave: WaveE,
      gradient: GradientE,
    }[variant];

    if (showText) {
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <LogoComponent size={size} palette={palette} />
          <span
            className="font-bold text-slate-900 dark:text-white"
            style={{ fontSize: size * 0.5 }}
          >
            elmer
          </span>
        </div>
      );
    }

    return (
      <div className={className}>
        <LogoComponent size={size} palette={palette} />
      </div>
    );
  }
);
ElmerLogo.displayName = 'ElmerLogo';

export { ElmerLogo };
