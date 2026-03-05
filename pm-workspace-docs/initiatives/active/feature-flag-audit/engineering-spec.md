# Engineering Spec: Feature Flag Cleanup

## Overview

Technical specification for cleaning up AskElephant's feature flag technical debt: removing dead flags, graduating GA flags, and consolidating duplicates.

**Related PRD:** [prd.md](./prd.md)  
**Status:** In Progress  
**Type:** Technical Debt Cleanup  
**Complexity:** Medium  
**Estimated Effort:** 5-6 weeks (incremental)

---

## Technical Overview

### Current State

```
PostHog Feature Flags
├── Active: 116 flags
├── Effectively Disabled: 20 flags (dead code risk)
├── 100% GA: 8 flags (should remove wrapper)
├── Duplicates/Related: ~20 flags (consolidation candidates)
└── Legitimate Beta: ~68 flags (keep as-is)
```

### Target State

```
PostHog Feature Flags
├── Active: <60 flags
├── Dead/Stale: 0 flags
├── All flags have: stage, owner, TTL metadata
└── Quarterly review process established
```

---

## Phase 1: Dead Flag Removal (11 flags)

### Identification Criteria

A flag is "dead" if:
- Status: Inactive in PostHog, OR
- Rollout: 0% for >90 days, OR
- Code: No references found in codebase

### Removal Procedure

```typescript
// For each dead flag:

// Step 1: Search codebase
rg "flag_name" --type ts --type tsx --type js

// Step 2: Document affected files
// Step 3: Remove flag checks
// Step 4: Remove from PostHog
// Step 5: Verify no regression
```

### Dead Flags to Remove

#### 1. `team-invites`
- **Status:** 0% rollout, ~18 months old
- **Risk:** Low
- **Files to check:**
  ```
  web/src/components/settings/TeamSettings.tsx
  web/src/hooks/useTeamInvites.ts
  ```
- **Action:** Remove flag checks, remove unused code

#### 2. `meeting-actions`
- **Status:** Inactive
- **Risk:** Low
- **Files to check:**
  ```
  web/src/components/meeting/MeetingActions.tsx
  ```
- **Action:** Remove flag + dead code path

#### 3. `new-invite-flow`
- **Status:** 0% rollout, never launched
- **Risk:** Low
- **Files to check:**
  ```
  web/src/components/onboarding/InviteFlow*.tsx
  ```
- **Action:** Remove flag + new invite flow code (keep old flow)

#### 4. `action-items-page`
- **Status:** Inactive
- **Risk:** Low
- **Action:** Remove flag + associated page component

#### 5. `workflows-v3`
- **Status:** Inactive
- **Risk:** Medium (may be future work)
- **Decision needed:** Archive vs. keep for future
- **Action:** If removing, just archive flag (no code exists yet)

#### 6. `be-fine-tuning-page-refresh`
- **Status:** Inactive
- **Risk:** Low
- **Action:** Remove flag

#### 7. `homepage-workflows`
- **Status:** Internal only, never shipped
- **Risk:** Low
- **Action:** Remove flag + code

#### 8. `calendar-write-permission`
- **Status:** 0% rollout
- **Risk:** Low
- **Action:** Remove flag

#### 9. `ai-search-filters`
- **Status:** 0% rollout
- **Risk:** Low
- **Action:** Remove flag + any related code

#### 10. `bot-jit-scheduling-enabled`
- **Status:** 0% (AskElephant internal test)
- **Risk:** Medium
- **Decision needed:** Keep for testing or remove
- **Action:** If removing, remove flag + code

#### 11. `free-trial`
- **Status:** Inactive + 0%
- **Risk:** Low
- **Action:** Remove flag

### Removal Script Template

```typescript
// scripts/remove-feature-flag.ts
import { searchCodebase, removeFromPosthog, createPR } from './utils';

async function removeFlag(flagKey: string) {
  console.log(`Removing flag: ${flagKey}`);
  
  // 1. Search for all references
  const references = await searchCodebase(flagKey);
  console.log(`Found ${references.length} references`);
  
  // 2. Generate removal diff (manual review required)
  for (const ref of references) {
    console.log(`  ${ref.file}:${ref.line}`);
  }
  
  // 3. After manual code removal and PR merge:
  // await removeFromPosthog(flagKey);
  
  console.log(`Flag ${flagKey} removal complete`);
}
```

---

## Phase 2: GA Flag Graduation (8 flags)

### Identification Criteria

A flag should be graduated if:
- Rollout: 100% for >30 days
- No variant testing (single code path)
- Stable (no recent changes)

### Graduation Procedure

```typescript
// Before (with flag)
function MyComponent() {
  const showNewFeature = useFeatureFlag('new-feature');
  
  if (showNewFeature) {
    return <NewFeature />;
  }
  return <OldFeature />;
}

// After (flag removed, feature permanent)
function MyComponent() {
  return <NewFeature />;
}
```

### Flags to Graduate

#### 1. `calendar-widget`
- **Current:** 100% GA
- **Action:** Remove flag wrapper, feature stays
- **Files:**
  ```
  web/src/components/calendar/CalendarWidget.tsx
  web/src/hooks/useCalendarWidget.ts
  ```

#### 2. `new-meeting-page`
- **Current:** 100% GA
- **Action:** Remove flag wrapper, keep new page
- **Files:**
  ```
  web/src/pages/meeting/[id].tsx
  ```

#### 3. `scorecard-component`
- **Current:** 100% GA
- **Action:** Remove flag wrapper

#### 4. `crm-field-updates`
- **Current:** 100% GA
- **Action:** Remove flag wrapper

#### 5. `salesforce-v2-beta`
- **Current:** 100% GA (misnomer - not beta anymore)
- **Action:** Remove flag wrapper
- **Note:** Flag name says "beta" but it's 100% GA

#### 6. `hubspot-mcp`
- **Current:** 100% GA
- **Action:** Remove flag wrapper

#### 7. `deepgram-transcription-model`
- **Current:** 100% on `nova-3` variant
- **Action:** Hardcode `nova-3`, remove flag
- **Code change:**
  ```typescript
  // Before
  const model = useFeatureFlag('deepgram-transcription-model');
  
  // After
  const model = 'nova-3';
  ```

#### 8. `deepgram-auto-detect-language`
- **Current:** 100% GA
- **Action:** Remove flag wrapper

---

## Phase 3: Flag Consolidation

### Consolidation Groups

#### Google Suite (8 → 1)

**Current flags:**
- `integration-google-calendar-mcp-enabled`
- `integration-google-calendar-workflow-enabled`
- `integration-google-docs-mcp-enabled`
- `integration-google-docs-workflow-enabled`
- `integration-google-drive-mcp-enabled`
- `integration-google-drive-workflow-enabled`
- `integration-google-sheets-mcp-enabled`
- `integration-google-sheets-workflow-enabled`
- `integration-google-tasks-mcp-enabled`
- `integration-google-tasks-workflow-enabled`

**New flag:** `google-integrations-enabled`

**Migration:**
```typescript
// Before
const calendarMcp = useFeatureFlag('integration-google-calendar-mcp-enabled');
const calendarWorkflow = useFeatureFlag('integration-google-calendar-workflow-enabled');
// ... 8 more checks

// After
const googleEnabled = useFeatureFlag('google-integrations-enabled');
// All Google features enabled/disabled together
```

#### Salesforce Agent (3 → 1)

**Current flags:**
- `salesforce-agent-in-chat`
- `salesforce-agent-in-workflow`
- `salesforce-user-level-integration-connection`

**New flag:** `salesforce-agent-enabled`

#### Notion Integration (2 → 1)

**Current flags:**
- `integration-notion-mcp-enabled`
- `integration-notion-workflow-enabled`

**New flag:** `notion-integration-enabled`

#### Linear Integration (3 → 1)

**Current flags:**
- `integration-linear-enabled`
- `integration-linear-mcp-enabled`
- `integration-linear-workflow-enabled`

**New flag:** `linear-integration-enabled`

#### Monday Integration (2 → 1)

**Current flags:**
- `integration-monday-mcp-enabled`
- `integration-monday-workflow-enabled`

**New flag:** `monday-integration-enabled`

#### Confluence Integration (2 → 1)

**Current flags:**
- `integration-confluence-mcp-enabled`
- `integration-confluence-workflow-enabled`

**New flag:** `confluence-integration-enabled`

### Consolidation Procedure

```typescript
// Step 1: Create new consolidated flag in PostHog
// Set rollout to match existing flags

// Step 2: Update code
// Before
const notionMcp = useFeatureFlag('integration-notion-mcp-enabled');
const notionWorkflow = useFeatureFlag('integration-notion-workflow-enabled');
const isNotionEnabled = notionMcp && notionWorkflow;

// After
const isNotionEnabled = useFeatureFlag('notion-integration-enabled');

// Step 3: Deploy and verify

// Step 4: Archive old flags in PostHog
```

---

## Testing Strategy

### Unit Tests
- Verify feature still works after flag removal
- No conditional logic breaks

### Integration Tests
- End-to-end flows for graduated features
- Integration tests for consolidated flags

### Regression Testing
- Smoke test affected areas
- Monitor error rates post-deploy

### Rollback Plan
```typescript
// If issues discovered:
// 1. Re-enable archived flag in PostHog
// 2. Revert code if needed
// 3. Investigate before retry
```

---

## Monitoring

### Metrics to Watch Post-Cleanup

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Error rate | Sentry | >1% increase |
| Page load time | PostHog | >100ms increase |
| Feature usage | PostHog | >10% drop |
| Support tickets | Intercom | Spike in "feature missing" |

### PostHog Dashboards

Create dashboard for:
- Total flag count (target: <60)
- Flags by age (identify stale)
- Flag evaluation time (performance)

---

## Rollout Schedule

### Week 1-2: Dead Flag Removal
```
Day 1-2: team-invites, meeting-actions
Day 3-4: new-invite-flow, action-items-page
Day 5: free-trial
Day 6-7: workflows-v3, be-fine-tuning-page-refresh
Day 8-9: homepage-workflows, calendar-write-permission
Day 10: ai-search-filters, bot-jit-scheduling-enabled
```

### Week 3: GA Flag Graduation
```
Day 1: calendar-widget, new-meeting-page
Day 2: scorecard-component, crm-field-updates
Day 3: salesforce-v2-beta, hubspot-mcp
Day 4: deepgram-transcription-model, deepgram-auto-detect-language
Day 5: Buffer / verification
```

### Week 4-5: Flag Consolidation
```
Week 4:
  - Google Suite consolidation (8→1)
  - Salesforce Agent consolidation (3→1)

Week 5:
  - Notion, Linear, Monday, Confluence consolidation
```

---

## Definition of Done

- [ ] All 11 dead flags removed from PostHog
- [ ] All 8 GA flags graduated (wrapper removed)
- [ ] All 6 groups consolidated
- [ ] Total flags reduced by 50% (116→<60)
- [ ] No regression in affected features
- [ ] Quarterly review process documented

---

*Engineering Owner: TBD*  
*Last Updated: January 13, 2026*
