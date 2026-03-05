# Design Brief: Chief of Staff Experience

**Initiative:** Chief of Staff Experience
**Owner:** Tyler
**Phase:** Define

---

## Information Architecture

```
Chief of Staff
├── Meeting Summary   (artifact per meeting)
├── Meeting Prep      (artifact per upcoming meeting)
├── Daily Brief       (artifact per day)
├── Weekly Brief      (artifact per week)
├── Action Items      (consolidated queue)
└── [Entry point: predictable surface, e.g. sidebar or home hub]
```

---

## User Flow

1. **Entry** — User opens Chief of Staff from predictable entry (hub, sidebar, or dedicated section)
2. **Artifact selection** — User sees five outcome types; selects Summary, Prep, Daily, Weekly, or Action Items
3. **Artifact consumption** — User reads/scrolls artifact
4. **Edit/approve** — User applies template, asks AI to rewrite, approves actions, or schedules follow-ups
5. **Persist** — Edits save; template defaults persist for next time

---

## Key Screens / States

| Screen             | Purpose                    | Key Elements                                            |
| ------------------ | -------------------------- | ------------------------------------------------------- |
| Chief of Staff hub | Entry and overview         | Tabs or cards for Summary, Prep, Daily, Weekly, Actions |
| Meeting Summary    | First-class recap artifact | Template picker, section blocks, AI edit affordances    |
| Daily Brief        | Cross-signal day view      | Meeting context + CRM + comms + calendar blocks         |
| Weekly Brief       | Rollup with trends         | Trend blocks, carry-forward commitments                 |
| Action Items       | Consolidated queue         | Evidence links, Approve/Edit/Schedule per item          |

### States

- **Loading** — Skeleton or progressive reveal
- **Empty** — Helpful message ("No meetings today" / "No actions pending")
- **Error** — Recovery action (retry, contact support)
- **Editable** — Inline edit, AI rewrite, template swap

---

## Trust / Approval Behavior

- **Approval by exception** — Low-risk items auto-run; high-risk items require explicit approval
- **Evidence links** — Every AI-proposed action links to source (quote, timestamp)
- **Privacy before trigger** — No automated action until privacy/consent determined
- **Audit trail** — What ran, when, and result visible on request

---

## Interaction Rules

- Template selection does not require workflow reconfiguration
- Section-level AI edit returns to same view (no modal unless necessary)
- Action approval can be batch ("Approve All") or item-level
- Daily/Weekly briefs are snapshot by default (immutable once generated) unless specified otherwise

---

## Non-Goals

- Rebuilding workflow engine internals
- Generic note-taking without action orientation
- Mobile-native redesign (v1)
- 100+ integration breadth (own meeting + CRM depth)

---

_Last updated: 2026-02-17_
