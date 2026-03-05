# Settings Page & Early Access Revamp - PRD

## Overview

Unify the Settings IA with a customer-facing Early Access (alpha/beta) program. This combines the release lifecycle process, beta features UI, and settings redesign into a single, trustworthy experience with clear scope and control.

**Canonical scope:**

- Release lifecycle definitions (Alpha -> Invite-only Beta -> Open Beta -> GA -> Launch)
- Beta features UI (dynamic alpha visibility, stage badges, "Learn more" links)
- Unified Settings shell and IA
- Privacy scope clarity (manager/owner vs personal settings)

**Merged from:**

- `release-lifecycle-process/prd.md`
- `settings-page-redesign/design-brief.md`
- `settings-redesign/prd.md`

**Linked (not merged):**

- `feature-availability-audit/prd.md` (technical audit and cleanup)

---

## Outcomes

### Customer Outcome

Users can discover and control early access features in a trusted, predictable way, and they understand which settings apply to them.

### Business Outcome

Revenue and support teams avoid surprises, feature adoption improves, and release communication becomes consistent.

---

## Success Metrics

| Metric                           | Type    | Current    | Target    | Owner   |
| -------------------------------- | ------- | ---------- | --------- | ------- |
| Features with defined stage      | Leading | ~30%       | 100%      | Product |
| Revenue team release awareness   | Leading | Low        | >90%      | Product |
| Settings-related support tickets | Lagging | Unknown    | -50%      | Product |
| Beta feature opt-in rate         | Lagging | N/A        | >5%       | Product |
| Time Alpha -> GA (median)        | Lagging | 18+ months | <6 months | Product |

---

## Personas

- **Workspace Owners/Managers**: configure workspace settings, beta access, privacy scope.
- **Standard Users**: manage personal settings and opt into betas where allowed.
- **Revenue Team (Sales/CS)**: need a reliable view of feature availability.
- **Product/Engineering**: need a clear release lifecycle and cleanup path.

---

## Problem Statement

1. Feature maturity is unclear (alpha/beta/GA confusion).
2. Settings scope is confusing (workspace vs personal).
3. Beta availability is inconsistent and hidden.
4. Documentation links are missing or stale.

---

## Goals

1. Standardize release stages and stage metadata across flags.
2. Ship a single Settings IA that embeds Beta Features cleanly.
3. Make alpha visibility dynamic (only show when enabled).
4. Make documentation links dynamic (hide when missing).
5. Clarify privacy scope for managers/owners vs users.

---

## Non-Goals

- Feature flag cleanup execution (tracked in `feature-availability-audit`)
- New settings functionality (beyond IA + beta integration)
- New integrations UX decision (unless explicitly decided)

---

## Requirements

### Release Lifecycle

- Alpha is internal and invite-only; beta is opt-in; GA removes flag.
- Stage metadata required for all feature flags.
- Documentation required before any customer-facing beta.

### Settings IA

- Unified Settings shell with Workspace + Personal groups.
- Beta Features inside Settings (legacy routes remain supported).
- Permissions enforced (owners/managers vs standard users).

### Beta Features UI

- Stage badges (Alpha, Beta).
- Dynamic alpha visibility.
- "Learn more" shown only when docs exist.
- Optional self-toggle for alpha remains a decision point.

### Privacy Scope

- Workspace privacy settings apply to managers/owners only.
- Users can control personal settings and mark meetings public (not private).

---

## Dependencies

- PostHog metadata schema and flag audit
- Beta Features UI v4 components
- Settings shell implementation (unified layout)
- KB article and documentation links

---

## Open Questions

1. Should integrations live outside Settings or remain in IA?
2. Alpha features: view-only vs self-toggle for customers?
3. Should Invite-only Beta use the same badge as Open Beta?
4. How should we communicate scope changes to existing users?
