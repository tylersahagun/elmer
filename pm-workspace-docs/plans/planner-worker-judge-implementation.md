# Implementation Plan: Planner/Worker/Judge Architecture

> Adapting Cursor's scaling agents pattern to the PM workspace for human-in-loop workflows

---

## Overview

This plan separates your current architecture into three distinct roles:

1. **Planners** - Break down goals into tasks, coordinate work
2. **Workers** - Execute tasks independently (your existing subagents)
3. **Judges** - Evaluate results, decide next steps

### Key Difference from Cursor

Cursor runs **hundreds of agents for weeks** autonomously. Your system is **human-in-loop with session-based work**. The adaptation focuses on:

- Explicit planning phases before work starts
- Automatic judgment after work completes
- Clear handoffs between roles

---

## Current State Analysis

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Intent                                                │
│      │                                                      │
│      ▼                                                      │
│  ┌──────────────────┐                                       │
│  │  pm-foundation   │ ← Does BOTH planning + routing        │
│  │  (always-on)     │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │    Subagents     │ ← Workers (execute tasks)             │
│  │  (proto-builder, │                                       │
│  │   research, etc) │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │    validator     │ ← Judge (manual invocation only)      │
│  │  (/validate cmd) │                                       │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What's Missing

| Role | Current | Gap |
|------|---------|-----|
| Planner | pm-foundation does implicit routing | No explicit task decomposition |
| Worker | Subagents work well | Workers don't report structured results |
| Judge | validator exists | Not automatic, only for validate phase |

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPOSED ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Intent (high-level goal)                              │
│      │                                                      │
│      ▼                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     PLANNER LAYER                     │  │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │  │
│  │  │  goal-planner   │───▶│  Sub-planners (optional) │ │  │
│  │  │  (new subagent) │    │  - research-planner      │ │  │
│  │  └────────┬────────┘    │  - build-planner         │ │  │
│  │           │              └─────────────────────────┘ │  │
│  │           │                                           │  │
│  │           ▼                                           │  │
│  │  ┌─────────────────┐                                 │  │
│  │  │   task-queue    │ ← Ordered, prioritized tasks   │  │
│  │  │   (new file)    │                                 │  │
│  │  └────────┬────────┘                                 │  │
│  └───────────┼──────────────────────────────────────────┘  │
│              │                                              │
│              ▼                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     WORKER LAYER                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐│  │
│  │  │proto-builder│ │research-    │ │signals-processor││  │
│  │  │             │ │analyzer     │ │                 ││  │
│  │  └──────┬──────┘ └──────┬──────┘ └────────┬────────┘│  │
│  │         │               │                  │         │  │
│  │         └───────────────┴──────────────────┘         │  │
│  │                         │                             │  │
│  │                         ▼                             │  │
│  │              ┌─────────────────┐                     │  │
│  │              │  work-result    │ ← Structured output │  │
│  │              │  (standardized) │                     │  │
│  │              └────────┬────────┘                     │  │
│  └───────────────────────┼──────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     JUDGE LAYER                       │  │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │  │
│  │  │  work-judge     │───▶│  Verdict:               │ │  │
│  │  │  (auto-invoke)  │    │  - ✅ Complete → next    │ │  │
│  │  └─────────────────┘    │  - 🔄 Iterate → worker   │ │  │
│  │                          │  - ❌ Block → planner   │ │  │
│  │                          └─────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Add Goal Planner (Week 1)

Create a new **`goal-planner`** subagent that decomposes high-level goals into tasks.

**New Files:**

```
.cursor/agents/goal-planner.md           # New planner subagent
.cursor/skills/task-planning/SKILL.md    # Planning patterns
pm-workspace-docs/task-queue.md          # Current task queue
```

**goal-planner.md:**

```yaml
---
name: goal-planner
description: Decomposes high-level goals into discrete, executable tasks. Invoke when user describes a goal rather than a specific command.
model: inherit  # Better models plan better
readonly: false
---

# Goal Planner Subagent

You break down high-level PM goals into discrete, executable tasks.

## When to Invoke

- User describes a goal: "I want to ship the HubSpot config feature"
- User asks for help with a complex initiative
- User says "help me plan" or "what should I do"

## Planning Process

### 1. Understand the Goal

Load context:
- Initiative _meta.json (current phase, artifacts)
- Product vision (alignment check)
- Recent signals (what users are saying)

### 2. Assess Current State

Check what exists:
- [ ] Research complete?
- [ ] PRD exists?
- [ ] Design brief?
- [ ] Prototype?
- [ ] Validation done?

### 3. Generate Task Queue

Create ordered tasks based on gaps:

```json
{
  "goal": "Ship HubSpot config feature",
  "initiative": "hubspot-config",
  "current_phase": "define",
  "tasks": [
    {
      "id": "task-001",
      "type": "worker",
      "handler": "proto-builder",
      "command": "/proto hubspot-config",
      "depends_on": [],
      "priority": "P0",
      "estimated_effort": "medium"
    },
    {
      "id": "task-002", 
      "type": "judge",
      "handler": "work-judge",
      "trigger": "after:task-001",
      "auto": true
    }
  ]
}
```

### 4. Output Format

```markdown
## Plan: [Goal]

**Initiative:** [name]
**Current Phase:** [phase] → Target: [next phase]

### Tasks (in order)

1. **[Task Name]** - `/command`
   - Why: [reasoning]
   - Output: [expected artifact]
   
2. **[Task Name]** - `/command`
   - Why: [reasoning]
   - Depends on: Task 1

### Blockers

- [Any blockers identified]

### Ready to start?

Run `task-001` or say "execute plan" to begin.
```

## Sub-Planners (Optional)

For large initiatives, spawn specialized sub-planners:

- `research-planner` - Plans research activities
- `build-planner` - Plans prototype iterations
- `launch-planner` - Plans GTM activities

Each sub-planner focuses on their domain and reports tasks back.
```

**New Command: `/plan`**

```markdown
# /plan Command

## Usage

`/plan [goal or initiative]`

## Examples

- `/plan hubspot-config` - Plan next steps for initiative
- `/plan "ship the field config feature"` - Plan from goal description
- `/plan` - Plan based on current context

## Behavior

1. Invokes `goal-planner` subagent
2. Analyzes current state
3. Generates task queue
4. Presents plan for approval

## After Planning

- Run individual tasks: `/proto hubspot-config`
- Execute full plan: `/execute-plan`
- Modify plan: "actually, let's skip research"
```

---

### Phase 2: Standardize Worker Output (Week 1-2)

Update existing subagents to output **structured results** that judges can evaluate.

**Add to each subagent:**

```markdown
## Result Format (Required)

After completing work, output structured result:

```json
{
  "worker": "proto-builder",
  "task_id": "task-001",
  "status": "complete",
  "artifacts": [
    {
      "type": "prototype",
      "path": "prototypes/HubSpotConfig/v1/",
      "version": "v1"
    }
  ],
  "metrics": {
    "creative_options": 3,
    "states_implemented": 6,
    "flow_stories": 2
  },
  "notes": "Implemented all states. Option B (Balanced) recommended.",
  "ready_for_judge": true
}
```
```

**Files to Update:**

| Subagent | Update |
|----------|--------|
| proto-builder.md | Add result format section |
| research-analyzer.md | Add result format section |
| iterator.md | Add result format section |
| signals-processor.md | Add result format section |

---

### Phase 3: Add Work Judge (Week 2)

Create **`work-judge`** subagent that evaluates worker output and decides next steps.

**work-judge.md:**

```yaml
---
name: work-judge
description: Evaluates worker output and decides whether to proceed, iterate, or block. Auto-invoked after workers complete, or manually via /judge.
model: inherit
readonly: true
---

# Work Judge Subagent

You evaluate worker output and decide the next step.

## When to Invoke

- **Automatic**: After any worker completes (when `ready_for_judge: true`)
- **Manual**: `/judge [task-id]` or `/judge [initiative]`

## Judgment Process

### 1. Load Context

- Worker result (structured JSON)
- Original task from plan
- Initiative requirements
- Quality standards

### 2. Evaluate Against Criteria

| Criterion | Check |
|-----------|-------|
| **Completeness** | All required outputs present? |
| **Quality** | Meets standards for this phase? |
| **Alignment** | Matches PRD/requirements? |
| **Blockers** | Any issues that prevent progress? |

### 3. Render Verdict

```json
{
  "judge": "work-judge",
  "task_id": "task-001",
  "verdict": "complete|iterate|block",
  "score": {
    "completeness": 4,
    "quality": 5,
    "alignment": 4
  },
  "reasoning": "Prototype covers all states but Option B needs refinement for skeptic personas",
  "next_action": {
    "type": "iterate|proceed|escalate",
    "command": "/iterate hubspot-config --focus='skeptic UX'",
    "auto_execute": false
  }
}
```

### 4. Verdicts

| Verdict | Meaning | Next Action |
|---------|---------|-------------|
| **✅ Complete** | Work meets all criteria | Proceed to next task in plan |
| **🔄 Iterate** | Needs refinement | Re-run worker with feedback |
| **❌ Block** | Fundamental issue | Escalate to planner/human |

## Output Format

```markdown
## Judgment: [Task Name]

**Worker:** [subagent]
**Status:** [verdict emoji] [verdict]

### Evaluation

| Criterion | Score | Notes |
|-----------|-------|-------|
| Completeness | X/5 | [notes] |
| Quality | X/5 | [notes] |
| Alignment | X/5 | [notes] |

### Verdict: [Complete/Iterate/Block]

**Reasoning:** [explanation]

### Next Step

[One of:]
- ✅ Proceeding to next task: [task name]
- 🔄 Suggested iteration: `/iterate [name] --focus='[feedback]'`
- ❌ Blocked: [issue] - needs human decision
```

## Auto-Invoke Configuration

Add to `pm-foundation.mdc`:

```
After any worker subagent completes with `ready_for_judge: true`:
1. Automatically invoke work-judge
2. Present verdict to user
3. If verdict is "complete" and next task exists, suggest it
4. If verdict is "iterate", suggest iteration command
```
```

---

### Phase 4: Wire Together (Week 2-3)

Update `pm-foundation.mdc` to orchestrate the three roles.

**Add to pm-foundation.mdc:**

```markdown
## Planner/Worker/Judge Orchestration

### Detecting Planning Needs

When user describes a **goal** rather than a **command**:
- "I want to ship X"
- "Help me with the Y initiative"  
- "What should I work on?"
- "Plan out Z"

→ Invoke `goal-planner` first

### After Worker Completion

When a worker subagent completes:

1. Check for `ready_for_judge: true` in output
2. Auto-invoke `work-judge` subagent
3. Present verdict
4. Suggest next action based on verdict

### Plan Execution Mode

When user says "execute plan" or `/execute-plan`:

1. Load task-queue.md
2. Execute tasks in order
3. After each task, invoke judge
4. Continue if verdict is "complete"
5. Pause if verdict is "iterate" or "block"

### Manual Override

User can always:
- Skip planning: `/proto hubspot-config` (direct worker)
- Skip judging: `--no-judge` flag
- Override verdict: "continue anyway"
```

---

## New Commands Summary

| Command | Role | Purpose |
|---------|------|---------|
| `/plan [goal]` | Planner | Decompose goal into tasks |
| `/execute-plan` | Orchestrator | Run task queue with auto-judgment |
| `/judge [task]` | Judge | Manually invoke judgment |
| `/tasks` | Status | View current task queue |

---

## File Structure After Implementation

```
.cursor/
├── agents/
│   ├── goal-planner.md          # NEW: Planner role
│   ├── work-judge.md            # NEW: Judge role
│   ├── proto-builder.md         # UPDATED: Structured output
│   ├── research-analyzer.md     # UPDATED: Structured output
│   └── validator.md             # UNCHANGED: Phase validator
├── skills/
│   ├── task-planning/SKILL.md   # NEW: Planning patterns
│   └── work-judgment/SKILL.md   # NEW: Judgment patterns
├── commands/
│   ├── plan.md                  # NEW
│   ├── execute-plan.md          # NEW
│   ├── judge.md                 # NEW
│   └── tasks.md                 # NEW
└── rules/
    └── pm-foundation.mdc        # UPDATED: Orchestration

pm-workspace-docs/
├── task-queue.md                # NEW: Current task queue
└── plans/
    └── [goal]-plan.md           # Generated plans
```

---

## Example Flow

### Before (Current)

```
User: "I want to ship the HubSpot config feature"

Agent: "What would you like to do with HubSpot config?
- /research hubspot-config
- /pm hubspot-config
- /proto hubspot-config
- /status hubspot-config"

User: "/proto hubspot-config"
[proto-builder runs]

User: "/validate hubspot-config"  # Manual!
[validator runs]
```

### After (With Planner/Worker/Judge)

```
User: "I want to ship the HubSpot config feature"

[goal-planner auto-invoked]

Agent: "## Plan: Ship HubSpot Config

**Current Phase:** define → Target: validate

### Tasks
1. **Build Prototype** - `/proto hubspot-config`
   - Why: PRD complete, design brief exists
   
2. **Judge Result** - (auto)
   - Evaluate prototype quality
   
3. **Validate with Jury** - `/validate hubspot-config`
   - Why: Need user feedback before launch

Ready to start? Run task 1 or say 'execute plan'"

User: "execute plan"

[proto-builder runs]
[work-judge auto-invoked]

Agent: "## Judgment: Build Prototype

**Verdict:** ✅ Complete

| Criterion | Score |
|-----------|-------|
| Completeness | 5/5 |
| Quality | 4/5 |
| Alignment | 5/5 |

Proceeding to next task: Validate with Jury

Running `/validate hubspot-config`..."
```

---

## Decision Points for Tyler

### 1. Auto-Execution Level

How automatic should the workflow be?

| Option | Behavior |
|--------|----------|
| **A. Suggest Only** | Planner suggests, user approves each step |
| **B. Semi-Auto** | Auto-judge, but pause before next worker |
| **C. Full Auto** | Execute entire plan, pause only on blocks |

**Recommendation:** Start with **B (Semi-Auto)** - auto-judge gives fast feedback, but human stays in control.

### 2. Sub-Planners

Should planners spawn sub-planners for complex initiatives?

| Option | When |
|--------|------|
| **A. Single Planner** | One planner handles all decomposition |
| **B. Sub-Planners** | Large initiatives get specialized planning |

**Recommendation:** Start with **A (Single Planner)** - add sub-planners later if needed.

### 3. Judge Strictness

How strict should the judge be?

| Option | Pass Threshold |
|--------|----------------|
| **A. Lenient** | 3/5 average score |
| **B. Balanced** | 4/5 average score |
| **C. Strict** | 4/5 minimum per criterion |

**Recommendation:** **B (Balanced)** - catches issues without blocking progress.

---

## Implementation Checklist

### Week 1
- [ ] Create `goal-planner.md` subagent
- [ ] Create `task-planning` skill
- [ ] Create `/plan` command
- [ ] Test planning flow with 2-3 initiatives

### Week 2
- [ ] Update `proto-builder.md` with result format
- [ ] Update `research-analyzer.md` with result format
- [ ] Create `work-judge.md` subagent
- [ ] Create `work-judgment` skill
- [ ] Create `/judge` command

### Week 3
- [ ] Update `pm-foundation.mdc` with orchestration
- [ ] Create `/execute-plan` command
- [ ] Create `/tasks` command
- [ ] End-to-end testing
- [ ] Documentation updates to AGENTS.md

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Manual `/validate` invocations | 100% | <20% |
| Time from goal → first task | ~2 min (manual selection) | <30s (auto-plan) |
| Work quality issues caught | At validation phase | Immediately after worker |
| Iteration cycles per feature | Unknown | Tracked per task |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Over-automation feels loss of control | Semi-auto default, easy override |
| Judge too strict blocks progress | Balanced threshold, "continue anyway" option |
| Planning adds overhead for simple tasks | Detect simple tasks, skip planning |
| Complexity increases debugging difficulty | Structured logs, clear handoffs |

---

*Created: February 1, 2026*
*Status: Ready for review*
