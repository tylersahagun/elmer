# Phase 11 Context: Signal Schema & Storage

**Phase Goal:** Establish the data foundation for signals with schema, storage, and source tracking

## Gray Areas Analyzed

### 1. New `signals` Table vs Extending `inboxItems`

**Decision: Create new `signals` table**

The existing `inboxItems` table (schema.ts:1092-1123) serves a different purpose:
- `inboxItems` is for queued documents/transcripts waiting to be processed
- `signals` is for structured user feedback with provenance tracking

Key differences:
| Aspect | inboxItems | signals |
|--------|-----------|---------|
| Purpose | Queue of unprocessed inputs | Structured user evidence |
| Lifecycle | pending → processing → assigned/dismissed | new → reviewed → linked → archived |
| Content | Raw documents/transcripts | Verbatim + interpretation |
| Relationships | Assigns to 1 project | Links to many projects + personas |
| Processing | Temporary staging area | Permanent evidence store |

The `inboxItems` table can become the "ingestion queue" where webhooks/uploads land before being processed into `signals`.

### 2. Signal Fields Definition

Based on SGNL-01 requirements and FEATURES.md research:

```typescript
export const signals = pgTable("signals", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),

  // Core content
  verbatim: text("verbatim").notNull(),           // Original user quote/feedback
  interpretation: text("interpretation"),          // PM's "what this really means"

  // Structured extraction (populated by AI in Phase 15)
  severity: text("severity").$type<SignalSeverity>(),      // critical | high | medium | low
  frequency: text("frequency").$type<SignalFrequency>(),   // common | occasional | rare
  userSegment: text("user_segment"),                       // e.g., "enterprise", "SMB", "prosumer"

  // Source attribution (SGNL-07)
  source: text("source").$type<SignalSource>().notNull(),  // webhook | upload | paste | video | slack | pylon | email | interview
  sourceRef: text("source_ref"),                           // External reference (URL, ticket ID, etc.)
  sourceMetadata: jsonb("source_metadata").$type<SignalSourceMetadata>(),

  // Status tracking (SGNL-08)
  status: text("status").$type<SignalStatus>().notNull().default("new"),

  // AI processing fields (populated in Phase 15-16)
  embedding: text("embedding"),                    // Vector embedding for clustering (base64)
  aiClassification: jsonb("ai_classification").$type<SignalClassification>(),

  // Provenance (for Phase 18)
  inboxItemId: text("inbox_item_id").references(() => inboxItems.id, { onDelete: "set null" }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),          // When AI extraction completed
});
```

### 3. Source Types Enumeration

**Decision: Use text column with TypeScript union type (not enum)**

Following existing pattern in schema.ts (e.g., `JobType`, `ProjectStage`):

```typescript
export type SignalSource =
  | "webhook"    // From Ask Elephant or other integrations
  | "upload"     // File upload (PDF, CSV, TXT)
  | "paste"      // Manual paste entry
  | "video"      // YouTube/Loom caption fetch
  | "slack"      // Slack integration (Phase 14.6)
  | "pylon"      // Pylon support tickets (Phase 14.6)
  | "email"      // Email forwarding (future)
  | "interview"  // Manual interview notes
  | "other";     // Catch-all
```

This allows adding new sources without migrations.

### 4. Status Workflow

**Decision: Four-state lifecycle**

```typescript
export type SignalStatus = "new" | "reviewed" | "linked" | "archived";
```

State transitions:
- `new` → `reviewed`: User has read the signal
- `reviewed` → `linked`: Signal connected to project(s) or persona(s)
- `linked` → `archived`: Signal is no longer actively relevant
- Any state → `archived`: User archives directly

No hard enforcement of transitions - allows flexibility.

### 5. Severity and Frequency Values

**Decision: Standard enum values from FEATURES.md**

```typescript
export type SignalSeverity = "critical" | "high" | "medium" | "low";
export type SignalFrequency = "common" | "occasional" | "rare";
```

These are nullable - populated by AI extraction in Phase 15, or manually set.

### 6. Source Metadata Structure

**Decision: Flexible JSONB with typed interface**

```typescript
export interface SignalSourceMetadata {
  // Common fields
  sourceUrl?: string;           // Original URL if applicable
  sourceName?: string;          // Human-readable source name
  externalId?: string;          // ID in source system

  // Webhook-specific
  webhookId?: string;
  webhookName?: string;

  // Video-specific
  videoUrl?: string;
  videoPlatform?: "youtube" | "loom";
  videoTimestamp?: string;      // e.g., "2:34"

  // Slack-specific
  channelId?: string;
  channelName?: string;
  messageTs?: string;
  threadTs?: string;

  // Pylon-specific
  ticketId?: string;
  ticketStatus?: string;
  customerEmail?: string;

  // Interview-specific
  interviewDate?: string;
  interviewee?: string;

  // Raw data preservation
  rawPayload?: Record<string, unknown>;
}
```

### 7. Junction Tables for Associations

Phase 12.5 will need junction tables, but we define the FK constraints now:

```typescript
// signal_projects junction (Phase 12.5)
export const signalProjects = pgTable("signal_projects", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  signalId: text("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
  linkedBy: text("linked_by").references(() => users.id, { onDelete: "set null" }),
  linkReason: text("link_reason"),  // Why this signal relates to this project
  confidence: real("confidence"),    // AI confidence score (0-1) if auto-linked
}, (table) => ({
  uniqueSignalProject: unique().on(table.signalId, table.projectId),
}));

// signal_personas junction (Phase 12.5)
export const signalPersonas = pgTable("signal_personas", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  signalId: text("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
  personaId: text("persona_id").notNull(),  // References persona archetype name
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
  linkedBy: text("linked_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  uniqueSignalPersona: unique().on(table.signalId, table.personaId),
}));
```

**Note:** We include junction tables in Phase 11 schema to avoid migration dependencies in Phase 12.5.

### 8. AI Classification Structure

For Phase 16, but defined now:

```typescript
export interface SignalClassification {
  // Auto-classification result
  classifiedAt?: string;
  projectMatches?: Array<{
    projectId: string;
    projectName: string;
    confidence: number;
    matchReason?: string;
  }>;
  isNewInitiative?: boolean;
  suggestedInitiativeName?: string;

  // Cluster assignment (Phase 16)
  clusterId?: string;
  clusterName?: string;
}
```

### 9. Indexes for Query Performance

```typescript
// Recommended indexes
CREATE INDEX idx_signals_workspace_status ON signals(workspace_id, status);
CREATE INDEX idx_signals_workspace_source ON signals(workspace_id, source);
CREATE INDEX idx_signals_workspace_created ON signals(workspace_id, created_at DESC);
CREATE INDEX idx_signals_workspace_severity ON signals(workspace_id, severity) WHERE severity IS NOT NULL;
CREATE INDEX idx_signal_projects_project ON signal_projects(project_id);
CREATE INDEX idx_signal_personas_persona ON signal_personas(persona_id);
```

### 10. Relationship to Existing Tables

```
workspaces (existing)
    │
    ├── signals (NEW)
    │       │
    │       ├── signal_projects (NEW junction)
    │       │       └── projects (existing)
    │       │
    │       └── signal_personas (NEW junction)
    │               └── [persona names - not a table]
    │
    └── inboxItems (existing - becomes ingestion queue)
            │
            └── signals.inboxItemId (provenance link)
```

## Implementation Plan Summary

**Phase 11 will create:**

1. `signals` table with all core fields
2. `signal_projects` junction table (for Phase 12.5)
3. `signal_personas` junction table (for Phase 12.5)
4. Type exports for TypeScript
5. Relations for Drizzle ORM
6. Migration with indexes

**Phase 11 will NOT create:**
- API endpoints (Phase 12)
- UI components (Phase 12)
- Webhook handlers (Phase 13)
- AI processing logic (Phase 15)

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| New table vs extend inboxItems? | New `signals` table - different purpose |
| Source as enum or text? | Text with TypeScript union - extensible |
| Include junction tables? | Yes - avoid migration dependencies later |
| AI fields now or later? | Include now as nullable - schema stable |
| Embedding storage format? | Base64 text (matches existing memoryEntries pattern) |

---
*Context gathered: 2026-01-22*
*Phase: 11 - Signal Schema & Storage*
