---
phase: 15-signal-extraction-and-embedding
verified: 2026-01-23T21:10:00Z
status: passed
score: 4/4 must-haves verified
---

# Phase 15: Signal Extraction & Embedding Verification Report

**Phase Goal:** Raw signals are processed into structured data with semantic embeddings
**Verified:** 2026-01-23T21:10:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | LLM extracts structured data from raw input (severity, frequency, user segment) | ✓ VERIFIED | `extractSignalFields()` calls Claude API, parses response, validates enum types, returns `ExtractionResult` |
| 2 | Signals have embeddings generated (OpenAI text-embedding-3-small) | ✓ VERIFIED | `generateEmbedding()` calls OpenAI API with model `text-embedding-3-small`, returns 1536-dim vector, converts to base64 |
| 3 | `/ingest` command processes raw input into structured signal | ✓ VERIFIED | POST `/api/signals/ingest` creates signal with verbatim, queues `processSignalExtraction()` via `after()` |
| 4 | Raw content is preserved alongside extracted structure | ✓ VERIFIED | `createSignal()` stores `verbatim` field first, `processSignalExtraction()` updates severity/frequency/embedding but never modifies verbatim |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/ai/extraction.ts` | Claude-based extraction module | ✓ VERIFIED | 136 lines, exports `extractSignalFields`, calls `anthropic.messages.create` with claude-sonnet-4-20250514, validates severity/frequency enums |
| `src/lib/ai/embeddings.ts` | OpenAI embeddings module | ✓ VERIFIED | 93 lines, exports `generateEmbedding`, calls `openai.embeddings.create` with text-embedding-3-small, includes base64 conversion utilities |
| `src/lib/signals/processor.ts` | Processing orchestrator | ✓ VERIFIED | 128 lines, exports `processSignalExtraction` with idempotency via `processedAt` check, resets on failure for retry |
| `src/app/api/signals/ingest/route.ts` | /ingest endpoint | ✓ VERIFIED | 97 lines, POST handler validates input, creates signal, queues processing via `after()` |
| `src/lib/db/queries.ts` (updateSignalProcessing) | Query function for AI fields | ✓ VERIFIED | Function exists, accepts nullable severity/frequency/userSegment/interpretation/embedding/processedAt |
| `src/lib/ai/index.ts` | Barrel export | ✓ VERIFIED | 10 lines, exports extraction and embeddings modules |
| `src/lib/signals/index.ts` | Barrel export | ✓ VERIFIED | 7 lines, exports processor module |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| /ingest endpoint | processSignalExtraction | after() call | ✓ WIRED | Line 65-71 in route.ts: imports from @/lib/signals, calls in after() block with try/catch |
| /upload endpoint | processSignalExtraction | after() call | ✓ WIRED | Line 161 in route.ts: calls processSignalExtraction(signal!.id) in after() block |
| /video endpoint | processSignalExtraction | after() call | ✓ WIRED | Line 137 in route.ts: calls processSignalExtraction(signal!.id) in after() block |
| webhook processor | processSignalExtraction | direct call | ✓ WIRED | Line 143 in processor.ts: calls processSignalExtraction(signal.id) with try/catch |
| Pylon integration | processSignalExtraction | direct call | ✓ WIRED | Line 151 in pylon.ts: calls processSignalExtraction(signalId) with try/catch |
| Slack integration | processSignalExtraction | direct call | ✓ WIRED | Line 118 in slack.ts: calls processSignalExtraction(signalId) with try/catch |
| processSignalExtraction | extractSignalFields | direct import | ✓ WIRED | Line 52 in processor.ts: calls extractSignalFields(signal.verbatim), uses result |
| processSignalExtraction | generateEmbedding | direct import | ✓ WIRED | Line 55 in processor.ts: calls generateEmbedding(signal.verbatim), converts to base64 |
| processSignalExtraction | updateSignalProcessing | direct import | ✓ WIRED | Line 59 in processor.ts: calls updateSignalProcessing with extracted data |
| extractSignalFields | Claude API | Anthropic SDK | ✓ WIRED | Line 73 in extraction.ts: anthropic.messages.create() with claude-sonnet-4-20250514 |
| generateEmbedding | OpenAI API | OpenAI SDK | ✓ WIRED | Line 32 in embeddings.ts: openai.embeddings.create() with text-embedding-3-small |
| updateSignalProcessing | signals table | Drizzle ORM | ✓ WIRED | queries.ts: db.update(signals).set({...data}).where(eq(signals.id, id)) |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| INTL-03: Extract structured data (severity, frequency, user segment) | ✓ SATISFIED | None - extractSignalFields extracts all three |
| INTL-04: Generate embeddings (OpenAI text-embedding-3-small) | ✓ SATISFIED | None - generateEmbedding uses correct model |
| INTL-06: /ingest command processes raw input into structured signal | ✓ SATISFIED | None - /api/signals/ingest creates signal and queues processing |

### Anti-Patterns Found

No blockers or warnings detected.

**Checked patterns:**
- No TODO/FIXME/XXX comments in lib/ai/ or lib/signals/
- No placeholder text or empty implementations
- No console.log-only handlers
- All functions have substantive implementations (93-136 lines)
- All modules properly exported via barrel files
- Error handling follows "never throw in after()" pattern from Phase 13
- All endpoints use queue-first pattern (return immediately, process async)

### Human Verification Required

None. All must-haves are programmatically verifiable:
- Extraction: Code exists, calls Claude API, validates response
- Embeddings: Code exists, calls OpenAI API, returns vectors
- /ingest: Endpoint exists, creates signals, queues processing
- Raw preservation: verbatim field set at creation, never modified

Human testing would verify the QUALITY of extraction (are severity/frequency/userSegment accurate?), but the phase goal is that processing HAPPENS, not that it's perfect. Quality improvement is iterative work, not a P0 blocker.

## Detailed Verification

### Must-Have 1: LLM extracts structured data from raw input

**Truth:** "LLM extracts structured data from raw input (severity, frequency, user segment)"

**Level 1 - Existence:** ✓ PASS
- File exists: `src/lib/ai/extraction.ts` (136 lines)
- Function exists: `extractSignalFields(verbatim: string): Promise<ExtractionResult>`
- Interface exists: `ExtractionResult { severity, frequency, userSegment, interpretation }`

**Level 2 - Substantive:** ✓ PASS
- File has 136 lines (well above 15-line minimum)
- No stub patterns detected (no TODO/FIXME/placeholder)
- Has real implementation:
  - Anthropic client instantiation (line 71)
  - System prompt with extraction guidance (lines 20-48)
  - API call to Claude (line 73)
  - JSON parsing with try/catch (line 92)
  - Enum validation helpers (lines 122-136)
- Returns nulls on failure (graceful fallback, not empty/unhandled)

**Level 3 - Wired:** ✓ PASS
- Imported by: `src/lib/signals/processor.ts` (line 16)
- Used by: `processSignalExtraction()` calls it (line 52)
- Result is stored: passed to `updateSignalProcessing()` (lines 59-66)
- API actually called: `anthropic.messages.create()` with model `claude-sonnet-4-20250514` (line 73)

**Evidence of real extraction:**
```typescript
// Line 73-83 in extraction.ts
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 500,
  system: EXTRACTION_SYSTEM_PROMPT,
  messages: [
    {
      role: "user",
      content: `Extract metadata from this user feedback:\n\n${verbatim}`,
    },
  ],
});
```

**Verdict:** ✓ VERIFIED - Extraction module exists, is substantive, calls Claude API, returns structured data, is wired into processor.

---

### Must-Have 2: Signals have embeddings generated

**Truth:** "Signals have embeddings generated (OpenAI text-embedding-3-small)"

**Level 1 - Existence:** ✓ PASS
- File exists: `src/lib/ai/embeddings.ts` (93 lines)
- Function exists: `generateEmbedding(text: string): Promise<number[]>`
- Conversion utilities exist: `embeddingToBase64()`, `base64ToEmbedding()`
- OpenAI SDK installed: `openai@6.16.0`
- Env var documented: `OPENAI_API_KEY` in `.env.example`

**Level 2 - Substantive:** ✓ PASS
- File has 93 lines (well above 10-line minimum)
- No stub patterns detected
- Has real implementation:
  - OpenAI client instantiation (line 25)
  - Input cleaning (line 30)
  - API call with correct model (line 32)
  - Base64 conversion using Float32Array (lines 61-81)
- Model explicitly specified: `text-embedding-3-small` (matches requirement)

**Level 3 - Wired:** ✓ PASS
- Imported by: `src/lib/signals/processor.ts` (line 17)
- Used by: `processSignalExtraction()` calls it (line 55)
- Result is stored: converted to base64 and passed to `updateSignalProcessing()` (lines 56, 65)
- API actually called: `openai.embeddings.create()` with model `text-embedding-3-small` (line 32)

**Evidence of real embedding generation:**
```typescript
// Line 32-37 in embeddings.ts
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: cleanedText,
});

return response.data[0].embedding;
```

**Evidence of storage:**
```typescript
// Line 55-65 in processor.ts
const embeddingVector = await generateEmbedding(signal.verbatim);
const embeddingBase64 = embeddingToBase64(embeddingVector);

await updateSignalProcessing(signalId, {
  // ...
  embedding: embeddingBase64,
  processedAt: new Date(),
});
```

**Verdict:** ✓ VERIFIED - Embeddings module exists, is substantive, calls OpenAI API with correct model, returns 1536-dim vectors, is wired into processor and stored in DB.

---

### Must-Have 3: /ingest command processes raw input into structured signal

**Truth:** "/ingest command processes raw input into structured signal"

**Level 1 - Existence:** ✓ PASS
- File exists: `src/app/api/signals/ingest/route.ts` (97 lines)
- POST handler exists: `export async function POST(request: NextRequest)`
- Endpoint accessible at: `/api/signals/ingest`

**Level 2 - Substantive:** ✓ PASS
- File has 97 lines (well above 10-line minimum)
- No stub patterns detected
- Has real implementation:
  - JSON body parsing (line 33)
  - Validation (lines 37-49)
  - Permission check (line 52)
  - Signal creation (line 56)
  - Processing queue (line 65)
  - Response with signal ID (lines 74-83)
- Not just console.log or return null

**Level 3 - Wired:** ✓ PASS
- Imports: `createSignal` from queries, `processSignalExtraction` from signals (lines 20-21)
- Creates signal: calls `createSignal()` with verbatim (line 56)
- Queues processing: calls `processSignalExtraction(signal!.id)` in `after()` block (line 67)
- Returns immediately: 201 response before processing completes (queue-first pattern)
- Processing actually happens: after() block calls real function, not stub

**Evidence of complete flow:**
```typescript
// Line 56-62 in route.ts - Signal creation
const signal = await createSignal({
  workspaceId,
  verbatim: rawInput.trim(),
  interpretation: interpretation?.trim() || undefined,
  source: source || "paste",
  sourceRef,
});

// Line 65-71 - Queue processing
after(async () => {
  try {
    await processSignalExtraction(signal!.id);
  } catch (error) {
    console.error(`Failed to process signal ${signal!.id}:`, error);
  }
});
```

**Verdict:** ✓ VERIFIED - /ingest endpoint exists, is substantive, creates signal, queues real processing, follows queue-first pattern.

---

### Must-Have 4: Raw content is preserved alongside extracted structure

**Truth:** "Raw content is preserved alongside extracted structure"

**Level 1 - Existence:** ✓ PASS
- Schema has `verbatim` field (text, not null) for raw content
- Schema has `severity`, `frequency`, `userSegment`, `interpretation`, `embedding` fields for extracted structure
- Fields are separate (not overwriting)

**Level 2 - Substantive:** ✓ PASS
- Signal creation always sets `verbatim` first (before processing)
- Processing reads FROM `verbatim`: `extractSignalFields(signal.verbatim)` (line 52 in processor.ts)
- Processing updates OTHER fields: `updateSignalProcessing()` updates severity/frequency/userSegment/embedding
- `updateSignalProcessing()` does NOT include verbatim in update set (queries.ts lines 489-501)
- Verbatim is never modified after creation

**Level 3 - Wired:** ✓ PASS
- Creation: All endpoints (ingest, upload, video, webhooks) call `createSignal({ verbatim: ... })`
- Processing: `processSignalExtraction()` reads `signal.verbatim` (line 52)
- Update: `updateSignalProcessing()` updates extracted fields only (lines 59-66)
- Separation maintained: verbatim field never appears in processing updates

**Evidence of preservation:**
```typescript
// Signal creation (line 56 in ingest/route.ts)
const signal = await createSignal({
  workspaceId,
  verbatim: rawInput.trim(),  // Raw content stored first
  // ...
});

// Processing reads verbatim (line 52 in processor.ts)
const extraction = await extractSignalFields(signal.verbatim);

// Processing updates OTHER fields (lines 59-66 in processor.ts)
await updateSignalProcessing(signalId, {
  severity: extraction.severity,        // Extracted
  frequency: extraction.frequency,      // Extracted
  userSegment: extraction.userSegment,  // Extracted
  interpretation: signal.interpretation || extraction.interpretation,
  embedding: embeddingBase64,           // Generated
  processedAt: new Date(),
  // NOTE: verbatim is NOT in this update - it's preserved
});
```

**Verdict:** ✓ VERIFIED - Raw verbatim is stored at creation, read during processing, never modified. Extracted structure is stored in separate fields.

---

## Integration Verification

### All Signal Sources Wired for Processing

Verified that AI processing is triggered for ALL signal creation flows:

| Source | Endpoint/Function | Processing Call | Status |
|--------|------------------|-----------------|--------|
| Manual ingest | `/api/signals/ingest` | Line 67 in route.ts | ✓ WIRED |
| File upload | `/api/signals/upload` | Line 161 in route.ts | ✓ WIRED |
| Video captions | `/api/signals/video` | Line 137 in route.ts | ✓ WIRED |
| Generic webhook | `processSignalWebhook()` | Line 143 in processor.ts | ✓ WIRED |
| Pylon tickets | `createSignalFromPylon()` | Line 151 in pylon.ts | ✓ WIRED |
| Slack messages | `createSignalFromSlack()` | Line 118 in slack.ts | ✓ WIRED |

All 6 signal sources call `processSignalExtraction()` either in `after()` blocks (endpoints) or directly (utility functions already in after() context).

### Queue-First Pattern Compliance

All endpoints follow Phase 13 queue-first pattern:
1. Create signal synchronously
2. Return 2xx response immediately
3. Process asynchronously via `after()`
4. Catch and log errors (never throw in after())

Verified in:
- `/ingest`: Returns 201 before processing (lines 74-83)
- `/upload`: Returns 200 before processing
- `/video`: Returns 200 before processing
- Webhooks: Return 200 before processing (webhook processor already ACKs immediately)

### Error Handling Compliance

All processing calls follow Phase 13 "never throw in after()" guidance:
```typescript
after(async () => {
  try {
    await processSignalExtraction(signal!.id);
  } catch (error) {
    console.error(`Failed to process signal ${signal!.id}:`, error);
    // Logged, not thrown - after() completes without error
  }
});
```

### Idempotency Implementation

`processSignalExtraction()` implements robust idempotency:
1. Check `signal.processedAt` - return early if already processed (line 40)
2. Set `processedAt` optimistically BEFORE processing (line 46) - prevents duplicate processing in race conditions
3. On success: update with extracted data + final `processedAt`
4. On failure: reset `processedAt` to null (line 72) - allows retry

This pattern prevents:
- Duplicate API calls (expensive)
- Race conditions from concurrent processing
- Lost signals (can retry failed processing)

---

## Dependency Verification

### Cross-Phase Dependencies Met

| Phase | Provides | Status | Evidence |
|-------|----------|--------|----------|
| Phase 11 | Signal schema with severity/frequency/userSegment/embedding/processedAt fields | ✓ MET | All fields exist in schema.ts |
| Phase 11 | SignalSeverity and SignalFrequency types | ✓ MET | Used in extraction.ts for validation |
| Phase 13 | Queue-first pattern with after() | ✓ MET | All endpoints use after() for processing |
| Phase 13 | Never throw in after() guidance | ✓ MET | All processing calls wrapped in try/catch |

### External Dependencies

| Dependency | Expected | Actual | Status |
|------------|----------|--------|--------|
| OpenAI SDK | v4.x+ | v6.16.0 | ✓ MET |
| Anthropic SDK | Already installed | Already installed | ✓ MET |
| Environment vars | OPENAI_API_KEY documented | In .env.example | ✓ MET |

### Next Phase Readiness

Phase 15 enables Phase 16 (Classification & Clustering):

| Phase 16 Needs | Phase 15 Provides | Status |
|----------------|-------------------|--------|
| Embeddings for similarity search | `signals.embedding` field populated with base64 vectors | ✓ READY |
| processedAt timestamp to identify processed signals | `signals.processedAt` set after processing | ✓ READY |
| Batch processing for backfill | `batchProcessSignals()` function exists | ✓ READY |
| Extraction fields for classification | severity, frequency, userSegment populated | ✓ READY |

---

## Summary

**Phase 15 goal ACHIEVED.**

All 4 must-haves verified:
1. ✓ LLM extracts structured data (severity, frequency, user segment)
2. ✓ Signals have embeddings generated (OpenAI text-embedding-3-small)
3. ✓ /ingest command processes raw input into structured signal
4. ✓ Raw content is preserved alongside extracted structure

All artifacts exist, are substantive (93-136 lines per module), and are wired correctly:
- AI modules call real APIs (Claude for extraction, OpenAI for embeddings)
- Signal processor orchestrates extraction + embedding with idempotency
- /ingest endpoint creates signals and queues processing
- All 6 signal creation flows trigger processing
- Raw verbatim is preserved, extracted structure stored separately

No gaps found. No blockers found. No stub patterns detected.

**Phase 15 is complete and ready for Phase 16.**

---

_Verified: 2026-01-23T21:10:00Z_
_Verifier: Claude (gsd-verifier)_
