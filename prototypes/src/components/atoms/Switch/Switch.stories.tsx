import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Atoms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toggle switch for on/off states with multiple sizes and color variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'forest', 'midnight'],
    },
    checked: {
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
// BASIC
// ============================================

export const Default: Story = {
  args: {
    defaultChecked: false,
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
  },
};

// ============================================
// SIZES
// ============================================

export const Small: Story = {
  args: {
    size: 'sm',
    defaultChecked: true,
  },
};

export const DefaultSize: Story = {
  args: {
    size: 'default',
    defaultChecked: true,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    defaultChecked: true,
  },
};

// ============================================
// VARIANTS
// ============================================

export const Forest: Story = {
  args: {
    variant: 'forest',
    defaultChecked: true,
  },
};

export const Midnight: Story = {
  args: {
    variant: 'midnight',
    defaultChecked: true,
  },
};

// ============================================
// CONTROLLED
// ============================================

const ControlledTemplate = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <span className="text-sm text-slate-600">{checked ? 'On' : 'Off'}</span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledTemplate />,
};

// ============================================
// SHOWCASE
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch size="sm" defaultChecked />
        <span className="text-xs text-slate-500">Small</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch size="default" defaultChecked />
        <span className="text-xs text-slate-500">Default</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch size="lg" defaultChecked />
        <span className="text-xs text-slate-500">Large</span>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch variant="default" defaultChecked />
        <span className="text-xs text-slate-500">Aurora</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch variant="forest" defaultChecked />
        <span className="text-xs text-slate-500">Forest</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch variant="midnight" defaultChecked />
        <span className="text-xs text-slate-500">Midnight</span>
      </div>
    </div>
  ),
};

export const SettingsPanel: Story = {
  render: () => (
    <div className="w-80 p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-semibold text-slate-900">Notification Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Email notifications</span>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Push notifications</span>
          <Switch defaultChecked variant="forest" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Weekly digest</span>
          <Switch variant="midnight" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Marketing emails</span>
          <Switch disabled />
        </div>
      </div>
    </div>
  ),
};
