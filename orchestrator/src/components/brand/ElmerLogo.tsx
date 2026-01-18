"use client";

import React, { useId } from "react";

// Color palettes from the brand iterations
export const palettes = {
  aurora: {
    name: "Aurora",
    colors: ["#4fd1c5", "#9f7aea", "#ed64a6", "#ecc94b", "#63b3ed"],
    description: "Teal → Purple → Pink → Gold → Blue",
  },
  forest: {
    name: "Emerald Forest",
    colors: ["#10b981", "#34d399", "#6ee7b7", "#5eead4", "#2dd4bf"],
    description: "Emerald → Mint → Teal greens",
  },
  sage: {
    name: "Deep Sage",
    colors: ["#065f46", "#059669", "#10b981", "#6ee7b7", "#a7f3d0"],
    description: "Deep green → emerald → mint",
  },
};

export type PaletteKey = keyof typeof palettes;

// Wave V4-D: Layered ribbon with transparency - The selected logo mark
export const WaveV4D: React.FC<{ size?: number; palette?: PaletteKey }> = ({
  size = 32,
  palette = "forest",
}) => {
  const colors = palettes[palette]?.colors || palettes.forest.colors;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

// Gradient Wordmark - "elmer" text with gradient fill
export const ElmerWordmark: React.FC<{
  width?: number;
  height?: number;
  palette?: PaletteKey;
}> = ({ width = 80, height = 24, palette = "forest" }) => {
  const colors = palettes[palette]?.colors || palettes.forest.colors;
  const reactId = useId();
  const id = `elmer-wordmark-${palette}-${reactId}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <text
        x="40"
        y="18"
        textAnchor="middle"
        fontFamily="Chillax, system-ui, sans-serif"
        fontWeight="600"
        fontSize="18"
        letterSpacing="-0.02em"
        fill={`url(#${id})`}
      >
        elmer
      </text>
    </svg>
  );
};

// Combined logo mark - Wave + Wordmark together
export const ElmerLogoFull: React.FC<{
  size?: number;
  palette?: PaletteKey;
  showWordmark?: boolean;
}> = ({ size = 32, palette = "forest", showWordmark = true }) => {
  return (
    <div className="flex items-center gap-2">
      <WaveV4D size={size} palette={palette} />
      {showWordmark && <ElmerWordmark palette={palette} />}
    </div>
  );
};

// Small logo for compact spaces - just the wave mark
export const ElmerLogoCompact: React.FC<{
  size?: number;
  palette?: PaletteKey;
}> = ({ size = 32, palette = "forest" }) => {
  return <WaveV4D size={size} palette={palette} />;
};
