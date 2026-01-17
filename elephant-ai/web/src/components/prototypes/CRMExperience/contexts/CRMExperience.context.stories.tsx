/**
 * CRM Experience Context Stories
 * 
 * Shows how CRM features integrate with the actual AskElephant app UI.
 * These stories use fullscreen layout to demonstrate the full experience.
 * 
 * Compare with standalone stories:
 * - Standalone: `Prototypes/CRMExperience/ActivityDashboard`
 * - Standalone: `Prototypes/CRMExperience/ManualEnrollmentPanel`
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ActivityInAutomationsPage } from './ActivityInAutomationsPage';
import { TestPanelInWorkflowDetail } from './TestPanelInWorkflowDetail';

// Activity Dashboard in Automations Page
const activityMeta: Meta<typeof ActivityInAutomationsPage> = {
  title: 'Prototypes/CRMExperience/InContext',
  component: ActivityInAutomationsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## CRM Experience - In Context Views

These stories show how CRM features integrate with the existing AskElephant app.

### Placement Decision

| Component | Integration | Location |
|-----------|-------------|----------|
| Activity Dashboard | New Tab | Automations page, alongside Workflows/Prompts/Signals/Tags |
| Manual Test Panel | Side Panel | Workflow detail page, triggered by "Test" button |

### Why These Locations?

**Activity Dashboard as Tab:**
- Users already go to Automations to manage workflows
- Activity is directly related to workflow operations
- Pattern consistency with other tabs (Signals, Tags)
- One click to switch between configuration and monitoring

**Test Panel as Side Panel:**
- Keeps workflow visible while testing
- Follows existing run steps drawer pattern
- Space for before/after field comparisons
- Supports iterative test → adjust → test workflow
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default activityMeta;
type ActivityStory = StoryObj<typeof activityMeta>;

/**
 * Activity Dashboard shown as a new tab within the Automations page.
 * This is the primary integration for Priority #1 (Workflow Visibility).
 * 
 * Note the "Activity" tab with badge showing pending approvals.
 */
export const ActivityTabInAutomations: ActivityStory = {
  args: {
    defaultTab: 'activity',
  },
  parameters: {
    docs: {
      description: {
        story: `
Shows the Activity Dashboard integrated as a new tab in the Automations page.

**Key integration points:**
- New "Activity" tab in the header tabs
- Badge shows pending approval count
- Dashboard content replaces page body when tab is active
- Navigation sidebar shows "Automations" as active
        `,
      },
    },
  },
};

/**
 * Same integration, but showing the Workflows tab for comparison.
 * Demonstrates how users switch between configuration and monitoring.
 */
export const WorkflowsTabForComparison: ActivityStory = {
  args: {
    defaultTab: 'workflows',
  },
  parameters: {
    docs: {
      description: {
        story: `
The existing Workflows tab, showing how the Activity tab fits alongside it.

**Navigation flow:**
1. User opens Automations page
2. Default view is Workflows tab (existing behavior)
3. User clicks Activity tab to see CRM agent activity
4. Badge on Activity tab draws attention to pending approvals
        `,
      },
    },
  },
};

// Test Panel in Workflow Detail Page
const testPanelMeta: Meta<typeof TestPanelInWorkflowDetail> = {
  title: 'Prototypes/CRMExperience/InContext',
  component: TestPanelInWorkflowDetail,
  parameters: {
    layout: 'fullscreen',
  },
};

export const TestPanelMeta = testPanelMeta;
type TestPanelStory = StoryObj<typeof testPanelMeta>;

/**
 * Workflow detail page with the new "Test" button in the header.
 * Clicking opens the Manual Enrollment Panel as a side sheet.
 */
export const TestButtonInWorkflowDetail: TestPanelStory = {
  args: {
    workflowName: 'Discovery Call Notes',
    showTestPanel: false,
  },
  parameters: {
    docs: {
      description: {
        story: `
Shows the workflow detail page with the new "Test" button.

**Key integration points:**
- New "Test" button in workflow header actions
- Button uses lab icon (Beaker) to indicate testing
- Positioned alongside History and Settings buttons
- Clicking opens the Manual Enrollment Panel
        `,
      },
    },
  },
};

/**
 * Workflow detail page with the test panel already open.
 * Shows the side-by-side layout for iterative testing.
 */
export const TestPanelOpen: TestPanelStory = {
  args: {
    workflowName: 'Close Won/Loss Analytics',
    showTestPanel: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Shows the test panel open alongside the workflow canvas.

**Key UX decisions:**
- Panel slides in from right (Sheet component)
- Workflow canvas remains visible in background
- User can test → close panel → adjust workflow → test again
- Panel width allows for field comparison display
        `,
      },
    },
  },
};

/**
 * Different workflow showing the test feature is available everywhere
 */
export const TestPanelContactEnrichment: TestPanelStory = {
  args: {
    workflowName: 'Contact Enrichment',
    showTestPanel: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Test panel for a different workflow type (Contact Enrichment).

This demonstrates that the test feature works for any workflow,
not just deal-related workflows.
        `,
      },
    },
  },
};
