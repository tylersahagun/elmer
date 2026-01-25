/**
 * Agent Tools - Tool definitions that bridge to existing executor functions
 * 
 * These tools allow the AI agent to interact with the orchestrator database
 * and filesystem, matching the existing MCP server functionality.
 */

import type { AgentToolDefinition, AgentToolResult } from "./types";
import type { DocumentType, JobType } from "@/lib/db/schema";
import {
  createDocument,
  createJuryEvaluation,
  createTickets,
  updateProjectMetadata,
  getProject,
  getDocumentByType,
  getWorkspace,
  createPendingQuestion,
  updateJobStatus,
} from "@/lib/db/queries";
import { getWorkspaceContext, getProjectContext } from "@/lib/context/resolve";
import { isToolAllowed } from "@/lib/agent/security";
import { composioService } from "@/lib/composio/service";

// ============================================
// TOOL DEFINITIONS
// ============================================

export const AGENT_TOOLS: AgentToolDefinition[] = [
  // Document management
  {
    name: "get_project_context",
    description: "Get existing documents and context for a project including PRD, research, design brief, etc.",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "The project ID" },
        includeDocuments: { 
          type: "array", 
          items: { type: "string" },
          description: "Document types to include: research, prd, design_brief, engineering_spec, gtm_brief, prototype_notes, jury_report"
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "get_workspace_context",
    description: "Get company context including product vision, guardrails, and personas for a workspace",
    input_schema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "The workspace ID" },
      },
      required: ["workspaceId"],
    },
  },
  {
    name: "save_document",
    description: "Save generated content as a project document (PRD, research, design brief, etc.)",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "The project ID" },
        type: { 
          type: "string", 
          enum: ["research", "prd", "design_brief", "engineering_spec", "gtm_brief", "prototype_notes", "jury_report"],
          description: "Document type" 
        },
        title: { type: "string", description: "Document title" },
        content: { type: "string", description: "Document content in markdown" },
      },
      required: ["projectId", "type", "title", "content"],
    },
  },

  // Jury evaluation
  {
    name: "save_jury_evaluation",
    description: "Save jury evaluation results for a project phase",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "The project ID" },
        phase: { type: "string", enum: ["research", "prd", "prototype"], description: "Evaluation phase" },
        jurySize: { type: "number", description: "Number of jury members" },
        approvalRate: { type: "number", description: "Approval rate 0-1" },
        conditionalRate: { type: "number", description: "Conditional approval rate 0-1" },
        rejectionRate: { type: "number", description: "Rejection rate 0-1" },
        verdict: { type: "string", enum: ["pass", "fail", "conditional"], description: "Final verdict" },
        topConcerns: { type: "array", items: { type: "string" }, description: "Top concerns raised" },
        topSuggestions: { type: "array", items: { type: "string" }, description: "Top suggestions" },
        rawResults: { type: "object", description: "Full evaluation results" },
      },
      required: ["projectId", "phase", "jurySize", "approvalRate", "conditionalRate", "rejectionRate", "verdict"],
    },
  },

  // Tickets
  {
    name: "save_tickets",
    description: "Save generated tickets for a project",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "The project ID" },
        tickets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "number" },
              estimatedPoints: { type: "number" },
            },
            required: ["title"],
          },
          description: "Array of tickets to create",
        },
      },
      required: ["projectId", "tickets"],
    },
  },

  // Project metadata
  {
    name: "update_project_score",
    description: "Update the stage alignment score for a project",
    input_schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "The project ID" },
        stage: { type: "string", description: "The stage being scored" },
        score: { type: "number", description: "Score 0-1" },
        summary: { type: "string", description: "Brief assessment" },
        strengths: { type: "array", items: { type: "string" }, description: "Strengths identified" },
        gaps: { type: "array", items: { type: "string" }, description: "Gaps identified" },
      },
      required: ["projectId", "stage", "score", "summary"],
    },
  },

  // Composio tool execution (external services)
  {
    name: "composio_execute",
    description: "Execute a Composio tool by name (e.g., SLACK_SEND_MESSAGE)",
    input_schema: {
      type: "object",
      properties: {
        toolName: { type: "string", description: "Composio tool name" },
        arguments: { type: "object", description: "Tool arguments" },
      },
      required: ["toolName", "arguments"],
    },
  },

  // Interactive tools
  {
    name: "ask_question",
    description: "Ask the user a question and wait for input before continuing",
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string", description: "Question to ask" },
        type: { type: "string", enum: ["text", "choice"], description: "Question type" },
        choices: { type: "array", items: { type: "string" }, description: "Choices for choice questions" },
        context: { type: "string", description: "Extra context for the user" },
        timeoutMinutes: { type: "number", description: "Timeout in minutes" },
        defaultResponse: { type: "string", description: "Default response on timeout" },
      },
      required: ["question"],
    },
  },
  {
    name: "request_approval",
    description: "Request explicit approval from the user before continuing",
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string", description: "Approval question" },
        context: { type: "string", description: "Extra context for the user" },
        timeoutMinutes: { type: "number", description: "Timeout in minutes" },
        defaultResponse: { type: "string", description: "Default response on timeout" },
      },
      required: ["question"],
    },
  },
];

// ============================================
// TOOL EXECUTION
// ============================================

export interface AgentToolContext {
  jobId: string;
  workspaceId: string;
  projectId?: string;
  jobType?: JobType;
  toolCallId?: string;
}

/**
 * Execute a tool call and return the result
 */
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  context: AgentToolContext
): Promise<AgentToolResult> {
  try {
    const workspace = await getWorkspace(context.workspaceId);
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    if (!isToolAllowed(toolName, workspace.settings)) {
      return {
        success: false,
        error: `Tool not allowed: ${toolName}`,
      };
    }

    const inputProjectId = input.projectId as string | undefined;
    if (context.projectId && inputProjectId && context.projectId !== inputProjectId) {
      return {
        success: false,
        error: "Project mismatch for tool call",
      };
    }

    switch (toolName) {
      case "get_project_context": {
        const projectId = input.projectId as string;
        const includeDocuments = (input.includeDocuments as string[]) || [
          "research", "prd", "design_brief", "engineering_spec", "gtm_brief", "prototype_notes"
        ];
        
        const project = await getProject(projectId);
        if (!project) {
          return { success: false, error: "Project not found" };
        }

        const documents: Record<string, string> = {};
        for (const docType of includeDocuments) {
          const doc = await getDocumentByType(projectId, docType as DocumentType);
          if (doc) {
            documents[docType] = doc.content;
          }
        }

        const projectContext = await getProjectContext(projectId);

        return {
          success: true,
          output: {
            project: {
              id: project.id,
              name: project.name,
              description: project.description,
              stage: project.stage,
              metadata: project.metadata,
            },
            documents,
            context: projectContext,
          },
        };
      }

      case "get_workspace_context": {
        const workspaceId = input.workspaceId as string;
        const context = await getWorkspaceContext(workspaceId);
        return { success: true, output: { context } };
      }

      case "save_document": {
        const projectId = input.projectId as string;
        const type = input.type as DocumentType;
        const title = input.title as string;
        const content = input.content as string;

        const doc = await createDocument({
          projectId,
          type,
          title,
          content,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });

        return {
          success: true,
          output: { documentId: doc?.id, type, title },
        };
      }

      case "save_jury_evaluation": {
        const evaluation = await createJuryEvaluation({
          projectId: input.projectId as string,
          phase: input.phase as "research" | "prd" | "prototype",
          jurySize: input.jurySize as number,
          approvalRate: input.approvalRate as number,
          conditionalRate: input.conditionalRate as number,
          rejectionRate: input.rejectionRate as number,
          verdict: input.verdict as "pass" | "fail" | "conditional",
          topConcerns: (input.topConcerns as string[]) || [],
          topSuggestions: (input.topSuggestions as string[]) || [],
          rawResults: input.rawResults as Record<string, unknown>,
        });

        return {
          success: true,
          output: { evaluationId: evaluation?.id, verdict: input.verdict },
        };
      }

      case "save_tickets": {
        const projectId = input.projectId as string;
        const ticketsInput = input.tickets as Array<{
          title: string;
          description?: string;
          priority?: number;
          estimatedPoints?: number;
        }>;

        const tickets = await createTickets(projectId, ticketsInput);

        return {
          success: true,
          output: { ticketCount: tickets.length },
        };
      }

      case "update_project_score": {
        const projectId = input.projectId as string;
        const stage = input.stage as string;
        const score = input.score as number;
        const summary = input.summary as string;
        const strengths = (input.strengths as string[]) || [];
        const gaps = (input.gaps as string[]) || [];

        const project = await getProject(projectId);
        if (!project) {
          return { success: false, error: "Project not found" };
        }

        const updatedMetadata = {
          ...(project.metadata || {}),
          stageConfidence: {
            ...(project.metadata?.stageConfidence || {}),
            [stage]: {
              score,
              summary,
              strengths,
              gaps,
              updatedAt: new Date().toISOString(),
            },
          },
        };

        await updateProjectMetadata(projectId, updatedMetadata);

        return {
          success: true,
          output: { stage, score, summary },
        };
      }

      case "composio_execute": {
        const toolName = input.toolName as string;
        const args = (input.arguments as Record<string, unknown>) || {};
        if (!workspace.settings?.composio?.enabled) {
          return { success: false, error: "Composio is not enabled for this workspace" };
        }
        const result = await composioService.executeTool(
          context.workspaceId,
          toolName,
          args
        );
        return { success: true, output: result };
      }

      case "ask_question":
      case "request_approval": {
        if (!context.jobId || !context.toolCallId) {
          return { success: false, error: "Missing job context for interactive tool" };
        }
        const questionText = input.question as string;
        const timeoutMinutes = (input.timeoutMinutes as number) || 30;
        const timeoutAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);
        const questionType = toolName === "request_approval" ? "approval" : (input.type as string) || "text";

        const question = await createPendingQuestion({
          jobId: context.jobId,
          workspaceId: context.workspaceId,
          projectId: context.projectId,
          questionType,
          questionText,
          choices: (input.choices as string[]) || undefined,
          context: input.context ? { hint: String(input.context) } : undefined,
          toolCallId: context.toolCallId,
          toolName,
          timeoutAt,
          defaultResponse: input.defaultResponse
            ? { value: input.defaultResponse }
            : undefined,
        });

        await updateJobStatus(context.jobId, "waiting_input", {
          progress: 0,
        });

        return {
          success: true,
          output: {
            requiresInput: true,
            questionId: question?.id,
            message: "Waiting for user response",
          },
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed",
    };
  }
}

/**
 * Get tools as Anthropic tool definitions
 */
export function getAnthropicTools(): Array<{
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}> {
  return AGENT_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.input_schema,
  }));
}
