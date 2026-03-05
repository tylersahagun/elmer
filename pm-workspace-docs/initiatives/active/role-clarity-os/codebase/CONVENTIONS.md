# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

**Files:**
- Context files: `{model}s.context.ts` (plural, e.g., `engagements.context.ts`)
- Repository files: `{model}s.repository.ts` (plural, e.g., `users.repository.ts`)
- Repository type exports: `Db{Model}` for select types, `{Model}CreateParams` for insert types (e.g., `DbEngagement`, `EngagementCreateParams`)
- Test files: `{feature}.test.ts` or `{feature}.test.tsx` (e.g., `lock.test.ts`, `entity-mention-utils.test.tsx`)
- Test factories: `{model}s.test.factory.ts` (plural, e.g., `privacy-agent-results.test.factory.ts`)
- Integration tests: `{feature}.integration.test.ts` (e.g., `uploads-processing.integration.test.ts`)
- Data source files: `{model}s.data-source.ts` (e.g., `engagements.data-source.ts`)
- Subcontext directories: Plural kebab-case (e.g., `workflow-assistant-runs/`, `engagement-participant-users/`)
- GraphQL schema files: `schema.graphql` and `schema.model.ts` per context
- Resolver files: `{mutation-or-subscription-name}.ts` within `resolvers/` directory (e.g., `acknowledgeNotification.ts`)

**Functions:**
- Context functions: camelCase, start with action verb (e.g., `createPrivacyAgentResult`, `getPrivacyAgentResultsByIds`, `addEngagementParticipantUser`)
- Repository helpers: camelCase, attached to exported object (e.g., `EngagementRepository.getById()`)
- Factory helpers: camelCase, attached to exported factory object (e.g., `privacyAgentResultFactory.create()`, `privacyAgentResultFactory.genId()`)
- Logger names: PascalCase matching component/file name (e.g., `createLogger('ValkeyCacheClient')`, `createLogger('SalesforcePubSub')`)
- Async functions that may perform I/O: prefix with action (e.g., `acquireLock`, `extendLock`, `publishMessage`)

**Variables:**
- camelCase for local variables and parameters
- SCREAMING_SNAKE_CASE for constants (e.g., `const ONE_WEEK = 7 * 24 * 60 * 60 * 1000`)
- Booleans: prefix with `is` when it improves readability (e.g., `isUtilityEmail`, `isEmailInWorkspaceDomain`)
- IDs: prefix with model type (e.g., `workspaceId`, `userId`, `engagementId`) or use table prefix from schema (e.g., `par_` for privacy agent result, `cmp_` for company)
- ID generation: `createUlid(prefix)` where prefix comes from schema table definition (e.g., `createUlid('par')` for privacy agent results)

**Types:**
- Model interfaces: PascalCase with `Model` suffix (e.g., `UserModel`, `WorkspaceModel`, `CompanyModel`)
- GraphQL generated types: PascalCase (e.g., `EngagementType`, `UserRole`, `EngagementBotDetails`)
- Enums: PascalCase (e.g., `AnnotationFilterOperator`, `InvitationStatus`, `EngagementParticipantType`)
- Resolver type exports: `{TypeName}Resolvers` (e.g., `TagResolvers`, `UserResolvers`) - but only implement resolvers that need transformation or async fetching

**GraphQL field naming:**
- DateTime fields: `*At` suffix (e.g., `createdAt`, `updatedAt`, `sentAt`)
- Date fields: `*On` suffix (e.g., `dueOn`, `completedOn`)
- Boolean fields: `is*` prefix (e.g., `isActive`, `isPrivate`, `isNew`)

## Code Style

**Formatting:**
- Tool: Biomejs (configured in `biome.json`)
- Line width: 120 characters
- Indentation: 2 spaces
- Line endings: LF
- Semicolons: always required
- Quotes: single quotes for JavaScript/TypeScript, double quotes for JSX attributes
- Trailing commas: ES5 style
- Arrow parentheses: always (even for single parameters)
- Bracket spacing: true

**Linting:**
- Tool: Biomejs with strict recommended rules
- GraphQL naming convention: enforced (`useGraphqlNamingConvention: error`)
- Consistent GraphQL descriptions: enforced in schema
- Most `noExplicitAny` and `noNonNullAssertion` checks are disabled to allow pragmatic development
- No `import` reordering via assist actions (set to `off`)

**Commands:**
```bash
pnpm lint              # Auto-fix linting and formatting issues
pnpm lint:ci           # Check formatting/linting in CI (with strict error-on-warnings)
biome check --write    # Explicit Biomejs check and fix
biome ci               # CI-mode linting with strict warnings
```

## Import Organization

**Order (top to bottom):**
1. External dependencies (npm packages)
2. Absolute path imports from `@/*` aliases
3. Relative imports from same or parent directory

**Within each group:**
- Alphabetize by import source
- Multi-line imports: alphabetize imports within braces
- Always include `.js` file extensions in imports (required for Node.js ESM compatibility)

**Path Aliases:**
- `@/*` → `./src/*` (in functions context)
- `@/*` → `./src/*` (in web app context)
- Always use `@/` prefix for non-relative imports within the same package

**Example pattern from `engagements.context.ts`:**
```typescript
// External
import { parseISO } from 'date-fns';
import { SQL, sql } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { ValueType } from '@opentelemetry/api';
import { error, log, warn } from 'firebase-functions/logger';
import { serializeError } from 'serialize-error';

// Absolute paths (@/)
import { getCalendarEventKey } from '@/contexts/calendar-events/calendar-events.context.js';
import { ApiRecallCalendarEvent } from '@/contexts/calendar-events/calendar-events.types.js';
import { createUlid, EngagementId } from '@/db/schema.js';
import { EngagementBotDetails } from '@/schema/types.generated.js';
import { isUniqueConstraintViolation } from '@/utils/pg-utils.js';

// Relative
import { displayName } from '../../utils/display-name.js';
import { ConnectionType } from '../../utils/utils.js';
```

## Error Handling

**Patterns:**
- Database operations: Never mock database interactions in tests; use `withRollback` wrapper to test with real database
- Unique constraint violations: Check with `isUniqueConstraintViolation()` utility for recoverable collisions
- Context functions: Let errors propagate naturally; don't catch and suppress (except for explicit validation)
- Repository functions: Return types should indicate success/failure clearly (e.g., boolean for lock operations, typed result for queries)

**Error object serialization:**
- Use `serializeError` from npm when logging error objects
- Log with `logger.exception('Message', error, metadata)` when you have an error object
- Use `logger.error('Message', metadata)` when you only have context, no error

**Try/catch patterns in context tests:**
- Wrap test blocks in `withRollback(async (tx) => { ... })` to ensure database isolation
- Don't catch exceptions in tests; let them fail to expose real errors
- Test both success and collision paths (when applicable)

## Logging

**Component Logger Setup:**
- Create one logger per module: `const logger = createLogger('ComponentName')`
- ComponentName must be PascalCase (enforced at compile time via TypeScript type validation)
- Logger created at module top level: `createLogger('ValkeyCacheClient')`, `createLogger('WorkflowContext')`

**Logging Context:**
- Wrap every entry point in `runWithLoggingContext({ requestId: createUlid('rid'), functionName: 'handlerName' }, async () => { ... })`
- Entry points: HTTP handlers, Pub/Sub handlers, scheduled functions, top-level GraphQL resolvers
- Use `enrichLoggingContext({ userId, workspaceId })` to add persistent metadata that appears in all downstream logs

**Log Levels & Methods:**
- `logger.log('message', metadata)` – Normal operation (required: message, optional: metadata object)
- `logger.warn('message', metadata)` – Recoverable issues
- `logger.error('message', metadata)` – Failures without error object
- `logger.exception('message', error, metadata)` – Failures with error object (auto-serializes)

**Metadata:**
- Use structured objects: `logger.log('User authenticated', { userId, role })` ✅
- Never concatenate strings: `logger.log(\`User \${userId} authenticated\`)` ❌
- Persistent metadata (via `enrichLoggingContext`): appears in all logs, use for user/workspace IDs
- One-time metadata (via logger second argument): appears only in that specific log

**Secrets:**
- Never log passwords, tokens, API keys, or sensitive PII
- Logger auto-redacts common patterns as safety net, but don't intentionally include secrets

## Comments

**When to Comment:**
- Explain "why" not "what" (code shows what it does)
- Clarify non-obvious business logic or constraints
- Document workarounds and their reason (e.g., "TODO: Remove this when X is fixed")
- Flag performance-critical sections
- Explain regex or complex algorithms

**JSDoc/TSDoc:**
- Use for public APIs and exported functions
- Export type definitions with comments describing purpose
- Tag parameters and return types: `@param`, `@returns`, `@throws`
- Examples: Include in JSDoc for complex utilities

**Example pattern:**
```typescript
/**
 * Acquires a distributed lock using Valkey with timeout.
 * Returns true if lock was successfully acquired, false if held by another.
 * Lock expires after TTL seconds (default: 30).
 *
 * @param client - Valkey client instance
 * @param key - Lock key identifier
 * @param value - Lock ownership token (used to verify release)
 * @param ttl - Time-to-live in seconds (default: 30)
 * @returns true if lock acquired, false if already held
 */
export async function acquireLock(
  client: ValleyClient,
  key: string,
  value: string,
  ttl: number = 30
): Promise<boolean>
```

## Function Design

**Size:**
- Keep functions focused on single responsibility
- Extract nested logic into separate functions when readability suffers
- Factory helpers should be short, delegating to context functions for real work

**Parameters:**
- Explicit over implicit; avoid relying on closure variables
- Required transaction parameter in every factory and context function: `tx: DrizzleDb`
- Use typed parameter objects for functions with multiple params (avoid positional args)

**Return Values:**
- Return typed objects, not raw Drizzle results
- Context functions return domain models (e.g., `UserModel`, `EngagementModel`)
- Repository functions return `Db{Model}` (the `$inferSelect` type) or filtered subsets
- Use explicit return types for all exported functions

**Example from factory:**
```typescript
const create = async (
  params: Partial<PrivacyAgentResultCreateParams>,
  tx: DrizzleDb
): Promise<DbPrivacyAgentResult> => {
  return createPrivacyAgentResult(
    {
      ...{
        shortReasonText: faker.lorem.sentence(),
        longReasonMarkdown: faker.lorem.paragraph(),
      },
      ...params,
    },
    tx
  );
};
```

## Module Design

**Exports:**
- One primary export per file (e.g., context object, repository object, factory object)
- Re-export types alongside their export: `export { Db{Model}, {Model}CreateParams } from './repository.js'`
- Factory modules export single object: `export const {model}Factory = { create, genId }`

**Barrel Files:**
- Use index.ts to export the main context or public API
- Do not pre-export everything; only expose intended public interfaces

**Cross-module imports:**
- Only context files (and tests) import from corresponding repository
- Repositories should never import from contexts
- Share types via `schema.model.ts` or `*.types.ts` files
- Subcontexts may import from parent context, avoid circular dependencies

## GraphQL Resolver Patterns

**Don't implement identity resolvers:**
- GraphQL automatically resolves fields matching parent object property names
- Never write: `id: (parent) => parent.id`
- Skip the resolver entirely—GraphQL handles it automatically

**Only implement resolvers when:**
1. Field name differs from parent property (e.g., `displayName` from `name`)
2. Transformation is required (e.g., `sentAt` from `createdAt`)
3. Async data fetching needed (e.g., loading related entity by ID)
4. Computed values (e.g., `isNew: (parent) => parent.createdAt > now - ONE_WEEK`)

**Async keyword:**
- Only mark resolvers `async` when they actually await operations
- Synchronous transformations should NOT be async
- Synchronous field mapping should NOT be async

**Example:**
```typescript
// ✅ CORRECT - No async for synchronous operation
displayName: (parent, _arg, _ctx) => {
  return parent.name || 'Unknown';
},

// ✅ CORRECT - async only when awaiting
engagement: async (parent, _arg, ctx) => {
  return ctx.dataSources.engagementDb.getEngagementById(parent.engagementId);
},

// ❌ WRONG - Unnecessary async
displayName: async (parent, _arg, _ctx) => {
  return parent.name || 'Unknown';
},
```

---

*Convention analysis: 2026-02-04*
