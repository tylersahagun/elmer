import type { Meta, StoryObj } from '@storybook/react';
import { ExamplePrototype } from './ExamplePrototype';

const meta = {
  // Note: Prototypes use 'Prototypes/' prefix in Storybook
  title: 'Prototypes/ExamplePrototype',
  component: ExamplePrototype,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'minimal', 'detailed'],
      description: 'Different design directions for comparison',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading state',
    },
  },
} satisfies Meta<typeof ExamplePrototype>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===========================================
// DESIGN OPTIONS - Always create 2-3 variants
// ===========================================

/**
 * Option A: Maximum user control
 * - More information displayed
 * - Explicit confirmation before actions
 * - Best for new users or skeptics
 */
export const OptionA_Detailed: Story = {
  args: {
    title: 'Option A: Detailed View',
    description: 'Shows all available information upfront with explicit controls.',
    variant: 'detailed',
    onAction: () => console.log('Action clicked'),
  },
};

/**
 * Option B: Balanced approach
 * - Standard information display
 * - Quick actions available
 * - Best for most users
 */
export const OptionB_Default: Story = {
  args: {
    title: 'Option B: Balanced',
    description: 'A balanced approach suitable for most use cases.',
    variant: 'default',
    onAction: () => console.log('Action clicked'),
  },
};

/**
 * Option C: Streamlined experience
 * - Minimal information, maximum efficiency
 * - Trust user to know what they're doing
 * - Best for power users
 */
export const OptionC_Minimal: Story = {
  args: {
    title: 'Option C: Minimal',
    description: 'Streamlined for efficiency.',
    variant: 'minimal',
    onAction: () => console.log('Action clicked'),
  },
};

// ===========================================
// AI STATES - Required for all AI features
// ===========================================

export const Loading: Story = {
  args: {
    title: 'Loading...',
    isLoading: true,
  },
};

export const LoadingLong: Story = {
  args: {
    title: 'Loading...',
    description: 'This is taking longer than expected...',
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Show progress or stages for operations > 3 seconds',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'No Data Yet',
    description: 'Start by adding your first item.',
    variant: 'default',
  },
};

export const Error: Story = {
  args: {
    title: 'Something Went Wrong',
    description: 'We couldn\'t load this data. Try refreshing the page.',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Always provide clear error messages with recovery paths',
      },
    },
  },
};

// ===========================================
// INTERACTIVE STATES
// ===========================================

export const WithAction: Story = {
  args: {
    title: 'Interactive Example',
    description: 'Click the button to trigger an action.',
    variant: 'default',
    onAction: () => alert('Action triggered!'),
  },
};
