# PostHog Usage & Setup Audit

**Date:** January 23, 2026  
**Organization:** AskElephant  
**Project ID:** 81505

---

## Executive Summary

Your PostHog setup is **mature and well-structured** with good coverage across core product areas. You have 150+ custom events, 25 dashboards, 100+ insights, and active feature flagging. However, there are opportunities to improve event naming consistency, consolidate dashboards, and better leverage experiments/surveys.

### Quick Health Score

| Area                | Score      | Notes                                           |
| ------------------- | ---------- | ----------------------------------------------- |
| Event Tracking      | ⭐⭐⭐⭐   | Good coverage, some naming inconsistency        |
| Dashboards          | ⭐⭐⭐⭐⭐ | Well-organized with project-specific dashboards |
| Feature Flags       | ⭐⭐⭐⭐   | Active use, 30+ flags                           |
| Experiments         | ⭐⭐       | Only 1 active experiment                        |
| Surveys             | ⭐⭐⭐     | NPS active, others completed/draft              |
| Error Tracking      | ⭐⭐⭐⭐   | Active with exception capture                   |
| User Identification | ⭐⭐⭐⭐⭐ | Good person/group properties                    |

---

## Current State Analysis

### 1. Event Tracking (150+ Events)

**What's Working Well:**

- Namespaced events with clear prefixes (`onboarding:`, `mobile:`, `workflows:`, `hubspot_agent:`)
- Good coverage of user journeys (onboarding flow, recording lifecycle)
- Error/failure events tracked (`_failed` suffix pattern)
- AI/LLM tracking via `$ai_generation`, `$ai_embedding`, `$ai_evaluation`

**Event Categories Identified:**

| Category      | Example Events                                                             | Coverage    |
| ------------- | -------------------------------------------------------------------------- | ----------- |
| Onboarding    | `onboarding:step_completed`, `onboarding:flow_completed`                   | ✅ Complete |
| Recording     | `audio_recording_started`, `audio_recording_upload_completed`              | ✅ Complete |
| Workflows     | `workflows:run_started`, `workflows:run_completed`, `workflows:run_failed` | ✅ Complete |
| Agents        | `hubspot_agent:enabled`, `email_agent:toggled`, `asana_agent:enabled`      | ✅ Complete |
| Mobile        | `mobile:local_recording_saved`, `mobile:upload_file_success`               | ✅ Complete |
| Bot/Notetaker | `recall:bot_done`, `recall:bot_fatal`, `recall:bot_joining_call`           | ✅ Complete |
| Chat          | `chat_created`, `global_chat_opened`, `clip_chat:message_submitted`        | ✅ Good     |
| CRM           | `salesforce_agent:enabled`, `hubspot_agent:toggled`                        | ✅ Good     |
| Users         | `users:create_user:created`, `create_team_member:form_submit`              | ✅ Good     |

**Issues Identified:**

1. **Inconsistent naming patterns:**
   - Some use colons: `workflows:run_started`
   - Some use underscores: `audio_recording_started`
   - Some are plain: `chat_created`, `error`

2. **Stale events (not seen in months):**
   - `pipelines:artifact_interacted_with` (last seen Dec 2024)
   - `conversation_created` (last seen June 2025)
   - `settings.press`, `open_meeting.press` (Aug 2025)
3. **Unclear events:**
   - `"Error fetching more past engagements:"` - appears to be a logged error string
   - `error` - too generic

4. **Missing high-value events:**
   - No explicit `meeting_viewed` or `transcript_viewed` event
   - No `workspace_created` event visible
   - No retention/engagement scoring events

### 2. Dashboards (25 Dashboards)

**Well-Organized Project Dashboards:**

| Dashboard                     | Purpose                                  | Status              |
| ----------------------------- | ---------------------------------------- | ------------------- |
| Company Dashboard             | Core metrics, WAU, retention             | ✅ Active           |
| Capture Visibility Dashboard  | Recording success rates across platforms | ✅ Excellent        |
| CRM Agent Upgrades Dashboard  | HubSpot/Salesforce agent parity          | ✅ Project-specific |
| Global Chat & Internal Search | Chat adoption, context awareness         | ✅ Project-specific |
| Privacy Determination Agent   | Privacy settings, manual toggles         | ✅ Project-specific |
| Workflow Health Monitoring    | Workflow system health                   | ✅ Critical         |
| Notetaker Dashboard           | Bot metrics                              | ✅ Active           |
| Mobile App Dashboard          | Mobile-specific insights                 | ✅ Active           |
| Desktop App Dashboard         | Desktop app vitals                       | ✅ Active           |

**Journey Dashboards (Well-structured):**

- 1. Onboarding Journey
- 2. Integration Setup
- 3. Meetings & Engagement
- 4. AI Chat Journey
- 5. Workflows
- 10. Search
- 11. Settings & Configuration
- 12. Agents (Beta)
- 13. Notifications
- 14. Knowledge Base
- 15. Sharing & Collaboration

**Assessment:** Dashboard organization is excellent. Journey-based numbering (1-15) suggests intentional funnel analysis.

### 3. Feature Flags (30+ Active)

**Active and Well-Used:**

- `top-navigation-enabled` - UI changes with clear description
- `composio-enabled`, `fga-engine-beta` - Feature rollouts
- `chat-tool-process-agent`, `chat-entity-mentions` - Chat features
- `unified-automations` - Major feature consolidation
- Integration toggles (`integration-dialpad`, `integration-sendoso-*`)

**Observations:**

- Good separation of MCP vs workflow toggles for integrations
- Feature flag payloads used for configuration (language models)
- `engagement-state-mock-controls` suggests good testing practices

**Missing:**

- No clear A/B testing naming convention (e.g., `exp-*` prefix)
- Some flags lack descriptions

### 4. Experiments (1 Active)

**Current Experiment:**

- **Chat Button Hover Panel Experiment** - Testing hover vs fixed button actions
- Started: Sept 2025, still running
- Variants: control (Fixed) 50%, variant (Hover) 50%

**Gap:** Only 1 experiment suggests experiments are underutilized. With your feature flag infrastructure, you could run more.

### 5. Surveys (5 Total)

| Survey                             | Type    | Status    | Targeting                        |
| ---------------------------------- | ------- | --------- | -------------------------------- |
| Net Promoter Score (NPS)           | Popover | ✅ Active | Every 30 days, excludes internal |
| HubSpot Agent feedback w/incentive | Popover | Completed | Specific workspaces              |
| CSAT - NoteTaker Experience        | Popover | Completed | Engagement page                  |
| HubSpot Agent feedback             | Popover | Completed | Agent output viewed              |
| Onboarding feedback                | Popover | Draft     | Not launched                     |

**Assessment:** Good foundation. NPS is active. Could benefit from more feature-specific surveys.

### 6. Error Tracking

**Top Active Errors:**

1. `AbortError: signal is aborted without reason` - 958 occurrences, 44 users
2. `Non-Error promise rejection captured with value: Object Not Found...` - 459 occurrences, 1 user
3. Various Apollo/GraphQL errors

**Assessment:** Error tracking is active. Consider setting up alerts for spike detection.

### 7. Person Properties (50+)

**Well-Tracked:**

- Standard: `email`, `name`, `role`, `workspaceId`, `workspaceName`
- Feature enrollments: `$feature_enrollment/*` for all flags
- Platform: `electronVersion`, `webAppVersion`, `operatingSystem`
- UTM parameters: `fbclid`, `dclid`, `epik`

**Group Analytics:**

- Using `workspace` as group type ✅
- `$group_1` properly set with workspace ID

---

## Ideal PostHog Setup vs Current State

### ✅ What You're Doing Well

1. **Event namespacing** - Most events follow `category:action` pattern
2. **Project dashboards** - Each major initiative has its own dashboard
3. **Error capture** - Exception tracking enabled with source maps
4. **Group analytics** - Workspace-level analysis enabled
5. **Feature flag payloads** - Using payloads for configuration
6. **Session recording** - Enabled with console log capture
7. **Test account filtering** - `filterTestAccounts: true` on insights

### ⚠️ Gaps & Opportunities

#### 1. Event Naming Standardization

**Ideal:** Consistent `domain:entity:action` pattern

```
Current (inconsistent):          Recommended:
audio_recording_started      →   recording:audio:started
chat_created                 →   chat:conversation:created
$pageview                    →   (keep, but add custom pageview events)
```

**Action:** Create an event naming convention document and audit existing events.

#### 2. Missing Key Metrics Events

| Missing Event          | Why It Matters                      |
| ---------------------- | ----------------------------------- |
| `meeting:viewed`       | Track engagement with meeting pages |
| `transcript:read_time` | Understand content consumption      |
| `search:performed`     | Track search usage and relevance    |
| `insight:shared`       | Measure sharing/collaboration       |
| `value_realized`       | Track "aha moment" achievement      |

#### 3. Cohort/Retention Analysis

**Current:** Basic retention by pageview
**Ideal:**

- Cohorts by signup source, plan tier, company size
- Feature-specific retention (users who use chat vs don't)
- Activation cohorts (completed onboarding vs abandoned)

#### 4. Experiment Velocity

**Current:** 1 experiment
**Ideal:** 3-5 concurrent experiments for rapid learning

**Suggested experiments:**

- Onboarding flow variations
- Chat prompt suggestions
- Meeting preparation nudges
- Integration setup flow

#### 5. Survey Strategy

**Current:** NPS only (active)
**Ideal:** Lifecycle surveys

| Stage      | Survey Type | When                           |
| ---------- | ----------- | ------------------------------ |
| Onboarding | CSAT        | After first meeting processed  |
| Feature    | In-context  | After using new features 3x    |
| Churn risk | Exit        | When usage drops significantly |
| Power user | PMF survey  | Monthly for active users       |

#### 6. Alert Configuration

**Missing:** Proactive alerting for:

- WAU drop >10%
- Error spike detection
- Workflow failure rate increase
- Recording success rate drop

---

## Recommended Actions

### Immediate (This Week)

- [ ] **Set up 3-5 key alerts:**
  - WAU drop threshold
  - Workflow failure rate
  - Error spike detection
  - Recording success rate

- [ ] **Launch onboarding feedback survey** (already in draft)

- [ ] **Clean up stale events** - Archive or document events not seen in 6+ months

### Short-term (This Month)

- [ ] **Create event naming convention** - Document and share with eng
- [ ] **Add missing high-value events:**
  - `meeting:viewed`, `transcript:engaged`, `search:performed`

- [ ] **Set up 2 new experiments:**
  - Onboarding step variation
  - Chat feature adoption

- [ ] **Create activation cohorts:**
  - Users who completed onboarding
  - Users who connected HubSpot
  - Users with 10+ processed meetings

### Long-term (This Quarter)

- [ ] **Implement data governance:**
  - Event taxonomy documentation
  - Property standardization
  - Dashboard ownership assignment

- [ ] **Build automated reports:**
  - Weekly product health digest
  - Monthly cohort analysis
  - Quarterly experiment summary

- [ ] **Expand surveys:**
  - Feature-specific CSAT
  - PMF survey for power users

---

## Quick Reference: Ideal PostHog Setup

### Event Tracking Principles

1. **Consistent naming:** `domain:entity:action` (e.g., `workflow:execution:completed`)
2. **Rich properties:** Include context (user role, workspace size, feature version)
3. **Error events:** Always pair success/failure events
4. **Funnel awareness:** Events that complete user journeys

### Dashboard Organization

1. **Executive dashboard:** North star metrics, WAU/MAU, revenue
2. **Journey dashboards:** Funnel-based (onboarding → activation → retention)
3. **Feature dashboards:** Per-project/initiative metrics
4. **Health dashboards:** Errors, performance, system health

### Feature Flag Best Practices

1. **Naming:** `feature-name` for features, `exp-name` for experiments
2. **Descriptions:** Always include purpose and owner
3. **Cleanup:** Archive flags after full rollout
4. **Payloads:** Use for configuration, not just true/false

### Experiment Velocity

- **Target:** 3-5 concurrent experiments
- **Duration:** 2-4 weeks typically
- **Sample size:** Use PostHog's calculator
- **Metrics:** Primary + secondary defined upfront

### Survey Cadence

- **NPS:** Quarterly, exclude recent respondents
- **CSAT:** Feature-specific, after key actions
- **PMF:** Monthly for engaged users

---

## Resources

- [PostHog Event Tracking Guide](https://posthog.com/tutorials/event-tracking-guide)
- [PostHog Best Practices](https://posthog.com/docs/getting-started/group-analytics)
- [Experiment Sample Size Calculator](https://posthog.com/docs/experiments/sample-size-calculator)

---

---

## Appendix: Company-Level Analytics Deep Dive

### Current Group Analytics Configuration

Your PostHog has **two group types** configured:

| Group Index | Type      | Purpose                                             | Status            |
| ----------- | --------- | --------------------------------------------------- | ----------------- |
| `$group_1`  | workspace | General workspace grouping                          | ✅ Has data       |
| `$group_2`  | workspace | Primary workspace grouping (used for postgres join) | ✅ Well-populated |

**Issue Identified:** Some events use `$group_1`, others use `$group_2`. The `$group_2` appears to be the canonical one connected to your postgres `workspaces` table.

### Event Workspace Association Analysis

| Event Type           | Has Workspace Context | Notes                                        |
| -------------------- | --------------------- | -------------------------------------------- |
| `workflows:*`        | ✅ Yes                | Very well tracked per workspace              |
| `$pageview`          | ✅ Yes (via property) | `workspaceId` and `workspaceName` properties |
| `recall:bot_*`       | ⚠️ Varies             | Backend events, some missing context         |
| `chat_created`       | ❌ **NO**             | 7,029 events with NO workspace               |
| `global_chat_opened` | ❌ **NO**             | 1,781 events with NO workspace               |
| `audio_recording_*`  | ⚠️ Partial            | Desktop/mobile may be missing context        |
| `agent:*` events     | ✅ Yes                | Well tracked                                 |

### Critical Gap: Chat Events Missing Workspace Context

**Problem:** Chat events (`chat_created`, `global_chat_opened`, `clip_chat:message_submitted`) are NOT being tagged with workspace context. This means you **cannot see which companies are using chat**.

**Impact:**

- Cannot measure chat adoption per company
- Cannot correlate chat usage with churn/retention
- Cannot identify companies that would benefit from chat training

**Fix Required (Engineering):**

```typescript
// When tracking chat events, include workspace context:
posthog.capture(
  "chat_created",
  {
    workspaceId: currentWorkspaceId,
    workspaceName: currentWorkspaceName,
    // ... other properties
  },
  {
    $groups: { workspace: currentWorkspaceId },
  },
);
```

### New Dashboard Created

**Company Health & Usage Dashboard**

- URL: https://us.posthog.com/project/81505/dashboard/1122947

**Insights Added:**

| Insight                             | What It Shows                  | URL                                                                |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------ |
| Daily Active Users by Company (14d) | DAU trends per workspace       | [xQWIcTnt](https://us.posthog.com/project/81505/insights/xQWIcTnt) |
| Company Workflow Usage (30d)        | Automation adoption by company | [3HtZPy3k](https://us.posthog.com/project/81505/insights/3HtZPy3k) |
| Company Event Volume (7d)           | Overall engagement proxy       | [OeAUHZyv](https://us.posthog.com/project/81505/insights/OeAUHZyv) |
| HubSpot Agent Usage by Company      | CRM integration adoption       | [rbpe9tDn](https://us.posthog.com/project/81505/insights/rbpe9tDn) |
| Meeting Recording Activity          | Capture adoption               | [xJ9BQXmE](https://us.posthog.com/project/81505/insights/xJ9BQXmE) |
| Chat Usage by Company               | Chat feature adoption          | [r8aI1VWl](https://us.posthog.com/project/81505/insights/r8aI1VWl) |
| Notetaker Bot Activity              | Bot health per company         | [ZcyYb2IN](https://us.posthog.com/project/81505/insights/ZcyYb2IN) |

### Recommended Cohorts to Create

#### Usage-Based Cohorts

| Cohort                | Definition                                     | Use Case                         |
| --------------------- | ---------------------------------------------- | -------------------------------- |
| **Power Users**       | >50 events/week, >5 workflow runs              | Identify champions, beta testers |
| **At-Risk Accounts**  | <10 events in last 14 days (was >30 prior)     | Churn prevention outreach        |
| **Chat Adopters**     | Created >5 chats in last 30 days               | Chat feature feedback            |
| **Workflow Heavy**    | >100 workflow runs/month                       | Automation success stories       |
| **New Activators**    | First workflow or chat within 7 days of signup | Onboarding success               |
| **Integration Users** | HubSpot OR Salesforce agent enabled            | CRM feature expansion            |

#### Company-Level Cohorts (Requires Group Analytics)

| Cohort                    | Definition                  | Use Case                      |
| ------------------------- | --------------------------- | ----------------------------- |
| **High-Volume Companies** | >1000 events/week           | Enterprise engagement         |
| **Growing Companies**     | >20% event increase WoW     | Expansion opportunities       |
| **Declining Companies**   | >30% event decrease MoM     | Churn risk                    |
| **Multi-Integration**     | Using 3+ agent integrations | Product-market fit validation |

### LLM Traces Configuration

To enable LLM traces per company, ensure your AI events include:

```typescript
// For $ai_generation, $ai_evaluation events
posthog.capture(
  "$ai_generation",
  {
    $ai_model: "claude-3",
    $ai_input_tokens: 500,
    $ai_output_tokens: 200,
    workspaceId: currentWorkspaceId, // Add this
    workspaceName: currentWorkspaceName, // Add this
    chat_type: "meeting_question", // Categorize question types
  },
  {
    $groups: { workspace: currentWorkspaceId }, // Critical for group analytics
  },
);
```

**Question Type Tracking Recommendation:**

Add a `chat_type` or `question_category` property to chat/AI events:

- `meeting_question` - Questions about specific meetings
- `contact_lookup` - Questions about people/companies
- `workflow_help` - Questions about automation
- `general_chat` - General conversation
- `action_request` - "Send email", "Update HubSpot"

### Feature Flag Analysis by Company

You asked about seeing how flags are enabled per company. Current state:

**Feature flags tracked per-person via:**

- `$feature_enrollment/*` person properties (e.g., `$feature_enrollment/global-chat-enabled`)
- `$active_feature_flags` event property (array of enabled flags)

**To analyze flags by company:**

```sql
-- HogQL query to see flag adoption by workspace
SELECT
    $group_2 as workspace_id,
    groupProperty('workspace', 'name') as workspace_name,
    countIf(arrayExists(x -> x = 'global-chat-enabled', $active_feature_flags)) as global_chat_enabled,
    countIf(arrayExists(x -> x = 'unified-automations', $active_feature_flags)) as unified_automations
FROM events
WHERE timestamp > now() - INTERVAL 7 DAY
GROUP BY workspace_id
```

### Page/Feature Usage by Company

To track which pages companies visit, create insights breaking down `$pageview` by `$pathname`:

**Recommended Page Categories to Track:**

| Page Pattern                  | Feature Area          |
| ----------------------------- | --------------------- |
| `/workspaces/*/engagements/*` | Meeting pages         |
| `/workspaces/*/companies/*`   | Company page          |
| `/workspaces/*/contacts/*`    | Contacts page         |
| `/workspaces/*/search*`       | Search usage          |
| `/workspaces/*/automations*`  | Workflows/automations |
| `/workspaces/*/settings*`     | Settings access       |
| `/workspaces/*/home*`         | Home/dashboard        |

### Comparison vs Ideal B2B Analytics Setup

| Capability                   | Current State                      | Ideal State                         | Gap                       |
| ---------------------------- | ---------------------------------- | ----------------------------------- | ------------------------- |
| Events tagged with workspace | ⚠️ Partial (workflows ✅, chat ❌) | All events have workspace context   | Fix chat/recording events |
| Group properties             | ✅ name, primaryDomain             | + plan tier, company size, industry | Add enrichment            |
| Cohort definitions           | ❌ Not set up                      | 10+ behavioral cohorts              | Create cohorts            |
| Company health score         | ❌ None                            | Composite score dashboard           | Build scoring model       |
| Usage comparison             | ⚠️ Basic                           | Percentile ranking vs peers         | Add benchmarking          |
| Drop-off detection           | ❌ None                            | Automated alerts                    | Configure alerts          |
| LLM traces by company        | ❌ Not grouped                     | Full trace visibility               | Add group context         |

### Next Steps for Engineering

1. **Immediate: Fix chat event instrumentation**
   - Add `workspaceId`, `workspaceName` properties
   - Add `$groups: { workspace: workspaceId }` to capture calls

2. **Add question categorization to AI events**
   - Track `chat_type` or `question_category`
   - Enable "what questions are companies asking" analysis

3. **Enrich workspace group properties**
   - Plan tier (free, pro, enterprise)
   - Company size (employee count band)
   - Industry vertical
   - Signup date
   - ARR/MRR (if available)

4. **Standardize group usage**
   - Audit which events use `$group_1` vs `$group_2`
   - Consolidate to single group type

---

## Appendix: Cohort & Alert Setup Guide

### How to Create Cohorts in PostHog

Cohorts are reusable user segments. Go to **People → Cohorts → + New Cohort**.

#### Recommended Cohorts to Create

| Cohort Name              | Type       | Criteria                                                                                             | Purpose                    |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| **Power Users**          | Behavioral | Completed `workflows:run_started` ≥5 times in last 30 days                                           | Champions, beta testers    |
| **At-Risk Accounts**     | Behavioral | Completed `$pageview` <10 times in last 14 days AND completed `$pageview` ≥30 times in prior 14 days | Churn prevention           |
| **Chat Adopters**        | Behavioral | Completed `chat_created` ≥3 times in last 30 days                                                    | Chat feedback candidates   |
| **Workflow Heavy**       | Behavioral | Completed `workflows:run_started` ≥50 times in last 30 days                                          | Automation success stories |
| **Onboarding Completed** | Behavioral | Completed `onboarding:flow_completed` in last 90 days                                                | Activation tracking        |
| **Onboarding Abandoned** | Behavioral | Completed `onboarding:step_viewed` AND did NOT complete `onboarding:flow_completed`                  | Onboarding dropoff         |
| **HubSpot Users**        | Behavioral | Completed `hubspot_agent:enabled` in last 30 days                                                    | CRM integration users      |
| **Mobile Users**         | Behavioral | Completed any `mobile:*` event in last 30 days                                                       | Mobile app adoption        |

#### Step-by-Step: Create "Power Users" Cohort

1. Go to **People → Cohorts → + New Cohort**
2. Name: "Power Users"
3. Click **Add matching criteria**
4. Select: **Completed event**
5. Event: `workflows:run_started`
6. Count: **at least 5 times**
7. Time range: **in the last 30 days**
8. Click **Save**

The cohort updates automatically every 24 hours.

---

### How to Set Up Alerts

Alerts notify you when metrics change significantly. They're set on individual insights.

#### Insights Ready for Alerts (Created Today)

| Insight                       | Alert Type      | Threshold           | URL                                                                |
| ----------------------------- | --------------- | ------------------- | ------------------------------------------------------------------ |
| **Weekly Active Users Trend** | Decreases by    | 10% week-over-week  | [J9J6L1j2](https://us.posthog.com/project/81505/insights/J9J6L1j2) |
| **Workflow Failure Rate**     | Increases above | 100 failures/day    | [1n5Svfwd](https://us.posthog.com/project/81505/insights/1n5Svfwd) |
| **Company Usage Decline**     | Decreases by    | 30% for any company | [jZlYE5t3](https://us.posthog.com/project/81505/insights/jZlYE5t3) |

#### Step-by-Step: Create WAU Drop Alert

1. Open the insight: [Weekly Active Users Trend](https://us.posthog.com/project/81505/insights/J9J6L1j2)
2. Click **Alerts** button (top right, bell icon)
3. Click **+ New Alert**
4. Configure:
   - **Name:** "WAU Drop Alert"
   - **Series:** Weekly Active Users
   - **Type:** Decreases by
   - **Threshold:** 10%
   - **Frequency:** Weekly
   - **Notify:** tyler.sahagun@askelephant.ai
5. Click **Create alert**

#### Recommended Alerts to Set Up

| Alert                   | Insight                    | Condition            | Frequency |
| ----------------------- | -------------------------- | -------------------- | --------- |
| WAU Drop                | Weekly Active Users Trend  | Decreases >10%       | Weekly    |
| Workflow Failures Spike | Workflow Failure Rate      | Failures >100/day    | Daily     |
| Bot Failure Spike       | Notetaker Bot Activity     | Fatal errors >50/day | Daily     |
| Recording Success Drop  | Meeting Recording Activity | Success rate <90%    | Daily     |

---

### Understanding Usage Drop-off

**"Company Usage Decline Detection"** insight shows week-over-week comparison by company:

- **Compare mode enabled** - Shows current vs previous period side-by-side
- **Declining companies** - Look for companies where current < previous
- **Churn risk signal** - >30% drop usually indicates problem

#### How to Act on Declining Companies

1. **Identify** - Use the insight to spot companies with declining usage
2. **Investigate** - Check what features they were using that dropped
3. **Reach out** - CSM or product outreach to understand issues
4. **Document** - Add to signals for pattern recognition

---

### Dashboard Summary

**Company Health & Usage Dashboard**: https://us.posthog.com/project/81505/dashboard/1122947

**11 insights now on dashboard:**

| Category              | Insights                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| **Engagement**        | DAU by Company, Event Volume, Login Frequency                               |
| **Feature Adoption**  | Workflow Usage, Chat Usage, HubSpot Agent, Recording Activity, Bot Activity |
| **Health Monitoring** | WAU Trend (alert), Workflow Failures (alert), Usage Decline (alert)         |
| **Onboarding**        | Completion Funnel                                                           |

---

### Linear Ticket Created

**EPD-1329**: [Add workspace context to chat events for company-level analytics](https://linear.app/askelephant/issue/EPD-1329/add-workspace-context-to-chat-events-for-company-level-analytics)

Assigned to: Tyler Sahagun
Priority: High
Team: Product

---

_Generated by PM Workspace audit tool_
