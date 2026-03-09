# Research: Project Bapar

> **Status:** Research in progress — Rob's findings captured 2026-03-09. Skyler, Palmer, Ivan notes still pending.
> **Last updated:** 2026-03-09

---

## Summary

Project Bapar is a proactive chief-of-staff experience, not just a meeting summary tool. The core insight from Rob: users are drowning in cognitive load — not from lack of information, but from the constant burden of organizing, remembering, and acting on it. The product needs to take that entire loop off their plate, proactively surfacing what needs to happen and what's already been handled, in a way that's deeply contextual to the user's role and business.

The primary data source is AskElephant's native note taker (recordings), with Slack, Gmail, and calendar as v1 integrations. CRM, Google Drive, Linear, and Notion come later.

---

## Stakeholder Interviews

| Date | Participant | Role | Status |
|------|-------------|------|--------|
| 2026-03-09 | Rob Henderson | Head of Revenue | ✅ Captured below |
| TBD | Skyler | TBD | ⏳ Pending |
| TBD | Palmer | TBD | ⏳ Pending |
| TBD | Ivan | TBD | ⏳ Pending |

---

## Key Findings

### Finding 1: The cognitive load loop is the real problem

**Evidence (Rob):**
> "The biggest pain points from users is that organizing everything and having to actually remember to do things and then remembering them — that process, that loop is just really taxing."

**Implications:**
- The product is not a note-taking tool. It's a cognitive offload system.
- Value isn't just surfacing information — it's actively closing the loop for them.
- "Remember to do things" and "remember when to do them" are both pain points, not just the doing.
- Design must convey that the system is actively working, not just storing.

---

### Finding 2: Contextual relevance by role and business is table stakes

**Evidence (Rob):**
> "We're trying to take the cognitive load off of them of not only remembering what to do, but when to do it and doing as much as possible for them in a way that is extremely contextual to their role in their business."

**Implications:**
- Generic action items are not enough. The system needs to understand the user's role context.
- "Doing as much as possible for them" signals high automation intent — not just suggestions.
- Personalization to role + business type is a v1 requirement, not a nice-to-have.

---

### Finding 3: V1 is a proactive, interactive homepage — not a passive report

**Evidence (Rob):**
> "V1 is an interactive chat-based homepage with artifacts that is proactively communicating what needs to be done and what has been done in a way that gives a light bulb moment to the user that Ask Elephant took considerable thinking and work off of their plate."

**Implications:**
- This is not a "view your meeting summary" flow. It's an always-on surface.
- The "lightbulb moment" is the core emotional outcome to design toward.
- Chat-based interaction + artifacts together = the format. Not one or the other.
- Proactive push > reactive pull. The system should surface things before the user asks.

---

### Finding 4: AskElephant note taker is the primary data source

**Evidence (Rob):**
> "The primary input is going to be recordings from the Ask Elephant note taker inherent in the product offering."

**Implications:**
- No transcript upload flow needed for v1. Input is native/automatic.
- Also integrates: Slack, Gmail (v1), and CRM (later).
- Calendar, Email, Slack are the v1 integration targets.
- Google Drive, Linear, CRMs, Notion are post-v1.

---

## User Problems Identified

| Problem | Severity | Frequency | Evidence |
|---------|----------|-----------|----------|
| Cognitive overload from managing the "remember + do" loop | High | Common | Rob interview |
| Organizing information across meetings/channels is taxing | High | Common | Rob interview |
| Lack of proactive reminders / nudges at the right time | High | Common | Rob interview |
| No contextual filtering by role — everything treated the same | Medium | Common | Rob interview |

---

## Pilot / Early Customers

- Internal: AskElephant revenue team (ready and willing)
- External: A group of early adopters already willing to test

---

## Eval Framework

- **Status:** Not yet defined.
- **Open question:** What does "good" look like for a proactive action surface? Need to define a rubric — likely centered on recall (did it surface what mattered?), relevance (was it contextual to their role?), and the "lightbulb" moment (did it feel like the system did real work?).

---

## Integration Priority

| Integration | Priority | Notes |
|-------------|----------|-------|
| AskElephant note taker (recordings) | P0 — primary input | Native to product |
| Calendar | P0 — v1 | Context for timing and relevance |
| Email (Gmail) | P0 — v1 | Key signal source |
| Slack | P0 — v1 | Key signal source |
| CRM | P1 — post-v1 | Later |
| Google Drive | P1 — post-v1 | Later |
| Linear | P1 — post-v1 | Later |
| Notion | P1 — post-v1 | Later |

---

## Competitive Context

- **Notion AI** — passive document-based summaries, not proactive
- **Otter.ai / Fireflies / tl;dv** — meeting-focused, not cross-context
- **Superhuman** — email triage, not cross-channel
- **Motion / Reclaim** — calendar-focused, not holistic
- **None of these** do the full proactive chief-of-staff loop across recordings + email + calendar + Slack with role context

---

## Raw Notes

### Rob - Notes (2026-03-09, via Slack DM)

> "The primary input is going to be recordings from the Ask Elephant note taker inherent in the product offering. We will also have integrations to other sources such as Slack, Gmail, and then eventually their CRM."

> "The biggest pain points from users is that organizing everything and having to actually remember to do things and then remembering them, that process, that loop is just really taxing."

> "We're trying to take the cognitive load off of them of not only remembering what to do, but when to do it and doing as much as possible for them in a way that is extremely contextual to their role in their business."

> "The main needs for integrations are going to be calendar, email, and Slack to start with. Google Drive, linear, CRMs, Notion, all of that will come later."

> "First internal pilot customers, we have a group willing to test out and we also have our own revenue team ready to test out."

> "We don't have any eval framework quite yet."

> "V1 is a interactive chat-based homepage with artifacts that is proactively communicating what needs to be done and what has been done in a way that gives a light bulb moment to the user that Ask Elephant took considerable thinking and work off of their plate."

### Skyler - Notes
[PENDING]

### Palmer - Notes
[PENDING]

### Ivan - Notes
[PENDING]
