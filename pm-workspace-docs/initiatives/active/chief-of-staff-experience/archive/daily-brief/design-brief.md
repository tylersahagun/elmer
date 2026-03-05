# Design Brief - Daily Brief

Date: 2026-02-17

## Design intent

Create a daily operating artifact that feels like a concise revenue newspaper: what changed, what matters now, and what to do next.

## Information architecture

1. Headline summary (day status)
2. Critical deltas since last check
3. Priority action cards
4. Meeting + CRM + comms context blocks
5. Carry-forward and deferred items

## Primary flow

1. User opens Daily Brief (morning or end-of-day mode)
2. System highlights top deltas and recommended actions
3. User approves, edits, snoozes, or schedules directly
4. Completed actions and unresolved items feed next day continuity

## Key screens and states

- Default brief view
- Expanded evidence drawer per action
- Empty state (no critical updates)
- Loading state (signal aggregation in progress)
- Error state (source unavailable with retry path)
- Historical view (previous days)

## Trust and approval behavior

- Show confidence and source evidence for each recommendation
- Require explicit approval for high-impact actions
- Provide clear undo and audit visibility for executed actions

## Interaction rules

- No hidden auto-send actions
- Preserve user edits across refreshes
- Keep action ordering stable unless priority materially changes
- Surface why an item appeared ("because..." rationale)

## Non-goals

- Full BI dashboard replacement
- Meeting-only recap product
- Autonomous execution without visible controls
