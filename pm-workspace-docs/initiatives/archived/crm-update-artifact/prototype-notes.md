# Prototype Notes: CRM Experience End-to-End

## Overview

Context prototype showing how CRM workflow visibility and testing integrates with the AskElephant app UI.

**Prototype Type:** Context prototype (shows integration, not just feature)  
**Created:** 2026-01-16  
**PRD:** [prd.md](./prd.md)  
**Placement Research:** [placement-research.md](./placement-research.md)

---

## Components Created

### Main Components (V1)

| Component               | Purpose                                 | Location                    |
| ----------------------- | --------------------------------------- | --------------------------- |
| `CRMActivityDashboard`  | Cross-workflow visibility (Priority #1) | `prototypes/CRMExperience/` |
| `CRMActivityTable`      | Activity log with CRM record links      | `prototypes/CRMExperience/` |
| `CRMActivityFilters`    | Filter by status, workflow, record type | `prototypes/CRMExperience/` |
| `CRMActivityRunDetail`  | Side panel for run details              | `prototypes/CRMExperience/` |
| `ManualEnrollmentPanel` | Test workflow on record (Priority #2)   | `prototypes/CRMExperience/` |

### Skeptic-Focused Components (V2)

| Component              | Purpose                          | Location                    |
| ---------------------- | -------------------------------- | --------------------------- |
| `ROIMetrics`           | Show time saved, efficiency gain | `prototypes/CRMExperience/` |
| `RollbackPreview`      | Preview rollback before execute  | `prototypes/CRMExperience/` |
| `RollbackSafetyBanner` | "Changes are reversible" message | `prototypes/CRMExperience/` |
| `PilotModeControls`    | Gradual rollout configuration    | `prototypes/CRMExperience/` |
| `PilotModeBadge`       | Visual indicator in lists        | `prototypes/CRMExperience/` |

### Context Wrappers

| Component                   | Purpose                  | Shows                         |
| --------------------------- | ------------------------ | ----------------------------- |
| `ActivityInAutomationsPage` | Activity tab integration | Dashboard in Automations page |
| `TestPanelInWorkflowDetail` | Test button integration  | Panel in workflow detail      |
| `MockSidebar`               | Navigation context       | Sidebar structure             |

---

## Integration Views

### 1. Activity Tab in Automations Page

**Story:** `Prototypes/CRMExperience/InContext/ActivityTabInAutomations`

Shows the Activity Dashboard as a new tab in the existing Automations page.

**Key Decisions:**

- New "Activity" tab alongside Workflows, Prompts, Signals, Tags
- Badge on tab shows pending approval count
- Stats cards at top for quick health overview
- Filterable activity timeline below

**Why this placement:**

- Users already go to Automations for workflow management
- Cross-workflow visibility needs its own view (not per-workflow)
- Tab pattern matches existing UI conventions

### 2. Test Panel in Workflow Detail

**Story:** `Prototypes/CRMExperience/InContext/TestPanelOpen`

Shows the Manual Enrollment Panel as a side sheet from workflow detail.

**Key Decisions:**

- New "Test" button in workflow header (lab beaker icon)
- Panel slides in from right (Sheet component)
- Workflow canvas stays visible for iteration
- Two modes: Dry Run (preview) and Execute (actual)

**Why this placement:**

- Testing is contextual to specific workflow
- Follows existing run steps drawer pattern
- Supports test → adjust → test workflow

---

## Storybook Navigation

### Standalone Stories (Feature Focus)

```
Prototypes/CRMExperience/
├── ActivityDashboard
│   ├── Default
│   ├── AllHealthy
│   ├── CriticalErrors
│   ├── EmptyState
│   └── ManyPendingApprovals
└── ManualEnrollmentPanel
    ├── SelectRecord
    ├── CloseWonWorkflow
    └── ContactEnrichment
```

### Context Stories (Integration Focus)

```
Prototypes/CRMExperience/InContext/
├── ActivityTabInAutomations
├── WorkflowsTabForComparison
├── TestButtonInWorkflowDetail
├── TestPanelOpen
└── TestPanelContactEnrichment
```

---

## Mock Dependencies

These parts are mocked for the prototype:

| Mock                  | Real Implementation                  |
| --------------------- | ------------------------------------ |
| `MockSidebar`         | `@/components/navigation/AppSidebar` |
| `mockWorkflowRuns`    | GraphQL query for workflow runs      |
| `mockRecords`         | HubSpot API for records              |
| `mockDashboardHealth` | Computed from real run data          |
| `mockROIMetrics`      | Computed from workflow run history   |
| `mockPilotModeConfig` | Stored in workflow settings          |
| `mockPilotModeStats`  | Computed from pilot segment runs     |

---

## Ready for Production

Before promoting from `prototypes/`:

- [ ] Replace `MockSidebar` with real navigation
- [ ] Connect to GraphQL queries for workflow runs
- [ ] Implement HubSpot record search API
- [ ] Add real-time updates (WebSocket/polling)
- [ ] Add feature flag: `crm-activity-dashboard`
- [ ] Add feature flag: `workflow-manual-test`
- [ ] Update routes in `router.tsx`
- [ ] Add tab to existing Automations page component

---

## Technical Notes

### Component Patterns Used

- **Page layout:** Uses `Page`, `PageHeader`, `PageContent` pattern
- **Side panel:** Uses `Sheet` from shadcn/ui
- **Tables:** Custom card-based layout (not AG Grid)
- **Filters:** Dropdown menus with controlled state
- **Stats:** Card grid with responsive layout

### Data Types

```typescript
// Key types defined in types.ts
WorkflowRun; // Individual run with CRM record + field updates
WorkflowSummary; // Workflow stats for filtering
DashboardHealth; // Overall health status
FieldUpdate; // Before/after with confidence
```

### Styling

- Tailwind CSS utility classes
- shadcn/ui components (`Badge`, `Button`, `Card`, `Sheet`, etc.)
- Color variants for confidence levels (green/yellow/red)
- Status indicators with icons

---

## Validation Status

- [x] Run `/validate crm-exp-ete` with synthetic users (2026-01-16)
  - Combined pass rate: 50% (below 60% threshold)
  - Power users: 80% pass ✅
  - Skeptics: 25% pass ❌
  - See `jury-evaluations/validation-report-20260116.md`
- [x] Address skeptic concerns (V2 iteration - 2026-01-16)
- [ ] Re-run validation after V2 iteration
- [ ] Compare standalone vs context approaches
- [ ] Review with RevOps stakeholder (James)
- [ ] Engineering feasibility review

---

## Iteration History

### V2: Skeptic-Focused Features (2026-01-16)

**Feedback Source:** Jury evaluation showed 25% skeptic pass rate (target: 60%)

**Gap Analysis from Jury:**

1. "Show me the ROI, show me it works" → No proof of value
2. "What happens when it goes wrong?" → No rollback mechanism
3. "Too much automation too fast" → No gradual rollout option

**Components Added:**

| Component              | Purpose                                      | Addresses                          |
| ---------------------- | -------------------------------------------- | ---------------------------------- |
| `ROIMetrics`           | Shows hours saved, efficiency gains          | "Show me the ROI"                  |
| `RollbackPreview`      | Preview what rollback would look like        | "What happens when it goes wrong?" |
| `RollbackSafetyBanner` | Prominent "changes are reversible" messaging | Skeptic trust                      |
| `PilotModeControls`    | Start with 5-25% of records                  | "Too much automation"              |
| `PilotModeBadge`       | Visual indicator in workflow list            | Gradual rollout visibility         |

**Dashboard Integration:**

- Added safety banner at top (changes are reversible)
- Added pilot mode banner when active
- Added ROI metrics card in stats grid (compact view)
- Grid expanded from 4 to 5 columns

**New Storybook Stories:**

```
Prototypes/CRMExperience/V2-SkepticFeatures/
├── ROIMetrics
│   ├── FullView
│   ├── CompactView
│   └── HighSavings
├── RollbackPreview
│   ├── RollbackButton
│   └── SafetyBanner
└── PilotMode
    ├── FullControls
    ├── BannerVariant
    ├── ReadyToExpand
    └── BuildingConfidence
```

**Expected Impact:**

- Skeptic pass rate: 25% → 45%+ (target: 60%)
- Key messaging: "Safe to try, easy to undo"

**Next Steps:**

1. Re-run `/validate crm-exp-ete` to measure improvement
2. If pass rate improves, schedule James review
3. If still below threshold, consider onboarding flow iteration

---

## Related Documents

- [PRD](./prd.md) - Full requirements
- [Design Brief](./design-brief.md) - Design specifications
- [Research](./research.md) - User feedback including James's Priority Stack
- [Placement Research](./placement-research.md) - Integration decision analysis

---

_Last updated: 2026-01-16_
_Created by: AI PM Copilot_
