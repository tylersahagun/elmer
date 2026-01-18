import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button component with elmer\'s design system - featuring Aurora gradients and multiple variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link', 'forest', 'midnight'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
      description: 'Size variant',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// VARIANTS
// ============================================

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Item',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Forest: Story = {
  args: {
    children: 'Forest Theme',
    variant: 'forest',
  },
};

export const Midnight: Story = {
  args: {
    children: 'Midnight Theme',
    variant: 'midnight',
  },
};

// ============================================
// SIZES
// ============================================

export const ExtraSmall: Story = {
  args: {
    children: 'Extra Small',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Default: Story = {
  args: {
    children: 'Default Size',
    size: 'default',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large',
    size: 'xl',
  },
};

// ============================================
// STATES
// ============================================

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

// ============================================
// WITH ICONS
// ============================================

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    leftIcon: <PlusIcon />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    rightIcon: <ArrowRightIcon />,
  },
};

export const IconOnly: Story = {
  args: {
    children: <PlusIcon />,
    size: 'icon',
    'aria-label': 'Add item',
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="forest">Forest</Button>
        <Button variant="midnight">Midnight</Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">XS</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
};

export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Save Changes</Button>
    </div>
  ),
};
