import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

// Icon components
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.5 1.5M15 15l1.5 1.5M3.5 16.5l1.5-1.5M15 5l1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5h14M8 5V3h4v2M5 5v12a2 2 0 002 2h6a2 2 0 002-2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17l-1.45-1.32C4.4 12.36 2 10.28 2 7.5A4.5 4.5 0 016.5 3c1.74 0 3.41.98 4.5 2.5A5.68 5.68 0 0113.5 3 4.5 4.5 0 0118 7.5c0 2.78-2.4 4.86-6.55 8.18L10 17z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: 'Atoms/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Icon-only button component for actions with visual icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'ghost', 'destructive', 'forest', 'midnight'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
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
    'aria-label': 'Add item',
    children: <PlusIcon />,
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    'aria-label': 'Add item',
    children: <PlusIcon />,
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    'aria-label': 'Open menu',
    children: <MenuIcon />,
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    'aria-label': 'Close',
    children: <CloseIcon />,
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    'aria-label': 'Delete',
    children: <TrashIcon />,
    variant: 'destructive',
  },
};

export const Forest: Story = {
  args: {
    'aria-label': 'Like',
    children: <HeartIcon />,
    variant: 'forest',
  },
};

export const Midnight: Story = {
  args: {
    'aria-label': 'Settings',
    children: <SettingsIcon />,
    variant: 'midnight',
  },
};

// ============================================
// SIZES
// ============================================

export const ExtraSmall: Story = {
  args: {
    'aria-label': 'Close',
    children: <CloseIcon />,
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    'aria-label': 'Add',
    children: <PlusIcon />,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    'aria-label': 'Menu',
    children: <MenuIcon />,
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    'aria-label': 'Add',
    children: <PlusIcon />,
    size: 'xl',
    variant: 'primary',
  },
};

// ============================================
// STATES
// ============================================

export const Loading: Story = {
  args: {
    'aria-label': 'Loading',
    children: <PlusIcon />,
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled',
    children: <PlusIcon />,
    disabled: true,
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton aria-label="Default" variant="default"><PlusIcon /></IconButton>
      <IconButton aria-label="Primary" variant="primary"><PlusIcon /></IconButton>
      <IconButton aria-label="Secondary" variant="secondary"><MenuIcon /></IconButton>
      <IconButton aria-label="Ghost" variant="ghost"><CloseIcon /></IconButton>
      <IconButton aria-label="Destructive" variant="destructive"><TrashIcon /></IconButton>
      <IconButton aria-label="Forest" variant="forest"><HeartIcon /></IconButton>
      <IconButton aria-label="Midnight" variant="midnight"><SettingsIcon /></IconButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton aria-label="XS" size="xs"><PlusIcon /></IconButton>
      <IconButton aria-label="SM" size="sm"><PlusIcon /></IconButton>
      <IconButton aria-label="Default" size="default"><PlusIcon /></IconButton>
      <IconButton aria-label="LG" size="lg"><PlusIcon /></IconButton>
      <IconButton aria-label="XL" size="xl"><PlusIcon /></IconButton>
    </div>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <div className="flex items-center gap-1 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
      <IconButton aria-label="Add" variant="ghost" size="sm"><PlusIcon /></IconButton>
      <IconButton aria-label="Menu" variant="ghost" size="sm"><MenuIcon /></IconButton>
      <div className="w-px h-6 bg-slate-200 mx-1" />
      <IconButton aria-label="Settings" variant="ghost" size="sm"><SettingsIcon /></IconButton>
      <IconButton aria-label="Delete" variant="ghost" size="sm"><TrashIcon /></IconButton>
    </div>
  ),
};

export const ActionGroup: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Add new" variant="primary" size="lg"><PlusIcon /></IconButton>
      <IconButton aria-label="Like" variant="forest"><HeartIcon /></IconButton>
      <IconButton aria-label="Settings" variant="midnight"><SettingsIcon /></IconButton>
    </div>
  ),
};
