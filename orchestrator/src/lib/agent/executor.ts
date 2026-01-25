/**
 * Agent Executor - Anthropic SDK agent with prompt caching and tool use
 * 
 * This executor processes jobs using Claude with:
 * - Prompt caching for 90% cost reduction on repeated context
 * - Tool use for interacting with the orchestrator
 * - Streaming support for real-time logs
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  AgentJob,
  AgentExecutionResult,
  AgentProgressCallback,
  AgentProgressEvent,
} from "./types";
import type { JobType } from "@/lib/db/schema";
import { buildSystemPrompt, getOutputFormat } from "./prompts";
import { getAnthropicTools, executeTool } from "./tools";
import { getWorkspaceContext, getProjectContext } from "@/lib/context/resolve";
import {
  getProject,
  getDocumentByType,
  getAgentDefinitionById,
  listAgentDefinitionsByType,
  createAgentExecution,
  updateAgentExecution,
} from "@/lib/db/queries";

// ============================================
// CONFIGURATION
// ============================================

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const MAX_TOOL_ITERATIONS = 10;

// ============================================
// AGENT EXECUTOR CLASS
// ============================================

export class AgentExecutor {
  private client: Anthropic;
  private contextCache: Map<string, { content: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 4 * 60 * 1000; // 4 minutes (cache lasts 5 min)

  constructor() {
    this.client = new Anthropic();
  }

  /**
   * Execute a job using the AI agent with tool use
   */
  async executeJob(
    job: AgentJob,
    onProgress?: AgentProgressCallback
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const tokensUsed = {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheCreation: 0,
    };

    const log = (message: string) => {
      const entry = `[${new Date().toISOString()}] ${message}`;
      logs.push(entry);
      onProgress?.({
        type: "log",
        message,
        timestamp: new Date(),
      });
    };

    let agentExecutionId: string | undefined;

    try {
      log(`Starting job: ${job.type}`);
      onProgress?.({ type: "started", jobId: job.id, jobType: job.type });

      const agentDefinitionId = job.input?.agentDefinitionId as string | undefined;
      const agentExecution =
        job.type === "execute_agent_definition"
          ? await createAgentExecution({
              jobId: job.id,
              agentDefinitionId,
              workspaceId: job.workspaceId,
              projectId: job.projectId,
            })
          : null;
      agentExecutionId = agentExecution?.id;

      // Get cached workspace context (or fetch fresh)
      const companyContext = await this.getCachedContext(job.workspaceId);
      log(`Loaded company context (${companyContext.length} chars)`);

      // Build user prompt based on job type
      const userPrompt = await this.buildUserPrompt(job);
      log(`Built user prompt for ${job.type}`);

      // Load imported rules
      const rules = await listAgentDefinitionsByType(job.workspaceId, "rule");
      const rulesContent = rules.map((rule) => rule.content).join("\n\n---\n\n");

      // Build system prompt with cached context and rules
      const systemPrompt = buildSystemPrompt(job.type, companyContext, rulesContent);

      // Get tools for this job type
      const tools = this.getToolsForJob(job.type);
      log(`Using ${tools.length} tools`);

      // Create initial message with cached system prompt
      let messages: Anthropic.MessageParam[] = [
        { role: "user", content: userPrompt },
      ];

      // Run agent loop with tool use
      let iterationCount = 0;
      let finalContent = "";
      let requiresInput = false;
      let pendingQuestionId: string | undefined;

      while (iterationCount < MAX_TOOL_ITERATIONS) {
        iterationCount++;
        log(`Agent iteration ${iterationCount}`);

        const response = await this.client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [
            {
              type: "text",
              text: systemPrompt,
              // Enable prompt caching for system prompt
              cache_control: { type: "ephemeral" },
            },
          ],
          tools,
          messages,
        });

        // Track token usage
        tokensUsed.input += response.usage.input_tokens;
        tokensUsed.output += response.usage.output_tokens;
        if ("cache_read_input_tokens" in response.usage) {
          tokensUsed.cacheRead += (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0;
        }
        if ("cache_creation_input_tokens" in response.usage) {
          tokensUsed.cacheCreation += (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0;
        }

        // Process response content
        const assistantContent: Anthropic.ContentBlockParam[] = [];
        let hasToolUse = false;

        for (const block of response.content) {
          if (block.type === "text") {
            finalContent = block.text;
            assistantContent.push({ type: "text", text: block.text });
          } else if (block.type === "tool_use") {
            hasToolUse = true;
            const toolCall = {
              id: block.id,
              name: block.name,
              input: block.input as Record<string, unknown>,
            };

            log(`Tool call: ${toolCall.name}`);
            onProgress?.({
              type: "tool_call",
              toolName: toolCall.name,
              input: toolCall.input,
            });

            assistantContent.push({
              type: "tool_use",
              id: block.id,
              name: block.name,
              input: block.input,
            });
          }
        }

        // If no tool use, we're done
        if (!hasToolUse) {
          log("Agent completed without tool calls");
          break;
        }

        // Add assistant message
        messages.push({ role: "assistant", content: assistantContent });

        // Execute tool calls and add results
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type === "tool_use") {
            const result = await executeTool(
              block.name,
              block.input as Record<string, unknown>,
              {
                jobId: job.id,
                workspaceId: job.workspaceId,
                projectId: job.projectId,
                jobType: job.type,
                toolCallId: block.id,
              }
            );

            log(`Tool result: ${block.name} - ${result.success ? "success" : "failed"}`);
            onProgress?.({
              type: "tool_result",
              toolName: block.name,
              success: result.success,
              output: result.output,
            });

            if (
              result.success &&
              result.output &&
              typeof result.output === "object" &&
              "requiresInput" in result.output
            ) {
              requiresInput = true;
              const output = result.output as { questionId?: string };
              pendingQuestionId = output.questionId;
            }

            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result.success
                ? JSON.stringify(result.output)
                : `Error: ${result.error}`,
              is_error: !result.success,
            });
          }
        }

        // Add tool results
        messages.push({ role: "user", content: toolResults });

        if (requiresInput) {
          log("Agent paused awaiting user input");
          break;
        }

        // Check stop reason
        if (response.stop_reason === "end_turn") {
          log("Agent finished (end_turn)");
          break;
        }

        // Update progress
        onProgress?.({
          type: "progress",
          progress: Math.min(0.9, iterationCount / MAX_TOOL_ITERATIONS),
          message: `Processing... (iteration ${iterationCount})`,
        });
      }

      const durationMs = Date.now() - startTime;
      log(`Job completed in ${durationMs}ms`);

      const result: AgentExecutionResult = {
        success: true,
        output: requiresInput
          ? {
              requiresInput: true,
              questionId: pendingQuestionId,
            }
          : {
              content: finalContent,
              iterations: iterationCount,
            },
        logs,
        tokensUsed,
        durationMs,
      };

      if (agentExecutionId) {
        await updateAgentExecution(agentExecutionId, {
          promptUsed: systemPrompt,
          output: result.output,
          tokensUsed: tokensUsed.input + tokensUsed.output,
          durationMs,
          completedAt: new Date(),
        });
      }

      onProgress?.({ type: "completed", result });
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      log(`Job failed: ${errorMessage}`);

      if (agentExecutionId) {
        await updateAgentExecution(agentExecutionId, {
          output: { error: errorMessage },
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        });
      }

      const result: AgentExecutionResult = {
        success: false,
        error: errorMessage,
        logs,
        tokensUsed,
        durationMs: Date.now() - startTime,
      };

      onProgress?.({ type: "failed", error: errorMessage });
      return result;
    }
  }

  /**
   * Get cached workspace context or fetch fresh
   */
  private async getCachedContext(workspaceId: string): Promise<string> {
    const cached = this.contextCache.get(workspaceId);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.content;
    }

    const content = await getWorkspaceContext(workspaceId);
    this.contextCache.set(workspaceId, { content, timestamp: now });
    return content;
  }

  /**
   * Build user prompt based on job type and input
   */
  private async buildUserPrompt(job: AgentJob): Promise<string> {
    const { type, projectId, input } = job;
    const project = projectId ? await getProject(projectId) : null;
    const projectName = project?.name || "Unknown Project";

    switch (type) {
      case "process_signal": {
        return `Process incoming signal data for "${projectName}".

Normalize the signal, extract key details, and summarize any actionable insights.
If relevant, save a brief research note using save_document with type "research".`;
      }

      case "synthesize_signals": {
        return `Synthesize related signals for "${projectName}".

Cluster the signals, summarize the common theme, and propose next steps.
Save a synthesis note using save_document with type "research".`;
      }

      case "analyze_transcript": {
        const transcript = (input.transcript as string) || "";
        return `Analyze this transcript for "${projectName}":

${transcript}

Extract insights and save as a research document using the save_document tool.`;
      }

      case "generate_prd": {
        const research = projectId
          ? await getDocumentByType(projectId, "research")
          : null;
        const projectContext = projectId
          ? await getProjectContext(projectId)
          : "";

        return `Create a PRD for: ${projectName}

${research ? `## Existing Research\n${research.content}\n` : ""}
${projectContext ? `## Project Context\n${projectContext}\n` : ""}

Generate a comprehensive PRD and save it using the save_document tool with type "prd".`;
      }

      case "generate_design_brief": {
        const prd = projectId
          ? await getDocumentByType(projectId, "prd")
          : null;

        return `Create a design brief for: ${projectName}

## PRD
${prd?.content || "No PRD available"}

Generate a design brief and save it using the save_document tool with type "design_brief".`;
      }

      case "generate_engineering_spec": {
        const prd = projectId
          ? await getDocumentByType(projectId, "prd")
          : null;
        const designBrief = projectId
          ? await getDocumentByType(projectId, "design_brief")
          : null;

        return `Create an engineering specification for: ${projectName}

## PRD
${prd?.content || "No PRD available"}

${designBrief ? `## Design Brief\n${designBrief.content}\n` : ""}

Generate an engineering spec and save it using the save_document tool with type "engineering_spec".`;
      }

      case "generate_gtm_brief": {
        const prd = projectId
          ? await getDocumentByType(projectId, "prd")
          : null;

        return `Create a go-to-market brief for: ${projectName}

## PRD
${prd?.content || "No PRD available"}

Generate a GTM brief and save it using the save_document tool with type "gtm_brief".`;
      }

      case "run_jury_evaluation": {
        const phase = (input.phase as string) || "prd";
        const jurySize = (input.jurySize as number) || 12;
        let content = "";

        if (projectId) {
          if (phase === "research") {
            const doc = await getDocumentByType(projectId, "research");
            content = doc?.content || "";
          } else if (phase === "prototype") {
            const doc = await getDocumentByType(projectId, "prototype_notes");
            content = doc?.content || "";
          } else {
            const doc = await getDocumentByType(projectId, "prd");
            content = doc?.content || "";
          }
        }

        return `Run a jury evaluation for ${projectName} (${phase} phase) with ${jurySize} personas.

## Content to Evaluate
${content || "No content available"}

Evaluate and save results using the save_jury_evaluation tool.`;
      }

      case "build_prototype":
        return `Build a prototype for: ${projectName}

First, get the project context using get_project_context to understand requirements.
Then describe the prototype components and save notes using save_document with type "prototype_notes".`;

      case "iterate_prototype": {
        const feedback = (input.feedback as string) || "";
        return `Iterate on the prototype for: ${projectName}

## Feedback
${feedback}

Review feedback and update prototype notes using save_document.`;
      }

      case "generate_tickets": {
        const engSpec = projectId
          ? await getDocumentByType(projectId, "engineering_spec")
          : null;
        const maxTickets = (input.maxTickets as number) || 20;

        return `Generate up to ${maxTickets} implementation tickets for: ${projectName}

## Engineering Spec
${engSpec?.content || "No engineering spec available"}

Create tickets and save them using the save_tickets tool.`;
      }

      case "validate_tickets": {
        const prd = projectId
          ? await getDocumentByType(projectId, "prd")
          : null;
        const tickets = input.tickets || [];

        return `Validate tickets for: ${projectName}

## PRD
${prd?.content || "No PRD available"}

## Tickets to Validate
${JSON.stringify(tickets, null, 2)}

Analyze ticket coverage and save validation results.`;
      }

      case "score_stage_alignment": {
        const stage = (input.stage as string) || project?.stage || "prd";
        const docTypeMap: Record<string, string> = {
          discovery: "research",
          prd: "prd",
          design: "design_brief",
          prototype: "prototype_notes",
          validate: "jury_report",
          tickets: "engineering_spec",
        };
        const docType = docTypeMap[stage] || "prd";
        const doc = projectId
          ? await getDocumentByType(projectId, docType as "research" | "prd" | "design_brief" | "engineering_spec" | "gtm_brief" | "prototype_notes" | "jury_report")
          : null;

        return `Score alignment for ${projectName} at ${stage} stage.

## Document to Score
${doc?.content || "No document available"}

Score alignment and save using update_project_score tool.`;
      }

      case "deploy_chromatic":
        return `Deploy prototype to Chromatic for: ${projectName}

Note: This job type requires CLI execution which is not available in this agent.
Save a note about needing manual Chromatic deployment.`;

      case "create_feature_branch":
        return `Create a feature branch for: ${projectName}

Note: This job type requires Git CLI execution which is not available in this agent.
Save a note about needing manual branch creation.`;

      case "execute_agent_definition": {
        const agentDefinitionId = input.agentDefinitionId as string;
        if (!agentDefinitionId) {
          return `No agentDefinitionId provided for ${projectName}.`;
        }

        const definition = await getAgentDefinitionById(agentDefinitionId);
        if (!definition) {
          return `Agent definition not found: ${agentDefinitionId}`;
        }

        const projectContext = projectId
          ? await getProjectContext(projectId)
          : "";
        const workspaceContext = await getWorkspaceContext(job.workspaceId);

        return `Execute the following agent definition for "${projectName}":

## Agent Definition
${definition.content}

## Workspace Context
${workspaceContext}

${projectContext ? `## Project Context\n${projectContext}\n` : ""}`;
      }

      default:
        return `Process job for: ${projectName}\n\nInput: ${JSON.stringify(input)}`;
    }
  }

  /**
   * Get relevant tools for a job type
   */
  private getToolsForJob(jobType: JobType): Anthropic.Tool[] {
    const allTools = getAnthropicTools();

    // Most jobs need these tools
    const baseTools = ["get_project_context", "get_workspace_context", "save_document"];

    // Job-specific tools
    const jobTools: Record<JobType, string[]> = {
      process_signal: [...baseTools],
      synthesize_signals: [...baseTools],
      analyze_transcript: [...baseTools],
      generate_prd: [...baseTools],
      generate_design_brief: [...baseTools],
      generate_engineering_spec: [...baseTools],
      generate_gtm_brief: [...baseTools],
      run_jury_evaluation: [...baseTools, "save_jury_evaluation"],
      build_prototype: [...baseTools],
      iterate_prototype: [...baseTools],
      generate_tickets: [...baseTools, "save_tickets"],
      validate_tickets: [...baseTools],
      score_stage_alignment: [...baseTools, "update_project_score"],
      deploy_chromatic: [...baseTools],
      create_feature_branch: [...baseTools],
      execute_agent_definition: [
        ...baseTools,
        "save_tickets",
        "save_jury_evaluation",
        "update_project_score",
        "composio_execute",
      ],
    };

    const toolNames = jobTools[jobType] || baseTools;
    return allTools
      .filter((t) => toolNames.includes(t.name))
      .map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema as Anthropic.Tool.InputSchema,
      }));
  }

  /**
   * Clear context cache for a workspace
   */
  clearCache(workspaceId?: string) {
    if (workspaceId) {
      this.contextCache.delete(workspaceId);
    } else {
      this.contextCache.clear();
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let agentExecutorInstance: AgentExecutor | null = null;

export function getAgentExecutor(): AgentExecutor {
  if (!agentExecutorInstance) {
    agentExecutorInstance = new AgentExecutor();
  }
  return agentExecutorInstance;
}
