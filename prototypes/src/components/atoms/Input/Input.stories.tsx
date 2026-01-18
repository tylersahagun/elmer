import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Text input component with multiple variants and icon support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'error', 'success'],
    },
    inputSize: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    placeholder: {
      control: 'text',
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
    placeholder: 'Enter your email...',
    variant: 'default',
  },
};

export const Ghost: Story = {
  args: {
    placeholder: 'Search...',
    variant: 'ghost',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Invalid input',
    variant: 'error',
    defaultValue: 'invalid@',
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Valid input',
    variant: 'success',
    defaultValue: 'valid@email.com',
  },
};

// ============================================
// SIZES
// ============================================

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    inputSize: 'sm',
  },
};

export const DefaultSize: Story = {
  args: {
    placeholder: 'Default input',
    inputSize: 'default',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    inputSize: 'lg',
  },
};

// ============================================
// STATES
// ============================================

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'hello@elmer.app',
  },
};

// ============================================
// WITH ICONS
// ============================================

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <SearchIcon />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Email',
    rightIcon: <MailIcon />,
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Enter email...',
    leftIcon: <MailIcon />,
    rightIcon: <CheckIcon />,
    variant: 'success',
    defaultValue: 'valid@email.com',
  },
};

// ============================================
// INPUT TYPES
// ============================================

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    defaultValue: 'secretpassword',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter amount',
    min: 0,
    max: 100,
  },
};

export const Date: Story = {
  args: {
    type: 'date',
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input placeholder="Default variant" variant="default" />
      <Input placeholder="Ghost variant" variant="ghost" />
      <Input placeholder="Error variant" variant="error" />
      <Input placeholder="Success variant" variant="success" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input placeholder="Small" inputSize="sm" />
      <Input placeholder="Default" inputSize="default" />
      <Input placeholder="Large" inputSize="lg" />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80 p-6 bg-white/50 rounded-xl border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
        <Input type="email" placeholder="you@example.com" leftIcon={<MailIcon />} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Search</label>
        <Input placeholder="Search..." leftIcon={<SearchIcon />} variant="ghost" />
      </div>
    </div>
  ),
};
