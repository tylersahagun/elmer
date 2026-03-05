# Budget Quota Goal – Week of Feb 24

Meeting Summary sprint commitments for Mon Feb 24 – Fri Feb 28, 2026. Created from Product Planning discussion with Rob (Feb 24).

---

## Definitions

- **Budget** = minimum acceptable by Friday (low risk, behind flag)
- **Quota** = expected by Friday (what we commit to)
- **Goal** = stretch by Friday (if execution goes well)

---

## End-of-Week Outcome

### Budget (minimum)
- Meeting Summary visible from Home as first-class artifact entry point
- User can open and read structured summary (even if basic)
- Internal dogfood behind feature flags
- Core instrumentation (view/open/generate)

### Quota (expected)
- Home has Meeting Summary module with today's summaries + quick open
- Template selection, section display, basic edit path, evidence links
- Daily internal release cadence this week
- Gate decisions locked: template scope, trust thresholds, owners

### Goal (stretch)
- Section-level AI rewrite preview/apply for one section type
- Chief of Staff chat prompt on Home that launches summary artifact
- First external beta candidate list + 2 interviews scheduled

---

## Person-by-Person Commitments

### Palmer (Engineering)
- **Budget:** Wire Home → Meeting Summary artifact navigation; render production-safe summary from existing data (flagged); add PostHog events (home_summary_open, summary_viewed, summary_generated)
- **Quota:** Implement Home Meeting Summary module (list + states + loading/empty/error); add template switch plumbing (General + Discovery + Demo); harden read path and fallbacks under flags
- **Goal:** Section-level AI rewrite for one section with apply/discard; evidence-link interaction in artifact UI; prep roll-forward plan for next week lanes

### Skylar (Design)
- **Budget:** Lock Home placement + visual hierarchy for Meeting Summary card/module; lock artifact feel for summary view (readability, scannability, trust cues)
- **Quota:** Ship annotated specs: Home summary module states, summary section anatomy, evidence + trust affordances, chat-entry affordance
- **Goal:** Polished vNext interaction pass for AI rewrite + save-as-template; usability checklist for dogfood feedback capture

### Rob (Revenue / Customer / Definition)
- **Budget:** One-sentence Friday customer-facing story; 3 ICP customer examples/use-cases to validate usefulness
- **Quota:** Validate top 3 revenue scenarios for summary usefulness (rep, manager, CSM); define "must be true to sell" criteria; 5 candidate users/accounts for feedback
- **Goal:** 1 live walkthrough with internal revenue stakeholder; beta positioning blurb for customer comms

### Tyler (Product / Definition)
- **Budget:** Close 3 gate decisions: metrics baseline owner/date; template scope policy; trust acceptance criteria
- **Quota:** Run daily standup cadence with explicit day-by-day acceptance checks; keep requirements tight to meeting-summary-first + homepage entry; publish Friday readout template
- **Goal:** Artifact rollout playbook for Daily/Weekly/Action Items; pre-scope week 2 implementation lanes and dependencies

---

## Day-by-Day Execution Plan

| Day | Focus |
|-----|-------|
| **Mon** | B/Q/G alignment; lock acceptance criteria; kickoff with Palmer + Skylar |
| **Tue** | Home module + base artifact flow merged behind flags |
| **Wed** | Templates + instrumentation + design refinements |
| **Thu** | Internal dogfood + bug/polish pass + trust UX adjustments |
| **Fri** | Flagged release + readout + next-week lane commitments |

---

## Friday Acceptance Checklist

- [ ] Feature flags gate exposure safely
- [ ] From Home, user can open at least one meeting summary artifact
- [ ] Summary is structured and readable (not raw wall of text)
- [ ] Core events instrumented in PostHog
- [ ] Internal users can use it daily without blockers
- [ ] Next-week plan already queued (templates/edit/trust depth)

---

## Next Week (Lane 2 / Lane 3 Teaser)

- Section-level AI rewrite (full)
- Template system (save-as-template)
- Evidence links in artifact UI
- Trust acceptance criteria implementation

---

*Add this page as a child of Meeting Summary in Notion: https://www.notion.so/ask-elephant/Meeting-Summary-30af79b2c8ac805985a8fad34b8d07da*
