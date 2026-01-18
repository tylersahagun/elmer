import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState, NoResults, NoDocuments, NoProjects } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Organisms/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Empty state component for when there is no content to display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const StarIcon = () => (
  <svg className="w-full h-full text-amber-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const Default: Story = {
  args: {
    icon: (
      <svg className="w-full h-full text-slate-300" fill="none" viewBox="0 0 64 64" stroke="currentColor">
        <rect x="12" y="8" width="40" height="48" rx="4" strokeWidth="2" />
        <line x1="20" y1="20" x2="44" y2="20" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="28" x2="44" y2="28" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="36" x2="36" y2="36" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'No items yet',
    description: 'Create your first item to get started with your project.',
  },
};

export const WithAction: Story = {
  args: {
    icon: (
      <svg className="w-full h-full text-slate-300" fill="none" viewBox="0 0 64 64" stroke="currentColor">
        <rect x="12" y="8" width="40" height="48" rx="4" strokeWidth="2" />
        <line x1="20" y1="20" x2="44" y2="20" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="28" x2="44" y2="28" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'No documents',
    description: 'Get started by creating your first document.',
    action: (
      <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
        Create Document
      </button>
    ),
  },
};

export const WithBothActions: Story = {
  args: {
    title: 'No projects found',
    description: 'Create a new project or import an existing one.',
    action: (
      <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
        New Project
      </button>
    ),
    secondaryAction: (
      <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
        Import
      </button>
    ),
  },
};

export const Small: Story = {
  args: {
    title: 'No notifications',
    description: "You're all caught up!",
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    icon: <StarIcon />,
    title: 'Welcome to elmer',
    description: 'Start your product management journey by creating your first initiative.',
    size: 'lg',
    action: (
      <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg font-medium">
        Get Started
      </button>
    ),
  },
};

export const SearchNoResults: Story = {
  render: () => (
    <div className="w-96 border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <input
          placeholder="Search..."
          defaultValue="xyznonexistent"
          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
        />
      </div>
      <NoResults
        action={
          <button className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium">
            Clear search
          </button>
        }
      />
    </div>
  ),
};

export const PrebuiltVariants: Story = {
  render: () => (
    <div className="space-y-8 w-96">
      <div className="border border-slate-200 rounded-xl">
        <NoResults />
      </div>
      <div className="border border-slate-200 rounded-xl">
        <NoDocuments 
          action={
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
              Create Document
            </button>
          }
        />
      </div>
      <div className="border border-slate-200 rounded-xl">
        <NoProjects 
          action={
            <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
              New Project
            </button>
          }
        />
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-96 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
      <EmptyState
        size="sm"
        title="No activity yet"
        description="Activity from your team will appear here."
      />
    </div>
  ),
};

export const WelcomeOnboarding: Story = {
  render: () => (
    <div className="w-[500px] p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200">
      <EmptyState
        size="lg"
        icon={
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        }
        title="Welcome to elmer"
        description="The PM workspace that helps you iterate faster. Create your first initiative to get started."
        action={
          <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow">
            Create Initiative
          </button>
        }
        secondaryAction={
          <button className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">
            Take a Tour
          </button>
        }
      />
    </div>
  ),
};
