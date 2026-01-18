import type { Meta, StoryObj } from '@storybook/react';
import {
  ElmerLogoRefinements,
  RotatedPlanes_A,
  RotatedPlanes_B,
  RotatedPlanes_C,
  RotatedPlanes_D,
  RotatedPlanes_E,
  WideSpread_1,
  WideSpread_2,
  WideSpread_3,
  WideSpread_4,
  WideSpread_5,
  WideSpread_6,
  WideSpread_7,
  WideSpread_8,
  IsometricPlanes_A,
  IsometricPlanes_B,
  IsometricPlanes_C,
  IsometricPlanes_D,
  IsometricPlanes_E,
  IterativeSpiral,
  IterativeCycles,
  IterativeLoop,
  IterativeChevrons,
  IterativeNodes,
  IterativeSteps,
  IterativeTransform,
  IterativeOverlap,
  IterativeRipple,
  IterativeGrowth,
} from './ElmerLogoRefinements';

const meta: Meta<typeof ElmerLogoRefinements> = {
  title: 'Brand/elmer Refinements',
  component: ElmerLogoRefinements,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#fafafa' },
        { name: 'dark', value: '#0f172a' },
        { name: 'midnight', value: '#0a0f1a' },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ElmerLogoRefinements>;

// Full exploration
export const FullRefinements: Story = {
  render: () => <ElmerLogoRefinements />,
};

// ============================================
// ROTATED PLANES
// ============================================

export const RotatedPlanesMidnight: Story = {
  name: 'Rotated Planes - Midnight Aurora',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Rotated Stacked Planes - Midnight Aurora
      </h2>
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_A size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">A: Original (±10°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_B size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">B: Wide Spread (±15°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_C size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">C: 4 Layers</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_D size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">D: Rounded</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_E size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">E: Scale + Rotate</p>
        </div>
      </div>
    </div>
  ),
};

export const RotatedPlanesForest: Story = {
  name: 'Rotated Planes - Forest Mist',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Rotated Stacked Planes - Forest Mist
      </h2>
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_A size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">A: Original</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_B size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">B: Wide Spread</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_C size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">C: 4 Layers</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_D size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">D: Rounded</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <RotatedPlanes_E size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">E: Scale + Rotate</p>
        </div>
      </div>
    </div>
  ),
};

export const RotatedPlanesLarge: Story = {
  name: 'Rotated Planes - Large',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 flex flex-wrap gap-12 items-center justify-center">
      <div className="text-center space-y-4">
        <RotatedPlanes_A size={200} palette="midnightAurora" />
        <p className="text-white font-medium">Midnight Aurora A</p>
      </div>
      <div className="text-center space-y-4">
        <RotatedPlanes_C size={200} palette="midnightAurora" />
        <p className="text-white font-medium">Midnight Aurora C</p>
      </div>
      <div className="text-center space-y-4">
        <RotatedPlanes_A size={200} palette="forestMist" />
        <p className="text-white font-medium">Forest Mist A</p>
      </div>
    </div>
  ),
};

// ============================================
// WIDE SPREAD ITERATIONS
// ============================================

export const WideSpreadMidnight: Story = {
  name: 'Wide Spread - Midnight Aurora',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Wide Spread Iterations - Midnight Aurora
      </h2>
      <div className="grid grid-cols-4 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_1 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS1: Classic (±15°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_2 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS2: Extra Wide (±20°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_3 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS3: 4 Layers (±18°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_4 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS4: Rounded</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_5 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS5: Asymmetric</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_6 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS6: Scale + Rotate</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_7 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS7: 5 Layer Fan</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_8 size={110} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">WS8: Squircle</p>
        </div>
      </div>
    </div>
  ),
};

export const WideSpreadForest: Story = {
  name: 'Wide Spread - Forest Mist',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Wide Spread Iterations - Forest Mist
      </h2>
      <div className="grid grid-cols-4 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_1 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS1: Classic (±15°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_2 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS2: Extra Wide (±20°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_3 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS3: 4 Layers (±18°)</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_4 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS4: Rounded</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_5 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS5: Asymmetric</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_6 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS6: Scale + Rotate</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_7 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS7: 5 Layer Fan</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-32">
            <WideSpread_8 size={110} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">WS8: Squircle</p>
        </div>
      </div>
    </div>
  ),
};

export const WideSpreadLarge: Story = {
  name: 'Wide Spread - Large View',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-12">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Wide Spread - Large Comparison
      </h2>
      <div className="flex flex-wrap gap-10 items-center justify-center">
        <div className="text-center space-y-4">
          <WideSpread_1 size={180} palette="midnightAurora" />
          <p className="text-white font-medium">Classic ±15°</p>
          <p className="text-gray-400 text-xs">Midnight Aurora</p>
        </div>
        <div className="text-center space-y-4">
          <WideSpread_3 size={180} palette="midnightAurora" />
          <p className="text-white font-medium">4 Layers</p>
          <p className="text-gray-400 text-xs">Midnight Aurora</p>
        </div>
        <div className="text-center space-y-4">
          <WideSpread_7 size={180} palette="midnightAurora" />
          <p className="text-white font-medium">5 Layer Fan</p>
          <p className="text-gray-400 text-xs">Midnight Aurora</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-10 items-center justify-center">
        <div className="text-center space-y-4">
          <WideSpread_1 size={180} palette="forestMist" />
          <p className="text-white font-medium">Classic ±15°</p>
          <p className="text-gray-400 text-xs">Forest Mist</p>
        </div>
        <div className="text-center space-y-4">
          <WideSpread_3 size={180} palette="forestMist" />
          <p className="text-white font-medium">4 Layers</p>
          <p className="text-gray-400 text-xs">Forest Mist</p>
        </div>
        <div className="text-center space-y-4">
          <WideSpread_7 size={180} palette="forestMist" />
          <p className="text-white font-medium">5 Layer Fan</p>
          <p className="text-gray-400 text-xs">Forest Mist</p>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// ISOMETRIC PLANES
// ============================================

export const IsometricPlanesMidnight: Story = {
  name: 'Isometric Planes - Midnight Aurora',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Isometric Stacked Planes - Midnight Aurora
      </h2>
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_A size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">A: Original</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_B size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">B: Tight Stack</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_C size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">C: 4 Layers</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_D size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">D: Steep</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_E size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white">E: Wide</p>
        </div>
      </div>
    </div>
  ),
};

export const IsometricPlanesForest: Story = {
  name: 'Isometric Planes - Forest Mist',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Isometric Stacked Planes - Forest Mist
      </h2>
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_A size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">A: Original</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_B size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">B: Tight Stack</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_C size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">C: 4 Layers</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_D size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">D: Steep</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IsometricPlanes_E size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white">E: Wide</p>
        </div>
      </div>
    </div>
  ),
};

export const IsometricPlanesLarge: Story = {
  name: 'Isometric Planes - Large',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 flex flex-wrap gap-12 items-center justify-center">
      <div className="text-center space-y-4">
        <IsometricPlanes_A size={200} palette="forestMist" />
        <p className="text-white font-medium">Forest Mist A</p>
      </div>
      <div className="text-center space-y-4">
        <IsometricPlanes_C size={200} palette="forestMist" />
        <p className="text-white font-medium">Forest Mist C</p>
      </div>
      <div className="text-center space-y-4">
        <IsometricPlanes_A size={200} palette="midnightAurora" />
        <p className="text-white font-medium">Midnight Aurora A</p>
      </div>
    </div>
  ),
};

// ============================================
// ITERATIVE PROCESS SYMBOLS
// ============================================

export const IterativeSymbols: Story = {
  name: 'Iterative Process Symbols',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Iterative Process Symbols
      </h2>
      <p className="text-gray-400">Symbols representing iteration, growth, and continuous improvement</p>
      
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeSpiral size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">Spiral</p>
          <p className="text-xs text-gray-400">Iterative refinement</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeCycles size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">Cycles</p>
          <p className="text-xs text-gray-400">Expanding rings</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeLoop size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">Loop</p>
          <p className="text-xs text-gray-400">Continuous flow</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeChevrons size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">Chevrons</p>
          <p className="text-xs text-gray-400">Forward momentum</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeNodes size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">Nodes</p>
          <p className="text-xs text-gray-400">Building blocks</p>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-6">
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeSteps size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">Steps</p>
          <p className="text-xs text-gray-400">Progressive growth</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeTransform size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">Transform</p>
          <p className="text-xs text-gray-400">Evolution</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeOverlap size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">Overlap</p>
          <p className="text-xs text-gray-400">Venn intersection</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeRipple size={100} palette="midnightAurora" />
          </div>
          <p className="text-sm text-white font-medium">Ripple</p>
          <p className="text-xs text-gray-400">Impact spreading</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center h-28">
            <IterativeGrowth size={100} palette="forestMist" />
          </div>
          <p className="text-sm text-white font-medium">Growth</p>
          <p className="text-xs text-gray-400">Organic evolution</p>
        </div>
      </div>
    </div>
  ),
};

export const IterativeSymbolsLarge: Story = {
  name: 'Iterative Symbols - Large',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 flex flex-wrap gap-12 items-center justify-center">
      <div className="text-center space-y-4">
        <IterativeSpiral size={200} palette="midnightAurora" />
        <p className="text-white font-medium">Spiral</p>
      </div>
      <div className="text-center space-y-4">
        <IterativeCycles size={200} palette="forestMist" />
        <p className="text-white font-medium">Cycles</p>
      </div>
      <div className="text-center space-y-4">
        <IterativeRipple size={200} palette="midnightAurora" />
        <p className="text-white font-medium">Ripple</p>
      </div>
      <div className="text-center space-y-4">
        <IterativeChevrons size={200} palette="forestMist" />
        <p className="text-white font-medium">Chevrons</p>
      </div>
    </div>
  ),
};

// ============================================
// SIDE BY SIDE COMPARISONS
// ============================================

export const TopCandidates: Story = {
  name: 'Top Candidates Comparison',
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="p-8 space-y-12">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax' }}>
        Top Candidates
      </h2>
      
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          <h3 className="text-white text-lg">Stacked Planes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-6 rounded-xl text-center">
              <RotatedPlanes_A size={120} palette="midnightAurora" />
              <p className="text-white text-sm mt-3">Rotated A - Midnight</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl text-center">
              <IsometricPlanes_C size={120} palette="forestMist" />
              <p className="text-white text-sm mt-3">Isometric C - Forest</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <h3 className="text-white text-lg">Iterative Symbols</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-6 rounded-xl text-center">
              <IterativeSpiral size={120} palette="midnightAurora" />
              <p className="text-white text-sm mt-3">Spiral - Midnight</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl text-center">
              <IterativeRipple size={120} palette="forestMist" />
              <p className="text-white text-sm mt-3">Ripple - Forest</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LightBackground: Story = {
  name: 'Light Background Test',
  parameters: { backgrounds: { default: 'light' } },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Chillax' }}>
        Marks on Light Background
      </h2>
      <div className="flex flex-wrap gap-8">
        <RotatedPlanes_A size={100} palette="midnightAurora" />
        <RotatedPlanes_C size={100} palette="forestMist" />
        <IsometricPlanes_A size={100} palette="forestMist" />
        <IsometricPlanes_C size={100} palette="midnightAurora" />
        <IterativeSpiral size={100} palette="midnightAurora" />
        <IterativeCycles size={100} palette="forestMist" />
        <IterativeRipple size={100} palette="midnightAurora" />
        <IterativeChevrons size={100} palette="forestMist" />
      </div>
    </div>
  ),
};
