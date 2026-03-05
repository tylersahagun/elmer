# Privacy Determination Agent (v2) — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c0f79b2c8ac81938868ce8ce8a79d4c
- Linear project: https://linear.app/askelephant/project/privacy-determination-agent-eb13c790b4bb
- Phase: Build
- GTM plan: https://www.notion.so/2c5f79b2c8ac800eba11f87366c505b9

## Outstanding Tasks (Linear)
Linear project issues: 18 total (priority counts: P0=18).
Top items:
- [ ] ASK-4489: Fix test privacy agent GraphQL
  - https://linear.app/askelephant/issue/ASK-4489/fix-test-privacy-agent-graphql
- [ ] ASK-4486: Refactor privacy toggle button
  - https://linear.app/askelephant/issue/ASK-4486/refactor-privacy-toggle-button
- [ ] ASK-4414: Pull privacy agent out of configurable agent paradigm
  - https://linear.app/askelephant/issue/ASK-4414/pull-privacy-agent-out-of-configurable-agent-paradigm
- [ ] ASK-4411: Privacy simulation modal
  - https://linear.app/askelephant/issue/ASK-4411/privacy-simulation-modal
- [ ] ASK-4409: Add direct edit UI
  - https://linear.app/askelephant/issue/ASK-4409/add-direct-edit-ui

## MVP → Beta → GA Lifecycle
- MVP: Auto-detect privacy-sensitive meetings + audit log
- Beta: Rule management UI + user-level overrides
- GA: Simulation workflow + exception handling and analytics

## Next Work (Estimate)
- 1–2 weeks: build audit log UI and rule editor
- 2–4 weeks: QA + rollout with GTM plan completion

## Design/UX Gaps and Proposed Flows
High trust surface; must show receipts and allow overrides.
- Privacy decision flow:
  1. Meeting transcript completes.
  2. Agent marks meeting private with reason.
  3. User sees “why” with highlighted snippets.
  4. User can accept, override, or refine rule.
- Trust: show confidence, evidence snippets, and audit trail.
