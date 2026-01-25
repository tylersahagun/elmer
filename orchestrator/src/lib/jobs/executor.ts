/**
 * Job Executor - Validates and (optionally) executes jobs
 *
 * Execution can be configured per workspace:
 * - Cursor runner (jobs stay pending for MCP tools)
 * - Server runner (jobs execute here using /api/ai/generate)
 * - Hybrid (Cursor first, server fallback after a threshold)
 */

import { 
  getProject,
  getDocumentByType,
  createDocument,
  createJuryEvaluation,
  createTickets,
  getTickets,
  createPrototype,
  updatePrototype,
  createPrototypeVersion,
  updateProjectMetadata,
} from "@/lib/db/queries";
import type { JobType } from "@/lib/db/schema";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";
import { getRepoComponentList } from "@/lib/prototypes/context";
import { getWorkspaceContext, getProjectContext } from "@/lib/context/resolve";
import { commitAndPushChanges, createFeatureBranch } from "@/lib/git/branches";
import { getAgentExecutor } from "@/lib/agent";
import type { AgentJob } from "@/lib/agent/types";

// Types for job execution
interface JobContext {
  jobId: string;
  projectId: string;
  workspaceId: string;
  input: Record<string, unknown>;
}

interface ExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  /** If true, this failure shouldn't count against max attempts (e.g., waiting for dependency) */
  shouldRetryWithoutPenalty?: boolean;
}

type JobExecutor = (ctx: JobContext, updateProgress: (progress: number) => Promise<void>) => Promise<ExecutionResult>;

type ValidationMode = "none" | "light" | "schema";

const exec = promisify(execCallback);

// ============================================
// JOB VALIDATORS
// ============================================

/**
 * Validate that a job has the required prerequisites
 * Jobs are left in "pending" state for Cursor AI to process
 */

const validateGeneratePRD: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  // PRD can be generated with or without research
  // Just validate project exists
  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      projectName: project.name,
    } 
  };
};

const validateGenerateDesignBrief: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  // Design brief requires PRD
  const prd = await getDocumentByType(ctx.projectId, "prd");
  if (!prd) {
    return { 
      success: false, 
      error: "PRD not found - waiting for PRD generation to complete",
      shouldRetryWithoutPenalty: true, // Don't count this as a real failure
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasPRD: true,
    } 
  };
};

const validateGenerateEngineeringSpec: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  const prd = await getDocumentByType(ctx.projectId, "prd");
  if (!prd) {
    return { 
      success: false, 
      error: "PRD not found - waiting for PRD generation to complete",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasPRD: true,
    } 
  };
};

const validateGenerateGTMBrief: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  const prd = await getDocumentByType(ctx.projectId, "prd");
  if (!prd) {
    return { 
      success: false, 
      error: "PRD not found - waiting for PRD generation to complete",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasPRD: true,
    } 
  };
};

const validateAnalyzeTranscript: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  const transcript = ctx.input.transcript as string;
  if (!transcript) {
    return { success: false, error: "No transcript provided - add transcript input when moving to Discovery" };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasTranscript: true,
      transcriptLength: transcript.length,
    } 
  };
};

const validateRunJuryEvaluation: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  const phase = (ctx.input.phase as "research" | "prd" | "prototype") || "prd";

  // Check content exists for the phase
  if (phase === "research") {
    const doc = await getDocumentByType(ctx.projectId, "research");
    if (!doc) return { 
      success: false, 
      error: "No research document found - waiting for research to complete",
      shouldRetryWithoutPenalty: true,
    };
  } else if (phase === "prd") {
    const doc = await getDocumentByType(ctx.projectId, "prd");
    if (!doc) return { 
      success: false, 
      error: "No PRD found - waiting for PRD generation to complete",
      shouldRetryWithoutPenalty: true,
    };
  } else {
    const doc = await getDocumentByType(ctx.projectId, "prototype_notes");
    if (!doc) return { 
      success: false, 
      error: "No prototype notes found - waiting for prototype to be built",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      phase,
    } 
  };
};

const validateBuildPrototype: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  const prd = await getDocumentByType(ctx.projectId, "prd");
  if (!prd) {
    return { 
      success: false, 
      error: "PRD not found - waiting for PRD generation to complete",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasPRD: true,
      prototypeType: ctx.input.type || "standalone",
    } 
  };
};

const validateIteratePrototype: JobExecutor = async (ctx) => {
  const feedback = ctx.input.feedback as string;
  if (!feedback) {
    return { success: false, error: "No feedback provided" };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasFeedback: true,
    } 
  };
};

const validateGenerateTickets: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  const engSpec = await getDocumentByType(ctx.projectId, "engineering_spec");
  if (!engSpec) {
    return { 
      success: false, 
      error: "Engineering spec not found - waiting for engineering spec generation",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      hasEngSpec: true,
    } 
  };
};

const validateValidateTickets: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  // Check for tickets in database (created by generate_tickets job)
  const { getTickets } = await import("@/lib/db/queries");
  const existingTickets = await getTickets(ctx.projectId);
  if (!existingTickets || existingTickets.length === 0) {
    return { 
      success: false, 
      error: "No tickets to validate - waiting for tickets to be generated",
      shouldRetryWithoutPenalty: true,
    };
  }

  const prd = await getDocumentByType(ctx.projectId, "prd");
  if (!prd) {
    return { 
      success: false, 
      error: "PRD not found - waiting for PRD generation to complete",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      ticketCount: existingTickets.length,
    } 
  };
};

const validateScoreStageAlignment: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };
  return {
    success: true,
    output: {
      status: "pending",
      message: "Job ready for processing by AI",
    },
  };
};

const validateDeployChromatic: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };

  // Chromatic deployment requires prototype to be built first
  const prototypeNotes = await getDocumentByType(ctx.projectId, "prototype_notes");
  if (!prototypeNotes) {
    return { 
      success: false, 
      error: "Prototype not built yet - waiting for build_prototype to complete",
      shouldRetryWithoutPenalty: true,
    };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Chromatic deployment queued - requires CHROMATIC_PROJECT_TOKEN",
    } 
  };
};

const validateCreateFeatureBranch: JobExecutor = async (ctx) => {
  const project = await getProject(ctx.projectId);
  if (!project) return { success: false, error: "Project not found" };
  const repoRoot = getRepoRoot(project.workspace?.githubRepo ?? undefined);
  if (!repoRoot) {
    return { success: false, error: "Workspace GitHub repo path not configured" };
  }
  return {
    success: true,
    output: {
      status: "pending",
      message: "Job ready for processing by Cursor AI",
    },
  };
};

const validateProcessSignal: JobExecutor = async () => {
  return {
    success: true,
    output: { status: "pending", message: "Signal processing ready" },
  };
};

const validateSynthesizeSignals: JobExecutor = async () => {
  return {
    success: true,
    output: { status: "pending", message: "Signal synthesis ready" },
  };
};

const validateExecuteAgentDefinition: JobExecutor = async (ctx) => {
  if (!ctx.input?.agentDefinitionId) {
    return { success: false, error: "agentDefinitionId is required" };
  }
  return {
    success: true,
    output: { status: "pending", message: "Agent execution ready" },
  };
};

// ============================================
// VALIDATOR REGISTRY
// ============================================

const validators: Record<JobType, JobExecutor> = {
  generate_prd: validateGeneratePRD,
  generate_design_brief: validateGenerateDesignBrief,
  generate_engineering_spec: validateGenerateEngineeringSpec,
  generate_gtm_brief: validateGenerateGTMBrief,
  analyze_transcript: validateAnalyzeTranscript,
  process_signal: validateProcessSignal,
  synthesize_signals: validateSynthesizeSignals,
  run_jury_evaluation: validateRunJuryEvaluation,
  build_prototype: validateBuildPrototype,
  iterate_prototype: validateIteratePrototype,
  generate_tickets: validateGenerateTickets,
  validate_tickets: validateValidateTickets,
  score_stage_alignment: validateScoreStageAlignment,
  deploy_chromatic: validateDeployChromatic,
  create_feature_branch: validateCreateFeatureBranch,
  execute_agent_definition: validateExecuteAgentDefinition,
};

// ============================================
// AI GENERATION HELPERS
// ============================================

function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

function getWorkspaceRoot() {
  return path.resolve(process.cwd(), "..");
}

function getRepoRoot(githubRepo?: string) {
  if (!githubRepo) return null;
  if (path.isAbsolute(githubRepo)) return githubRepo;
  return path.join(getWorkspaceRoot(), githubRepo);
}

async function executeViaAgentExecutor(
  jobId: string,
  jobType: JobType,
  projectId: string,
  workspaceId: string,
  input: Record<string, unknown>
): Promise<ExecutionResult> {
  const executor = getAgentExecutor();
  const agentJob: AgentJob = {
    id: jobId,
    type: jobType,
    projectId,
    workspaceId,
    input,
    status: "running",
    attempts: 0,
    maxAttempts: 1,
    createdAt: new Date(),
  };

  const result = await executor.executeJob(agentJob);
  if (!result.success) {
    return { success: false, error: result.error || "Agent execution failed" };
  }

  return { success: true, output: result.output };
}

function toComponentName(name: string) {
  return name.replace(/[^a-zA-Z0-9 ]/g, " ").split(" ").filter(Boolean).map((part) =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join("");
}

function toStoryId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function callAiGenerate(tool: string, input: Record<string, unknown>) {
  const res = await fetch(`${getAppBaseUrl()}/api/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, input }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "AI generation failed");
  }

  const data = await res.json();
  return data.content as string;
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    const fencedMatch = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
      try {
        return JSON.parse(fencedMatch[1]) as T;
      } catch {
        // fall through
      }
    }
    const bracketMatch = value.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (bracketMatch?.[1]) {
      try {
        return JSON.parse(bracketMatch[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function formatResearchMarkdown(data: {
  summary?: string;
  keyInsights?: string[];
  userProblems?: Array<{ problem: string; quote?: string; severity?: string }>;
  featureRequests?: Array<{ request: string; frequency?: string }>;
  painPoints?: string[];
  positives?: string[];
  actionItems?: string[];
}) {
  const lines: string[] = [];
  if (data.summary) {
    lines.push(`# Research Summary`, "", data.summary, "");
  }
  if (data.keyInsights?.length) {
    lines.push(`## Key Insights`, ...data.keyInsights.map((i) => `- ${i}`), "");
  }
  if (data.userProblems?.length) {
    lines.push(`## User Problems`);
    data.userProblems.forEach((p) => {
      lines.push(`- ${p.problem}${p.severity ? ` (severity: ${p.severity})` : ""}`);
      if (p.quote) lines.push(`  - Quote: "${p.quote}"`);
    });
    lines.push("");
  }
  if (data.featureRequests?.length) {
    lines.push(`## Feature Requests`);
    data.featureRequests.forEach((r) => {
      lines.push(`- ${r.request}${r.frequency ? ` (${r.frequency})` : ""}`);
    });
    lines.push("");
  }
  if (data.painPoints?.length) {
    lines.push(`## Pain Points`, ...data.painPoints.map((p) => `- ${p}`), "");
  }
  if (data.positives?.length) {
    lines.push(`## Positive Feedback`, ...data.positives.map((p) => `- ${p}`), "");
  }
  if (data.actionItems?.length) {
    lines.push(`## Action Items`, ...data.actionItems.map((a) => `- ${a}`), "");
  }
  return lines.join("\n").trim();
}

function normalizeHeading(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function validateMarkdownSections(content: string, requiredSections: string[]) {
  const headings = content
    .split("\n")
    .filter((line) => line.trim().startsWith("#"))
    .map((line) => normalizeHeading(line.replace(/^#+\s*/, "")));
  const missing = requiredSections.filter(
    (section) => !headings.includes(normalizeHeading(section))
  );
  return missing;
}

function validateResearchJson(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (typeof data.summary !== "string" || data.summary.trim().length === 0) {
    errors.push("summary must be a non-empty string");
  }
  if (!Array.isArray(data.keyInsights)) {
    errors.push("keyInsights must be an array of strings");
  }
  if (data.userProblems && !Array.isArray(data.userProblems)) {
    errors.push("userProblems must be an array");
  }
  if (data.featureRequests && !Array.isArray(data.featureRequests)) {
    errors.push("featureRequests must be an array");
  }
  return errors;
}

function validateJuryJson(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (typeof data.verdict !== "string") {
    errors.push("verdict must be a string");
  }
  if (typeof data.approvalRate !== "number") {
    errors.push("approvalRate must be a number");
  }
  if (typeof data.conditionalRate !== "number") {
    errors.push("conditionalRate must be a number");
  }
  if (typeof data.rejectionRate !== "number") {
    errors.push("rejectionRate must be a number");
  }
  if (data.evaluations && !Array.isArray(data.evaluations)) {
    errors.push("evaluations must be an array");
  }
  return errors;
}

function validateTicketsJson(data: Array<Record<string, unknown>>) {
  const errors: string[] = [];
  if (!Array.isArray(data) || data.length === 0) {
    return ["tickets must be a non-empty array"];
  }
  data.forEach((ticket, index) => {
    if (typeof ticket.title !== "string" || ticket.title.trim().length === 0) {
      errors.push(`tickets[${index}].title must be a non-empty string`);
    }
    if (typeof ticket.description !== "string") {
      errors.push(`tickets[${index}].description must be a string`);
    }
  });
  return errors;
}

function validateTicketValidationJson(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (typeof data.isValid !== "boolean") {
    errors.push("isValid must be a boolean");
  }
  if (typeof data.coverage !== "number") {
    errors.push("coverage must be a number");
  }
  if (data.missingTickets && !Array.isArray(data.missingTickets)) {
    errors.push("missingTickets must be an array");
  }
  if (data.suggestions && !Array.isArray(data.suggestions)) {
    errors.push("suggestions must be an array");
  }
  return errors;
}

function validateStageScoreJson(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (typeof data.score !== "number" || data.score < 0 || data.score > 1) {
    errors.push("score must be a number between 0 and 1");
  }
  if (typeof data.summary !== "string" || data.summary.trim().length === 0) {
    errors.push("summary must be a non-empty string");
  }
  if (data.strengths && !Array.isArray(data.strengths)) {
    errors.push("strengths must be an array");
  }
  if (data.gaps && !Array.isArray(data.gaps)) {
    errors.push("gaps must be an array");
  }
  if (data.recommendations && !Array.isArray(data.recommendations)) {
    errors.push("recommendations must be an array");
  }
  return errors;
}

async function generateWithValidation<TParsed>({
  tool,
  input,
  validationMode,
  maxAttempts = 2,
  validate,
}: {
  tool: string;
  input: Record<string, unknown>;
  validationMode: ValidationMode;
  maxAttempts?: number;
  validate: (raw: string) => { ok: boolean; parsed?: TParsed; error?: string };
}) {
  let lastError = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const raw = await callAiGenerate(tool, {
      ...input,
      validationHint: lastError || undefined,
    });
    const result = validate(raw);
    if (result.ok) {
      return { raw, parsed: result.parsed };
    }
    if (validationMode === "none") {
      return { raw };
    }
    lastError = result.error || "Validation failed";
    if (attempt === maxAttempts) {
      if (validationMode === "light") {
        return { raw };
      }
      throw new Error(lastError);
    }
  }
  return { raw: "" };
}

const markdownRequirements: Partial<Record<JobType, string[]>> = {
  generate_prd: [
    "Problem Statement",
    "Target Personas",
    "Success Metrics",
    "User Journey",
    "MVP Scope",
    "Out of Scope",
    "Open Questions",
  ],
  generate_design_brief: [
    "Design Goals",
    "User Experience",
    "Visual Design",
    "Accessibility",
  ],
  generate_engineering_spec: [
    "Technical Overview",
    "Data Models",
    "API",
    "Testing Strategy",
  ],
  generate_gtm_brief: [
    "Positioning",
    "Target Audience",
    "Launch Timeline",
    "Success Metrics",
  ],
};

// ============================================
// MAIN VALIDATION FUNCTION
// ============================================

/**
 * Validate a job before leaving it in pending state
 * 
 * This function:
 * 1. Checks prerequisites (required documents, input)
 * 2. Returns success if job is ready for Cursor AI to process
 * 3. Returns error if prerequisites are missing
 * 
 * Jobs are NOT executed here - they stay in "pending" status
 * and are processed by Cursor AI via MCP tools.
 */
export async function executeJob(
  jobId: string,
  jobType: JobType,
  projectId: string,
  workspaceId: string,
  input: Record<string, unknown>
): Promise<ExecutionResult> {
  const validator = validators[jobType];
  
  if (!validator) {
    return { success: false, error: `Unknown job type: ${jobType}` };
  }

  const ctx: JobContext = {
    jobId,
    projectId,
    workspaceId,
    input,
  };

  // No-op progress updater for now
  const updateProgress = async () => {};

  try {
    const validation = await validator(ctx, updateProgress);
    if (!validation.success) {
      return validation;
    }

    const project = await getProject(projectId);
    if (!project) {
      return { success: false, error: "Project not found" };
    }
    const validationMode = (project.workspace?.settings?.aiValidationMode || "schema") as ValidationMode;

    switch (jobType) {
      case "process_signal":
      case "synthesize_signals":
      case "execute_agent_definition": {
        return await executeViaAgentExecutor(
          jobId,
          jobType,
          projectId,
          workspaceId,
          input
        );
      }

      case "analyze_transcript": {
        const transcript = (input.transcript as string) || "";
        const { raw, parsed } = await generateWithValidation<Record<string, unknown>>({
          tool: "analyze-transcript",
          input: { transcript },
          validationMode,
          validate: (value) => {
            const parsedValue = safeJsonParse<Record<string, unknown>>(value);
            if (!parsedValue) {
              return { ok: false, error: "Invalid JSON" };
            }
            const errors = validateResearchJson(parsedValue);
            return errors.length
              ? { ok: false, error: errors.join("; ") }
              : { ok: true, parsed: parsedValue };
          },
        });
        const content = parsed
          ? formatResearchMarkdown(parsed as Parameters<typeof formatResearchMarkdown>[0])
          : `# Research Summary\n\n\`\`\`json\n${raw}\n\`\`\``;
        await createDocument({
          projectId,
          type: "research",
          title: "Research Insights",
          content,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "Research insights generated" } };
      }

      case "generate_prd": {
        const research = await getDocumentByType(projectId, "research");
        const workspaceContext = await getWorkspaceContext(project.workspaceId);
        const projectContext = await getProjectContext(projectId);
        const { raw } = await generateWithValidation({
          tool: "generate-prd",
          input: {
            projectName: project.name,
            research: research?.content,
            companyContext: workspaceContext,
            transcript: projectContext,
          },
          validationMode,
          validate: (value) => {
            const required = markdownRequirements.generate_prd || [];
            const missing = validateMarkdownSections(value, required);
            return missing.length
              ? { ok: false, error: `Missing sections: ${missing.join(", ")}` }
              : { ok: true };
          },
        });
        await createDocument({
          projectId,
          type: "prd",
          title: `${project.name} PRD`,
          content: raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "PRD generated" } };
      }

      case "generate_design_brief": {
        const prd = await getDocumentByType(projectId, "prd");
        const { raw } = await generateWithValidation({
          tool: "generate-design-brief",
          input: {
            prd: prd?.content || "",
            designLanguage: await getWorkspaceContext(project.workspaceId),
          },
          validationMode,
          validate: (value) => {
            const required = markdownRequirements.generate_design_brief || [];
            const missing = validateMarkdownSections(value, required);
            return missing.length
              ? { ok: false, error: `Missing sections: ${missing.join(", ")}` }
              : { ok: true };
          },
        });
        await createDocument({
          projectId,
          type: "design_brief",
          title: `${project.name} Design Brief`,
          content: raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "Design brief generated" } };
      }

      case "generate_engineering_spec": {
        const prd = await getDocumentByType(projectId, "prd");
        const designBrief = await getDocumentByType(projectId, "design_brief");
        const { raw } = await generateWithValidation({
          tool: "generate-engineering-spec",
          input: {
            prd: prd?.content || "",
            designBrief: designBrief?.content,
            techStack: await getWorkspaceContext(project.workspaceId),
          },
          validationMode,
          validate: (value) => {
            const required = markdownRequirements.generate_engineering_spec || [];
            const missing = validateMarkdownSections(value, required);
            return missing.length
              ? { ok: false, error: `Missing sections: ${missing.join(", ")}` }
              : { ok: true };
          },
        });
        await createDocument({
          projectId,
          type: "engineering_spec",
          title: `${project.name} Engineering Spec`,
          content: raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "Engineering spec generated" } };
      }

      case "generate_gtm_brief": {
        const prd = await getDocumentByType(projectId, "prd");
        const { raw } = await generateWithValidation({
          tool: "generate-gtm-brief",
          input: {
            prd: prd?.content || "",
            marketingGuidelines: await getWorkspaceContext(project.workspaceId),
          },
          validationMode,
          validate: (value) => {
            const required = markdownRequirements.generate_gtm_brief || [];
            const missing = validateMarkdownSections(value, required);
            return missing.length
              ? { ok: false, error: `Missing sections: ${missing.join(", ")}` }
              : { ok: true };
          },
        });
        await createDocument({
          projectId,
          type: "gtm_brief",
          title: `${project.name} GTM Brief`,
          content: raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "GTM brief generated" } };
      }

      case "run_jury_evaluation": {
        const phase = (input.phase as "research" | "prd" | "prototype") || "prd";
        const contentDoc =
          phase === "research"
            ? await getDocumentByType(projectId, "research")
            : phase === "prototype"
            ? await getDocumentByType(projectId, "prototype_notes")
            : await getDocumentByType(projectId, "prd");
        const { raw, parsed } = await generateWithValidation<Record<string, unknown>>({
          tool: "run-jury-evaluation",
          input: {
            phase,
            content: contentDoc?.content || "",
            jurySize: input.jurySize || 12,
          },
          validationMode,
          validate: (value) => {
            const parsedValue = safeJsonParse<Record<string, unknown>>(value);
            if (!parsedValue) {
              return { ok: false, error: "Invalid JSON" };
            }
            const errors = validateJuryJson(parsedValue);
            return errors.length
              ? { ok: false, error: errors.join("; ") }
              : { ok: true, parsed: parsedValue };
          },
        });
        if (parsed) {
          await createJuryEvaluation({
            projectId,
            phase,
            jurySize: Number(parsed.jurySize || input.jurySize || 12),
            approvalRate: Number(parsed.approvalRate || 0),
            conditionalRate: Number(parsed.conditionalRate || 0),
            rejectionRate: Number(parsed.rejectionRate || 0),
            verdict: (parsed.verdict as "pass" | "fail" | "conditional") || "conditional",
            topConcerns: (parsed.topConcerns as string[]) || [],
            topSuggestions: (parsed.topSuggestions as string[]) || [],
            rawResults: parsed,
          });
        }
        await createDocument({
          projectId,
          type: "jury_report",
          title: `Jury Report - ${phase.toUpperCase()}`,
          content: parsed ? `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`` : raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "Jury evaluation complete" } };
      }

      case "generate_tickets": {
        const engSpec = await getDocumentByType(projectId, "engineering_spec");
        const { parsed } = await generateWithValidation<Array<Record<string, unknown>>>({
          tool: "generate-tickets",
          input: {
            engineeringSpec: engSpec?.content || "",
            maxTickets: input.maxTickets || 20,
          },
          validationMode,
          validate: (value) => {
            const parsedValue = safeJsonParse<Array<Record<string, unknown>>>(value);
            if (!parsedValue) {
              return { ok: false, error: "Invalid JSON array" };
            }
            const errors = validateTicketsJson(parsedValue);
            return errors.length
              ? { ok: false, error: errors.join("; ") }
              : { ok: true, parsed: parsedValue };
          },
        });
        if (parsed && parsed.length > 0) {
          await createTickets(projectId, parsed.map((t) => ({
            title: String(t.title || "Untitled"),
            description: String(t.description || ""),
            estimatedPoints: Number(t.estimatedPoints || 0),
            metadata: t,
          })));
        }
        return { success: true, output: { summary: "Tickets generated", count: parsed?.length || 0 } };
      }

      case "validate_tickets": {
        const prd = await getDocumentByType(projectId, "prd");
        const currentTickets = await getTickets(projectId);
        const { raw, parsed } = await generateWithValidation<Record<string, unknown>>({
          tool: "validate-tickets",
          input: {
            prd: prd?.content || "",
            tickets: currentTickets,
          },
          validationMode,
          validate: (value) => {
            const parsedValue = safeJsonParse<Record<string, unknown>>(value);
            if (!parsedValue) {
              return { ok: false, error: "Invalid JSON" };
            }
            const errors = validateTicketValidationJson(parsedValue);
            return errors.length
              ? { ok: false, error: errors.join("; ") }
              : { ok: true, parsed: parsedValue };
          },
        });
        await createDocument({
          projectId,
          type: "jury_report",
          title: "Ticket Validation",
          content: parsed ? `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`` : raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "Tickets validated" } };
      }

      case "score_stage_alignment": {
        const stage = (input.stage as string) || project.stage;
        const docTypeMap: Record<string, Parameters<typeof getDocumentByType>[1]> = {
          discovery: "research",
          prd: "prd",
          design: "design_brief",
          prototype: "prototype_notes",
          validate: "jury_report",
          tickets: "engineering_spec",
        };
        const docType = docTypeMap[stage] || "prd";
        const document = await getDocumentByType(projectId, docType);
        if (!document) {
          return { success: false, error: `No document found for ${stage}` };
        }
        const workspaceContext = await getWorkspaceContext(project.workspaceId);
        const { raw, parsed } = await generateWithValidation<Record<string, unknown>>({
          tool: "score-stage-alignment",
          input: {
            stage,
            document: document.content,
            companyContext: workspaceContext,
            guardrails: workspaceContext,
          },
          validationMode,
          validate: (value) => {
            const parsedValue = safeJsonParse<Record<string, unknown>>(value);
            if (!parsedValue) {
              return { ok: false, error: "Invalid JSON" };
            }
            const errors = validateStageScoreJson(parsedValue);
            return errors.length
              ? { ok: false, error: errors.join("; ") }
              : { ok: true, parsed: parsedValue };
          },
        });
        if (parsed) {
          const nextMetadata = {
            ...(project.metadata || {}),
            stageConfidence: {
              ...(project.metadata?.stageConfidence || {}),
              [stage]: {
                score: Number(parsed.score || 0),
                summary: String(parsed.summary || ""),
                strengths: (parsed.strengths as string[]) || [],
                gaps: (parsed.gaps as string[]) || [],
                updatedAt: new Date().toISOString(),
              },
            },
          };
          await updateProjectMetadata(projectId, nextMetadata);
        }
        await createDocument({
          projectId,
          type: "jury_report",
          title: `Alignment Score - ${stage.toUpperCase()}`,
          content: parsed ? `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`` : raw,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });
        return { success: true, output: { summary: "Alignment score generated" } };
      }

      case "build_prototype": {
        const repoRoot = getRepoRoot(project.workspace?.githubRepo ?? undefined);
        const prototypesPath = project.workspace?.settings?.prototypesPath || "src/components/prototypes";
        if (!repoRoot) {
          return { success: false, error: "Workspace GitHub repo path not configured" };
        }

        const componentName = toComponentName(project.name) || "Prototype";
        const folderName = toStoryId(project.name) || "prototype";
        const componentDir = path.join(repoRoot, prototypesPath, componentName);
        const componentFile = path.join(componentDir, `${componentName}.tsx`);
        const storyFile = path.join(componentDir, `${componentName}.stories.tsx`);

        await mkdir(componentDir, { recursive: true });

        const componentSource = `import { GlassCard } from "@/components/glass";

export function ${componentName}() {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-2">${project.name}</h3>
      <p className="text-sm text-muted-foreground">
        Prototype placeholder for ${project.name}. Replace with generated UI.
      </p>
    </GlassCard>
  );
}
`;

        const storyTitle = `Prototypes/${componentName}`;
        const storySource = `import type { Meta, StoryObj } from "@storybook/react";
import { ${componentName} } from "./${componentName}";

const meta: Meta<typeof ${componentName}> = {
  title: "${storyTitle}",
  component: ${componentName},
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {};
`;

        await writeFile(componentFile, componentSource, "utf8");
        await writeFile(storyFile, storySource, "utf8");

        if (
          project.workspace?.settings?.autoCommitJobs &&
          project.metadata?.gitBranch
        ) {
          try {
            await commitAndPushChanges({
              repoRoot,
              branch: project.metadata.gitBranch,
              message: `feat: prototype scaffold for ${project.name}`,
            });
          } catch (error) {
            console.error("Auto-commit failed:", error);
          }
        }

        const prototype = await createPrototype({
          projectId,
          type: (input.type as "standalone" | "context") || "standalone",
          name: `${project.name} Prototype`,
          storybookPath: `${toStoryId(storyTitle)}--default`,
        });

        const contextComponents = (input.type === "context" && repoRoot)
          ? await getRepoComponentList(repoRoot)
          : [];

        if (prototype?.id) {
          await updatePrototype(prototype.id, {
            status: "ready",
            storybookPath: `${toStoryId(storyTitle)}--default`,
            metadata: {
              stories: [storyFile],
              components: [componentFile],
              placementAnalysis: {
                // Use the configured prototypesPath for suggested location
                suggestedLocation: path.join(prototypesPath, folderName),
                existingPatterns: contextComponents,
              },
            },
          });
          await createPrototypeVersion({
            prototypeId: prototype.id,
            storybookPath: `${toStoryId(storyTitle)}--default`,
            metadata: {
              source: "build_prototype",
            },
          });
        }

        await createDocument({
          projectId,
          type: "prototype_notes",
          title: `${project.name} Prototype Notes`,
          content: `# Prototype Notes\n\n- Component: ${componentName}\n- Story: ${storyTitle}\n- Location: ${componentDir}\n`,
          metadata: { generatedBy: "ai", model: "claude-sonnet-4" },
        });

        return { success: true, output: { summary: "Prototype built", componentName } };
      }

      case "iterate_prototype": {
        const feedback = String(input.feedback || "");
        await createDocument({
          projectId,
          type: "prototype_notes",
          title: `${project.name} Prototype Iteration`,
          content: `# Iteration Feedback\n\n${feedback}`,
          metadata: { generatedBy: "user", reviewStatus: "draft" },
        });
        return { success: true, output: { summary: "Prototype iteration noted" } };
      }

      case "deploy_chromatic": {
        const repoRoot = getRepoRoot(project.workspace?.githubRepo ?? undefined);
        if (!repoRoot) {
          return { success: false, error: "Workspace GitHub repo path not configured" };
        }
        const chromaticToken = process.env.CHROMATIC_PROJECT_TOKEN;
        if (!chromaticToken) {
          return { success: false, error: "CHROMATIC_PROJECT_TOKEN is not set" };
        }

        const { stdout, stderr } = await exec(
          `npx chromatic --project-token=${chromaticToken} --exit-once-uploaded`,
          { cwd: repoRoot }
        );
        const output = `${stdout}\n${stderr}`;
        
        // Extract Chromatic dashboard URL (www.chromatic.com/build?...)
        const dashboardUrlMatch = output.match(/https:\/\/www\.chromatic\.com\/[^\s]*/i);
        const chromaticUrl = dashboardUrlMatch ? dashboardUrlMatch[0] : undefined;
        
        // Extract Storybook URL for embedding (branch--appId.chromatic.com)
        // This URL is used with /iframe.html?id=story-id&viewMode=story for embedding
        const storybookUrlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9]+\.chromatic\.com/i);
        const chromaticStorybookUrl = storybookUrlMatch ? storybookUrlMatch[0] : undefined;

        if (chromaticStorybookUrl || chromaticUrl) {
          const embedInfo = chromaticStorybookUrl 
            ? `\n\n**Embed URL**: ${chromaticStorybookUrl}/iframe.html?id=STORY_ID&viewMode=story` 
            : '';
          
          await createDocument({
            projectId,
            type: "prototype_notes",
            title: `${project.name} Chromatic Build`,
            content: `# Chromatic Build\n\n${chromaticUrl || chromaticStorybookUrl}${embedInfo}`,
            metadata: { generatedBy: "ai", model: "chromatic" },
          });

          const latestPrototype = project.prototypes?.[0];
          if (latestPrototype?.id) {
            await updatePrototype(latestPrototype.id, {
              chromaticUrl,
              chromaticStorybookUrl,
            });
            await createPrototypeVersion({
              prototypeId: latestPrototype.id,
              chromaticUrl,
              metadata: {
                source: "deploy_chromatic",
                chromaticStorybookUrl,
              },
            });
          }
        }

        return { success: true, output: { summary: "Chromatic deployed", chromaticUrl, chromaticStorybookUrl } };
      }

      case "create_feature_branch": {
        const repoRoot = getRepoRoot(project.workspace?.githubRepo ?? undefined);
        if (!repoRoot) {
          return { success: false, error: "Workspace GitHub repo path not configured" };
        }
        const baseBranch = String(input.baseBranch || project.workspace?.settings?.baseBranch || "main");
        const preferredBranch = String(input.preferredBranch || "");
        if (!preferredBranch) {
          return { success: false, error: "Preferred branch name is required" };
        }
        const branch = await createFeatureBranch({
          repoRoot,
          baseBranch,
          preferredBranch,
        });
        const nextMetadata = {
          ...(project.metadata || {}),
          gitBranch: branch,
          baseBranch,
        };
        await updateProjectMetadata(projectId, nextMetadata);
        return { success: true, output: { summary: "Branch created", branch } };
      }

      default:
        return { success: true, output: validation.output };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}
