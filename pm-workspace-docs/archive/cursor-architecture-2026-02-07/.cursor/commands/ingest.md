# Signal Ingest Command

Capture and process signals from various sources into the PM workspace.

## Usage

### Manual Ingest (paste content)

```
/ingest transcript      # Then paste transcript
/ingest ticket          # Then paste ticket content
/ingest issue [linear-id]
/ingest conversation    # Then paste conversation
```

### Action Items → Linear Issues (optional)

```
/ingest transcript --create-linear
/ingest conversation --create-linear --linear-team EPD
/ingest transcript --create-linear --linear-team ASK
/ingest transcript --create-linear --linear-project "PM Workbench"
/ingest transcript --create-linear-all --linear-team EPD
```

### Automatic Ingest (pull from systems via MCP)

```
/ingest slack [channel] [time-range]   # Pull signals from Slack channel
/ingest linear [project]               # Pull signals from Linear project
/ingest hubspot [deal-id]              # Pull signals from HubSpot deal/company
/ingest all [time-range]               # Pull from all sources (Slack + Linear + HubSpot)
```

### Customer Availability Check

```
/ingest slack #product-updates --customer-check   # Check which features are customer-facing
/ingest all --customer-check                      # Check availability across all sources
```

The `--customer-check` flag cross-references extracted features against PostHog feature flags to determine:

- ✅ **GA** - Safe for customer communication (100% rollout)
- ⚠️ **Partial/EA** - Some customers only (Early Access or partial rollout)
- ❌ **Internal** - Not customer-facing (AskElephant workspace only)

This generates a customer-safe version of the signal with internal features removed.

## Behavior

**Delegates to**: `signals-processor` subagent

The subagent will:

1. Load company context (product-vision, personas)
2. Load existing signals index
3. **For source commands:** Use MCP tools to fetch data from external systems
4. Extract structured information (TL;DR, decisions, action items, problems, quotes)
5. Save to appropriate signals folder
6. Update `signals/_index.json`
7. Match to existing hypotheses
8. Suggest hypothesis creation for new patterns
9. **If `--create-linear` is set:** create Linear issues for action items owned by Tyler/me

**Linear issue creation defaults (when `--create-linear`):**

- **Team:** `EPD` (Product) to avoid impacting engineering triage metrics
- **Assignment:** Tyler/me when action items are owned by Tyler/me or owner is missing
- **Overrides:** `--linear-team ASK` or `--linear-project "Project Name"`
- **Create all owners:** `--create-linear-all` (unassigned if owner not found)

## Signal Types

### Manual (Paste Content)

| Type               | Command                | Save Location            |
| ------------------ | ---------------------- | ------------------------ |
| Meeting transcript | `/ingest transcript`   | `signals/transcripts/`   |
| Support ticket     | `/ingest ticket`       | `signals/tickets/`       |
| Linear issue       | `/ingest issue [id]`   | `signals/issues/`        |
| Slack/email thread | `/ingest conversation` | `signals/conversations/` |

### Automatic (Pull via MCP)

| Source  | Command                            | What It Pulls                          | Save Location      |
| ------- | ---------------------------------- | -------------------------------------- | ------------------ |
| Slack   | `/ingest slack #product-forum`     | Product signals, customer feedback     | `signals/slack/`   |
| Slack   | `/ingest slack #customer-feedback` | Customer quotes, pain points           | `signals/slack/`   |
| Slack   | `/ingest slack #churn-alert`       | Churn signals, at-risk accounts        | `signals/slack/`   |
| Linear  | `/ingest linear [project]`         | Customer-reported issues, feature asks | `signals/issues/`  |
| HubSpot | `/ingest hubspot [deal-id]`        | Deal notes, churn reasons, objections  | `signals/hubspot/` |
| All     | `/ingest all`                      | Pulls from all sources (last 24h)      | `signals/*/`       |

### Time Range Options

```
/ingest slack #product-forum today
/ingest slack #product-forum "last 7 days"
/ingest all "since monday"
/ingest all "last 24 hours"   # default
```

## Slack Channel Priorities for Signal Capture

| Priority | Channel(s)         | Signal Types                                  |
| -------- | ------------------ | --------------------------------------------- |
| High     | #product-forum     | Feature requests, product issues, UX feedback |
| High     | #customer-feedback | Direct customer quotes, pain points           |
| High     | #churn-alert       | Churn reasons, at-risk accounts               |
| Medium   | #product-issues    | Bug reports with customer impact              |
| Medium   | #product-requests  | Feature requests from sales/CS                |
| Low      | #team-dev          | Technical decisions with product implications |

### Slack Thread Resolution Tracking (REQUIRED)

**Always check threads for resolutions.** When a problem is mentioned, the thread may contain:

- A fix or workaround
- Confirmation that it was resolved
- An update that it's no longer an issue

**Resolution Detection Patterns:**
| Pattern | Resolution Type |
|---------|-----------------|
| "fixed", "resolved", "shipped" | Bug fix deployed |
| "workaround:", "for now you can" | Temporary workaround exists |
| "no longer an issue", "working now" | Self-resolved |
| "ticket created", "filed as ASK-" | Tracked in Linear |
| "PRD created", "added to roadmap" | Prioritized for future |

**Output must include:**

1. `problems_open` - Issues without resolution in thread
2. `problems_resolved` - Issues with confirmed fix
3. `problems_workaround` - Issues with temporary workaround
4. `problems_tracked` - Issues filed as tickets (link to Linear ID)

**Thread Resolution Format:**

```markdown
### Problem: [Description]

- **Status:** 🔴 Open | 🟡 Workaround | 🟢 Resolved | 📋 Tracked
- **Original:** [Quote, timestamp, permalink]
- **Resolution:** [Resolution quote if exists, timestamp]
- **Linear:** [ASK-XXXX if filed]
```

This prevents re-surfacing problems that have already been addressed.

## Linear Signal Types

When pulling from Linear, categorize by label:

| Label Pattern       | Signal Type         |
| ------------------- | ------------------- |
| `customer-reported` | Customer pain point |
| `feature-request`   | Feature request     |
| `bug/*`             | Product issue       |
| `area/integrations` | Integration gap     |

### Linear Status Tracking (REQUIRED)

**Always separate issues by status** to show what's fixed vs what needs help:

| Status Category    | Linear States                                  | Meaning               |
| ------------------ | ---------------------------------------------- | --------------------- |
| ✅ **Fixed**       | Done, Canceled, Duplicate                      | No longer an issue    |
| 🔄 **In Progress** | In Progress, In Code Review, Acceptance Review | Actively being worked |
| 📋 **Outstanding** | Todo, Triage, Backlog                          | Needs attention       |

**Output must include:**

1. `recently_fixed` - Issues marked Done (wins to celebrate)
2. `outstanding_critical` - P1-P2 issues not yet resolved
3. `outstanding_medium` - P3 issues blocking workflows
4. `in_progress` - What's actively being worked
5. `backlog_high_impact` - Known issues that should be prioritized

This enables tracking progress over time and prioritizing what actually needs help.

## HubSpot Signal Types

When pulling from HubSpot, extract:

- **Deal Lost Reasons**: Why we didn't win
- **Churn Reasons**: Why customers left
- **Support Tickets**: Product issues
- **Customer Notes**: Pain points and requests

## Output

Each signal is saved with:

- TL;DR summary
- Key decisions
- Action items (who, what, when)
- Problems with verbatim quotes
- Feature requests
- Personas mentioned
- Strategic alignment assessment
- Hypothesis matches
- **Source permalink** (for Slack, Linear, HubSpot links)

### Required Status Tracking

**For Linear signals:**

- Status breakdown (done, in_progress, todo, triage, backlog)
- `recently_fixed` - Issues that are no longer problems
- `outstanding_critical` - P1-P2 issues needing immediate attention
- `outstanding_medium` - P3 issues blocking workflows
- `in_progress` - What's actively being worked
- `backlog_high_impact` - Known issues to prioritize

**For Slack signals:**

- `problems_open` - Issues without resolution in thread
- `problems_resolved` - Issues with confirmed fix (with resolution details)
- `problems_workaround` - Issues with temporary workaround
- `problems_tracked` - Issues filed in Linear (with Linear ID + status)

This separation ensures we don't re-surface problems that have already been addressed and can celebrate wins.

## Examples

```bash
# Pull all product signals from last week
/ingest slack #product-forum "last 7 days"

# Pull churn signals
/ingest slack #churn-alert today

# Pull customer-reported Linear issues
/ingest linear customer-reported

# Pull everything from today
/ingest all today

# Ingest a specific HubSpot deal's signals
/ingest hubspot deal_123456
```

## Customer Check Behavior (`--customer-check`)

When the `--customer-check` flag is used, the signals-processor applies the `feature-availability` skill:

### Process

1. **Extract feature mentions** from signal content
2. **Query PostHog** for feature flags (project ID: 81505)
3. **Query Early Access** features for linkage
4. **Classify each feature**:
   - GA (100% rollout, no restrictions)
   - Partial/EA (< 100% or Early Access linked)
   - Internal Only (AskElephant workspace restriction)
5. **Generate availability report** appended to signal
6. **Create customer-safe version** with internal features removed

### Output

Adds to signal file:

```markdown
## Feature Availability Check

| Feature         | Flag                          | Status    | Customer Visible? |
| --------------- | ----------------------------- | --------- | ----------------- |
| Internal Search | `chat-tool-internal-search`   | 100% + EA | ✅ Yes            |
| Privacy Agent   | `privacy-determination-agent` | Internal  | ❌ No             |

### Customer-Safe Version

[Content with internal features removed]
```

### Use Cases

- **Release notes**: `/ingest slack #product-updates --customer-check`
- **Customer comms**: Validate what to include in newsletters
- **Sales enablement**: Confirm feature availability before demos

### PostHog Integration

Uses MCP tools from `posthog`:

- `POSTHOG_LIST_AND_MANAGE_PROJECT_FEATURE_FLAGS`
- `POSTHOG_LIST_PROJECT_EARLY_ACCESS_FEATURES`

See `.cursor/skills/feature-availability/SKILL.md` for full implementation details.

## Next Steps

After ingesting:

- Add evidence to existing hypothesis: `/hypothesis show [name]`
- Create new hypothesis: `/hypothesis new [name]`
- Find patterns across signals: `/synthesize`
- Link signals to initiatives: Update `_meta.json` with `signals: [...]`
- Check feature availability: `/availability-check [signal-id]`
