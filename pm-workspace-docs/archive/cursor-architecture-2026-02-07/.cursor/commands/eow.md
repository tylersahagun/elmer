# End of Week Command

Generate a comprehensive end-of-week activity report with velocity trends, phase transitions, and week-over-week comparisons.

**Applies:** `activity-reporter` skill

## Usage

```
/eow                    # Full end-of-week report
/eow --digest           # Quick "Sunday paper" weekly edition (~2 min read)
/eow --compare          # Include last week comparison with trends
/eow --team [key]       # Focus on specific Linear team (ASK, VAN, CEX, EPD)
/eow --json             # Output JSON format only
/eow --no-save          # Display but don't save to file
```

## Digest Mode

Add `--digest` for a stakeholder-friendly weekly summary (no technical jargon, no PR counts):

```
/eow --digest
```

**Output:** `digest-YYYY-WXX.md` (~80 lines vs ~300 for full report)
**Audience:** Product, design, engineering, and non-technical stakeholders

| Section            | What's Included           |
| ------------------ | ------------------------- |
| Week's Headline    | Biggest product impact    |
| Features Shipped   | Grouped by impact area    |
| Bugs Fixed         | Count + categories        |
| Team Contributions | By feature area (by name) |
| What's Coming Next | Upcoming priorities       |
| Week Stats         | Features, bugs fixed      |

**Team Members (use names, not handles):**
Matt Noxon, Jason, Eduardo, Palmer, Kaden, Dylan, Bryan, Adam, Skylar

**Excluded from digest:** PM workspace advances, PR counts, GitHub handles, technical infrastructure

## What It Does

Extends `/eod` with weekly aggregation and trend analysis:

1. **Aggregates Weekly Activity** across all sources:

   - Total PRs merged/opened for the week
   - Total issues progressed/completed
   - All initiatives touched
   - Phase transitions that occurred

2. **Syncs Slack Channels** for week's signals:

   - **#product-updates**: Release announcements
   - **#team-dev**: Engineering updates and blockers
   - **#product-issues**: Escalations and bug triage

3. **Calculates Velocity Trends**:

   - Week-over-week comparison (↑ up, ↓ down, → stable)
   - Per-initiative velocity (issues started vs completed)
   - Shipping rate (PRs per initiative)

4. **Tracks Phase Transitions**:

   - Which initiatives advanced phases this week
   - When transitions occurred
   - What enabled advancement

5. **Generates Stakeholder Matrix**:
   - Cumulative involvement needed across initiatives
   - Priority-weighted recommendations
   - Cross-functional dependencies

## Output

### Report Sections

1. **Week Summary** - High-level metrics with trends
2. **Phase Transitions** - Initiatives that advanced
3. **By Initiative** - Detailed per-initiative breakdown
4. **Velocity by Initiative** - Issues/PRs per initiative
5. **Unlinked Activity** - Work without mapping
6. **Next Week's Focus** - Priority actions for coming week

### Week-over-Week Comparison

```markdown
| Metric              | This Week | Last Week | Trend  |
| ------------------- | --------- | --------- | ------ |
| PRs Merged          | 35        | 28        | ↑ +25% |
| Issues Completed    | 20        | 22        | ↓ -9%  |
| Initiatives Touched | 8         | 6         | ↑ +33% |
| Phase Advances      | 2         | 1         | ↑      |
```

### Phase Transition Tracking

```markdown
| Initiative     | From   | To       | Date | What Enabled It       |
| -------------- | ------ | -------- | ---- | --------------------- |
| hubspot-config | define | build    | Wed  | Design brief approved |
| crm-exp-ete    | build  | validate | Fri  | Prototype complete    |
```

### File Saved

```
pm-workspace-docs/status/activity/eow/eow-YYYY-WXX.md    # W04 = week 4
pm-workspace-docs/status/activity/eow/eow-YYYY-WXX.json  # (if --json)
```

## Examples

### Standard Weekly Report

```
/eow
```

Generates full report for current week (Monday to now).

### With Trend Comparison

```
/eow --compare
```

Includes detailed last week comparison with percentage changes.

### Team-Focused Report

```
/eow --team VAN
```

Shows only Vanguard team's activity and velocity.

### Export for Stakeholder Meeting

```
/eow --json
```

Structured JSON for dashboards or presentations.

## Velocity Metrics

### Per-Initiative Velocity

| Metric           | Description                              |
| ---------------- | ---------------------------------------- |
| Issues Started   | New Linear issues created/assigned       |
| Issues Completed | Issues moved to Done state               |
| PRs Merged       | GitHub PRs merged (via ASK-XXXX mapping) |
| Docs Updated     | Changes to initiative docs               |

### Team Velocity (with --team)

| Metric          | Description                     |
| --------------- | ------------------------------- |
| Cycle Progress  | Sprint completion percentage    |
| Issues by State | Todo/In Progress/In Review/Done |
| Contributors    | Unique assignees with activity  |

## Weekly Patterns to Surface

### Positive Signals

- Initiatives advancing phases
- High completion rate (issues completed > started)
- Docs staying in sync with code

### Warning Signals

- Initiatives with code activity but stale docs (>7 days)
- Many issues started, few completed (scope creep)
- Blocked items persisting from previous week

## Integration

### Weekly Routine

```
# Monday morning
/sync-dev            # Refresh all data
/eow --compare       # See last week's results
/status-all          # Check portfolio health

# Friday afternoon
/eod                 # Today's wrap-up
/eow                 # Week summary (to date)
```

### With Status Reports

- `/eow` shows velocity (how fast things move)
- `/status-all` shows completeness (what exists)
- Use both for complete weekly review

## Data Sources

| Source                | Weekly Data                           |
| --------------------- | ------------------------------------- |
| **Slack Product/Eng** | Release announcements, bugs, blockers |
| GitHub elephant-ai    | All PRs merged since Monday           |
| GitHub pm-workspace   | All commits since Monday              |
| Linear                | Issue state changes, cycle snapshot   |
| Activity History      | Previous week data for comparison     |

**Composio MCP:** Uses `composio-config` server with `slack-sync` skill (also provides Linear, Notion, HubSpot, PostHog)

## Options Reference

| Option                      | Description                          |
| --------------------------- | ------------------------------------ |
| (none)                      | Full week report (Monday - now)      |
| `--compare`                 | Add last week comparison with trends |
| `--team ASK\|VAN\|CEX\|EPD` | Filter to specific Linear team       |
| `--json`                    | Output JSON format only              |
| `--no-save`                 | Display but don't save to file       |

## Troubleshooting

### No Previous Week Data

```
ℹ️ No activity history for last week comparison.

First week of tracking - trends will be available next week.
```

### Partial Data

If some sources unavailable (gh CLI, Linear MCP), report generates with available data and notes what's missing.

### Week Boundary

Week starts Monday 00:00 local time. For custom boundaries, use `/eod` with `--since` for specific days.
