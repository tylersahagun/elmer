import type { Meta, StoryObj } from '@storybook/react';
import { Spinner, LoadingOverlay } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading spinner for async states and loading indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'white', 'forest', 'midnight'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// VARIANTS
// ============================================

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Forest: Story = {
  args: {
    variant: 'forest',
  },
};

export const Midnight: Story = {
  args: {
    variant: 'midnight',
  },
};

export const White: Story = {
  args: {
    variant: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// ============================================
// SIZES
// ============================================

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const DefaultSize: Story = {
  args: {
    size: 'default',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="xs" variant="primary" />
      <Spinner size="sm" variant="primary" />
      <Spinner size="default" variant="primary" />
      <Spinner size="lg" variant="primary" />
      <Spinner size="xl" variant="primary" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner variant="default" />
      <Spinner variant="primary" />
      <Spinner variant="forest" />
      <Spinner variant="midnight" />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Spinner variant="primary" />
      <span className="text-sm text-slate-600">Loading...</span>
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button
      disabled
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg opacity-80 cursor-not-allowed"
    >
      <Spinner size="sm" variant="white" />
      Processing...
    </button>
  ),
};

// ============================================
// LOADING OVERLAY
// ============================================

export const Overlay: Story = {
  render: () => (
    <LoadingOverlay loading text="Loading content...">
      <div className="w-64 h-40 p-4 bg-slate-100 rounded-lg">
        <div className="h-4 bg-slate-300 rounded mb-2 w-3/4" />
        <div className="h-4 bg-slate-300 rounded mb-2 w-1/2" />
        <div className="h-4 bg-slate-300 rounded w-5/6" />
      </div>
    </LoadingOverlay>
  ),
};

export const OverlayNoBlur: Story = {
  render: () => (
    <LoadingOverlay loading blur={false}>
      <div className="w-64 h-40 p-4 bg-slate-100 rounded-lg">
        <div className="h-4 bg-slate-300 rounded mb-2 w-3/4" />
        <div className="h-4 bg-slate-300 rounded mb-2 w-1/2" />
        <div className="h-4 bg-slate-300 rounded w-5/6" />
      </div>
    </LoadingOverlay>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <LoadingOverlay loading text="Fetching data..." className="rounded-xl overflow-hidden">
      <div className="w-80 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Project Card</h3>
        <p className="text-slate-600 text-sm mb-4">
          This is some content that will be visible when loading completes.
        </p>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-slate-100 rounded text-xs">Tag 1</span>
          <span className="px-2 py-1 bg-slate-100 rounded text-xs">Tag 2</span>
        </div>
      </div>
    </LoadingOverlay>
  ),
};
