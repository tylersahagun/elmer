// Rep Workspace Prototype
// A personalized dashboard for sales representatives

export { RepWorkspaceDashboard } from './RepWorkspaceDashboard';
export type {
  RepWorkspaceData,
  ActionItem,
  RecentMeeting,
  Account,
  AgentActivity,
} from './types';

// Widgets
export {
  ActionItemsWidget,
  RecentMeetingsWidget,
  AccountsWidget,
  AgentActivityWidget,
} from './widgets';

// Context Views (for demonstrating integration)
export {
  MockSidebar,
  MockGlobalChat,
  RepWorkspaceInPage,
  RepWorkspaceNavigation,
} from './contexts';
