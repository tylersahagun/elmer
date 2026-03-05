# PM Workspace Overview

> A concise briefing document for anyone (human or AI) who needs to understand what this workspace is, why it exists, and what it does.

My personal PM-Workspace Github Repo: https://github.com/tylersahagun/pm-workspace
AskElephant's Github Repo: https://github.com/AskElephant/elephant-ai
AskElephant's Web App: https://app.askelephant.ai/

---

## Who I Am

I'm Tyler Sahagun, a Junior Product Manager at AskElephant. I report to Sam Ho (VP/GM Product). I have a Computer Science degree and came up through Implementation, Customer Success, and Solutions Engineering before moving into Product about ten months ago.

My core job has three parts:

1. **Know what is happening across product** — status, blockers, next steps for all active projects
2. **Facilitate the engineering-to-release handoff** — translate what engineering ships into clear communication for revenue teams and customers
3. **Learn product discovery from Sam** — build strategic muscle around research, roadmapping, and prioritization

I am explicitly _not_ defining the full roadmap (Sam owns that), writing engineering specs, or running marketing trainings. I own a handful of initiatives at a time and operate as a connector between engineering output and business impact.

---

## What AskElephant Is

AskElephant is a **revenue outcome system** for B2B sales and customer success teams. It captures customer conversations (meetings, calls), structures the data, and turns it into actions — CRM updates, coaching insights, deal risk detection, and follow-ups.

The key framing: we are not a note-taker. We are building toward a revenue operating system where AI orchestrates outcomes while keeping humans in control.

The product is a web application (the `elephant-ai` submodule in this repo). That codebase is the primary target of any prototype, design, or feature work I do.

---

## The Pain Points This Workspace Solves

Product management at a startup is fragmented. Information lives everywhere — Slack, Linear, Notion, HubSpot, GitHub, Figma, customer calls. The PM's job is to synthesize all of it into clear decisions, but the actual work of _gathering and organizing_ that information is enormous and repetitive.

Specific problems:

- **Discovery is scattered.** Customer signals come from Slack channels, HubSpot deals, support tickets in Linear, and call transcripts. There is no single place where evidence accumulates around a hypothesis.
- **Translating research into specs is manual.** Going from "we heard X from customers" to a structured PRD with outcome chains, personas, and success metrics requires pulling together context from many sources every time.
- **Prototyping requires codebase context.** Building a UI prototype for `elephant-ai` means understanding the existing component structure, design system, and where a new feature should live in the app. That context-gathering step is slow.
- **Status visibility is expensive.** Answering "where are we on everything?" requires checking Linear, GitHub PRs, Notion, and Slack. Assembling that into a coherent picture for leadership takes time away from actual product work.
- **Communication is manual and repetitive.** End-of-day reports, weekly summaries, stakeholder updates — these are valuable but tedious to compile by hand.
- **Consistency is hard.** Without a system, initiatives have inconsistent documentation. Some have PRDs, some don't. Some have research, some are just vibes. Quality depends on whether I remembered to follow the process.

---

## What This Workspace Is

This PM workspace is a **Cursor IDE project** that wraps structured PM processes around AI agents. It contains:

- **Company context files** — product vision, strategic guardrails, org chart, persona definitions. These ground every piece of PM work in what actually matters to the business.
- **Initiative folders** — one per feature/project, each following a consistent structure (research, PRD, design brief, engineering spec, prototype notes, go-to-market brief).
- **The `elephant-ai` submodule** — the actual product codebase where prototypes get built as Storybook components.
- **AI agent configurations** — commands, skills, and subagent definitions that automate the repetitive parts of PM work.

---

## The Product Flow

Every initiative follows a lifecycle. The workspace enforces this through folder structure and graduation criteria:

```
Discovery → Define → Build → Validate → Launch
```

### Discovery

Gather evidence that a problem is worth solving. Pull signals from Slack, HubSpot, Linear, and customer calls. Save research with verbatim quotes. Identify which persona is affected. The output is a `research.md` file with enough evidence to justify moving forward.

### Define

Turn research into a structured plan. Write a PRD with clear outcome chains (feature → behavior change → business result). Create a design brief. Define success metrics. The key test: can you explain why this matters to the business in one sentence?

### Build

Build a prototype in the `elephant-ai` codebase as Storybook components. This includes multiple creative directions, all required states (loading, success, error, empty), and interactive flow stories. The prototype lives in the actual codebase so it can be reviewed in context.

### Validate

Run the prototype through evaluation. Check graduation criteria (is the PRD complete? are all states handled? does it pass the outcome chain test?). Get stakeholder feedback. The output is a validation report with a clear recommendation: advance, iterate, or block.

### Launch

Coordinate the release. GTM brief, feature flag configuration, stakeholder demos, release communication to the revenue team.

At each transition, specific artifacts must exist. This prevents initiatives from advancing without the right level of rigor.

---

## How the Agents Work (High Level)

The workspace uses Cursor's agent system to automate repetitive PM tasks. The architecture is simple:

- **Commands** are what I type (like `/eod`, `/research`, `/proto`). They are thin routing layers that delegate to the right handler.
- **Skills** are packages of procedural knowledge — step-by-step instructions for tasks like "how to write a PRD" or "how to sync Linear data." They get loaded when relevant.
- **Subagents** run complex multi-step workflows in isolated context. They read the right files, call the right APIs, and produce structured output. Examples: analyzing a transcript, building a prototype, running a validation.

The agents have access to external tools via MCP (Model Context Protocol) — Slack, Linear, Notion, HubSpot, PostHog, GitHub, Figma, Gmail, Google Calendar. This means they can pull real data, not just work with what's in local files.

**What the agents do not do:** make decisions. They gather information, structure it, and present options. I make the calls.

---

## What This Workspace Produces

On a given day, this workspace helps me:

- **Pull activity from everywhere** and compile it into end-of-day or end-of-week reports
- **Ingest customer signals** from Slack, HubSpot, or Linear into structured signal files linked to initiatives
- **Write PRDs** grounded in company vision, with guardrails that push back if outcomes are unclear
- **Build prototypes** in the `elephant-ai` Storybook with design system awareness and placement analysis
- **Track portfolio status** across all initiatives with consistent health scoring
- **Sync with external tools** (Linear projects, Notion databases, GitHub PRs) to keep the workspace current
- **Monitor communication channels** (Slack, Gmail) for things that need my attention

The end result: I spend less time gathering and organizing, and more time thinking, deciding, and communicating.

---

## Communication Hub & Application Management

The workspace is not just a documentation system — it is a **live communication hub** that connects to every tool the team uses. Through MCP (Model Context Protocol) integrations, the workspace has authenticated, real-time access to:

| System              | What It Provides                                                           | How the Workspace Uses It                                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slack**           | Team conversations, customer signals, revenue wins, engineering updates    | Monitor channels for product-relevant activity. Pull signals from customer feedback channels. Send formatted reports and updates to stakeholders. Scan for messages that need my response.                                                         |
| **Linear**          | Engineering task tracking, sprint cycles, project status                   | Sync project progress to initiative folders. Check what's in progress, blocked, or shipped. Create issues when product work surfaces engineering needs. Map Linear projects to PM workspace initiatives.                                           |
| **Notion**          | Source-of-truth project database, PRDs, engineering specs, launch planning | Push initiative status and documentation upstream to the Notion Projects database. Keep Notion in sync as the canonical view that leadership and the broader team reference. Pull specs and briefs that engineers or designers have written there. |
| **GitHub**          | Code changes, pull requests, releases, shipping velocity                   | Track what has actually shipped by mapping PRs to initiatives. Generate release notes. Understand engineering velocity and what's in review.                                                                                                       |
| **HubSpot**         | Deals, pipeline, customer data, churn signals                              | Pull revenue wins and losses for reports. Ingest deal notes and churn reasons as product signals. Understand which customers are affected by specific features.                                                                                    |
| **PostHog**         | Product analytics, feature flags, experiments, user behavior               | Check which features are live and for whom. Validate that shipped work is being adopted. Query usage data to support or challenge product hypotheses.                                                                                              |
| **Figma**           | Design files, components, prototypes                                       | Extract design specs and sync them into Storybook prototypes. Pull component details for implementation.                                                                                                                                           |
| **Gmail**           | Email threads, stakeholder communication                                   | Triage inbox for items requiring product decisions. Draft responses. Track follow-ups.                                                                                                                                                             |
| **Google Calendar** | Meetings, focus blocks, schedule                                           | Pull meeting context for daily planning. Create focus blocks for deep work.                                                                                                                                                                        |

### The Communication Flow

The workspace acts as a **central nervous system** between these tools. The typical flow looks like:

```
Information comes IN from:          The workspace:              Information goes OUT to:
─────────────────────────           ──────────────              ───────────────────────
Slack (customer feedback)    →      Structures it as           → Notion (project updates)
HubSpot (deal signals)       →      signals and research       → Slack (stakeholder reports)
Linear (engineering status)  →      Links it to initiatives    → Linear (new issues, labels)
GitHub (what shipped)        →      Checks strategic alignment → Gmail (stakeholder replies)
PostHog (usage data)         →      Compiles into reports      → Leadership (EOD/EOW summaries)
Gmail (stakeholder asks)     →      Updates the roadmap
Figma (design specs)         →
```

### Notion as Source of Truth

Notion is where the rest of the company looks for project status. The workspace keeps Notion's Projects database current by:

- Syncing initiative phase, status, and owner from PM workspace to Notion
- Pushing PRDs, design briefs, and engineering specs as subpages under each Notion project
- Updating project status when milestones are hit or blockers emerge
- Creating new Notion projects when initiatives reach the Define phase

This means I do my working-level PM work locally (where the agents, context, and codebase live), and the workspace handles pushing the results to Notion so that leadership, engineering, and design always have a current view without me manually updating two systems.

### Stakeholder Communication

The workspace compiles and formats updates for different audiences:

- **End-of-day reports** — what happened today across all active work, pulled from GitHub commits, Linear progress, Slack activity, and HubSpot revenue wins
- **End-of-week reports** — trend analysis, portfolio health, what shipped, what's blocked, what needs attention
- **Slack digests** — scan all relevant channels and surface what needs my attention, classified by priority
- **Email triage** — classify incoming email, draft responses for action items, archive noise

The goal is that at any given moment, I can answer "what's happening?" without manually checking six different tools. And when a stakeholder asks, I can produce a structured, evidence-backed answer quickly because the data is already organized.

---

## Repository Structure (Key Paths)

| What                        | Where                                        |
| --------------------------- | -------------------------------------------- |
| This overview               | `pm-workspace-docs/pm-workspace-overview.md` |
| Company context             | `pm-workspace-docs/company-context/`         |
| Initiative folders          | `pm-workspace-docs/initiatives/[name]/`      |
| Roadmap                     | `pm-workspace-docs/roadmap/`                 |
| Signals (customer feedback) | `pm-workspace-docs/signals/`                 |
| Status reports              | `pm-workspace-docs/status/`                  |
| Agent instructions          | `AGENTS.md` (root)                           |
| Agent configs               | `.cursor/` (commands, skills, agents, rules) |
| Product codebase            | `elephant-ai/` (git submodule)               |
| Prototypes                  | `elephant-ai/web/src/components/prototypes/` |

---

## The Bottom Line

This workspace exists because product management is fundamentally an information synthesis job, and most of the synthesis work is mechanical — pulling data from tools, structuring it consistently, checking it against strategic context, and communicating it clearly. AI agents handle the mechanical parts. I handle the judgment.
