# PRD Generator

> **Output:** A complete Product Requirements Document ready for engineering handoff.
> **Owner:** Tyler

## Prompt

You are generating a PRD for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**Linear** — Find the project/epic:
- Pull all issue titles, descriptions, acceptance criteria, and comments
- Note the assigned engineers and any scope discussions
- Identify what's been marked P0/P1/P2 already
- Check for linked issues or dependencies

**GitHub (elephant-ai repo)** — Understand existing architecture:
- Search for related components/services to understand the current system
- Read recent PRs in the feature area for technical constraints
- Check for TODO comments or tech debt flags that affect scope

**Transcripts & Signals:**
- Search `pm-workspace-docs/signals/transcripts/` for customer conversations requesting this feature
- Search `pm-workspace-docs/signals/slack/` for internal discussions about scope and approach
- Pull real customer quotes and pain points for the Problem Statement
- Identify specific user scenarios from conversations

**Loom Videos:**
- Search Slack for Loom recordings where Tyler or team demo'd the concept or discussed requirements

**PostHog:**
- Pull current baseline metrics for any success metrics (usage numbers, conversion rates, error rates)
- Check existing feature flag data for related features

**PM Workspace:**
- Read `pm-workspace-docs/company-context/product-vision.md` for strategic alignment
- Read `pm-workspace-docs/company-context/personas.md` for persona definitions
- Read `pm-workspace-docs/company-context/strategic-guardrails.md` for scope guardrails
- Check if there's existing research in `pm-workspace-docs/initiatives/active/[initiative]/research.md`

### Step 2: Write the PRD

Write for an engineering audience. Be specific and testable. Avoid vague requirements.

**Required sections:**

1. **TL;DR** — 2-3 sentences: what we're building, why now, what success looks like.

2. **Problem Statement** — What problem are we solving? For whom? What's the current workaround? Use specific examples from transcripts/signals.

3. **Outcome Chain** — `[Feature] → [user behavior change] → [business result]`. Make each link concrete and measurable.

4. **Personas** — Primary and secondary. Reference AskElephant personas from `personas.md`. Include what each persona specifically cares about for this feature.

5. **User Stories** — 5-8 user stories in `As a [persona], I want [capability], so I can [outcome]` format. Source from real customer requests found in transcripts.

6. **Requirements** — Organized by priority:
   - **Must Have (P0)** — Checkboxes. Each requirement specific and testable.
   - **Should Have (P1)** — Checkboxes.
   - **Nice to Have (P2)** — Checkboxes.
   Source from Linear issues, acceptance criteria, and team discussions.

7. **Out of Scope** — Explicitly list what we're NOT building. Source from Linear "won't fix" or deferred items, and scope discussions in Slack/transcripts.

8. **Success Metrics** — Table with columns: Metric, Baseline (from PostHog), Target, Measurement Method. Include primary metric, secondary metrics, and guardrail metrics.

9. **E2E Experience** — Walk through Discovery → Activation → Usage → Ongoing Value → Feedback Loop. Be specific about each phase.

10. **Key Decisions** — Table with Date, Decision, Who, Context. Fill from transcript discussions and Slack threads where decisions were made.

11. **Open Questions** — Checkboxes for unresolved items found during research.

12. **Dependencies** — Table with Dependency, Owner, Status. Source from Linear blocked issues.

**Footer:** `_Owner: Tyler_ / _Status: Draft_ / _Last updated: [date]_`
