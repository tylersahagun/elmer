import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { streamResponse } from "./chat";
import { resolveWorkspaceId } from "./httpUtils";

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
    const workspaceId = resolveWorkspaceId({
      request,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const projects = await ctx.runQuery(internal.mcp.listProjects, {
      workspaceId: workspaceId as Id<"workspaces">,
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
    const workspaceId = resolveWorkspaceId({
      request,
      body,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const id = await ctx.runMutation(internal.mcp.createProject, {
      workspaceId: workspaceId as Id<"workspaces">,
      name: body.name as string,
      description: body.description as string | undefined,
      stage: (body.stage as string | undefined) ?? "inbox",
      priority: (body.priority as string | undefined) ?? "P2",
      metadata: body.metadata,
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
      metadata: body.metadata,
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

// DELETE /mcp/project?id=<projectId>
http.route({
  path: "/mcp/project",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError("Missing id");
    await ctx.runMutation(internal.mcp.deleteProject, {
      projectId: id as Id<"projects">,
    });
    return jsonOk({ id });
  }),
});

// GET /mcp/project-prototypes?projectId=<projectId>
http.route({
  path: "/mcp/project-prototypes",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return jsonError("Missing projectId");
    const rows = await ctx.runQuery(internal.mcp.listProjectPrototypes, {
      projectId: projectId as Id<"projects">,
    });
    return jsonOk(rows);
  }),
});

// GET /mcp/project-signals?projectId=<projectId>
http.route({
  path: "/mcp/project-signals",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return jsonError("Missing projectId");
    const rows = await ctx.runQuery(internal.mcp.listProjectSignals, {
      projectId: projectId as Id<"projects">,
    });
    return jsonOk(rows);
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
    const workspaceId = resolveWorkspaceId({
      request,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const jobs = await ctx.runQuery(internal.mcp.listJobs, {
      workspaceId: workspaceId as Id<"workspaces">,
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
    const workspaceId = resolveWorkspaceId({
      request,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const questions = await ctx.runQuery(internal.mcp.listPendingQuestions, {
      workspaceId: workspaceId as Id<"workspaces">,
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

// GET /mcp/workspaces
http.route({
  path: "/mcp/workspaces",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const clerkUserId = url.searchParams.get("clerkUserId");
    const email = url.searchParams.get("email");
    if (!clerkUserId) return jsonError("Missing clerkUserId");
    const workspaces = await ctx.runQuery(internal.mcp.listWorkspacesForActor, {
      clerkUserId,
      email: email ?? undefined,
    });
    return jsonOk(workspaces);
  }),
});

// POST /mcp/workspaces
http.route({
  path: "/mcp/workspaces",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    if (!body.clerkUserId || !body.name || !body.slug) {
      return jsonError("Missing clerkUserId, name, or slug");
    }

    const workspace = await ctx.runMutation(
      internal.mcp.createWorkspaceForActor,
      {
        clerkUserId: body.clerkUserId as string,
        name: body.name as string,
        slug: body.slug as string,
        description: body.description as string | undefined,
        contextPath: body.contextPath as string | undefined,
        githubRepo: body.githubRepo as string | undefined,
        settings: body.settings,
        clerkOrgId: body.clerkOrgId as string | undefined,
        actorUserId: body.actorUserId as string | undefined,
        actorEmail: body.actorEmail as string | undefined,
        actorName: body.actorName as string | undefined,
        actorImage: body.actorImage as string | undefined,
      },
    );

    await ctx.runMutation(internal.mcp.ensureDefaultColumnConfigs, {
      workspaceId: workspace.id as Id<"workspaces">,
    });

    return jsonOk(workspace);
  }),
});

// GET /mcp/workspace
http.route({
  path: "/mcp/workspace",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const workspace = await ctx.runQuery(internal.mcp.getWorkspace, {
      workspaceId: workspaceId as Id<"workspaces">,
    });
    return jsonOk(workspace);
  }),
});

// PATCH /mcp/workspace
http.route({
  path: "/mcp/workspace",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const workspace = await ctx.runMutation(internal.mcp.updateWorkspace, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      name: body.name as string | undefined,
      description: body.description as string | undefined,
      contextPath: body.contextPath as string | undefined,
      githubRepo: body.githubRepo as string | undefined,
      settings: body.settings,
    });
    return jsonOk(workspace);
  }),
});

// GET /mcp/workspace-access
http.route({
  path: "/mcp/workspace-access",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    const clerkUserId = url.searchParams.get("clerkUserId");
    if (!workspaceId || !clerkUserId) return jsonError("Missing workspaceId or clerkUserId");
    const result = await ctx.runQuery(internal.mcp.getWorkspaceAccess, {
      workspaceId: workspaceId as Id<"workspaces">,
      clerkUserId,
    });
    return jsonOk(result);
  }),
});

// GET /mcp/workspace-members
http.route({
  path: "/mcp/workspace-members",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const members = await ctx.runQuery(internal.mcp.listWorkspaceMembers, {
      workspaceId: workspaceId as Id<"workspaces">,
    });
    return jsonOk(members);
  }),
});

// GET /mcp/workspace-invitations
http.route({
  path: "/mcp/workspace-invitations",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const invitations = await ctx.runQuery(internal.mcp.listWorkspaceInvitations, {
      workspaceId: workspaceId as Id<"workspaces">,
    });
    return jsonOk(invitations);
  }),
});

// POST /mcp/workspace-invitations
http.route({
  path: "/mcp/workspace-invitations",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const invitation = await ctx.runMutation(internal.mcp.createWorkspaceInvitation, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      email: body.email as string,
      role: body.role as string,
      invitedBy: body.invitedBy as string | undefined,
      inviterName: body.inviterName as string | undefined,
      inviterEmail: body.inviterEmail as string | undefined,
    });
    return jsonOk(invitation);
  }),
});

// GET /mcp/workspace-activity
http.route({
  path: "/mcp/workspace-activity",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const rows = await ctx.runQuery(internal.mcp.listWorkspaceActivity, {
      workspaceId: workspaceId as Id<"workspaces">,
      limit,
      offset,
    });
    return jsonOk(rows);
  }),
});

// GET /mcp/columns
http.route({
  path: "/mcp/columns",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const rows = await ctx.runQuery(internal.mcp.listColumnConfigs, {
      workspaceId: workspaceId as Id<"workspaces">,
    });
    return jsonOk(rows);
  }),
});

// GET /mcp/personas
http.route({
  path: "/mcp/personas",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const rows = await ctx.runQuery(internal.mcp.listPersonas, {
      workspaceId: workspaceId as Id<"workspaces">,
    });
    return jsonOk(rows);
  }),
});

// POST /mcp/personas
http.route({
  path: "/mcp/personas",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const row = await ctx.runMutation(internal.mcp.upsertPersona, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      archetypeId: body.archetypeId as string,
      name: body.name as string,
      description: body.description as string,
      role: body.role,
      pains: body.pains as string[],
      successCriteria: body.successCriteria as string[],
      evaluationHeuristics: body.evaluationHeuristics as string[],
      typicalTools: body.typicalTools as string[],
      fears: body.fears as string[],
      psychographicRanges: body.psychographicRanges,
      content: body.content as string,
      filePath: body.filePath as string | undefined,
    });
    return jsonOk(row);
  }),
});

// GET /mcp/signal-personas
http.route({
  path: "/mcp/signal-personas",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const signalId = url.searchParams.get("signalId");
    if (!signalId) return jsonError("Missing signalId");
    const rows = await ctx.runQuery(internal.mcp.listSignalPersonas, {
      signalId: signalId as Id<"signals">,
    });
    return jsonOk(rows);
  }),
});

// POST /mcp/signal-personas
http.route({
  path: "/mcp/signal-personas",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = await ctx.runMutation(internal.mcp.linkSignalPersona, {
      signalId: body.signalId as Id<"signals">,
      personaId: body.personaId as Id<"personas">,
      linkedBy: body.linkedBy as string | undefined,
    });
    return jsonOk({ id });
  }),
});

// DELETE /mcp/signal-personas
http.route({
  path: "/mcp/signal-personas",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const signalId = url.searchParams.get("signalId");
    const personaId = url.searchParams.get("personaId");
    if (!signalId || !personaId) return jsonError("Missing signalId or personaId");
    const id = await ctx.runMutation(internal.mcp.unlinkSignalPersona, {
      signalId: signalId as Id<"signals">,
      personaId: personaId as Id<"personas">,
    });
    return jsonOk({ id });
  }),
});

// GET /mcp/search
http.route({
  path: "/mcp/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    const q = url.searchParams.get("q");
    if (!workspaceId || !q) return jsonError("Missing workspaceId or q");
    const rows = await ctx.runQuery(internal.mcp.searchWorkspace, {
      workspaceId: workspaceId as Id<"workspaces">,
      q,
    });
    return jsonOk(rows);
  }),
});

// GET /mcp/runtime-context
http.route({
  path: "/mcp/runtime-context",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonError("Missing workspaceId");
    const types = url.searchParams.get("types")?.split(",").filter(Boolean);
    const rows = await ctx.runQuery(internal.mcp.listWorkspaceRuntimeContext, {
      workspaceId: workspaceId as Id<"workspaces">,
      types,
    });
    return jsonOk(rows);
  }),
});

// GET /mcp/project-runtime-context
http.route({
  path: "/mcp/project-runtime-context",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return jsonError("Missing projectId");
    const q = url.searchParams.get("q") ?? undefined;
    const rows = await ctx.runQuery(internal.mcp.getProjectRuntimeContext, {
      projectId: projectId as Id<"projects">,
      q,
    });
    return jsonOk(rows);
  }),
});

// POST /mcp/columns
http.route({
  path: "/mcp/columns",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const row = await ctx.runMutation(internal.mcp.createColumnConfig, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      stage: body.stage as string,
      displayName: body.displayName as string,
      order: body.order as number,
      color: body.color as string | undefined,
      autoTriggerJobs: body.autoTriggerJobs as string[] | undefined,
      agentTriggers: body.agentTriggers as unknown[] | undefined,
      requiredDocuments: body.requiredDocuments as string[] | undefined,
      requiredApprovals: body.requiredApprovals as number | undefined,
      aiIterations: body.aiIterations as number | undefined,
      rules: body.rules,
      humanInLoop: body.humanInLoop as boolean | undefined,
      enabled: body.enabled as boolean | undefined,
      graduationCriteria: body.graduationCriteria,
      enforceGraduation: body.enforceGraduation as boolean | undefined,
    });
    return jsonOk(row);
  }),
});

// POST /mcp/columns/ensure-defaults
http.route({
  path: "/mcp/columns/ensure-defaults",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const rows = await ctx.runMutation(internal.mcp.ensureDefaultColumnConfigs, {
      workspaceId: body.workspaceId as Id<"workspaces">,
    });
    return jsonOk(rows);
  }),
});

// PATCH /mcp/column
http.route({
  path: "/mcp/column",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const row = await ctx.runMutation(internal.mcp.updateColumnConfig, {
      columnId: body.columnId as Id<"columnConfigs">,
      displayName: body.displayName as string | undefined,
      order: body.order as number | undefined,
      color: body.color as string | undefined,
      autoTriggerJobs: body.autoTriggerJobs as string[] | undefined,
      agentTriggers: body.agentTriggers as unknown[] | undefined,
      requiredDocuments: body.requiredDocuments as string[] | undefined,
      requiredApprovals: body.requiredApprovals as number | undefined,
      aiIterations: body.aiIterations as number | undefined,
      rules: body.rules,
      humanInLoop: body.humanInLoop as boolean | undefined,
      enabled: body.enabled as boolean | undefined,
      graduationCriteria: body.graduationCriteria,
      enforceGraduation: body.enforceGraduation as boolean | undefined,
    });
    return jsonOk(row);
  }),
});

// DELETE /mcp/column
http.route({
  path: "/mcp/column",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const columnId = url.searchParams.get("columnId");
    if (!columnId) return jsonError("Missing columnId");
    const row = await ctx.runMutation(internal.mcp.deleteColumnConfig, {
      columnId: columnId as Id<"columnConfigs">,
    });
    return jsonOk(row);
  }),
});

// POST /mcp/workspace-activity
http.route({
  path: "/mcp/workspace-activity",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const result = await ctx.runMutation(internal.mcp.createWorkspaceActivity, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      userId: body.userId as string | undefined,
      action: body.action as string,
      targetType: body.targetType as string | undefined,
      targetId: body.targetId as string | undefined,
      metadata: body.metadata,
      actorName: body.actorName as string | undefined,
      actorEmail: body.actorEmail as string | undefined,
      actorImage: body.actorImage as string | undefined,
    });
    return jsonOk({ id: result });
  }),
});

// DELETE /mcp/workspace-invitations
http.route({
  path: "/mcp/workspace-invitations",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const invitationId = url.searchParams.get("invitationId");
    if (!invitationId) return jsonError("Missing invitationId");
    const result = await ctx.runMutation(internal.mcp.revokeWorkspaceInvitation, {
      invitationId: invitationId as Id<"invitations">,
    });
    return jsonOk(result);
  }),
});

// GET /mcp/invitation
http.route({
  path: "/mcp/invitation",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) return jsonError("Missing token");
    const invitation = await ctx.runQuery(internal.mcp.getInvitationByToken, {
      token,
    });
    return jsonOk(invitation);
  }),
});

// POST /mcp/invitation/accept
http.route({
  path: "/mcp/invitation/accept",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const result = await ctx.runMutation(internal.mcp.acceptInvitationByToken, {
      token: body.token as string,
      userId: body.userId as string | undefined,
      clerkUserId: body.clerkUserId as string,
      email: body.email as string,
      name: body.name as string | undefined,
      image: body.image as string | undefined,
    });
    return jsonOk(result);
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
    const workspaceId = resolveWorkspaceId({
      request,
      body,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const id = await ctx.runMutation(internal.mcp.seedInboxItem, {
      workspaceId: workspaceId as Id<"workspaces">,
      seedTag: body.seedTag as string | undefined,
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
    const workspaceId = resolveWorkspaceId({
      request,
      body,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const result = await ctx.runMutation(internal.mcp.seedPendingQuestionScenario, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: body.projectId as Id<"projects"> | undefined,
      seedTag: body.seedTag as string | undefined,
      questionType: body.questionType as string | undefined,
      questionText: body.questionText as string,
      choices: body.choices as string[] | undefined,
      scenario: body.scenario as string | undefined,
    });
    return jsonOk(result);
  }),
});

// POST /mcp/e2e/agent-run
// Seed a deterministic, Convex-native HITL run for Playwright.
http.route({
  path: "/mcp/e2e/agent-run",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const workspaceId = resolveWorkspaceId({
      request,
      body,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const result = await ctx.runMutation(internal.mcp.seedStubAgentRun, {
      workspaceId: workspaceId as Id<"workspaces">,
      seedTag: body.seedTag as string,
      projectId: body.projectId as Id<"projects"> | undefined,
      projectName: body.projectName as string | undefined,
      questionText: body.questionText as string | undefined,
      choices: body.choices as string[] | undefined,
    });
    return jsonOk(result);
  }),
});

// POST /mcp/e2e/project-document
// Seed a deterministic Convex document for project-detail editor coverage.
http.route({
  path: "/mcp/e2e/project-document",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const workspaceId = resolveWorkspaceId({
      request,
      body,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const result = await ctx.runMutation(internal.mcp.seedProjectDocument, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: body.projectId as Id<"projects">,
      seedTag: body.seedTag as string,
      type: body.type as string,
      title: body.title as string,
      content: body.content as string,
    });
    return jsonOk(result);
  }),
});

// POST /mcp/e2e/cleanup
// Best-effort cleanup for tagged E2E records in a dedicated workspace.
http.route({
  path: "/mcp/e2e/cleanup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const workspaceId = resolveWorkspaceId({
      request,
      body,
      defaultWorkspaceId: WORKSPACE_ID,
    });
    const result = await ctx.runMutation(internal.mcp.cleanupSeededData, {
      workspaceId: workspaceId as Id<"workspaces">,
      seedTag: body.seedTag as string,
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
    const workspaceId = url.searchParams.get("workspaceId");
    const type = url.searchParams.get("type") ?? undefined;
    if (!workspaceId) return jsonError("Missing workspaceId");
    const entries = await ctx.runQuery(internal.mcp.listKnowledge, {
      workspaceId: workspaceId as Id<"workspaces">,
      type,
    });
    return jsonOk(entries);
  }),
});

// POST /mcp/knowledge
http.route({
  path: "/mcp/knowledge",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    const entry = await ctx.runMutation(internal.mcp.upsertKnowledge, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      type: body.type as string,
      title: body.title as string,
      content: body.content as string,
      filePath: body.filePath as string | undefined,
    });
    return jsonOk(entry);
  }),
});

// DELETE /mcp/knowledge
http.route({
  path: "/mcp/knowledge",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError("Missing id");
    const result = await ctx.runMutation(internal.mcp.removeKnowledge, {
      id: id as Id<"knowledgebaseEntries">,
    });
    return jsonOk(result);
  }),
});

// POST /mcp/memory
http.route({
  path: "/mcp/memory",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const body = await request.json() as Record<string, unknown>;
    if (!body.workspaceId) return jsonError("Missing workspaceId");
    const id = await ctx.runMutation(internal.mcp.storeMemory, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      projectId: body.projectId as Id<"projects"> | undefined,
      type: body.type as string,
      content: body.content as string,
      metadata: body.metadata,
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

// GET /mcp/documents?id=<documentId>
http.route({
  path: "/mcp/documents",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!checkMcpAuth(request)) return jsonError("Unauthorized", 401);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError("Missing id param");
    const doc = await ctx.runQuery(internal.mcp.getDocument, {
      documentId: id as Id<"documents">,
    });
    if (!doc) return jsonError("Document not found", 404);
    return jsonOk(doc);
  }),
});

export default http;
