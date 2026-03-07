# UX Release Gates

## Objective
Define the release gates that UX work must pass before a phase is considered safe to ship.

## Audience
Engineering and product leads coordinating UX releases across route-heavy and context-heavy surfaces.

## Evidence Basis
- `pm-workspace-docs/status/ux-sequenced-execution-plan.md`
- `pm-workspace-docs/status/ux-ui-review.md`
- `pm-workspace-docs/status/ux-priority-roadmap.md`
- `AGENT-BRIEF.md`

## Gate 1: Auth And Runtime Health
- `/login` must load reliably
- authenticated home must load reliably
- workspace shell must render without crash overlays
- current route-specific runtime blockers must be resolved

## Gate 2: Route Smoke Coverage
- major workspace routes pass smoke coverage
- canonical project route passes smoke coverage
- canonical standalone document route passes smoke coverage
- settings and redirect-backed surfaces are either tested or explicitly excluded with rationale

## Gate 3: Canonical Route Compliance
- in-app project links use workspace-scoped canonical routes
- in-app document links use workspace-scoped canonical routes
- legacy `/projects/...` routes are compatibility-only, not primary navigation
- `lib/projects/navigation.ts` remains the source of truth for project/document route generation

## Gate 4: Deep-Link Durability
- project `?tab=` deep links survive direct open and refresh
- signals `?id=` deep links survive direct open and refresh
- document links preserve project context on open and return
- browser back/forward does not drop users into inconsistent surfaces

## Gate 5: Hybrid Project Detail Regression Protection
- project detail still loads core data without breaking tabs
- signals, documents, prototypes, and commands still resolve after route work
- no new regressions are introduced in the hybrid Convex/legacy compatibility layer

## Gate 6: Blocked-Surface Policy
- `knowledgebase` and `personas` are explicitly categorized as:
  - validated and in scope
  - compatibility-only
  - deferred from release acceptance

## Gate 7: Browser Validation Signoff
- local browser validation pass is complete
- deployed browser validation pass is complete
- no visible crash overlays or console-level route failures on critical paths
- user journey remains coherent across:
  - workspace -> project
  - project -> document
  - inbox/signals/tasks -> project

## Decision
No UX phase should be treated as complete unless all relevant gates above are satisfied.

## Rationale
The product is simultaneously changing UX, routing, and data boundaries. Without explicit gates, it is too easy to mistake a visually improved surface for a trustworthy one.

## Concrete Next Actions
1. Use these gates as the checklist for `Slice 1`.
2. Add browser-validation evidence links or notes beside each gate as slices ship.
3. Expand the gates only when new first-class surfaces are added.
