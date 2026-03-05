# Engineering Spec: Settings Page & Early Access Revamp

## Summary

Implement a unified Settings shell that embeds the Beta Features UI and connects to PostHog stage metadata. Preserve legacy routes and permissions while enabling a dynamic alpha/beta experience.

**Merged from:**

- `release-lifecycle-process/engineering-spec.md`
- `settings-page-redesign/engineering-spec.md`

---

## Architecture Overview

### Settings Shell

- Unified layout with left sidebar (Workspace + Personal).
- Render section cards in the right panel with anchored navigation.
- Preserve legacy routes and redirect into the new shell.

### Beta Features Service

- PostHog as source of truth for stage metadata.
- User preferences store per-user opt-ins.
- Dynamic alpha visibility: show alpha section only when enabled.
- "Learn more" link only when docs exist.

---

## Key Requirements

### Settings IA

- Route: `elephant-ai/web/src/routes/workspaces/$workspaceId/settings/index.tsx`
- Components: `.../settings/components/*`
- Navigation: `.../components/navigation/nav-viewer.tsx`
- Legacy: `/settings/account`, `/settings/workspace`, `/settings/beta-features`

### Feature Flags

- `unified-settings-page`
- `beta-features-v4-ui`
- `useFeatureFlagWithDemoMode`

### Permissions

- Workspace sections: Owners/Managers only.
- Personal sections: all users.
- Beta features: visible to all users; workspace toggles gated by owner/manager.
- Demo mode: internal users only.

---

## Data Model (PostHog)

```json
{
  "key": "auto-tagging-v2",
  "metadata": {
    "stage": "beta",
    "ttl_start": "2025-11-01",
    "ttl_days": 90,
    "description": "Automatically tag meetings based on content",
    "kb_article": "https://help.askelephant.ai/auto-tagging"
  }
}
```

User preferences:

```sql
CREATE TABLE user_beta_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  enabled_features JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);
```

---

## API

- `GET /api/beta-features` (available features + enabled state)
- `POST /api/beta-features/{key}/toggle` (enable/disable)
- Optional internal status endpoint for impersonation views

---

## Analytics

- Track sidebar navigation clicks.
- Track beta toggle on/off events.
- Track alpha visibility impressions.

---

## QA / Test Plan

### Roles

- Owner: Workspace + Personal sections, beta toggles.
- Manager: Workspace + Personal sections, beta toggles.
- Standard user: Personal only, personal toggles only.
- Internal user: Demo Mode banner visible.

### Scenarios

- Legacy routes redirect to new Settings shell.
- Beta Features visible within Settings and direct route.
- Alpha section appears only when enabled.
- "Learn more" hides when docs missing.

---

## Open Questions

1. Alpha self-toggle vs view-only.
2. Integrations placement (inside Settings or dedicated area).
3. Invite-only Beta badge treatment.
