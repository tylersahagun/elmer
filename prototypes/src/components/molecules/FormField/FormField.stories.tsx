import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Complete form field with label, input, helper text, and error states.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
  },
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
  },
};

export const Optional: Story = {
  args: {
    label: 'Phone Number',
    placeholder: '+1 (555) 000-0000',
    optional: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    defaultValue: 'invalid@',
    error: 'Please enter a valid email address',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    disabled: true,
  },
};

// Icons for stories
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const WithIcon: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    leftIcon: <MailIcon />,
    required: true,
  },
};

export const Form: Story = {
  render: () => (
    <div className="w-80 space-y-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Create Account</h2>
      <FormField
        label="Full Name"
        placeholder="John Doe"
        required
      />
      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<MailIcon />}
        required
      />
      <FormField
        label="Password"
        type="password"
        placeholder="Create a password"
        leftIcon={<LockIcon />}
        helperText="Must be at least 8 characters"
        required
      />
      <FormField
        label="Company"
        placeholder="Your company"
        optional
      />
      <button className="w-full h-10 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
        Create Account
      </button>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <FormField
        label="Valid Field"
        defaultValue="valid@email.com"
        variant="success"
        helperText="Email is valid"
      />
      <FormField
        label="Invalid Field"
        defaultValue="invalid"
        error="Please enter a valid email address"
      />
      <FormField
        label="Neutral Field"
        placeholder="Type something..."
        helperText="This is helper text"
      />
    </div>
  ),
};
