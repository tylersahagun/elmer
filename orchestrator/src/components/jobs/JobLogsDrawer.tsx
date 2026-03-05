"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useJobLogs } from "@/hooks/useJobLogs";
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Terminal,
  Sparkles,
  FileText,
  Brain,
  ArrowRight,
  XCircle,
} from "lucide-react";

// Format job type for display
function formatJobType(type: string): string {
  const typeMap: Record<string, string> = {
    analyze_transcript: "Analyzing Transcript",
    generate_prd: "Generating PRD",
    generate_design_brief: "Generating Design Brief",
    generate_engineering_spec: "Generating Engineering Spec",
    generate_gtm_brief: "Generating GTM Brief",
    build_prototype: "Building Prototype",
    run_jury_evaluation: "Running Jury Evaluation",
    generate_tickets: "Generating Tickets",
    score_stage_alignment: "Scoring Stage Alignment",
    create_feature_branch: "Creating Feature Branch",
    deploy_chromatic: "Deploying to Chromatic",
    iterate_prototype: "Iterating Prototype",
    validate_tickets: "Validating Tickets",
  };
  return (
    typeMap[type] ||
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// Get icon for log level
function LogLevelIcon({ level }: { level: string }) {
  switch (level) {
    case "error":
      return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    case "warn":
      return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
    case "debug":
      return <Terminal className="w-3.5 h-3.5 text-slate-400" />;
    default:
      return <ArrowRight className="w-3.5 h-3.5 text-purple-400" />;
  }
}

// Parse log message for context indicators
function parseLogMessage(message: string): {
  icon: React.ReactNode;
  text: string;
} {
  if (
    message.toLowerCase().includes("thinking") ||
    message.toLowerCase().includes("analyzing")
  ) {
    return {
      icon: <Brain className="w-3.5 h-3.5 text-purple-400" />,
      text: message,
    };
  }
  if (
    message.toLowerCase().includes("reading") ||
    message.toLowerCase().includes("loading")
  ) {
    return {
      icon: <FileText className="w-3.5 h-3.5 text-blue-400" />,
      text: message,
    };
  }
  if (
    message.toLowerCase().includes("generating") ||
    message.toLowerCase().includes("creating")
  ) {
    return {
      icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />,
      text: message,
    };
  }
  if (
    message.toLowerCase().includes("complete") ||
    message.toLowerCase().includes("success")
  ) {
    return {
      icon: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
      text: message,
    };
  }
  return { icon: null, text: message };
}

export function JobLogsDrawer() {
  const isOpen = useUIStore((s) => s.jobLogsDrawerOpen);
  const jobId = useUIStore((s) => s.jobLogsDrawerJobId);
  const projectName = useUIStore((s) => s.jobLogsDrawerProjectName);
  const closeDrawer = useUIStore((s) => s.closeJobLogsDrawer);

  const { logs: rawLogs, job, isLoading } = useJobLogs(isOpen ? jobId : null);
  const [activeTab, setActiveTab] = useState<"logs" | "trace">("logs");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Execution trace for the Trace tab
  const execution = useQuery(
    api.agentExecutions.getByJob,
    isOpen && jobId ? { jobId: jobId as Id<"jobs"> } : "skip",
  );
  const toolCalls = (execution?.toolCalls ?? []) as Array<{
    name: string;
    input: Record<string, unknown>;
    output: unknown;
    durationMs: number;
  }>;

  // Map Convex log entries to display shape
  const logs = rawLogs.map((l) => ({
    id: l._id,
    timestamp: new Date(l._creationTime),
    level: l.level as "info" | "warn" | "error" | "debug",
    message: l.message,
    data: l.meta as Record<string, unknown> | undefined,
  }));

  const isConnected = !isLoading && job !== null;
  const connectionError = null;

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Connect to SSE stream — REMOVED: Convex useQuery in useJobLogs handles this reactively

  // Clean up on close
  const handleClose = () => {
    closeDrawer();
  };

  if (!isOpen) return null;

  const statusColor =
    job?.status === "completed"
      ? "text-green-400"
      : job?.status === "failed"
        ? "text-red-400"
        : job?.status === "cancelled"
          ? "text-slate-400"
          : job?.status === "running"
            ? "text-purple-400"
            : "text-amber-400";

  const StatusIcon =
    job?.status === "completed"
      ? CheckCircle
      : job?.status === "failed"
        ? AlertCircle
        : job?.status === "cancelled"
          ? XCircle
          : job?.status === "running"
            ? Loader2
            : Clock;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[480px] max-w-[90vw]",
          "bg-slate-900/95 backdrop-blur-xl",
          "border-l border-white/10",
          "flex flex-col z-50",
          "shadow-2xl",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
              )}
            >
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate">
                {job ? formatJobType(job.type) : "Job Logs"}
              </h2>
              {projectName && (
                <p className="text-xs text-muted-foreground truncate">
                  {projectName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-400 animate-pulse" : "bg-slate-500",
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {isConnected ? "LIVE" : "OFFLINE"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Job Status Banner */}
        {job && (
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon
                  className={cn(
                    "w-4 h-4",
                    statusColor,
                    job.status === "running" && "animate-spin",
                  )}
                />
                <span
                  className={cn("text-sm font-medium capitalize", statusColor)}
                >
                  {job.status}
                </span>
              </div>
              {(job.progress ?? 0) > 0 && (job.progress ?? 0) < 1 && (
                <span className="text-xs text-muted-foreground">
                  {Math.round((job.progress ?? 0) * 100)}%
                </span>
              )}
            </div>
            {/* Progress bar */}
            {job.status === "running" && (
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(job.progress ?? 0) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            {/* Error message */}
            {job.errorMessage && (
              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{job.errorMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Connection error — Convex useQuery manages reconnection automatically */}

        {/* Tab switcher */}
        <div className="flex border-b border-white/[0.08] px-4 gap-4 shrink-0">
          {(["logs", "trace"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-xs font-mono py-2 border-b-2 transition-colors",
                activeTab === tab
                  ? "border-purple-400 text-purple-400"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "logs" ? `Logs (${logs.length})` : `Trace (${toolCalls.length})`}
            </button>
          ))}
        </div>

        {/* Trace tab */}
        {activeTab === "trace" && (
          <ScrollArea className="flex-1 p-4">
            {toolCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Terminal className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No tool calls yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {toolCalls.map((tc, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-purple-400 font-medium">
                          {tc.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          #{idx + 1}
                        </span>
                      </div>
                      {tc.durationMs != null && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {tc.durationMs}ms
                        </span>
                      )}
                    </div>
                    {tc.input && Object.keys(tc.input).length > 0 && (
                      <details className="group">
                        <summary className="text-[10px] text-muted-foreground cursor-pointer select-none">
                          Input
                        </summary>
                        <pre className="mt-1 text-[10px] font-mono text-foreground/70 whitespace-pre-wrap break-all overflow-hidden">
                          {JSON.stringify(tc.input, null, 2).slice(0, 400)}
                        </pre>
                      </details>
                    )}
                    {tc.output !== undefined && (
                      <details className="group">
                        <summary className="text-[10px] text-muted-foreground cursor-pointer select-none">
                          Output
                        </summary>
                        <pre className="mt-1 text-[10px] font-mono text-emerald-400/70 whitespace-pre-wrap break-all overflow-hidden">
                          {JSON.stringify(tc.output, null, 2).slice(0, 600)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Logs tab */}
        {activeTab === "trace" ? null : (
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {logs.length === 0 && !job?.errorMessage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                >
                  {job?.status === "pending" ? (
                    <>
                      <Clock className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Waiting in queue...</p>
                      <p className="text-xs mt-1">
                        Logs will appear when processing starts
                      </p>
                    </>
                  ) : job?.status === "running" ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-2 animate-spin opacity-50" />
                      <p className="text-sm">Processing...</p>
                      <p className="text-xs mt-1">Waiting for log output</p>
                    </>
                  ) : job?.status === "completed" ? (
                    <>
                      <CheckCircle className="w-8 h-8 mb-2 text-green-400 opacity-50" />
                      <p className="text-sm">Job completed successfully</p>
                    </>
                  ) : (
                    <>
                      <Terminal className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No logs yet</p>
                    </>
                  )}
                </motion.div>
              ) : (
                logs.map((log) => {
                  const parsed = parseLogMessage(log.message);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "flex gap-2 p-2 rounded-lg",
                        log.level === "error"
                          ? "bg-red-500/10"
                          : log.level === "warn"
                            ? "bg-amber-500/10"
                            : "bg-white/5",
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {parsed.icon || <LogLevelIcon level={log.level} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-mono break-words",
                            log.level === "error"
                              ? "text-red-300"
                              : log.level === "warn"
                                ? "text-amber-300"
                                : log.level === "debug"
                                  ? "text-slate-400"
                                  : "text-slate-200",
                          )}
                        >
                          {parsed.text}
                        </p>
                        {log.data && Object.keys(log.data).length > 0 && (
                          <pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>

            {/* Live indicator when running */}
            {job?.status === "running" && isConnected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2 p-2"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-xs text-muted-foreground">
                  Listening for updates...
                </span>
              </motion.div>
            )}
          </div>
        </ScrollArea>
        )}

        {/* Footer with output summary */}
        {job?.output && Object.keys(job.output).length > 0 && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">
              Output
            </h3>
            <pre className="text-xs text-slate-300 overflow-x-auto max-h-32 p-2 bg-black/20 rounded-lg">
              {JSON.stringify(job.output, null, 2)}
            </pre>
          </div>
        )}
      </motion.aside>
    </>
  );
}
