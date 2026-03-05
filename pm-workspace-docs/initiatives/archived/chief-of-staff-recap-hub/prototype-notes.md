# Chief Of Staff Recap Hub - Prototype Notes

**Version:** v2 (unified)  
**Created:** 2026-02-01  
**Status:** Prototype consolidated  
**Location:** `elephant-ai/web/src/components/prototypes/ChiefOfStaffRecapHub/v2/`

---

## Overview

Unified prototype merges the daily approvals hub with the flagship recap artifact suite in a single Chief Of Staff experience. The goal is to remove workflow friction, highlight approval-by-exception, and make recap templates feel chat-configurable, auditable, and trustworthy.

---

## Creative Options Implemented

### Option A: Maximum Control

- Full approval controls (approve/edit/snooze/reject)
- Audit visibility surfaced by default
- Recap sharing gated behind explicit confirmation

### Option B: Balanced (Recommended)

- Approve + edit with recap preview
- Template edits via chat button
- Share action visible but still manual

### Option C: Maximum Efficiency

- Minimal controls, auto-run emphasized
- Approvals focused on only high-impact items
- Compact recap panel for quick scan

---

## Required AI States

| State         | Implementation                           |
| ------------- | ---------------------------------------- |
| Loading       | `ChiefOfStaffRecapHubSkeleton`           |
| LoadingLong   | `ChiefOfStaffRecapHubSkeletonLong`       |
| Success       | `ChiefOfStaffRecapHub` + recap artifacts |
| Error         | `ChiefOfStaffRecapHubError`              |
| LowConfidence | Banner + low confidence recap mock       |
| Empty         | `ChiefOfStaffRecapHubEmpty`              |

---

## Flow Stories

- **Flow_HappyPath**: Approve action → move to Done + edit recap template
- **Flow_ErrorRecovery**: Error → retry → recovery state
- **Flow_UnifiedJourney**: Hub → meeting recap → share with privacy gate

---

## Components Built

- `ChiefOfStaffRecapHub.tsx` (daily hub + recap panel)
- `ChiefOfStaffRecapHubJourney.tsx` (interactive flows)
- `ChiefOfStaffRecapHubUnifiedJourney.tsx` (hub + meeting recap + share)
- `types.ts` (hub data + recap mock data)
- `ChiefOfStaffRecapHub/v2/recap` (recap bundle re-exported from flagship v3)
- `RecapArtifact` suite (recap/coaching/prep artifacts)
- `TemplateConfigChat` (chat-based setup with live preview)
- `ShareModal` (privacy-aware external share)

---

## Storybook Stories

`ChiefOfStaffRecapHub.stories.tsx` includes:

- Success, Loading, LoadingLong
- Error, LowConfidence, Empty
- OptionA_MaxControl, OptionB_Balanced, OptionC_MaxEfficiency
- Flow_HappyPath, Flow_ErrorRecovery, Flow_UnifiedJourney

Recap stories are now grouped under:

- `Prototypes/ChiefOfStaffRecapHub/v2/Recap/*`

---

## Trust & Transparency Copy

| Moment                | Copy                                                             |
| --------------------- | ---------------------------------------------------------------- |
| Low confidence banner | "Some details may need verification."                            |
| Approval by exception | "Auto-run low risk actions, surface only high impact approvals." |
| Recap error           | "Recap couldn't be generated. Retry or reopen the meeting."      |

## UI Copy Updates (Upbeat + Ownership + Rationale)

| Element         | Copy                                                   |
| --------------- | ------------------------------------------------------ |
| Action title    | "Draft recap ready — quick review"                     |
| Owner line      | "Owner: Alex Rivera"                                   |
| Rationale line  | "Why now: customer asked for a recap in the last call" |
| Confidence line | "Confidence: Medium — verify key outcomes"             |
| Primary CTA     | "Review & approve"                                     |
| Secondary CTA   | "Edit" / "Snooze"                                      |
| Auto-run badge  | "Auto-run (low risk)"                                  |
| Approval badge  | "Needs approval"                                       |
| Audit hint      | "Audit: 2 approvals, last edited by Sam"               |

## Persona-Based Approval Tiers (Draft)

- **Sales Rep:** auto-run low-risk reminders; approve recap sharing + CRM writebacks
- **Sales Leader:** auto-run team summaries; approve template changes + escalations
- **RevOps:** auto-run internal metadata; approve policy changes + external sharing
- **CSM:** auto-run prep summaries; approve customer-facing emails + CRM updates

## Audit Surface

- Inline audit hint on cards + right-rail detail drawer
- Audit & Sources panel on recap artifact with export action

---

## Build Status

- Storybook build: ✅ `npm run build-storybook -w web`
- Chromatic deploy: `https://672502f3cbc6d0a63fdd76aa-tezfdjlsxv.chromatic.com/` (build 34 reported 30 component errors)

---

## Files Created

```
elephant-ai/web/src/components/prototypes/ChiefOfStaffRecapHub/
├── index.ts
└── v2/
    ├── ChiefOfStaffRecapHub.tsx
    ├── ChiefOfStaffRecapHub.stories.tsx
    ├── ChiefOfStaffRecapHubJourney.tsx
    ├── ChiefOfStaffRecapHubUnifiedJourney.tsx
    ├── recap/
    │   └── index.ts
    ├── index.ts
    └── types.ts
```

---

## Next Steps

1. Run `/validate chief-of-staff-recap-hub` for jury evaluation
2. Validate rep-first vs leader-first default view with 2-3 customers

---

_Generated by proto-builder subagent_
