// orchestrator/src/lib/video/validators.ts

export type VideoPlatform = "youtube" | "loom" | "unknown";

export interface VideoUrlParseResult {
  platform: VideoPlatform;
  videoId: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * YouTube URL patterns:
 * - Standard watch: youtube.com/watch?v=VIDEO_ID
 * - Short URL: youtu.be/VIDEO_ID
 * - Embed: youtube.com/embed/VIDEO_ID
 * - Shorts: youtube.com/shorts/VIDEO_ID
 * - Privacy-enhanced: youtube-nocookie.com/embed/VIDEO_ID
 *
 * YouTube video IDs are always 11 characters: [a-zA-Z0-9_-]
 */
const YOUTUBE_REGEX =
  /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Loom URL pattern:
 * - Share link: loom.com/share/[32-hex-chars]
 *
 * Loom video IDs are 32 lowercase hex characters
 */
const LOOM_REGEX = /loom\.com\/share\/([a-f0-9]{32})/;

/**
 * Parse a video URL and extract platform and video ID
 *
 * @param url - The video URL to parse
 * @returns VideoUrlParseResult with platform, videoId, validity, and optional error
 */
export function parseVideoUrl(url: string): VideoUrlParseResult {
  // Sanitize input
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return {
      platform: "unknown",
      videoId: null,
      isValid: false,
      error: "URL is empty",
    };
  }

  // Try YouTube first (most common case)
  const youtubeMatch = trimmedUrl.match(YOUTUBE_REGEX);
  if (youtubeMatch && youtubeMatch[1]) {
    return {
      platform: "youtube",
      videoId: youtubeMatch[1],
      isValid: true,
    };
  }

  // Try Loom
  const loomMatch = trimmedUrl.match(LOOM_REGEX);
  if (loomMatch && loomMatch[1]) {
    return {
      platform: "loom",
      videoId: loomMatch[1],
      isValid: true,
    };
  }

  return {
    platform: "unknown",
    videoId: null,
    isValid: false,
    error: "URL not recognized as YouTube or Loom video",
  };
}
