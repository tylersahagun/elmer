# Phase 15: Signal Extraction & Embedding - Research

**Researched:** 2026-01-23
**Domain:** LLM structured data extraction, OpenAI embeddings API, PostgreSQL vector storage
**Confidence:** HIGH

## Summary

Phase 15 transforms raw signals into structured, searchable data through two primary operations:

1. **LLM Extraction**: Use Claude (already integrated) with Zod schemas to extract severity, frequency, and user segment from signal verbatim content
2. **Embedding Generation**: Use OpenAI's text-embedding-3-small (1536 dimensions) to generate semantic vectors for similarity search

The codebase already has patterns for both AI generation (Anthropic SDK) and queue-first async processing (via `after()`). The main implementation gap is adding OpenAI for embeddings and potentially pgvector for native vector operations.

**Primary recommendation:** Use the existing Anthropic SDK pattern for extraction (structured JSON output), add OpenAI SDK for embeddings, and store embeddings as base64 text initially (matching existing `memoryEntries` pattern). Migrate to pgvector later if similarity search performance requires it.

## Standard Stack

### Core (Add to Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| openai | ^4.x | OpenAI embeddings API | Official SDK, TypeScript native |
| zod | ^3.x | Schema validation for extraction | Already used in codebase |

### Already Available
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| @anthropic-ai/sdk | ^0.71.2 | LLM extraction | Already in use for AI generation |
| nanoid | ^5.0.7 | ID generation | Consistent with codebase |
| drizzle-orm | ^0.45.1 | Database operations | Schema already has embedding field |

### Future Consideration (Not Phase 15)
| Library | Version | Purpose | When to Add |
|---------|---------|---------|-------------|
| drizzle-orm/pg-core vector | built-in | Native vector column | Phase 16 if similarity search needed |
| @ai-sdk/openai | ^4.x | Unified AI SDK | Alternative to raw OpenAI SDK |

**Installation:**
```bash
npm install openai
```

**Environment Variables (add to .env.example):**
```bash
# OpenAI API for embeddings (required for Phase 15+)
OPENAI_API_KEY=your_openai_api_key_here
```

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── lib/
│   ├── ai/
│   │   ├── extraction.ts      # LLM extraction logic (NEW)
│   │   └── embeddings.ts      # OpenAI embedding generation (NEW)
│   ├── db/
│   │   ├── schema.ts          # Already has embedding field
│   │   └── queries.ts         # Add updateSignalProcessing()
│   └── signals/
│       └── processor.ts       # Orchestrates extraction + embedding (NEW)
├── app/
│   └── api/
│       └── signals/
│           ├── process/
│           │   └── route.ts   # Manual trigger endpoint (NEW)
│           └── ingest/
│               └── route.ts   # /ingest command (modify existing or NEW)
```

### Pattern 1: Structured Extraction with Anthropic
**What:** Use Claude with explicit JSON output for field extraction
**When to use:** Extracting severity, frequency, userSegment from verbatim
**Example:**
```typescript
// Source: Existing pattern from /api/ai/generate/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const ExtractionSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low"]).nullable(),
  frequency: z.enum(["common", "occasional", "rare"]).nullable(),
  userSegment: z.string().nullable().describe("e.g., 'enterprise', 'SMB', 'prosumer'"),
  interpretation: z.string().nullable().describe("AI summary of what user really means"),
});

type ExtractionResult = z.infer<typeof ExtractionSchema>;

export async function extractSignalFields(verbatim: string): Promise<ExtractionResult> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You extract structured data from user feedback signals.

Return ONLY valid JSON with these fields:
- severity: "critical" | "high" | "medium" | "low" | null
- frequency: "common" | "occasional" | "rare" | null
- userSegment: string describing user type (e.g., "enterprise", "SMB", "prosumer") | null
- interpretation: brief AI summary of what user really means | null

Base severity on impact language:
- critical: "blocking", "can't use", "losing customers", "urgent"
- high: "frustrated", "major pain", "significant issue"
- medium: "would be nice", "improvement", "minor issue"
- low: "suggestion", "nice to have", "someday"

Base frequency on mentions of recurrence:
- common: "always", "every time", "constantly", "everyone"
- occasional: "sometimes", "few times", "when I try to"
- rare: "once", "happened to me", specific incident

If you cannot determine a field confidently, return null for that field.`,
    messages: [{
      role: "user",
      content: `Extract structured data from this user feedback:\n\n${verbatim}`
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Parse and validate with Zod
  try {
    const parsed = JSON.parse(text);
    return ExtractionSchema.parse(parsed);
  } catch {
    // Return nulls if parsing fails
    return { severity: null, frequency: null, userSegment: null, interpretation: null };
  }
}
```

### Pattern 2: OpenAI Embedding Generation
**What:** Generate 1536-dimension vector from signal content
**When to use:** After signal creation, for semantic search capability
**Example:**
```typescript
// Source: OpenAI official docs + Vercel AI SDK patterns
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  // Clean and truncate input (max 8191 tokens)
  const input = text.replaceAll('\n', ' ').trim().slice(0, 30000);

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
    // dimensions: 1536, // default, can reduce to 512 for smaller storage
  });

  return response.data[0].embedding;
}

// Convert to base64 for storage (matching memoryEntries pattern)
export function embeddingToBase64(embedding: number[]): string {
  const buffer = Buffer.from(new Float32Array(embedding).buffer);
  return buffer.toString("base64");
}

export function base64ToEmbedding(base64: string): number[] {
  const buffer = Buffer.from(base64, "base64");
  return Array.from(new Float32Array(buffer.buffer));
}
```

### Pattern 3: Queue-First Processing with after()
**What:** Return 200 immediately, process extraction/embedding asynchronously
**When to use:** Signal creation endpoints that trigger processing
**Example:**
```typescript
// Source: Existing pattern from /api/signals/upload/route.ts
import { after } from "next/server";

export async function POST(request: NextRequest) {
  // ... validation and signal creation ...

  const signal = await createSignal({ ... });

  // Queue processing asynchronously (Phase 13 pattern)
  after(async () => {
    try {
      await processSignalExtraction(signal.id);
    } catch (error) {
      // Never throw in after() context - log for debugging
      console.error("Signal processing failed:", error);
      // Could create notification for visibility
    }
  });

  return NextResponse.json({ success: true, signalId: signal.id }, { status: 201 });
}
```

### Pattern 4: Batch Processing for Existing Signals
**What:** Process signals in batches to respect rate limits
**When to use:** Backfilling existing signals, scheduled processing
**Example:**
```typescript
// Batch embedding generation with rate limit handling
export async function batchProcessSignals(signalIds: string[]): Promise<void> {
  const BATCH_SIZE = 100; // OpenAI supports up to 2048

  for (let i = 0; i < signalIds.length; i += BATCH_SIZE) {
    const batch = signalIds.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    await Promise.all(batch.map(async (id) => {
      try {
        await processSignalExtraction(id);
      } catch (error) {
        console.error(`Failed to process signal ${id}:`, error);
      }
    }));

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < signalIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

### Anti-Patterns to Avoid
- **Blocking on extraction:** Don't wait for LLM/embedding in the request path. Use `after()` for async processing.
- **Storing raw float arrays:** Use base64 encoding to match existing pattern and reduce JSON overhead.
- **Processing on every read:** Generate embedding once at creation time, not on demand.
- **Ignoring rate limits:** OpenAI has rate limits; batch and delay for bulk operations.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Embedding generation | Custom API wrapper | OpenAI official SDK | Handles retries, types, batching |
| Structured extraction | Regex parsing | Claude + JSON output | Handles ambiguity, synonyms |
| Vector similarity | Manual cosine calculation | pgvector (Phase 16) | Optimized, indexed |
| Rate limiting | Custom counter | OpenAI SDK retry | Built-in exponential backoff |
| Embedding storage | Custom binary format | Base64 text | Matches existing pattern |

**Key insight:** The codebase already uses Anthropic SDK for AI generation. Adding OpenAI for embeddings follows the same pattern. Don't introduce a unified AI SDK unless consolidating is a goal.

## Common Pitfalls

### Pitfall 1: OpenAI API Key Missing
**What goes wrong:** Embedding generation fails with auth error
**Why it happens:** OpenAI API key not in environment
**How to avoid:** Add OPENAI_API_KEY to .env.example and .env.local
**Warning signs:** 401 errors from OpenAI API

### Pitfall 2: Embedding Dimension Mismatch
**What goes wrong:** Can't compare embeddings generated with different settings
**Why it happens:** text-embedding-3-small supports custom dimensions (512, 1536)
**How to avoid:** Always use default 1536, or specify explicitly. Document choice.
**Warning signs:** Cosine similarity returns NaN or unexpected values

### Pitfall 3: LLM Returns Invalid JSON
**What goes wrong:** Extraction parsing fails, fields remain null
**Why it happens:** LLM occasionally adds markdown fencing or extra text
**How to avoid:**
1. Use explicit "Return ONLY valid JSON" instruction
2. Parse with fallback that strips markdown fencing
3. Validate with Zod, default to nulls on failure
**Warning signs:** Console errors about JSON parsing, many null extractions

### Pitfall 4: Processing Blocks Request
**What goes wrong:** Signal creation is slow (2-3 seconds for LLM + embedding)
**Why it happens:** Waiting for AI processing in request path
**How to avoid:** Use `after()` for async processing, return 201 immediately
**Warning signs:** Slow API response times, timeouts

### Pitfall 5: Cost Explosion from Duplicate Processing
**What goes wrong:** Signals processed multiple times, high API costs
**Why it happens:** No idempotency check, reprocessing on errors
**How to avoid:**
1. Track `processedAt` timestamp on signals
2. Check before processing: `if (signal.processedAt) return;`
3. Set `processedAt` before processing starts (optimistic)
**Warning signs:** High OpenAI bills, duplicate embeddings

## Code Examples

### Complete Signal Processor
```typescript
// orchestrator/src/lib/signals/processor.ts
import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { extractSignalFields } from "@/lib/ai/extraction";
import { generateEmbedding, embeddingToBase64 } from "@/lib/ai/embeddings";

export async function processSignalExtraction(signalId: string): Promise<void> {
  // 1. Fetch signal
  const signal = await db.query.signals.findFirst({
    where: eq(signals.id, signalId),
  });

  if (!signal) {
    throw new Error(`Signal not found: ${signalId}`);
  }

  // 2. Skip if already processed
  if (signal.processedAt) {
    console.log(`Signal ${signalId} already processed`);
    return;
  }

  // 3. Mark as processing (optimistic lock)
  const processingAt = new Date();
  await db.update(signals)
    .set({ processedAt: processingAt })
    .where(eq(signals.id, signalId));

  try {
    // 4. Extract structured fields
    const extraction = await extractSignalFields(signal.verbatim);

    // 5. Generate embedding
    const embedding = await generateEmbedding(signal.verbatim);
    const embeddingBase64 = embeddingToBase64(embedding);

    // 6. Update signal with extracted data
    await db.update(signals)
      .set({
        severity: extraction.severity,
        frequency: extraction.frequency,
        userSegment: extraction.userSegment,
        interpretation: extraction.interpretation || signal.interpretation,
        embedding: embeddingBase64,
        updatedAt: new Date(),
      })
      .where(eq(signals.id, signalId));

    console.log(`Processed signal ${signalId}: severity=${extraction.severity}`);
  } catch (error) {
    // Reset processedAt on failure so retry is possible
    await db.update(signals)
      .set({ processedAt: null })
      .where(eq(signals.id, signalId));
    throw error;
  }
}
```

### /ingest Command Endpoint
```typescript
// orchestrator/src/app/api/signals/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createSignal } from "@/lib/db/queries";
import { processSignalExtraction } from "@/lib/signals/processor";
import { requireWorkspaceAccess, PermissionError, handlePermissionError } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, rawInput, source = "paste" } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }
    if (!rawInput || typeof rawInput !== "string" || rawInput.trim().length === 0) {
      return NextResponse.json({ error: "rawInput required" }, { status: 400 });
    }

    await requireWorkspaceAccess(workspaceId, "member");

    // Create signal with raw content preserved as verbatim
    const signal = await createSignal({
      workspaceId,
      verbatim: rawInput.trim(),
      source,
      status: "new",
    });

    // Queue extraction + embedding (async, non-blocking)
    after(async () => {
      try {
        await processSignalExtraction(signal!.id);
      } catch (error) {
        console.error(`Failed to process signal ${signal!.id}:`, error);
      }
    });

    return NextResponse.json({
      success: true,
      signal: {
        id: signal!.id,
        status: "processing", // Will be updated when extraction completes
      },
      message: "Signal created. Extraction in progress.",
    }, { status: 201 });

  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Ingest failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingest failed" },
      { status: 500 }
    );
  }
}
```

### Extraction Prompt Patterns
```typescript
// orchestrator/src/lib/ai/extraction.ts

// Severity classification guidance
const SEVERITY_GUIDANCE = `
Base severity on impact language:
- critical: "blocking", "can't use", "losing customers", "urgent", "production down"
- high: "frustrated", "major pain", "significant issue", "very annoying"
- medium: "would be nice", "improvement needed", "minor issue", "inconvenient"
- low: "suggestion", "nice to have", "someday", "not urgent"

If the feedback is positive/praise, severity should be null.
If unclear, prefer null over guessing.`;

// Frequency classification guidance
const FREQUENCY_GUIDANCE = `
Base frequency on mentions of recurrence:
- common: "always", "every time", "constantly", "everyone experiences", "daily"
- occasional: "sometimes", "few times a week", "when I try to", "happens often enough"
- rare: "once", "happened to me", "this one time", "specific incident"

If no frequency indicators, return null.`;

// User segment guidance
const USER_SEGMENT_GUIDANCE = `
Infer user segment from context clues:
- Enterprise: mentions team size, compliance, security, SLA, procurement
- SMB: small team, budget-conscious, wearing multiple hats
- Prosumer/Individual: personal use, side project, learning
- Developer: technical details, API, code, integration
- Non-technical: simplicity, no-code, ease of use

If unclear, return null. Never guess randomly.`;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| text-embedding-ada-002 | text-embedding-3-small | Jan 2024 | 5x cheaper, better quality |
| Fixed 1536 dimensions | Configurable dimensions (512-3072) | Jan 2024 | Can trade off quality/cost |
| generateObject (AI SDK) | generateText with Output.object | AI SDK 6 (2025) | Unified API, deprecation warning |
| Base64 text embeddings | pgvector native type | Available now | Native similarity ops (Phase 16) |

**Deprecated/outdated:**
- text-embedding-ada-002: Still works but text-embedding-3-small is better and cheaper
- AI SDK generateObject: Deprecated in favor of Output.object pattern (but still functional)

## Open Questions

1. **pgvector vs Base64 Text**
   - What we know: Existing `memoryEntries.embedding` uses base64 text; pgvector offers native vector ops
   - What's unclear: Is similarity search needed in Phase 15? Base64 works for storage.
   - Recommendation: **Use base64 for Phase 15** to match existing pattern. Add pgvector in Phase 16 if clustering requires similarity search.

2. **Embedding Dimension Reduction**
   - What we know: text-embedding-3-small supports 512-1536 dimensions via API param
   - What's unclear: Quality/storage tradeoff for this use case
   - Recommendation: **Use default 1536** for best quality. Can reduce later if storage is concern.

3. **When to Trigger Processing**
   - What we know: Current signals are created without extraction/embedding
   - What's unclear: Should existing signals be backfilled? On-demand vs batch?
   - Recommendation: **Process on creation (async)** for new signals. Add admin endpoint for batch backfill of existing signals.

4. **Extraction Confidence Scores**
   - What we know: LLM can provide confidence, but current schema doesn't have field
   - What's unclear: Is confidence useful for UI/filtering?
   - Recommendation: **Defer to Phase 16**. Extract fields now, add confidence later if needed.

## Cost & Performance

### OpenAI Embedding Costs
- **Model:** text-embedding-3-small
- **Price:** $0.02 per 1M tokens (Standard tier)
- **Average signal:** ~500 tokens
- **Cost per signal:** ~$0.00001 (negligible)
- **1000 signals/day:** ~$0.01/day

### Rate Limits
- **Tier 1:** 500 RPM, 200,000 TPM
- **Tier 2:** 5,000 RPM, 2,000,000 TPM
- **Recommendation:** Tier 1 is sufficient for Phase 15 volume

### Performance Expectations
- **Extraction (Claude):** 1-2 seconds per signal
- **Embedding (OpenAI):** 100-300ms per signal
- **Total processing:** 2-3 seconds per signal (async, non-blocking)

### Caching Considerations
- Embeddings are idempotent - same text = same embedding
- Could cache by content hash if same text appears multiple times
- For Phase 15, just mark `processedAt` to avoid reprocessing

## Sources

### Primary (HIGH confidence)
- [OpenAI text-embedding-3-small Model](https://platform.openai.com/docs/models/text-embedding-3-small) - Official model docs
- [Vercel AI SDK Core: embed](https://ai-sdk.dev/docs/reference/ai-sdk-core/embed) - Embedding API reference
- [Drizzle ORM Vector Similarity Search](https://orm.drizzle.team/docs/guides/vector-similarity-search) - pgvector integration guide
- Existing codebase: `/api/ai/generate/route.ts`, `/api/signals/upload/route.ts` - Pattern analysis

### Secondary (MEDIUM confidence)
- [Vercel AI SDK Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) - Output.object patterns
- [OpenAI Pricing](https://platform.openai.com/docs/pricing) - Embedding costs
- [pgvector 2026 Guide](https://www.instaclustr.com/education/vector-database/pgvector-key-features-tutorial-and-pros-and-cons-2026-guide/) - PostgreSQL vector storage

### Tertiary (LOW confidence)
- [Prompt Patterns for Structured Data Extraction](https://www.dre.vanderbilt.edu/~schmidt/PDF/Prompt_Patterns_for_Structured_Data_Extraction_from_Unstructured_Text.pdf) - Academic patterns
- [Vercel AI Gateway Embeddings Demo](https://vercel.com/templates/next.js/vercel-ai-gateway-embeddings-demo) - Example implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - OpenAI SDK is well-documented, codebase already uses Anthropic pattern
- Architecture: HIGH - Queue-first pattern established in Phase 13, extraction follows AI generate pattern
- Pitfalls: HIGH - Common issues documented in community forums and official docs
- Cost estimates: MEDIUM - Based on published pricing, actual usage may vary

**Research date:** 2026-01-23
**Valid until:** 60 days (embedding API is stable, prompt patterns may evolve)

---

## Gap Analysis: Implementation Readiness

| Requirement | Research Finding | Implementation Gap | Risk |
|-------------|------------------|-------------------|------|
| INTL-03: Extract severity/frequency/segment | Claude + JSON output works well | Need extraction.ts module | LOW |
| INTL-04: Generate embeddings | text-embedding-3-small via OpenAI SDK | Need OpenAI SDK installation, OPENAI_API_KEY | LOW |
| INTL-06: /ingest command | Pattern exists in /api/webhooks/ingest | Need dedicated /api/signals/ingest endpoint | LOW |
| Raw content preserved | Schema has `verbatim` field | Already implemented | NONE |

**No blocking gaps identified.** Ready for planning.
