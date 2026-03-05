# PM Workspace System Audit

**Date:** 2026-01-15  
**Scope:** Full audit of `.cursor/commands/`, `.cursor/rules/`, `pm-workspace-docs/`, and automation scripts  
**Goal:** Assess alignment with the desired iterative PM cycle and identify gaps

---

## Executive Summary

The PM workspace has strong individual components but lacks **system cohesion**. Commands and rules work in isolation rather than forming a continuous loop. The biggest gaps are:

1. **No ingest layer** - Transcripts, support tickets, and raw conversations don't automatically flow into the system
2. **No hypothesis/roadmap management** - Research doesn't connect to prioritized bets or roadmap items
3. **Weak iteration loop** - Prototype feedback doesn't automatically update PRDs or trigger re-validation
4. **Missing context orchestration** - Personas, vision, and guardrails exist but aren't automatically injected into workflows

The system has evolved organically around specific tasks rather than being designed as an end-to-end PM operating system.

---

## Part 1: Audit Report

### 1.1 Current Command/Rule Inventory

| Command/Rule | Purpose | Inputs | Outputs | Next Step Suggested? |
|--------------|---------|--------|---------|---------------------|
| `/research` | Extract insights from transcripts | Raw transcript text | `research.md`, Notion Feedback entry | Yes → `/pm` |
| `/pm` | Generate full PRD + docs | Research + context | PRD, Design Brief, Eng Spec, GTM Brief + Notion | Yes → `/proto` |
| `/proto` | Build Storybook prototype | PRD + Design Brief | React components + stories + prototype-notes | Partially → commit |
| `/iterate` | Update prototype from feedback | New transcript/feedback | Updated docs + new prototype version | No explicit next |
| `/design` | Design review lens | Any artifact | Review with trust/emotion checklist | No |
| `/admin` | Workspace configuration | N/A | Rule/command files | No |
| `/new-initiative` | Scaffold initiative folder | Name | Empty template structure | Yes → `/pm` or `/research` |
| `/brainstorm-board` | Generate image prompts | Initiative docs | Copy-paste prompts for image gen | No |
| `jury-system.mdc` | Synthetic user validation | Initiative + phase | Jury evaluation JSON + report | Partially → `/iterate` |
| `prd-writer.mdc` | PRD structure/guardrails | Auto-activates on PRD files | Structured PRD format | N/A (passive) |
| `research-analyst.mdc` | Research analysis lens | Auto-activates on research files | Structured research output | N/A (passive) |
| `prototype-builder.mdc` | Prototype standards | Auto-activates on prototype files | Component structure | N/A (passive) |
| `design-companion.mdc` | Design review standards | Auto-activates on design files | Trust/emotion checklist | N/A (passive) |

### 1.2 Strengths

**Strong Strategic Foundation**
- `product-vision.md` and `strategic-guardrails.md` are well-crafted with leadership quotes and clear principles
- The "outcome chain" framework is embedded across multiple rules
- Anti-vision territory is explicitly defined

**Good Artifact Structure**
- Initiative folder template is comprehensive (PRD, research, design-brief, engineering-spec, GTM-brief, decisions, prototype-notes)
- Consistent file naming and location conventions
- Git-tracked with Notion sync integration

**Solid Prototype Workflow**
- Clear technical standards (React 18, TypeScript, Tailwind, shadcn/ui)
- Required AI states (Loading, Error, LowConfidence, Empty, Success)
- Multiple creative directions (Option A/B/C pattern)
- Storybook + Chromatic publishing

**Innovative Jury System**
- Condorcet-based synthetic user validation
- Stratified sampling with skeptic quotas
- Phase-specific evaluation prompts
- Iteration document generation

**Human-Centric AI Design**
- Trust equation embedded throughout
- Don Norman's emotional design levels
- Microsoft HAX 18 guidelines referenced
- Persona-specific fear/concern awareness

### 1.3 Weaknesses

**1. No Continuous Input Pipeline**
- System expects manually triggered commands
- No automatic ingestion of transcripts from Notion/Slack/email
- Support tickets and customer conversations must be copy-pasted
- Linear issues aren't pulled in automatically

**2. Missing Hypothesis/Roadmap Layer**
- Research extracts problems but doesn't connect to prioritized bets
- No concept of "active hypotheses" vs "validated problems"
- PRDs created without explicit hypothesis framing
- No mechanism to retire or invalidate hypotheses

**3. Weak Feedback Loop Closure**
- `/iterate` command exists but doesn't auto-trigger re-validation
- Prototype feedback doesn't propagate back to PRD updates
- Jury evaluations are one-shot, not continuous
- No "graduation criteria" for moving between phases

**4. Context Injection is Manual**
- Rules reference context files but don't enforce loading
- Personas, guardrails, and vision must be explicitly mentioned
- No automatic context assembly based on initiative type

**5. Disconnected Commands**
- Commands suggest next steps but don't chain automatically
- No state tracking for "where is this initiative in the lifecycle?"
- Jumping between commands loses context

**6. No Roadmap Visibility**
- Individual initiatives exist but no aggregated roadmap view
- Can't see "what's in Discovery vs Design vs Development"
- No prioritization mechanism across initiatives

**7. Limited External Tool Integration**
- Notion MCP exists but isn't deeply used
- Linear issues aren't pulled into initiative context
- No Slack command integration for quick capture
- No calendar/meeting integration for auto-transcript pull

### 1.4 Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Context drift | Decisions made without current vision/guardrails | High | Auto-inject context at command start |
| Orphaned initiatives | Started but never completed/validated | High | Phase tracking + stale detection |
| Siloed feedback | Customer input not synthesized | Medium | Ingest automation |
| Prototype-PRD divergence | Prototype evolves but PRD doesn't update | Medium | `/iterate` enforcement |
| Manual overhead | Commands feel like chores | Medium | Chaining + triggers |

---

## Part 2: Workflow Map

### 2.1 Current System Flow (As-Is)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT SYSTEM (As-Is)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    MANUAL     ┌──────────────┐                            │
│  │  Transcript  │──────────────▶│  /research   │                            │
│  │  (copy-paste)│               │              │                            │
│  └──────────────┘               └──────┬───────┘                            │
│                                        │                                     │
│                                        ▼                                     │
│                                 ┌──────────────┐                            │
│                                 │  research.md │                            │
│                                 │  + Notion    │                            │
│                                 └──────┬───────┘                            │
│                                        │                                     │
│                               MANUAL TRIGGER                                 │
│                                        │                                     │
│                                        ▼                                     │
│  ┌──────────────┐               ┌──────────────┐                            │
│  │ Vision/Guard │──MANUAL REF──▶│    /pm       │                            │
│  │ Personas     │               │              │                            │
│  └──────────────┘               └──────┬───────┘                            │
│                                        │                                     │
│                                        ▼                                     │
│                     ┌────────────────────────────────────┐                  │
│                     │  PRD + Design Brief + Eng Spec     │                  │
│                     │  + GTM Brief + Notion Pages        │                  │
│                     └────────────────┬───────────────────┘                  │
│                                      │                                       │
│                             MANUAL TRIGGER                                   │
│                                      │                                       │
│                                      ▼                                       │
│                               ┌──────────────┐                              │
│                               │   /proto     │                              │
│                               └──────┬───────┘                              │
│                                      │                                       │
│                                      ▼                                       │
│                     ┌────────────────────────────────────┐                  │
│                     │  Storybook Components + Stories    │                  │
│                     │  + prototype-notes.md              │                  │
│                     └────────────────┬───────────────────┘                  │
│                                      │                                       │
│                        ┌─────────────┴──────────────┐                       │
│                        │                            │                        │
│                        ▼                            ▼                        │
│                 ┌─────────────┐           ┌──────────────┐                  │
│                 │  /iterate   │           │  Jury System │                  │
│                 │  (manual)   │           │  (manual)    │                  │
│                 └──────┬──────┘           └──────┬───────┘                  │
│                        │                         │                           │
│                        └─────────────────────────┘                          │
│                                      │                                       │
│                               NO AUTO-LOOP                                   │
│                                      │                                       │
│                                      ▼                                       │
│                               ┌──────────────┐                              │
│                               │   (DEAD END) │                              │
│                               └──────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

PROBLEMS:
- No automatic input capture
- Manual context loading
- No phase/state tracking
- No graduation criteria
- Feedback doesn't close loop
- No roadmap visibility
```

### 2.2 Desired System Flow (To-Be)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DESIRED SYSTEM (To-Be)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                        CONTINUOUS INPUT LAYER                          ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║  Meeting         Support        Linear         Slack         Code     ║  │
│  ║  Transcripts     Tickets        Issues         Messages      Changes  ║  │
│  ║      │              │              │              │             │     ║  │
│  ║      └──────────────┴──────────────┴──────────────┴─────────────┘     ║  │
│  ║                                   │                                    ║  │
│  ║                                   ▼                                    ║  │
│  ║                          ┌───────────────┐                            ║  │
│  ║                          │    INGEST     │  ◀── Auto-triggered        ║  │
│  ║                          │   PROCESSOR   │      via webhooks/MCP      ║  │
│  ║                          └───────┬───────┘                            ║  │
│  ╚══════════════════════════════════╪═══════════════════════════════════╝  │
│                                     │                                       │
│                                     ▼                                       │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                      CONTEXT ORCHESTRATION LAYER                       ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        ║  │
│  ║  │ Vision  │ │Guardrail│ │Personas │ │Existing │ │ Active  │        ║  │
│  ║  │         │ │         │ │         │ │ Research│ │Hypothes │        ║  │
│  ║  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘        ║  │
│  ║       └───────────┴───────────┴───────────┴───────────┘              ║  │
│  ║                                │                                      ║  │
│  ║                    AUTO-ASSEMBLED CONTEXT                            ║  │
│  ║                                │                                      ║  │
│  ╚════════════════════════════════╪═════════════════════════════════════╝  │
│                                   │                                        │
│                                   ▼                                        │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                       HYPOTHESIS MANAGEMENT                            ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐            ║  │
│  ║   │ UNVALIDATED │────▶│  VALIDATED  │────▶│  COMMITTED  │            ║  │
│  ║   │ HYPOTHESES  │     │  PROBLEMS   │     │  ROADMAP    │            ║  │
│  ║   │             │     │             │     │             │            ║  │
│  ║   │ - Signals   │     │ - Evidence  │     │ - Priorit.  │            ║  │
│  ║   │ - Questions │     │ - Quotes    │     │ - Timeline  │            ║  │
│  ║   │ - Sources   │     │ - Freq/Sev  │     │ - Owner     │            ║  │
│  ║   └─────────────┘     └─────────────┘     └─────────────┘            ║  │
│  ║                                                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                   │                                        │
│                                   ▼                                        │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                        PM EXECUTION LOOP                               ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐          ║  │
│  ║   │DISCOVERY│───▶│ DEFINE  │───▶│  BUILD  │───▶│ VALIDATE│──┐       ║  │
│  ║   │         │    │         │    │         │    │         │  │       ║  │
│  ║   │/research│    │  /pm    │    │ /proto  │    │  jury   │  │       ║  │
│  ║   │         │    │         │    │/iterate │    │  eval   │  │       ║  │
│  ║   └─────────┘    └─────────┘    └─────────┘    └────┬────┘  │       ║  │
│  ║        ▲                                            │       │       ║  │
│  ║        │              FEEDBACK LOOPS                │       │       ║  │
│  ║        └────────────────────────────────────────────┘       │       ║  │
│  ║                                                             │       ║  │
│  ║   ┌─────────────────────────────────────────────────────────┘       ║  │
│  ║   │                                                                  ║  │
│  ║   ▼                                                                  ║  │
│  ║   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            ║  │
│  ║   │   LAUNCH    │───▶│  MEASURE    │───▶│   LEARN     │────┐       ║  │
│  ║   │             │    │             │    │             │    │       ║  │
│  ║   └─────────────┘    └─────────────┘    └─────────────┘    │       ║  │
│  ║                                                             │       ║  │
│  ║        ▲                                                    │       ║  │
│  ║        └────────────────────────────────────────────────────┘       ║  │
│  ║                         CONTINUOUS LEARNING                         ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Gap Analysis (Current vs. Desired)

### 3.1 Critical Gaps

| Gap | Current State | Desired State | Priority |
|-----|---------------|---------------|----------|
| **Ingest Layer** | Manual copy-paste | Auto-pull from Notion/Slack/Linear/Calendar | P0 |
| **Hypothesis Management** | None | Track unvalidated → validated → committed | P0 |
| **State/Phase Tracking** | None | Know where each initiative is | P0 |
| **Auto-Context Assembly** | Manual reference | Auto-inject based on initiative | P1 |
| **Feedback Loop Closure** | Dead ends | Auto-trigger re-validation | P1 |
| **Roadmap View** | None | Aggregated view across initiatives | P1 |
| **Command Chaining** | Suggestions only | Auto-progression with gates | P2 |
| **External Integrations** | Notion MCP only | Linear, Slack, Calendar, Intercom | P2 |

### 3.2 Missing Commands/Rules

| Missing | Purpose | Priority |
|---------|---------|----------|
| `/ingest [source]` | Pull and process external input | P0 |
| `/hypothesis [action]` | Manage hypothesis lifecycle | P0 |
| `/status [initiative]` | Show phase and blockers | P0 |
| `/roadmap` | View all initiatives by phase | P1 |
| `/synthesize [topic]` | Aggregate signals across sources | P1 |
| `/validate [initiative]` | Run jury + check graduation criteria | P1 |
| `/retro [initiative]` | Post-launch learning capture | P2 |
| `lifecycle-tracker.mdc` | Auto-track initiative phases | P0 |
| `context-orchestrator.mdc` | Auto-assemble context for commands | P1 |
| `signal-detector.mdc` | Flag patterns across ingest | P1 |

### 3.3 Missing Integrations

| Integration | Purpose | Mechanism |
|-------------|---------|-----------|
| Linear → Signals | Pull feature requests and bugs | MCP or webhook |
| Slack → Transcripts | Capture quick conversations | MCP |
| Intercom/Support → Tickets | Customer pain signals | API/webhook |
| Calendar → Meetings | Auto-pull meeting transcripts | API |
| Codebase → Context | Technical constraints | Already via @codebase |

---

## Part 4: Prioritized Backlog

### P0: Foundation (Required for System Coherence)

1. **Create `lifecycle-tracker.mdc`**
   - Track initiative phases: `signal → hypothesis → discovery → define → build → validate → launch → measure → learn`
   - Store phase in initiative metadata file
   - Auto-detect stale initiatives
   - Surface blockers

2. **Create `/status` command**
   - Show current phase for an initiative
   - List blockers and next actions
   - Show last activity date

3. **Create `/hypothesis` command**
   - `hypothesis new [name]` - Create hypothesis from signal
   - `hypothesis validate [name]` - Promote to validated problem
   - `hypothesis commit [name]` - Add to roadmap
   - `hypothesis retire [name]` - Archive with reason

4. **Create `/ingest` command**
   - `ingest transcript [text/file]` - Process meeting notes
   - `ingest ticket [id/text]` - Process support ticket
   - `ingest issue [linear-id]` - Pull Linear issue
   - Auto-extract signals and route to hypotheses

5. **Update all commands to auto-load context**
   - Modify `/research`, `/pm`, `/proto`, `/iterate` to auto-inject vision, guardrails, personas
   - No more manual `@` references required

### P1: Loops (Close the Feedback Cycle)

6. **Create `/synthesize` command**
   - Aggregate signals across sources for a topic
   - Show frequency, severity, personas affected
   - Generate hypothesis candidates

7. **Create `/validate` command**
   - Run jury evaluation
   - Check graduation criteria
   - Auto-suggest next phase or blockers

8. **Create `/roadmap` command**
   - View all initiatives by phase
   - Filter by priority, persona, pillar
   - Show stale items

9. **Enhance `/iterate` to close loop**
   - After iteration, auto-prompt for re-validation
   - Update PRD with changes
   - Track iteration count

10. **Create `context-orchestrator.mdc`**
    - Rule that auto-assembles context based on:
      - Initiative name → load its docs
      - Phase → load relevant templates
      - Persona focus → load persona details
      - Always load vision + guardrails

### P2: Integrations (External Connectivity)

11. **Create Linear MCP integration**
    - Pull issues tagged for product
    - Create issues from PRDs
    - Sync status bidirectionally

12. **Create Slack ingest hook**
    - Watch specific channels
    - Extract actionable signals
    - Route to `/ingest`

13. **Create calendar integration**
    - Auto-pull meeting transcripts
    - Suggest `/research` for relevant meetings

14. **Create `/retro` command**
    - Post-launch learning capture
    - Update hypothesis with actual outcomes
    - Feed learnings back to signal detection

### P3: Polish (Optimization)

15. **Auto-chaining between commands**
    - After `/research` completes, offer to run `/hypothesis new`
    - After `/pm` completes, offer to run `/proto`
    - After `/proto` completes, offer to run `/validate`

16. **Create dashboard view**
    - Web-based or Notion-based initiative dashboard
    - Show pipeline health metrics

17. **Add signal pattern detection**
    - Auto-detect emerging themes across inputs
    - Surface "you've heard this 5 times" alerts

---

## Part 5: Implementation Plan

### Phase 1: Foundation (1-2 weeks)

**Week 1: Core Infrastructure**
- [ ] Create `pm-workspace-docs/initiatives/_meta/` for tracking
- [ ] Create `lifecycle-tracker.mdc` rule
- [ ] Create `/status` command
- [ ] Create `/hypothesis` command
- [ ] Test with one initiative end-to-end

**Week 2: Context & Ingest**
- [ ] Update all commands to auto-load context
- [ ] Create `/ingest` command (manual mode first)
- [ ] Create signal → hypothesis routing
- [ ] Document new workflow

### Phase 2: Loops (1-2 weeks)

**Week 3: Synthesis & Validation**
- [ ] Create `/synthesize` command
- [ ] Create `/validate` command
- [ ] Enhance `/iterate` with loop closure
- [ ] Create `/roadmap` command

**Week 4: Context Orchestration**
- [ ] Create `context-orchestrator.mdc`
- [ ] Test auto-context assembly
- [ ] Refine graduation criteria per phase

### Phase 3: Integrations (2-3 weeks)

**Week 5-6: External Connections**
- [ ] Linear MCP integration
- [ ] Slack webhook for ingest
- [ ] Test signal flow end-to-end

**Week 7: Learning Loop**
- [ ] Create `/retro` command
- [ ] Add outcome tracking to hypothesis
- [ ] Test full learn → signal cycle

### Phase 4: Polish (Ongoing)

- [ ] Auto-chaining between commands
- [ ] Dashboard view (Notion or web)
- [ ] Signal pattern detection
- [ ] Metrics and health reporting

---

## Appendix A: Command/Rule Dependency Map

```
                    ┌─────────────────┐
                    │  /ingest (NEW)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ /hypothesis(NEW)│
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
      ┌──────────┐    ┌──────────┐    ┌──────────┐
      │/research │    │/synthesize│   │ /status  │
      │          │    │  (NEW)   │    │  (NEW)   │
      └────┬─────┘    └──────────┘    └──────────┘
           │
           ▼
      ┌──────────┐
      │   /pm    │
      └────┬─────┘
           │
           ▼
      ┌──────────┐
      │  /proto  │
      └────┬─────┘
           │
           ▼
      ┌──────────┐
      │/iterate  │◀──────────┐
      └────┬─────┘           │
           │                 │
           ▼                 │
      ┌──────────┐           │
      │/validate │───────────┘
      │  (NEW)   │
      └────┬─────┘
           │
           ▼
      ┌──────────┐
      │ /retro   │
      │  (NEW)   │
      └──────────┘
```

---

## Appendix B: File Structure Additions

```
pm-workspace-docs/
├── hypotheses/                    # NEW: Hypothesis tracking
│   ├── _template.md
│   ├── active/
│   │   └── [hypothesis-name].md
│   ├── validated/
│   │   └── [hypothesis-name].md
│   └── retired/
│       └── [hypothesis-name].md
├── signals/                       # NEW: Raw signal capture
│   ├── transcripts/
│   ├── tickets/
│   ├── issues/
│   └── conversations/
├── initiatives/
│   └── [name]/
│       ├── _meta.json             # NEW: Phase, status, last activity
│       └── ... (existing files)
└── roadmap/                       # NEW: Aggregated view
    └── roadmap.md                 # Auto-generated from initiatives
```

---

## Appendix C: Key Design Decisions

1. **Phase-gated progression** - Initiatives must meet criteria to advance (not just time-based)
2. **Hypothesis-first** - Don't create PRDs without validated hypotheses
3. **Auto-context** - Context should be assembled, not manually specified
4. **Feedback loops** - Every output should have a mechanism to update inputs
5. **Signal aggregation** - Individual inputs should roll up to pattern detection
6. **Retirement paths** - Failed hypotheses are valuable learning, not deleted

---

## Appendix D: Success Metrics for the System

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Time from signal to hypothesis | Unknown | < 1 day | Timestamp tracking |
| % initiatives with validated hypothesis | ~50% | 100% | Audit initiative folders |
| % initiatives with current phase tracked | 0% | 100% | _meta.json presence |
| Commands that auto-load context | 0% | 100% | Rule implementation |
| Feedback loops closed | ~30% | 100% | /iterate → /validate chain |
| Stale initiatives (>14 days inactive) | Unknown | < 3 | /roadmap report |

---

*End of Audit Report*
