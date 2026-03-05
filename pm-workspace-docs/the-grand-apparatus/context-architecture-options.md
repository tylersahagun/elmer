# Context Architecture: Where Should Agent Data Live?

> Generated: 2026-03-04
> Problem: Agent context is trapped in local files. Other team members can't access, collaborate on, or benefit from the agent system.

---

## The Problem in Detail

The PM workspace has a three-layer data problem:

```
Layer 1: SHARED CONTEXT (company-context/, personas, guardrails)
  → Rarely changes, everyone needs it, currently local markdown

Layer 2: INITIATIVE METADATA (phase, status, owners, links, timeline)  
  → Changes weekly, duplicated in Notion AND _meta.json, sync is painful

Layer 3: AGENT ARTIFACTS (research, PRDs, prototypes, jury results, signals)
  → Changes daily, rich and structured, only agents produce/consume them
```

The current architecture treats all three layers the same: local markdown files in `pm-workspace-docs/`. This means:

- **Other people can't see it.** Ben, Rob, Kenzi, and the engineering team have no way to read research outputs, jury evaluations, or signal synthesis without Tyler sharing manually.
- **Sync is expensive and lossy.** Notion sync requires manual `/full-sync`, has name mismatches, phase label mapping issues, and depends on MCP availability.
- **Context goes stale.** `roadmap.json` is empty. `_meta.json` drifts from Notion. Linear `dev_activity` ages without periodic sync.
- **No collaboration on artifacts.** A designer can't annotate a design brief. An engineer can't update implementation status. A CSM can't add customer context to research.

---

## The Three Options

### Option A: Fix the Sync (Improve Current Architecture)

Keep `pm-workspace-docs/` as the source of truth. Make sync more automated and reliable.

**What changes:**
- Add scheduled sync (daily `/sync-dev`, weekly `/full-sync`)
- Fix name mapping with explicit `notion_project_id` and `linear_project_id` in all `_meta.json`
- Add Notion publishing for key artifacts (research summaries, jury results, status)
- Wire `workspace-admin audit` to detect and fix drift

**Pros:**
- No architectural change; incremental improvement
- Agents keep fast, reliable local access
- Rich context stays in markdown (easy for LLMs to consume)

**Cons:**
- Sync is still fundamentally one-way-at-a-time (write local, publish to Notion)
- Other people's edits in Notion don't flow back automatically
- Still Tyler's workspace; not truly shared
- Scales to maybe 2-3 people before sync complexity explodes

**Cost:** Low (days of work)
**Collaboration ceiling:** Low (publish-only, no real-time collaboration)

---

### Option B: Move Source of Truth to External System

Make Notion (or Ansor, or a purpose-built DB) the single source of truth. Agents read from it at runtime.

**What changes:**
- Initiative metadata lives in Notion Projects DB only (no local `_meta.json`)
- Agents call Notion MCP to read phase, status, owners before operating
- Artifacts (research, PRDs) stored as Notion child pages or linked docs
- Signals stored in Ansor with API access
- Local workspace becomes a working cache, not the source

**Pros:**
- Single source of truth -- no sync needed
- Anyone on the team can view and edit
- Notion's UI is already familiar to the team
- Changes propagate instantly (agent reads current state every time)

**Cons:**
- **Every agent operation now depends on MCP availability.** Notion MCP failure = entire system down.
- **LLM context quality drops.** Notion pages are harder for agents to parse than clean markdown. Rich formatting, databases-in-pages, and nested structures degrade agent comprehension.
- **Latency increases.** Reading 5-10 Notion pages via MCP is slower than reading local files.
- **Schema is constrained by Notion.** Notion properties are flat key-value; `_meta.json` has nested structures (outcomes, dev_activity, prototypes) that don't map cleanly.
- **Jury results, prototype paths, and placement research have no natural Notion home.** These are agent-internal artifacts that other humans rarely need.

**Cost:** High (weeks of work to rewire all 20 agents)
**Collaboration ceiling:** High (true multi-user)
**Risk:** High (single point of failure in MCP)

---

### Option C: Modular Context Layers (Recommended)

Split the data into three tiers with different storage strategies. Each tier lives where it makes the most sense.

```
┌─────────────────────────────────────────────────┐
│  TIER 1: Shared Context                         │
│  Storage: Ansor (product_os database)            │
│  Access: Any team member via Ansor UI or agents  │
│  Content: product vision, guardrails, personas,  │
│           org chart, strategic context            │
│  Update: context-reviewer writes, human approves │
│  Sync: Agents read at runtime via Ansor MCP      │
└─────────────────────────────────────────────────┘
           │ agents read at start of every operation
           ▼
┌─────────────────────────────────────────────────┐
│  TIER 2: Initiative Registry                     │
│  Storage: Ansor (project_registry entity)         │
│  Access: Any team member via Ansor UI or agents  │
│  Content: phase, status, priority, owners, links,│
│           timeline, blockers, next_action         │
│  Update: Agents write on phase change, human can │
│          edit directly in Ansor UI                │
│  Sync: Notion gets one-way publish for visibility│
│         (not source of truth)                     │
└─────────────────────────────────────────────────┘
           │ agents read initiative state
           ▼
┌─────────────────────────────────────────────────┐
│  TIER 3: Agent Artifacts (local workspace)       │
│  Storage: pm-workspace-docs/ (local markdown)    │
│  Access: Tyler + agents (publish summaries up)   │
│  Content: research.md, prd.md, design-brief.md,  │
│           prototype-notes, jury-evaluations,      │
│           signals, competitive-landscape          │
│  Update: Agents write, Tyler reviews             │
│  Publish: Key outputs pushed to Notion/Slack     │
└─────────────────────────────────────────────────┘
```

**How it works in practice:**

1. **Shared Context in Ansor.** Move `product-vision.md`, `strategic-guardrails.md`, `personas.md`, and `org-chart.md` content into Ansor entities. Agents read them via `query_records` instead of local file reads. When `context-reviewer` approves updates, it writes to Ansor instead of local files. Any team member can view current company context in the Ansor UI.

2. **Initiative Registry in Ansor.** Expand the existing `project_registry` entity to hold all `_meta.json` fields that other people care about: phase, status, priority, owners, timeline, blockers, next_action. Agents read/write initiative state via Ansor. Notion becomes a **read-only view** -- a scheduled push updates Notion Projects DB from Ansor, not the other way around. This eliminates bidirectional sync pain.

3. **Agent Artifacts stay local.** Research docs, PRDs, prototypes, jury evaluations, and signals remain in `pm-workspace-docs/` as markdown. These are what agents consume and produce most frequently. Rich, structured, fast access. But key outputs (research TL;DR, jury verdict, status summary) get **published** to Ansor or Slack so other team members see results without needing the local workspace.

**Pros:**
- Shared context is truly shared (Ansor UI for humans, Ansor MCP for agents)
- Initiative state has one source of truth (Ansor), eliminating bidirectional sync
- Agent artifacts stay in the format agents work best with (markdown)
- Notion becomes a display layer, not a sync partner -- much simpler
- Ansor is already integrated (`ansor-memory` skill exists, signals-processor writes to it)
- Other people can update initiative status in Ansor without Tyler running sync

**Cons:**
- Requires expanding Ansor schema (project_registry needs more fields)
- Agents that currently read local files need to be updated to read from Ansor for Tier 1-2
- Ansor MCP availability becomes important (but only for Tier 1-2, not Tier 3)
- Notion becomes downstream, which may frustrate people used to editing there

**Cost:** Medium (1-2 weeks to expand Ansor schema, update agent context loading, wire Notion as downstream)
**Collaboration ceiling:** High (any team member can view and edit via Ansor)
**Risk:** Medium (Ansor dependency for metadata, but agents can cache/fallback to local)

---

## Why Not Notion as Source of Truth?

The research shows specific problems with Notion as the authoritative system:

1. **Notion's data model is too flat.** `_meta.json` has nested structures (outcomes with baseline/target/actual, dev_activity with issue counts, prototypes with sub-initiatives) that don't map to Notion properties.

2. **MCP parsing is lossy.** Notion pages with rich formatting, toggles, and databases-within-pages produce noisy context when read via MCP. Clean markdown is significantly better for LLM comprehension.

3. **Sync has been consistently painful.** From the sync logs: name mismatches, conflicting Linear links, schema drift between Notion phases (Discovery/Definition/Build/Test/Done) and local phases (discovery/define/build/validate/launch), MCP unavailability.

4. **Notion is optimized for humans, not agents.** The V2 four-layer structure (Initiatives, Projects, Artifacts, Weekly Updates) is great for human navigation but creates a complex web of relations that agents struggle with.

Notion works well as a **display layer** -- a place where the team sees polished status. It does not work well as the **source of truth** that agents depend on for every operation.

---

## Why Not Linear as Source of Truth?

Linear is excellent for development tracking but:

1. **Only covers dev activity.** No concept of research, design briefs, prototypes, or validation.
2. **Labels have 0% adoption.** Sync depends on inference, not explicit structure.
3. **Project-initiative naming mismatches** are frequent and unresolved.

Linear should remain a **sync source for dev_activity** that feeds into the initiative registry, not the initiative registry itself.

---

## Why Ansor Makes Sense

Ansor (the Product OS database already in the workspace) is the natural fit for Tier 1 and Tier 2 because:

1. **Already integrated.** `ansor-memory` skill exists. signals-processor already writes evidence and actions to it.
2. **Schema is flexible.** Ansor entities support nested JSON, unlike Notion's flat properties.
3. **Has a UI.** Team members can view and edit records without needing the cursor workspace.
4. **Bidirectional by design.** Agents read and write via MCP; humans read and write via UI.
5. **Event-driven potential.** As Ansor grows, it could emit webhooks when records change, enabling the orchestrator agent from the architecture map.

**What needs to expand in Ansor:**

| Entity | Current State | Needed Additions |
|--------|--------------|-----------------|
| `project_registry` | ID, name, notion_id, linear_id | phase, status, priority, owners, timeline, blockers, next_action, graduation_criteria, outcomes, dev_activity |
| `person` | Name, role, IDs | No change needed |
| `evidence_item` | Signal evidence | No change needed |
| `decision_record` | Decisions | No change needed |
| `action_item_candidate` | Pending actions | No change needed |
| **NEW: `shared_context`** | N/A | product_vision, strategic_guardrails, personas, org_chart (versioned) |
| **NEW: `artifact_summary`** | N/A | TL;DR of research, jury verdict, prototype status -- published from Tier 3 for visibility |

---

## Implementation Sequence

If you choose Option C (modular layers), here is the order of operations:

### Phase 1: Expand Ansor Schema (2-3 days)
- Add fields to `project_registry` for full initiative metadata
- Create `shared_context` entity for company context
- Create `artifact_summary` entity for published outputs
- Seed from current `_meta.json` files and `company-context/` markdown

### Phase 2: Update Agent Context Loading (3-5 days)
- Modify `pm-foundation` rule to load Tier 1 from Ansor instead of local files
- Update agents that read `_meta.json` to read from Ansor `project_registry`
- Keep local files as cache/fallback (write-through: update Ansor + local)
- Update `context-reviewer` to write to Ansor `shared_context`

### Phase 3: Wire Notion as Downstream (2-3 days)
- Replace bidirectional `/full-sync` with one-way Ansor -> Notion publish
- Run on schedule or after initiative state changes
- Notion Projects DB becomes a dashboard, not an input

### Phase 4: Publish Artifact Summaries (2-3 days)
- After `/research`, publish TL;DR to Ansor `artifact_summary`
- After `/validate`, publish jury verdict to Ansor
- After `/proto`, publish prototype URLs to Ansor
- After `/eod`/`/eow`, publish activity summary to Ansor
- These become visible to the whole team in the Ansor UI

### Phase 5: Enable Other Team Members (1-2 days)
- Document how to view initiative status, research summaries, and context in Ansor
- Set up Ansor permissions for team roles
- Create a "PM Dashboard" view in Ansor for non-PM team members

---

## Decision Framework

| If you want... | Choose... |
|----------------|-----------|
| Quick wins, minimal change | **Option A** (fix sync) |
| True multi-user collaboration | **Option C** (modular layers with Ansor) |
| Maximum simplicity (at cost of collaboration) | Keep current architecture |
| Notion as the center | Not recommended (see analysis above) |

The key insight is: **agents need markdown, humans need UIs, and the bridge between them should be a structured database (Ansor), not a sync pipeline between two different document systems (local files and Notion).**
