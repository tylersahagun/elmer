# Hypothesis: Workflow Templates Reduce Setup Time and Drive Adoption

## Status

- **Current:** active
- **Created:** 2026-01-26
- **Last Updated:** 2026-01-29
- **Linked Initiative:** workflow-templates

---

## Problem Statement

**Who:** New customers setting up workflows

**What:** Start from blank slate, don't know what workflows to create

**When:** During onboarding and initial configuration

**Impact:** Longer time-to-value, CSM dependency, potential churn if overwhelmed

> One-sentence summary: As a new customer, I don't know what workflows to create when starting with a blank slate, which causes longer setup time and dependency on CSM guidance.

---

## Evidence

### Signal 1: Workflow Documentation - 2026-01-26

- **Source:** slack (#askelephant-internal-workflow-requests)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** 16+ documented customer workflow use cases including: Sentiment Score, Solution Mapping, Meeting Prep, Profile Builder, Objections Extraction, CRM Updates, Scorecard
- **Interpretation:** Common patterns exist across customers; could be templated.

### Signal 2: Customer Workflow Examples - 2026-01-26

- **Source:** slack (#askelephant-internal-workflow-requests)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Revver Docs: Sentiment Score Workflow - 1-100 relationship health scoring; Solution Mapping Workflow - Automated SOW/implementation planning"
- **Interpretation:** Sophisticated workflows being built manually that could be templates.

### Signal 3: Onboarding Pattern - 2026-01-26

- **Source:** slack (#askelephant-internal-workflow-requests)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Multiple onboarding transcripts show workflows were NOT built during session - only concepts discussed"
- **Interpretation:** Customers need follow-up sessions to actually build workflows; templates could accelerate.

### Signal 4: Inbound Signal - 2026-01-26

- **Source:** slack (#team-sales)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Nova Intelligence: 'We currently have HubSpot, Notion, and Granola hooked up to Claude. After every call, the team manually asks Claude to update the CRM & Notion... We'd like to replace this with one tool'"
- **Interpretation:** Customers are looking for out-of-box workflow solutions, not DIY configuration.

### Signal 5: Flagship Meeting Recap UX - 2026-01-28

- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`
- **Quote:** "Right now, to generate a meeting recap, you have to go to workflows, and you have to create work with all these notes, and this config and go through a lot of different things."
- **Interpretation:** Workflow configuration is too complex; templates can reduce setup friction.

### Signal 6: Product Conversation - 2026-01-29

- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`
- **Quote:** "We’ve just fallen into this configuration hell… the initial lift to get value… is so hard."
- **Interpretation:** Time-to-value is blocked by setup complexity, strengthening the case for templates.

---

## Assessment

| Dimension             | Rating                      | Notes                                    |
| --------------------- | --------------------------- | ---------------------------------------- |
| **Severity**          | High                        | Affects time-to-value and CSM efficiency |
| **Frequency**         | Common                      | Every customer needs workflows           |
| **Personas Affected** | RevOps, Admin, Sales leader | Anyone configuring the platform          |
| **Evidence Strength** | Strong                      | 16+ documented workflow patterns         |

---

## Outcome Chain

If we create workflow templates from customer patterns:

```
Pre-built workflow templates (Sentiment Score, CRM Update, Objection Extraction)
  → so that customers can start with proven patterns
    → so that time-to-value decreases from weeks to days
      → so that CSM calls focus on optimization, not basic setup
        → so that adoption increases and churn decreases
```

---

## Template Candidates (from Slack)

| Template Name                | Source Customer     | Use Case                          |
| ---------------------------- | ------------------- | --------------------------------- |
| Sentiment Score              | Revver Docs         | 1-100 relationship health scoring |
| Solution Mapping             | Revver Docs         | SOW/implementation extraction     |
| Meeting Prep                 | Fleet STS, Enfos    | Pre-call context gathering        |
| Profile Builder              | Fleet STS           | CRM property extraction           |
| Weekly Learning Synthesis    | Fleet STS           | Knowledge accumulation            |
| Objections Extraction        | Active Parks        | FAQ generation                    |
| Automated Recap + CRM Update | Active Parks, Enfos | Meeting recap + HubSpot logging   |
| MEDDIC Scorecard             | Enfos               | Deal qualification scoring        |
| Meeting to Slack             | Enfos               | Action item routing               |

---

## Validation Criteria

To move from `active` → `validated`:

- [x] 3+ independent evidence sources
- [x] Clear persona identification
- [x] Severity/frequency assessed
- [x] Outcome chain articulated

To move from `validated` → `committed`:

- [ ] Prioritized against alternatives
- [ ] Owner assigned
- [ ] Capacity allocated
- [ ] Initiative created

---

## Potential Solutions

1. **Template library** - Pre-built workflows users can clone
2. **Onboarding wizard** - "What do you want to automate?" → recommended templates
3. **Use case landing pages** - "CRM Automation", "Sales Coaching", "Meeting Prep"
4. **One-click install** - Single button to add workflow to account
5. **Template marketplace** - Community-contributed templates

---

## History

| Date       | Action         | Notes                                                 |
| ---------- | -------------- | ----------------------------------------------------- |
| 2026-01-26 | Created        | Initial hypothesis from 14-day Slack signal synthesis |
| 2026-01-29 | Evidence added | Added workflow friction signals from Sam + Tyler      |

---

## Related

- **Similar Hypotheses:** hyp-agent-skills-reduce-config (similar pattern)
- **Related Initiative:** workflow-templates (new)
- **Competing Hypotheses:** None identified
- **Prior Art:** Zapier templates, HubSpot workflows templates
