# GTM Brief Generator

> **Output:** A complete Go-to-Market brief ready for Sam/Woody review.
> **Owner:** Kenzie / Tony

## Prompt

You are generating a Go-to-Market Brief for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**PRD** — Read the product requirements:
- Read `pm-workspace-docs/initiatives/active/[initiative]/prd.md` for personas, user stories, and success metrics
- Pull the outcome chain for the Customer Story section

**Linear** — Understand the build:
- Find the project/epic to get the current build status and target ship date
- Note the rollout plan (internal → beta → GA)
- Identify the feature flag name and current rollout stage

**Transcripts & Signals:**
- Search transcripts for real customer pain points this feature addresses — use for the "Before" story
- Pull real or representative customer quotes
- Identify which customer segments are most excited about this feature
- Search for competitive mentions — "we're currently using [X] for this"

**PostHog:**
- Pull baseline metrics for success criteria (current adoption rates, conversion rates)
- Check feature flag to understand current rollout state
- Look for relevant in-app survey data

**HubSpot:**
- Identify the target customer segment size (number of accounts, deal stages)
- Check for existing email lists or segments that match the target audience
- Note any upcoming renewal dates for key accounts that this feature could influence

**Loom Videos:**
- Search Slack for existing Loom demos of this feature
- Note which recordings can be used for CS/Sales enablement

**PM Workspace:**
- Read the metrics doc if it exists: `pm-workspace-docs/initiatives/active/[initiative]/metrics.md`
- Check the research doc for customer persona breakdown

### Step 2: Write the GTM brief

Write for a marketing/leadership audience. Lead with customer impact. Be specific about channels, timing, and ownership.

**Required sections:**

1. **Executive Summary** — 3-4 sentences: what we're launching, for whom, when, expected impact. Written for Sam/Woody level.

2. **Launch Details** — Table: Feature name (customer-facing), PMM Tier (P1-P4), target launch date, release stage, product owner, marketing owner, engineering lead.

3. **Customer Story** — Before/Turning Point/After format with real or representative customer quote. Source the "Before" from transcripts. Make it concrete and specific.

4. **Target Audience** — Primary and secondary segments. For each: persona, segment size (from HubSpot), how to reach them, adoption trigger.

5. **Positioning & Messaging** — Category, differentiator, headline, 3 key messages (benefit, differentiation, trust). Source competitive context from transcripts.

6. **Launch Plan** — Three phases with action tables:
   - Phase 1: Internal Launch (Loom, SOP, internal FAQ, Slack post, CS walkthrough)
   - Phase 2: Beta / Limited Release (email beta users, PostHog survey, feedback synthesis)
   - Phase 3: GA / Broad Launch (KB article, Storylane, in-app tour, customer email, newsletter, social)
   Each action: Owner, Date, Status checkbox.

7. **Launch Materials Checklist** — Table: Material, Required for this tier?, Status, Link.

8. **Success Criteria** — Table: Metric, Target, Timeframe, How to Measure. Source baselines from PostHog.

9. **Risks & Mitigations** — Table: Risk, Likelihood, Impact, Mitigation. Source from Linear known issues and transcript concerns.

**Footer:** `_Owner: Kenzie / Tony_ / _Approved by: Sam_ / _Last updated: [date]_`
