// orchestrator/src/app/api/signals/video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { parseVideoUrl, extractYouTubeCaptions } from "@/lib/video";
import { createSignal } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { processSignalExtraction } from "@/lib/signals";

/**
 * POST /api/signals/video
 * Fetch captions from a video URL and create a signal
 *
 * JSON body fields:
 * - videoUrl: string (required) - YouTube or Loom video URL
 * - workspaceId: string (required) - Workspace to create signal in
 * - interpretation: string (optional) - User's interpretation of the content
 * - language: string (optional) - Caption language code (default: "en")
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, workspaceId, interpretation, language = "en" } = body;

    // Validate required fields
    if (!videoUrl) {
      return NextResponse.json(
        { error: "videoUrl is required" },
        { status: 400 }
      );
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Parse and validate video URL
    const parsed = parseVideoUrl(videoUrl);
    if (!parsed.isValid || !parsed.videoId) {
      return NextResponse.json(
        { error: parsed.error || "Invalid video URL" },
        { status: 400 }
      );
    }

    // Require member access to create signals
    await requireWorkspaceAccess(workspaceId, "member");

    // Handle platform-specific caption extraction
    let extraction;
    try {
      if (parsed.platform === "youtube") {
        extraction = await extractYouTubeCaptions(parsed.videoId, language);
      } else if (parsed.platform === "loom") {
        // Loom support deferred - return clear error message
        return NextResponse.json(
          { error: "Loom video support coming soon. Please use YouTube videos for now." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Unsupported video platform" },
          { status: 400 }
        );
      }
    } catch (extractionError) {
      const message =
        extractionError instanceof Error
          ? extractionError.message
          : "Failed to fetch captions";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Verify extraction produced text
    if (!extraction?.text || extraction.text.trim().length === 0) {
      return NextResponse.json(
        { error: "No captions found for this video" },
        { status: 400 }
      );
    }

    // Create signal with extracted transcript
    const sourceRef = `video-${parsed.platform}-${Date.now()}-${nanoid(6)}`;
    const signal = await createSignal({
      workspaceId,
      verbatim: extraction.text,
      interpretation: interpretation?.trim() || undefined,
      source: "video",
      sourceRef,
      sourceMetadata: {
        videoUrl: extraction.metadata.videoUrl,
        videoPlatform: extraction.metadata.platform,
        sourceName: extraction.metadata.videoTitle || `${parsed.platform} video`,
        rawPayload: {
          videoId: extraction.metadata.videoId,
          language: extraction.metadata.language,
          segmentCount: extraction.metadata.segmentCount,
          charCount: extraction.metadata.charCount,
        },
      },
    });

    // Log activity asynchronously (queue-first pattern from Phase 13)
    after(async () => {
      try {
        await db.insert(activityLogs).values({
          id: nanoid(),
          workspaceId,
          action: "signal.created",
          targetType: "signal",
          targetId: signal!.id,
          metadata: {
            source: "video",
            platform: extraction.metadata.platform,
            videoUrl: extraction.metadata.videoUrl,
          },
          createdAt: new Date(),
        });
      } catch (logError) {
        // Never throw in after() context - log errors for debugging (Phase 13 pattern)
        console.error("Failed to log video activity:", logError);
      }
    });

    // Queue AI extraction and embedding (Phase 15)
    after(async () => {
      try {
        await processSignalExtraction(signal!.id);
      } catch (error) {
        console.error(`Failed to process video signal ${signal!.id}:`, error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        signal: {
          id: signal!.id,
          verbatim:
            signal!.verbatim.length > 200
              ? signal!.verbatim.slice(0, 200) + "..."
              : signal!.verbatim,
          source: signal!.source,
          status: signal!.status,
        },
        extraction: {
          platform: extraction.metadata.platform,
          videoTitle: extraction.metadata.videoTitle,
          segmentCount: extraction.metadata.segmentCount,
          charCount: extraction.metadata.charCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Video caption fetch failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process video" },
      { status: 500 }
    );
  }
}
