# Success Metrics Generator

> **Output:** A complete metrics document with baselines, targets, and instrumentation plan.
> **Owner:** Tyler

## Prompt

You are generating a Success Metrics document for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**PRD** — Requirements and success criteria:
- Read `pm-workspace-docs/initiatives/active/[initiative]/prd.md` for the success metrics table
- Pull the outcome chain to connect metrics to business results

**PostHog** — Current baselines and instrumentation:
- Query for existing event data related to this feature area
- Pull current baseline values for any metrics that already exist (usage counts, conversion rates, error rates)
- Check existing dashboards for similar features to understand the measurement pattern
- Look at feature flag configurations for rollout tracking
- Check for existing in-app surveys that could provide qualitative data

**Linear** — Instrumentation status:
- Search for any PostHog instrumentation issues or tasks
- Check if events are already being tracked for this feature area

**GitHub (elephant-ai repo):**
- Search for existing PostHog event tracking code in the feature area (search for `posthog.capture`, `analytics.track`, etc.)
- Understand what events currently fire to determine what new events are needed

**Transcripts & Signals:**
- Search for discussions about success criteria or "how will we know this worked"
- Note any qualitative targets mentioned (e.g., "users should feel confident", "CS should stop getting questions about X")

### Step 2: Write the metrics document

Write for a data-informed PM audience. Be specific about what to measure, how, and what "good" looks like. Every metric should be actionable.

**Required sections:**

1. **North Star Metric** — The one metric that matters most. Include: metric name, why this metric (connection to business outcome), current baseline (from PostHog), target, timeframe.

2. **Leading Indicators** — Table: Metric, Source (PostHog/HubSpot/etc), Baseline (actual values from PostHog), Target, Timeframe. These move first and predict whether we'll hit North Star. E.g., activation rate, daily active users, time to first value.

3. **Lagging Indicators** — Table: same format. These confirm long-term success. E.g., 30-day retention, NPS improvement, revenue attributed.

4. **Guardrail Metrics** — Table: Metric, Current Value (from PostHog), Acceptable Range, Alert Threshold. These should NOT get worse. E.g., page load time, error rate, support ticket volume.

5. **Instrumentation Plan** — Table: Event Name, Trigger, Properties, Status (Implemented/Needed). List every PostHog event needed. Source from existing codebase tracking patterns and PRD requirements. Follow the naming convention used in existing events.

6. **PostHog Dashboard** — Dashboard name and link (or note to create). Specify which charts/insights should be on it.

7. **Review Schedule** — Week 1 (daily check on activation + errors), Week 2-4 (weekly leading indicators), Month 2-3 (monthly lagging indicators), Month 3 (go/no-go decision).

**Footer:** `_Owner: Tyler_ / _Last updated: [date]_`
