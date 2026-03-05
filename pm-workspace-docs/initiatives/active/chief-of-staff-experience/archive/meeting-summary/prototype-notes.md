# Meeting Summary — Prototype Notes

**Initiative:** Meeting Summary (Chief of Staff Experience)  
**Last Updated:** 2026-02-18

---

## Overview

Prototypes are built as Storybook components in `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/`.

| Version | Path | Key Changes |
| --- | --- | --- |
| v1 | `v1/` | Initial prototype: template picker, editable sections, AI rewrite, evidence links |
| v2 | `v2/` | Iteration from Skylar + Palmer feedback: action items actionable, TLDR, full-screen, edit-in-chat |
| v3 | `v3/` | Stateful workspace: section reorder controls, template builder, blank template workflow |
| v4 | `v4/` | "Perfect artifact": removed all section management, added length control, chat-as-configuration, rich content |

---

## Iteration: v1 → v2 (2026-02-18)

### Signals Consumed

- **Skylar Sanford (Design Lead)** — 4-minute v1 walkthrough (2026-02-18)
- **Palmer Turley (Engineering Lead)** — 25-minute v1 walkthrough + strategic discussion (2026-02-18)
- **Synthesis:** `research.md` v2 Priority Stack

### Key Changes Made

| Priority | Change | Implementation |
| --- | --- | --- |
| 1. Make action items actionable | Checkboxes + automation badges | `ActionItemRow` with checkbox, `autoExecute` badge ("AskElephant will: Push to HubSpot") |
| 2. Full-screen artifact feel | Reduce chrome, expand layout | `min-h-[85vh]`, borderless container, reduced header padding |
| 3. Structured sections as data objects | Action items as structured list | `actionItems` array on section; each item has `completed`, `assignee`, `autoExecute` |
| 4. Dynamic template inference | Auto-detect meeting type | `templateInferred` prop; "Auto-detected" badge when true |
| 5. Opinionated defaults | Zero config | Template picker still available; inferred by default |
| 6. Escape the summary | Action items → tasks, deal | "Add to deal" affordance on action items; `onAddToDeal` callback |
| 7. Chat-based edit with section context | Edit opens chat slide-out | "Edit in chat" button; `onEditInChat(sectionId, templateRef)` |
| 8. Surface existing description field | TLDR at top | `meeting.tldr` surfaced in header when present |
| 9. Warm up visual hierarchy | Headers-first, less flat | Section titles `text-base font-semibold`; borderless sections with `hr` dividers |

### Rationale for Decisions

- **Section-per-card → borderless sections:** Skylar found cards "feel heavy." Switched to `hr` dividers between sections. Maintains structure without visual weight.
- **Edit in chat vs inline:** Both Skylar and Palmer preferred chat-based edit with pre-seeded context. v2 adds "Edit in chat" button; actual slide-out integration is placeholder for implementation.
- **Action items as structured data:** Palmer's insight that sections should be first-class objects. v2 models action items as `ActionItem[]` with `id`, `text`, `assignee`, `completed`, `autoExecute` — ready for persistence.
- **TLDR from existing field:** Palmer confirmed `description` is extracted and stored but unused. v2 surfaces `tldr` at top when present; zero backend cost.

### Files Created

- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v2/types.ts`
- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v2/mock-data.ts`
- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v2/MeetingSummaryV2.tsx`
- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v2/MeetingSummaryV2.stories.tsx`

### Open Questions for v3

- Configuration scoping (workspace → team → personal) — Palmer's Critical; needs eng spec update
- Multi-viewer summary conflict — each user sees own template; needs architecture decision
- Actual chat slide-out integration — placeholder in v2; wire to Global Chat
- Workflow analysis for template defaults — query active summary workflows to inform curated set

---

## Iteration: v3 → v4 (2026-02-18)

### Signals Consumed

- **Tyler Sahagun (PM/Owner)** — Walkthrough of v3 prototype (2026-02-18)
- **Previous iterations:** Skylar Sanford (Design), Palmer Turley (Engineering) feedback from v1→v2
- **Competitive landscape:** Fathom artifact-first approach, Gong AI Briefer

### Key Feedback (Tyler on v3)

> "It feels like a regression. Having the up and down button and the floating toggle doesn't actually work to move it. It just doesn't look good."

> "It should still read as if it was just this perfect artifact."

> "The idea of having these sections is actually just making it a little bit more complicated."

> "It is a clear this is one cohesive document: key takeaways, risks and objections, action items, next steps."

> "Maybe there should even be a length suggestion of, like, do you want long, medium, or short sections."

### Core Problem Identified

v3 prioritized configurability over readability. The template builder, section reorder controls, and blank-template workflows turned the summary from an artifact into a workshop. Users don't want to build their summary — they want to read it.

### Key Changes Made

| Priority | Change | Implementation |
| --- | --- | --- |
| 1. One cohesive document | Remove all section management UI | No ArrowUp/Down, no GripVertical, no Template Builder sidebar, no section remove buttons |
| 2. Rich, polished artifact | Substantial realistic mock data | Acme Corp Q4 Pipeline Review with 5 takeaways (with evidence), 3 risks (with severity), 6 action items (with automation badges), 4 next steps |
| 3. Length control | Short / Medium / Detailed toggle | Segmented control in header; content adapts per length — takeaways and risks show different amounts/detail |
| 4. Chat-as-configuration | Floating chat button → slide-out | Document-level chat for "make action items more detailed", "move risks before takeaways", suggestion chips |
| 5. Subtle hover affordances | Per-section AI rewrite / edit / verify | Ghost buttons fade in via `opacity-0 group-hover:opacity-100` — invisible until needed |
| 6. Automation visibility | "AskElephant will:" badges | Indigo badges on action items showing what the system will auto-execute |
| 7. Evidence-backed trust | Inline evidence quotes | Key takeaways include verbatim speaker quotes with timestamps |

### Rationale for Decisions

- **Remove template builder entirely:** Tyler's feedback was unambiguous — the configurability added complexity without value. Chat is the configuration layer.
- **Length control over section management:** Instead of letting users add/remove/reorder sections, give them a single lever for information density. Short for quick scan, Medium for standard use, Detailed for deep review.
- **Document-level chat over section-level controls:** Configuration should happen through conversation ("focus on deal risks"), not through drag handles and arrow buttons.
- **Rich mock data:** v3 was too sparse. The artifact needs to demonstrate its value by containing real, useful information that a sales rep would actually reference.

### Files Created

- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v4/types.ts`
- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v4/mock-data.ts`
- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v4/MeetingSummaryV4.tsx`
- `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/v4/MeetingSummaryV4.stories.tsx`

### Stories

1. **Default** — Full rich content, medium length
2. **ShortLength** — Condensed view (3 takeaways, 2 risks)
3. **DetailedLength** — Expanded with full evidence and context
4. **WithChatOpen** — Document chat slide-out visible with sample conversation
5. **Loading** — Skeleton state with progressive section reveal
6. **Empty** — No transcript available with helpful CTA
7. **Error** — Generation failed with retry

### Open Questions for v5

- Does the length control feel like the right lever, or should chat handle this too?
- Should the document-level chat remember context across meetings?
- How should the chat panel interact with Global Chat (merge or separate)?
- What happens when a user asks chat to restructure sections — does the URL update?

---

## Storybook & Chromatic

- **Storybook:** Run `pnpm -F web storybook` in `elephant-ai/`; navigate to Prototypes → ChiefOfStaff → MeetingSummary
- **Chromatic (2026-02-18):** Published build 64 — https://672502f3cbc6d0a63fdd76aa-zsttjksgrg.chromatic.com/
  - Meeting Summary v4 stories at Prototypes/ChiefOfStaff/MeetingSummary/v4
  - Note: Snapshot quota reached; visual regression limited until next billing cycle
- **Viewports:** 375px, 768px, 1280px (per design system)
