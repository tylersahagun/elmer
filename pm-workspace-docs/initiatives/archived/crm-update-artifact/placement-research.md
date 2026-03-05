# Placement Research: CRM Experience End-to-End

## Analysis Date: 2026-01-16

## Feature Overview

The CRM Experience E2E initiative focuses on **workflow visibility** and **testing capabilities** for CRM automation. The core features (per James's Priority Stack) are:

1. **Workflow Visibility Dashboard** - See what each workflow did to CRM records
2. **Manual Enrollment/Test** - Test workflows without triggering other HubSpot workflows
3. **AI Context for CRM** - Workflow builder knows CRM-specific requirements
4. **Property Creation** - Create/repurpose HubSpot properties from workflow builder

---

## Codebase Analysis

### Existing Related Features

| Feature             | Location                                             | Pattern                                               |
| ------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Workflows page      | `/workspaces/:workspaceId/workflows`                 | Tab-based page with Workflows, Prompts, Signals, Tags |
| Workflow detail     | `/workflows/:workflowId`                             | Full page with ReactFlow canvas                       |
| Workflow history    | `/workflows/:workflowId/history`                     | Table of runs per workflow                            |
| Workflow runs table | `components/workflows/workflow-runs-table.tsx`       | AG Grid with row click → drawer                       |
| Run steps drawer    | `components/workflows/workflow-run-steps-drawer.tsx` | Sheet panel for run details                           |

### Navigation Structure

The app uses a sidebar navigation (`nav-main.tsx`) with items including:

- Search
- My meetings
- Action items
- Customers/Companies/Contacts
- Chats
- Knowledge bases
- **Automations/Workflows** ← Target location

### Page Pattern

Pages use `Page`, `PageHeader`, `PageContent` components with optional `PageTabs` for multi-tab layouts.

---

## Placement Decision

### Integration Type: **New Tab + Side Panel**

| Component                     | Integration Type                            | Rationale                                                                    |
| ----------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| Workflow Visibility Dashboard | **New "Activity" tab** in Automations       | Cross-workflow visibility needs its own view; fits with existing tab pattern |
| Manual Enrollment/Test        | **Side panel (Sheet)** from workflow detail | Follows existing run steps drawer pattern; contextual to specific workflow   |
| AI Context Indicators         | **Inline in workflow builder**              | Must be where users build workflows                                          |
| Property Creation             | **Modal dialog** from workflow builder      | Approval flow needs focused attention                                        |

### Navigation Entry

**Primary:** New "Activity" tab in the Automations page header  
**Secondary:** "Test" button in workflow detail header → opens side panel

### Parent Context

The Activity Dashboard lives alongside existing tabs in `/workspaces/:workspaceId/workflows`:

```
Automations Page
├── Workflows tab (existing)
├── Prompts tab (existing)
├── Signals tab (existing)
├── Tags tab (existing)
└── Activity tab (NEW) ← CRM Activity Dashboard
```

### Adjacent Features

| Adjacent Feature      | Relationship                                          |
| --------------------- | ----------------------------------------------------- |
| Workflow list         | Navigate to specific workflow from activity view      |
| Workflow detail       | Contains "Test" button for manual enrollment          |
| Workflow history      | Per-workflow run history (Activity is cross-workflow) |
| Integrations settings | HubSpot connection management                         |

---

## Rationale

### Why a new tab (not a new page)?

1. **Discoverability** - Users already go to Automations to manage workflows
2. **Context** - Activity is directly related to workflow operations
3. **Pattern consistency** - Other workflow-adjacent features (Signals, Tags) are tabs
4. **Navigation efficiency** - One click to switch between configuration and monitoring

### Why not modify existing Workflow History?

1. **Different scope** - History is per-workflow; Activity is cross-workflow
2. **Different purpose** - History is debugging; Activity is monitoring/visibility
3. **Different audience** - History is power users; Activity is all admins
4. **Risk mitigation** - Don't break existing patterns users rely on

### Why side panel for Manual Test (not modal)?

1. **Context preservation** - Keep workflow visible while testing
2. **Pattern precedent** - Run steps already use Sheet drawer
3. **Space for results** - Testing shows before/after which needs room
4. **Workflow iteration** - Users may test → adjust → test repeatedly

---

## Technical Approach

### New Files Required

```
elephant-ai/web/src/components/prototypes/CRMExperience/
├── index.ts                              # Exports
├── CRMActivityDashboard.tsx             # Main dashboard component
├── CRMActivityDashboard.stories.tsx     # Isolated stories
├── CRMActivityTable.tsx                 # Activity log table
├── CRMActivityFilters.tsx               # Filter controls
├── ManualEnrollmentPanel.tsx            # Test workflow side panel
├── ManualEnrollmentPanel.stories.tsx    # Isolated panel stories
├── RecordSelector.tsx                   # HubSpot record picker
├── TestResultsView.tsx                  # Show what would happen
├── contexts/                            # Context prototype wrappers
│   ├── ActivityInAutomationsPage.tsx    # Dashboard in full page context
│   ├── TestPanelInWorkflowDetail.tsx    # Panel in workflow context
│   └── CRMExperience.context.stories.tsx # Context stories
└── mocks/
    └── mockData.ts                       # Realistic mock data
```

### Component Dependencies

| Component             | Real imports                                      | Mock imports |
| --------------------- | ------------------------------------------------- | ------------ |
| CRMActivityDashboard  | `@/components/ui/*`, `@/lib/utils`                | Data hooks   |
| ManualEnrollmentPanel | `@/components/ui/sheet`, `@/components/ui/button` | HubSpot API  |
| Context wrappers      | Page components, Sidebar mock                     | None         |

### Data Requirements

The prototype will mock:

- Workflow run history with CRM record links
- HubSpot records (deals, contacts, companies)
- Field update before/after comparisons
- Confidence scores per field

---

## Feature Flag Strategy

| Feature                        | Flag Name                         | Default |
| ------------------------------ | --------------------------------- | ------- |
| Activity tab in Automations    | `crm-activity-dashboard`          | false   |
| Test button in workflow detail | `workflow-manual-test`            | false   |
| AI context indicators          | Part of existing workflow builder | N/A     |

---

## Open Questions

1. Should Activity tab be visible to all users or admins only?
2. How much history to show by default (7 days? 30 days?)?
3. Should test results persist or be ephemeral?
4. How to handle records that don't exist in HubSpot?

---

_Last updated: 2026-01-16_
_Analyst: AI PM Copilot_
