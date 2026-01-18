import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Atoms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Label component for form inputs with required/optional indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'error'],
    },
    required: {
      control: 'boolean',
    },
    optional: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Email Address',
  },
};

export const Muted: Story = {
  args: {
    children: 'Secondary Label',
    variant: 'muted',
  },
};

export const Error: Story = {
  args: {
    children: 'Invalid Field',
    variant: 'error',
  },
};

export const Required: Story = {
  args: {
    children: 'Email Address',
    required: true,
  },
};

export const Optional: Story = {
  args: {
    children: 'Phone Number',
    optional: true,
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 w-64">
      <Label htmlFor="email" required>
        Email Address
      </Label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        className="h-10 px-4 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
      />
    </div>
  ),
};

export const FormField: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" required>
          Full Name
        </Label>
        <input
          id="name"
          placeholder="John Doe"
          className="h-10 px-4 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio" optional>
          Bio
        </Label>
        <textarea
          id="bio"
          placeholder="Tell us about yourself..."
          rows={3}
          className="px-4 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="error-field" variant="error">
          Invalid Email
        </Label>
        <input
          id="error-field"
          defaultValue="invalid@"
          className="h-10 px-4 rounded-lg border border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
        />
        <span className="text-xs text-red-500">Please enter a valid email address</span>
      </div>
    </div>
  ),
};
