# PM Workspace ↔ Elmer: Full MCP Coverage + Architecture Decision

> Generated: 2026-03-04
> Sources: Full audit of .cursor/ (68 commands, 22 agents, 41 skill files, 5 rules), pm-workspace-docs/ (21 initiatives, 14 context files, 13 feature guides), Elmer sync logic
> Answers: Should agent definitions be hardcoded or persistent memory? How does MCP cover everything in both systems?

---

## The Root Problem

Elmer's current sync reads approximately **1% of what the PM workspace actually contains**.

| What Elmer Reads | What Elmer Misses |
|-----------------|------------------|
| `.cursor/agents/*.md` (22 files) | `.cursor/skills/*/component-registry.md`, `interactive-patterns.md`, `report-templates.md`, and all other non-SKILL.md skill files |
| `.cursor/skills/*/SKILL.md` (33 files) | `.cursor/mcp.json` (which external MCP servers are wired) |
| `.cursor/commands/*.md` (68 files) | All `pm-workspace-docs/initiatives/active/` (21 initiatives, each with `_meta.json`, `prd.md`, `research.md`, etc.) |
| `.cursor/rules/*.mdc` (5 files) | `pm-workspace-docs/signals/` (all signal history) |
| `company-context/` (only with `syncFullFolders: true`, not default) | `pm-workspace-docs/feature-guides/` (13 feature guides) |
| `roadmap/roadmap.md` (only when explicitly enabled) | `pm-workspace-docs/the-grand-apparatus/` (all architecture docs) |
| Root `AGENTS.md` | `pm-workspace-docs/hypotheses/` (all hypotheses) |
| | `pm-workspace-docs/personas/` (jury personas) |
| | `pm-workspace-docs/research/` (synthesis, brainstorms) |
| | `pm-workspace-docs/audits/` (Slack routing, PostHog audit, Linear audit) |
| | `pm-workspace-docs/workflows/` (workspace-config.yaml, workflow.yaml) |
| | `pm-workspace-docs/runbooks/` (operational procedures) |

This means: when an agent in Elmer runs, it has no knowledge of what initiatives exist, what the current research says, what signals have been ingested, or what the feature guides contain. It's operating blind.

---

## The Architecture Question: Hardcoded vs. Persistent Memory

**Should commands, skills, rules, agents, and PM workspace context be hardcoded in the MCP server, or stored as persistent memory?**

### Option A: Hardcode in MCP Server

```typescript
// Hardcoded -- requires redeploy to update
const COMMANDS = {
  "/proto": "Build a Storybook prototype...",
  "/research": "Analyze transcripts...",
  // ... 68 commands
};
```

**Problems:**
- Any edit to a command requires a server redeploy
- The MCP server becomes a static snapshot of the PM workspace at deploy time
- Agents calling `elmer_get_command` get stale data
- Different environments (dev, staging, prod) drift
- PM workspace evolves daily; this would be stale within hours

**Verdict: No.**

---

### Option B: Sync Once to Database (Elmer's current approach, incomplete)

The current sync runs on-demand via `POST /api/agents/sync`. It reads `.cursor/` files and stores them as `agentDefinitions` records. PM workspace docs are registered as path pointers but content isn't fetched.

**Problems:**
- Still requires manual re-sync when things change
- The sync has critical gaps (see table above)
- pm-workspace-docs content is a path pointer, not actual data
- No relationship between commands, the agents they delegate to, the skills they invoke, or the context they depend on

**Verdict: Better than hardcoded, but incomplete.**

---

### Option C: Persistent Memory with Change Tracking (Recommended)

Agent definitions (commands, skills, rules, agents) and all PM workspace context live in **the memory graph as first-class nodes**. Changes are tracked over time. The MCP server reads live from the graph.

```
Memory Graph Node Types:
  command_definition  (68 nodes)  ← from .cursor/commands/
  agent_definition    (22 nodes)  ← from .cursor/agents/
  skill_definition    (33 nodes)  ← from .cursor/skills/*/SKILL.md
  skill_reference     (~8 nodes)  ← component-registry, interactive-patterns, templates
  rule_definition     (5 nodes)   ← from .cursor/rules/
  context_file        (14 nodes)  ← from company-context/
  initiative          (21 nodes)  ← from initiatives/active/
  feature_guide       (13 nodes)  ← from feature-guides/
  hypothesis          (N nodes)   ← from hypotheses/
  signal              (N nodes)   ← from signals/
  research_synthesis  (N nodes)   ← from research/synthesis/
  architecture_doc    (10 nodes)  ← from the-grand-apparatus/
  persona             (N nodes)   ← from personas/
  workflow_config     (2 nodes)   ← from workflows/
```

**Why this is correct:**
1. **Versioned.** Every node has `valid_from`, `valid_to`, `superseded_by`. When you update `/proto`, the old version is archived, the new version is live. Agents always read the current version.
2. **Relational.** `command_definition:/proto` has edges: `delegates_to → agent_definition:prototype-builder`, `uses_skill → skill_definition:prototype-system`, `reads_context → context_file:product-vision.md`, `produces → initiative.prototype_notes`.
3. **Self-describing.** An agent calling `elmer_get_command("/proto")` gets back the command content AND its full graph context: which agent it delegates to, what skills it uses, what context it needs, what it produces.
4. **Live.** A webhook on the pm-workspace repo triggers a re-sync on every commit. The memory graph is always current.
5. **Queryable.** `elmer_search("how do I build a prototype")` finds the `/proto` command, the `prototype-builder` agent, the `prototype-system` skill, and any relevant initiative docs -- all from one query.
6. **Agents improve themselves.** The memory graph can store observations on command nodes: "This command frequently fails when PRD doesn't exist → add prerequisite check." This feeds back into how the command is described and triggered.

---

## The Full Sync Model

### Two Sync Triggers

**1. Git Webhook (automated, on push to pm-workspace)**

```
pm-workspace git push → webhook → Elmer
→ diff: which files changed?
→ for each changed file:
    if .cursor/commands/: update command_definition node
    if .cursor/agents/: update agent_definition node
    if .cursor/skills/: update skill_definition node
    if .cursor/rules/: update rule_definition node
    if pm-workspace-docs/company-context/: update context_file node
    if pm-workspace-docs/initiatives/active/*/: update initiative node
    if pm-workspace-docs/feature-guides/: update feature_guide node
    if pm-workspace-docs/hypotheses/: update hypothesis node
    if pm-workspace-docs/signals/: update signal node
    if pm-workspace-docs/research/: update research_synthesis node
    archive old node version, create new version with superseded_by edge
```

**2. Manual full sync (`POST /api/agents/sync?full=true`)**

Crawls the entire repo tree recursively. Used for initial import and drift recovery.

---

### What Gets Synced (Complete)

| Path Pattern | Node Type | Current Status | Target |
|-------------|-----------|---------------|--------|
| `.cursor/commands/*.md` | `command_definition` | Synced (flat only) | Synced with full content + graph edges |
| `.cursor/agents/*.md` | `agent_definition` | Synced (flat only) | Synced with full content + graph edges |
| `.cursor/skills/*/SKILL.md` | `skill_definition` | Synced (SKILL.md only) | Synced |
| `.cursor/skills/*/*` (non-SKILL.md) | `skill_reference` | **MISSING** | Add to sync |
| `.cursor/rules/*.mdc` | `rule_definition` | Synced | Synced |
| `.cursor/mcp.json` | `mcp_config` | **MISSING** | Add to sync |
| `pm-workspace-docs/company-context/` | `context_file` | Optional, non-default | Always sync |
| `pm-workspace-docs/initiatives/active/*/` | `initiative` | **MISSING** | Always sync |
| `pm-workspace-docs/initiatives/active/*/_meta.json` | `initiative_meta` | **MISSING** | Always sync |
| `pm-workspace-docs/initiatives/active/*/prd.md` | `document` | **MISSING** | Always sync |
| `pm-workspace-docs/initiatives/active/*/research.md` | `document` | **MISSING** | Always sync |
| `pm-workspace-docs/feature-guides/*.md` | `feature_guide` | **MISSING** | Always sync |
| `pm-workspace-docs/hypotheses/` | `hypothesis` | **MISSING** | Always sync |
| `pm-workspace-docs/personas/` | `persona` | **MISSING** | Always sync |
| `pm-workspace-docs/research/synthesis/` | `research_synthesis` | **MISSING** | Always sync |
| `pm-workspace-docs/roadmap/roadmap.json` | `roadmap` | Optional, non-default | Always sync |
| `pm-workspace-docs/audits/` | `audit_doc` | **MISSING** | Sync on demand |
| `pm-workspace-docs/workflows/` | `workflow_config` | **MISSING** | Always sync |
| `pm-workspace-docs/the-grand-apparatus/` | `architecture_doc` | **MISSING** | Sync on demand |

---

## Graph Edges Created at Sync Time

When a command is synced, its content is parsed and edges are created automatically:

```
command_definition:/proto
  --[delegates_to]-->     agent_definition:prototype-builder
  --[uses_skill]-->       skill_definition:prototype-system
  --[uses_skill]-->       skill_definition:prototype-notification
  --[reads_context]-->    context_file:product-vision.md
  --[reads_context]-->    context_file:personas.md
  --[produces]-->         (document_type:prototype_notes)
  --[requires_artifact]-> (document_type:prd)
  --[human_gate]-->       confirm

agent_definition:prototype-builder
  --[uses_skill]-->       skill_definition:prototype-system
  --[calls_mcp]-->        mcp_server:figma
  --[reads_context]-->    context_file:product-vision.md
  --[reads_initiative]->  (initiative.prd, initiative.design-brief)
  --[writes_to]-->        initiative.prototype_notes
  --[triggers]-->         skill_definition:prototype-notification
```

This makes the relationship graph traversable: "Show me everything that touches the prototype-builder agent" returns the 2 commands that invoke it, the 3 skills it uses, the 2 MCP servers it calls, and the 21 initiatives it has produced prototypes for.

---

## MCP Tools for PM Workspace Context

Add these to the existing 72-tool catalog:

### Domain: PM Workspace Agent System (NEW)

| Tool | What It Does |
|------|-------------|
| `elmer_list_commands` | List all 68 slash commands with name, description, human gate, triggers |
| `elmer_get_command` | Get full command definition with content + graph edges (delegates_to, uses_skill, etc.) |
| `elmer_search_commands` | Semantic search across command definitions |
| `elmer_list_agents_pm` | List all 22 PM workspace agent definitions |
| `elmer_get_agent_pm` | Get full agent definition with content + all connected commands, skills, MCP servers |
| `elmer_list_skills` | List all 33 skill packages with triggers and purpose |
| `elmer_get_skill` | Get full skill definition including all reference files (component-registry, templates) |
| `elmer_list_rules` | List all 5 rules with globs and alwaysApply status |
| `elmer_get_rule` | Get full rule definition |
| `elmer_get_mcp_config` | Get all configured MCP servers and their available tools |
| `elmer_sync_pm_workspace` | Trigger full re-sync of pm-workspace repo to memory graph |
| `elmer_get_pm_workspace_diff` | Show what changed since last sync |

### Domain: PM Workspace Context (NEW)

| Tool | What It Does |
|------|-------------|
| `elmer_get_initiative` | Get full initiative context: _meta.json + all documents + linked signals + jury results |
| `elmer_list_initiatives` | List all 21 active initiatives with phase, status, priority, artifact completeness |
| `elmer_get_initiative_document` | Get a specific document (prd, research, design-brief, etc.) for an initiative |
| `elmer_get_feature_guide` | Get a feature guide document |
| `elmer_list_feature_guides` | List all 13 feature guides |
| `elmer_get_hypothesis` | Get a hypothesis with evidence and status |
| `elmer_list_hypotheses` | List hypotheses by status (active, validated, committed, retired) |
| `elmer_get_persona` | Get a specific persona definition |
| `elmer_list_personas` | List all personas (jury system personas included) |
| `elmer_get_roadmap` | Get current roadmap with all initiatives by phase |
| `elmer_get_workflow_config` | Get workspace-config.yaml and workflow.yaml |

### Updated Total: 95 MCP Tools

| Domain | Tools | Priority |
|--------|-------|---------|
| Projects | 13 | P0 |
| Signals | 14 | P0 |
| Agents (Elmer) | 5 | P0 |
| Jobs | 9 | P0 |
| Knowledge Base | 5 | P0 |
| Memory | 3 | P0 |
| **PM Workspace Agent System** | **12** | **P0** |
| **PM Workspace Context** | **11** | **P0** |
| Notifications | 4 | P1 |
| Pipeline | 5 | P1 |
| Graph | 7 | P1 |
| Workspace | 5 | P1 |
| Discovery | 2 | P2 |
| **Total** | **95** | |

---

## MCP Apps: Dynamic UI from Live Memory Graph

Every MCP App reads from the live memory graph, not hardcoded data. This means the UI updates automatically when the PM workspace changes.

### App 6: PM Workspace Navigator

**Tool:** `elmer_list_commands` — renders an interactive catalog of all 68 commands, organized by phase.

```
┌─────────────────────────────────────────────────────────────────┐
│  PM Workspace  ·  68 commands  ·  22 agents  ·  33 skills       │
│                                                                  │
│  [Commands] [Agents] [Skills] [Rules] [Context]    🔍 Search    │
│                                                                  │
│  Commands by Phase                                               │
│                                                                  │
│  Phase 0: Signals (6)          Phase 1: Analysis (7)            │
│  /ingest  /synthesize          /research  /hypothesis            │
│  /triage  /slack-monitor       /context-review                   │
│  /gmail   /status-all          /synthesize  /status              │
│                                                                  │
│  Phase 2: Definition (8)       Phase 3: Build (6)               │
│  /pm      /metrics             /proto  /proto-audit              │
│  /design  /landscape           /iterate  /figma-sync             │
│  /visual-design /brainstorm    /placement  /figjam               │
│                                                                  │
│  Selected: /proto ───────────────────────────────────────────── │
│  Delegates to: prototype-builder                                 │
│  Uses skills: prototype-system, prototype-notification           │
│  Human gate: confirm                                             │
│  Requires: prd.md exists                                         │
│  Produces: prototype_notes, Chromatic URL                        │
│                                [Run on Project ▾] [View Agent]  │
└─────────────────────────────────────────────────────────────────┘
```

Clicking "Run on Project" calls `elmer_run_agent` with the selected project. The UI knows which agent to trigger because it traversed the `delegates_to` edge from the command node.

---

### App 7: Initiative Context View

**Tool:** `elmer_get_initiative` — renders full initiative context inline.

```
┌─────────────────────────────────────────────────────────────────┐
│  meeting-summary  ·  Build  ·  P1  ·  Tyler                     │
│                                                                  │
│  Documents                     Signals (8)                       │
│  ✓ research.md    Mar 1        ● Export needed       high       │
│  ✓ prd.md         Mar 2        ● Digest format       med        │
│  ✓ design-brief   Mar 2        ● Meeting context ×6  high       │
│  ✓ prototype v2   Mar 3                                          │
│  ✗ feature-guide  —            Hypothesis                        │
│  ✗ gtm-brief      —            "AI summary → action"  validated  │
│                                                                  │
│  Context Chain (memory graph)                                    │
│  signals×8 → research → prd → prototype → jury(84%)            │
│                                                                  │
│  Next Steps (from orchestrator)                                  │
│  → Run feature-guide  [Run Now]                                  │
│  → Run gtm-brief      [Run Now]                                  │
│  → Advance to Validate [Check Graduation Criteria]              │
│                                                                  │
│  [Open in Elmer]  [View in Cursor]  [Share Link]                │
└─────────────────────────────────────────────────────────────────┘
```

---

### App 8: Agent & Skill Inspector

**Tool:** `elmer_get_agent_pm` — renders an agent definition with full relationship map.

```
┌─────────────────────────────────────────────────────────────────┐
│  prototype-builder                         subagent · inherit    │
│                                                                  │
│  Triggered by: /proto, /proto --lofi                            │
│  Human gate: confirm                                             │
│                                                                  │
│  Relationship Map                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  /proto ──[delegates_to]──► prototype-builder            │   │
│  │                                  │                       │   │
│  │              ┌───────────────────┼───────────────────┐   │   │
│  │              ▼                   ▼                   ▼   │   │
│  │     prototype-system    prototype-notification    figma   │   │
│  │     (skill)             (skill)                   (MCP)   │   │
│  │              │                                            │   │
│  │   ┌──────────┼──────────────┐                           │   │
│  │   ▼          ▼              ▼                           │   │
│  │ component  interactive    initiative                    │   │
│  │ -registry  -patterns      .prd, .design-brief           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Context Required                                                │
│  product-vision.md  prd.md  design-brief.md                     │
│  figma-language.md  visual-directions.md                         │
│                                                                  │
│  Recent Executions (4)                        [Execute ▾]       │
│  ✓ meeting-summary  Mar 3  v2  84% jury                         │
│  ✓ global-chat      Feb 28  v1  pending                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## The `@mcp-ui/client` Pattern for Elmer's Web UI

[MCP-UI](https://mcpui.dev) (now standardized into MCP Apps per [SEP-1865](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1865)) provides `AppRenderer` for embedding MCP App views directly into a React host. This means Elmer's web UI can render MCP Apps **inline** using the same components that Claude Desktop renders:

```tsx
// In Elmer's project detail page
import { AppRenderer } from '@mcp-ui/client';

function ProjectPrototypesTab({ project, mcpClient }) {
  return (
    <AppRenderer
      client={mcpClient}
      toolName="elmer_get_project"
      toolInput={{ projectId: project.id }}
      toolResult={projectData}
      sandbox={{ url: sandboxProxyUrl }}
      onOpenLink={({ url }) => window.open(url)}
      onMessage={(params) => handleAgentMessage(params)}
    />
  );
}
```

This creates a **single source of truth for UI**: the MCP App is the UI component, whether it's rendering inside Claude Desktop, Cursor, or Elmer's own web interface. Elmer becomes a host, not a separate UI layer.

---

## Revised Architecture: Three-Layer Sync

```
Layer 1: Source (pm-workspace GitHub repo)
  .cursor/commands/ (68) ──┐
  .cursor/agents/  (22) ──┤
  .cursor/skills/  (33) ──┤──→ Git webhook / manual sync
  .cursor/rules/   (5)  ──┤
  pm-workspace-docs/    ──┘

Layer 2: Memory Graph (Elmer PostgreSQL + pgvector)
  command_definition nodes (68)
  agent_definition nodes (22)
  skill_definition nodes (33)
  rule_definition nodes (5)
  context_file nodes (14)
  initiative nodes (21)
  feature_guide nodes (13)
  hypothesis nodes (N)
  signal nodes (N)
  + all typed edges between them
  ← Always current; versioned; queryable by semantic search

Layer 3: MCP Tools + MCP Apps (mcp-server/)
  95 tools reading from Layer 2
  8+ MCP Apps providing interactive UI
  text fallback for non-App hosts (Cursor today)
  ← UI = MCP = same layer
```

**The key principle:** Nothing is hardcoded. Nothing is a one-time import. Everything in the PM workspace is a live node in the memory graph, updated whenever the source changes, readable by any agent via MCP tools, and visualizable via MCP Apps.

---

## Implementation Changes to Elmer's Sync

### Fix 1: Expand `syncAgentArchitecture` to read nested skill files

```typescript
// Current: only reads SKILL.md
const skillFiles = await octokit.repos.getContent({ path: `.cursor/skills/${dir}/SKILL.md` });

// Fixed: reads all .md files in each skill directory
const skillDirContents = await octokit.repos.getContent({ path: `.cursor/skills/${dir}/` });
for (const file of skillDirContents.filter(f => f.name.endsWith('.md'))) {
  const content = await octokit.repos.getContent({ path: file.path });
  await createAgentDefinition({
    type: 'skill_reference',
    name: `${dir}/${file.name}`,
    content: Buffer.from(content.content, 'base64').toString(),
    metadata: { parentSkill: dir },
  });
}
```

### Fix 2: Add full pm-workspace-docs sync (always-on, not opt-in)

```typescript
// Add to syncAgentArchitecture (or its own syncPMWorkspaceDocs function)
const PM_DOCS_PATHS = [
  { pattern: 'pm-workspace-docs/company-context/**/*.md', nodeType: 'context_file' },
  { pattern: 'pm-workspace-docs/initiatives/active/**/*.{md,json}', nodeType: 'initiative' },
  { pattern: 'pm-workspace-docs/feature-guides/*.md', nodeType: 'feature_guide' },
  { pattern: 'pm-workspace-docs/hypotheses/**/*.md', nodeType: 'hypothesis' },
  { pattern: 'pm-workspace-docs/personas/**/*.md', nodeType: 'persona' },
  { pattern: 'pm-workspace-docs/research/synthesis/*.md', nodeType: 'research_synthesis' },
  { pattern: 'pm-workspace-docs/roadmap/roadmap.json', nodeType: 'roadmap' },
  { pattern: 'pm-workspace-docs/workflows/*.yaml', nodeType: 'workflow_config' },
];
```

### Fix 3: Add git webhook endpoint

```typescript
// New endpoint: POST /api/webhooks/git
// Called by GitHub on push to pm-workspace
async function handleGitPush(event: GitHubPushEvent) {
  const changedFiles = event.commits.flatMap(c => [...c.added, ...c.modified]);
  
  for (const file of changedFiles) {
    const nodeType = classifyFile(file); // e.g., '.cursor/commands/proto.md' → 'command_definition'
    if (!nodeType) continue;
    
    const content = await fetchFileContent(file);
    await upsertMemoryGraphNode({
      entityType: nodeType,
      name: path.basename(file, '.md'),
      content,
      embedding: await generateEmbedding(content),
      // Archive old version
    });
  }
}
```

### Fix 4: Parse and create graph edges at sync time

```typescript
// When a command is synced, parse its content for relationships
function parseCommandEdges(content: string, commandName: string): GraphEdge[] {
  const edges: GraphEdge[] = [];
  
  // "Delegates to: research-analyzer subagent" → edge
  const delegatesTo = content.match(/delegates to[:\s]+([a-z-]+)/i)?.[1];
  if (delegatesTo) edges.push({ type: 'delegates_to', to: delegatesTo, toType: 'agent_definition' });
  
  // "Uses: prd-writer skill" → edge
  const usesSkill = content.match(/uses[:\s]+([a-z-]+)\s+skill/gi) ?? [];
  usesSkill.forEach(m => edges.push({ type: 'uses_skill', to: m.match(/([a-z-]+)\s+skill/i)?.[1], toType: 'skill_definition' }));
  
  // "@pm-workspace-docs/company-context/product-vision.md" → edge
  const contextRefs = content.match(/@pm-workspace-docs\/[a-z/-]+\.md/g) ?? [];
  contextRefs.forEach(ref => edges.push({ type: 'reads_context', to: ref.replace('@', ''), toType: 'context_file' }));
  
  return edges;
}
```

---

## Answer to the Core Question

> "Does it make sense to have them hard coded, or should that be like persistent memory for agents and how they're laid out inside of the architecture?"

**Persistent memory in the graph. Not hardcoded. Not a one-time sync.**

Here's why, and what it means practically:

| Concern | Persistent Memory Answer |
|---------|------------------------|
| "Commands change constantly" | Git webhook updates the graph node on every commit. Agents always read current version. |
| "Skills have reference files too, not just SKILL.md" | All files in a skill directory become `skill_reference` nodes with `part_of` edges to the parent skill. |
| "pm-workspace-docs is the real context" | Full recursive sync, always-on. Every initiative, feature guide, hypothesis, persona is a node. |
| "Elmer and PM workspace are disconnected" | The memory graph is the bridge. Both systems write to it; both systems read from it. |
| "I want to see what's in both systems at once" | MCP Apps pull from the graph, which has everything. The PM Workspace Navigator shows all 68 commands + live initiative status in one view. |
| "I want agents to know about each other's capabilities" | Graph traversal: `agent_definition:prototype-builder` node has edges to every command that triggers it, every skill it uses, every initiative it has executed on. An agent querying "what can I use to build a prototype?" gets the full answer. |
| "Can agents improve over time?" | Yes. Memory graph nodes accept observations. If the prototype-builder agent fails 3 times without a PRD, an observation is written: "requires prd.md — add as prerequisite check." This enriches the node for future agents. |
