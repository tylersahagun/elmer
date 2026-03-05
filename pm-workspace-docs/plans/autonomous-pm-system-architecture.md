# Autonomous PM System Architecture

> What it would look like to replace human-in-the-loop with fully autonomous operation

---

## The Shift

| Dimension | Current (HITL) | Autonomous |
|-----------|----------------|------------|
| **Initiation** | Tyler runs commands | System runs continuously |
| **Planning** | Tyler decides what's next | System prioritizes from backlog |
| **Execution** | One task at a time | Parallel workers on multiple initiatives |
| **Judgment** | Tyler reviews, approves | System self-evaluates |
| **Iteration** | Tyler says "iterate" | System auto-iterates until quality bar met |
| **Escalation** | Everything goes to Tyler | Only blockers surface to Tyler |
| **Duration** | Session-based (~hours) | Continuous (~days/weeks) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTONOMOUS PM SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         GOAL LAYER                                   │   │
│  │                                                                      │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐ │   │
│  │   │ Goal Backlog │───▶│   Prioritizer │───▶│ Active Goal Queue   │ │   │
│  │   │              │    │               │    │                      │ │   │
│  │   │ - OKRs       │    │ - Revenue     │    │ 1. Ship HubSpot v2   │ │   │
│  │   │ - Roadmap    │    │ - Urgency     │    │ 2. Rep Workspace     │ │   │
│  │   │ - Signals    │    │ - Dependencies│    │ 3. Signal Tables     │ │   │
│  │   └──────────────┘    └──────────────┘    └──────────────────────┘ │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PLANNER LAYER                                 │   │
│  │                                                                      │   │
│  │   ┌──────────────────┐         ┌─────────────────────────────────┐ │   │
│  │   │  Master Planner  │────────▶│        Sub-Planners             │ │   │
│  │   │                  │         │                                  │ │   │
│  │   │  - Goal → Tasks  │         │  ┌─────────┐ ┌─────────┐       │ │   │
│  │   │  - Dependencies  │         │  │Research │ │ Build   │ ...   │ │   │
│  │   │  - Parallelism   │         │  │ Planner │ │ Planner │       │ │   │
│  │   └──────────────────┘         │  └─────────┘ └─────────┘       │ │   │
│  │            │                    └─────────────────────────────────┘ │   │
│  │            ▼                                                        │   │
│  │   ┌──────────────────┐                                             │   │
│  │   │    Task Queue    │  ← Ordered, with dependencies               │   │
│  │   │                  │                                             │   │
│  │   │  [P0] proto-hub  │                                             │   │
│  │   │  [P0] research-x │  ← Can run in parallel                      │   │
│  │   │  [P1] iterate-y  │  ← Waits for proto-hub                      │   │
│  │   └──────────────────┘                                             │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        WORKER LAYER                                  │   │
│  │                                                                      │   │
│  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │   │   Worker 1  │ │   Worker 2  │ │   Worker 3  │ │   Worker N  │  │   │
│  │   │             │ │             │ │             │ │             │  │   │
│  │   │ proto-build │ │  research   │ │  signals    │ │   iterate   │  │   │
│  │   │  hubspot    │ │  rep-wksp   │ │  processor  │ │  signal-tbl │  │   │
│  │   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘  │   │
│  │          │               │               │               │         │   │
│  │          └───────────────┴───────────────┴───────────────┘         │   │
│  │                                    │                                │   │
│  │                                    ▼                                │   │
│  │                         ┌──────────────────┐                       │   │
│  │                         │   Work Results   │                       │   │
│  │                         │   (Structured)   │                       │   │
│  │                         └──────────────────┘                       │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         JUDGE LAYER                                  │   │
│  │                                                                      │   │
│  │   ┌──────────────────┐    ┌──────────────────────────────────────┐ │   │
│  │   │    Work Judge    │───▶│              Verdicts                 │ │   │
│  │   │                  │    │                                       │ │   │
│  │   │  - Quality check │    │  ✅ Complete → Next task              │ │   │
│  │   │  - Completeness  │    │  🔄 Iterate → Back to worker          │ │   │
│  │   │  - Alignment     │    │  ⚠️ Concern → Flag for review         │ │   │
│  │   └──────────────────┘    │  ❌ Block → Escalate to human         │ │   │
│  │                           └──────────────────────────────────────┘ │   │
│  │            │                                                        │   │
│  │            ▼                                                        │   │
│  │   ┌──────────────────┐                                             │   │
│  │   │   Plan Judge     │  ← Evaluates planner output too             │   │
│  │   │                  │                                             │   │
│  │   │  - Plan quality  │                                             │   │
│  │   │  - Feasibility   │                                             │   │
│  │   │  - Alignment     │                                             │   │
│  │   └──────────────────┘                                             │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ORCHESTRATION LAYER                             │   │
│  │                                                                      │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │   │
│  │   │    Cycle     │  │    State     │  │      Escalation        │  │   │
│  │   │   Manager    │  │   Manager    │  │       Manager          │  │   │
│  │   │              │  │              │  │                        │  │   │
│  │   │ - Run loops  │  │ - Persist    │  │ - Slack Tyler on block │  │   │
│  │   │ - Fresh start│  │ - Resume     │  │ - Daily digest         │  │   │
│  │   │ - Drift check│  │ - Checkpoint │  │ - Approval requests    │  │   │
│  │   └──────────────┘  └──────────────┘  └────────────────────────┘  │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Deep Dives

### 1. Goal Layer

The system needs to know **what to work on** without human input.

```yaml
# pm-workspace-docs/autonomous/goal-backlog.yaml

goals:
  - id: goal-001
    name: "Ship HubSpot Config v2"
    source: roadmap  # Where this came from
    priority: P0
    deadline: 2026-02-15
    success_criteria:
      - "Prototype validated with 70%+ jury approval"
      - "Engineering spec complete"
      - "Design handoff done"
    initiatives:
      - hubspot-config
    
  - id: goal-002
    name: "Understand rep workspace needs"
    source: signals  # Emerged from customer feedback
    priority: P1
    success_criteria:
      - "Research synthesis complete"
      - "3+ user interviews analyzed"
      - "Hypothesis documented"
    initiatives:
      - rep-workspace-v4

prioritization_rules:
  - "P0 before P1"
  - "Revenue-impacting before internal"
  - "Unblock dependencies first"
  - "Respect roadmap commitments"
```

**Goal Sources:**
- Roadmap items (quarterly commitments)
- High-signal customer feedback
- Churn reasons from HubSpot
- Leadership directives
- Dependency unblocks

### 2. Planner Layer

Breaks goals into executable tasks.

```yaml
# .cursor/agents/master-planner.md

---
name: master-planner
description: Decomposes goals into tasks, manages dependencies, enables parallelism
model: inherit  # Best model for planning
---

# Master Planner

## Continuous Operation

Run every cycle to:
1. Check goal backlog for active goals
2. Assess current state of each goal
3. Generate/update task queue
4. Identify parallelizable work
5. Spawn sub-planners for complex areas

## Task Generation

For each goal, generate tasks following the initiative lifecycle:

```
discovery: [research tasks]
     ↓
define: [PRD, design brief tasks]
     ↓
build: [prototype, iteration tasks]
     ↓
validate: [jury, stakeholder tasks]
     ↓
launch: [GTM, engineering handoff tasks]
```

## Parallelism Rules

- Different initiatives CAN run in parallel
- Same initiative tasks run sequentially (with dependencies)
- Research tasks can always run in parallel
- Build tasks for same component are sequential

## Output: Task Queue

```json
{
  "cycle": 42,
  "generated_at": "2026-02-01T10:00:00Z",
  "tasks": [
    {
      "id": "task-042-001",
      "goal_id": "goal-001",
      "initiative": "hubspot-config",
      "type": "build",
      "handler": "proto-builder",
      "command": "/proto hubspot-config",
      "depends_on": [],
      "parallel_group": "A",
      "max_iterations": 3,
      "timeout_hours": 4
    },
    {
      "id": "task-042-002",
      "goal_id": "goal-002",
      "initiative": "rep-workspace-v4",
      "type": "research",
      "handler": "research-analyzer",
      "command": "/research rep-workspace-v4",
      "depends_on": [],
      "parallel_group": "A",  # Same group = can run parallel
      "max_iterations": 2,
      "timeout_hours": 2
    },
    {
      "id": "task-042-003",
      "goal_id": "goal-001",
      "initiative": "hubspot-config",
      "type": "validate",
      "handler": "validator",
      "command": "/validate hubspot-config",
      "depends_on": ["task-042-001"],  # Sequential
      "parallel_group": "B",
      "max_iterations": 1,
      "timeout_hours": 2
    }
  ]
}
```
```

### 3. Worker Layer

Existing subagents, enhanced for autonomous operation.

**Key Changes:**

```yaml
# Updates to each worker subagent

## Autonomous Mode Requirements

### Structured Output (Required)
Every worker MUST output:

```json
{
  "worker": "proto-builder",
  "task_id": "task-042-001",
  "iteration": 1,
  "status": "complete|failed|needs_input",
  "artifacts": [...],
  "metrics": {...},
  "self_assessment": {
    "completeness": 4,
    "quality": 4,
    "confidence": 3
  },
  "blockers": [],
  "ready_for_judge": true
}
```

### No Human Input
Workers cannot ask clarifying questions in autonomous mode.
Must make reasonable assumptions and document them.

### Timeout Handling
If task exceeds timeout_hours:
- Save current state
- Mark as "timeout"
- Let judge decide: iterate or escalate

### Iteration Limits
Track iteration count. If max_iterations reached:
- Output best effort
- Mark for human review
```

### 4. Judge Layer

Evaluates ALL work automatically.

```yaml
# .cursor/agents/work-judge.md (enhanced)

---
name: work-judge
description: Evaluates all worker output, decides next action
model: inherit
---

# Work Judge (Autonomous Mode)

## Evaluation Criteria

| Criterion | Weight | Threshold |
|-----------|--------|-----------|
| Completeness | 30% | ≥4/5 |
| Quality | 30% | ≥4/5 |
| Alignment | 25% | ≥4/5 |
| Confidence | 15% | ≥3/5 |

**Pass:** Weighted score ≥ 4.0
**Iterate:** Weighted score 3.0-3.9
**Escalate:** Weighted score < 3.0 OR any criterion < 2

## Verdict Actions

### ✅ Complete
- Mark task done
- Update initiative _meta.json
- Trigger next task in queue
- Log success metrics

### 🔄 Iterate
- Generate specific feedback
- Decrement iteration budget
- Re-queue task with feedback context
- If iterations exhausted → escalate

### ⚠️ Concern
- Flag for human review
- Continue with other tasks
- Include in daily digest

### ❌ Block
- Stop work on this goal
- Escalate immediately (Slack DM)
- Document blocker clearly
- Suggest human actions

## Plan Judge

Also evaluates planner output:

- Is the plan feasible?
- Are dependencies correct?
- Is parallelism safe?
- Does plan align with goal?

Bad plans get regenerated before execution.
```

### 5. Orchestration Layer

Manages continuous operation.

```yaml
# .cursor/agents/cycle-manager.md

---
name: cycle-manager
description: Runs the autonomous loop, manages state, handles drift
model: fast
---

# Cycle Manager

## The Loop

```
while True:
    1. Load state from last checkpoint
    2. Check for human overrides/inputs
    3. Run planner (if needed)
    4. Execute ready tasks (parallel where possible)
    5. Judge all completed work
    6. Update state, checkpoint
    7. Check for drift/stuck detection
    8. Generate status report
    9. Sleep until next cycle (or wake on event)
```

## Cycle Timing

| Mode | Cycle Duration | Use Case |
|------|---------------|----------|
| Sprint | 15 minutes | Active development |
| Normal | 1 hour | Background operation |
| Overnight | 2 hours | Low-priority work |

## Drift Detection

Signs the system is drifting:
- Same task failing 3+ times
- No progress on goal for 24+ hours
- Workers producing increasingly low scores
- Contradictory outputs

**Response:** Fresh start on affected goal
- Reset to last good checkpoint
- Re-plan from scratch
- If still stuck → escalate

## State Management

```json
// pm-workspace-docs/autonomous/state.json
{
  "last_cycle": 42,
  "last_checkpoint": "2026-02-01T10:00:00Z",
  "active_goals": ["goal-001", "goal-002"],
  "task_queue": [...],
  "completed_tasks": [...],
  "blocked_tasks": [...],
  "metrics": {
    "tasks_completed_24h": 12,
    "avg_iterations_per_task": 1.4,
    "escalation_rate": 0.08
  }
}
```

## Fresh Start Protocol

Every 24-48 hours (configurable):
1. Checkpoint current state
2. Clear working memory
3. Re-load goals from backlog
4. Re-plan all active goals
5. Compare new plan to old
6. Continue with new plan

Prevents tunnel vision and accumulated errors.
```

### 6. Escalation System

When and how to involve Tyler.

```yaml
# .cursor/agents/escalation-manager.md

---
name: escalation-manager
description: Decides when to escalate to human, manages communication
model: fast
---

# Escalation Manager

## Escalation Tiers

### Tier 1: Informational (Daily Digest)
- Task completions
- Minor concerns flagged
- Progress metrics
- Upcoming work

**Delivery:** Slack message, 9am daily

### Tier 2: Review Needed (Async)
- Work flagged as "concern"
- Iteration limits reached
- Low confidence outputs
- Plan changes

**Delivery:** Slack message with review links
**Response time:** Within 24 hours OK

### Tier 3: Decision Required (Soon)
- Strategic alignment questions
- Resource/priority conflicts
- External dependencies
- Scope changes

**Delivery:** Slack DM + email
**Response time:** Within 4 hours preferred

### Tier 4: Blocked (Immediate)
- System errors
- Complete failures
- Security/compliance issues
- Contradictory requirements

**Delivery:** Slack DM + SMS (if configured)
**Response time:** ASAP

## Escalation Message Format

```markdown
## 🚨 [Tier] Escalation: [Title]

**Goal:** [goal name]
**Initiative:** [initiative]
**Task:** [task that triggered]

### What Happened
[Clear description]

### What I Tried
[Actions taken]

### What I Need
[Specific ask - decision, input, approval]

### Options (if applicable)
A. [Option with tradeoffs]
B. [Option with tradeoffs]

### Deadline
[When decision needed by]

[Links to relevant artifacts]
```

## Human Override Interface

Tyler can intervene anytime:

- `/pause` - Stop all autonomous work
- `/resume` - Continue from checkpoint
- `/override [task] [direction]` - Force specific action
- `/reprioritize [goal] [priority]` - Change goal priority
- `/add-goal [description]` - Add new goal to backlog
- `/cancel-goal [goal-id]` - Remove goal from backlog
```

---

## Daily Operation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    24-HOUR AUTONOMOUS CYCLE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  6:00 AM  ┌──────────────────────────────────────────────────┐ │
│           │ Morning Refresh                                   │ │
│           │ - Pull latest signals from Slack, Linear, HubSpot │ │
│           │ - Update goal backlog with new inputs             │ │
│           │ - Re-prioritize based on overnight changes        │ │
│           └──────────────────────────────────────────────────┘ │
│                              │                                  │
│  7:00 AM  ┌──────────────────▼──────────────────────────────┐ │
│           │ Planning Cycle                                   │ │
│           │ - Master planner assesses all active goals       │ │
│           │ - Generate task queue for the day                │ │
│           │ - Plan judge validates                           │ │
│           └──────────────────────────────────────────────────┘ │
│                              │                                  │
│  8:00 AM  ┌──────────────────▼──────────────────────────────┐ │
│           │ Work Execution (Parallel)                        │ │
│           │ - Workers execute tasks from queue               │ │
│           │ - Judge evaluates each completion                │ │
│           │ - Iterate or proceed based on verdicts           │ │
│           └──────────────────────────────────────────────────┘ │
│                              │                                  │
│  9:00 AM  ┌──────────────────▼──────────────────────────────┐ │
│           │ Daily Digest to Tyler                            │ │
│           │ - What completed overnight                       │ │
│           │ - What's in progress                             │ │
│           │ - What needs review                              │ │
│           │ - What's blocked                                 │ │
│           └──────────────────────────────────────────────────┘ │
│                              │                                  │
│  9 AM -   ┌──────────────────▼──────────────────────────────┐ │
│  6 PM     │ Active Hours (Human Available)                   │ │
│           │ - Continue execution                             │ │
│           │ - Faster escalation response expected            │ │
│           │ - Tyler can intervene, reprioritize              │ │
│           │ - Higher-risk tasks scheduled here               │ │
│           └──────────────────────────────────────────────────┘ │
│                              │                                  │
│  6:00 PM  ┌──────────────────▼──────────────────────────────┐ │
│           │ End of Day Summary                               │ │
│           │ - What got done                                  │ │
│           │ - What's queued for overnight                    │ │
│           │ - Any blockers for tomorrow                      │ │
│           └──────────────────────────────────────────────────┘ │
│                              │                                  │
│  6 PM -   ┌──────────────────▼──────────────────────────────┐ │
│  6 AM     │ Overnight (Low-Risk Only)                        │ │
│           │ - Research tasks                                 │ │
│           │ - Signal processing                              │ │
│           │ - Iteration on approved prototypes               │ │
│           │ - NO new prototypes, NO strategic decisions      │ │
│           │ - Escalations queue for morning                  │ │
│           └──────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Changes from Current System

### New Components

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `goal-backlog.yaml` | Source of truth for goals | Low |
| `master-planner` subagent | Autonomous planning | High |
| `cycle-manager` subagent | Runs the loop | High |
| `escalation-manager` subagent | Human communication | Medium |
| `state.json` | Persistent state | Low |
| Cron/scheduler | Triggers cycles | Medium |

### Modified Components

| Component | Change |
|-----------|--------|
| All worker subagents | Add structured output, no clarification questions |
| `work-judge` | Auto-invoke, iterate logic |
| `pm-foundation.mdc` | Override detection, pause handling |
| MCP integrations | Signal ingestion automation |

### Removed/Replaced

| Current | Replaced By |
|---------|-------------|
| Manual command invocation | Automatic task execution |
| Tyler deciding next steps | Planner + prioritizer |
| Manual `/validate` | Auto-judge after every task |
| Session-based context | Persistent state |

---

## Technical Requirements

### Infrastructure

```yaml
# What you'd need to run this

compute:
  - Always-on process (or cron-triggered)
  - Can run in GitHub Actions, cloud VM, or local daemon

state_storage:
  - File-based (current) works for single-agent
  - Database if scaling to multiple parallel workers

external_integrations:
  - Slack (escalations, digests) ← Already have via MCP
  - Linear (task sync) ← Already have
  - HubSpot (signals) ← Already have
  - PostHog (metrics) ← Already have
  - GitHub (commits, PRs) ← Already have

monitoring:
  - Cycle success/failure tracking
  - Task completion metrics
  - Escalation rate monitoring
  - Cost tracking (API calls)
```

### Cursor/Agent Setup

```yaml
# How to actually run autonomous agents

option_a_github_actions:
  - Scheduled workflow runs every hour
  - Uses Cursor CLI or API
  - State persisted in repo
  - Pros: Free, integrated with repo
  - Cons: Cold start each cycle, limited parallelism

option_b_cloud_vm:
  - Always-on VM running agent loop
  - Direct Cursor API access
  - State in local files or database
  - Pros: True continuous operation, fast
  - Cons: Cost, maintenance

option_c_cursor_background_agents:
  - Use Cursor's built-in background agent feature
  - Configure for long-running tasks
  - Pros: Native integration
  - Cons: Depends on Cursor capabilities
```

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Drift/tunnel vision | High | Medium | Fresh starts every 24-48h |
| Wrong work prioritized | Medium | High | Human review of daily plan |
| Quality degradation | Medium | High | Strict judge thresholds |
| Runaway costs | Medium | Medium | Budget limits, alerts |
| Missed escalations | Low | High | Multiple channels, SMS for Tier 4 |
| State corruption | Low | High | Frequent checkpoints, backups |
| Strategic misalignment | Medium | High | Alignment check in planner |

---

## Migration Path

### Phase 1: Foundation (2 weeks)
- [ ] Create goal backlog structure
- [ ] Add structured output to all workers
- [ ] Implement work-judge auto-invocation
- [ ] Test with manual cycle triggering

### Phase 2: Planning (2 weeks)
- [ ] Build master-planner subagent
- [ ] Implement task queue
- [ ] Add plan-judge
- [ ] Test planning accuracy

### Phase 3: Automation (2 weeks)
- [ ] Build cycle-manager
- [ ] Implement state persistence
- [ ] Set up scheduled execution
- [ ] Test overnight runs

### Phase 4: Escalation (1 week)
- [ ] Build escalation-manager
- [ ] Configure Slack integrations
- [ ] Set up daily digest
- [ ] Test escalation flows

### Phase 5: Tuning (Ongoing)
- [ ] Adjust judge thresholds
- [ ] Tune cycle timing
- [ ] Optimize parallelism
- [ ] Reduce escalation rate

---

## Cost Estimate

| Component | Monthly Cost (Est.) |
|-----------|---------------------|
| LLM API calls (planning, judging) | $200-500 |
| LLM API calls (workers) | $500-2000 |
| Compute (if cloud VM) | $50-100 |
| Storage | ~$0 (file-based) |
| **Total** | **$750-2600/month** |

*Highly dependent on:*
- Number of active goals
- Iteration frequency
- Model choices (GPT-4 vs smaller models)

---

## Is This Right for You?

### Good Fit If:
- You want PM work happening while you sleep
- You have clear, well-defined goals
- You trust the system to make reasonable decisions
- You're OK reviewing work async rather than directing it

### Not a Good Fit If:
- Work requires heavy human judgment/creativity
- Goals are ambiguous or frequently changing
- You want tight control over every decision
- Cost is a primary concern

### Hybrid Approach (Recommended Start):
1. Run autonomous for **low-risk tasks only**:
   - Signal ingestion
   - Research analysis
   - Iteration on approved prototypes
   
2. Keep human-in-loop for **high-stakes work**:
   - New prototypes
   - Strategic decisions
   - External communications

This gives you the benefits of automation where it's safe, while keeping control where it matters.

---

*Created: February 1, 2026*
*Status: Conceptual design for review*
