# Decision Log: Meeting Summary

**Initiative:** Meeting Summary  
**Owner:** Tyler Sahagun

---

## 2026-02-27 — Scope pivot: Event page redesign + open beta first

**Decision:** Ship a redesigned event page (not just a meeting summary tab) targeting open beta, before building toward the broader Chief of Staff agent vision.

**Context:** Skylar, Palmer, Tyler sync in Project Babar.  
**Rationale:** "Ship a good experience and then figure out what's going to be next for Chief of Staff." — Skylar. Event page redesign creates a better foundation for the summary artifact and aligns with May 4 launch timeline.  
**Impact:** Broadened scope from "summary tab UX" to "event page redesign." Meeting Summary and Meeting Prep ship as companion features.

---

## 2026-03-04 — Template approach: Learning agent, NOT template picker or drag-and-drop

**Decision:** No explicit template picker or drag-and-drop configuration. Instead, a learning agent that infers meeting type and user preferences from behavioral patterns, and allows users to shape output through chat input.

**Context:** Tyler confirmed this approach in response to initiative setup questions.  
**Rationale:** Matches Palmer's "implicit configuration > explicit settings" principle: "I don't want to have to configure stuff. I want to just use the app, and as I'm using it, it says, 'I realized you look at all of your meeting preps at 8am. Do you want me to just start sending those to you at 8am?'" Users correct via natural language chat ("Make future discovery call summaries more concise.") The system then persists that preference as learned context.  
**Impact:** Eliminates the template picker UI entirely. Significant architecture change — the summary generation prompt is dynamic, informed by learned meeting-type patterns and explicit chat feedback.

---

## 2026-03-04 — Chief of Staff = 5-agent product; Meeting Summary is one agent

**Decision:** Meeting Summary is one of 5 agents in the Chief of Staff product launching May 4. The five agents: Meeting Summary, Meeting Prep, Daily Brief, Weekly Brief, Action Items.

**Context:** Tyler confirmed when asked about May 4 scope.  
**Rationale:** Chief of Staff is being launched as a cohesive product with 5 complementary agents, not as a single feature. Each agent ships as a standalone initiative that feeds the broader CoS platform.  
**Impact:** Sets the launch bar — all 5 agents need to be launch-quality by May 4. This initiative only scopes the Meeting Summary agent.

---

## 2026-02-27 — Template approach: Drag-and-drop prompt-based config (SUPERSEDED)

**Decision (tentative):** Move toward drag-and-drop prompt-based configuration for summary templates instead of workflow-based configuration.

**Context:** Skylar's notes from Babar sync.  
**Rationale:** "A much easier way for users to build their own summaries" vs. the workflow complexity. Aligns with Overwatch model (opinionated defaults) vs. HubSpot (infinite config) principle.  
**Status:** Tentative — needs Tyler confirmation on v1 template approach.

---

## 2026-02-18 — Agent-First paradigm: Meeting Summary as contextual artifact, not destination

**Decision:** Under the Agent-First vision, Meeting Summary is not the primary interaction destination. It is a critical contextual artifact produced for and surfaced by the Chief of Staff agent.

**Rationale:** "Do not over-invest in the meeting page UX itself. The primary value lies in the artifact's data quality, editability, and shareability."  
**Impact:** Summary must be designed to feed the broader chat-based agent experience.

---

## 2026-02-18 — Palmer's architectural model: Summary = TLDR + sections as first-class data objects

**Decision:** Meeting summary sections are not visual formatting blocks — they are first-class data entities with independent lifecycles. Pain points → company record. Action items → tasks. Objections → deal.

**Rationale:** "An about them in a meeting summary is a one-time use. But what if the about them was attached to the company?" — Palmer.  
**Impact:** Engineering architecture must support data objects escaping the summary into platform records.

---

## 2026-02-18 — Prototype iteration history

| Version | Date | Key Changes |
|---|---|---|
| v1 | 2026-02-18 | Base prototype |
| v2 | 2026-02-18 | Action items actionable, TLDR at top, full-screen layout, edit in chat, template auto-inferred, add-to-deal affordance |
| v3 | 2026-02-18 | Stateful workspace model, section reorder controls, template builder sidebar, blank template workflow |
| v4 | 2026-02-18 | Removed section management UI, one cohesive document feel, length control (Short/Medium/Detailed), chat-as-configuration, subtle hover affordances, rich mock data, 7 story variants |
