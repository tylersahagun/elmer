# Transcript: Composio Agent Framework Architecture Deep Dive

**Date:** 2026-01-22
**Source:** Internal Design Discussion
**Participants:** Tyler (UX/PM), Matt (Engineering/Product)
**Initiative:** composio-agent-framework

---

## TL;DR

Deep architectural discussion clarifying how Composio, skills, memory, and sub-agents fit together. **Key insight: Composio is ONLY the toolbox (integrations/tools) - skills, memory, and sub-agents are separate layers we build on top.** Critical UX challenge identified: trigger/integration ordering in agent setup creates chicken-and-egg problem for first-time users.

---

## Key Concepts Defined

### Composio = Just the Toolbox
> "Composeo is literally just this box right here."
> "Composeo is, like, a competitor Pipedream... it's just the toolbox that we're plugging into our agent."

Composio handles:
- Integration connections (HubSpot, Slack, Gmail, etc.)
- Tools available per integration
- Tool execution

### Skills = Reusable Expertise
> "Skills are literally just a massive, like it's a skill name, a description, and then instructions are, like, a massive prompt that teaches it how to be an expert in a specific topic."

Skills are:
- NOT agents themselves
- Reusable across multiple agents
- Auto-discoverable via progressive disclosure
- Workspace-level or user-level configurable

### Memory = Persistence Beyond Context
> "Long term memory is, like, I have a conversation with the agent, and then I come back and I start a new conversation, and it remembers things from past conversations."

Two types:
- **Short-term**: Current conversation history (context window)
- **Long-term**: Persisted key information across sessions

### Sub-Agents = Delegation
> "If you wanna be able to, like, delegate a task entirely down to another agent that already exists, then, like, you can expose those sub agents to this guy that can then, like, hand a task off to this sub agent."

---

## Agent Architecture Model

Based on LangChain's model discussed:

```
┌──────────────────────────────────────┐
│            AGENT (Core)              │
├──────────────────────────────────────┤
│  ┌─────────┐  ┌──────────────────┐  │
│  │ Trigger │  │  Instructions    │  │
│  │ (When)  │  │  (What to do)    │  │
│  └─────────┘  └──────────────────┘  │
│                                      │
│  ┌─────────────────────────────────┐│
│  │        Toolbox (Composio)       ││
│  │  - Integrations                 ││
│  │  - Tools per integration        ││
│  └─────────────────────────────────┘│
│                                      │
│  ┌───────────┐  ┌────────────────┐  │
│  │  Skills   │  │  Sub-Agents    │  │
│  │ (Expertise│  │ (Delegation)   │  │
│  └───────────┘  └────────────────┘  │
│                                      │
│  ┌─────────────────────────────────┐│
│  │           Memory                ││
│  │  - Short-term (conversation)   ││
│  │  - Long-term (persistent)      ││
│  └─────────────────────────────────┘│
└──────────────────────────────────────┘
```

---

## Problems Identified

### Problem 1: Integration/Trigger Ordering UX
> "The problem is is that it it's not out of order from, like, the perspective of the way user thinks about it, which is why I'm like, I'm I don't know how to solve this problem because how do we show all the possible triggers for all possible integrations up front?"

- **Persona:** RevOps, any agent builder
- **Severity:** High
- **Context:** Users think trigger-first ("when a meeting ends...") but system needs integration-first (which integration provides that trigger?)

**Potential solutions discussed:**
1. Generic trigger categories (scheduled, on event) that then narrow down
2. AI-assisted setup that asks clarifying questions
3. Common triggers surfaced first (schedule, on meeting) with "event-based" revealing integration picker

### Problem 2: Tool Discovery at Scale
> "By the way, there's a lot of these. Like, Slack has, like, over a 100. So we need to think about how to search filtering."

- **Persona:** Agent builders
- **Severity:** Medium
- **Context:** Integrations like Slack have 100+ tools; need progressive disclosure/search

### Problem 3: First-Time User Context Gap
> "But the problem with this one is we don't guess, this could be, like, a first time user experience where we don't know what CRM they use or we don't know anything because, like, they're literally just logged in for the first time."

- **Persona:** New users
- **Severity:** Medium
- **Context:** Can't show smart defaults without tech stack knowledge

### Problem 4: Skills vs Agents Naming Confusion
> "I think what was kind of not making sense to me with this was the wording agent. I was thinking skills were agents, but that's not because that's kind of... Cursor has this, like, agent tab, but really what it is is is just a [skill]."

- **Persona:** Internal team, users
- **Severity:** Medium
- **Context:** Need clear mental model and terminology

---

## Key Insights

### 1. Skills Reduce Instruction Complexity
> "The cool thing about skills is that, like, the more complex and better the skills get, the, like, less instructions I need to give to the agent because it will then be able to fill in the gaps of my instructions and my prompt by leaning on the skills... to bridge those gaps."

**Implication:** Expert-authored skills (e.g., James writing RevOps best practices) make agent setup dramatically simpler for end users.

### 2. Progressive Disclosure Pattern for Skills
> "Skills are auto discoverable. There's, like, the concept of progressive disclosure, right, where, like, the skill name and description is always exposed to the agent, so it knows what skills and descriptions they has available to it... But it doesn't have the full context of everything about the skill."

**Pattern from Cursor rules:**
```
.cursor/rules/
├── skill-name.mdc          # Name + description (always loaded)
│   └── rules/              # Detailed rules (loaded on demand)
│       ├── rule-1.md
│       ├── rule-2.md
│       └── ...
```

Agent sees skill descriptions → decides relevance → loads full context when needed.

### 3. Workflows vs Agents Spectrum
> "Workflows is a more deterministic thing where it's like you have step by step by step. Now agent notes in a workflow kind of, like, blends the hybrid model together... Whereas this is, like, giving full autonomy to the agent to do everything."

**Spectrum:**
```
Deterministic ←————————————————→ Autonomous
Workflows      Agent Nodes       Full Agents
              (in workflows)
```

### 4. Agent Example: CRM Hygiene Agent
> "Let's say I'm, like, building my CRM hygiene agent... I configure my trigger that runs, like, after a meeting. My toolbox, I connect my HubSpot and all the tools I wanted to be able to do to update data in my HubSpot. And then my skills is, like, maybe I have a RevOps expert skill that also gets plugged in."

Complete example flow:
- **Trigger:** After meeting
- **Toolbox:** HubSpot integration + update tools
- **Skills:** RevOps expert skill (CRM best practices)
- **Instructions:** Simplified because skill handles expertise

### 5. Skills in Chat (Always-On)
> "Then, like, skills would be replacing, like, this experience. Like, it's it's literally just turning on some sort of agent in chat that you can talk to. Right?"

Skills can be:
- Always-on in chat (workspace-level)
- Auto-discoverable by agents (progressive disclosure)
- Not manually invoked—just available

---

## Decisions Made

1. **Composio scope is limited**: Composio = toolbox only; we build skills, memory, sub-agents ourselves
2. **Skills come before memory**: Skills layer is next priority after basic Composio integration
3. **Terminology clarity needed**: Must distinguish skills vs agents clearly in UX

---

## Feature Requests / Ideas

| Feature | Description | Priority |
|---------|-------------|----------|
| Generic trigger categories | "On schedule", "On event" as top-level categories before integration picker | High |
| AI-assisted setup | Chat-based agent creation that asks clarifying questions | High |
| Workspace skills | Pre-built expertise that can be toggled on for all agents | High |
| Progressive skill loading | Skills auto-load based on task context | Medium |
| RevOps expert skill | James-authored HubSpot/CRM best practices | High |
| Memory layer | Short-term + long-term persistence | Future |
| Sub-agent delegation | Hand off tasks to specialized agents | Future |

---

## Strategic Alignment

- ✅ **AI-First UX**: "AI walks you through its setup" - aligns with conversational configuration
- ✅ **Human Empowerment**: Skills encode human expertise, agents execute
- ✅ **2026 Initiative**: Directly supports Workflow Builder / AI Assistant Tool
- ✅ **Differentiation**: Skills as first-class concept differentiates from basic workflow tools

---

## Open Questions

1. **Skill authorship**: Who writes skills? Internal team only, or user-created?
2. **Skill marketplace**: Future potential for skill sharing/selling?
3. **Memory scope**: Workspace-level memory vs user-level vs agent-level?
4. **Authentication inheritance**: How do sub-agents inherit auth from parent?
5. **Skill conflicts**: What happens when two skills have contradictory guidance?

---

## Action Items

- [ ] Create skills architecture doc - Matt
- [ ] Prototype generic trigger categories UX - Tyler
- [ ] Draft RevOps expert skill with James - Tyler/James
- [ ] Update composio-agent-framework PRD with skills layer - Tyler
- [ ] Define skill vs agent terminology in design system - Adam

---

## Related Signals

- `sig-2026-01-22-adam-composio-agent-feedback` - Earlier design review
- `sig-2026-01-22-composio-figma-make-chat-interface` - Chat interface patterns

---

## Hypothesis Candidates

Based on this discussion, consider these hypotheses:

1. **Skills reduce agent configuration friction** - If we provide expert-authored skills, users can create effective agents with minimal prompt engineering
   - Matches existing: No direct match
   - Suggested: `hypothesis new agent-skills-reduce-config`

2. **Conversational agent setup outperforms forms** - Chat-based agent creation produces better-configured agents than traditional form flows
   - Matches existing: Partial match to adam-composio-agent-feedback
   - Suggested: Track with existing signal

3. **Progressive disclosure scales expertise** - Auto-loading skills based on context allows unlimited skill depth without context window limits
   - Matches existing: No
   - Suggested: Technical spike before hypothesis
