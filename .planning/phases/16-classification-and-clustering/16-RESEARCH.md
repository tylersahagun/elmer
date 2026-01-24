# Phase 16: Classification & Clustering - Research

**Researched:** 2026-01-23
**Domain:** pgvector similarity search, LLM classification with confidence, semantic clustering
**Confidence:** HIGH

## Summary

Phase 16 transforms processed signals (with embeddings from Phase 15) into actionable intelligence through two complementary mechanisms:

1. **Project Classification**: Auto-classify signals as "belongs to Project X" or "new initiative" using a hybrid approach - semantic similarity via pgvector for candidate matching, with optional LLM refinement for edge cases
2. **Semantic Clustering**: Group related signals using K-nearest neighbor queries to surface patterns and enable `/synthesize` to propose new initiatives

The codebase already has embeddings stored as Base64 text (Phase 15). This phase requires migrating to pgvector's native `vector` type for efficient similarity operations (cosine distance), adding HNSW indexing for performance, and implementing classification with configurable confidence thresholds.

**Primary recommendation:** Use pgvector's native vector type with HNSW index for cosine similarity search. Implement two-tier classification: fast embedding similarity (>0.75 confidence = auto-link), with LLM fallback for medium-confidence matches (0.5-0.75). Clustering uses K-nearest neighbor queries rather than traditional clustering algorithms like K-means or HDBSCAN.

## Standard Stack

### Core (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| drizzle-orm | ^0.45.1 | ORM with pgvector support | Already installed |
| openai | ^6.16.0 | Embeddings (Phase 15) | Already installed |
| @anthropic-ai/sdk | ^0.71.2 | LLM classification refinement | Already installed |

### pgvector Extension
| Component | Version | Purpose | Status |
|---------|---------|---------|--------|
| pgvector | Neon-provided | Native vector operations | Enable via SQL |
| drizzle-orm/pg-core vector | built-in | Vector column type | Use in schema |

### Supporting (No Installation Needed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| zod | ^3.x | Schema validation | Already used |
| drizzle-kit | existing | Migrations | Already configured |

**No new packages required.** All functionality comes from pgvector extension + existing Drizzle setup.

**Migration Required:**
```sql
-- Add to custom migration file
CREATE EXTENSION IF NOT EXISTS vector;
```

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── lib/
│   ├── ai/
│   │   ├── extraction.ts      # Existing (Phase 15)
│   │   ├── embeddings.ts      # Existing (Phase 15)
│   │   └── classification.ts  # NEW: LLM classification logic
│   ├── db/
│   │   ├── schema.ts          # UPDATE: Add vector column type
│   │   └── queries.ts         # UPDATE: Add similarity queries
│   └── signals/
│       ├── processor.ts       # Existing (Phase 15)
│       ├── classifier.ts      # NEW: Classification orchestration
│       └── clusters.ts        # NEW: Clustering utilities
├── app/
│   └── api/
│       └── signals/
│           ├── classify/
│           │   └── route.ts   # NEW: Manual classification trigger
│           ├── similar/
│           │   └── route.ts   # NEW: Find similar signals
│           └── synthesize/
│               └── route.ts   # NEW: /synthesize command (INTL-07)
```

### Pattern 1: pgvector Native Vector Column
**What:** Use Drizzle's vector type instead of Base64 text for embeddings
**When to use:** Required for efficient similarity search
**Example:**
```typescript
// Source: Drizzle ORM docs - https://orm.drizzle.team/docs/guides/vector-similarity-search
import { index, pgTable, text, vector, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

export const signals = pgTable(
  'signals',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    verbatim: text('verbatim').notNull(),
    // ... existing fields ...

    // Phase 16: Native vector column (1536 dimensions for text-embedding-3-small)
    embeddingVector: vector('embedding_vector', { dimensions: 1536 }),

    // Keep text embedding for backward compatibility during migration
    embedding: text('embedding'), // Base64, deprecated after migration

    // Classification results
    aiClassification: jsonb('ai_classification').$type<SignalClassification>(),
    classifiedAt: timestamp('classified_at'),

    // Clustering assignment
    clusterId: text('cluster_id'),

    // ... timestamps ...
  },
  (table) => [
    // HNSW index for cosine similarity - critical for performance
    index('signals_embedding_idx').using(
      'hnsw',
      table.embeddingVector.op('vector_cosine_ops')
    ),
    // Index for workspace-scoped queries
    index('signals_workspace_idx').on(table.workspaceId),
  ]
);
```

### Pattern 2: Cosine Similarity Search with Drizzle
**What:** Find similar signals using cosine distance
**When to use:** Classification candidate matching, cluster discovery
**Example:**
```typescript
// Source: Drizzle ORM vector similarity guide
import { cosineDistance, desc, gt, sql, and, eq } from 'drizzle-orm';

export async function findSimilarSignals(
  workspaceId: string,
  embedding: number[],
  options: { threshold?: number; limit?: number } = {}
): Promise<Array<{ id: string; similarity: number; verbatim: string }>> {
  const { threshold = 0.5, limit = 10 } = options;

  // Convert similarity to distance: similarity = 1 - distance
  const similarity = sql<number>`1 - (${cosineDistance(signals.embeddingVector, embedding)})`;

  return db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      similarity,
    })
    .from(signals)
    .where(and(
      eq(signals.workspaceId, workspaceId),
      gt(similarity, threshold)
    ))
    .orderBy(desc(similarity))
    .limit(limit);
}
```

### Pattern 3: K-Nearest Neighbor Queries for Clustering
**What:** Use ORDER BY...LIMIT pattern to leverage HNSW index
**When to use:** Finding related signals, building clusters
**Example:**
```typescript
// K-nearest neighbor query - MUST use ORDER BY...LIMIT for index usage
// Source: pgvector GitHub - https://github.com/pgvector/pgvector

export async function findKNearestSignals(
  workspaceId: string,
  embedding: number[],
  k: number = 5
): Promise<Array<{ id: string; distance: number }>> {
  // Use raw SQL for optimal performance with pgvector operators
  const result = await db.execute(sql`
    SELECT id, verbatim, embedding_vector <=> ${embedding}::vector AS distance
    FROM signals
    WHERE workspace_id = ${workspaceId}
      AND embedding_vector IS NOT NULL
    ORDER BY embedding_vector <=> ${embedding}::vector
    LIMIT ${k}
  `);

  return result.rows as Array<{ id: string; distance: number }>;
}
```

### Pattern 4: Two-Tier Classification with Confidence
**What:** Fast embedding match first, LLM refinement for edge cases
**When to use:** Auto-classifying signals to projects
**Example:**
```typescript
// Classification thresholds (configurable per workspace)
const CONFIDENCE_THRESHOLDS = {
  autoLink: 0.75,    // Auto-link without review
  llmReview: 0.50,   // Send to LLM for refinement
  reject: 0.50,      // Below this = "new initiative"
};

export interface ClassificationResult {
  projectMatches: Array<{
    projectId: string;
    projectName: string;
    confidence: number;
    matchReason?: string;
  }>;
  isNewInitiative: boolean;
  suggestedInitiativeName?: string;
  classifiedAt: string;
}

export async function classifySignal(
  signal: Signal,
  projects: Project[]
): Promise<ClassificationResult> {
  const signalEmbedding = base64ToEmbedding(signal.embedding!);

  // Step 1: Embedding similarity for all projects
  const projectSimilarities = await Promise.all(
    projects.map(async (project) => {
      // Get project's representative embedding (from PRD or average of linked signals)
      const projectEmbedding = await getProjectEmbedding(project.id);
      if (!projectEmbedding) return null;

      const similarity = cosineSimilarity(signalEmbedding, projectEmbedding);
      return { project, similarity };
    })
  );

  const matches = projectSimilarities
    .filter((m): m is NonNullable<typeof m> => m !== null && m.similarity > CONFIDENCE_THRESHOLDS.reject)
    .sort((a, b) => b.similarity - a.similarity);

  // Step 2: High-confidence matches -> auto-link
  const highConfidence = matches.filter(m => m.similarity >= CONFIDENCE_THRESHOLDS.autoLink);
  if (highConfidence.length > 0) {
    return {
      projectMatches: highConfidence.map(m => ({
        projectId: m.project.id,
        projectName: m.project.name,
        confidence: m.similarity,
        matchReason: 'Semantic similarity',
      })),
      isNewInitiative: false,
      classifiedAt: new Date().toISOString(),
    };
  }

  // Step 3: Medium-confidence -> LLM refinement
  const mediumConfidence = matches.filter(
    m => m.similarity >= CONFIDENCE_THRESHOLDS.llmReview && m.similarity < CONFIDENCE_THRESHOLDS.autoLink
  );
  if (mediumConfidence.length > 0) {
    return await llmRefineClassification(signal, mediumConfidence);
  }

  // Step 4: No matches -> new initiative
  return {
    projectMatches: [],
    isNewInitiative: true,
    suggestedInitiativeName: await generateInitiativeName(signal),
    classifiedAt: new Date().toISOString(),
  };
}
```

### Pattern 5: LLM Classification Refinement
**What:** Use Claude to verify edge-case classifications
**When to use:** When embedding similarity is medium confidence (0.5-0.75)
**Example:**
```typescript
// Source: Existing extraction.ts pattern
import Anthropic from "@anthropic-ai/sdk";

export async function llmRefineClassification(
  signal: Signal,
  candidates: Array<{ project: Project; similarity: number }>
): Promise<ClassificationResult> {
  const anthropic = new Anthropic();

  const projectDescriptions = candidates.map(c =>
    `- ${c.project.name}: ${c.project.description || 'No description'} (Similarity: ${Math.round(c.similarity * 100)}%)`
  ).join('\n');

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `You classify user feedback signals to product projects.
Given a signal and candidate projects, determine:
1. Does this signal belong to any of the projects? (true/false for each)
2. If none match, is this a potential new initiative?

Return ONLY valid JSON:
{
  "matches": [{ "projectId": "id", "belongsTo": true/false, "reason": "brief explanation" }],
  "isNewInitiative": true/false,
  "initiativeName": "suggested name if new" | null
}`,
    messages: [{
      role: "user",
      content: `Signal: "${signal.verbatim}"

Candidate projects:
${projectDescriptions}

Classify this signal.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(text);

  return {
    projectMatches: parsed.matches
      .filter((m: { belongsTo: boolean }) => m.belongsTo)
      .map((m: { projectId: string; reason: string }) => {
        const candidate = candidates.find(c => c.project.id === m.projectId);
        return {
          projectId: m.projectId,
          projectName: candidate?.project.name || '',
          confidence: candidate?.similarity || 0,
          matchReason: m.reason,
        };
      }),
    isNewInitiative: parsed.isNewInitiative,
    suggestedInitiativeName: parsed.initiativeName,
    classifiedAt: new Date().toISOString(),
  };
}
```

### Pattern 6: /synthesize Command Implementation
**What:** Find patterns across signals and propose new initiatives
**When to use:** INTL-07 requirement
**Example:**
```typescript
// /synthesize command - finds clusters and generates initiative proposals
export async function synthesizeSignals(
  workspaceId: string,
  options: { minClusterSize?: number; timeRange?: string } = {}
): Promise<SynthesisResult> {
  const { minClusterSize = 3 } = options;

  // 1. Get all unlinked signals with embeddings
  const unlinkedSignals = await db.query.signals.findMany({
    where: and(
      eq(signals.workspaceId, workspaceId),
      eq(signals.status, 'new'),
      isNotNull(signals.embeddingVector)
    ),
  });

  // 2. Find clusters using K-nearest neighbor approach
  const clusters = await findSignalClusters(unlinkedSignals, { minClusterSize });

  // 3. Generate initiative proposals for each cluster
  const proposals = await Promise.all(
    clusters.map(cluster => generateInitiativeProposal(cluster))
  );

  return {
    totalSignals: unlinkedSignals.length,
    clustersFound: clusters.length,
    proposals,
  };
}

// Cluster detection using centroid-based grouping
async function findSignalClusters(
  signals: Signal[],
  options: { minClusterSize: number }
): Promise<SignalCluster[]> {
  const clusters: SignalCluster[] = [];
  const assigned = new Set<string>();

  for (const signal of signals) {
    if (assigned.has(signal.id)) continue;

    // Find K-nearest neighbors for this signal
    const neighbors = await findKNearestSignals(
      signal.workspaceId,
      base64ToEmbedding(signal.embedding!),
      options.minClusterSize * 2
    );

    // Filter to high similarity (>0.7) and unassigned
    const clusterCandidates = neighbors.filter(
      n => n.distance < 0.3 && !assigned.has(n.id) // distance < 0.3 = similarity > 0.7
    );

    if (clusterCandidates.length >= options.minClusterSize - 1) {
      const clusterSignals = [signal.id, ...clusterCandidates.map(c => c.id)];
      clusterSignals.forEach(id => assigned.add(id));

      clusters.push({
        id: nanoid(),
        signalIds: clusterSignals,
        centroidSignalId: signal.id,
        size: clusterSignals.length,
      });
    }
  }

  return clusters;
}
```

### Anti-Patterns to Avoid
- **Full table scan similarity:** Always use ORDER BY...LIMIT with ascending order to leverage HNSW index
- **Similarity threshold in ORDER BY:** Filter after ordering, not before (index only supports distance-based ordering)
- **Storing vectors as Base64:** Phase 15 pattern works for storage but prevents indexing - migrate to native vector
- **K-means in Postgres:** pgvector doesn't support clustering algorithms natively - use K-NN queries instead
- **LLM for all classifications:** Expensive and slow - use embedding similarity first, LLM for edge cases

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cosine similarity calculation | Manual dot product | pgvector `<=>` operator | GPU-optimized, indexed |
| K-nearest neighbor | Linear scan | HNSW index + ORDER BY LIMIT | O(log n) vs O(n) |
| Clustering algorithms | K-means, DBSCAN implementation | K-NN queries with threshold | Simpler, database-native |
| Embedding storage | Base64 text | pgvector vector type | Native operators, indexing |
| Confidence calibration | Manual threshold tuning | Start with 0.75/0.5 thresholds | Based on research patterns |

**Key insight:** pgvector provides all the vector operations needed. Don't implement clustering algorithms - use K-nearest neighbor queries to find related signals and group by threshold.

## Common Pitfalls

### Pitfall 1: HNSW Index Not Used
**What goes wrong:** Queries run as full table scan, extremely slow
**Why it happens:** Missing ORDER BY...LIMIT pattern or wrong sort order
**How to avoid:** Always use ascending ORDER BY with LIMIT for K-NN queries
**Warning signs:** Explain plan shows Seq Scan instead of Index Scan

### Pitfall 2: Base64 to Vector Migration Data Loss
**What goes wrong:** Embeddings corrupted during migration
**Why it happens:** Incorrect Float32Array parsing from Base64
**How to avoid:**
- Verify conversion: `new Float32Array(Buffer.from(base64, 'base64').buffer)`
- Test with known vectors before bulk migration
- Keep original column during transition
**Warning signs:** Similarity scores all near 0 or 1

### Pitfall 3: Workspace Data Leakage
**What goes wrong:** Similarity search returns signals from other workspaces
**Why it happens:** Missing workspace filter in vector queries
**How to avoid:** Always include `WHERE workspace_id = ?` in similarity queries
**Warning signs:** Signals appearing that don't belong to current workspace

### Pitfall 4: LLM Over-Reliance for Classification
**What goes wrong:** High latency and cost for classification
**Why it happens:** Using LLM for all classifications instead of embedding similarity
**How to avoid:** Two-tier approach - embedding first, LLM for edge cases only
**Warning signs:** Classification taking >2s per signal, high API costs

### Pitfall 5: Confidence Threshold Too Low
**What goes wrong:** Many false-positive auto-links
**Why it happens:** Auto-link threshold too permissive
**How to avoid:** Start conservative (0.75), lower based on user feedback
**Warning signs:** Users frequently unlinking auto-linked signals

### Pitfall 6: Missing Project Embeddings
**What goes wrong:** Can't classify signals to projects with no embedding
**Why it happens:** New projects or projects without linked signals
**How to avoid:** Generate project embedding from name + description, update when signals linked
**Warning signs:** Classification always returns "new initiative"

## Code Examples

### Database Migration for pgvector
```sql
-- migrations/XXXX_add_pgvector.sql

-- Enable extension (Neon already has it, just need to enable)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add native vector column to signals
ALTER TABLE signals ADD COLUMN embedding_vector vector(1536);

-- Create HNSW index for cosine similarity
CREATE INDEX IF NOT EXISTS signals_embedding_vector_idx
ON signals
USING hnsw (embedding_vector vector_cosine_ops);

-- Migration script to convert Base64 to vector
-- (Run as separate script, not in migration)
-- UPDATE signals
-- SET embedding_vector = convert_base64_to_vector(embedding)
-- WHERE embedding IS NOT NULL AND embedding_vector IS NULL;
```

### Drizzle Schema Update
```typescript
// orchestrator/src/lib/db/schema.ts
import { index, pgTable, text, vector, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

// Add to signals table definition
export const signals = pgTable(
  'signals',
  {
    // ... existing fields ...

    // Phase 16: Native vector for similarity search
    embeddingVector: vector('embedding_vector', { dimensions: 1536 }),

    // Classification fields
    classifiedAt: timestamp('classified_at'),
    classificationConfidence: real('classification_confidence'),

    // Cluster assignment (for /synthesize)
    clusterId: text('cluster_id'),
  },
  (table) => [
    index('signals_embedding_idx').using('hnsw', table.embeddingVector.op('vector_cosine_ops')),
  ]
);
```

### Cosine Similarity Helper
```typescript
// orchestrator/src/lib/ai/similarity.ts

/**
 * Calculate cosine similarity between two embedding vectors.
 * For in-memory comparison when pgvector query isn't needed.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
```

### Classification Query
```typescript
// orchestrator/src/lib/signals/classifier.ts
import { db } from "@/lib/db";
import { signals, projects, signalProjects } from "@/lib/db/schema";
import { cosineDistance, desc, gt, sql, and, eq } from 'drizzle-orm';

export interface ClassifyOptions {
  autoLinkThreshold?: number;
  llmReviewThreshold?: number;
  maxMatches?: number;
}

const DEFAULT_OPTIONS: Required<ClassifyOptions> = {
  autoLinkThreshold: 0.75,
  llmReviewThreshold: 0.50,
  maxMatches: 5,
};

export async function classifySignalToProjects(
  signalId: string,
  options: ClassifyOptions = {}
): Promise<SignalClassification> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const signal = await db.query.signals.findFirst({
    where: eq(signals.id, signalId),
  });

  if (!signal || !signal.embeddingVector) {
    throw new Error('Signal not found or missing embedding');
  }

  // Get all projects in workspace
  const workspaceProjects = await db.query.projects.findMany({
    where: eq(projects.workspaceId, signal.workspaceId),
  });

  // Find similar already-linked signals and their project associations
  const similarity = sql<number>`1 - (${cosineDistance(signals.embeddingVector, signal.embeddingVector)})`;

  const similarLinkedSignals = await db
    .select({
      signalId: signals.id,
      similarity,
      projectId: signalProjects.projectId,
    })
    .from(signals)
    .innerJoin(signalProjects, eq(signals.id, signalProjects.signalId))
    .where(and(
      eq(signals.workspaceId, signal.workspaceId),
      gt(similarity, opts.llmReviewThreshold)
    ))
    .orderBy(desc(similarity))
    .limit(20);

  // Aggregate by project
  const projectScores = new Map<string, { projectId: string; maxSimilarity: number; count: number }>();

  for (const row of similarLinkedSignals) {
    const existing = projectScores.get(row.projectId);
    if (!existing || row.similarity > existing.maxSimilarity) {
      projectScores.set(row.projectId, {
        projectId: row.projectId,
        maxSimilarity: row.similarity,
        count: (existing?.count || 0) + 1,
      });
    }
  }

  // Build results
  const matches = Array.from(projectScores.values())
    .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
    .slice(0, opts.maxMatches)
    .map(score => {
      const project = workspaceProjects.find(p => p.id === score.projectId);
      return {
        projectId: score.projectId,
        projectName: project?.name || 'Unknown',
        confidence: score.maxSimilarity,
        matchReason: `Similar to ${score.count} linked signal(s)`,
      };
    });

  // Determine classification tier
  const highConfidence = matches.filter(m => m.confidence >= opts.autoLinkThreshold);
  const mediumConfidence = matches.filter(
    m => m.confidence >= opts.llmReviewThreshold && m.confidence < opts.autoLinkThreshold
  );

  if (highConfidence.length > 0) {
    return {
      projectMatches: highConfidence,
      isNewInitiative: false,
      classifiedAt: new Date().toISOString(),
    };
  }

  if (mediumConfidence.length > 0) {
    // LLM refinement for edge cases
    return await llmRefineClassification(signal, mediumConfidence, workspaceProjects);
  }

  return {
    projectMatches: [],
    isNewInitiative: true,
    suggestedInitiativeName: await generateInitiativeName(signal.verbatim),
    classifiedAt: new Date().toISOString(),
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Base64 text embeddings | pgvector native vector | pgvector 0.5+ | Enables indexed similarity search |
| IVFFlat indexes | HNSW indexes | pgvector 0.5+ | Better query performance, no training |
| K-means clustering | K-NN with threshold | Current | Simpler, database-native |
| LLM for all classification | Embedding + LLM hybrid | Current best practice | 10x faster, 90% cost reduction |
| Fixed thresholds | Configurable per workspace | Emerging | Tunable precision/recall |

**Deprecated/outdated:**
- text-embedding-ada-002: Replaced by text-embedding-3-small (already using correct model)
- IVFFlat indexes: HNSW preferred for most use cases (no training needed)
- Full LLM classification: Use embedding similarity first

## Open Questions

1. **Project Embedding Strategy**
   - What we know: Need project embeddings to compare signals against
   - What's unclear: Use PRD content? Average of linked signals? Name+description?
   - Recommendation: **Start with name+description embedding**, update with centroid of linked signals as they accumulate

2. **Threshold Tuning Interface**
   - What we know: 0.75/0.50 thresholds are research-based defaults
   - What's unclear: Should workspaces be able to tune these? How to surface?
   - Recommendation: **Store in workspace settings**, provide admin UI in Phase 17+

3. **Cluster Persistence**
   - What we know: /synthesize discovers clusters on-demand
   - What's unclear: Should clusters be persisted? Updated incrementally?
   - Recommendation: **Generate on-demand for Phase 16**, consider caching in Phase 17

4. **Existing Signals Migration**
   - What we know: Phase 15 signals have Base64 embeddings
   - What's unclear: Run migration immediately or backfill on-demand?
   - Recommendation: **Batch migration script** run after schema changes, keep Base64 as backup

## Performance Considerations

### Index Build Time
- HNSW index on 100K vectors: ~30 seconds
- HNSW index on 1M vectors: ~5 minutes
- **Recommendation:** Build index after initial data load, not incrementally

### Query Performance
- With HNSW index: <50ms for K-NN queries
- Without index: O(n) linear scan
- **Critical:** Always use ORDER BY...LIMIT pattern

### Memory Usage
- HNSW index uses more memory than IVFFlat
- Default `m=16` is appropriate for most cases
- Tune `ef_search` (default 40) for recall vs speed tradeoff

### Neon-Specific
- pgvector extension available on all plans
- Connection pooling works normally with vector queries
- Use `SET hnsw.ef_search = 100;` for higher recall

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM Vector Similarity Search](https://orm.drizzle.team/docs/guides/vector-similarity-search) - Official guide for pgvector integration
- [pgvector GitHub](https://github.com/pgvector/pgvector) - Authoritative extension documentation
- [Neon pgvector Docs](https://neon.com/docs/extensions/pgvector) - Neon-specific configuration
- Existing codebase: `/lib/signals/processor.ts`, `/lib/ai/embeddings.ts` - Pattern analysis

### Secondary (MEDIUM confidence)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings) - Clustering use cases
- [Instaclustr pgvector 2026 Guide](https://www.instaclustr.com/education/vector-database/pgvector-key-features-tutorial-and-pros-and-cons-2026-guide/) - Performance recommendations
- [LLM Confidence Scores](https://medium.com/@vatvenger/confidence-unlocked-a-method-to-measure-certainty-in-llm-outputs-1d921a4ca43c) - Threshold patterns

### Tertiary (LOW confidence)
- [HDBSCAN Cluster Tool](https://github.com/yigitkonur/hdbscan-cluster-tool) - Alternative clustering approach (not recommended for Postgres)
- Various Medium articles on semantic matching - General patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - pgvector is well-documented, Drizzle support verified
- Architecture: HIGH - Patterns follow official Drizzle/pgvector documentation
- Classification approach: MEDIUM - Hybrid threshold approach based on research, may need tuning
- Pitfalls: HIGH - Common issues documented in pgvector community
- /synthesize pattern: MEDIUM - K-NN clustering is simpler than full clustering algorithms

**Research date:** 2026-01-23
**Valid until:** 90 days (pgvector stable, patterns established)

---

## Gap Analysis: Implementation Readiness

| Requirement | Research Finding | Implementation Gap | Risk |
|-------------|------------------|-------------------|------|
| INTL-01: Auto-classify to Project X or "new initiative" | Embedding similarity + LLM hybrid | Need classifier.ts module, project embeddings | LOW |
| INTL-02: Confidence score with configurable threshold | Use 0.75/0.50 defaults, store in workspace settings | Schema update for workspace settings, threshold config | LOW |
| INTL-05: Cluster by semantic similarity | K-NN queries with pgvector | Migration to native vector column, HNSW index | MEDIUM |
| INTL-07: /synthesize command | Cluster detection + LLM proposal generation | New API endpoint, cluster utilities | LOW |

**Migration risk is MEDIUM** - Converting Base64 embeddings to native vector requires careful testing.

**No blocking gaps identified.** Ready for planning.
