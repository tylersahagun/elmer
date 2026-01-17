/**
 * Rep Workspace Dashboard V2
 * 
 * Iteration based on jury feedback (45% pass rate):
 * - Added trust indicators and data provenance
 * - Added onboarding flow for first-time users
 * - Clearer value proposition for skeptics
 * - Progressive disclosure
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckSquare2Icon,
  CalendarIcon,
  BuildingIcon,
  BotIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MessageCircleIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SyncStatusBadge,
  DataProvenancePopover,
  GlobalStatusBar,
  ACTION_ITEMS_SOURCES,
  MEETINGS_SOURCES,
  ACCOUNTS_SOURCES,
  AGENT_ACTIVITY_SOURCES,
  type SyncStatus,
} from './TrustIndicators';
import type { ActionItem, RecentMeeting, Account, AgentActivity } from '../types';
import {
  mockActionItems,
  mockRecentMeetings,
  mockAccounts,
  mockAgentActivity,
} from '../mock-data';

interface RepWorkspaceDashboardV2Props {
  userName?: string;
  showOnboarding?: boolean;
  globalSyncStatus?: 'all-connected' | 'partial' | 'error';
  lastGlobalSync?: string;
  widgetSyncStatuses?: {
    actionItems?: SyncStatus;
    meetings?: SyncStatus;
    accounts?: SyncStatus;
    agentActivity?: SyncStatus;
  };
  onOpenChat?: () => void;
  onViewAllActionItems?: () => void;
  onViewAllMeetings?: () => void;
  onViewAllAccounts?: () => void;
  onViewAllAgentActivity?: () => void;
}

export function RepWorkspaceDashboardV2({
  userName = 'there',
  globalSyncStatus = 'all-connected',
  lastGlobalSync = '2 min ago',
  widgetSyncStatuses = {
    actionItems: 'live',
    meetings: 'synced',
    accounts: 'synced',
    agentActivity: 'live',
  },
  onOpenChat,
  onViewAllActionItems,
  onViewAllMeetings,
  onViewAllAccounts,
  onViewAllAgentActivity,
}: RepWorkspaceDashboardV2Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const actionItems = mockActionItems;
  const recentMeetings = mockRecentMeetings;
  const accounts = mockAccounts;
  const agentActivity = mockAgentActivity;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {getGreeting()}, {userName} 👋
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {pendingTasks > 0 ? (
                <>
                  You have{' '}
                  <span className="font-medium text-amber-600">
                    {pendingTasks} action items
                  </span>{' '}
                  waiting for you
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

        {/* Global Status Bar - NEW in V2 */}
        <GlobalStatusBar
          status={globalSyncStatus}
          lastSync={lastGlobalSync}
          onViewLogs={() => console.log('View logs')}
        />
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
          {/* Action Items Widget with Trust Indicators */}
          <Card className="min-h-[280px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare2Icon className="size-5 text-amber-600" />
                <CardTitle className="text-base font-semibold">Action Items</CardTitle>
                {pendingTasks > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {pendingTasks}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <SyncStatusBadge status={widgetSyncStatuses.actionItems || 'live'} />
                <DataProvenancePopover
                  sources={ACTION_ITEMS_SOURCES}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
                {onViewAllActionItems && (
                  <Button variant="ghost" size="sm" onClick={onViewAllActionItems} className="h-7 text-xs">
                    View all
                    <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {actionItems.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                >
                  <Checkbox className="mt-0.5 size-4 rounded" checked={item.status === 'completed'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{item.meetingTitle}</span>
                      {item.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="size-3" />
                          {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.priority === 'high' && (
                    <Badge variant="destructive" className="h-5 text-[10px] px-1.5 shrink-0">
                      Urgent
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Meetings Widget with Trust Indicators */}
          <Card className="min-h-[280px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Recent Meetings</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <SyncStatusBadge status={widgetSyncStatuses.meetings || 'synced'} lastSync="< 1 min" />
                <DataProvenancePopover
                  sources={MEETINGS_SOURCES}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
                {onViewAllMeetings && (
                  <Button variant="ghost" size="sm" onClick={onViewAllMeetings} className="h-7 text-xs">
                    View all
                    <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {recentMeetings.slice(0, 4).map((meeting) => (
                <button
                  key={meeting.id}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                >
                  <div className="size-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    {meeting.hasRecording ? (
                      <PlayCircleIcon className="size-5 text-white" />
                    ) : (
                      <CalendarIcon className="size-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(meeting.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    {meeting.keyInsight && (
                      <div className="flex items-start gap-1.5 mt-1.5">
                        <SparklesIcon className="size-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground line-clamp-1">{meeting.keyInsight}</p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* My Accounts Widget with Trust Indicators */}
          <Card className="min-h-[280px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <BuildingIcon className="size-5 text-violet-600" />
                <CardTitle className="text-base font-semibold">My Accounts</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <SyncStatusBadge status={widgetSyncStatuses.accounts || 'synced'} lastSync="5 min ago" />
                <DataProvenancePopover
                  sources={ACCOUNTS_SOURCES}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
                {onViewAllAccounts && (
                  <Button variant="ghost" size="sm" onClick={onViewAllAccounts} className="h-7 text-xs">
                    View all
                    <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {accounts.slice(0, 4).map((account) => (
                <button
                  key={account.id}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                >
                  <div className="size-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{account.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                        {account.name}
                      </p>
                      {account.healthScore === 'critical' && <AlertCircleIcon className="size-4 text-red-500" />}
                      {account.healthScore === 'at_risk' && <AlertTriangleIcon className="size-4 text-amber-500" />}
                      {account.healthScore === 'healthy' && <TrendingUpIcon className="size-4 text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{account.meetingCount} meetings</span>
                      {account.dealValue && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs font-medium text-foreground">
                            ${(account.dealValue / 1000).toFixed(0)}K
                          </span>
                        </>
                      )}
                      {account.dealStage && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{account.dealStage}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Agent Activity Widget with Trust Indicators */}
          <Card className="min-h-[280px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <BotIcon className="size-5 text-cyan-600" />
                <CardTitle className="text-base font-semibold">Agent Activity</CardTitle>
                {agentActivity.filter((a) => a.status === 'pending').length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {agentActivity.filter((a) => a.status === 'pending').length} pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <SyncStatusBadge status={widgetSyncStatuses.agentActivity || 'live'} />
                <DataProvenancePopover
                  sources={AGENT_ACTIVITY_SOURCES}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
                {onViewAllAgentActivity && (
                  <Button variant="ghost" size="sm" onClick={onViewAllAgentActivity} className="h-7 text-xs">
                    View all
                    <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {agentActivity.slice(0, 5).map((activity) => (
                <button
                  key={activity.id}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                >
                  <div className="mt-0.5">
                    {activity.status === 'completed' && <CheckCircle2Icon className="size-4 text-emerald-500" />}
                    {activity.status === 'pending' && <ClockIcon className="size-4 text-amber-500" />}
                    {activity.status === 'failed' && <XCircleIcon className="size-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{activity.action}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{activity.target}</span>
                      {activity.details && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground truncate">{activity.details}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.status === 'pending' && (
                    <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-amber-300 text-amber-700 bg-amber-50">
                      Review
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
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
