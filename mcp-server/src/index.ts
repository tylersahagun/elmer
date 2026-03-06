#!/usr/bin/env node
/**
 * Elmer MCP Server — Phase 5 rewrite
 *
 * Replaces the old SQLite-backed stub server with a Convex-backed
 * proxy. Every tool call hits the Convex HTTP API directly.
 *
 * 20 P0 tools across 6 domains:
 *   Projects  — list, get, create, update
 *   Signals   — list, get, ingest, link
 *   Agents    — list, get, run, sync
 *   Jobs      — list, get, logs, pending questions, respond
 *   Knowledge — list_context, get_context, search
 *   Memory    — store, query, graph_get_context
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { listProjects, getProject, createProject, updateProject, advanceStage } from "./tools/projects.js";
import { listSignals, getSignal, ingestSignal, linkSignal, synthesizeSignals } from "./tools/signals.js";
import { listAgents, getAgent, runAgent, syncAgents } from "./tools/agents.js";
import { listJobs, getJob, getJobLogs, getPendingQuestions, respondToQuestion } from "./tools/jobs.js";
import { listContext, getContext, search, storeMemory, queryMemory, graphGetContext, listCommands } from "./tools/knowledge.js";
import { postPrototype, getPrototypeFeedback, iteratePrototype, listPrototypeVariants } from "./tools/prototypes.js";
import { discussDocument } from "./tools/documents.js";
import { mcpGet, mcpPost } from "./convex-client.js";

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  // ── Projects ──
  {
    name: "elmer_list_projects",
    description: "List all active initiatives in Elmer, grouped by lifecycle stage (inbox → launch). Returns names, IDs, priorities, and TL;DRs.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "elmer_get_project",
    description: "Get full details for a project: stage, status, priority, TL;DR, and all linked documents (PRD, research, design brief, etc.).",
    inputSchema: {
      type: "object",
      properties: { project_id: { type: "string", description: "Convex project ID" } },
      required: ["project_id"],
    },
  },
  {
    name: "elmer_create_project",
    description: "Create a new initiative/project in Elmer.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        stage: { type: "string", enum: ["inbox", "discovery", "define", "build", "validate", "launch"] },
        priority: { type: "string", enum: ["P0", "P1", "P2", "P3"] },
      },
      required: ["name"],
    },
  },
  {
    name: "elmer_update_project",
    description:
      "Update a project's stage, status, priority, description, or linked Slack channel. " +
      "Set slackChannelId to link a Slack channel — Elmer will then monitor it for prototype feedback " +
      "and automatically ingest replies as signals.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        stage: { type: "string" },
        status: { type: "string" },
        priority: { type: "string" },
        description: { type: "string" },
        slack_channel_id: {
          type: "string",
          description: "Slack channel ID (e.g. C0AH98NHUU9) to link for prototype feedback",
        },
        slack_channel_name: {
          type: "string",
          description: "Human-readable channel name (e.g. chief-of-staff-feedback)",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "elmer_advance_stage",
    description:
      "Advance a project to the next lifecycle stage: inbox → discovery → define → build → validate → launch. " +
      "Automatically triggers TL;DR regeneration for the new stage.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Convex project ID" },
      },
      required: ["project_id"],
    },
  },
  // ── Signals ──
  {
    name: "elmer_list_signals",
    description: "List customer signals/feedback in the workspace. Optionally filter by status (new, pending, processed, archived).",
    inputSchema: {
      type: "object",
      properties: { status: { type: "string", description: "Filter by status: new, pending, processed, archived" } },
      required: [],
    },
  },
  {
    name: "elmer_get_signal",
    description: "Get full details for a signal including verbatim, interpretation, severity, and linked projects.",
    inputSchema: {
      type: "object",
      properties: { signal_id: { type: "string" } },
      required: ["signal_id"],
    },
  },
  {
    name: "elmer_ingest_signal",
    description: "Ingest a new customer signal or feedback. It will be auto-processed: TL;DR generated, project matched, impact scored.",
    inputSchema: {
      type: "object",
      properties: {
        verbatim: { type: "string", description: "The raw signal text or quote" },
        source: { type: "string", description: "Where this came from: slack, interview, support, email, etc." },
        severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
        project_id: { type: "string", description: "Optional: immediately link to this project" },
      },
      required: ["verbatim", "source"],
    },
  },
  {
    name: "elmer_link_signal",
    description: "Link an existing signal to a project.",
    inputSchema: {
      type: "object",
      properties: {
        signal_id: { type: "string" },
        project_id: { type: "string" },
        confidence: { type: "number", description: "Match confidence 0-1" },
      },
      required: ["signal_id", "project_id"],
    },
  },
  {
    name: "elmer_synthesize_signals",
    description:
      "Cluster all unlinked signals into themes using keyword analysis. " +
      "Shows a Signal Map: which topics appear most frequently, which signals are unlinked, " +
      "and how many signals belong to each theme. Use to decide what new projects to create " +
      "or which existing projects to link signals to.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  // ── Agents ──
  {
    name: "elmer_list_agents",
    description: "List all PM workflow agent definitions: subagents, skills, commands, rules. Shows what's available to run.",
    inputSchema: {
      type: "object",
      properties: { type: { type: "string", enum: ["subagent", "skill", "command", "rule"] } },
      required: [],
    },
  },
  {
    name: "elmer_get_agent",
    description: "Get full content and metadata for a specific agent definition.",
    inputSchema: {
      type: "object",
      properties: { agent_id: { type: "string" } },
      required: ["agent_id"],
    },
  },
  {
    name: "elmer_run_agent",
    description: "Run a PM workflow agent on a project. Creates a Convex job and schedules it immediately. Returns the job ID to track progress.",
    inputSchema: {
      type: "object",
      properties: {
        agent_definition_id: { type: "string", description: "Agent definition ID from elmer_list_agents" },
        project_id: { type: "string", description: "Project to run the agent on" },
        input: { type: "object", description: "Additional input: {transcript?, feedback?, command?, args?}" },
      },
      required: ["agent_definition_id"],
    },
  },
  {
    name: "elmer_sync_agents",
    description: "Sync agent definitions from GitHub (reads .cursor/agents/, skills/, commands/, rules/). Call after updating agent markdown files.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // ── Jobs ──
  {
    name: "elmer_list_jobs",
    description: "List jobs in the workspace. Shows running, pending, completed, and failed jobs.",
    inputSchema: {
      type: "object",
      properties: { status: { type: "string", description: "Filter by: pending, running, completed, failed, waiting_input, cancelled" } },
      required: [],
    },
  },
  {
    name: "elmer_get_job",
    description: "Get status, output, and recent logs for a specific job. Use to track agent execution progress.",
    inputSchema: {
      type: "object",
      properties: { job_id: { type: "string" } },
      required: ["job_id"],
    },
  },
  {
    name: "elmer_get_job_logs",
    description: "Get full execution logs for a job.",
    inputSchema: {
      type: "object",
      properties: { job_id: { type: "string" } },
      required: ["job_id"],
    },
  },
  {
    name: "elmer_get_pending_questions",
    description: "List all HITL questions waiting for human input across the workspace. Agents pause here.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "elmer_respond_to_question",
    description: "Answer a pending HITL question to unblock a paused agent. The agent resumes immediately.",
    inputSchema: {
      type: "object",
      properties: {
        question_id: { type: "string", description: "Pending question ID from elmer_get_pending_questions" },
        response: { type: "string", description: "Your answer (text or chosen option)" },
      },
      required: ["question_id", "response"],
    },
  },
  // ── Knowledge Base ──
  {
    name: "elmer_list_context",
    description: "List all knowledge base entries: company context, personas, guardrails, feature guides, hypotheses, roadmap.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "elmer_list_commands",
    description:
      "List all 68 PM workflow commands organized by lifecycle phase " +
      "(Signal Collection, Analysis, Definition, Build, Validation, Launch, Reporting, Dev Ops). " +
      "Shows each command name, description, triggers, and ID. " +
      "Use to discover what agents/skills are available and run them on a project.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "elmer_get_context",
    description: "Get the content of a specific knowledge base entry type.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Entry type: company_context, strategic_guardrails, personas, org_chart, team_context, tech_stack, feature_guide, hypothesis, roadmap",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "elmer_search",
    description: "Full-text search across projects, documents, agent definitions, and knowledge base entries.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  // ── Memory ──
  {
    name: "elmer_store_memory",
    description: "Store a memory entry (decision, feedback, context, artifact). Links to a project if project_id provided.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string" },
        type: { type: "string", enum: ["decision", "feedback", "context", "artifact", "conversation"] },
        project_id: { type: "string" },
      },
      required: ["content", "type"],
    },
  },
  {
    name: "elmer_query_memory",
    description: "Query memory entries for a project or workspace.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        type: { type: "string" },
      },
      required: [],
    },
  },
  {
    name: "elmer_graph_get_context",
    description: "Get rich graph context for a project: documents with content, memory entries, observations. Use to load full project context before running an agent.",
    inputSchema: {
      type: "object",
      properties: { project_id: { type: "string" } },
      required: ["project_id"],
    },
  },
  // ── Documents ──
  {
    name: "elmer_discuss_document",
    description:
      "Ask a question about a specific document in Elmer and get an AI answer grounded in the document content. " +
      "Use to quickly query a PRD, research doc, engineering spec, or any other document.",
    inputSchema: {
      type: "object",
      properties: {
        document_id: {
          type: "string",
          description: "The Convex document ID (from elmer_get_project or elmer_list_context)",
        },
        question: {
          type: "string",
          description: "The question to ask about the document",
        },
      },
      required: ["document_id", "question"],
    },
  },
  // ── Prototype Feedback Loop ──
  {
    name: "elmer_post_prototype",
    description:
      "Post a prototype variant's Chromatic/Storybook URL to the project's linked Slack channel, " +
      "opening a thread where customers and team members can leave feedback. " +
      "The Slack message timestamp is stored on the variant so replies can be ingested later. " +
      "Requires the project to have a slackChannelId set (use elmer_update_project).",
    inputSchema: {
      type: "object",
      properties: {
        variant_id: { type: "string", description: "prototypeVariants ID to post" },
      },
      required: ["variant_id"],
    },
  },
  {
    name: "elmer_get_prototype_feedback",
    description:
      "Get all feedback signals collected for a specific prototype variant. " +
      "Shows verbatim feedback, severity, and source for each reply ingested from the Slack thread. " +
      "Use before calling elmer_iterate_prototype to review what was said.",
    inputSchema: {
      type: "object",
      properties: {
        variant_id: {
          type: "string",
          description: "prototypeVariants ID — use elmer_list_projects then get variants via project",
        },
        project_id: {
          type: "string",
          description: "Alternative: provide project_id to list all variants for a project first",
        },
      },
      required: [],
    },
  },
  {
    name: "elmer_iterate_prototype",
    description:
      "Synthesize feedback signals for a prototype variant and queue a new iteration. " +
      "1) Collects all feedback signals linked to the variant " +
      "2) Runs an AI synthesis against the project's research doc " +
      "3) Creates a new prototypeVariant (v+1) with parentVariantId set " +
      "4) Schedules a prototype-builder job with the synthesis brief " +
      "5) Stores the synthesis as a memory entry on the project. " +
      "Use after elmer_get_prototype_feedback confirms there's feedback to act on.",
    inputSchema: {
      type: "object",
      properties: {
        variant_id: { type: "string", description: "The variant to iterate from" },
        instructions: {
          type: "string",
          description: "Optional extra direction for the next iteration (e.g. 'focus on the header', 'try a simpler layout')",
        },
      },
      required: ["variant_id"],
    },
  },
];

// ── Server setup ──────────────────────────────────────────────────────────────

const server = new Server(
  { name: "elmer", version: "2.0.0" },
  { capabilities: { tools: {}, resources: {} } },
);

// ── Register MCP App resources ────────────────────────────────────────────────
const __dirname_apps = dirname(fileURLToPath(import.meta.url));

function loadApp(appName: string): string | null {
  const htmlPath = resolve(__dirname_apps, `../apps/dist/${appName}/index.html`);
  if (!existsSync(htmlPath)) {
    console.error(`[elmer-mcp] App not built: ${appName} (run npm run build:app:${appName})`);
    return null;
  }
  return readFileSync(htmlPath, "utf-8");
}

const APP_HTML: Record<string, string | null> = {
  "initiative-dashboard": loadApp("initiative-dashboard"),
  "signal-map": loadApp("signal-map"),
  "agent-monitor": loadApp("agent-monitor"),
  "pm-navigator": loadApp("pm-navigator"),
  "jury-viewer": loadApp("jury-viewer"),
};

const APP_RESOURCES = [
  { uri: "ui://initiative-dashboard", name: "Initiative Dashboard", description: "Visual initiative status and artifact tracker" },
  { uri: "ui://signal-map",           name: "Signal Map",           description: "Cluster and visualize unlinked signals" },
  { uri: "ui://agent-monitor",        name: "Agent Monitor",        description: "Live job and agent execution monitor" },
  { uri: "ui://pm-navigator",         name: "PM Navigator",         description: "Browse all PM workflow commands" },
  { uri: "ui://jury-viewer",          name: "Jury Viewer",          description: "View jury evaluation results" },
];

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: APP_RESOURCES.map((r) => ({
    uri: r.uri,
    name: r.name,
    description: r.description,
    mimeType: "text/html",
  })),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri: string = request.params.uri;
  const appMap: Record<string, string> = {
    "ui://initiative-dashboard": "initiative-dashboard",
    "ui://signal-map": "signal-map",
    "ui://agent-monitor": "agent-monitor",
    "ui://pm-navigator": "pm-navigator",
    "ui://jury-viewer": "jury-viewer",
  };
  const appName = appMap[uri];
  if (appName && APP_HTML[appName]) {
    return {
      contents: [{
        uri,
        mimeType: "text/html",
        text: APP_HTML[appName] as string,
      }],
    };
  }
  return { contents: [] };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;

  let result: string;
  let structuredContent: unknown = undefined;

  try {
    switch (name) {
      // Projects
      case "elmer_list_projects":
        result = await listProjects();
        break;
      case "elmer_get_project": {
        const [text, raw] = await Promise.all([
          getProject(a.project_id as string),
          mcpGet("/project", { id: a.project_id as string }).catch(() => undefined),
        ]);
        result = text;
        structuredContent = raw;
        break;
      }
      case "elmer_create_project":
        result = await createProject(
          a.name as string,
          a.description as string | undefined,
          a.stage as string | undefined,
          a.priority as string | undefined,
        );
        break;
      case "elmer_update_project":
        result = await updateProject(a.project_id as string, {
          stage: a.stage as string | undefined,
          status: a.status as string | undefined,
          priority: a.priority as string | undefined,
          description: a.description as string | undefined,
          slackChannelId: a.slack_channel_id as string | undefined,
          slackChannelName: a.slack_channel_name as string | undefined,
        });
        break;
      case "elmer_advance_stage":
        result = await advanceStage(a.project_id as string);
        break;

      // Signals
      case "elmer_list_signals":
        result = await listSignals(a.status as string | undefined);
        break;
      case "elmer_get_signal":
        result = await getSignal(a.signal_id as string);
        break;
      case "elmer_ingest_signal":
        result = await ingestSignal(
          a.verbatim as string,
          a.source as string,
          a.severity as string | undefined,
          a.project_id as string | undefined,
        );
        break;
      case "elmer_link_signal":
        result = await linkSignal(
          a.signal_id as string,
          a.project_id as string,
          a.confidence as number | undefined,
        );
        break;
      case "elmer_synthesize_signals": {
        const [text, raw] = await Promise.all([
          synthesizeSignals(),
          mcpPost("/signals/synthesize", {}).catch(() => undefined),
        ]);
        result = text;
        structuredContent = raw;
        break;
      }

      // Agents
      case "elmer_list_agents":
        result = await listAgents(a.type as string | undefined);
        break;
      case "elmer_get_agent":
        result = await getAgent(a.agent_id as string);
        break;
      case "elmer_run_agent":
        result = await runAgent(
          a.agent_definition_id as string,
          a.project_id as string | undefined,
          a.input as Record<string, unknown> | undefined,
        );
        break;
      case "elmer_sync_agents":
        result = await syncAgents();
        break;

      // Jobs
      case "elmer_list_jobs": {
        const statusParam = a.status as string | undefined;
        const [text, raw] = await Promise.all([
          listJobs(statusParam),
          mcpGet("/jobs", statusParam ? { status: statusParam } : undefined).catch(() => undefined),
        ]);
        result = text;
        structuredContent = raw;
        break;
      }
      case "elmer_get_job":
        result = await getJob(a.job_id as string);
        break;
      case "elmer_get_job_logs":
        result = await getJobLogs(a.job_id as string);
        break;
      case "elmer_get_pending_questions":
        result = await getPendingQuestions();
        break;
      case "elmer_respond_to_question":
        result = await respondToQuestion(
          a.question_id as string,
          a.response as string,
        );
        break;

      // Knowledge
      case "elmer_list_context":
        result = await listContext();
        break;
      case "elmer_list_commands": {
        const [text, raw] = await Promise.all([
          listCommands(),
          mcpGet("/commands").catch(() => undefined),
        ]);
        result = text;
        structuredContent = raw;
        break;
      }
      case "elmer_get_context":
        result = await getContext(a.type as string);
        break;
      case "elmer_search":
        result = await search(a.query as string);
        break;

      // Memory
      case "elmer_store_memory":
        result = await storeMemory(
          a.content as string,
          a.type as string,
          a.project_id as string | undefined,
        );
        break;
      case "elmer_query_memory":
        result = await queryMemory(
          a.project_id as string | undefined,
          a.type as string | undefined,
        );
        break;
      case "elmer_graph_get_context":
        result = await graphGetContext(a.project_id as string);
        break;

      // Documents
      case "elmer_discuss_document":
        result = await discussDocument(a.document_id as string, a.question as string);
        break;

      // Prototype Feedback Loop
      case "elmer_post_prototype":
        result = await postPrototype(a.variant_id as string);
        break;
      case "elmer_get_prototype_feedback": {
        if (a.project_id && !a.variant_id) {
          // List variants for project so user can pick one
          result = await listPrototypeVariants(a.project_id as string);
        } else if (a.variant_id) {
          result = await getPrototypeFeedback(a.variant_id as string);
        } else {
          result = "Provide either variant_id or project_id.";
        }
        break;
      }
      case "elmer_iterate_prototype":
        result = await iteratePrototype(
          a.variant_id as string,
          a.instructions as string | undefined,
        );
        break;

      default:
        result = `Unknown tool: ${name}`;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result = `❌ Error: ${msg}`;
    console.error(`[elmer-mcp] ${name} failed:`, msg);
  }

  return {
    content: [{ type: "text", text: result }],
    ...(structuredContent !== undefined ? { structuredContent } : {}),
  };
});

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[elmer-mcp] Elmer MCP server v2 started (Convex-backed)");
