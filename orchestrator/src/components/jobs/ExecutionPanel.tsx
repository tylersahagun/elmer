"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { QuestionModal, type PendingQuestionView } from "./QuestionModal";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
}

interface JobSnapshot {
  id: string;
  type: string;
  status: "pending" | "running" | "waiting_input" | "completed" | "failed" | "cancelled";
  progress?: number | null;
  error?: string | null;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  projectId?: string | null;
  workspaceId?: string;
  createdAt?: string;
  completedAt?: string | null;
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
  const [status, setStatus] = useState<"pending" | "running" | "waiting_input" | "completed" | "failed" | "cancelled">("pending");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobSnapshot, setJobSnapshot] = useState<JobSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: questionData, refetch: refetchQuestions } = useQuery<{
    questions: PendingQuestionView[];
  }>({
    queryKey: ["job-questions", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/questions`);
      if (!response.ok) throw new Error("Failed to load job questions");
      return response.json();
    },
    enabled: !!jobId && status === "waiting_input",
    refetchInterval: status === "waiting_input" ? 10000 : false,
  });

  const activeQuestion = questionData?.questions?.[0] ?? null;

  const respondMutation = useMutation({
    mutationFn: async ({
      question,
      response,
    }: {
      question: PendingQuestionView;
      response: string;
    }) => {
      const res = await fetch(
        `/api/jobs/${question.jobId}/questions/${question.id}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: question.workspaceId,
            response,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to submit response");
      return res.json();
    },
    onSuccess: () => {
      setQuestionModalOpen(false);
      setStatus("pending");
      void refetchQuestions();
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (question: PendingQuestionView) => {
      const res = await fetch(
        `/api/jobs/${question.jobId}/questions/${question.id}/skip`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: question.workspaceId,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to skip question");
      return res.json();
    },
    onSuccess: () => {
      setQuestionModalOpen(false);
      setStatus("pending");
      void refetchQuestions();
    },
  });

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
              setJobSnapshot(data.job);
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
              setJobSnapshot((prev) =>
                prev
                  ? {
                      ...prev,
                      status: data.status,
                      progress: data.progress || 0,
                      output: data.output ?? prev.output,
                      error: data.error ?? prev.error,
                    }
                  : prev,
              );
              break;

            case "finished":
              setStatus(data.status);
              if (data.error) setError(data.error);
              setJobSnapshot((prev) =>
                prev
                  ? {
                      ...prev,
                      status: data.status,
                      output: data.output ?? prev.output,
                      error: data.error ?? prev.error,
                    }
                  : prev,
              );
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
      case "waiting_input":
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
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
      case "waiting_input":
        return "Waiting for input";
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

  const renderStructuredData = (data: Record<string, unknown> | null | undefined) => {
    if (!data || Object.keys(data).length === 0) return null;
    return (
      <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-[11px] text-slate-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
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
              {jobSnapshot?.input && Object.keys(jobSnapshot.input).length > 0 && (
                <div className="p-3 border-b border-white/10 bg-white/5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Execution context
                  </div>
                  {renderStructuredData(jobSnapshot.input)}
                </div>
              )}

              {status === "waiting_input" && activeQuestion && (
                <div className="p-3 border-b border-amber-500/20 bg-amber-500/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-amber-300 font-medium">
                        Agent waiting for input
                      </div>
                      <p className="text-sm text-amber-100 mt-1">
                        {activeQuestion.questionText}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeQuestion.questionType && (
                          <span className="text-[10px] text-amber-300/80">
                            {activeQuestion.questionType}
                          </span>
                        )}
                        {activeQuestion.project?.name && (
                          <span className="text-[10px] text-amber-300/80">
                            {activeQuestion.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10"
                      onClick={() => setQuestionModalOpen(true)}
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              )}

              {jobSnapshot?.output && Object.keys(jobSnapshot.output).length > 0 && (
                <div className="p-3 border-b border-white/10 bg-emerald-500/5">
                  <div className="text-xs uppercase tracking-wide text-emerald-300/80 mb-2">
                    Latest output
                  </div>
                  {renderStructuredData(jobSnapshot.output)}
                </div>
              )}

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

      <QuestionModal
        open={questionModalOpen}
        question={activeQuestion}
        onOpenChange={setQuestionModalOpen}
        onSubmit={async (response) => {
          if (!activeQuestion) return;
          await respondMutation.mutateAsync({ question: activeQuestion, response });
        }}
        onSkip={
          activeQuestion
            ? async () => {
                await skipMutation.mutateAsync(activeQuestion);
              }
            : undefined
        }
        isSubmitting={respondMutation.isPending || skipMutation.isPending}
      />
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
  const [status, setStatus] = useState<"pending" | "running" | "waiting_input" | "completed" | "failed">("pending");
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
        status === "waiting_input" && "bg-orange-500/20 text-orange-300",
        status === "completed" && "bg-green-500/20 text-green-300",
        status === "failed" && "bg-red-500/20 text-red-300",
        className
      )}
    >
      {status === "running" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : status === "waiting_input" ? (
        <AlertCircle className="w-3 h-3" />
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
