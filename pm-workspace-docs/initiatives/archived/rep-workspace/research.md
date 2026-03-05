# Research: Rep Workspace

## Summary
Dashboard experience for sales representatives. Skylar and Tyler committed to producing a prototype today to share with internal reps (Eileen) for feedback, with potential customer testing to follow.

**Status:** Strong customer validation from Maple (2026-01-21) - Jared's requests match PRD almost exactly.

---

## Customer Evidence

### Maple Billing Feedback (2026-01-21)
**Source:** Customer feedback call with Jared Henriques (Maple)
**Signal:** `sig-2026-01-21-maple-billing-feedback`

Jared, a **solo sales rep**, provided unprompted validation of the Rep Workspace concept:

#### Key Quote - Deal Workspace
> "One of the things that I'd be really keen on is one, just like a pipeline view of mirroring my HubSpot pipeline into, you know, AskElephant for me to very quickly start to say, hey. Cool. Let me hop in on, like, a per account basis or a per deal basis, and then start to see my transcription and actually talk with the the deal property in and of itself where it would have any activity or transcripts, um, involved with that for me to actually kinda do deal coaching."

#### Key Quote - Self-Coaching (Solo Rep Use Case)
> "I am a sales team of one... I'm actually way more interested in coaching from the aspect of, like, cool. Pull out some the common questions that have been asked across all my transcripts. Pull out, like, the key details of where I could have adjusted this. And so it's more self coaching than it is monitoring."

#### Key Quote - Chat Navigation Friction
> "On the chats, when I click chats and there's the massive list of chats, can we add the context of either company or something to that just so that I have a a bit of ability to delineate between them?"

#### Feature Requests from Maple
| Request | Priority | PRD Match |
|---------|----------|-----------|
| Pipeline view mirroring HubSpot | High | ✅ "My Accounts" section |
| Per-deal AI chat workspace | High | ✅ Global Chat integration |
| Company context in chat list | Medium | New - UX enhancement |
| Activity/email sync to local storage | Medium | ⚠️ Architecture consideration |

#### Persona Insight: Solo Rep
Jared represents an underserved use case: **sales team of one** who needs self-coaching, not team monitoring. This validates the PRD's coaching section but suggests we should support self-reflection workflows, not just manager oversight.

---

## Internal Research

### Source
- **Meeting:** Product Planning Session
- **Date:** 2026-01-16
- **Participants:** Skylar, Tyler, Woody, Bryan

### Key Decisions Made

#### Decision 1: Prototype Today
**Status:** Committed
**Details:**
> "Producing right after these meetings for prototypes for rep workspace, and I'm gonna go to some of our reps. Eileen gets feedback and talk to them about that."

**Timeline:** Today

#### Decision 2: Internal Testing First
**Status:** Planned
**Details:**
> "And then if we can get some customers as well, I'll talk to them about it as well. I wanna get a decent sense, like, v one."

**Approach:**
1. Build prototype
2. Show to internal reps (Eileen)
3. Gather feedback
4. Potentially show to customers

#### Decision 3: Connection to Customer Journey
**Status:** Conceptual
**Details:**
> "I think we're gonna have a rep workspace. But what's gonna go on the rep workspace? I think it's gonna go on the customer... like, a customer's like, a journey is gonna be there as well."

**Implication:** Rep workspace connects to customer journey mapping

#### Decision 4: Global Chat Integration
**Status:** Related
**Details:**
> "Are we getting global chat done today based off of our agreement?"

Global chat is a related initiative that affects where chat appears in the rep workspace.

---

## User Problems Identified

| Problem | Severity | Frequency | Evidence |
|---------|----------|-----------|----------|
| No dedicated rep experience | High | Common | Initiative existence |
| Need to understand customer journey | High | Common | "A customer's journey is gonna be there as well" |
| **No deal-centric workspace** | High | Common | Maple: "pipeline view mirroring HubSpot" |
| **Chat list lacks context** | Medium | Common | Maple: "can we add the context of company" |
| **Solo reps need self-coaching** | Medium | Common | Maple: "more self coaching than monitoring" |

---

## Target Users
- Primary: Sales Representatives
- **Validated:** Solo sales reps (Jared @ Maple)
- Feedback source: Eileen (internal rep)
- Future: External customers

---

## Prototype Requirements
- Dashboard view for reps
- Customer journey visibility
- Integration with global chat
- Quick access to key information
- **[New]** Company/account context in chat history
- **[New]** Self-coaching support for solo reps

---

## Action Items
| Owner | Task | Timeline | Status |
|-------|------|----------|--------|
| Skylar/Tyler | Build rep workspace prototype | 2026-01-16 | ✅ Complete |
| Skylar | Get feedback from Eileen | 2026-01-16 | ✅ Complete |
| Skylar | Potentially show to customers | After internal feedback | 🔄 In progress |
| Tyler | Send structured outputs video to Jared | 2026-01-21 | ⬜ Pending |
| Skylar | Check Maple HubSpot agent setup | 2026-01-21 | ⬜ Pending |

---

## Dependencies
- Global Chat (where does chat live in rep workspace?)
- Customer Journey Map initiative
- Inbox (for agent approvals)

---

## Open Questions
1. ~~What information do reps need most prominently displayed?~~ → Validated: Pipeline + deal context
2. How does global chat integrate with rep workspace?
3. ~~What's the relationship to customer journey mapping?~~ → Validated: Central to value
4. Should reps see their own agent activity in the workspace?
5. **[New]** How do we support solo rep self-coaching vs team coaching?

---

## Related Initiatives
- Global Chat
- Customer Journey Map
- CRM Exp EtoE (agent activity visibility)
- Inbox
- hubspot-agent-config-ui (CRM reliability)

---

## Evidence Summary| Source | Date | Type | Validation Strength |
|--------|------|------|---------------------|
| Internal planning | 2026-01-16 | Stakeholder | Medium |
| Maple Billing | 2026-01-21 | Customer | **Strong** - unprompted |*Last updated: 2026-01-21*
