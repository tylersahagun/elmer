# Project Research Summary

**Project:** v1.1 Signals System - Signal Ingestion and Intelligence
**Domain:** Product feedback aggregation with AI classification and clustering
**Researched:** 2026-01-22
**Confidence:** HIGH

## Executive Summary

The v1.1 Signals System adds user feedback ingestion, classification, and provenance tracking to Elmer's existing PM orchestration platform. Research shows this is a well-documented domain with established patterns: async webhook ingestion, LLM-based extraction, embedding-based clustering, and lineage tracking. The key insight is that Elmer's existing stack (Next.js 16, Drizzle ORM, Anthropic SDK, background job system) is well-suited for this addition with minimal new dependencies—only OpenAI SDK for embeddings and pgvector extension for similarity search.

The recommended approach is a three-layer architecture: (1) Ingestion Layer for fast webhook ACK with queue-first processing, (2) Intelligence Layer for extraction/classification/clustering using existing job workers, and (3) Integration Layer for signal-to-project provenance via many-to-many junction tables. This preserves raw content while building structured intelligence, ensuring "why we built this" remains answerable.

The critical risk is synchronous webhook processing leading to data loss. Prevention requires queue-first architecture with fast ACK (return 200 within 5 seconds), async processing via existing job system, and idempotent handling for duplicate/out-of-order webhooks. Secondary risks include classification bias toward popular projects, clustering that produces unusable groups, and provenance links that rot over time. All are preventable with stratified evaluation, domain-tuned embeddings, and immutable link records.

## Key Findings

### Recommended Stack

The existing Elmer stack handles signal ingestion exceptionally well. Only two additions are needed: OpenAI SDK for embeddings (Anthropic does not offer embedding models) and pgvector extension on Neon (already supported, just needs enabling). The existing background job system (ExecutionWorker), Anthropic SDK for classification, and Drizzle ORM for schema all work without modification.

**Core technologies:**
- **OpenAI SDK (text-embedding-3-small)**: Embedding generation at $0.02/1M tokens—Anthropic recommends OpenAI or Voyage AI since they don't offer embeddings. OpenAI wins on cost and simplicity.
- **pgvector on Neon**: Vector similarity search for clustering—already available on Neon, just requires `CREATE EXTENSION vector;`. Drizzle 0.45 has native vector type support.
- **Next.js 16 App Router**: Webhook and file upload handling—native `request.formData()` and `request.text()` eliminate need for multer/formidable. Handles multipart natively.
- **Anthropic SDK (Claude 3.5 Haiku + Sonnet 4)**: Classification and extraction—existing integration. Haiku for fast classification ($0.25/1M), Sonnet 4 for complex extraction (existing pattern).
- **Drizzle ORM + Neon Postgres**: Schema extensions for signals, embeddings, clusters, and provenance junction tables—existing database and ORM.

**What NOT to add:**
- No LangChain (overhead for simple patterns)
- No dedicated vector DB like Pinecone (pgvector sufficient for <1M signals)
- No Svix for webhooks (Next.js handles signature verification)
- No formidable/multer (Next.js 16 native FormData)
- No NLP libraries (Claude handles extraction better)

### Expected Features

Signal ingestion requires a multi-source input layer with fast acknowledgment and async processing. Experts build this as: webhook endpoints for integration partners, file upload for CSV/transcript batch import, paste/input for ad-hoc signals, and video link transcription via external API.

**Must have (table stakes):**
- **Webhook ingestion** — External tools (Ask Elephant, Intercom, custom integrations) post signals. Users expect this to "just work" without delay.
- **File upload (CSV, text)** — PMs have feedback spreadsheets or call transcripts to import. Batch ingestion is essential.
- **Manual paste/input** — Not all feedback comes via API. PMs need to manually add signals from email, Slack, etc.
- **Signal extraction (LLM)** — Verbatim quotes, interpretation, severity, frequency. Structured data enables clustering and synthesis.
- **Project classification** — Route signals to existing projects or flag as "new initiative." Auto-routing reduces triage burden.
- **Signal clustering** — Group related signals by semantic similarity. Enables pattern detection and synthesis.
- **Provenance tracking** — Every PRD decision should trace back to user evidence. Many-to-many signal-project links with metadata.

**Should have (competitive):**
- **Video link ingestion** — YouTube/Loom links with transcript extraction. Emerging pattern in PM tools.
- **Cluster synthesis** — Auto-generate initiative proposals from signal clusters. Differentiator over simple aggregation tools.
- **Confidence scores** — Classification confidence determines auto-route vs human triage. Reduces inbox backlog.
- **Signal deduplication** — Embedding-based similarity to detect semantically identical signals, not just exact matches.

**Defer (v2+):**
- **Real-time webhook monitoring UI** — Dashboard showing webhook delivery status. Nice to have but not essential for MVP.
- **Advanced clustering algorithms** — HDBSCAN via Python microservice. SQL-based clustering sufficient for v1.
- **Signal export API** — External tools fetching signals. No current requirement.
- **Custom extraction templates** — User-defined extraction schemas. One-size-fits-all works for v1.

### Architecture Approach

The signals system integrates with Elmer as three distinct layers built on existing infrastructure. Layer 1 (Ingestion) uses webhook endpoints and file upload routes to create `inbox_items` with raw content, then queues extraction jobs. Layer 2 (Intelligence) runs background jobs for extraction, embedding, classification, and clustering using existing `JobWorker` and `AgentExecutor` patterns. Layer 3 (Integration) links signals to projects via `project_signals` junction table with provenance metadata, enabling PRD generation with cited evidence.

**Major components:**
1. **Signal Ingestion Pipeline** — Webhook endpoints (`/api/webhooks/[source]`) validate signatures, store raw payload to `inbox_items`, queue `extract_signal` job, return 200 within seconds. File upload routes handle FormData natively, create inbox items, queue processing. Fast ACK pattern prevents data loss.
2. **Signal Intelligence Services** — Extract service parses raw content into structured `signals` table (verbatim, interpretation, severity, frequency). Classify service generates embeddings, compares to project embeddings, suggests routing with confidence score. Cluster service runs pgvector similarity search, groups signals by threshold (>0.85), creates or joins `signal_clusters`.
3. **Provenance Junction Layer** — `project_signals` many-to-many table links signals to projects with metadata: `linkType` (auto/manual/synthesis), `linkReason`, `linkedBy`, `influencedPrd` flag, `prdSection`. Immutable records enable "why we built this" queries. PRD generation prompts include linked signals as evidence.
4. **Embedding Storage** — `signal_embeddings` table stores vectors (1536 dimensions from OpenAI ada-002). pgvector HNSW index enables fast similarity search. Drizzle ORM native vector type with `cosineDistance()` helper.
5. **Background Job Extensions** — New job types: `extract_signal`, `embed_signal`, `classify_signal`, `cluster_signals`, `synthesize_cluster`. Existing `JobWorker` handles execution. Separate queue priority for signal jobs to prevent contention with PRD generation.

### Critical Pitfalls

Research identified 21 pitfalls across critical, moderate, and minor categories. The top 5 by impact:

1. **Synchronous Webhook Processing (Pitfall 8)** — Processing signals in-request causes data loss when backend is slow or fails. Webhook providers retry limited times then abandon events. Prevention: Queue-first architecture—validate, store raw, return 200 <5 seconds. Process async via job queue. Store webhook delivery IDs for idempotency.

2. **Out-of-Order and Duplicate Events (Pitfall 9)** — Webhooks arrive multiple times or out of sequence. Naive processing creates duplicates or state corruption (update before create). Prevention: Idempotency keys (store processed webhook IDs with 7-30 day TTL), conditional upserts with timestamp checks, content hashing for payloads without IDs.

3. **Provenance Links That Rot (Pitfall 10)** — Signal-to-project links break when projects merge, archive, or delete. "Why we built this" becomes unanswerable. Prevention: Immutable junction table with soft delete, never delete provenance records (mark `unlinked_at`), bi-directional linking, periodic integrity checks.

4. **Classification Bias (Pitfall 11)** — Training on imbalanced data (90% to 3 popular projects) causes model to route everything to those projects, never surfaces new initiatives. Prevention: Stratified evaluation (per-class precision/recall), confidence thresholds (>70% for auto-route), separate "new initiative" detection, active learning from human corrections.

5. **Clustering That Produces Unusable Groups (Pitfall 12)** — One giant cluster or thousands of micro-clusters, neither actionable. Prevention: Domain-specific embeddings (tune for PM feedback), preprocessing pipeline (normalize, strip markdown), hierarchical clustering, human-in-the-loop threshold tuning, multiple algorithms (compare silhouette scores).

## Implications for Roadmap

Based on research, signals system naturally divides into three phases aligned with the architectural layers. Dependencies flow bottom-up: ingestion foundation enables intelligence processing, which enables project integration.

### Phase 1: Signal Ingestion Foundation
**Rationale:** Must establish data flow before intelligence. Webhook endpoints and schema are prerequisites for extraction/classification. Fast ACK pattern prevents data loss (Pitfall 8). Multi-source input (webhook, upload, paste) addresses table stakes features.

**Delivers:**
- `signals`, `signal_embeddings`, `signal_clusters`, `project_signals` schema (Drizzle migrations)
- Enhanced webhook endpoint (`/api/webhooks/[source]`) with signature validation, queue-first processing
- File upload endpoint (`/api/signals/upload`) with FormData handling
- Manual signal creation UI (paste/input form)
- Basic signal CRUD queries and permissions (workspace-scoped)

**Addresses:**
- Webhook ingestion (table stakes)
- File upload (table stakes)
- Manual input (table stakes)
- Pitfall 8 (synchronous processing) via queue-first
- Pitfall 16 (webhook security) via HMAC validation

**Avoids:**
- Synchronous processing (queue immediately)
- Format detection issues (content sniffing, preview)
- Permission confusion (explicit signal permissions documented)

**Research flag:** Standard patterns, no deeper research needed. Webhook reliability extensively documented.

---

### Phase 2: Signal Intelligence (Extract, Classify, Cluster)
**Rationale:** With ingestion stable, build intelligence layer. Extraction creates structured data for clustering. Classification routes signals to projects. Clustering groups related signals for synthesis. All leverage existing job system and LLM integration.

**Delivers:**
- `extract_signal` job type (LLM extraction to structured fields)
- `embed_signal` job type (OpenAI text-embedding-3-small)
- `classify_signal` job type (project matching via embedding similarity + LLM refinement)
- `cluster_signals` job type (pgvector similarity search, auto-grouping)
- pgvector extension enabled, HNSW index on embeddings
- OpenAI SDK integration for embeddings
- Classification confidence scoring (auto-route >85%, triage <85%)
- Signal inbox UI with triage workflow

**Uses:**
- OpenAI SDK (embeddings)
- pgvector extension (similarity search)
- Existing Anthropic SDK (extraction, classification LLM)
- Existing JobWorker + AgentExecutor (job processing)

**Implements:**
- Signal Intelligence Services (layer 2 of architecture)
- Embedding Storage component
- Background Job Extensions (new job types)

**Avoids:**
- Pitfall 11 (classification bias) via stratified eval, confidence thresholds
- Pitfall 12 (poor clustering) via domain embeddings, silhouette monitoring
- Pitfall 13 (context loss) via preserving raw content, multi-quote extraction
- Pitfall 14 (triage backlog) via auto-route high-confidence, prioritized inbox

**Research flag:** Clustering needs experimentation for domain-specific tuning. May need `/gsd:research-phase` for "optimal similarity threshold" and "embedding model selection" if initial results poor.

---

### Phase 3: Signal-Project Integration & Provenance
**Rationale:** Intelligence layer provides classified signals. Now link to projects with provenance tracking. Junction table enables many-to-many (one signal informs multiple projects). PRD generation includes cited evidence. Completes "every decision traces to user evidence" value prop.

**Delivers:**
- `project_signals` junction table population (auto-link via classification, manual link API)
- Signal linking UI (drag-drop, batch actions)
- Project signals view (list signals linked to project)
- Enhanced PRD generation prompt (includes linked signals with provenance)
- Provenance query API (`/api/projects/[id]/provenance`)
- Cluster synthesis feature (`/synthesize` command or button)
- "Create project from cluster" workflow
- Archival policy (signals >12 months to cold storage)

**Implements:**
- Provenance Junction Layer (layer 3 of architecture)
- Signal-Project Integration component

**Avoids:**
- Pitfall 10 (provenance rot) via immutable junction table, soft delete, integrity checks
- Pitfall 19 (inbox semantic confusion) via clear terminology, visual differentiation
- Pitfall 20 (job contention) via separate queue for signal jobs
- Pitfall 21 (permission mismatch) via explicit signal permissions per role

**Research flag:** Standard provenance patterns, no deeper research needed unless custom lineage UI required.

---

### Phase Ordering Rationale

- **Bottom-up dependency flow:** Can't extract without ingestion, can't classify without extraction, can't link without classification.
- **Risk mitigation sequencing:** Pitfall 8 (data loss) addressed first via queue-first pattern before building intelligence on top.
- **Incremental value delivery:** Phase 1 delivers "signals exist in system," Phase 2 delivers "signals are intelligently organized," Phase 3 delivers "signals inform decisions."
- **Integration with existing system:** Phases align with existing architecture layers (data, services, integration) for clean codebase structure.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Clustering):** Domain-specific embedding tuning may require experimentation. If initial clustering produces poor silhouette scores (<0.3) or unusable groups, trigger `/gsd:research-phase` for "embedding model comparison" and "similarity threshold optimization."

Phases with standard patterns (skip research-phase):
- **Phase 1 (Ingestion):** Webhook reliability patterns well-documented. Queue-first, idempotency, signature validation all have canonical implementations.
- **Phase 3 (Provenance):** Data lineage patterns standardized. Junction table with soft delete, integrity checks, bi-directional linking well understood.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing Elmer stack verified (drizzle-orm 0.45.1, Next.js 16, Anthropic SDK). OpenAI embeddings pricing confirmed. pgvector on Neon documented. |
| Features | HIGH | Table stakes features align with competitor analysis (Notion, Linear, Figma invite patterns). Multi-source ingestion is industry standard. |
| Architecture | HIGH | Three-layer pattern (ingest → intelligence → integration) matches established feedback systems. Existing job system handles async processing. |
| Pitfalls | HIGH | Webhook reliability pitfalls extensively documented (Hookdeck, WorkOS, Shortcut). Classification bias and clustering issues are standard ML production problems. |

**Overall confidence:** HIGH

### Gaps to Address

Research was comprehensive, but three areas need validation during implementation:

- **Embedding model selection:** OpenAI text-embedding-3-small recommended, but domain-specific performance unknown. Monitor clustering silhouette scores after Phase 2. If <0.3, consider Voyage AI (better for PM/product feedback) or fine-tuning.

- **Classification confidence threshold:** 85% suggested for auto-route vs triage, but optimal threshold depends on Elmer's specific project complexity and signal diversity. Instrument both precision and triage queue depth after Phase 2 launch. Adjust threshold if triage backlog grows or false positives high.

- **Elmer-specific job queue contention:** Assumption that signal processing won't starve PRD generation jobs needs validation. Monitor queue depth and job latency after Phase 2. If contention detected, implement separate queues or priority levels (recommendation already in Pitfall 20 mitigation).

## Sources

### Primary (HIGH confidence)
- **Drizzle ORM Vector Similarity Search Guide** (orm.drizzle.team/docs/guides/vector-similarity-search) — Schema patterns, distance functions, HNSW index usage. Confirms native vector type in 0.45.
- **Neon pgvector Documentation** (neon.com/docs/extensions/pgvector) — Extension availability, performance characteristics, version compatibility.
- **OpenAI Embeddings Documentation** (openai.com/index/new-embedding-models-and-api-updates/) — Pricing ($0.02/1M tokens), dimensions (1536), use cases.
- **Anthropic Embeddings Guidance** (docs.claude.com/en/docs/build-with-claude/embeddings) — Confirms no native embedding model, recommends OpenAI/Voyage AI.
- **Next.js 16 App Router Documentation** (nextjs.org/docs) — Native FormData handling, webhook patterns, route handlers.

### Secondary (MEDIUM confidence)
- **Hookdeck: Webhooks at Scale** (hookdeck.com/blog/webhooks-at-scale) — Queue-first architecture, fast ACK pattern, idempotency strategies.
- **Shortcut: More Reliable Webhooks with Queues** (shortcut.com/blog/more-reliable-webhooks-with-queues) — Production webhook reliability patterns, retry logic.
- **WorkOS: Rethink Your Webhook Strategy** (workos.com/blog/why-you-should-rethink-your-webhook-strategy) — At-least-once delivery, out-of-order events, signature verification.
- **Monte Carlo: Data Lineage Guide** (montecarlodata.com/blog-data-lineage/) — Provenance tracking patterns, junction table design, integrity checks.
- **Atlan: Data Lineage Tracking** (atlan.com/know/data-lineage-tracking/) — Best practices for immutable provenance records, soft delete patterns.
- **Spotify Engineering: Recursive Embedding and Clustering** (engineering.atspotify.com/2023/12/recursive-embedding-and-clustering) — Hierarchical clustering, domain-specific embeddings, silhouette optimization.

### Tertiary (LOW confidence)
- **Text Clustering with LLM Embeddings** (arxiv.org/html/2403.15112v1) — Academic paper on clustering with modern embeddings. Needs empirical validation in production.
- **Aitude: Sentence Transformer Mistakes** (aitude.com/top-5-sentence-transformer-embedding-mistakes) — Common pitfalls in embedding usage. Blog source, not peer-reviewed.

### Existing Codebase (verified)
- `/orchestrator/package.json` — Confirmed drizzle-orm 0.45.1, @anthropic-ai/sdk 0.71.2, Next.js 16.1.3.
- `/orchestrator/src/lib/db/schema.ts` — Existing inboxItems, memoryEntries patterns inform signals schema design.
- `/orchestrator/src/lib/execution/providers.ts` — AnthropicProvider pattern reusable for signal extraction.
- `/orchestrator/src/app/api/inbox/[id]/process/route.ts` — Existing extraction pattern validates LLM-based signal extraction approach.

---
*Research completed: 2026-01-22*
*Ready for roadmap: yes*
