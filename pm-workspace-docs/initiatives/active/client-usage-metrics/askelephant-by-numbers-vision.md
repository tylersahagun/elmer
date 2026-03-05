# AskElephant By The Numbers - Value Proof Vision

> Last updated: 2026-02-11  
> Owner: Tyler Sahagun  
> Initiative link: `client-usage-metrics`

---

## Why This Exists

AskElephant's biggest value is often invisible: workflows execute, CRM records are improved, and signals are turned into action before humans notice. Customers feel the outcome but cannot always see the mechanism.

This page makes that value visible in one place so CS, sales leadership, and admins can answer:

- What has AskElephant done for me, my team, and my workspace?
- Where did value come from (HubSpot, Slack, email, meetings, chat)?
- What business impact did those actions create?
- Which insights should we act on next?

---

## Product Positioning

This is not a "transcript dashboard." It is an **outcome proof surface** that translates AI activity into business value with clear metric definitions and trust cues.

If we execute this well, the page becomes:

- A QBR narrative engine
- A renewal defense artifact
- An expansion discovery surface
- A daily trust signal for users and leaders

---

## Outcome Chain

```
AskElephant value page turns background automation into visible evidence
  -> so users and leaders understand what AskElephant is doing
    -> so they trust and adopt automation more deeply
      -> so teams act faster and with better data quality
        -> so win rate rises, churn risk falls, and revenue impact compounds
```

---

## Primary Personas and Questions

### Sales Leader

- Are we increasing close rate and reducing cycle risk?
- Which reps or teams are getting the most leverage?

### CSM / CX Leader

- Where are we reducing churn risk and capturing expansion signals?
- Which accounts have the strongest value story for renewals?

### RevOps / Admin

- Is AskElephant improving CRM quality and workflow reliability?
- What automation is running, where, and with what confidence?

### Individual User (Rep or CSM)

- What did AskElephant do for me this week?
- What customer questions, objections, and quotes should I act on?

---

## Value Framework (How We Tell the Story)

To avoid vanity metrics, all numbers are organized into four value layers:

1. **Activity (what the system did)**  
   Operational volume and throughput.
2. **Automation Quality (how well it did it)**  
   Successful completions, field fill rates, reliability.
3. **Insights (what we learned)**  
   Questions, objections, and customer language trends.
4. **Outcomes (what changed in the business)**  
   Close rate, churn reduction, and attributable revenue influence.

---

## Metric Catalog (Requested Set, Normalized)

### Activity and Throughput

- Total workflows run
- Meetings attended
- Hours of video recorded
- Words transcribed
- Summaries generated
- Chats generated
- Total number of questions asked

### HubSpot Value

- Deals created
- Deal properties filled out
- Companies created
- Company properties filled out
- Contacts created
- Contact properties filled out
- Deals closed with AskElephant involvement

### Communication Value

- Slack messages read
- Slack messages sent
- Slack messages updated
- Emails read
- Emails sent
- Emails analyzed

### Insight and Coaching Value

- Coaching gained
- Most common question asked
- Most common objection received
- Most common customer quote

### Business Outcome Value

- Close percentage increase
- Churn percentage reduced
- Total revenue generated (or influenced)

---

## Metric Definition Guardrails

Every metric shown on the page must include:

- Definition (plain language)
- Scope support (`workspace`, `team`, `user`)
- Time basis (`live`, `7d`, `30d`, etc.)
- Confidence level
- Freshness timestamp
- Source provenance (which systems/events)

This prevents overclaiming and protects trust in customer-facing value narratives.

---

## Bento Box Experience Direction

Design reference: bento-box patterns (Apple/Bolt/Linear style) with varied card sizes on a strict grid.

### Layout Principles

- Use a consistent base grid (12-column desktop, 6-column tablet, 2-column mobile).
- Mix card sizes (1x1, 2x1, 2x2, 3x2 equivalents) for hierarchy and scanability.
- Keep visual style consistent even when card sizes vary.
- Use typography and color to guide attention, not decorative noise.

### Page Structure (Bento Sections)

1. **Hero Value Bento (top)**
   - 4-6 large cards for headline value:
     - Total workflows run
     - Deals closed with AskElephant
     - Close percentage increase
     - Churn percentage reduced
     - Total revenue generated

2. **System Activity Bento**
   - Meetings attended
   - Hours of video recorded
   - Words transcribed
   - Summaries generated
   - Chats generated
   - Questions asked

3. **HubSpot Impact Bento**
   - Deals, companies, contacts created
   - Property fill-out coverage cards by object
   - "Data quality recovered" highlight card

4. **Communication Impact Bento**
   - Slack read/sent/updated
   - Email read/sent/analyzed
   - Trend cards by period

5. **Insights Bento**
   - Most common question asked
   - Most common objection received
   - Most common customer quote
   - Coaching gained summary

6. **Live Feed and Context Rail**
   - Real-time or near-real-time event timeline
   - Definitions drawer for any selected metric
   - Confidence/freshness badges

---

## Interaction Model

### Filters

- Scope: `Workspace` / `Team` / `Me`
- Time: `Live` / `24h` / `7d` / `30d` / `90d` / `All time`
- Source: `All` / `HubSpot` / `Slack` / `Email` / `Meetings` / `Chat`

### Drill-Down Behavior

- Click any bento card -> opens metric detail panel.
- Detail panel shows:
  - exact definition
  - trend chart
  - comparison vs previous period
  - top contributing entities (accounts, reps, teams, workflows)

---

## Trust and Transparency Requirements

- Always show freshness and confidence badges.
- Use "influenced by AskElephant" language where attribution is probabilistic.
- Clearly separate:
  - **Created by AskElephant**
  - **Suggested by AskElephant**
  - **Observed by AskElephant**
- Degrade gracefully when data is partial (no silent zeros).

---

## MVP Recommendation (V1 vs V2)

### V1: Defensible Value Core (ship first)

- Total workflows run
- HubSpot object creation + property fill metrics
- Slack and email activity metrics
- Meetings attended, hours recorded, words transcribed
- Summaries generated, chats generated, questions asked
- Top question/objection/quote
- Freshness + confidence + definitions

### V2: Outcome Attribution Layer

- Close percentage increase
- Churn percentage reduced
- Total revenue generated/influenced
- Deals closed with AskElephant
- Coaching gained quality scoring

---

## Risks and Mitigations

- **Vanity risk:** high counts without outcome context  
  Mitigation: enforce four-layer value framework.
- **Attribution risk:** revenue and close-rate claims overstate certainty  
  Mitigation: confidence badges and explicit attribution language.
- **Data quality risk:** inconsistent scope mapping across tools  
  Mitigation: event contract and QA before external claims.
- **Cognitive load risk:** too many cards at once  
  Mitigation: prioritized hero bento + collapsible sections.

---

## Collaboration and Review

- **Design partner:** Adam (execution) + Skylar (quality and trust cues)
- **Data/engineering alignment:** Bryan + Dylan for event contracts
- **Customer narrative validation:** Ben Harrison + Rob for QBR/renewal fit

---

## Immediate Next Steps

1. Finalize canonical definitions for each requested metric.
2. Mark each metric as `available_now`, `partial`, or `instrumentation_required`.
3. Build a clickable prototype with bento hierarchy and three scopes (`Workspace`, `Team`, `Me`).
4. Run an internal review using one real customer value story.
5. Convert the approved card set into Storybook stories for implementation.

---

_This vision repositions "By The Numbers" as a trust-first, bento-style value proof page that connects system activity to customer outcomes._
