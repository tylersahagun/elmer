# End of Day Command

Generate a comprehensive end-of-day activity report summarizing work done across GitHub, Linear, and PM workspace.

**Applies:** `activity-reporter` skill

## Usage

```
/eod                        # Full end-of-day report
/eod --digest               # Quick "Sunday paper" summary (~2 min read)
/eod --initiative [name]    # Focus on specific initiative
/eod --json                 # Output JSON format only
/eod --no-save              # Display but don't save to file
/eod --since HH:MM          # Custom start time (default: midnight)
```

## Digest Mode

Add `--digest` for a stakeholder-friendly summary (no technical jargon, no PR counts):

```
/eod --digest
```

**Output:** `digest-YYYY-MM-DD.md` (~60 lines vs ~200 for full report)
**Audience:** Product, design, engineering, and non-technical stakeholders

| Section            | What's Included              |
| ------------------ | ---------------------------- |
| Headline           | Biggest product impact       |
| Features Shipped   | Grouped by impact area       |
| Bugs Fixed         | Count + highlights           |
| Team Focus         | Who worked on what (by name) |
| What's Coming Next | Upcoming work                |
| Stats              | Features, bugs fixed         |

**Team Members (use names, not handles):**
Matt Noxon, Jason, Eduardo, Palmer, Kaden, Dylan, Bryan, Adam, Skylar

## What It Does

Unlike `/status-all` (point-in-time artifact snapshot), `/eod` focuses on **what happened today** and **what should happen next**.

1. **Collects Activity** from multiple sources:

   - **Slack (NEW)**: Product, design, and engineering updates via `slack-sync` skill
   - GitHub `elephant-ai`: merged PRs, opened PRs
   - GitHub `pm-workspace`: doc updates, prototype iterations
   - Linear: issues progressed, issues completed
   - Local: branch activity, status changes

2. **Syncs Slack Channels** for signals:

   - **#product-updates**: Release announcements
   - **#team-dev**: Engineering updates and blockers
   - **#product-issues**: Escalations and bug triage

3. **Maps to Initiatives** using:

   - ASK-XXXX extraction from branches/commits
   - File path heuristics for prototypes/docs
   - Linear project → initiative mapping

4. **Generates Per-Initiative Summary**:

   - What got done (with authors and timestamps)
   - What needs to continue (open work, blockers)
   - Stakeholder involvement recommendations

5. **Provides Focus Recommendations** for tomorrow

## Output

### Report Sections

1. **Summary** - Activity counts by source (including Slack)
2. **By Initiative** - Detailed breakdown per initiative
3. **Unlinked Activity** - Work without initiative mapping
4. **Tomorrow's Focus** - Prioritized next actions

### Stakeholder Narratives

For each active initiative, generates contextual recommendations:

- "Engineering should review X before..."
- "Product needs to sign off on Y so that..."
- "Design should iterate on Z based on jury feedback..."

### File Saved

```
pm-workspace-docs/status/activity/eod/eod-YYYY-MM-DD.md
pm-workspace-docs/status/activity/eod/eod-YYYY-MM-DD.json (if --json)
```

## Examples

### Standard Daily Report

```
/eod
```

Generates full report for today (midnight to now).

### Focus on Specific Initiative

```
/eod --initiative hubspot-agent-config-ui
```

Shows only activity related to HubSpot config work.

### Quick JSON Export

```
/eod --json --no-save
```

Outputs JSON to console without saving file.

### Custom Time Range

```
/eod --since 09:00
```

Start from 9 AM instead of midnight (useful if you started late).

## Data Sources

| Source                | What's Collected                      |
| --------------------- | ------------------------------------- |
| **Slack Product/Eng** | Release announcements, bugs, blockers |
| GitHub elephant-ai    | PRs merged/opened, branch activity    |
| GitHub pm-workspace   | Doc updates, prototype changes        |
| Linear                | Issue state changes, completions      |
| Local workspace       | Recent commits, status changes        |

**Composio MCP:** Uses `composio-config` server with `slack-sync` skill (also provides Linear, Notion, HubSpot, PostHog)

## Integration

### After /sync-dev

Run `/eod` after `/sync-dev` for most accurate activity picture:

```
/sync-dev    # Refresh Linear + GitHub data
/eod         # Generate today's report
```

### With /status-all

`/status-all` shows artifact gaps, `/eod` shows what moved today.
Use both for complete picture.

## Troubleshooting

### No Activity Found

```
ℹ️ No activity found for today.

Try:
- /eod --since 08:00 (custom start time)
- Check if commits are on different branch
- Run /sync-dev to refresh data
```

### GitHub Data Missing

If `gh` CLI not available, report proceeds with pm-workspace and Linear data only.

### Linear Data Missing

If Linear MCP not available, report proceeds with GitHub data only.
