/**
 * Discovery Streaming Utilities
 *
 * Provides SSE (Server-Sent Events) infrastructure for real-time discovery progress.
 * Enables FEED-01 (progress indication), FEED-02 (streaming updates), FEED-05 (real-time feedback).
 */

import type {
  DiscoveryResult,
  DiscoveredInitiative,
  DiscoveredContextPath,
  DiscoveredAgent,
  DiscoveredSubmodule,
} from './types';

/**
 * Event types for discovery streaming
 */
export type DiscoveryStreamEventType =
  | 'connected'
  | 'scanning_started'
  | 'folder_found'
  | 'initiative_found'
  | 'context_path_found'
  | 'agent_found'
  | 'submodule_detected'
  | 'submodule_scanning'
  | 'submodule_scanned'
  | 'submodule_error'
  | 'progress'
  | 'completed'
  | 'error'
  | 'cancelled';

/**
 * Discovery stream event payload
 */
export interface DiscoveryStreamEvent {
  type: DiscoveryStreamEventType;
  timestamp: string;
  data: {
    // Progress tracking
    foldersScanned?: number;
    totalFolders?: number;
    currentFolder?: string;

    // Items found incrementally
    initiative?: DiscoveredInitiative;
    contextPath?: DiscoveredContextPath;
    agent?: DiscoveredAgent;

    // Submodule events
    submodule?: DiscoveredSubmodule;
    submodulePath?: string;
    prototypePath?: string;

    // Final result
    result?: DiscoveryResult;

    // Error info
    error?: string;

    // Timing
    elapsedMs?: number;
    estimatedRemainingMs?: number;

    // Connection info (for 'connected' event)
    workspaceId?: string;
    repoOwner?: string;
    repoName?: string;
    branch?: string;
  };
}

// TextEncoder instance for SSE encoding
const encoder = new TextEncoder();

/**
 * Send a stream event to an SSE connection
 *
 * Encodes the event in SSE format: `data: {json}\n\n`
 * Handles connection closed errors gracefully.
 *
 * @param controller - ReadableStream controller
 * @param event - Event to send
 * @returns true if sent successfully, false if connection closed
 */
export function sendStreamEvent(
  controller: ReadableStreamDefaultController,
  event: DiscoveryStreamEvent
): boolean {
  try {
    const message = `data: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(encoder.encode(message));
    return true;
  } catch {
    // Connection closed - this is expected when client disconnects
    return false;
  }
}

/**
 * Create an SSE Response with proper headers
 *
 * @param stream - ReadableStream to wrap
 * @returns Response configured for SSE
 */
export function createDiscoveryStreamResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Helper to create a timestamped event
 *
 * @param type - Event type
 * @param data - Event data
 * @returns Complete DiscoveryStreamEvent with timestamp
 */
export function createStreamEvent(
  type: DiscoveryStreamEventType,
  data: DiscoveryStreamEvent['data'] = {}
): DiscoveryStreamEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Helper to send a progress update
 *
 * @param controller - Stream controller
 * @param progress - Progress data
 * @returns true if sent successfully
 */
export function sendProgressEvent(
  controller: ReadableStreamDefaultController,
  progress: {
    foldersScanned: number;
    totalFolders: number;
    currentFolder: string | null;
    elapsedMs: number;
    estimatedRemainingMs?: number | null;
  }
): boolean {
  return sendStreamEvent(
    controller,
    createStreamEvent('progress', {
      foldersScanned: progress.foldersScanned,
      totalFolders: progress.totalFolders,
      currentFolder: progress.currentFolder ?? undefined,
      elapsedMs: progress.elapsedMs,
      estimatedRemainingMs: progress.estimatedRemainingMs ?? undefined,
    })
  );
}

/**
 * Helper to send an error event
 *
 * @param controller - Stream controller
 * @param error - Error message
 * @returns true if sent successfully
 */
export function sendErrorEvent(
  controller: ReadableStreamDefaultController,
  error: string
): boolean {
  return sendStreamEvent(controller, createStreamEvent('error', { error }));
}

/**
 * Helper to send a completion event
 *
 * @param controller - Stream controller
 * @param result - Final discovery result
 * @param elapsedMs - Total elapsed time
 * @returns true if sent successfully
 */
export function sendCompletedEvent(
  controller: ReadableStreamDefaultController,
  result: DiscoveryResult,
  elapsedMs: number
): boolean {
  return sendStreamEvent(
    controller,
    createStreamEvent('completed', { result, elapsedMs })
  );
}
