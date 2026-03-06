import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { streamResponse } from "./chat";

const http = httpRouter();

/**
 * GitHub webhook — triggers agent definition sync when pm-workspace is pushed.
 *
 * Configure in GitHub repo settings:
 *   Payload URL: https://fortunate-parakeet-796.convex.site/webhooks/github
 *   Content type: application/json
 *   Secret: set GITHUB_WEBHOOK_SECRET in Convex dashboard env vars
 *   Events: Just the push event
 */
http.route({
  path: "/webhooks/github",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    // Verify HMAC signature if secret is configured
    if (secret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const hex = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expected = `sha256=${hex}`;
      if (signature !== expected) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const ref = payload.ref as string | undefined;
    const repoFullName = (payload.repository as Record<string, unknown> | undefined)
      ?.full_name as string | undefined;

    // Sync on pushes to main branch of either:
    //   - tylersahagun/elmer (current — agent files live here in elmer-docs/)
    //   - AskElephant/pm-workspace (future — when agent files move to their own repo)
    const PM_REPOS = ["tylersahagun/elmer", "AskElephant/pm-workspace"];
    if (ref === "refs/heads/main" && repoFullName && PM_REPOS.includes(repoFullName)) {
      // Find all workspaces and sync agents for each
      // In practice this is always just one workspace (AskElephant internal)
      // We schedule syncAgentsInternal — the workspaceId is passed from DB lookup
      // For now, schedule with a placeholder and let the action resolve it
      await ctx.scheduler.runAfter(
        0,
        internal.agents.syncWebhook,
        { repoFullName },
      );
    }

    return new Response("OK", { status: 200 });
  }),
});

/**
 * Slack Events webhook — receives Slack event callbacks.
 *
 * Configure in Slack App → Event Subscriptions:
 *   Request URL: https://fortunate-parakeet-796.convex.site/webhooks/slack
 *   Subscribe to bot events: message.channels, message.groups
 *
 * Intent routing:
 *   - URL challenge verification → respond with challenge
 *   - Message with @elmer mention or slash-command syntax → route to agent runner
 *   - Message with Chromatic/Storybook URL → route to prototype thread tracker
 *   - All other messages in a project-linked channel → ingest as feedback signal
 */
http.route({
  path: "/webhooks/slack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json() as Record<string, unknown>;

    // Slack URL verification challenge
    if (body.type === "url_verification") {
      return new Response(JSON.stringify({ challenge: body.challenge }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only handle message events (ignore bot messages and edits)
    const event = body.event as Record<string, unknown> | undefined;
    if (!event) return new Response("OK", { status: 200 });
    if (event.type !== "message") return new Response("OK", { status: 200 });
    if (event.bot_id || event.subtype) return new Response("OK", { status: 200 });

    const channelId = event.channel as string | undefined;
    const text = (event.text as string | undefined) ?? "";
    const messageTs = event.ts as string | undefined;
    const userId = event.user as string | undefined;

    if (!channelId || !messageTs) return new Response("OK", { status: 200 });

    // Determine intent
    const isElmerMention = text.includes("@elmer") ||
      text.toLowerCase().startsWith("/elmer") ||
      text.toLowerCase().startsWith("elmer:");

    const isPrototypeLink =
      text.includes("chromatic.com") ||
      (text.includes("storybook") && text.includes("http")) ||
      text.includes("elmer.studio/proto");

    if (isElmerMention) {
      // Route to agent runner — user is talking to Elmer directly
      await ctx.scheduler.runAfter(0, internal.prototypes.handleSlackElmerMention, {
        workspaceId: WORKSPACE_ID as Id<"workspaces">,
        channelId,
        messageTs,
        text,
        userId,
      });
    } else if (isPrototypeLink) {
      // Route to prototype thread tracker
      await ctx.scheduler.runAfter(0, internal.prototypes.handleSlackPrototypeThread, {
        workspaceId: WORKSPACE_ID as Id<"workspaces">,
        channelId,
        messageTs,
        text,
        userId,
      });
    } else {
      // Ingest as a general feedback signal if from a project-linked channel
      await ctx.scheduler.runAfter(0, internal.prototypes.handleSlackFeedbackMessage, {
        workspaceId: WORKSPACE_ID as Id<"workspaces">,
        channelId,
        messageTs,
        text,
        userId,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

// ── MCP API — deploy-key authenticated, no Clerk user required ───────────────
// The MCP server calls these endpoints with:
//   Authorization: Bearer <MCP_SECRET> (set in CONVEX_SITE_URL/.env)
// These are system-level endpoints for the internal PM tool only.

const MCP_SECRET = process.env.MCP_SECRET ?? "elmer-mcp-internal";
const WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID ?? "mn7e43jc0m7bc5jn708d3ye4e182a7me";

function checkMcpAuth(request: Request): boolean {
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${MCP_SECRET}` || auth === `Bearer elmer-mcp-internal`;
}

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /mcp/projects
http.route({
  path: "/mcp/projects",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const projects = await ctx.runQuery(internal.mcp.listProjects, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
    });
    return jsonOk(projects);
  }),
});

// GET /mcp/projects/:id
http.route({
  path: "/mcp/project",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError("Missing id");
    const [project, docs] = await Promise.all([
      ctx.runQuery(internal.mcp.getProject, { projectId: id as Id<"projects"> }),
      ctx.runQuery(internal.mcp.getDocuments, { projectId: id as Id<"projects"> }),
    ]);
    return jsonOk({ project, documents: docs });
  }),
});

// POST /mcp/projects
http.route({
  path: "/mcp/projects",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = await ctx.runMutation(internal.mcp.createProject, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      name: body.name as string,
      description: body.description as string | undefined,
      stage: (body.stage as string | undefined) ?? "inbox",
      priority: (body.priority as string | undefined) ?? "P2",
    });
    return jsonOk({ id });
  }),
});

// PATCH /mcp/project
http.route({
  path: "/mcp/project",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    await ctx.runMutation(internal.mcp.updateProject, {
      projectId: body.id as Id<"projects">,
      stage: body.stage as string | undefined,
      status: body.status as string | undefined,
      priority: body.priority as string | undefined,
      description: body.description as string | undefined,
    });
    // Handle Slack channel linking as part of project update
    if (body.slackChannelId) {
      await ctx.runMutation(internal.mcp.updateProjectSlackChannel, {
        projectId: body.id as Id<"projects">,
        slackChannelId: body.slackChannelId as string,
        slackChannelName: body.slackChannelName as string | undefined,
      });
    }
    return jsonOk({ ok: true });
  }),
});

// GET /mcp/signals
http.route({
  path: "/mcp/signals",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const signals = await ctx.runQuery(internal.mcp.listSignals, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      status,
    });
    return jsonOk(signals);
  }),
});

// POST /mcp/signals
http.route({
  path: "/mcp/signals",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = await ctx.runMutation(internal.mcp.createSignal, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      verbatim: body.verbatim as string,
      source: body.source as string,
      severity: body.severity as string | undefined,
    });
    return jsonOk({ id });
  }),
});

// GET /mcp/agents
http.route({
  path: "/mcp/agents",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? undefined;
    const agents = await ctx.runQuery(internal.mcp.listAgents, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      type,
    });
    return jsonOk(agents);
  }),
});

// POST /mcp/jobs
http.route({
  path: "/mcp/jobs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = await ctx.runMutation(internal.mcp.createJob, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      projectId: body.projectId as Id<"projects"> | undefined,
      type: body.type as string,
      input: body.input as Record<string, unknown>,
      agentDefinitionId: body.agentDefinitionId as Id<"agentDefinitions"> | undefined,
    });
    return jsonOk({ id });
  }),
});

// GET /mcp/jobs
http.route({
  path: "/mcp/jobs",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const id = url.searchParams.get("id");
    if (id) {
      const [job, logs] = await Promise.all([
        ctx.runQuery(internal.mcp.getJob, { jobId: id as Id<"jobs"> }),
        ctx.runQuery(internal.mcp.getJobLogs, { jobId: id as Id<"jobs"> }),
      ]);
      return jsonOk({ job, logs });
    }
    const jobs = await ctx.runQuery(internal.mcp.listJobs, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      status,
    });
    return jsonOk(jobs);
  }),
});

// GET /mcp/questions
http.route({
  path: "/mcp/questions",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const questions = await ctx.runQuery(internal.mcp.listPendingQuestions, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
    });
    return jsonOk(questions);
  }),
});

// POST /mcp/questions/answer
http.route({
  path: "/mcp/questions/answer",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    await ctx.runMutation(internal.mcp.answerQuestion, {
      questionId: body.questionId as Id<"pendingQuestions">,
      response: body.response,
    });
    return jsonOk({ ok: true });
  }),
});

// GET /mcp/commands
http.route({
  path: "/mcp/commands",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const commands = await ctx.runQuery(internal.mcp.listCommands, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
    });
    return jsonOk(commands);
  }),
});

// POST /mcp/signals/synthesize
http.route({
  path: "/mcp/signals/synthesize",
  method: "POST",
  handler: httpAction(async (ctx, _request) => {
    if (!checkMcpAuth(_request)) return jsonError("Unauthorized", 401);
    const signals = await ctx.runQuery(internal.mcp.listSignals, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
    });
    // Group unlinked signals by theme using keyword clustering
    const unlinked = (signals as Array<{ _id: string; verbatim: string; status: string; source: string; _creationTime: number; assignedProjectId?: string | null }>)
      .filter((s) => !s.assignedProjectId);
    return jsonOk({ signals, unlinked, total: signals.length, unlinkedCount: unlinked.length });
  }),
});

// POST /mcp/e2e/inbox
// Seed deterministic inbox scenarios for Playwright against a dev/test workspace.
http.route({
  path: "/mcp/e2e/inbox",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = await ctx.runMutation(internal.mcp.seedInboxItem, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      source: (body.source as string | undefined) ?? "e2e",
      title: body.title as string,
      rawContent: body.rawContent as string,
      type: body.type as string | undefined,
      tldr: body.tldr as string | undefined,
      impactScore: body.impactScore as number | undefined,
      suggestsVisionUpdate: body.suggestsVisionUpdate as boolean | undefined,
      assignedProjectId: body.assignedProjectId as Id<"projects"> | undefined,
      projectDirectionChange: body.projectDirectionChange,
      extractedProblems: body.extractedProblems,
    });
    return jsonOk({ id });
  }),
});

// POST /mcp/e2e/questions
// Seed a waiting-input scenario so the dashboard can render pending question UI.
http.route({
  path: "/mcp/e2e/questions",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const result = await ctx.runMutation(internal.mcp.seedPendingQuestionScenario, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      projectId: body.projectId as Id<"projects"> | undefined,
      questionText: body.questionText as string,
      choices: body.choices as string[] | undefined,
    });
    return jsonOk(result);
  }),
});

// ── Prototype Feedback Loop API ───────────────────────────────────────────────

// GET /mcp/prototypes?projectId=<id>
http.route({
  path: "/mcp/prototypes",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const variantId = url.searchParams.get("variantId");
    if (variantId) {
      const variant = await ctx.runQuery(internal.mcp.getPrototypeVariant, {
        variantId: variantId as Id<"prototypeVariants">,
      });
      return jsonOk(variant);
    }
    if (!projectId) return jsonError("Missing projectId or variantId");
    const variants = await ctx.runQuery(internal.mcp.listPrototypeVariants, {
      projectId: projectId as Id<"projects">,
    });
    return jsonOk(variants);
  }),
});

// GET /mcp/prototypes/feedback?variantId=<id>
http.route({
  path: "/mcp/prototypes/feedback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const variantId = url.searchParams.get("variantId");
    if (!variantId) return jsonError("Missing variantId");
    const feedback = await ctx.runQuery(internal.mcp.getPrototypeFeedback, {
      variantId: variantId as Id<"prototypeVariants">,
    });
    return jsonOk(feedback);
  }),
});

// POST /mcp/prototypes/post-to-slack
http.route({
  path: "/mcp/prototypes/post-to-slack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    if (!body.variantId) return jsonError("Missing variantId");
    // Schedule the action (can't run an action directly from an httpAction — use scheduler)
    await ctx.scheduler.runAfter(0, internal.prototypes.postPrototypeToSlackInternal, {
      variantId: body.variantId as Id<"prototypeVariants">,
    });
    return jsonOk({ ok: true, message: "Posting to Slack scheduled." });
  }),
});

// POST /mcp/prototypes/ingest-feedback
http.route({
  path: "/mcp/prototypes/ingest-feedback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    if (!body.variantId) return jsonError("Missing variantId");
    await ctx.scheduler.runAfter(0, internal.prototypes.ingestPrototypeFeedbackInternal, {
      variantId: body.variantId as Id<"prototypeVariants">,
    });
    return jsonOk({ ok: true, message: "Feedback ingestion scheduled." });
  }),
});

// POST /mcp/prototypes/iterate
http.route({
  path: "/mcp/prototypes/iterate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    if (!body.variantId) return jsonError("Missing variantId");
    await ctx.scheduler.runAfter(0, internal.prototypes.iteratePrototypeInternal, {
      variantId: body.variantId as Id<"prototypeVariants">,
      instructions: body.instructions as string | undefined,
    });
    return jsonOk({ ok: true, message: "Prototype iteration scheduled." });
  }),
});

// GET /mcp/knowledge
http.route({
  path: "/mcp/knowledge",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? undefined;
    const entries = await ctx.runQuery(internal.mcp.listKnowledge, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      type,
    });
    return jsonOk(entries);
  }),
});

// POST /mcp/memory
http.route({
  path: "/mcp/memory",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = await ctx.runMutation(internal.mcp.storeMemory, {
      workspaceId: WORKSPACE_ID as Id<"workspaces">,
      projectId: body.projectId as Id<"projects"> | undefined,
      type: body.type as string,
      content: body.content as string,
    });
    return jsonOk({ id });
  }),
});

// GET /mcp/memory
http.route({
  path: "/mcp/memory",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId") ?? undefined;
    const type = url.searchParams.get("type") ?? undefined;
    const entries = projectId
      ? await ctx.runQuery(internal.mcp.getProjectMemory, {
          projectId: projectId as Id<"projects">,
          type,
        })
      : await ctx.runQuery(internal.mcp.getWorkspaceMemory, {
          workspaceId: WORKSPACE_ID as Id<"workspaces">,
          type,
        });
    return jsonOk(entries);
  }),
});

// ── Chat streaming ────────────────────────────────────────────────────────────

http.route({
  path: "/api/chat/stream",
  method: "POST",
  handler: streamResponse,
});

export default http;
