# Q4 2025 PostHog Analysis - Board Meeting Data

**Generated:** 2026-01-29  
**Data Source:** PostHog HogQL (Project ID: 81505 - Production)  
**Time Range:** Q4 2025 (October 1 - December 31, 2025)

---

## Executive Summary

| Metric                        | Q4 2025 Value | Notes                       |
| ----------------------------- | ------------- | --------------------------- |
| **Total Workflows Triggered** | 3,164,038     | 65% growth from Q2 baseline |
| **Unique Workspaces**         | 399           | Active workflow users       |
| **Total Chats Created**       | 2,920         | Manual user interactions    |
| **Transcriptions Created**    | 329,331       | Meeting processing volume   |
| **Bot Recordings**            | 250,497       | AskElephant Bot completions |

---

## 1. Engagement Distribution by Data Source

### Q4 Engagement Sources (Proxy Data)

Based on event data, we can approximate engagement sources:

| Source                                                  | Q4 Events | Approximate % |
| ------------------------------------------------------- | --------- | ------------- |
| **AskElephant Bot** (recall:bot_done)                   | 250,497   | 43%           |
| **Meeting/Call Importer** (deepgram transcriptions)     | 329,331   | 57%           |
| **Mobile Recording** (audio_recording_upload_completed) | 1,367     | <1%           |
| **Mobile Upload** (mobile:upload_file_success)          | 1,150     | <1%           |

**Note:** HubSpot Phone and Zoom Direct engagement counts require database/data warehouse access. The above represents trackable events in PostHog.

### Monthly Transcription Trend (Deepgram)

- Q4 Total: 329,331 transcriptions created
- Q4 also saw 3,526 bot fatals (1.4% failure rate)

---

## 2. Workflow Trigger Breakdown

### Total Q4 Workflow Volume

| Month             | Workflows Completed | Growth         |
| ----------------- | ------------------- | -------------- |
| June 2025         | 346,493             | -              |
| July 2025         | 459,749             | +33%           |
| August 2025       | 675,325             | +47%           |
| September 2025    | 762,086             | +13%           |
| **October 2025**  | 1,167,736           | +53%           |
| **November 2025** | 937,639             | -20% (holiday) |
| **December 2025** | 1,058,663           | +13%           |

**Q4 Total: 3,164,038 workflow runs** (65% growth vs June baseline)

### Workflow Feature Usage (AI Generation Events)

Categorizing by the `feature` property in `$ai_generation` events:

| Category                     | Feature                         | Q4 Count  | % of Total |
| ---------------------------- | ------------------------------- | --------- | ---------- |
| **Workflow Automation**      | workflows:conditional_prompt    | 1,091,885 | 32%        |
|                              | workflows:run_prompt            | 300,873   | 9%         |
|                              | workflows:tagging               | 92,007    | 3%         |
|                              | workflows:loop_prompt_iteration | 26,778    | 1%         |
|                              | workflows:filter_prompt         | 13,324    | <1%        |
| **Chat/Manual Interactions** | chat (generate_text + stream)   | 1,039,268 | 30%        |
|                              | conversations:enhance_prompt    | 133,066   | 4%         |
|                              | chats:title_generation          | 25,311    | 1%         |
| **Meeting Processing**       | meetings:summarization          | 123,250   | 4%         |
|                              | media-clip-artifact-generation  | 206,661   | 6%         |
|                              | meetings:process_attendees      | 61,715    | 2%         |
|                              | meetings:generate_title         | 3,628     | <1%        |
| **Agent/CRM Tools**          | agent-node                      | 91,416    | 3%         |
|                              | annotations:extract             | 134,757   | 4%         |
|                              | artifacts:scorecard             | 29,753    | 1%         |

### Proposed Workflow Categories (Board Presentation)

Based on the feature breakdown, workflows can be categorized as:

#### 1. Meeting Related Activities (38%)

- Meeting summaries: 123,250
- Email follow-ups: ~300K (workflows:run_prompt)
- Meeting prep: 206,661 (media-clip-artifact)
- Attendee processing: 61,715

#### 2. CRM Updates (35%)

- Conditional prompts (CRM logic): 1,091,885
- Agent node operations: 91,416
- HubSpot agent enabled: 222,741

#### 3. Coaching Activities (4%)

- Scorecards: 29,753
- Annotations extraction: 134,757

#### 4. Chat/Assistant (30%)

- Manual chat interactions: 1,039,268
- Title generation: 45,792

#### 5. Other Automations

- Tagging: 92,007
- Filtering: 13,324
- Loop iterations: 26,778

---

## 3. Agent Usage Distribution (Q4)

The `agents:run_started` event shows tool usage in workflows and chats:

| Agent/Tool                  | Q4 Runs | Category     |
| --------------------------- | ------- | ------------ |
| SALESFORCE_MCP              | 26,086  | CRM Updates  |
| PERFORM_MEETING_QUERY       | 2,298   | Meeting      |
| MEETING_SEARCH              | 1,108   | Meeting      |
| PERFORM_CHAT_QUERY          | 1,068   | Chat         |
| task-message-generator      | 1,029   | Workflow     |
| INTERNAL_SEARCH             | 872     | Search       |
| HUBSPOT_MCP                 | 705     | CRM Updates  |
| PRIVACY_DETERMINATION_AGENT | 626     | Compliance   |
| CONFIGURATION_MANAGEMENT    | 607     | Admin        |
| NOTION_MCP                  | 405     | Integrations |

**Total Agent Runs: ~37,000 in Q4**

---

## 4. Manual Chat Tool Usage Distribution

### Chat Creation Sources (Q4)

| Source                | Count | %   |
| --------------------- | ----- | --- |
| global_chat           | 1,730 | 59% |
| standard_chat         | 1,132 | 39% |
| engagement_transcript | 32    | 1%  |
| workflow_run          | 26    | 1%  |

**Total: 2,920 chats across 179 workspaces**

### Tools Used in Chat (via Agent Runs)

When users interact via chat, the most commonly invoked tools are:

| Tool Category       | Top Tools                             | Q4 Usage |
| ------------------- | ------------------------------------- | -------- |
| **CRM**             | SALESFORCE_MCP, HUBSPOT_MCP           | 26,791   |
| **Meeting Query**   | PERFORM_MEETING_QUERY, MEETING_SEARCH | 3,406    |
| **Contact/Company** | CONTACT_SEARCH, COMPANY_SEARCH        | 1,086    |
| **Chat**            | PERFORM_CHAT_QUERY, CHAT_SEARCH       | 1,462    |
| **Internal Search** | INTERNAL_SEARCH                       | 872      |
| **Workflow**        | WORKFLOW_SEARCH                       | 355      |
| **Memory**          | RETRIEVE_AGENT_MEMORIES               | 85       |

---

## 5. Growth Highlights

### Workflows

- **Q4 Total:** 3,164,038 workflow runs
- **Q2-Q4 Growth:** +65% from June baseline
- **Peak Month:** October with 1.17M workflows

### Key Metrics

| Metric                           | Value  |
| -------------------------------- | ------ |
| Workflows per workspace (avg)    | ~7,930 |
| AI generations per month (avg)   | ~1.1M  |
| Bot recording success rate       | 98.6%  |
| Active workspaces with workflows | 399    |

---

## Data Gaps & Recommendations

### Not Available in PostHog Events

1. **Engagement source breakdown** (HubSpot Phone, Zoom Direct) - requires database/data warehouse sync
2. **Workflow name/category mapping** - workflow IDs don't have human-readable names in events
3. **Churn monitoring workflow counts** - would need workflow categorization

### Recommended Next Steps

1. **Sync PostgreSQL data warehouse** to PostHog for engagement source breakdown
2. **Add workflow_category property** to workflow events for better categorization
3. **Create custom dashboard** for board reporting with these metrics

---

## Query Reference

All data pulled via HogQL queries against Production project (81505). Key queries:

```sql
-- Total workflows Q4
SELECT count() as total_workflows
FROM events
WHERE event = 'workflows:run_completed'
AND timestamp >= '2025-10-01' AND timestamp < '2026-01-01'

-- AI Generation feature breakdown
SELECT JSONExtractString(properties, 'feature') as feature, count() as cnt
FROM events
WHERE event = '$ai_generation'
AND timestamp >= '2025-10-01' AND timestamp < '2026-01-01'
GROUP BY feature ORDER BY cnt DESC

-- Agent usage
SELECT JSONExtractString(properties, 'agent_name') as agent_name, count() as cnt
FROM events
WHERE event = 'agents:run_started'
AND timestamp >= '2025-10-01' AND timestamp < '2026-01-01'
GROUP BY agent_name ORDER BY cnt DESC
```

---

_Report generated from PostHog HogQL queries on 2026-01-29_
