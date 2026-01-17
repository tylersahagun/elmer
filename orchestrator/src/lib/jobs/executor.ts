/**
 * Job Executor - Creates jobs for Cursor AI to process via MCP
 * 
 * This module no longer executes AI calls directly. Instead:
 * 1. Jobs are created with status "pending"
 * 2. Cursor AI processes them via MCP tools (get-pending-jobs, complete-job)
 * 3. The UI polls for job status updates
 * 
 * The actual AI generation happens in Cursor using its credentials.
 */

import { 
  getProject, 
  getDocumentByType, 
  updateJobStatus,
} from "@/lib/db/queries";
import type { JobType } from "@/lib/db/schema";

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
}

type JobExecutor = (ctx: JobContext, updateProgress: (progress: number) => Promise<void>) => Promise<ExecutionResult>;

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
    return { success: false, error: "PRD not found - generate PRD first" };
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
    return { success: false, error: "PRD not found - generate PRD first" };
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
    return { success: false, error: "PRD not found - generate PRD first" };
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
    if (!doc) return { success: false, error: "No research document found" };
  } else if (phase === "prd") {
    const doc = await getDocumentByType(ctx.projectId, "prd");
    if (!doc) return { success: false, error: "No PRD found" };
  } else {
    const doc = await getDocumentByType(ctx.projectId, "prototype_notes");
    if (!doc) return { success: false, error: "No prototype notes found" };
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
    return { success: false, error: "PRD not found - generate PRD first" };
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
    return { success: false, error: "Engineering spec not found - generate it first" };
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

  const tickets = ctx.input.tickets as Array<Record<string, unknown>>;
  if (!tickets || tickets.length === 0) {
    return { success: false, error: "No tickets to validate" };
  }

  const prd = await getDocumentByType(ctx.projectId, "prd");
  if (!prd) {
    return { success: false, error: "PRD not found" };
  }

  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Job ready for processing by Cursor AI",
      ticketCount: tickets.length,
    } 
  };
};

const validateDeployChromatic: JobExecutor = async () => {
  // Chromatic deployment doesn't require AI, just CLI
  return { 
    success: true, 
    output: { 
      status: "pending",
      message: "Chromatic deployment queued - requires CHROMATIC_PROJECT_TOKEN",
    } 
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
  run_jury_evaluation: validateRunJuryEvaluation,
  build_prototype: validateBuildPrototype,
  iterate_prototype: validateIteratePrototype,
  generate_tickets: validateGenerateTickets,
  validate_tickets: validateValidateTickets,
  deploy_chromatic: validateDeployChromatic,
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

  // No-op progress updater since we're just validating
  const updateProgress = async () => {};

  try {
    const result = await validator(ctx, updateProgress);
    
    if (result.success) {
      // Job is valid and ready for Cursor AI to process
      // Keep it in "pending" status - Cursor will pick it up via MCP
      console.log(`[Job ${jobId}] Validated and ready for Cursor AI processing`);
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}
