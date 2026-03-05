# Feature Flag Cleanup & Technical Debt PRD

## Overview

- **Owner:** Engineering (with Tyler coordinating)
- **Target Release:** Q1 2026 (Cleanup complete by Feb 15)
- **Status:** In Progress
- **Strategic Pillar:** Quality Over Velocity (Technical Foundation)
- **Related Initiative:** [Release Lifecycle Process](../release-lifecycle-process/prd.md)

This initiative focuses on **technical cleanup** of AskElephant's feature flag system: removing stale flags, graduating GA flags, consolidating duplicates, and establishing ongoing hygiene practices. This is the technical foundation that enables the [Release Lifecycle Process](../release-lifecycle-process/prd.md).

---

## Outcomes Framework

### Customer Outcome

**Target State:** Faster app performance and more consistent behavior due to reduced flag evaluation overhead and cleaner codebase.

**Current State:**
- 116 active feature flags in PostHog
- 20 effectively disabled (dead code)
- 8 at 100% GA but still wrapped in flags
- Flag evaluation adds latency to every page load

**Gap:** Technical debt from years of feature flags never cleaned up.

### Business Outcome

**Target State:** Engineering can ship faster with cleaner codebase, reduced bug surface area, and simpler debugging.

**How this drives:**
- [x] **Retain** - Fewer bugs from flag interaction edge cases
- [x] **Expand** - Faster feature delivery with less tech debt
- [ ] Land - Indirect (cleaner product)

### Success Metrics

| Metric | Type | Current | Target | Owner |
|--------|------|---------|--------|-------|
| Active feature flags | Leading | 116 | <60 | Engineering |
| Dead/stale flags | Leading | 31 | 0 | Engineering |
| Flag-related bugs | Lagging | Unknown | -50% | Engineering |
| Page load time (flag eval) | Leading | Unknown | -20% | Engineering |

### Success Criteria

| Criteria | Target | Timeline | How We'll Measure |
|----------|--------|----------|-------------------|
| Dead flags removed | 11 flags | Feb 1, 2026 | PostHog count |
| GA flags graduated | 8 flags | Feb 8, 2026 | PostHog count |
| Duplicate flags consolidated | 12 flags | Feb 15, 2026 | PostHog count |
| Total flag reduction | 50% (116→<60) | Mar 1, 2026 | PostHog count |

---

## Outcome Chain

```
Remove dead and stale feature flags
  → so that codebase complexity decreases
    → so that bug surface area shrinks
      → so that engineering ships faster with fewer issues
        → so that customers experience more reliable product
          → so that retention improves
```

---

## Problem Statement

### The Problem

AskElephant has accumulated 116 feature flags over time with no cleanup process. This creates:

1. **Dead code risk** - 20 flags are effectively disabled but code remains
2. **Performance overhead** - Every page evaluates 100+ flags
3. **Debugging complexity** - Bugs may be flag-interaction related
4. **Cognitive load** - Engineers must understand flag states to debug
5. **PostHog clutter** - Hard to find relevant flags among dead ones

### Evidence

**From PostHog Audit (Jan 13, 2026):**
- 116 total active flags
- 20 effectively disabled (0% rollout or inactive)
- 8 at 100% GA (flag wrapper can be removed)
- 32 in "limited beta" (fragmented experiences)
- Some flags 18+ months old with no clear owner

**Leadership acknowledgment:**
> "We are in feature flag hell." — Woody Klemetson, CEO

---

## Goals & Non-Goals

### Goals (Measurable)

1. **Remove 11 dead flags** - Code + PostHog cleanup
2. **Graduate 8 GA flags** - Remove wrapper, keep feature
3. **Consolidate 12+ duplicate/related flags** - Reduce complexity
4. **Establish hygiene process** - Quarterly flag review
5. **Reduce total flags by 50%** - From 116 to <60

### Non-Goals

- **Not changing release process** - That's the [Release Lifecycle Process](../release-lifecycle-process/prd.md) initiative
- **Not building new UI** - This is backend cleanup
- **Not deprecating active features** - Only cleaning up dead/stale flags
- **Not blocking engineering velocity** - Cleanup happens incrementally

---

## Scope

### In Scope

**Phase 1: Dead Flag Removal (11 flags)**
| Flag Key | Status | Action |
|----------|--------|--------|
| `team-invites` | 0% rollout, 18 months old | Remove flag + code |
| `meeting-actions` | Inactive | Remove flag + code |
| `new-invite-flow` | 0% rollout | Remove flag + code |
| `action-items-page` | Inactive | Remove flag + code |
| `workflows-v3` | Inactive | Remove flag (keep for future?) |
| `be-fine-tuning-page-refresh` | Inactive | Remove flag + code |
| `homepage-workflows` | Internal only, never shipped | Remove flag + code |
| `calendar-write-permission` | 0% rollout | Remove flag |
| `ai-search-filters` | 0% rollout | Remove flag |
| `bot-jit-scheduling-enabled` | 0% | Review - keep or remove |
| `free-trial` | Inactive + 0% | Remove flag |

**Phase 2: GA Flag Graduation (8 flags)**
| Flag Key | Status | Action |
|----------|--------|--------|
| `calendar-widget` | 100% GA | Remove flag wrapper |
| `new-meeting-page` | 100% GA | Remove flag wrapper |
| `scorecard-component` | 100% GA | Remove flag wrapper |
| `crm-field-updates` | 100% GA | Remove flag wrapper |
| `salesforce-v2-beta` | 100% GA | Remove flag wrapper |
| `hubspot-mcp` | 100% GA | Remove flag wrapper |
| `deepgram-transcription-model` | 100% nova-3 | Hardcode, remove flag |
| `deepgram-auto-detect-language` | 100% GA | Remove flag wrapper |

**Phase 3: Flag Consolidation (12+ flags)**
| Group | Current Flags | Consolidate To |
|-------|---------------|----------------|
| Google Suite | 8 flags (calendar, docs, drive, sheets, tasks) | 1 flag: `google-integrations` |
| Salesforce Agent | 3 flags | 1 flag: `salesforce-agent` |
| Notion | 2 flags (mcp, workflow) | 1 flag: `notion-integration` |
| Linear | 3 flags | 1 flag: `linear-integration` |
| Monday | 2 flags | 1 flag: `monday-integration` |
| Confluence | 2 flags | 1 flag: `confluence-integration` |

### Out of Scope

- Beta toggle UI (see [Release Lifecycle Process](../release-lifecycle-process/prd.md))
- Stage metadata tagging (see [Release Lifecycle Process](../release-lifecycle-process/prd.md))
- New features or flag additions
- Customer communication (purely technical cleanup)

---

## Technical Approach

### Flag Removal Process

For each flag being removed:

```
1. AUDIT
   └─ Confirm flag is safe to remove (0% rollout or 100% GA)
   └─ Search codebase for all references
   └─ Identify affected files

2. CODE CLEANUP
   └─ Remove flag checks from code
   └─ Remove conditional branches
   └─ Clean up any flag-specific logic

3. TEST
   └─ Run affected test suites
   └─ Manual smoke test of affected areas
   └─ Verify no regression

4. DEPLOY
   └─ Deploy code changes to staging
   └─ Verify in staging
   └─ Deploy to production

5. POSTHOG
   └─ Archive flag in PostHog
   └─ Document removal in changelog

6. DOCUMENT
   └─ Update internal docs
   └─ Note in release notes
```

### Consolidation Process

For flag groups being consolidated:

```
1. CREATE
   └─ Create new consolidated flag (e.g., `google-integrations`)
   └─ Set rollout to match existing flags

2. MIGRATE
   └─ Update code to use new flag
   └─ Deploy changes

3. VERIFY
   └─ Confirm functionality unchanged
   └─ Monitor for issues

4. CLEANUP
   └─ Remove old individual flags
   └─ Archive in PostHog
```

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Flag removal breaks feature | High | Medium | Test thoroughly; feature flag the removal itself |
| Performance regression | Medium | Low | Monitor page load times |
| Customer-visible bug | High | Low | Deploy incrementally; quick rollback plan |
| Engineering time drain | Medium | Medium | Timebox cleanup sprints |

### Rollback Plan

If issues discovered after flag removal:
1. **Immediate:** Re-enable flag in PostHog (if archived, not deleted)
2. **Short-term:** Revert code changes if needed
3. **Communication:** Alert CS if customer-facing impact

---

## Timeline

### Phase 1: Dead Flag Removal
**Timeline:** Jan 20 - Feb 1, 2026 (2 weeks)
**Effort:** ~1 day per flag = ~2 weeks

| Week | Flags to Remove |
|------|-----------------|
| Week 1 | `team-invites`, `meeting-actions`, `new-invite-flow`, `action-items-page`, `free-trial` |
| Week 2 | `workflows-v3`, `be-fine-tuning-page-refresh`, `homepage-workflows`, `calendar-write-permission`, `ai-search-filters`, `bot-jit-scheduling-enabled` |

### Phase 2: GA Flag Graduation
**Timeline:** Feb 3 - Feb 8, 2026 (1 week)
**Effort:** ~0.5 day per flag = ~1 week

| Day | Flags to Graduate |
|-----|-------------------|
| Mon-Tue | `calendar-widget`, `new-meeting-page` |
| Wed | `scorecard-component`, `crm-field-updates` |
| Thu | `salesforce-v2-beta`, `hubspot-mcp` |
| Fri | `deepgram-transcription-model`, `deepgram-auto-detect-language` |

### Phase 3: Flag Consolidation
**Timeline:** Feb 10 - Feb 21, 2026 (2 weeks)
**Effort:** ~2 days per group = ~2 weeks

| Week | Groups to Consolidate |
|------|----------------------|
| Week 1 | Google Suite (8→1), Salesforce Agent (3→1) |
| Week 2 | Notion (2→1), Linear (3→1), Monday (2→1), Confluence (2→1) |

### Milestones

| Milestone | Date | Status |
|-----------|------|--------|
| Audit complete | Jan 13, 2026 | ✅ |
| Phase 1 complete (dead flags) | Feb 1, 2026 | ⬜ |
| Phase 2 complete (GA graduation) | Feb 8, 2026 | ⬜ |
| Phase 3 complete (consolidation) | Feb 21, 2026 | ⬜ |
| 50% flag reduction achieved | Mar 1, 2026 | ⬜ |

---

## Ongoing Hygiene

### Quarterly Flag Review

**Cadence:** First week of each quarter  
**Owner:** Engineering lead + Tyler  
**Process:**
1. Export all flags from PostHog
2. Identify flags >90 days without change
3. Review each with owner
4. Decide: extend, graduate, or deprecate
5. Execute cleanup in that quarter

### Flag Creation Standards (Going Forward)

When creating new flags:
- [ ] Define TTL (max 90 days for release flags)
- [ ] Assign owner
- [ ] Add stage metadata
- [ ] Document purpose
- [ ] Plan removal criteria

---

## Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| PostHog access | Engineering | ✅ |
| Code search tooling | Engineering | ✅ |
| Staging environment | Engineering | ✅ |
| Engineering capacity | Skyler | 🟡 Needs allocation |

---

## Open Questions

1. [ ] **Owner for each flag:** Who approves removal?
2. [ ] **`workflows-v3`:** Keep for future or remove?
3. [ ] **Consolidation naming:** `google-integrations` vs `google-suite`?
4. [ ] **Monitoring:** What metrics to watch post-cleanup?

---

## Related Documents

- [Feature Flag Audit](./Feature%20Flag%20Audit.md) - Full PostHog audit data
- [Release Lifecycle Process](../release-lifecycle-process/prd.md) - Process initiative
- [Research Summary](./research.md) - Leadership meeting notes

---

*Last updated: January 13, 2026*  
*Owner: Engineering (Tyler coordinating)*
