# Chief Of Staff Recap Hub PRD

## Overview

- **Owner:** Tyler Sahagun
- **Status:** Draft
- **Strategic Pillar:** Customer Trust + Data Knowledge
- **Source Initiatives:** `chief-of-staff-hub`, `flagship-meeting-recap`
- **Canonical Surface:** Chief Of Staff daily hub + meeting page artifacts

Create a single, proactive Chief Of Staff experience that unifies approvals, recap artifacts, and chat-based configuration. The Chief Of Staff agent is chat-oriented with templates and previews, managing recaps, emails, communication, and calendar-related follow-ups. Users configure recap templates via chat and review only high-risk approvals, reducing workflow sprawl and adoption friction.

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

## Problem Statement

Today, users must navigate workflows, configure prompts, and hunt for scattered outputs just to get a useful recap or approval. The experience is not proactive, approvals are constant, and adoption churn remains high. We need a single daily entry point that makes automation trustworthy and action-oriented.

### Evidence (selected)

- "Tell me what you've done, what needs approval, and what's scheduled." — Rob  
  (`signals/transcripts/2026-01-29-product-vision-robert-henderson.md`)
- "I don’t want to click a meeting then a workflow out of a thousand workflows." — Sam  
  (`signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`)
- "Right now, to generate a meeting recap, you have to go to workflows..." — Tyler  
  (`signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`)
- "42% of churn is adoption failure."  
  (`signals/slack/2026-01-26-14day-slack-synthesis.md`)
- "I go to this meeting... it's just a lot of things I could click here. There's a lot of options for me. Cannot have that." — Sam  
  (`signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md`)
- "These workflows don't generate a chat. They generate artifacts." — Sam  
  (`signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md`)
- "Chief of Staff… Meeting Summary, Meeting Prep, Daily Briefing, Daily Review, Weekly Reporting" — Sam  
  (`research/synthesis/2026-02-01-sam-slack-chief-of-staff-meeting-recap.md`)

## Goals & Non-Goals

### Goals (Measurable)

- Increase daily hub engagement by 30% over baseline
- Reduce time to first custom recap to < 3 minutes
- Reduce approval time to < 2 minutes median
- Decrease workflow navigation per user by 50%
- Reduce adoption churn from 42% to < 30%
- Increase recap engagement (views per meeting) to 50%+ within 24 hours

### Non-Goals

- Replace the full workflow builder for power users
- Real-time in-call summaries
- Mobile-native experience (web-first MVP)
- Advanced coaching analytics (separate initiative)

## User Personas

### Primary: Sales Representative

- **JTBD:** Get useful recaps and next steps without configuration overhead
- **Pain:** Workflows are complicated; outputs are buried and hard to edit
- **Success:** Sees a polished recap + next actions in one place and can tweak templates via chat

### Secondary: Sales Leader

- **JTBD:** Approve high-impact actions and coach efficiently
- **Pain:** No daily hub; approvals are scattered
- **Success:** Clear approvals queue and team recap visibility

### Tertiary: RevOps

- **JTBD:** Ensure automation is reliable and compliant
- **Pain:** Approval thresholds are inconsistent and opaque
- **Success:** Policy tiers with audit trail

### Additional: CSM

- **JTBD:** Surface risks and next steps across accounts
- **Pain:** Prep and recaps are hidden or inconsistent
- **Success:** Prep/recap artifacts available before customer touchpoints

## Solution Scope (MVP)

### Core Experience

- Daily hub with three buckets: Done / Needs Approval / Scheduled
- Chief Of Staff agent chat for configuration and edits (global chat surface)
- Flagship recap artifacts on meeting pages (tabbed views)
- Chat-based recap template configuration with live preview
- Approval-by-exception (auto-run low-risk actions)

### Artifact Suite (v1)

- Meeting Summary (default meeting page view)
- Meeting Prep (deal + prior meeting context)
- Meeting Intelligence & Action Items (prioritized)
- Coaching insights (rep and leader view)
- Daily Briefing / Daily Review
- Weekly Reporting (rollup)

### Actions & Sharing

- Approve, reject, edit, snooze actions from the hub
- Share recap to Slack/CRM/Email with confirmation + preview
- In-place editing of recap templates via global chat
- Meeting type detection with manual override

### Canonical Entry Points

- **Daily Hub:** Primary entry for approvals, scheduled actions, and recap previews
- **Meeting Page:** Deep context with Recap / Prep / Coaching tabs
- **Global Chat:** Configuration and template edits without workflow navigation

## User Stories (Epic Summary)

### Epic 1: Chat-Based Configuration

- Configure recap templates through conversation in < 3 minutes
- Live preview updates as user describes changes
- Default delivery channels set during setup

### Epic 2: Dedicated Artifact Views

- Meeting page tabs: Recap (default), Coaching, Prep
- Tabs appear only when content exists
- Recap is polished, shareable, and scannable

### Epic 3: In-Place Editing

- Feedback icon opens global chat with recap context
- Changes apply to future recaps; optional regenerate
- Show template impact before saving

### Epic 4: Per-Meeting-Type Templates

- Default templates for Discovery, Demo, Follow-up
- Auto-detection with manual override
- Tagging controls on recap header

### Epic 5: Communication Channel Delivery

- Share modal supports Slack, HubSpot, Teams, Email, Copy
- Pre-share checklist + explicit confirmation
- Share blocked while privacy is pending

### Epic 6: Approval By Exception

- Auto-run low-risk actions by persona
- High-risk actions surface with rationale + receipts
- Audit log captures approvals and edits

## Requirements

### Must Have

- Daily hub with three buckets and action cards
- Approval actions: approve, reject, edit, snooze
- Approval tiers by persona and action risk
- Recap artifact view with dedicated tab (default)
- Chat-based template configuration and live preview
- In-place template edits from recap view
- Per-meeting-type templates (Discovery, Demo, Follow-up baseline)
- Meeting type detection + manual override
- Audit trail + source attribution + export
- Privacy gating with explicit share confirmation + pre-share checklist
- Default meeting page set to a clean recap summary (no workflow chip clutter)
- Workflow outputs represented as artifacts, not chat threads

### Should Have

- Persona-aware defaults (rep vs leader views)
- Auto-run meeting prep before calls
- Slack and HubSpot delivery options
- Confidence indicators on action cards and recaps
- Coaching and Prep tabs with clear visibility rules
- Undo window for approvals and shares

### Could Have

- Team-level approvals routing
- Template inheritance (leader to rep)
- Teams delivery channel
- Template analytics and usage insights

## User Flows (High Level)

### Flow 1: Daily Hub Entry

1. User opens app or receives daily summary notification
2. Hub shows Done / Needs Approval / Scheduled buckets
3. User approves or edits top items; auto-run items are already done

### Flow 2: Configure Recap Templates

1. Chat asks: "What types of calls do you have?"
2. User responds; preview updates per call type
3. User selects delivery channels
4. Templates saved and applied to future recaps

### Flow 3: Review Recap + Edit

1. User opens meeting page recap tab
2. Clicks feedback icon to edit template in global chat
3. Preview updates with template impact
4. Changes apply to future recaps; optional regenerate

### Flow 4: Share Recap to Channel

1. User clicks Share on recap
2. Modal shows channels + preview
3. Privacy status check + explicit confirmation
4. Recap delivered and logged in audit trail

## Trust & Privacy Considerations

- Approval tiers by risk level and data sensitivity
- Privacy Determination must classify before any external share
- Share blocked while privacy is pending (status chip visible)
- Confirmation required for external share to Slack/CRM/Email
- Audit logs for approvals, template changes, and share actions
- Exportable audit trail for ops
- Clear source attribution on recap artifacts

## Success Metrics

- **North Star:** Daily hub engagement rate
- **Leading:** approval completion rate, time to first custom recap, recap views per meeting, template setup completion
- **Lagging:** adoption churn, retention/expansion trends
- **Guardrails:** approval queue size, share errors, privacy incidents, share failure rate

## Dependencies

- Global Chat (template configuration and editing)
- Portable Artifacts (dedicated recap views)
- Privacy Determination (share guardrails)
- HubSpot/Slack integrations (delivery)
- Meeting type detection service
- Audit log export support

## Open Questions

- What is the minimal action set for Day 1?
- Which approvals can safely auto-run per persona?
- Should recap configuration be part of onboarding or triggered on first recap?
- How will legacy workflow users migrate to the new experience?
- Which artifacts live on the meeting page vs daily/weekly hub by default?
- What is the canonical entry point on first login (hub vs meeting page)?

---

_Last updated: 2026-01-29_  
_Owner: Tyler Sahagun_
