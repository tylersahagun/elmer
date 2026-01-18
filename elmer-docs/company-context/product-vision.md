# Product Vision

> **elmer** — AI-powered PM orchestrator that compresses discovery from weeks to days.

---

## Core Identity

**elmer** is an AI-powered product management orchestrator that automates the entire product development lifecycle—from initial conversation to deployed feature with metrics. It's the "Run Stage" agentic PM co-pilot: a visual Kanban interface where moving a card triggers AI agents to execute work, iterate based on feedback, and hand off validated prototypes to engineering.

### The Outcome Chain

```
PM has conversation / uploads transcript
  → so that AI generates PRD, design brief, engineering spec, GTM brief
    → so that AI creates functional prototype in Storybook
      → so that stakeholders validate on working software (not static mockups)
        → so that AI generates bite-sized Linear/Jira tickets
          → so that engineering builds what's already been validated
            → so that features ship faster with less rework
              → so that time-to-value decreases and engineering waste drops to near zero
```

---

## Mission

**Help product teams move from idea to validated prototype in days, not weeks—compressing discovery so engineering builds the right thing the first time.**

---

## Core Value Props

1. **Discovery Compression** — Collapse 6 weeks of discovery into 1 week through AI-generated PRDs and instant prototypes
2. **Prototype-Driven Validation** — Stakeholders interact with working software, not static mockups, discovering issues when iteration is cheap
3. **Automated Handoff** — Validated prototypes generate detailed Linear/Jira tickets; engineers build from working references
4. **Iterative Feedback Loops** — Visual indicators show where iteration happens; AI or human juries refine until validated
5. **Metrics-Driven Lifecycle** — PostHog integration tracks released features from Alpha → Beta → GA, surfacing when intervention is needed

---

## Strategic Pillars

1. **Compress Discovery** — Every feature should reduce time from idea to validated prototype
2. **Eliminate Engineering Waste** — Never let engineers build something that hasn't been validated with working software
3. **Human-in-the-Loop Control** — Automation is configurable; users choose how hands-on or hands-off they want to be at each stage
4. **Context Isolation** — Support multiple products/repos with isolated company context, personas, and design systems

---

## Product Principles

### 1. Outcomes Over Outputs

We don't measure success by features shipped. We measure by discovery compression (how fast did we validate?) and engineering waste reduction (how much rework did we avoid?).

### 2. Working Software Over Documentation

PRDs are fuel for AI prototype generation, not artifacts for humans to read. The prototype IS the truth. Documentation updates automatically as prototypes evolve.

### 3. Iteration is the Feature

The product is designed around iterative loops, not linear waterfall. Visual arrows on the Kanban board show where feedback cycles happen. Moving backward is expected, not a failure.

### 4. Beautiful Minimalism

The UI should feel like an Apple product demo—clean, vibrant, minimal information that is deeply meaningful. Glass-morphic depth, aurora gradients, animated wave backgrounds. Never cluttered.

### 5. Configurable Automation

Users choose their automation level per stage. Some want AI to run 5 iterations before human review. Others want approval at every step. Both are valid.

---

## Target Market

- **Primary:** Solo PMs and small PM teams at startups/scale-ups who need to move fast and validate before building
- **Secondary:** Engineering leads who want clear specs from already-validated prototypes
- **Focus:** Teams drowning in discovery cycles, wasting engineering effort on rework, or stuck in "build trap" (shipping features without validating outcomes)

---

## Success Metrics

### North Star

**Time from idea to validated prototype** (target: < 1 week)

### Key Metrics

- Discovery cycle time (idea → validated prototype)
- Engineering rework rate (tickets reopened or features rebuilt)
- Prototype-to-production fidelity (how much does shipped feature match validated prototype?)
- User validation throughput (prototypes validated per week)

---

## What We're NOT Building (Anti-Vision)

- **"Better notes" tool** — We're not competing with Notion for documentation. PRDs exist to feed AI prototyping, not for humans to read.
- **Static documentation system** — Documents without working prototypes are incomplete. If you can't click it, it's not validated.
- **Replacement for human judgment** — AI accelerates and automates, but humans decide what to build and approve key transitions.
- **Rigid waterfall enforcer** — We embrace iteration. Features should be able to move backward through stages, not just forward.
- **Enterprise complexity theater** — We're not building 50 approval gates and compliance workflows. Minimal friction, maximum velocity.
- **Feature factory accelerator** — We compress discovery to validate ideas faster, not to ship more junk features. Quality over quantity.

---

## The One-Liner

**elmer compresses product discovery from weeks to days so teams build the right thing the first time.**

---

## Design Vision

- **Glassmorphic UI** — Depth through transparency, blur, and layering; "liquid glass" feel
- **Aurora Palette** — Teal → Purple → Pink → Gold → Blue gradients flowing through the interface
- **Animated Backgrounds** — Soft fiber optic / northern lights animation, not static
- **Weighted Depth** — Components feel like stacked glass blocks on a table, not flat cards
- **Minimal Information Density** — Show only what matters for the current context; drill down for more

---

## Open Questions

1. What's the right default automation level? (Fully automated until prototype vs. human approval at each stage)
2. How do we handle multi-product workspaces where context bleeds between projects?
3. What's the MVP for PostHog/metrics integration—is it P0 or a later enhancement?
