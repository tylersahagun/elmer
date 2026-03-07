# Slice 01: Route Trust And Canonical Navigation

## Objective
Restore confidence in Elmer navigation by making workspace-scoped project/document routes canonical and durable.

## Audience
Engineering agents or developers executing the first UX implementation slice.

## Evidence Basis
- `pm-workspace-docs/status/ux-sequenced-execution-plan.md`
- `pm-workspace-docs/status/ux-release-gates.md`
- `pm-workspace-docs/status/ux-validation-checklist.md`

## Scope
- eliminate current route trust regressions and normalize canonical route behavior
- standardize project and document routing through `lib/projects/navigation.ts`
- reduce remaining hardcoded legacy `/projects/...` callers
- add route and deep-link regression coverage

## In Scope
- canonical workspace-scoped project routes
- canonical workspace-scoped document routes
- deep-link durability for project tabs and signal IDs
- compatibility behavior for legacy `/projects/...`
- caller normalization where it is straightforward and high leverage

## Out Of Scope
- full project cockpit IA redesign
- active work / approvals surface
- signal review redesign
- personas / knowledgebase migration decisions

## Key Files
- `orchestrator/src/lib/projects/navigation.ts`
- `orchestrator/src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/page.tsx`
- `orchestrator/src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/documents/[docId]/page.tsx`
- remaining route callers across:
  - `ProjectDetailModal.tsx`
  - `InboxPageClient.tsx`
  - `MyTasksPage.tsx`
  - `TeamTasksPage.tsx`
  - `SignalRow.tsx`
  - `StandaloneDocumentPage.tsx`
- route and helper tests

## Success Criteria
- all in-app project/document links use canonical workspace-scoped routes where workspace context exists
- project/document links survive refresh and browser back/forward
- project `?tab=` deep links work reliably
- signals `?id=` deep links work reliably
- no visible crash or route mismatch on critical navigation paths

## Risks
- some surfaces still lack direct workspace context
- legacy compatibility routes may still be needed temporarily
- project detail remains a hybrid layer and may surface unrelated issues during testing

## Mitigations
- use helper functions everywhere possible
- treat legacy routes as compatibility-only
- add targeted tests before widening the slice

## Validation
- run targeted route/helper tests
- run smoke coverage for project/document routes
- perform local and deployed browser checks for canonical route flows

## Concrete Next Actions
1. Audit remaining hardcoded project/document route callers.
2. Normalize all easy callers to `lib/projects/navigation.ts`.
3. Decide whether legacy `/projects/...` pages should redirect or remain compatibility-only for now.
4. Expand route and deep-link regression coverage.
