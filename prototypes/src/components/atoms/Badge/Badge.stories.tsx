import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge component for labels, tags, and status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline', 'forest', 'midnight', 'aurora'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    dot: {
      control: 'boolean',
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
    children: 'Badge',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Forest: Story = {
  args: {
    children: 'Forest',
    variant: 'forest',
  },
};

export const Midnight: Story = {
  args: {
    children: 'Midnight',
    variant: 'midnight',
  },
};

export const Aurora: Story = {
  args: {
    children: 'Aurora',
    variant: 'aurora',
  },
};

// ============================================
// SIZES
// ============================================

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

// ============================================
// WITH DOT
// ============================================

export const WithDot: Story = {
  args: {
    children: 'Active',
    variant: 'success',
    dot: true,
  },
};

export const StatusDot: Story = {
  args: {
    children: 'In Progress',
    variant: 'info',
    dot: true,
  },
};

// ============================================
// USE CASES
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const ElmerTheme: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="forest">Forest Mist</Badge>
      <Badge variant="midnight">Midnight Aurora</Badge>
      <Badge variant="aurora">Aurora Gradient</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="success" dot>Active</Badge>
        <Badge variant="warning" dot>Pending</Badge>
        <Badge variant="error" dot>Failed</Badge>
        <Badge variant="info" dot>Processing</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" dot>Draft</Badge>
        <Badge variant="default" dot>Archived</Badge>
      </div>
    </div>
  ),
};

export const Tags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="forest" size="sm">React</Badge>
      <Badge variant="midnight" size="sm">TypeScript</Badge>
      <Badge variant="aurora" size="sm">Storybook</Badge>
      <Badge variant="outline" size="sm">TailwindCSS</Badge>
      <Badge variant="default" size="sm">+3 more</Badge>
    </div>
  ),
};

export const ProjectPhases: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Research</Badge>
      <Badge variant="info">Design</Badge>
      <Badge variant="warning">Development</Badge>
      <Badge variant="success">Complete</Badge>
    </div>
  ),
};
