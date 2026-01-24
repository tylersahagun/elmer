// orchestrator/src/lib/video/formatters.ts

import type { CaptionSegment } from "./extractCaptions";

/**
 * Convert seconds to human-readable timestamp
 * - Under 1 hour: M:SS (e.g., "1:05", "12:45")
 * - 1 hour or more: H:MM:SS (e.g., "1:05:30")
 *
 * @param seconds - Time in seconds (can include decimals)
 * @returns Formatted timestamp string
 */
export function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Build full transcript text from caption segments with timestamps
 * Format: "[0:15] Caption text here\n[0:22] Next caption..."
 *
 * @param segments - Array of caption segments
 * @returns Transcript string with embedded timestamps
 */
export function buildTranscriptWithTimestamps(segments: CaptionSegment[]): string {
  return segments.map((seg) => `[${formatTimestamp(seg.start)}] ${seg.text}`).join("\n");
}

/**
 * Build plain transcript without timestamps
 * Joins all segment text with spaces for clean reading
 *
 * @param segments - Array of caption segments
 * @returns Plain text transcript
 */
export function buildPlainTranscript(segments: CaptionSegment[]): string {
  return segments.map((seg) => seg.text).join(" ");
}
