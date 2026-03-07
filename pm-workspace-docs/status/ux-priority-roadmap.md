# UX Priority Roadmap

## Objective
Translate the UX/UI review into a phased roadmap that separates immediate runtime blockers, near-term clarity wins, structural IA changes, and future-state agent workspace improvements.

## Audience
Product and engineering leaders deciding sequencing for UX work across reliability, navigation, project experience, agent experience, and memory graph interaction.

## Evidence Basis
- `pm-workspace-docs/status/ux-ui-review.md`
- `pm-workspace-docs/status/ux-flow-map.md`
- `pm-workspace-docs/status/agent-experience-review.md`
- Code and runtime review findings from `orchestrator/`

## Decision And Rationale
### Decision
Sequence the work in four layers:
1. restore route trust
2. improve clarity without major restructuring
3. replatform IA around projects and project-native agents
4. add graph-native memory interaction and future-state agent workspace features

### Rationale
This order reduces user pain quickly while preserving space to validate structural changes before a full IA migration.

## Phase 0: UX Blockers
### Goal
Eliminate route-level instability that makes the app feel unreliable before users can even evaluate the product model.

### Priority items
1. Fix the duplicate `createConvexColumn` export in `orchestrator/src/lib/convex/server.ts`.
2. Re-test routes that were observed to crash after shell load, especially workspace and knowledge-related navigation.
3. Confirm whether route redirects such as `/knowledgebase` and `/personas` are stable and predictable in production.

### Why this comes first
Users cannot form a reliable mental model if navigation produces intermittent crash overlays.

## Phase 1: Quick Wins
### Goal
Improve information scent and reduce confusion without major architectural movement.

### Priority items
1. Add a visible `Projects` concept to navigation and labeling.
2. Clarify the role of `Agents` as catalog/admin, not the primary work entry point.
3. Fix broken deep-link patterns for project tabs, signal linking, and document return flows.
4. Align dashboard columns with actual workspace pipeline configuration.
5. Surface meaningful project maturity indicators on the board, such as evidence, document, prototype, and validation state.

### Expected user impact
- easier navigation
- less context loss
- better understanding of where work actually happens

## Phase 2: Project-First IA
### Goal
Turn the project into the clear cockpit for advancing an initiative.

### Priority items
1. Make the full project page the canonical project experience.
2. Remove or sharply narrow the project modal so it acts only as preview, not competing detail.
3. Reorganize project content into outcome-oriented groups:
   - overview
   - evidence
   - artifacts
   - execution
   - history
4. Route users directly into the project after creation.
5. Make document pages subordinate to project context with strong return-state preservation.

### Expected user impact
- stronger sense of ownership per initiative
- shorter path from evidence to action
- better continuity between research, docs, prototypes, and tickets

## Phase 3: Project-Native Agent Experience
### Goal
Make agents feel like active collaborators inside project work rather than mostly definitions in a library.

### Priority items
1. Add an `Active Work` or `Agents` section inside the project cockpit.
2. Show current runs, blockers, approvals, and outputs in project context.
3. Consolidate execution entry around outcome-based commands and intent routing.
4. Keep the current `Agents` page as a secondary control-plane surface.
5. Improve traceability with structured run traces instead of log-only views.

### Expected user impact
- users ask for outcomes, not agent types
- easier trust in automation
- clearer handoff between agent work and human approval

## Phase 4: Memory Graph IA
### Goal
Unify inbox, signals, personas, and knowledge into one understandable memory model.

### Priority items
1. Define the canonical object model:
   - inbox item = raw intake
   - signal = normalized evidence
   - knowledge = curated durable context
   - persona = actor lens
   - graph = relationship substrate
2. Add provenance and relationship panels to signals, personas, and knowledge.
3. Distinguish suggested vs accepted vs superseded relationships.
4. Make persona pages evidence-backed instead of file-first.
5. Shift knowledge browsing from fixed folder categories toward entity-first navigation.

### Expected user impact
- better trust in memory and automation
- easier explanation of why evidence connects to a project or persona
- less confusion between raw inputs and durable knowledge

## Phase 5: Future-State Control Room
### Goal
Complete the transition into a best-practice multi-agent workspace without losing simplicity.

### Priority items
1. Mature the Elmer panel into a reliable conversational and HITL surface.
2. Mature the `Agent Hub` into a cross-project control room.
3. Add one-hop and two-hop relationship browsing for graph-backed context.
4. Introduce clearer approval queues for graph mutations and major project changes.
5. Consider a dedicated graph canvas only after contextual relationship browsing is working well.

## Prioritization Matrix
### Highest urgency
- Route stability and crash fixes
- Navigation clarity
- Deep-link correctness

### Highest strategic leverage
- Project-first IA
- Project-native agent work
- Canonical memory model

### Nice-to-have after the above
- advanced graph canvas
- richer admin catalog features
- broader generative UI exploration

## Risks And Mitigations
### Risk
Trying to solve navigation, projects, agents, and memory all at once will create churn.

Mitigation:
Sequence by user pain and mental-model leverage, not by code ownership.

### Risk
The team over-optimizes for future-state chat/agent patterns before the project cockpit is clear.

Mitigation:
Use the project cockpit as the anchor surface and let future agent surfaces reinforce that model.

### Risk
Graph concepts get exposed too early as infrastructure language.

Mitigation:
Expose provenance and relationships first, and only expose graph terminology where it helps users reason about trust.

## Concrete Next Actions
1. Treat route reliability as the current release gate for UX work.
2. Convert the Phase 1 quick wins into a narrow implementation ticket set.
3. Prototype the project cockpit information architecture before large route rewrites.
4. Define the future responsibility split between project page, Elmer panel, Agent Hub, and agent catalog.
5. Create a small follow-on spec for `Inbox -> Signal -> Knowledge -> Persona -> Graph` interaction rules and approval boundaries.
