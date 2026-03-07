# Elmer UX/UI Review

## Objective
Provide a full-site UX/UI review of the Elmer orchestrator that preserves the existing glassmorphic aurora design language while improving information architecture, task flow, and agent usability.

## Audience
Product, design, and engineering leads deciding how Elmer should evolve from a visually strong alpha into a clearer project-first agent workspace.

## Evidence Basis
- Product direction from `elmer-docs/company-context/product-vision.md` and `elmer-docs/company-context/strategic-guardrails.md`
- Current implementation in `orchestrator/src/app/(dashboard)/` and `orchestrator/src/components/`
- Forward-looking architecture in `AGENT-BRIEF.md` and `pm-workspace-docs/the-grand-apparatus/*.md`
- Agent-experience principles from [Agent Experience](https://agent-experience.dev/), especially [Multi-Agent Workspaces](https://agent-experience.dev/multi-agent-workspaces), [Memory Patterns](https://agent-experience.dev/memory), [Human-in-the-Loop](https://agent-experience.dev/human-in-loop), [Observability & Tracing](https://agent-experience.dev/observability), and [Routing & Intent Detection](https://agent-experience.dev/routing)
- Runtime browser inspection of `https://elmer.studio`

## Executive Summary
Elmer is already close to the right visual identity. The design language feels differentiated, minimal, and aligned with the product vision's "beautiful minimalism" principle. The main UX problem is not aesthetic inconsistency. It is that the app currently teaches the wrong mental model.

Today, the UI presents a workspace-centric collection of surfaces such as `Dashboard`, `Knowledge`, `Personas`, `Signals`, `Agents`, `Inbox`, and `Settings`, while the actual work of moving ideas to validated prototypes happens inside projects. At the same time, agents are surfaced primarily as a catalog of definitions and capabilities, even though the product promise is about agents doing work inside projects. This creates an avoidable split between how the product looks, how it is organized, and how users actually need to operate.

The review conclusion is straightforward:
- Keep the existing design language.
- Make projects the primary work cockpit.
- Reframe agents as visible collaborators and project operators, not mostly as a definition catalog.
- Turn inbox, signals, personas, and knowledge into one coherent memory system with provenance and human review.

## Strategic Fit
This direction strongly supports the product vision:
- Discovery compression improves when evidence, artifacts, and actions are organized around a project instead of scattered across multiple top-level surfaces.
- Engineering waste drops when project state, evidence quality, and validation readiness are clearer in one place.
- Iteration becomes more natural when a project's next best action, active agents, and evidence chain are visible together.
- Human-in-the-loop control improves when approvals are tied to project decisions and relationship changes instead of hidden in generic logs or side channels.

## Top Findings
### 1. Projects are the real unit of work, but not the primary unit of navigation
The app's deepest work happens in `orchestrator/src/app/(dashboard)/projects/[id]/ProjectDetailPage.tsx`, yet navigation centers workspace utilities instead of projects. This weakens information scent and makes deep work feel secondary.

### 2. The current Agents surface optimizes for governance, not for execution
`orchestrator/src/components/agents/AgentsList.tsx` groups imported definitions by `AGENTS.md`, `Skills`, `Commands`, `Subagents`, and `Rules`. That is useful for administration and provenance, but not for a user asking, "What should happen next on this project?"

### 3. The memory model is split across storage types instead of durable entities
Inbox items, signals, personas, knowledge entries, and graph nodes behave like parallel systems. The graph exists architecturally, but users still interact with files, fixed categories, and workflow buckets more than with relationships, provenance, and accepted evidence.

### 4. Multiple overlapping surfaces compete for the same user question
There are several places to inspect or trigger work:
- workspace dashboard
- project modal
- project page
- inbox modal
- inbox page
- agents page
- commands panel
- Elmer panel

This makes the product feel more powerful than coherent.

### 5. Immediate runtime stability is currently part of the UX problem
The browser pass showed an initial usable shell at `https://elmer.studio`, but several routes then crashed into a build/client exception tied to `orchestrator/src/lib/convex/server.ts`, where `createConvexColumn` is defined twice. This means some UX issues are structural while others are currently blocked by runtime reliability.

## Runtime Findings
### What loaded
- Root and workspace shell navigation were reachable.
- The workspace route showed nav and the Elmer side panel shell.
- `Knowledge` and other redirects began to navigate.

### What broke
- After initial shell render, multiple routes crashed into an application/build error.
- The runtime overlay pointed to `orchestrator/src/lib/convex/server.ts`.
- `rg` confirms duplicate `createConvexColumn` exports in that file.

### Why this matters for UX
Even before IA improvements, navigation trust is being broken by route instability. Users cannot build a coherent mental model if the shell loads and then collapses into an error state when they attempt to move between key areas.

## Decisions And Rationale
### Decision 1
Treat the project as the default container for work, evidence, agent execution, and stage progression.

Rationale:
This aligns the product model with the product promise and reduces navigation overhead between discovery, documentation, validation, and execution.

### Decision 2
Demote the current Agents page into a secondary control-plane surface.

Rationale:
Users should not need to think in terms of skills, rules, or imported command definitions to move a project forward. That is useful for builders and operators, but not as the center of the user journey.

### Decision 3
Use the memory graph as the canonical relationship layer, while keeping `Inbox`, `Signals`, `Knowledge`, and `Personas` as user-facing lenses into that system.

Rationale:
This avoids exposing graph infrastructure directly while still giving users a strong sense of provenance, confidence, and relationship context.

### Decision 4
Preserve the visual system and spend design energy on flow, guidance, and context clarity.

Rationale:
The current brand and styling are already distinctive and aligned with the vision. The main return on effort is in experience architecture, not visual reinvention.

## Risks And Mitigations
### Risk
Making projects more central could overcomplicate project pages.

Mitigation:
Turn project detail into a guided cockpit with stronger defaults and progressive disclosure, instead of adding more parallel tabs and panels.

### Risk
Moving agents out of the primary top-level mental model could hide important admin capabilities.

Mitigation:
Keep a catalog and admin surface, but reposition it as a builder/operator layer instead of the default work entry point.

### Risk
Exposing graph relationships poorly could feel abstract or academic.

Mitigation:
Prioritize contextual provenance panels, accepted vs suggested edges, and one-hop relationship views before adding any dedicated graph canvas.

### Risk
Strategic review work gets overshadowed by current route crashes.

Mitigation:
Treat runtime reliability as the first UX unblocker, then sequence the deeper IA changes.

## Recommended Product Principles
1. One project, one primary cockpit.
2. One clear answer to "what needs my attention next?"
3. Agents are coworkers attached to outcomes, not just capabilities in a library.
4. Evidence should move from raw intake to structured signal to accepted knowledge with visible provenance.
5. Human approval should happen at meaningful decision boundaries, especially project changes and relationship promotions.

## Concrete Next Actions
1. Fix the immediate route/runtime blocker caused by duplicate `createConvexColumn` exports in `orchestrator/src/lib/convex/server.ts`.
2. Redesign IA around `Workspace` as portfolio view and `Project` as primary work view.
3. Recast `Agents` into two surfaces: project-native active work and secondary catalog/admin.
4. Define a canonical object model for `Inbox -> Signal -> Knowledge`, with personas and projects linked through graph-backed relationships.
5. Implement clearer HITL and observability surfaces that live with project work rather than only in global logs or agent configuration flows.
