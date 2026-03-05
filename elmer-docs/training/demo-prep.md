# Demo Prep: Developer Training Session
## Chromatic + Linear + Live Walkthrough

---

## Pre-Session Setup (do this 10 min before)

Open these in separate browser tabs:

| Tab | URL | Used in |
|-----|-----|---------|
| 1 — Chromatic (Prototypes) | `https://main--696c2c54e35ea5bca2a772d8.chromatic.com` | Slides 9–10 live demo |
| 2 — Agent Command Center v9 | `https://672502f3cbc6d0a63fdd76aa-luwvsxctjp.chromatic.com/?path=/story/prototypes-agentcommandcenter-v9` | Slide 10 |
| 3 — Storybook local (if running) | `http://localhost:6006` | Optional: show local dev view |
| 4 — Example current Linear ticket | `https://linear.app` → ASK-4872 "Populate toolkits" | Slide 11 contrast |
| 5 — Gamma deck | [paste Gamma link once generated] | Main presentation |

---

## Chromatic Demo Script (Slide 10, ~7 min)

### What to show:

**Step 1 — Open Chromatic landing page (Tab 1)**
> "This is Chromatic — our Storybook deployment. Every prototype Tyler builds gets automatically published here when a PR is pushed."

Point out:
- The "Prototypes" folder in the sidebar = all PM-built prototypes
- Other folders (Atoms, Molecules, Organisms) = production component library

**Step 2 — Navigate to Agent Command Center v9**
> "This is the v9 prototype for the Agent Command Center — the chief-of-staff experience. Rob Henderson reviewed this with me on February 9th."

Show in sidebar: multiple story options listed (Option A, Option B, etc.)

**Step 3 — Click through Option A vs Option B**
> "Every prototype has 2–3 design directions. Option A is maximum control — AI shows you information, you decide everything. Option B is balanced — AI surfaces recommendations, you approve or override. We built both before choosing."

**Step 4 — Show the state variations**
Navigate to the loading state story:
> "Here's the loading state — already designed and interactive. Here's the error state — already designed. The empty state — already designed. When you implement this, you're not guessing what any of these should look like."

**Step 5 — Show the shareable URL**
Copy the story URL from the browser bar:
> "This URL is what goes in the Linear ticket. The acceptance criteria for the implementation ticket is: 'Component matches this story.' That's it. No ambiguity."

**Step 6 — Rob's reaction (tell the story)**
> "When I showed Rob this prototype — not a static mockup, but the actual interactive Storybook component — he said 'that's sick.' He gave me 42 minutes of feedback on it. That feedback went back into the next research cycle. The prototype is a conversation tool, not just a handoff artifact."

---

## Linear Ticket Contrast (Slide 11, ~3 min)

### Current ticket example (show ASK-4872):

**ASK-4872 — Populate toolkits**
```
Status: In Progress
Assignee: [engineer]
Description: "Populate toolkits"
(No Storybook reference, no acceptance criteria, no PostHog events)
```

Point out:
> "This is what a current ticket looks like. 'Populate toolkits.' What does done look like? How do I know when I'm finished? What states should it handle? There's nothing here for an AI agent to work from — and honestly, not much for a human either."

### What an Elmer-generated ticket looks like (show slide mock):

```
Title: Implement Morning Brief — Success State
Initiative: Agent Command Center v10
Storybook Reference: [Chromatic URL]/story/prototypes-agentcommandcenter-v10--success
Acceptance Criteria: Component renders correctly in Success state. All props match story. 
   Interaction behaviors match story controls.
PostHog Events: morning_brief_viewed, morning_brief_action_taken, morning_brief_dismissed
Engineering Spec: /elmer-docs/initiatives/agent-command-center/engineering-spec.md#morning-brief
Estimated size: 4–8 hours
```

> "When Elmer generates this ticket from a validated prototype, a Cursor AI agent can pick it up and implement it — because everything it needs is in the ticket. The Storybook URL tells it what to build visually. The engineering spec tells it the data model. The PostHog events tell it what to instrument. The scope (4–8 hours) is designed to fit in one AI context window."

---

## Potential Questions and Answers

**Q: "What happens to a project that fails the jury (< 70%)?"**
> A: It goes back to the Prototype stage for iteration. The jury output tells you exactly which concerns appeared most often and which persona groups rejected it. It's not a dead end — it's a specific set of things to fix. You iterate until it clears 70%, then it advances. This is better than discovering the problem after 3 sprints of engineering.

**Q: "Can I request a prototype for something I'm already building?"**
> A: Yes — and honestly you should. If you're mid-build and the definition is unclear, drop the initiative in Inbox and run `/research`. It's not too late to clarify. A prototype takes 1–2 hours to generate. That's worth it if it prevents rework.

**Q: "What about bug fixes? Those don't need a PRD."**
> A: Correct — bugs go straight to a ticket. The process is for new features and significant changes. The signal → hypothesis → prototype loop is for "we think we should build X" — not "the bot is dropping calls."

**Q: "How does Elmer handle design input from Adam / the design team?"**
> A: The Design stage (stage 4) is where design review happens before prototyping. The `/design` command runs a design review against the PRD — checking all required states, trust considerations, accessibility. The prototype is then built from that design brief. In an ideal world, a designer and a PM prototype together. Right now the PM does it; the design stage is where design gets consulted.

**Q: "Does this mean engineers won't have input on product direction?"**
> A: No — and this is important. When you interact with a prototype before it clears Gate 2, your feedback is a research signal. It goes into the next iteration. The jury system also includes a "technical feasibility" lens. And when prototypes are shared in Slack, your comments (on the Chromatic URL) feed back into product. You're part of the validation loop, not just a downstream consumer.

**Q: "When will this actually be the workflow for our team?"**
> A: Phase 1 (next 4 weeks) adds the pieces that make this real for the team: embedded prototypes in the project view, repo writeback, and inbox redesign. Linear ticket auto-generation is Phase 3 (weeks 10–16). Today is about planting the mental model so when those pieces arrive, you know how to use them.

---

## Closing Frame (last 2 minutes)

End with this direct ask:

> "One thing I need from you: when you get a ticket and you don't know what success looks like — push back. Ask for the prototype. Ask for the engineering spec. Not because you want to slow things down, but because the process exists and you deserve to work from validated specs."

> "And when you see a prototype in Slack with a Chromatic link — click it, interact with it, and drop a comment. Your feedback in 2 minutes is better than discovering the problem in code review."
