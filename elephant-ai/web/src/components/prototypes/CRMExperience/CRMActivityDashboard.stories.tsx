/**
 * CRM Activity Dashboard Stories
 * 
 * Standalone stories for the Activity Dashboard component.
 * For integrated context views, see CRMExperience.context.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CRMActivityDashboard } from './CRMActivityDashboard';
import {
  mockDashboardHealth,
  mockWorkflowRuns,
  mockWorkflowSummaries,
} from './mocks/mockData';

const meta: Meta<typeof CRMActivityDashboard> = {
  title: 'Prototypes/CRMExperience/ActivityDashboard',
  component: CRMActivityDashboard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## CRM Activity Dashboard

Shows workflow execution visibility across all CRM automations. This is **Priority #1** in James's Stack.

### Key Features:
- Health status banner (healthy/warning/error)
- Stats cards (total runs, success rate, failures, pending)
- Filterable activity timeline
- Click any row to see full run details

### Problem It Solves:
> "I would love to be able to see what deals it's run on versus hasn't run on. 
> Wait five minutes, I don't know if it just failed or never hit triggers."

### Integration Location:
New "Activity" tab in the Automations page (\`/workspaces/:workspaceId/workflows?tab=activity\`)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with realistic mock data showing a mix of statuses
 */
export const Default: Story = {};

/**
 * Dashboard when all systems are healthy
 */
export const AllHealthy: Story = {
  args: {
    health: {
      overall: 'healthy',
      message: 'All systems operational',
      details: {
        activeWorkflows: 4,
        recentFailures: 0,
        pendingApprovals: 0,
        avgConfidence: 91,
      },
    },
  },
};

/**
 * Dashboard with critical errors
 */
export const CriticalErrors: Story = {
  args: {
    health: {
      overall: 'error',
      message: '3 workflows have failed in the last hour',
      details: {
        activeWorkflows: 4,
        recentFailures: 5,
        pendingApprovals: 2,
        avgConfidence: 68,
      },
    },
    runs: mockWorkflowRuns.map((run, idx) =>
      idx % 2 === 0
        ? {
            ...run,
            status: 'failed' as const,
            errorMessage: 'HubSpot API rate limit exceeded',
          }
        : run
    ),
  },
};

/**
 * Dashboard with no activity (empty state)
 */
export const EmptyState: Story = {
  args: {
    runs: [],
    health: {
      overall: 'healthy',
      message: 'Ready to process meetings',
      details: {
        activeWorkflows: 2,
        recentFailures: 0,
        pendingApprovals: 0,
        avgConfidence: 0,
      },
    },
  },
};

/**
 * Dashboard with many pending approvals (HITL scenario)
 */
export const ManyPendingApprovals: Story = {
  args: {
    health: {
      ...mockDashboardHealth,
      overall: 'warning',
      message: '12 items awaiting approval',
      details: {
        ...mockDashboardHealth.details,
        pendingApprovals: 12,
      },
    },
    runs: mockWorkflowRuns.map((run) => ({
      ...run,
      status: 'pending' as const,
      fieldUpdates: run.fieldUpdates.map((u) => ({
        ...u,
        confidence: Math.floor(Math.random() * 30) + 35, // Low confidence
        confidenceLevel: 'low' as const,
      })),
    })),
  },
};
