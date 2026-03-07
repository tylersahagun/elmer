/**
 * DB tool executors — Convex mutation/query wrappers callable from Actions.
 *
 * These are plain async functions that take a bound ActionCtx and job context,
 * then execute the appropriate Convex mutation or query.
 */

import type { ActionCtx } from "../_generated/server";
import { internal, api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

export interface JobContext {
  jobId: Id<"jobs">;
  workspaceId: Id<"workspaces">;
  projectId?: Id<"projects">;
  executionId: Id<"agentExecutions">;
}

export function buildDbTools(ctx: ActionCtx, jctx: JobContext) {
  return {
    get_project: {
      description:
        "Get full project with documents and metadata",
      inputSchema: {
        type: "object" as const,
        properties: {
          projectId: { type: "string", description: "The project ID" },
          includeDocuments: {
            type: "array",
            items: { type: "string" },
            description:
              "Document types: research, prd, design_brief, engineering_spec, gtm_brief, prototype_notes, jury_report",
          },
        },
        required: ["projectId"],
      },
      execute: async (args: Record<string, unknown>) => {
        const projectId = args.projectId as Id<"projects">;
        const project = await ctx.runQuery(api.projects.get, { projectId });
        if (!project) return { error: "Project not found" };

        const docTypes = (args.includeDocuments as string[]) ?? [
          "research", "prd", "design_brief", "engineering_spec",
          "gtm_brief", "prototype_notes", "jury_report",
        ];

        const allDocs = await ctx.runQuery(api.documents.byProject, { projectId });
        const documents: Record<string, string> = {};
        for (const doc of allDocs) {
          if (docTypes.includes(doc.type)) {
            documents[doc.type] = doc.content;
          }
        }

        return { project, documents };
      },
    },

    get_workspace_context: {
      description: "Get company context: product vision, guardrails, personas",
      inputSchema: {
        type: "object" as const,
        properties: {},
        required: [],
      },
      execute: async (_args: Record<string, unknown>) => {
        const entries = await ctx.runQuery(api.knowledgebase.listByWorkspace, {
          workspaceId: jctx.workspaceId,
        });
        const context: Record<string, string> = {};
        for (const entry of entries) {
          context[entry.type] = entry.content;
        }
        return { context };
      },
    },

    get_signal: {
      description: "Get verbatim feedback, interpretation and metadata for a signal",
      inputSchema: {
        type: "object" as const,
        properties: {
          signalId: { type: "string", description: "The signal ID" },
        },
        required: ["signalId"],
      },
      execute: async (args: Record<string, unknown>) => {
        const signal = await ctx.runQuery(api.signals.get, {
          signalId: args.signalId as Id<"signals">,
        });
        if (!signal) return { error: "Signal not found" };
        return { signal };
      },
    },

    save_document: {
      description: "Save generated content as a project document",
      inputSchema: {
        type: "object" as const,
        properties: {
          type: {
            type: "string",
            enum: [
              "research", "prd", "design_brief", "engineering_spec",
              "gtm_brief", "prototype_notes", "jury_report",
              "feature_guide", "competitive_landscape", "success_criteria",
              "gtm_plan", "retrospective",
            ],
          },
          title: { type: "string" },
          content: { type: "string", description: "Markdown content" },
          projectId: { type: "string", description: "Defaults to current project" },
        },
        required: ["type", "title", "content"],
      },
      execute: async (args: Record<string, unknown>) => {
        const projectId = (args.projectId as Id<"projects">) ?? jctx.projectId;
        if (!projectId) return { error: "No project ID available" };

        const docId = await ctx.runMutation(api.documents.create, {
          workspaceId: jctx.workspaceId,
          projectId,
          type: args.type as string,
          title: args.title as string,
          content: args.content as string,
          generatedByAgent: jctx.jobId,
        });
        return { documentId: docId, type: args.type, title: args.title };
      },
    },

    store_memory: {
      description: "Store a decision, insight, or context note for future agents",
      inputSchema: {
        type: "object" as const,
        properties: {
          type: {
            type: "string",
            enum: ["decision", "feedback", "context", "artifact", "conversation"],
          },
          content: { type: "string" },
        },
        required: ["type", "content"],
      },
      execute: async (args: Record<string, unknown>) => {
        const id = await ctx.runMutation(internal.memory.store, {
          workspaceId: jctx.workspaceId,
          projectId: jctx.projectId,
          type: args.type as string,
          content: args.content as string,
        });
        return { memoryId: id };
      },
    },

    create_signal: {
      description: "Create a new signal from findings during research",
      inputSchema: {
        type: "object" as const,
        properties: {
          verbatim: { type: "string", description: "Exact quote or observation" },
          source: { type: "string", description: "Where this came from" },
          severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
          interpretation: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["verbatim", "source"],
      },
      execute: async (args: Record<string, unknown>) => {
        const signalId = await ctx.runMutation(api.signals.create, {
          workspaceId: jctx.workspaceId,
          verbatim: args.verbatim as string,
          source: args.source as string,
          severity: args.severity as string | undefined,
          interpretation: args.interpretation as string | undefined,
          tags: args.tags as string[] | undefined,
          status: "new",
        });
        if (jctx.projectId) {
          await ctx.runMutation(api.signals.linkToProject, {
            signalId,
            projectId: jctx.projectId,
            linkedBy: "agent",
          });
        }
        return { signalId };
      },
    },

    ask_question: {
      description: "Pause execution and ask the user a clarifying question or approval",
      inputSchema: {
        type: "object" as const,
        properties: {
          question: { type: "string" },
          questionType: {
            type: "string",
            enum: ["text", "choice", "approval", "blocking"],
            description: "Defaults to 'blocking'",
          },
          choices: { type: "array", items: { type: "string" } },
          context: { type: "string", description: "Extra context for the user" },
          timeoutMinutes: { type: "number", description: "Timeout in minutes (default 60)" },
        },
        required: ["question"],
      },
      execute: async (args: Record<string, unknown>) => {
        const timeoutMinutes = (args.timeoutMinutes as number) ?? 60;
        const questionId = await ctx.runMutation(internal.pendingQuestions.create, {
          jobId: jctx.jobId,
          workspaceId: jctx.workspaceId,
          projectId: jctx.projectId,
          questionType: (args.questionType as string) ?? "blocking",
          questionText: args.question as string,
          choices: args.choices as string[] | undefined,
          context: args.context ? { hint: args.context as string } : undefined,
          timeoutAt: Date.now() + timeoutMinutes * 60 * 1000,
        });

        // Notify the user
        await ctx.runMutation(internal.notifications.create, {
          workspaceId: jctx.workspaceId,
          type: "agent_question",
          priority: "high",
          title: "Agent needs your input",
          message: args.question as string,
          jobId: jctx.jobId,
          projectId: jctx.projectId,
          actionType: "answer_question",
          actionData: { questionId },
        });

        // Signal caller to pause the action
        return { requiresInput: true, questionId };
      },
    },

    create_task: {
      description:
        "Create a task for the team to review or action. Use when an agent identifies " +
        "something that needs human follow-up: reviewing a document, investigating a signal, " +
        "making a decision, or running a follow-up agent.",
      inputSchema: {
        type: "object" as const,
        properties: {
          title: { type: "string", description: "Task title — clear and actionable" },
          description: { type: "string", description: "More detail about what needs to be done" },
          priority: {
            type: "string",
            enum: ["urgent", "high", "medium", "low"],
            description: "Default: medium",
          },
          assignedTo: {
            type: "string",
            description: "Clerk user ID to assign to. Omit to leave unassigned.",
          },
          linkedDocumentId: {
            type: "string",
            description: "Convex document ID if this task is about reviewing a document",
          },
          dueDate: {
            type: "number",
            description: "Unix timestamp (ms) for due date",
          },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title"],
      },
      execute: async (args: Record<string, unknown>) => {
        const taskId = await ctx.runMutation(internal.tasks.createFromAgent, {
          workspaceId: jctx.workspaceId,
          projectId: jctx.projectId,
          title: args.title as string,
          description: args.description as string | undefined,
          priority: args.priority as string | undefined,
          assignedTo: args.assignedTo as string | undefined,
          linkedJobId: jctx.jobId,
          linkedDocumentId: args.linkedDocumentId as Id<"documents"> | undefined,
          dueDate: args.dueDate as number | undefined,
          tags: args.tags as string[] | undefined,
        });
        return { taskId, title: args.title };
      },
    },

    notify_user: {
      description: "Send a notification to the team",
      inputSchema: {
        type: "object" as const,
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        },
        required: ["title", "message"],
      },
      execute: async (args: Record<string, unknown>) => {
        await ctx.runMutation(internal.notifications.create, {
          workspaceId: jctx.workspaceId,
          type: "agent_notification",
          priority: (args.priority as string) ?? "medium",
          title: args.title as string,
          message: args.message as string,
          jobId: jctx.jobId,
          projectId: jctx.projectId,
        });
        return { sent: true };
      },
    },

    // ── GTM-46: Graph tools ─────────────────────────────────────────────────

    graph_get_context: {
      description:
        "Get full graph context for a project: documents, signals, memory, linked agents, and observations. " +
        "Use at the start of every agent run to get rich, always-current project context.",
      inputSchema: {
        type: "object" as const,
        properties: {
          projectId: { type: "string", description: "Convex project ID" },
          maxHops: {
            type: "number",
            description: "Graph traversal depth (default 2 — project + immediate connections)",
          },
        },
        required: ["projectId"],
      },
      execute: async (args: Record<string, unknown>) => {
        const projectId = args.projectId as Id<"projects">;
        const maxHops = (args.maxHops as number) ?? 2;

        // Load project
        const project = await ctx.runQuery(api.projects.get, { projectId });
        if (!project) return { error: "Project not found" };

        const runtimeContext = await ctx.runQuery(api.memory.getProjectRuntimeContext, {
          projectId,
        });
        const projectNode = await ctx.runQuery(api.graph.getNodeByEntity, {
          entityType: "project",
          entityId: projectId as unknown as string,
        });
        const edges = projectNode
          ? await ctx.runQuery(api.graph.getEdgesFrom, { fromNodeId: projectNode._id })
          : [];
        const documents = runtimeContext?.documents ?? [];
        const memory = runtimeContext?.memory ?? [];
        const observations = runtimeContext?.items
          ?.filter((item: { promotionState: string }) => item.promotionState === "promoted")
          .slice(0, 12)
          .map((item: { title: string; snippet: string; provenance: { source: string } }) => ({
            depth: 0,
            content: `${item.title}\n${item.snippet}\nsource=${item.provenance.source}`,
          })) ?? [];
        const linkedSignalCount = runtimeContext?.signals?.length ?? 0;

        if (projectNode) {
          await ctx.runMutation(internal.graph.reinforceNode, { nodeId: projectNode._id });
        }

        // Record graph event
        await ctx.runMutation(internal.graph.recordEvent, {
          workspaceId: jctx.workspaceId,
          eventType: "context_accessed",
          entityId: projectId as unknown as string,
          actor: `job:${jctx.jobId}`,
          details: { hop: maxHops },
        });

        return {
          project: {
            id: project._id,
            name: project.name,
            stage: project.stage,
            status: project.status,
            priority: project.priority,
            tldr: (project.metadata as Record<string, unknown> | undefined)?.tldr,
            metadata: project.metadata,
          },
          documents: (documents as Array<{ id?: string; _id?: string; type: string; title: string; content: string }>).map((d) => ({
            id: d.id ?? d._id,
            type: d.type,
            title: d.title,
            content: ["prd", "research", "design_brief"].includes(d.type)
              ? ((d.content as string | undefined)?.slice(0, 8000) ?? "")
              : ((d.content as string | undefined)?.slice(0, 2000) ?? ""),
          })),
          memory: (memory as Array<{ type: string; content: string }>).slice(0, 20).map((m) => ({
            type: m.type,
            content: m.content.slice(0, 500),
          })),
          observations: (observations as Array<{ depth: number; content: string }>).map((o) => ({
            depth: o.depth,
            content: o.content,
          })),
          graphEdges: (edges as Array<{ relationType: string; toNodeId: string }>).map((e) => ({
            relationType: e.relationType,
            toNodeId: e.toNodeId,
          })),
          signalCount: linkedSignalCount,
          runtimeMemory: runtimeContext?.items ?? [],
        };
      },
    },

    graph_search: {
      description:
        "Search across all graph nodes — projects, documents, agent definitions, knowledge base — " +
        "by keyword. Returns ranked results with context.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "Search query" },
          entityTypes: {
            type: "array",
            items: { type: "string" },
            description:
              "Filter to specific entity types: project, document, subagent, skill, command, context. " +
              "Omit to search all.",
          },
          limit: { type: "number", description: "Max results (default 10)" },
        },
        required: ["query"],
      },
      execute: async (args: Record<string, unknown>) => {
        const query = (args.query as string).toLowerCase();
        const limit = (args.limit as number) ?? 10;
        const filterTypes = args.entityTypes as string[] | undefined;

        const results: Array<{
          entityType: string;
          name: string;
          nodeId: string;
          score: number;
          snippet: string;
          source: string;
        }> = [];

        // Search projects
        if (!filterTypes || filterTypes.includes("project")) {
          const projects = await ctx.runQuery(api.projects.list, {
            workspaceId: jctx.workspaceId,
          });
          for (const p of projects) {
            const score = scoreMatch(query, [p.name, p.description ?? ""]);
            if (score > 0) {
              results.push({
                entityType: "project",
                name: p.name,
                nodeId: p._id,
                score,
                snippet: p.description?.slice(0, 200) ?? p.name,
                source: "projects",
              });
            }
          }
        }

        // Search knowledgebase
        if (!filterTypes || filterTypes.includes("context")) {
          const kb = await ctx.runQuery(api.knowledgebase.listByWorkspace, {
            workspaceId: jctx.workspaceId,
          });
          for (const entry of kb) {
            const score = scoreMatch(query, [entry.title, entry.content]);
            if (score > 0) {
              const matchIdx = entry.content.toLowerCase().indexOf(query);
              const snippet = matchIdx >= 0
                ? entry.content.slice(Math.max(0, matchIdx - 50), matchIdx + 150)
                : entry.content.slice(0, 200);
              results.push({
                entityType: "context",
                name: entry.title,
                nodeId: entry._id,
                score,
                snippet,
                source: `knowledgebase:${entry.type}`,
              });
            }
          }
        }

        // Search agent definitions
        if (!filterTypes || filterTypes.some((t) => ["subagent", "skill", "command"].includes(t))) {
          const agents = await ctx.runQuery(api.agentDefinitions.list, {
            workspaceId: jctx.workspaceId,
          });
          for (const agent of agents) {
            if (filterTypes && !filterTypes.includes(agent.type)) continue;
            const score = scoreMatch(query, [agent.name, agent.description ?? "", agent.content]);
            if (score > 0) {
              results.push({
                entityType: agent.type,
                name: agent.name,
                nodeId: agent._id,
                score,
                snippet: agent.description?.slice(0, 200) ?? agent.content.slice(0, 200),
                source: "agentDefinitions",
              });
            }
          }
        }

        // Sort by score descending, cap at limit
        results.sort((a, b) => b.score - a.score);
        return { results: results.slice(0, limit), total: results.length };
      },
    },

    graph_add_observation: {
      description:
        "Store a structured observation on a graph node. Use to record insights, decisions, " +
        "or summaries that future agents should know about. Depth 0 = brief summary (shown by default), " +
        "depth 1 = key points, depth 2 = detailed, depth 3 = raw.",
      inputSchema: {
        type: "object" as const,
        properties: {
          entityType: {
            type: "string",
            description: "Entity type: project, document, subagent, skill, context",
          },
          entityId: {
            type: "string",
            description: "Convex ID of the entity (project ID, document ID, etc.)",
          },
          depth: {
            type: "number",
            description: "Detail level: 0=summary, 1=key points, 2=details, 3=raw (default 0)",
          },
          content: { type: "string", description: "The observation to store" },
          supersede: {
            type: "boolean",
            description: "Replace existing observations at this depth (default true for depth 0)",
          },
        },
        required: ["entityType", "entityId", "content"],
      },
      execute: async (args: Record<string, unknown>) => {
        const entityType = args.entityType as string;
        const entityId = args.entityId as string;
        const depth = (args.depth as number) ?? 0;
        const content = args.content as string;
        const supersede = (args.supersede as boolean) ?? (depth === 0);

        // Find or create graph node
        let node = await ctx.runQuery(api.graph.getNodeByEntity, { entityType, entityId });

        if (!node) {
          // Auto-create node if it doesn't exist
          const nodeId = await ctx.runMutation(internal.graph.createNode, {
            workspaceId: jctx.workspaceId,
            entityType,
            entityId,
            name: entityId, // best guess; caller can update
            accessWeight: 1.0,
            decayRate: 0.01,
          });
          node = await ctx.runQuery(api.graph.getNode, { nodeId });
        }

        if (!node) return { error: "Could not create graph node" };

        const obsId = await ctx.runMutation(internal.graph.addObservation, {
          nodeId: node._id,
          workspaceId: jctx.workspaceId,
          depth,
          content,
          supersede,
        });

        // Reinforce the node
        await ctx.runMutation(internal.graph.reinforceNode, { nodeId: node._id });

        return { observationId: obsId, nodeId: node._id, depth };
      },
    },
  };
}

// ── Score helper (simple keyword match) ──────────────────────────────────────
function scoreMatch(query: string, fields: string[]): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const field of fields) {
    if (!field) continue;
    const f = field.toLowerCase();
    if (f === q) score += 10;
    else if (f.startsWith(q)) score += 5;
    else if (f.includes(q)) score += 2 + (field.length < 100 ? 1 : 0);
    // Count occurrences for longer content
    const occurrences = (f.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
    score += Math.min(occurrences, 5);
  }
  return score;
}
