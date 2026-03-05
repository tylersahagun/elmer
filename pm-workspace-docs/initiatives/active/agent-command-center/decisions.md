# Decisions Log: Agent Command Center

## Purpose

Track key decisions, their rationale, and any alternatives considered. This log consolidates decisions from the four merged initiatives (CRM-ETE, Rep Workspace, Chief-of-Staff Hub, Chief-of-Staff Recap Hub) plus new decisions made during the merge.

---

## Decision: Merge Four Initiatives into Agent Command Center

**Date:** 2026-02-07
**Deciders:** Tyler
**Status:** Accepted

### Context

Four separate initiatives all pointed at the same core problem: users have no single place to configure agents, see what they've done, and consume their output. CRM-ETE focused on workflow visibility, Rep Workspace on a deal dashboard, Chief-of-Staff Hub on a daily proactive hub, and Chief-of-Staff Recap Hub on meeting artifacts. All four converge on chat as the central orchestration surface.

### Options Considered

1. **Option A: Keep separate and coordinate**
   - Pros: Smaller scope per initiative
   - Cons: Fragmented UX, duplicate concepts (inbox, activity feed, config), no unified vision

2. **Option B: Merge into single initiative with chat as center (Selected)**
   - Pros: Single coherent vision, one surface for users, eliminates duplication
   - Cons: Larger scope, requires careful phasing

### Decision

Merge all four into "Agent Command Center" — a chat-centric experience where users configure agents, monitor activity, consume artifacts, and manage deals from a single surface.

### Consequences

- Source initiatives move to archived
- Existing prototypes and validation results carry over as reference
- New PRD reframes everything around chat-first interaction
- Phasing becomes critical — can't ship everything at once

---

## Decision: Chat as the Primary Configuration Surface

**Date:** 2026-02-07 (consolidating decisions from 2026-01-28, 2026-01-29, 2026-01-30)
**Deciders:** Sam Ho, Tyler, Rob Henderson
**Status:** Accepted

### Context

Multiple leadership conversations confirmed that the workflow builder should not be the primary way users configure agents. Sam explicitly said "Your settings are not toggles anymore...It's a chat." Rob wants a proactive hub. James (RevOps) spends 100+ hours in the workflow builder.

### Options Considered

1. **Option A: Improve the workflow builder UX**
   - Pros: Familiar paradigm, power user support
   - Cons: Still requires builder expertise, doesn't solve navigation
2. **Option B: Chat-based configuration (Selected)**
   - Pros: Natural language, no UI learning curve, AI-first
   - Cons: Needs strong AI understanding of user intent

### Decision

Users configure agents through chat conversation. The workflow builder remains available for power users but chat is the default and recommended path.

### Consequences

- Global Chat becomes a critical dependency
- Need excellent intent recognition for config requests
- Workflow builder still exists for advanced use cases
- Config changes via chat must be transparent and reversible

---

## Decision: Approval by Exception (Not Approval for Everything)

**Date:** 2026-01-29
**Deciders:** Sam Ho, Tyler
**Status:** Accepted
**Source:** Chief-of-Staff Recap Hub

### Context

Sam expressed strong frustration with constant approval requests: "I hate that Cloud Code asks me all the time to approve X, Y, Z." Constant approvals train users to rubber-stamp or ignore.

### Options Considered

1. **Option A: Approve everything (current state)**
   - Pros: Maximum control, zero risk of unwanted actions
   - Cons: Creates fatigue, reduces trust, trains ignoring

2. **Option B: Approval by exception (Selected)**
   - Pros: Low-risk actions run automatically, only high-risk surfaces for review
   - Cons: Must define risk thresholds carefully, need audit trail

### Decision

Auto-run low-risk actions. Only surface high-risk actions for human approval. Provide full audit trail for everything.

### Consequences

- Need to define risk tiers per persona
- Audit trail must be comprehensive
- Users can tighten/loosen thresholds via chat
- Trust builds through transparency, not through asking permission for everything

---

## Decision: Outputs as Artifacts, Not Workflow Chat

**Date:** 2026-01-30
**Deciders:** Sam Ho, Tyler
**Status:** Accepted
**Source:** Chief-of-Staff Recap Hub

### Context

Sam explicitly distinguished between workflow outputs and artifacts: "These workflows don't generate a chat. They generate artifacts." Meeting recaps, coaching insights, and prep docs should feel like polished products, not buried chat responses.

### Options Considered

1. **Option A: Keep outputs in workflow chat threads**
   - Pros: Simple, no new UI
   - Cons: Buried, hard to find, doesn't feel professional

2. **Option B: Dedicated artifact views (Selected)**
   - Pros: Polished, shareable, professional, findable
   - Cons: More UI to build, need artifact rendering system

### Decision

Workflow outputs render as dedicated artifacts (Recap, Prep, Coaching, etc.) with their own views, not as chat messages in a workflow thread.

### Consequences

- Need artifact rendering framework
- Artifacts are shareable to Slack/CRM/Email
- Meeting page defaults to clean recap view
- Tabs: Recap (default), Prep, Coaching

---

## Decision: Confidence-Building as Core Design Principle

**Date:** 2026-01-16
**Deciders:** Tyler, Bryan
**Status:** Accepted
**Source:** CRM-ETE

### Context

User story brain dump emphasized that the key emotion users need is **confidence** that the system will work before they commit to automation.

> "I want to be able to actually test and see an output so that I have confidence."

### Decision

Every interaction should build user confidence. Show, don't tell. Let users test before committing. Education first, then test on real data before activating.

### Consequences

- Must support "preview mode" before activation
- Confidence scores displayed prominently
- Isolated test runs without production impact
- Progressive disclosure: start simple, expand as confidence grows

---

## Decision: Focus on Workflow Configuration Experience, Not CRM Features

**Date:** 2026-01-16
**Deciders:** James Hinkson, Tyler, Bryan, Woody
**Status:** Accepted
**Source:** CRM-ETE

### Context

James presented a fork: build CRM features in AskElephant OR improve workflow configuration.

> "I would put every penny towards experience of how someone interacts with workflows today."

### Decision

Focus on making automation configuration easy. Users already have HubSpot/Salesforce — don't replicate CRM features. Make the AI agent management experience world-class instead.

### Consequences

- No company pages or CRM replication in v1
- All effort goes to: visibility, testing, AI context, property creation
- Pipeline view (rep workspace) shows CRM data but doesn't replace CRM

---

## Decision: Separate Admin vs User Experiences

**Date:** 2026-01-16
**Deciders:** Tyler, Bryan
**Status:** Accepted
**Source:** CRM-ETE

### Context

Two distinct personas with different needs: admins need density and control, users need simplicity and personal relevance.

### Decision

Admins get a management dashboard (full visibility, team-wide). Users get a personal command center (own activity, own deals). Both access the same chat surface for configuration.

### Consequences

- Two distinct entry points based on role
- Shared chat interface for configuration
- Admin sees all agents; users see only their own
- Personal automations scoped to own data

---

## Decision: Slack as Primary HITL Channel (for now)

**Date:** 2026-01-16
**Deciders:** Palmer, David, Tyler
**Status:** Accepted (with evolution path)
**Source:** CRM-ETE

### Context

Palmer built Slack human-in-the-loop based on recent backend work. Slack is where users already work.

### Decision

Start with Slack for notifications and quick approvals. Evolve to multi-channel (in-app, desktop, email) over time. In-app chat surface handles complex approvals.

### Consequences

- Slack bot integration for notifications
- Interactive message buttons for simple approve/reject
- Complex approvals redirect to in-app chat
- Desktop/email notifications as future enhancement

---

## Pending Decisions

### Decision: V1 Primary Persona

**Status:** Open
**Question:** Should v1 focus on reps first (deal-centric) or admins first (config-centric)?
**Evidence for reps:** Council of Product says viral anchor; Maple validation
**Evidence for admins:** James's pain is most acute; CRM trust drives everything

### Decision: Chat Surface — New or Extension of Global Chat?

**Status:** Open
**Question:** Is the Agent Command Center chat the same as Global Chat, or a specialized surface?

### Decision: Auto-Run Thresholds by Persona

**Status:** Open
**Question:** What actions can safely auto-run for each persona on Day 1?

### Decision: Migration Path for Workflow Builder Users

**Status:** Open
**Question:** How do existing workflow builder users transition to chat-based config?

---

_Last updated: 2026-02-07_
