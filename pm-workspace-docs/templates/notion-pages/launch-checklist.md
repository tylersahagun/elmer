# Launch Checklist Generator

> **Output:** A complete launch checklist with pre-populated status from actual project state.
> **Owner:** Tyler (internal) / Kenzie (external)

## Prompt

You are generating a Launch Checklist for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather current state from all sources

The launch checklist should reflect ACTUAL current state, not just blank checkboxes.

**Linear** — Build status:
- Find the project/epic and check completion percentage
- Identify which issues are done, in progress, and blocked
- Get the target ship date and current confidence level
- Check if acceptance criteria issues are passing

**PostHog** — Feature flag and instrumentation:
- Check if the feature flag is configured (flag name, current state)
- Check if PostHog events are firing on staging
- Look for an existing launch metrics dashboard

**GitHub (elephant-ai repo):**
- Check if the feature branch/PR exists and its merge status
- Verify if staging deployment has been done

**Slack:**
- Check if #product-updates post has been made
- Check if CS/Sales walkthrough has been done
- Search for any existing Loom links

**Notion:**
- Check if PRD, Eng Spec, Design Brief pages exist and have content
- Check if KB article, SOP, FAQ have been drafted

**PM Workspace:**
- Check the initiative folder for existing docs (prd.md, research.md, design-brief.md, prototype-notes.md)
- Read `_meta.json` for current phase and status

### Step 2: Generate the checklist with current status

Pre-check items that are already complete. Add notes on items in progress. Flag blockers.

**Required sections:**

1. **Header** — PMM Tier (P1-P4), target launch date, current stage (Internal / Closed Beta / Open Beta / GA).

2. **Pre-Launch (Before external users):**

   **Product Readiness:**
   - Feature flag configured in PostHog [check based on PostHog lookup]
   - All P0 acceptance criteria pass [check based on Linear status]
   - Staging deployment verified [check based on GitHub/Linear]
   - Tyler has seen it working E2E
   - Error states and edge cases handled
   - Performance acceptable

   **Internal Documentation:**
   - PRD finalized and linked [check if exists]
   - Eng spec complete [check if exists]
   - Design brief / Figma complete [check if exists]
   - Loom video recorded [check Slack for links]
   - SOP generated from Loom [check if exists]
   - PostHog instrumentation confirmed

   **Internal Communication:**
   - Posted to #product-updates [check Slack]
   - CS team walkthrough completed
   - Sales team briefed
   - Internal FAQ shared [check if exists]

3. **Beta Launch (Limited users):**
   - Beta user list identified
   - Feature flag enabled for beta users
   - Beta feedback channel established
   - Feedback collection (email, survey, synthesis)
   - Beta go/iterate/block decision

4. **GA Launch (All users):**
   - KB article published [check if exists]
   - Storylane demo built
   - In-app tour configured (PostHog)
   - Customer email drafted [check if exists]
   - Marketing brief finalized [check if exists]
   - Customer email sent
   - Newsletter included
   - Social post
   - Release notes published

5. **Post-Launch:**
   - Week 1: daily activation/error/support check
   - Week 2-4: weekly metrics review
   - Month 2-3: monthly review against targets, lessons learned

6. **Column Updates Reference** — Table mapping checklist items to Projects DB columns.

**Footer:** `_Owner: Tyler (internal) / Kenzie (external)_ / _Last updated: [date]_`
