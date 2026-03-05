# Memory Graph Architecture for Elmer

> Generated: 2026-03-04
> Sources: [Ansor](https://github.com/askelephant/ansor) (dynamic entity model + MCP), [Sven](https://github.com/AskElephant/elephant-ai/tree/sven) (knowledge graph with decay, traversal, communities)
> Purpose: Design a unified memory graph layer for Elmer that gives projects, context, memory, agents, and all entities dynamic relationships and dependencies

---

## What We're Drawing From

### Ansor: Dynamic Entity Model

| Feature | Implementation | What to Take |
|---------|---------------|-------------|
| Dynamic entity creation | `create_entity` with JSON Schema -> auto-creates PostgreSQL table | The ability to define new entity types at runtime without schema migrations |
| JSONB payload storage | One table per entity, `payload JSONB` with GIN index | Flexible field storage that doesn't require column changes |
| Schema evolution | Additive-only changes, versioned, branch-first migrations on Neon | Safe schema evolution without breaking existing data |
| MCP interface | Meta-tools: `query_records`, `create_record`, `update_record` | Universal CRUD via MCP for any entity type |
| Client-side graph projection | Consumers build graphs from relational references | Separation of storage from visualization |

### Sven: Knowledge Graph with Learning

| Feature | Implementation | What to Take |
|---------|---------------|-------------|
| Entity-relation-observation model | Entities connected by typed relations, with observations at depth levels | The core graph primitive: entities have typed edges, and observations layer detail |
| Novelty detection | Cosine similarity (>0.85 threshold) with embeddings | Only store genuinely new information; don't duplicate |
| Access reinforcement | Bump `access_weight` and `last_accessed` on read | Frequently accessed knowledge stays prominent |
| Decay mechanism | Entity-type decay rates, archive below threshold | Stale knowledge fades; keeps the graph relevant |
| Community detection | Louvain clustering via graphology | Automatically discover clusters of related entities |
| Graph analytics | PageRank, betweenness centrality | Identify the most important and bridging entities |
| Temporal validity | `valid_from`, `valid_to`, `superseded_by` | Knowledge changes over time; track which version is current |
| Hybrid search | FTS + vector similarity, reciprocal rank fusion | Find by keyword or meaning, rank by composite score |
| Graph traversal | BFS over relations (1-3 hops) | Navigate from one entity to related entities |
| Observation depth | L0 (summary) through L3 (deep detail) | Progressive disclosure: agents get summaries first, details on demand |
| MCP tools | add, search, deepen, traverse, forget, analyze, maintain | Full lifecycle management via MCP |

---

## Design: Unified Memory Graph for Elmer

### Core Principle

Every significant entity in Elmer -- projects, documents, signals, agents, people, decisions, evidence, context -- becomes a **node** in a shared knowledge graph. Relationships between them are **edges** with types and context. The graph evolves through use: accessed knowledge is reinforced, stale knowledge decays, and new connections are discovered through embedding similarity and community detection.

### Schema Addition to Elmer's PostgreSQL

These tables extend Elmer's existing schema. They don't replace the existing `projects`, `documents`, `signals` tables -- they add a graph layer on top that connects everything.

```sql
-- Graph nodes: every entity gets a graph presence
CREATE TABLE graph_nodes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- What this node represents
  entity_type TEXT NOT NULL,  -- 'project', 'document', 'signal', 'agent', 'person', 'decision', 'evidence', 'context', 'hypothesis', 'custom'
  entity_id TEXT,             -- FK to the source table (projects.id, documents.id, etc.)
  
  -- Graph metadata
  name TEXT NOT NULL,
  domain TEXT,                -- grouping (e.g., 'meeting-summary', 'company-context', 'infrastructure')
  category TEXT,              -- top-level category (e.g., 'initiative', 'research', 'team')
  
  -- Learning signals
  access_weight REAL NOT NULL DEFAULT 1.0,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed TIMESTAMP,
  decay_rate REAL NOT NULL DEFAULT 0.01,  -- per-day decay, varies by entity_type
  
  -- Analytics (computed)
  pagerank REAL,
  betweenness REAL,
  community_id TEXT,
  
  -- Temporal validity
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMP,         -- NULL = still valid
  superseded_by TEXT,          -- graph_nodes.id of replacement
  
  -- Embedding for similarity search
  embedding vector(1536),     -- pgvector, matches Elmer's existing embedding dimension
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graph_nodes_workspace ON graph_nodes(workspace_id);
CREATE INDEX idx_graph_nodes_entity ON graph_nodes(entity_type, entity_id);
CREATE INDEX idx_graph_nodes_domain ON graph_nodes(workspace_id, domain);
CREATE INDEX idx_graph_nodes_community ON graph_nodes(community_id);
CREATE INDEX idx_graph_nodes_embedding ON graph_nodes USING hnsw (embedding vector_cosine_ops);

-- Graph edges: typed relationships between nodes
CREATE TABLE graph_edges (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  from_node_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  to_node_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  
  -- Relationship semantics
  relation_type TEXT NOT NULL,  -- 'produced_by', 'depends_on', 'informs', 'validates', 'blocks', 'references', 'derived_from', 'relates_to'
  direction TEXT NOT NULL DEFAULT 'directed',  -- 'directed' or 'bidirectional'
  context TEXT,                -- optional description of why this relationship exists
  
  -- Strength and learning
  weight REAL NOT NULL DEFAULT 1.0,
  confidence REAL,             -- 0-1, how confident we are in this relationship
  source TEXT NOT NULL,        -- 'agent' (auto-created), 'human' (manually created), 'inferred' (from embeddings)
  
  -- Temporal
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMP,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(from_node_id, to_node_id, relation_type)
);

CREATE INDEX idx_graph_edges_from ON graph_edges(from_node_id);
CREATE INDEX idx_graph_edges_to ON graph_edges(to_node_id);
CREATE INDEX idx_graph_edges_type ON graph_edges(relation_type);

-- Observations: layered detail on nodes (from Sven's L0-L3 model)
CREATE TABLE graph_observations (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  depth INTEGER NOT NULL DEFAULT 0,  -- 0=summary, 1=key points, 2=details, 3=raw
  content TEXT NOT NULL,
  
  -- Temporal validity
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMP,
  superseded_by TEXT,           -- graph_observations.id
  
  -- Embedding for search
  embedding vector(1536),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graph_observations_node ON graph_observations(node_id);
CREATE INDEX idx_graph_observations_depth ON graph_observations(node_id, depth);
CREATE INDEX idx_graph_observations_embedding ON graph_observations USING hnsw (embedding vector_cosine_ops);

-- Community detection results
CREATE TABLE graph_communities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  name TEXT,                    -- auto-generated or human-named
  theme TEXT,                   -- LLM-generated description of what this community is about
  member_count INTEGER NOT NULL DEFAULT 0,
  
  computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Graph events: audit trail for graph changes
CREATE TABLE graph_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,     -- 'node_created', 'edge_created', 'observation_added', 'decay_applied', 'community_recomputed', 'node_archived'
  entity_id TEXT,               -- the node/edge/observation affected
  actor TEXT,                   -- 'agent:<agent_name>', 'human:<user_id>', 'system:decay', 'system:analytics'
  details JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graph_events_workspace ON graph_events(workspace_id);
CREATE INDEX idx_graph_events_entity ON graph_events(entity_id);
```

### How Existing Elmer Entities Map to Graph Nodes

When an entity is created in Elmer's existing tables, a corresponding graph node is automatically created. This is a materialized graph view, not a replacement of the source tables.

| Source Table | Graph `entity_type` | Auto-Created Edges | Decay Rate |
|-------------|--------------------|--------------------|------------|
| `projects` | `project` | None (root node) | 0.005/day (slow) |
| `documents` | `document` | `produced_for` -> project | 0.01/day |
| `signals` | `signal` | `linked_to` -> project (from signalProjects) | 0.02/day (faster) |
| `agentDefinitions` | `agent` | `operates_on` -> project (from executions) | 0.001/day (very slow) |
| `memoryEntries` | `memory` | `about` -> project | 0.015/day |
| `juryEvaluations` | `evaluation` | `evaluates` -> project | 0.01/day |
| `knowledgebaseEntries` | `context` | `informs` -> all projects | 0.002/day (very slow) |
| `prototypes` | `prototype` | `implements` -> project | 0.01/day |
| `stageRuns` | `execution` | `ran_on` -> project, `executed_by` -> agent | 0.03/day (fast) |
| Custom (user-defined) | `custom` | Defined at creation | Configurable |

### Relationship Types

| Relation Type | Meaning | Example |
|--------------|---------|---------|
| `produced_by` | Agent created this artifact | research.md `produced_by` research-analyzer |
| `depends_on` | This entity needs that entity to function | PRD `depends_on` research |
| `informs` | This entity provides context to that entity | company-context `informs` all projects |
| `validates` | This entity evaluates that entity | jury-evaluation `validates` prototype |
| `blocks` | This entity prevents progress on that entity | blocker `blocks` project |
| `references` | This entity mentions that entity | signal `references` project |
| `derived_from` | This entity was created using that entity | PRD `derived_from` hypothesis |
| `supersedes` | This entity replaces that entity | prototype-v2 `supersedes` prototype-v1 |
| `relates_to` | General association | signal `relates_to` signal (from embedding similarity) |

### Learning Mechanisms

**1. Novelty Detection (from Sven)**

Before adding a new observation or signal, check embedding similarity against existing content:

```
similarity = cosine_similarity(new_embedding, existing_embeddings)
if max(similarity) > 0.85:
    reinforce existing node instead of creating new one
    bump access_weight
else:
    create new node/observation
```

**2. Access Reinforcement (from Sven)**

When an agent reads a node (via graph query):

```
UPDATE graph_nodes
SET access_weight = access_weight * 1.1 + 0.1,
    access_count = access_count + 1,
    last_accessed = NOW()
WHERE id = :node_id
```

**3. Decay (from Sven)**

Daily maintenance job (Elmer already has `/api/cron/maintenance`):

```
UPDATE graph_nodes
SET access_weight = access_weight * (1 - decay_rate)
WHERE valid_to IS NULL
  AND last_accessed < NOW() - INTERVAL '1 day';

-- Archive nodes below threshold
UPDATE graph_nodes
SET valid_to = NOW()
WHERE access_weight < 0.1
  AND entity_type NOT IN ('project', 'agent', 'context');  -- never decay core entities
```

**4. Community Detection (from Sven)**

Periodic job (weekly or on-demand):

1. Load all active nodes and edges into graphology (in-memory)
2. Run Louvain community detection
3. Compute PageRank and betweenness centrality
4. Write results back to `graph_nodes.community_id`, `pagerank`, `betweenness`
5. Generate community themes via LLM
6. Write to `graph_communities`

**5. Inferred Relationships (new)**

When embeddings are similar but no explicit edge exists:

```
-- Find nodes with high embedding similarity but no edge
SELECT a.id, b.id, 1 - (a.embedding <=> b.embedding) as similarity
FROM graph_nodes a, graph_nodes b
WHERE a.workspace_id = b.workspace_id
  AND a.id != b.id
  AND 1 - (a.embedding <=> b.embedding) > 0.75
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges
    WHERE from_node_id = a.id AND to_node_id = b.id
  )
```

Create `relates_to` edges with `source = 'inferred'` and `confidence` = similarity score.

---

## MCP Tools for the Memory Graph

These tools would be added to Elmer's MCP server, giving PM workspace agents full graph access:

### Core CRUD

| Tool | Purpose |
|------|---------|
| `graph_add_node` | Create a node (with optional embedding generation) |
| `graph_add_edge` | Create a typed relationship between two nodes |
| `graph_add_observation` | Add an observation at a given depth to a node |
| `graph_update_node` | Update node metadata |
| `graph_remove_node` | Soft-delete (set `valid_to`) |
| `graph_remove_edge` | Remove a relationship |

### Search & Discovery

| Tool | Purpose |
|------|---------|
| `graph_search` | Hybrid search: FTS + vector similarity with RRF ranking |
| `graph_traverse` | BFS from a node, 1-3 hops, with optional relation type filter |
| `graph_find_related` | Find nodes similar by embedding to a query string |
| `graph_get_context` | Get all context relevant to a project: traverse its edges, collect observations at depth 0-1 |

### Analytics

| Tool | Purpose |
|------|---------|
| `graph_analyze` | Run PageRank, betweenness, communities; return top insights |
| `graph_communities` | List communities with themes and member counts |
| `graph_node_importance` | Get a node's PageRank, betweenness, community, and edge count |

### Lifecycle

| Tool | Purpose |
|------|---------|
| `graph_maintain` | Run decay, detect orphans, archive stale nodes, infer new edges |
| `graph_deepen` | Request more detail on a node: auto-generate L1-L3 observations from source data |

---

## How This Changes Agent Behavior

### Before (current PM workspace)

```
Agent starts ->
  Read local files (product-vision.md, _meta.json, prd.md) ->
  Do work ->
  Write local files (research.md, signals/) ->
  Done
```

Agents have no awareness of what other agents have done, what the graph of relationships looks like, or what knowledge is decaying vs thriving.

### After (with memory graph)

```
Agent starts ->
  graph_get_context(project_id) ->
    Returns: project node + all related nodes (research, signals, decisions, prototypes) at depth 0
    Ranked by: access_weight (recently used first), pagerank (important first)
    Includes: community context ("this project is part of the 'Revenue Intelligence' cluster") ->
  
  Do work (informed by graph context) ->
  
  graph_add_observation(project_node, depth=1, "Research found X, Y, Z") ->
  graph_add_edge(research_doc, 'produced_by', research_analyzer) ->
  graph_add_edge(research_doc, 'references', signal_1) ->
  graph_add_edge(research_doc, 'references', signal_2) ->
  
  Done (graph updated, relationships captured)
```

### Concrete Example: Research -> PRD -> Prototype Flow

1. `/research meeting-summary` runs:
   - `graph_get_context("meeting-summary")` returns project + 3 signals + 1 hypothesis + company context
   - Produces `research.md`
   - `graph_add_observation(project, depth=1, "Research TL;DR: ...")` 
   - `graph_add_edge(research_doc, 'derived_from', signal_1)`
   - `graph_add_edge(research_doc, 'derived_from', signal_2)`

2. `/pm meeting-summary` runs:
   - `graph_get_context("meeting-summary")` now returns project + research + 3 signals + hypothesis
   - Research node has high `access_weight` (just created and accessed)
   - Produces `prd.md`
   - `graph_add_edge(prd_doc, 'depends_on', research_doc)`
   - `graph_add_edge(prd_doc, 'derived_from', hypothesis)`

3. `/proto meeting-summary` runs:
   - `graph_get_context("meeting-summary")` returns full chain: project -> research -> PRD + visual directions + design brief
   - Graph analytics show this project is in the "Core Product" community
   - Builds prototype
   - `graph_add_edge(prototype, 'implements', prd_doc)`
   - `graph_add_edge(prototype, 'supersedes', prototype_v1)` (if iterating)

4. Meanwhile, decay is running:
   - Old signals from 3 months ago that were never linked to projects decay below threshold and get archived
   - The prototype-v1 that was superseded decays faster
   - Company context nodes barely decay at all (0.002/day)

5. Community detection discovers:
   - "Revenue Intelligence" cluster: meeting-summary, engagement-tracking, health-score
   - "Platform Infrastructure" cluster: global-chat, internal-search, settings-redesign
   - Agents can see: "this project is related to 3 other initiatives in the Revenue Intelligence cluster"

---

## Integration with Elmer's Existing Architecture

### Database Triggers (auto-create graph nodes)

When existing Elmer entities are created, graph nodes are auto-created via PostgreSQL triggers or Drizzle middleware:

```typescript
// In Elmer's project creation flow
async function createProject(data) {
  const project = await db.insert(projects).values(data).returning();
  
  // Auto-create graph node
  await db.insert(graphNodes).values({
    id: nanoid(),
    workspaceId: data.workspaceId,
    entityType: 'project',
    entityId: project.id,
    name: project.name,
    domain: project.metadata?.domain,
    category: 'initiative',
    decayRate: 0.005,
    embedding: await generateEmbedding(project.name + ' ' + project.description),
  });
  
  return project;
}
```

### API Routes (new)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/graph/nodes` | GET, POST | List/create graph nodes |
| `/api/graph/nodes/[id]` | GET, PATCH, DELETE | Node CRUD |
| `/api/graph/edges` | GET, POST | List/create edges |
| `/api/graph/edges/[id]` | DELETE | Remove edge |
| `/api/graph/search` | POST | Hybrid search |
| `/api/graph/traverse` | POST | BFS traversal |
| `/api/graph/context/[projectId]` | GET | Get full context for a project |
| `/api/graph/analyze` | POST | Run analytics |
| `/api/graph/maintain` | POST | Run maintenance |
| `/api/graph/communities` | GET | List communities |
| `/api/graph/observations` | POST | Add observation to node |

### UI Components (new)

| Component | Purpose |
|-----------|---------|
| **GraphVisualization** | Interactive force-directed graph of nodes and edges (d3 or vis.js) |
| **ProjectContextPanel** | Show all related entities for a project, ranked by importance |
| **CommunityBrowser** | Browse auto-detected communities and their themes |
| **NodeDetailPanel** | View observations at all depths, access history, related nodes |
| **GraphSearchBar** | Hybrid search across the entire graph |
| **RelationshipEditor** | Manually add/remove edges between entities |

### Cron Jobs (extend existing)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `/api/cron/maintenance` (existing) | Daily | Add: decay, orphan detection, archive stale nodes |
| `/api/cron/graph-analytics` (new) | Weekly | Community detection, PageRank, betweenness, inferred edges |
| `/api/cron/graph-embeddings` (new) | On signal/document creation | Generate embeddings for new nodes and observations |

---

## What This Replaces

| Current System | Replaced By | Migration |
|---------------|------------|-----------|
| Ansor `project_registry` | Elmer `projects` + graph node | Import Ansor records as projects |
| Ansor `evidence_item` | Elmer `signals` + graph node | Import as signals with graph edges |
| Ansor `decision_record` | Elmer `memoryEntries` (type: decision) + graph node | Import as memory entries |
| Ansor `action_item_candidate` | Elmer `notifications` + graph node | Import as notification/inbox items |
| Ansor `person` | Elmer `users` + `workspaceMembers` + graph node | Map to workspace members |
| PM workspace `signals/_index.json` | Elmer `signals` table + graph edges | Import signals |
| PM workspace `_meta.json` relationships | Graph edges between project and its artifacts | Auto-created on sync |
| PM workspace `company-context/` files | Elmer `knowledgebaseEntries` + graph nodes | Import to knowledge base |

---

## Phase into Option 3 Roadmap

This memory graph design slots into the Option 3 phases as follows:

- **Phase 1 (MCP Bridge):** Add graph tables to Elmer schema. Implement basic graph MCP tools (`graph_add_node`, `graph_add_edge`, `graph_search`, `graph_get_context`). Auto-create graph nodes when projects/documents/signals are created.

- **Phase 2 (Write-Through):** Update PM workspace agents to call graph tools when producing artifacts. Build relationship chains as agents work.

- **Phase 3 (Team Access):** Build graph visualization UI. Community browser. Project context panel in project detail view.

- **Phase 4 (Autonomy):** Wire decay + analytics into cron jobs. Orchestrator uses graph to understand initiative dependencies. Inferred edges discover hidden connections.

- **Phase 5 (Evals):** Use graph analytics for agent evaluation: did the agent create appropriate edges? Did it access relevant context? Is the graph growing healthily?
