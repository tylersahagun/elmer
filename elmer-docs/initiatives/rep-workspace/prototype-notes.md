# Prototype Notes: Rep Workspace

## Current State

Context prototype created showing Rep Workspace integrated with AskElephant navigation and global chat.

## Prototype Goals

1. Validate dashboard layout with internal reps (Eileen)
2. Test information hierarchy and widget priorities
3. Understand navigation discoverability
4. Gather feedback on global chat integration point

## Context Prototype

### Placement Decision

| Decision | Value | Rationale |
|----------|-------|-----------|
| **Integration Type** | New Page | Primary dashboard for reps, not a side feature |
| **Route** | `/workspaces/:workspaceId/workspace` | Or `/home` - dedicated workspace route |
| **Navigation Entry** | Top of sidebar (new) | First item users see, marked as "NEW" |
| **Adjacent Features** | Action Items, My Meetings, Customers, Chats | Quick access from dashboard widgets |

### Integration Views Created

| Story | What It Shows | Key Decisions |
|-------|--------------|---------------|
| `AsFullPage` | Full page with nav | Dashboard with expanded sidebar |
| `WithGlobalChat` | Three-column layout | Sidebar + workspace + chat panel |
| `CollapsedSidebar` | Compact navigation | More space for dashboard content |
| `NavigationComparison` | Nav states | How workspace appears in navigation |

### Widget Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Greeting + Stats + "Ask Elephant" CTA                  │
├───────────────────────────────┬─────────────────────────────────┤
│  Action Items Widget          │  Recent Meetings Widget         │
│  - Pending tasks with checkboxes │  - Last 4 meetings           │
│  - Priority badges            │  - Key insights                 │
│  - Due dates                  │  - Recording indicators         │
├───────────────────────────────┼─────────────────────────────────┤
│  My Accounts Widget           │  Agent Activity Widget          │
│  - Health score indicators    │  - CRM updates (completed)      │
│  - Deal values/stages         │  - Pending approvals            │
│  - Meeting counts             │  - Action timestamps            │
├───────────────────────────────┴─────────────────────────────────┤
│  Quick Chat Prompt Bar                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Mock Dependencies

These parts are mocked for the prototype (need real implementation):

| Component | Mock | Production Replacement |
|-----------|------|----------------------|
| `MockSidebar` | Simplified navigation | `@/components/navigation/app-sidebar` |
| `MockGlobalChat` | Static chat UI | `@/components/chat/global-chat` |
| GraphQL queries | Mock data arrays | Real Apollo queries |
| `useViewer` | None (props) | Hook for current user |
| Routes | Console logs | `useNavigate()` calls |

### Design Decisions Made

1. **Greeting personalization**: Time-based greeting + task count summary
2. **Widget cards**: Consistent card design with icons, titles, and "View all" actions
3. **Health indicators**: Color-coded icons (green/amber/red) for account health
4. **Agent activity**: Status badges (Done/Pending/Failed) with relative timestamps
5. **Quick chat**: Bottom prompt bar as alternative entry to global chat
6. **Gradient accent**: Indigo-to-violet gradient for primary actions and avatars

### Storybook Stories

**Dashboard (Isolated)**
- `Default` - Full mock data state
- `EmptyState` - New user with no data
- `AllCaughtUp` - All action items completed
- `AtRiskAccounts` - Multiple at-risk accounts
- `PendingApprovals` - Heavy agent activity

**InContext (Integrated)**
- `AsFullPage` - Primary view with nav
- `WithGlobalChat` - Chat panel open
- `CollapsedSidebar` - Compact nav mode
- `NavigationComparison` - Nav state comparison

---

## Ready for Production

Before promoting from `prototypes/`:

- [ ] Add feature flag `rep-workspace`
- [ ] Add route to `router.tsx`
- [ ] Add nav item to `nav-main.tsx` (conditional on flag)
- [ ] Create real GraphQL queries:
  - [ ] `ViewerActionItemsQuery` - Recent pending tasks
  - [ ] `ViewerRecentEngagementsQuery` - Last N meetings
  - [ ] `ViewerAccountsQuery` - Companies with deal data
  - [ ] `ViewerAgentActivityQuery` - CRM agent actions
- [ ] Wire up navigation callbacks to `useNavigate()`
- [ ] Connect global chat via `useGlobalChat()` context
- [ ] Add PostHog analytics tracking
- [ ] Mobile/responsive breakpoints
- [ ] Empty state illustrations
- [ ] Skeleton loading states
- [ ] Error boundaries for each widget

---

## Iterations

### Iteration 1 - Context Prototype
**Date:** 2026-01-16
**Changes:**
- Created dashboard layout with 4 widget cards
- Built mock sidebar and chat panel for context
- Added multiple Storybook stories for review

**Feedback:**
Jury evaluation: 45% combined pass rate (FAIL)
- Skeptic pass rate: 5% (critical gap)
- Top friction: "Understanding what gets synced" (35 mentions)
- Key concern: "What's the learning curve?" (15 mentions)

---

### Iteration 2 - Trust & Onboarding (Post-Jury)
**Date:** 2026-01-16
**Jury Feedback Addressed:**

| Feedback | V1 Issue | V2 Solution |
|----------|----------|-------------|
| "Understanding what gets synced" (35 mentions) | No data source visibility | `DataProvenancePopover` on every widget |
| "What's the learning curve?" (15 mentions) | Dropped users in cold | `OnboardingExperience` with guided tour |
| "Need clearer onboarding guidance" (15 mentions) | No first-time experience | Welcome → Tour → Complete flow |
| Skeptic pass rate: 5% | No trust signals | `SyncStatusBadge` + `GlobalStatusBar` |

**New Components Created:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `OnboardingExperience` | First-time user flow | `v2/OnboardingExperience.tsx` |
| `OnboardingWelcome` | Welcome screen with value prop | ↑ |
| `OnboardingTourStep` | Feature spotlight during tour | ↑ |
| `OnboardingComplete` | Setup confirmation | ↑ |
| `SyncStatusBadge` | Widget-level sync status | `v2/TrustIndicators.tsx` |
| `DataProvenancePopover` | Shows data sources on click | ↑ |
| `GlobalStatusBar` | System-wide connection status | ↑ |
| `RepWorkspaceDashboardV2` | Updated dashboard with all above | `v2/RepWorkspaceDashboardV2.tsx` |

**New Storybook Stories:**

| Story | What It Shows |
|-------|---------------|
| `V2_Default` | Dashboard with trust indicators |
| `V2_WithSyncIssues` | Error/partial sync states |
| `V2_StaleData` | Warning when data is old |
| `V2_OnboardingWelcome` | Welcome screen |
| `V2_OnboardingTour` | Feature spotlight |
| `V2_OnboardingComplete` | Setup complete |
| `V2_OnboardingFull` | Complete interactive flow |
| `V2_DataProvenanceDemo` | Click info icon demo |
| `V2_SkepticValueProp` | Design rationale |
| `V2_BeforeAfter` | V1 vs V2 comparison |

**Design Decisions:**

1. **Every widget shows data source** - Click info icon to see where data comes from
2. **Real-time sync status** - Live/Synced/Syncing/Error badges on each widget
3. **Global status bar** - System health visible at top of dashboard
4. **Optional onboarding** - Can skip tour, not forced
5. **Progressive trust** - More transparency for skeptics, quick glance for power users

**Ready for Re-validation:**
- [ ] Run `/validate rep-workspace` to check if pass rate improves
- Target: ≥60% combined pass rate
- Target: ≥30% skeptic pass rate

---

## Design Brief

Full design specification created at `design-brief.md` including:
- User flows (first-time, returning, skeptic path)
- All dashboard states (first visit, empty, partial, full, loading, error)
- Widget states (loading, empty, populated, error, refreshing)
- Data provenance design
- Trust indicators specification
- Onboarding screens
- Empty states
- Accessibility requirements
- Responsive breakpoints
- Animation specifications

---

*Last updated: 2026-01-16 (Iteration 2)*
