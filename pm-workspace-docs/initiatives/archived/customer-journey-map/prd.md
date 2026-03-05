# Customer Journey Workspace PRD

## Overview
- **Owner:** Product (PM Copilot draft)
- **Target Release:** 2026 H1 (prototype validation)
- **Status:** Draft
- **Strategic Pillar:** Data Knowledge + Customer Trust
- **2026 Initiative:** Global Chat + CRM Agent Upgrades

## Outcome Chain
Customer Journey Workspace enables reps to review a narrative snapshot and prioritized next steps
  → so that they can act with context instead of generic alerts
    → so that they follow through on the right actions and re-engage deals faster
      → so that time-to-close improves and win rates increase.

## Problem Statement
Reps and leaders are overwhelmed by noisy alerts that lack context, making it hard to know what to do next in a deal. They need a story-like summary of where a customer is in their journey, why it matters, and what actions move the deal forward. The current view feels like pipeline status, not a guided path tailored to the customer’s journey, and it does not reflect the product channel context that changes how the journey should be interpreted.

### Evidence
- "I want a hierarchy of information that tells a story... give me the overarching what's going on, then tell me the actions."
- "The champion going quiet... doesn't mean anything. It's the context and reasoning."
- "Show me the path... the next five things over the next month."
- "Give me a dedicated workspace to work on the deal with AI and save artifacts."

## Goals & Non-Goals

### Goals (Measurable)
- Increase rep confidence in next steps (target: 4.0+ confidence rating in tests)
- Reduce time-to-action after calls (target: 30% faster follow-up)
- Improve action completion rate from workspace (target: 30%+ within 7 days)

### Non-Goals
- Full CRM replacement or leader analytics dashboards (future phase)
- Automatic actions without explicit approval
- Pure activity alerts without context/evidence

## User Personas

### Primary: Sales Rep
- **Job-to-be-done:** Move active deals forward with clear, contextual next steps
- **Current pain:** Generic alerts, missing context, context switching between deals
- **Success looks like:** Clear story of the deal, actions that map to outcomes
- **Trust factors:** Evidence for claims, ability to override, no blame framing

### Secondary: Sales Leader
- **Job-to-be-done:** Coach the right deals at the right time
- **Current pain:** Poor signal quality, unclear health drivers
- **Success looks like:** Quick understanding of where journey breaks and why
- **Trust factors:** Transparency of AI reasoning, confidence levels

## User Stories
- As a rep, I want a short narrative snapshot so I can quickly understand what matters before acting.
- As a rep, I want actions tied to that snapshot so I can execute with confidence.
- As a rep, I want a workspace to collaborate with AI and save artifacts for the deal.
- As a leader, I want to see which journey requirements are broken so I can coach effectively.

## Requirements

### Must Have (MVP)
- Narrative journey snapshot that leads the page, with confidence and evidence
- Journey health grid showing requirement status with evidence
- Orchestration Engine timeline with Truth Line, gatekeeper stages, and multi-actor lanes
- Action plan tied to the snapshot, sequenced after context
- Context-driven language (no blame framing; customer progress framing)
- Deal workspace with AI chat + artifacts + memory anchor
- Product channel context panel with human review flow and pending updates

### Should Have
- "What changed since last time" memory anchor
- Easy drill-in from summary to deep work
- Confidence and evidence visible within one click
- Suggested next steps shown as a short timeline (next 3-5 actions)
- Global filters to isolate human vs automated touchpoints

### Could Have
- Leader overlay view with coaching prompts
- Suggested updates to product channel messaging with approvals

## User Flows

### Flow: Review + Act
**Trigger:** Rep opens workspace after a call  
**Steps:** Snapshot (story) → Journey health → Action plan → Execute or open workspace  
**Outcome:** Rep sends the right follow-up with context  
**Error states:** Missing evidence or low confidence prompts user to verify  
**Trust recovery:** Show sources and allow overrides

### Flow: Deep Work
**Trigger:** Rep clicks "Open Deal Workspace"  
**Steps:** AI collaboration → create artifact → save to deal  
**Outcome:** Deal context preserved and reusable  
**Error states:** Draft fails → show retry + manual option  
**Trust recovery:** Preserve user edits and show what AI changed

## Trust & Privacy Considerations
- AI explanations include evidence and confidence
- User can override AI language and actions
- No blame framing; focus on customer progress
- Low-confidence claims use hedged copy and verification prompts

## Technical Considerations
- Depends on structured journey requirements per deal
- Needs artifact storage tied to account context
- Requires product channel knowledge base with approvals

## Success Metrics
- **North star:** Rep action completion rate from workspace
- **Leading indicators:** Snapshot engagement, evidence view rate
- **Guardrails:** False-positive alert rate, override rate
- **Trust metrics:** Confidence alignment (AI vs rep)

## Strategic Alignment
- [x] Outcome chain complete
- [x] Persona validated
- [x] Trust implications assessed
- [x] Not in anti-vision territory
- [x] Supports 2026 initiative stack

## Open Questions
1. How many journey requirements should be standard (6 vs 8)?
2. What is the minimum viable product channel setup for v1?
3. What confidence threshold triggers "verify" vs "recommend" copy?
4. Which product channel fields require human review vs auto-update?
