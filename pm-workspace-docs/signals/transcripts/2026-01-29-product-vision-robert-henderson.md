# Transcript: Product Vision (Robert Henderson)

**Date:** 2026-01-29  
**Source:** Meeting transcript + Buyer Readiness Model  
**Participants:** Tyler Sahagun, Robert Henderson  
**Attachments:** Buyer Readiness Model (embedded below)

## TL;DR

Rob outlined a three-layer vision for AskElephant: a RevOps-defined customer journey, a per-user chief of staff that orchestrates agents across that journey, and leadership insights that continuously improve the journey and rep performance. The biggest gap is not tooling but the interface and proactive experience: a daily, approval-driven hub that communicates what the system did, what needs approval, and what is scheduled. Rob also provided a Buyer Readiness Model to replace linear pipelines with parallel readiness pillars grounded in signals, anchors, context, and guidance.

## Key Decisions

- Treat the "chief of staff" as the orchestration layer that moves sub-agents across the customer journey.
- Emphasize proactive action logic and triggers, not just communication or data capture.
- Prioritize an interface that communicates actions, approvals, and schedules as the primary experience.
- Position the chief of staff experience as a differentiator vs. a pile of tools.
- Use the Buyer Readiness Model as an AI-native replacement for pipeline stages.

## Action Items

- [ ] Align with Woody and Sam on the chief of staff interface scope and timeline.
- [ ] Prototype a daily recap/approval experience (done, needs approval, scheduled).
- [ ] Define onboarding flow to import CRM data + past calls for readiness modeling.
- [ ] Stress-test Buyer Readiness Model with 2-3 real deals (closed, churned, stalled).
- [ ] Draft initial schema + visualization for readiness pillars.

## Problems Identified

### Problem 1: Current experience is not proactive

> "My biggest thing is I haven't seen anything that's proactive here. This whole thing should be super proactive." — Rob

- **Persona:** Sales leaders, RevOps, reps
- **Severity:** High
- **Frequency:** Common

### Problem 2: No clear interface to interact with automation

> "We have the tools... we just need the interface and experience." — Rob

- **Persona:** Sales leaders, reps
- **Severity:** High
- **Frequency:** Common

### Problem 3: Platform requires too much technical understanding

> "A user has to be pretty technical to understand how to use the platform." — Tyler

- **Persona:** Sales reps, managers
- **Severity:** Medium
- **Frequency:** Common

## Feature Requests

- Chief of staff hub that orchestrates sub-agents across the journey.
- Daily recap with three buckets: completed, approval needed, scheduled.
- Proactive triggers (cron-like) to check calendar, email, CRM, CS alerts.
- Onboarding to import CRM + past calls to build the data foundation.
- Role-aware chief of staff that understands portfolio and responsibilities.
- Meeting prep and email drafts surfaced at the moment of need.

## Strategic Alignment

- ✅ Strong alignment with "revenue outcome system" and AI-first UX.
- ✅ Reinforces human-centered orchestration (chief of staff + sub-agents).
- ⚠️ Requires clear success metrics for adoption and trust (approval burden, time-to-value).

## Context Candidates (Optional)

- **Candidate ID:** ctx-2026-01-29-006  
  **Target:** pm-workspace-docs/company-context/product-vision.md  
  **Section:** Product Principles  
  **Update Type:** add_item  
  **Confidence:** medium  
  **Content:** "The primary experience must be a proactive, approval-driven hub (done, needs approval, scheduled), not just a collection of tools."  
  **Attribution:** Robert Henderson, Jan 29 2026  
  **Status:** pending

## Hypothesis Candidates

1. A chief of staff daily recap with approvals becomes the main entry point and increases WAU/retention (matches existing: no)
2. Proactive triggers reduce admin time and raise trust in automation (matches existing: no)
3. Buyer Readiness pillars outperform stage-based forecasting in accuracy (matches existing: no)

## Notes

Key quotes and framing:

- "Each rep has their own chief of staff... leading into insights for leadership." — Rob
- "We have the tools... we just need the interface and experience." — Rob
- "Tell me what you've done, what needs approval, and what's scheduled." — Rob

## Appendix: Buyer Readiness Model (Rob)

### Why This Exists

Traditional CRM pipelines model seller activity, not buyer reality. Stages like Discovery -> Demo -> Proposal -> Negotiation describe what reps do, not what buyers experience, decide, or risk. As a result:

- Forecasts are unreliable
- Data is low-quality
- Reps lie (or guess) to move deals forward
- Leaders confuse motion with progress

In an AI-native world, we no longer need humans to:

- Manually classify deals
- Populate dropdowns
- Guess buyer intent

Instead, we can model what actually matters: buyer readiness across a set of load-bearing pillars, each measured continuously and supported by evidence, context, and guidance.

### Core Design Principles

- Buyers do not move linearly
- Readiness develops in parallel
- Deals can close with imbalances (and those imbalances predict risk)
- AI observes reality; humans interpret and act
- Surface simplicity, drill-down depth

### Four Information Types (Used Everywhere)

1. **Signals**: Evaluative indicators that drive readiness (% complete)
2. **Anchors**: Objective, observable facts that ground signals in reality
3. **Context**: Human explanation that reconciles signals and anchors
4. **Guidance**: Coaching, risk interpretation, and recommended interventions

### Cross-Pillar Lens

**Trust and Credibility** applies across all pillars:

- Confidence vs hedging
- Trust in AI accuracy
- Trust in vendor partnership
- Verification-seeking behavior
- Risk flags and doubt signals

### Buyer Readiness Pillars

1. **Problem Pressure**: cost of inaction and urgency  
   Signals: pressure intensity, time sensitivity, consequence clarity, leadership visibility  
   Anchors: catalyst events, mandates, quantified impact, operational burden  
   Context: ownership, causality, tolerance, decisiveness  
   Guidance: quantify cost of inaction, validate urgency with leadership

2. **Decision Framing**: clarity on what decision is being made and why  
   Signals: decision existence, clarity, success definition, alternatives, path coherence  
   Anchors: decision statements, success artifacts, alternatives, timing  
   Context: clarity, comparison, resolution  
   Guidance: define decision in one sentence, validate status quo

3. **Value Conviction**: belief in ROI vs alternatives  
   Signals: fit confidence, outcome credibility, ROI defensibility, differentiation clarity  
   Anchors: value statements, ROI references, comparison behavior, pricing reactions  
   Context: belief, comparison, defense, doubt  
   Guidance: force value articulation, defend ROI at exec level

4. **Stakeholder Alignment**: people with power and impact are aligned  
   Signals: champion strength, economic buyer alignment, end-user buy-in, blockers  
   Anchors: stakeholder participation, buy-in statements, objections, internal comms  
   Context: presence, priorities, sincerity, resistance  
   Guidance: map stakeholders, bring skeptics in early

5. **Commercial and Procurement Readiness**: ability to complete transaction  
   Signals: budget reality, pricing acceptance, authority clarity, procurement path, timeline  
   Anchors: budget cycles, pricing behavior, approvers, legal requirements  
   Context: money, perception, process, friction  
   Guidance: anchor price to value, validate authority early

6. **Implementation Readiness**: operational preparedness for time-to-value  
   Signals: ownership clarity, resources, technical fit, access readiness  
   Anchors: named owner, access commitments, tech stack artifacts  
   Context: ownership, complexity, experience, breakpoints  
   Guidance: clarify ownership, set early win milestones

7. **Organizational Adoption Readiness**: usage after go-live  
   Signals: manager buy-in, user sentiment, change readiness, enablement prep  
   Anchors: manager participation, adoption history, training artifacts  
   Context: change climate, motivation, reinforcement  
   Guidance: manager-first enablement, define 90-day wins

### What This Replaces

- Linear pipeline stages
- Manual field population
- Rep-guessed probabilities
- Lagging indicators
- False certainty

### What This Enables

- Continuous, AI-derived readiness
- Honest forecast confidence
- Early risk detection
- Better coaching
- Better buying experiences
- Better post-sale outcomes

### What Comes Next

1. Stress-test with 2-3 real deals
2. Define percent completeness logic per pillar
3. Design visualization (pillar bars / radar / drill-downs)
4. Build schema
5. Map to HubSpot / Salesforce / AskElephant objects
