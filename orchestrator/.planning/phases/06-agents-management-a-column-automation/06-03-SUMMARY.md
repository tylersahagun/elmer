---
phase: 06
plan: 03
subsystem: agents-ui
tags: [agent-execution, context-selector, ui-component, react-query]

dependency-graph:
  requires:
    - 06-01 (agents page and AgentCard base)
    - 06-02 (AgentDetailCard)
  provides:
    - Agent execution from UI with context selection
    - ContextSelector for project/signal context
    - AgentExecutionPanel component
  affects:
    - 06-04 (execution history tracking)
    - 06-06 (column-based automation)

tech-stack:
  added: []
  patterns:
    - State-based inline feedback (vs toast library)
    - Tab-based context type switching
    - Command+Popover for searchable selection

files:
  created:
    - src/components/agents/ContextSelector.tsx
    - src/components/agents/AgentExecutionPanel.tsx
  modified:
    - src/components/agents/AgentCard.tsx
    - src/components/agents/AgentsList.tsx
    - src/components/agents/index.ts
    - src/app/api/agents/execute/route.ts

decisions:
  - id: feedback-pattern
    choice: "Inline feedback component instead of toast"
    reason: "Project doesn't have sonner/toast library installed; inline feedback provides immediate visibility"
  - id: context-type-tabs
    choice: "Tab buttons for none/project/signal switching"
    reason: "Clear visual distinction between context types; matches existing UI patterns"
  - id: panel-inline-display
    choice: "Show execution panel inline in card vs dialog"
    reason: "Keeps context visible; allows quick execute-and-move-on workflow"

metrics:
  duration: ~4 minutes
  completed: 2026-01-27
---

# Phase 6 Plan 3: Agent Execution Triggers Summary

Agent execution UI with context selection that allows running agents from the Agents page with project or signal context.

## What Was Built

### ContextSelector Component
A tab-based selector allowing users to choose execution context:
- **No Context**: Execute agent without specific context
- **Project**: Select from workspace projects via searchable dropdown
- **Signal**: Select from workspace signals via searchable dropdown

Features:
- React Query for data fetching
- Command+Popover pattern (matching BranchSelector pattern)
- Selected item display with clear button
- Graceful loading and empty states

### AgentExecutionPanel Component
An inline panel for configuring and executing agents:
- Agent name and type badge header
- ContextSelector integration
- Execute button with loading state
- Inline feedback for success/error (green/red message boxes)
- Link to view job logs after execution
- Cancel button to close panel

### AgentCard Integration
Added execution trigger to existing AgentCard:
- Play button in card header (right side)
- Clicking opens AgentExecutionPanel inline
- Mutual exclusivity with detail card (one or other open)
- workspaceId passed through component hierarchy

### API Enhancement
Updated `/api/agents/execute` to accept signalId:
- Accepts optional signalId in request body
- Passes signalId in job input for downstream processing

## Files Changed

| File | Change |
|------|--------|
| `src/components/agents/ContextSelector.tsx` | New - context selection component |
| `src/components/agents/AgentExecutionPanel.tsx` | New - execution panel component |
| `src/components/agents/AgentCard.tsx` | Add Play button, execution panel |
| `src/components/agents/AgentsList.tsx` | Pass workspaceId to AgentCard |
| `src/components/agents/index.ts` | Export new components |
| `src/app/api/agents/execute/route.ts` | Accept signalId parameter |

## Commits

| Hash | Message |
|------|---------|
| 0c4321a | feat(06-03): add ContextSelector component for agent execution |
| 3d35f17 | feat(06-03): add AgentExecutionPanel for executing agents with context |
| 168b572 | feat(06-03): wire execution panel into AgentCard |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced sonner toast with inline feedback**
- **Found during:** Task 2 verification (build failure)
- **Issue:** Plan specified using `sonner` toast library but it's not installed in project
- **Fix:** Implemented inline feedback component with success/error states instead
- **Files modified:** src/components/agents/AgentExecutionPanel.tsx
- **Commit:** 168b572 (amended)

## Verification

1. Build passes with `npm run build`
2. Components properly typed and exported
3. API accepts both projectId and signalId
4. Inline feedback shows success message with job link
5. Error states display with red background and message

## Requirements Satisfied

- [x] AGUI-04: User can select projects or signals as context and execute agents from this page
- [x] Job created and trackable via existing job infrastructure
- [x] User feedback via inline messages (adapted from toast requirement)

## Next Phase Readiness

Ready for:
- 06-04: Execution history tracking (jobs created, can be tracked)
- 06-06: Column-based automation (execution API ready for programmatic use)
