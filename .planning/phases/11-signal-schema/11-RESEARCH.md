# Phase 11: Signal Schema & Storage - Research

**Researched:** 2026-01-22
**Domain:** Drizzle ORM schema design, PostgreSQL indexes, database migrations
**Confidence:** HIGH

## Summary

Phase 11 establishes the data foundation for the signals system. Research confirms the decisions in 11-CONTEXT.md are sound and align with existing codebase patterns. The implementation requires:

1. **Three new tables**: `signals`, `signal_projects`, `signal_personas` (junction tables)
2. **TypeScript union types** for enums (not PostgreSQL enums) - matches existing pattern
3. **Drizzle relations** using the standard pattern for many-to-many relationships
4. **Composite indexes** for common query patterns (workspace + status, workspace + source)
5. **Migration via drizzle-kit generate** followed by `drizzle-kit push` or `migrate`

**Primary recommendation:** Follow existing schema.ts patterns exactly. Define tables, types, interfaces, and relations in sequence. Include indexes inline using the table callback syntax.

## Standard Stack

The existing codebase uses well-established patterns. No new libraries needed.

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.1 | Type-safe SQL ORM | Already in use, schema-first approach |
| drizzle-kit | 0.31.8 | Migration generation | Already configured in drizzle.config.ts |
| nanoid | (bundled) | ID generation | Used via `$defaultFn(() => nanoid())` |
| pg / @neondatabase/serverless | latest | Database drivers | Dual-driver pattern already established |

### Supporting (No Changes Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-orm/pg-core | (part of drizzle-orm) | PostgreSQL primitives | All table definitions |
| uuid | (existing) | Alternative IDs | Used in queries.ts for some operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| text columns with $type<> | PostgreSQL enum | Enums require migrations to add values; text is extensible |
| Base64 text for embeddings | pgvector native type | pgvector requires extension; existing pattern uses base64 text |
| Separate migration files | drizzle-kit push | Push is for dev; generate+migrate is for production safety |

**Installation:**
No new packages needed. Schema changes only.

## Architecture Patterns

### Recommended Project Structure
Existing structure is correct. Signal tables go in the same schema.ts file:
```
orchestrator/src/lib/db/
├── index.ts         # DB connection, type exports
├── schema.ts        # All table definitions (add signals here)
├── queries.ts       # Query functions (add signal queries in Phase 12)
└── migrate.ts       # Migration runner
```

### Pattern 1: Table Definition with Types
**What:** Define table, export types, define TypeScript interfaces, then relations
**When to use:** Every new table
**Example:**
```typescript
// Source: Existing schema.ts pattern (lines 1045-1123 for inboxItems)

// 1. Define union type (not enum)
export type SignalStatus = "new" | "reviewed" | "linked" | "archived";
export type SignalSource = "webhook" | "upload" | "paste" | "video" | "slack" | "pylon" | "email" | "interview" | "other";
export type SignalSeverity = "critical" | "high" | "medium" | "low";
export type SignalFrequency = "common" | "occasional" | "rare";

// 2. Define interface for JSONB columns
export interface SignalSourceMetadata {
  sourceUrl?: string;
  sourceName?: string;
  externalId?: string;
  // ... rest of metadata fields
}

// 3. Define table
export const signals = pgTable("signals", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  // ... fields
  sourceMetadata: jsonb("source_metadata").$type<SignalSourceMetadata>(),
  status: text("status").$type<SignalStatus>().notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Define relations (separate from table)
export const signalsRelations = relations(signals, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [signals.workspaceId],
    references: [workspaces.id],
  }),
  projects: many(signalProjects),
  personas: many(signalPersonas),
  inboxItem: one(inboxItems, {
    fields: [signals.inboxItemId],
    references: [inboxItems.id],
  }),
}));
```

### Pattern 2: Junction Table with Unique Constraint
**What:** Many-to-many junction with composite unique constraint
**When to use:** signal_projects, signal_personas tables
**Example:**
```typescript
// Source: Existing pattern from accounts table (line 108-110)

export const signalProjects = pgTable("signal_projects", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  signalId: text("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
  linkedBy: text("linked_by").references(() => users.id, { onDelete: "set null" }),
  linkReason: text("link_reason"),
  confidence: real("confidence"),
}, (table) => ({
  uniqueSignalProject: unique().on(table.signalId, table.projectId),
}));
```

### Pattern 3: Indexes via Table Callback
**What:** Define indexes in the third argument of pgTable
**When to use:** Any table with frequent query patterns
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/indexes-constraints

export const signals = pgTable("signals", {
  // ... columns
}, (table) => [
  index("signals_workspace_status_idx").on(table.workspaceId, table.status),
  index("signals_workspace_source_idx").on(table.workspaceId, table.source),
  index("signals_workspace_created_idx").on(table.workspaceId, table.createdAt.desc()),
]);
```

### Anti-Patterns to Avoid
- **PostgreSQL ENUMs:** Require migration to add values. Use text with TypeScript union types instead.
- **Mixing callback styles:** Use array syntax `(table) => [...]` for indexes, object syntax `(table) => ({...})` for unique constraints.
- **Missing onDelete:** Always specify cascade behavior for foreign keys.
- **Inline relations:** Define relations separately from tables for cleaner code.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ID generation | Custom UUID logic | `$defaultFn(() => nanoid())` | Consistent with codebase, shorter IDs |
| Timestamp defaults | Manual Date creation | `.defaultNow().notNull()` | Drizzle handles timezone correctly |
| Type safety for enums | Manual validation | `.$type<UnionType>()` | Compile-time checking |
| JSONB typing | `any` type | `.$type<Interface>()` | IntelliSense and type checking |
| Migration tracking | Custom table | drizzle-kit `__drizzle_migrations` | Built-in, tested |

**Key insight:** Drizzle ORM's type system provides compile-time safety. Use `$type<>` extensively for all constrained values.

## Common Pitfalls

### Pitfall 1: Forgetting to Update Relations
**What goes wrong:** New table isn't queryable via `db.query.signals` with `with: {}` clause
**Why it happens:** Relations are defined separately from tables; easy to forget
**How to avoid:** After defining a table, immediately define its relations
**Warning signs:** TypeScript error "Property X does not exist" on `with` queries

### Pitfall 2: Index Definition Syntax
**What goes wrong:** Build fails with "index is not a function" or similar
**Why it happens:** drizzle-orm 0.31+ changed index API; old examples use different syntax
**How to avoid:** Use array return syntax: `(table) => [index(...)]`
**Warning signs:** TypeScript errors in the table callback

### Pitfall 3: Circular Foreign Key References
**What goes wrong:** Cannot reference table before it's defined
**Why it happens:** JavaScript hoisting doesn't work with arrow functions in decorators
**How to avoid:** Define tables in dependency order (workspaces before signals, signals before junction tables)
**Warning signs:** "Cannot access 'X' before initialization" error

### Pitfall 4: Missing Type Exports in index.ts
**What goes wrong:** Types not available for import in other files
**Why it happens:** schema.ts exports types but index.ts doesn't re-export them
**How to avoid:** Add type exports to `orchestrator/src/lib/db/index.ts`
**Warning signs:** Import errors in API routes or tests

### Pitfall 5: Migration vs Push Confusion
**What goes wrong:** Production schema doesn't match, or data loss
**Why it happens:** `drizzle-kit push` applies changes directly; `generate` + `migrate` tracks changes
**How to avoid:**
- Development: `drizzle-kit push` is fine for rapid iteration
- Production: Always `drizzle-kit generate` then apply migration
**Warning signs:** Schema mismatch errors, missing tables in production

## Code Examples

Verified patterns from existing codebase:

### Table with JSONB and Union Types
```typescript
// Source: schema.ts lines 1092-1112 (inboxItems)
export const signals = pgTable("signals", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),

  // Core content
  verbatim: text("verbatim").notNull(),
  interpretation: text("interpretation"),

  // Structured extraction
  severity: text("severity").$type<SignalSeverity>(),
  frequency: text("frequency").$type<SignalFrequency>(),
  userSegment: text("user_segment"),

  // Source attribution
  source: text("source").$type<SignalSource>().notNull(),
  sourceRef: text("source_ref"),
  sourceMetadata: jsonb("source_metadata").$type<SignalSourceMetadata>(),

  // Status tracking
  status: text("status").$type<SignalStatus>().notNull().default("new"),

  // AI processing (nullable, populated in Phase 15-16)
  embedding: text("embedding"),
  aiClassification: jsonb("ai_classification").$type<SignalClassification>(),

  // Provenance
  inboxItemId: text("inbox_item_id").references(() => inboxItems.id, { onDelete: "set null" }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});
```

### Junction Table with Metadata
```typescript
// Source: schema.ts pattern + 11-CONTEXT.md design
export const signalProjects = pgTable("signal_projects", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  signalId: text("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
  linkedBy: text("linked_by").references(() => users.id, { onDelete: "set null" }),
  linkReason: text("link_reason"),
  confidence: real("confidence"),
}, (table) => ({
  uniqueSignalProject: unique().on(table.signalId, table.projectId),
}));
```

### Relations Definition
```typescript
// Source: schema.ts lines 770-782 (workspacesRelations pattern)
export const signalsRelations = relations(signals, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [signals.workspaceId],
    references: [workspaces.id],
  }),
  projects: many(signalProjects),
  personas: many(signalPersonas),
  inboxItem: one(inboxItems, {
    fields: [signals.inboxItemId],
    references: [inboxItems.id],
  }),
}));

export const signalProjectsRelations = relations(signalProjects, ({ one }) => ({
  signal: one(signals, {
    fields: [signalProjects.signalId],
    references: [signals.id],
  }),
  project: one(projects, {
    fields: [signalProjects.projectId],
    references: [projects.id],
  }),
  linkedByUser: one(users, {
    fields: [signalProjects.linkedBy],
    references: [users.id],
  }),
}));
```

### Type Exports for index.ts
```typescript
// Source: index.ts lines 48-91 pattern
export type Signal = typeof schema.signals.$inferSelect;
export type NewSignal = typeof schema.signals.$inferInsert;

export type SignalProject = typeof schema.signalProjects.$inferSelect;
export type NewSignalProject = typeof schema.signalProjects.$inferInsert;

export type SignalPersona = typeof schema.signalPersonas.$inferSelect;
export type NewSignalPersona = typeof schema.signalPersonas.$inferInsert;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PostgreSQL serial | identity columns | Drizzle 0.31+ | Use `.generatedAlwaysAsIdentity()` for new integer PKs; this project uses text/nanoid |
| Array callback for unique | Object callback | Drizzle 0.31+ | `(table) => ({ name: unique().on(...) })` |
| Array callback for indexes | Either works | Drizzle 0.31+ | `(table) => [index(...)]` or `(table) => ({ idx: index(...) })` |

**Deprecated/outdated:**
- Old relations API (pre-v2): Use `defineRelations` for new code or maintain existing `relations()` pattern for consistency

## Open Questions

Things that couldn't be fully resolved:

1. **Drizzle Relations v2 vs v1**
   - What we know: v2 introduced `defineRelations` with `through()` for junction tables
   - What's unclear: Whether existing codebase should migrate to v2 or maintain v1 pattern
   - Recommendation: **Keep v1 pattern** for consistency with existing code (1000+ lines using `relations()`)

2. **Embedding Storage Format**
   - What we know: Existing `memoryEntries.embedding` uses base64-encoded text
   - What's unclear: Whether pgvector would be better for Phase 16 clustering
   - Recommendation: **Use text/base64** for now (matches existing pattern). Can migrate to pgvector later if needed.

3. **Index Necessity**
   - What we know: Indexes improve query performance
   - What's unclear: Exact query patterns until Phase 12 API is designed
   - Recommendation: **Add indexes** for workspace_id + status, workspace_id + source, workspace_id + created_at. Adjust in Phase 12 if needed.

## Verification Approach

How to confirm the schema works after implementation:

### 1. Schema Compilation
```bash
# Run TypeScript compilation
cd orchestrator && npm run build
# Should complete without errors
```

### 2. Migration Generation
```bash
# Generate migration
npm run db:generate
# Verify migration file created in ./drizzle/
# Review SQL for correctness
```

### 3. Migration Application (Dev)
```bash
# Apply to development database
npm run db:push
# Or for migration file approach:
npm run db:migrate
```

### 4. Type Inference Test
```typescript
// In a test file or REPL, verify types work:
import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";

// This should have full type inference:
const signal = await db.query.signals.findFirst({
  with: { workspace: true, projects: true }
});
// signal.verbatim should be string
// signal.severity should be SignalSeverity | null
```

### 5. Insert/Query Verification
```typescript
// Test insert
await db.insert(signals).values({
  workspaceId: "test-workspace",
  verbatim: "User said X",
  source: "interview",
});

// Test query with relations
const result = await db.query.signals.findMany({
  where: eq(signals.workspaceId, "test-workspace"),
  with: { workspace: true },
});
```

## Sources

### Primary (HIGH confidence)
- Existing schema.ts (1124 lines) - Pattern analysis for types, relations, JSONB
- drizzle.config.ts - Migration configuration
- queries.ts - Query patterns for relations and filtering
- [Drizzle ORM Indexes & Constraints](https://orm.drizzle.team/docs/indexes-constraints) - Index syntax
- [Drizzle Kit Generate](https://orm.drizzle.team/docs/drizzle-kit-generate) - Migration workflow

### Secondary (MEDIUM confidence)
- [Drizzle Relations v2](https://orm.drizzle.team/docs/relations-v2) - Junction table patterns
- [Drizzle PostgreSQL Best Practices 2025](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) - Community patterns

### Tertiary (LOW confidence)
- WebSearch results for pgvector - Not using, but documented for future reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against existing package.json and schema.ts
- Architecture: HIGH - Exact patterns from existing 1000+ line schema.ts
- Pitfalls: HIGH - Derived from Drizzle ORM documentation and existing patterns

**Research date:** 2026-01-22
**Valid until:** 60 days (schema patterns are stable)

---

## Gap Analysis: 11-CONTEXT.md Review

The design in 11-CONTEXT.md is well-aligned with research findings. Minor adjustments:

| Design Decision | Research Finding | Recommendation |
|-----------------|------------------|----------------|
| Index definitions (raw SQL in context) | Use Drizzle's `index()` function | Convert to Drizzle syntax |
| `signalPersonas.personaId` as text | Matches pattern (personas are strings, not FK) | Confirmed correct |
| Embedding as text (base64) | Matches `memoryEntries` pattern | Confirmed correct |
| Include junction tables in Phase 11 | Avoids migration dependencies | Confirmed correct |

**No gaps or risks identified.** The 11-CONTEXT.md design is ready for planning.
