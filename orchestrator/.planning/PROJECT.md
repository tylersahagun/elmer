# Elmer: Workspace-Aware Product Development Platform

## What This Is

Elmer is a workspace orchestrator that connects to your GitHub repository's existing project structure and makes it executable. Instead of forcing users to recreate their workflow inside a new tool, Elmer discovers your initiatives, context files, personas, and signals already in your repo, then provides agents and automation that work within your established system. Think of it as a lens over your pm-workspace, not a parallel system to maintain.

## Core Value

When you create a workspace, Elmer automatically discovers and populates your existing work - initiatives become projects, personas sync, signals flow into an inbox - all without recreating or manually mapping. The tool adapts to your structure, not the other way around.

## Requirements

### Validated

- ✓ GitHub OAuth authentication with repo access — existing
- ✓ GitHub API integration (read repos, files, tree structure) — existing
- ✓ GitHub write operations (commits, branches, PRs) — existing
- ✓ Workspace data model with settings JSONB — existing
- ✓ Workspace-to-project relationships — existing
- ✓ Knowledge base sync from contextPath — existing
- ✓ Agent architecture analyzer (detects .cursor/, AGENTS.md, skills, commands) — existing
- ✓ Stage-based Kanban board for projects — existing
- ✓ Signal ingestion and processing — existing
- ✓ Multi-tenant workspace isolation — existing
- ✓ NextAuth session management — existing
- ✓ Drizzle ORM data layer — existing
- ✓ Onboarding carousel wizard UI (multi-step, conversational) — v1.0
- ✓ GSD-style question flow for repo structure discovery — v1.0
- ✓ Auto-detect initiatives folder and parse initiative directories — v1.0
- ✓ Parse initiative metadata (_meta.json) to determine project status — v1.0
- ✓ Auto-populate projects table from discovered initiatives — v1.0
- ✓ Map projects to Kanban columns based on status from _meta.json — v1.0
- ✓ Auto-detect and configure context paths (knowledge base, personas, signals) — v1.0
- ✓ Auto-detect prototype path (especially in submodules) — v1.0
- ✓ Integrate agent architecture import into onboarding flow — v1.0
- ✓ Restructure settings page: move initial setup to onboarding, make settings "edit mode" — v1.0
- ✓ Real-time onboarding progress indicators — v1.0
- ✓ SSE streaming for discovery progress with cancellation support — v1.0
- ✓ Conversational disambiguation for ambiguous repository structures — v1.0
- ✓ Git submodule detection and scanning — v1.0
- ✓ GitHub writeback with atomic commits for all Elmer-generated work — v1.0
- ✓ Agents management page with execution and history — v1.0
- ✓ Column automation configuration and triggers — v1.0

### Active

None - v1.0 milestone complete. v2.0 requirements to be defined.

### Out of Scope

- Template generation for new users (no pm-workspace structure) — Deferred to v2.0
- Company URL research and auto-generation — Deferred to v2.0
- Creating pm-workspace folder structure in user repos — Deferred to v2.0
- Multi-repo workspaces — Not planned (one workspace = one repo)
- Non-GitHub version control (GitLab, Bitbucket) — Not planned
- Elmer-native storage separate from repo — Explicitly rejected

## Context

**Existing System:**
Elmer already has GitHub integration, workspace management, agent execution, and a stage-based Kanban system. The current workflow requires manual configuration: users enter repo URL, context paths, agent settings in a settings page after workspace creation. This is "inside-out" - it assumes users understand the system before they configure it.

**User's Existing Structure (pm-workspace):**
The reference implementation is a GitHub repo with:
- `/initiatives/` - Projects organized by folder (each has decisions.md, PRD, research, _meta.json)
- `/pm-workspace-docs/` - Knowledge base with company context, personas, floating docs, signals
- `/.cursor/` - Agent definitions, commands, rules, skills portfolio in AGENTS.md
- Submodule (elephant-ai) where prototypes are generated

**The Problem:**
Users either abandon Elmer (too complex) or misconfigure it (doesn't fit their workflow). There's no bridge between existing work in GitHub and Elmer's interface. Manual setup creates documentation debt: users must read docs to understand each setting.

**The Transformation:**
After onboarding completes, users see their initiatives already populated as projects, knowledge base synced, personas mapped, signals ready. The onboarding carousel becomes the primary configuration interface, and the settings page becomes an edit interface.

## Constraints

- **Tech stack:** Next.js 16, React 19, TypeScript, Drizzle ORM, PostgreSQL — Must work within existing architecture
- **Timeline:** Phase 1 (existing repo flow) before Phase 2 (template generation) — Prioritize the primary use case
- **Submodule support:** Must handle repos with submodules (prototypes in elephant-ai/web/src/components/prototypes/) — Critical for user's workflow
- **GitHub dependency:** Workspace creation requires GitHub connection — One workspace = one repo
- **Backward compatibility:** Existing workspaces must continue to function — Don't break current users

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Onboarding carousel over settings-first | Settings assume users know what to configure; carousel discovers and guides | ✅ Delivered - Phase 1 wizard infrastructure |
| Auto-populate from initiatives folder | Users already organize work in GitHub; Elmer should reflect that reality | ✅ Delivered - Phase 2 discovery and population |
| Move settings to "edit mode" | Initial setup happens in onboarding; settings become post-creation tweaks | ✅ Delivered - Phase 1 settings refactoring |
| Phase 1: existing repos only | User's primary use case is pm-workspace structure; template generation is secondary | ✅ Delivered - Template generation deferred to v2.0 |
| GSD-style questioning | Conversational discovery feels collaborative, not interrogative | ✅ Delivered - Phase 4 conversational disambiguation |
| SSE streaming for progress | Real-time feedback reduces perceived wait time and provides transparency | ✅ Delivered - Phase 3 streaming infrastructure |
| Submodule support | Critical for user's prototype workflow in elephant-ai submodule | ✅ Delivered - Phase 4 submodule detection and scanning |
| GitHub writeback with atomic commits | All work lives in repo, not just Elmer database; small focused commits | ✅ Delivered - Phase 5 writeback service |
| Agents page for execution | Centralized agent management separate from automation configuration | ✅ Delivered - Phase 6 agents UI |
| Column automation triggers | Drag-and-drop to column triggers configured auto-runs automatically | ✅ Delivered - Phase 6 automation service |

---
*Last updated: 2026-01-27 after v1.0 milestone completion*
