# Engineering Spec: Universal Signal Tables

## Technical Overview

Universal Signal Tables extends our existing Signals infrastructure to support ad-hoc, user-defined extraction patterns organized as tables. This is NOT a rewrite — it builds on current annotation/signal extraction, adding a table abstraction layer and chat-based configuration.

**Key architectural principle:** Tables are views + column definitions. Extraction uses existing signal infrastructure. We're adding composition, not new extraction capabilities.

---

## Data Model Changes

### New Entities

#### `SignalTable`
```typescript
interface SignalTable {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  
  // Filter configuration
  filters: TableFilters;
  
  // Column definitions (max 5 for MVP)
  columns: TableColumn[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastRunAt: Date | null;
  status: 'draft' | 'running' | 'complete' | 'error';
}

interface TableFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  repIds?: string[];
  meetingTypes?: string[];
  keywords?: string[];
}

interface TableColumn {
  id: string;
  name: string;
  prompt: string;
  outputType: 'text' | 'boolean' | 'select' | 'number';
  order: number;
  
  // Conditional execution
  condition?: {
    dependsOnColumnId: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string;
  };
}
```

#### `SignalTableResult`
```typescript
interface SignalTableResult {
  id: string;
  tableId: string;
  engagementId: string;
  
  // Column results keyed by columnId
  columnResults: Record<string, ColumnResult>;
  
  createdAt: Date;
}

interface ColumnResult {
  value: string | boolean | number | null;
  status: 'pending' | 'complete' | 'error' | 'skipped';
  errorMessage?: string;
  tokensUsed?: number;
}
```

### Database Schema

```sql
-- Tables
CREATE TABLE signal_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  columns JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'draft'
);

-- Results (one row per engagement per table)
CREATE TABLE signal_table_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES signal_tables(id) ON DELETE CASCADE,
  engagement_id UUID NOT NULL REFERENCES engagements(id),
  column_results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, engagement_id)
);

-- Indexes
CREATE INDEX idx_signal_tables_user ON signal_tables(user_id);
CREATE INDEX idx_signal_tables_workspace ON signal_tables(workspace_id);
CREATE INDEX idx_signal_table_results_table ON signal_table_results(table_id);
```

---

## API Changes

### GraphQL Schema Additions

```graphql
type SignalTable {
  id: ID!
  name: String!
  filters: TableFilters!
  columns: [TableColumn!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  lastRunAt: DateTime
  status: TableStatus!
  
  # Computed
  matchingEngagementCount: Int!
  results(limit: Int, offset: Int): SignalTableResultConnection!
}

type TableFilters {
  dateStart: DateTime!
  dateEnd: DateTime!
  repIds: [ID!]
  meetingTypes: [String!]
  keywords: [String!]
}

type TableColumn {
  id: ID!
  name: String!
  prompt: String!
  outputType: ColumnOutputType!
  order: Int!
  condition: ColumnCondition
}

type ColumnCondition {
  dependsOnColumnId: ID!
  operator: ConditionOperator!
  value: String!
}

enum ColumnOutputType {
  TEXT
  BOOLEAN
  SELECT
  NUMBER
}

enum ConditionOperator {
  EQUALS
  NOT_EQUALS
  CONTAINS
}

enum TableStatus {
  DRAFT
  RUNNING
  COMPLETE
  ERROR
}

# Mutations
type Mutation {
  createSignalTable(input: CreateSignalTableInput!): SignalTable!
  updateSignalTable(id: ID!, input: UpdateSignalTableInput!): SignalTable!
  deleteSignalTable(id: ID!): Boolean!
  
  runSignalTable(id: ID!): SignalTable!
  runSignalTablePreview(id: ID!, sampleSize: Int = 5): [SignalTableResult!]!
}

# Queries
type Query {
  signalTable(id: ID!): SignalTable
  signalTables(workspaceId: ID!): [SignalTable!]!
  signalTableMatchingEngagements(
    filters: TableFiltersInput!
    limit: Int
    offset: Int
  ): EngagementConnection!
}
```

### REST Endpoints (if needed for integrations)

```
POST   /api/v1/tables                    # Create table
GET    /api/v1/tables                    # List tables
GET    /api/v1/tables/:id                # Get table
PATCH  /api/v1/tables/:id                # Update table
DELETE /api/v1/tables/:id                # Delete table
POST   /api/v1/tables/:id/run            # Run extraction
POST   /api/v1/tables/:id/preview        # Preview on sample
GET    /api/v1/tables/:id/results        # Get results (paginated)
```

---

## Frontend Components

### New Components

```
src/components/
└── SignalTables/
    ├── SignalTablesList/           # Saved tables grid
    │   ├── index.tsx
    │   ├── TableCard.tsx
    │   └── EmptyState.tsx
    │
    ├── SignalTableBuilder/         # Main builder experience
    │   ├── index.tsx
    │   ├── FilterPanel.tsx         # Left: filter configuration
    │   ├── TablePreview.tsx        # Center: table view
    │   ├── BuilderPanel.tsx        # Right: column configuration
    │   ├── ChatInput.tsx           # Bottom: chat interface
    │   └── ColumnEditor.tsx        # Column prompt editing
    │
    ├── SignalTableView/            # View saved table results
    │   ├── index.tsx
    │   ├── TableHeader.tsx
    │   ├── TableRow.tsx
    │   └── ColumnCell.tsx
    │
    └── shared/
        ├── ColumnTemplates.tsx     # Pre-built column templates
        ├── ConditionEditor.tsx     # Conditional execution UI
        └── ProgressIndicator.tsx   # Extraction progress
```

### State Management

Use existing patterns (React Query for server state, Zustand for UI state).

```typescript
// React Query keys
const tableKeys = {
  all: ['signalTables'] as const,
  list: (workspaceId: string) => [...tableKeys.all, 'list', workspaceId] as const,
  detail: (id: string) => [...tableKeys.all, 'detail', id] as const,
  results: (id: string) => [...tableKeys.all, 'results', id] as const,
};

// Zustand store for builder UI state
interface TableBuilderState {
  activePanel: 'filters' | 'builder' | 'chat';
  selectedColumnId: string | null;
  chatHistory: ChatMessage[];
  // ...
}
```

---

## Backend Services

### Extraction Pipeline

Leverage existing signal extraction infrastructure:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ runSignalTable  │────▶│ Queue Jobs      │────▶│ Process Column  │
│ mutation        │     │ (per engagement │     │ (uses existing  │
└─────────────────┘     │  per column)    │     │  signal extract)│
                        └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │ Check Condition │
                                                │ (skip if unmet) │
                                                └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │ Store Result    │
                                                │ (signal_table_  │
                                                │  results)       │
                                                └─────────────────┘
```

### Job Processing

```typescript
// functions/src/contexts/signalTables/processTableColumn.ts

interface TableColumnJob {
  tableId: string;
  engagementId: string;
  columnId: string;
  prompt: string;
  condition?: ColumnCondition;
}

async function processTableColumn(job: TableColumnJob) {
  // 1. Check condition (if exists)
  if (job.condition) {
    const dependsOnResult = await getColumnResult(
      job.tableId, 
      job.engagementId, 
      job.condition.dependsOnColumnId
    );
    
    if (!evaluateCondition(dependsOnResult, job.condition)) {
      return saveResult(job, { status: 'skipped', value: null });
    }
  }
  
  // 2. Get transcript
  const transcript = await getTranscript(job.engagementId);
  
  // 3. Run extraction (reuse existing signal extraction)
  const result = await extractSignal({
    transcript,
    prompt: job.prompt,
  });
  
  // 4. Save result
  return saveResult(job, {
    status: 'complete',
    value: result.value,
    tokensUsed: result.tokensUsed,
  });
}
```

### Chat Integration

Integrate with Global Chat patterns for AI-assisted table building:

```typescript
// Parse user intent → generate column configuration
async function parseTableIntent(userMessage: string): Promise<ColumnSuggestion> {
  const response = await llm.complete({
    system: `You help users create data extraction columns for sales call analysis.
             Given a user request, output a column configuration.`,
    user: userMessage,
    schema: columnConfigSchema,
  });
  
  return response;
}
```

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Engagement data pipeline | ✅ Exists | No changes needed |
| Transcript storage | ✅ Exists | No changes needed |
| Signal extraction | ✅ Exists | Reuse for column processing |
| Global Chat | 🔄 Jan 9 | For chat UI patterns |
| Job queue (Cloud Tasks) | ✅ Exists | For async extraction |

---

## Migration Strategy

### Phase 1: Schema + API (Week 1)
- Add database tables
- Implement GraphQL schema
- Basic CRUD operations

### Phase 2: Extraction Pipeline (Week 1-2)
- Table run job processing
- Conditional execution logic
- Progress tracking

### Phase 3: Frontend MVP (Week 2-3)
- Builder UI components
- Table view
- Chat integration (basic)

### Phase 4: Polish (Week 3-4)
- Templates
- Error handling
- Performance optimization

---

## Testing Strategy

### Unit Tests
- Column condition evaluation
- Filter query building
- Result aggregation

### Integration Tests
- Full table creation → run → results flow
- Conditional execution chains
- Concurrent job processing

### E2E Tests
- Create table via UI
- Add columns, run, view results
- Chat-based column creation

### Performance Tests
- Large table extraction (1000+ engagements)
- Concurrent table runs
- Result pagination

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Token cost explosion | Medium | High | 5-column limit; conditional execution; preview before full run |
| Slow extraction on large tables | Medium | Medium | Background processing; progress UI; job prioritization |
| Column order dependencies | Low | Medium | Validate DAG before running; clear error if circular |
| Chat misinterpretation | Medium | Low | Always show generated config; easy manual editing |

---

## Monitoring & Observability

### Metrics to Track
- Tables created per workspace per day
- Columns per table (distribution)
- Extraction job duration (p50, p95, p99)
- Token usage per table
- Error rates by column type
- Conditional skip rates

### Alerts
- Extraction job failure rate > 5%
- Job queue depth > 1000
- p95 extraction time > 30s

---

## Open Technical Questions

1. **Job ordering**: How do we ensure column dependencies execute in order? (Proposed: topological sort on column DAG)
2. **Partial results**: Show results as they complete, or wait for full table?
3. **Re-run behavior**: Full replace or incremental update for new engagements only?
4. **Caching**: Cache extraction results? How long? Per engagement + prompt hash?

---

*Last updated: 2026-01-07*
*Engineering Lead: Dylan (post Global Chat)*

