# GitHub Agent Import Integration Review

**Review Date:** 2026-01-24  
**Reviewer:** AI Assistant  
**Context:** Integration recommendations for GitHub Agent Architecture Import plan with existing orchestrator features

---

## Executive Summary

This document provides specific integration recommendations for importing GitHub agents (SKILL.md files) into the orchestrator's existing automation system. The orchestrator already has a robust foundation with stage-based automation, job queues, activity logging, and permissions. This review addresses 10 critical integration points to ensure imported agents work seamlessly with existing features.

---

## Current Orchestrator Architecture

### Key Systems

1. **Kanban Board with Stages**
   - Projects move through columns (inbox → discovery → prd → design → prototype → validate → tickets → build → alpha → beta → ga)
   - Each column has `autoTriggerJobs` configuration
   - Stage transitions trigger automation via `ExecutionWorker`

2. **Dual Execution Systems**
   - **Legacy Jobs** (`jobs` table): API-based, uses `AgentExecutor`
   - **Stage Runs** (`stageRuns` table): Stage-based automation, uses `ExecutionWorker` with `StageRecipes`

3. **Skills System**
   - Skills stored in `skills` table with `source` field (`local` | `skillsmp`)
   - Skills can be imported from SkillsMP marketplace
   - Skills have `trustLevel` (`vetted` | `community` | `experimental`)
   - Skills referenced in `StageRecipes` via `RecipeStep.skillId`

4. **Activity & Notifications**
   - Activity logs (`activityLogs` table) track all workspace actions
   - Notifications (`notifications` table) for job completion/failure
   - Real-time updates via Server-Sent Events (SSE)

5. **Permissions**
   - Workspace roles: `admin`, `member`, `viewer`
   - Role-based access control enforced in API routes

---

## Integration Recommendations

### 1. Column Triggers: Coexistence with Built-in autoTriggerJobs

**Current State:**
- Columns have `autoTriggerJobs: JobType[]` (legacy job types)
- Stage transitions trigger `ExecutionWorker` which uses `StageRecipes` with `RecipeStep[]`

**Recommendation:**

**Option A: Unified Trigger System (Recommended)**
- Extend `columnConfigs.autoTriggerJobs` to support both legacy `JobType` and new `skillId` references
- When a project moves to a column:
  1. Check if column has `autoTriggerJobs` (legacy) → create `Job` records
  2. Check if column has `stageRecipe` → create `StageRun` record
  3. Both can coexist (run in parallel)

**Implementation:**
```typescript
// Extend columnConfigs schema
export const columnConfigs = pgTable("column_configs", {
  // ... existing fields
  autoTriggerJobs: jsonb("auto_trigger_jobs").$type<JobType[]>(),
  autoTriggerSkills: jsonb("auto_trigger_skills").$type<string[]>(), // skillIds
  stageRecipeId: text("stage_recipe_id").references(() => stageRecipes.id),
});

// In persistStageChange (KanbanBoard.tsx)
if (column?.autoTriggerJobs) {
  // Legacy job system
  for (const jobType of column.autoTriggerJobs) {
    await createJob({ type: jobType, ... });
  }
}

if (column?.autoTriggerSkills) {
  // New skill-based system
  for (const skillId of column.autoTriggerSkills) {
    await createStageRun({ skillId, ... });
  }
}

if (column?.stageRecipeId) {
  // Full recipe-based automation
  await createStageRun({ recipeId: column.stageRecipeId, ... });
}
```

**Option B: Migration Path**
- Phase 1: Imported agents create `StageRecipes` only
- Phase 2: Deprecate `autoTriggerJobs`, migrate to `StageRecipes`
- Phase 3: Remove `autoTriggerJobs` field

**Recommendation:** Use Option A for backward compatibility and flexibility.

---

### 2. Document Integration: Can Imported Agents Create/Update Documents?

**Current State:**
- Documents stored in `documents` table with `type` (prd, design_brief, engineering_spec, etc.)
- Stage executors create documents (e.g., `executePRD` creates PRD documents)
- Documents linked to projects via `projectId`

**Recommendation:**

**YES - Imported agents should be able to create/update documents.**

**Implementation:**
```typescript
// Add document creation capability to skill execution context
interface SkillExecutionContext {
  run: StageRun;
  project: Project;
  documents: Document[];
  workspacePath: string;
  
  // New: Document operations
  createDocument: (type: DocumentType, content: string, metadata?: Record<string, unknown>) => Promise<Document>;
  updateDocument: (documentId: string, content: string, metadata?: Record<string, unknown>) => Promise<Document>;
  getDocument: (type: DocumentType) => Document | null;
}

// In executeTaskSkill (stage-executors/index.ts)
const context = {
  ...existingContext,
  createDocument: async (type, content, metadata) => {
    return await createDocument({
      projectId: context.project.id,
      type,
      content,
      metadata: {
        ...metadata,
        generatedBy: `skill:${task.skillId}`,
        runId: context.run.id,
      },
    });
  },
  // ... other helpers
};
```

**Document Types:**
- Imported agents can create any document type
- Add validation: imported agents with `trustLevel: "community"` or `"experimental"` require approval before document creation
- Track document provenance: `metadata.generatedBy = "skill:{skillId}"`

**Schema Update:**
```typescript
// documents table already has metadata field
// Use it to track skill-generated documents
metadata: {
  generatedBy: "skill:github-agent-name",
  skillId: "skill_123",
  runId: "run_456",
  requiresReview: true, // for non-vetted skills
}
```

---

### 3. Activity Logging: Should Imported Agent Runs Show in Activity Feed?

**Current State:**
- Activity logs track: project creation, member invites, job completion
- Activity feed displays recent workspace activity
- Uses `logActivity()` helper function

**Recommendation:**

**YES - Imported agent runs should appear in activity feed.**

**Implementation:**
```typescript
// In executeStage or executeTaskSkill
await logActivity(
  workspaceId,
  userId, // null for automated actions
  "agent.run.started",
  {
    targetType: "run",
    targetId: run.id,
    metadata: {
      skillId: task.skillId,
      skillName: skill.name,
      projectId: context.project.id,
      projectName: context.project.name,
      stage: run.stage,
    },
  }
);

// On completion
await logActivity(
  workspaceId,
  null,
  "agent.run.completed",
  {
    targetType: "run",
    targetId: run.id,
    metadata: {
      skillId: task.skillId,
      success: result.success,
      duration: Date.now() - startTime,
      documentsCreated: result.documentsCreated?.length || 0,
    },
  }
);
```

**Activity Feed Display:**
- Show imported agent runs with icon/badge indicating source (GitHub vs built-in)
- Filter options: "All", "Built-in Only", "Imported Only"
- Group related runs (e.g., "3 agents ran for project X")

**New Activity Actions:**
- `agent.run.started`
- `agent.run.completed`
- `agent.run.failed`
- `agent.skill.imported`
- `agent.skill.updated`

---

### 4. Notifications: Should Users Be Notified When Imported Agents Complete/Fail?

**Current State:**
- Notifications created via `createJobNotification()` for job completion/failure
- Workspace settings control notification preferences:
  - `notifyOnJobComplete`
  - `notifyOnJobFailed`
  - `notifyOnApprovalRequired`

**Recommendation:**

**YES - But with granular controls.**

**Implementation:**
```typescript
// Extend WorkspaceSettings
export interface WorkspaceSettings {
  // ... existing fields
  
  // Agent notification settings
  notifyOnAgentComplete?: boolean; // Default: true
  notifyOnAgentFailed?: boolean; // Default: true
  notifyOnImportedAgentComplete?: boolean; // Default: false (more conservative)
  notifyOnImportedAgentFailed?: boolean; // Default: true (failures always notify)
  notifyOnDocumentCreated?: boolean; // Default: false
  notifyOnDocumentRequiresReview?: boolean; // Default: true
}

// In completeRun (run-manager.ts)
if (run.skillId) {
  const skill = await getSkill(run.skillId);
  const isImported = skill.source === "github" || skill.source === "skillsmp";
  
  if (status === "succeeded") {
    if (isImported && workspace.settings?.notifyOnImportedAgentComplete) {
      await createAgentNotification({
        workspaceId: run.workspaceId,
        runId: run.id,
        skillId: run.skillId,
        skillName: skill.name,
        status: "completed",
        projectId: run.cardId,
      });
    } else if (!isImported && workspace.settings?.notifyOnAgentComplete) {
      // Built-in agent notification
    }
  }
  
  if (status === "failed") {
    // Always notify on failures
    await createAgentNotification({
      workspaceId: run.workspaceId,
      runId: run.id,
      skillId: run.skillId,
      skillName: skill.name,
      status: "failed",
      error: errorSummary,
      projectId: run.cardId,
    });
  }
}
```

**Notification Types:**
- `agent_completed` - Agent run completed successfully
- `agent_failed` - Agent run failed
- `document_created` - New document created by agent (if enabled)
- `document_requires_review` - Document created by non-vetted agent

**UI Considerations:**
- Show notification badge with agent source (GitHub icon for imported)
- Link to run logs, not just project
- Group notifications: "3 agents completed for Project X"

---

### 5. Permissions: Can Viewers Trigger Imported Agents? Only Admins Import?

**Current State:**
- Workspace roles: `admin`, `member`, `viewer`
- Role checks in API routes (e.g., `requireWorkspaceRole(workspaceId, "admin")`)

**Recommendation:**

**Import Permissions:**
- **Import agents:** `admin` only (modifying workspace configuration)
- **View imported agents:** `admin`, `member`, `viewer` (read-only)

**Execution Permissions:**
- **Trigger agents manually:** `admin`, `member` (viewers cannot trigger)
- **Auto-triggered agents:** All roles (automation runs regardless of who moved card)
- **Approve agent outputs:** `admin`, `member` (viewers cannot approve)

**Implementation:**
```typescript
// API route: POST /api/skills (import)
export async function POST(request: Request) {
  const session = await getServerSession();
  const { workspaceId, action } = await request.json();
  
  if (action === "import") {
    // Require admin for import
    await requireWorkspaceRole(workspaceId, session.user.id, "admin");
    // ... import logic
  }
  
  if (action === "create") {
    // Require admin for creating custom skills
    await requireWorkspaceRole(workspaceId, session.user.id, "admin");
    // ... create logic
  }
}

// API route: POST /api/runs (trigger agent)
export async function POST(request: Request) {
  const session = await getServerSession();
  const { workspaceId, skillId, projectId } = await request.json();
  
  // Require member or admin to trigger
  await requireWorkspaceRole(workspaceId, session.user.id, "member");
  // ... trigger logic
}

// In KanbanBoard.tsx (auto-trigger on column move)
// No permission check needed - automation runs for all roles
```

**UI Considerations:**
- Hide "Import Agent" button for non-admins
- Disable "Run Agent" button for viewers
- Show "Approval Required" badge for viewers when agent output needs review

---

### 6. Project Context: How Does Project's Documents/Metadata Flow to Agents?

**Current State:**
- `StageContext` includes: `run`, `project`, `recipe`, `documents`, `workspacePath`
- Documents loaded via `loadStageContext()`
- Project metadata in `projects.metadata` JSONB field

**Recommendation:**

**Comprehensive Context Injection**

**Implementation:**
```typescript
// Extend StageContext for imported agents
export interface AgentExecutionContext extends StageContext {
  // Existing fields
  run: StageRun;
  project: Project;
  recipe: StageRecipe | null;
  documents: Document[];
  workspacePath: string;
  
  // New: Rich context for agents
  projectContext: {
    name: string;
    description: string;
    stage: ProjectStage;
    metadata: ProjectMetadata;
    tags: string[];
    linkedIssues: string[];
    personas: string[];
    hypothesis: string;
  };
  
  documentContext: {
    prd: Document | null;
    designBrief: Document | null;
    engineeringSpec: Document | null;
    research: Document[];
    // ... other document types
  };
  
  workspaceContext: {
    name: string;
    settings: WorkspaceSettings;
    companyContext: {
      productVision: string | null;
      strategicGuardrails: string | null;
      personas: Persona[];
    };
  };
  
  // Helper functions
  getDocument: (type: DocumentType) => Document | null;
  getAllDocuments: () => Document[];
  getProjectMetadata: () => ProjectMetadata;
}

// In loadStageContext (stage-executors/index.ts)
async function loadAgentContext(run: StageRun): Promise<AgentExecutionContext> {
  const baseContext = await loadStageContext(run);
  
  // Load workspace context
  const workspace = await getWorkspace(run.workspaceId);
  const companyContext = await getCompanyContext(run.workspaceId);
  
  // Organize documents by type
  const documentContext = {
    prd: baseContext.documents.find(d => d.type === "prd") || null,
    designBrief: baseContext.documents.find(d => d.type === "design_brief") || null,
    engineeringSpec: baseContext.documents.find(d => d.type === "engineering_spec") || null,
    research: baseContext.documents.filter(d => d.type === "research"),
    // ... other types
  };
  
  return {
    ...baseContext,
    projectContext: {
      name: baseContext.project.name,
      description: baseContext.project.description || "",
      stage: baseContext.project.stage,
      metadata: baseContext.project.metadata || {},
      tags: baseContext.project.metadata?.tags || [],
      linkedIssues: baseContext.project.metadata?.linkedIssues || [],
      personas: baseContext.project.metadata?.personas || [],
      hypothesis: baseContext.project.metadata?.hypothesis || "",
    },
    documentContext,
    workspaceContext: {
      name: workspace.name,
      settings: workspace.settings || {},
      companyContext,
    },
    getDocument: (type: DocumentType) => baseContext.documents.find(d => d.type === type) || null,
    getAllDocuments: () => baseContext.documents,
    getProjectMetadata: () => baseContext.project.metadata || {},
  };
}
```

**Context Injection into Agent Prompts:**
```typescript
// In executeTaskSkill
const agentContext = await loadAgentContext(context.run);

// Build system prompt with context
const systemPrompt = `
You are executing the skill: ${skill.name}

PROJECT CONTEXT:
- Name: ${agentContext.projectContext.name}
- Stage: ${agentContext.projectContext.stage}
- Description: ${agentContext.projectContext.description}
- Tags: ${agentContext.projectContext.tags.join(", ")}

AVAILABLE DOCUMENTS:
${agentContext.documentContext.prd ? "- PRD available\n" : ""}
${agentContext.documentContext.designBrief ? "- Design Brief available\n" : ""}
${agentContext.documentContext.research.length > 0 ? `- ${agentContext.documentContext.research.length} research documents\n` : ""}

COMPANY CONTEXT:
${agentContext.workspaceContext.companyContext.productVision ? `Product Vision: ${agentContext.workspaceContext.companyContext.productVision}\n` : ""}

${skill.promptTemplate || ""}
`;

// User prompt includes task-specific instructions
const userPrompt = `
Execute this task: ${task.name || task.skillId}

Project: ${agentContext.projectContext.name}
Stage: ${agentContext.projectContext.stage}

${task.paramsJson ? `Parameters: ${JSON.stringify(task.paramsJson, null, 2)}\n` : ""}
`;
```

**Context Size Limits:**
- Limit document content to last 10,000 characters per document
- Truncate company context if too large
- Provide "View Full Context" link in run logs

---

### 7. Job Queue: Do Imported Agent Jobs Use the Same Queue as Built-in Jobs?

**Current State:**
- Legacy jobs use `jobs` table with `status: "pending" | "running" | "completed" | "failed"`
- Stage runs use `stageRuns` table with `status: "pending" | "running" | "succeeded" | "failed" | "cancelled"`
- Two separate workers: `JobWorker` (legacy) and `ExecutionWorker` (stage-based)

**Recommendation:**

**YES - Use unified queue with priority system.**

**Implementation:**
```typescript
// Option A: Extend stageRuns to handle both built-in and imported agents
// (Recommended - stageRuns is more modern and feature-rich)

// stageRuns already supports:
// - skillId reference
// - recipe-based execution
// - task-based verification
// - artifact creation

// Imported agents should create stageRuns, not legacy jobs

// Option B: Unified queue table (if migration desired)
// Create new `agentRuns` table that replaces both jobs and stageRuns
// This is a larger refactor - not recommended for initial import

// Recommendation: Use stageRuns for all agent execution
```

**Queue Priority:**
```typescript
// Add priority to stageRuns
export const stageRuns = pgTable("stage_runs", {
  // ... existing fields
  priority: integer("priority").default(0), // Higher = more urgent
  source: text("source").$type<"built-in" | "imported" | "manual">().default("built-in"),
});

// In ExecutionWorker.getQueuedRuns()
export async function getQueuedRuns(workspaceId?: string): Promise<StageRun[]> {
  return await db
    .select()
    .from(stageRuns)
    .where(
      and(
        eq(stageRuns.status, "pending"),
        workspaceId ? eq(stageRuns.workspaceId, workspaceId) : undefined
      )
    )
    .orderBy(desc(stageRuns.priority), asc(stageRuns.createdAt))
    .limit(10);
}
```

**Queue Management:**
- Built-in agents: `priority: 5` (default)
- Imported agents: `priority: 3` (slightly lower)
- Manual triggers: `priority: 10` (highest)
- Failed retries: `priority: 1` (lowest)

**Concurrency:**
- Use existing `ExecutionWorker` concurrency limits
- Respect `workspace.settings.workerMaxConcurrency` (default: 3)
- No special treatment needed for imported agents

---

### 8. Real-time Updates: Do Imported Agent Runs Update the UI in Real-time?

**Current State:**
- Real-time updates via Server-Sent Events (SSE)
- `useRealtimeJobs` hook subscribes to job updates
- `ExecutionWorker` emits progress events via `StreamCallback`

**Recommendation:**

**YES - Imported agents use same real-time system.**

**Implementation:**
```typescript
// ExecutionWorker already supports real-time updates via StreamCallback
// No changes needed - imported agents automatically get real-time updates

// In executeStage (stage-executors/index.ts)
export async function executeStage(
  run: StageRun,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  // callbacks.onLog() → SSE → UI
  // callbacks.onProgress() → SSE → UI
  // callbacks.onArtifact() → SSE → UI
  
  // Works for both built-in and imported agents
}

// SSE endpoint already handles stageRuns
// GET /api/runs/[id]/stream
// Emits: run_update, run_log, run_progress, run_completed
```

**UI Updates:**
- Project cards show active agent runs (already implemented)
- Job logs drawer shows run logs (already implemented)
- Progress bars update in real-time (already implemented)

**Enhancement: Show Agent Source:**
```typescript
// In JobLogsDrawer.tsx
const skill = run.skillId ? await getSkill(run.skillId) : null;
const isImported = skill?.source === "github" || skill?.source === "skillsmp";

return (
  <div>
    <div className="flex items-center gap-2">
      <span>Running: {skill?.name || "Unknown Agent"}</span>
      {isImported && (
        <Badge variant="outline">
          <GitHub className="w-3 h-3 mr-1" />
          Imported
        </Badge>
      )}
    </div>
    {/* ... rest of UI */}
  </div>
);
```

---

### 9. Workspace Isolation: Are Imported Agents Isolated Per Workspace?

**Current State:**
- Skills table has `workspaceId` field (nullable for global skills)
- Workspace members can only see their workspace's data
- API routes filter by `workspaceId`

**Recommendation:**

**YES - Full workspace isolation.**

**Implementation:**
```typescript
// Skills are already workspace-scoped
export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  // workspaceId: null = global/system skill
  // workspaceId: "ws_123" = workspace-specific skill
});

// When importing from GitHub:
export async function importAgentFromGitHub(
  workspaceId: string,
  githubRepo: string,
  skillPath: string
): Promise<string> {
  // 1. Fetch SKILL.md from GitHub
  const skillContent = await fetchFromGitHub(githubRepo, skillPath);
  
  // 2. Parse SKILL.md
  const skillMetadata = parseSkillMd(skillContent);
  
  // 3. Create skill record with workspaceId
  const skillId = await createSkill({
    workspaceId, // ← Workspace isolation
    source: "github",
    name: skillMetadata.name,
    description: skillMetadata.description,
    githubRepo,
    githubPath: skillPath,
    trustLevel: "community", // Default for imported
  });
  
  return skillId;
}

// API route filtering
export async function GET(request: Request) {
  const { workspaceId } = await getWorkspaceFromRequest(request);
  
  // Only return skills for this workspace
  const skills = await db
    .select()
    .from(skills)
    .where(
      or(
        eq(skills.workspaceId, workspaceId),
        isNull(skills.workspaceId) // Global skills visible to all
      )
    );
  
  return NextResponse.json(skills);
}
```

**Global vs Workspace Skills:**
- **Global skills** (`workspaceId: null`): System-built skills, visible to all workspaces
- **Workspace skills** (`workspaceId: "ws_123"`): Imported or custom skills, only visible to that workspace

**Sharing Between Workspaces:**
- Option 1: Re-import same GitHub repo in another workspace
- Option 2: Export/import skill configuration (see #10)
- Option 3: Create "skill marketplace" within orchestrator (future)

---

### 10. Export/Backup: Can Users Export Their Imported Agent Configurations?

**Current State:**
- No export functionality for skills
- Skills stored in database only

**Recommendation:**

**YES - Export/backup functionality.**

**Implementation:**
```typescript
// API route: GET /api/skills/[id]/export
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  
  const skill = await db
    .select()
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);
  
  if (!skill[0]) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }
  
  // Require workspace member to export
  await requireWorkspaceRole(skill[0].workspaceId, session.user.id, "member");
  
  // Export format matches GitHub SKILL.md structure
  const exportData = {
    metadata: {
      name: skill[0].name,
      description: skill[0].description,
      version: skill[0].version,
      source: skill[0].source,
      trustLevel: skill[0].trustLevel,
      tags: skill[0].tags,
      inputSchema: skill[0].inputSchema,
      outputSchema: skill[0].outputSchema,
    },
    content: skill[0].promptTemplate,
    github: skill[0].source === "github" ? {
      repo: skill[0].remoteMetadata?.githubRepo,
      path: skill[0].remoteMetadata?.githubPath,
      commit: skill[0].remoteMetadata?.githubCommit,
    } : null,
  };
  
  return NextResponse.json(exportData);
}

// API route: POST /api/skills/export-workspace
export async function POST(request: Request) {
  const { workspaceId } = await request.json();
  const session = await getServerSession();
  
  await requireWorkspaceRole(workspaceId, session.user.id, "admin");
  
  // Export all workspace skills
  const workspaceSkills = await db
    .select()
    .from(skills)
    .where(eq(skills.workspaceId, workspaceId));
  
  const exportPackage = {
    workspaceId,
    exportedAt: new Date().toISOString(),
    skills: workspaceSkills.map(skill => ({
      metadata: {
        name: skill.name,
        description: skill.description,
        version: skill.version,
        source: skill.source,
        trustLevel: skill.trustLevel,
        tags: skill.tags,
        inputSchema: skill.inputSchema,
        outputSchema: skill.outputSchema,
      },
      content: skill.promptTemplate,
      github: skill.source === "github" ? {
        repo: skill.remoteMetadata?.githubRepo,
        path: skill.remoteMetadata?.githubPath,
      } : null,
    })),
  };
  
  return NextResponse.json(exportPackage, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="workspace-${workspaceId}-skills-${Date.now()}.json"`,
    },
  });
}

// API route: POST /api/skills/import-package
export async function POST(request: Request) {
  const { workspaceId, package: importPackage } = await request.json();
  const session = await getServerSession();
  
  await requireWorkspaceRole(workspaceId, session.user.id, "admin");
  
  const imported: string[] = [];
  const errors: string[] = [];
  
  for (const skillData of importPackage.skills) {
    try {
      const skillId = await createSkill({
        workspaceId,
        source: "local", // Mark as local import
        name: skillData.metadata.name,
        description: skillData.metadata.description,
        version: skillData.metadata.version,
        promptTemplate: skillData.content,
        trustLevel: skillData.metadata.trustLevel || "community",
        tags: skillData.metadata.tags || [],
        inputSchema: skillData.metadata.inputSchema,
        outputSchema: skillData.metadata.outputSchema,
        remoteMetadata: {
          importedFrom: importPackage.workspaceId,
          importedAt: new Date().toISOString(),
          originalSource: skillData.metadata.source,
        },
      });
      imported.push(skillId);
    } catch (error) {
      errors.push(`${skillData.metadata.name}: ${error.message}`);
    }
  }
  
  return NextResponse.json({
    imported: imported.length,
    errors: errors.length,
    skillIds: imported,
    errorDetails: errors,
  });
}
```

**Export Formats:**
1. **Single Skill Export:** JSON matching SKILL.md structure
2. **Workspace Export:** JSON package with all workspace skills
3. **GitHub-Compatible:** Export as SKILL.md file for version control

**Backup Strategy:**
- Auto-backup on skill import/update (optional)
- Manual backup via UI button
- Export includes:
  - Skill metadata
  - Prompt template
  - Input/output schemas
  - GitHub source reference (if applicable)
  - Trust level and tags

**UI:**
- "Export Skill" button in skill settings
- "Export All Workspace Skills" in workspace settings
- "Import Skills Package" in workspace settings

---

## Summary of Schema Changes

### New Fields Needed

1. **columnConfigs table:**
   - `autoTriggerSkills: jsonb` (string[] of skillIds)
   - `stageRecipeId: text` (reference to stageRecipes)

2. **stageRuns table:**
   - `priority: integer` (default: 0)
   - `source: text` ("built-in" | "imported" | "manual")

3. **skills table:**
   - Already has `workspaceId`, `source`, `trustLevel` ✅
   - May need: `githubRepo: text`, `githubPath: text`, `githubCommit: text`

4. **documents table:**
   - Already has `metadata: jsonb` ✅
   - Use metadata to track: `generatedBy`, `skillId`, `runId`, `requiresReview`

5. **workspaceSettings:**
   - `notifyOnAgentComplete: boolean`
   - `notifyOnAgentFailed: boolean`
   - `notifyOnImportedAgentComplete: boolean`
   - `notifyOnImportedAgentFailed: boolean`
   - `notifyOnDocumentCreated: boolean`
   - `notifyOnDocumentRequiresReview: boolean`

### New Tables (Optional)

1. **skillExports table** (for backup tracking):
   - `id: text`
   - `workspaceId: text`
   - `exportedAt: timestamp`
   - `exportData: jsonb`
   - `exportedBy: text` (userId)

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Add schema fields for imported agents
2. Implement GitHub SKILL.md parser
3. Create import API endpoint
4. Basic skill execution in stageRuns

### Phase 2: Integration (Week 2)
1. Add activity logging for agent runs
2. Add notifications for agent completion/failure
3. Implement document creation from agents
4. Add context injection into agent prompts

### Phase 3: Polish (Week 3)
1. Add export/backup functionality
2. UI enhancements (badges, filters, source indicators)
3. Permission enforcement
4. Documentation and testing

---

## Open Questions

1. **Version Management:** How do we handle updates to imported GitHub agents?
   - Auto-sync on import?
   - Manual update trigger?
   - Version pinning?

2. **Dependencies:** Can imported agents depend on other imported agents?
   - Skill dependency graph?
   - Execution order resolution?

3. **Testing:** How do we test imported agents before production use?
   - Sandbox execution?
   - Dry-run mode?

4. **Rate Limiting:** Should imported agents have different rate limits?
   - Per-workspace limits?
   - Per-skill limits?

5. **Error Handling:** How do we handle malicious or broken imported agents?
   - Sandbox execution?
   - Timeout limits?
   - Resource limits?

---

## Conclusion

The orchestrator's existing architecture provides a solid foundation for importing GitHub agents. The recommendations above ensure:

1. ✅ **Backward Compatibility:** Existing autoTriggerJobs continue to work
2. ✅ **Seamless Integration:** Imported agents use same execution system
3. ✅ **Security:** Workspace isolation and permission checks
4. ✅ **Observability:** Activity logs and notifications
5. ✅ **Flexibility:** Export/backup and context injection
6. ✅ **User Experience:** Real-time updates and clear source indicators

The main work involves:
- Extending schema for imported agent metadata
- Adding import/export APIs
- Enhancing context injection
- UI polish for agent source indicators

All recommendations align with existing patterns and require minimal refactoring.
