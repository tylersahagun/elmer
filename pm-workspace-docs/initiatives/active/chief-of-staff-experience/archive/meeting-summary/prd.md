# Meeting Summary PRD

## Overview

- **Owner:** Tyler Sahagun
- **Eng Lead:** TBD
- **Design Lead:** TBD
- **Target Release:** 2026 Q2
- **Status:** Define
- **Strategic Pillar:** Customer Trust / Data Knowledge
- **Parent Initiative:** Chief of Staff Experience
- **Jury Score:** 65.5% (Validated)
- **Prototype:** v2 (2026-02-18) — see `prototype-notes.md` for iteration history

Meeting Summary is elevated from a workflow output to a **first-class editable artifact** within the engagement detail view. Users select a template by meeting type (or rely on auto-inferred defaults), edit sections via chat with AI assistance, save customized templates as defaults, and verify insights against source evidence — all without touching workflow configuration. Action items are actionable (checkboxes, automation visibility) and can escape the summary into deal/task objects.

---

## Strategic Context (Agent-First Paradigm)

**Important Update (Feb 2026):** Under the new Agent-First vision, the Meeting Summary is no longer the primary interaction destination. It is a critical **contextual artifact** produced for and surfaced by the Chief of Staff agent.
- Do not over-invest in the meeting page UX itself.
- The primary value lies in the artifact's data quality, editability, and shareability so the CoS agent can reliably surface insights and actions from it.
- The current sprint scope remains intact to ensure the artifact is excellent, but it must be designed to feed the broader chat-based agent experience.

---

## Outcome Chain

```
Meeting Summary as first-class artifact with templates + AI edit
  → so that users shape summary output to match team needs without workflow config
    → so that recap consumption and trust increase (evidence-backed, editable)
      → so that follow-up execution improves (action items trusted and acted on)
        → so that revenue workflow reliability improves (fewer missed next steps)
          → so that deal velocity and retention improve
```

---

## Problem Statement

Current summary generation is trapped inside workflow mechanics. Users navigate complex workflow configurations to adjust output format, the result reads as raw model output, and there is no way to edit, customize, or verify insights without regenerating the entire summary.

### Evidence

- **Internal signals:** Workflow navigation and duplicate workflow workarounds are common; users create parallel workflows to get different summary formats for different meeting types
- **Jury feedback (2026-02-18):** 65.5% validation score; skeptics flagged attribution trust ("What happens when AI misattributes a quote?")
- **Competitive pressure:** Fathom (5.0/5 G2), Gong, and Fireflies all deliver polished post-meeting summaries with near-zero friction; Fathom's free tier sets an extremely high bar for ease of use
- **Research gap:** External customer interviews needed to validate preferred template defaults and section-level edit behavior expectations

### Competitive Landscape Summary

[Full Competitive Landscape →](./competitive-landscape.md)

- **Market position:** Crowded lane — every conversation intelligence player ships meeting summaries. Table-stakes quality is non-negotiable.
- **Table stakes to match:** Post-meeting summary delivery, key highlights extraction, action item identification, shareable output
- **Differentiation opportunity:** No competitor offers a templatized, editable summary as the default artifact with section-level AI edit and save-as-template persistence. AskElephant can own the "artifact model" — the summary is not a read-only email; it is a living, editable, evidence-backed document.

---

## Goals & Non-Goals

### Goals (Measurable)

1. **Summary becomes primary artifact** — >80% of meeting detail views show summary tab as first interaction within 30 days of GA
2. **Template adoption** — >35% of users apply a non-default template within 60 days
3. **AI edit engagement** — >25% of summary views include at least one AI section edit within 60 days
4. **Trust improvement** — Summary share rate increases >30% over current baseline (tracked via evidence link click-through as proxy for trust)
5. **Follow-up reliability** — Action items extracted from summaries have >55% completion rate within 7 days

### Non-Goals

- **Rebuilding workflow engine internals** — Workflow still generates the raw summary; this initiative adds the artifact layer on top
- **Generic transcript-only note output** — Aligns with anti-vision; every section must be outcome-oriented
- **Historical meeting regeneration** — Out of scope for v1; future consideration after template system matures
- **Team-level template library** — v1 is user-level; team templates require admin UX not yet designed

---

## User Personas

### Primary: Sales Representative

- **Job-to-be-done:** After a meeting, quickly get a reliable summary I can reference for follow-up actions and share with my team without spending 15 minutes rewriting
- **Current pain:** Summary output requires navigating workflow config; result feels like raw AI that I can't trust or customize; I end up writing my own notes anyway
- **Success looks like:** Open meeting → summary is already there in the right format → scan key points → edit one section with AI → share with confidence in under 2 minutes
- **Trust factors:** Evidence links proving where insights came from; ability to edit before sharing (control); clear indication of AI-generated vs. human-edited content

### Secondary: Sales Leader

- **Job-to-be-done:** Review team meeting summaries efficiently to coach reps and track deal progress without listening to full recordings
- **Current pain:** Summaries from different reps look inconsistent; no standard format across meeting types; hard to quickly find the critical deal signals across many meetings
- **Success looks like:** Standardized QBR and demo summaries across the team → quickly scan risk signals and coaching moments → trust the highlights enough to act on them
- **Trust factors:** Consistent formatting so patterns are scannable; confidence that AI extraction is accurate (evidence links); ability to see what was edited vs. original

### Tertiary: Customer Success Manager

- **Job-to-be-done:** Prepare for renewal conversations by reviewing recent meeting summaries and tracking sentiment shifts over time
- **Current pain:** QBR summaries are formatted differently each time; no quick way to see trending topics or sentiment across multiple meetings; hard to share relevant highlights with internal stakeholders
- **Success looks like:** Apply QBR template to all renewal meetings → evidence-backed sentiment tracking → share curated highlights with account team
- **Trust factors:** Source quotes for sentiment claims; privacy controls before sharing externally; confidence that AI understood the QBR context correctly

---

## User Stories (Per Persona)

### Sales Representative Stories

- As a **Sales Rep**, I want the meeting summary to appear as the default view when I open a meeting so that I don't have to navigate to find it
- As a **Sales Rep**, I want to select a template matching my meeting type (discovery, demo, 1:1) so that the summary structure matches what I need to communicate
- As a **Sales Rep**, I want to ask AI to rewrite a specific section so that I can improve clarity without regenerating the entire summary
- As a **Sales Rep**, I want to see source quotes linked to each key insight so that I can verify accuracy before sharing with my prospect
- As a **Sales Rep**, I want to save my edited template as the default for this meeting type so that future meetings use my preferred format automatically
- As a **Sales Rep**, I want privacy controls before sharing a summary externally so that I don't accidentally expose sensitive content

### Sales Leader Stories

- As a **Sales Leader**, I want consistent summary formats across my team's meetings so that I can quickly scan for coaching moments and deal risks
- As a **Sales Leader**, I want to see which sections a rep edited vs. what was AI-generated so that I can understand how they interpret their meetings
- As a **Sales Leader**, I want to apply a standard team template to review summaries so that my coaching review is efficient and structured

### CSM Stories

- As a **CSM**, I want to apply a QBR template to customer meetings so that renewal preparation follows a consistent structure
- As a **CSM**, I want evidence-backed sentiment indicators in the summary so that I can trust escalation signals without re-watching recordings
- As a **CSM**, I want to share specific summary sections with internal stakeholders so that account teams get context without full meeting access

---

## Shared Customer Journey

### Current State (Pain Points)

1. **Meeting ends** → User must navigate to workflow configuration to understand what summary format will be generated → Friction, often skipped
2. **Summary generates** → Output appears as raw AI text buried in workflow output panel → Feels untrustworthy, not scannable
3. **Customization needed** → User must create a new workflow or edit global workflow settings to change summary format → High effort, affects all future meetings
4. **Sharing** → No privacy gating; user copies text manually and pastes into email/Slack → Error-prone, no evidence trail
5. **Iteration** → No way to edit a section; must regenerate entire summary or manually rewrite → Trust erodes; users stop using summaries

### Future State (With Meeting Summary)

1. **Meeting ends** → Summary appears as primary artifact tab in engagement detail → Zero-click access
2. **Template selection** → User picks meeting-type template from dropdown → Right format instantly, no workflow config
3. **Consumption + edit** → User reads structured sections; asks AI to rewrite one section; sees evidence links → Trust and efficiency
4. **Sharing** → Privacy check surfaces before share; user selects sections to include → Controlled, auditable
5. **Save as template** → User saves edits as new default for this meeting type → Future meetings auto-formatted; setup time compounds to zero

### Transformation Moment

The "aha moment" is when a user opens a meeting, sees a structured summary already formatted for their meeting type, clicks an evidence link to verify a key insight, makes one AI edit, and shares — all in under 90 seconds. The summary shifts from "AI output I ignore" to "my meeting artifact I trust."

---

## End-to-End Experience Design

### 1. Discovery — How does the customer know this exists?

- **In-app:** When a user opens a meeting that has a recording/transcript, the Summary tab is the default active tab in the engagement detail ChatsTabs. A subtle "NEW" badge appears for the first 3 visits.
- **Tooltip:** First-time tooltip explains: "Your meeting summary is now editable. Choose a template, edit sections with AI, and share with confidence."
- **Email digest:** Weekly engagement digest highlights meetings with summaries available.
- **Changelog:** Announcement in #product-updates Slack channel and in-app changelog.

### 2. Activation — How do they enable/configure without hand-holding?

- **Zero-config default:** Summary generates automatically using a sensible default template (General). No setup required.
- **Template nudge:** After the second meeting summary view, a non-blocking prompt suggests: "This looks like a discovery call. Want to switch to the Discovery template?"
- **No admin setup:** Individual user preference; no team admin required for v1.
- **Progressive disclosure:** Template picker is always visible but non-intrusive; AI edit affordance appears on hover/focus per section.

### 3. Usage — What does the first interaction look like?

1. User opens a completed meeting in engagement detail
2. Summary tab is active by default (replaces current default)
3. Summary displays in structured sections based on default template
4. User notices template picker dropdown showing "General" — clicks to see meeting-type options
5. User selects "Discovery Call" — summary re-renders with discovery-specific sections (pain points, next steps, qualification criteria)
6. User hovers over a section → "Rewrite with AI" affordance appears
7. User clicks → inline prompt: "How would you like this section rewritten?" with suggestions ("Make it more concise", "Add bullet points", "Focus on action items")
8. AI rewrites section in place; user sees diff/preview before applying
9. User clicks evidence link on a key insight → source quote appears in context
10. User clicks share → privacy check surfaces → user confirms → summary shared

### 4. Ongoing Value — What value do they get on day 2, week 2, month 2?

- **Day 2:** User opens second meeting; same template auto-applied. Edits are faster because format is familiar.
- **Week 2:** User has saved a custom template for their demo meetings. All new demos auto-format. Team notices consistency.
- **Month 2:** User rarely edits — template matches needs. Trust in AI extraction is high because evidence links have been reliable. Leader uses standard templates for coaching reviews. Summary becomes the canonical meeting record.

### 5. Feedback Loop — How do we know if this is working for them?

- **Usage analytics (PostHog):** Summary view rate, template switch rate, AI edit frequency, save-as-template rate, share rate, evidence link click-through, time-to-first-share
- **Quality signal:** Track AI edit rejection rate (user clicks rewrite then discards) as proxy for quality
- **In-app micro-feedback:** After 5th summary view, optional one-question: "How useful are your meeting summaries?" (1-5 scale)
- **Support patterns:** Monitor for "summary quality" and "wrong template" support tickets
- **Feature flag staged rollout:** Internal → beta cohort → GA with analytics at each stage

---

## Requirements

### Must Have (MVP)

- [ ] Default summary appears as primary artifact tab in engagement detail ChatsTabs
- [ ] Template selection dropdown by meeting type (Discovery, Demo, QBR, 1:1, Internal, General)
- [ ] Section-level AI rewrite (not full regeneration) with inline prompt
- [ ] Edit persistence (save changes to this summary)
- [ ] Evidence links — each key insight links to source quote/timestamp from transcript
- [ ] Privacy-before-share controls — privacy/consent check before external share
- [ ] Loading state (skeleton progressive section reveal)
- [ ] Empty state (meeting not yet processed / no transcript available)
- [ ] Error state with retry action

### Should Have

- [ ] Save edits as template default for meeting type (user-level)
- [ ] AI rewrite preview/diff before applying
- [ ] Section collapse/expand for long summaries
- [ ] Keyboard shortcuts for power users (Cmd+E to edit section, Cmd+S to save)
- [ ] Meeting-type auto-detection suggestion ("This looks like a demo — switch template?")
- [ ] Edit history (who edited what, when) for compliance

### Could Have

- [ ] Team-level template library (requires admin UX)
- [ ] Auto-regeneration of historical meetings when template changes
- [ ] Export to PDF/Docs
- [ ] Slack integration — share summary to channel with formatting preserved
- [ ] Confidence indicators on AI-generated sections

---

## User Flows

### Flow: First Summary View

**Trigger:** User opens engagement detail for a meeting with completed transcript
**Steps:**

1. Summary tab loads as default active tab in ChatsTabs
2. Summary renders with General template (or last-used template for this meeting type)
3. Template picker shows current selection; dropdown reveals meeting-type options
4. Sections render progressively with skeleton loading
5. Evidence links appear inline as subtle link icons next to key insights
   **Outcome:** User sees structured, readable summary within 2 seconds of tab load
   **Error states:** Transcript not ready → "Summary is being generated. We'll notify you when it's ready." with estimated time; AI generation failed → "We couldn't generate a summary for this meeting. [Retry] [Report issue]"
   **Trust recovery:** Failed generation includes link to raw transcript so user is never blocked

### Flow: Template Switch

**Trigger:** User clicks template picker dropdown
**Steps:**

1. Dropdown shows: Discovery, Demo, QBR, 1:1, Internal, General, + any saved custom templates
2. User selects new template
3. Brief loading state (section skeleton) while AI re-renders summary with new template structure
4. Summary re-renders with new section structure; content adapted to template format
   **Outcome:** Summary reformatted for meeting type within 3 seconds
   **Error states:** Template switch fails → Summary reverts to previous template; toast: "Template switch failed. Your previous summary is preserved. [Retry]"

### Flow: Section AI Rewrite

**Trigger:** User hovers/focuses on a section → "Rewrite with AI" affordance appears → User clicks
**Steps:**

1. Inline prompt appears below section: "How would you like this section rewritten?"
2. Quick suggestions shown: "More concise", "Add bullet points", "Focus on action items", or free-text input
3. User selects or types instruction
4. Loading indicator on section (shimmer effect, not blocking other sections)
5. Preview shows rewritten section with diff highlighting (additions in green, removals in red)
6. User clicks "Apply" to accept or "Discard" to revert
   **Outcome:** Section updated in place; original preserved in edit history
   **Error states:** AI rewrite fails → Section stays unchanged; toast: "Couldn't rewrite this section. [Try again] [Edit manually]"; Latency >5s → Progress message: "Working on your rewrite…" with cancel option
   **Trust recovery:** User can always edit manually if AI rewrite is unsatisfactory

### Flow: Save as Template

**Trigger:** User has made edits and clicks "Save as Template" action
**Steps:**

1. Dialog: "Save as template for [meeting type]?" with template name field (pre-filled with meeting type)
2. User confirms or renames
3. Template saved as user-level default for that meeting type
4. Confirmation toast: "Template saved. Future [meeting type] summaries will use this format."
   **Outcome:** Future meetings of this type auto-apply saved template
   **Error states:** Save fails → Toast with retry; Name conflict → "A template with this name exists. Replace or rename?"

### Flow: Share with Privacy Check

**Trigger:** User clicks "Share" button on summary
**Steps:**

1. Privacy check surfaces: "This summary contains content from a recorded meeting. Confirm sharing permissions."
2. If meeting has external participants → additional warning: "This meeting included external participants. Review content before sharing."
3. User selects share method: Copy link, Email, Slack
4. User optionally selects specific sections to include (not full summary)
5. Share executes with audit trail
   **Outcome:** Summary shared with privacy compliance; action logged
   **Error states:** Privacy check fails (consent not confirmed) → Share blocked with explanation; Share delivery fails → Retry with fallback to copy-to-clipboard

---

## Trust & Privacy Considerations

### Addressing Jury Skeptic Feedback

> "What happens when AI misattributes a quote?"

- **Evidence links are mandatory** for any insight that attributes a statement to a meeting participant. Each evidence link opens the source quote with timestamp context.
- **Attribution disclaimer:** Sections with participant attribution include a subtle "Extracted by AI — verify with source" indicator
- **Edit as correction:** User can edit any misattributed section; edit history preserves the correction chain
- **Feedback loop:** "Flag inaccurate" action on any evidence link sends correction signal to improve extraction quality

### Privacy Requirements

- **Privacy-before-share** is a hard gate — no share action completes without explicit consent confirmation
- **Meeting-level privacy** inherits from engagement recording consent; summary access respects same permissions
- **External participant sensitivity:** If meeting included external participants, share action surfaces additional content review step
- **Audit trail:** All share actions logged with who, when, what sections, to whom
- **Data retention:** Summary edits follow same retention policy as engagement data

### Trust Design Principles

- **Show your work:** Evidence links on every key extraction; never present AI output without traceability
- **Control before automation:** User can always edit, override, or discard AI suggestions
- **Transparency:** Clear indication of AI-generated vs. human-edited sections
- **Fail gracefully:** If AI cannot generate or edit, user is never blocked from manual interaction

---

## Success Metrics

### North Star

**Meeting summary weekly engagement rate** — % of users with recorded meetings who view a summary at least once per week

- Baseline: Not established
- Target: >60%
- Timeline: GA + 60 days

### Leading Indicators

| Metric                              | Target                          | Timeline     |
| ----------------------------------- | ------------------------------- | ------------ |
| Time to first useful summary view   | < 2 minutes post-meeting        | Beta         |
| Template applied rate (non-default) | > 35%                           | GA + 60 days |
| AI section edit usage               | > 25% of summary views          | GA + 60 days |
| Save-as-template completion         | > 15%                           | GA + 60 days |
| Evidence link click-through         | > 20% of summary views          | GA + 30 days |
| Summary share rate                  | > 30% improvement over baseline | GA + 60 days |
| AI edit acceptance rate             | > 70% (apply vs. discard)       | GA + 30 days |

### Guardrail Metrics

| Metric                                         | Alert Threshold   |
| ---------------------------------------------- | ----------------- |
| Summary quality complaints (support tickets)   | > 10 per week     |
| Wrong meeting-type template auto-selection     | > 8% error rate   |
| AI edit rejection rate (discard after rewrite) | > 40%             |
| Privacy share-gate bypass attempts             | Any (P0 incident) |
| Summary generation failure rate                | > 5%              |
| Section rewrite latency p95                    | > 8 seconds       |

---

## Strategic Alignment

- [x] Outcome chain complete — Summary → trust → follow-up execution → revenue reliability
- [x] Persona validated — Sales Rep (primary), Sales Leader, CSM all have distinct JTBD
- [x] Trust implications assessed — Evidence links, privacy-before-share, attribution disclaimer, edit-as-correction
- [x] Not in anti-vision territory — Not generic AI notes; outcome-oriented, editable, evidence-backed artifact
- [x] End-to-end experience: All 5 steps addressed (Discovery, Activation, Usage, Ongoing Value, Feedback)
- [x] Feedback method defined — PostHog analytics, micro-feedback, support pattern monitoring
- [ ] Ownership assigned (PM: Tyler, Eng Lead: TBD, Design Lead: TBD)

---

## Launch Materials Needed

- [ ] Revenue team training deck (template usage, AI edit workflow, share controls)
- [ ] Help center article: "Understanding Meeting Summaries"
- [ ] Help center article: "Customizing Summary Templates"
- [ ] Changelog entry
- [ ] In-app announcement / tooltip for first-time experience
- [ ] Slack #product-updates post
- [ ] Customer communication for beta participants
- [ ] Internal dogfood guide for AskElephant team

---

## Risks

| Risk                                               | Likelihood | Impact | Mitigation                                                                             |
| -------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------- |
| Template sprawl (too many meeting types)           | Medium     | Medium | Curated starter set of 6; validate with customer interviews before expanding           |
| Section edit latency (AI rewrite feels slow)       | Low        | Medium | Progressive UI; async rewrite with shimmer; cancel option for long operations          |
| Historical regeneration scope creep                | Medium     | Low    | Explicitly out of scope for v1; documented as Could Have                               |
| AI misattribution erodes trust                     | Medium     | High   | Evidence links mandatory; "Flag inaccurate" action; attribution disclaimer             |
| Low adoption due to habit (users ignore summaries) | Medium     | High   | Default tab placement; tooltip onboarding; template nudge after 2nd view               |
| Fathom's free tier undercuts perceived value       | Low        | Medium | Differentiate on editability + evidence + template persistence; not competing on price |
| Privacy share-gate feels like friction             | Low        | Medium | Clear UX explaining why; fast confirmation flow; remember preferences                  |

---

## Timeline / Milestones

| Milestone                                          | Target     | Status |
| -------------------------------------------------- | ---------- | ------ |
| PRD + design brief complete                        | 2026-02-17 | ✅     |
| Full spec suite (PRD, design brief, eng spec, GTM) | 2026-02-18 | ✅     |
| Template starter set defined                       | 2026-02-28 | ⬜     |
| Engineering spec review                            | 2026-03-07 | ⬜     |
| Build kickoff                                      | 2026-03-14 | ⬜     |
| Internal dogfood                                   | 2026-04-01 | ⬜     |
| Beta (feature flag, select accounts)               | 2026-04-15 | ⬜     |
| GA                                                 | 2026-05-01 | ⬜     |

---

## Open Questions

- [ ] What template starter set should ship in v1? (Need customer interview validation for top 3 beyond General)
- [ ] Should meeting-type auto-detection use transcript analysis or meeting metadata (calendar event title/description)?
- [ ] What is the save-as-template scope — section structure only, or also section content defaults?
- [ ] How should summary versioning work if the same meeting is re-processed after a template change?
- [ ] What is the minimum transcript quality threshold below which we show "Summary may be incomplete" warning?
- [ ] Should evidence links open in a side panel, tooltip, or navigate to transcript view?

---

## Dependencies

- **Global Chat** — AI edit uses the conversational AI interface for natural-language section rewrite
- **Transcript pipeline** — Summary generation depends on transcript processing completion
- **Chief of Staff IA** — Artifact-first entry point; engagement detail tab structure
- **Privacy/trust rails** — Share controls inherit from platform privacy framework
- **PostHog** — Feature flags for staged rollout; analytics for success metrics

---

_Last updated: 2026-02-18_
_Owner: Tyler Sahagun_
