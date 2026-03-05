# Early Access Release Cycle — Source of Truth

## Purpose

Define a single, consistent release lifecycle for AskElephant features that are governed by PostHog flags and Early Access. This is the canonical reference for **stage definitions**, **PostHog configuration**, and **UI behavior**.

## Release Cycle

1. **Alpha** (internal testing only)
2. **Invite-only Beta** (hand-picked customers via feature flag)
3. **Open Beta** (opt-in through Beta page)
4. **General Availability** (default on, no flag)

## Stage Definitions (Who sees it, how it’s controlled)

| Stage            | Who sees it                  | Access control      | PostHog config                                                               | UI behavior                                          |
| ---------------- | ---------------------------- | ------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| Alpha            | AskElephant employees only   | Engineering/Product | **Feature flag** at 0% with condition `email contains askelephant.ai`        | Internal users see **Alpha** section                 |
| Invite-only Beta | Invited customers + internal | Product/CS          | **Feature flag** at 0% with allowlist conditions (workspace/user properties) | Invited users see **Beta** tag in UI                 |
| Open Beta        | Opt‑in users                 | User‑controlled     | **Feature flag** at 0% with **Early Access feature** linked                  | External users see **Early Access list** with toggle |
| GA               | Everyone                     | Nobody              | Remove flag from code (no GA with flag)                                      | No beta tags, no toggles                             |

## UI Rules (Skylar requirements)

- **Alpha tab visible only to internal users.**
- **External users see a single Early Access list** (no tabs).
- **Remove Personal/Workspace sections** from Beta UI (no workspace‑feature beta toggles).
- **Toggles are direct** (no confirmation modal).
- **Demo mode** keeps list visible with **locked/off** state.
- **Demo Mode badge** appears in navigation.
- **Invite-only Beta** and **Open Beta** features show a **beta tag** in UI.

## PostHog Rules (non‑negotiable)

1. **Never** link Early Access to a flag at 100% rollout.
2. **Early Access requires flag rollout at 0%** (EA controls per‑user enablement).
3. **Alpha requires internal‑only conditions** (email domain).
4. **Invite-only Beta** uses allowlist conditions (no Early Access link).
5. **Open Beta** uses Early Access with flag rollout at 0%.
6. **GA** removes the flag from code (no GA with feature flag).

## Stage Transition Checklists

### Alpha → Invite-only Beta

- [ ] Remove internal condition from flag
- [ ] Ensure rollout is 0%
- [ ] Add allowlist conditions (workspace/user properties)
- [ ] Add description + documentation link

### Invite-only Beta → Open Beta

- [ ] Create Early Access feature linked to flag
- [ ] Keep flag rollout at 0%
- [ ] Add/verify Beta tag on UI surface

### Open Beta → GA

- [ ] Remove Beta tag from UI
- [ ] Remove flag from codebase
- [ ] Remove flag from PostHog

## Known Exceptions / Notes

- **Internal development** is a pre‑stage and not part of the customer release cycle.
- **Alpha** is the internal‑only view in UI; external users never see it.
- **Invite-only Beta** replaces “Beta (Auto)” wording in older docs.
- **New/Core** stages are out of scope for this project unless explicitly added later.

## Resources (source docs)

- `release-lifecycle-process/posthog-guidelines.md`
- `release-lifecycle-process/feature-flag-categorization.md`
- `feature-availability-audit/Feature Flag Audit.md`
- `feature-availability-audit/posthog-audit-2026-01-26.md`
- `feature-availability-audit/engineering-spec.md`
