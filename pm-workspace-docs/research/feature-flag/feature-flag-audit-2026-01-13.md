# Feature Flag Audit - AskElephant Production

**Generated:** January 13, 2026  
**Total Flags:** 116  
**Source:** PostHog Production

---

## Executive Summary

| Category                                       | Count | % of Total |
| ---------------------------------------------- | ----- | ---------- |
| 🟢 **100% GA (All Users)**                     | 42    | 36%        |
| 🟡 **Internal Only** (@askelephant.ai)         | 22    | 19%        |
| 🔵 **Limited Beta** (specific companies/users) | 32    | 28%        |
| 🔴 **Effectively Disabled** (0% or inactive)   | 20    | 17%        |

### Key Risk Areas
- **22 features** are only visible to internal users - customers never see them
- **32 features** are in limited beta - creating experience fragmentation
- **20 features** are completely disabled but still in codebase

---

## Detailed Flag Analysis

### 🟢 100% GA - Available to All Users (42 flags)

These features are rolled out to 100% of users with no property filters.

| Flag Key | Description |
|----------|-------------|
| `enable-semantic-search` | Semantic search functionality |
| `email-recap-banners` | Email recap banner UI |
| `chats-sidebar-update` | Changes name/icon of AskElephant tab in sidebar |
| `integration-sendoso-workflow-enabled` | Sendoso workflow integration |
| `unified-automations` | Unified automations tab (workflows, prompts, signals, tags, agents) |
| `unified-settings-page` | Combined workspace settings + personal preferences |
| `paused-bot-reminder` | Reminder when bot is paused |
| `customers-page` | Combines companies and contacts into one page |
| `embed-transcripts` | Transcript embedding |
| `auto-post-meeting-email` | Automatic post-meeting emails |
| `highlevel` | HighLevel integration |
| `meeting-share-v2` | Meeting share v2 UI |
| `chat-message-actions-ui` | Chat message actions (50/50 A/B: Fixed vs Hover) |
| `workflow-ai-assistant-alpha` | Workflow AI chat assistant |
| `asana-mcp` | Asana MCP integration |
| `prompt-library` | Prompt library feature |
| `get-the-app-cta` | "Get the app" button |
| `notetaker-event-log` | Notetaker event logging |
| `new-bot-naming` | New bot naming convention |
| `home-engagements-horizontal` | Horizontal engagements on home page |
| `hubspot-mcp` | HubSpot MCP integration |
| `salesforce-v2-beta` | Direct Salesforce integration |
| `crm-field-updates` | CRM updates component in UI |
| `scorecard-component` | Scorecard component |
| `deepgram-auto-detect-language` | Auto language detection |
| `meetings-list-panel` | Side panel for meetings on company/contact pages |
| `language-model-config` | LLM model configuration (100% control variant) |
| `deepgram-transcription-model` | Transcription model (100% nova-3) |
| `new-meeting-page` | Redesigned meeting page |
| `web-search-scrape-enabled` | Web search scraping |
| `calendar-widget` | Calendar widget |
| `transcript-timelines` | Transcript timelines |
| `talk-to-contact` | Talk to contact feature |
| `talk-to-company` | Talk to company feature |
| `beta-features-opt-in` | Beta features opt-in (excludes gogamify.com, paiv.ai) |

---

### 🟡 Internal Only - @askelephant.ai (22 flags)

These features are ONLY available to internal team members.

| Flag Key                                       | Description                                  | Who Sees It                       |
| ---------------------------------------------- | -------------------------------------------- | --------------------------------- |
| `global-chat-column-layout`                    | Chat takes column space, pushes content left | 9 specific internal emails        |
| `integration-dialpad`                          | Dialpad integration                          | @askelephant.ai                   |
| `engagement-state-mock-controls`               | Mock controls for engagement state           | 7 specific internal emails        |
| `integration-sendoso-mcp-enabled`              | Sendoso MCP                                  | 4 specific internal emails        |
| `integration-google-calendar-mcp-enabled`      | Google Calendar MCP                          | @askelephant.ai                   |
| `integration-google-calendar-workflow-enabled` | Google Calendar workflows                    | @askelephant.ai                   |
| `integration-google-docs-mcp-enabled`          | Google Docs MCP                              | @askelephant.ai                   |
| `integration-google-docs-workflow-enabled`     | Google Docs workflows                        | @askelephant.ai                   |
| `integration-google-sheets-mcp-enabled`        | Google Sheets MCP                            | @askelephant.ai                   |
| `integration-google-sheets-workflow-enabled`   | Google Sheets workflows                      | @askelephant.ai                   |
| `integration-google-tasks-mcp-enabled`         | Google Tasks MCP                             | @askelephant.ai                   |
| `integration-google-tasks-workflow-enabled`    | Google Tasks workflows                       | @askelephant.ai                   |
| `integration-teamwork-workflow-enabled`        | Teamwork workflows                           | tyler.sahagun@askelephant.ai only |
| `integration-teamwork-mcp-enabled`             | Teamwork MCP                                 | tyler.sahagun@askelephant.ai only |
| `import-cost-calculator`                       | Import cost calculator                       | 2 specific emails                 |
| `theme-switcher-enabled`                       | Theme switcher                               | @askelephant.ai                   |
| `mobile-upcoming-device-recording`             | Mobile device recording                      | @askelephant.ai                   |
| `multiple_workflow_deletions`                  | Bulk workflow deletion                       | 3 specific emails                 |
| `agents-ui`                                    | Agents UI                                    | 9 specific internal emails        |
| `health-score-enabled`                         | Health score feature                         | 8 specific internal emails        |
| `bot-notifications-enabled`                    | Bot notifications                            | @askelephant.ai                   |
| `salesforce-beta`                              | Salesforce beta features                     | @askelephant.ai                   |

---

### 🔵 Limited Beta - Specific Companies/Users (32 flags)

These features are available to specific customers or workspaces.

| Flag Key                                       | Description               | Who Sees It                                       | Est. Coverage |
| ---------------------------------------------- | ------------------------- | ------------------------------------------------- | ------------- |
| `chat-tool-process-agent`                      | Process agent in chat     | 1 workspace + 1 user                              | <1%           |
| `browser-notifications-feature`                | Browser notifications     | 2 specific emails                                 | <1%           |
| `crm-agent-upgrades`                           | CRM agent upgrades        | 6 specific user IDs                               | <1%           |
| `integration-confluence-workflow-enabled`      | Confluence workflows      | AskElephant + Tilt                                | ~2%           |
| `integration-confluence-mcp-enabled`           | Confluence MCP            | AskElephant + Tilt                                | ~2%           |
| `global-chat-exp-v2`                           | Global chat v2            | @askelephant.ai + 5 workspaces                    | ~5%           |
| `show-chat-error-message`                      | Chat error messages       | 4 internal engineers                              | <1%           |
| `run-signals-from-search-page-button`          | Run signals from search   | 16 specific emails                                | ~2%           |
| `integration-google-drive-mcp-enabled`         | Google Drive MCP          | @askelephant.ai + ourtilt.com + 1 user            | ~2%           |
| `integration-google-drive-workflow-enabled`    | Google Drive workflows    | @askelephant.ai + ourtilt.com                     | ~2%           |
| `chat-tool-settings-agent`                     | Settings agent in chat    | 1 workspace                                       | <1%           |
| `gong-integration-enabled`                     | Gong integration          | 8 specific workspaces                             | ~5%           |
| **`auto-tagging-v2`**                          | Auto-tagging v2           | 6 workspaces + 4 workspace IDs                    | ~8%           |
| `integration-monday-mcp-enabled`               | Monday.com MCP            | @askelephant.ai + 3 domains                       | ~3%           |
| `integration-monday-workflow-enabled`          | Monday.com workflows      | @askelephant.ai + 3 domains                       | ~3%           |
| `integration-linear-mcp-enabled`               | Linear MCP in chat        | @askelephant.ai + 1 workspace                     | ~2%           |
| `integration-linear-workflow-enabled`          | Linear workflows          | @askelephant.ai + 1 workspace                     | ~2%           |
| `integration-notion-mcp-enabled`               | Notion MCP                | @askelephant.ai + 5 users + 3 workspaces          | ~5%           |
| `integration-notion-workflow-enabled`          | Notion workflows          | @askelephant.ai + 5 users + 3 workspaces          | ~5%           |
| `salesforce-user-level-integration-connection` | SF user-level integration | AskElephant + 27 users + 3 workspaces             | ~15%          |
| `ts-annotations-extractions-enabled`           | TS-side extractions       | AskElephant + 1 user                              | ~2%           |
| `salesforce-agent-in-workflow`                 | SF agent in workflows     | AskElephant + 26 users + 4 workspaces             | ~15%          |
| `chat-tool-internal-search`                    | Internal search in chat   | @askelephant.ai + 6 users + 16 workspaces         | ~15%          |
| `meeting-trigger-privacy-check`                | Meeting privacy check     | 4 workspace IDs                                   | ~3%           |
| `privacy-determination-agent`                  | Privacy agent             | 11 specific emails                                | ~1%           |
| `global-chat-enabled`                          | Global chat               | @askelephant.ai + 12 users + 3 domains            | ~10%          |
| `salesforce-agent-in-chat`                     | SF agent in chat          | AskElephant + 27 users + 4 workspaces             | ~15%          |
| `ring-central`                                 | RingCentral integration   | tyler.sahagun + 1 workspace                       | <1%           |
| `gmail-enabled`                                | Gmail/Nylas integration   | @askelephant.ai + getredo.com + 3 users           | ~5%           |
| `extractions-table`                            | Extractions table         | @askelephant.ai + 8 workspaces + 21 workspace IDs | ~20%          |
| `chat-v2`                                      | Chat v2                   | 4 specific internal emails                        | <1%           |
| `slack-auto-replies`                           | Slack auto-replies        | 6 workspaces                                      | ~5%           |
| `knowledge-bases`                              | Knowledge bases           | 6 workspaces + 3 users                            | ~5%           |
| `dashboard-beta`                               | Dashboard beta            | 15 workspaces + beta enrollees                    | ~15%          |
| `workflows-v2`                                 | Workflows v2              | Beta enrollees + OWNER/MANAGER roles              | ~30%          |

---

### 🔴 Effectively Disabled (20 flags)

These flags are either inactive or have 0% rollout.

| Flag Key | Status | Description |
|----------|--------|-------------|
| `integration-clickup-workflow-enabled` | **Inactive** | ClickUp workflow integration |
| `integration-clickup-mcp-enabled` | **Inactive** | ClickUp MCP integration |
| `reprocess-meeting-clip` | **Inactive** | Meeting clip reprocessing |
| `free-trial` | **Inactive** + 0% | Free trial feature |
| `signup-enabled` | **Inactive** | Public signup |
| `workflows-v3` | **Inactive** | Workflows v3 (future?) |
| `be-fine-tuning-page-refresh` | **Inactive** | Fine-tuning page |
| `action-items-page` | **Inactive** | Action items page |
| `banner` | **Inactive** | System-wide banner (incident use) |
| `meeting-actions` | **Inactive** | Meeting actions |
| `maintenance-page` | **Inactive** | Maintenance page |
| `sso-login-enabled` | Active but **0%** | SSO login |
| `integration-slack-mcp-enabled` | Active but **0%** | Slack MCP integration |
| `integration-linear-enabled` | Active but **0%** | Linear integration |
| `ai-search-filters` | Active but **0%** | AI search filters |
| `calendar-write-permission` | Active but **0%** | Calendar write access |
| `new-invite-flow` | Active but **0%** | New team member invite flow |
| `team-invites` | Active but **0%** | Team invites button |
| `bot-jit-scheduling-enabled` | Active but **0%** (AskElephant only) | JIT bot scheduling |
| `bot-will-not-record-notification` | AskElephant only | Bot won't record notification |

---

## Combinatorics Analysis

### Understanding the "Different Versions" Problem

Feature flags create an exponential number of possible product experiences. The formula is:

**Possible combinations = 2^n** (where n = number of boolean flags)

However, not all flags are independent or applicable to all users.

### Practical Segmentation

Based on the targeting rules, here are the meaningful customer segments:

#### Segment 1: Standard External Customer (Largest Group)
**~50% of customers see this experience**

Enabled flags (42 GA flags):
- All 100% rollout flags
- No beta features
- No internal features

#### Segment 2: Beta-Enrolled Customer
**~30% of customers**

Enabled flags:
- All 100% rollout flags (42)
- `workflows-v2` (if OWNER/MANAGER role)
- `dashboard-beta`
- Opt-in beta features

**Additional features: 2-5 depending on enrollment**

#### Segment 3: Specific Company Beta
**~15% of customers (targeted companies)**

These customers have company-specific flags enabled:

| Company/Domain | Additional Features |
|----------------|---------------------|
| Redo/REDO | extractions-table, global-chat-exp-v2, knowledge-bases, gmail-enabled |
| Tilt | integration-confluence-*, integration-google-drive-* |
| Agility Ads | extractions-table, global-chat-exp-v2 |
| Broadvoice | salesforce-agent-*, salesforce-user-level-integration |
| Chili Publish | salesforce-agent-*, salesforce-user-level-integration |
| Doxel AI | salesforce-agent-*, salesforce-user-level-integration |
| Sendoso | salesforce-agent-in-workflow |
| Rebuy Engine | salesforce-agent-in-chat, salesforce-user-level-integration |
| KLAS Research | salesforce-agent-*, salesforce-user-level-integration |
| ELB Learning | slack-auto-replies, knowledge-bases, dashboard-beta |
| Boostly | global-chat-enabled, dashboard-beta |

#### Segment 4: AskElephant Internal
**<5% of users (internal team)**

Enabled flags:
- All 100% rollout flags (42)
- All internal-only flags (22)
- Most beta flags
- Testing/debug flags

**Total features visible: ~90+ flags**

---

## Theoretical Maximum Combinations

If we consider only the **32 beta flags** that create meaningful segmentation:

**Theoretical max: 2^32 = 4,294,967,296 combinations**

### Practical Combinations

However, many flags are correlated (e.g., MCP + workflow pairs). Grouping related flags:

| Flag Group | Flags | Treated as 1 toggle |
|------------|-------|---------------------|
| Salesforce Agent | salesforce-agent-in-chat, salesforce-agent-in-workflow, salesforce-user-level-integration | 1 |
| Google Suite | 8 google-* flags | 1 |
| Notion | integration-notion-mcp-enabled, integration-notion-workflow-enabled | 1 |
| Linear | integration-linear-mcp-enabled, integration-linear-workflow-enabled, integration-linear-enabled | 1 |
| Monday | integration-monday-mcp-enabled, integration-monday-workflow-enabled | 1 |
| Confluence | integration-confluence-mcp-enabled, integration-confluence-workflow-enabled | 1 |

After grouping: **~15 independent feature groups**

**Practical combinations: 2^15 = 32,768 possible experiences**

---

## Key Findings & Recommendations

### 🚨 Issues Identified

1. **Experience Fragmentation**
   - 32 features in "limited beta" creates inconsistent experiences
   - Customers talking to each other may reference features others don't have

2. **Dead Code**
   - 20 flags are effectively disabled but code likely remains
   - Risk of bugs, security issues in unused code paths

3. **Integration Parity Gap**
   - Google Suite integrations: Internal only
   - Notion/Linear: ~5% of customers
   - Salesforce Agent: ~15% of customers
   - Creates unequal value for different customers

4. **Internal-Only Features (22 flags)**
   - These features may never ship to customers
   - Engineering cost with no customer value yet

### ✅ Recommendations

1. **GA Candidates** (consider rolling to 100%):
   - `global-chat-enabled` - Core feature, 10% beta
   - `extractions-table` - 20% beta, seems stable
   - `chat-tool-internal-search` - 15% beta, high value
   - `gmail-enabled` - 5% beta, competitive parity

2. **Deprecation Candidates**:
   - `workflows-v3` - Inactive, unclear purpose
   - `action-items-page` - Inactive
   - `meeting-actions` - Inactive
   - `be-fine-tuning-page-refresh` - Inactive

3. **Consolidation Needed**:
   - Group all Google Suite flags into single toggle
   - Group all Salesforce flags into single toggle
   - Simplify integration enablement

4. **Kill Switch Audit**:
   - `maintenance-page` - Good to have for incidents
   - `banner` - Good for incident communication
   - Keep these but document their use

---

## Appendix: Complete Flag Reference

### Active Flags (105)

| ID | Key | Rollout Type | Est. Coverage |
|----|-----|--------------|---------------|
| 400726 | enable-semantic-search | 100% GA | 100% |
| 399824 | chat-tool-process-agent | Specific workspace | <1% |
| 365824 | email-recap-banners | 100% GA | 100% |
| 339463 | browser-notifications-feature | 2 users | <1% |
| 338139 | global-chat-column-layout | 9 internal | <1% |
| 332160 | integration-dialpad | Internal | <5% |
| 281757 | chats-sidebar-update | 100% GA | 100% |
| 280628 | engagement-state-mock-controls | 7 internal | <1% |
| 276107 | crm-agent-upgrades | 6 users | <1% |
| 258460 | integration-sendoso-mcp-enabled | 4 internal | <1% |
| 258459 | integration-sendoso-workflow-enabled | 100% GA | 100% |
| 257591 | unified-automations | 100% GA | 100% |
| 254178 | unified-settings-page | 100% GA | 100% |
| 254084 | integration-confluence-workflow-enabled | 2 workspaces | ~2% |
| 254080 | integration-confluence-mcp-enabled | 2 workspaces | ~2% |
| 248217 | paused-bot-reminder | 100% GA | 100% |
| 246686 | global-chat-exp-v2 | Internal + 5 workspaces | ~5% |
| 242520 | show-chat-error-message | 4 engineers | <1% |
| 238083 | run-signals-from-search-page-button | 16 users | ~2% |
| 236972 | customers-page | 100% GA | 100% |
| 233731 | integration-google-calendar-mcp-enabled | Internal | <5% |
| 233730 | integration-google-calendar-workflow-enabled | Internal | <5% |
| 233726 | integration-google-docs-mcp-enabled | Internal | <5% |
| 233723 | integration-google-docs-workflow-enabled | Internal | <5% |
| 233720 | integration-google-drive-mcp-enabled | Internal + 2 | ~2% |
| 233717 | integration-google-drive-workflow-enabled | Internal + 1 | ~2% |
| 233714 | integration-google-sheets-mcp-enabled | Internal | <5% |
| 233711 | integration-google-tasks-mcp-enabled | Internal | <5% |
| 233708 | integration-google-sheets-workflow-enabled | Internal | <5% |
| 233697 | integration-google-tasks-workflow-enabled | Internal | <5% |
| 231825 | sso-login-enabled | 0% | 0% |
| 230675 | chat-tool-settings-agent | 1 workspace | <1% |
| 230387 | embed-transcripts | 100% GA | 100% |
| 229587 | gong-integration-enabled | 8 workspaces | ~5% |
| 228382 | integration-teamwork-workflow-enabled | 1 user | <1% |
| 228379 | integration-teamwork-mcp-enabled | 1 user | <1% |
| 221086 | auto-post-meeting-email | 100% GA | 100% |
| 219888 | import-cost-calculator | 2 users | <1% |
| 217797 | auto-tagging-v2 | 10 workspaces | ~8% |
| 206336 | integration-monday-mcp-enabled | Internal + 3 domains | ~3% |
| 206335 | integration-monday-workflow-enabled | Internal + 3 domains | ~3% |
| 206129 | integration-linear-mcp-enabled | Internal + 2 | ~2% |
| 206128 | integration-linear-workflow-enabled | Internal + 1 workspace | ~2% |
| 205635 | integration-notion-mcp-enabled | Internal + 8 | ~5% |
| 205632 | integration-notion-workflow-enabled | Internal + 8 | ~5% |
| 204361 | salesforce-user-level-integration-connection | Multiple targets | ~15% |
| 202850 | highlevel | 100% GA | 100% |
| 202423 | ts-annotations-extractions-enabled | Internal + 1 | ~2% |
| 201737 | salesforce-agent-in-workflow | Multiple targets | ~15% |
| 201604 | chat-tool-internal-search | Multiple targets | ~15% |
| 198971 | health-score-enabled | 8 internal | <1% |
| 198868 | meeting-trigger-privacy-check | 4 workspaces | ~3% |
| 197369 | meeting-share-v2 | 100% GA | 100% |
| 192720 | chat-message-actions-ui | 100% GA (A/B) | 100% |
| 192641 | workflow-ai-assistant-alpha | 100% GA | 100% |
| 190239 | asana-mcp | 100% GA | 100% |
| 189358 | privacy-determination-agent | 11 users | ~1% |
| 187602 | global-chat-enabled | Multiple targets | ~10% |
| 185707 | theme-switcher-enabled | Internal | <5% |
| 184758 | integration-slack-mcp-enabled | 0% | 0% |
| 184755 | salesforce-agent-in-chat | Multiple targets | ~15% |
| 184750 | integration-linear-enabled | 0% | 0% |
| 182210 | auto-stripe-for-tm-add | 100% (excludes 9 domains) | ~95% |
| 181058 | ring-central | 1 user + 1 workspace | <1% |
| 177436 | agents-ui | 9 internal | <1% |
| 176322 | prompt-library | 100% GA | 100% |
| 175806 | get-the-app-cta | 100% GA | 100% |
| 173616 | mobile-upcoming-device-recording | Internal | <5% |
| 171191 | multiple_workflow_deletions | 3 users | <1% |
| 166376 | notetaker-event-log | 100% GA | 100% |
| 164022 | new-bot-naming | 100% GA | 100% |
| 156620 | home-engagements-horizontal | 100% GA | 100% |
| 150344 | hubspot-mcp | 100% GA | 100% |
| 135908 | gmail-enabled | Internal + 2 domains + 3 | ~5% |
| 134419 | extractions-table | Multiple targets | ~20% |
| 123853 | salesforce-v2-beta | 100% GA | 100% |
| 121644 | crm-field-updates | 100% GA | 100% |
| 119308 | scorecard-component | 100% GA | 100% |
| 118516 | bot-jit-scheduling-enabled | AskElephant 0% | 0% |
| 118017 | beta-features-enabled | 0% + super_group | Opt-in |
| 117282 | deepgram-auto-detect-language | 100% GA | 100% |
| 114478 | meetings-list-panel | 100% GA | 100% |
| 108587 | language-model-config | 100% GA (variant) | 100% |
| 105669 | deepgram-transcription-model | 100% GA (nova-3) | 100% |
| 105654 | new-meeting-page | 100% GA | 100% |
| 101375 | web-search-scrape-enabled | 100% GA | 100% |
| 100807 | ai-search-filters | 0% | 0% |
| 98720 | calendar-write-permission | 0% | 0% |
| 98715 | calendar-widget | 100% GA | 100% |
| 94680 | transcript-timelines | 100% GA | 100% |
| 94118 | bot-will-not-record-notification | AskElephant only | <5% |
| 89123 | chat-v2 | 4 internal | <1% |
| 89010 | slack-auto-replies | 7 workspaces | ~5% |
| 83845 | knowledge-bases | 6 workspaces + 3 | ~5% |
| 82372 | homepage-workflows | AskElephant only | <5% |
| 80358 | bot-notifications-enabled | Internal | <5% |
| 78504 | new-invite-flow | 0% | 0% |
| 77839 | system-prompt-template | 0% (variant test) | 100% control |
| 75567 | beta-features-opt-in | 100% (excludes 2) | ~99% |
| 74951 | salesforce-beta | Internal | <5% |
| 72531 | talk-to-contact | 100% GA | 100% |
| 72530 | talk-to-company | 100% GA | 100% |
| 72407 | team-invites | 0% | 0% |
| 72394 | dashboard-beta | 15 workspaces + beta | ~15% |
| 72389 | workflows-v2 | Beta + OWNER/MANAGER | ~30% |

### Inactive Flags (11)

| ID | Key | Description |
|----|-----|-------------|
| 250153 | integration-clickup-workflow-enabled | ClickUp workflows |
| 250152 | integration-clickup-mcp-enabled | ClickUp MCP |
| 205467 | reprocess-meeting-clip | Meeting clip reprocessing |
| 186627 | free-trial | Free trial |
| 183899 | signup-enabled | Public signup |
| 157677 | workflows-v3 | Workflows v3 |
| 146727 | be-fine-tuning-page-refresh | Fine-tuning page |
| 113293 | action-items-page | Action items page |
| 93267 | banner | System banner |
| 73161 | meeting-actions | Meeting actions |
| 72398 | maintenance-page | Maintenance mode |

---

## 🕰️ Stale Feature Flags Report

Stale flags are identified by:
- **Age**: Flag ID correlates to creation time (lower = older)
- **Status**: Still in beta/internal after extended period
- **Activity**: Never reached GA or was abandoned

### Staleness Criteria

| Category | Definition | Risk Level |
|----------|------------|------------|
| 🔴 **Critical** | Inactive for 6+ months, no clear owner | High - remove |
| 🟠 **Warning** | In beta 6+ months, no expansion plan | Medium - decide |
| 🟡 **Monitor** | Internal-only 3+ months, unclear roadmap | Low - document |

---

### 🔴 Critical: Remove These Flags (11 flags)

These flags have been inactive or abandoned and should be cleaned up.

| ID | Flag Key | Status | Est. Age | Recommendation |
|----|----------|--------|----------|----------------|
| 72389 | `workflows-v2` | Active but legacy | ~18 months | Superseded? Migrate to v3 or GA |
| 72394 | `dashboard-beta` | Still "beta" | ~18 months | **GA or kill** - beta too long |
| 72398 | `maintenance-page` | Inactive | ~18 months | Keep as kill switch, document |
| 72407 | `team-invites` | 0% rollout | ~18 months | **Dead code** - remove |
| 73161 | `meeting-actions` | Inactive | ~17 months | **Dead code** - remove |
| 74951 | `salesforce-beta` | Internal only | ~17 months | Superseded by salesforce-v2-beta? |
| 75567 | `beta-features-opt-in` | Active | ~17 months | Meta-flag, keep but audit |
| 77839 | `system-prompt-template` | 0% variant | ~16 months | A/B test abandoned? |
| 78504 | `new-invite-flow` | 0% rollout | ~16 months | **Never launched** - remove |
| 80358 | `bot-notifications-enabled` | Internal only | ~15 months | **Stuck in internal** - GA or kill |
| 82372 | `homepage-workflows` | AskElephant only | ~15 months | **Never shipped** - remove |

**Total dead code risk: 11 flags × avg 500 LOC = ~5,500 lines of potentially unmaintained code**

---

### 🟠 Warning: Decision Required (14 flags)

These flags have been in limited rollout too long without a clear plan.

| ID | Flag Key | Current State | Age | Decision Needed |
|----|----------|---------------|-----|-----------------|
| 83845 | `knowledge-bases` | 6 workspaces | ~14 months | GA candidate? |
| 89010 | `slack-auto-replies` | 7 workspaces | ~13 months | GA candidate? |
| 89123 | `chat-v2` | 4 internal users | ~13 months | Superseded? |
| 93267 | `banner` | Inactive | ~12 months | Keep for incidents |
| 94118 | `bot-will-not-record-notification` | AskElephant only | ~12 months | GA or remove |
| 98715 | `calendar-widget` | 100% GA | ~11 months | ✅ Already GA - clean up flag |
| 98720 | `calendar-write-permission` | 0% | ~11 months | Abandoned feature? |
| 100807 | `ai-search-filters` | 0% | ~10 months | Never launched |
| 105654 | `new-meeting-page` | 100% GA | ~9 months | ✅ Already GA - clean up flag |
| 105669 | `deepgram-transcription-model` | 100% nova-3 | ~9 months | ✅ Clean up, hardcode nova-3 |
| 108587 | `language-model-config` | 100% control | ~9 months | A/B test complete? |
| 113293 | `action-items-page` | Inactive | ~8 months | **Remove** - never shipped |
| 118017 | `beta-features-enabled` | Opt-in meta | ~8 months | Keep, but audit usage |
| 118516 | `bot-jit-scheduling-enabled` | 0% | ~8 months | Abandoned? |

---

### 🟡 Monitor: Clarify Roadmap (8 flags)

These flags are internal-only and may never ship to customers.

| ID | Flag Key | Current State | Question |
|----|----------|---------------|----------|
| 119308 | `scorecard-component` | 100% GA | ✅ Clean up flag |
| 121644 | `crm-field-updates` | 100% GA | ✅ Clean up flag |
| 123853 | `salesforce-v2-beta` | 100% GA | ✅ Clean up flag - "beta" misnomer |
| 134419 | `extractions-table` | ~20% beta | When GA? 7+ months in beta |
| 135908 | `gmail-enabled` | ~5% | Nylas dependency - expand? |
| 146727 | `be-fine-tuning-page-refresh` | Inactive | Remove |
| 150344 | `hubspot-mcp` | 100% GA | ✅ Clean up flag |
| 157677 | `workflows-v3` | Inactive | Future or abandoned? |

---

### Flags Ready to Graduate (Remove Flag, Keep Feature)

These flags are at 100% GA and the flag wrapper can be removed:

| Flag Key | Status | Action |
|----------|--------|--------|
| `calendar-widget` | 100% GA | Remove flag, keep feature |
| `new-meeting-page` | 100% GA | Remove flag, keep feature |
| `scorecard-component` | 100% GA | Remove flag, keep feature |
| `crm-field-updates` | 100% GA | Remove flag, keep feature |
| `salesforce-v2-beta` | 100% GA | Remove flag, keep feature |
| `hubspot-mcp` | 100% GA | Remove flag, keep feature |
| `deepgram-transcription-model` | 100% nova-3 | Hardcode model, remove flag |
| `deepgram-auto-detect-language` | 100% GA | Remove flag, keep feature |

**Estimated cleanup: 8 flags = reduced complexity, faster evaluations**

---

## 🎯 Actual Customer Experience Groups

This section maps the **real, distinct product experiences** customers see based on feature flag targeting.

### Methodology

1. Analyzed all 116 flag targeting rules
2. Grouped customers by their actual flag combinations
3. Identified 23 unique experience cohorts

---

### Experience Group Matrix

#### Group 1: 🌐 Standard Experience (Baseline)
**Est. ~55% of all customers**

Customers with no special targeting - they see only 100% GA flags.

**Features Enabled:** 42 GA flags  
**Features Hidden:** All beta, internal, and targeted features

**Who's in this group:**
- All customers NOT listed in groups below
- New signups
- Customers who haven't opted into beta

---

#### Group 2: 🔷 Beta-Enrolled (OWNER/MANAGER)
**Est. ~25% of customers**

Customers who opted into beta features AND have OWNER/MANAGER role.

**Additional Features Beyond Baseline:**
- `workflows-v2`
- `dashboard-beta`

**Who's in this group:**
- Any workspace where user enrolled via `beta-features-enabled`
- Must have OWNER or MANAGER role

---

#### Group 3: 🏢 AskElephant Internal
**Est. <5% of users (internal team only)**

**Additional Features Beyond Baseline (64 extra flags):**

| Category | Flags |
|----------|-------|
| All Google Suite | google-calendar-*, google-docs-*, google-drive-*, google-sheets-*, google-tasks-* (8 flags) |
| Internal Tools | theme-switcher, mobile-upcoming-device-recording, bot-notifications, salesforce-beta, dialpad |
| Debug/Test | engagement-state-mock-controls, show-chat-error-message, health-score-enabled |
| Beta Features | ALL beta flags |

**Who's in this group:**
- All @askelephant.ai email addresses

---

### Named Customer Experience Groups

#### Group 4: 🔴 Redo / REDO
**Workspace Name:** Redo, REDO, getredo.com

**Additional Features:**
| Flag | Feature |
|------|---------|
| `extractions-table` | ✅ |
| `global-chat-exp-v2` | ✅ |
| `knowledge-bases` | ✅ |
| `gmail-enabled` | ✅ |
| `chat-tool-internal-search` | ✅ |
| `dashboard-beta` | ✅ |
| `auto-tagging-v2` | ✅ |

**Total Features:** Baseline (42) + 7 = **49 features**

---

#### Group 5: 🟠 Tilt
**Workspace Name:** Tilt, ourtilt.com

**Additional Features:**
| Flag | Feature |
|------|---------|
| `integration-confluence-workflow-enabled` | ✅ |
| `integration-confluence-mcp-enabled` | ✅ |
| `integration-google-drive-mcp-enabled` | ✅ |
| `integration-google-drive-workflow-enabled` | ✅ |

**Total Features:** Baseline (42) + 4 = **46 features**

---

#### Group 6: 🟡 Agility Ads
**Workspace Name:** Agility Ads

**Additional Features:**
| Flag | Feature |
|------|---------|
| `extractions-table` | ✅ |
| `global-chat-exp-v2` | ✅ |
| `chat-tool-internal-search` | ✅ |

**Total Features:** Baseline (42) + 3 = **45 features**

---

#### Group 7: 🟢 Cinch
**Workspace Name:** Cinch

**Additional Features:**
| Flag | Feature |
|------|---------|
| `global-chat-exp-v2` | ✅ |
| `chat-tool-internal-search` | ✅ |
| `dashboard-beta` | ✅ |

**Total Features:** Baseline (42) + 3 = **45 features**

---

#### Group 8: 🔵 ELB Learning
**Workspace Name:** ELB Learning

**Additional Features:**
| Flag | Feature |
|------|---------|
| `slack-auto-replies` | ✅ |
| `knowledge-bases` | ✅ |
| `dashboard-beta` | ✅ |

**Total Features:** Baseline (42) + 3 = **45 features**

---

#### Group 9: 🟣 Boostly
**Workspace Name:** Boostly

**Additional Features:**
| Flag | Feature |
|------|---------|
| `global-chat-enabled` | ✅ |
| `chat-tool-internal-search` | ✅ |
| `dashboard-beta` | ✅ |

**Total Features:** Baseline (42) + 3 = **45 features**

---

#### Group 10: ⚫ Salesforce Power Users
**Companies:** Broadvoice, Chili Publish, Doxel AI, Chargezoom

**Additional Features:**
| Flag | Feature |
|------|---------|
| `salesforce-agent-in-chat` | ✅ |
| `salesforce-agent-in-workflow` | ✅ |
| `salesforce-user-level-integration-connection` | ✅ |

**Total Features:** Baseline (42) + 3 = **45 features**

---

#### Group 11: 🔘 Salesforce Limited
**Specific Users at:** KLAS Research, Finally, Ezderm, ObservePoint, Rebuy Engine, Solutionreach, Teikametrics, Dental Intel, Brevium, Sendoso, Force Experts, Parallel, Clozd, FB Inv

**Additional Features:**
| Flag | Feature |
|------|---------|
| `salesforce-agent-in-chat` | ✅ |
| `salesforce-agent-in-workflow` | ✅ |
| `salesforce-user-level-integration-connection` | ✅ |

*Note: Only specific users at these companies, not all users*

**Total Features:** Baseline (42) + 3 = **45 features**

---

#### Group 12: 📊 Extractions Beta
**Workspaces:** 24 and Up, Jump Cap, Revcast, Knowledge Base, Parallel + 21 specific workspace IDs

**Additional Features:**
| Flag | Feature |
|------|---------|
| `extractions-table` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 13: 💬 Global Chat Beta
**Domains:** 1406consulting.com, graniteslopes.com, gro3.com  
**Specific Users:** lica@mindandmetrics.com, doug@agilityads.com, kd@finally.com, kevin@sandlerpartners.com, + 8 more

**Additional Features:**
| Flag | Feature |
|------|---------|
| `global-chat-enabled` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 14: 📝 Notion Integration Beta
**Users:** pablo@blumo.io, fabrizio@blumo.io, jeronimo@blumo.io, tommy@brilliant-robot.com, ryan.mccord@endeavorai.com, rachel.pfost@schoolai.com  
**Workspaces:** 3 specific workspace IDs

**Additional Features:**
| Flag | Feature |
|------|---------|
| `integration-notion-mcp-enabled` | ✅ |
| `integration-notion-workflow-enabled` | ✅ |

**Total Features:** Baseline (42) + 2 = **44 features**

---

#### Group 15: 📅 Monday.com Integration Beta
**Domains:** stoutfactor.com, vineyardgrowth.com, watertech.com

**Additional Features:**
| Flag | Feature |
|------|---------|
| `integration-monday-mcp-enabled` | ✅ |
| `integration-monday-workflow-enabled` | ✅ |

**Total Features:** Baseline (42) + 2 = **44 features**

---

#### Group 16: 🎙️ Gong Integration
**Workspaces (8):** Specific workspace IDs only

**Additional Features:**
| Flag | Feature |
|------|---------|
| `gong-integration-enabled` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 17: 🏷️ Auto-Tagging V2 Beta
**Workspaces:** AskElephant, Plansight, josh.yates@fleetsts.com + 4 workspace IDs

**Additional Features:**
| Flag | Feature |
|------|---------|
| `auto-tagging-v2` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 18: 📚 Knowledge Bases
**Workspaces:** Soraban, Propeller Aero, Clozd, PEYD + specific users

**Additional Features:**
| Flag | Feature |
|------|---------|
| `knowledge-bases` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 19: 💬 Slack Auto-Replies
**Workspaces:** Soraban, Remi, Ezderm + 1 workspace ID

**Additional Features:**
| Flag | Feature |
|------|---------|
| `slack-auto-replies` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 20: 🎯 Dashboard Beta (Named)
**Workspaces:** Re:do, Enzy, Schoolai, Tandem, Savi, Applause, The Deal Maker, Voze, Gamify, ClickLease

**Additional Features:**
| Flag | Feature |
|------|---------|
| `dashboard-beta` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 21: 🔗 Linear Integration Beta
**Workspace:** 1 specific workspace ID (wrks_01JNKR8F73N0ZRYJP3F3H4JPRR)

**Additional Features:**
| Flag | Feature |
|------|---------|
| `integration-linear-mcp-enabled` | ✅ |
| `integration-linear-workflow-enabled` | ✅ |

**Total Features:** Baseline (42) + 2 = **44 features**

---

#### Group 22: 📧 Gmail Beta
**Domain:** getredo.com  
**Users:** darren@darrenmckee.co, lica@mindandmetrics.com, italo@peddling.io

**Additional Features:**
| Flag | Feature |
|------|---------|
| `gmail-enabled` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

#### Group 23: 🔍 Internal Search Beta
**Workspaces (16):** Agility Ads, Redo, Boostly, Cinch, Parallel, Parakeet, Canopy, Darren Mckee, Tandem, ELB Learning, BoomCloud, Mint PT, Sendoso, KlientBoost  
**Users (6):** andy@applausehq.com, landon@applausehq.com, dustin.kenyon@motivosity.com, dpeterson@graniteslopes.com, ksadler@graniteslopes.com, josh.yates@fleetsts.com

**Additional Features:**
| Flag | Feature |
|------|---------|
| `chat-tool-internal-search` | ✅ |

**Total Features:** Baseline (42) + 1 = **43 features**

---

## Experience Group Summary

| Group # | Name | Additional Features | Est. Customers |
|---------|------|---------------------|----------------|
| 1 | Standard (Baseline) | 0 | ~55% |
| 2 | Beta-Enrolled | +2 | ~25% |
| 3 | AskElephant Internal | +64 | <5% |
| 4 | Redo | +7 | 1 company |
| 5 | Tilt | +4 | 1 company |
| 6 | Agility Ads | +3 | 1 company |
| 7 | Cinch | +3 | 1 company |
| 8 | ELB Learning | +3 | 1 company |
| 9 | Boostly | +3 | 1 company |
| 10 | SF Power Users | +3 | 4 companies |
| 11 | SF Limited Users | +3 | ~30 users |
| 12 | Extractions Beta | +1 | ~25 workspaces |
| 13 | Global Chat Beta | +1 | 3 domains + users |
| 14 | Notion Beta | +2 | 6 users + 3 workspaces |
| 15 | Monday Beta | +2 | 3 domains |
| 16 | Gong Integration | +1 | 8 workspaces |
| 17 | Auto-Tagging V2 | +1 | 7 targets |
| 18 | Knowledge Bases | +1 | 6 companies |
| 19 | Slack Auto-Replies | +1 | 4 companies |
| 20 | Dashboard Beta | +1 | 10 workspaces |
| 21 | Linear Beta | +2 | 1 workspace |
| 22 | Gmail Beta | +1 | 1 domain + 3 users |
| 23 | Internal Search | +1 | 16 workspaces + 6 users |

---

## Unique Experience Count: 23 Distinct Cohorts

**Note:** Some customers belong to MULTIPLE groups (e.g., Redo has extractions + global chat + knowledge bases + gmail + internal search + dashboard + auto-tagging). The actual combinations create overlapping experiences.

### Overlap Analysis

| Company | Groups | Total Extra Features |
|---------|--------|---------------------|
| **Redo** | 4, 12, 13, 17, 18, 20, 22, 23 | +7 unique |
| **Agility Ads** | 6, 12, 13, 23 | +3 unique |
| **Cinch** | 7, 13, 20, 23 | +3 unique |
| **ELB Learning** | 8, 18, 19, 20 | +3 unique |
| **Boostly** | 9, 13, 20, 23 | +3 unique |
| **Sendoso** | 11, 23 | +3 unique |
| **Tandem** | 13, 20 | +2 unique |

### Most Feature-Rich External Customers

1. **Redo** - 49 features (baseline + 7)
2. **Tilt** - 46 features (baseline + 4)
3. **Agility Ads** - 45 features
4. **Cinch** - 45 features
5. **Boostly** - 45 features

### Least Feature-Rich (Baseline Only)

All other customers not specifically targeted - **42 features**

---

## Actionable Insights

### 1. Feature Parity Gap
- **Redo** sees 7 more features than baseline customers
- This creates support complexity and customer confusion

### 2. Integration Fragmentation
- Google Suite: 0% external customers
- Notion: <1% external customers
- Monday: <1% external customers  
- Linear: <1% external customers
- **Gap:** Customers asking "do you integrate with X?" get inconsistent answers

### 3. Stale Beta Programs
- `dashboard-beta` has been beta for 18+ months
- `workflows-v2` has been beta for 18+ months
- **Decision needed:** GA or kill

### 4. Cleanup Opportunities
- **8 flags** can be removed (100% GA, remove wrapper)
- **11 flags** are dead code (remove completely)
- **Estimated LOC reduction:** 10,000+ lines

---

*Report generated from PostHog Production API - January 13, 2026*
