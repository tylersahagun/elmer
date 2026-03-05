# Design Review: Chief Of Staff Recap Hub

**Date:** 2026-02-01  
**Reviewer:** PM Copilot (design-companion)

## Summary

The design brief and prototype notes align well with trust-first, artifact‑first goals and include required AI states. Key gaps are clarity on meeting‑page artifact visuals, consistency of “undo” across approvals, and accessibility details for dynamic content.

## Trust & Transparency Check

- **User understands AI before it acts:** Partial. Brief mentions approval-by-exception, but UI messaging for auto‑run vs approval needs explicit wording on cards.
- **Evidence for AI decisions:** Present (source links, rationale, audit trail).
- **Undo / recovery:** Mentioned in brief (30s undo) but not confirmed in prototype notes.
- **Low confidence:** Explicit banner + low confidence recap state in prototype notes.
- **Failure handling:** Error state defined; needs concrete recovery copy in recap panel.

## State Coverage

**Required states are listed** (Loading, Success, Error, Low Confidence, Empty).  
**Open gap:** Ensure the recap artifact states and approval drawer states are visually distinct and documented as screenshots for stakeholder review.

## Accessibility & Readability

- **Keyboard navigation / focus:** Mentioned in brief; not validated in prototype notes.
- **aria-live for dynamic content:** Not documented.
- **Color-only signals:** Brief says non-color indicators, but card-level risk icons need confirmation.
- **Reading level:** Copy is concise but lacks explicit reading-level guidance for error/low confidence states.

## Visual Readiness for Deck

- **Daily hub layout:** Clear and deck-ready.
- **Meeting page recap artifacts:** Described in brief but not explicitly confirmed in prototype notes; verify actual screens exist.
- **Weekly reporting view:** Mentioned in brief but not confirmed in prototype notes; verify in prototype/storybook.

## Recommendations (Priority Order)

1. **Confirm meeting‑page artifact visuals** (Recap/Prep/Coaching tabs) are present in prototype; capture screenshots for board update.
2. **Add explicit copy** on action cards for auto‑run vs approval required (trust framing).
3. **Document undo behavior** in prototype notes (where available and how it appears).
4. **Add accessibility notes** for dynamic content (`aria-live`) and focus order in approval drawer.
5. **Include weekly reporting** visual or mark as “next iteration” in the deck.

## Decision‑Ready Questions

- Which artifacts live on the meeting page vs daily/weekly hub by default?
- Do we show approval reasons inline or only in the detail drawer?
- Is low‑confidence displayed on every recap or only when thresholds trip?
