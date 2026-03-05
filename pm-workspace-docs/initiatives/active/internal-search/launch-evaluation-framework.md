# Internal Search Launch Evaluation Framework

**Feature Flag:** `chat-tool-internal-search` (PostHog ID: 201604)  
**Scope:** Chat Internal Search tool — Beta → GA  
**Last Updated:** 2026-02-16

---

## 1. Outcome Chain

```
Internal Search finds answers from meetings/contacts/signals
  → so that reps/leaders/CSMs get context before calls and decisions
    → so that they never miss what matters in customer conversations
      → so that coaching, prep, and renewals improve
        → so that revenue outcomes (quota capacity, win rates, retention) improve
```

---

## 2. Metric Categories

### 2.1 Adoption

| Metric                        | Definition                                         | Formula                                                                | Target (2w) | Target (4w) |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- | ----------- | ----------- |
| **Tool Activation Rate**      | % of chat users with Internal Search enabled       | `(users with Internal Search enabled) / (users who opened chat) × 100` | ≥25%        | ≥35%        |
| **Search-Enabled Chat Share** | % of chats where Internal Search ran at least once | `(chats with ≥1 internal search run) / (total chats) × 100`            | ≥15%        | ≥22%        |
| **Workspace Adoption**        | % of workspaces with ≥1 search run in period       | `(workspaces with ≥1 search) / (workspaces with chat activity) × 100`  | ≥20%        | ≥30%        |

### 2.2 Activation / Aha Moment

| Metric                   | Definition                                          | Formula                                                                                           | Target (2w) | Target (4w) |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------- | ----------- |
| **Aha Moment Rate**      | % of users who get ≥3 successful searches in 7 days | `(users with ≥3 search:query_completed in 7d) / (users with ≥1 search:query_started in 7d) × 100` | ≥18%        | ≥25%        |
| **Repeat Usage**         | % of users who search ≥2 times in 14 days           | `(users with ≥2 search runs in 14d) / (users with ≥1 search in 14d) × 100`                        | ≥40%        | ≥50%        |
| **Time to First Search** | Median days from first chat to first search         | `median(days between first chat_open and first search:query_started)`                             | ≤3 days     | ≤2 days     |

### 2.3 Quality / Reliability

| Metric                  | Definition                                      | Formula                                                                         | Target (2w) | Target (4w) |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- | ----------- | ----------- |
| **Search Success Rate** | % of searches returning usable results          | `(search:query_completed with result_count > 0) / (search:query_started) × 100` | ≥85%        | ≥90%        |
| **Latency P95**         | 95th percentile time from query to first result | `percentile(search_duration_ms, 95)`                                            | ≤8s         | ≤6s         |
| **Error Rate**          | % of searches that fail or timeout              | `(search:query_failed) / (search:query_started) × 100`                          | ≤5%         | ≤3%         |

### 2.4 Trust / Safety

| Metric                      | Definition                                         | Formula                                                                          | Target (2w) | Target (4w)                 |
| --------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- | --------------------------- |
| **Permission Compliance**   | Zero incidents of cross-workspace data leakage     | Audit / incident count                                                           | 0           | 0                           |
| **User Feedback Sentiment** | % positive/neutral in feedback (if survey present) | `(positive + neutral) / (total responses) × 100`                                 | ≥80%        | ≥85%                        |
| **Result Click-Through**    | % of searches where user clicks a result           | `(search:result_clicked) / (search:query_completed with result_count > 0) × 100` | —           | ≥30% (validates usefulness) |

### 2.5 Business Impact

| Metric                       | Definition                                                   | Formula                                                                                 | Target (2w)     | Target (4w)              |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------- | ------------------------ |
| **Chat Engagement Lift**     | % increase in messages per chat when search is used          | `(msgs when search used - msgs when search not used) / msgs when search not used × 100` | +10%            | +15%                     |
| **Value Ladder Progression** | % of Basic-tier users who reach chat+search before next tier | Funnel: Basic → chat opened → search used                                               | —               | Track (no threshold yet) |
| **Support Ticket Volume**    | No spike in search-related support                           | Count of tickets tagged `internal-search` or `chat-search`                              | ≤baseline + 10% | ≤baseline                |

---

## 3. Event Instrumentation Requirements

### 3.1 Required Events

| Event                    | When to Fire                         | Required Properties                                                                                                                                       | Optional Properties               |
| ------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------- | ------- |
| `search:query_started`   | User/agent initiates internal search | `workspaceId`, `workspaceName`, `userId`, `chatId`, `conversationId`                                                                                      | `source` (user_tool_toggle        | agent_auto), `platform` (web | mobile) |
| `search:query_completed` | Search returns successfully          | `workspaceId`, `workspaceName`, `userId`, `chatId`, `result_count`, `result_domains[]` (meeting, contact, company, signal, workflow, chat), `duration_ms` | `query_length`, `has_time_filter` |
| `search:query_failed`    | Search errors or times out           | `workspaceId`, `workspaceName`, `userId`, `chatId`, `error_code`, `duration_ms`                                                                           | `query_length`                    |
| `search:tool_enabled`    | User toggles Internal Search on      | `workspaceId`, `workspaceName`, `userId`, `chatId`                                                                                                        | `source` (tool_selector           | auto_mention)                |
| `search:result_clicked`  | User clicks a search result in UI    | `workspaceId`, `workspaceName`, `userId`, `chatId`, `result_domain`, `result_id`                                                                          | —                                 |

### 3.2 Group Context

All events must include `$groups: { workspace: workspaceId }` for workspace-level aggregation.

### 3.3 Existing vs New

| Event                                        | Status         | Action                                                              |
| -------------------------------------------- | -------------- | ------------------------------------------------------------------- |
| `agents:run_started` (agent=INTERNAL_SEARCH) | Exists         | Use as proxy for `search:query_started` until dedicated event added |
| `search:query_started`                       | Likely missing | Add to internal-search agent entry                                  |
| `search:query_completed`                     | Likely missing | Add with `result_count`, `result_domains`, `duration_ms`            |
| `search:query_failed`                        | Likely missing | Add on error/timeout paths                                          |
| `search:tool_enabled`                        | Likely missing | Add in composer tool toggle handler                                 |
| `search:result_clicked`                      | Likely missing | Add in InternalSearchToolResult component                           |

---

## 4. Launch Decision Rubric

### 4.1 No-Go (Hold Beta, Fix Before GA)

| Condition       | Criteria                                                               |
| --------------- | ---------------------------------------------------------------------- |
| **Quality**     | Search success rate <80% OR error rate >8%                             |
| **Trust**       | Any permission/leakage incident OR support ticket spike >50%           |
| **Reliability** | Latency P95 >12s for 2+ consecutive weeks                              |
| **Adoption**    | Tool activation <10% after 4 weeks (indicates discoverability failure) |

**Action:** Extend beta, fix root causes, re-evaluate in 2 weeks.

### 4.2 Limited Rollout (Expand Beta, Delay GA)

| Condition      | Criteria                                      |
| -------------- | --------------------------------------------- |
| **Quality**    | Success rate 80–89% OR error rate 5–8%        |
| **Activation** | Aha moment rate 10–17% OR repeat usage 25–39% |
| **Adoption**   | Workspace adoption 15–24% at 4 weeks          |
| **Feedback**   | User feedback sentiment 70–79%                |

**Action:** Expand beta audience by 20–30%, iterate on UX and reliability, re-check in 2 weeks.

### 4.3 GA (Full Release)

| Condition      | Criteria (all required)                                    |
| -------------- | ---------------------------------------------------------- |
| **Quality**    | Success rate ≥90%, error rate ≤3%, latency P95 ≤6s         |
| **Trust**      | Zero permission incidents, feedback sentiment ≥85%         |
| **Activation** | Aha moment rate ≥25%, repeat usage ≥50%                    |
| **Adoption**   | Workspace adoption ≥30%, tool activation ≥35%              |
| **Business**   | Chat engagement lift ≥10%, support tickets within baseline |

**Action:** Remove feature flag, announce GA, update help center and docs.

---

## 5. Evaluation Cadence

### 5.1 2-Week Checkpoint

| Activity                                              | Owner         | Output                           |
| ----------------------------------------------------- | ------------- | -------------------------------- |
| Run PostHog queries for adoption, activation, quality | PM            | Metric snapshot vs targets       |
| Review support tickets for search-related issues      | CS            | Ticket count, themes             |
| Check error logs for search failures                  | Eng           | Error rate, top failure modes    |
| Decision                                              | PM + Eng Lead | No-go / Limited / Continue to 4w |

### 5.2 4-Week Checkpoint

| Activity                                          | Owner         | Output                       |
| ------------------------------------------------- | ------------- | ---------------------------- |
| Full framework evaluation                         | PM            | All metrics vs rubric        |
| Retention comparison (search users vs non-search) | PM            | 7d/14d retention by cohort   |
| Stakeholder review                                | PM, Eng, CS   | Launch decision              |
| Decision                                          | PM + Eng Lead | No-go / Limited Rollout / GA |

### 5.3 Ongoing (Post-GA)

| Cadence   | What to Track                                                   |
| --------- | --------------------------------------------------------------- |
| Weekly    | Success rate, error rate, latency P95                           |
| Bi-weekly | Adoption, aha moment, repeat usage                              |
| Monthly   | Business impact (chat engagement, value ladder), support volume |

---

## 6. PostHog Dashboard & Alerts

- **Dashboard:** Link to Global Chat & Internal Search dashboard; add insights for each metric above.
- **Alerts:** Success rate <85%, error rate >5%, latency P95 >8s.
- **Cohort:** `internal-search-adopters` = users with ≥1 `search:query_completed` in 30d.

---

## 7. References

- Feature flag: https://us.posthog.com/project/81505/feature_flags/201604
- Product vision: `pm-workspace-docs/company-context/product-vision.md`
- Value ladder: `pm-workspace-docs/status/posthog/analysis/posthog-value-ladder.md`
- Internal Search guide: `pm-workspace-docs/feature-guides/internal-search-internal.md`
