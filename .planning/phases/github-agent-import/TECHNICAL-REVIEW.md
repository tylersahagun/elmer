# GitHub Agent Architecture Import - Technical Architecture Review

**Review Date:** 2026-01-24  
**Reviewer:** AI Architecture Review  
**Status:** Recommendations for Implementation Plan

## Executive Summary

This document provides technical architecture recommendations for importing agent definitions from GitHub repositories (specifically `.cursor/` directories) into the orchestrator system. The plan adds GitHub API integration, agent definition parsing, dynamic job execution, and knowledge base syncing.

**Key Findings:**
- Current architecture is well-suited for this feature
- Database schema needs extension for agent definitions
- Background job processing is recommended for parsing/syncing
- Type safety requires careful schema design
- Performance optimizations needed for large imports

---

## 1. Database Design

### Current State Analysis

**Existing Tables:**
- `skills` - Already supports workspace-scoped skills with `source` field
- `jobs` - Generic job execution system
- `knowledgebaseEntries` - File-based knowledge sync
- `workspaces` - Has `githubRepo` field for repo linking

### Proposed Schema Extensions

#### 1.1 Agent Definitions Table

```typescript
export const agentDefinitions = pgTable("agent_definitions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  
  // Source tracking
  source: text("source").$type<"github" | "local" | "imported">().notNull().default("local"),
  sourceRepo: text("source_repo"), // GitHub repo full name (owner/repo)
  sourcePath: text("source_path"), // Path within repo (.cursor/agents/name.md)
  sourceCommit: text("source_commit"), // Git commit SHA for versioning
  sourceBranch: text("source_branch").default("main"),
  
  // Agent metadata (parsed from frontmatter)
  name: text("name").notNull(), // Unique identifier (kebab-case)
  description: text("description"),
  model: text("model").default("inherit"), // inherit | fast | specific model
  readonly: boolean("readonly").default(false),
  
  // Content storage
  content: text("content").notNull(), // Full markdown content
  frontmatter: jsonb("frontmatter").$type<Record<string, unknown>>(), // Parsed YAML frontmatter
  
  // Versioning & sync
  version: integer("version").notNull().default(1),
  lastSynced: timestamp("last_synced"),
  syncStatus: text("sync_status").$type<"synced" | "pending" | "error" | "conflict">().default("synced"),
  syncError: text("sync_error"),
  
  // Dependencies (cross-references)
  dependsOn: jsonb("depends_on").$type<string[]>(), // Array of agent/skill names this depends on
  referencedBy: jsonb("referenced_by").$type<string[]>(), // Reverse: who depends on this
  
  // Metadata
  metadata: jsonb("metadata").$type<AgentMetadata>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => ({
  // Unique constraint: workspace + name (allows same agent name in different workspaces)
  uniqueWorkspaceName: unique().on(table.workspaceId, table.name),
  // Index for fast lookups by source
  sourceIdx: index("agent_definitions_source_idx").on(table.workspaceId, table.source, table.sourceRepo),
}));

export interface AgentMetadata {
  fileSize?: number;
  lineCount?: number;
  lastModified?: string; // ISO timestamp from GitHub
  parsingErrors?: string[];
  validationWarnings?: string[];
  executionCount?: number; // How many times this agent was executed
  lastExecutedAt?: string;
}
```

#### 1.2 Command Definitions Table

```typescript
export const commandDefinitions = pgTable("command_definitions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  
  // Source tracking (same pattern as agents)
  source: text("source").$type<"github" | "local" | "imported">().notNull().default("local"),
  sourceRepo: text("source_repo"),
  sourcePath: text("source_path"), // .cursor/commands/name.md
  sourceCommit: text("source_commit"),
  sourceBranch: text("source_branch").default("main"),
  
  // Command metadata
  name: text("name").notNull(), // Command name (without slash)
  description: text("description"),
  triggerPhrases: jsonb("trigger_phrases").$type<string[]>(), // Natural language triggers
  
  // Content
  content: text("content").notNull(),
  frontmatter: jsonb("frontmatter").$type<Record<string, unknown>>(),
  
  // Dependencies
  invokesAgents: jsonb("invokes_agents").$type<string[]>(), // Which agents this command invokes
  usesSkills: jsonb("uses_skills").$type<string[]>(), // Which skills this command uses
  
  // Versioning & sync
  version: integer("version").notNull().default(1),
  lastSynced: timestamp("last_synced"),
  syncStatus: text("sync_status").$type<"synced" | "pending" | "error" | "conflict">().default("synced"),
  syncError: text("sync_error"),
  
  metadata: jsonb("metadata").$type<CommandMetadata>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => ({
  uniqueWorkspaceName: unique().on(table.workspaceId, table.name),
  sourceIdx: index("command_definitions_source_idx").on(table.workspaceId, table.source, table.sourceRepo),
}));
```

#### 1.3 Rule Definitions Table

```typescript
export const ruleDefinitions = pgTable("rule_definitions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  
  source: text("source").$type<"github" | "local" | "imported">().notNull().default("local"),
  sourceRepo: text("source_repo"),
  sourcePath: text("source_path"), // .cursor/rules/name.mdc
  sourceCommit: text("source_commit"),
  sourceBranch: text("source_branch").default("main"),
  
  name: text("name").notNull(), // Rule name (kebab-case)
  description: text("description"),
  globPatterns: jsonb("glob_patterns").$type<string[]>(), // Which files this rule applies to
  
  content: text("content").notNull(),
  frontmatter: jsonb("frontmatter").$type<Record<string, unknown>>(),
  
  version: integer("version").notNull().default(1),
  lastSynced: timestamp("last_synced"),
  syncStatus: text("sync_status").$type<"synced" | "pending" | "error" | "conflict">().default("synced"),
  syncError: text("sync_error"),
  
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => ({
  uniqueWorkspaceName: unique().on(table.workspaceId, table.name),
}));
```

### 1.4 Required Indexes

**Critical Indexes:**
```sql
-- Fast lookup by workspace + source
CREATE INDEX idx_agent_definitions_workspace_source ON agent_definitions(workspace_id, source, source_repo);

-- Fast sync status queries (for background jobs)
CREATE INDEX idx_agent_definitions_sync_status ON agent_definitions(workspace_id, sync_status) WHERE sync_status != 'synced';

-- Fast dependency resolution
CREATE INDEX idx_agent_definitions_depends_on ON agent_definitions USING GIN(depends_on);

-- Fast reverse dependency lookup
CREATE INDEX idx_agent_definitions_referenced_by ON agent_definitions USING GIN(referenced_by);

-- Fast name lookup (most common query)
CREATE INDEX idx_agent_definitions_name ON agent_definitions(workspace_id, name);
```

### 1.5 Foreign Key Considerations

**Recommendations:**
- ✅ Use `onDelete: "cascade"` for workspace relationships (cleanup on workspace delete)
- ✅ Use `onDelete: "set null"` for optional references (preserve history)
- ⚠️ **Consider:** Add foreign key from `jobs` to `agentDefinitions` for tracking which agent executed a job
- ⚠️ **Consider:** Add foreign key from `stageRecipes.recipeSteps.skillId` to `agentDefinitions` (if agents can be used as skills)

### 1.6 Missing Database Features

**Recommendations:**
1. **Version History Table:** Track changes to agent definitions over time
   ```typescript
   export const agentDefinitionVersions = pgTable("agent_definition_versions", {
     id: text("id").primaryKey(),
     agentDefinitionId: text("agent_definition_id").references(() => agentDefinitions.id, { onDelete: "cascade" }),
     version: integer("version").notNull(),
     content: text("content").notNull(),
     frontmatter: jsonb("frontmatter"),
     changedAt: timestamp("changed_at").notNull(),
     changedBy: text("changed_by"), // User ID or "github_sync"
   });
   ```

2. **Sync Queue Table:** Track pending sync operations
   ```typescript
   export const syncQueue = pgTable("sync_queue", {
     id: text("id").primaryKey(),
     workspaceId: text("workspace_id").notNull(),
     sourceType: text("source_type").$type<"agent" | "command" | "skill" | "rule">(),
     sourceRepo: text("source_repo").notNull(),
     sourcePath: text("source_path").notNull(),
     priority: integer("priority").default(0),
     status: text("status").$type<"pending" | "processing" | "completed" | "failed">(),
     error: text("error"),
     createdAt: timestamp("created_at").notNull(),
     processedAt: timestamp("processed_at"),
   });
   ```

---

## 2. Caching Strategy

### 2.1 What Should Be Cached

**High Priority (Cache Aggressively):**
1. **Parsed Frontmatter** - Expensive to parse, rarely changes
   - Cache key: `agent:${workspaceId}:${name}:frontmatter`
   - TTL: 1 hour (or until sync)
   - Invalidate on: sync completion, manual update

2. **Dependency Graph** - Expensive to compute, changes infrequently
   - Cache key: `deps:${workspaceId}:graph`
   - TTL: 30 minutes
   - Invalidate on: any agent/command/skill update

3. **GitHub File Content** - Rate-limited API, expensive
   - Cache key: `github:${repo}:${path}:${commit}`
   - TTL: 5 minutes (short, but reduces API calls)
   - Invalidate on: webhook notification (if implemented)

4. **Agent Execution Results** - Expensive LLM calls
   - Cache key: `agent:${workspaceId}:${name}:exec:${inputHash}`
   - TTL: 24 hours (or configurable per workspace)
   - Invalidate on: agent definition update

**Medium Priority:**
5. **Command → Agent Mapping** - Fast lookup for command routing
   - Cache key: `cmd:${workspaceId}:${commandName}:agents`
   - TTL: 15 minutes
   - Invalidate on: command or agent update

6. **Workspace Agent List** - UI display
   - Cache key: `workspace:${workspaceId}:agents`
   - TTL: 5 minutes
   - Invalidate on: any agent CRUD operation

### 2.2 Where to Cache

**Recommendations:**
- **Redis** (if available) for distributed caching
- **In-Memory Map** (fallback) for single-instance deployments
- **Database Materialized View** (PostgreSQL) for complex queries

**Implementation:**
```typescript
// lib/cache/agent-cache.ts
import { Redis } from "ioredis"; // or in-memory fallback

class AgentCache {
  private redis: Redis | Map<string, { value: unknown; expires: number }>;
  
  async get<T>(key: string): Promise<T | null> {
    // Check cache, return if valid
  }
  
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    // Set with expiration
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Invalidate matching keys
  }
}
```

### 2.3 Cache Invalidation Strategy

**Event-Driven Invalidation:**
```typescript
// On agent sync completion
await agentCache.invalidate(`agent:${workspaceId}:${name}:*`);
await agentCache.invalidate(`deps:${workspaceId}:*`);
await agentCache.invalidate(`workspace:${workspaceId}:agents`);

// On command update
await agentCache.invalidate(`cmd:${workspaceId}:${commandName}:*`);
```

---

## 3. Background Jobs

### 3.1 Should Parsing/Syncing Be Background Jobs?

**Recommendation: YES** - Use background jobs for:
1. **Initial Import** - Large repos may have 50+ files
2. **Periodic Sync** - Check for updates every N minutes
3. **Dependency Resolution** - Expensive graph computation
4. **Validation** - Schema validation, dependency checking

**Synchronous (Immediate):**
- User-triggered sync (show progress in UI)
- Single file import (small, fast)
- Cache refresh (quick operation)

### 3.2 Job Types to Add

```typescript
// Extend JobType enum
export type JobType = 
  | "generate_prd"
  | "analyze_transcript"
  // ... existing types
  | "sync_github_agents"        // Full repo sync
  | "parse_agent_definition"    // Parse single file
  | "resolve_dependencies"      // Build dependency graph
  | "validate_agent_schema";    // Validate agent definition
```

### 3.3 Background Job Implementation

**Recommended Pattern:**
```typescript
// lib/jobs/github-sync-executor.ts
export async function executeSyncGitHubAgents(
  jobId: string,
  workspaceId: string,
  input: { repo: string; branch?: string; paths?: string[] }
): Promise<ExecutionResult> {
  // 1. Fetch file list from GitHub
  // 2. Queue individual parse jobs for each file
  // 3. Update sync status
  // 4. Resolve dependencies after all files parsed
}
```

**Job Queue Strategy:**
- **Priority Queue:** User-triggered syncs get higher priority
- **Batch Processing:** Group files by type (agents, commands, skills, rules)
- **Parallel Processing:** Parse multiple files concurrently (rate-limited)

### 3.4 Progress Tracking

**Add to Job Schema:**
```typescript
// Extend jobs table
progressDetails: jsonb("progress_details").$type<{
  totalFiles: number;
  parsedFiles: number;
  failedFiles: number;
  currentFile?: string;
  errors?: Array<{ file: string; error: string }>;
}>();
```

---

## 4. State Management

### 4.1 Imported Agent State Flow

**Recommended Flow:**
```
GitHub API → Parse → Database → Cache → React Query → UI
     ↓           ↓         ↓        ↓          ↓
  Webhook    Background  Update  Invalidate  Refetch
             Job         State    Cache      Query
```

### 4.2 React Query Integration

**Query Keys:**
```typescript
// lib/hooks/use-agent-definitions.ts
export const agentDefinitionKeys = {
  all: (workspaceId: string) => ['agent-definitions', workspaceId] as const,
  lists: (workspaceId: string) => [...agentDefinitionKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, filters?: Filters) => 
    [...agentDefinitionKeys.lists(workspaceId), filters] as const,
  details: (workspaceId: string) => 
    [...agentDefinitionKeys.all(workspaceId), 'detail'] as const,
  detail: (workspaceId: string, name: string) => 
    [...agentDefinitionKeys.details(workspaceId), name] as const,
  syncStatus: (workspaceId: string) => 
    [...agentDefinitionKeys.all(workspaceId), 'sync-status'] as const,
};
```

**Mutations:**
```typescript
export function useSyncGitHubAgents(workspaceId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: { repo: string; branch?: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/agents/sync`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all agent queries
      queryClient.invalidateQueries({ queryKey: agentDefinitionKeys.all(workspaceId) });
    },
  });
}
```

### 4.3 Real-Time Updates

**Recommendation:** Use Server-Sent Events (SSE) for sync progress:
```typescript
// app/api/workspaces/[id]/agents/sync/stream/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const stream = new ReadableStream({
    async start(controller) {
      // Stream sync progress events
      const jobId = await startSyncJob(params.id);
      const progressStream = subscribeToJobProgress(jobId);
      
      progressStream.on('progress', (event) => {
        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
      });
      
      progressStream.on('complete', () => {
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

---

## 5. API Design

### 5.1 Proposed Endpoints

**RESTful Endpoint Structure:**
```
GET    /api/workspaces/:id/agents                    # List all agents
GET    /api/workspaces/:id/agents/:name              # Get agent by name
POST   /api/workspaces/:id/agents                    # Create/import agent
PUT    /api/workspaces/:id/agents/:name              # Update agent
DELETE /api/workspaces/:id/agents/:name              # Delete agent
POST   /api/workspaces/:id/agents/sync               # Trigger GitHub sync
GET    /api/workspaces/:id/agents/sync/status        # Get sync status
GET    /api/workspaces/:id/agents/:name/dependencies # Get dependency graph
```

### 5.2 Missing Operations

**Recommendations:**
1. **Bulk Operations:**
   ```
   POST /api/workspaces/:id/agents/bulk-import       # Import multiple agents
   POST /api/workspaces/:id/agents/bulk-update        # Update multiple agents
   DELETE /api/workspaces/:id/agents/bulk-delete      # Delete multiple agents
   ```

2. **Search/Filter:**
   ```
   GET /api/workspaces/:id/agents?source=github      # Filter by source
   GET /api/workspaces/:id/agents?syncStatus=pending  # Filter by sync status
   GET /api/workspaces/:id/agents?search=research    # Search by name/description
   ```

3. **Validation:**
   ```
   POST /api/workspaces/:id/agents/:name/validate     # Validate agent schema
   POST /api/workspaces/:id/agents/validate-all      # Validate all agents
   ```

4. **Dependency Operations:**
   ```
   GET /api/workspaces/:id/agents/:name/dependents    # Who depends on this agent
   POST /api/workspaces/:id/agents/:name/resolve-deps # Resolve dependencies
   ```

5. **Version History:**
   ```
   GET /api/workspaces/:id/agents/:name/versions      # Get version history
   GET /api/workspaces/:id/agents/:name/versions/:v   # Get specific version
   POST /api/workspaces/:id/agents/:name/revert/:v    # Revert to version
   ```

### 5.3 API Response Format

**Standardized Response:**
```typescript
// Success response
{
  data: AgentDefinition | AgentDefinition[],
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  }
}

// Error response
{
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
}
```

---

## 6. Type Safety

### 6.1 Maintaining TypeScript Types for Dynamic Content

**Challenge:** Agent definitions are parsed from markdown/YAML at runtime, but we need type safety.

**Solution: Zod Schema Validation + Type Inference:**

```typescript
// lib/agents/schemas.ts
import { z } from "zod";

export const AgentFrontmatterSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, "Must be kebab-case"),
  description: z.string(),
  model: z.enum(["inherit", "fast"]).or(z.string()).default("inherit"),
  readonly: z.boolean().default(false),
  tools: z.array(z.string()).optional(),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;

export const AgentDefinitionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  source: z.enum(["github", "local", "imported"]),
  sourceRepo: z.string().nullable(),
  sourcePath: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  content: z.string(),
  frontmatter: AgentFrontmatterSchema,
  dependsOn: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
```

**Usage:**
```typescript
// lib/agents/parser.ts
export function parseAgentDefinition(
  content: string,
  filePath: string
): AgentDefinition {
  const { frontmatter, body } = parseMarkdownFrontmatter(content);
  
  // Validate with Zod
  const validatedFrontmatter = AgentFrontmatterSchema.parse(frontmatter);
  
  return {
    id: nanoid(),
    name: validatedFrontmatter.name,
    frontmatter: validatedFrontmatter,
    content: body,
    // ... other fields
  };
}
```

### 6.2 Database Type Safety

**Use Drizzle's Type Inference:**
```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type AgentDefinitionRow = InferSelectModel<typeof agentDefinitions>;
export type AgentDefinitionInsert = InferInsertModel<typeof agentDefinitions>;
```

### 6.3 Runtime Type Guards

```typescript
// lib/agents/type-guards.ts
export function isAgentDefinition(value: unknown): value is AgentDefinition {
  return AgentDefinitionSchema.safeParse(value).success;
}

export function isGitHubSource(
  agent: AgentDefinition
): agent is AgentDefinition & { sourceRepo: string; sourcePath: string } {
  return agent.source === "github" && 
         agent.sourceRepo !== null && 
         agent.sourcePath !== null;
}
```

---

## 7. Testing

### 7.1 Parser Testing

**Unit Tests:**
```typescript
// __tests__/agents/parser.test.ts
describe("parseAgentDefinition", () => {
  it("parses valid agent frontmatter", () => {
    const content = `---
name: research-analyzer
description: Analyzes user research
model: inherit
readonly: false
---
# Research Analyzer
...`;
    
    const result = parseAgentDefinition(content, ".cursor/agents/research-analyzer.md");
    expect(result.name).toBe("research-analyzer");
    expect(result.frontmatter.model).toBe("inherit");
  });
  
  it("rejects invalid frontmatter", () => {
    const content = `---
name: Invalid Name With Spaces
---
...`;
    
    expect(() => parseAgentDefinition(content, "test.md")).toThrow();
  });
  
  it("handles missing frontmatter", () => {
    const content = `# Agent without frontmatter`;
    const result = parseAgentDefinition(content, "test.md");
    expect(result.frontmatter.name).toBeDefined(); // Uses defaults
  });
});
```

### 7.2 Executor Testing

**Integration Tests:**
```typescript
// __tests__/agents/executor.test.ts
describe("AgentExecutor", () => {
  it("executes imported agent with dependencies", async () => {
    // 1. Import agent definition
    const agent = await importAgentFromGitHub(workspaceId, repo, path);
    
    // 2. Resolve dependencies
    const deps = await resolveDependencies(workspaceId, agent.name);
    
    // 3. Execute agent
    const result = await executeAgent(workspaceId, agent.name, { input: "test" });
    
    expect(result.success).toBe(true);
  });
  
  it("handles missing dependencies gracefully", async () => {
    const agent = await importAgent({
      name: "test-agent",
      dependsOn: ["missing-agent"],
    });
    
    const result = await executeAgent(workspaceId, "test-agent", {});
    expect(result.error).toContain("missing dependency");
  });
});
```

### 7.3 Integration Tests

**End-to-End Tests:**
```typescript
// __tests__/integration/github-sync.test.ts
describe("GitHub Agent Sync Integration", () => {
  it("syncs entire .cursor directory from GitHub", async () => {
    // 1. Mock GitHub API responses
    mockGitHubAPI({
      "/repos/owner/repo/contents/.cursor": [
        { name: "agents", type: "dir" },
        { name: "commands", type: "dir" },
      ],
      "/repos/owner/repo/contents/.cursor/agents": [
        { name: "research-analyzer.md", download_url: "..." },
      ],
    });
    
    // 2. Trigger sync
    const job = await syncGitHubAgents(workspaceId, {
      repo: "owner/repo",
      branch: "main",
    });
    
    // 3. Wait for completion
    await waitForJobCompletion(job.id);
    
    // 4. Verify agents imported
    const agents = await getAgentDefinitions(workspaceId);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("research-analyzer");
  });
});
```

### 7.4 Test Data Fixtures

**Recommendation:** Create test fixtures:
```typescript
// __tests__/fixtures/agents.ts
export const mockAgentDefinition = {
  name: "test-agent",
  description: "Test agent",
  content: `---
name: test-agent
---
# Test Agent
...`,
};

export const mockGitHubResponse = {
  content: Buffer.from(mockAgentDefinition.content).toString("base64"),
  sha: "abc123",
  path: ".cursor/agents/test-agent.md",
};
```

---

## 8. Migrations

### 8.1 Schema Changes to agent_definitions

**Migration Strategy:**

**Initial Migration:**
```sql
-- drizzle/00XX_agent_definitions.sql
CREATE TABLE IF NOT EXISTS "agent_definitions" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "source" text NOT NULL DEFAULT 'local',
  "source_repo" text,
  "source_path" text,
  "source_commit" text,
  "source_branch" text DEFAULT 'main',
  "name" text NOT NULL,
  "description" text,
  "model" text DEFAULT 'inherit',
  "readonly" boolean DEFAULT false,
  "content" text NOT NULL,
  "frontmatter" jsonb,
  "version" integer NOT NULL DEFAULT 1,
  "last_synced" timestamp,
  "sync_status" text DEFAULT 'synced',
  "sync_error" text,
  "depends_on" jsonb DEFAULT '[]',
  "referenced_by" jsonb DEFAULT '[]',
  "metadata" jsonb,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  UNIQUE("workspace_id", "name")
);

CREATE INDEX "idx_agent_definitions_workspace_source" 
  ON "agent_definitions"("workspace_id", "source", "source_repo");

CREATE INDEX "idx_agent_definitions_sync_status" 
  ON "agent_definitions"("workspace_id", "sync_status") 
  WHERE "sync_status" != 'synced';

CREATE INDEX "idx_agent_definitions_depends_on" 
  ON "agent_definitions" USING GIN("depends_on");
```

**Future Migrations:**
- Add `version_history` table when needed
- Add `execution_log` table for tracking agent runs
- Add `agent_tags` table for categorization

### 8.2 Data Migration

**Migrating Existing Skills to Agent Definitions:**
```typescript
// scripts/migrate-skills-to-agents.ts
export async function migrateSkillsToAgents() {
  const skills = await db.query.skills.findMany();
  
  for (const skill of skills) {
    // Convert skill to agent definition format
    await db.insert(agentDefinitions).values({
      workspaceId: skill.workspaceId,
      source: "local",
      name: skill.name,
      description: skill.description,
      content: skill.promptTemplate || "",
      frontmatter: {
        model: "inherit",
        readonly: false,
      },
      // ... map other fields
    });
  }
}
```

### 8.3 Rollback Strategy

**Recommendation:** Always make migrations reversible:
```sql
-- Rollback migration
DROP INDEX IF EXISTS "idx_agent_definitions_depends_on";
DROP INDEX IF EXISTS "idx_agent_definitions_sync_status";
DROP INDEX IF EXISTS "idx_agent_definitions_workspace_source";
DROP TABLE IF EXISTS "agent_definitions";
```

---

## 9. Performance

### 9.1 N+1 Query Prevention

**Problem:** Loading agents with dependencies could cause N+1 queries.

**Solution:** Use Drizzle's relational queries:
```typescript
// lib/db/queries.ts
export async function getAgentWithDependencies(
  workspaceId: string,
  name: string
) {
  return db.query.agentDefinitions.findFirst({
    where: and(
      eq(agentDefinitions.workspaceId, workspaceId),
      eq(agentDefinitions.name, name)
    ),
    with: {
      // Use join or manual batch loading
      dependencies: {
        // Batch load all dependencies in one query
      },
    },
  });
}

// Batch load dependencies
export async function getAgentDependenciesBatch(
  workspaceId: string,
  names: string[]
) {
  return db.query.agentDefinitions.findMany({
    where: and(
      eq(agentDefinitions.workspaceId, workspaceId),
      inArray(agentDefinitions.name, names)
    ),
  });
}
```

### 9.2 Heavy Operations Needing Optimization

**1. Dependency Graph Resolution:**
- **Problem:** O(n²) complexity for full graph
- **Solution:** Cache computed graph, incremental updates
```typescript
// Cache dependency graph
const graphCache = new Map<string, DependencyGraph>();

async function getDependencyGraph(workspaceId: string): Promise<DependencyGraph> {
  const cached = graphCache.get(workspaceId);
  if (cached && cached.validUntil > Date.now()) {
    return cached.graph;
  }
  
  // Compute graph (expensive)
  const graph = await computeDependencyGraph(workspaceId);
  graphCache.set(workspaceId, {
    graph,
    validUntil: Date.now() + 30 * 60 * 1000, // 30 min
  });
  
  return graph;
}
```

**2. GitHub API Rate Limiting:**
- **Problem:** GitHub API has rate limits (5000 req/hour)
- **Solution:** Implement request queuing and caching
```typescript
// lib/github/rate-limiter.ts
class GitHubRateLimiter {
  private queue: Array<() => Promise<unknown>> = [];
  private remaining = 5000;
  private resetAt = Date.now() + 3600000;
  
  async request<T>(fn: () => Promise<T>): Promise<T> {
    if (this.remaining <= 0) {
      await this.waitForReset();
    }
    
    this.remaining--;
    return fn();
  }
}
```

**3. Large File Parsing:**
- **Problem:** Parsing 50+ agent files synchronously is slow
- **Solution:** Parallel parsing with worker threads
```typescript
// lib/agents/parallel-parser.ts
import { Worker } from "worker_threads";

export async function parseAgentsParallel(
  files: Array<{ path: string; content: string }>
): Promise<AgentDefinition[]> {
  const workers = new Array(Math.min(4, files.length))
    .fill(null)
    .map(() => new Worker("./parser-worker.js"));
  
  const results = await Promise.all(
    files.map((file, i) => 
      parseInWorker(workers[i % workers.length], file)
    )
  );
  
  workers.forEach(w => w.terminate());
  return results;
}
```

**4. Database Bulk Inserts:**
- **Problem:** Inserting 50+ rows one-by-one is slow
- **Solution:** Batch inserts
```typescript
// Batch insert with chunking
export async function bulkInsertAgents(
  agents: AgentDefinitionInsert[]
): Promise<void> {
  const chunkSize = 100;
  for (let i = 0; i < agents.length; i += chunkSize) {
    const chunk = agents.slice(i, i + chunkSize);
    await db.insert(agentDefinitions).values(chunk);
  }
}
```

### 9.3 Query Optimization

**Add Database Indexes:**
```sql
-- Composite index for common query pattern
CREATE INDEX idx_agent_definitions_workspace_name_source 
  ON agent_definitions(workspace_id, name, source);

-- Partial index for active syncs
CREATE INDEX idx_agent_definitions_pending_sync 
  ON agent_definitions(workspace_id, sync_status) 
  WHERE sync_status IN ('pending', 'error');
```

---

## 10. Observability

### 10.1 Logging

**Structured Logging:**
```typescript
// lib/agents/logger.ts
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export const agentLogger = logger.child({ component: "agent-import" });

// Usage
agentLogger.info({
  workspaceId,
  agentName,
  sourceRepo,
  action: "import_started",
}, "Starting agent import from GitHub");
```

**Log Levels:**
- **DEBUG:** Detailed parsing steps, cache hits/misses
- **INFO:** Import started/completed, sync status changes
- **WARN:** Missing dependencies, validation warnings
- **ERROR:** Parse failures, API errors, sync failures

### 10.2 Metrics

**Key Metrics to Track:**
```typescript
// lib/agents/metrics.ts
import { Counter, Histogram, Gauge } from "prom-client";

export const agentMetrics = {
  // Counters
  importsTotal: new Counter({
    name: "agent_imports_total",
    help: "Total number of agent imports",
    labelNames: ["workspace_id", "source", "status"],
  }),
  
  syncsTotal: new Counter({
    name: "agent_syncs_total",
    help: "Total number of sync operations",
    labelNames: ["workspace_id", "status"],
  }),
  
  executionsTotal: new Counter({
    name: "agent_executions_total",
    help: "Total number of agent executions",
    labelNames: ["workspace_id", "agent_name", "status"],
  }),
  
  // Histograms
  importDuration: new Histogram({
    name: "agent_import_duration_seconds",
    help: "Duration of agent import operations",
    labelNames: ["workspace_id", "source"],
    buckets: [0.1, 0.5, 1, 5, 10, 30],
  }),
  
  parseDuration: new Histogram({
    name: "agent_parse_duration_seconds",
    help: "Duration of agent parsing",
    labelNames: ["workspace_id"],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  }),
  
  // Gauges
  activeSyncs: new Gauge({
    name: "agent_active_syncs",
    help: "Number of active sync operations",
    labelNames: ["workspace_id"],
  }),
  
  agentsCount: new Gauge({
    name: "agent_definitions_count",
    help: "Total number of agent definitions",
    labelNames: ["workspace_id", "source"],
  }),
};
```

### 10.3 Tracing

**Distributed Tracing:**
```typescript
// lib/agents/tracing.ts
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

export async function traceAgentImport<T>(
  workspaceId: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer("agent-import");
  
  return tracer.startActiveSpan(`agent.import.${operation}`, async (span) => {
    span.setAttributes({
      "workspace.id": workspaceId,
      "operation": operation,
    });
    
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 10.4 Error Tracking

**Structured Error Reporting:**
```typescript
// lib/agents/errors.ts
export class AgentImportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly workspaceId: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AgentImportError";
  }
}

// Usage
try {
  await importAgent(workspaceId, repo, path);
} catch (error) {
  if (error instanceof AgentImportError) {
    // Log with structured context
    logger.error({
      error: {
        code: error.code,
        message: error.message,
        workspaceId: error.workspaceId,
        details: error.details,
      },
    }, "Agent import failed");
    
    // Send to error tracking service (Sentry, etc.)
    Sentry.captureException(error, {
      tags: {
        component: "agent-import",
        code: error.code,
      },
      extra: error.details,
    });
  }
}
```

---

## Summary of Recommendations

### Critical (Must Have)
1. ✅ **Database Schema:** Add `agent_definitions`, `command_definitions`, `rule_definitions` tables with proper indexes
2. ✅ **Background Jobs:** Use background jobs for parsing/syncing large repos
3. ✅ **Type Safety:** Use Zod schemas for runtime validation + TypeScript types
4. ✅ **Caching:** Cache parsed frontmatter, dependency graphs, GitHub API responses
5. ✅ **Indexes:** Add composite indexes for common query patterns

### Important (Should Have)
6. ✅ **API Design:** Add bulk operations, search/filter, validation endpoints
7. ✅ **State Management:** React Query integration with proper cache invalidation
8. ✅ **Performance:** Batch inserts, parallel parsing, dependency graph caching
9. ✅ **Testing:** Unit tests for parser, integration tests for executor, E2E tests for sync

### Nice to Have (Consider)
10. ✅ **Observability:** Structured logging, Prometheus metrics, OpenTelemetry tracing
11. ✅ **Version History:** Track changes to agent definitions over time
12. ✅ **Real-Time Updates:** SSE for sync progress streaming

---

## Next Steps

1. **Create Migration:** Implement database schema changes
2. **Build Parser:** Create agent/command/rule parsers with Zod validation
3. **Implement Sync Job:** Background job for GitHub API integration
4. **Add API Endpoints:** RESTful endpoints for CRUD operations
5. **Build UI:** React Query hooks and UI components
6. **Add Tests:** Unit, integration, and E2E tests
7. **Set Up Observability:** Logging, metrics, tracing

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2026-01-24
