import type { Meta, StoryObj } from '@storybook/react';
import { RepWorkspaceDashboard } from './RepWorkspaceDashboard';
import { mockActionItems, mockRecentMeetings, mockAccounts, mockAgentActivity } from './mock-data';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof RepWorkspaceDashboard> = {
  title: 'Prototypes/RepWorkspace/Dashboard',
  component: RepWorkspaceDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Rep Workspace Dashboard - A personalized home view for sales representatives showing action items, recent meetings, accounts, and AI agent activity.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    userName: {
      control: 'text',
      description: 'The display name of the current user',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RepWorkspaceDashboard>;

/**
 * Default state with full mock data showing a typical rep's workspace
 */
export const Default: Story = {
  args: {
    userName: 'Tyler',
    onActionItemClick: action('onActionItemClick'),
    onMeetingClick: action('onMeetingClick'),
    onAccountClick: action('onAccountClick'),
    onAgentActivityClick: action('onAgentActivityClick'),
    onViewAllActionItems: action('onViewAllActionItems'),
    onViewAllMeetings: action('onViewAllMeetings'),
    onViewAllAccounts: action('onViewAllAccounts'),
    onViewAllAgentActivity: action('onViewAllAgentActivity'),
    onOpenChat: action('onOpenChat'),
  },
};

/**
 * Morning greeting variant
 */
export const MorningGreeting: Story = {
  args: {
    ...Default.args,
    userName: 'Sarah',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the morning greeting variation based on time of day.',
      },
    },
  },
};

/**
 * Empty state when user has no data yet
 */
export const EmptyState: Story = {
  args: {
    ...Default.args,
    userName: 'New User',
    data: {
      actionItems: [],
      recentMeetings: [],
      accounts: [],
      agentActivity: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the workspace when a new user has no data yet.',
      },
    },
  },
};

/**
 * All caught up - no pending action items
 */
export const AllCaughtUp: Story = {
  args: {
    ...Default.args,
    userName: 'Tyler',
    data: {
      actionItems: mockActionItems.map((item) => ({ ...item, status: 'completed' as const })),
      recentMeetings: mockRecentMeetings,
      accounts: mockAccounts,
      agentActivity: mockAgentActivity,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the workspace when all action items are completed.',
      },
    },
  },
};

/**
 * At Risk Accounts - highlighting accounts that need attention
 */
export const AtRiskAccounts: Story = {
  args: {
    ...Default.args,
    userName: 'Tyler',
    data: {
      actionItems: mockActionItems,
      recentMeetings: mockRecentMeetings,
      accounts: mockAccounts.map((account) => ({
        ...account,
        healthScore: account.id === 'acc-1' ? 'healthy' : 'at_risk',
      })) as typeof mockAccounts,
      agentActivity: mockAgentActivity,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the workspace with multiple at-risk accounts highlighted.',
      },
    },
  },
};

/**
 * Heavy Agent Activity - lots of pending approvals
 */
export const PendingApprovals: Story = {
  args: {
    ...Default.args,
    userName: 'Tyler',
    data: {
      actionItems: mockActionItems,
      recentMeetings: mockRecentMeetings,
      accounts: mockAccounts,
      agentActivity: [
        { ...mockAgentActivity[0], status: 'pending' as const },
        { ...mockAgentActivity[1], status: 'pending' as const },
        { ...mockAgentActivity[2], status: 'pending' as const },
        ...mockAgentActivity.slice(3),
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the workspace with multiple pending agent actions requiring approval.',
      },
    },
  },
};
