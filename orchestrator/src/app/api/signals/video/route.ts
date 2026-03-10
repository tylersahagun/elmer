// orchestrator/src/app/api/signals/video/route.ts

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { parseVideoUrl, extractYouTubeCaptions } from "@/lib/video";
import { processSignalExtraction } from "@/lib/signals";
import { createConvexWorkspaceActivity } from "@/lib/convex/server";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

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

    const parsed = parseVideoUrl(videoUrl);
    if (!parsed.isValid || !parsed.videoId) {
      return NextResponse.json(
        { error: parsed.error || "Invalid video URL" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    let extraction;
    try {
      if (parsed.platform === "youtube") {
        extraction = await extractYouTubeCaptions(parsed.videoId, language);
      } else if (parsed.platform === "loom") {
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

    if (!extraction?.text || extraction.text.trim().length === 0) {
      return NextResponse.json(
        { error: "No captions found for this video" },
        { status: 400 }
      );
    }

    const sourceRef = `video-${parsed.platform}-${Date.now()}-${nanoid(6)}`;
    const client = getConvexClient();
    const signalId = await client.mutation(api.signals.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      verbatim: extraction.text,
      interpretation: interpretation?.trim() || undefined,
      source: "video",
      sourceRef,
      status: "new",
    });

    after(async () => {
      try {
        await createConvexWorkspaceActivity({
          workspaceId,
          action: "signal.created",
          targetType: "signal",
          targetId: signalId as string,
          metadata: {
            source: "video",
            platform: extraction.metadata.platform,
            videoUrl: extraction.metadata.videoUrl,
          },
        });
      } catch (logError) {
        console.error("Failed to log video activity:", logError);
      }
    });

    after(async () => {
      try {
        await processSignalExtraction(signalId as string);
      } catch (error) {
        console.error(`Failed to process video signal ${signalId}:`, error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        signal: {
          id: signalId,
          verbatim:
            extraction.text.length > 200
              ? extraction.text.slice(0, 200) + "..."
              : extraction.text,
          source: "video",
          status: "new",
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
