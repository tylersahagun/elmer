import type { Meta, StoryObj } from '@storybook/react';
import {
  ElmerLogoIterations,
  palettes,
  ColorPaletteDisplay,
  LayeredE_V1,
  LayeredE_V2,
  LayeredE_V3,
  LayeredE_V4,
  LayeredE_V5,
  StackedPlanes_V1,
  StackedPlanes_V2,
  StackedPlanes_V3,
  StackedPlanes_V4,
  StackedPlanes_V5,
  StackedPlanes_V6,
  StackedPlanes_V7,
  Wave_V1,
  Wave_V2,
  Wave_V3,
  Wave_V4,
  Wave_V5,
  Wave_V6,
  Wave_V7,
} from './ElmerLogoIterations';

const meta: Meta<typeof ElmerLogoIterations> = {
  title: 'Brand/elmer Iterations',
  component: ElmerLogoIterations,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fafafa' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ElmerLogoIterations>;

// Full exploration
export const FullIterations: Story = {
  render: () => <ElmerLogoIterations />,
};

// ============================================
// COLOR PALETTES
// ============================================

export const ColorPalettes: Story = {
  name: 'Color Palettes',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Color Palette Options
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {(Object.keys(palettes) as Array<keyof typeof palettes>).map((key) => (
          <div key={key} className="p-4 bg-white rounded-xl shadow-sm">
            <ColorPaletteDisplay paletteKey={key} />
          </div>
        ))}
      </div>
    </div>
  ),
};

// ============================================
// LAYERED E
// ============================================

export const LayeredEIterations: Story = {
  name: 'Layered E Iterations',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Layered E Monogram Iterations
      </h2>
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <LayeredE_V1 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V1: Diagonal</p>
            <p className="text-xs text-gray-500">Back to front offset</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <LayeredE_V2 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V2: Vertical</p>
            <p className="text-xs text-gray-500">Straight down</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <LayeredE_V3 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V3: Horizontal</p>
            <p className="text-xs text-gray-500">Fan right</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <LayeredE_V4 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V4: 4 Layers</p>
            <p className="text-xs text-gray-500">More depth</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <LayeredE_V5 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V5: Concentric</p>
            <p className="text-xs text-gray-500">Scale variation</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LayeredEWithPalettes: Story = {
  name: 'Layered E with Palettes',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Layered E V1 in All Palettes
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {(Object.keys(palettes) as Array<keyof typeof palettes>).map((key) => (
          <div key={key} className="text-center space-y-2">
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-20">
              <LayeredE_V1 size={64} palette={key} />
            </div>
            <p className="text-xs text-gray-600">{palettes[key].name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ============================================
// STACKED PLANES
// ============================================

export const StackedPlanesIterations: Story = {
  name: 'Stacked Planes Iterations',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Stacked Planes Iterations
      </h2>
      <p className="text-gray-600">Exploring depth and layering with 3 planes</p>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V1 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V1: Classic</p>
            <p className="text-xs text-gray-500">Rectangle cards</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V2 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V2: Pills</p>
            <p className="text-xs text-gray-500">Rounded expanding</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V3 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V3: Isometric</p>
            <p className="text-xs text-gray-500">3D perspective</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V4 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V4: Discs</p>
            <p className="text-xs text-gray-500">Ellipse stack</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V5 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V5: Rotated</p>
            <p className="text-xs text-gray-500">Fanning cards</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V6 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V6: Vertical Bars</p>
            <p className="text-xs text-gray-500">Side by side</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <StackedPlanes_V7 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V7: Cascade</p>
            <p className="text-xs text-gray-500">Top-right flow</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const StackedPlanesWithPalettes: Story = {
  name: 'Stacked Planes with Palettes',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Stacked Planes V1 in All Palettes
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {(Object.keys(palettes) as Array<keyof typeof palettes>).map((key) => (
          <div key={key} className="text-center space-y-2">
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-20">
              <StackedPlanes_V1 size={64} palette={key} />
            </div>
            <p className="text-xs text-gray-600">{palettes[key].name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const StackedPlanesLarge: Story = {
  name: 'Stacked Planes Large',
  render: () => (
    <div className="p-8 flex flex-wrap gap-8 items-center justify-center">
      <div className="text-center space-y-4">
        <StackedPlanes_V1 size={160} />
        <p className="font-medium">V1: Classic</p>
      </div>
      <div className="text-center space-y-4">
        <StackedPlanes_V3 size={160} />
        <p className="font-medium">V3: Isometric</p>
      </div>
      <div className="text-center space-y-4">
        <StackedPlanes_V5 size={160} />
        <p className="font-medium">V5: Rotated</p>
      </div>
    </div>
  ),
};

// ============================================
// WAVE
// ============================================

export const WaveIterations: Story = {
  name: 'Wave Iterations',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave Iterations (No Shadow)
      </h2>
      <p className="text-gray-600">Clean wave forms without the shadow effect</p>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V1 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V1: Clean Sine</p>
            <p className="text-xs text-gray-500">Classic wave</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V2 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V2: Rolling</p>
            <p className="text-xs text-gray-500">Wide curves</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V3 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V3: Parallel</p>
            <p className="text-xs text-gray-500">Three stacked</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V4 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V4: Ribbon</p>
            <p className="text-xs text-gray-500">Filled wave</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V5 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V5: High Frequency</p>
            <p className="text-xs text-gray-500">More peaks</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V6 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V6: S-Curve</p>
            <p className="text-xs text-gray-500">Vertical flow</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-24">
            <Wave_V7 size={80} />
          </div>
          <div>
            <p className="font-medium text-sm">V7: Dot Accents</p>
            <p className="text-xs text-gray-500">Peak markers</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WaveWithPalettes: Story = {
  name: 'Wave with Palettes',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave V2 (Rolling) in All Palettes
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {(Object.keys(palettes) as Array<keyof typeof palettes>).map((key) => (
          <div key={key} className="text-center space-y-2">
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center h-20">
              <Wave_V2 size={64} palette={key} />
            </div>
            <p className="text-xs text-gray-600">{palettes[key].name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const WaveLarge: Story = {
  name: 'Wave Large',
  render: () => (
    <div className="p-8 flex flex-wrap gap-8 items-center justify-center">
      <div className="text-center space-y-4">
        <Wave_V1 size={160} />
        <p className="font-medium">V1: Clean Sine</p>
      </div>
      <div className="text-center space-y-4">
        <Wave_V2 size={160} />
        <p className="font-medium">V2: Rolling</p>
      </div>
      <div className="text-center space-y-4">
        <Wave_V4 size={160} />
        <p className="font-medium">V4: Ribbon</p>
      </div>
    </div>
  ),
};

// ============================================
// DARK MODE
// ============================================

export const DarkModeIterations: Story = {
  name: 'Dark Mode Preview',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="p-8 space-y-12">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Iterations on Dark Background
      </h2>
      
      <div>
        <h3 className="text-lg text-white/70 mb-4">Layered E</h3>
        <div className="flex gap-6">
          <LayeredE_V1 size={80} />
          <LayeredE_V4 size={80} />
          <LayeredE_V1 size={80} palette="twilight" />
          <LayeredE_V1 size={80} palette="midnight" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg text-white/70 mb-4">Stacked Planes</h3>
        <div className="flex gap-6">
          <StackedPlanes_V1 size={80} />
          <StackedPlanes_V3 size={80} />
          <StackedPlanes_V5 size={80} />
          <StackedPlanes_V1 size={80} palette="twilight" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg text-white/70 mb-4">Wave</h3>
        <div className="flex gap-6">
          <Wave_V1 size={80} />
          <Wave_V2 size={80} />
          <Wave_V4 size={80} />
          <Wave_V2 size={80} palette="sunset" />
        </div>
      </div>
    </div>
  ),
};

// ============================================
// SIDE BY SIDE COMPARISON
// ============================================

export const SideBySideComparison: Story = {
  name: 'Side by Side Comparison',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Top Candidates Side by Side
      </h2>
      
      <div className="flex gap-8 items-start">
        {/* Monogram column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monogram</h3>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <LayeredE_V1 size={120} />
          </div>
        </div>
        
        {/* Abstract mark column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Abstract Mark Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <StackedPlanes_V1 size={100} />
              <p className="text-xs text-center text-gray-500 mt-2">Stacked V1</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <StackedPlanes_V3 size={100} />
              <p className="text-xs text-center text-gray-500 mt-2">Stacked V3</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <Wave_V2 size={100} />
              <p className="text-xs text-center text-gray-500 mt-2">Wave V2</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <Wave_V4 size={100} />
              <p className="text-xs text-center text-gray-500 mt-2">Wave V4</p>
            </div>
          </div>
        </div>
        
        {/* Wordmark column */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Wordmark</h3>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <svg width="160" height="50" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="compareGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#4fd1c5" />
                  <stop offset="50%" stopColor="#9f7aea" />
                  <stop offset="100%" stopColor="#ed64a6" />
                </linearGradient>
              </defs>
              <text
                x="80"
                y="38"
                textAnchor="middle"
                fontFamily="Chillax, system-ui, sans-serif"
                fontWeight="600"
                fontSize="36"
                letterSpacing="-0.02em"
                fill="url(#compareGradient)"
              >
                elmer
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  ),
};
