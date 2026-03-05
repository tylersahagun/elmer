# New Chat Sidebar Parity Delta Report

- Initiative: `global-chat`
- Date: 2026-02-07
- Figma: https://www.figma.com/design/EgEsOKl70B0iULW29ZrjJj/New-Chat--side-bar-?node-id=604-11532&p=f&t=9GR7nJj6LLCS00hz-0
- Node: `604:11532`

## Implemented Output

- Component: `elephant-ai/apps/web/src/components/chat/new-chat-sidebar/new-chat-sidebar.tsx`
- Types: `elephant-ai/apps/web/src/components/chat/new-chat-sidebar/types.ts`
- Stories: `elephant-ai/apps/web/src/components/chat/new-chat-sidebar/new-chat-sidebar.stories.tsx`
- Export: `elephant-ai/apps/web/src/components/chat/new-chat-sidebar/index.ts`
- Figma spec artifact: `pm-workspace-docs/initiatives/active/global-chat/figma-spec-new-chat-sidebar.json`

## Matched Structure

- Sidebar container with header and `New chat` CTA.
- Search input at top of content area.
- Sectioned chat list split into:
  - Private chats
  - Public workflows
- Chat rows with:
  - icon,
  - title + preview text,
  - metadata (timestamp and unread badge),
  - selected row styling.
- System states covered in Storybook:
  - Default
  - Loading
  - Empty
  - Error
  - Mobile-width layout

## Delta Summary

1. Exact spacing and typography values from Figma were approximated using current app tokens/classes.
2. Exact iconography and micro-interactions from Figma (if any) were mapped to existing `lucide-react` + app patterns.
3. Complex section behaviors (drag/reorder, pinned groups, custom transitions) were not inferred without node-level MCP output.
4. Figma-specific colors/effects were normalized to existing Elephant UI token usage for consistency.

## Recommended Next Pass for Pixel Fidelity

1. Run Figma MCP extraction for this node:
   - `get_metadata`
   - `get_design_context`
   - `get_variable_defs`
   - `get_screenshot`
2. Compare extracted token values (spacing, radius, typography) against the current scaffold.
3. Apply exact value deltas where design intent differs from existing UI tokens.
4. Update this report with measured before/after diffs.
