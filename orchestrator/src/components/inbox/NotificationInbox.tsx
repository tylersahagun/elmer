"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  AlertCircle,
  FileQuestion,
  FileX,
  ShieldCheck,
  Gavel,
  Unplug,
  Lock,
  Info,
  RefreshCw,
  ExternalLink,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { NotificationType, NotificationPriority, NotificationStatus } from "@/lib/db/schema";

// Types
interface NotificationProject {
  id: string;
  name: string;
}

interface NotificationJob {
  id: string;
  type: string;
  status: string;
}

interface Notification {
  id: string;
  workspaceId: string;
  projectId: string | null;
  jobId: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  actionType: string | null;
  actionLabel: string | null;
  actionUrl: string | null;
  actionData: Record<string, unknown> | null;
  metadata: {
    errorDetails?: string;
    suggestedFix?: string;
    relatedEntity?: {
      type: string;
      id: string;
      name?: string;
    };
    context?: Record<string, unknown>;
  } | null;
  readAt: Date | null;
  actionedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  project: NotificationProject | null;
  job: NotificationJob | null;
}

interface JobSummary {
  pending: number;
  running: number;
}

interface NotificationInboxProps {
  workspaceId: string;
  jobSummary?: JobSummary;
  onNavigate?: (url: string) => void;
}

// Icon mapping for notification types
const notificationIcons: Record<NotificationType, typeof AlertCircle> = {
  job_failed: AlertTriangle,
  job_completed: Sparkles,
  missing_transcript: FileQuestion,
  missing_document: FileX,
  approval_required: ShieldCheck,
  jury_failed: Gavel,
  integration_error: Unplug,
  stage_blocked: Lock,
  action_required: Info,
};

// Color mapping for notification types
const notificationColors: Record<NotificationType, string> = {
  job_failed: "text-red-400",
  job_completed: "text-emerald-400",
  missing_transcript: "text-amber-400",
  missing_document: "text-amber-400",
  approval_required: "text-blue-400",
  jury_failed: "text-orange-400",
  integration_error: "text-red-400",
  stage_blocked: "text-purple-400",
  action_required: "text-cyan-400",
};

// Priority badge colors
const priorityColors: Record<NotificationPriority, string> = {
  low: "bg-slate-500/20 text-slate-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-amber-500/20 text-amber-400",
  urgent: "bg-red-500/20 text-red-400",
};

export function NotificationInbox({ 
  workspaceId, 
  jobSummary = { pending: 0, running: 0 },
  onNavigate 
}: NotificationInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?workspaceId=${workspaceId}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!workspaceId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ["notifications-count", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?workspaceId=${workspaceId}&countOnly=true`);
      if (!res.ok) throw new Error("Failed to fetch count");
      return res.json();
    },
    enabled: !!workspaceId,
    refetchInterval: 10000, // Refetch count more frequently
  });

  const unreadCount = countData?.count ?? 0;
  const hasActivity = jobSummary.pending > 0 || jobSummary.running > 0;
  const totalBadgeCount = unreadCount + (hasActivity ? 1 : 0);

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count", workspaceId] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/notifications?workspaceId=${workspaceId}&action=markAllRead`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count", workspaceId] });
    },
  });

  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      if (!res.ok) throw new Error("Failed to dismiss");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count", workspaceId] });
    },
  });

  // Handle notification action
  const handleAction = useCallback((notification: Notification) => {
    // Mark as actioned
    markReadMutation.mutate(notification.id);

    // Navigate if URL is provided
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  }, [markReadMutation, onNavigate]);

  // Handle notification click (mark as read)
  const handleClick = useCallback((notification: Notification) => {
    if (notification.status === "unread") {
      markReadMutation.mutate(notification.id);
    }
  }, [markReadMutation]);

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Filter visible notifications (unread + recent read)
  const visibleNotifications = notifications.filter(
    (n) => n.status === "unread" || n.status === "read"
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className={cn(
            "w-4 h-4 transition-colors",
            totalBadgeCount > 0 && "text-purple-400"
          )} />
          
          {/* Badge */}
          <AnimatePresence>
            {totalBadgeCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
                  "rounded-full text-[10px] font-semibold",
                  "flex items-center justify-center",
                  hasActivity 
                    ? "bg-purple-500 text-white" 
                    : "bg-red-500 text-white"
                )}
              >
                {totalBadgeCount > 9 ? "9+" : totalBadgeCount}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse for running jobs */}
          {jobSummary.running > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-400/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] p-0 backdrop-blur-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-white/20 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500 dark:text-purple-400" />
            <span className="font-medium text-slate-900 dark:text-white">Inbox</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 dark:bg-purple-500/20 text-emerald-600 dark:text-purple-400 text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="text-xs text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Job Status Section (if active) */}
        <AnimatePresence>
          {hasActivity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-slate-200/60 dark:border-white/10"
            >
              <div className="px-4 py-3 bg-emerald-50/80 dark:bg-purple-500/10">
                <div className="flex items-center gap-3">
                  {jobSummary.running > 0 ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-5 h-5 text-emerald-500 dark:text-purple-400" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-purple-300">
                          Processing {jobSummary.running} job{jobSummary.running > 1 ? "s" : ""}
                        </p>
                        {jobSummary.pending > 0 && (
                          <p className="text-xs text-emerald-600/70 dark:text-purple-400/70">
                            {jobSummary.pending} more queued
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          {jobSummary.pending} job{jobSummary.pending > 1 ? "s" : ""} queued
                        </p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                          Waiting to process
                        </p>
                      </div>
                    </>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400/70">LIVE</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications List */}
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="py-1">
              {visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleClick}
                  onAction={handleAction}
                  onDismiss={(id) => dismissMutation.mutate(id)}
                  formatRelativeTime={formatRelativeTime}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {visibleNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-slate-200/60 dark:bg-white/10" />
            <div className="px-4 py-2 text-center bg-white/30 dark:bg-white/5">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                onClick={() => {
                  // TODO: Navigate to full inbox page
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Individual notification item component
interface NotificationItemProps {
  notification: Notification;
  onClick: (n: Notification) => void;
  onAction: (n: Notification) => void;
  onDismiss: (id: string) => void;
  formatRelativeTime: (date: Date) => string;
}

function NotificationItem({ 
  notification, 
  onClick, 
  onAction, 
  onDismiss,
  formatRelativeTime 
}: NotificationItemProps) {
  const Icon = notificationIcons[notification.type] || Info;
  const iconColor = notificationColors[notification.type] || "text-gray-400";
  const isUnread = notification.status === "unread";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative px-4 py-3 cursor-pointer transition-colors",
        "hover:bg-slate-200/50 dark:hover:bg-white/5",
        isUnread && "bg-emerald-50/60 dark:bg-purple-500/5"
      )}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          "bg-slate-200/80 dark:bg-white/5"
        )}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isUnread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-white/80"
                )}>
                  {notification.title}
                </p>
              {notification.priority !== "medium" && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-medium",
                  priorityColors[notification.priority]
                )}>
                  {notification.priority}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>

          {/* Project context */}
          {notification.project && (
            <p className="text-[10px] text-emerald-600/70 dark:text-purple-400/70 mt-1">
              {notification.project.name}
            </p>
          )}

          {/* Action button */}
          {notification.actionLabel && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs bg-slate-200/80 dark:bg-white/5 hover:bg-slate-300/80 dark:hover:bg-white/10 text-slate-700 dark:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onAction(notification);
              }}
            >
              {notification.actionType === "retry" && (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              {notification.actionType === "navigate" && (
                <ExternalLink className="w-3 h-3 mr-1" />
              )}
              {notification.actionType === "approve" && (
                <Check className="w-3 h-3 mr-1" />
              )}
              {notification.actionLabel}
            </Button>
          )}
        </div>

        {/* Unread indicator */}
        {isUnread && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-purple-400" />
        )}

        {/* Dismiss button (on hover) */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100",
            "transition-opacity"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}
