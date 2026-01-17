import type { Meta, StoryObj } from '@storybook/react';
import { RepWorkspaceInPage } from './contexts/RepWorkspaceInPage';
import { RepWorkspaceNavigation } from './contexts/RepWorkspaceNavigation';

/**
 * Context stories showing how Rep Workspace integrates with the AskElephant app.
 *
 * These views demonstrate:
 * - How the workspace appears with navigation sidebar
 * - How global chat integrates with the workspace
 * - The navigation discovery path for users
 */
const meta: Meta<typeof RepWorkspaceInPage> = {
  title: 'Prototypes/RepWorkspace/InContext',
  component: RepWorkspaceInPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Context views showing how Rep Workspace integrates with the AskElephant app navigation and global chat.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RepWorkspaceInPage>;

/**
 * Shows the workspace as a full page with sidebar navigation expanded.
 * This is the primary view users would see after clicking "My Workspace" in the nav.
 */
export const AsFullPage: Story = {
  args: {
    showChat: false,
    sidebarCollapsed: false,
    userName: 'Tyler',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Component rendered as a full page with sidebar navigation. This is the default view when navigating to the workspace.',
      },
    },
  },
};

/**
 * Shows the workspace with the global chat panel open.
 * Demonstrates how rep can access AI assistance while viewing their dashboard.
 */
export const WithGlobalChat: Story = {
  args: {
    showChat: true,
    sidebarCollapsed: false,
    userName: 'Tyler',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Workspace with global chat panel open. Shows the three-column layout: sidebar, workspace, and chat.',
      },
    },
  },
};

/**
 * Shows the workspace with a collapsed sidebar for maximum content space.
 */
export const CollapsedSidebar: Story = {
  args: {
    showChat: false,
    sidebarCollapsed: true,
    userName: 'Tyler',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Workspace with collapsed sidebar. Users can toggle this for more workspace real estate.',
      },
    },
  },
};

/**
 * Shows the workspace with both collapsed sidebar and chat open.
 */
export const CollapsedWithChat: Story = {
  args: {
    showChat: true,
    sidebarCollapsed: true,
    userName: 'Tyler',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Workspace with collapsed sidebar and chat open. Maximizes screen space for content and conversation.',
      },
    },
  },
};

// Navigation Stories using different component
const NavigationMeta: Meta<typeof RepWorkspaceNavigation> = {
  title: 'Prototypes/RepWorkspace/InContext/Navigation',
  component: RepWorkspaceNavigation,
  parameters: {
    layout: 'fullscreen',
  },
};

export const NavigationExpanded: StoryObj<typeof RepWorkspaceNavigation> = {
  render: () => <RepWorkspaceNavigation variant="expanded" highlightWorkspace={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows the "My Workspace" navigation item highlighted in the expanded sidebar. Note the "NEW" badge indicating this is a new feature.',
      },
    },
  },
};

export const NavigationCollapsed: StoryObj<typeof RepWorkspaceNavigation> = {
  render: () => <RepWorkspaceNavigation variant="collapsed" highlightWorkspace={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows the workspace icon selected in the collapsed sidebar view.',
      },
    },
  },
};

export const NavigationComparison: StoryObj<typeof RepWorkspaceNavigation> = {
  render: () => <RepWorkspaceNavigation variant="comparison" highlightWorkspace={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison of navigation states: expanded, collapsed, and with different page selected.',
      },
    },
  },
};
