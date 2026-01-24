# Pitfalls Research

**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Insecure Password Storage

**What goes wrong:**
Passwords stored in plain text or with weak hashing. Database breach exposes all user credentials.

**Why it happens:**
Developers use MD5/SHA1 for speed, or store passwords directly for "simplicity."

**How to avoid:**
- Use bcryptjs with cost factor 10+ (auto-salted)
- Never store plain passwords, even temporarily
- Use Auth.js Credentials provider which handles hashing patterns

**Warning signs:**
- Password column is varchar without "hash" in name
- No hashing library in dependencies
- Password appears readable in database

**Phase to address:**
Phase 1: Schema & Auth Foundation

---

### Pitfall 2: Session Fixation / Hijacking

**What goes wrong:**
Session tokens predictable or stolen via XSS, allowing attackers to impersonate users.

**Why it happens:**
Custom session implementation without security expertise, cookies without proper flags.

**How to avoid:**
- Use Auth.js (handles session security automatically)
- Set cookies: `httpOnly: true`, `secure: true`, `sameSite: 'lax'`
- Regenerate session ID after authentication
- Use JWT with short expiration + refresh pattern

**Warning signs:**
- Session tokens are sequential or timestamp-based
- Cookies accessible via JavaScript (no httpOnly)
- No CSRF protection on auth forms

**Phase to address:**
Phase 2: User Registration & Phase 3: Session Management

---

### Pitfall 3: Invitation Link Security Holes

**What goes wrong:**
Invite tokens guessable, never expire, or reusable. Unauthorized users gain workspace access.

**Why it happens:**
Using UUIDs or timestamps as tokens, no expiration logic, not marking tokens as used.

**How to avoid:**
- Generate cryptographically secure tokens (nanoid or crypto.randomBytes)
- 7-day maximum expiration
- One-time use: mark as accepted immediately
- Store token hash, not plain token (prevents database leak)

**Warning signs:**
- Token is UUID or auto-increment ID
- No `expiresAt` column in invitations table
- Token can be used multiple times

**Phase to address:**
Phase 5: Invitation System

---

### Pitfall 4: Broken Access Control (BOLA/IDOR)

**What goes wrong:**
Users access resources by guessing IDs without ownership verification. User A can see User B's workspaces.

**Why it happens:**
API routes check authentication but not authorization. Assuming "logged in = has access."

**How to avoid:**
- ALWAYS check workspace membership before returning data
- Use server-side session for user ID (never trust client)
- Implement `requireWorkspaceAccess()` helper used everywhere
- Write tests for cross-user access attempts

**Warning signs:**
- API routes only check `if (!session) return 401`
- User ID comes from request body, not session
- No workspace membership queries in API routes

**Phase to address:**
Phase 6: Role Enforcement

---

### Pitfall 5: Role Escalation

**What goes wrong:**
Users promote themselves to admin, or members modify admin-only settings.

**Why it happens:**
Role stored in client state and trusted, or role checks only in UI.

**How to avoid:**
- Store role in database, never in JWT claims (mutable)
- Check role server-side on every privileged operation
- Prevent users from modifying their own role
- Only admins can invite new admins

**Warning signs:**
- Role stored in localStorage or JWT
- No role parameter in API permission checks
- Users can call `/api/members/:id` with role in body

**Phase to address:**
Phase 6: Role Enforcement

---

### Pitfall 6: Incomplete Data Migration

**What goes wrong:**
Existing workspaces/projects orphaned after auth launch. Users can't access their own data.

**Why it happens:**
Migration script misses edge cases, runs partially, or isn't idempotent.

**How to avoid:**
- Migration assigns ALL unowned workspaces to first user
- Run migration in transaction (all-or-nothing)
- Make migration idempotent (safe to run multiple times)
- Test migration on production data copy first

**Warning signs:**
- Some workspaces have `ownerId = null` after migration
- Projects visible before auth, invisible after
- Migration fails halfway, leaves partial state

**Phase to address:**
Phase 8: Data Migration

---

### Pitfall 7: Email Deliverability Issues

**What goes wrong:**
Invite emails land in spam, or never arrive. Users can't join workspaces.

**Why it happens:**
Sending from unverified domain, no SPF/DKIM, poor sender reputation.

**How to avoid:**
- Use reputable provider (Resend, SendGrid, Postmark)
- Verify domain with SPF, DKIM, DMARC records
- Use dedicated subdomain for transactional email (mail.yourdomain.com)
- Include unsubscribe link (even for transactional)
- Test with mail-tester.com before launch

**Warning signs:**
- Emails arrive in spam folder during testing
- "From" address is noreply@resend.dev (not your domain)
- No SPF record on domain DNS

**Phase to address:**
Phase 5: Invitation System

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip email verification | Faster signup flow | Fake accounts, spam | MVP only, add in v1.1 |
| Store role in JWT | Fewer DB queries | Role changes require re-login | Never for mutable roles |
| No activity logging | Faster development | No audit trail, compliance issues | Never for team products |
| Single-table inheritance (users + admins) | Simpler schema | Query complexity, null columns | Acceptable with good indexes |
| Soft-delete invitations | Keep history | Table bloat | Acceptable with cleanup job |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google OAuth | Hardcoding redirect URI | Use `AUTH_URL` env var, set in Google Console |
| Resend | Using test API key in prod | Separate API keys per environment |
| Resend | No domain verification | Verify domain before launch, takes 24-48h |
| Auth.js | Missing AUTH_SECRET | Generate with `openssl rand -base64 32` |
| Auth.js | Wrong callback URL | Must match exactly: `/api/auth/callback/google` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 membership queries | Slow page loads | Eager load memberships with workspaces | 50+ workspaces per user |
| Unindexed email lookup | Slow login | Add unique index on users.email | 10k+ users |
| Activity log table scan | Settings page timeout | Add index on (workspaceId, createdAt) | 100k+ activity events |
| JWT in every header | Large request payload | Store minimal claims, fetch full user | Many custom claims |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Leaking user emails in API | Privacy violation, spam | Only return emails to workspace members |
| Timing attack on login | Username enumeration | Same response time for valid/invalid emails |
| No rate limiting on invite | Spam victims | Limit to 10 invites per hour per user |
| Logging passwords | Credential exposure | Never log request bodies on auth routes |
| Invite token in URL query | Token in logs/referrer | Use POST with token in body for acceptance |

## UX Pitfalls

Common user experience mistakes in auth and collaboration.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Redirect loop on login error | User stuck, confused | Show error message on login page |
| No feedback during invite | User unsure if sent | Toast: "Invitation sent to sarah@..." |
| Generic "Access denied" | User doesn't know why | "You need admin access to invite members" |
| Logout clears workspace selection | User has to re-navigate | Remember last workspace in localStorage |
| Magic link expires silently | User clicks dead link | Show "This link has expired. Request a new one." |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Login form:** Often missing validation messages — verify email format, password length errors shown
- [ ] **OAuth flow:** Often missing error handling — verify failure redirects to login with error message
- [ ] **Invite email:** Often missing mobile preview — test email renders correctly on mobile
- [ ] **Role enforcement:** Often missing Viewer restrictions — verify viewers can't trigger jobs
- [ ] **Activity log:** Often missing pagination — verify 1000+ events don't crash page
- [ ] **Workspace switcher:** Often missing empty state — verify "Create first workspace" shown
- [ ] **Password reset:** Often missing token invalidation — verify token can't be reused
- [ ] **Session refresh:** Often missing silent refresh — verify session extends before expiry

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Plain text passwords | HIGH | Force password reset for all users, hash existing if possible |
| Leaked invite tokens | MEDIUM | Invalidate all pending invites, regenerate tokens |
| Broken access control | HIGH | Audit all API routes, add comprehensive tests |
| Failed migration | MEDIUM | Restore from backup, fix script, re-run |
| Email blacklisted | HIGH | New sending domain, warm up reputation (weeks) |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Insecure password storage | Phase 1: Schema & Auth Foundation | Verify bcryptjs in deps, passwordHash column |
| Session hijacking | Phase 3: Session Management | Verify httpOnly cookies in browser dev tools |
| Invite link holes | Phase 5: Invitation System | Test: expired link returns error, used link returns error |
| Broken access control | Phase 6: Role Enforcement | Test: User A cannot access User B's workspace |
| Role escalation | Phase 6: Role Enforcement | Test: Member cannot promote self to admin |
| Data migration failure | Phase 8: Data Migration | Verify all workspaces have owner after migration |
| Email deliverability | Phase 5: Invitation System | Test: email arrives in inbox (not spam) |

## Sources

- OWASP Authentication Cheat Sheet (owasp.org)
- OWASP Access Control Cheat Sheet (owasp.org)
- Auth.js security documentation (authjs.dev/security)
- Resend deliverability guide (resend.com/docs/deliverability)
- HaveIBeenPwned password breach analysis (haveibeenpwned.com)

---
*Pitfalls research for: Multi-user authentication and workspace collaboration*
*Researched: 2026-01-21*

---

# Pitfalls Research: Signal/Feedback Ingestion Systems

**Domain:** Signal ingestion and intelligence for PM orchestration
**Researched:** 2026-01-22
**Context:** Adding signals system to existing Elmer PM orchestration platform (v1.1 milestone)

---

## Critical Pitfalls

Mistakes that cause data loss, rewrites, or fundamental trust issues with the signals system.

### Pitfall 8: Synchronous Webhook Processing (Data Loss)

**What goes wrong:** Webhook endpoints process signals synchronously—extracting data, classifying, and storing in a single request cycle. When the backend is slow, down, or the processing fails mid-way, the webhook event is lost forever. Providers eventually abandon retries, creating permanent data gaps.

**Why it happens:** Developers want to "just get it working" by processing inline. The happy path works in development. Production load, database timeouts, or deployment windows expose the fragility.

**Consequences:**
- Lost user feedback with no recovery path
- Gaps in signal provenance chain
- Users lose trust when their feedback "disappears"
- No way to audit what was lost

**Warning signs:**
- Webhook handlers that do database writes + AI calls before returning 200
- Response times > 1 second for webhook endpoints
- Missing signals reported by users ("I submitted feedback but it's not there")
- No dead letter queue or failed event logging

**Prevention:**
- **Queue-first architecture**: Webhook handler does: validate signature, write raw payload to queue/staging table, return 200. All processing happens async.
- **Idempotent processing**: Store webhook delivery IDs to deduplicate (providers send at-least-once).
- **Failed event recovery**: Separate table for failed processing attempts with retry mechanism.
- **Acknowledgment window**: Return 200 within provider's timeout (typically 5-10 seconds).

**Detection:** Compare webhook provider's delivery logs against your received signals. Any delta is data loss.

**Phase to address:** Signal Ingestion (Layer 1) — webhook endpoint design.

**Sources:**
- [Hookdeck: Webhooks at Scale](https://hookdeck.com/blog/webhooks-at-scale)
- [Shortcut: More reliable webhooks with queues](https://www.shortcut.com/blog/more-reliable-webhooks-with-queues)
- [WorkOS: Why you should rethink your webhook strategy](https://workos.com/blog/why-you-should-rethink-your-webhook-strategy)

---

### Pitfall 9: Out-of-Order and Duplicate Event Processing

**What goes wrong:** Webhooks arrive out of order or are delivered multiple times. Processing them naively corrupts data state. Example: `signal.updated` arrives before `signal.created`, or the same signal is processed twice, creating duplicates.

**Why it happens:** Webhook delivery is at-least-once, not exactly-once. Network retries, provider failures, and your own acknowledgment timing cause duplicates. Parallel delivery causes ordering issues.

**Consequences:**
- Duplicate signals pollute clustering and synthesis
- State corruption when updates precede creates
- Incorrect signal counts skew severity/frequency metrics
- Audit trail shows impossible sequences

**Warning signs:**
- Signals with identical content appearing twice
- Database errors on unique constraint violations during processing
- Missing `created_at` or impossible timestamps
- Processing logs showing same webhook ID multiple times

**Prevention:**
- **Idempotency keys**: Store processed webhook IDs in a cache (Redis) or table with 7-30 day TTL. Check before processing.
- **Conditional upserts**: Use `ON CONFLICT` with timestamp comparison to only apply newer events.
- **Fetch-before-process pattern**: Treat webhook as notification; fetch latest state from source API before processing.
- **Content hashing**: If no delivery ID, hash immutable fields as idempotency key.

**Detection:** Query for signals with identical verbatim + source + created_within_minutes. Monitor idempotency cache hit rate.

**Phase to address:** Signal Ingestion (Layer 1) — webhook processing logic.

**Sources:**
- [Neurobyte: Top 7 Webhook Reliability Tricks for Idempotency](https://medium.com/@kaushalsinh73/top-7-webhook-reliability-tricks-for-idempotency-a098f3ef5809)
- [Hookdeck: How to Solve Webhook Data Integrity Issues](https://hookdeck.com/webhooks/guides/how-solve-webhook-data-integrity-issues)

---

### Pitfall 10: Provenance Links That Rot Over Time

**What goes wrong:** Signal-to-project links break when projects are renamed, merged, archived, or deleted. The provenance chain ("this PRD decision came from this signal") becomes orphaned or points to stale references.

**Why it happens:** Foreign key relationships assume stable IDs, but product workflows involve project merges, renames, and archival. Soft deletes without cascade updates leave dangling references. Schema changes during migrations break link integrity.

**Consequences:**
- "Why did we build this?" becomes unanswerable again
- Compliance/audit requirements fail
- Signal counts on projects become incorrect
- Trust in the provenance system erodes

**Warning signs:**
- Signals linked to archived/deleted projects
- Project signal counts don't match actual linked signals
- Missing "informed by" sections on project pages
- Orphaned signals with `related_initiative` pointing to non-existent IDs

**Prevention:**
- **Immutable provenance records**: Create a separate `signal_project_links` junction table with timestamps. Links are never deleted, only marked `unlinked_at`.
- **Soft delete cascades**: When project archived, signals remain linked but marked "archived project."
- **Project merge handling**: When projects merge, migrate all signal links to the destination project.
- **Referential integrity checks**: Periodic job that validates all links resolve and flags orphans.
- **Bi-directional linking**: Store link on both signal and project to enable reconstruction.

**Detection:** Nightly job comparing `COUNT(links)` on projects vs `COUNT(*)` from links table grouped by project.

**Phase to address:** Signal-Project Integration (Layer 3) — linking architecture.

**Sources:**
- [Prophecy: Data Lineage is Broken](https://www.prophecy.io/blog/data-lineage)
- [OvalEdge: Data Lineage Best Practices for 2026](https://www.ovaledge.com/blog/data-lineage-best-practices)
- [Monte Carlo: The Ultimate Guide To Data Lineage](https://www.montecarlodata.com/blog-data-lineage/)

---

### Pitfall 11: Classification Model Trained on Imbalanced Data

**What goes wrong:** Auto-classification ("this belongs to Project X" vs "this is new") trained on historical data where 90% of signals went to 3 popular projects. Model learns to route everything to those projects, never surfaces new initiatives.

**Why it happens:** Real feedback distribution is power-law—a few projects get most signals. Accuracy metrics look great (90%!) but the model is useless for the long tail.

**Consequences:**
- New initiative signals misclassified to existing projects
- "New" bucket becomes a graveyard nobody reviews
- Popular projects get signal spam, diluting real feedback
- Classification becomes a self-fulfilling prophecy

**Warning signs:**
- Classification accuracy high but "new initiative" precision/recall terrible
- Same 5 projects receive 95% of auto-classified signals
- Users manually re-routing signals frequently
- "New" bucket growing faster than it can be triaged

**Prevention:**
- **Stratified evaluation**: Measure precision/recall per class, not just overall accuracy.
- **Minimum confidence threshold**: Require >70% confidence for auto-routing; below that, send to triage.
- **New initiative detection**: Separate model/heuristic for "is this genuinely new" vs "which existing project."
- **Active learning**: Surface uncertain classifications for human review, use corrections to retrain.
- **Rebalancing**: Undersample majority classes or use class weights during training.

**Detection:** Weekly report: signals per project, "new" bucket growth rate, human override rate per project.

**Phase to address:** Signal Intelligence (Layer 2) — classification design.

**Sources:**
- [Google ML Crash Course: Classification Accuracy, Precision, Recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall)
- [Capital One: 10 Common Machine Learning Mistakes](https://www.capitalone.com/tech/machine-learning/10-common-machine-learning-mistakes/)
- [GeeksforGeeks: Top 10 Common Machine Learning Mistakes](https://www.geeksforgeeks.org/blogs/common-machine-learning-mistakes/)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

### Pitfall 12: Clustering That Produces Unusable Groups

**What goes wrong:** Signal clustering produces either one giant cluster ("everything is related") or thousands of micro-clusters ("every signal is unique"). Neither is actionable for synthesis or initiative discovery.

**Why it happens:**
- Embedding model not tuned for your domain (PM feedback has different semantics than training data)
- Wrong similarity threshold (too low = one cluster, too high = dust)
- Noise in input data (markdown artifacts, inconsistent formatting)
- Clustering algorithm mismatch (K-means assumes spherical clusters; your data may not be)

**Consequences:**
- `/synthesize` produces generic insights
- PMs don't trust cluster-based recommendations
- Manual grouping becomes the norm, defeating automation
- "Pattern detection" becomes a checkbox feature nobody uses

**Warning signs:**
- Silhouette scores below 0.3
- Largest cluster contains >50% of signals
- Cluster labels require extensive manual editing
- Users ignore cluster suggestions entirely

**Prevention:**
- **Domain-specific embeddings**: Fine-tune or select embedding model on PM/product feedback data.
- **Preprocessing pipeline**: Normalize casing, strip markdown/HTML, deduplicate before embedding.
- **Hierarchical clustering**: Allow nested clusters (theme → sub-theme → signals).
- **Human-in-the-loop tuning**: Let PMs adjust cluster boundaries, use feedback to tune thresholds.
- **Multiple clustering attempts**: Try different algorithms (DBSCAN, HDBSCAN, K-means) and pick best silhouette.

**Detection:** Track cluster quality metrics over time. Survey PMs on cluster usefulness quarterly.

**Phase to address:** Signal Intelligence (Layer 2) — clustering implementation.

**Sources:**
- [Aitude: Top 5 Sentence Transformer Embedding Mistakes](https://www.aitude.com/top-5-sentence-transformer-embedding-mistakes-and-their-easy-fixes-for-better-nlp-results/)
- [Spotify Engineering: Recursive Embedding and Clustering](https://engineering.atspotify.com/2023/12/recursive-embedding-and-clustering)
- [Text Clustering with LLM Embeddings](https://arxiv.org/html/2403.15112v1)

---

### Pitfall 13: Extraction That Loses Critical Context

**What goes wrong:** Structured signal extraction (verbatim, interpretation, severity, frequency) strips away context that made the feedback valuable. The original nuance is lost, and downstream decisions are based on oversimplified data.

**Why it happens:**
- LLM extraction optimized for brevity loses subtlety
- Severity/frequency are subjective; extracting as enums flattens the spectrum
- Verbatim truncation loses important context at the end
- Interpretation becomes editorialized, not representative

**Consequences:**
- "Strong negative feedback" becomes "severity: high" with no way to understand why
- Verbatim quotes are cherry-picked, not representative
- Synthesis produces bland, hedge-everything insights
- Signal detail pages feel empty compared to raw source

**Warning signs:**
- Users clicking through to original source frequently
- Interpretation feels "off" when compared to source
- Severity distributions suspiciously uniform
- Verbatim quotes all similar length (truncation)

**Prevention:**
- **Preserve raw input**: Always store original, unprocessed signal alongside extracted fields.
- **Multi-quote extraction**: Extract 2-3 verbatims from different parts of feedback.
- **Confidence scores**: Include extraction confidence; flag low-confidence for human review.
- **Structured severity**: Use scale with examples, not just high/medium/low.
- **Interpretation validation**: Prompt LLM to check interpretation against verbatim.

**Detection:** Sample 20 signals/week, compare extracted vs original. Track "view original" click rate.

**Phase to address:** Signal Ingestion (Layer 1) — extraction prompts and schema.

---

### Pitfall 14: Triage Workflow That Creates Backlogs

**What goes wrong:** Signal inbox grows faster than team can process. Triage becomes a chore, then gets ignored. Signals age out of relevance before being actioned.

**Why it happens:**
- No prioritization—all signals feel equally urgent
- Triage requires too many decisions per signal
- No clear ownership—whose job is triage?
- Auto-classification confidence too low, forcing manual review of everything

**Consequences:**
- Week-old feedback triaged alongside fresh signals
- Important signals buried under noise
- "Inbox zero" becomes impossible, team gives up
- Signal system perceived as overhead, not value

**Warning signs:**
- Inbox count steadily increasing week-over-week
- Average signal age in inbox > 3 days
- Triage sessions take > 30 minutes
- PMs avoiding the inbox entirely

**Prevention:**
- **Auto-triage high-confidence signals**: If classification > 85% confident, auto-route. Only surface uncertain signals.
- **Prioritized inbox**: Sort by severity × recency, not chronological.
- **Batch actions**: Allow "accept all from source X" or "link all to Project Y."
- **Triage rotation**: Assign daily/weekly triage owner to distribute load.
- **SLA dashboard**: Show "signals > 48 hours old" prominently.

**Detection:** Track inbox growth rate, average time-to-triage, triage session duration.

**Phase to address:** Signal-Project Integration (Layer 3) — inbox UX redesign.

**Sources:**
- [Airfocus: How to Triage and Manage Feedback](https://airfocus.com/product-learn/how-to-triage-and-manage-feedback/)
- [Featurebase: How to Track Customer Feedback](https://www.featurebase.app/blog/how-to-track-customer-feedback)
- [Usersnap: Triaging issues and user feedback](https://usersnap.com/blog/triaging-issues-jira/)

---

### Pitfall 15: Performance Degradation at Scale

**What goes wrong:** Signal volume grows 10x over 6 months. Queries slow down, clustering takes minutes, inbox becomes sluggish. System designed for 100 signals/week can't handle 1000.

**Why it happens:**
- No pagination on signal queries
- Clustering runs on full corpus, not incremental
- Embedding generation is synchronous
- No archival strategy—old signals accumulate indefinitely

**Consequences:**
- Inbox takes 5+ seconds to load
- `/synthesize` times out
- Background workers fall behind, creating processing delays
- Users perceive system as "slow and clunky"

**Warning signs:**
- P95 response times increasing month-over-month
- Worker queue depth growing
- Database query explain plans showing sequential scans
- Users complaining about speed

**Prevention:**
- **Design for 10x current volume**: Assume signal count will grow exponentially.
- **Pagination everywhere**: Never load unbounded lists.
- **Incremental clustering**: Assign new signals to existing clusters, re-cluster periodically.
- **Async embedding**: Generate embeddings in background, not on insert.
- **Archival policy**: Signals > 12 months old archived to cold storage, excluded from default queries.
- **Caching**: Cache cluster assignments, project signal counts.

**Detection:** Monitor P50/P95/P99 latencies. Alert on queue depth > threshold.

**Phase to address:** All layers — design decisions throughout.

**Sources:**
- [Matia: Best Practices and Pitfalls of Scaling Data Ingestion](https://www.matia.io/blog/best-practices-and-pitfalls-of-scaling-data-ingestion-for-high-volume-sources)
- [Medium: Scaling Data Ingestion for High-Volume Environments](https://medium.com/@sohan.lal_54278/scaling-data-ingestion-for-high-volume-environments-best-practices-and-performance-optimization-d77b62001e7d)

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

### Pitfall 16: Webhook Security Theater

**What goes wrong:** Webhook endpoint accepts any request, or signature validation is bypassable. Malicious actors can inject fake signals.

**Why it happens:** Security added as afterthought. Signature validation implemented but not tested. API keys hardcoded or easily guessable.

**Consequences:**
- Fake signals pollute the corpus
- Difficult to distinguish legitimate from malicious
- Potential compliance violations

**Prevention:**
- **HMAC signature validation**: Verify webhook payload signature using shared secret.
- **Source IP allowlisting**: Where possible, restrict to known provider IPs.
- **Rate limiting**: Prevent flood attacks.
- **Audit logging**: Log all webhook attempts, successful and failed.

**Phase to address:** Signal Ingestion (Layer 1) — webhook endpoint.

---

### Pitfall 17: Upload/Paste Without Format Detection

**What goes wrong:** User pastes markdown, uploads PDF, or submits HTML. System treats all as plain text, creating mangled signals.

**Why it happens:** MVP focuses on "accept text input" without considering input diversity.

**Consequences:**
- Verbatim quotes include markdown syntax
- PDF extraction produces garbage text
- HTML tags appear in interpretation

**Prevention:**
- **Format detection**: Sniff content type, apply appropriate parser.
- **Preview before submit**: Show user extracted content before creating signal.
- **Supported formats documentation**: Be explicit about what works.

**Phase to address:** Signal Ingestion (Layer 1) — multi-source input handling.

---

### Pitfall 18: Video Link Input Without Timestamp Context

**What goes wrong:** User submits YouTube/Loom link. System extracts transcript but loses timestamp context. "This quote at 3:42" becomes unprovable.

**Why it happens:** Transcript APIs don't always preserve timestamps. Link storage doesn't include timestamp parameter.

**Consequences:**
- Can't verify verbatim quotes against source
- Hard to share "watch from here" links
- Context around quote unclear

**Prevention:**
- **Timestamp extraction**: Parse and store transcript with timestamps where available.
- **Timestamp links**: Store video URL with `?t=` parameter for key quotes.
- **Fallback**: If no timestamps, flag signal as "transcript only."

**Phase to address:** Signal Ingestion (Layer 1) — video link handling.

---

## Integration Pitfalls (Elmer-Specific)

Mistakes specific to adding signals to an existing PM orchestration system.

### Pitfall 19: Inbox Semantic Confusion

**What goes wrong:** Existing "inbox" column in Elmer creates projects. New signals system also uses "inbox" concept. Users confused about what goes where.

**Why it happens:** Reusing familiar terminology for different concepts without clear migration path.

**Consequences:**
- Users create projects when they should create signals
- Signals and projects mixed in mental model
- Training materials and help docs conflict

**Warning signs:**
- Support questions about "inbox" increasing
- Users manually converting signals to projects incorrectly
- Feature requests for "old inbox behavior"

**Prevention:**
- **Clear terminology**: "Signal Inbox" vs "Project Pipeline" or similar distinction.
- **Visual differentiation**: Different UI treatment for signals vs projects.
- **Migration guidance**: In-app hints explaining the new model.
- **Keyboard shortcut differences**: Different shortcuts for "new signal" vs "new project."

**Phase to address:** Signal-Project Integration (Layer 3) — inbox redesign.

---

### Pitfall 20: Job System Contention

**What goes wrong:** Signal processing jobs (extraction, classification, embedding) compete with existing PRD generation and prototype jobs. During busy periods, signals queue behind heavy jobs.

**Why it happens:** Single job queue for all work types. No priority differentiation.

**Consequences:**
- Signal ingestion delayed during PRD generation
- Fresh feedback sits unprocessed while long-running jobs execute
- Users perceive signals as "slow to appear"

**Warning signs:**
- Signal processing latency spikes correlated with PRD/prototype job creation
- Queue depth high but signal jobs not executing
- Workers busy but signal inbox not updating

**Prevention:**
- **Separate queues**: Signal processing queue distinct from document generation queue.
- **Priority levels**: Lightweight signal jobs (extraction) higher priority than heavy jobs (PRD).
- **Dedicated workers**: At least one worker always processing signals.
- **Job timeouts**: Ensure long-running jobs don't monopolize workers.

**Phase to address:** Signal Intelligence (Layer 2) — job architecture.

---

### Pitfall 21: Permission Model Mismatch

**What goes wrong:** Existing role model (Admin/Member/Viewer) doesn't map cleanly to signals. Can viewers see all signals? Can members delete signals? Can admins see signals across all projects?

**Why it happens:** Signals are a new entity type; permission model designed for projects/workspaces doesn't account for them.

**Consequences:**
- Sensitive feedback visible to wrong people
- Viewers accidentally modifying signals
- Permission errors in production

**Warning signs:**
- "Access denied" errors for expected operations
- Signals visible to users who shouldn't see them
- Permission questions in user feedback

**Prevention:**
- **Explicit signal permissions**: Document signal CRUD permissions per role before building.
- **Workspace-scoped signals**: Signals inherit workspace permissions like projects do.
- **Test matrix**: QA permission combinations before launch.

**Phase to address:** Signal Ingestion (Layer 1) — schema and permissions.

---

## Phase-Specific Warnings (v1.1 Signals System)

| Phase/Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Webhook endpoint | Synchronous processing, data loss | Queue-first architecture, fast ACK |
| File upload | Format detection failure | Content sniffing, preview before submit |
| Extraction | Context loss | Preserve raw, multi-quote, confidence scores |
| Classification | Imbalanced training data | Stratified eval, confidence thresholds |
| Clustering | Poor separation | Domain embeddings, silhouette monitoring |
| Signal-project linking | Provenance rot | Immutable junction table, integrity checks |
| Inbox redesign | Terminology confusion | Clear naming, visual differentiation |
| Performance | Scale issues | Design for 10x, pagination, archival |

---

## Confidence Assessment (v1.1 Signals Research)

| Area | Confidence | Notes |
|------|------------|-------|
| Webhook reliability | HIGH | Well-documented patterns, multiple sources |
| Classification pitfalls | HIGH | Standard ML production issues |
| Clustering issues | MEDIUM | Domain-specific tuning needs experimentation |
| Provenance tracking | MEDIUM | Best practices exist but integration-specific |
| Elmer integration | MEDIUM | Based on codebase analysis, not production experience |
| Performance at scale | MEDIUM | Generic patterns; Elmer-specific load unknown |

---

*Research completed: 2026-01-22*
*Primary sources: WebSearch findings verified against multiple technical blogs and documentation*
