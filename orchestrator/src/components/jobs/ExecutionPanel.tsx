"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Terminal,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
}

interface ExecutionPanelProps {
  jobId: string;
  jobType: string;
  projectName?: string;
  onClose?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ExecutionPanel({
  jobId,
  jobType,
  projectName,
  onClose,
  onRetry,
  onCancel,
  className,
}: ExecutionPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<"pending" | "running" | "completed" | "failed" | "cancelled">("pending");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE endpoint
  useEffect(() => {
    if (!jobId) return;

    const connect = () => {
      const eventSource = new EventSource(`/api/jobs/${jobId}/logs`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "initial":
              setStatus(data.job.status);
              setProgress(data.job.progress || 0);
              if (data.job.error) setError(data.job.error);
              break;

            case "log":
              setLogs((prev) => [
                ...prev,
                {
                  timestamp: data.timestamp,
                  level: data.level,
                  message: data.message,
                  data: data.data,
                },
              ]);
              break;

            case "status":
              setStatus(data.status);
              setProgress(data.progress || 0);
              break;

            case "finished":
              setStatus(data.status);
              if (data.error) setError(data.error);
              eventSource.close();
              break;
          }
        } catch {
          console.error("Failed to parse SSE message");
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
        // Reconnect after 3 seconds if job is still running
        if (status === "running" || status === "pending") {
          setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [jobId, status]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    setAutoScroll(isAtBottom);
  }, []);

  const formatJobType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "running":
        return "Executing...";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-amber-400";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn("w-full max-w-2xl", className)}
    >
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {getStatusIcon()}
              {status === "running" && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-purple-400/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h3 className="font-medium text-white">
                {formatJobType(jobType)}
              </h3>
              {projectName && (
                <p className="text-xs text-muted-foreground">{projectName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div className="flex items-center gap-1.5 mr-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-400 animate-pulse" : "bg-amber-400"
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {isConnected ? "LIVE" : "RECONNECTING"}
              </span>
            </div>

            {/* Expand/collapse */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {/* Close */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {status === "running" && (
          <div className="h-1 bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Logs panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-64 overflow-auto bg-black/30 font-mono text-xs p-4"
              >
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Terminal className="w-4 h-4 mr-2" />
                    Waiting for logs...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2"
                      >
                        <span className="text-gray-600 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={cn("shrink-0 w-12", getLevelColor(log.level))}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className={getLevelColor(log.level)}>
                          {log.message}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/10 border-t border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between p-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>{getStatusText()}</span>
                  {status === "running" && (
                    <span>• {Math.round(progress * 100)}%</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Cancel button (only when running) */}
                  {(status === "running" || status === "pending") && onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCancel}
                      className="h-7 text-xs text-amber-400 hover:text-amber-300"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  )}

                  {/* Retry button (only when failed) */}
                  {status === "failed" && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRetry}
                      className="h-7 text-xs text-purple-400 hover:text-purple-300"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

// Compact inline version for project cards
export function ExecutionBadge({
  jobId,
  jobType,
  className,
}: {
  jobId: string;
  jobType: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"pending" | "running" | "completed" | "failed">("pending");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(`/api/jobs/${jobId}/logs`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "initial" || data.type === "status") {
          setStatus(data.job?.status || data.status);
          setProgress(data.job?.progress || data.progress || 0);
        }
        if (data.type === "finished") {
          setStatus(data.status);
          eventSource.close();
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId]);

  const formatJobType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
        status === "running" && "bg-purple-500/20 text-purple-300",
        status === "pending" && "bg-amber-500/20 text-amber-300",
        status === "completed" && "bg-green-500/20 text-green-300",
        status === "failed" && "bg-red-500/20 text-red-300",
        className
      )}
    >
      {status === "running" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : status === "completed" ? (
        <CheckCircle className="w-3 h-3" />
      ) : status === "failed" ? (
        <AlertCircle className="w-3 h-3" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      <span className="truncate max-w-[100px]">{formatJobType(jobType)}</span>
      {status === "running" && (
        <span className="text-[10px] opacity-70">{Math.round(progress * 100)}%</span>
      )}
    </motion.div>
  );
}
