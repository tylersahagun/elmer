# Project Research Summary

**Project:** Workspace Onboarding & Repository Discovery
**Domain:** Developer Tool Onboarding with GitHub Integration
**Researched:** 2026-01-25
**Confidence:** HIGH

## Executive Summary

This research covers building an onboarding carousel that discovers pm-workspace structures (initiatives folders, personas, signals, .cursor configs) in GitHub repositories and auto-populates Elmer workspaces. The core value proposition is "tool adapts to user's existing repo structure, not the other way around."

The recommended approach is discovery-first onboarding that leverages Elmer's existing Next.js 16 + React 19 + Radix UI + Framer Motion stack. No new major dependencies are required—all capabilities exist in the current stack. The primary implementation work involves building custom components with existing primitives: multi-step wizard state management using Zustand with sessionStorage persistence, conversational discovery UI extending the existing ChatSidebar pattern, and repository analysis using the existing @octokit/rest integration with custom heuristics.

The critical risk is assuming uniformity in user repositories. Most onboarding failures stem from hardcoded path expectations, blocking UX during async operations, and silent failures that erode trust. Mitigation requires pattern-based discovery with fallbacks, streaming progress updates, and comprehensive error recovery with actionable messaging. The "just works" user expectation is the hardest promise to keep—users have wildly different folder structures, varying _meta.json schemas, monorepos, submodules, and branch workflows that must all be gracefully handled.

## Key Findings

### Recommended Stack

All required technologies are already in place. The existing codebase has most foundational pieces—the primary gaps are multi-step wizard state management, structured conversation flow UI, and initiative detection heuristics. No new major dependencies are required.

**Core technologies:**
- **Zustand with persist middleware**: State management for wizard flow with sessionStorage persistence to survive page refreshes during onboarding
- **Existing Framer Motion/Motion setup**: Carousel transitions, step animations, discovery item stagger effects using existing springPresets and staggerContainer patterns
- **@octokit/rest integration**: GitHub repository analysis via existing API routes (tree traversal, file fetching) with custom heuristic-based structure detection
- **Existing SSE pattern**: Real-time progress updates reusing the execution worker's streaming infrastructure
- **Custom wizard components**: Built with Radix Dialog primitives rather than heavyweight form libraries (react-hook-form/formik are overkill for this use case)

**Critical insight from stack research:** Build custom components with existing primitives rather than adding wizard libraries. Onboarding is not a traditional form submission flow—it's a discovery/configuration flow with async GitHub calls. Libraries like react-multi-step-form and formkit/wizard add complexity without value for this specific use case.

### Expected Features

The central differentiator is **discovery over configuration**. Most onboarding flows are "tell us about your project." Elmer's onboarding should be "let us show you what we found in your project." This inverts the power dynamic: the tool proves it understands the user's existing work before asking for anything.

**Must have (table stakes):**
- OAuth authentication flow — single-click GitHub auth (already implemented)
- Repository selection with search — searchable list with org filtering (partially exists in GithubRepoSelector.tsx)
- Progress indicator — visual step indicator showing "Step 2 of 4: Configure Paths"
- Skip/later option — allow skipping optional configuration steps
- Error recovery with clear messaging — actionable error messages with resolution paths
- Pre-populated defaults — auto-detect sensible defaults (main branch, common paths) rather than empty forms

**Should have (competitive differentiators):**
- Structure auto-discovery — scan repo for pm-workspace conventions and auto-map to Elmer concepts (HIGH PRIORITY)
- Visual mapping preview — show "initiatives/feature-a -> Project 'Feature A' in Discovery stage" before import
- Selective import with checkboxes — let users choose which discovered items to import
- Real-time discovery feedback — show live progress as repo is scanned: "Found initiatives/ ... Analyzing 15 folders ..."
- Agent architecture auto-import — detect and import .cursor/ configurations as executable automation (HIGH PRIORITY, partially built)
- Branch selection for discovery — let users choose which branch to scan

**Defer (v2+):**
- GSD-style conversational discovery — chat-like interface instead of forms (complex, high effort)
- Submodule awareness — detect and handle Git submodules for cross-repo file access (critical for some users but edge case)
- Template selection for existing repo users — only needed for users without existing structure (Phase 2 feature)

### Architecture Approach

Note: ARCHITECTURE.md research was not available, but based on codebase evidence from STACK.md and FEATURES.md, the architecture follows existing Elmer patterns.

**Major components to build:**
1. **OnboardingWizard** — Main carousel container with step management using Zustand store with sessionStorage persistence
2. **DiscoveryChat** — Conversational UI component extending existing ChatSidebar pattern for structured question flow
3. **RepoAnalyzer** — Heuristic-based repository structure detection service with pattern matching for initiatives/personas/signals folders
4. **InitiativeParser** — Parse _meta.json and markdown frontmatter with permissive schema handling
5. **OnboardingAPI routes** — /api/onboarding/analyze (async repo analysis) and /api/onboarding/populate (workspace population)

**Existing code to extend:**
- PathBrowser component — add multi-select capability and preview pane
- GitHub API routes — extend tree traversal with recursive option for deep scan
- Agent sync patterns — reuse file fetching patterns from src/lib/agents/sync.ts
- SSE streaming — reuse existing pattern from src/app/api/jobs/stream/route.ts for progress updates

### Critical Pitfalls

Top 5 pitfalls identified from research, ordered by severity and likelihood:

1. **Hardcoded Folder Name Expectations (P1)** — Assuming all users organize initiatives in `/initiatives/`. Real repos use `/features/`, `/projects/`, `/work/`, `/epics/`, or nested structures. Prevention: Pattern-based discovery with priority ranking, not exact path matching. Fall back to conversational disambiguation: "I found folders that might be projects: `/features/`, `/work/`. Which one?"

2. **Rate Limit Exhaustion During Discovery (P5)** — Discovery makes many GitHub API calls. Authenticated limit is 5000/hr but large repos can exhaust this. Prevention: Check X-RateLimit-Remaining header before operations, use tree API with recursive=true (1 request vs N), cache tree response for duration of onboarding, batch file content fetches.

3. **Blocking Spinner of Death (P9)** — Full-screen spinner with no progress indication. Large repos take 30+ seconds. Users assume frozen and abandon. Prevention: Granular progress ("Scanning folders 23 of 50..."), stream discovered items incrementally, show elapsed time, provide cancel option, use skeleton loading.

4. **All-or-Nothing Import (P11)** — Forcing users to import everything discovered or nothing. Users with messy repos (archived projects, experiments) get polluted workspace. Prevention: Default to selected with deselection checkboxes, bulk actions ("Deselect archived"), show preview ("This will create 12 projects in 4 columns"), allow "Skip this step" for manual setup.

5. **Duplicate Projects on Re-onboarding (P15)** — User runs onboarding twice and gets duplicates. No idempotency protection. Prevention: Use deterministic IDs (hash of workspaceId + repoPath + initiativePath), upsert instead of insert, warn before re-onboarding: "This workspace already has imported projects. Merge or replace?"

## Implications for Roadmap

Based on research, suggested phase structure organized by dependency relationships and risk mitigation:

### Phase 1A: Onboarding Foundation (Must-have for launch)
**Rationale:** Core wizard infrastructure enables all subsequent phases. Must be rock-solid before adding complex discovery logic.

**Delivers:** Multi-step wizard with clean UX patterns
- Progress indicator showing current step and completion percentage
- Skip/later option for non-critical steps with session persistence
- Error recovery with actionable messages and retry buttons
- Pre-populated defaults for common paths and branch selection

**Addresses:** Table stakes features #3, #4, #5, #6 from FEATURES.md

**Avoids:** P10 (error messages without recovery), P9 (blocking spinner) by establishing patterns early

**Stack Implementation:** Custom wizard using Zustand, Radix Dialog, Framer Motion transitions

**Research Needed:** None—standard UX patterns, well-documented approaches

---

### Phase 1B: Structure Auto-Discovery (Core differentiator)
**Rationale:** This is the value proposition. Without discovery, Elmer is just another onboarding flow. Dependencies: needs Phase 1A wizard foundation.

**Delivers:** Intelligent repository analysis and mapping
- Heuristic-based folder detection (initiatives/, features/, projects/ patterns)
- _meta.json parsing with permissive schema and sensible defaults
- Status-to-column mapping with fallback handling
- Visual mapping preview showing discovered structure -> Elmer workspace transformation
- Selective import UI with checkboxes and bulk actions
- Validation summary before commit: "This will create 12 projects, sync 24 knowledge docs"

**Addresses:** Differentiators #7, #8, #9, #15 from FEATURES.md

**Avoids:**
- P1 (hardcoded folder names) via pattern matching
- P2 (flat structure assumption) via recursive traversal with depth limits
- P3 (_meta.json rigidity) via permissive parsing
- P11 (all-or-nothing import) via selective UI
- P12 (no preview) via validation summary
- P15 (duplicate projects) via deterministic IDs and upsert logic
- P16 (status mapping drift) via explicit mapping with fallbacks

**Stack Implementation:**
- Repository analyzer using @octokit/rest with custom heuristics
- Initiative parser with JSON.parse and optional frontmatter extraction
- Extends PathBrowser component for multi-select and preview

**Research Needed:** HIGH—this phase has the most complexity and pitfall density. Will likely need `/gsd:research-phase` during planning to:
- Design robust heuristic algorithms for folder pattern detection
- Define permissive schema for _meta.json with comprehensive default handling
- Architect status mapping system with fuzzy matching
- Design visual mapping preview UX

---

### Phase 1C: Discovery Enhancement (Polish)
**Rationale:** Adds real-time feedback and existing integrations. Builds on Phase 1B discovery. Dependencies: needs Phase 1A wizard + Phase 1B discovery working.

**Delivers:** Enhanced discovery experience
- Real-time discovery feedback via SSE streaming ("Scanning... Found initiatives/ ... Analyzing 15 folders...")
- Agent architecture auto-import integration (reuse existing AgentArchitectureImporter pattern)
- Branch selection integration (reuse existing BranchSelector component)
- Incremental result display as items are discovered

**Addresses:** Differentiators #11, #12, #14 from FEATURES.md

**Avoids:**
- P9 (blocking spinner) via streaming progress
- P7 (branch state mismatch) via branch selection
- P5 (rate limits) via incremental loading and caching

**Stack Implementation:**
- Reuse existing SSE pattern from src/app/api/jobs/stream/route.ts
- Integrate existing AgentArchitectureImporter component
- Integrate existing BranchSelector component

**Research Needed:** LOW—reusing existing patterns, mainly integration work

---

### Phase 2: Advanced Discovery (Future enhancement)
**Rationale:** Addresses edge cases and power users. Not required for initial launch. Dependencies: all Phase 1 complete and validated.

**Delivers:** Advanced repository handling
- GSD-style conversational discovery with chat-like Q&A interface
- Submodule awareness for cross-repo file access (critical for prototype detection in elephant-ai submodule)
- Monorepo detection and workspace selection
- Template generation for repos without existing pm-workspace structure

**Addresses:** Differentiators #10, #13 from FEATURES.md, anti-feature X2 alternative

**Avoids:**
- P4 (monorepo blindness) via explicit workspace selection
- P6 (submodule inaccessibility) via .gitmodules parsing and linked repo scanning
- P14 (empty discovery dead-end) via template generation fallback

**Stack Implementation:**
- Chat UI component for conversational flow
- Git submodule parser and recursive repo analyzer
- Monorepo detection via pnpm-workspace.yaml, lerna.json patterns

**Research Needed:** HIGH—both conversational UI design and submodule handling are complex domains with sparse documentation

---

### Phase Ordering Rationale

**Why Foundation -> Discovery -> Enhancement:**
1. **Dependency chain:** Discovery needs wizard infrastructure. Enhancement needs discovery results to stream.
2. **Risk mitigation:** Foundation establishes error handling patterns that discovery relies on. Testing foundation UX patterns before adding complex GitHub API logic reduces debugging surface area.
3. **Value delivery:** Phase 1A + 1B deliver minimum viable onboarding. Phase 1C adds polish. Phase 2 addresses edge cases.
4. **Pitfall avoidance:** Most HIGH severity pitfalls cluster in Phase 1B discovery. Isolating this phase allows focused testing and iteration.

**Why Discovery before Enhancement:**
- Real-time feedback (Enhancement) only makes sense once discovery works
- Agent import integration (Enhancement) depends on discovery mapping patterns
- Getting core discovery right is more important than streaming UX

**Why defer Advanced Discovery to Phase 2:**
- Submodule handling is complex but affects minority of users
- Conversational discovery is high effort, lower ROI than visual preview
- Monorepo support needs more research on user segmentation
- Better to launch with solid simple discovery than delay for edge cases

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 1B (Discovery):** Complex heuristic algorithms, schema flexibility, status mapping logic—will benefit from `/gsd:research-phase` focused on pattern matching strategies and fuzzy mapping approaches
- **Phase 2 (Advanced):** Conversational UI patterns, Git submodule specification deep-dive, monorepo tooling analysis

**Phases with standard patterns (skip research-phase):**
- **Phase 1A (Foundation):** Well-documented wizard/stepper patterns, Zustand persist middleware is documented, error messaging is UX design work not research
- **Phase 1C (Enhancement):** Reuses existing codebase patterns (SSE streaming, component integration), mainly implementation work

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations based on existing codebase analysis. No new dependencies reduces risk. Official docs for @octokit/rest, Zustand, Framer Motion all verified. |
| Features | HIGH | Feature categorization based on competitive analysis patterns and codebase evidence. Table stakes features match industry standards (Linear, Vercel, Notion onboarding). Differentiators align with stated product vision. |
| Architecture | MEDIUM | ARCHITECTURE.md research was unavailable, but existing codebase provides strong patterns. Component structure inferred from stack analysis and existing similar features (AgentArchitectureImporter, PathBrowser, ChatSidebar). |
| Pitfalls | HIGH | 19 documented pitfalls with concrete examples, warning signs, and prevention strategies. Severity ratings based on user impact analysis. Phase mapping ties pitfalls directly to implementation phases. |

**Overall confidence:** HIGH

Research is comprehensive for stack and features. Architecture confidence is medium due to missing dedicated research but mitigated by strong codebase evidence. Pitfall research is exceptionally thorough with actionable prevention strategies.

### Gaps to Address

**Architecture documentation gap:**
- ARCHITECTURE.md was not available during synthesis
- Recommendation: If architecture decisions are critical, run targeted architecture research before Phase 1B planning
- Mitigation: Existing codebase provides sufficient patterns for initial implementation. Architecture can be validated during Phase 1A implementation.

**Submodule handling uncertainty:**
- Research identifies P6 (submodule inaccessibility) as HIGH severity but defers to Phase 2
- Gap: Unclear how many users rely on submodules (e.g., elephant-ai prototype path)
- Recommendation: Add analytics during Phase 1 to detect submodule usage, prioritize Phase 2 if >20% of users affected

**Monorepo user segmentation:**
- P4 (monorepo blindness) marked MEDIUM severity but no data on prevalence
- Gap: Don't know what percentage of target users work in monorepos
- Recommendation: Add monorepo detection in Phase 1B analytics (non-blocking), use data to prioritize Phase 2 monorepo support

**Status mapping complexity:**
- P16 addresses status-to-column mapping but unclear how many status variations exist in wild
- Gap: Need sample data from real pm-workspace repos to build comprehensive mapping
- Recommendation: During Phase 1B planning, collect sample _meta.json files from target users to inform mapping strategy

**Rate limit thresholds:**
- P5 prevention strategy assumes 5000/hr authenticated limit sufficient
- Gap: No analysis of how many API calls large repos require
- Recommendation: During Phase 1B implementation, instrument discovery to track API call count per repo size, optimize if approaching limits

## Sources

### Primary (HIGH confidence)
- **Elmer codebase** (`src/components/settings/GithubRepoSelector.tsx`, `src/lib/agents/sync.ts`, `src/app/api/github/tree/route.ts`, `src/components/settings/AgentArchitectureImporter.tsx`, `src/app/api/jobs/stream/route.ts`) — Existing patterns and implementations
- **PROJECT.md** — Product vision, workspace structure definitions, explicit anti-features (multi-repo marked "not planned")
- **GitHub REST API documentation** — @octokit/rest capabilities, rate limits, tree API specifications
- **Zustand documentation** — Persist middleware, sessionStorage patterns
- **Framer Motion documentation** — Animation variants, spring presets

### Secondary (MEDIUM confidence)
- **Competitive onboarding analysis** — Linear, Vercel, Netlify, Railway, Notion onboarding flows (table stakes features)
- **pm-workspace conventions** — Implied from PROJECT.md and codebase references to initiatives/, _meta.json, personas/, signals/
- **Developer tool onboarding patterns** — Industry standards for OAuth, repo selection, progress indication

### Tertiary (LOW confidence, needs validation)
- **Monorepo prevalence** — Assumption that significant portion of users work in monorepos (needs data)
- **Submodule usage** — Assumption that elephant-ai submodule pattern is common (needs validation)
- **Heuristic accuracy** — Pattern-based folder detection effectiveness untested on real user repos

---
*Research completed: 2026-01-25*
*Ready for roadmap: yes*
