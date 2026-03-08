# Elmer Deterministic Gate Validation - 2026-03-07

Updated at: 2026-03-07 22:38 MST

## Baseline

Implementation baseline: `codex/elmer-alpha-integration`

This pass only filled the remaining release-gate delta on top of the merged baseline:

- deeper project-detail task/editor coverage
- preview/prod smoke automation
- MCP tool tests
- isolated Convex backend tests for the seeded HITL path
- retained the local seeded inbox/smoke improvements already reconciled on this branch

## Completed slices

### GTM-79

- Reused the merged authenticated `storageState` setup in `orchestrator/e2e/auth.setup.ts`
- Kept the setup-project dependency in Playwright config as the only auth baseline
- Captured real runtime proof that the gate is still blocked here by missing `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`

### GTM-80

- Extended `.github/workflows/elmer-smoke.yml` to support reusable `workflow_call` execution and suite selection
- Added `.github/workflows/elmer-preview-gate.yml` to run the deterministic Chromium gate against preview deployment URLs

### GTM-81

- Added an E2E-only Convex document seed route so project-detail editor coverage uses the live Convex surface
- Extended `project-task.spec.ts` with:
  - project-detail task create/complete/remove
  - project-detail document edit/save/reload persistence
- Added stable test hooks in the existing surfaces instead of new POM structure:
  - `ProjectTasksPanel`
  - `DocumentViewer`
  - `RichTextEditor`

### GTM-83

- Kept the seeded inbox navigation delta:
  - seeded high-impact TL;DR assertion
  - seeded impact badge assertion
  - seeded direction-change signal -> linked project detail navigation

### GTM-84

- Added isolated Convex tests for the deterministic stub run/resume path
- Fixed the backend path to use internal job/agent-definition access inside `convex/agents.ts`
- Fixed the missing `agentExecutions` schema fields used by the HITL pause/resume path

### GTM-87

- Added `mcp-server` Vitest coverage against the existing Convex client seam
- Covered the core project, signal, agent, job, and knowledge tool contracts without changing server structure

### GTM-88

- Added Convex isolated backend tests with `convex-test` for:
  - stub HITL run -> waiting input -> answered -> completed
  - seeded cleanup of tagged documents/tasks/jobs/projects

### GTM-91

- Added `.github/workflows/elmer-prod-smoke.yml` to run Chromium smoke checks automatically after production deployment success

## Commands run

Passed:

```bash
cd orchestrator
npm run test:run -- src/__tests__/convex/http-utils.test.ts src/__tests__/convex/e2e-helpers.test.ts src/__tests__/convex/agents-stub.test.ts
npx tsc --noEmit

cd ../mcp-server
npm run test:run -- src/tools/__tests__/tools.test.ts
npm run typecheck

cd ..
git diff --check
```

Failed with concrete runtime blocker:

```bash
cd orchestrator
npm run check:auth
npm run test:e2e:gate -- --project=chromium
```

## Runtime blocker evidence

`npm run check:auth` failed because this shell still lacks:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `AUTH_URL` or `NEXTAUTH_URL`
- `NEXT_PUBLIC_CONVEX_URL`

`npm run test:e2e:gate -- --project=chromium` failed in the setup project before any seeded spec ran:

- failing file: `orchestrator/e2e/auth.setup.ts`
- failure: `E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.local`
- result: 1 setup failure, 23 gate tests not executed

## Workflow result

The repo now has three distinct CI layers:

- `elmer-smoke.yml`
  - local PR smoke by default
  - reusable workflow for deployed execution
  - suite selector: `smoke` or `gate`
- `elmer-preview-gate.yml`
  - auto-runs the deterministic gate against preview deployment URLs
- `elmer-prod-smoke.yml`
  - auto-runs lightweight production smoke after successful production deploys

## Remaining flaky surface

The remaining non-deterministic surface is environmental, not structural:

- authenticated Playwright execution still depends on missing Clerk/Convex env in this shell
- the real gate has not passed locally because setup auth never completes

## GTM-84 note

`GTM-84` should remain on the current deterministic acceptance path for now:

- seeded approval on project detail
- deterministic job completion
- deterministic trace/log rendering

If the live integrated run later shows drift in the hub/history/error-state acceptance, that should be split into a follow-up issue rather than folded back into this deterministic lane.
