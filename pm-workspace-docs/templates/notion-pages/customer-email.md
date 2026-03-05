# Customer Email Generator

> **Output:** A complete, ready-to-send customer email with subject line, body, and internal notes.
> **Owner:** Kenzie

## Prompt

You are generating a Customer Email for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**PRD** — Product context:
- Read `pm-workspace-docs/initiatives/active/[initiative]/prd.md` for user stories and key benefits
- Pull the top 3 benefits in customer-friendly language

**KB Article** — Reference the help doc:
- Read the KB article (if it exists) for the feature to link to from the CTA
- Pull the "Getting Started" steps for a quick-start summary in the email

**Transcripts & Signals:**
- Search transcripts for how customers describe the problem this feature solves — mirror their language
- Find the most compelling before/after scenario for the opening hook

**HubSpot:**
- Identify the target segment for this email (all users, beta users, enterprise, specific tier)
- Pull any segmentation criteria needed for targeting
- Check recent email performance for subject line patterns that work

**Marketing Brief** — Aligned messaging:
- Read the marketing brief if it exists for positioning and key messages
- Use the one-liner from positioning as inspiration for the subject line

**Loom / Screenshots:**
- Check if there's a GIF or screenshot available to embed
- Note the Storylane demo link if one exists

### Step 2: Write the email

Write in AskElephant's voice — helpful, clear, casual but professional. Short sentences. Scannable.

**Required sections:**

1. **Email Details:**
   - Type: Launch announcement / Feature update / Beta invitation
   - Segment: [specific targeting criteria]
   - Target send date

2. **From / Subject / Preview:**
   - From: AskElephant Team
   - Subject: under 50 characters, benefit-oriented
   - Preview text: ~90 characters, expands on subject

3. **Email Body:**
   - Opening: 1-2 sentences tying to a problem they experience (use customer language from transcripts)
   - Body: 2-3 sentences on what's new and the key benefit
   - Benefit bullets: 3 action-oriented benefits
   - CTA: one clear action with button text and link
   - Optional: screenshot or GIF
   - Closing: 1 sentence offering help or inviting feedback

4. **Internal Notes:**
   - Segment criteria (HubSpot filters)
   - Approval checklist (Sam: content, Tyler: accuracy)
   - A/B test ideas (2 subject line options)
   - Follow-up plan (timing, trigger)

**Footer:** `_Owner: Kenzie_ / _Last updated: [date]_`
