# Architecture Research: Signal Ingestion and Intelligence

**Domain:** Signal/feedback system integration with PM orchestration platform
**Researched:** 2026-01-22
**Focus:** v1.1 Signals System architecture for existing Elmer platform
**Confidence:** HIGH

## Executive Summary

This document details how the signals system integrates with Elmer's existing architecture. The design leverages existing patterns (workspace-scoped data, background job processing, AI classification) while adding signal-specific tables, a webhook ingestion pipeline, embedding-based clustering, and provenance tracking.

## System Architecture Overview

```
                                SIGNAL INGESTION LAYER
    +-----------------------------------------------------------------------------------+
    |                                                                                   |
    |  +-----------+   +------------+   +------------+   +-----------+                  |
    |  | Webhook   |   | File       |   | Paste      |   | Video     |                  |
    |  | Endpoint  |   | Upload     |   | Input      |   | Link      |                  |
    |  +-----+-----+   +-----+------+   +-----+------+   +-----+-----+                  |
    |        |               |               |               |                          |
    |        +-------+-------+-------+-------+               |                          |
    |                |                                       |                          |
    |        +-------v-------+                       +-------v-------+                  |
    |        | Signal Queue  |<----------------------| External      |                  |
    |        | (inbox_items) |                       | Transcription |                  |
    |        +-------+-------+                       +---------------+                  |
    |                |                                                                  |
    +----------------|-----------------------------------------------------------------+
                     |
                     v
    +-----------------------------------------------------------------------------------+
    |                          SIGNAL INTELLIGENCE LAYER                                |
    |                                                                                   |
    |  +-------------------+    +-------------------+    +-------------------+          |
    |  | Extract Service   |    | Classify Service  |    | Cluster Service   |          |
    |  | (LLM extraction)  |    | (project routing) |    | (embedding search)|          |
    |  +--------+----------+    +--------+----------+    +--------+----------+          |
    |           |                        |                        |                     |
    |           +------------+-----------+------------------------+                     |
    |                        |                                                          |
    |                +-------v--------+                                                 |
    |                |   signals      |                                                 |
    |                |   (new table)  |                                                 |
    |                +-------+--------+                                                 |
    |                        |                                                          |
    +------------------------|---------------------------------------------------------+
                             |
                             v
    +-----------------------------------------------------------------------------------+
    |                         SIGNAL INTEGRATION LAYER                                  |
    |                                                                                   |
    |  +-------------------+    +-------------------+    +-------------------+          |
    |  | project_signals   |    | signal_clusters   |    | PRD Generation    |          |
    |  | (link table)      |    | (group signals)   |    | (with provenance) |          |
    |  +-------------------+    +-------------------+    +-------------------+          |
    |                                                                                   |
    +-----------------------------------------------------------------------------------+
                             |
                             v
    +-----------------------------------------------------------------------------------+
    |                      EXISTING ELMER INFRASTRUCTURE                                |
    |                                                                                   |
    |  +------------+  +------------+  +------------+  +------------------+             |
    |  | projects   |  | documents  |  | jobs       |  | workspaces       |             |
    |  | (existing) |  | (existing) |  | (existing) |  | (existing)       |             |
    |  +------------+  +------------+  +------------+  +------------------+             |
    |                                                                                   |
    +-----------------------------------------------------------------------------------+
```

## Integration Points with Existing Architecture

### Existing Components Leveraged

| Component | Current Use | Signals Use |
|-----------|------------|-------------|
| `inbox_items` table | Document/transcript storage | Signal raw storage before processing |
| `jobs` table | Background task queue | Signal processing jobs |
| `JobWorker` class | AI job execution | Signal classification/extraction |
| `AgentExecutor` class | LLM tool calling | Signal analysis prompts |
| Workspace scoping | Multi-tenant isolation | Signal ownership |
| `notifications` table | Human-in-loop alerts | Signal triage notifications |

### New Components Required

| Component | Purpose | Depends On |
|-----------|---------|------------|
| `signals` table | Structured signal storage | `workspaces`, `inbox_items` |
| `project_signals` table | Many-to-many linking | `signals`, `projects` |
| `signal_clusters` table | Related signal groups | `signals` |
| `signal_embeddings` table | Vector storage for similarity | `signals`, pgvector |
| Signal Extract Service | LLM-based signal parsing | `AgentExecutor` |
| Signal Classify Service | Project routing logic | Existing projects query |
| Signal Cluster Service | Embedding similarity search | pgvector extension |

## Data Model Design

### Core Signal Schema

```typescript
// NEW: signals table - structured signal data
export const signals = pgTable("signals", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  inboxItemId: text("inbox_item_id").references(() => inboxItems.id, { onDelete: "set null" }),

  // Core signal data
  verbatim: text("verbatim").notNull(),           // Exact quote from source
  interpretation: text("interpretation"),          // AI-generated meaning
  severity: text("severity").$type<"critical" | "high" | "medium" | "low">(),
  frequency: text("frequency").$type<"daily" | "weekly" | "monthly" | "rare">(),

  // Source tracking (provenance)
  sourceType: text("source_type").$type<"webhook" | "upload" | "paste" | "video">().notNull(),
  sourceName: text("source_name"),                // e.g., "Ask Elephant", "Customer Call"
  sourceUrl: text("source_url"),                  // Original document/video link
  sourceDate: timestamp("source_date"),           // When the signal was originally captured

  // Classification results
  classification: text("classification").$type<"existing_project" | "new_initiative" | "noise" | "unclear">(),
  suggestedProjectId: text("suggested_project_id").references(() => projects.id, { onDelete: "set null" }),
  confidence: real("confidence"),                  // 0-1 classification confidence

  // Clustering
  clusterId: text("cluster_id").references(() => signalClusters.id, { onDelete: "set null" }),

  // Metadata
  personas: jsonb("personas").$type<string[]>(),   // Identified persona types
  tags: jsonb("tags").$type<string[]>(),
  metadata: jsonb("metadata").$type<SignalMetadata>(),

  // Timestamps
  status: text("status").$type<"pending" | "processed" | "linked" | "dismissed">().notNull().default("pending"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// NEW: project_signals - many-to-many link with provenance
export const projectSignals = pgTable("project_signals", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  signalId: text("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),

  // Provenance tracking
  linkType: text("link_type").$type<"auto" | "manual" | "synthesis">().notNull(),
  linkReason: text("link_reason"),                 // Why this signal was linked
  linkedBy: text("linked_by"),                     // User ID or "system"

  // Influence tracking
  influencedPrd: boolean("influenced_prd").default(false),
  influencedDesign: boolean("influenced_design").default(false),
  prdSection: text("prd_section"),                 // Which PRD section this informed

  createdAt: timestamp("created_at").notNull(),
}, (table) => ({
  uniqueLink: unique().on(table.projectId, table.signalId),
}));

// NEW: signal_clusters - group related signals
export const signalClusters = pgTable("signal_clusters", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),

  name: text("name").notNull(),                    // Auto-generated or user-defined
  theme: text("theme"),                            // AI-identified theme
  description: text("description"),

  // Cluster stats (denormalized for performance)
  signalCount: integer("signal_count").default(0),
  avgSeverity: real("avg_severity"),

  // Synthesis output
  synthesisJobId: text("synthesis_job_id").references(() => jobs.id),
  synthesizedAt: timestamp("synthesized_at"),
  proposedProjectId: text("proposed_project_id").references(() => projects.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// NEW: signal_embeddings - vector storage for similarity search
export const signalEmbeddings = pgTable("signal_embeddings", {
  id: text("id").primaryKey(),
  signalId: text("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }).unique(),

  // Vector embedding (requires pgvector extension)
  // embedding vector(1536),  -- OpenAI ada-002 dimensions
  // Or for Anthropic/smaller models:
  // embedding vector(384),   -- Smaller embedding models
  embeddingModel: text("embedding_model").notNull(),
  embeddingDimensions: integer("embedding_dimensions").notNull(),
  embedding: text("embedding").notNull(),          // Base64 encoded until pgvector enabled

  createdAt: timestamp("created_at").notNull(),
});
```

### Signal Metadata Interface

```typescript
export interface SignalMetadata {
  // Source context
  participants?: string[];           // People in the conversation
  duration?: number;                 // Duration of call/video in seconds

  // Extraction results
  extractedProblems?: ExtractedProblem[];
  extractedQuotes?: string[];

  // Processing info
  processingModel?: string;
  processingTokens?: { input: number; output: number };

  // Raw extraction (for debugging/reprocessing)
  rawExtractionResponse?: string;
}

export interface ExtractedProblem {
  problem: string;
  quote?: string;
  persona?: string;
  severity?: "critical" | "high" | "medium" | "low";
  frequency?: "daily" | "weekly" | "monthly" | "rare";
}
```

## Signal-to-Project Relationship Model

The relationship between signals and projects is **many-to-many** with metadata:

```
                    +-----------+
                    |  signals  |
                    +-----+-----+
                          |
                          | 1
                          |
                          | *
                    +-----+-----+
                    | project_  |
                    | signals   |
                    | (junction)|
                    +-----+-----+
                          |
                          | *
                          |
                          | 1
                    +-----+-----+
                    |  projects |
                    +-----------+
```

**Relationship semantics:**
- One signal can inform multiple projects (e.g., a feature request touches auth AND notifications)
- One project has many signals as evidence
- The junction table tracks HOW the signal informed the project (provenance)

**Why not one-to-many?**
- User feedback often spans multiple product areas
- Allows signal reuse without duplication
- Enables "signals in common" queries across projects

## Processing Pipeline Architecture

### Pipeline Flow

```
Webhook/Upload/Paste
        |
        v
+------------------+
| 1. INGEST        |  Webhook handler receives raw content
|    - Validate    |  Create inbox_item with status="pending"
|    - Store raw   |  Return 200 immediately (fast ACK)
+--------+---------+
         |
         v (async via job queue)
+------------------+
| 2. EXTRACT       |  Background job picks up inbox_item
|    - Parse       |  LLM extracts: verbatim, interpretation, severity, frequency
|    - Structure   |  Create signal record with structured data
+--------+---------+
         |
         v
+------------------+
| 3. EMBED         |  Generate embedding for signal text
|    - Vectorize   |  Store in signal_embeddings table
+--------+---------+
         |
         v
+------------------+
| 4. CLASSIFY      |  Route signal to project(s)
|    - Match       |  Query projects, compare embeddings
|    - Score       |  Set classification and confidence
+--------+---------+
         |
         v
+------------------+
| 5. CLUSTER       |  Find related signals
|    - Similarity  |  pgvector similarity search
|    - Group       |  Create or join signal_cluster
+--------+---------+
         |
         v
+------------------+
| 6. NOTIFY        |  Alert humans for action
|    - Triage UI   |  Create notification
|    - Dashboard   |  Update inbox view
+------------------+
```

### Job Type Extensions

```typescript
// Add to existing JobType union
export type JobType =
  // ... existing job types ...
  | "extract_signal"        // Parse raw input into structured signal
  | "classify_signal"       // Route signal to project(s)
  | "embed_signal"          // Generate embedding vector
  | "cluster_signals"       // Find related signals
  | "synthesize_cluster";   // Propose initiative from cluster
```

### Integration with Existing Worker

The existing `JobWorker` and `AgentExecutor` handle signal jobs naturally:

```typescript
// In lib/agent/executor.ts - add signal job prompts

case "extract_signal": {
  const rawContent = (input.content as string) || "";
  const sourceType = (input.sourceType as string) || "unknown";

  return `Extract structured signals from this ${sourceType} content.

## Content
${rawContent}

For each distinct piece of feedback:
1. Extract the verbatim quote (exact words)
2. Write your interpretation (what it means)
3. Assess severity (critical/high/medium/low)
4. Estimate frequency (daily/weekly/monthly/rare)
5. Identify persona type if evident

Save each signal using the save_signal tool.`;
}

case "classify_signal": {
  // Get signal and workspace projects
  const signal = await getSignal(input.signalId);
  const projects = await getProjects(signal.workspaceId);

  return `Classify this signal for routing.

## Signal
Verbatim: ${signal.verbatim}
Interpretation: ${signal.interpretation}

## Existing Projects
${projects.map(p => `- ${p.id}: "${p.name}" - ${p.description}`).join('\n')}

Determine:
1. Does this fit an existing project? Which one?
2. Is this a new initiative candidate?
3. Is this noise (not actionable)?

Use update_signal_classification tool with your decision.`;
}
```

## Classification Service Architecture

### Classification Flow

```
Signal Input
     |
     v
+--------------------+
| Text Preprocessing |
| - Normalize        |
| - Clean            |
+--------------------+
     |
     v
+--------------------+     +------------------+
| Embedding Search   |---->| Project Vectors  |
| - Find similar     |     | (pre-computed)   |
| - Rank by distance |     +------------------+
+--------------------+
     |
     v
+--------------------+
| LLM Classification |
| - Consider context |
| - Make decision    |
+--------------------+
     |
     v
+--------------------+
| Confidence Score   |
| - High: auto-link  |
| - Low: human triage|
+--------------------+
```

### Classification Logic

```typescript
// lib/signals/classify.ts

export async function classifySignal(
  signal: Signal,
  workspaceId: string
): Promise<ClassificationResult> {
  // 1. Get workspace projects with embeddings
  const projects = await getProjectsWithEmbeddings(workspaceId);

  // 2. Compute signal embedding
  const signalEmbedding = await getOrCreateEmbedding(signal);

  // 3. Find similar projects by vector similarity
  const similarProjects = await findSimilarProjects(
    signalEmbedding,
    projects,
    { threshold: 0.7, limit: 5 }
  );

  // 4. LLM refinement for edge cases
  if (similarProjects.length === 0 || similarProjects[0].score < 0.85) {
    return await llmClassify(signal, projects);
  }

  // 5. High confidence auto-classification
  return {
    classification: "existing_project",
    suggestedProjectId: similarProjects[0].projectId,
    confidence: similarProjects[0].score,
    reason: `High similarity (${(similarProjects[0].score * 100).toFixed(1)}%) to "${similarProjects[0].name}"`,
  };
}
```

## Clustering/Embedding Storage Patterns

### pgvector Integration

```sql
-- Enable pgvector extension (Neon supports this)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to signal_embeddings
ALTER TABLE signal_embeddings
ADD COLUMN embedding_vector vector(1536);

-- Create HNSW index for fast similarity search
CREATE INDEX signal_embeddings_vector_idx
ON signal_embeddings
USING hnsw (embedding_vector vector_cosine_ops);
```

### Similarity Search Query

```typescript
// lib/signals/cluster.ts

export async function findSimilarSignals(
  signalId: string,
  options: { threshold?: number; limit?: number } = {}
): Promise<SimilarSignal[]> {
  const { threshold = 0.8, limit = 10 } = options;

  // Using Drizzle with raw SQL for pgvector
  const results = await db.execute(sql`
    SELECT
      s.id,
      s.verbatim,
      s.interpretation,
      1 - (se.embedding_vector <=> target.embedding_vector) as similarity
    FROM signals s
    JOIN signal_embeddings se ON se.signal_id = s.id
    CROSS JOIN (
      SELECT embedding_vector
      FROM signal_embeddings
      WHERE signal_id = ${signalId}
    ) target
    WHERE s.id != ${signalId}
      AND 1 - (se.embedding_vector <=> target.embedding_vector) > ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return results.rows;
}
```

### Clustering Algorithm

```typescript
// lib/signals/cluster.ts

export async function clusterUnassignedSignals(
  workspaceId: string
): Promise<void> {
  // 1. Get unclustered signals
  const unclustered = await getUnclusteredSignals(workspaceId);

  for (const signal of unclustered) {
    // 2. Find similar signals
    const similar = await findSimilarSignals(signal.id, { threshold: 0.85 });

    if (similar.length === 0) {
      // Create new single-signal cluster
      await createCluster(workspaceId, [signal.id]);
      continue;
    }

    // 3. Check if any similar signals already have a cluster
    const existingCluster = similar.find(s => s.clusterId);

    if (existingCluster) {
      // Join existing cluster
      await addToCluster(existingCluster.clusterId, signal.id);
    } else {
      // Create new cluster with this signal and similar
      await createCluster(workspaceId, [signal.id, ...similar.map(s => s.id)]);
    }
  }
}
```

## Provenance Chain Implementation

### Provenance Tracking

Every product decision should trace back to user evidence:

```
Signal (user said X)
    |
    v
project_signals (linked because Y)
    |
    v
Project (we're building Z)
    |
    v
Document/PRD (section W addresses this)
```

### PRD Generation with Provenance

```typescript
// Modified PRD generation prompt

case "generate_prd": {
  const project = await getProject(projectId);
  const linkedSignals = await getProjectSignals(projectId);

  return `Generate a PRD for: ${project.name}

## User Evidence (Signals)

${linkedSignals.map(s => `
### Signal: ${s.verbatim.slice(0, 200)}...
- Interpretation: ${s.interpretation}
- Severity: ${s.severity}
- Source: ${s.sourceName} (${s.sourceDate})
`).join('\n')}

## Requirements

1. **Problem Statement**: Reference specific signals above
2. **User Stories**: Tie each to a signal ID
3. **Success Metrics**: Reflect signal severity distribution
4. **Non-Goals**: Note what signals are NOT addressed

For each requirement, include a "Evidence" section citing signal IDs.

Save using save_document tool with type "prd".`;
}
```

### Provenance Query

```typescript
// Get provenance chain for a PRD section

export async function getProvenanceForPrd(
  projectId: string
): Promise<ProvenanceChain[]> {
  const signals = await db.query.projectSignals.findMany({
    where: and(
      eq(projectSignals.projectId, projectId),
      eq(projectSignals.influencedPrd, true)
    ),
    with: {
      signal: true,
    },
    orderBy: [desc(projectSignals.createdAt)],
  });

  return signals.map(ps => ({
    signalId: ps.signalId,
    verbatim: ps.signal.verbatim,
    sourceType: ps.signal.sourceType,
    sourceName: ps.signal.sourceName,
    sourceDate: ps.signal.sourceDate,
    linkReason: ps.linkReason,
    prdSection: ps.prdSection,
    linkedAt: ps.createdAt,
  }));
}
```

## API Layer Design

### New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/ingest` | POST | Receive signals from external sources (EXISTING - enhance) |
| `/api/signals` | GET | List signals for workspace |
| `/api/signals` | POST | Create signal manually |
| `/api/signals/[id]` | GET/PATCH | Get/update single signal |
| `/api/signals/[id]/classify` | POST | Trigger classification |
| `/api/signals/[id]/link` | POST | Link signal to project |
| `/api/signals/clusters` | GET | List signal clusters |
| `/api/signals/clusters/[id]` | GET | Get cluster with signals |
| `/api/signals/synthesize` | POST | Synthesize cluster into initiative |
| `/api/projects/[id]/signals` | GET | Get signals linked to project |

### Enhanced Webhook Endpoint

```typescript
// Enhanced /api/webhooks/ingest/route.ts

export async function POST(request: NextRequest) {
  // ... existing validation ...

  // 1. Create inbox_item (existing behavior)
  const inboxItemId = await createInboxItem({
    workspaceId,
    type: payload.type,
    source: source,
    title: payload.title,
    rawContent: payload.content,
    metadata,
  });

  // 2. NEW: Queue signal extraction job
  await createJob({
    workspaceId,
    type: "extract_signal",
    input: {
      inboxItemId,
      sourceType: source,
      content: payload.content,
    },
  });

  // 3. Return immediately (fast ACK pattern)
  return NextResponse.json({
    success: true,
    itemId: inboxItemId,
    message: "Signal queued for processing",
  });
}
```

## Component Boundaries

```
+------------------------------------------------------------------+
|                        PRESENTATION                               |
|  +------------------+  +------------------+  +------------------+ |
|  | SignalInbox     |  | ProjectSignals   |  | ClusterView      | |
|  | (inbox UI)      |  | (project detail) |  | (synthesis UI)   | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
                               |
                               v
+------------------------------------------------------------------+
|                        API ROUTES                                 |
|  /api/signals/*     /api/projects/[id]/signals     /api/webhooks |
+------------------------------------------------------------------+
                               |
                               v
+------------------------------------------------------------------+
|                        SERVICES                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | SignalService   |  | ClassifyService  |  | ClusterService   | |
|  | (CRUD, extract) |  | (route, embed)   |  | (group, synth)   | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
                               |
                               v
+------------------------------------------------------------------+
|                        DATA LAYER                                 |
|  +--------+  +--------+  +-----------+  +------------------+     |
|  | signals|  |clusters|  |embeddings |  | project_signals  |     |
|  +--------+  +--------+  +-----------+  +------------------+     |
+------------------------------------------------------------------+
```

## Suggested Build Order

Based on dependencies and integration complexity:

### Phase 1: Data Foundation
1. Add `signals` table schema
2. Add `project_signals` junction table
3. Add `signal_clusters` table
4. Create basic CRUD queries
5. Migration script

### Phase 2: Ingestion Enhancement
1. Enhance webhook endpoint
2. Add `extract_signal` job type
3. Signal extraction prompts
4. Inbox-to-signal flow

### Phase 3: Classification
1. Add `classify_signal` job type
2. Basic project matching (no embeddings)
3. Manual linking API
4. Classification UI

### Phase 4: Embeddings & Clustering
1. Enable pgvector extension
2. Add `signal_embeddings` table
3. Embedding generation service
4. Similarity search queries
5. Auto-clustering job

### Phase 5: Provenance & Synthesis
1. PRD generation with signals
2. Provenance tracking
3. Cluster synthesis (`/synthesize` command)
4. "Create project from cluster" flow

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k signals | Current design works well |
| 10k-100k signals | Add HNSW index, batch embedding generation |
| 100k+ signals | Consider embedding cache, async clustering |

### Performance Optimizations

1. **Batch embedding generation**: Process multiple signals per LLM call
2. **Incremental clustering**: Only re-cluster affected signals
3. **Project embedding cache**: Pre-compute and cache project embeddings
4. **Pagination**: All signal list endpoints support cursor pagination

## Anti-Patterns to Avoid

### Anti-Pattern 1: Synchronous Processing

**What people do:** Process signals in webhook handler
**Why it's wrong:** Slow response, webhook timeouts
**Do this instead:** Queue immediately, process async

### Anti-Pattern 2: Duplicate Signal Detection Only on Exact Match

**What people do:** Only dedupe identical signals
**Why it's wrong:** Miss semantically similar signals
**Do this instead:** Use embedding similarity for deduplication

### Anti-Pattern 3: Global Clustering

**What people do:** Cluster all workspace signals together
**Why it's wrong:** Unrelated signals grouped, poor themes
**Do this instead:** Cluster by time window and similarity threshold

### Anti-Pattern 4: Losing Raw Content

**What people do:** Only store extracted/processed data
**Why it's wrong:** Can't reprocess with improved extraction
**Do this instead:** Keep raw content in `inbox_items`, structured in `signals`

## Sources

**Webhook Architecture:**
- [Webhooks at Scale: Designing an Idempotent System](https://dev.to/art_light/webhooks-at-scale-designing-an-idempotent-replay-safe-and-observable-webhook-system-7lk)
- [More Reliable Webhooks with Queues](https://www.shortcut.com/blog/more-reliable-webhooks-with-queues)

**Embedding/Vector Search:**
- [pgvector: Key Features and Tutorial 2026](https://www.instaclustr.com/education/vector-database/pgvector-key-features-tutorial-and-pros-and-cons-2026-guide/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

**Data Lineage/Provenance:**
- [Data Lineage Tracking: Complete Guide 2026](https://atlan.com/know/data-lineage-tracking/)
- [Data Provenance vs Data Lineage](https://www.montecarlodata.com/blog-data-provenance-vs-data-lineage-difference/)

---
*Architecture research for: Signal Ingestion and Intelligence System*
*Project: Elmer v1.1 Signals System*
*Researched: 2026-01-22*
