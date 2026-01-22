# Codebase Concerns

**Analysis Date:** 2026-01-21

## Tech Debt

**Type Safety Issues in Database Layer:**
- Issue: 65+ instances of `any` and `unknown` types in database schema and query handling without proper validation
- Files: `orchestrator/src/lib/db/schema.ts`, `orchestrator/src/lib/db/queries.ts`, `orchestrator/src/lib/db/index.ts`
- Impact: Silent failures possible when handling JSONB fields and workspace metadata. Type coercion errors may not surface until runtime.
- Fix approach: Add Zod validation layers to all database query responses, especially for JSONB fields like `metadata`, `inputSchema`, `outputSchema`. Create type guards for workspace settings.

**Unvalidated Request Body Parsing:**
- Issue: 15+ API endpoints call `request.json()` without schema validation or error handling
- Files: `orchestrator/src/app/api/projects/route.ts`, `orchestrator/src/app/api/stage-recipes/[stage]/route.ts`, `orchestrator/src/app/api/workspaces/[id]/route.ts`, `orchestrator/src/app/api/ai/generate/route.ts`, and others
- Impact: Malformed or oversized payloads crash endpoints. No validation of required fields. Potential for injection attacks if data is persisted without sanitization.
- Fix approach: Create a validation middleware using Zod. Add error boundaries to all POST/PUT routes. Implement payload size limits.

**Implicit Type Casting in Job Processor:**
- Issue: `shouldRetryWithoutPenalty` flag uses type assertion `as { shouldRetryWithoutPenalty?: boolean }` instead of proper typing
- Files: `orchestrator/src/lib/jobs/processor.ts:204`
- Impact: If result object structure changes, the soft-failure retry logic silently fails and treats retries as real failures. Hard to debug.
- Fix approach: Create a discriminated union type for execution results. Replace type assertion with proper type narrowing.

**Hardcoded Default Values Scattered:**
- Issue: Database defaults, polling intervals, rate limits, and context paths hardcoded in multiple places
- Files: `orchestrator/src/lib/agent/worker.ts:36-43`, `orchestrator/src/lib/db/queries.ts:69`, `orchestrator/src/lib/db/schema.ts:69`, `orchestrator/src/lib/knowledgebase.ts`
- Impact: Changing configuration requires code changes and redeployment. No easy way to adjust behavior per workspace without code modification.
- Fix approach: Centralize configuration in workspace settings or environment. Create ConfigService to inject defaults consistently.

## Known Bugs

**Cursor Runner Fallback Logic Incomplete:**
- Symptoms: Jobs submitted with `aiExecutionMode: "cursor"` stay in pending state indefinitely if Cursor doesn't pick them up
- Files: `orchestrator/src/lib/jobs/processor.ts:100-108`, `orchestrator/src/lib/jobs/executor.ts:22-30`
- Trigger: Set workspace `aiExecutionMode` to "cursor" and submit a job, then don't run Cursor
- Workaround: Manually change execution mode to "server" or "hybrid" in workspace settings
- Root cause: No timeout mechanism exists. `shouldRetryWithoutPenalty` prevents error escalation, so jobs never fail.

**Soft Failure Retry Logic Doesn't Escalate to Hard Failure:**
- Symptoms: Jobs waiting for dependencies can be retried indefinitely without ever reporting a failure
- Files: `orchestrator/src/lib/jobs/processor.ts:203-210`, `orchestrator/src/lib/agent/worker.ts:375-395`
- Trigger: Create two jobs where Job B depends on Job A, but Job A is broken. Job B will retry forever.
- Impact: Blocks workspace automation. Can exhaust API rate limits through infinite retries.
- Fix approach: Add max soft-retry count. After N soft retries, escalate to hard failure with alert.

**Database Connection Pool Exhaustion on Neon:**
- Symptoms: Intermittent "connection pool exhausted" errors in production under moderate load
- Files: `orchestrator/src/lib/db/index.ts:22-35`, `orchestrator/src/lib/db/migrate.ts`
- Impact: API endpoints randomly fail with 500 errors. Worker becomes unresponsive.
- Root cause: Neon HTTP driver may not be properly closing connections. No explicit pool management.
- Fix approach: Add connection timeout configuration. Implement connection health checks. Monitor pool utilization.

**Race Condition in Idempotency Check:**
- Symptoms: Two rapid requests for the same job can create duplicate queued runs
- Files: `orchestrator/src/lib/execution/run-manager.ts:48-61`
- Trigger: Submit same job ID twice within 100ms
- Impact: Duplicate job runs consume API quota and create duplicate artifacts
- Root cause: Check-then-create pattern without database-level locking
- Fix approach: Use database constraint or SELECT FOR UPDATE to make idempotency check atomic

**Jury Evaluation Implementation Stub:**
- Symptoms: Jury score verification always skipped, returns placeholder results
- Files: `orchestrator/src/lib/execution/stage-executors/index.ts:284`
- Impact: Jury validation gate has no effect; all prototypes pass validation regardless of actual jury scores
- Root cause: `TODO: Implement jury score check` comment indicates incomplete feature
- Fix approach: Implement actual jury score verification logic

## Security Considerations

**API Endpoints Lack Authentication:**
- Risk: All API routes are accessible without authentication or authorization checks
- Files: `orchestrator/src/app/api/*` (all route handlers)
- Current mitigation: None detected. Relies on deployment environment isolation.
- Recommendations:
  1. Add authentication middleware (e.g., NextAuth.js)
  2. Implement workspace-scoped authorization
  3. Add rate limiting per user/API key
  4. Validate CORS headers

**Workspace Context Files Not Sanitized:**
- Risk: User-uploaded context files could contain malicious content that gets passed to Claude API
- Files: `orchestrator/src/lib/context/resolve.ts:40-48`, `orchestrator/src/lib/knowledgebase.ts:54-60`
- Current mitigation: No validation of file content
- Recommendations:
  1. Add content-type validation
  2. Sanitize markdown/text before passing to Claude
  3. Add file size limits
  4. Scan for suspicious patterns

**Git Branch Operations Not Validated:**
- Risk: Arbitrary branch names or repository operations could be attempted
- Files: `orchestrator/src/lib/git/branches.ts`
- Current mitigation: Basic try-catch, but no validation of branch name format or repo permissions
- Recommendations:
  1. Validate branch names against safe patterns
  2. Check repository permissions before operations
  3. Audit all git commands executed

**Environment Variable Exposure in Logs:**
- Risk: Sensitive configuration could be logged during development
- Files: `orchestrator/src/lib/db/index.ts:25`, `orchestrator/src/lib/db/migrate.ts:21`
- Current mitigation: DATABASE_URL not printed, but other env vars may be logged
- Recommendations:
  1. Create a secure logger that masks sensitive values
  2. Disable verbose logging in production
  3. Regular audit of console.log statements

## Performance Bottlenecks

**N+1 Query Problem in Project Loading:**
- Problem: Loading projects with documents and prototypes triggers multiple sequential queries
- Files: `orchestrator/src/lib/db/queries.ts:hundreds of queries without explicit relationships loading`
- Cause: Drizzle ORM relationships not always eagerly loaded
- Improvement path: Use `with` clauses in queries to eagerly load related data. Add query performance tests.

**Large Component File Sizes:**
- Problem: UI components with 1000+ lines have complex logic mixed with rendering
- Files: `orchestrator/src/components/kanban/WorkspaceSettingsModal.tsx` (1444 lines), `orchestrator/src/components/kanban/ProjectDetailModal.tsx` (1174 lines), `orchestrator/src/lib/jobs/executor.ts` (1243 lines)
- Cause: Monolithic component structure, lack of modularization
- Improvement path: Extract logic into hooks/services. Split modal into sub-components. Break executor into stage-specific handlers.

**Stage Executor Index Dispatching:**
- Problem: 565-line file with if/else chains for all stage types creates long method lookups
- Files: `orchestrator/src/lib/execution/stage-executors/index.ts:565 lines`
- Cause: Central dispatcher instead of plugin architecture
- Improvement path: Implement registry pattern for stage executors. Allow dynamic registration.

**Infinite Recursion Risk in Rate Limiter:**
- Problem: `waitForCapacity` calls itself recursively when limits hit, potential stack overflow
- Files: `orchestrator/src/lib/agent/worker.ts:84`
- Cause: Recursive sleep instead of iterative loop
- Improvement path: Replace recursion with while loop. Add max retry counter.

## Fragile Areas

**Job State Machine Not Validated:**
- Files: `orchestrator/src/lib/db/schema.ts:100-110`, `orchestrator/src/lib/jobs/processor.ts`
- Why fragile: No validation that state transitions are legal. Can transition from "completed" to "pending" manually.
- Safe modification: Add state validation function. Document valid transitions. Create state machine tests.
- Test coverage: Gaps in job lifecycle tests - missing edge cases for state transitions

**Knowledgebase File Loading:**
- Files: `orchestrator/src/lib/knowledgebase.ts:39-60`, `orchestrator/src/lib/context/resolve.ts:217-240`
- Why fragile: Swallows file-not-found errors silently. Falls back through multiple resolution strategies without clear error messages.
- Safe modification: Add explicit logging for each resolution attempt. Return error details to caller.
- Test coverage: No tests for fallback chains

**Background Worker Concurrency:**
- Files: `orchestrator/src/lib/agent/worker.ts:105-220`, `orchestrator/src/worker.ts`
- Why fragile: `maxConcurrent: Infinity` with API rate limiting relies on rate limiter working perfectly. No circuit breaker.
- Safe modification: Add hard limit on concurrent jobs. Implement backpressure. Add breaker for API timeouts.
- Test coverage: No concurrent execution tests

**Workspace Settings Schema Evolution:**
- Files: `orchestrator/src/lib/db/schema.ts:29-67` (WorkspaceSettings interface)
- Why fragile: Adding new settings requires code changes. No migration strategy for existing workspaces.
- Safe modification: Create settings validator and upgrade function. Document all setting options.
- Test coverage: No settings migration tests

## Scaling Limits

**Database Connection Pool (Neon):**
- Current capacity: Default Neon plan allows ~20 connections
- Limit: When background worker + API servers exceed connection budget, requests queue/fail
- Scaling path: Upgrade Neon tier, or implement connection pooling proxy (e.g., PgBouncer)

**Job Processing Throughput:**
- Current capacity: Rate limiter set to 50 requests/minute per workspace (Anthropic tier 1)
- Limit: Cannot process > 50 jobs/minute without hitting API throttling
- Scaling path: Implement job batching. Upgrade Anthropic API tier. Add request queuing with backoff.

**In-Memory Rate Limiter State:**
- Current capacity: Stores all requests from last 60 seconds in memory
- Limit: Under extreme load, memory usage could grow unbounded
- Scaling path: Implement Redis-backed rate limiter. Add memory limits with cleanup.

**Kanban Board State (Zustand):**
- Current capacity: Stores full project tree in browser memory
- Limit: 1000+ projects would cause browser memory issues
- Scaling path: Implement pagination. Use virtualization for kanban columns. Move heavy computations to server.

## Dependencies at Risk

**Anthropic SDK Deprecated Model Warnings:**
- Risk: Code may use deprecated Claude models that will EOL
- Impact: Jobs using old models will start failing without notice
- Migration plan: Create model version manager. Add deprecation alerts. Implement model switching logic per workspace.

**Drizzle ORM Migration System:**
- Risk: Manual migration files can diverge from schema definition
- Impact: Schema mismatch causes runtime failures
- Migration plan: Add schema validation in CI. Enforce migrations before deploy. Regular audits of schema vs migrations.

**Next.js 16 API Routes (Deprecated):**
- Risk: Next.js moving toward App Router, legacy API routes may be removed
- Impact: All current API code in `orchestrator/src/app/api/*` may need rewriting
- Migration plan: No immediate action needed (still supported), but plan migration to newer patterns.

## Missing Critical Features

**No Job Audit Trail:**
- Problem: Can't see who changed job status or what parameters were used
- Blocks: Debugging production issues. Compliance auditing. Root cause analysis.

**No Execution Visibility Dashboard:**
- Problem: Hard to see what's happening across all running jobs
- Blocks: Operational monitoring. Quick issue detection. User transparency.

**No Circuit Breaker for External APIs:**
- Problem: If Claude API is down, requests fail without backoff
- Blocks: Graceful degradation. User experience preservation.

**No Skill/Tool Versioning:**
- Problem: Can't track which version of a skill was used in a job
- Blocks: Reproducibility. Skill updates break existing jobs.

**No Automatic Job Failure Notifications:**
- Problem: Only visible in UI if you're watching. No email/Slack alerts.
- Blocks: Timely issue response. Team awareness of failures.

## Test Coverage Gaps

**Job Processing State Transitions:**
- What's not tested: Full lifecycle of different job types, error recovery, retry logic
- Files: `orchestrator/src/__tests__/execution/` (only 5 test files for large codebase)
- Risk: Critical state machine bugs could go undetected
- Priority: High

**Database Query Correctness:**
- What's not tested: Complex queries with relationships, edge cases in filtering
- Files: `orchestrator/src/lib/db/queries.ts` (1136 lines, no test file)
- Risk: Data corruption or missing records in production
- Priority: High

**API Endpoint Input Validation:**
- What's not tested: Invalid payloads, malformed requests, boundary conditions
- Files: `orchestrator/src/app/api/*` (20+ endpoints, no validation tests)
- Risk: Crashes from unexpected input
- Priority: Medium

**Concurrent Execution:**
- What's not tested: Multiple workers processing same job, race conditions, idempotency
- Files: `orchestrator/src/lib/agent/worker.ts`, `orchestrator/src/lib/execution/run-manager.ts`
- Risk: Silent data corruption under load
- Priority: High

**Integration with External Services:**
- What's not tested: Claude API failures, Git operations, File I/O errors
- Files: Multiple service integration points
- Risk: Cascading failures affecting user experience
- Priority: Medium

---

*Concerns audit: 2026-01-21*
