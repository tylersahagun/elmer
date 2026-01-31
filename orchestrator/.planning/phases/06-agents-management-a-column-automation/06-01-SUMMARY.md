---
phase: 06-agents-management-a-column-automation
plan: 01
name: Agents Page and Navigation
subsystem: agents-ui
tags: [agents, navigation, ui, page-route]

# Dependency Graph
requires:
  - phase-03 (agent import during onboarding)
  - agentDefinitions table (db schema)
  - /api/agents endpoint

provides:
  - Agents page route (/workspace/[id]/agents)
  - Agent list UI with type grouping
  - Hamburger menu navigation to agents

affects:
  - 06-02 (agent detail and execution - builds on list)
  - 06-03+ (column automation - uses agent selection)

# Tech Tracking
tech-stack:
  added: []
  patterns:
    - TYPE_ORDER array for canonical section ordering
    - Expandable card pattern for content preview
    - useQuery for data fetching with loading/error states

# File Tracking
key-files:
  created:
    - src/app/(dashboard)/workspace/[id]/agents/page.tsx
    - src/components/agents/AgentCard.tsx
    - src/components/agents/AgentsList.tsx
    - src/components/agents/index.ts
    - src/components/ui/skeleton.tsx (blocking fix)
  modified:
    - src/components/chrome/index.ts (added SimpleNavbar export)
    - src/components/chrome/Navbar.tsx (added agents link)

# Decisions
decisions:
  - id: agui-01-menu-placement
    decision: Place agents link after signals, before settings
    rationale: Aligns with workflow - signals feed agents, settings is config
  - id: agui-01-run-command
    decision: Use "$ run agents" terminal-style menu text
    rationale: Consistent with existing menu pattern (cd, ls, cat, vim)
  - id: agui-01-expandable-cards
    decision: Expandable AgentCard shows full content on click
    rationale: Keeps list scannable while allowing deep inspection

# Metrics
metrics:
  duration: ~15 minutes
  completed: 2026-01-27
  tasks: 3/3
  commits: 3
---

# Phase 6 Plan 01: Agents Page and Navigation Summary

Agents list page accessible via hamburger menu, displaying imported agents grouped by type.

## One-liner

Agents page with grouped list UI, hamburger menu navigation, and expandable card content preview.

## What Was Built

### Task 1: Agents Page Route
- Created `/workspace/[id]/agents` route as server component
- Extracts workspaceId from params (Next.js 15 async params pattern)
- Renders SimpleNavbar with "~/agents" path
- Integrates AgentsList client component

### Task 2: Agent Components
- **AgentCard.tsx**: Expandable card displaying agent name, type badge, source path, description, and full content
- **AgentsList.tsx**: Client component that fetches agents via useQuery, groups by type, handles loading/error/empty states
- **index.ts**: Barrel file exporting components
- **Skeleton component**: Created missing UI component (blocking fix)
- **SimpleNavbar export**: Added to chrome barrel file (blocking fix)

### Task 3: Hamburger Menu Navigation
- Added `isAgentsActive` state check
- Added "$ run agents" link after signals, before settings
- Link highlights when on agents page

## Key Implementation Details

### Type Grouping
```typescript
const TYPE_ORDER = [
  { type: 'agents_md', label: 'AGENTS.md' },
  { type: 'skill', label: 'Skills' },
  { type: 'command', label: 'Commands' },
  { type: 'subagent', label: 'Subagents' },
  { type: 'rule', label: 'Rules' },
];
```

### Badge Colors (Semantic)
- Purple: AGENTS.md (primary configuration)
- Blue: Skills (capabilities)
- Green: Commands (actions)
- Orange: Subagents (delegation)
- Gray: Rules (constraints)

### Empty State Message
"Connect a repository with .cursor/ configuration to import agent definitions."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] SimpleNavbar not exported from chrome barrel**
- **Found during:** Task 1 verification
- **Issue:** SimpleNavbar was defined in Navbar.tsx but not exported from index.ts
- **Fix:** Added `SimpleNavbar` to chrome/index.ts exports
- **Files modified:** src/components/chrome/index.ts
- **Commit:** 59d76e7

**2. [Rule 3 - Blocking] Missing Skeleton UI component**
- **Found during:** Build verification
- **Issue:** ProjectCommitHistory.tsx imports Skeleton but component didn't exist
- **Fix:** Created src/components/ui/skeleton.tsx with standard shadcn pattern
- **Files modified:** src/components/ui/skeleton.tsx (created)
- **Commit:** 59d76e7

## Verification Results

1. File existence verified:
   - /workspace/[id]/agents/page.tsx exists
   - Agent components exist in src/components/agents/

2. Key links verified:
   - Navbar.tsx contains `href={/workspace/${workspaceId}/agents}`
   - AgentsList.tsx contains `fetch(/api/agents?workspaceId=...)`

3. TypeScript compilation: Files compile correctly (pre-existing type error in unrelated github/contents route)

## Commits

| Hash | Message |
|------|---------|
| 3c469fa | feat(06-01): create Agents page route |
| 59d76e7 | feat(06-01): create agent components with type grouping |
| 51e5e7e | feat(06-01): add Agents link to hamburger menu |

## Success Criteria Status

- [x] AGUI-01: User can navigate to Agents page via hamburger menu
- [x] AGUI-02: Agents page shows list of all detected/imported agents with descriptions
- [x] Agents grouped by type with semantic badge colors
- [x] Empty state shows helpful message

## Next Phase Readiness

Ready for 06-02 (Agent Detail and Execution):
- AgentCard component can be extended for execute callback
- Agent list provides selection foundation for column automation
- Component structure supports future agent management features
