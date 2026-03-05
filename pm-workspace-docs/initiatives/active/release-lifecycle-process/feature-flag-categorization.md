# Feature Flag Categorization Worksheet

Release Lifecycle v4 • January 2026

Use this worksheet to audit every existing feature flag and decide:

- Which release stage it should be in right now
- Whether the flag stays, moves to settings, or is removed
- What needs to change (docs, badges, access rules, comms)

---

## Release Stages (Customer Availability)

| Stage            | TTL       | Access                       | Flag State                                  | Badge |
| ---------------- | --------- | ---------------------------- | ------------------------------------------- | ----- |
| Alpha            | 2-4 weeks | Internal only                | Feature flag at 0% + internal condition     | Alpha |
| Invite-only Beta | 2-4 weeks | Invited customers + internal | Feature flag at 0% + allowlist conditions   | Beta  |
| Open Beta        | 2-4 weeks | Opt-in (Early Access)        | Feature flag at 0% + Early Access link      | Beta  |
| GA               | Permanent | Enabled for all              | No flag (remove from code; no GA-with-flag) | None  |

---

## Flag Management Rules

### Alpha

- Keep behind feature flag (0% rollout)
- Restrict to `@askelephant.ai` users (internal only)
- Visible in Alpha UI for internal users

### Invite-only Beta

- Keep feature flag at 0%
- Add allowlist conditions (workspace/user properties)
- No Early Access link (access is managed by Product/CS)
- Invited users see Beta badge in UI

### Open Beta

- Keep feature flag at 0%
- Link to Early Access (user self-service opt-in)
- Show in Early Access list with Beta badge

### GA

- Remove flag from code (no GA-with-flag)
- Remove Beta badge
- Standard product experience

---

## Documentation & Comms Checklist (by Stage)

| Requirement                | Alpha | Invite-only Beta | Open Beta | GA  |
| -------------------------- | ----- | ---------------- | --------- | --- |
| Internal Notion doc        | ✓     | ✓                | ✓         | ✓   |
| "How it works" dialog      | ✓     | ✓                | ✓         | —   |
| Knowledge base (draft)     | —     | ✓                | ✓         | —   |
| Knowledge base (published) | —     | —                | ✓         | ✓   |
| Release notes              | —     | —                | ✓         | ✓   |
| In-app "What's New"        | —     | —                | ✓         | —   |
| Internal training complete | —     | ✓                | ✓         | —   |

---

## Feature Flag Audit Table

Fill one row per existing feature flag.

| Feature / Flag | Current code state                        | Current access                   | Current flag usage         | Intended stage                            | Required changes                                  | Owner | TTL start | Notes |
| -------------- | ----------------------------------------- | -------------------------------- | -------------------------- | ----------------------------------------- | ------------------------------------------------- | ----- | --------- | ----- |
|                | Alpha / Invite-only Beta / Open Beta / GA | Internal / Invite / Opt-in / All | Flag? Early Access? Badge? | Alpha / Invite-only Beta / Open Beta / GA | Remove flag? Add EA link? Add badge? Update docs? |       |           |       |

---

## Migration Decision Prompts

Answer these for each flag before assigning a stage:

- Is the feature stable enough for all users?
- Do we need a toggle for opt-in or opt-out?
- Does the UI already include a badge? If not, add one.
- Are there known risks that require internal-only Alpha?
- What documentation is missing for this stage?
- Should the flag be removed entirely after rollout?

---

## Stage Movement Plan

For any flag changing stages, capture:

- **From → To:** (e.g., Alpha → Beta)
- **Access change:** Internal → Invite-only → Open Beta
- **Code change:** Remove flag / move to toggle / add badge
- **Docs update:** Notion / KB / Release notes / Training
- **Comms:** Product updates + weekly revenue sync
