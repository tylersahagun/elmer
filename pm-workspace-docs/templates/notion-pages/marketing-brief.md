# Marketing Brief Generator

> **Output:** A complete marketing brief with positioning, messaging, and launch channel plan.
> **Owner:** Kenzie / Tony

## Prompt

You are generating a Marketing Brief for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**PRD** — Core product context:
- Read `pm-workspace-docs/initiatives/active/[initiative]/prd.md` for personas, user stories, and outcome chain
- Pull the problem statement for "Before" positioning

**Transcripts & Signals:**
- Search transcripts for customer language about the problem this solves — use their words for messaging
- Find competitive mentions and positioning opportunities
- Identify which customers are NOT a fit for this messaging (the "Not for" audience)

**PostHog:**
- Pull adoption data for similar features to set realistic launch targets
- Check current activation funnels for baseline metrics

**HubSpot:**
- Identify email segments that match the target audience
- Check newsletter schedule for timing
- Note deal stages where this feature would be relevant for sales conversations

**Loom Videos:**
- Find existing demo recordings from Tyler for content inputs
- Note which recordings show the feature in action for screenshots/GIFs

**GitHub (elephant-ai repo):**
- Check the UI to understand what screenshots or GIFs would best demonstrate the feature
- Note the exact feature name and navigation path as displayed in the app

**PM Workspace:**
- Read the GTM brief if it exists for aligned positioning
- Check research doc for persona breakdown and customer feedback

### Step 2: Write the marketing brief

Write for a marketing execution audience. Focus on actionable messaging and specific channels.

**Required sections:**

1. **Summary** — 2-3 sentences as if writing the first paragraph of a blog post.

2. **Target Audience** — Primary persona (role, company size, what they care about), secondary persona, and explicit "Not for" audience.

3. **Key Messages** — 3 numbered messages, each with headline and supporting detail (benefit, differentiation, urgency). Use customer language from transcripts.

4. **Positioning** — Before/After format with concrete scenarios. One-liner value prop that could work as email subject, Slack post, or landing page banner.

5. **Competitive Context** — Table: Competitor, Their Approach, Our Differentiation. Source from transcripts and product knowledge.

6. **Launch Channels** — Checklist with specifics:
   - Email announcement (segment)
   - Newsletter mention (which edition)
   - In-app tour (PostHog trigger)
   - Storylane demo
   - Social post (platform)
   - Blog post (if applicable)
   - Sales enablement (one-pager, talking points)

7. **Content Inputs Needed from Product** — Checklist: Loom video, PRD, screenshots/GIFs, beta customer quotes.

8. **Success Metrics for Launch** — Table: Metric, Target, Measurement.

9. **Timeline** — Table: Milestone, Date, Owner. From draft through launch.

**Footer:** `_Owner: Kenzie / Tony_ / _Last updated: [date]_`
