import type { Meta, StoryObj } from '@storybook/react';
import { ElmerLogo, elmerPalettes } from './ElmerLogo';

const meta: Meta<typeof ElmerLogo> = {
  title: 'Brand/ElmerLogo',
  component: ElmerLogo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'elmer brand logo with multiple variants and color palettes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['simple', 'layered', 'wave', 'gradient'],
    },
    palette: {
      control: 'select',
      options: ['aurora', 'forest', 'midnight', 'sunset', 'ocean'],
    },
    size: {
      control: { type: 'range', min: 24, max: 128, step: 8 },
    },
    showText: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// VARIANTS
// ============================================

export const Simple: Story = {
  args: {
    variant: 'simple',
    size: 64,
  },
};

export const Layered: Story = {
  args: {
    variant: 'layered',
    size: 64,
  },
};

export const Wave: Story = {
  args: {
    variant: 'wave',
    size: 64,
  },
};

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    size: 64,
  },
};

// ============================================
// PALETTES
// ============================================

export const Aurora: Story = {
  args: {
    variant: 'simple',
    palette: 'aurora',
    size: 64,
  },
};

export const Forest: Story = {
  args: {
    variant: 'simple',
    palette: 'forest',
    size: 64,
  },
};

export const Midnight: Story = {
  args: {
    variant: 'simple',
    palette: 'midnight',
    size: 64,
  },
};

export const Sunset: Story = {
  args: {
    variant: 'simple',
    palette: 'sunset',
    size: 64,
  },
};

export const Ocean: Story = {
  args: {
    variant: 'simple',
    palette: 'ocean',
    size: 64,
  },
};

// ============================================
// WITH TEXT
// ============================================

export const WithText: Story = {
  args: {
    variant: 'simple',
    size: 40,
    showText: true,
  },
};

export const WithTextLarge: Story = {
  args: {
    variant: 'simple',
    size: 64,
    showText: true,
  },
};

// ============================================
// SIZES
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ElmerLogo size={24} />
      <ElmerLogo size={32} />
      <ElmerLogo size={48} />
      <ElmerLogo size={64} />
      <ElmerLogo size={96} />
    </div>
  ),
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <ElmerLogo variant="simple" size={64} />
        <p className="text-xs text-slate-500 mt-2">Simple</p>
      </div>
      <div className="text-center">
        <ElmerLogo variant="layered" size={64} />
        <p className="text-xs text-slate-500 mt-2">Layered</p>
      </div>
      <div className="text-center">
        <ElmerLogo variant="wave" size={64} />
        <p className="text-xs text-slate-500 mt-2">Wave</p>
      </div>
      <div className="text-center">
        <ElmerLogo variant="gradient" size={64} />
        <p className="text-xs text-slate-500 mt-2">Gradient</p>
      </div>
    </div>
  ),
};

export const AllPalettes: Story = {
  render: () => (
    <div className="space-y-8">
      {(Object.keys(elmerPalettes) as Array<keyof typeof elmerPalettes>).map((palette) => (
        <div key={palette} className="flex items-center gap-4">
          <ElmerLogo variant="simple" palette={palette} size={48} />
          <div>
            <p className="font-medium text-slate-900">{elmerPalettes[palette].name}</p>
            <p className="text-xs text-slate-500">{elmerPalettes[palette].description}</p>
            <div className="flex gap-1 mt-1">
              {elmerPalettes[palette].colors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const VariantsWithPalettes: Story = {
  render: () => (
    <div className="grid grid-cols-5 gap-4">
      {(['aurora', 'forest', 'midnight', 'sunset', 'ocean'] as const).map((palette) => (
        <div key={palette} className="space-y-3">
          <p className="text-xs font-medium text-slate-500 text-center">{palette}</p>
          <ElmerLogo variant="simple" palette={palette} size={48} className="mx-auto" />
          <ElmerLogo variant="layered" palette={palette} size={48} className="mx-auto" />
          <ElmerLogo variant="wave" palette={palette} size={48} className="mx-auto" />
        </div>
      ))}
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Navbar example */}
      <div className="w-full max-w-2xl p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <ElmerLogo variant="simple" size={32} showText />
        <nav className="flex-1 flex items-center gap-4 justify-center">
          <span className="text-sm text-slate-600">Dashboard</span>
          <span className="text-sm text-slate-600">Projects</span>
          <span className="text-sm text-slate-600">Settings</span>
        </nav>
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </div>
      
      {/* Login card */}
      <div className="w-80 p-8 bg-white rounded-2xl border border-slate-200 shadow-lg text-center">
        <ElmerLogo variant="simple" size={64} className="mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Welcome to elmer</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to continue</p>
        <button className="w-full h-10 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium">
          Sign In
        </button>
      </div>
      
      {/* Footer */}
      <div className="w-full max-w-2xl p-6 bg-slate-900 rounded-xl">
        <div className="flex items-center justify-between">
          <ElmerLogo variant="simple" size={32} showText palette="aurora" />
          <p className="text-sm text-slate-400">© 2026 elmer. All rights reserved.</p>
        </div>
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <div className="relative">
          <ElmerLogo variant="simple" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Loading...</p>
      </div>
      <div className="text-center">
        <ElmerLogo variant="layered" size={64} className="animate-pulse" />
        <p className="text-xs text-slate-500 mt-4">Processing...</p>
      </div>
    </div>
  ),
};
