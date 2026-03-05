# User Research Generator

> **Output:** A complete user research document synthesizing findings from multiple sources.
> **Owner:** Tyler

## Prompt

You are generating a User Research document for **[FEATURE/TOPIC NAME]** at AskElephant.

### Step 1: Gather context from all sources

**Transcripts** — Primary source of research data:
- Search `pm-workspace-docs/signals/transcripts/` for ALL meetings mentioning this topic
- Extract verbatim customer quotes (with role, company type)
- Categorize feedback by persona (rep, leader, CSM, RevOps)
- Note frequency — how many different customers mentioned similar themes
- Identify jobs-to-be-done and current workarounds described by users

**Signals:**
- Search `pm-workspace-docs/signals/inbox/` for customer feedback and feature requests
- Search `pm-workspace-docs/signals/slack/` for internal observations about customer behavior
- Check `pm-workspace-docs/signals/documents/` for any research docs or surveys

**PostHog** — Quantitative context:
- Pull usage data for related existing features (adoption rates, frequency)
- Check funnel data for relevant user journeys
- Look for any in-app survey results related to this topic
- Pull persona/segment breakdowns if available

**HubSpot** — Customer context:
- Search for deals/contacts related to companies that have provided feedback
- Understand the account size and segment of research participants
- Check for support tickets related to this feature area

**Linear** — Product context:
- Search for feature requests and customer-reported issues
- Note how many times this topic has been raised in issues

**PM Workspace:**
- Read `pm-workspace-docs/company-context/personas.md` for persona definitions
- Read `pm-workspace-docs/company-context/product-vision.md` for strategic alignment check

### Step 2: Write the research document

Write for a PM/leadership audience. Lead with insights, support with evidence. Be honest about confidence levels.

**Required sections:**

1. **Research Goals** — What questions are we answering? What decisions will this inform? 3-5 numbered questions.

2. **Methodology** — Type (interviews, surveys, analytics, transcript analysis, beta feedback), sample size, timeframe, recruitment method. Be specific about source counts.

3. **Participants** — Table: #, Role, Company Type, Account Size, Date, Key Characteristic. Source from transcript metadata and HubSpot.

4. **Key Findings** (3-5 findings, each with):
   - **Finding title** — the insight in one line
   - **Verbatim quote** — real quote from transcripts (with role, company type)
   - **Analysis** — what this means, how many participants expressed this
   - **Implication** — what we should do about it

5. **Jobs to Be Done** — `When [situation], I want to [action], so I can [outcome]` format. Source directly from customer language in transcripts.

6. **Current Workarounds** — Table: Workaround, Pain Points, Frequency. How users solve this today without our feature.

7. **Persona Breakdown** — Table: Persona, Count, Key Need, Willingness to Adopt. Based on actual participant data.

8. **Strategic Alignment** — How this connects to AskElephant's product vision. Any anti-vision concerns (trust, privacy, scope creep)?

9. **Recommendations** — 3-5 specific, actionable recommendations based on findings. Each should be something we can act on.

10. **What We Still Don't Know** — Gaps and unvalidated assumptions. What needs more research?

**Footer:** `_Owner: Tyler_ / _Sources: [list all meetings, transcripts, surveys used]_ / _Last updated: [date]_`
