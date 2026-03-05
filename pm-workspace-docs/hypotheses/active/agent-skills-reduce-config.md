# Hypothesis: Agent Skills Reduce Configuration Friction

## Status

- **Current:** active
- **Created:** 2026-01-22
- **Last Updated:** 2026-01-29
- **Linked Initiative:** composio-agent-framework (Phase 3)

---

## Problem Statement

**Who:** RevOps, Sales Leaders, and non-technical users creating AI agents

**What:** Users struggle to write effective agent instructions (prompts) because they lack domain expertise in areas like CRM hygiene, follow-up best practices, and data quality rules. This results in poorly configured agents that produce inconsistent or incorrect outputs.

**When:** During agent creation in the Agent Configurator—specifically when facing the blank "Instructions" text field

**Impact:**

- Users give up on agent creation (low adoption)
- Users create ineffective agents that don't deliver value
- Support burden increases as users ask "how do I make this work?"
- Time-to-value extends from minutes to days

> One-sentence summary: As a RevOps admin, I struggle with writing effective agent instructions when configuring automations, which causes poor agent performance and low adoption.

---

## Evidence

### Signal 1: Architecture Deep Dive - 2026-01-22

- **Source:** Internal design discussion
- **Link:** `signals/transcripts/2026-01-22-internal-composio-agent-architecture.md`
- **Quote:** "The cool thing about skills is that, like, the more complex and better the skills get, the less instructions I need to give to the agent because it will then be able to fill in the gaps of my instructions and my prompt by leaning on the skills... to bridge those gaps."
- **Interpretation:** Skills encode domain expertise that users don't have, reducing the prompt engineering burden

### Signal 2: Architecture Deep Dive - 2026-01-22

- **Source:** Internal design discussion
- **Link:** `signals/transcripts/2026-01-22-internal-composio-agent-architecture.md`
- **Quote:** "James, who's the expert RevOps guy, is gonna help us write some really awesome documentation for, like, RevOps-y, like, HubSpot centered skills that we include, like, out of the box that you would then plug in to, like, any agent you wanna do that's related to Salesforce."
- **Interpretation:** Expert-authored skills (like James's RevOps expertise) can be packaged and reused across all users, democratizing specialized knowledge

### Signal 3: Adam Design Review - 2026-01-22

- **Source:** Internal design review
- **Link:** `signals/transcripts/2026-01-22-adam-composio-agent-feedback.md`
- **Quote:** "People see this blank text field and they have no clue what to do."
- **Interpretation:** The blank instructions field is intimidating and creates configuration friction

### Signal 4: Product Conversation - 2026-01-29

- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`
- **Quote:** "We’ve just fallen into this configuration hell… the initial lift to get value… is so hard."
- **Interpretation:** Configuration friction is a primary blocker to time-to-value for non-technical users.

### Signal 5: Product Vision - 2026-01-29

- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-29-product-vision-robert-henderson.md`
- **Quote:** "A user has to be pretty technical to understand how to use the platform."
- **Interpretation:** The current setup experience assumes too much technical knowledge.

---

## Assessment

| Dimension             | Rating                                | Notes                                                                 |
| --------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| **Severity**          | High                                  | Core blocker to agent adoption—without good instructions, agents fail |
| **Frequency**         | Common                                | Every user creating an agent faces this; 100% of agent creators       |
| **Personas Affected** | RevOps (primary), Sales Leaders, CSMs | Anyone building agents who isn't an AI prompt engineer                |
| **Evidence Strength** | Moderate                              | Internal signal strong; needs customer validation                     |

---

## Outcome Chain

If we solve this problem:

```
Pre-built Skills + Progressive Disclosure enables simple agent instructions
  → so that users can create effective agents without prompt engineering expertise
    → so that agent adoption rate increases (target: 40%+ of workspaces)
      → so that more automations run successfully
        → so that users get more value from AskElephant
          → so that expansion/retention improves
```

---

## Validation Criteria

To move from `active` → `validated`:

- [ ] 3+ independent evidence sources (have 4 internal, need 1 customer)
- [x] Clear persona identification (RevOps, non-technical admins)
- [x] Severity/frequency assessed (High/Common)
- [x] Outcome chain articulated

To move from `validated` → `committed`:

- [ ] Prioritized against alternatives
- [ ] Owner assigned (Tyler as part of composio-agent-framework)
- [ ] Capacity allocated
- [ ] Initiative created (exists as Phase 3 of composio-agent-framework)

---

## Proposed Solution: Skills Layer

### What are Skills?

Skills are reusable expertise prompts that agents can draw upon:

- **Name & Description** (always visible to agent)
- **Full Instructions** (loaded on demand via progressive disclosure)
- **Trigger Keywords** (when to auto-apply)

### How Skills Reduce Friction

**Without Skills:**

```
User prompt: "After meetings, update HubSpot with deal information"
Agent: (has no domain knowledge, produces generic/incorrect output)
```

**With Skills (RevOps Expert):**

```
User prompt: "After meetings, update HubSpot with deal information"
Agent + RevOps Skill: (knows CRM best practices, field naming conventions,
                        data quality rules, produces expert-level output)
```

### Built-in Skills (Proposed)

1. **RevOps Expert** - CRM hygiene, field mapping, data quality (James-authored)
2. **Follow-up Best Practices** - Email drafting, timing, personalization
3. **Meeting Summary Templates** - Consistent, action-oriented summaries

---

## Hypothesis Test Plan

### Test 1: Internal Validation

- Have James write RevOps Expert skill
- Compare agent output quality with/without skill
- Measure: Instruction length required for same output quality

### Test 2: Customer Validation

- Identify 3 customers currently struggling with agent configuration
- Show skills concept and get feedback
- Measure: Would this reduce their configuration time?

### Test 3: Prototype Test

- Build skills UX into v5 prototype
- Run jury validation with skills vs. without
- Measure: Approval rate difference

---

## History

| Date       | Action         | Notes                                             |
| ---------- | -------------- | ------------------------------------------------- |
| 2026-01-22 | Created        | Initial hypothesis from architecture deep dive    |
| 2026-01-22 | Evidence added | Added 3 signals from internal discussions         |
| 2026-01-29 | Evidence added | Added Sam + Rob signals on configuration friction |

---

## Related

- **Parent Initiative:** composio-agent-framework (Phase 3: Skills Layer)
- **Similar Hypotheses:** `hyp-hubspot-agent-config-ui` (related configuration problem)
- **Competing Hypotheses:** "Conversational setup is sufficient" - maybe chat-based config alone solves this
- **Prior Art:** Cursor rules system, Claude's system prompts, GPT custom instructions
