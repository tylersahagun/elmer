'use client';

import * as React from 'react';
import { ArrowUpRight, X, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { NotificationType, NotificationPriority } from '@/lib/db/schema';

// Types
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  priority: NotificationPriority;
  isUnread: boolean;
  projectName?: string;
  actionLabel?: string | null;
  actionType?: string | null;
}

interface AnimatedNotificationListProps {
  notifications: NotificationItem[];
  onNotificationClick?: (id: string) => void;
  onNotificationAction?: (id: string) => void;
  onNotificationDismiss?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
  maxVisible?: number;
}

const transition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
};

const getCardVariants = (i: number) => ({
  collapsed: {
    marginTop: i === 0 ? 0 : -48,
    scaleX: 1 - i * 0.04,
    opacity: 1 - i * 0.15,
  },
  expanded: {
    marginTop: i === 0 ? 0 : 8,
    scaleX: 1,
    opacity: 1,
  },
});

const textSwitchTransition: Transition = {
  duration: 0.22,
  ease: 'easeInOut',
};

const notificationTextVariants = {
  collapsed: { opacity: 1, y: 0, pointerEvents: 'auto' as const },
  expanded: { opacity: 0, y: -16, pointerEvents: 'none' as const },
};

const viewAllTextVariants = {
  collapsed: { opacity: 0, y: 16, pointerEvents: 'none' as const },
  expanded: { opacity: 1, y: 0, pointerEvents: 'auto' as const },
};

// Priority colors
const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  urgent: 'bg-red-500/20 text-red-400',
};

// Type colors
const typeColors: Record<NotificationType, string> = {
  job_failed: 'border-l-red-400',
  job_completed: 'border-l-emerald-400',
  missing_transcript: 'border-l-amber-400',
  missing_document: 'border-l-amber-400',
  approval_required: 'border-l-blue-400',
  jury_failed: 'border-l-orange-400',
  integration_error: 'border-l-red-400',
  stage_blocked: 'border-l-purple-400',
  action_required: 'border-l-cyan-400',
};

function AnimatedNotificationList({
  notifications,
  onNotificationClick,
  onNotificationAction,
  onNotificationDismiss,
  onViewAll,
  className,
  maxVisible = 4,
}: AnimatedNotificationListProps) {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const unreadCount = notifications.filter(n => n.isUnread).length;

  if (notifications.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground text-sm', className)}>
        No notifications
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'bg-slate-100/90 dark:bg-slate-900/90 p-3 rounded-2xl space-y-3 shadow-lg backdrop-blur-xl border border-white/10',
        className
      )}
      initial="collapsed"
      whileHover="expanded"
    >
      <div className="relative">
        <AnimatePresence>
          {visibleNotifications.map((notification, i) => (
            <motion.div
              key={notification.id}
              className={cn(
                'bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200 relative border-l-2',
                typeColors[notification.type] || 'border-l-gray-400',
                notification.isUnread && 'ring-1 ring-purple-500/20'
              )}
              variants={getCardVariants(i)}
              transition={transition}
              style={{
                zIndex: visibleNotifications.length - i,
              }}
              onClick={() => onNotificationClick?.(notification.id)}
            >
              {/* Dismiss button */}
              {onNotificationDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotificationDismiss(notification.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}

              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      'text-sm font-medium truncate',
                      notification.isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {notification.title}
                    </h3>
                    {notification.priority !== 'medium' && (
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0',
                        priorityColors[notification.priority]
                      )}>
                        {notification.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {notification.message}
                  </p>
                </div>
                {notification.isUnread && (
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  <span>{notification.time}</span>
                  {notification.projectName && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-purple-500 dark:text-purple-400">{notification.projectName}</span>
                    </>
                  )}
                </div>

                {notification.actionLabel && onNotificationAction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNotificationAction(notification.id);
                    }}
                  >
                    {notification.actionType === 'retry' && <RefreshCw className="w-2.5 h-2.5 mr-1" />}
                    {notification.actionType === 'navigate' && <ExternalLink className="w-2.5 h-2.5 mr-1" />}
                    {notification.actionType === 'approve' && <Check className="w-2.5 h-2.5 mr-1" />}
                    {notification.actionLabel}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer with count and view all */}
      <div className="flex items-center gap-2 pt-1">
        <div className={cn(
          'min-w-5 h-5 px-1.5 rounded-full text-white text-xs flex items-center justify-center font-medium',
          unreadCount > 0 ? 'bg-purple-500' : 'bg-slate-400'
        )}>
          {unreadCount > 0 ? unreadCount : notifications.length}
        </div>
        <span className="grid flex-1">
          <motion.span
            className="text-sm font-medium text-slate-600 dark:text-slate-300 row-start-1 col-start-1"
            variants={notificationTextVariants}
            transition={textSwitchTransition}
          >
            {unreadCount > 0 ? `${unreadCount} unread` : 'Notifications'}
          </motion.span>
          <motion.span
            className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1 cursor-pointer select-none row-start-1 col-start-1"
            variants={viewAllTextVariants}
            transition={textSwitchTransition}
            onClick={onViewAll}
          >
            View all <ArrowUpRight className="size-4" />
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
}

export { AnimatedNotificationList, type NotificationItem, type AnimatedNotificationListProps };
