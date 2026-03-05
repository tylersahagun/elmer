# Design Brief: Customer Journey Workspace

## User Flow
1. Rep opens workspace after a call
2. Reads narrative snapshot (what matters + why)
3. Scans journey health grid (what's on track vs blocked)
4. Reviews action plan (prioritized, evidence-backed)
5. Executes action or opens Deal Workspace for deep work

## Key Screens/States
- **Journey Snapshot + Health + Action Plan** (default, narrative-first)
- **Evidence drawer** (quotes/patterns + confidence + receipts)
- **Deal Workspace** (chat + artifacts + memory anchor)
- **Channel Context Panel** (product channel + review status + pending updates)
- **Loading / Success / Error / Low Confidence / Empty**

## Interaction Patterns
- Narrative-first hierarchy: story snapshot before actions
- Progressive disclosure: summary first, evidence on demand
- One-click actions with preview for AI drafts
- "Open Deal Workspace" for focused collaboration
- "Suggest updates" in Channel Context with approval status
- Context prompts instead of generic alerts (why it matters + what to do)
- Timeline hover crosshair to reveal concurrent events across lanes
- Accordion stages to collapse completed quarters and emphasize the active stage
- Touchpoint drill-down to side drawer with CRM/email records

## Timeline Inspiration Patterns
- **Linear stage timeline**: minimal, stage dots, and touchpoints (clear at-a-glance status)
- **Storyboard grid**: lanes by category (story, actions, touchpoints, emotions, risks)
- **Pathways view**: alternate outcomes shown as options with probability + risk
- **High-contrast stage markers**: current stage emphasized, next steps visible
- **Dense detail off-canvas**: use hover/expand for evidence and context
- **Orchestration Engine spine**: central Truth Line with organic blooms and branching paths

## Recommended Variants
1. **Linear Timeline (Default)**: Stage-based, narrative summary per stage, touchpoints and signals surfaced.
2. **Journey Grid (Explore)**: For deeper planning sessions, show lanes by stage.
3. **Pathways (Decision Mode)**: Used when a deal is at risk or multi-threaded.

## Visual Design Guidelines
- Keep stage count to 4-6; collapse older stages into a single “Completed” bucket.
- Always show **current** stage and **next** stage with distinct styling.
- Each stage gets a short narrative sentence; avoid raw activity lists.
- Use color to indicate state, but always pair with text labels.
- Surface 1-2 signals per stage (pain, gain, risk, momentum) with confidence.
- Place **journey map before action plan** to set context first.
- Use line weight to denote the Golden Path (primary actions 2-3px vs secondary 1px/dashed).
- Use monospace for technical metadata (timestamps, IDs) and sans-serif for human actions.
- Use variable density: compressed spacing for automated events; expanded spacing for human touchpoints.
- Never rely on color alone; use shapes (circle, diamond, square) for state and node type.

## Orchestration Engine Language
- **Truth Line**: a central temporal spine that anchors all events (horizontal for summary, vertical for deep dive).
- **Gatekeeper stages**: vertical anchors spanning all lanes to signal stage transitions.
- **Sentiment blooms**: soft area blobs behind the spine to show health intensity over time.
- **Sankey branches**: curved connectors where customers churn, upgrade, or split paths.
- **Evidence chips**: pill tags for metadata (CSAT, intent score, email open rate).

## Edge Cases
- Low confidence signals require explicit verification
- No evidence available → show "insufficient data" and prompt to add context
- Conflicting signals (e.g., champion silence vs scheduled travel)
- Silence is expected (out of office) → avoid “at risk” language
- Missing stakeholders → recommend alignment step

## Accessibility Considerations
- Evidence drawers keyboard accessible
- `aria-live` for AI state updates
- Confidence conveyed with text and icons (not color only)
- Reduced motion on expanding panels
- 8th grade reading level for key messages
- Hover interactions mirrored with focus states

## AI State Coverage
- **Loading:** "Analyzing your calls..."
- **Success:** Clear confirmation + undo option
- **Error:** Specific cause + recovery action
- **Low Confidence:** Hedged language + verification prompt
- **Empty:** Encouraging next step (e.g., "Add notes or ask AskElephant")

## Copy Guidelines (Journey Signals)
- Avoid rep-blame labels; frame in customer progress terms
- Always include “why it matters” in plain language
- For silence signals, require context check (e.g., “expected pause” vs “stall”)

## Design References
- `prototypes/src/components/JourneyWorkspace/JourneyWorkspace.iterations.stories.tsx`
- `prototypes/src/components/JourneyWorkspace/DealWorkspace.tsx`
