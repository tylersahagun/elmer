# Features Research: Workspace Onboarding Systems

**Research Question:** What features do product workspace onboarding systems have? What's table stakes vs differentiating?

**Context:** Onboarding carousel that discovers pm-workspace structures (initiatives folders, personas, signals, .cursor configs) and auto-populates Elmer workspace. Core value: Tool adapts to user's existing repo structure, not the other way around.

---

## Table Stakes Features

These are must-have features that users expect from any modern developer tool onboarding. Missing any of these creates friction that drives abandonment.

### 1. OAuth Authentication Flow
**Description:** Single-click GitHub authentication with clear permission scopes displayed.

**Why Table Stakes:** Users won't manually configure API tokens. Every competitor (Linear, Vercel, Netlify, Railway) uses OAuth. Friction here = immediate abandonment.

**Complexity:** Low (already implemented in Elmer)

**Dependencies:** GitHub OAuth app configuration

**Evidence from Codebase:** Already implemented via NextAuth at `/src/auth.ts` and `/src/app/api/auth/[...nextauth]/route.ts`

---

### 2. Repository Selection with Search
**Description:** Searchable list of user's repositories with org filtering, showing recent activity and relevance indicators.

**Why Table Stakes:** Users have dozens to hundreds of repos. Scrolling through a flat list is unusable. Linear, Vercel, and Render all provide searchable repo selectors.

**Complexity:** Low (partially implemented)

**Dependencies:** GitHub OAuth with repo scope

**Evidence from Codebase:** `/src/components/settings/GithubRepoSelector.tsx` provides basic repo selection; `/src/app/api/github/repos/route.ts` fetches repos

---

### 3. Progress Indicator
**Description:** Visual step indicator showing current position in multi-step flow (e.g., "Step 2 of 4: Configure Paths").

**Why Table Stakes:** Users need to know how much effort remains. Ambiguity about flow length increases abandonment. Every SaaS onboarding uses progress indicators.

**Complexity:** Low

**Dependencies:** None

---

### 4. Skip/Later Option for Non-Critical Steps
**Description:** Allow users to skip optional configuration and return later. Essential paths required; enhancement paths skippable.

**Why Table Stakes:** Forcing completion of every field before showing value kills conversion. Notion, Linear, and Slack all let users skip onboarding steps.

**Complexity:** Low

**Dependencies:** Persistent state for incomplete onboarding

---

### 5. Error Recovery with Clear Messaging
**Description:** When GitHub API fails or permissions denied, show clear error with actionable resolution (e.g., "Re-authorize with repo scope").

**Why Table Stakes:** Silent failures or cryptic errors destroy trust. Users need to know what went wrong and how to fix it.

**Complexity:** Medium

**Dependencies:** Comprehensive error handling in API routes

---

### 6. Pre-populated Defaults
**Description:** Auto-detect sensible defaults (main branch, common paths like `/docs`, `/initiatives`) rather than empty fields.

**Why Table Stakes:** Empty forms feel like work. Filled forms feel like intelligence. Vercel detects framework, Railway detects language, Netlify detects build commands.

**Complexity:** Medium

**Dependencies:** Repository analysis endpoint

**Evidence from Codebase:** `/src/app/api/github/[owner]/[repo]/analyze/route.ts` already detects `.cursor/`, knowledge paths, persona paths

---

## Differentiators

These features would set Elmer apart from generic onboarding flows. They represent the "tool adapts to you" philosophy.

### 7. Structure Auto-Discovery (High Priority)
**Description:** Scan repo for pm-workspace conventions (initiatives/, _meta.json, personas/, signals/) and auto-map to Elmer concepts. Show discovery results as "We found X initiatives, Y personas, Z signals in your repo."

**Why Differentiating:** Most tools make users recreate their work inside the tool. Elmer reflects existing work. This is the core value proposition.

**Complexity:** High

**Dependencies:**
- GitHub tree API integration
- Pattern matching for folder structures
- `_meta.json` schema parser
- Mapping logic to Elmer data model

**What to Build:**
- Initiatives folder scanner that parses `_meta.json` for status
- Persona folder scanner that extracts persona definitions
- Signal source detector (inbox folders, integration webhooks)
- Mapping preview showing "Your repo -> Elmer"

---

### 8. Visual Mapping Preview
**Description:** Show a visual diagram of discovered structure before import: "initiatives/feature-a -> Project 'Feature A' in Discovery stage".

**Why Differentiating:** Black-box imports are scary. Showing the transformation builds trust and catches misconfiguration before it happens.

**Complexity:** Medium

**Dependencies:** Structure auto-discovery (#7)

---

### 9. Selective Import with Checkboxes
**Description:** Let users choose which discovered items to import. "Import all 12 initiatives" or "Select specific initiatives".

**Why Differentiating:** Not everything in a repo belongs in Elmer. Giving control prevents workspace pollution and shows respect for user's existing organization.

**Complexity:** Medium

**Dependencies:** Structure auto-discovery (#7)

**Evidence from Codebase:** `/src/components/settings/AgentArchitectureImporter.tsx` already implements selective import for agent definitions - can extend pattern

---

### 10. GSD-Style Conversational Discovery
**Description:** Instead of forms, use a chat-like interface: "I found 3 folders in your repo that might be initiatives. Is 'initiatives/' the right one, or is it 'features/'?"

**Why Differentiating:** Forms feel like configuration. Conversation feels like collaboration. GSD (Get Shit Done) workflow uses this pattern for planning.

**Complexity:** High

**Dependencies:**
- Chat UI component
- Question flow state machine
- Decision tree for discovery questions
- Fallback to manual selection

---

### 11. Real-time Discovery Feedback
**Description:** Show live progress as repo is scanned: "Scanning... Found initiatives/ ... Analyzing 15 folders ... Detected 8 initiatives with _meta.json".

**Why Differentiating:** Large repos take time to scan. Real-time feedback prevents "is it frozen?" anxiety and shows the intelligence at work.

**Complexity:** Medium

**Dependencies:**
- Server-sent events or polling
- Incremental discovery API

**Evidence from Codebase:** `/src/app/api/jobs/stream/route.ts` shows SSE pattern already used for execution logs

---

### 12. Agent Architecture Auto-Import (High Priority)
**Description:** Detect and import `.cursor/` configurations (skills, commands, rules, agents) as executable pipeline automation.

**Why Differentiating:** Users who use Cursor/Claude Code have existing agent workflows. Importing these means Elmer can execute their existing automation, not replace it.

**Complexity:** Medium (already partially built)

**Dependencies:**
- Agent definition parser (exists)
- Pipeline column mapping (exists)
- Onboarding flow integration (needed)

**Evidence from Codebase:** `/src/lib/agents/sync.ts` and `/src/components/settings/AgentArchitectureImporter.tsx` implement this - needs carousel integration

---

### 13. Submodule Awareness
**Description:** Detect and handle Git submodules (e.g., prototypes in elephant-ai submodule). Allow configuring paths within submodules.

**Why Differentiating:** Many teams use monorepo patterns with submodules. Ignoring submodules breaks critical workflows like prototype generation.

**Complexity:** High

**Dependencies:**
- Git submodule detection
- Cross-repo file access
- Path resolution across repo boundaries

---

### 14. Branch Selection for Discovery
**Description:** Let users choose which branch to scan (main, develop, feature branch) for structure discovery.

**Why Differentiating:** Work-in-progress may be on feature branches. Scanning only main misses current state. Vercel lets you deploy from any branch.

**Complexity:** Low

**Dependencies:** Branch listing API

**Evidence from Codebase:** `/src/components/settings/BranchSelector.tsx` exists - needs onboarding integration

---

### 15. Validation Before Commit
**Description:** Before finalizing workspace setup, show summary: "This will create 8 projects, sync 24 knowledge docs, import 5 agent skills. Continue?"

**Why Differentiating:** Irreversible actions need confirmation. Showing scope prevents "I didn't mean to import all that" regret.

**Complexity:** Low

**Dependencies:** Structure auto-discovery (#7), selective import (#9)

---

## Anti-Features

These are features that seem logical but would hurt the onboarding experience. Deliberately NOT building these.

### X1. Full Settings Exposure in Onboarding
**Description:** Showing all 50+ workspace settings during initial setup.

**Why Anti-Feature:** Overwhelming users with options before they understand the tool guarantees analysis paralysis. Settings belong in post-setup "edit mode."

**What Instead:** Minimal viable configuration in onboarding; full settings page after workspace created.

---

### X2. Template Selection for Existing Repo Users
**Description:** Asking "What type of project? (SaaS, E-commerce, Mobile...)" when user already has a structured repo.

**Why Anti-Feature:** The repo structure IS the template. Asking this question ignores the user's existing organization and signals that the tool doesn't understand their workflow.

**What Instead:** Phase 2 feature for users WITHOUT existing structure. Phase 1 is discovery-first.

---

### X3. Required Company/Product Metadata
**Description:** Forcing users to enter company name, product description, team size before seeing any value.

**Why Anti-Feature:** This is lead gen disguised as onboarding. Users want to see the tool work, not fill out surveys.

**What Instead:** Optional metadata in settings; discover what you can from repo (README, package.json).

---

### X4. Synchronous Full-Repo Indexing
**Description:** Blocking onboarding until entire repo is indexed/embedded.

**Why Anti-Feature:** Large repos can take minutes to fully process. Blocking means user stares at spinner instead of exploring.

**What Instead:** Async indexing with immediate workspace creation. Show "Knowledge base syncing..." as background task.

**Evidence from Codebase:** Current implementation already does async knowledge sync in `/src/app/api/workspaces/route.ts` - good pattern to maintain.

---

### X5. Multi-Repo Workspace Setup
**Description:** Allowing workspace to span multiple GitHub repos in initial onboarding.

**Why Anti-Feature:** Adds complexity for edge case. Most users have one primary repo per workspace. Multi-repo is a power user feature for later.

**What Instead:** One workspace = one repo. Add repos later via settings if needed (or explicitly scope to "not planned").

**Evidence from Codebase:** PROJECT.md marks this as "Not planned (one workspace = one repo)" - correct decision.

---

### X6. Auto-Commit Changes During Onboarding
**Description:** Automatically committing discovered structure changes back to repo during setup.

**Why Anti-Feature:** Users haven't validated the mapping yet. Auto-commits could pollute their repo with incorrect changes.

**What Instead:** Discovery is read-only. Write operations (like creating _meta.json for new initiatives) require explicit user action post-onboarding.

---

## Feature Dependencies Graph

```
OAuth Auth (1) ─────┬──> Repo Selection (2)
                    │
                    └──> Branch Selection (14)
                              │
                              v
                    Structure Discovery (7) ──┬──> Visual Mapping (8)
                              │               │
                              │               └──> Selective Import (9)
                              │                           │
                              v                           v
                    Agent Import (12) ──────────> Validation Summary (15)
                              │
                              v
                    Progress Indicator (3) + Real-time Feedback (11)
```

---

## Complexity Summary

| Complexity | Features |
|------------|----------|
| Low | OAuth (1), Repo Selection (2), Progress (3), Skip Option (4), Branch Selection (14), Validation (15) |
| Medium | Error Recovery (5), Pre-populated Defaults (6), Visual Mapping (8), Selective Import (9), Real-time Feedback (11), Agent Import (12) |
| High | Structure Discovery (7), Conversational Discovery (10), Submodule Awareness (13) |

---

## Recommended Build Order

**Phase 1A - Foundation (Must have for launch):**
1. Progress Indicator (3)
2. Skip Option (4)
3. Error Recovery (5)
4. Pre-populated Defaults (6)

**Phase 1B - Core Differentiator:**
5. Structure Auto-Discovery (7)
6. Visual Mapping Preview (8)
7. Selective Import (9)
8. Validation Summary (15)

**Phase 1C - Enhancement:**
9. Agent Architecture Import integration (12)
10. Branch Selection integration (14)
11. Real-time Discovery Feedback (11)

**Phase 2 - Advanced:**
12. GSD-Style Conversational Discovery (10)
13. Submodule Awareness (13)

---

## Key Insight

The central differentiator is **discovery over configuration**. Most onboarding flows are "tell us about your project." Elmer's onboarding should be "let us show you what we found in your project."

This inverts the power dynamic: the tool proves it understands the user's existing work before asking for anything.
