---
name: slack-sync
description: Sync activity from Slack channels using MCP tools. Use when running /eod, /eow, or checking for engineering and revenue team updates in Slack.
---

# Slack Sync Skill

Procedural knowledge for pulling activity from Slack channels using the `composio-config` Composio MCP server's Slack tools.

## When to Use

- Running `/eod` or `/eow` commands (as part of activity collection)
- Checking for engineering updates in product channels
- Checking for revenue team wins (deals closed, sets, expansions)
- Monitoring customer success signals (churn alerts, quotes)
- Auditing communication across channels

## MCP Server

**Server:** `composio-config`

**Note:** This server also provides access to Linear, Notion, HubSpot, and PostHog tools (700+ total). See pm-foundation.mdc for full toolkit reference.

### Available Slack Tools

| Tool                               | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `SLACK_FETCH_CONVERSATION_HISTORY` | Get messages from a specific channel |
| `SLACK_SEARCH_MESSAGES`            | Search across workspace with filters |
| `SLACK_LIST_ALL_CHANNELS`          | List all channels in workspace       |
| `SLACK_FIND_CHANNELS`              | Search for channels by name          |
| `SLACK_LIST_ALL_USERS`             | List all users                       |
| `SLACK_FIND_USERS`                 | Search for users by name             |

## Reference Files

Before using this skill, load these files for context:

| File                                                            | Contains                            |
| --------------------------------------------------------------- | ----------------------------------- |
| `pm-workspace-docs/company-context/org-chart.md`                | All employees with Slack IDs        |
| `pm-workspace-docs/audits/slack-communication-routing-guide.md` | Channel routing decisions           |
| `pm-workspace-docs/audits/channels/`                            | Detailed channel audits by category |

## Key Channel IDs

### Engineering & Product

| Channel               | ID                               | Purpose                |
| --------------------- | -------------------------------- | ---------------------- |
| #product-updates      | (lookup via SLACK_FIND_CHANNELS) | Release announcements  |
| #product-issues       | (lookup)                         | Bug reports and triage |
| #team-dev-code-review | (lookup)                         | PR activity            |
| #team-dev             | (lookup)                         | Technical discussions  |
| #epd-all              | (lookup)                         | EPD-wide coordination  |

### Revenue Wins

| Channel                  | ID            | Purpose                                                            |
| ------------------------ | ------------- | ------------------------------------------------------------------ |
| #sales-closed-won        | (lookup)      | **Closed deals celebration**                                       |
| #team-sales              | (lookup)      | SDR sets, lead activity                                            |
| **#sdr-stats**           | `C0A05H709SM` | **SDR daily metrics (Conversations, Pitches, Meetings, ICP Held)** |
| #expansion-opportunities | (lookup)      | Upsell wins                                                        |
| #revenue                 | (lookup)      | Revenue metrics (private)                                          |
| #churn-alert             | (lookup)      | Churn mitigated                                                    |

### Customer Success

| Channel            | ID       | Purpose                       |
| ------------------ | -------- | ----------------------------- |
| #customer-quotes   | (lookup) | Notable customer quotes       |
| #customer-feedback | (lookup) | Automated feedback extraction |
| #churn-alert       | (lookup) | Churn risk alerts             |
| #case-studies      | (lookup) | Case study development        |

## Fetching Channel History

### Tool Call: SLACK_FETCH_CONVERSATION_HISTORY

```json
{
  "channel": "<CHANNEL_ID>",
  "oldest": "<UNIX_TIMESTAMP>",
  "latest": "<UNIX_TIMESTAMP>",
  "limit": 100
}
```

**Parameters:**

- `channel` (required): Channel ID (e.g., "C1234567890")
- `oldest` (optional): Start of time range (Unix timestamp)
- `latest` (optional): End of time range (Unix timestamp)
- `limit` (optional): Max messages to return (1-1000, default 100)

**Note:** This only returns main channel messages, not thread replies.

### Calculating Timestamps

For EOD (today):

```
oldest = Today midnight (local) → Unix timestamp
latest = Now → Unix timestamp
```

For EOW (this week):

```
oldest = Monday 00:00 (local) → Unix timestamp
latest = Now → Unix timestamp
```

**JavaScript conversion:**

```javascript
// Today midnight
new Date().setHours(0, 0, 0, 0) / 1000;

// This Monday
const now = new Date();
const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
monday.setHours(0, 0, 0, 0);
monday.getTime() / 1000;
```

## Searching Messages

### Tool Call: SLACK_SEARCH_MESSAGES

```json
{
  "query": "\"closed won\" on:2026-01-23 in:#sales-closed-won",
  "sort": "timestamp",
  "sort_dir": "desc",
  "count": 50
}
```

**Query Modifiers:**

- `on:YYYY-MM-DD` - Messages on specific date
- `after:YYYY-MM-DD` - Messages after date
- `before:YYYY-MM-DD` - Messages before date
- `in:#channel-name` - Messages in channel
- `from:@username` - Messages from user
- `has:link` - Messages with links
- `"exact phrase"` - Exact phrase match

**Common Searches:**

| Search For                  | Query                                   |
| --------------------------- | --------------------------------------- |
| Today's closed deals        | `in:#sales-closed-won after:2026-01-23` |
| This week's product updates | `in:#product-updates after:2026-01-20`  |
| Churn alerts today          | `in:#churn-alert after:2026-01-23`      |
| Customer quotes this week   | `in:#customer-quotes after:2026-01-20`  |
| SDR sets from specific rep  | `from:@adia "set" in:#team-sales`       |

## Revenue Team Wins Extraction

### Win Types to Track

| Win Type              | Channels to Monitor               | Signal Patterns                      |
| --------------------- | --------------------------------- | ------------------------------------ |
| **Deals Closed**      | #sales-closed-won                 | Any message (celebration format)     |
| **SDR Sets**          | #team-sales                       | "set", "booked", "demo"              |
| **Partner Additions** | #team-partners, #hubspot-partners | "signed", "new partner"              |
| **Quotes Sent**       | #team-sales, #revenue             | "quote", "proposal sent"             |
| **Expansion Added**   | #expansion-opportunities          | Any message                          |
| **Churn Mitigated**   | #churn-alert                      | "saved", "renewed", "mitigated"      |
| **Customer Wins**     | #customer-quotes, #case-studies   | Positive quotes, case study mentions |

### Extraction Procedure

1. **Fetch #sales-closed-won history** for time range
   - Each message = closed deal
   - Extract: deal name, value (if mentioned), rep name

2. **Search #team-sales** for SDR activity
   - Query: `"set" OR "booked" OR "demo scheduled" after:YYYY-MM-DD in:#team-sales`
   - Extract: meeting count, SDR name

3. **Fetch #expansion-opportunities** for expansions
   - Any message = expansion opportunity
   - Extract: account name, expansion type

4. **Search #churn-alert** for saves
   - Query: `"saved" OR "renewed" OR "mitigated" after:YYYY-MM-DD in:#churn-alert`
   - Extract: account name, save reason

5. **Fetch #team-partners** for new partners
   - Query: `"signed" OR "new partner" OR "onboarded" after:YYYY-MM-DD`

### #sdr-stats Extraction (NEW)

**Channel ID:** `C0A05H709SM`

SDRs post daily activity in this format:

```
MM/DD/YY
Conversations: X
Pitches: X
Meetings Scheduled: X
ICP Held: X
```

**Extraction Procedure:**

1. Fetch channel history: `SLACK_FETCH_CONVERSATION_HISTORY` with channel `C0A05H709SM`
2. Parse each message for the 4 metrics
3. Map user ID to SDR name (from org-chart.md):
   - `U094PHNHCN8` → Jamis Benson
   - `U09S5QQCGS1` → Carter Thomas
   - `U098Q4N5PEJ` → Michael Haimowitz
   - `U07JRK6MGL9` → Adia Barkley (lead)
4. Aggregate per-SDR and team totals
5. Calculate conversion rates

**Output Format:**

```markdown
### 📞 SDR Activity

_Source: #sdr-stats channel_

| SDR               | Conversations | Pitches | Meetings Set | ICP Held |
| ----------------- | ------------- | ------- | ------------ | -------- |
| Jamis Benson      | 7             | 6       | 4            | 2        |
| Carter Thomas     | 8             | 6       | 5            | 1        |
| Michael Haimowitz | 3             | 2       | 3            | 0        |
| **Team Total**    | **18**        | **14**  | **12**       | **3**    |

**Pitch-to-Meeting:** 86% | **ICP Hold Rate:** 25%
```

### Revenue Wins Output Format

```markdown
## Revenue Team Wins

**Period:** [Date Range]

### Deals Closed

- [Deal Name] - [Rep Name] ([Value if known])
- [Deal Name] - [Rep Name]

### SDR Activity

- [SDR Name]: X sets/demos booked
- [SDR Name]: X sets/demos booked

### Partner Additions

- [Partner Name] signed by [Rep]

### Expansion Wins

- [Account Name]: [Expansion type/value]

### Churn Saves

- [Account Name]: Saved by [CSM] - [Reason]

### Notable Customer Wins

- "[Quote excerpt]" - [Customer Name]
```

## Engineering Activity from Slack

### Channels to Monitor

| Channel               | Signal Type              |
| --------------------- | ------------------------ |
| #product-updates      | Release announcements    |
| #team-dev-code-review | PR activity (automated)  |
| #product-issues       | Bugs resolved            |
| #epd-all              | Cross-functional updates |

### Extraction Procedure

1. **Fetch #product-updates** for releases
   - Extract: feature names, release notes

2. **Fetch #product-issues** for bug resolution
   - Search for: "fixed", "resolved", "shipped"
   - Extract: bug description, who fixed

3. **Fetch #team-dev-code-review** for PR patterns
   - Look for: approval counts, review velocity

### Engineering Output Format

```markdown
## Engineering Updates (from Slack)

### Releases Announced

- [Feature/Release Name] - [Description]

### Bugs Resolved

- [Bug Description] - Fixed by [Engineer]

### Code Review Activity

- X PRs approved
- Notable reviews: [if any standout discussions]
```

## Team Member Mapping

Use the org chart to resolve Slack IDs to names:

| Name             | Slack ID      | Department       |
| ---------------- | ------------- | ---------------- |
| Ben Kinard       | `U09MLGSC5AL` | Sales (Head)     |
| Adia Barkley     | `U07JRK6MGL9` | Sales (SDR Lead) |
| Michael Cook     | `U09V1J1VBL4` | Sales (AE)       |
| Reuben Tang      | `U09KCQ48NQN` | Sales (AE)       |
| Ben Harrison     | `U092NQWH9PF` | CX (Head)        |
| Eli Gomez        | `U060G4DK1CZ` | CX (CSM)         |
| Parker Alexander | `U098T59RUMT` | CX (Expansion)   |
| Bryan Lund       | `U086JDRUYFJ` | Engineering      |
| Kaden Wilkinson  | `U06EPEY9WNM` | Engineering      |
| Tyler Sahagun    | `U08JVM8LBP0` | Product          |

**Note:** Always display real names in reports, not Slack IDs or handles.

## Integration with Activity Reporter

When the activity-reporter skill calls slack-sync:

1. **Input:** Time range (today/this week)
2. **Process:**
   - Fetch revenue channels for wins
   - Fetch engineering channels for updates
   - Map Slack IDs to names
3. **Output:** Structured data for inclusion in EOD/EOW reports

### Data Structure

```json
{
  "slack_activity": {
    "time_range": {
      "start": "2026-01-23T00:00:00Z",
      "end": "2026-01-23T23:59:59Z"
    },
    "revenue_wins": {
      "deals_closed": [
        { "name": "Acme Corp", "rep": "Michael Cook", "value": "$24k ARR" }
      ],
      "sdr_sets": [{ "sdr": "Adia Barkley", "count": 3 }],
      "expansions": [],
      "churn_saves": [],
      "partner_additions": []
    },
    "engineering_updates": {
      "releases": [],
      "bugs_resolved": [],
      "review_activity": {}
    },
    "customer_signals": {
      "quotes": [],
      "churn_alerts": [],
      "feedback_patterns": []
    }
  }
}
```

## Error Handling

### Channel Not Found

```
⚠️ Channel #sales-closed-won not found. Verify channel exists and bot has access.
```

### Permission Denied

```
⚠️ Cannot access #revenue (private channel). Proceeding with public channels only.
```

### Rate Limited

```
⚠️ Slack rate limited. Waiting 30s before retry...
```

### No Messages in Range

```
ℹ️ No messages in #sales-closed-won for today.
```

## Execution Checklist

When syncing Slack for activity reports:

- [ ] Load org chart for name mapping
- [ ] Calculate Unix timestamps for time range
- [ ] Fetch/search revenue channels:
  - [ ] #sales-closed-won (deals closed)
  - [ ] #team-sales (SDR sets)
  - [ ] **#sdr-stats (C0A05H709SM) - SDR daily metrics**
  - [ ] #expansion-opportunities (expansions)
  - [ ] #churn-alert (churn saves)
  - [ ] #team-partners (partner wins)
- [ ] Fetch/search engineering channels:
  - [ ] #product-updates (releases)
  - [ ] #product-issues (bugs resolved)
- [ ] Fetch customer signals:
  - [ ] #customer-quotes (quotes)
  - [ ] #churn-alert (alerts)
- [ ] Map all Slack user IDs to real names
- [ ] Structure data for activity reporter
- [ ] Handle any errors gracefully

## Privacy & Access Notes

- Private channels (#revenue) may not be accessible
- External partner channels (#ext-\*) contain external users
- Some channels have bots posting (high volume, filter carefully)
- Respect confidentiality of revenue figures in public reports
