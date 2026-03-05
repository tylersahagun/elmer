# Global Chat

## Overview

Global Chat is AskElephant's AI-first chat experience that stays available across the app to answer questions about your
meetings, customers, and workflows. It can use the context of the page you're on and (when enabled) Internal Search to
pull relevant workspace data.

## Who it's for

- Sales reps prepping for calls or digging into account history
- Sales leaders coaching across multiple reps and accounts
- CSMs and RevOps auditing customer conversations and risk signals
- Anyone who needs a fast, conversational way to query meeting history

## Where to find it

### Web

- Keyboard shortcut: Cmd/Ctrl + K (new experience) or Cmd/Ctrl + L (legacy)
- Top navigation `Chat` button (when enabled for the workspace)
- Appears as a right-side panel; layout varies by feature flag (`Global Chat Layout`)

### Mobile

- Home screen footer: "Ask anything about your meetings"
- Global Chat screen with a right-side drawer for recent chats

## How it works

1. Open Global Chat from anywhere (button or shortcut).
2. Ask a question in natural language.
3. Global Chat uses your current page context when available (meeting, company, contact).
4. If Internal Search is enabled, it fetches relevant meeting history and signals.
5. Results stream in. Continue the thread or start a new chat.

### What to expect on web

- Recent chats list and a "new chat" action in the header.
- When `Global Chat Layout` is enabled, chat stays open across navigation in a resizable right-side column.
- When the layout flag is off, chat opens as an overlay and closes on navigation.

### What to expect on mobile

- New chat button and drawer menu for recent chats.
- Prompt library: type `/` to browse prompts.
- Entity mentions: type `@` to attach company/contact/meeting context.
- Optional image attachments from camera or photos.
- Message actions: copy, share, and listen.

## Common questions & answers

**Q: Is Global Chat the same as Internal Search?**  
A: Global Chat is the interface. Internal Search is a tool it can use to look across meetings, contacts, and signals.
If Internal Search isn’t enabled, Global Chat still answers from the chat context but won’t pull deeper workspace history.

**Q: Why do I get better answers on some pages?**  
A: Global Chat automatically uses page context (meeting/company/contact) when it’s available, which makes answers more
specific.

**Q: Can I open a new chat quickly?**  
A: Yes. Use the “new chat” icon in the header on web/mobile, or press Cmd/Ctrl + K (or + L in the legacy shortcut mode).

**Q: Does it work on mobile?**  
A: Yes. Mobile Global Chat is available when the `mobile-global-chat-enabled` flag is on.

## Troubleshooting

- **I don’t see the Chat button:** Your workspace may not have `global-chat-enabled` turned on yet, or you’re not in a
  workspace view.
- **The shortcut doesn’t open chat:** Check whether your workspace uses Cmd/Ctrl + K (new experience) or Cmd/Ctrl + L
  (legacy).
- **Chat closes when I navigate:** Expected when `global-chat-column-layout` is off. Turn on `Global Chat Layout` for a
  persistent right‑side panel.
- **Answers are generic:** Open chat from the most relevant page (company/meeting/contact) and ensure Internal Search is
  enabled if your workspace supports it.
- **Mobile chat won’t load:** Confirm `mobile-global-chat-enabled` is on and that you have network connectivity.

## Release notes snapshot

- Mobile Global Chat shipped (GA) with mentions, prompt library commands, and chat actions.
- Flag: `mobile-global-chat-enabled` set to 100%.

## Known limitations

- Beta experience: some UX and context reliability work is still in progress.
- Availability depends on feature flags (`global-chat-enabled`, `global-chat-exp-v2`, `global-chat-column-layout`,
  `mobile-global-chat-enabled`).
- Internal Search requires recorded meetings and the tool to be enabled in your workspace.

## Internal references

- Initiative: `pm-workspace-docs/initiatives/current/global-chat/analysis.md`
- Initiative mapping: `pm-workspace-docs/initiatives/internal-search/_meta.json`
- Internal Search guide: `pm-workspace-docs/initiatives/internal-search/help-center-internal-search.md`
- Release note: `pm-workspace-docs/status/activity/digest/digest-2026-01-29.md`
- Web code: `elephant-ai/web/src/components/chat/global-chat.tsx`,
  `elephant-ai/web/src/routes/_layout.tsx`,
  `elephant-ai/web/src/contexts/global-chat-context.tsx`,
  `elephant-ai/web/src/components/navigation/top-nav-actions.tsx`,
  `elephant-ai/web/src/components/global-chat-banner.tsx`,
  `elephant-ai/web/src/components/chat/chat-message-composer.tsx`
- Mobile code: `elephant-ai/apps/mobile/app/(protected)/global-chat/index.tsx`,
  `elephant-ai/apps/mobile/app/(protected)/global-chat/_layout.tsx`,
  `elephant-ai/apps/mobile/components/chat/GlobalChatDrawerContent.tsx`,
  `elephant-ai/apps/mobile/components/chat/GlobalChatInput.tsx`,
  `elephant-ai/apps/mobile/app/(protected)/index.tsx`
- Screenshot evidence: `assets/image-7b633b0e-a167-47dc-bd42-5c4dccb4bdb4.png`
