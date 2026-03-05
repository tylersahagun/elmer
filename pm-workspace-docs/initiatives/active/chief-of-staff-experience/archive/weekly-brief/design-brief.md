# Design Brief - Weekly Brief

Date: 2026-02-17

## Design intent

Deliver a weekly operating review that connects trend movement to explicit carry-forward commitments and owners.

## Information architecture

1. Week-in-review headline
2. Trend deltas by pillar (wins, risks, blockers)
3. Priority carry-forward commitments
4. Confidence and evidence context
5. Next-week plan and owner assignments

## Primary flow

1. User opens Weekly Brief at week close
2. System presents trend changes and unresolved critical items
3. User confirms carry-forward actions and owners
4. Commitments roll into next week and feed completion tracking

## Key screens and states

- Weekly summary surface
- Trend breakdown view
- Carry-forward editor
- Loading state
- Empty state (no significant movement)
- Error/recovery state for missing sources

## Trust and approval behavior

- Display source provenance for key trend claims
- Require confirmation before publishing carry-forward set
- Keep an immutable weekly snapshot for historical review

## Interaction rules

- Weekly snapshots should not drift after publish
- Carry-forward actions must have owner and due horizon
- Highlight high-risk items first with rationale
- Allow quick drill-down into supporting evidence

## Non-goals

- Replacing all planning workflows
- Narrative-only summaries without actionability
- Hidden auto-assignment of commitments
