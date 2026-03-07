/**
 * Agent execution, resume, and sync — all in one module so Convex
 * scheduler references work as internal.agents.run, internal.agents.resume, etc.
 */

import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import { buildServerTools, getAnthropicTools, resolveModel } from "./tools/index";
import { getGitHubHeaders } from "./tools/githubAuth";
import type { Id } from "./_generated/dataModel";
import {
  buildStubJobInput,
  STUB_HITL_INITIAL_LOGS,
  STUB_HITL_RESUME_LOGS,
  STUB_HITL_SCENARIO,
} from "./e2eHelpers";

const MAX_ITERATIONS = 15;
const STUB_HITL_OUTPUT =
  "Deterministic HITL stub completed successfully. Approval was recorded and the seeded execution resumed.";

function isStubHitlJob(
  input: unknown,
): input is Record<string, unknown> & { seedTag: string; stubScenario: string } {
  return (
    typeof input === "object" &&
    input !== null &&
    (input as Record<string, unknown>).stubScenario === STUB_HITL_SCENARIO &&
    typeof (input as Record<string, unknown>).seedTag === "string"
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(
  agentContent: string,
  companyContext: Record<string, string>,
  projectTldr?: string,
  graphContext?: string,
): string {
  const parts: string[] = [];
  if (companyContext["company_context"])
    parts.push(`## Product Vision\n${companyContext["company_context"]}`);
  if (companyContext["strategic_guardrails"])
    parts.push(`## Strategic Guardrails\n${companyContext["strategic_guardrails"]}`);
  if (companyContext["personas"])
    parts.push(`## Personas\n${companyContext["personas"]}`);
  if (projectTldr)
    parts.push(`## Current Project\n${projectTldr}`);
  if (graphContext)
    parts.push(`## Project Graph Context\n${graphContext}`);

  return agentContent + (parts.length
    ? `\n\n---\n\n# Context\n\n${parts.join("\n\n")}`
    : "");
}

function buildUserMessage(input: Record<string, unknown>, agentName: string): string {
  const parts = [`Run the ${agentName} agent.`];
  if (input.command) parts.push(`\nCommand: ${input.command}`);
  if (input.args) parts.push(`Args: ${input.args}`);
  if (input.transcript) parts.push(`\n## Transcript\n${input.transcript}`);
  if (input.rawInput) parts.push(`\n## Input\n${input.rawInput}`);
  if (input.feedback) parts.push(`\n## Feedback\n${input.feedback}`);
  const skip = new Set(["command", "args", "transcript", "rawInput", "feedback",
    "agentDefinitionId", "projectId", "workspaceId"]);
  for (const [k, v] of Object.entries(input)) {
    if (!skip.has(k) && v != null)
      parts.push(`\n## ${k}\n${typeof v === "string" ? v : JSON.stringify(v, null, 2)}`);
  }
  return parts.join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadContext(ctx: any, workspaceId: Id<"workspaces">, projectId?: Id<"projects">) {
  const kbEntries = await ctx.runQuery(api.knowledgebase.listByWorkspace, { workspaceId });
  const companyContext: Record<string, string> = {};
  for (const e of kbEntries) companyContext[e.type] = e.content;

  let projectTldr: string | undefined;
  let graphContext: string | undefined;

  if (projectId) {
    const project = await ctx.runQuery(api.projects.get, { projectId });
    projectTldr = (project?.metadata as Record<string, unknown> | undefined)?.tldr as string | undefined;

    // GTM-47: Load graph context for richer project understanding
    try {
      const graphData = await ctx.runQuery(api.graph.getNodeByEntity, {
        entityType: "project",
        entityId: projectId as unknown as string,
      });

      if (graphData) {
        // Get observations (summaries)
        const observations = await ctx.runQuery(api.graph.getObservations, {
          nodeId: graphData._id,
          depth: 0,
        });
        if (observations.length > 0) {
          graphContext = observations.map((o: { content: string }) => o.content).join("\n\n");
        }

        // Reinforce on access
        await ctx.runMutation(internal.graph.reinforceNode, { nodeId: graphData._id });
      }
    } catch { /* graph context is optional — don't fail the whole run */ }
  }

  return { companyContext, projectTldr, graphContext };
}

// ── Core agentic loop (shared by run + resume) ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runLoop(
  ctx: any,
  jobId: Id<"jobs">,
  executionId: Id<"agentExecutions">,
  systemPrompt: string,
  initialMessages: Anthropic.MessageParam[],
  existingToolCalls: Array<{ name: string; input: Record<string, unknown>; output: unknown; durationMs: number }>,
  job: { workspaceId: Id<"workspaces">; projectId?: Id<"projects"> | null; type: string; input: unknown },
  agentDef: { metadata?: unknown } | null,
) {
  const catalog = buildServerTools(ctx, {
    jobId,
    workspaceId: job.workspaceId,
    projectId: job.projectId ?? undefined,
    executionId,
  });
  const anthropicTools = getAnthropicTools(catalog);
  const model = resolveModel(
    (agentDef?.metadata as Record<string, unknown> | undefined)?.model as string | undefined,
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let messages = initialMessages;
  const allToolCalls = existingToolCalls;
  let tokensUsed = 0;
  let finalOutput: unknown = null;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    await ctx.runMutation(api.jobs.appendLog, {
      jobId, workspaceId: job.workspaceId,
      level: "info", message: `Iteration ${i + 1}`,
      stepKey: `iter_${i + 1}`,
    });

    const response = await anthropic.messages.create({
      model, max_tokens: 4096,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      tools: anthropicTools as Anthropic.Tool[],
      messages,
    });

    tokensUsed += response.usage.input_tokens + response.usage.output_tokens;
    for (const b of response.content) { if (b.type === "text") finalOutput = b.text; }

    const toolBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (!toolBlocks.length || response.stop_reason === "end_turn") break;

    messages = [...messages, { role: "assistant" as const, content: response.content }];
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolBlocks) {
      const tool = catalog[block.name];
      const tStart = Date.now();

      await ctx.runMutation(api.jobs.appendLog, {
        jobId, workspaceId: job.workspaceId,
        level: "info", message: `Tool: ${block.name}`, stepKey: block.name,
        meta: { input: block.input },
      });

      let result: unknown; let isError = false;
      try {
        result = tool ? await tool.execute(block.input as Record<string, unknown>) : { error: `Unknown: ${block.name}` };
      } catch (e) { result = { error: e instanceof Error ? e.message : String(e) }; isError = true; }

      // HITL pause
      if (result !== null && typeof result === "object" && "requiresInput" in (result as object)
        && (result as { requiresInput: boolean }).requiresInput) {
        const pauseMessages = [...messages, { role: "assistant" as const, content: response.content }];
        await ctx.runMutation(internal.agentExecutions.update, {
          id: executionId, toolCalls: allToolCalls,
          messageHistory: JSON.stringify(pauseMessages),
          pausedAtToolCallId: block.id,
        });
        await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "waiting_input" });
        await ctx.runMutation(api.jobs.appendLog, {
          jobId, workspaceId: job.workspaceId,
          level: "info", message: "Paused — awaiting human input", stepKey: "hitl_pause",
        });
        return { paused: true, tokensUsed };
      }

      allToolCalls.push({ name: block.name, input: block.input as Record<string, unknown>, output: result, durationMs: Date.now() - tStart });
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: isError ? `Error: ${JSON.stringify(result)}` : JSON.stringify(result), is_error: isError });
    }

    messages = [...messages, { role: "user" as const, content: toolResults }];
  }

  return { paused: false, finalOutput, tokensUsed, allToolCalls };
}

// ── run ───────────────────────────────────────────────────────────────────────

export const run = internalAction({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(api.jobs.get, { jobId });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    if (isStubHitlJob(job.input)) {
      const executionId = await ctx.runMutation(internal.agentExecutions.create, {
        jobId,
        workspaceId: job.workspaceId,
        projectId: job.projectId ?? undefined,
        inputContext: buildStubJobInput(job.input.seedTag),
      });
      const questionId = await ctx.runMutation(internal.pendingQuestions.create, {
        jobId,
        workspaceId: job.workspaceId,
        projectId: job.projectId ?? undefined,
        questionType: "approval",
        questionText: `Approve the deterministic stub execution for ${job.input.seedTag}?`,
        choices: ["approve", "reject"],
        context: { seedTag: job.input.seedTag },
      });

      await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "waiting_input" });
      for (const entry of STUB_HITL_INITIAL_LOGS) {
        await ctx.runMutation(api.jobs.appendLog, {
          jobId,
          workspaceId: job.workspaceId,
          level: entry.level,
          message: entry.message,
          stepKey: entry.stepKey,
          meta: { questionId, seedTag: job.input.seedTag },
        });
      }
      await ctx.runMutation(internal.agentExecutions.update, {
        id: executionId,
        messageHistory: JSON.stringify([
          {
            role: "user",
            content: `Stub HITL scenario ${job.input.seedTag} seeded for deterministic testing.`,
          },
        ]),
      });
      return;
    }

    await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "running" });
    await ctx.runMutation(api.jobs.appendLog, { jobId, workspaceId: job.workspaceId, level: "info", message: `Started: ${job.type}` });

    try {
      const agentDefId = (job.input as Record<string, unknown>)?.agentDefinitionId as Id<"agentDefinitions"> | undefined;
      const agentDef = agentDefId ? await ctx.runQuery(api.agentDefinitions.get, { id: agentDefId }) : null;
      const { companyContext, projectTldr, graphContext } = await loadContext(ctx as any, job.workspaceId, job.projectId ?? undefined);

      const executionId = await ctx.runMutation(internal.agentExecutions.create, {
        jobId, workspaceId: job.workspaceId, projectId: job.projectId ?? undefined,
        agentDefinitionId: agentDefId,
        inputContext: { input: job.input, startedAt: Date.now() },
      });

      const systemPrompt = buildSystemPrompt(agentDef?.content ?? `You are an AI PM assistant for ${job.type}.`, companyContext, projectTldr, graphContext);
      const userMessage = buildUserMessage((job.input as Record<string, unknown>) ?? {}, agentDef?.name ?? job.type);

      const result = await runLoop(
        ctx as any, jobId, executionId, systemPrompt,
        [{ role: "user", content: userMessage }], [], job as any, agentDef,
      );

      if (result?.paused) return;

      const { finalOutput, tokensUsed, allToolCalls } = result!;
      await ctx.runMutation(internal.agentExecutions.update, {
        id: executionId, toolCalls: allToolCalls, output: finalOutput,
        tokensUsed, completedAt: Date.now(),
      });
      await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "completed", output: { content: finalOutput } });
      await ctx.runMutation(api.jobs.appendLog, { jobId, workspaceId: job.workspaceId, level: "info", message: `Completed. ${allToolCalls?.length ?? 0} tool calls, ${tokensUsed} tokens.`, stepKey: "completed" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "failed", errorMessage: msg });
      await ctx.runMutation(api.jobs.appendLog, { jobId, workspaceId: job.workspaceId, level: "error", message: `Failed: ${msg}`, stepKey: "failed" });
      throw e;
    }
  },
});

// ── resume ────────────────────────────────────────────────────────────────────

export const resume = internalAction({
  args: { jobId: v.id("jobs"), questionId: v.id("pendingQuestions") },
  handler: async (ctx, { jobId, questionId }) => {
    const job = await ctx.runQuery(api.jobs.get, { jobId });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    if (isStubHitlJob(job.input)) {
      const questions = await ctx.runQuery(internal.pendingQuestions.getByJobInternal, {
        jobId,
      });
      const answeredQ = questions.find((q: { _id: string }) => q._id === questionId);
      const execution = await ctx.runQuery(
        internal.agentExecutions.getByJobInternal,
        { jobId },
      );

      await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "running" });
      await ctx.runMutation(api.jobs.appendLog, {
        jobId,
        workspaceId: job.workspaceId,
        level: "info",
        message: "Resumed after HITL answer",
        stepKey: "resumed",
      });

      for (const entry of STUB_HITL_RESUME_LOGS) {
        await ctx.runMutation(api.jobs.appendLog, {
          jobId,
          workspaceId: job.workspaceId,
          level: entry.level,
          message: entry.message,
          stepKey: entry.stepKey,
          meta: {
            response: answeredQ?.response ?? null,
            seedTag: job.input.seedTag,
          },
        });
      }

      if (execution) {
        await ctx.runMutation(internal.agentExecutions.update, {
          id: execution._id,
          output: {
            content: STUB_HITL_OUTPUT,
            response: answeredQ?.response ?? null,
            seedTag: job.input.seedTag,
          },
          tokensUsed: 0,
          completedAt: Date.now(),
        });
      }

      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "completed",
        output: {
          content: STUB_HITL_OUTPUT,
          response: answeredQ?.response ?? null,
          seedTag: job.input.seedTag,
        },
      });
      return;
    }

    const questions = await ctx.runQuery(internal.pendingQuestions.getByJobInternal, {
      jobId,
    });
    const answeredQ = questions.find((q: { _id: string }) => q._id === questionId);
    const execution = await ctx.runQuery(internal.agentExecutions.getByJobInternal, {
      jobId,
    });
    if (!execution) { await ctx.scheduler.runAfter(0, internal.agents.run, { jobId }); return; }

    await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "running" });
    await ctx.runMutation(api.jobs.appendLog, { jobId, workspaceId: job.workspaceId, level: "info", message: `Resumed after HITL answer`, stepKey: "resumed" });

    try {
      const savedHistory = (execution as unknown as { messageHistory?: string }).messageHistory;
      if (!savedHistory) { await ctx.scheduler.runAfter(0, internal.agents.run, { jobId }); return; }

      let messages: Anthropic.MessageParam[] = JSON.parse(savedHistory);
      const pausedId = (execution as unknown as { pausedAtToolCallId?: string }).pausedAtToolCallId;
      if (pausedId && answeredQ) {
        messages = [...messages, {
          role: "user",
          content: [{ type: "tool_result", tool_use_id: pausedId, content: JSON.stringify({ response: answeredQ.response }) }],
        }];
      }

      const agentDefId = (job.input as Record<string, unknown>)?.agentDefinitionId as Id<"agentDefinitions"> | undefined;
      const agentDef = agentDefId ? await ctx.runQuery(api.agentDefinitions.get, { id: agentDefId }) : null;
      const { companyContext, projectTldr, graphContext } = await loadContext(ctx as any, job.workspaceId, job.projectId ?? undefined);
      const systemPrompt = buildSystemPrompt(agentDef?.content ?? "You are an AI PM assistant.", companyContext, projectTldr, graphContext);

      const result = await runLoop(
        ctx as any, jobId, execution._id, systemPrompt, messages,
        (execution.toolCalls ?? []) as Array<{ name: string; input: Record<string, unknown>; output: unknown; durationMs: number }>,
        job as any, agentDef,
      );

      if (result?.paused) return;

      const { finalOutput, tokensUsed, allToolCalls } = result!;
      await ctx.runMutation(internal.agentExecutions.update, { id: execution._id, toolCalls: allToolCalls, output: finalOutput, tokensUsed, completedAt: Date.now() });
      await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "completed", output: { content: finalOutput } });
      await ctx.runMutation(api.jobs.appendLog, { jobId, workspaceId: job.workspaceId, level: "info", message: `Completed after resume.`, stepKey: "completed" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(api.jobs.updateStatus, { jobId, status: "failed", errorMessage: msg });
      await ctx.runMutation(api.jobs.appendLog, { jobId, workspaceId: job.workspaceId, level: "error", message: `Resume failed: ${msg}`, stepKey: "failed" });
      throw e;
    }
  },
});

// ── sync ──────────────────────────────────────────────────────────────────────

// The pm-workspace-docs and .cursor/ agent definitions live in the elmer repo itself.
// AGENT-BRIEF describes a future separation into AskElephant/pm-workspace, but for now
// all content is in tylersahagun/elmer.
const PM_WORKSPACE_REPO = "tylersahagun/elmer";

function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      const val = rest.join(":").trim();
      if (val.startsWith("[") && val.endsWith("]"))
        meta[key.trim()] = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      else meta[key.trim()] = val.replace(/^["']|["']$/g, "");
    }
  }
  return { meta, body: match[2].trim() };
}

const SYNC_PATHS = [
  { prefix: ".cursor/agents/", type: "subagent" as const },
  { prefix: ".cursor/skills/", type: "skill" as const },
  { prefix: ".cursor/commands/", type: "command" as const },
  { prefix: ".cursor/rules/", type: "rule" as const },
];

// ── GTM-45: Graph edge parsing ────────────────────────────────────────────────

interface ParsedEdge {
  relationType: string;
  targetName: string;
}

/**
 * Extract graph relationships from agent/command/skill markdown content.
 * Looks for:
 *   - "Delegates to: [agent-name]" / "**Delegates to:** `agent-name`"
 *   - "Uses skill: skill-name"
 *   - "@elmer-docs/company-context/..." (reads_context)
 *   - "produces: [document-type]" in frontmatter
 *   - "human_gate: ..." in frontmatter
 *   - "Invoke for /command-name" (triggers command)
 */
function parseGraphEdges(content: string, meta: Record<string, unknown>): ParsedEdge[] {
  const edges: ParsedEdge[] = [];
  const seen = new Set<string>();

  const add = (relationType: string, targetName: string) => {
    const key = `${relationType}:${targetName}`;
    if (!seen.has(key)) { seen.add(key); edges.push({ relationType, targetName }); }
  };

  // delegates_to — various patterns from agent files
  const delegatePatterns = [
    /[Dd]elegates?\s+to[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
    /\*\*[Dd]elegates?\s+to[:\s]*\*\*\s+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
    /Subagent[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
  ];
  for (const pattern of delegatePatterns) {
    for (const m of content.matchAll(pattern)) {
      add("delegates_to", m[1].trim());
    }
  }

  // uses_skill
  const skillPatterns = [
    /[Uu]ses?\s+skill[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
    /[Ss]kill[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
  ];
  for (const pattern of skillPatterns) {
    for (const m of content.matchAll(pattern)) {
      add("uses_skill", m[1].trim());
    }
  }

  // reads_context — @elmer-docs/company-context/* or pm-workspace-docs/company-context/*
  for (const m of content.matchAll(/@(?:elmer-docs|pm-workspace-docs)\/company-context\/([^\s\)]+)/g)) {
    add("reads_context", m[1].trim());
  }
  for (const m of content.matchAll(/`(?:elmer-docs|pm-workspace-docs)\/company-context\/([^\s`]+)`/g)) {
    add("reads_context", m[1].trim());
  }

  // produces — from frontmatter metadata
  const produced = meta.producedArtifacts ?? meta.produces;
  if (Array.isArray(produced)) {
    for (const p of produced) { if (typeof p === "string") add("produces", p); }
  } else if (typeof produced === "string") {
    add("produces", produced);
  }

  // human_gate
  const gate = meta.humanGate ?? meta.human_gate;
  if (gate && typeof gate === "string") add("human_gate", gate);

  // triggers — "Invoke for /command-name" patterns
  for (const m of content.matchAll(/[Ii]nvoke for\s+`?\/([a-z][a-z0-9-]+)`?/g)) {
    add("triggers", m[1].trim());
  }

  return edges;
}

async function doSync(workspaceId: Id<"workspaces">, ctx: any) {
  let headers: Record<string, string>;
  try {
    headers = await getGitHubHeaders();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "GitHub not configured" };
  }

  const treeRes = await fetch(
    `https://api.github.com/repos/${PM_WORKSPACE_REPO}/git/trees/HEAD?recursive=1`,
    { headers },
  );
  if (!treeRes.ok) return { error: `GitHub tree error ${treeRes.status}` };
  const treeData = await treeRes.json() as { tree: Array<{ path: string; type: string; sha: string }> };

  const mdFiles = treeData.tree.filter(
    (f) => f.type === "blob" && f.path.endsWith(".md") &&
      SYNC_PATHS.some((s) => f.path.startsWith(s.prefix)),
  );

  let synced = 0;
  for (const file of mdFiles) {
    try {
      const classification = SYNC_PATHS.find((s) => file.path.startsWith(s.prefix))!;
      const [owner, repo] = PM_WORKSPACE_REPO.split("/");
      const fileRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        { headers },
      );
      if (!fileRes.ok) continue;
      const fileData = await fileRes.json() as { content: string };
      const raw = atob(fileData.content.replace(/\n/g, ""));
      const { meta, body } = parseFrontmatter(raw);
      const parts = file.path.split("/");
      const fileName = parts[parts.length - 1].replace(/\.md$/, "");
      const name = classification.type === "skill" ? parts[parts.length - 2] ?? fileName : fileName;

      const defId = await ctx.runMutation(api.agentDefinitions.upsert, {
        workspaceId, name, type: classification.type,
        content: body || raw,
        description: meta.description as string | undefined,
        triggers: meta.triggers as string[] | undefined,
        executionMode: (meta.executionMode as string | undefined) ?? "server",
        metadata: { filePath: file.path, githubSha: file.sha, model: meta.model },
      });

      // GTM-45: Auto-create a graph node for this agent definition (idempotent)
      // Use the agent name (not the Convex ID) as entityId so edges can cross-reference by name
      const nodeId = await ctx.runMutation(internal.graph.createNode, {
        workspaceId,
        entityType: classification.type,
        entityId: name,
        name,
        domain: meta.phase as string | undefined,
        accessWeight: 1.0,
        decayRate: 0.001, // agent definitions decay very slowly
        metadata: { filePath: file.path },
      });

      // GTM-45: Parse and create graph edges from content
      const edges = parseGraphEdges(body || raw, meta);
      for (const edge of edges) {
        // Find or create the target node (by name, any entity type)
        const targetNode = await ctx.runQuery(api.graph.getNodeByEntity, {
          entityType: edge.relationType === "delegates_to" ? "subagent"
            : edge.relationType === "uses_skill" ? "skill"
            : edge.relationType === "triggers" ? "command"
            : "context",
          entityId: edge.targetName,
        });

        if (targetNode) {
          await ctx.runMutation(internal.graph.createEdge, {
            workspaceId,
            fromNodeId: nodeId,
            toNodeId: targetNode._id,
            relationType: edge.relationType,
            weight: 1.0,
            confidence: 0.9,
            source: "agent",
          });
        }
      }

      synced++;
    } catch { /* continue */ }
  }
  return { synced };
}

export const syncAgents = action({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return doSync(workspaceId, ctx);
  },
});

export const syncAgentsInternal = internalAction({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => doSync(workspaceId, ctx),
});

export const syncWebhook = internalAction({
  args: { repoFullName: v.string() },
  handler: async (ctx, { repoFullName: _ }) => {
    const workspaces = await ctx.runQuery(api.workspaces.list, {});
    for (const ws of workspaces) {
      await ctx.scheduler.runAfter(0, internal.agents.syncAgentsInternal, { workspaceId: ws._id });
      await ctx.scheduler.runAfter(0, internal.agents.syncPmWorkspaceDocsInternal, { workspaceId: ws._id });
    }
  },
});

// ── PM Workspace Docs Sync ────────────────────────────────────────────────────
// GTM-44: Syncs pm-workspace-docs/ into Elmer's Convex DB.
// Sources:
//   company-context/   → knowledgebaseEntries
//   initiatives/active → projects + documents
//   feature-guides/    → knowledgebaseEntries (type: feature_guide)
//   hypotheses/        → knowledgebaseEntries (type: hypothesis)
//   personas/          → knowledgebaseEntries (type: persona)
//   roadmap/           → knowledgebaseEntries (type: roadmap)

// Map well-known company-context filenames to knowledgebase entry types
const CONTEXT_FILE_TYPES: Record<string, string> = {
  "product-vision.md": "company_context",
  "strategic-guardrails.md": "strategic_guardrails",
  "personas.md": "personas",
  "org-chart.md": "org_chart",
  "tyler-context.md": "team_context",
  "tech-stack.md": "tech_stack",
  "integrations.md": "integrations",
};

// Document types to sync from each initiative folder
const INITIATIVE_DOC_FILES: Record<string, string> = {
  "prd.md": "prd",
  "research.md": "research",
  "design-brief.md": "design_brief",
  "engineering-spec.md": "engineering_spec",
  "gtm-brief.md": "gtm_brief",
  "prototype-notes.md": "prototype_notes",
  "decisions.md": "decisions",
  "competitive-landscape.md": "competitive_landscape",
  "visual-directions.md": "visual_directions",
  "METRICS.md": "metrics",
};

interface SyncResults {
  knowledgebase: number;
  projects: number;
  documents: number;
  errors: number;
}

async function doPmWorkspaceDocSync(
  workspaceId: Id<"workspaces">,
  ctx: any,
): Promise<SyncResults> {
  let headers: Record<string, string>;
  try {
    headers = await getGitHubHeaders();
  } catch {
    return { knowledgebase: 0, projects: 0, documents: 0, errors: 1 };
  }

  const results: SyncResults = { knowledgebase: 0, projects: 0, documents: 0, errors: 0 };

  // Helper: fetch file content from GitHub
  async function fetchFile(path: string): Promise<string | null> {
    try {
      const [owner, repo] = PM_WORKSPACE_REPO.split("/");
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        { headers },
      );
      if (!res.ok) return null;
      const data = await res.json() as { content: string };
      return atob(data.content.replace(/\n/g, ""));
    } catch {
      return null;
    }
  }

  // Helper: list a directory
  async function listDir(path: string): Promise<Array<{ name: string; path: string; type: string }>> {
    try {
      const [owner, repo] = PM_WORKSPACE_REPO.split("/");
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        { headers },
      );
      if (!res.ok) return [];
      return await res.json() as Array<{ name: string; path: string; type: string }>;
    } catch {
      return [];
    }
  }

  // ── 1. company-context/ → knowledgebaseEntries ────────────────────────────
  const contextFiles = await listDir("pm-workspace-docs/company-context");
  for (const file of contextFiles) {
    if (file.type !== "file" || !file.name.endsWith(".md")) continue;
    const entryType = CONTEXT_FILE_TYPES[file.name];
    if (!entryType) continue;
    try {
      const content = await fetchFile(file.path);
      if (!content) continue;
      await ctx.runMutation(api.knowledgebase.upsert, {
        workspaceId,
        type: entryType,
        title: file.name.replace(/\.md$/, "").replace(/-/g, " "),
        content,
        filePath: file.path,
      });
      results.knowledgebase++;
    } catch { results.errors++; }
  }

  // ── 2. initiatives/active/ → projects + documents ─────────────────────────
  const initiativeDirs = await listDir("pm-workspace-docs/initiatives/active");
  for (const dir of initiativeDirs) {
    if (dir.type !== "dir" || dir.name.startsWith("_") || dir.name === "Untitled") continue;
    try {
      // Read _meta.json for project metadata
      const metaRaw = await fetchFile(`${dir.path}/_meta.json`);
      let meta: Record<string, unknown> = {};
      if (metaRaw) {
        try { meta = JSON.parse(metaRaw); } catch { /* ignore malformed */ }
      }

      // Upsert as a project (create if not exists, skip if already there)
      const existingProjects = await ctx.runQuery(api.projects.list, { workspaceId });
      const slug = dir.name;
      const existingProject = existingProjects.find(
        (p: { metadata?: Record<string, unknown> }) =>
          (p.metadata as Record<string, unknown> | undefined)?.slug === slug,
      );

      let projectId: Id<"projects">;
      if (existingProject) {
        projectId = existingProject._id;
        // Update metadata if it changed
        await ctx.runMutation(api.projects.update, {
          projectId,
          stage: (meta.phase as string | undefined) ?? existingProject.stage,
          status: (meta.status as string | undefined) ?? existingProject.status,
          priority: (meta.priority as string | undefined) ?? existingProject.priority,
          metadata: { ...existingProject.metadata, ...meta, slug },
        });
      } else {
        projectId = await ctx.runMutation(api.projects.create, {
          workspaceId,
          name: (meta.name as string | undefined) ?? slug.replace(/-/g, " "),
          description: (meta.owner_note as string | undefined) ?? undefined,
          stage: (meta.phase as string | undefined) ?? "inbox",
          priority: (meta.priority as string | undefined) ?? "P2",
          metadata: { ...meta, slug, syncedFromPmWorkspace: true },
        });
        results.projects++;

        // GTM-45: auto-create graph node for new project
        await ctx.runMutation(internal.graph.createNode, {
          workspaceId,
          entityType: "project",
          entityId: projectId as string,
          name: (meta.name as string | undefined) ?? slug.replace(/-/g, " "),
          domain: (meta.phase as string | undefined) ?? "inbox",
          accessWeight: 1.0,
          decayRate: 0.005,
        });
      }

      // Sync document files for this initiative
      const initiativeFiles = await listDir(dir.path);
      for (const file of initiativeFiles) {
        if (file.type !== "file") continue;
        const docType = INITIATIVE_DOC_FILES[file.name];
        if (!docType) continue;
        try {
          const content = await fetchFile(file.path);
          if (!content || content.trim().length < 10) continue;

          // Check if document already exists for this type
          const existingDoc = await ctx.runQuery(api.documents.getByType, {
            projectId,
            type: docType,
          });

          if (existingDoc) {
            await ctx.runMutation(api.documents.update, {
              documentId: existingDoc._id,
              content,
            });
          } else {
            await ctx.runMutation(api.documents.create, {
              workspaceId,
              projectId,
              type: docType,
              title: `${file.name.replace(/\.md$/, "")} — ${slug}`,
              content,
              generatedByAgent: "pm-workspace-sync",
            });
          }
          results.documents++;
        } catch { results.errors++; }
      }
    } catch { results.errors++; }
  }

  // ── 3. feature-guides/ → knowledgebaseEntries ─────────────────────────────
  const featureGuides = await listDir("pm-workspace-docs/feature-guides");
  for (const file of featureGuides) {
    if (file.type !== "file" || !file.name.endsWith(".md")) continue;
    try {
      const content = await fetchFile(file.path);
      if (!content) continue;
      const title = file.name.replace(/\.md$/, "").replace(/-/g, " ");
      await ctx.runMutation(api.knowledgebase.upsert, {
        workspaceId,
        type: "feature_guide",
        title,
        content,
        filePath: file.path,
      });
      results.knowledgebase++;
    } catch { results.errors++; }
  }

  // ── 4. hypotheses/active/ → one knowledgebaseEntry per hypothesis ─────────
  // Individual entries make each hypothesis searchable and independently
  // referenceable by agents (graph_search can find specific hypotheses).
  const hypothesisFiles = await listDir("pm-workspace-docs/hypotheses/active");
  for (const file of hypothesisFiles) {
    if (file.type !== "file" || !file.name.endsWith(".md") || file.name.startsWith("_")) continue;
    try {
      const content = await fetchFile(file.path);
      if (!content) continue;
      const slug = file.name.replace(/\.md$/, "");
      const title = slug.replace(/-/g, " ");
      await ctx.runMutation(api.knowledgebase.upsert, {
        workspaceId,
        type: "hypothesis",
        title,
        content,
        filePath: file.path,
      });
      results.knowledgebase++;
    } catch { results.errors++; }
  }

  // ── 5. personas/ → knowledgebaseEntries ──────────────────────────────────
  const personaFiles = await listDir("pm-workspace-docs/personas");
  const allPersonas: string[] = [];
  for (const file of personaFiles) {
    if (file.type !== "file" || !file.name.endsWith(".md")) continue;
    try {
      const content = await fetchFile(file.path);
      if (content) allPersonas.push(content);
    } catch { /* continue */ }
  }
  if (allPersonas.length > 0) {
    try {
      await ctx.runMutation(api.knowledgebase.upsert, {
        workspaceId,
        type: "personas",
        title: "Synthetic Personas",
        content: allPersonas.join("\n\n---\n\n"),
        filePath: "pm-workspace-docs/personas/",
      });
      results.knowledgebase++;
    } catch { results.errors++; }
  }

  // ── 6. roadmap/roadmap.json → knowledgebaseEntries ───────────────────────
  const roadmapRaw = await fetchFile("pm-workspace-docs/roadmap/roadmap.json");
  if (roadmapRaw) {
    try {
      await ctx.runMutation(api.knowledgebase.upsert, {
        workspaceId,
        type: "roadmap",
        title: "Product Roadmap",
        content: roadmapRaw,
        filePath: "pm-workspace-docs/roadmap/roadmap.json",
      });
      results.knowledgebase++;
    } catch { results.errors++; }
  }

  return results;
}

export const syncPmWorkspaceDocs = action({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return doPmWorkspaceDocSync(workspaceId, ctx);
  },
});

export const syncPmWorkspaceDocsInternal = internalAction({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => doPmWorkspaceDocSync(workspaceId, ctx),
});
