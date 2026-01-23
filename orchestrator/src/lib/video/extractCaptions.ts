// orchestrator/src/lib/video/extractCaptions.ts

import { getVideoDetails, type Subtitle } from "youtube-caption-extractor";
import { buildTranscriptWithTimestamps } from "./formatters";

/**
 * Individual caption segment with timing information
 */
export interface CaptionSegment {
  /** Start time in seconds */
  start: number;
  /** Duration in seconds */
  duration: number;
  /** Caption text content */
  text: string;
}

/**
 * Result of caption extraction
 * Matches the pattern from lib/files/extractText.ts ExtractionResult
 */
export interface CaptionExtractionResult {
  /** Full transcript as single string with timestamps */
  text: string;
  /** Individual caption segments for granular access */
  segments: CaptionSegment[];
  /** Metadata about the extraction */
  metadata: {
    platform: "youtube" | "loom";
    videoId: string;
    videoUrl: string;
    videoTitle?: string;
    language: string;
    segmentCount: number;
    charCount: number;
  };
}

/**
 * Extract captions from a YouTube video
 *
 * Uses youtube-caption-extractor which fetches available captions without
 * requiring YouTube Data API credentials. Works with both manual and
 * auto-generated captions.
 *
 * @param videoId - YouTube video ID (11 characters)
 * @param lang - Language code (default: "en")
 * @returns CaptionExtractionResult with transcript, segments, and metadata
 * @throws Error if no captions are available
 */
export async function extractYouTubeCaptions(
  videoId: string,
  lang: string = "en"
): Promise<CaptionExtractionResult> {
  const details = await getVideoDetails({ videoID: videoId, lang });

  if (!details.subtitles || details.subtitles.length === 0) {
    throw new Error("No captions available for this video");
  }

  // Convert Subtitle[] to CaptionSegment[]
  // youtube-caption-extractor returns start/dur as strings
  const segments: CaptionSegment[] = details.subtitles.map((sub: Subtitle) => ({
    start: parseFloat(sub.start),
    duration: parseFloat(sub.dur),
    text: sub.text,
  }));

  // Build full transcript with timestamps
  const text = buildTranscriptWithTimestamps(segments);

  return {
    text,
    segments,
    metadata: {
      platform: "youtube",
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoTitle: details.title,
      language: lang,
      segmentCount: segments.length,
      charCount: text.length,
    },
  };
}
