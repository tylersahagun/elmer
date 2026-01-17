import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare2Icon, ArrowRightIcon, ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActionItem } from '../types';

interface ActionItemsWidgetProps {
  items: ActionItem[];
  onItemClick?: (item: ActionItem) => void;
  onViewAll?: () => void;
  className?: string;
}

export function ActionItemsWidget({
  items,
  onItemClick,
  onViewAll,
  className,
}: ActionItemsWidgetProps) {
  const pendingItems = items.filter((item) => item.status !== 'completed');
  const displayItems = pendingItems.slice(0, 4);

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare2Icon className="size-5 text-amber-600" />
          <CardTitle className="text-base font-semibold">Action Items</CardTitle>
          {pendingItems.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {pendingItems.length}
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
      <CardContent className="flex-1 space-y-1 pt-0">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <CheckSquare2Icon className="size-10 text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground">No pending action items</p>
          </div>
        ) : (
          displayItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
            >
              <Checkbox
                className="mt-0.5 size-4 rounded"
                checked={item.status === 'completed'}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">
                    {item.meetingTitle}
                  </span>
                  {item.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="size-3" />
                      {new Date(item.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
