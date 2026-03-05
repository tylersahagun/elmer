# Chief Of Staff Hub - Design Brief

> **Merged:** This initiative is now consolidated into `chief-of-staff-recap-hub`.  
> Source of truth: `pm-workspace-docs/initiatives/chief-of-staff-recap-hub/`.

**Status:** Draft  
**Owner:** Tyler Sahagun (PM) + [Design Partner TBD]  
**Last Updated:** 2026-01-29  
**Related PRD:** [prd.md](./prd.md)

---

## Design Goals

1. **Proactive clarity:** Users see what is done, what needs approval, and what is scheduled without hunting.
2. **Trust by design:** Confidence, sources, and approval tiers are visible at a glance.
3. **Low cognitive load:** No workflow sprawl; one surface for daily action.
4. **Persona-aware views:** Leaders, reps, CSMs, and RevOps see the right scope.

---

## Persona Scope (MVP)

| Persona      | Primary View             | Key Actions                    |
| ------------ | ------------------------ | ------------------------------ |
| Sales Leader | Team summary + approvals | Approve, coach, re-route       |
| Sales Rep    | Personal daily brief     | Approve, edit, complete        |
| RevOps       | Policy and audit         | Review thresholds, audit trail |
| CSM          | Risk + follow-ups        | Prioritize outreach            |

---

## Key Screens

### Screen 1: Daily Hub (Primary)

**Layout:** Three-column buckets (Done / Needs Approval / Scheduled)  
**Elements:**

- Action cards with confidence, source, and owner
- Quick actions: Approve, Edit, Snooze, Dismiss
- Filters: persona view, team, risk level

### Screen 2: Approval Detail Drawer

**Layout:** Slide-over with full context  
**Elements:**

- Summary + rationale
- Source links (meeting, CRM, email)
- Risk badge + approval reason
- Edit before approve

### Screen 3: Policy & Audit (RevOps)

**Layout:** Table + timeline  
**Elements:**

- Approval tiers by action type
- Recent approvals log
- Exceptions and failures

### Screen 4: Notifications (Slack/Voice)

**Layout:** Lightweight prompt  
**Elements:**

- Short action summary
- Approve / snooze buttons
- Link to full hub

---

## Interaction Patterns

- **Approval tiers:** Low-risk auto-run, medium requires inline confirm, high opens detail drawer.
- **Confidence indicators:** Visual cues + explicit "why" text.
- **Undo window:** 30s for approvals and edits.
- **Escalation:** If approval is idle, promote to owner or manager.

---

## State Design Matrix

| Surface         | Loading          | Success          | Error                    | Low Confidence           | Empty                 |
| --------------- | ---------------- | ---------------- | ------------------------ | ------------------------ | --------------------- |
| Daily Hub       | Skeleton buckets | Filled cards     | "Refresh failed" + retry | Amber badge + "verify"   | Clear "All caught up" |
| Approval Drawer | Loading spinner  | Approved state   | "Approval failed"        | "Low confidence" callout | N/A                   |
| Notifications   | N/A              | Action completed | "Retry"                  | "Needs review"           | N/A                   |

---

## Accessibility Considerations

- Keyboard navigation through cards and actions
- Screen reader labels for confidence and risk badges
- Clear focus states for approval actions
- Non-color indicators for risk/priority

---

## Open Design Questions

1. Should the hub default to personal view or team view?
2. What is the minimum action card density before cognitive overload?
3. How do we visualize confidence without causing doubt fatigue?
4. What should the escalation path be for unapproved actions?

---

## Next Steps

1. Wireframes for hub + approval drawer
2. Validate action card density with 3 persona walkthroughs
3. Create a low-fi prototype for daily hub flow
