/**
 * Jobs CRUD Operations for MCP Server
 * 
 * These tools allow Cursor (the AI agent) to:
 * 1. Fetch pending jobs from the orchestrator
 * 2. Get full context for a job
 * 3. Mark jobs complete with generated content
 * 4. Save documents to projects
 */

import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import type { ToolResult } from "../types.js";

// Database path - connects to orchestrator's SQLite
const DB_PATH = process.env.ORCHESTRATOR_DB_PATH || 
  new URL("../../../orchestrator/data/orchestrator.db", import.meta.url).pathname;

function getDb() {
  return new Database(DB_PATH);
}

// ============================================
// TYPES
// ============================================

interface Job {
  id: string;
  projectId: string | null;
  workspaceId: string;
  type: string;
  status: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  progress: number;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  stage: string;
  status: string;
  priority: number;
  metadata: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
}

interface Document {
  id: string;
  projectId: string;
  type: string;
  title: string;
  content: string;
  version: number;
  filePath: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
}

interface JobContext {
  job: Job;
  project: Project | null;
  documents: Document[];
  workspace: {
    id: string;
    name: string;
    contextPath: string | null;
  } | null;
}

// ============================================
// GET PENDING JOBS
// ============================================

export interface GetPendingJobsInput {
  workspaceId?: string;
  limit?: number;
}

export async function getPendingJobs(
  input: GetPendingJobsInput
): Promise<ToolResult<{ jobs: Job[]; count: number }>> {
  try {
    const db = getDb();
    const limit = input.limit || 20;
    
    let query = `
      SELECT 
        id, project_id as projectId, workspace_id as workspaceId,
        type, status, input, output, error, progress,
        created_at as createdAt, started_at as startedAt, completed_at as completedAt
      FROM jobs 
      WHERE status IN ('pending', 'running')
    `;
    const params: unknown[] = [];

    if (input.workspaceId) {
      query += ` AND workspace_id = ?`;
      params.push(input.workspaceId);
    }

    query += ` ORDER BY created_at ASC LIMIT ?`;
    params.push(limit);

    const jobs = db.prepare(query).all(...params) as Job[];
    
    // Parse JSON fields
    const parsedJobs = jobs.map(job => ({
      ...job,
      input: job.input ? JSON.parse(job.input as unknown as string) : null,
      output: job.output ? JSON.parse(job.output as unknown as string) : null,
    }));

    db.close();
    
    return { 
      success: true, 
      data: { jobs: parsedJobs, count: parsedJobs.length } 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get pending jobs" 
    };
  }
}

// ============================================
// GET JOB CONTEXT
// ============================================

export interface GetJobContextInput {
  jobId: string;
}

export async function getJobContext(
  input: GetJobContextInput
): Promise<ToolResult<JobContext>> {
  try {
    const db = getDb();
    
    // Get job
    const job = db.prepare(`
      SELECT 
        id, project_id as projectId, workspace_id as workspaceId,
        type, status, input, output, error, progress,
        created_at as createdAt, started_at as startedAt, completed_at as completedAt
      FROM jobs WHERE id = ?
    `).get(input.jobId) as Job | undefined;

    if (!job) {
      db.close();
      return { success: false, error: "Job not found" };
    }

    // Parse JSON fields
    const parsedJob = {
      ...job,
      input: job.input ? JSON.parse(job.input as unknown as string) : null,
      output: job.output ? JSON.parse(job.output as unknown as string) : null,
    };

    // Get project if exists
    let project: Project | null = null;
    if (job.projectId) {
      const projectRow = db.prepare(`
        SELECT 
          id, workspace_id as workspaceId, name, description,
          stage, status, priority, metadata,
          created_at as createdAt, updated_at as updatedAt
        FROM projects WHERE id = ?
      `).get(job.projectId) as Project | undefined;
      
      if (projectRow) {
        project = {
          ...projectRow,
          metadata: projectRow.metadata ? JSON.parse(projectRow.metadata as unknown as string) : null,
        };
      }
    }

    // Get existing documents for the project
    let documents: Document[] = [];
    if (job.projectId) {
      const docRows = db.prepare(`
        SELECT 
          id, project_id as projectId, type, title, content,
          version, file_path as filePath, metadata,
          created_at as createdAt, updated_at as updatedAt
        FROM documents WHERE project_id = ?
        ORDER BY type, version DESC
      `).all(job.projectId) as Document[];
      
      documents = docRows.map(doc => ({
        ...doc,
        metadata: doc.metadata ? JSON.parse(doc.metadata as unknown as string) : null,
      }));
    }

    // Get workspace
    const workspace = db.prepare(`
      SELECT id, name, context_path as contextPath
      FROM workspaces WHERE id = ?
    `).get(job.workspaceId) as { id: string; name: string; contextPath: string | null } | undefined;

    db.close();

    return {
      success: true,
      data: {
        job: parsedJob,
        project,
        documents,
        workspace: workspace || null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get job context",
    };
  }
}

// ============================================
// UPDATE JOB STATUS
// ============================================

export interface UpdateJobStatusInput {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress?: number;
  output?: Record<string, unknown>;
  error?: string;
}

export async function updateJobStatus(
  input: UpdateJobStatusInput
): Promise<ToolResult<Job>> {
  try {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);

    const updates: string[] = ["status = ?"];
    const params: unknown[] = [input.status];

    if (input.progress !== undefined) {
      updates.push("progress = ?");
      params.push(input.progress);
    }

    if (input.output !== undefined) {
      updates.push("output = ?");
      params.push(JSON.stringify(input.output));
    }

    if (input.error !== undefined) {
      updates.push("error = ?");
      params.push(input.error);
    }

    if (input.status === "running") {
      updates.push("started_at = ?");
      params.push(now);
    }

    if (input.status === "completed" || input.status === "failed") {
      updates.push("completed_at = ?");
      params.push(now);
    }

    params.push(input.jobId);

    db.prepare(`
      UPDATE jobs SET ${updates.join(", ")} WHERE id = ?
    `).run(...params);

    // Get updated job
    const job = db.prepare(`
      SELECT 
        id, project_id as projectId, workspace_id as workspaceId,
        type, status, input, output, error, progress,
        created_at as createdAt, started_at as startedAt, completed_at as completedAt
      FROM jobs WHERE id = ?
    `).get(input.jobId) as Job;

    db.close();

    return {
      success: true,
      data: {
        ...job,
        input: job.input ? JSON.parse(job.input as unknown as string) : null,
        output: job.output ? JSON.parse(job.output as unknown as string) : null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update job status",
    };
  }
}

// ============================================
// COMPLETE JOB
// ============================================

export interface CompleteJobInput {
  jobId: string;
  content: string;
  documentType?: string;
  documentTitle?: string;
  metadata?: Record<string, unknown>;
}

export async function completeJob(
  input: CompleteJobInput
): Promise<ToolResult<{ job: Job; document?: Document }>> {
  try {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);

    // Get job to find project
    const job = db.prepare(`
      SELECT id, project_id as projectId, workspace_id as workspaceId, type
      FROM jobs WHERE id = ?
    `).get(input.jobId) as { id: string; projectId: string | null; workspaceId: string; type: string } | undefined;

    if (!job) {
      db.close();
      return { success: false, error: "Job not found" };
    }

    // Map job type to document type
    const jobToDocType: Record<string, string> = {
      generate_prd: "prd",
      generate_design_brief: "design_brief",
      generate_engineering_spec: "engineering_spec",
      generate_gtm_brief: "gtm_brief",
      analyze_transcript: "research",
      run_jury_evaluation: "jury_report",
    };

    const docType = input.documentType || jobToDocType[job.type];
    let savedDocument: Document | undefined;

    // Save document if we have a project and document type
    if (job.projectId && docType) {
      const docId = uuidv4();
      const docTitle = input.documentTitle || `${docType.replace(/_/g, " ")} - Generated`;
      
      // Check if document of this type already exists
      const existingDoc = db.prepare(`
        SELECT id, version FROM documents 
        WHERE project_id = ? AND type = ?
        ORDER BY version DESC LIMIT 1
      `).get(job.projectId, docType) as { id: string; version: number } | undefined;

      const version = existingDoc ? existingDoc.version + 1 : 1;

      db.prepare(`
        INSERT INTO documents (id, project_id, type, title, content, version, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        docId,
        job.projectId,
        docType,
        docTitle,
        input.content,
        version,
        JSON.stringify({ generatedBy: "ai", ...input.metadata }),
        now,
        now
      );

      savedDocument = {
        id: docId,
        projectId: job.projectId,
        type: docType,
        title: docTitle,
        content: input.content,
        version,
        filePath: null,
        metadata: { generatedBy: "ai", ...input.metadata },
        createdAt: now,
        updatedAt: now,
      };
    }

    // Mark job complete
    db.prepare(`
      UPDATE jobs 
      SET status = 'completed', progress = 1.0, completed_at = ?, output = ?
      WHERE id = ?
    `).run(
      now,
      JSON.stringify({ 
        documentId: savedDocument?.id,
        documentType: docType,
        contentLength: input.content.length,
      }),
      input.jobId
    );

    // Get updated job
    const updatedJob = db.prepare(`
      SELECT 
        id, project_id as projectId, workspace_id as workspaceId,
        type, status, input, output, error, progress,
        created_at as createdAt, started_at as startedAt, completed_at as completedAt
      FROM jobs WHERE id = ?
    `).get(input.jobId) as Job;

    db.close();

    return {
      success: true,
      data: {
        job: {
          ...updatedJob,
          input: updatedJob.input ? JSON.parse(updatedJob.input as unknown as string) : null,
          output: updatedJob.output ? JSON.parse(updatedJob.output as unknown as string) : null,
        },
        document: savedDocument,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete job",
    };
  }
}

// ============================================
// FAIL JOB
// ============================================

export interface FailJobInput {
  jobId: string;
  error: string;
}

export async function failJob(
  input: FailJobInput
): Promise<ToolResult<Job>> {
  return updateJobStatus({
    jobId: input.jobId,
    status: "failed",
    error: input.error,
  });
}

// ============================================
// GET PROJECT DETAILS
// ============================================

export interface GetProjectDetailsInput {
  projectId: string;
}

export async function getProjectDetails(
  input: GetProjectDetailsInput
): Promise<ToolResult<{ project: Project; documents: Document[] }>> {
  try {
    const db = getDb();

    const project = db.prepare(`
      SELECT 
        id, workspace_id as workspaceId, name, description,
        stage, status, priority, metadata,
        created_at as createdAt, updated_at as updatedAt
      FROM projects WHERE id = ?
    `).get(input.projectId) as Project | undefined;

    if (!project) {
      db.close();
      return { success: false, error: "Project not found" };
    }

    const documents = db.prepare(`
      SELECT 
        id, project_id as projectId, type, title, content,
        version, file_path as filePath, metadata,
        created_at as createdAt, updated_at as updatedAt
      FROM documents WHERE project_id = ?
      ORDER BY type, version DESC
    `).all(input.projectId) as Document[];

    db.close();

    return {
      success: true,
      data: {
        project: {
          ...project,
          metadata: project.metadata ? JSON.parse(project.metadata as unknown as string) : null,
        },
        documents: documents.map(doc => ({
          ...doc,
          metadata: doc.metadata ? JSON.parse(doc.metadata as unknown as string) : null,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get project details",
    };
  }
}

// ============================================
// SAVE DOCUMENT
// ============================================

export interface SaveDocumentInput {
  projectId: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export async function saveDocument(
  input: SaveDocumentInput
): Promise<ToolResult<Document>> {
  try {
    const db = getDb();
    const now = Math.floor(Date.now() / 1000);

    // Check if document of this type already exists
    const existingDoc = db.prepare(`
      SELECT id, version FROM documents 
      WHERE project_id = ? AND type = ?
      ORDER BY version DESC LIMIT 1
    `).get(input.projectId, input.type) as { id: string; version: number } | undefined;

    const docId = uuidv4();
    const version = existingDoc ? existingDoc.version + 1 : 1;

    db.prepare(`
      INSERT INTO documents (id, project_id, type, title, content, version, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      input.projectId,
      input.type,
      input.title,
      input.content,
      version,
      JSON.stringify(input.metadata || {}),
      now,
      now
    );

    db.close();

    return {
      success: true,
      data: {
        id: docId,
        projectId: input.projectId,
        type: input.type,
        title: input.title,
        content: input.content,
        version,
        filePath: null,
        metadata: input.metadata || null,
        createdAt: now,
        updatedAt: now,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save document",
    };
  }
}

// ============================================
// GET COMPANY CONTEXT
// ============================================

export interface GetCompanyContextInput {
  workspaceId: string;
}

export async function getCompanyContext(
  input: GetCompanyContextInput
): Promise<ToolResult<{ contextPath: string; files: string[] }>> {
  try {
    const db = getDb();

    const workspace = db.prepare(`
      SELECT context_path as contextPath FROM workspaces WHERE id = ?
    `).get(input.workspaceId) as { contextPath: string | null } | undefined;

    db.close();

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const contextPath = workspace.contextPath || "elmer-docs/company-context/";
    
    // List expected context files
    const files = [
      `${contextPath}product-vision.md`,
      `${contextPath}strategic-guardrails.md`,
      `${contextPath}personas.md`,
      `${contextPath}tech-stack.md`,
    ];

    return {
      success: true,
      data: { contextPath, files },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get company context",
    };
  }
}
