# Prototype Notes: Journey Workspace v1

**Date:** 2026-01-14  
**Initiative:** Customer Journey Map  
**Prototype Location:** `prototypes/src/components/JourneyWorkspace/`

---

## Overview

This prototype implements the first version of the Journey Workspace for Sales Reps. The goal is to provide a "daily command center" that shows exactly where each account is stuck, what matters most, and the next action to move it forward.

### Core Job Statement

> "When I'm managing active deals, I want a prioritized, context-rich list of what to do next per account, so that I move deals forward faster without manual CRM digging."

### Scope (v1)

**In Scope:**
- Rep Workspace with prioritized actions
- Account Journey View with stage/milestones/blockers
- AI-drafted follow-ups with approve/send flow
- Deal health/priority signals

**Out of Scope:**
- Leader dashboards and team views
- CS journey tracking
- Calendar optimization
- Automated actions without approval
- Global analytics

---

## Creative Directions

### Option A: Maximum Control

**Philosophy:** User sees all details upfront, every action requires explicit review and approval, all AI evidence visible by default.

**Best for:**
- New users building trust with the system
- High-stakes deals where mistakes are costly
- Low-trust environments

**Design Decisions:**
- Full evidence shown by default (no expansion needed)
- Health factors always visible
- Journey progress always shown
- Actions require multi-step approval flow
- Trust footer explains AI behavior

**Tradeoffs:**
| Pro | Con |
|-----|-----|
| Maximum transparency | Higher cognitive load |
| Easy to verify AI reasoning | Slower to process routine actions |
| No surprises | Can feel overwhelming |

---

### Option B: Balanced (RECOMMENDED)

**Philosophy:** AI surfaces top priorities, one-click execution available, details on demand via progressive disclosure.

**Best for:**
- Most users (trust-building phase)
- Balancing speed with control
- Daily workflow

**Design Decisions:**
- Two-column layout: Actions (left) + Accounts (right)
- Top 5 actions shown prominently
- Accounts expandable to show details
- Evidence available on demand ("Show evidence & impact")
- One-click send with preview available

**Tradeoffs:**
| Pro | Con |
|-----|-----|
| Good balance of speed and control | Requires clicks for full reasoning |
| Two-column separates concerns | Could miss context if not expanding |
| Progressive disclosure reduces overwhelm | |

**Why Recommended:**
This option directly addresses the two competing needs from research:
1. "I want to know what to do" → Prioritized actions panel
2. "I want to see where customers are" → Account journey list

Both are visible simultaneously without overwhelming the user.

---

### Option C: Maximum Efficiency

**Philosophy:** Inbox-zero style, minimal UI, fast processing of routine actions.

**Best for:**
- Power users
- High volume of daily actions
- Routine follow-ups

**Design Decisions:**
- Single-column, stream-based layout
- Color-coded priority bars (no badges)
- Minimal account info (name, value, stage)
- One-click actions inline
- Floating summary bar at bottom
- Quick filters at top

**Tradeoffs:**
| Pro | Con |
|-----|-----|
| Fastest to process actions | Less context visible |
| Minimal cognitive load per action | Requires trust in AI |
| Great for power users | Could miss important nuance |

---

## Components Created

| Component | Purpose |
|-----------|---------|
| `types.ts` | Data models for accounts, actions, health, milestones |
| `DealHealthIndicator.tsx` | Health badge + detailed health view |
| `ActionCard.tsx` | Action cards with three variants + all states |
| `AccountJourneyCard.tsx` | Account cards with three variants |
| `RepWorkspace.tsx` | Main workspace with three creative directions |
| `JourneyWorkspace.stories.tsx` | Storybook stories for all options and states |

---

## AI States Implemented

| State | Visual Treatment | Copy Pattern |
|-------|-----------------|--------------|
| Loading (short) | Skeleton with pulse | N/A |
| Loading (long) | Stage indicators | "Analyzing your calls..." |
| Success | Check mark, green bg | Affirming, brief |
| Error | Warning icon, red bg | Honest, solution-focused |
| Low Confidence | Muted styling, dotted indicators | "I think..." hedging |
| Empty | Celebration emoji | Encouraging, actionable |

---

## Trust Principles Applied

### 1. Receipts, Not Black Boxes
Every AI action includes:
- Evidence quotes from calls
- Data points and patterns
- Source attribution
- Confidence indicators

### 2. Progressive Disclosure
- Summaries shown first
- Details available on expand
- Evidence on demand

### 3. Graceful Failure
- All error states designed
- Recovery actions provided
- No blocking failures

### 4. Human-Centered AI
- AI drafts, user approves
- No automated sending
- Edit capability before send
- Rep gets credit for work

### 5. Trust Calibration
- Confidence indicators on all AI content
- Low confidence = requires more user review
- High confidence = one-click available

---

## Comparison Table for Stakeholder Review

| Criteria | Option A: Control | Option B: Balanced | Option C: Efficient |
|----------|------------------|-------------------|---------------------|
| **Trust level required** | Low | Medium | High |
| **User control** | Maximum | Balanced | Minimal |
| **Speed to complete action** | Slowest | Medium | Fastest |
| **Visibility into reasoning** | Always visible | On demand | Minimal |
| **Cognitive load** | High | Medium | Low |
| **Learning curve** | Lowest | Medium | Highest |
| **Best for persona** | New users | Most users | Power users |
| **Best for deal type** | High stakes | Mixed | Routine |

---

## Recommendation

**Option B (Balanced)** is recommended for v1 launch because:

1. **Matches research insights**: Reps said they want both "what to do" AND "where customers are" - Option B shows both simultaneously

2. **Builds trust progressively**: Users start with suggested view, can drill down for evidence when needed

3. **Supports the success metrics**:
   - Action completion rate: One-click execution + preview reduces friction
   - Time to follow-up: Draft ready to send immediately
   - Habitual adoption: Two-column layout makes it a useful daily start point

4. **Can evolve**: Power users can be offered "Efficient mode" toggle; new users can use "Control mode" during onboarding

---

## Feedback Synthesis (Rob + James)

### What Resonated
- **Journey > pipeline framing**: The narrative approach feels more human and more aligned with outcomes.
- **Rep as the hero**: AI should feel like a partner, not a judge. Recommendations should be framed around the customer's progress, not rep mistakes.
- **Drill-down flexibility**: High-level view is valuable, but users want a dedicated deal workspace for deeper work.

### What Missed
- **Lack of context on alerts**: "Champion went quiet" is meaningless without why it matters and what to do next.
- **Too much noise at once**: Even the most condensed version feels busy; users want a clear hierarchy.
- **Missing journey health**: Users want visibility into which journey requirements are met or broken.
- **Language misalignment**: Labels should describe customer progress ("customer hasn't articulated value") instead of rep behavior ("rep didn't do discovery").

### Key Implications
- The primary screen must lead with a **story-like snapshot** (2-3 sentences) before actions.
- **Actions must be sequenced** after context, not presented first.
- **Confidence + evidence** must be visible for critical claims.
- **Deal workspace** is required for deeper collaboration with AI and artifacts.

---

## Proposed Prototype Iterations

### v2: Journey Snapshot + Action Plan

**Goal:** Reduce noise and make the journey feel like a guided story.

**Core Layout:**
1. **Journey Snapshot (top)**: 2-3 sentence narrative describing where the customer is, why, and the immediate consequence.
2. **Journey Health Grid**: Six journey requirements with status, confidence, and short evidence.
3. **Action Plan (below)**: 3-5 prioritized actions tied to the snapshot.
4. **Evidence Drawer**: Expand to see call quotes and reasoning.
5. **CTA**: "Open Deal Workspace" for deep work mode.

**Copy Example:**
- "Osano has acknowledged pain, but hasn't tied it to business impact. This puts value conviction at risk. Next, anchor impact to their Q1 security goals."

**Trust Coverage:**
- Explicit confidence indicators on claims
- Evidence always one click away
- Undo/override on actions

### v3: Deal Workspace + Channel Context

**Goal:** Support deep work with AI + preserve context over time.

**Core Layout:**
1. **Left: AI collaborator** (chat with structured prompts and follow-up suggestions)
2. **Right: Artifacts** (notes, one-pagers, emails, research, call excerpts)
3. **Channel Context Panel**:
   - Product channel definition
   - Persona-specific pains and messaging
   - Suggested positioning based on recent calls
4. **Memory Anchor**: "What changed since last time?" summary for rapid re-entry.

**Behavior:**
- Every AI output is saved as an artifact and tied to the deal.
- Recommended changes to channel messaging require review/approval.

---

## Iteration: Option B Feedback (2026-01-14)

### New Feedback Inputs
- Rob's Option B prototype feedback
- Product Channel Framework conversation (Rob + James)

### Decisions & Deltas
- **Narrative-first hierarchy**: Start with a 2-3 sentence story before any actions.
- **Context-driven signals**: Replace generic alerts with journey-based explanations (e.g., "value not anchored to impact").
- **Journey health visibility**: Add a health grid for the 6 journey requirements with confidence + evidence.
- **Deep work workspace**: Provide a dedicated deal workspace with AI chat + saved artifacts.
- **Product channel context**: Add a channel panel with persona fit, messaging, and human review flow.
- **Language shift**: Frame insights around customer progress, not rep mistakes.

### Copy Guidelines Added
- Avoid "rep didn't do X"; use "customer hasn't articulated Y yet."
- Explain "why it matters" in plain language before recommending actions.
- Use hedged language when confidence is low.

### Prototype Updates to Build
- Journey Snapshot + Health Grid + Action Plan (stacked)
- Action plan items aligned to snapshot (no standalone alerts)
- Channel context panel with review status + suggestion flow
- Deal workspace with "what changed" memory anchor and artifact list

---

## Iteration Build: v2 Narrative-First Workspace (2026-01-14)

### What Changed
- Rebuilt the primary workspace as a narrative-first stack: Snapshot → Health → Action Plan
- Added explicit "why it matters" framing to keep context ahead of actions
- Highlighted confidence + evidence across all three sections
- Added Product Channel context with review status and pending updates
- Added memory anchor ("What changed since last time") in the deal workspace

### Trust + AI State Coverage
- **Loading**: Skeleton + "Analyzing your calls..."
- **Success**: Confirmation banner with undo
- **Error**: Specific recovery message and retry
- **Low Confidence**: Hedged copy with verification prompt
- **Empty**: Encouraging next step to add notes or ask AskElephant

### Files Added (v2)
- `prototypes/src/components/JourneyWorkspace/v2/` (new version folder)
- `prototypes/src/components/JourneyWorkspace/v2/JourneyWorkspaceV2.stories.tsx`

### Open Questions
- Which product channel fields should auto-update vs require review?
- Should the snapshot always show the full evidence set on first load?

---

## Iteration Addendum: v2 Context + Events (2026-01-14)

### What Changed
- Added chat context preload panel so AI starts with deal context before questions
- Added customer events timeline with hover context modal
- Included both horizontal and vertical timeline variants in v2 stories

### UX Notes
- Timeline focuses on events (calls, emails, tickets) rather than journey stage
- Hover reveals the event details panel; keyboard focus mirrors hover behavior

### Open Questions
- How many journey requirements should be fixed vs configurable?
- Should reps always confirm next-step timelines when silence is detected?
- What approval workflow is required for product channel updates?

---

## Iteration Addendum: Journey Map Variants (2026-01-14)

### What Changed
- Added three **journey visualization variants** aligned to timeline inspiration:
  - **Linear timeline** (stage dots + touchpoints + signals)
  - **Journey grid** (lanes by stage: story, actions, touchpoints)
  - **Pathways view** (alternate outcomes with probability + risk)
- Introduced a reusable `JourneyTimeline` component for fast iteration.

### Files Added
- `prototypes/src/components/JourneyWorkspace/v2/JourneyTimeline.tsx`
- `prototypes/src/components/JourneyWorkspace/v2/JourneyTimeline.stories.tsx`

### UX Notes
- Default to **Linear Timeline** inside the workspace to preserve clarity.
- Use **Grid** for planning sessions or stakeholder alignment.
- Use **Pathways** when a deal is at risk or multi-threaded.
- Keep narrative context ahead of actions to reinforce the story-first hierarchy.

### v4 (Optional): Leader View Overlay

**Goal:** Let leaders take action without drowning in rep-level detail.

**Core Layout:**
- **Team journey risk list** (top 5 at-risk accounts with why)
- **Coaching prompts** (what to say/do this week)
- **Drill-down** into deal workspace on demand

---

## Iteration: Orchestration Engine (2026-01-14)

### New Design Language
The Journey Workspace shifts from a static timeline into a living, high-density dashboard:
- **Truth Line** spine anchors the journey in time
- **Gatekeeper stages** span all lanes for stage transitions
- **Sentiment blooms** visualize health intensity and rhythm
- **Sankey-style curves** show branching outcomes (churn/upgrade paths)
- **Evidence chips** surface metadata in compact, scan-friendly form

### Interaction Notes
- Hover crosshair highlights concurrent events across lanes
- Accordion stages collapse completed quarters to focus attention
- Touchpoint nodes open a side drawer with CRM/email records
- Global filters toggle human vs automated signals

### Visual System
- Golden path uses heavier strokes to emphasize primary actions
- Monospace metadata (timestamps/IDs); sans-serif for human actions
- Shapes reinforce state (circle=complete, diamond=decision, square=milestone)

### Files Added (v3)
- `prototypes/src/components/JourneyWorkspace/v3/` (new version folder)
- `prototypes/src/components/JourneyWorkspace/v3/JourneyWorkspaceV3.stories.tsx`

### AI State Coverage
- **Loading**: "Analyzing journey signals..."
- **Success**: Confirmation banner with undo
- **Error**: Specific recovery with retry
- **Low Confidence**: Hedged copy + verification prompt
- **Empty**: Encourage adding notes or requesting a summary

---

## Proposed Storybook Stories (Next Iteration)

- `Journey Snapshot + Health Grid`
- `Action Plan with Evidence Drawer`
- `Deal Workspace (Chat + Artifacts)`
- `Channel Context Panel`
- `Leader View (Top Risks + Coaching)`

---

## Open Questions for Stakeholder Review

1. **Action scope**: Should we limit to 5 priority actions, or show all with pagination?

2. **Account grouping**: In Option C, actions are grouped by account. Should Option B also group this way?

3. **Mobile experience**: Which variant translates best to mobile?

4. **Keyboard shortcuts**: Should we add Vim-style shortcuts for power users (j/k to navigate, Enter to execute)?

5. **Bulk actions**: Should there be a "Send all" or "Approve top 5" for efficiency mode?

---

## Next Steps

1. **Stakeholder review**: Present all three options, gather feedback
2. **User testing**: Test Option B with 3-5 reps
3. **Iterate**: Refine based on feedback
4. **Engineering handoff**: Create design brief and engineering spec

---

## Preview

**Local Storybook:**
```bash
cd prototypes && npm run storybook
# Navigate to Prototypes/JourneyWorkspace
```

**Key Stories:**
- `Option A: Maximum Control`
- `Option B: Balanced (Recommended)`
- `Option C: Maximum Efficiency`
- `Comparison: All Three Options`
