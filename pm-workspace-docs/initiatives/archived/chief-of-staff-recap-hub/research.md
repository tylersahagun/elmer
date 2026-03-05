# Research Summary: Chief Of Staff Recap Hub

**Date:** 2026-01-29  
**Participants:** Tyler Sahagun, Sam Ho, Skylar Sanford, Robert Henderson  
**Sources:** Chief-of-staff hub + flagship recap signals and hypotheses

## TL;DR

Signals across leadership and product conversations show that users are stuck in workflow configuration and output clutter, while lacking a proactive daily hub. The meeting page should default to a clean recap view with artifact modules (not workflow chips), and the Chief-of-Staff experience should sequence from meeting summary → prep → intelligence/action items → daily/weekly review. A combined initiative that delivers a daily approvals hub plus flagship recap artifacts (configured via chat) should reduce time-to-value, increase daily engagement, and cut adoption-related churn. We still need external customer validation and clarity on primary persona (rep-first vs leader-first).

## Strategic Alignment

**Score:** Strong  
**Aligned:** Revenue OS framing, AI-first UX, human-orchestrated automation, trust via approval-by-exception  
**Concerns:** External validation missing, approval thresholds could add friction if mis-scoped, baseline metrics need definition

## Key Decisions (Proposed)

- Combine the daily approvals hub and flagship recap experience into one primary entry point.
- Use chat-based configuration for recap templates to eliminate workflow setup friction.
- Shift to approval-by-exception: auto-run low-risk actions, surface only high-risk approvals.
- Present outputs as dedicated artifacts (recap, prep, coaching) rather than workflow chat.
- Default meeting page to a clean recap summary with artifact modules (no workflow chip clutter).
- Sequence experience from meeting summary → meeting prep → intelligence/action items → daily/weekly review.

## User Problems (with quotes)

- **No clear daily hub or primary entry point**
  - "Tell me what you've done, what needs approval, and what's scheduled." — Rob  
    (`signals/transcripts/2026-01-29-product-vision-robert-henderson.md`)
- **Workflow sprawl and navigation friction**
  - "I don’t want to click a meeting then a workflow out of a thousand workflows." — Sam  
    (`signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`)
- **Approval fatigue and manual triggers**
  - "I hate that Cloud Code asks me all the time to approve X, Y, Z." — Sam  
    (`signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`)
  - "It actually like requires a manual trigger to run where it should just happen before every single call..." — Tyler  
    (`signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`)
- **Recap configuration and output clutter**
  - "Right now, to generate a meeting recap, you have to go to workflows..." — Tyler  
    (`signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`)
  - "Part of the problem is that... you have so many outputs and it's just so muddied by the view." — Tyler  
    (`signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`)
- **Meeting page clutter + workflow output framing**
  - "I go to this meeting... it's just a lot of things I could click here. There's a lot of options for me. Cannot have that." — Sam  
    (`signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md`)
  - "These workflows don't generate a chat. They generate artifacts." — Sam  
    (`signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md`)
- **Adoption failure driving churn**
  - "42% of churn is adoption failure."  
    (`signals/slack/2026-01-26-14day-slack-synthesis.md`)

## Outcome Chain

```
Chief-of-staff recap hub (daily approvals + flagship artifacts)
  → so that users can configure and consume recaps without workflow friction
    → so that daily engagement and trust in automation increase
      → so that time-to-value improves and adoption churn decreases
        → so that retention and expansion increase
```

**Secondary chain (channels):**

```
Recap delivery to Slack/CRM/Email
  → so that updates meet users where they work
    → so that manual CRM logging decreases
      → so that productivity and ROI increase
```

## Success Metrics (Draft)

- Daily hub engagement rate (target +30% over baseline)
- Recap engagement rate (% of meetings with recap viewed within 24 hours)
- Time to first custom recap (< 3 minutes)
- Median approval time (< 2 minutes)
- Adoption churn ("failure to adopt") down from 42% to < 30%
- Workflow navigation per user down 50%

## Evidence Gaps

- 2-3 external customer interviews to validate daily hub + recap bundle
- Baseline metrics for hub engagement, recap engagement, and approval time
- Clarity on auto-run vs approval thresholds by persona
- Meeting type detection accuracy expectations for template auto-selection
- Deck-ready visuals to align stakeholders on the artifact suite

## Open Questions

- Who is the primary entry persona for v1 (rep-first vs leader-first)?
- Should recap configuration be part of onboarding or in-context on first recap?
- What is the minimum viable set of auto-run actions for Day 1?
