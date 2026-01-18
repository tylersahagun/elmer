/**
 * Agent Types - Shared types for the agent execution system
 */

import type { JobType, JobStatus, DocumentType } from "@/lib/db/schema";

// ============================================
// AGENT EXECUTION TYPES
// ============================================

export interface AgentJob {
  id: string;
  type: JobType;
  projectId: string;
  workspaceId: string;
  input: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  logs: string[];
  tokensUsed: {
    input: number;
    output: number;
    cacheRead: number;
    cacheCreation: number;
  };
  durationMs: number;
}

export interface AgentProgressCallback {
  (event: AgentProgressEvent): void;
}

export type AgentProgressEvent =
  | { type: "started"; jobId: string; jobType: JobType }
  | { type: "log"; message: string; timestamp: Date }
  | { type: "tool_call"; toolName: string; input: Record<string, unknown> }
  | { type: "tool_result"; toolName: string; success: boolean; output?: unknown }
  | { type: "progress"; progress: number; message?: string }
  | { type: "completed"; result: AgentExecutionResult }
  | { type: "failed"; error: string };

// ============================================
// TOOL TYPES
// ============================================

export interface AgentToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface AgentToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface AgentToolResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

// ============================================
// WORKER TYPES
// ============================================

export interface WorkerConfig {
  pollIntervalMs: number;
  maxConcurrent: number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  timeoutMs: number;
}

export interface WorkerStatus {
  isRunning: boolean;
  activeJobs: number;
  processedCount: number;
  failedCount: number;
  lastPollAt: Date | null;
  rateLimitRemaining: {
    requests: number;
    tokens: number;
  };
}

// ============================================
// LOG STREAMING TYPES  
// ============================================

export interface JobLogEntry {
  jobId: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
}

export interface JobLogSubscription {
  jobId: string;
  callback: (entry: JobLogEntry) => void;
  unsubscribe: () => void;
}
