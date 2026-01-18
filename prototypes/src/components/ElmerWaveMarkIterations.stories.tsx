import type { Meta, StoryObj } from '@storybook/react';
import {
  ElmerWaveMarkIterations,
  WaveV2_Original,
  WaveV2_A,
  WaveV2_B,
  WaveV2_C,
  WaveV2_D,
  WaveV4_Original,
  WaveV4_A,
  WaveV4_B,
  WaveV4_C,
  WaveV4_D,
  GradientWordmark,
  palettes,
  type PaletteKey,
} from './ElmerWaveMarkIterations';

const meta: Meta<typeof ElmerWaveMarkIterations> = {
  title: 'Brand/Wave Mark Iterations',
  component: ElmerWaveMarkIterations,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fafafa' },
        { name: 'dark', value: '#0f172a' },
        { name: 'aurora', value: 'linear-gradient(135deg, #4fd1c5 0%, #9f7aea 50%, #ed64a6 100%)' },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ElmerWaveMarkIterations>;

// Full exploration page
export const FullExploration: Story = {
  render: () => <ElmerWaveMarkIterations />,
};

// ============================================
// WAVE V2 STORIES
// ============================================

export const WaveV2AllVariants: Story = {
  name: 'Wave V2: All Variants',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave V2 Variants (Rolling Wave)
      </h2>
      <p className="text-gray-600">Variations on the rolling wave with gentle curves</p>
      
      <div className="grid grid-cols-5 gap-6">
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV2_Original size={100} />
          <p className="text-sm font-medium">Original</p>
          <p className="text-xs text-gray-500">Wide rolling curves</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV2_A size={100} />
          <p className="text-sm font-medium">V2-A Soft</p>
          <p className="text-xs text-gray-500">More horizontal</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV2_B size={100} />
          <p className="text-sm font-medium">V2-B Energetic</p>
          <p className="text-xs text-gray-500">Tighter amplitude</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV2_C size={100} />
          <p className="text-sm font-medium">V2-C Ascending</p>
          <p className="text-xs text-gray-500">Elegant upward</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV2_D size={100} />
          <p className="text-sm font-medium">V2-D Depth</p>
          <p className="text-xs text-gray-500">Double stroke</p>
        </div>
      </div>
    </div>
  ),
};

export const WaveV2WithPalettes: Story = {
  name: 'Wave V2: Color Palettes',
  render: () => {
    const allPalettes = Object.keys(palettes) as PaletteKey[];
    return (
      <div className="p-8 space-y-8">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          Wave V2 Original in All Palettes
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {allPalettes.map((key) => (
            <div key={key} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
              <WaveV2_Original size={80} palette={key} />
              <p className="text-sm font-medium">{palettes[key].name}</p>
            </div>
          ))}
        </div>
        
        <h3 className="text-xl font-medium mt-8" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          V2-C (Ascending) in All Palettes
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {allPalettes.map((key) => (
            <div key={key} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
              <WaveV2_C size={80} palette={key} />
              <p className="text-sm font-medium">{palettes[key].name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const WaveV2Large: Story = {
  name: 'Wave V2: Large Preview',
  render: () => (
    <div className="p-8 flex flex-wrap gap-8 justify-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <WaveV2_Original size={200} />
        <p className="text-center text-sm font-medium">V2 Original</p>
      </div>
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <WaveV2_C size={200} />
        <p className="text-center text-sm font-medium">V2-C Ascending</p>
      </div>
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <WaveV2_D size={200} />
        <p className="text-center text-sm font-medium">V2-D Depth</p>
      </div>
    </div>
  ),
};

// ============================================
// WAVE V4 STORIES
// ============================================

export const WaveV4AllVariants: Story = {
  name: 'Wave V4: All Variants',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave V4 Variants (Ribbon Wave)
      </h2>
      <p className="text-gray-600">Variations on the filled ribbon wave</p>
      
      <div className="grid grid-cols-5 gap-6">
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV4_Original size={100} />
          <p className="text-sm font-medium">Original</p>
          <p className="text-xs text-gray-500">Classic ribbon fill</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV4_A size={100} />
          <p className="text-sm font-medium">V4-A Refined</p>
          <p className="text-xs text-gray-500">Thinner, elegant</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV4_B size={100} />
          <p className="text-sm font-medium">V4-B Dramatic</p>
          <p className="text-xs text-gray-500">Bold gradient</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV4_C size={100} />
          <p className="text-sm font-medium">V4-C Glow</p>
          <p className="text-xs text-gray-500">Ascending + glow</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
          <WaveV4_D size={100} />
          <p className="text-sm font-medium">V4-D Layered</p>
          <p className="text-xs text-gray-500">Transparent depth</p>
        </div>
      </div>
    </div>
  ),
};

export const WaveV4WithPalettes: Story = {
  name: 'Wave V4: Color Palettes',
  render: () => {
    const allPalettes = Object.keys(palettes) as PaletteKey[];
    return (
      <div className="p-8 space-y-8">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          Wave V4 Original in All Palettes
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {allPalettes.map((key) => (
            <div key={key} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
              <WaveV4_Original size={80} palette={key} />
              <p className="text-sm font-medium">{palettes[key].name}</p>
            </div>
          ))}
        </div>
        
        <h3 className="text-xl font-medium mt-8" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          V4-D (Layered) in All Palettes
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {allPalettes.map((key) => (
            <div key={key} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
              <WaveV4_D size={80} palette={key} />
              <p className="text-sm font-medium">{palettes[key].name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const WaveV4Large: Story = {
  name: 'Wave V4: Large Preview',
  render: () => (
    <div className="p-8 flex flex-wrap gap-8 justify-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <WaveV4_Original size={200} />
        <p className="text-center text-sm font-medium">V4 Original</p>
      </div>
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <WaveV4_C size={200} />
        <p className="text-center text-sm font-medium">V4-C Glow</p>
      </div>
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <WaveV4_D size={200} />
        <p className="text-center text-sm font-medium">V4-D Layered</p>
      </div>
    </div>
  ),
};

// ============================================
// COMBINATION MARK STORIES
// ============================================

export const CombinationMarksAurora: Story = {
  name: 'Combinations: Aurora Palette',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave + Wordmark Combinations (Aurora)
      </h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
          <WaveV2_Original size={64} />
          <GradientWordmark palette="aurora" width={160} />
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
          <WaveV4_Original size={64} />
          <GradientWordmark palette="aurora" width={160} />
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
          <WaveV2_C size={64} />
          <GradientWordmark palette="aurora" width={160} />
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
          <WaveV4_D size={64} />
          <GradientWordmark palette="aurora" width={160} />
        </div>
      </div>
    </div>
  ),
};

export const CombinationMarksAllPalettes: Story = {
  name: 'Combinations: All Palettes',
  render: () => {
    const allPalettes = Object.keys(palettes) as PaletteKey[];
    return (
      <div className="p-8 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V2-C + Wordmark Across Palettes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {allPalettes.map((key) => (
              <div key={key} className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm">
                <WaveV2_C size={48} palette={key} />
                <GradientWordmark palette={key} width={120} />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V4-D + Wordmark Across Palettes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {allPalettes.map((key) => (
              <div key={key} className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm">
                <WaveV4_D size={48} palette={key} />
                <GradientWordmark palette={key} width={120} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ============================================
// NEW PALETTE STORIES
// ============================================

export const NewPaletteExploration: Story = {
  name: 'New Palettes: Copper, Arctic, Berry, Sage',
  render: () => {
    const newPalettes: PaletteKey[] = ['copper', 'arctic', 'berry', 'sage'];
    return (
      <div className="p-8 space-y-8">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          New Palette Explorations
        </h2>
        <p className="text-gray-600">Four new color palettes to explore different brand directions</p>
        
        <div className="grid grid-cols-4 gap-6">
          {newPalettes.map((key) => (
            <div key={key} className="space-y-4">
              {/* Palette swatch */}
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex gap-1 mb-3">
                  {palettes[key].colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-md first:rounded-l-lg last:rounded-r-lg"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="font-medium text-gray-800" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
                  {palettes[key].name}
                </p>
                <p className="text-xs text-gray-500">{palettes[key].description}</p>
              </div>
              
              {/* Wave variants */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                  <WaveV2_Original size={48} palette={key} />
                  <p className="text-[10px] text-gray-500 mt-1">V2</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                  <WaveV4_Original size={48} palette={key} />
                  <p className="text-[10px] text-gray-500 mt-1">V4</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                  <WaveV2_C size={48} palette={key} />
                  <p className="text-[10px] text-gray-500 mt-1">V2-C</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                  <WaveV4_D size={48} palette={key} />
                  <p className="text-[10px] text-gray-500 mt-1">V4-D</p>
                </div>
              </div>
              
              {/* Combination mark */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <WaveV2_C size={40} palette={key} />
                <GradientWordmark palette={key} width={100} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// ============================================
// DARK BACKGROUND STORIES
// ============================================

export const OnDarkBackground: Story = {
  name: 'On Dark Backgrounds',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave Marks on Dark Backgrounds
      </h2>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/50">
          <WaveV2_Original size={80} />
          <p className="text-white/70 text-sm mt-2">V2 Original</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/50">
          <WaveV4_Original size={80} />
          <p className="text-white/70 text-sm mt-2">V4 Original</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/50">
          <WaveV2_C size={80} />
          <p className="text-white/70 text-sm mt-2">V2-C Ascending</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/50">
          <WaveV4_D size={80} />
          <p className="text-white/70 text-sm mt-2">V4-D Layered</p>
        </div>
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
        <div className="flex items-center gap-4 p-6 rounded-xl bg-slate-800/50">
          <WaveV2_C size={56} palette="twilight" />
          <GradientWordmark palette="twilight" width={140} />
        </div>
        <div className="flex items-center gap-4 p-6 rounded-xl bg-slate-800/50">
          <WaveV4_D size={56} palette="sunset" />
          <GradientWordmark palette="sunset" width={140} />
        </div>
      </div>
    </div>
  ),
};

// ============================================
// SIDE-BY-SIDE COMPARISON STORY
// ============================================

export const SideBySideComparison: Story = {
  name: 'Side-by-Side: V2 vs V4',
  render: () => (
    <div className="p-8 space-y-12">
      <h2 className="text-2xl font-semibold text-center" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wave V2 (Line) vs Wave V4 (Ribbon) Comparison
      </h2>
      
      {/* Large comparison */}
      <div className="flex justify-center gap-16">
        <div className="text-center">
          <div className="p-8 bg-white rounded-2xl shadow-sm mb-4">
            <WaveV2_C size={160} />
          </div>
          <p className="font-medium">Wave V2-C (Ascending)</p>
          <p className="text-sm text-gray-500">Line stroke, elegant flow</p>
        </div>
        <div className="text-center">
          <div className="p-8 bg-white rounded-2xl shadow-sm mb-4">
            <WaveV4_D size={160} />
          </div>
          <p className="font-medium">Wave V4-D (Layered)</p>
          <p className="text-sm text-gray-500">Filled ribbon, depth</p>
        </div>
      </div>
      
      {/* With wordmark comparison */}
      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
          <WaveV2_C size={64} />
          <GradientWordmark palette="aurora" width={160} />
        </div>
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
          <WaveV4_D size={64} />
          <GradientWordmark palette="aurora" width={160} />
        </div>
      </div>
      
      {/* Different palettes comparison */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-medium text-center" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V2-C in Different Palettes
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(['aurora', 'twilight', 'sunset', 'ocean', 'forest', 'midnight'] as PaletteKey[]).map((key) => (
              <div key={key} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                <WaveV2_C size={40} palette={key} />
                <GradientWordmark palette={key} width={80} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-medium text-center" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
            V4-D in Different Palettes
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(['aurora', 'twilight', 'sunset', 'ocean', 'forest', 'midnight'] as PaletteKey[]).map((key) => (
              <div key={key} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                <WaveV4_D size={40} palette={key} />
                <GradientWordmark palette={key} width={80} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
