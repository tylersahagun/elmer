# Elmer Swarm Dashboard

**As of:** 2026-03-07
**Primary tracker:** [Elmer Linear project](https://linear.app/askelephant/project/elmer-e42608f6079d/issues?layout=list&ordering=priority&grouping=workflowState&subGrouping=none&showCompletedIssues=all&showSubIssues=true)
**Release target:** `internal production alpha`

## Gate Status

| Gate | Status | Meaning |
| --- | --- | --- |
| Reliability | `Partial` | `GTM-94` and `GTM-96` are done, but `GTM-95`, `GTM-97`, and `GTM-98` still keep the gate from holding |
| Test baseline | `Not holding` | `GTM-78`, `GTM-82`, and `GTM-83` are in progress; `GTM-84` is still todo |
| Memory cutover | `Not holding` | `GTM-104` and `GTM-105` are new and unstarted |
| Convex migration | `Partial` | `GTM-59` is in progress, but `GTM-99` to `GTM-103` remain open |
| Runtime collaboration | `Partial` | blame-chain and presence foundations exist, but `GTM-55` and `GTM-58` are not ready to close |
| Chat / alpha UX | `Gated` | `GTM-107` can plan now; `GTM-71` to `GTM-77` should not become the active merge queue yet |

## Lane Status

| Lane | Status | Active issue set | Current blocker | Next action |
| --- | --- | --- | --- | --- |
| Source Of Truth | `Active` | `GTM-106` | control-plane drift and missing memory-cutover contract | refresh swarm/code/docs and publish the derived checkpoint |
| Reliability | `Ready` | `GTM-95`, `GTM-97`, `GTM-98` | auth gate still lacks trustworthy smoke checks and one authoritative runbook | finish `GTM-98`, then close docs/auth debt |
| Test Baseline | `Ready` | `GTM-78`, `GTM-82`, `GTM-83`, `GTM-84` | deterministic seeded E2E is still incomplete | merge POM foundations before expanding feature E2E |
| Memory Cutover | `Blocked` | `GTM-104`, `GTM-105` | no explicit canonical memory contract existed in repo docs | land the contract first, then remove fallbacks |
| Convex Migration | `Ready` | `GTM-59`, `GTM-99` to `GTM-103` | blocker work is explicit but still depends on memory authority clarity | work blockers in dependency order, not in parallel churn |
| Runtime Collaboration | `Ready` | `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70` | `GTM-55` is still a stub and should not jump ahead of core gates | finish `GTM-69` and `GTM-70`, keep `GTM-55` downstream |
| Internal Alpha UX | `Gated` | `GTM-107`, `GTM-71` to `GTM-77` | alpha rollout and Chat implementation are still gated on the four core release gates | keep `GTM-107` in planning and feedback-loop mode only |

## Blocker Map

- `GTM-98` blocks a trustworthy reliability gate
- `GTM-78` blocks the rest of the test-baseline merge queue because downstream E2E work needs the shared POM/test substrate
- `GTM-104` blocks clean resolution of `GTM-99`, `GTM-100`, `GTM-103`, and makes `GTM-55` premature
- `GTM-102` and `GTM-101` still sit in front of a clean settings migration
- `GTM-55` is blocked in practice by the four core alpha gates, even if not marked `blocked` in Linear
- `GTM-107` is planning-safe, but broader Chat implementation stays gated

## Recommended Merge Order

1. `tylersahagun/gtm-106-phase-6-swarm-reset-retarget-the-control-plane-swarm-around`
2. `tylersahagun/gtm-95-docs-update-clerk-convex-deployment-and-auth-setup-for-elmer`
3. `tylersahagun/gtm-98-reliability-add-authdomain-smoke-checks-for-elmerstudio`
4. `tylersahagun/gtm-97-refactor-remove-stale-nextauthauthjs-migration-debt-from`
5. `tylersahagun/gtm-78-gtm-e2e-page-object-model-pom-base-classes-for-all-major`
6. `tylersahagun/gtm-82-gtm-e2e-workspace-navigation-e2e-login-workspace-all-route`
7. `tylersahagun/gtm-83-gtm-e2e-signal-inbox-e2e-tests-webhook-classify-inbox-review`
8. `tylersahagun/gtm-84-gtm-e2e-agent-execution-e2e-start-agent-logs-hitl-question`
9. `tylersahagun/gtm-104-phase-7-memory-canonicalization-convex-graph-backed-memory`
10. `tylersahagun/gtm-105-phase-7-cutover-remove-legacy-filedatabase-fallbacks-from`
11. `tylersahagun/gtm-102-phase-7-migration-blocker-workspace-membership-invitation`
12. `tylersahagun/gtm-101-phase-7-migration-blocker-connected-account-github`
13. `tylersahagun/gtm-99-phase-7-migration-blocker-personas-knowledgebase-data-model`
14. `tylersahagun/gtm-100-phase-7-migration-blocker-convex-search-strategy-for`
15. `tylersahagun/gtm-103-phase-7-migration-blocker-project-detail-page-parity-for`
16. `tylersahagun/gtm-69-phase-6-agent-blame-thread-attribute-every-agent-run-to-the`
17. `tylersahagun/gtm-70-phase-6-live-presence-show-who-is-actively-viewing-which`
18. `tylersahagun/gtm-55-phase-6-orchestrator-agent-every-2-hour-health-checks`
19. `tylersahagun/gtm-58-phase-6-team-access-clerk-domain-restriction-role-based`
20. `tylersahagun/gtm-107-alpha-internal-alpha-instrumentation-and-feedback-loop`

## Update Rule

When this dashboard changes:

1. update Linear first if issue truth changed
2. then refresh this dashboard
3. then update any affected derived docs
