# Phase 13: Webhook Ingestion - Research

**Researched:** 2026-01-22
**Domain:** Webhook endpoints, authentication, queue-first patterns, idempotency
**Confidence:** HIGH

## Summary

Phase 13 implements a production-grade webhook ingestion system for receiving signals from external sources (primarily Ask Elephant transcripts). Research confirms the queue-first pattern is essential for serverless deployments on Vercel, and the codebase already has an existing webhook endpoint (`/api/webhooks/ingest`) that can serve as a foundation.

Key findings:

1. **Queue-first pattern is mandatory**: Vercel serverless functions must respond within 5 seconds for webhook reliability. Use Next.js 15's `after()` function for background processing after immediate 200 response.
2. **Dual authentication supported**: Implement both API key (simple) and HMAC signature (secure) authentication to support different integration complexity levels.
3. **Idempotency via sourceRef**: Use the existing `sourceRef` field with a unique constraint to prevent duplicate signal creation on webhook retries.
4. **Create signals directly**: Unlike the existing inbox webhook, Phase 13 creates signals directly (not inbox items), with async processing deferred.

**Primary recommendation:** Extend the existing `/api/webhooks/ingest` pattern with HMAC signature verification, workspace-scoped API keys stored in database, idempotency checking, and Next.js `after()` for async signal processing.

## Standard Stack

No new packages required. The existing stack provides everything needed.

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.3 | API routes with `after()` for background processing | Built-in, supports queue-first pattern |
| crypto (Node.js built-in) | N/A | HMAC-SHA256 signature verification | No dependencies, timing-safe comparison |
| drizzle-orm | 0.45.1 | Database operations, unique constraints | Already established pattern |
| nanoid | (bundled) | Generate API keys and IDs | Consistent with codebase |

### Supporting (No Changes Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/server | (part of next) | `after()` function | Background processing after response |
| uuid | (existing) | Alternative ID generation | Signal IDs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Database API keys | Environment variable | Environment variable is global, not workspace-scoped |
| HMAC only | API keys only | HMAC provides payload integrity; API keys are simpler |
| Upstash/QStash | `after()` | External dependency; `after()` is built-in and sufficient |
| Redis for idempotency | Database unique constraint | Database is sufficient for expected volume |

**Installation:**
No new packages needed.

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── app/api/webhooks/
│   └── signals/
│       └── route.ts       # NEW: Signal-specific webhook endpoint
├── lib/
│   ├── webhooks/
│   │   ├── index.ts       # NEW: Webhook utilities export
│   │   ├── auth.ts        # NEW: API key and HMAC verification
│   │   └── processor.ts   # NEW: Async signal processing
│   └── db/
│       ├── schema.ts      # ADD: webhookKeys table
│       └── queries.ts     # ADD: Webhook key queries
```

### Pattern 1: Queue-First Webhook Handler
**What:** Immediately ACK webhook, process asynchronously
**When to use:** All webhook endpoints to meet 5-second response requirement
**Example:**
```typescript
// Source: Next.js 15 after() documentation
import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Get raw body for signature verification
  const rawBody = await request.text();

  // 2. Verify authentication (fast - ~10ms)
  const authResult = await verifyWebhookAuth(request, rawBody);
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  // 3. Parse and validate payload (fast - ~5ms)
  const payload = JSON.parse(rawBody);
  const validation = validateWebhookPayload(payload);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // 4. Idempotency check (fast - ~20ms)
  const isDuplicate = await checkIdempotency(payload.idempotencyKey);
  if (isDuplicate) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  // 5. Queue for async processing
  after(async () => {
    await processSignalAsync({
      workspaceId: authResult.workspaceId,
      payload,
      receivedAt: new Date(startTime),
    });
  });

  // 6. Return 200 immediately (target: < 100ms)
  return NextResponse.json({
    success: true,
    message: 'Webhook received, processing async',
    receivedAt: new Date(startTime).toISOString(),
  });
}
```

### Pattern 2: Dual Authentication (API Key + HMAC)
**What:** Support both simple API keys and HMAC signatures
**When to use:** Webhook authentication
**Example:**
```typescript
// Source: Node.js crypto + webhook security best practices
import crypto from 'crypto';

interface AuthResult {
  valid: boolean;
  workspaceId?: string;
  error?: string;
}

export async function verifyWebhookAuth(
  request: NextRequest,
  rawBody: string
): Promise<AuthResult> {
  // Option 1: HMAC Signature (preferred for security)
  const signature = request.headers.get('x-webhook-signature');
  const workspaceId = request.headers.get('x-workspace-id');

  if (signature && workspaceId) {
    const webhookKey = await getWebhookKey(workspaceId);
    if (!webhookKey) {
      return { valid: false, error: 'Invalid workspace' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookKey.secret)
      .update(rawBody)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, workspaceId };
  }

  // Option 2: API Key (simpler integration)
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    const webhookKey = await getWebhookKeyByApiKey(apiKey);
    if (!webhookKey) {
      return { valid: false, error: 'Invalid API key' };
    }

    return { valid: true, workspaceId: webhookKey.workspaceId };
  }

  return { valid: false, error: 'No authentication provided' };
}
```

### Pattern 3: Database-Stored Webhook Keys
**What:** Workspace-scoped API keys with HMAC secrets
**When to use:** Supporting multiple workspaces with isolated credentials
**Example:**
```typescript
// Source: Existing schema.ts patterns
export const webhookKeys = pgTable("webhook_keys", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),                    // "Ask Elephant", "Zapier"
  apiKey: text("api_key").notNull().unique(),      // For simple auth
  secret: text("secret").notNull(),                // For HMAC signature
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
});
```

### Pattern 4: Idempotency via Unique Constraint
**What:** Prevent duplicate signals using sourceRef + workspaceId
**When to use:** All webhook signal creation
**Example:**
```typescript
// Source: Existing signals table + webhook idempotency patterns
// The signals table already has sourceRef field
// Add a unique constraint on (workspaceId, source, sourceRef)

export const signals = pgTable("signals", {
  // ... existing fields
}, (table) => ({
  // Add unique constraint for idempotency
  uniqueSourceRef: unique().on(table.workspaceId, table.source, table.sourceRef),
}));

// In webhook processor
async function createSignalIdempotent(data: NewSignal): Promise<Signal | null> {
  try {
    return await db.insert(signals).values(data).returning();
  } catch (error) {
    if (error.code === '23505') { // Postgres unique violation
      // Already exists - return existing or null
      return await db.query.signals.findFirst({
        where: and(
          eq(signals.workspaceId, data.workspaceId),
          eq(signals.source, data.source),
          eq(signals.sourceRef, data.sourceRef),
        ),
      });
    }
    throw error;
  }
}
```

### Anti-Patterns to Avoid
- **Processing before responding:** Never do heavy work before returning 200. Use `after()`.
- **String comparison for signatures:** Always use `crypto.timingSafeEqual()` to prevent timing attacks.
- **Parsing body twice:** Read raw body once with `request.text()`, then `JSON.parse()` it.
- **Global webhook secret:** Use workspace-scoped keys, not environment variables.
- **Trusting payload without verification:** Always verify signature before processing.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Background processing | Custom queue system | `after()` from next/server | Built-in, works on Vercel |
| HMAC verification | Custom hashing | `crypto.createHmac()` + `timingSafeEqual()` | Constant-time, prevents timing attacks |
| Idempotency keys | Custom tracking table | Unique constraint on sourceRef | Database handles concurrency |
| API key generation | Custom random strings | `nanoid(32)` | Cryptographically secure, URL-safe |
| Webhook key storage | Environment variables | Database table with workspace FK | Multi-tenant support |

**Key insight:** The existing codebase patterns (Drizzle, Next.js API routes, nanoid) provide everything needed. The main innovation is using `after()` for queue-first pattern.

## Common Pitfalls

### Pitfall 1: Timeout on Heavy Processing
**What goes wrong:** Webhook returns 504 because processing takes > 10 seconds
**Why it happens:** Processing signals, logging, notifications inline before response
**How to avoid:** Use `after()` - return 200 within 100ms, process async
**Warning signs:** Webhook providers reporting delivery failures, retry storms

### Pitfall 2: Signature Verification with Parsed Body
**What goes wrong:** HMAC never matches, all webhooks rejected
**Why it happens:** `JSON.stringify(JSON.parse(body))` changes whitespace
**How to avoid:** Use `request.text()` to get raw body before any parsing
**Warning signs:** 401 errors on valid webhooks from providers

### Pitfall 3: Missing Idempotency
**What goes wrong:** Duplicate signals created on webhook retries
**Why it happens:** Network issues cause provider to retry, endpoint creates duplicate
**How to avoid:** Unique constraint on (workspaceId, source, sourceRef)
**Warning signs:** 2-3x signal count, identical verbatim content

### Pitfall 4: Race Conditions on Concurrent Webhooks
**What goes wrong:** Two identical webhooks processed simultaneously both succeed
**Why it happens:** Check-then-insert pattern without transaction
**How to avoid:** Use INSERT with ON CONFLICT, let database handle atomicity
**Warning signs:** Occasional duplicates despite idempotency checks

### Pitfall 5: API Key Exposure in Logs
**What goes wrong:** API keys visible in server logs or error messages
**Why it happens:** Logging full request headers or bodies
**How to avoid:** Never log authentication headers; use sanitized logging
**Warning signs:** API keys in Vercel logs, security scanner alerts

## Code Examples

Verified patterns from existing codebase and official documentation:

### Complete Webhook Handler
```typescript
// Source: Existing route.ts pattern + Next.js 15 after() docs
import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookAuth } from '@/lib/webhooks/auth';
import { processSignalWebhook } from '@/lib/webhooks/processor';

// Payload types for Ask Elephant webhook
interface SignalWebhookPayload {
  // Required fields
  verbatim: string;           // The actual user quote/feedback

  // Optional structured data
  interpretation?: string;    // PM interpretation
  severity?: 'critical' | 'high' | 'medium' | 'low';
  frequency?: 'common' | 'occasional' | 'rare';

  // Source tracking
  sourceRef?: string;         // External ID for idempotency
  sourceUrl?: string;         // Link to original source

  // Ask Elephant specific
  interviewDate?: string;
  interviewee?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  const receivedAt = new Date();

  // 1. Read raw body for signature verification
  const rawBody = await request.text();

  // 2. Verify authentication
  const auth = await verifyWebhookAuth(request, rawBody);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error, code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // 3. Parse and validate payload
  let payload: SignalWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'INVALID_PAYLOAD' },
      { status: 400 }
    );
  }

  if (!payload.verbatim) {
    return NextResponse.json(
      { error: 'Missing required field: verbatim', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  // 4. Queue async processing, return immediately
  after(async () => {
    await processSignalWebhook({
      workspaceId: auth.workspaceId!,
      payload,
      receivedAt,
      webhookKeyId: auth.webhookKeyId,
    });
  });

  // 5. Return success (< 100ms total)
  return NextResponse.json({
    success: true,
    message: 'Signal received, processing async',
    receivedAt: receivedAt.toISOString(),
  });
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhooks/signals',
    version: '1.0',
    authentication: ['x-api-key', 'x-webhook-signature + x-workspace-id'],
    requiredFields: ['verbatim'],
  });
}
```

### HMAC Signature Verification
```typescript
// Source: Node.js crypto docs + webhook security best practices
import crypto from 'crypto';

export function verifyHmacSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Handle both 'sha256=xxx' and plain 'xxx' formats
  const normalizedSignature = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(normalizedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    // Buffer lengths don't match - invalid signature format
    return false;
  }
}
```

### Webhook Key Generation
```typescript
// Source: Existing nanoid pattern + security best practices
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export function generateWebhookCredentials() {
  return {
    apiKey: `wk_${nanoid(32)}`,           // Prefixed for identification
    secret: crypto.randomBytes(32).toString('hex'),  // 256-bit secret
  };
}
```

### Signal Processing with Idempotency
```typescript
// Source: Existing queries.ts pattern + idempotency best practices
import { db } from '@/lib/db';
import { signals, webhookKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface ProcessWebhookInput {
  workspaceId: string;
  payload: SignalWebhookPayload;
  receivedAt: Date;
  webhookKeyId?: string;
}

export async function processSignalWebhook(input: ProcessWebhookInput) {
  const { workspaceId, payload, receivedAt, webhookKeyId } = input;

  // Generate sourceRef if not provided (for idempotency)
  const sourceRef = payload.sourceRef || `webhook-${receivedAt.getTime()}`;

  try {
    // Idempotent insert - database handles duplicates
    const [signal] = await db.insert(signals).values({
      workspaceId,
      verbatim: payload.verbatim,
      interpretation: payload.interpretation,
      severity: payload.severity,
      frequency: payload.frequency,
      source: 'webhook',
      sourceRef,
      sourceMetadata: {
        sourceUrl: payload.sourceUrl,
        interviewDate: payload.interviewDate,
        interviewee: payload.interviewee,
        webhookKeyId,
        receivedAt: receivedAt.toISOString(),
        rawPayload: payload,
      },
      status: 'new',
    }).onConflictDoNothing().returning();

    // Update webhook key last used timestamp
    if (webhookKeyId) {
      await db.update(webhookKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(webhookKeys.id, webhookKeyId));
    }

    // Log activity (existing pattern)
    if (signal) {
      await logActivity(workspaceId, 'signal.created', {
        signalId: signal.id,
        source: 'webhook',
      });
    }

    return { created: !!signal, signalId: signal?.id };
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Don't throw - webhook is already ACKed
    // Could notify via notifications table for visibility
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `waitUntil()` (experimental) | `after()` (stable) | Next.js 15.1.0 | Use `after()` for background tasks |
| Custom queues | Built-in `after()` | Next.js 15.1.0 | No external queue needed for simple cases |
| SHA1 HMAC | SHA256 HMAC | Ongoing | SHA1 deprecated, use SHA256 |
| Pages Router API | App Router Route Handlers | Next.js 13+ | Raw body access simpler in App Router |

**Deprecated/outdated:**
- `waitUntil()` unstable API - use `after()` instead
- SHA1 for HMAC - always use SHA256
- Environment variable webhook secrets - use database-stored keys for multi-tenancy

## Open Questions

Things that couldn't be fully resolved:

1. **Webhook Key Management UI**
   - What we know: Keys should be stored in database with workspace association
   - What's unclear: Should this phase include the admin UI, or defer to future phase?
   - Recommendation: **Defer UI to later phase.** Implement API and schema only. Keys can be created via database seed or admin API initially.

2. **Rate Limiting**
   - What we know: Webhook endpoints should have rate limits to prevent abuse
   - What's unclear: Whether to use Vercel's built-in rate limiting or custom implementation
   - Recommendation: **Defer to later phase.** Initial implementation can rely on Vercel's default limits. Add custom rate limiting if needed.

3. **Retry/DLQ for `after()` Failures**
   - What we know: `after()` runs async, failures aren't surfaced
   - What's unclear: How to handle processing failures gracefully
   - Recommendation: **Use notifications table.** On processing error, create a notification with "action_required" type so failures are visible to users.

4. **Ask Elephant Payload Schema**
   - What we know: Ask Elephant sends transcripts with pre-extracted quotes
   - What's unclear: Exact payload structure from Ask Elephant
   - Recommendation: **Define flexible schema.** Accept any shape with `verbatim` required, store extras in `sourceMetadata.rawPayload`.

## Sources

### Primary (HIGH confidence)
- [Next.js 15 `after()` documentation](https://nextjs.org/docs/app/api-reference/functions/after) - Background processing pattern
- Existing `/api/webhooks/ingest/route.ts` in codebase - Pattern validation
- Existing `schema.ts` in codebase (1291 lines) - Drizzle patterns
- Node.js `crypto` documentation - HMAC implementation

### Secondary (MEDIUM confidence)
- [Webhook Best Practices: Production-Ready Implementation Guide](https://inventivehq.com/blog/webhook-best-practices-guide) - Queue-first pattern, idempotency
- [HMAC Webhook Signature Verification](https://hookdeck.com/webhooks/guides/how-to-implement-sha256-webhook-signature-verification) - Signature verification patterns
- [Webhook Idempotency Guide](https://hookdeck.com/webhooks/guides/implement-webhook-idempotency) - Duplicate handling

### Tertiary (LOW confidence)
- [Upstash QStash for Vercel](https://upstash.com/blog/webhook-qstash) - Alternative if `after()` proves insufficient
- WebSearch results for API key vs HMAC comparison - Marked for validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against existing codebase and official docs
- Architecture patterns: HIGH - Based on Next.js 15 `after()` docs and existing codebase
- Authentication: HIGH - Node.js crypto is standard, patterns match Stripe/GitHub
- Idempotency: HIGH - PostgreSQL unique constraints are well-documented

**Research date:** 2026-01-22
**Valid until:** 60 days (webhook patterns are stable)

---

## Gap Analysis: Requirements Review

| Requirement | Research Finding | Recommendation |
|-------------|------------------|----------------|
| INGST-01: Webhook endpoint | Use App Router Route Handler at `/api/webhooks/signals` | Implement with `after()` pattern |
| INGST-02: Authentication | Support both API key and HMAC signature | Dual auth with workspace-scoped keys |
| INGST-03: Queue-first pattern | Use Next.js 15 `after()` function | Return 200 < 100ms, process async |
| Idempotency | Use unique constraint on (workspaceId, source, sourceRef) | Database handles duplicates |
| 5-second response | `after()` enables immediate response | Verified with Next.js docs |

**All requirements can be met with existing stack. No gaps or blockers identified.**
