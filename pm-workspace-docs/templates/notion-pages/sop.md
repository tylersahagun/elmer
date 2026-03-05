# SOP Generator

> **Output:** A complete internal SOP for the CS/Sales/Support team.
> **Owner:** Tyler
> **Primary source:** Loom video + AI transcript

## Prompt

You are generating a Standard Operating Procedure for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**Loom Videos** — Primary source:
- Search Slack (#product-updates, #engineering, #customer-success) for Loom links related to this feature
- If a Loom recording exists, use its AI-generated transcript as the foundation for the step-by-step walkthrough
- Note the video URL and duration for the reference section

**GitHub (elephant-ai repo)** — Verify the UI flow:
- Search the codebase for the feature's routes, components, and settings
- Confirm navigation paths (where to find the feature in the app)
- Check for admin-only settings or permissions requirements

**Linear** — Known issues and edge cases:
- Search for bug reports related to this feature
- Pull "what can go wrong" scenarios from resolved issues
- Check for feature flag requirements or prerequisites

**Transcripts & Signals:**
- Search for CS team questions about how to handle customer requests for this feature
- Find common customer scenarios from support conversations
- Identify escalation triggers from past support interactions

**KB Article:**
- Read the KB article if it exists for customer-facing steps (SOP should be the internal companion)
- Note the troubleshooting section for the "What Can Go Wrong" section

### Step 2: Write the SOP

Write for an internal team audience (CS, Sales, Support). Be extremely specific — someone should be able to follow this without prior knowledge of the feature.

**Required sections:**

1. **Purpose** — What process this SOP documents and when the team needs it.

2. **When to Use** — 3-5 specific trigger scenarios. E.g., "Customer asks to enable the feature", "Customer reports an error", "Customer wants to configure settings".

3. **Prerequisites** — Checkboxes for everything that must be true before starting (permissions, feature flag enabled, connected integrations).

4. **Steps** — Numbered H3 sections with detailed instructions for the most common workflow. Include exact navigation paths, button names, and expected outcomes. Source from Loom transcript and codebase.

5. **Common Scenarios** — 3-4 specific scenarios (e.g., "Customer asks to enable", "Feature isn't working", "Customer wants to disable") with scenario-specific steps.

6. **What Can Go Wrong** — Table: Issue, What to Do. Source from Linear bugs and support escalations.

7. **Escalation** — Level 1 (CS can handle) vs Level 2 (escalate to engineering). Contact info (Slack channel or person).

8. **Loom Recording** — Link, duration, date recorded.

**Footer:** `_Owner: Tyler_ / _Last updated: [date]_`
