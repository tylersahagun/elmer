# Role Definition Prototype: Tyler Sahagun

> "Prototype your own skeleton of where your boundaries are. Be like, I don't plan on doing this. I plan on doing this, and I'm expecting this from you." -- Bryan Lund, Feb 5 2026

> This is a DRAFT for negotiation with Sam and Bryan. It is meant to be marked up, challenged, and revised.

---

## My Core Job (The 3 Things)

If everything else drops and these 3 are done well, I am succeeding:

### 1. Know What Is Happening Across Product

- Understand the status, blockers, and next steps for every active engineering project
- Know what customers are experiencing (CS channel monitoring, customer feedback synthesis)
- Track what has been released, what is in flight, and what is coming next
- Be the person anyone can ask "what's going on with X?" and get a clear answer

### 2. Facilitate the Engineering-to-Release Handoff

- When engineering completes work, ensure it gets across the line to PMM, revenue, and customers
- Create clear release definitions: what shipped, who it's for, how to enable it, how to position it
- Bridge the gap between "feature flagged in code" and "customer is using it successfully"
- Convert CS channel feedback into actionable Linear tickets for engineering

### 3. Learn Product Discovery From Sam

- Push Sam for direction on how to do discovery, strategy, and roadmapping
- Be prepared with context (here's what I know about the current state) so Sam can teach me the next layer
- Ask: "Can you walk me through discovery on one project?" -- then learn by doing alongside him
- This is the growth path, not the current accountability

---

## Supporting Responsibilities

These matter, but are secondary to the core 3:

- **Project briefs** for active initiatives (situation, problem, solution, recommendation format -- SCQA)
- **Sprint deliverables** -- have something concrete to show every 2 weeks
- **Executive communication** -- when bringing decisions to Woody/Sam, come with recommendations, not open questions
- **Customer context** -- synthesize what I hear from calls, CS channels, and feedback into patterns
- **Linear hygiene** -- triage EPD/Product issues, keep product feedback organized

---

## Explicitly NOT My Job Right Now

These are things I have been doing that I need to stop or delegate:

| Activity                                                  | Why I Was Doing It                     | Why I Should Stop                                                                           | Who Should Own It                                      |
| --------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Defining the full product roadmap**                     | No one else was doing it               | Sam was hired for this. Let him lead.                                                       | Sam Ho                                                 |
| **Writing engineering specs**                             | Wanted to be thorough                  | Engineers define their own implementation. I provide business context.                      | Engineering (Bryan's team)                             |
| **Building coded prototypes**                             | It was fast with AI tools              | I'm a PM, not a front-end engineer. Share sketches/wireframes or describe the outcome.      | Adam/Skylar (design) or engineers for technical spikes |
| **Running synthetic jury evaluations**                    | Built a cool validation system         | No one asked for this. Real customer validation with Sam's guidance is the path.            | Deprioritize entirely                                  |
| **Managing PostHog dashboards**                           | Wanted metrics clarity                 | Ask an engineer to instrument. I define what to measure, not how.                           | Engineering + Sam for strategy                         |
| **Creating GTM briefs**                                   | Balls were dropping in PMM             | Tony/Kensi own product marketing. I provide the product context; they create the materials. | Tony/Kensi (PMM)                                       |
| **Running trainings**                                     | Revenue team needed help               | PMM's job. I provide the content; they deliver the training.                                | Kensi/Tony                                             |
| **Writing code** (integrations, bug fixes, feature flags) | "It'll only take me a minute"          | Bryan: "That's a dangerous road because you don't have extra time."                         | Engineering                                            |
| **Building PM workspace tooling** at current scale        | Needed structure, lacked boundaries    | The workspace became the work. Freeze expansion; use what exists.                           | Freeze                                                 |
| **Monitoring 34+ Slack channels**                         | Felt like I needed to catch everything | Pick 5-7 channels max. Use /slack-monitor for the rest on a schedule.                       | Automated + scheduled                                  |

---

## Stakeholder Contract (The Negotiation Starting Point)

### Sam Ho -- VP/GM Product (my manager)

| What I'll do for you                                | What I need from you                                         | What I won't do                                          |
| --------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Project briefs for active initiatives (SCQA format) | Direction on product strategy and discovery                  | Define the roadmap alone                                 |
| Customer context and feedback synthesis             | Mentorship on PM skills (the rubric you shared)              | Make strategy decisions without your input               |
| Sprint deliverables every 2 weeks                   | Clear answer to: "What are my top 3 priorities this sprint?" | Wait in silence -- I will ask often and push for clarity |
| Status updates on what engineering is building      | Decision authority: tell me which decisions are mine         | Take on discovery work without your guidance             |

### Bryan Lund -- Head of Engineering (former manager, mentor)

| What I'll do for you                                  | What I need from you                                             | What I won't do                               |
| ----------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| Facilitate engineering-to-release handoffs            | Tell me when projects need product definition                    | Write code or manage Linear project structure |
| Convert CS feedback into actionable Linear tickets    | Engineering capacity context (who's available, what's realistic) | Create engineering milestones or timelines    |
| Answer "what's the business context?" for any project | Flag when engineers are blocked on product clarity               | Try to fill the engineering runway alone      |
| Keep the EPD/Product Linear team clean and triaged    | Continued mentorship and honest feedback                         | Pretend I know what I'm doing when I don't    |

### Skylar Sanford -- Growth Designer

| What I'll do for you                              | What I need from you                       | What I won't do                |
| ------------------------------------------------- | ------------------------------------------ | ------------------------------ |
| Business context and user stories for design work | Design execution and feedback on solutions | Design the solutions myself    |
| Facilitate Design Kickoff meetings                | Push back if the business case isn't clear | Build coded prototypes         |
| Share customer quotes and research findings       | Collaborate on design direction            | Override your design decisions |

### Tony / Kensi -- Marketing / PMM

| What I'll do for you                                                     | What I need from you                              | What I won't do                         |
| ------------------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------- |
| Product positioning context (what shipped, who it's for, why it matters) | Own the training delivery and PMM materials       | Run the training sessions myself        |
| Feature specs and customer stories                                       | Release communications                            | Write PMM copy or create training decks |
| Answer product questions before launches                                 | Feedback loop: what are customers confused about? | Be the backup when PMM can't deliver    |

### Woody Klemetson -- CEO

| What I'll do for you                                                    | What I need from you                  | What I won't do                                     |
| ----------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| Decision-ready proposals (situation, problem, solution, recommendation) | Decision authority and vision clarity | Brainstorm in expensive meetings without a proposal |
| Status updates routed through Sam                                       | Clear feedback when I'm off track     | Bypass Sam to get answers faster                    |
| Customer signal synthesis                                               | Trust that I'll raise blockers early  | Pretend everything is fine when it isn't            |

---

## The "5 Days Off" Test

_If Tyler didn't work for 5 straight days, what would happen for each initiative?_

### Would Break / Someone Would Notice Immediately (3)

| Initiative                         | What Would Break                                                   | Who Would Feel It          |
| ---------------------------------- | ------------------------------------------------------------------ | -------------------------- |
| **Settings Page Revamp** (P1)      | Jason has 7 active tickets Tyler created; needs business decisions | Jason Harmon, Bryan        |
| **CRM Agent / HubSpot** (P0)       | Active customer feedback loop; revenue team asking questions       | Ben Harrison, revenue team |
| **Release Communication** (ad hoc) | No one translates engineering completions for revenue team         | Sales, CS                  |

### Would Slow Down but Someone Else Could Cover (4)

| Initiative                          | Impact                                                          | Backup                             |
| ----------------------------------- | --------------------------------------------------------------- | ---------------------------------- |
| **Call Import Engine** (P2)         | Ivan's 3 import tickets might stall on business logic questions | Bryan can answer                   |
| **Product Forum Triage** (ongoing)  | Incoming requests would pile up for a week                      | Sam or Skylar could triage         |
| **CS Channel Monitoring** (ongoing) | Feedback gets missed for a few days                             | Ben Harrison catches critical ones |
| **Composio Agent Framework** (P1)   | Design handoff documentation delayed                            | Skylar has context                 |

### Would Not Be Noticed for 5 Days (17)

| Initiative                                | Why Not Noticed                                               |
| ----------------------------------------- | ------------------------------------------------------------- |
| **Condorcet Jury System** (P0 in roadmap) | No one uses this besides Tyler. Internal tooling only.        |
| **Universal Signal Tables** (P0)          | Still in build phase. No external stakeholders waiting.       |
| **Customer Journey Map** (P0)             | Research/documentation work. No one is blocked on this.       |
| **Feature Availability Audit** (P0)       | Internal process work. Can wait a week.                       |
| **Release Lifecycle Process** (P0)        | Process definition. Not blocking any active release.          |
| **Chief of Staff Recap Hub** (P2)         | Prototype exploration. No engineering work started.           |
| **Design System Workflow** (P2)           | Process initiative. Skylar and Adam work independently.       |
| **CRM Readiness Diagnostic** (P2)         | Discovery phase. No one depending on this.                    |
| **Deprecate Pipe Dream** (P1)             | Early discovery. Can pause indefinitely.                      |
| **Automated Metrics Observability** (P3)  | Already deprioritized in roadmap.                             |
| **Admin Onboarding** (P3)                 | No owner assigned. No one is working on this.                 |
| **Speaker ID Voiceprint** (P3)            | Delo owns research. Tyler not involved day-to-day.            |
| **Internal Search** (P3)                  | Discovery phase, no owner assigned.                           |
| **Product Usability** (P2)                | Knox owns execution. Tyler provides context only.             |
| **Rep Workspace** (P0)                    | Brian/Rob own this. Tyler documented it but doesn't drive it. |
| **Settings Redesign** (P2)                | Blocked on Rob/Sam. Tyler can't move this anyway.             |
| **User Onboarding** (P2)                  | Sam owns this initiative.                                     |

### The Verdict

**Only 3 out of 23 initiatives would be immediately impacted if Tyler disappeared for 5 days.**

Of Tyler's 18 "owned" initiatives, **14 would not be noticed for a full work week.**

This confirms Bryan's diagnosis: Tyler is carrying the mental weight of 18 initiatives while only 3 actually need him day-to-day. The other 15 are generating anxiety without generating value.

---

## PM Workspace Simplification Recommendations

### Commands: Keep 11, Simplify 3, Archive 31, Discuss 9

**KEEP (11) -- Directly supports "know what's happening":**
| Command | Why Keep |
|---------|----------|
| `/status` | Check initiative health |
| `/status-all` | Portfolio view |
| `/eod` | Daily capture (get hot potatoes out of head) |
| `/eow` | Weekly reflection |
| `/slack-monitor` | Scheduled Slack scan (don't read channels manually) |
| `/team` | Who's working on what |
| `/morning` | Daily focus planning |
| `/roadmap` | View priorities |
| `/save` | Git operations |
| `/update` | Pull latest |
| `/help` | Command reference |

**SIMPLIFY (3) -- Useful but overbuilt:**
| Command | Recommendation |
|---------|---------------|
| `/sync-dev` | Keep but run weekly, not daily. Don't chase perfection in sync. |
| `/ingest` | Keep for manual signal capture. Remove the 5-source MCP auto-ingest. |
| `/pm` | Keep PRD writing support. Remove the strategic alignment check theater. |

**ARCHIVE (31) -- Outside current role scope:**
`/proto`, `/lofi-proto`, `/validate`, `/iterate`, `/context-proto`, `/placement`, `/figjam`, `/pmm-video`, `/posthog`, `/posthog-sql`, `/figma-sync`, `/brainstorm-board`, `/design`, `/design-handoff`, `/context-review`, `/hypothesis`, `/feature-guide`, `/epd-triage`, `/availability-check`, `/workflow`, `/admin`, `/maintain`, `/agents`, `/setup`, `/design-system`, `/notion-admin`, `/image`, `/collab`, `/block`, `/visual-digest`, `/publish-digest`

**DISCUSS (9) -- Unclear if Tyler should own:**
`/research`, `/triage`, `/share`, `/sync-linear`, `/sync-github`, `/sync-notion`, `/full-sync`, `/new-initiative`, `/merge-initiative`, `/synthesize`

### Skills: Keep 9, Archive 17, Discuss 2

**KEEP (9):**
`activity-reporter`, `daily-planner`, `github-sync`, `initiative-status`, `linear-sync`, `portfolio-status`, `roadmap-analysis`, `slack-sync`, `team-dashboard`

**ARCHIVE (17):**
`brainstorm`, `design-companion`, `digest-website`, `feature-availability`, `jury-system`, `placement-analysis`, `prototype-builder`, `prototype-notification`, `remotion-video`, `visual-digest`, `workflow-engine`, `agents-generator`, `slack-block-kit`, `notion-admin`, `notion-sync`, `signal-routing`, `signals-synthesis`

**DISCUSS (2):**
`prd-writer`, `research-analyst`

### Agents: Keep 3, Archive 19, Discuss 4

**KEEP (3):**
`slack-monitor`, `hubspot-activity`, `linear-triage`

**ARCHIVE (19):**
`context-proto-builder`, `context-reviewer`, `docs-generator`, `feature-guide`, `figjam-generator`, `figma-sync`, `goal-planner`, `iterator`, `posthog-analyst`, `proto-builder`, `remotion-video`, `validator`, `work-judge`, `ship-runner`, `orchestrator`, `signal-ingester`, `signal-router`, `hypothesis-manager`, `workspace-admin`

**DISCUSS (4):**
`research-analyzer`, `signals-processor`, `notion-admin`, `initiative-runner`

### Net Simplification

| Layer     | Current |  Keep  | Archive |     Reduction     |
| --------- | :-----: | :----: | :-----: | :---------------: |
| Commands  |   54    |   14   |   31    |     74% fewer     |
| Skills    |   28    |   9    |   17    |     68% fewer     |
| Agents    |   26    |   3    |   19    |     88% fewer     |
| **Total** | **108** | **26** | **67**  | **75% reduction** |

The 26 remaining components all directly support: knowing what's happening, facilitating communication, and basic PM documentation.

---

## The Initiative Triage

Based on the 5-Day Test and Bryan's role definition, here's what Tyler should actually own:

### Own Actively (3 initiatives)

These need Tyler's attention every day:

1. **Settings Page & Early Access Revamp** -- Active engineering work with Jason. Tyler provides business decisions.
2. **CRM Agent / HubSpot Config** -- Customer-facing. Revenue team needs answers. Tyler translates.
3. **Engineering-to-Release Communication** (not an initiative -- a daily habit) -- What shipped? What's in beta? Who needs to know?

### Support on Request (4 initiatives)

Provide context when asked, don't drive:

4. **Call Import Engine** -- Ivan drives. Tyler answers business questions.
5. **Composio Agent Framework** -- Skylar/Woody drive design. Tyler provides customer context.
6. **Product Usability** -- Knox drives. Tyler provides CS feedback.
7. **Product Forum Triage** -- Weekly triage session, not daily monitoring.

### Transfer to Sam (6 initiatives)

These are strategy/discovery work that Sam should own:

8. **Customer Journey Map** -- Discovery work. Sam's domain.
9. **Rep Workspace** -- Brian/Rob own. Sam should set product direction.
10. **User Onboarding** -- Already listed as Sam's in roadmap.
11. **CRM Readiness Diagnostic** -- Discovery phase. Needs Sam's guidance.
12. **Deprecate Pipe Dream** -- Architecture decision. Needs Sam + Bryan.
13. **Universal Signal Tables** -- Product vision work. Sam should define.

### Deprioritize / Freeze (10 initiatives)

These generated documentation but aren't driving customer outcomes:

14. **Condorcet Jury System** -- Internal tooling. No one asked for it. Freeze.
15. **Feature Availability Audit** -- Good work, but not urgent. Quarterly check.
16. **Release Lifecycle Process** -- Process definition. Document once, don't iterate endlessly.
17. **Design System Workflow** -- Skylar's domain. Tyler doesn't need to own this.
18. **Chief of Staff Recap Hub** -- Prototype exploration. Not a current priority.
19. **Automated Metrics Observability** -- Already deprioritized.
20. **Admin Onboarding** -- No owner, no urgency.
21. **Internal Search** -- Discovery. Not Tyler's to drive.
22. **Speaker ID Voiceprint** -- Delo owns research.
23. **Settings Redesign** -- Merged into Settings Page Revamp already.

### Summary: From 18 owned initiatives to 3 actively owned + 4 on-request

That is an 83% reduction in initiative ownership.

---

_Next document: [operating-rhythm-and-contract.md](operating-rhythm-and-contract.md)_
