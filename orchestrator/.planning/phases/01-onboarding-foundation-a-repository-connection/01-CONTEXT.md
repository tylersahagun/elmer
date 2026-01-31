# Phase 1: Onboarding Foundation & Repository Connection - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-step wizard for connecting GitHub repositories with progress tracking, error recovery, and session persistence. Users authenticate with GitHub, select a repository and branch, configure workspace settings, and optionally take a tour. Discovery and population of workspace content happens in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Wizard Flow & Navigation
- Linear progression with Next/Back buttons (can go back to revise)
- Progress bar with percentage indicator (visual completion tracking)
- Resume with summary on page refresh: "You were on step 3: Configure paths. Continue?"

### Repository Selection UX
- Flat list with org prefix format ("acme/frontend", "personal/blog")
- Search matches repo name + description + topics (comprehensive metadata search)
- Show name + description only per repo (minimal, clean display)
- Special sections at top: "Recently Used" and "Favorites" before full list

### Error Messaging & Recovery
- Hybrid tone: Friendly message + expandable technical details
- Auto-retry once on failure, then show manual retry button
- Permission errors trigger re-auth button (OAuth flow with correct scopes)
- Rate limit handling: Queue work and auto-resume when limit resets (no blocking countdown)

### Post-Onboarding Tour
- Triggers immediately after onboarding completes
- Subtle X button in corner (closeable but not prominent)
- Moderate depth with examples: Show each area + one example of using it
- Spotlight with auto-advance: Highlights areas, advances automatically after time

### Claude's Discretion
- Skip behavior details (how skipped steps are surfaced later)
- Exact wizard step count and grouping
- Session storage persistence implementation
- Tour step duration timing
- Tour content specifics (which examples to show)

</decisions>

<specifics>
## Specific Ideas

None — discussion stayed within standard onboarding UX patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-onboarding-foundation-a-repository-connection*
*Context gathered: 2026-01-25*
