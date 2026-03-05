# PM Workspace Architecture vs. Cursor's Scaling Agents Architecture

> Analysis comparing the pm-workspace AGENTS.md architecture to Cursor's blog post ["Scaling long-running autonomous coding"](https://cursor.com/blog/scaling-agents) (Jan 14, 2026, Wilson Lin)

---

## Executive Summary

Your PM workspace architecture and Cursor's multi-agent scaling architecture solve **different problems** but share some underlying principles. Your system is optimized for **human-in-the-loop PM workflows** with specialized agents for discrete tasks, while Cursor's research explores **fully autonomous multi-agent coordination** for long-running coding projects.

**Key Finding**: Your architecture already implements several patterns that Cursor found successful (role separation, hierarchical structure, specialized agents), but operates at a different scale and with different coordination needs.

---

## Cursor's Architecture (from the blog)

### What They Tried (and Failed)

1. **Flat Peer Coordination** - Equal-status agents self-coordinating through shared state
   - Used locking mechanisms for task claiming
   - **Failed because**: Locks became bottlenecks, agents held locks too long, system became brittle
   - Agents became risk-averse with no hierarchy

2. **Optimistic Concurrency Control** - Read freely, fail on concurrent writes
   - Simpler but still had problems with no clear ownership

### What Worked: Planners and Workers

```
┌─────────────────────────────────────────────────────────────┐
│                    CURSOR'S ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                          │
│  │   PLANNERS   │ ← Explore codebase, create tasks         │
│  │              │   Can spawn sub-planners (recursive)     │
│  └──────┬───────┘                                          │
│         │                                                   │
│         │ Creates tasks                                     │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │   WORKERS    │ ← Pick up tasks, focus on completion     │
│  │  (hundreds)  │   Don't coordinate with each other       │
│  └──────┬───────┘   Just grind until done, push changes    │
│         │                                                   │
│         │ Results                                           │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │    JUDGE     │ ← Determines whether to continue         │
│  │              │   Fresh start each cycle                 │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Learnings from Cursor

1. **Role separation is essential** - Planners plan, workers work, judges judge
2. **Different models for different roles** - GPT-5.2 better for planning than Codex
3. **Removing complexity helped** - Removed "integrator" role that created bottlenecks
4. **Prompts matter most** - More than harness or models
5. **Middle-ground structure** - Too little = conflicts/drift, too much = fragility

---

## Your PM Workspace Architecture

### The Four Layers

```
┌─────────────────────────────────────────────────────────────┐
│                  PM WORKSPACE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LAYER 1: RULES (.cursor/rules/)                     │  │
│  │  • pm-foundation.mdc (always-on)                     │  │
│  │  • component-patterns.mdc (glob-triggered)           │  │
│  │  • Declarative context shaping behavior              │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LAYER 2: SKILLS (.cursor/skills/)                   │  │
│  │  • Procedural "how-to" knowledge                     │  │
│  │  • 20+ specialized skills                            │  │
│  │  • Agent-decided when relevant                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LAYER 3: SUBAGENTS (.cursor/agents/)                │  │
│  │  • Isolated context for complex workflows            │  │
│  │  • 15+ specialized subagents                         │  │
│  │  • Own prompts, can use different models             │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LAYER 4: COMMANDS (.cursor/commands/)               │  │
│  │  • Thin orchestrators routing to handlers            │  │
│  │  • User intent → appropriate subagent/skill          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Your Role Separation

| Your Role | Cursor Equivalent | Purpose |
|-----------|-------------------|---------|
| `pm-foundation.mdc` (always-on) | Planner context | High-level coordination, routing |
| Commands | Task dispatch | Route user intent to appropriate handler |
| Subagents | Workers | Execute specialized workflows |
| Skills | Worker procedures | Step-by-step execution knowledge |
| Validator subagent | Judge | Determines if work passes quality bar |

---

## Comparison Matrix

| Dimension | Cursor's System | Your PM Workspace |
|-----------|-----------------|-------------------|
| **Scale** | Hundreds of concurrent agents | Single agent with subagent delegation |
| **Duration** | Weeks of autonomous work | Session-based with human checkpoints |
| **Coordination** | Planner→Worker→Judge pipeline | Command→Subagent→Skill routing |
| **Hierarchy** | 3-tier (Planner/Worker/Judge) | 4-layer (Rules/Skills/Subagents/Commands) |
| **Shared State** | Git branch (same repo) | File system + MCP tools |
| **Task Granularity** | Large project chunks | Discrete PM artifacts |
| **Human Role** | Observer | Active participant (human-in-loop) |
| **Model Strategy** | Different models per role | Model hints (`fast` vs `inherit`) |

---

## What You're Already Doing Well

### 1. Role Separation ✓
Cursor learned that flat coordination fails. Your architecture already has clear role separation:

```
Commands (orchestration) → Subagents (execution) → Skills (procedures)
```

This is analogous to Cursor's:
```
Planners (what to do) → Workers (do it) → Judge (evaluate)
```

### 2. Specialized Agents ✓
Cursor found that workers should focus on one task without coordinating with others. Your subagents do this:
- `proto-builder` - Only builds prototypes
- `research-analyzer` - Only analyzes research
- `validator` - Only validates (your "judge")

### 3. Different Models for Different Roles ✓
Cursor uses GPT-5.2 for planning, other models for coding. You already specify:
```yaml
model: fast   # For quick tasks (research-analyzer, signals-processor)
model: inherit # For complex work (proto-builder, validator)
```

### 4. Avoiding Over-Structure ✓
Cursor removed the "integrator" role because it created bottlenecks. Your architecture keeps subagents independent—they don't coordinate with each other, only report results.

---

## Gaps and Opportunities

### 1. Missing: Recursive Planning

**Cursor**: Planners can spawn sub-planners for specific areas, making planning parallel and recursive.

**Your System**: Planning is single-threaded. The main agent plans, then delegates. No sub-planning.

**Opportunity**: Your `signals-processor` and `posthog-analyst` could spawn sub-tasks when synthesizing large amounts of data.

### 2. Missing: Judge-at-End Pattern

**Cursor**: Judge agent at end of each cycle determines whether to continue or start fresh.

**Your System**: `validator` subagent exists but requires explicit invocation (`/validate`).

**Opportunity**: Automatically invoke validation after `/proto` or `/iterate` to determine if work should continue or needs revision.

### 3. Missing: Continuous Operation Mode

**Cursor**: Agents run for weeks autonomously.

**Your System**: Session-based, requires human to invoke commands.

**Opportunity**: Not necessarily needed—your system is designed for human-in-loop PM work, not autonomous coding. But could add `/auto-iterate` for overnight prototype iteration cycles.

### 4. Missing: Conflict Resolution Strategy

**Cursor**: Addressed git conflicts between hundreds of workers pushing to same branch.

**Your System**: Single agent, no concurrent work conflicts. But MCP tool conflicts could occur.

**Opportunity**: Add coordination for Slack/Notion/Linear operations when multiple workflows trigger simultaneously.

### 5. Prompt Engineering Focus

**Cursor**: "A surprising amount of the system's behavior comes down to how we prompt the agents."

**Your System**: Extensive prompt engineering in subagent files, but not documented as primary optimization lever.

**Opportunity**: Add a `prompt-engineering.md` skill documenting what prompt patterns work best for each subagent.

---

## Architectural Alignment Score

| Cursor Principle | Your Implementation | Score |
|-----------------|---------------------|-------|
| Separate roles (planner/worker/judge) | Commands → Subagents → Validator | ⭐⭐⭐⭐ |
| Workers don't coordinate with each other | Subagents independent | ⭐⭐⭐⭐⭐ |
| Different models for different roles | `fast` vs `inherit` | ⭐⭐⭐⭐ |
| Remove unnecessary complexity | Skills kept minimal | ⭐⭐⭐⭐ |
| Prompts > harness/models | Strong subagent prompts | ⭐⭐⭐⭐ |
| Fresh starts combat drift | Session-based naturally | ⭐⭐⭐⭐⭐ |
| Recursive planning | Not implemented | ⭐⭐ |
| Automatic judge cycles | Manual `/validate` | ⭐⭐⭐ |

**Overall Alignment: 85%** - Your architecture aligns well with Cursor's findings, with room for improvement in automated validation and recursive planning.

---

## Recommendations

### Short-Term (Low Effort)

1. **Auto-validate after builds**: Add automatic `/validate` invocation after `/proto` completes
2. **Document prompt patterns**: Create skill documenting what prompts work for each subagent type

### Medium-Term

3. **Add Judge-at-End Pattern**: Modify `iterator` subagent to automatically assess whether another iteration is needed
4. **Recursive synthesis**: Allow `signals-processor` to spawn sub-tasks for large signal sets

### Long-Term (If Needed)

5. **Continuous mode**: Add `/auto-iterate [name] --cycles=N` for overnight autonomous iteration
6. **Conflict coordination**: Add MCP operation queuing to prevent race conditions

---

## Conclusion

Your PM workspace architecture demonstrates **strong alignment** with the patterns Cursor discovered through extensive experimentation. The key difference is scope: Cursor's system handles hundreds of parallel agents running for weeks, while yours optimizes for a single user with discrete, human-supervised workflows.

The principles transfer well:
- ✓ Role separation prevents coordination overhead
- ✓ Specialized agents focus on their domain
- ✓ Different models for different tasks
- ✓ Simple structure beats complex coordination

Your architecture is **well-suited for its purpose**. The main opportunities are in automating validation cycles and enabling recursive sub-planning for complex synthesis tasks.

---

*Analysis generated: February 1, 2026*
*Blog post: ["Scaling long-running autonomous coding"](https://cursor.com/blog/scaling-agents) by Wilson Lin*
