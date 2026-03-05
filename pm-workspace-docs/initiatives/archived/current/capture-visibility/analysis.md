# Capture Visibility — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c0f79b2c8ac81308c5bcd3d92f395ee
- Linear project: https://linear.app/askelephant/project/capture-visibility-00a6bc61fd60
- Phase: Done - Full Release
- GTM plan: https://www.notion.so/2c5f79b2c8ac80f181e5ebfb78407204

## Outstanding Tasks (Linear)
Linear project issues: 3 total (priority counts: P0=3).
Top items:
- [ ] ASK-4277: Improve engagement state domain
  - https://linear.app/askelephant/issue/ASK-4277/improve-engagement-state-domain
- [ ] ASK-4232: Add recording state badge on engagement page
  - https://linear.app/askelephant/issue/ASK-4232/add-recording-state-badge-on-engagement-page
- [ ] ASK-4231: Allow users to reprocess transcripts
  - https://linear.app/askelephant/issue/ASK-4231/allow-users-to-reprocess-transcripts

## MVP → Beta → GA Lifecycle
- MVP: Unified capture state machine + timeline visibility
- Beta: Deep visibility UI + structured failure reasons + audit logs
- GA: Full platform parity (desktop/mobile/web) + stable API for future rescue

## Next Work (Estimate)
- 1–2 weeks: address 3 open issues + regression QA
- 1 week: docs + GTM enablement updates

## Design/UX Gaps and Proposed Flows
Customer-facing visibility needs “why” and “what happened” receipts.
- Capture timeline flow:
  1. User opens a meeting record.
  2. Timeline shows state transitions and timestamps.
  3. Failure state includes reason and recommended recovery.
  4. “What happened?” panel links to evidence and logs.
- Trust: show explicit source of state (bot/desktop/mobile) and confidence.
