#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  // Document Generation
  generatePRD,
  generateDesignBrief,
  generateEngineeringSpec,
  generateGTMBrief,
  // Research
  analyzeTranscript,
  // Jury
  runJuryEvaluation,
  iterateFromFeedback,
  // Prototypes
  buildStandalonePrototype,
  buildContextPrototype,
  iteratePrototype,
  deployToChromatic,
  // Linear
  generateTickets,
  validateTickets,
} from "./tools/index.js";

// Job CRUD operations (for Cursor AI to process jobs)
import {
  getPendingJobs,
  getJobContext,
  updateJobStatus,
  completeJob,
  failJob,
  getProjectDetails,
  saveDocument,
  getCompanyContext,
} from "./tools/jobs-crud.js";

import {
  GeneratePRDInputSchema,
  GenerateDesignBriefInputSchema,
  GenerateEngineeringSpecInputSchema,
  GenerateGTMBriefInputSchema,
  AnalyzeTranscriptInputSchema,
  RunJuryInputSchema,
  BuildPrototypeInputSchema,
  IteratePrototypeInputSchema,
  GenerateTicketsInputSchema,
  ValidateTicketsInputSchema,
} from "./types.js";

// ============================================
// MCP SERVER SETUP
// ============================================

const server = new Server(
  {
    name: "pm-orchestrator",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================
// TOOL DEFINITIONS
// ============================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Document Generation Tools
      {
        name: "generate-prd",
        description: "Generate a Product Requirements Document from research and context",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            projectName: { type: "string", description: "Name of the project/feature" },
            research: { type: "string", description: "Research findings" },
            transcript: { type: "string", description: "Meeting transcript or notes" },
            companyContext: { type: "string", description: "Company context and vision" },
            personas: { type: "array", items: { type: "string" }, description: "Target personas" },
          },
          required: ["projectId", "projectName"],
        },
      },
      {
        name: "generate-design-brief",
        description: "Generate a design brief from a PRD",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            prd: { type: "string", description: "The PRD content" },
            designLanguage: { type: "string", description: "Design language guidelines" },
            existingPatterns: { type: "array", items: { type: "string" }, description: "Existing design patterns" },
          },
          required: ["projectId", "prd"],
        },
      },
      {
        name: "generate-engineering-spec",
        description: "Generate an engineering specification from PRD and design brief",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            prd: { type: "string", description: "The PRD content" },
            designBrief: { type: "string", description: "The design brief" },
            techStack: { type: "string", description: "Technology stack details" },
          },
          required: ["projectId", "prd"],
        },
      },
      {
        name: "generate-gtm-brief",
        description: "Generate a go-to-market brief from a PRD",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            prd: { type: "string", description: "The PRD content" },
            targetPersonas: { type: "array", items: { type: "string" }, description: "Target personas" },
            marketingGuidelines: { type: "string", description: "Marketing guidelines" },
          },
          required: ["projectId", "prd"],
        },
      },

      // Research Tools
      {
        name: "analyze-transcript",
        description: "Analyze a meeting transcript or user interview for insights",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            transcript: { type: "string", description: "The transcript to analyze" },
            context: { type: "string", description: "Additional context" },
          },
          required: ["projectId", "transcript"],
        },
      },

      // Jury Tools
      {
        name: "run-jury-evaluation",
        description: "Run a synthetic user jury evaluation on content",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            phase: { type: "string", enum: ["research", "prd", "prototype"], description: "Evaluation phase" },
            content: { type: "string", description: "Content to evaluate" },
            jurySize: { type: "number", description: "Number of jury members (3-100)", default: 12 },
            personasPath: { type: "string", description: "Path to custom personas file" },
          },
          required: ["projectId", "phase", "content"],
        },
      },
      {
        name: "iterate-from-feedback",
        description: "Generate an iteration plan from jury feedback",
        inputSchema: {
          type: "object",
          properties: {
            originalContent: { type: "string", description: "Original content that was evaluated" },
            juryResult: { type: "object", description: "Jury evaluation result" },
          },
          required: ["originalContent", "juryResult"],
        },
      },

      // Prototype Tools
      {
        name: "build-standalone-prototype",
        description: "Build a standalone Storybook prototype using Cursor agent",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            type: { type: "string", enum: ["standalone", "context"], default: "standalone" },
            prd: { type: "string", description: "PRD content" },
            designBrief: { type: "string", description: "Design brief" },
            workspacePath: { type: "string", description: "Path to workspace" },
            outputPath: { type: "string", description: "Output path for components" },
            existingComponents: { type: "array", items: { type: "string" }, description: "Existing components to reference" },
          },
          required: ["projectId", "prd", "workspacePath"],
        },
      },
      {
        name: "build-context-prototype",
        description: "Build a context-aware prototype that integrates with existing app patterns",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            type: { type: "string", enum: ["standalone", "context"], default: "context" },
            prd: { type: "string", description: "PRD content" },
            designBrief: { type: "string", description: "Design brief" },
            workspacePath: { type: "string", description: "Path to workspace" },
            outputPath: { type: "string", description: "Output path for components" },
            existingComponents: { type: "array", items: { type: "string" }, description: "Existing components to reference" },
          },
          required: ["projectId", "prd", "workspacePath"],
        },
      },
      {
        name: "iterate-prototype",
        description: "Iterate on an existing prototype based on feedback",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            prototypeId: { type: "string", description: "Prototype ID" },
            feedback: { type: "string", description: "Feedback to address" },
            workspacePath: { type: "string", description: "Path to workspace" },
          },
          required: ["projectId", "prototypeId", "feedback", "workspacePath"],
        },
      },
      {
        name: "deploy-chromatic",
        description: "Deploy Storybook to Chromatic for sharing",
        inputSchema: {
          type: "object",
          properties: {
            workspacePath: { type: "string", description: "Path to workspace with Storybook" },
            projectToken: { type: "string", description: "Chromatic project token" },
          },
          required: ["workspacePath"],
        },
      },

      // Linear Tools
      {
        name: "generate-tickets",
        description: "Generate Linear/Jira tickets from an engineering spec",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            engineeringSpec: { type: "string", description: "Engineering specification" },
            prototypeComponents: { type: "array", items: { type: "string" }, description: "Prototype components to link" },
            maxTickets: { type: "number", description: "Maximum number of tickets", default: 20 },
          },
          required: ["projectId", "engineeringSpec"],
        },
      },
      {
        name: "validate-tickets",
        description: "Validate that tickets will achieve the PRD outcome",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            tickets: { type: "array", items: { type: "object" }, description: "Tickets to validate" },
            prd: { type: "string", description: "PRD to validate against" },
            prototypeDescription: { type: "string", description: "Description of the prototype" },
          },
          required: ["projectId", "tickets", "prd"],
        },
      },

      // ==========================================
      // JOB CRUD TOOLS (for Cursor AI processing)
      // ==========================================
      {
        name: "get-pending-jobs",
        description: "Get all pending and running jobs from the orchestrator. Use this to find jobs that need processing.",
        inputSchema: {
          type: "object",
          properties: {
            workspaceId: { type: "string", description: "Optional workspace ID to filter by" },
            limit: { type: "number", description: "Maximum number of jobs to return (default: 20)" },
          },
          required: [],
        },
      },
      {
        name: "get-job-context",
        description: "Get full context for a job including project details and existing documents. Use this before processing a job.",
        inputSchema: {
          type: "object",
          properties: {
            jobId: { type: "string", description: "The job ID to get context for" },
          },
          required: ["jobId"],
        },
      },
      {
        name: "update-job-status",
        description: "Update a job's status and progress. Use this to mark a job as running or update progress.",
        inputSchema: {
          type: "object",
          properties: {
            jobId: { type: "string", description: "The job ID to update" },
            status: { type: "string", enum: ["pending", "running", "completed", "failed", "cancelled"], description: "New status" },
            progress: { type: "number", description: "Progress from 0 to 1" },
            output: { type: "object", description: "Output data" },
            error: { type: "string", description: "Error message if failed" },
          },
          required: ["jobId", "status"],
        },
      },
      {
        name: "complete-job",
        description: "Mark a job as complete and save the generated content as a document. This is the primary way to finish processing a job.",
        inputSchema: {
          type: "object",
          properties: {
            jobId: { type: "string", description: "The job ID to complete" },
            content: { type: "string", description: "The generated content (markdown)" },
            documentType: { type: "string", description: "Override document type (auto-detected from job type if not provided)" },
            documentTitle: { type: "string", description: "Custom document title" },
            metadata: { type: "object", description: "Additional metadata to store" },
          },
          required: ["jobId", "content"],
        },
      },
      {
        name: "fail-job",
        description: "Mark a job as failed with an error message.",
        inputSchema: {
          type: "object",
          properties: {
            jobId: { type: "string", description: "The job ID to fail" },
            error: { type: "string", description: "Error message explaining what went wrong" },
          },
          required: ["jobId", "error"],
        },
      },
      {
        name: "get-project-details",
        description: "Get full project details including all documents. Use this to understand a project's current state.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "The project ID" },
          },
          required: ["projectId"],
        },
      },
      {
        name: "save-document",
        description: "Save a document to a project. Use this to create new documents outside of job processing.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "The project ID" },
            type: { type: "string", description: "Document type (research, prd, design_brief, engineering_spec, gtm_brief, prototype_notes, jury_report)" },
            title: { type: "string", description: "Document title" },
            content: { type: "string", description: "Document content (markdown)" },
            metadata: { type: "object", description: "Additional metadata" },
          },
          required: ["projectId", "type", "title", "content"],
        },
      },
      {
        name: "get-company-context",
        description: "Get the paths to company context files (product vision, guardrails, personas). Read these files before generating content.",
        inputSchema: {
          type: "object",
          properties: {
            workspaceId: { type: "string", description: "The workspace ID" },
          },
          required: ["workspaceId"],
        },
      },
    ],
  };
});

// ============================================
// TOOL EXECUTION
// ============================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Document Generation
      case "generate-prd": {
        const input = GeneratePRDInputSchema.parse(args);
        const result = await generatePRD(input);
        return {
          content: [{ type: "text", text: result.success ? result.data! : `Error: ${result.error}` }],
        };
      }

      case "generate-design-brief": {
        const input = GenerateDesignBriefInputSchema.parse(args);
        const result = await generateDesignBrief(input);
        return {
          content: [{ type: "text", text: result.success ? result.data! : `Error: ${result.error}` }],
        };
      }

      case "generate-engineering-spec": {
        const input = GenerateEngineeringSpecInputSchema.parse(args);
        const result = await generateEngineeringSpec(input);
        return {
          content: [{ type: "text", text: result.success ? result.data! : `Error: ${result.error}` }],
        };
      }

      case "generate-gtm-brief": {
        const input = GenerateGTMBriefInputSchema.parse(args);
        const result = await generateGTMBrief(input);
        return {
          content: [{ type: "text", text: result.success ? result.data! : `Error: ${result.error}` }],
        };
      }

      // Research
      case "analyze-transcript": {
        const input = AnalyzeTranscriptInputSchema.parse(args);
        const result = await analyzeTranscript(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      // Jury
      case "run-jury-evaluation": {
        const input = RunJuryInputSchema.parse(args);
        const result = await runJuryEvaluation(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      case "iterate-from-feedback": {
        const { originalContent, juryResult } = args as { originalContent: string; juryResult: unknown };
        const result = await iterateFromFeedback(originalContent, juryResult as Parameters<typeof iterateFromFeedback>[1]);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      // Prototypes
      case "build-standalone-prototype": {
        const input = BuildPrototypeInputSchema.parse({ ...args, type: "standalone" });
        const result = await buildStandalonePrototype(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      case "build-context-prototype": {
        const input = BuildPrototypeInputSchema.parse({ ...args, type: "context" });
        const result = await buildContextPrototype(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      case "iterate-prototype": {
        const input = IteratePrototypeInputSchema.parse(args);
        const result = await iteratePrototype(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      case "deploy-chromatic": {
        const { workspacePath, projectToken } = args as { workspacePath: string; projectToken?: string };
        const result = await deployToChromatic(workspacePath, projectToken);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      // Linear
      case "generate-tickets": {
        const input = GenerateTicketsInputSchema.parse(args);
        const result = await generateTickets(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      case "validate-tickets": {
        const input = ValidateTicketsInputSchema.parse(args);
        const result = await validateTickets(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
        };
      }

      // ==========================================
      // JOB CRUD HANDLERS
      // ==========================================
      case "get-pending-jobs": {
        const { workspaceId, limit } = args as { workspaceId?: string; limit?: number };
        const result = await getPendingJobs({ workspaceId, limit });
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "get-job-context": {
        const { jobId } = args as { jobId: string };
        const result = await getJobContext({ jobId });
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "update-job-status": {
        const input = args as { jobId: string; status: "pending" | "running" | "completed" | "failed" | "cancelled"; progress?: number; output?: Record<string, unknown>; error?: string };
        const result = await updateJobStatus(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "complete-job": {
        const input = args as { jobId: string; content: string; documentType?: string; documentTitle?: string; metadata?: Record<string, unknown> };
        const result = await completeJob(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "fail-job": {
        const { jobId, error: errorMsg } = args as { jobId: string; error: string };
        const result = await failJob({ jobId, error: errorMsg });
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "get-project-details": {
        const { projectId } = args as { projectId: string };
        const result = await getProjectDetails({ projectId });
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "save-document": {
        const input = args as { projectId: string; type: string; title: string; content: string; metadata?: Record<string, unknown> };
        const result = await saveDocument(input);
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      case "get-company-context": {
        const { workspaceId } = args as { workspaceId: string };
        const result = await getCompanyContext({ workspaceId });
        return {
          content: [{ type: "text", text: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}` }],
          isError: !result.success,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
      isError: true,
    };
  }
});

// ============================================
// START SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PM Orchestrator MCP server running on stdio");
}

main().catch(console.error);
