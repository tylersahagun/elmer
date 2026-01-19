/**
 * Execution System - Main Entry Point
 * 
 * This module provides the durable execution system for stage automation:
 * - Run Manager: Creates and tracks runs
 * - Worker: Polls and executes runs
 * - Providers: AI execution backends
 * - Stage Executors: Stage-specific automation
 */

// Run management
export {
  createRun,
  retryRun,
  claimRun,
  completeRun,
  cancelRun,
  getRunById,
  getRunsForCard,
  getRunsForWorkspace,
  getQueuedRuns,
  getActiveRunForCard,
  addRunLog,
  getRunLogs,
  streamRunLogs,
  createArtifact,
  getArtifactsForRun,
  getArtifactsForCard,
  recordStageTransition,
  getTransitionHistory,
  registerWorker,
  updateWorkerHeartbeat,
  incrementWorkerStats,
  getActiveWorkers,
  hasActiveWorkers,
  cleanupStaleWorkers,
  rescueStuckRuns,
  unlockStuckCards,
  type CreateRunInput,
  type CreateArtifactInput,
  type RecordTransitionInput,
} from "./run-manager";

// Execution worker
export {
  ExecutionWorker,
  startWorker,
  stopWorker,
  getWorker,
  type WorkerConfig,
} from "./worker";

// Execution providers
export {
  AnthropicProvider,
  CLIProvider,
  registerProvider,
  getProvider,
  getDefaultProvider,
  createDbCallbacks,
  type ExecutionProvider,
  type ExecutionContext,
  type ExecutionResult,
  type StreamCallback,
} from "./providers";

// Stage executors
export {
  executeStage,
  executeStageWithTasks,
  executeInbox,
  executeDiscovery,
  executePRD,
  executeDesign,
  executePrototype,
  executeValidate,
  executeTickets,
  type StageContext,
  type StageExecutionResult,
} from "./stage-executors";
