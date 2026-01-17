import React from "react";

/**
 * elmer Logo Exploration
 * Visual prototypes for brand identity concepts
 */

// ============================================
// MONOGRAM LOGOS
// ============================================

export const MonogramAuroraE: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="auroraGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    <text
      x="32"
      y="48"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="48"
      fill="url(#auroraGradient)"
    >
      e
    </text>
  </svg>
);

export const MonogramGlassE: React.FC<{ size?: number; dark?: boolean }> = ({
  size = 64,
  dark = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop
          offset="0%"
          stopColor={dark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)"}
        />
        <stop
          offset="100%"
          stopColor={dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)"}
        />
      </linearGradient>
      <linearGradient id="glassBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
      </linearGradient>
      <filter id="glassBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
    </defs>
    {/* Glass container */}
    <rect
      x="4"
      y="4"
      width="56"
      height="56"
      rx="12"
      fill="url(#glassGradient)"
      stroke="url(#glassBorder)"
      strokeWidth="1"
    />
    {/* The e */}
    <text
      x="32"
      y="46"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="38"
      fill={dark ? "#ffffff" : "#0f172a"}
    >
      e
    </text>
  </svg>
);

export const MonogramLayeredE: React.FC<{ size?: number }> = ({
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Back layer - pink */}
    <text
      x="36"
      y="44"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="38"
      fill="#ed64a6"
      opacity="0.3"
    >
      e
    </text>
    {/* Middle layer - purple */}
    <text
      x="33"
      y="46"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="38"
      fill="#9f7aea"
      opacity="0.6"
    >
      e
    </text>
    {/* Front layer - teal */}
    <text
      x="30"
      y="48"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="38"
      fill="#4fd1c5"
    >
      e
    </text>
  </svg>
);

export const MonogramOrbitalE: React.FC<{ size?: number }> = ({
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="100%" stopColor="#9f7aea" />
      </linearGradient>
    </defs>
    {/* Orbital ring */}
    <circle
      cx="32"
      cy="32"
      r="26"
      fill="none"
      stroke="url(#orbitalGradient)"
      strokeWidth="1.5"
      strokeDasharray="4 6"
      opacity="0.6"
    />
    {/* Orbital dots */}
    <circle cx="32" cy="6" r="3" fill="#4fd1c5" />
    <circle cx="58" cy="32" r="3" fill="#9f7aea" />
    <circle cx="32" cy="58" r="3" fill="#ed64a6" />
    <circle cx="6" cy="32" r="3" fill="#ecc94b" />
    {/* The e */}
    <text
      x="32"
      y="42"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="32"
      fill="#0f172a"
    >
      e
    </text>
  </svg>
);

// ============================================
// WORDMARK LOGOS
// ============================================

export const WordmarkPure: React.FC<{ width?: number; dark?: boolean }> = ({
  width = 160,
  dark = false,
}) => (
  <svg
    width={width}
    height={width * 0.3}
    viewBox="0 0 160 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="80"
      y="36"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="36"
      letterSpacing="-0.02em"
      fill={dark ? "#ffffff" : "#0f172a"}
    >
      elmer
    </text>
  </svg>
);

export const WordmarkGradient: React.FC<{ width?: number }> = ({
  width = 160,
}) => (
  <svg
    width={width}
    height={width * 0.3}
    viewBox="0 0 160 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="wordmarkGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    <text
      x="80"
      y="36"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="36"
      letterSpacing="-0.02em"
      fill="url(#wordmarkGradient)"
    >
      elmer
    </text>
  </svg>
);

export const WordmarkAccentE: React.FC<{ width?: number; dark?: boolean }> = ({
  width = 160,
  dark = false,
}) => (
  <svg
    width={width}
    height={width * 0.3}
    viewBox="0 0 160 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* First e in accent color */}
    <text
      x="24"
      y="36"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="36"
      letterSpacing="-0.02em"
      fill="#4fd1c5"
    >
      e
    </text>
    {/* Rest of word */}
    <text
      x="95"
      y="36"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="36"
      letterSpacing="-0.02em"
      fill={dark ? "#ffffff" : "#0f172a"}
    >
      lmer
    </text>
  </svg>
);

// ============================================
// ABSTRACT MARKS
// ============================================

export const AbstractConverging: React.FC<{ size?: number }> = ({
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Converging lines */}
    <line
      x1="12"
      y1="12"
      x2="32"
      y2="40"
      stroke="#4fd1c5"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="8"
      x2="32"
      y2="40"
      stroke="#9f7aea"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="52"
      y1="12"
      x2="32"
      y2="40"
      stroke="#ed64a6"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="20"
      x2="32"
      y2="40"
      stroke="#ecc94b"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="44"
      y1="20"
      x2="32"
      y2="40"
      stroke="#63b3ed"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* Center point */}
    <circle cx="32" cy="44" r="6" fill="#0f172a" />
  </svg>
);

export const AbstractStackedPlanes: React.FC<{ size?: number }> = ({
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Back plane */}
    <rect
      x="18"
      y="12"
      width="36"
      height="24"
      rx="4"
      fill="#ed64a6"
      opacity="0.3"
    />
    {/* Middle plane */}
    <rect
      x="14"
      y="20"
      width="36"
      height="24"
      rx="4"
      fill="#9f7aea"
      opacity="0.5"
    />
    {/* Front plane */}
    <rect
      x="10"
      y="28"
      width="36"
      height="24"
      rx="4"
      fill="#4fd1c5"
      opacity="0.8"
    />
    {/* Glass overlay on front */}
    <rect
      x="10"
      y="28"
      width="36"
      height="24"
      rx="4"
      fill="none"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1"
    />
  </svg>
);

export const AbstractAuroraOrbs: React.FC<{ size?: number }> = ({
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="orbOverlap" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    {/* Left orb */}
    <circle cx="24" cy="28" r="16" fill="#4fd1c5" opacity="0.4" />
    {/* Right orb */}
    <circle cx="40" cy="28" r="16" fill="#9f7aea" opacity="0.4" />
    {/* Bottom orb */}
    <circle cx="32" cy="42" r="16" fill="#ed64a6" opacity="0.4" />
    {/* Center overlap glow */}
    <circle cx="32" cy="32" r="8" fill="url(#orbOverlap)" opacity="0.9" />
  </svg>
);

export const AbstractWave: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="waveGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    <path
      d="M4 32 Q16 20, 24 32 T44 32 T64 32"
      stroke="url(#waveGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Secondary wave */}
    <path
      d="M0 38 Q12 26, 20 38 T40 38 T60 38"
      stroke="url(#waveGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

export const AbstractPrism: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="prismGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    {/* Prism triangle */}
    <polygon
      points="32,8 52,48 12,48"
      fill="url(#prismGradient)"
      opacity="0.8"
    />
    {/* Glass highlight */}
    <polygon
      points="32,8 52,48 12,48"
      fill="none"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1"
    />
    {/* Light ray in */}
    <line
      x1="8"
      y1="24"
      x2="28"
      y2="28"
      stroke="#ffffff"
      strokeWidth="1.5"
      opacity="0.6"
    />
    {/* Spectrum rays out */}
    <line x1="40" y1="36" x2="56" y2="32" stroke="#4fd1c5" strokeWidth="1.5" />
    <line x1="42" y1="40" x2="58" y2="40" stroke="#9f7aea" strokeWidth="1.5" />
    <line x1="44" y1="44" x2="56" y2="48" stroke="#ed64a6" strokeWidth="1.5" />
  </svg>
);

// ============================================
// COMBINATION MARKS
// ============================================

export const CombinationHorizontal: React.FC<{
  width?: number;
  dark?: boolean;
}> = ({ width = 200, dark = false }) => (
  <svg
    width={width}
    height={width * 0.25}
    viewBox="0 0 200 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="comboGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    {/* Monogram */}
    <text
      x="25"
      y="38"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="36"
      fill="url(#comboGradient)"
    >
      e
    </text>
    {/* Wordmark */}
    <text
      x="130"
      y="36"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="30"
      letterSpacing="-0.02em"
      fill={dark ? "#ffffff" : "#0f172a"}
    >
      elmer
    </text>
  </svg>
);

export const CombinationVertical: React.FC<{
  size?: number;
  dark?: boolean;
}> = ({ size = 100, dark = false }) => (
  <svg
    width={size}
    height={size * 1.4}
    viewBox="0 0 100 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="comboVertGradient"
        x1="0%"
        y1="100%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    {/* Monogram */}
    <text
      x="50"
      y="60"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="56"
      fill="url(#comboVertGradient)"
    >
      e
    </text>
    {/* Wordmark */}
    <text
      x="50"
      y="110"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="28"
      letterSpacing="-0.02em"
      fill={dark ? "#ffffff" : "#0f172a"}
    >
      elmer
    </text>
  </svg>
);

export const CombinationIntegrated: React.FC<{ width?: number }> = ({
  width = 160,
}) => (
  <svg
    width={width}
    height={width * 0.35}
    viewBox="0 0 160 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="integratedGradient"
        x1="0%"
        y1="100%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#4fd1c5" />
        <stop offset="50%" stopColor="#9f7aea" />
        <stop offset="100%" stopColor="#ed64a6" />
      </linearGradient>
    </defs>
    {/* Aurora orb replacing e */}
    <circle cx="24" cy="32" r="14" fill="url(#integratedGradient)" />
    {/* Rest of wordmark */}
    <text
      x="100"
      y="43"
      textAnchor="middle"
      fontFamily="Chillax, system-ui, sans-serif"
      fontWeight="600"
      fontSize="36"
      letterSpacing="-0.02em"
      fill="#0f172a"
    >
      lmer
    </text>
  </svg>
);

// ============================================
// FULL EXPLORATION COMPONENT
// ============================================

export const ElmerLogoExploration: React.FC = () => {
  return (
    <div
      className="min-h-screen p-8"
      style={{ fontFamily: "Synonym, system-ui, sans-serif" }}
    >
      {/* Aurora Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%)",
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
            opacity: 0.15,
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            elmer Brand Exploration
          </h1>
          <p className="text-gray-600 text-lg">
            Logo concepts for a glassmorphic aurora design system
          </p>
        </header>

        {/* Monograms */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            1. Monogram Logos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <LogoCard title="Aurora e" description="Gradient-filled letterform">
              <MonogramAuroraE size={80} />
            </LogoCard>
            <LogoCard title="Glass e" description="Frosted container">
              <MonogramGlassE size={80} />
            </LogoCard>
            <LogoCard title="Layered e" description="Depth through stacking">
              <MonogramLayeredE size={80} />
            </LogoCard>
            <LogoCard title="Orbital e" description="Hub and connections">
              <MonogramOrbitalE size={80} />
            </LogoCard>
          </div>
        </section>

        {/* Wordmarks */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            2. Wordmark Logos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LogoCard title="Pure Chillax" description="Clean typography">
              <WordmarkPure width={180} />
            </LogoCard>
            <LogoCard title="Gradient Flow" description="Aurora across letters">
              <WordmarkGradient width={180} />
            </LogoCard>
            <LogoCard title="Accent e" description="Highlighted first letter">
              <WordmarkAccentE width={180} />
            </LogoCard>
          </div>
        </section>

        {/* Abstract Marks */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            3. Abstract Logo Marks
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <LogoCard title="Converging" description="Orchestration">
              <AbstractConverging size={80} />
            </LogoCard>
            <LogoCard title="Stacked Planes" description="Depth & layers">
              <AbstractStackedPlanes size={80} />
            </LogoCard>
            <LogoCard title="Aurora Orbs" description="Synthesis">
              <AbstractAuroraOrbs size={80} />
            </LogoCard>
            <LogoCard title="Wave" description="Flow & rhythm">
              <AbstractWave size={80} />
            </LogoCard>
            <LogoCard title="Prism" description="Transformation">
              <AbstractPrism size={80} />
            </LogoCard>
          </div>
        </section>

        {/* Pictorial Marks Note */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            4. Pictorial Marks
          </h2>
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <p className="text-gray-700">
              <strong>Recommendations for pictorial marks:</strong>
            </p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li>
                • <strong>The Conductor</strong> — Abstract figure with
                connecting lines (orchestration metaphor)
              </li>
              <li>
                • <strong>The Bridge</strong> — Arc connecting multiple points
                (integration metaphor)
              </li>
              <li>
                • <strong>Minimal Elephant</strong> — If maintaining the
                "elephant memory" reference
              </li>
              <li>
                • <strong>The Prism</strong> — Light → spectrum (already shown
                above)
              </li>
            </ul>
            <p className="mt-4 text-gray-500 text-sm">
              These require more detailed illustration work. The abstract marks
              above capture similar concepts in simpler forms.
            </p>
          </div>
        </section>

        {/* Combination Marks */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            5. Combination Marks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LogoCard title="Horizontal" description="Side by side" wide>
              <CombinationHorizontal width={220} />
            </LogoCard>
            <LogoCard title="Vertical" description="Stacked layout" tall>
              <CombinationVertical size={100} />
            </LogoCard>
            <LogoCard title="Integrated" description="Symbol replaces e" wide>
              <CombinationIntegrated width={180} />
            </LogoCard>
          </div>
        </section>

        {/* Dark Mode Preview */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            Dark Mode Variants
          </h2>
          <div
            className="p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-6"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <MonogramGlassE size={64} dark />
              <span className="text-white/60 text-sm">Glass e (dark)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MonogramAuroraE size={64} />
              <span className="text-white/60 text-sm">Aurora e</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <WordmarkPure width={140} dark />
              <span className="text-white/60 text-sm">Pure (dark)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <WordmarkGradient width={140} />
              <span className="text-white/60 text-sm">Gradient</span>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            Aurora Color Palette
          </h2>
          <div className="flex flex-wrap gap-4">
            {[
              { name: "Teal", color: "#4fd1c5", use: "Trust, clarity" },
              { name: "Purple", color: "#9f7aea", use: "Wisdom, creativity" },
              { name: "Pink", color: "#ed64a6", use: "Energy, warmth" },
              { name: "Gold", color: "#ecc94b", use: "Intelligence" },
              { name: "Blue", color: "#63b3ed", use: "Openness" },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ background: c.color }}
                />
                <div>
                  <div className="font-medium text-gray-800">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.color}</div>
                  <div className="text-xs text-gray-400">{c.use}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="space-y-6">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
          >
            Recommendations
          </h2>
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <div>
              <h3
                className="font-semibold text-gray-800"
                style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
              >
                Primary Suite Recommendation
              </h3>
              <p className="text-gray-600 mt-2">
                <strong>Aurora e</strong> monogram +{" "}
                <strong>Gradient Flow</strong> wordmark
              </p>
              <p className="text-gray-500 text-sm mt-1">
                The gradient creates brand recognition across both marks while
                the clean 'e' works at any size.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h3
                className="font-semibold text-gray-800"
                style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
              >
                Application Guide
              </h3>
              <ul className="text-gray-600 text-sm mt-2 space-y-1">
                <li>
                  • <strong>App icon / Favicon:</strong> Aurora e monogram
                </li>
                <li>
                  • <strong>Header / Navigation:</strong> Horizontal combination
                  mark
                </li>
                <li>
                  • <strong>Loading screens:</strong> Animated monogram with
                  glow
                </li>
                <li>
                  • <strong>Documentation:</strong> Wordmark only
                </li>
                <li>
                  • <strong>Social:</strong> Monogram in circle container
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper component for consistent card styling
const LogoCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
  tall?: boolean;
}> = ({ title, description, children, tall }) => (
  <div
    className={`
      flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300
      ${tall ? "min-h-[200px]" : "min-h-[160px]"}
    `}
    style={{
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    }}
  >
    <div className="flex-1 flex items-center justify-center">{children}</div>
    <div className="text-center mt-4">
      <div
        className="font-medium text-gray-800 text-sm"
        style={{ fontFamily: "Chillax, system-ui, sans-serif" }}
      >
        {title}
      </div>
      <div className="text-gray-500 text-xs mt-0.5">{description}</div>
    </div>
  </div>
);

export default ElmerLogoExploration;
