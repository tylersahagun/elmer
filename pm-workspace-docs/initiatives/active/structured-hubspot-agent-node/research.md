# Research: HubSpot Agent Configuration UI

## Summary

This initiative is driven by a single primary research input: an extensive discovery interview with James Hinkson, our most advanced internal HubSpot user.

## Primary Research

### James Hinkson Interview (2026-01-06)

**Full document:** [../../research/user-interviews/2026-01-06-hubspot-agent-configuration-james-hinkson.md](../../research/user-interviews/2026-01-06-hubspot-agent-configuration-james-hinkson.md)

**Key findings:**

- 100+ hours spent learning to configure HubSpot agent
- Partners abandon after 2 uses due to confusion
- Testing requires 10PM-3AM isolated sessions
- Zero visibility into what the agent does or why
- Complex prompts spread across 3-4 workflow nodes

## User Problems Identified

| Problem | Severity | Frequency | Evidence |
| --- | --- | --- | --- |
| No visibility into agent actions | Critical | Every use | "zero confidence that an admin or rep can find out why things were updated" |
| Testing is impossible | High | Every config | "testing is a nightmare" |
| Configuration takes forever | Critical | Every setup | "100 hours of chatting with AskElephant" |
| Partners abandon quickly | Critical | Common | "use it twice, don't know what it does, turn it off" |
| Inconsistent execution | High | Occasional | "runs only a fifth of the time, don't know why" |
| Complex field dependencies | High | Advanced use | "nightmare of a prompt...lives in three or four nodes" |

## Competitive Context

| Competitor | CRM Approach       | Limitation         |
| ---------- | ------------------ | ------------------ |
| Fathom     | 5 fixed fields     | No customization   |
| Fireflies  | Meeting notes only | No field mapping   |
| Gong       | Enterprise setup   | Complex, expensive |

**Our differentiator:** Custom configurations are what we sell that no one else does.

## Open Research Questions

1. How do other HubSpot partners experience the current configuration?
2. What templates would cover 80% of use cases?
3. How do partners who stopped using the agent describe their experience?

---

## Jury-Identified Research Gaps

> **Source:** Condorcet Jury Evaluation (1000 synthetic personas)
> **Pass Rate:** 50.6% (below 60% threshold)

### Segment-Specific Gaps

#### AI Skeptics (18.2% pass rate — Critical)

Interview 5-7 users who self-identify as skeptical of AI tools:

1. What specific past experiences have made you skeptical of AI tools?
2. What would it take to earn your trust with a new AI tool?
3. What's the minimum proof you need before trying something new?
4. What's your biggest fear about AI in your workflow?
5. What would make you feel confident that this won't mess up your CRM?

**Target:** Users who mentioned "burned before" or "tool fatigue" in discovery

#### Operations Personas (48.0% pass rate — Underperforming)

Interview 3-5 RevOps/Sales Ops users:

1. What specific workflows do you have that we're not addressing?
2. What competing tools are you currently using for CRM automation?
3. What would make you switch from your current solution?
4. What's unique about your day-to-day that we're missing?
5. How do you currently validate that automation worked correctly?

**Target:** Active HubSpot users in ops roles

### Friction-Specific Research

#### "Rollback if something breaks" (282 mentions)

Observe users encountering sync failures in current tools:
- What's their first reaction when data syncs incorrectly?
- What workarounds do they use to fix mistakes?
- What's their recovery process look like?

#### "Testing before go-live" (248 mentions)

Usability test the preview concept:
- Show wireframes of preview mode
- Ask: "Does this give you enough confidence to enable?"
- Identify missing information in preview

---

## Related Research

- [ ] PostHog analysis: HubSpot agent usage patterns
- [ ] Partner interviews: 3-5 active HubSpot users
- [ ] Churned user interviews: Partners who stopped using agent (Sept-Dec drop)
- [ ] **NEW:** Skeptic user interviews: 5-7 AI-skeptical users (from jury gaps)
- [ ] **NEW:** Operations persona interviews: 3-5 RevOps users (from jury gaps)
- [ ] **NEW:** Rollback behavior observation: 3 sessions
- [ ] **NEW:** Preview mode concept test: 5 users
