---
phase: 13-webhook-ingestion
plan: 02
subsystem: api
tags: [webhook, authentication, hmac, signals, async, after]

# Dependency graph
requires:
  - phase: 13-01
    provides: webhookKeys table for authentication lookup
  - phase: 11-signals-schema
    provides: signals table and SignalSource types
provides:
  - /api/webhooks/signals POST endpoint for external signal ingestion
  - verifyWebhookAuth function for dual authentication
  - processSignalWebhook function for async signal creation
  - GET endpoint returning API documentation
affects: [14-webhook-key-management-ui, external-integrations, ask-elephant-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - queue-first pattern using next/server after()
    - dual authentication (API key + HMAC signature)
    - timing-safe signature comparison with crypto.timingSafeEqual
    - check-then-insert idempotency via sourceRef

key-files:
  created:
    - orchestrator/src/lib/webhooks/auth.ts
    - orchestrator/src/lib/webhooks/processor.ts
    - orchestrator/src/lib/webhooks/index.ts
    - orchestrator/src/app/api/webhooks/signals/route.ts
  modified: []

key-decisions:
  - "Dual auth: API key for simple integrations, HMAC for secure integrations"
  - "Queue-first pattern: return 200 immediately, process via after()"
  - "Check-then-insert pattern for sourceRef idempotency (no unique constraint)"
  - "Never throw in after() context - log errors for debugging"

patterns-established:
  - "Webhook endpoint receives raw body before parsing for HMAC verification"
  - "Signal metadata includes webhookId for tracing webhook key usage"
  - "Activity logging for webhook-created signals"

# Metrics
duration: 3min
completed: 2026-01-22
---

# Phase 13 Plan 02: Signal Webhook Endpoint Summary

**Secure webhook endpoint for external signal ingestion with dual auth and async processing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-23T03:08:47Z
- **Completed:** 2026-01-23T03:12:00Z
- **Tasks:** 3
- **Files created:** 4

## Accomplishments

- Created verifyWebhookAuth supporting both X-API-Key and X-Webhook-Signature+X-Workspace-ID authentication
- Implemented verifyHmacSignature with timing-safe comparison to prevent timing attacks
- Created processSignalWebhook for async signal creation with idempotency handling
- Built /api/webhooks/signals POST endpoint using queue-first pattern with after()
- Added GET endpoint providing API documentation for integrators
- Implemented activity logging for webhook-created signals
- Added lastUsedAt tracking for webhook keys

## Task Commits

Each task was committed atomically:

1. **Task 1: Create webhook authentication utilities** - `758d6a5` (feat)
2. **Task 2: Create signal webhook processor** - `dc89869` (feat)
3. **Task 3: Create signal webhook endpoint** - `89513f6` (feat)

## Files Created

- `orchestrator/src/lib/webhooks/auth.ts` - Dual authentication with verifyWebhookAuth, verifyHmacSignature, generateWebhookCredentials
- `orchestrator/src/lib/webhooks/processor.ts` - Async signal processing with idempotency and activity logging
- `orchestrator/src/lib/webhooks/index.ts` - Barrel exports for webhooks module
- `orchestrator/src/app/api/webhooks/signals/route.ts` - POST endpoint with queue-first pattern, GET for docs

## Key Code Patterns

### Dual Authentication Flow

```typescript
// auth.ts
export async function verifyWebhookAuth(request: NextRequest, rawBody: string): Promise<AuthResult> {
  // Option 1: HMAC Signature (preferred)
  const signature = request.headers.get("x-webhook-signature");
  const workspaceIdHeader = request.headers.get("x-workspace-id");
  if (signature && workspaceIdHeader) {
    // ... verify signature with timing-safe comparison
  }

  // Option 2: API Key (simpler)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    // ... lookup key in database
  }
}
```

### Queue-First Pattern

```typescript
// route.ts
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const auth = await verifyWebhookAuth(request, rawBody);
  // ... validation ...

  after(async () => {
    await processSignalWebhook({ workspaceId: auth.workspaceId!, payload, receivedAt, webhookKeyId });
  });

  return NextResponse.json({ success: true, message: "Signal received, processing async" });
}
```

### Idempotency via sourceRef

```typescript
// processor.ts
const existingSignal = await db.query.signals.findFirst({
  where: (signals, { and, eq }) =>
    and(
      eq(signals.workspaceId, workspaceId),
      eq(signals.source, "webhook"),
      eq(signals.sourceRef, sourceRef)
    ),
});
if (existingSignal) {
  return { created: false, signalId: existingSignal.id, duplicate: true };
}
```

## Decisions Made

- **Dual authentication:** Support both simple API key (X-API-Key) and secure HMAC (X-Webhook-Signature + X-Workspace-ID) for different integration needs
- **Queue-first pattern:** Return 200 immediately, process via after() - ensures fast webhook acknowledgment
- **Check-then-insert:** Use query-first approach for idempotency since signals table lacks unique constraint on sourceRef
- **Error handling in after():** Never throw - log errors instead since webhook is already acknowledged
- **Activity logging:** Record signal.created for audit trail with webhook source info

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in processor insert**
- **Found during:** Task 2
- **Issue:** Drizzle insert was rejecting optional fields when passed as undefined
- **Fix:** Built insert values object conditionally, only adding optional fields when set
- **Files modified:** orchestrator/src/lib/webhooks/processor.ts
- **Commit:** dc89869

**2. [Rule 1 - Bug] Fixed rawPayload type mismatch**
- **Found during:** Task 2
- **Issue:** SignalWebhookPayload type not assignable to Record<string, unknown> in sourceMetadata
- **Fix:** Added explicit cast `payload as unknown as Record<string, unknown>`
- **Files modified:** orchestrator/src/lib/webhooks/processor.ts
- **Commit:** dc89869

## Issues Encountered

None - plan executed with minor type fixes.

## User Setup Required

None - no external service configuration required.

## API Reference

### POST /api/webhooks/signals

**Authentication:**
- Option 1: `X-API-Key: wk_xxxxxx`
- Option 2: `X-Webhook-Signature: sha256=xxxx` + `X-Workspace-ID: workspace-id`

**Request Body:**
```json
{
  "verbatim": "string (required)",
  "interpretation": "string",
  "severity": "critical | high | medium | low",
  "frequency": "common | occasional | rare",
  "userSegment": "string",
  "sourceRef": "string (for idempotency)",
  "sourceUrl": "string",
  "interviewDate": "string",
  "interviewee": "string",
  "tags": ["string"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Signal received, processing async",
  "receivedAt": "2026-01-23T03:12:00.000Z"
}
```

### GET /api/webhooks/signals

Returns API documentation JSON.

## Next Phase Readiness

- Webhook endpoint ready for external integration testing
- Ready for Phase 14: Webhook Key Management UI to create/manage keys
- Ask Elephant and Zapier can now post signals via webhook

---
*Phase: 13-webhook-ingestion*
*Completed: 2026-01-22*
