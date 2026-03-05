# Signal Synthesis: CRM Onboarding

**Generated:** 2026-01-26
**Signals Analyzed:** 6
**Date Range:** 2026-01-16 to 2026-01-26

## Executive Summary

CRM onboarding is the #1 friction point in AskElephant's customer journey. Across 6 signals from 4 source types (internal planning, partner feedback, customer feedback, product meetings), a consistent pattern emerges: **AskElephant's success is gated by CRM configuration quality, which requires 12-80+ hours of prerequisite work that customers cannot do themselves.** The problem is not AskElephant—it's dirty CRMs and consultative complexity. This synthesis identifies 6 strong themes with actionable hypothesis candidates.

---

## Theme Analysis

### Theme 1: CRM Configuration Is a Prerequisite (Not AskElephant's Problem)

**Strength:** Strong (6 signals, 4 sources, multiple personas)
**Occurrences:** 6 signals
**Source Diversity:** Internal planning, Partner feedback, Customer feedback, Product meeting

| Dimension | Value                                 |
| --------- | ------------------------------------- |
| Severity  | Critical                              |
| Frequency | Every customer                        |
| Personas  | RevOps, Admin, Implementation Partner |

**Evidence:**

> "The currently, the biggest bottleneck is not AskElephant. It's how dirty HubSpot is." — Council of Product, 2026-01-26

> "AskElephant is really only successful if you have the right bill or, like, data, right chart, and stuff like that... Unless you're using HubSpot and you trust the data." — Crispy, 2026-01-21

> "The client doesn't trust HubSpot data, so why add another system?" — Crispy, 2026-01-21

**Zipcio Data:**

- Phase 1-2: 53 hours of CRM work BEFORE AskElephant is introduced
- Phase 3: Only then is AskElephant configured (24 additional hours)
- Total prerequisite work: 77+ hours per customer

**Hypothesis Match:** `hyp-crm-readiness-diagnostic` ✅ VALIDATED
**Recommendation:** This hypothesis is strongly validated. Move to committed.

---

### Theme 2: Configuration Is Consultative, Not Self-Serve

**Strength:** Strong (5 signals, 3 sources, multiple personas)
**Occurrences:** 5 signals
**Source Diversity:** Internal planning, Partner feedback, Product meeting

| Dimension | Value                              |
| --------- | ---------------------------------- |
| Severity  | Critical                           |
| Frequency | Every new customer                 |
| Personas  | RevOps, Admin, Implementation Team |

**Evidence:**

> "I have a workflow that I have eighty hours in." — James, CRM-EXP-ETE Planning, 2026-01-16

> "If we were to redo our own HubSpot instance and reconfigure AskElephant and do an admin onboarding, it would take twelve hours." — Council of Product, 2026-01-26

> "Getting what they're wanting to have automated in HubSpot up and running after that forty five minute call is about two weeks worth of iterative work and then communications and back to back calls." — Council of Product, 2026-01-26

> "Every single company customizes it and personalizes it differently. And so most of them don't really know what they want." — Council of Product, 2026-01-26

**Root Causes Identified:**

1. Zero engineering effort on onboarding (100% human-led)
2. Customers don't know what they want (deal vs contact vs company)
3. High-latency feedback loop: configure → test → report → adjust → repeat
4. No wizard or guided setup

**Hypothesis Match:** `hyp-agent-skills-reduce-config` (partial)
**Recommendation:** Create new hypothesis: "CRM Setup Wizard Reduces Onboarding Time"

---

### Theme 3: Zero Visibility Into Workflow Execution

**Strength:** Strong (4 signals, 3 sources, multiple personas)
**Occurrences:** 4 signals
**Source Diversity:** Internal planning, Partner feedback, Product meeting

| Dimension | Value                      |
| --------- | -------------------------- |
| Severity  | Critical                   |
| Frequency | Every workflow interaction |
| Personas  | RevOps, Admin, Sales Rep   |

**Evidence:**

> "I would love to be able to see what deals it's run on versus hasn't run on. Wait five minutes, I don't know if it just failed to run or if it never hit the triggers." — James, CRM-EXP-ETE Planning, 2026-01-16

> "A rep needs to know what AskElephant is doing. And if they have to go sort through a call, it's gonna be very hard to find that." — James, CRM-EXP-ETE Planning, 2026-01-16

> "I want to be able to aggregate my workflows or agents into folders because I'm treated as a library... Having to scroll and find all my things that I'm doing is not great." — Crispy, 2026-01-21

**Desired State (from James):**

- Link to all CRM records updated by a workflow
- Timestamp of when each ran
- Which records hit trigger but failed
- Link to AskElephant event AND HubSpot record

**Hypothesis Match:** `hyp-hubspot-agent-config-ui` Epic 1 (Visibility Center)
**Recommendation:** Add evidence to existing hypothesis. High priority.

---

### Theme 4: Testing Workflows Triggers Cascading Side Effects

**Strength:** Moderate (2 signals, 2 sources, single persona)
**Occurrences:** 2 signals
**Source Diversity:** Internal planning, Product meeting

| Dimension | Value                |
| --------- | -------------------- |
| Severity  | High                 |
| Frequency | Every test iteration |
| Personas  | RevOps, Admin        |

**Evidence:**

> "Part of the reason I haven't built a close won close loss workflow in AskElephant is because to test something, I have to go mark a stage as close won or lost. And so I'm triggering like 40 other things to be able to test one workflow in AskElephant. And it makes you wanna punch a baby." — James, CRM-EXP-ETE Planning, 2026-01-16

> "I'm muddying up my data, and it was bad data." — James, CRM-EXP-ETE Planning, 2026-01-16

**Desired State:**

- Manual enrollment capability (like HubSpot's "Enroll" button)
- Select specific record and run workflow without meeting criteria
- Doesn't trigger other workflows in HubSpot

**Hypothesis Match:** `hyp-hubspot-agent-config-ui` Epic 2 (Approval Gates)
**Recommendation:** Add evidence. This is James's #2 priority.

---

### Theme 5: Reps Won't Leave HubSpot

**Strength:** Strong (4 signals, 3 sources, multiple personas)
**Occurrences:** 4 signals
**Source Diversity:** Partner feedback, Customer feedback, Product meeting

| Dimension | Value         |
| --------- | ------------- |
| Severity  | High          |
| Frequency | Universal     |
| Personas  | Sales Rep, AE |

**Evidence:**

> "I don't see AskElephant being the center of our reps universe... The thing that the rep wants to do is I don't want to have to leave the current system that I'm in to do the action that I wanna take." — Crispy, 2026-01-21

> "A pipeline view of mirroring my HubSpot pipeline into AskElephant for me to very quickly start to say, hey. Let me hop in on a per account basis or a per deal basis." — Jared (Maple), 2026-01-21

> "I would love a global chat to be a card or a on the record sidebar in HubSpot directly. I would use the fuck out of that." — Crispy, 2026-01-21

> "Sales reps from process are, like, imposing forces... sales reps just wanna do whatever they're rogue cowboys want to do... Make money." — Crispy, 2026-01-21

**Hypothesis Match:** `hyp-hubspot-sidebar-integration` ✅
**Recommendation:** This is strongly validated. Consider escalating priority.

---

### Theme 6: Time to Value Undefined

**Strength:** Moderate (2 signals, 2 sources)
**Occurrences:** 2 signals
**Source Diversity:** Product meeting, Partner methodology

| Dimension | Value                    |
| --------- | ------------------------ |
| Severity  | Medium                   |
| Frequency | Strategic gap            |
| Personas  | Product Team, Leadership |

**Evidence:**

> "We don't have a true definition of time to value right now." — Council of Product, 2026-01-26

> "I'm not trying to save time. I'm trying to create time. And I do think that should make us think differently." — Woody, Council of Product, 2026-01-26

**Zipcio's Implicit Definition:**

- Phase 3 success metrics: 80% of calls scoring 7+, <10 process violations per rep/week
- Total implementation: 77+ hours before those metrics are achievable

**Hypothesis Match:** None (gap)
**Recommendation:** Create new hypothesis: "Time to Value Needs Persona-Specific Definition"

---

## Cross-Reference Matrix

| Existing Hypothesis               | Evidence Count | Status                              |
| --------------------------------- | -------------- | ----------------------------------- |
| `hyp-crm-readiness-diagnostic`    | 6 signals      | **VALIDATED** - move to committed   |
| `hyp-hubspot-agent-config-ui`     | 4 signals      | Active - strong evidence            |
| `hyp-hubspot-sidebar-integration` | 4 signals      | Active - strong evidence            |
| `hyp-agent-skills-reduce-config`  | 3 signals      | Active - moderate evidence          |
| `hyp-rep-workspace-viral-anchor`  | 2 signals      | Active - supports "where reps live" |

---

## Hypothesis Candidates

### Candidate 1: CRM Setup Wizard Reduces Onboarding Time

- **Problem:** Customers don't know how to configure HubSpot integration (deal vs contact vs company), requiring 12+ hours of consultative setup over 2+ weeks
- **Hypothesis:** An AI-powered setup wizard that analyzes HubSpot configuration and recommends setup will reduce onboarding time by 50%+ and eliminate consultative back-and-forth
- **Evidence:** 5 signals
- **Personas:** RevOps, Admin
- **Confidence:** High
- **Strategic Alignment:** Aligns with "AI-First UX" and "Outcomes > Outputs"

**Action:** `/hypothesis new crm-setup-wizard`

### Candidate 2: Time to Value Needs Persona-Specific Definition

- **Problem:** No clear definition of "time to value" exists, making it impossible to measure onboarding success or optimize the experience
- **Hypothesis:** Defining TTV by persona (Rep: first automated CRM update, Leader: first coaching insight, RevOps: first working workflow) will create measurable milestones and reveal optimization opportunities
- **Evidence:** 2 signals
- **Personas:** Product Team, All
- **Confidence:** Medium

**Action:** `/hypothesis new time-to-value-definition`

### Candidate 3: Bad Data Causes Churn Faster Than Missing Features

- **Problem:** When automation pushes bad data to CRM, customers lose trust faster than if features were missing entirely
- **Hypothesis:** Data quality gates (preview, approval, rollback) will reduce churn risk more than new features
- **Evidence:** 3 signals (School AI near-churn, James's quotes, Crispy's quotes)
- **Personas:** RevOps, Sales Leader
- **Confidence:** High

**Key Quote:**

> "Bad data is worse than no data because you're gonna double down on the wrong decision." — James

> "If you have something go wrong, they will churn forever. And if they don't, they're bad admins." — James

**Action:** `/hypothesis new data-quality-gates`

---

## Priority Stack (Based on Evidence Strength)

| Priority | Theme                   | Action                                                     |
| -------- | ----------------------- | ---------------------------------------------------------- |
| 1        | CRM prerequisite        | Validate `hyp-crm-readiness-diagnostic`, move to committed |
| 2        | Consultative complexity | Create `hyp-crm-setup-wizard`                              |
| 3        | Visibility gap          | Add evidence to `hyp-hubspot-agent-config-ui`              |
| 4        | Testing side effects    | Add evidence to Epic 2                                     |
| 5        | HubSpot sidebar         | Validate `hyp-hubspot-sidebar-integration`                 |
| 6        | Time to value           | Create `hyp-time-to-value-definition`                      |

---

## Recommended Actions

### Immediate (This Week)

1. **Document CRM onboarding flow in FigJam** (from today's action item)
   - Map each step from HubSpot connect → working automation
   - Identify latency at each stage
   - Quantify hours at each step

2. **Add evidence to `hyp-crm-readiness-diagnostic`**
   - This hypothesis is validated - consider `/hypothesis commit crm-readiness-diagnostic`

### Short-Term (This Sprint)

3. **Create new hypothesis: CRM Setup Wizard**
   - Run `/hypothesis new crm-setup-wizard`
   - Include Sam's idea: "Analyze HubSpot config, auto-recommend where to store data"

4. **Prototype Notion-style universal search**
   - Sam's suggestion from today's meeting addresses Theme 5 (reps in HubSpot)
   - Reduces need to leave CRM if search/chat is unified

### Medium-Term (Next Sprint)

5. **Define time-to-value by persona**
   - Work with post-sales team to establish milestones
   - Create tracking in PostHog

6. **Explore HubSpot sidebar feasibility**
   - Technical assessment for Global Chat as HubSpot card
   - Reference Breeze AI sidebar as model

---

## Signal Sources

| Signal ID                                      | Source            | Key Contribution                               |
| ---------------------------------------------- | ----------------- | ---------------------------------------------- |
| `sig-2026-01-16-crm-exp-ete-planning`          | Internal planning | James's 80-hour quote, visibility requirements |
| `sig-2026-01-21-crispy-product-feedback`       | Partner feedback  | "Reps won't leave HubSpot", sidebar request    |
| `sig-2026-01-21-zipcio-ai-service-methodology` | Partner document  | 77+ hours prerequisite work quantified         |
| `sig-2026-01-21-maple-billing-feedback`        | Customer feedback | Rep workspace need, HubSpot mirroring          |
| `sig-2026-01-24-council-of-product`            | Product meeting   | Composio wrapper risk, rep workspace priority  |
| `sig-2026-01-26-council-of-product`            | Product meeting   | 12-hour setup quote, no TTV definition         |

---

## Appendix: Key Quotes Collection

### On Configuration Complexity

> "I have a workflow that I have eighty hours in." — James

> "If we were to redo our own HubSpot instance... it would take twelve hours." — Today's meeting

> "Two weeks worth of iterative work and then communications and back to back calls." — Today's meeting

### On Data Quality

> "Bad data is worse than no data because you're gonna double down on the wrong decision." — James

> "Every piece of data we push should have the standard of quality that when we send some report... That should be good enough to send to a board." — James

### On Reps Not Leaving HubSpot

> "I don't see AskElephant being the center of our reps universe." — Crispy

> "Sales reps just wanna do whatever they're rogue cowboys want to do... Make money." — Crispy

> "I would love a global chat to be a card or a on the record sidebar in HubSpot directly." — Crispy

### On Time to Value

> "I'm not trying to save time. I'm trying to create time." — Woody

> "If you could live a full week in a day, what would you do?" — Woody

---

_Synthesis generated: 2026-01-26_
_Next synthesis recommended: After FigJam mapping complete_
