# Global Chat — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c0f79b2c8ac81998b42c3e9126cac78
- Linear project: https://linear.app/askelephant/project/global-chat-45b141b480bc
- Phase: Build
- GTM plan: https://www.notion.so/2a0f79b2c8ac8001b540d6231d26d169

## Outstanding Tasks (Linear)
Linear project issues: 57 total (priority counts: P0=5, P2=13, P3=28, P4=11).
Top items:
- [ ] VAN-428: Dismissing global chat on /$chatId causes visual bug
  - https://linear.app/askelephant/issue/VAN-428/bug-dismissing-global-chat-on-dollarchatid-causes-visual-bug
- [ ] VAN-441: page context readded on chat submit
  - https://linear.app/askelephant/issue/VAN-441/possible-bug-page-context-readded-on-chat-submit
- [ ] ASK-4314: Navigation agent tool bug
  - https://linear.app/askelephant/issue/ASK-4314/navigation-agent-tool-bug
- [ ] ASK-4333: New chat creates untitled chat with no content
  - https://linear.app/askelephant/issue/ASK-4333/in-global-chat-when-clicking-on-new-chat-it-keeps-creating-untitled
- [ ] ASK-4493: Workflow builder chat bleeding into global chat
  - https://linear.app/askelephant/issue/ASK-4493/after-chatting-with-workflow-builder-chat-the-chat-also-shows-up-on

## MVP → Beta → GA Lifecycle
- MVP: Global sidebar + always-on internal search + page context
- Beta: Thread persistence + context indicators + error recovery
- GA: Replace on-page chat widgets + adoption metrics and rollout

## Next Work (Estimate)
- 3–5 weeks: address P0/P2 bugs and context reliability
- 2–3 weeks: UI polish + shortcut/UX improvements

## Design/UX Gaps and Proposed Flows
Need consistent invocation and context transparency.
- Global chat flow:
  1. User hits cmd+K from any page.
  2. Sidebar opens with visible context chips.
  3. User asks question; receipts show sources.
  4. Thread persists across navigation with updated context.
- Trust: show “context used” and allow removing context.
