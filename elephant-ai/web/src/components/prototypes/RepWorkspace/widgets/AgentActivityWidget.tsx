import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BotIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentActivity } from '../types';

interface AgentActivityWidgetProps {
  activities: AgentActivity[];
  onActivityClick?: (activity: AgentActivity) => void;
  onViewAll?: () => void;
  className?: string;
}

export function AgentActivityWidget({
  activities,
  onActivityClick,
  onViewAll,
  className,
}: AgentActivityWidgetProps) {
  const displayActivities = activities.slice(0, 5);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: AgentActivity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2Icon className="size-4 text-emerald-500" />;
      case 'pending':
        return <ClockIcon className="size-4 text-amber-500" />;
      case 'failed':
        return <XCircleIcon className="size-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: AgentActivity['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="h-5 text-[10px] px-1.5 border-emerald-300 text-emerald-700 bg-emerald-50"
          >
            Done
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="h-5 text-[10px] px-1.5 border-amber-300 text-amber-700 bg-amber-50"
          >
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
            Failed
          </Badge>
        );
    }
  };

  const pendingCount = activities.filter((a) => a.status === 'pending').length;

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <BotIcon className="size-5 text-cyan-600" />
          <CardTitle className="text-base font-semibold">Agent Activity</CardTitle>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 text-xs">
            View all
            <ArrowRightIcon className="ml-1 size-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <BotIcon className="size-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">No agent activity</p>
            <p className="text-xs text-muted-foreground">
              AI agent actions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => onActivityClick?.(activity)}
                className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.action}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{activity.target}</span>
                    {activity.details && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {activity.details}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {activity.status === 'pending' && getStatusBadge(activity.status)}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
