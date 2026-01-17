import type { Meta, StoryObj } from '@storybook/react';
import {
  ElmerLogoExploration,
  MonogramAuroraE,
  MonogramGlassE,
  MonogramLayeredE,
  MonogramOrbitalE,
  WordmarkPure,
  WordmarkGradient,
  WordmarkAccentE,
  AbstractConverging,
  AbstractStackedPlanes,
  AbstractAuroraOrbs,
  AbstractWave,
  AbstractPrism,
  CombinationHorizontal,
  CombinationVertical,
  CombinationIntegrated,
} from './ElmerLogoExploration';

const meta: Meta<typeof ElmerLogoExploration> = {
  title: 'Brand/elmer Logo Exploration',
  component: ElmerLogoExploration,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fafafa' },
        { name: 'dark', value: '#0f172a' },
        { name: 'aurora', value: 'linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%)' },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ElmerLogoExploration>;

// Full exploration page
export const FullExploration: Story = {
  render: () => <ElmerLogoExploration />,
};

// ============================================
// MONOGRAMS
// ============================================

export const Monograms: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Monogram Variations
      </h2>
      <div className="flex flex-wrap gap-8 items-end">
        <div className="text-center space-y-2">
          <MonogramAuroraE size={100} />
          <p className="text-sm text-gray-600">Aurora e</p>
        </div>
        <div className="text-center space-y-2">
          <MonogramGlassE size={100} />
          <p className="text-sm text-gray-600">Glass e</p>
        </div>
        <div className="text-center space-y-2">
          <MonogramLayeredE size={100} />
          <p className="text-sm text-gray-600">Layered e</p>
        </div>
        <div className="text-center space-y-2">
          <MonogramOrbitalE size={100} />
          <p className="text-sm text-gray-600">Orbital e</p>
        </div>
      </div>
    </div>
  ),
};

export const MonogramSizes: Story = {
  name: 'Monogram Scaling',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Aurora e at Different Sizes
      </h2>
      <div className="flex flex-wrap items-end gap-8">
        {[16, 24, 32, 48, 64, 96, 128].map((size) => (
          <div key={size} className="text-center space-y-2">
            <MonogramAuroraE size={size} />
            <p className="text-xs text-gray-500">{size}px</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ============================================
// WORDMARKS
// ============================================

export const Wordmarks: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Wordmark Variations
      </h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <WordmarkPure width={200} />
          <p className="text-sm text-gray-600">Pure Chillax — clean and professional</p>
        </div>
        <div className="space-y-2">
          <WordmarkGradient width={200} />
          <p className="text-sm text-gray-600">Gradient Flow — aurora identity</p>
        </div>
        <div className="space-y-2">
          <WordmarkAccentE width={200} />
          <p className="text-sm text-gray-600">Accent e — subtle differentiation</p>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// ABSTRACT MARKS
// ============================================

export const AbstractMarks: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Abstract Logo Marks
      </h2>
      <div className="grid grid-cols-5 gap-8">
        <div className="text-center space-y-2">
          <AbstractConverging size={80} />
          <p className="text-sm text-gray-600">Converging</p>
          <p className="text-xs text-gray-400">Orchestration</p>
        </div>
        <div className="text-center space-y-2">
          <AbstractStackedPlanes size={80} />
          <p className="text-sm text-gray-600">Stacked Planes</p>
          <p className="text-xs text-gray-400">Depth & Glass</p>
        </div>
        <div className="text-center space-y-2">
          <AbstractAuroraOrbs size={80} />
          <p className="text-sm text-gray-600">Aurora Orbs</p>
          <p className="text-xs text-gray-400">Synthesis</p>
        </div>
        <div className="text-center space-y-2">
          <AbstractWave size={80} />
          <p className="text-sm text-gray-600">Wave</p>
          <p className="text-xs text-gray-400">Flow & Rhythm</p>
        </div>
        <div className="text-center space-y-2">
          <AbstractPrism size={80} />
          <p className="text-sm text-gray-600">Prism</p>
          <p className="text-xs text-gray-400">Transformation</p>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// COMBINATION MARKS
// ============================================

export const CombinationMarks: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Combination Marks
      </h2>
      <div className="space-y-8">
        <div className="space-y-2">
          <CombinationHorizontal width={280} />
          <p className="text-sm text-gray-600">Horizontal — for headers and wide spaces</p>
        </div>
        <div className="space-y-2">
          <CombinationVertical size={120} />
          <p className="text-sm text-gray-600">Vertical — for square formats and app icons</p>
        </div>
        <div className="space-y-2">
          <CombinationIntegrated width={200} />
          <p className="text-sm text-gray-600">Integrated — orb replaces first e</p>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// DARK MODE
// ============================================

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Dark Mode Variants
      </h2>
      <div className="flex flex-wrap gap-8">
        <div className="text-center space-y-2">
          <MonogramAuroraE size={80} />
          <p className="text-sm text-gray-400">Aurora e (unchanged)</p>
        </div>
        <div className="text-center space-y-2">
          <MonogramGlassE size={80} dark />
          <p className="text-sm text-gray-400">Glass e (dark)</p>
        </div>
        <div className="text-center space-y-2">
          <WordmarkPure width={160} dark />
          <p className="text-sm text-gray-400">Wordmark (dark)</p>
        </div>
        <div className="text-center space-y-2">
          <WordmarkGradient width={160} />
          <p className="text-sm text-gray-400">Gradient (unchanged)</p>
        </div>
        <div className="text-center space-y-2">
          <CombinationHorizontal width={220} dark />
          <p className="text-sm text-gray-400">Combo (dark)</p>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// APP ICON PREVIEW
// ============================================

export const AppIconPreview: Story = {
  name: 'App Icon Preview',
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        App Icon Preview
      </h2>
      <div className="flex flex-wrap gap-6 items-end">
        {/* iOS-style rounded square */}
        <div className="space-y-2 text-center">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <MonogramAuroraE size={52} />
          </div>
          <p className="text-xs text-gray-500">iOS (80px)</p>
        </div>

        {/* Android adaptive */}
        <div className="space-y-2 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4fd1c5 0%, #9f7aea 50%, #ed64a6 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <span 
              className="text-white text-3xl font-semibold"
              style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}
            >
              e
            </span>
          </div>
          <p className="text-xs text-gray-500">Android (64px)</p>
        </div>

        {/* Favicon */}
        <div className="space-y-2 text-center">
          <div 
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{
              background: '#0f172a',
            }}
          >
            <MonogramAuroraE size={20} />
          </div>
          <p className="text-xs text-gray-500">Favicon (32px)</p>
        </div>

        {/* Tiny favicon */}
        <div className="space-y-2 text-center">
          <div 
            className="w-4 h-4 rounded-sm flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4fd1c5 0%, #9f7aea 100%)',
            }}
          >
            <span 
              className="text-white text-[10px] font-bold"
              style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}
            >
              e
            </span>
          </div>
          <p className="text-xs text-gray-500">Tiny (16px)</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Recommendation:</strong> The Aurora gradient 'e' works well at all sizes. 
          For very small sizes (16px), consider using a solid aurora color or simplified mark.
        </p>
      </div>
    </div>
  ),
};

// ============================================
// COLOR PALETTE
// ============================================

export const ColorPalette: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
        Aurora Color Palette
      </h2>
      <div className="grid grid-cols-5 gap-4">
        {[
          { name: 'Aurora Teal', hex: '#4fd1c5', meaning: 'Trust, clarity, calm' },
          { name: 'Aurora Purple', hex: '#9f7aea', meaning: 'Wisdom, creativity' },
          { name: 'Aurora Pink', hex: '#ed64a6', meaning: 'Energy, warmth' },
          { name: 'Aurora Gold', hex: '#ecc94b', meaning: 'Intelligence, success' },
          { name: 'Aurora Blue', hex: '#63b3ed', meaning: 'Openness, depth' },
        ].map((color) => (
          <div key={color.hex} className="space-y-2">
            <div 
              className="w-full h-24 rounded-xl"
              style={{ backgroundColor: color.hex }}
            />
            <p className="font-medium text-gray-800">{color.name}</p>
            <p className="text-sm text-gray-500 font-mono">{color.hex}</p>
            <p className="text-xs text-gray-400">{color.meaning}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Chillax, system-ui, sans-serif' }}>
          Gradient Examples
        </h3>
        <div className="space-y-3">
          <div 
            className="h-12 rounded-lg"
            style={{ background: 'linear-gradient(90deg, #4fd1c5 0%, #9f7aea 50%, #ed64a6 100%)' }}
          />
          <p className="text-sm text-gray-500">Primary: Teal → Purple → Pink</p>
          
          <div 
            className="h-12 rounded-lg"
            style={{ background: 'linear-gradient(90deg, #4fd1c5 0%, #63b3ed 100%)' }}
          />
          <p className="text-sm text-gray-500">Cool: Teal → Blue</p>
          
          <div 
            className="h-12 rounded-lg"
            style={{ background: 'linear-gradient(90deg, #9f7aea 0%, #ed64a6 50%, #ecc94b 100%)' }}
          />
          <p className="text-sm text-gray-500">Warm: Purple → Pink → Gold</p>
        </div>
      </div>
    </div>
  ),
};
