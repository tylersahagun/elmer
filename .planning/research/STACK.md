# Stack Research

**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Auth.js (NextAuth v5) | 5.x | Authentication framework | Native Next.js 16 integration, supports OAuth + credentials, session management built-in |
| bcryptjs | 3.x | Password hashing | Battle-tested, async hashing, no native deps (works in Vercel Edge) |
| Resend | 4.x | Transactional email | Modern API, excellent deliverability, good free tier (100 emails/day) |
| React Email | 3.x | Email templates | JSX-based templates, works with Resend, type-safe |
| nanoid | 5.x | Token generation | Already in codebase, URL-safe tokens for magic links |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @auth/drizzle-adapter | 1.x | Auth.js + Drizzle integration | Store users/sessions in existing Postgres |
| jose | 5.x | JWT operations | Magic link tokens, secure invite links |
| zod | 3.x | Input validation | Already used in Next.js, validate auth inputs |
| iron-session | 8.x | Alternative session | Only if Auth.js doesn't fit (not recommended) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| react-email | Email preview | Dev server to preview email templates locally |
| Drizzle Studio | Database inspection | Already available via `npm run db:studio` |

## Installation

```bash
# Core auth
npm install next-auth@beta @auth/drizzle-adapter

# Password hashing (Edge-compatible)
npm install bcryptjs
npm install -D @types/bcryptjs

# Email
npm install resend react-email @react-email/components

# Token generation (already have nanoid)
npm install jose
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Auth.js v5 | Lucia Auth | If you need more control over session storage |
| Auth.js v5 | Clerk | If you want managed auth (adds vendor dependency) |
| Resend | SendGrid | If you already have SendGrid account |
| Resend | Postmark | If you need higher volume (better for transactional) |
| bcryptjs | argon2 | If not deploying to Edge (argon2 needs native bindings) |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| bcrypt (native) | Requires native compilation, fails on Vercel Edge | bcryptjs (pure JS) |
| Firebase Auth | Vendor lock-in, complex for simple use case | Auth.js |
| Passport.js | Old patterns, not designed for React Server Components | Auth.js |
| Custom JWT auth | Security footguns, maintenance burden | Auth.js with JWT sessions |
| Magic link for all auth | Adds email dependency for every login | Only for invites, use password for regular login |

## Stack Patterns by Variant

**If deploying to Vercel Edge:**
- Use bcryptjs (pure JS implementation)
- Use Auth.js with JWT strategy (not database sessions)
- Use Neon serverless driver (already configured)

**If deploying to Node.js (self-hosted):**
- Can use bcrypt native for better performance
- Can use database sessions for easier revocation
- Standard pg driver works fine

## Auth.js Configuration Pattern

```typescript
// src/auth.ts
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validate and return user
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string
      return session
    },
  },
})
```

## Email Provider Configuration

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Usage
await resend.emails.send({
  from: 'elmer <noreply@yourdomain.com>',
  to: email,
  subject: 'Workspace Invitation',
  react: InviteEmailTemplate({ inviterName, workspaceName, inviteLink }),
})
```

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next-auth@5.x | Next.js 16 | Requires Next.js 14+ |
| @auth/drizzle-adapter@1.x | drizzle-orm@0.45+ | Must match Drizzle version |
| bcryptjs@3.x | All Node.js | Pure JS, no native deps |
| resend@4.x | Node.js 18+ | Modern fetch API |

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Auth.js
AUTH_SECRET= # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000 # or production URL

# Email
RESEND_API_KEY=

# Existing (unchanged)
DATABASE_URL=
ANTHROPIC_API_KEY=
```

## Sources

- Auth.js v5 documentation (authjs.dev)
- Next.js 16 authentication patterns (nextjs.org/docs)
- Resend documentation (resend.com/docs)
- Drizzle ORM adapter docs (orm.drizzle.team)
- bcryptjs npm package (pure JS bcrypt)

---
*Stack research for: Multi-user authentication and workspace collaboration*
*Researched: 2026-01-21*

---

# Stack Research: Signal Ingestion and Intelligence System

**Domain:** Signal ingestion, classification, clustering, and synthesis
**Researched:** 2026-01-22
**Research Type:** Ecosystem (Stack dimension for signal ingestion)
**Confidence:** HIGH (verified against existing codebase and official documentation)

## Executive Summary

The existing Elmer stack (Next.js 16, React 19, PostgreSQL/Neon, Drizzle ORM 0.45, Anthropic SDK) is **well-suited** for signal ingestion with minimal additions. The key additions are:

1. **OpenAI SDK** for embeddings (Anthropic does not offer embedding models)
2. **pgvector extension** on Neon (already supported, just needs enabling)
3. **Drizzle vector type** (built into drizzle-orm 0.45, already installed)

No new infrastructure required. The existing background job system (ExecutionWorker) handles async processing.

---

## Recommended Stack Additions

### Embedding Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **openai** | ^4.76.0 | Embedding generation | Anthropic does not offer embedding models. OpenAI's `text-embedding-3-small` is cost-effective at $0.02/1M tokens with 1536 dimensions. |

**Rationale:** Anthropic explicitly recommends Voyage AI or OpenAI for embeddings. OpenAI wins on:
- **Cost:** $0.02/1M tokens vs Voyage's $0.06-0.18/1M tokens
- **Simplicity:** Single SDK addition, well-documented
- **Integration:** Native support in pgvector-node and Drizzle

**Alternative Considered:** Voyage AI (voyage-3-lite at $0.06/1M)
- Better retrieval accuracy for RAG (+3-4% on benchmarks)
- Recommended by Anthropic
- **Why not:** Adds another SDK/billing relationship. OpenAI is sufficient for signal clustering where perfect retrieval isn't critical.

```typescript
// Installation
npm install openai

// Usage pattern
import OpenAI from 'openai';

const openai = new OpenAI();

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536, // Can reduce to 512 or 256 for cost savings
  });
  return response.data[0].embedding;
}
```

### Vector Storage (No new package needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **pgvector** | (Neon extension) | Vector similarity search | Already available on Neon, just needs `CREATE EXTENSION vector;` |
| **drizzle-orm** | 0.45.1 (existing) | Vector column type | Built-in `vector()` type since v0.31.0, includes distance functions |

**Rationale:** The existing stack already supports vectors:
- Neon includes pgvector by default
- Drizzle 0.45 has native `vector()` column type
- No additional packages needed

```typescript
// Schema addition (Drizzle)
import { pgTable, text, vector, index } from 'drizzle-orm/pg-core';

export const signals = pgTable('signals', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
}, (table) => [
  index('signals_embedding_idx')
    .using('hnsw', table.embedding.op('vector_cosine_ops'))
]);

// Similarity query
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

const similarity = sql<number>`1 - (${cosineDistance(signals.embedding, queryEmbedding)})`;
const similar = await db.select()
  .from(signals)
  .where(gt(similarity, 0.7))
  .orderBy(desc(similarity))
  .limit(10);
```

### Webhook Handling (No new package needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js App Router** | 16.1.3 (existing) | Webhook endpoints | Native `request.formData()` and raw body access via `request.text()` |

**Rationale:** Next.js 16 App Router handles webhooks natively:
- `app/api/webhooks/[source]/route.ts` pattern
- Raw body access for signature verification
- No formidable/multer needed for JSON webhooks

```typescript
// app/api/webhooks/[source]/route.ts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params;
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature');

  // Verify signature (source-specific)
  if (!verifySignature(rawBody, signature, source)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  // Queue for processing via existing job system
  await createJob({ type: 'process_signal', input: { source, payload } });

  return new Response('OK', { status: 200 });
}
```

### File Upload Processing (No new package needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js App Router** | 16.1.3 (existing) | File uploads | Native `request.formData()` API handles multipart |

**Rationale:** Next.js 16 has native FormData support:
- `await request.formData()` for multipart handling
- No formidable/multer needed
- File objects can be read as text/buffer directly

```typescript
// app/api/signals/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const content = await file.text();
  const workspaceId = formData.get('workspaceId') as string;

  // Create inbox item and queue processing
  await createInboxItem({
    workspaceId,
    type: file.type.includes('csv') ? 'feedback' : 'document',
    source: 'upload',
    title: file.name,
    rawContent: content,
  });

  return Response.json({ success: true });
}
```

### Text Classification (No new package needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@anthropic-ai/sdk** | 0.71.2 (existing) | Classification & extraction | Claude excels at zero-shot classification. Already integrated. |

**Rationale:** The existing Anthropic integration handles classification:
- Claude 3.5 Haiku for fast, low-cost classification ($0.25/1M input tokens)
- Claude Sonnet 4 for complex extraction (existing pattern in `/api/inbox/[id]/process`)
- Zero-shot classification eliminates training/fine-tuning overhead

```typescript
// Classification with existing Anthropic SDK
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022', // Fast, cheap for classification
  max_tokens: 256,
  system: `Classify this feedback signal into ONE category:
- feature_request
- bug_report
- usability_issue
- praise
- churn_risk

Respond with JSON: { "category": "...", "confidence": 0.0-1.0 }`,
  messages: [{ role: 'user', content: signalContent }],
});
```

---

## What NOT to Add (and Why)

### DO NOT Add: LangChain

**Why not:**
- Overhead for simple embedding + retrieval patterns
- The existing Anthropic SDK + OpenAI SDK handle all needed functionality
- LangChain adds complexity without value for this use case

### DO NOT Add: Dedicated Vector Database (Pinecone, Weaviate, Qdrant)

**Why not:**
- pgvector on Neon is sufficient for <1M signals
- Keeps data co-located (no sync issues)
- Existing Drizzle schema patterns work
- Neon pgvector supports HNSW indexes for fast similarity search

### DO NOT Add: Svix for Webhooks

**Why not:**
- Adds infrastructure dependency for outbound webhooks
- For inbound webhooks, Next.js handles signature verification natively
- Only consider if you need guaranteed webhook delivery to external systems later

### DO NOT Add: Formidable/Multer for File Uploads

**Why not:**
- Next.js 16 App Router has native `request.formData()` support
- No need for external middleware
- Cleaner code with native Web APIs

### DO NOT Add: NLP Libraries (compromise, natural, nlp.js)

**Why not:**
- Claude handles NLP tasks (extraction, classification, clustering hints) better
- These libraries add bundle size without matching LLM quality
- Keyword extraction is trivially done with Claude prompts

### DO NOT Add: Dedicated Clustering Library (hdbscan via Python)

**Why not:**
- Clustering can be done in SQL with pgvector similarity queries
- For initial implementation, similarity threshold + grouping is sufficient
- Can add Python microservice later if HDBSCAN becomes necessary

---

## Integration with Existing Stack

### Database Schema Extension

The existing `schema.ts` already has `inboxItems` with `extractedProblems` and `hypothesisMatches`. Add:

```typescript
// Add to existing schema.ts

// Vector column for signals (add to inboxItems or create signals table)
export const signals = pgTable('signals', {
  id: text('id').primaryKey(),
  inboxItemId: text('inbox_item_id').references(() => inboxItems.id, { onDelete: 'cascade' }),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),

  // Extracted content
  verbatim: text('verbatim').notNull(), // Direct quote
  interpretation: text('interpretation'), // AI interpretation

  // Classification
  category: text('category').$type<SignalCategory>().notNull(),
  severity: text('severity').$type<'critical' | 'high' | 'medium' | 'low'>(),
  frequency: text('frequency').$type<'widespread' | 'common' | 'occasional' | 'rare'>(),

  // Vector embedding for similarity
  embedding: vector('embedding', { dimensions: 1536 }),

  // Clustering
  clusterId: text('cluster_id'),
  clusterLabel: text('cluster_label'),

  // Provenance
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  documentId: text('document_id').references(() => documents.id, { onDelete: 'set null' }),

  metadata: jsonb('metadata').$type<SignalMetadata>(),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('signals_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
  index('signals_workspace_idx').on(table.workspaceId),
  index('signals_cluster_idx').on(table.clusterId),
]);

export type SignalCategory =
  | 'feature_request'
  | 'bug_report'
  | 'usability_issue'
  | 'performance_complaint'
  | 'praise'
  | 'churn_risk'
  | 'support_request';
```

### Job System Integration

Add new job types to the existing `JobType` enum:

```typescript
export type JobType =
  | /* existing types */
  | 'process_signal'      // Extract, classify, embed a signal
  | 'cluster_signals'     // Re-cluster signals for a workspace
  | 'synthesize_cluster'; // Generate summary for a signal cluster
```

### Environment Variables

Add to `.env`:

```bash
# OpenAI (for embeddings only)
OPENAI_API_KEY=sk-...

# Optional: Embedding configuration
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

---

## Cost Estimation

| Operation | Model | Cost | Volume Estimate | Monthly Cost |
|-----------|-------|------|-----------------|--------------|
| Embedding | text-embedding-3-small | $0.02/1M tokens | 100K signals @ 200 tokens avg = 20M tokens | $0.40 |
| Classification | Claude 3.5 Haiku | $0.25/1M input | 100K signals @ 200 tokens = 20M tokens | $5.00 |
| Extraction | Claude Sonnet 4 | $3/1M input | 10K complex signals @ 500 tokens = 5M tokens | $15.00 |
| **Total** | | | | **~$20/month** |

---

## Installation Commands

```bash
# Only new dependency
npm install openai

# Enable pgvector extension (run once per database)
# Via Drizzle migration or direct SQL:
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Sources

### Verified (HIGH confidence)
- [Drizzle ORM Vector Similarity Search Guide](https://orm.drizzle.team/docs/guides/vector-similarity-search) - Schema patterns, distance functions
- [Neon pgvector Documentation](https://neon.com/docs/extensions/pgvector) - Extension availability, HNSW indexes
- [OpenAI Embeddings Documentation](https://openai.com/index/new-embedding-models-and-api-updates/) - Pricing, dimensions
- [Anthropic Embeddings Guidance](https://docs.claude.com/en/docs/build-with-claude/embeddings) - Confirms no native embedding model

### Existing Codebase (verified)
- `/orchestrator/package.json` - Current versions: drizzle-orm 0.45.1, @anthropic-ai/sdk 0.71.2
- `/orchestrator/src/lib/db/schema.ts` - Existing inboxItems, memoryEntries patterns
- `/orchestrator/src/lib/execution/providers.ts` - AnthropicProvider pattern
- `/orchestrator/src/app/api/inbox/[id]/process/route.ts` - Existing extraction pattern

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Embedding approach | HIGH | Verified Anthropic has no embedding model, OpenAI pricing confirmed |
| pgvector on Neon | HIGH | Official Neon documentation confirms support |
| Drizzle vector type | HIGH | Verified in existing drizzle-orm 0.45 docs, built-in since 0.31 |
| File upload approach | HIGH | Next.js 16 native FormData verified in existing codebase patterns |
| Classification approach | HIGH | Existing implementation in codebase validates pattern |
| Clustering approach | MEDIUM | SQL-based clustering is simpler; may need HDBSCAN later for complex cases |

---
*Stack research for: Signal ingestion, classification, clustering, and synthesis*
*Researched: 2026-01-22*
