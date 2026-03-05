# Prototype Notes: Deprecate Legacy Pipedream

## Version 2 (2026-02-09)

**Chromatic:** https://672502f3cbc6d0a63fdd76aa-saokbxhdql.chromatic.com/
**Build Details:** https://www.chromatic.com/build?appId=672502f3cbc6d0a63fdd76aa&number=51
**Location:** `elephant-ai/apps/web/src/components/prototypes/DeprecatePipedream/v2/`
**Storybook Path:** `Prototypes/DeprecatePipedream/v2/IntegrationMigration`

### Creative Directions

| Direction                                      | User Control | Trust Required     | Best Persona                 | Key Feature                                         |
| ---------------------------------------------- | ------------ | ------------------ | ---------------------------- | --------------------------------------------------- |
| **Option A: Migration Wizard**                 | Guided       | Low (step-by-step) | First-time migration, RevOps | 4-step flow: Review → Auth → Test → Activate        |
| **Option B: Dashboard + Inline** (Recommended) | Maximum      | Medium             | RevOps / Admin               | All-in-one view with search, filter, inline actions |
| **Option C: Timeline-Based**                   | Read-first   | Low                | Leadership                   | Deprecation timeline with milestones per phase      |

### Trust UX Decisions

1. **Auth Scope Explicit** — Workspace vs Personal toggle with attribution preview
   - "AskElephant Bot (workspace)" vs "Your Name (personal)"
   - Warning when personal auth is used with shared workflows
2. **Provider Badges** — Every integration shows "Composio-backed" or "Pipedream (legacy)"
3. **Deprecation Banners** — Missing integrations (Monday, Confluence, Sendoso) show red banners with fallback guidance
4. **Error Recovery** — Specific error types (OAuth timeout, scope mismatch, vendor outage) with targeted recovery actions

### States Implemented

| State                   | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| Loading                 | Skeleton loaders while fetching integration status                    |
| Success                 | All migrated — 100% coverage for supported integrations               |
| Error (system)          | Backend unreachable — retry + escalation                              |
| Error (per-integration) | OAuth timeout, scope mismatch, vendor outage — per-card error banners |
| Partial                 | Mixed state — some migrated, some pending, some errored               |
| Empty                   | No integrations configured                                            |

### Flow Stories

| Flow                 | Journey                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `Flow_MigrateLinear` | Review parity → Select auth scope → Connect via OAuth → Verify tools → Activate           |
| `Flow_AuthScope`     | Select workspace vs personal → See attribution preview → Warning for personal + workflows |
| `Flow_Deprecation`   | See deprecation banner → View affected workflows → Request support or acknowledge         |

### Interactive Components

- **Demo_Clickthrough** — Live interactive demo with state changes, direction switcher, and action log
- **WalkthroughStory** — 10-step narrated walkthrough covering all states and directions

### Design System Usage

- Uses semantic tokens: `bg-card`, `text-muted-foreground`, `border-border`
- Status colors: emerald (success/covered), amber (warning/partial), rose (error/missing), blue (migrated/composio), stone (deprecated)
- shadcn/ui patterns: Cards, Badges (custom), Progress indicators, Tab-like filters
- Lucide icons throughout

### Parity Matrix (from research.md)

| Integration  | Composio Status         | Connection State   | Workflows |
| ------------ | ----------------------- | ------------------ | --------- |
| Linear       | Covered                 | Needs Migration    | 4         |
| Notion       | Covered                 | Needs Migration    | 2         |
| Google Drive | Covered (name mismatch) | Needs Reconnect    | 1         |
| HubSpot      | Migrated                | Connected          | 8         |
| Slack        | Migrated                | Connected          | 6         |
| Monday.com   | Missing                 | Connected (legacy) | 1         |
| Confluence   | Missing                 | Disconnected       | 0         |
| Sendoso      | Missing                 | Disconnected       | 0         |

### Figma Inputs Used

- No Figma spec available for this initiative (prototype-first approach)
- Design system tokens from `.interface-design/system.md` (2026-01-22 snapshot)

---

## Version 1 (2026-01-30)

Initial prototype with 3 creative directions: Admin Dashboard, Settings Page, Migration Wizard.
Located in `elephant-ai/apps/web/src/components/prototypes/DeprecatePipedream/v1/`.
Covered basic integration cards, migration summary, and feature flag panel.
V2 adds: comprehensive error states, flow stories, demo/walkthrough, timeline direction, auth scope selector, per-integration error banners.
