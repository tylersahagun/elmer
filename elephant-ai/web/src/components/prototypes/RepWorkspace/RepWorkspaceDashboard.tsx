import { Button } from '@/components/ui/button';
import { MessageCircleIcon, SparklesIcon } from 'lucide-react';
import {
  ActionItemsWidget,
  RecentMeetingsWidget,
  AccountsWidget,
  AgentActivityWidget,
} from './widgets';
import type { RepWorkspaceData, ActionItem, RecentMeeting, Account, AgentActivity } from './types';
import {
  mockActionItems,
  mockRecentMeetings,
  mockAccounts,
  mockAgentActivity,
} from './mock-data';

interface RepWorkspaceDashboardProps {
  /** Override mock data for demos */
  data?: RepWorkspaceData;
  /** User's display name */
  userName?: string;
  /** Callback when action item is clicked */
  onActionItemClick?: (item: ActionItem) => void;
  /** Callback when meeting is clicked */
  onMeetingClick?: (meeting: RecentMeeting) => void;
  /** Callback when account is clicked */
  onAccountClick?: (account: Account) => void;
  /** Callback when agent activity is clicked */
  onAgentActivityClick?: (activity: AgentActivity) => void;
  /** Callback when view all action items */
  onViewAllActionItems?: () => void;
  /** Callback when view all meetings */
  onViewAllMeetings?: () => void;
  /** Callback when view all accounts */
  onViewAllAccounts?: () => void;
  /** Callback when view all agent activity */
  onViewAllAgentActivity?: () => void;
  /** Callback when global chat button is clicked */
  onOpenChat?: () => void;
}

export function RepWorkspaceDashboard({
  data,
  userName = 'there',
  onActionItemClick,
  onMeetingClick,
  onAccountClick,
  onAgentActivityClick,
  onViewAllActionItems,
  onViewAllMeetings,
  onViewAllAccounts,
  onViewAllAgentActivity,
  onOpenChat,
}: RepWorkspaceDashboardProps) {
  const actionItems = data?.actionItems ?? mockActionItems;
  const recentMeetings = data?.recentMeetings ?? mockRecentMeetings;
  const accounts = data?.accounts ?? mockAccounts;
  const agentActivity = data?.agentActivity ?? mockAgentActivity;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pendingTasks = actionItems.filter((item) => item.status !== 'completed').length;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <header className="px-8 py-6 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {getGreeting()}, {userName} 👋
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {pendingTasks > 0 ? (
                <>
                  You have <span className="font-medium text-amber-600">{pendingTasks} action items</span> waiting for you
                </>
              ) : (
                "You're all caught up! Great work."
              )}
            </p>
          </div>
          <Button
            onClick={onOpenChat}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200"
          >
            <SparklesIcon className="size-4" />
            Ask Elephant
          </Button>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
          {/* Action Items - Top Left */}
          <ActionItemsWidget
            items={actionItems}
            onItemClick={onActionItemClick}
            onViewAll={onViewAllActionItems}
            className="min-h-[280px] shadow-sm"
          />

          {/* Recent Meetings - Top Right */}
          <RecentMeetingsWidget
            meetings={recentMeetings}
            onMeetingClick={onMeetingClick}
            onViewAll={onViewAllMeetings}
            className="min-h-[280px] shadow-sm"
          />

          {/* My Accounts - Bottom Left */}
          <AccountsWidget
            accounts={accounts}
            onAccountClick={onAccountClick}
            onViewAll={onViewAllAccounts}
            className="min-h-[280px] shadow-sm"
          />

          {/* Agent Activity - Bottom Right */}
          <AgentActivityWidget
            activities={agentActivity}
            onActivityClick={onAgentActivityClick}
            onViewAll={onViewAllAgentActivity}
            className="min-h-[280px] shadow-sm"
          />
        </div>

        {/* Quick Chat Prompt */}
        <div className="max-w-7xl mx-auto mt-6">
          <button
            onClick={onOpenChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-200 transition-all group shadow-sm"
          >
            <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <MessageCircleIcon className="size-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-slate-500 group-hover:text-slate-700">
                Ask anything about your deals, meetings, or customers...
              </p>
            </div>
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>
        </div>
      </main>
    </div>
  );
}
