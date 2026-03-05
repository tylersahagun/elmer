# Engineering Spec Generator

> **Output:** A complete engineering specification ready for implementation.
> **Owner:** Tyler / Bryan

## Prompt

You are generating an Engineering Specification for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**Linear** — Find the project/epic and all related issues:
- Pull all issue descriptions, technical notes, and engineer comments
- Identify the build sequence from issue dependencies and labels
- Note any blocked issues and what they're waiting on
- Check for tech debt or refactoring issues tagged in the area

**GitHub (elephant-ai repo)** — Deep dive into the codebase:
- Search `elephant-ai/` for the relevant modules, services, and components
- Read the existing data models (Prisma schema, TypeScript types) in the feature area
- Check existing API routes in `elephant-ai/apps/api/` for endpoints that will be modified or extended
- Review recent PRs to understand the team's patterns and conventions
- Search for the feature flag setup patterns used in other features
- Check `elephant-ai/packages/` for shared utilities or services relevant to the feature

**PRD** — Read the requirements:
- Read the PRD at `pm-workspace-docs/initiatives/active/[initiative]/prd.md`
- Map every P0 requirement to acceptance criteria
- Note the success metrics that need instrumentation

**Transcripts & Signals:**
- Search transcripts for technical discussions about the approach
- Search Slack (#engineering, #product) for architecture discussions
- Note any technical constraints or preferences expressed by Bryan or engineers

**PostHog:**
- Look up the feature flag naming convention used in PostHog
- Check existing instrumentation patterns for similar features

**Production DB (postgres-prod):**
- If relevant, check the current schema for tables that will be modified
- Understand current data relationships

### Step 2: Write the Eng Spec

Write for engineers. Be precise about APIs, data models, and sequences. Don't over-specify implementation details — leave room for engineering judgment.

**Required sections:**

1. **TL;DR for Engineers** — Bullet list:
   - What: one sentence
   - Why now: one sentence
   - Success looks like: one sentence
   - Scope boundary: in / explicitly out
   - Ship date: target

2. **Technical Approach** — High-level architecture. How this fits into the existing system. Include ASCII architecture diagram if helpful. Reference specific existing code paths.

3. **API Changes** — Tables for:
   - New Endpoints (Method, Path, Description)
   - Modified Endpoints (Method, Path, Change)
   - Schema Changes (code blocks with new fields, modified types)
   Source from GitHub code analysis and PRD requirements.

4. **Data Model** — New tables/collections (Table, Fields, Purpose). Migrations needed. Source from Prisma schema analysis.

5. **Dependencies** — Table: Dependency, Owner, Status, Blocking? Source from Linear blocked issues.

6. **Build Sequence** — Numbered steps with dependency notes. Source from Linear issue ordering and team discussions.

7. **Acceptance Criteria** — `Given [context], when [action], then [expected result]` format. Map directly from PRD P0 requirements.

8. **Edge Cases** — Table: Scenario, Expected Behavior. Source from Linear bug reports, QA discussions, and PRD edge cases.

9. **Feature Flag** — Flag name (follow PostHog convention), rollout plan (Internal → Closed Beta → Open Beta → GA), kill switch mechanism.

10. **Autonomy Boundaries** — Two-column table:
    - Engineer decides: implementation details, code structure, error messages, perf optimizations
    - Needs Tyler/Bryan approval: scope changes, new dependencies, user-facing flow changes, data model changes

11. **Definition of Done** — Checkboxes. Include: acceptance criteria pass, feature flag configured, unit tests, staging verified, Tyler demo, no P0 bugs.

**Footer:** `_Owner: Tyler / Bryan_ / _Last updated: [date]_`
