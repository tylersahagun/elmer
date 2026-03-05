# Developer Training: Product Process in Elmer
## Gamma Slide Deck — Full Script

> **Gamma import prompt:** Paste the section below "GAMMA PROMPT" directly into Gamma's AI generation field for an auto-generated starting deck, then refine with the detailed slide scripts below.

---

## GAMMA PROMPT

```
Create a 16-slide developer training deck called "How Product Work Reaches Engineering: The Elmer Process."

The audience is software engineers at an AI startup who are moving toward product ownership. They build in TypeScript/React, use Linear for tickets, GitHub for code, Storybook + Chromatic for components, and Cursor AI for development.

Narrative arc:
1. Opening hook — the rework problem (2 slides)
2. The lifecycle from inbox to validated prototype (4 slides)
3. The two engineering gates (2 slides)
4. Prototype = acceptance criteria, not Figma (3 slides)
5. Your tools, connected (2 slides)
6. What changes for your workflow (2 slides)
7. Closing + Q&A (1 slide)

Design: Dark background (#0f172a slate), teal (#0d9488) and purple (#7c3aed) accent colors, monospace font for code snippets, kanban board visual as centerpiece. Modern, minimalist tech aesthetic — no clip art or stock photos.
```

---

## SLIDE-BY-SLIDE SCRIPT

---

### SLIDE 1 — Title Slide

**Headline:** How Product Work Reaches Engineering

**Subtitle:** The two gates that protect your time

**Speaker notes:**
> "Today isn't about a tool I built. It's about a workflow that answers a question you've all asked: 'Why am I still getting half-baked tickets?' We're going to walk through how we get from raw customer feedback to a ticket that actually has everything you need to ship."

**Visual:** Dark background, the Elmer kanban flow as a faint background element (screenshot from Chromatic or STAGE-DOCUMENTATION.md). Title in large white text.

---

### SLIDE 2 — The Problem You Already Know

**Headline:** The Cost of Building Without Validated Definition

**Body (three columns):**
- **The Signal:** Customer says "I want X" or internal stakeholder has an idea
- **The Gap:** No validation, no prototype, no evidence → ticket written from someone's memory of a conversation
- **The Result:** Build → demo → "that's not what I meant" → rework

**Quote block:**
> "There's what, 9 people all doing their own project. So it feels like everything's moving so slow. Because it's 9 different massive projects where instead if we were to just say, hey, we have 3 projects with 3 developers each — that goes so much quicker."
> — Internal voice memo, Feb 2026

**Speaker notes:**
> "This is a quote from inside our own team. Vague definition doesn't just slow down PM — it costs engineering time. Rework is expensive. Confusion at acceptance review is expensive. The Elmer process is designed to catch these problems before they reach your queue."

**Visual:** Three-column layout. The quote in a highlighted callout box.

---

### SLIDE 3 — The Ivan Test

**Headline:** Before Any Ticket Is Written: The Ivan Test

**Body:**
> Before a project is ready for engineering, you should be able to clearly answer:
> 1. What is the business expectation if this is built?
> 2. Who is the specific user we're solving this for?
> 3. How will we know it worked?

**Callout:**
> "If you can't answer these three questions, the ticket shouldn't exist yet."

**Speaker notes:**
> "This is an internal standard we've been developing. Named after a common scenario: Ivan, one of our engineers, gets a ticket and asks 'but what does this actually need to accomplish?' The answer should be in the ticket. If it's not, it hasn't been through the process."

**Visual:** Three numbered items with large icons (target, person, checkmark). Clean, minimal. Dark background.

---

### SLIDE 4 — The Full Lifecycle (Kanban Overview)

**Headline:** The Elmer Kanban: 11 Stages, Two Loops, Two Gates

**Visual (centerpiece):**
```
[Inbox] → [Discovery] → [PRD] → [Design] → [Prototype] → [Validate] → ║GATE║ → [Tickets] → [Build] → [Alpha] → [Beta] → [GA]
                ↑___________________________Loop 1_____________________↑                      ↑______Loop 2______↑
```

**Key callouts:**
- **Loop 1 (PM's territory):** "This is where iteration is cheap. Pixels and markdown, not code."
- **Loop 2 (Engineering's territory):** "This is where you iterate, with a validated spec as your anchor."
- **The Gate:** "Nothing reaches your queue without passing both gates."

**Speaker notes:**
> "This is the full picture. Focus on what's to the left of the gate — that's PM's job and you don't have to touch it. Focus on what's to the right — that's yours. The gate is what separates 'idea' from 'ticket.'"

**Visual:** A clean horizontal kanban diagram. PM stages in teal. Engineering stages in purple. The gate as a prominent visual divider (bright line or lock icon).

---

### SLIDE 5 — Gate 1: Hypothesis Committed

**Headline:** Gate 1 — From Opinion to Evidence

**Body:**
When a feature idea graduates from Discovery to PRD, it must have:
- [ ] 3+ independent evidence sources (transcripts, tickets, Slack, calls)
- [ ] At least one named persona with verbatim user quotes
- [ ] Strategic alignment score: Strong or Moderate
- [ ] A committed hypothesis: "We believe [X] will result in [Y] for [persona Z]"

**What this means for you:**
> Every PRD that reaches design already has documented evidence. You're not building someone's hunch — you're building something with a trail of proof.

**Speaker notes:**
> "Gate 1 is the PM's gate. I'm responsible for this one. By the time a project reaches Design, there's a research.md file with user quotes, a committed hypothesis, and strategic alignment. If I can't show you that evidence, the project shouldn't be in Design yet."

**Visual:** A checklist visual. The gate shown as a "stamp" or approval icon in purple/teal.

---

### SLIDE 6 — Gate 2: Jury Validated (The Engineering Gate)

**Headline:** Gate 2 — Nothing Reaches Tickets Without a 70% Jury Pass

**Body:**
Before a project becomes Linear tickets:
- 100+ synthetic user personas run through the interactive prototype
- Each persona evaluates: would they use this? What would block them?
- Result: Approval %, Conditional %, Rejection % by persona type
- **Threshold:** ≥70% combined pass rate required to advance

**What you receive at Gate 2:**
- `prd.md` — the problem, success metrics, out of scope
- `engineering-spec.md` — technical requirements, API specs, data model
- A **Chromatic URL** — every component, every state, interactive and viewable
- **Linear tickets** — each referencing the specific Storybook story it implements

**Speaker notes:**
> "Gate 2 is the handoff. When something clears Gate 2, you're not inheriting a vague idea — you're inheriting a validated, interactive prototype with all the design states already built. The Chromatic URL is your visual spec. The engineering-spec.md is your technical spec. And the Linear tickets point directly at the Storybook story they implement."

**Visual:** The Gate 2 icon prominent at top. Below it: four deliverables laid out as cards (prd.md, engineering-spec.md, Chromatic URL, Linear tickets). Clean grid layout.

---

### SLIDE 7 — What a Prototype Actually Is

**Headline:** The Prototype Is Not a Figma File

**Side-by-side comparison:**

| Old Way (Figma) | New Way (Storybook Prototype) |
|---|---|
| Static images you have to interpret | Interactive React component you can click through |
| "Match this design" — requires guesswork | "Match this story" — behavior is already defined |
| Missing states (loading, error, empty) | All states explicitly built |
| Separate from your codebase | Same framework, same stack (React + TypeScript + Tailwind) |
| No visual regression baseline | Chromatic baseline is your regression test |

**Speaker notes:**
> "This is the most important mental model shift. Prototypes in Elmer aren't Figma mockups. They're Storybook stories built in React, with TypeScript, in the same stack you build in. The acceptance criteria isn't a description — it's literally 'does the built component match the Storybook story?'"

**Visual:** Split-screen layout. Left: a Figma screenshot (generic). Right: a Storybook UI screenshot. Clear visual contrast.

---

### SLIDE 8 — The Three-Option Pattern

**Headline:** Every Prototype Explores Three Design Directions

For every feature, three options are built before validation:

**Option A — Maximum Control**
> User confirms every AI action. Best for: low-trust scenarios, new users, high-stakes decisions.

**Option B — Balanced (Usually Recommended)**
> AI suggests, user can easily override. Best for: most users, trust-building, routine tasks.

**Option C — Maximum Efficiency**
> AI acts, user reviews after. Best for: power users, repetitive tasks, clear outcomes.

**Speaker notes:**
> "Before we pick one, we build all three. The jury system runs all three through synthetic users. The one with the highest pass rate with the right persona usually wins. By the time tickets are written, you're implementing Option B (or whichever won) — not all three."

**Visual:** Three cards side by side. Each has an icon (manual control vs. suggestions vs. auto). Color-coded progression: conservative → balanced → aggressive.

---

### SLIDE 9 — All States Are Built Before You Write Code

**Headline:** Every State You'll Need Is Already Designed

**Grid showing all required states:**

| State | When | What It Shows |
|---|---|---|
| Loading (short, <2s) | While AI processes | Subtle spinner, optimistic copy |
| Loading (long, 3s+) | Slow operations | Progress stages with messaging |
| Success | Action completed | Confirmation + affirming copy |
| Error | Something went wrong | Honest message + clear recovery action |
| Low Confidence | AI isn't sure | Muted styling, hedging language, "verify this" |
| Empty | No data yet | Helpful illustration + clear next action |

**Speaker notes:**
> "How many times have you built a feature and then discovered there was no loading state spec? Or built a success state but then the error state was 'figure it out'? In Elmer, all six states are built in Storybook before Gate 2. You have visual references for all of them."

**Visual:** A grid of six cards, each showing a miniature Storybook story screenshot (or illustrated mockups if screenshots aren't available).

---

### SLIDE 10 — Live Demo: Chromatic

**Headline:** Let's Look at a Real One

**Body:**
> Navigate to: `https://main--696c2c54e35ea5bca2a772d8.chromatic.com`
> — Prototypes section — Agent Command Center v9

What to show:
1. The Storybook sidebar: multiple story options listed
2. Click through Option A → Option B → Option C
3. Show the loading state → success state → error state transitions
4. Zoom in on the component annotations

**Quote to read aloud:**
> "When I showed this to Rob [Head of Revenue], his reaction was: 'That's sick.' He's been asking for a proactive action-driven experience, and seeing a working prototype — not a mockup — made it real for him."

**Speaker notes:**
> "This is real. This is the v9 prototype that Rob reviewed on Feb 9. He gave feedback on it, which became research signals, which will feed back into v10. The prototype isn't a dead artifact — it's a living conversation tool."

**Visual:** A browser screenshot of Chromatic with the Storybook UI visible. Annotate the sidebar (stories list), the canvas (component), and the controls panel.

---

### SLIDE 11 — Linear: Tickets with Full Context

**Headline:** Every Ticket References Its Prototype Story

**What a well-formed Elmer-generated ticket looks like:**

```
Title: Implement Morning Brief — Success State
Initiative: Agent Command Center v10
Storybook Reference: [Chromatic URL]/story/prototypes-agent-command-center-v10-morningbrief--success
Acceptance Criteria: Component matches Storybook story. All props functional.
PostHog Events to implement: morning_brief_viewed, morning_brief_action_taken
Engineering Spec: /elmer-docs/initiatives/agent-command-center/engineering-spec.md
Estimated size: 4–8 hours
```

**The rule to remember:**
> If a ticket arrives without a Storybook story link, it hasn't cleared Gate 2. You can ask for it.

**Speaker notes:**
> "This is what the ticket handoff looks like once Elmer generates them from a validated prototype. Notice: the Storybook link IS the acceptance criteria. The PostHog events to implement are already specified. The engineering spec is linked. An AI agent in Cursor can pick this up and implement it because all the context is there."

**Visual:** A mock Linear ticket card with the fields above. Clean, minimal. Highlight the "Storybook Reference" field in teal.

---

### SLIDE 12 — GitHub: Context Lives with the Code

**Headline:** Every PRD, Research Doc, and Prototype Note Is a Git Commit

**How it works:**
```
Customer call uploaded
     ↓ auto
research.md committed to /elmer-docs/initiatives/[name]/
     ↓ /PM command
prd.md + design-brief.md + engineering-spec.md committed
     ↓ /proto command
Storybook components committed to /prototypes/src/
     ↓ prototype-notes.md committed
```

**What this means:**
> `git log` on any initiative folder tells you the entire decision history — from first customer quote to ticket generation. No Notion, no Confluence. The context is in the repo.

**Speaker notes:**
> "Right now, product context lives in my Cursor workspace and nowhere else. That's a problem. The goal of the repo writeback feature (Phase 1 roadmap) is that every PM artifact gets committed as an atomic git commit. You can checkout the branch and read the entire decision history."

**Visual:** A terminal/git log view showing the commit history of an initiative folder. Clean dark code aesthetic.

---

### SLIDE 13 — Storybook + Chromatic: Your Visual Regression Baseline

**Headline:** The Prototype Is Your Chromatic Baseline

**The loop:**
1. Prototype built → auto-deployed to Chromatic
2. Chromatic captures a visual snapshot (baseline)
3. You build the feature in production code
4. Chromatic compares your build against the prototype baseline
5. If it differs → visual regression flagged before merge

**Additional value:**
- Shareable URL for every story — Rob, Sam, Woody, customers can click and review
- No "let me Slack you a screenshot" for feedback
- Every component iteration tracked visually over time

**Speaker notes:**
> "The Chromatic URL does double duty: it's Tyler's prototype review tool and it's your visual regression baseline. When you implement a feature, you're not just hoping it looks right — you're comparing against an interactive reference that was already validated."

**Visual:** A before/after Chromatic diff view (visual regression example). Show the green/red overlay that Chromatic uses.

---

### SLIDE 14 — Cursor AI: Tickets Designed for Agent Implementation

**Headline:** Why Elmer Tickets Are Built for AI Agents

**The connection:**
> "When a ticket has a Storybook reference + engineering spec + PostHog events + acceptance criteria — an AI agent in Cursor can pick it up and implement it without ambiguity."

**What makes a ticket AI-implementable:**
- [ ] Visual reference (Storybook story URL) — "build this"
- [ ] Technical spec (engineering-spec.md) — "here's the data model"
- [ ] Acceptance criteria = "matches story" — unambiguous
- [ ] PostHog events explicitly listed — instrumentation is included, not an afterthought
- [ ] Scope: 4–8 hours — small enough to complete in one context window

**Speaker notes:**
> "This is why ticket quality matters more as we use AI agents for implementation. Cursor can implement a feature if it knows what it looks like, how it should behave, and how success is measured. Elmer generates tickets designed for this. Vague tickets create vague AI output."

**Visual:** A split screen — left: vague ticket ("implement the loading state"). Right: Elmer-generated ticket with all fields. Contrast is stark.

---

### SLIDE 15 — What Changes for You

**Headline:** Before and After

**Two columns:**

**Before (today):**
- Ticket arrives from Jira/Linear with a brief description
- Designer might or might not have a Figma file
- You ask "what does success look like?" and get a shrug or a long Slack thread
- Build it → demo → "that's not what I meant" → rework
- Error/loading states discovered late
- PostHog instrumentation added (or forgotten) at the end

**After (Elmer process):**
- Ticket arrives with Storybook story link, engineering spec, PostHog events
- You can view the interactive prototype before writing a line of code
- Acceptance criteria = "does it match the story?" — unambiguous
- All 6 states already designed (loading, error, success, empty, low confidence)
- Instrumentation is a ticket requirement from day one
- Gate 2 (jury 70%+) means users already validated the direction

**What to ask for now:**
> If a ticket doesn't have a Storybook story link — ask: "Can you show me the prototype?"

**Speaker notes:**
> "You now have standing to push back on under-specified tickets. The process exists. If the ticket doesn't have the artifacts from Gate 2, it hasn't been through the process. That's useful information, not a complaint."

**Visual:** Clean before/after split. Before column in muted red. After column in teal. Highlight "What to ask for now" in a bold callout box.

---

### SLIDE 16 — What's Coming + Q&A

**Headline:** The Roadmap for Elmer Itself

**Phase 1 (next 4 weeks):**
- Onboarding wizard — connect your GitHub repo
- Embedded prototypes in the project view (click a project, see the Storybook preview inline)
- Repo writeback — every PM artifact commits to GitHub as you go
- Inbox redesign — transcripts from AskElephant land directly into the right initiative

**Phase 3 (weeks 10–16):**
- Linear ticket auto-generation from validated prototypes
- Condorcet jury at full scale (1000 synthetic users)
- Context prototypes — show how a feature integrates into the live app

**How you can help:**
> When you review a prototype, your feedback is a signal. Drop it in Slack with the Chromatic story URL and it feeds back into the next iteration. You're part of the validation loop.

**Q&A — suggested questions to seed:**
1. "What happens to a project that fails the jury?"
2. "Can I request a prototype for something I'm already building?"
3. "How does this work for bug fixes vs. features?"

**Visual:** Timeline/roadmap view. Current phase highlighted. Clean horizontal layout.

---

## SPEAKER TIMING GUIDE

| Slide | Time | Segment |
|-------|------|---------|
| 1 | 0:30 | Title |
| 2–3 | 10:00 | The Problem |
| 4 | 3:00 | Lifecycle overview |
| 5–6 | 7:00 | The two gates |
| 7–9 | 8:00 | Prototype deep dive |
| 10 | 7:00 | Live Chromatic demo |
| 11–14 | 10:00 | Your tools connected |
| 15 | 5:00 | What changes for you |
| 16 | 9:00 | Roadmap + Q&A |
| **Total** | **~60 min** | |

---

## KEY QUOTES (ready to paste into slides)

### Rob Henderson (Head of Revenue, Feb 9, 2026)
> "When I'm proactive, AI is reactive. When AI is proactive, I'm reactive."
— Use for the engineering handoff model (Slide 6)

> "We already have workflows that are doing things. We already have AskElephant working for people. It's just not telling them anything."
— Use for the "invisible PM work" problem (Slide 2)

> "That's sick." (reaction to seeing a prototype notification in Slack)
— Use for the live demo slide (Slide 10)

### Sam Ho (VP of Product)
> "The PRD is now fuel for AI prototype generation, not documentation for humans to read."
— Use for the prototype framing (Slide 7)

> "Discover and fix issues when iteration is cheap (prototype stage), not expensive (production code stage)."
— Use for the gates overview (Slide 6)

### Internal voice memo (Feb 2026)
> "There's what, 9 people all doing their own project. It feels like everything's moving so slow... if we were to just say, hey, we have 3 projects with 3 developers each — that goes so much quicker."
— Use for the problem statement (Slide 2)

---

## LIVE DEMO CHECKLIST

Before the session:
- [ ] Open Chromatic: `https://main--696c2c54e35ea5bca2a772d8.chromatic.com`
- [ ] Navigate to: Prototypes → Agent Command Center → v9
- [ ] Have a second tab open with the engineering-spec.md for that initiative
- [ ] Have a third tab with an example Linear ticket (ASK-4872 "Populate toolkits" as a contrast — show a real current ticket without a Storybook reference, then show what an Elmer-generated one would look like)
- [ ] Prepare the mock ticket from Slide 11 in a Notion doc or markdown file to show inline

---

## LEAVE-BEHIND RESOURCES FOR DEVELOPERS

After the session, share:
1. **Chromatic Storybook**: `https://main--696c2c54e35ea5bca2a772d8.chromatic.com` (Prototypes section)
2. **Stage Documentation**: `elmer-docs/STAGE-DOCUMENTATION.md` (full lifecycle reference)
3. **The Gate 2 checklist**: (copy from Slide 6 — print or Notion page)
4. **FigJam flow diagram**: [link after creating in FigJam]
5. **How to give prototype feedback**: Drop Chromatic story URL + comment in #product-engineering Slack channel
