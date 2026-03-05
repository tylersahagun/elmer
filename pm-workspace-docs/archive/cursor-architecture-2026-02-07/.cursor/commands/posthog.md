# PostHog Command

Analytics lifecycle management for AskElephant - dashboards, metrics, cohorts, alerts, and instrumentation.

**Delegates to:** `posthog-analyst` subagent

## Usage

```
/posthog audit                       # Audit current PostHog setup, identify gaps
/posthog dashboard [initiative]      # Create/update dashboard for an initiative
/posthog metrics [initiative]        # Define success metrics for an initiative
/posthog cohorts                     # Create/manage user cohorts
/posthog alerts                      # Set up proactive alerting
/posthog instrument [feature]        # Generate event tracking recommendations
/posthog question [query]            # Answer business questions (question-first approach)
/posthog instrument-check [feature]  # Cross-reference PostHog with codebase instrumentation

# NEW: Customer Intelligence Modes
/posthog north-star                  # Track the North Star metric (core value indicator)
/posthog health [workspace]          # Customer health scores (predict churn/expansion)
/posthog aha-moment [persona]        # Identify/validate activation "aha moment"
/posthog churn-risk                  # Identify at-risk workspaces proactively
/posthog expansion                   # Find upsell/expansion opportunities
```

## Key Concepts

**Cohorts vs Groups:**

- **Cohorts** = groups of people, used for filtering (e.g., "users who completed onboarding")
- **Groups** = tied to events, used for company aggregation (e.g., "unique companies this week")

**Question-First Approach:**
Don't audit 700 insights. Start with questions, find matching insights, identify gaps.

See: `pm-workspace-docs/research/posthog-best-practices-sachin.md`

## Modes

### Audit Mode

Analyze current PostHog setup and compare to best practices.

```
/posthog audit
/posthog audit --quick    # Health score only
```

**Output:** `pm-workspace-docs/audits/posthog-audit-YYYY-MM-DD.md`

**What it checks:**

- Event coverage and naming consistency
- Dashboard organization
- Feature flag usage
- Experiment velocity
- Survey coverage
- Error tracking status

---

### Dashboard Mode

Create or update a PostHog dashboard linked to an initiative.

```
/posthog dashboard global-chat
/posthog dashboard crm-exp-ete
```

**Process:**

1. Reads initiative PRD for success criteria
2. Creates dashboard with relevant insights
3. Updates initiative `_meta.json` with dashboard reference

**Output:** Dashboard created in PostHog + `_meta.json` updated

---

### Metrics Mode

Define and create success metrics for an initiative.

```
/posthog metrics global-chat
/posthog metrics --all    # Check metrics status across all initiatives
```

**Process:**

1. Extracts outcome chain from PRD
2. Identifies primary/secondary metrics
3. Creates PostHog insights
4. Identifies instrumentation gaps
5. Updates `_meta.json` with metrics config

**Output:** `pm-workspace-docs/initiatives/active/[name]/METRICS.md` + `_meta.json` updated

---

### Cohorts Mode

Create and manage user cohorts for segmentation.

```
/posthog cohorts           # List and recommend cohorts
/posthog cohorts --create  # Generate cohort definitions
```

**Standard Cohorts:**

- Power Users (high engagement)
- At-Risk (usage drop)
- Feature Adopters (per feature)
- Onboarding Complete/Abandoned
- Platform-specific (mobile, desktop)

**Output:** `pm-workspace-docs/status/posthog-cohorts.md`

---

### Alerts Mode

Set up proactive alerting for critical metrics.

```
/posthog alerts           # Review and recommend alerts
/posthog alerts --setup   # Configure standard alerts
```

**Standard Alerts:**

- WAU drop (>10% weekly)
- Workflow failures (>100/day)
- Bot failures (>50/day)
- Recording success rate (<90%)
- Error spike (>200% baseline)

**Output:** `pm-workspace-docs/status/posthog-alerts.md`

---

### Instrument Mode

Generate event tracking recommendations for a feature area.

```
/posthog instrument chat
/posthog instrument hubspot-agent
/posthog instrument onboarding
```

**Process:**

1. Analyzes current events for feature area
2. Identifies gaps based on tracking best practices
3. Generates instrumentation plan with naming conventions
4. Creates Linear ticket if engineering work needed

**Output:** `pm-workspace-docs/research/instrumentation/[feature]-events.md`

---

### Question Mode (Question-First Approach)

Answer business questions by searching existing insights first, then identifying gaps.

```
/posthog question "How many users are using the search feature?"
/posthog question "What's our workflow adoption rate by company?"
/posthog question "Which companies have declining usage?"
/posthog question "What's our time to first workflow?"
```

**Process:**

1. Searches PostHog for existing insights matching the question
2. If found, runs query and returns answer
3. If not found, checks for relevant events
4. If events exist, creates insight and answers
5. If no events, searches codebase for instrumentation
6. Reports answer OR instrumentation gap with recommendations

**Output:** Direct answer in response, or instrumentation gap report

**Best For:**

- Ad-hoc product questions
- Discovering what's already tracked
- Identifying instrumentation gaps quickly

---

### Instrument-Check Mode

Cross-reference PostHog events with codebase to find discrepancies.

```
/posthog instrument-check chat
/posthog instrument-check workflows
/posthog instrument-check search
```

**Process:**

1. Searches PostHog for events matching feature
2. Searches elephant-ai codebase for:
   - `AnalyticsEvent` enum entries (web)
   - `AnalyticsEventName` entries (backend)
   - Direct `posthog.capture()` calls
3. Compares and identifies discrepancies

**Identifies:**

- Events in code but not seen in PostHog (dead code?)
- Events in PostHog but not in enum (inconsistent)
- Events missing workspace context
- Missing start/complete event pairs

**Output:** `pm-workspace-docs/research/instrumentation/[feature]-check.md`

**Best For:**

- Pre-launch instrumentation audits
- Tech debt identification
- Ensuring type-safe analytics

---

### North Star Mode (NEW)

Track the single metric that captures core customer value.

```
/posthog north-star              # Show current North Star metric value
/posthog north-star --define     # Help define/refine North Star metric
/posthog north-star --dashboard  # Add North Star to all initiative dashboards
/posthog north-star --trend      # Show North Star trend over time
```

**Current North Star:** "Workspaces with ≥3 successful workflow runs per week"

**Why this metric:**

- Captures automated value (core "agentic" value prop)
- Leading indicator of retention and expansion
- Within product team's control
- Differentiates from competitors

**Output:** `pm-workspace-docs/status/posthog-north-star.md`

---

### Health Score Mode (NEW)

Calculate Customer Health Scores to predict churn and identify expansion candidates.

```
/posthog health                  # Portfolio health overview
/posthog health acme-corp        # Specific workspace health
/posthog health --at-risk        # List all at-risk workspaces
/posthog health --healthy        # List expansion candidates
```

**Health Score Components:**

- Usage (30%): DAU/MAU ratio, seat utilization
- Value (25%): Workflow success rate, tier reached
- Trend (20%): WoW usage change
- Fit (15%): Integrations enabled
- Technical (10%): Error rate

**Health Levels:**
| Score | Level | Action |
|-------|-------|--------|
| 80-100 | Healthy | Expansion candidate |
| 60-79 | Stable | Monitor |
| 40-59 | At-Risk | Proactive outreach |
| 0-39 | Critical | Urgent intervention |

**Output:** `pm-workspace-docs/status/posthog-health-scores.md`

---

### Aha Moment Mode (NEW)

Identify and validate the activation "aha moment" that predicts retention.

```
/posthog aha-moment              # Show current aha moment status
/posthog aha-moment sales-rep    # Validate aha moment for persona
/posthog aha-moment --discover   # Find candidate aha moments from data
/posthog aha-moment --validate   # Run retention comparison
```

**What it does:**

1. Define candidate aha moment (action + frequency + timeframe)
2. Create cohort of users who hit it
3. Compare retention vs users who didn't
4. If lift >50%, aha moment is validated

**Proposed Aha Moments:**
| Persona | Candidate |
|---------|-----------|
| Sales Rep | "Briefing before 3 meetings in 7 days" |
| RevOps | "3 successful workflow runs in 14 days" |
| Manager | "Team dashboard with ≥5 meetings" |

**Output:** `pm-workspace-docs/status/posthog-aha-moment.md`

---

### Churn Risk Mode (NEW)

Identify workspaces at risk of churning based on leading indicators.

```
/posthog churn-risk              # List workspaces by risk score
/posthog churn-risk --signals    # Show leading indicators tracked
/posthog churn-risk --playbook   # Show intervention playbook
/posthog churn-risk acme-corp    # Analyze specific workspace
```

**Risk Signals Tracked:**
| Signal | Risk Points | Lead Time |
|--------|-------------|-----------|
| Login drop >50% | +30 | 2-3 weeks |
| Core feature unused 7d | +25 | 1-2 weeks |
| Session duration crash | +20 | 1-2 weeks |
| Support ticket surge | +15 | 1 week |
| NPS detractor | +10 | Immediate |
| Team shrinkage | +25 | 1-2 weeks |

**Risk Levels:**

- Critical (76+): Immediate action
- High (51-75): This week outreach
- Medium (26-50): Monitor closely
- Low (0-25): Healthy

**Output:** `pm-workspace-docs/status/posthog-churn-risk.md`

---

### Expansion Mode (NEW)

Identify workspaces with upsell/expansion potential from product signals.

```
/posthog expansion               # List expansion-ready workspaces
/posthog expansion --signals     # Show expansion indicators tracked
/posthog expansion --pipeline    # Show expansion pipeline value
/posthog expansion acme-corp     # Analyze specific workspace
```

**Expansion Signals Tracked:**
| Signal | Score | Opportunity |
|--------|-------|-------------|
| Seat ceiling (>85%) | +30 | Seat expansion |
| Usage limits approaching | +25 | Tier upgrade |
| Team growth (invites) | +20 | Seat expansion |
| Feature upgrade clicks | +20 | Tier upgrade |
| Power user emergence | +15 | Champion program |
| Multi-team usage | +20 | Account expansion |

**Readiness Levels:**

- Hot (76+): Prioritize this week
- Ready (51-75): Outreach soon
- Emerging (26-50): Nurture
- Not Ready (0-25): Focus on activation

**Output:** `pm-workspace-docs/status/posthog-expansion.md`

---

## Examples

### Before Launch

```
/posthog metrics global-chat       # Define success metrics from PRD
/posthog dashboard global-chat     # Create tracking dashboard
/posthog instrument-check chat     # Verify instrumentation is complete
```

### Ad-hoc Product Questions

```
/posthog question "How many users use search daily?"
/posthog question "What % of companies have enabled workflows?"
/posthog question "Which features have the lowest adoption?"
```

### Weekly Health Check

```
/posthog audit --quick             # Quick health score
/posthog alerts                    # Check alert status
```

### Churn Analysis

```
/posthog cohorts                   # Set up at-risk cohort
/posthog alerts --setup            # Configure usage drop alerts
```

### Instrumentation Audit

```
/posthog instrument-check chat     # Check chat events vs codebase
/posthog instrument workflows      # Generate tracking plan for workflows
```

### Customer Intelligence (NEW)

```
/posthog north-star                # Check North Star metric
/posthog health --at-risk          # Find workspaces needing attention
/posthog churn-risk                # Proactive churn prevention
/posthog expansion                 # Find upsell opportunities
```

### Activation Analysis (NEW)

```
/posthog aha-moment sales-rep      # Validate aha moment for sales reps
/posthog aha-moment --discover     # Find candidate aha moments from data
```

### Weekly Customer Review (NEW)

```
/posthog health                    # Portfolio health overview
/posthog churn-risk                # At-risk workspaces
/posthog expansion                 # Expansion pipeline
/posthog north-star --trend        # North Star trend
```

---

## Integration

### With Initiative Lifecycle

- PRDs can reference metrics: "Success tracked via `/posthog metrics`"
- `/validate` checks if metrics meet targets
- `/status` includes PostHog metrics summary

### With Sync Commands

- `/sync-dev` can include metric snapshots
- Activity reports show metric changes

### File Outputs

| Mode             | Output Location                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Audit            | `pm-workspace-docs/audits/posthog-audit-YYYY-MM-DD.md`           |
| Dashboard        | Initiative `_meta.json` updated                                  |
| Metrics          | `pm-workspace-docs/initiatives/active/[name]/METRICS.md`                |
| Cohorts          | `pm-workspace-docs/status/posthog-cohorts.md`                    |
| Alerts           | `pm-workspace-docs/status/posthog-alerts.md`                     |
| Instrument       | `pm-workspace-docs/research/instrumentation/[feature]-events.md` |
| Question         | Direct response (no file unless gap found)                       |
| Instrument-Check | `pm-workspace-docs/research/instrumentation/[feature]-check.md`  |
| North Star       | `pm-workspace-docs/status/posthog-north-star.md`                 |
| Health           | `pm-workspace-docs/status/posthog-health-scores.md`              |
| Aha Moment       | `pm-workspace-docs/status/posthog-aha-moment.md`                 |
| Churn Risk       | `pm-workspace-docs/status/posthog-churn-risk.md`                 |
| Expansion        | `pm-workspace-docs/status/posthog-expansion.md`                  |

---

## PostHog MCP Tools Used

The subagent uses these PostHog MCP tools:

- **Dashboards:** create, get, update, list, add insights
- **Insights:** create from query, get, update, run queries
- **Feature Flags:** list, get definition
- **Experiments:** list, get, get results
- **Surveys:** list, get, get stats
- **Events/Properties:** list definitions
- **Errors:** list, get details
- **Search:** find entities by name
