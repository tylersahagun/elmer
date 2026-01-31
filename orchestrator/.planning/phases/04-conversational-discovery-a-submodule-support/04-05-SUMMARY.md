---
phase: 04-conversational-discovery-a-submodule-support
plan: 05
subsystem: conversational-ui
tags: [react, components, framer-motion, zustand, chat-ui]

dependency-graph:
  requires: [04-01, 04-03]
  provides: [conversation-panel, question-card]
  affects: [04-07]

tech-stack:
  added: []
  patterns:
    - chat-like-message-history
    - question-option-selection
    - store-integration-pattern
    - auto-scroll-messages

key-files:
  created:
    - src/components/discovery/QuestionCard.tsx
    - src/components/discovery/ConversationPanel.tsx
  modified:
    - src/components/discovery/index.ts

decisions:
  - question-card-motion: "Staggered animation for options (50ms delay each)"
  - avatar-differentiation: "Bot=teal gradient, User=purple gradient for visual distinction"
  - scroll-area-integration: "Use Radix ScrollArea with data attribute selector for auto-scroll"
  - disabled-question-opacity: "50% opacity for disabled (already answered) questions"

metrics:
  duration: "2m 17s"
  completed: "2026-01-27"
---

# Phase 4 Plan 5: Conversation UI Components Summary

Chat-like interface for conversational discovery using QuestionCard for options display and ConversationPanel for message history.

## What Was Done

### Task 1: QuestionCard Component
Created component displaying a question with selectable options:
- Question text with HelpCircle icon
- Motion-animated option buttons (staggered 50ms)
- Selected state: purple border, checkmark icon
- Recommended badge on suggested options
- Disabled state for answered questions (50% opacity)

### Task 2: ConversationPanel Component
Created main conversation panel with Q&A history:
- Header with MessageSquare icon and status text
- Message list with AnimatePresence for smooth transitions
- Bot avatar (teal gradient) for system/question/info messages
- User avatar (purple gradient) for answer messages
- Auto-scroll to bottom on new messages
- Revision button on previous answers (when canRevise=true)
- Progress footer showing "Question X of Y"

### Task 3: Barrel File Exports
Added exports to discovery components index:
- QuestionCard
- ConversationPanel

## Key Implementation Details

**Store Integration:**
- useConversationStore: messages, currentAmbiguityId, isWaitingForAnswer, isComplete
- useDiscoveryStore: result, ambiguities, resolveAmbiguity, applyAmbiguityResolutions

**Conversation Flow:**
1. Component detects ambiguities from discovery result
2. Starts conversation with system message
3. Asks first question (sets currentAmbiguityId)
4. User selects option -> answerQuestion + resolveAmbiguity
5. Next question asked after 300ms delay
6. When all answered: applyAmbiguityResolutions + markComplete + onComplete callback

**Message Types:**
- `system`: Initial greeting and completion messages (Bot avatar)
- `question`: Displays QuestionCard with options (Bot avatar)
- `answer`: User's selection (User avatar, right-aligned)
- `info`: Revision notification (Bot avatar)

## Files Changed

| File | Change |
|------|--------|
| `src/components/discovery/QuestionCard.tsx` | Created - option selection component |
| `src/components/discovery/ConversationPanel.tsx` | Created - chat-like conversation UI |
| `src/components/discovery/index.ts` | Modified - added exports |

## Commits

| Hash | Description |
|------|-------------|
| bc63fb4 | feat(04-05): create QuestionCard component |
| 7f7e811 | feat(04-05): create ConversationPanel component |
| c63a7c5 | feat(04-05): export conversation components from barrel file |

## Verification Results

- TypeScript compiles: Components pass type checking
- QuestionCard: Renders options with selection/recommended states
- ConversationPanel: Shows message history with Q&A flow
- Barrel exports: Both components importable from @/components/discovery

## Deviations from Plan

None - plan executed exactly as written.

## Dependencies Validated

- 04-01 (Ambiguity Types): Uses DiscoveryAmbiguity, AmbiguityOption types
- 04-03 (Conversation Store): Integrates with useConversationStore for message management
- Discovery store: Uses setAmbiguities, resolveAmbiguity, applyAmbiguityResolutions

## Next Steps

- 04-07: Integrate ConversationPanel into DiscoveryStep for wizard flow
