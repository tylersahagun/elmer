import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Molecules/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Alert component for displaying important messages and notifications.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'error', 'aurora'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default alert message.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'Your settings have been saved successfully.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your changes have been saved.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Your session will expire in 5 minutes.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'There was a problem processing your request.',
  },
};

export const Aurora: Story = {
  args: {
    variant: 'aurora',
    title: 'New Feature',
    children: 'Check out our latest iteration tools!',
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'info',
    children: 'A simple informational message without a title.',
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'This alert has no icon.',
    hideIcon: true,
  },
};

const DismissibleTemplate = () => {
  const [visible, setVisible] = useState(true);
  
  if (!visible) {
    return (
      <button 
        onClick={() => setVisible(true)}
        className="px-4 py-2 bg-slate-100 rounded-lg text-sm"
      >
        Show Alert
      </button>
    );
  }
  
  return (
    <Alert 
      variant="info" 
      title="Dismissible Alert" 
      onDismiss={() => setVisible(false)}
      className="w-96"
    >
      Click the X to dismiss this alert.
    </Alert>
  );
};

export const Dismissible: Story = {
  render: () => <DismissibleTemplate />,
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert variant="default">Default alert message</Alert>
      <Alert variant="info" title="Info">Information alert with title</Alert>
      <Alert variant="success" title="Success">Success alert with title</Alert>
      <Alert variant="warning" title="Warning">Warning alert with title</Alert>
      <Alert variant="error" title="Error">Error alert with title</Alert>
      <Alert variant="aurora" title="Aurora">elmer themed alert</Alert>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-6 bg-white rounded-xl border border-slate-200">
      <h2 className="text-lg font-semibold">Form Submission</h2>
      
      <Alert variant="error" title="Validation Error">
        Please fix the following errors before submitting:
        <ul className="mt-2 list-disc list-inside text-xs">
          <li>Email is required</li>
          <li>Password must be at least 8 characters</li>
        </ul>
      </Alert>
      
      <div className="space-y-3">
        <input placeholder="Email" className="w-full h-10 px-3 rounded-lg border border-red-300 text-sm" />
        <input placeholder="Password" type="password" className="w-full h-10 px-3 rounded-lg border border-red-300 text-sm" />
      </div>
      
      <button className="w-full h-10 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg">
        Submit
      </button>
    </div>
  ),
};

export const FeatureAnnouncement: Story = {
  render: () => (
    <Alert variant="aurora" className="w-96">
      <div className="space-y-2">
        <h4 className="font-semibold">✨ New: Iteration Loops</h4>
        <p className="text-sm opacity-90">
          Visualize your product development process with our new iteration loop feature.
        </p>
        <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
          Learn more →
        </button>
      </div>
    </Alert>
  ),
};
