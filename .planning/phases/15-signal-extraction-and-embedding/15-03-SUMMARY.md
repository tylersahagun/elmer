---
phase: 15
plan: 03
subsystem: signals
tags: [endpoints, webhooks, integration, async-processing]

dependency-graph:
  requires:
    - 15-01 (AI Infrastructure)
    - 15-02 (Signal Processor)
  provides:
    - /api/signals/ingest endpoint
    - AI processing integration for all signal creation flows
  affects:
    - Phase 16 (Classification & Clustering)

tech-stack:
  added: []
  patterns:
    - queue-first async processing via after()
    - non-blocking signal extraction

key-files:
  created:
    - orchestrator/src/app/api/signals/ingest/route.ts
  modified:
    - orchestrator/src/app/api/signals/upload/route.ts
    - orchestrator/src/app/api/signals/video/route.ts
    - orchestrator/src/lib/webhooks/processor.ts
    - orchestrator/src/lib/integrations/pylon.ts
    - orchestrator/src/lib/integrations/slack.ts

decisions:
  - id: ingest-source-default
    decision: Source defaults to "paste" for ingest endpoint
    rationale: Consistent with manual entry pattern from 12-01

metrics:
  duration: 4 minutes
  completed: 2026-01-23
---

# Phase 15 Plan 03: /ingest Endpoint and Processing Integration Summary

**One-liner:** /api/signals/ingest endpoint created and AI processing integrated into all signal creation flows via after()

## What Was Built

### /api/signals/ingest Endpoint
- POST endpoint accepting JSON body with workspaceId, rawInput, optional source and interpretation
- Validates required fields (400 if missing)
- Requires member access for signal creation
- Source defaults to "paste" if not provided
- Generates unique sourceRef: `ingest-{timestamp}-{nanoid(6)}`
- Returns 201 with signal.id and status: "processing"
- Queues AI extraction via after() (non-blocking)

### AI Processing Integration
Integrated `processSignalExtraction` into all signal creation flows:

| Endpoint/Flow | File | Pattern |
|--------------|------|---------|
| /api/signals/ingest | route.ts | after() in endpoint |
| /api/signals/upload | route.ts | after() in endpoint |
| /api/signals/video | route.ts | after() in endpoint |
| /api/webhooks/signals | processor.ts | Called in processSignalWebhook |
| Pylon webhook | pylon.ts | Called in createSignalFromPylon |
| Slack webhook | slack.ts | Called in createSignalFromSlack |

## Commits

| Hash | Description |
|------|-------------|
| 171dd9f | feat(15-02): add signal processor module and index (blocking fix) |
| 1110a09 | feat(15-03): create /api/signals/ingest endpoint |
| e132cc6 | feat(15-03): add AI processing to upload endpoint |
| 76d861c | feat(15-03): add AI processing to video endpoint |
| 7d3ba33 | feat(15-03): add AI processing to webhook signals endpoint |
| e879a2b | feat(15-03): add AI processing to Pylon and Slack integrations |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan 15-02 incomplete - missing lib/signals module**

- **Found during:** Task execution start
- **Issue:** Plan 15-02 Task 1 (updateSignalProcessing) was committed but Tasks 2-3 (processor.ts, index.ts) were missing
- **Fix:** Created lib/signals/processor.ts and lib/signals/index.ts with processSignalExtraction and batchProcessSignals
- **Files created:** orchestrator/src/lib/signals/processor.ts, orchestrator/src/lib/signals/index.ts
- **Commit:** 171dd9f

## Verification Results

All acceptance criteria verified:

- [x] `/api/signals/ingest` endpoint exists and accepts POST
- [x] `/ingest` creates signal with source defaulting to "paste"
- [x] `/ingest` queues processing via after() (non-blocking)
- [x] Upload endpoint triggers signal processing
- [x] Video endpoint triggers signal processing
- [x] Webhook signals endpoint triggers signal processing
- [x] Pylon endpoint triggers signal processing
- [x] Slack endpoint triggers signal processing
- [x] All endpoints return immediately (queue-first pattern)

## Next Phase Readiness

Phase 15 is now complete. All three plans executed:
- 15-01: AI Infrastructure (extraction.ts, embeddings.ts)
- 15-02: Signal Processor (processor.ts with processSignalExtraction)
- 15-03: /ingest Endpoint and Processing Integration

**Ready for Phase 16 (Classification & Clustering):**
- Signals from all sources now have embeddings generated
- Embedding format: Base64-encoded Float32Array (1536 dimensions)
- processedAt timestamp indicates when AI processing completed
- batchProcessSignals available for backfill operations
