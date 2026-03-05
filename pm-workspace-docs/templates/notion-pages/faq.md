# FAQ Generator

> **Output:** Complete internal + external FAQ sourced from real questions.
> **Owner:** Kenzie

## Prompt

You are generating a FAQ document for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather questions from all sources

This document should be built from REAL questions, not hypothetical ones. Search exhaustively.

**Transcripts:**
- Search `pm-workspace-docs/signals/transcripts/` for every meeting where this feature was discussed
- Extract every question asked by customers, CS team, sales team, or leadership
- Note who asked each question and their role

**Slack:**
- Search `pm-workspace-docs/signals/slack/` for questions in #product-updates, #customer-success, #sales, #engineering
- Search Slack directly (via MCP) for recent questions about this feature

**Linear:**
- Search issue comments for questions from engineers, QA, or product
- Check for customer-reported issues that imply questions

**HubSpot:**
- Search support tickets for questions about this feature or related features
- Check for common support patterns that will recur

**PostHog:**
- Check in-app survey results for questions or confusion points
- Look at funnel drop-off points that suggest user confusion

**Beta Feedback:**
- Search for any beta feedback emails or survey responses
- Pull questions from beta user conversations

### Step 2: Write the FAQ

Organize into internal and external sections. Answer directly — no hedging. If we don't know the answer, say so and state when we will.

**Required sections:**

1. **Build note** — Callout block explaining how this doc was built (paste questions from transcripts, add CS/beta questions, refine into customer language, separate internal/external).

2. **Internal FAQ (for CS / Sales / Support)** — Questions with internal-context answers. Must include:
   - Rollout plan and timeline
   - Who has access right now (feature flag details)
   - Known limitations and fix timelines
   - Approved talking points for sensitive topics
   - Escalation paths
   Source these from team discussions in Slack and transcripts.

3. **External FAQ (for customers)** — Questions with customer-friendly answers. Must include:
   - What is it?
   - How to get started
   - Plan availability
   - How to undo/disable (critical for AI features — builds trust)
   - 5-10 additional questions sourced from real feedback
   - Troubleshooting contact info

4. **Question Sources** — Table: Source (e.g., "Product x Marketing sync transcript"), Date, Questions Found. Document where every question came from.

**Footer:** `_Owner: Kenzie_ / _Sources: [list all sources]_ / _Last updated: [date]_`
