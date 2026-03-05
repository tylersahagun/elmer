# Prototyping Guide

How the AskElephant prototype system works — for Tyler's reference.

---

## What Changed (March 2026)

The prototyping system was consolidated from a scattered set of agents, skills, and commands into a unified model. The key change: **every prototype now looks like it already belongs in the app**.

### Before → After

| Before | After |
|--------|-------|
| 4 agents (proto-builder, context-proto-builder, iterator, validator) | 1 unified agent (prototype-builder) + updated iterator + validator |
| 5 commands (/proto, /lofi-proto, /context-proto, /placement, /iterate) | 2 commands (/proto, /iterate) + /proto-audit |
| 7+ scattered skills | 1 unified skill package (prototype-system/) |
| Standalone `prototypes/` project with own UI components | Prototypes inside `elephant-ai/` using real production components |
| Ad-hoc fake navigation | Real app shell (top nav + global chat) |
| Non-functional buttons and forms | Everything is interactive |
| Feature in isolation | Full user journey (discovery → onboarding → usage → day-2) |

---

## How to Use

### Building a New Prototype

```
/proto [initiative-name]
```

This runs the full prototype workflow:
1. Checks the codebase for existing components to reuse
2. Figures out where the feature lives in the app (placement analysis)
3. Creates components using real production building blocks
4. Wraps everything in the actual app shell (top nav, global chat)
5. Builds all user journey flows
6. Creates a fully interactive demo and narrated walkthrough
7. Deploys to Chromatic for sharing

### Quick Wireframe

```
/proto [initiative-name] --lofi
```

Faster exploration — still uses the app shell and real components, but skips some flows and doesn't deploy to Chromatic.

### Iterating with Feedback

```
/iterate [initiative-name]
```

Then paste your feedback — voice transcripts, stakeholder opinions, or quick notes. The system:
- Extracts actionable items from unstructured input
- Classifies changes by type (visual, interaction, flow, content)
- Determines if it's a minor patch or needs a full version bump
- Applies changes while keeping everything interactive

### Checking Quality

```
/proto-audit [initiative-name]
```

Runs the quality checklist: component reuse, app shell, design tokens, interactivity, flows.

### Validating for Phase Advancement

```
/validate [initiative-name]
```

Checks graduation criteria (including prototype fidelity) and runs jury evaluation.

---

## What the Prototype Contains

Every prototype follows this structure:

```
[InitiativeName]/
├── v1/
│   ├── components/     ← Individual feature components
│   ├── views/          ← Full pages (always in the app shell)
│   ├── flows/          ← User journey stories
│   │   ├── Discovery   ← How users find this feature
│   │   ├── Onboarding  ← First-time experience
│   │   ├── HappyPath   ← Core usage
│   │   ├── ErrorRecovery ← When things go wrong
│   │   └── DayTwo      ← Returning user
│   └── demo/           ← Interactive click-through + walkthrough
├── v2/                 ← After iteration
```

### The Demo is the Deliverable

The demo in `demo/` is what gets shared with stakeholders on Chromatic. It's fully functional:
- Every button triggers an action
- Forms validate and submit
- Chat responds to questions (via mock)
- Navigation works between views
- Loading states resolve after realistic delays

---

## Key Rules That Prevent "Ugly Prototypes"

### 1. No Prototype-Specific UI Components

The old system had a `prototypes/src/components/ui/` with its own buttons, cards, etc. These looked different from the actual app.

**Now:** Everything imports from `@/components/primitives/` — the same components used in production.

### 2. App Shell Always Present

Every view and demo wraps in the real top navigation and has global chat access.

**Eliminated:** Standalone pages with hand-made fake nav bars.

### 3. Global Chat, Not In-Page Chat

The app uses a pull-out chat drawer (Cmd+K). Prototypes must use the same pattern.

**Eliminated:** In-page chat panels that don't exist in the real app.

### 4. Semantic Colors Only

Uses Theme V2 semantic tokens (`success-*`, `destruction-*`, `warning-*`), not raw Tailwind colors (`emerald-500`, `rose-500`).

**Why:** Raw colors break when switching themes and look different from production.

### 5. Real Data, Not Lorem Ipsum

Mock data uses realistic AskElephant names, meeting titles, and CRM data.

---

## Providing Feedback for Iteration

You can provide feedback in any format — the system handles messy input:

**Voice transcript (just paste it):**
```
/iterate customer-health
so I looked at the prototype and honestly the dashboard view is great, like that's 
exactly what I wanted to see. but the card layout feels super cramped, like there's 
no breathing room between the metrics. and when I click the analyze button nothing 
happens which is frustrating. oh also the chat thing in the page — we don't do that 
anymore, everything should go through the global chat. the pipeline view though, 
that's money, keep that.
```

**The system extracts:**
- KEEP: Dashboard view, pipeline view
- CHANGE: Card spacing (increase), Analyze button (make interactive)
- REMOVE: In-page chat (use global chat drawer)

---

## Where Things Live

| What | Where |
|------|-------|
| Prototype code | `elephant-ai/apps/web/src/components/prototypes/[Initiative]/` |
| Prototype docs | `pm-workspace-docs/initiatives/active/[name]/prototype-notes.md` |
| Placement research | `pm-workspace-docs/initiatives/active/[name]/placement-research.md` |
| Agent definition | `.cursor/agents/prototype-builder.md` |
| Quality standards | `.cursor/skills/prototype-system/SKILL.md` |
| Component catalog | `.cursor/skills/prototype-system/component-registry.md` |
| Interaction patterns | `.cursor/skills/prototype-system/interactive-patterns.md` |
| Commands | `.cursor/commands/proto.md`, `.cursor/commands/iterate.md` |

---

## Sharing with Stakeholders

After Chromatic deployment, you get a URL like:
```
https://[project-id]-[hash].chromatic.com/iframe.html?id=[story-id]&viewMode=story
```

The **iframe view** is clean (no Storybook UI) — best for sharing with customers and stakeholders.

A Slack notification is automatically sent with:
- Walkthrough link (Chromatic iframe)
- PRD link (GitHub)
- Research link (GitHub)
- FigJam customer story (if generated)

---

## Deprecated Commands

| Old Command | Replacement | Why |
|-------------|-------------|-----|
| `/lofi-proto [name]` | `/proto [name] --lofi` | Consolidated into single command |
| `/context-proto [name]` | `/proto [name]` | All prototypes are in-context now |
| `/placement [name]` | `/proto [name]` | Placement analysis is automatic |
