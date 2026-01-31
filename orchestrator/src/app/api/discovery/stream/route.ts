/**
 * Discovery Stream API (Server-Sent Events)
 *
 * GET /api/discovery/stream?workspaceId=xxx
 *
 * Provides real-time discovery progress via SSE.
 * Streams folder scanning progress and discovered items as they're found.
 *
 * Events:
 * - connected: Initial connection established
 * - scanning_started: Repository scan beginning with repo info
 * - progress: Folder scanning progress updates
 * - initiative_found: New initiative discovered
 * - context_path_found: New context path discovered
 * - agent_found: New agent discovered
 * - submodule_detected: Git submodule found in repository
 * - submodule_scanning: Starting to scan a submodule
 * - submodule_scanned: Submodule scan complete (may include prototypePath)
 * - submodule_error: Error scanning a submodule
 * - completed: Scan complete with final result (includes submodules array)
 * - error: Error occurred during scan
 * - cancelled: Scan was cancelled (client disconnect)
 */

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";
import { getWorkspace } from "@/lib/db/queries";
import {
  sendStreamEvent,
  createStreamEvent,
  createDiscoveryStreamResponse,
  type DiscoveryStreamEvent,
} from "@/lib/discovery/streaming";
import { scanRepositoryWithStreaming } from "@/lib/discovery/streaming-scanner";

export async function GET(request: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Get workspaceId from query
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return new Response(JSON.stringify({ error: "workspaceId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Load workspace and validate
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return new Response(JSON.stringify({ error: "Workspace not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Parse repo slug (owner/repo)
  const repoSlug = workspace.githubRepo;
  if (!repoSlug) {
    return new Response(JSON.stringify({ error: "No repository connected" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parts = repoSlug.split("/");
  if (parts.length !== 2) {
    return new Response(
      JSON.stringify({ error: "Invalid repository format. Expected owner/repo" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  const [owner, repo] = parts;

  // 5. Get branch (from onboarding data or settings or default)
  const branch =
    workspace.onboardingData?.selectedBranch ||
    workspace.settings?.baseBranch ||
    "main";

  // 6. Get GitHub client
  const octokit = await getGitHubClient(session.user.id);
  if (!octokit) {
    return new Response(
      JSON.stringify({
        error: "GitHub not connected",
        connectUrl: "/api/auth/signin/github",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 7. Create AbortController for cancellation support (FEED-04)
  const abortController = new AbortController();
  let cancelled = false;

  // 8. Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      // Send 'connected' event immediately
      sendStreamEvent(
        controller,
        createStreamEvent("connected", {
          workspaceId,
          repoOwner: owner,
          repoName: repo,
          branch,
        })
      );

      // Set up abort handler for client disconnect
      request.signal.addEventListener("abort", () => {
        cancelled = true;
        abortController.abort();
      });

      // Callback for streaming progress events to SSE
      const onProgress = (event: DiscoveryStreamEvent) => {
        // Don't send if cancelled
        if (cancelled) return;

        const sent = sendStreamEvent(controller, event);

        // If send failed, connection is closed - abort the scan
        if (!sent) {
          cancelled = true;
          abortController.abort();
        }

        // Close stream on terminal events
        if (event.type === "completed" || event.type === "error" || event.type === "cancelled") {
          try {
            controller.close();
          } catch {
            // Already closed
          }
        }
      };

      try {
        // Run the real streaming scanner
        await scanRepositoryWithStreaming({
          workspaceId,
          owner,
          repo,
          branch,
          octokit,
          onProgress,
          signal: abortController.signal,
        });

        // Ensure stream is closed after scan completes
        // (onProgress should have closed it on 'completed' event, but be safe)
        try {
          controller.close();
        } catch {
          // Already closed
        }
      } catch (error) {
        // Handle unexpected errors not caught by the scanner
        if (!cancelled) {
          sendStreamEvent(
            controller,
            createStreamEvent("error", {
              error: error instanceof Error ? error.message : "Discovery failed",
            })
          );
        }

        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },

    cancel() {
      // Cleanup when stream is cancelled by client
      cancelled = true;
      abortController.abort();
    },
  });

  return createDiscoveryStreamResponse(stream);
}
