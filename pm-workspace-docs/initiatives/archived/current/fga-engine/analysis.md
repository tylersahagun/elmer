# FGA Engine — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c5f79b2c8ac807a8a11d430594431ff
- Linear project: https://linear.app/askelephant/project/fga-engine-071b1bfd3808/overview
- Phase: Build

## Outstanding Tasks (Linear)
Linear project issues: 7 total (priority counts: P0=7).
Top items:
- [ ] ASK-4460: Implement FGA for engagements
  - https://linear.app/askelephant/issue/ASK-4460/implement-fga-for-engagements
- [ ] ASK-4361: Create auth page
  - https://linear.app/askelephant/issue/ASK-4361/create-auth-page
- [ ] ASK-4320: Add query builder service
  - https://linear.app/askelephant/issue/ASK-4320/add-query-builder-service
- [ ] ASK-4318: Add authz table migrations
  - https://linear.app/askelephant/issue/ASK-4318/add-authz-table-migrations
- [ ] ASK-4317: Add extensive test cases
  - https://linear.app/askelephant/issue/ASK-4317/add-extensive-test-cases

## MVP → Beta → GA Lifecycle
- MVP: Centralized auth entry point + audit logging + Xerox baseline policies
- Beta: Tenant policy UI + role defaults + performance benchmarks
- GA: Full policy engine rollout + migration complete + enterprise readiness

## Next Work (Estimate)
- 2–3 weeks: policy model + userCan integration
- 3–5 weeks: UI + migration testing + enterprise sign-off

## Design/UX Gaps and Proposed Flows
Admin-facing UI needs transparency and safe defaults.
- Policy management flow:
  1. Admin opens Privacy/Access Settings.
  2. Policies listed with explainable “who/what/why.”
  3. Admin edits a policy with preview of impact.
  4. Changes logged with audit trail and rollback option.
- Trust: highlight scope, affected teams, and evidence for access decisions.
