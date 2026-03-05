# PostHog Feature Flag Audit

**Date:** January 26, 2026  
**Project ID:** 81505  
**Total Flags:** 126  
**Audit Type:** Read-only analysis

---

## Executive Summary

This audit reveals a critical issue: **51 feature flags are linked to Early Access features**, but many of these are already at 100% rollout. This creates confusion because:

1. Users see features in the Early Access UI that are already enabled for everyone
2. Toggling Early Access can unexpectedly disable features users already have
3. There's no distinction between "opt-in beta" and "controlled rollout"

### Key Findings

| Category                        | Count | Action Needed        |
| ------------------------------- | ----- | -------------------- |
| **Inactive (dead)**             | 13    | Remove from codebase |
| **100% GA (should graduate)**   | 37    | Remove flag wrapper  |
| **Internal only (AskElephant)** | 55    | Keep as feature flag |
| **Partial/Conditional**         | 11    | Review individually  |
| **0% rollout (dead?)**          | 10    | Remove or activate   |
| **Early Access linked**         | 51    | Review linkage       |

---

## Problem: Early Access + 100% Rollout Conflict

When a flag is:

- At 100% rollout AND
- Linked to Early Access

The behavior is confusing:

- Feature shows in Early Access UI as "opt-in"
- But it's already enabled for everyone via flag rollout
- User toggles OFF in Early Access → feature disappears unexpectedly
- User was never "opted in" but feature worked → now it doesn't

### Flags with this Conflict (100% + Early Access)

| Flag Key                      | Early Access Name      | Issue                             |
| ----------------------------- | ---------------------- | --------------------------------- |
| `unified-automations`         | Unified Automations    | Already 100%, EA toggle confusing |
| `unified-settings-page`       | Unified Settings       | Already 100%, EA toggle confusing |
| `customers-page`              | Customers Page         | Already 100%, EA toggle confusing |
| `calendar-widget`             | Calendar               | Already 100%, EA toggle confusing |
| `new-meeting-page`            | Meeting Details 2.0    | Already 100%, EA toggle confusing |
| `knowledge-bases`             | Knowledge Base Beta    | Already 100%, EA toggle confusing |
| `global-chat-enabled`         | Global Chat            | Already 100%, EA toggle confusing |
| `salesforce-v2-beta`          | Salesforce Direct      | Already 100%, EA toggle confusing |
| `hubspot-mcp`                 | HubSpot AI Chat        | Already 100%, EA toggle confusing |
| `scorecard-component`         | Meeting Scorecards     | Already 100%, EA toggle confusing |
| `crm-field-updates`           | CRM Field Updates      | Already 100%, EA toggle confusing |
| `meeting-share-v2`            | Meeting Share V2       | Already 100%, EA toggle confusing |
| `embed-transcripts`           | Embed Transcripts      | Already 100%, EA toggle confusing |
| `auto-post-meeting-email`     | Auto Post-Meeting      | Already 100%, EA toggle confusing |
| `chat-entity-mentions`        | Entity Mentions        | Already 100%, EA toggle confusing |
| `email-recap-banners`         | Email Recap Banners    | Already 100%, EA toggle confusing |
| `chats-sidebar-update`        | New Chat Sidebar       | Already 100%, EA toggle confusing |
| `meetings-list-panel`         | Meetings List Panel    | Already 100%, EA toggle confusing |
| `prompt-library`              | Prompt Library         | Already 100%, EA toggle confusing |
| `workflow-ai-assistant-alpha` | Workflow AI Assistant  | Already 100%, EA toggle confusing |
| `get-the-app-cta`             | Desktop App Promotion  | Already 100%, EA toggle confusing |
| `home-engagements-horizontal` | Horizontal Engagements | Already 100%, EA toggle confusing |
| `highlevel`                   | HighLevel Integration  | Already 100%, EA toggle confusing |
| `chat-tool-internal-search`   | Internal Search Tool   | Already 100%, EA toggle confusing |
| `asana-mcp`                   | Asana AI Chat          | Already 100%, EA toggle confusing |

---

## Flags by Category

### Inactive Flags (13) - Should Remove

These flags are marked inactive in PostHog:

| Flag Key                               | Action                              |
| -------------------------------------- | ----------------------------------- |
| `entity-view-redesign`                 | Remove from codebase                |
| `enable-semantic-search`               | Remove from codebase                |
| `integration-clickup-workflow-enabled` | Remove from codebase                |
| `integration-clickup-mcp-enabled`      | Remove from codebase                |
| `reprocess-meeting-clip`               | Remove from codebase                |
| `free-trial`                           | Remove from codebase                |
| `signup-enabled`                       | Remove from codebase                |
| `workflows-v3`                         | Remove from codebase                |
| `be-fine-tuning-page-refresh`          | Remove from codebase                |
| `action-items-page`                    | Remove from codebase (has EA link!) |
| `banner`                               | Remove from codebase                |
| `meeting-actions`                      | Remove from codebase                |
| `maintenance-page`                     | Keep (intentional kill switch)      |

### 100% Rollout - No Early Access (12) - Should Graduate

These are at 100% with no special conditions - remove the flag wrapper:

| Flag Key                               | Action                 |
| -------------------------------------- | ---------------------- |
| `dataloaders-enabled`                  | Graduate - remove flag |
| `integration-sendoso-workflow-enabled` | Graduate - remove flag |
| `paused-bot-reminder`                  | Graduate - remove flag |
| `chat-message-actions-ui`              | Graduate - remove flag |
| `mobile-upcoming-device-recording`     | Graduate - remove flag |
| `notetaker-event-log`                  | Graduate - remove flag |
| `new-bot-naming`                       | Graduate - remove flag |
| `deepgram-auto-detect-language`        | Graduate - remove flag |
| `language-model-config`                | Graduate - remove flag |
| `deepgram-transcription-model`         | Graduate - remove flag |
| `web-search-scrape-enabled`            | Graduate - remove flag |
| `transcript-timelines`                 | Graduate - remove flag |
| `talk-to-contact`                      | Graduate - remove flag |
| `talk-to-company`                      | Graduate - remove flag |

### Internal Only (55) - Keep as Feature Flags

These are correctly scoped to AskElephant internal users. They should NOT be Early Access - they're for internal testing.

**Integration Flags (should consolidate):**

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
- `integration-teamwork-workflow-enabled`
- `integration-teamwork-mcp-enabled`
- `integration-monday-mcp-enabled`
- `integration-monday-workflow-enabled`
- `integration-linear-mcp-enabled`
- `integration-linear-workflow-enabled`
- `integration-notion-mcp-enabled`
- `integration-notion-workflow-enabled`
- `integration-confluence-workflow-enabled`
- `integration-confluence-mcp-enabled`
- `integration-sendoso-mcp-enabled`
- `integration-dialpad`

**Feature Flags (internal testing):**

- `projects-page`
- `mediaclip-processing-v2`
- `fga-engine-beta`
- `top-navigation-enabled`
- `global-chat-column-layout`
- `engagement-state-mock-controls`
- `global-chat-exp-v2`
- `show-chat-error-message`
- `run-signals-from-search-page-button`
- `import-cost-calculator`
- `auto-tagging-v2`
- `salesforce-user-level-integration-connection`
- `ts-annotations-extractions-enabled`
- `salesforce-agent-in-workflow`
- `health-score-enabled`
- `privacy-determination-agent`
- `global-chat-enabled`
- `theme-switcher-enabled`
- `salesforce-agent-in-chat`
- `auto-stripe-for-tm-add`
- `ring-central`
- `agents-ui`
- `multiple_workflow_deletions`
- `gmail-enabled`
- `extractions-table`
- `bot-will-not-record-notification`
- `chat-v2`
- `slack-auto-replies`
- `knowledge-bases`
- `homepage-workflows`
- `bot-notifications-enabled`
- `salesforce-beta`
- `dashboard-beta`

### 0% Rollout (10) - Review or Remove

| Flag Key                        | Has Early Access? | Action                    |
| ------------------------------- | ----------------- | ------------------------- |
| `sso-login-enabled`             | Yes               | Keep - intentional gating |
| `integration-slack-mcp-enabled` | Yes               | Keep - intentional gating |
| `integration-linear-enabled`    | Yes               | Keep - intentional gating |
| `bot-jit-scheduling-enabled`    | No                | Remove or activate        |
| `beta-features-enabled`         | Yes               | Remove - superseded       |
| `ai-search-filters`             | No                | Remove                    |
| `calendar-write-permission`     | No                | Remove                    |
| `new-invite-flow`               | No                | Remove                    |
| `system-prompt-template`        | No                | Remove                    |
| `team-invites`                  | No                | Remove                    |

---

## Early Access Features Summary

**Total Early Access Features:** 51

### Correctly Configured Early Access (0% rollout, gated)

These are properly set up as Early Access - users must opt in:

| Flag Key                        | EA Name            | Status       |
| ------------------------------- | ------------------ | ------------ |
| `sso-login-enabled`             | SSO Login          | 0% - correct |
| `integration-slack-mcp-enabled` | Slack AI Chat      | 0% - correct |
| `integration-linear-enabled`    | Linear Integration | 0% - correct |

### Should Remove Early Access Link (100% rollout)

These should have Early Access link removed - they're GA:

| Flag Key                   | EA Name | Action                             |
| -------------------------- | ------- | ---------------------------------- |
| All 25+ flags listed above | Various | Remove EA link, they're already GA |

### Should Convert to Early Access (Internal → Beta)

These internal flags could become user-facing beta features:

| Flag Key               | Candidate for EA? | Notes                    |
| ---------------------- | ----------------- | ------------------------ |
| `auto-tagging-v2`      | Yes               | Popular internal feature |
| `health-score-enabled` | Yes               | Customer value           |
| `global-chat-enabled`  | Yes               | Already has EA link      |
| `agents-ui`            | Maybe             | Complex feature          |

---

## Recommendations

### Immediate Actions (No Code Changes)

1. **Remove Early Access links from 100% flags** - These cause the "toggle breaks feature" problem
2. **Archive 10 inactive flags** - Clean up PostHog
3. **Delete 6 dead 0% flags** - Clean up PostHog

### Short-Term (Code Changes Required)

1. **Graduate 14 GA flags** - Remove flag wrappers from code
2. **Consolidate integration flags** - 22 flags → 6 (by product)
3. **Implement Demo Mode** - For internal testing without flags

### Long-Term (Process Changes)

1. **Define flag lifecycle** - New flag → TTL → Graduate or Archive
2. **Separate concerns:**
   - Feature flags = controlled rollout (internal use)
   - Early Access = user opt-in (customer facing)
3. **Add stage metadata** - `stage: labs | beta | ga`

---

## Demo Mode Default Values

For the Demo Mode toggle (simulating new workspace), these flags should be OFF:

```typescript
export const DEMO_MODE_DEFAULTS: Record<string, boolean> = {
  // All internal flags = false
  "projects-page": false,
  "mediaclip-processing-v2": false,
  "fga-engine-beta": false,
  "top-navigation-enabled": false,
  "global-chat-column-layout": false,
  "integration-dialpad": false,
  "engagement-state-mock-controls": false,
  // ... all 55 internal flags

  // All integration flags = false
  "integration-google-calendar-mcp-enabled": false,
  "integration-google-docs-mcp-enabled": false,
  // ... all integration flags

  // GA flags at 100% = true (these are production features)
  "dataloaders-enabled": true,
  "calendar-widget": true,
  "new-meeting-page": true,
  // ... flags that are truly GA
};
```

---

## Appendix: All 126 Flags

<details>
<summary>Full flag list with details</summary>

### Active Flags (113)

1. `dataloaders-enabled` - 100%, GA
2. `projects-page` - Internal only
3. `push-event-visibility-component-hidden` - Conditional
4. `composio-enabled` - Workspace-specific
5. `mediaclip-processing-v2` - Internal only
6. `fga-performance-comparison` - Internal only
7. `top-navigation-enabled` - Internal + EA
8. `chat-entity-mentions` - 100% + EA
9. `email-recap-banners` - 100% + EA
10. `browser-notifications-feature` - Conditional + EA
    ... (truncated for brevity)

### Inactive Flags (13)

1. `entity-view-redesign`
2. `enable-semantic-search`
3. `integration-clickup-workflow-enabled`
4. `integration-clickup-mcp-enabled`
5. `reprocess-meeting-clip`
6. `free-trial`
7. `signup-enabled`
8. `workflows-v3`
9. `be-fine-tuning-page-refresh`
10. `action-items-page`
11. `banner`
12. `meeting-actions`
13. `maintenance-page`

</details>

---

_Generated by PM Workspace PostHog Audit_  
_Last Updated: January 26, 2026_
