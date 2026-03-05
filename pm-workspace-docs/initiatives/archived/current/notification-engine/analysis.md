# Notification Engine — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c0f79b2c8ac8166921aee14de6a33ab
- Linear project: https://linear.app/askelephant/project/notification-engine-f722df86bf9b
- Phase: Test

## Outstanding Tasks (Linear)
Linear project issues: 12 total (priority counts: P0=12).
Top items:
- [ ] ASK-4191: Integration testing
  - https://linear.app/askelephant/issue/ASK-4191/integration-testing
- [ ] ASK-4192: Bug fixes + polish
  - https://linear.app/askelephant/issue/ASK-4192/bug-fixes-polish
- [ ] ASK-4193: Documentation + handoff
  - https://linear.app/askelephant/issue/ASK-4193/documentation-handoff
- [ ] ASK-4189: Desktop integration
  - https://linear.app/askelephant/issue/ASK-4189/desktop-integration
- [ ] ASK-4188: Web push registration
  - https://linear.app/askelephant/issue/ASK-4188/web-push-registration

## MVP → Beta → GA Lifecycle
- MVP: Core notification model + single-channel delivery + basic actions
- Beta: Multi-platform routing + action confirmations + lifecycle tracking
- GA: Reliability SLAs + cross-device continuity + analytics dashboards

## Next Work (Estimate)
- 3–4 weeks: complete push channels + integration testing
- 1–2 weeks: polish + docs + handoff

## Design/UX Gaps and Proposed Flows
Need consistent, trustable micro-interactions for actionable notifications.
- Actionable notification flow:
  1. Event triggers notification with clear reason.
  2. User sees primary action + secondary dismiss.
  3. Confirmation state shows “done” with evidence.
  4. Audit trail logs action and outcome.
- Trust: show “why you’re seeing this” and channel choice rationale.
