import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowRightIcon, PlayCircleIcon, SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentMeeting } from '../types';

interface RecentMeetingsWidgetProps {
  meetings: RecentMeeting[];
  onMeetingClick?: (meeting: RecentMeeting) => void;
  onViewAll?: () => void;
  className?: string;
}

export function RecentMeetingsWidget({
  meetings,
  onMeetingClick,
  onViewAll,
  className,
}: RecentMeetingsWidgetProps) {
  const displayMeetings = meetings.slice(0, 4);

  const formatMeetingTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-blue-600" />
          <CardTitle className="text-base font-semibold">Recent Meetings</CardTitle>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 text-xs">
            View all
            <ArrowRightIcon className="ml-1 size-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-1 pt-0">
        {displayMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <CalendarIcon className="size-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">No recent meetings</p>
            <p className="text-xs text-muted-foreground">
              Your recorded meetings will appear here
            </p>
          </div>
        ) : (
          displayMeetings.map((meeting) => (
            <button
              key={meeting.id}
              onClick={() => onMeetingClick?.(meeting)}
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
                  {formatMeetingTime(meeting.date)}
                </p>
                {meeting.keyInsight && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <SparklesIcon className="size-3 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {meeting.keyInsight}
                    </p>
                  </div>
                )}
              </div>
              {meeting.company && (
                <Badge variant="outline" className="h-5 text-[10px] px-1.5 shrink-0">
                  {meeting.company}
                </Badge>
              )}
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
