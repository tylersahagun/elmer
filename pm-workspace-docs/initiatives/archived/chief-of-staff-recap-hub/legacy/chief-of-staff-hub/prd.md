# Chief Of Staff Hub PRD

> **Merged:** This initiative is now consolidated into `chief-of-staff-recap-hub`.  
> Source of truth: `pm-workspace-docs/initiatives/chief-of-staff-recap-hub/`.

## Overview

- **Owner:** Tyler Sahagun
- **Target Release:** TBD (Pilot Q2 2026)
- **Status:** Draft
- **Strategic Pillar:** Customer Trust + Data Knowledge

Build a proactive, approval-driven "chief-of-staff" hub that becomes the primary daily entry point. The hub centralizes what the system did, what needs approval, and what is scheduled so users stop digging through workflows and start trusting automation.

## Outcome Chain

```
Chief-of-staff daily hub surfaces actions and approvals
  → so that users know what to do without digging through workflows
    → so that daily engagement and trust in automation increase
      → so that adoption and time-to-value improve
        → so that retention and expansion increase
```

## Problem Statement

The current experience is not proactive and lacks a clear interface for approvals. Users are forced into workflow lists and scattered outputs, creating cognitive overload and slowing time-to-value.

### Evidence

| Source       | Quote                                                                          | Implication                         |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------- |
| Rob (Jan 29) | "Tell me what you've done, what needs approval, and what's scheduled."         | Need a daily approval hub           |
| Sam (Jan 29) | "I don’t want to click a meeting then a workflow out of a thousand workflows." | Workflow sprawl blocks adoption     |
| Rob (Jan 29) | "This whole thing should be super proactive."                                  | Proactivity is the core expectation |
| Sam (Jan 29) | "I hate that Cloud Code asks me all the time to approve X, Y, Z."              | Approval fatigue erodes trust       |

## Goals & Non-Goals

### Goals (Measurable)

| Goal                          | Metric                   | Target                  | Timeline |
| ----------------------------- | ------------------------ | ----------------------- | -------- |
| Increase daily hub engagement | Hub WAU                  | +30% over baseline      | 60 days  |
| Reduce approval time          | Median approval time     | < 2 minutes             | 60 days  |
| Improve time-to-value         | First actionable outcome | < 1 day from onboarding | 90 days  |
| Reduce workflow navigation    | Workflow views per user  | -50%                    | 60 days  |

### Non-Goals

- Replace the full workflow builder for power users
- Ship Buyer Readiness as part of the initial hub MVP
- Build advanced coaching analytics (separate initiative)

## User Personas

### Primary: Sales Leader

- **Job-to-be-done:** Review approvals and coach efficiently
- **Current pain:** No daily view of what automation did or needs approval
- **Success looks like:** Clear daily hub with prioritized approvals and coaching signals
- **Trust factors:** Visibility into why actions are recommended; audit trail

### Secondary: Sales Representative

- **Job-to-be-done:** Know exactly what to do next without digging
- **Current pain:** Must find the right workflow or meeting output
- **Success looks like:** Daily checklist that auto-updates and drives next actions
- **Trust factors:** Ability to verify before actions go out

### Tertiary: RevOps

- **Job-to-be-done:** Ensure automation is reliable and policy-compliant
- **Current pain:** Approval rules are unclear and inconsistent
- **Success looks like:** Clear policy tiers and auditability
- **Trust factors:** Approval thresholds by risk level and role

### Additional: CSM

- **Job-to-be-done:** Surface risks and next steps across accounts
- **Current pain:** Finds issues too late or buried in outputs
- **Success looks like:** Daily view of account risks and actions
- **Trust factors:** Confidence indicators and visibility into sources

## Scope by Persona (MVP)

| Persona      | In Scope (MVP)                                            | Out of Scope (Now)                  |
| ------------ | --------------------------------------------------------- | ----------------------------------- |
| Sales Leader | Daily approvals hub, team-level summary, coaching prompts | Advanced team performance analytics |
| Sales Rep    | Personal daily brief, approvals, scheduled actions        | Full workflow creation              |
| RevOps       | Policy tiers, approval thresholds, audit log              | Custom policy builder UI            |
| CSM          | Daily risk alerts, scheduled follow-ups                   | Renewal forecasting suite           |

## User Stories (Per Persona - REQUIRED)

### Primary Persona Stories (Sales Leader)

- As a Sales Leader, I want a daily approval hub so that I can review and approve high-impact actions quickly.
- As a Sales Leader, I want a team summary of scheduled actions so that I can coach proactively.

### Secondary Persona Stories (Sales Representative)

- As a Sales Rep, I want a daily list of auto-run actions so that I can trust the system is helping me.
- As a Sales Rep, I want to approve or edit risky actions before they send so that I stay in control.

### Tertiary Persona Stories (RevOps)

- As a RevOps user, I want approval thresholds by action type so that automation stays compliant.
- As a RevOps user, I want an audit log of approvals so that we can prove governance.

### Additional Persona Stories (CSM)

- As a CSM, I want daily risk alerts with next steps so that I can prevent churn early.
- As a CSM, I want scheduled follow-ups surfaced before renewals so that I stay proactive.

## Shared Customer Journey

### Current State (Pain Points)

1. Start day without a single hub → search through meetings and workflows
2. See scattered outputs → unclear what needs approval
3. Manual triggers and approvals → slow execution and lower trust

### Future State (With Feature)

1. Open daily hub → see Done / Needs Approval / Scheduled buckets
2. Approve or edit high-risk actions → trust improves
3. Auto-run low-risk tasks → faster execution and adoption

### Transformation Moment

The first time a user opens the hub and sees all actions and approvals in one place, without hunting for workflows.

## Requirements

### Must Have (MVP)

- Daily hub with three buckets: Done / Needs Approval / Scheduled
- Action cards with context, source, and confidence
- Approval actions: approve, reject, edit, snooze
- Policy tiers for approval by risk level
- Audit log of approvals and changes

### Should Have

- Personalization by persona (rep vs leader vs CSM)
- Slack/voice bridge for approvals
- Auto-run schedule for low-risk actions
- Notifications for urgent approvals

### Could Have

- Team-level approvals routing
- Policy builder UI
- Buyer Readiness insights panel

## User Flows

### Flow: Daily Hub Entry

**Trigger:** User opens app or daily summary notification  
**Steps:** Open hub → review Done / Needs Approval / Scheduled → act on top item  
**Outcome:** User completes approvals without opening workflows  
**Error states:** Hub empty, data refresh failure  
**Trust recovery:** Show data sources and last-updated timestamps

### Flow: Approval Review

**Trigger:** Action moves to "Needs Approval"  
**Steps:** Review action card → open details → edit or approve → confirmation  
**Outcome:** Approved action executes, audit logged  
**Error states:** Action becomes stale, integration disconnected  
**Trust recovery:** Show failure reason and retry options

### Flow: Auto-Run + Exception

**Trigger:** Low-risk action scheduled  
**Steps:** Auto-run executes → moves to Done → optional feedback  
**Outcome:** User sees value without manual work  
**Error states:** Execution fails, missing permissions  
**Trust recovery:** Auto-create approval with clear error context

## Trust & Privacy Considerations

- Approval tiers by risk level and data sensitivity
- Privacy determination before any external send
- Explicit confirmation for external shares (Slack/CRM/email)
- Full audit trail for approvals and edits
- Confidence indicators on action cards

## Success Metrics

- **North star:** Daily Hub Engagement Rate (% of target users who view hub daily)
- **Leading indicators:** approval completion rate, auto-run success rate, time-to-first-approval
- **Guardrails:** approval queue size, false-positive approvals, privacy incidents

## Strategic Alignment

- [x] Outcome chain complete
- [x] Persona validated
- [x] Trust implications assessed
- [x] Not in anti-vision territory

## Open Questions

- What is the minimum viable set of actions for Day 1?
- Which approvals can safely auto-run without eroding trust?
- Should the hub be rep-first or leader-first in v1?
- How does this relate to `rep-workspace` and `flagship-meeting-recap`?

---

_Last updated: 2026-01-29_  
_Owner: Tyler Sahagun_
