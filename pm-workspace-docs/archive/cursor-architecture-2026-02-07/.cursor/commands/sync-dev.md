# Sync Dev Command

Unified development pipeline sync combining Notion, Linear, and GitHub into a single initiative-centric view.

**Applies:** `notion-sync` skill, `linear-sync` skill, `github-sync` skill

## Usage

```
/sync-dev               # Full sync (Notion → Linear → GitHub) + unified report
/sync-dev --notion      # Notion-first sync (establish mappings from Notion)
/sync-dev --resolve     # Process sync-queue.md decisions only
/sync-dev --dry-run     # Preview what would sync (no writes)
/sync-dev --json        # Output JSON format only
/sync-dev --team ASK    # Focus on specific Linear team
```

## What It Does

Orchestrates all three sources with initiatives as the central hub:

1. **Notion Sync** (Source of Truth)
   - Fetches active projects from Projects DB
   - Creates/updates initiatives from Notion projects
   - Extracts Linear connections from "Linear Link" and "Linear Epic" fields
   - Syncs Engineering Specs, Design Briefs, Launch Planning

2. **Linear Sync** (Development Tracking)
   - Fetches active cycle progress
   - Gets in-progress/in-review issues
   - Maps issues to initiatives via smart inference
   - Cross-validates with Notion Linear connections

3. **GitHub Sync** (Shipping Tracking)
   - Fetches merged PRs (last 24h by default)
   - Extracts ASK-XXXX from branch names (primary method)
   - Maps PRs → Linear issues → projects → initiatives
   - No labels/prefixes required

4. **Sync Queue Resolution**
   - Surfaces ambiguous mappings for user decision
   - Updates `sync-queue.md` with pending items
   - Processes user decisions from previous runs

5. **Unified Report**
   - Cycle progress + shipping velocity
   - Work by initiative (Notion → Linear → GitHub)
   - Pipeline view: specs → issues → PRs → shipped
   - Unlinked work across all systems

## Output

### Development Status Report

```markdown
# Development Status Report

**Generated:** 2026-01-23 18:00
**Report Type:** Unified (Linear + GitHub)

---

## Executive Summary

| Metric             | Value          |
| ------------------ | -------------- |
| Cycle Progress     | 28% (Cycle 79) |
| Issues In Progress | 10             |
| PRs Merged (24h)   | 8              |
| Initiatives Active | 5              |

---

## Cycle Progress

**Cycle 79** (Jan 13 - Jan 27)

- Progress: 28% (14/50 completed)
- In Progress: 10 issues
- In Review: 3 issues
- Days Remaining: 4

---

## Recently Shipped (GitHub)

**Last 24 Hours:** 8 PRs merged

| Initiative  | PRs | Authors                  |
| ----------- | --- | ------------------------ |
| Global Chat | 3   | @skylar, @dylan, @palmer |
| CRM Agent   | 2   | @adam, @palmer           |
| Unlinked    | 3   | @matt, @jason, @tyler    |

---

## Work by Initiative

### Global Chat

**Linear Project:** [Global Chat](https://linear.app/...)
**PM Initiative:** global-chat (build phase)

#### Pipeline Status

| Stage         | Count |
| ------------- | ----- |
| Todo          | 26    |
| In Progress   | 8     |
| In Review     | 2     |
| Shipped (24h) | 3     |

#### Active Work

- [ ] ASK-4592: Global Chat first time experience (@Skylar) - In Progress
- [ ] ASK-4477: New condensed chat input (@Skylar) - In Progress

#### Recently Shipped

- #128: Improve error handling (@palmer) - 2h ago
- #125: Add keyboard shortcuts (@dylan) - 5h ago
- #123: Fix context window bug (@skylar) - 8h ago

---

### CRM Agent

**Linear Project:** [CRM Agent Upgrades](https://linear.app/...)
**PM Initiative:** crm-exp-ete (build phase)

#### Pipeline Status

| Stage         | Count |
| ------------- | ----- |
| Todo          | 15    |
| In Progress   | 4     |
| In Review     | 1     |
| Shipped (24h) | 2     |

[...continues for each initiative...]

---

## Unlinked Work

### Linear Issues (no initiative mapping)

- [ ] ASK-4583: BBL - Internal CLI POC (@Matt) - In Progress
- [ ] ASK-4575: Engagement card re-design (@Adam) - In Progress

### GitHub PRs (no initiative mapping)

- #129: CI improvements (@jason)
- #126: Dependency updates (@matt)

---

## Velocity Trends

| Week        | Issues Completed | PRs Merged |
| ----------- | ---------------- | ---------- |
| This Week   | 14               | 23         |
| Last Week   | 18               | 31         |
| 2 Weeks Ago | 15               | 27         |

---

## Recommendations

1. **Global Chat** has high activity but `design_brief` is 7 days stale - consider updating
2. **CRM Agent** has 3 blocked issues - review blockers
3. **5 PRs** shipped without initiative mapping - consider adding labels

---

**Next Actions:**

- `/status-all` - View full portfolio status
- `/sync-linear --project "Global Chat"` - Deep dive on specific project
- `/sync-github --release-notes` - Generate release notes
```

## Files Updated

- `pm-workspace-docs/status/dev-status-YYYY-MM-DD.md` - Full report saved
- `pm-workspace-docs/status/dev-status-YYYY-MM-DD.json` - JSON data saved
- `pm-workspace-docs/status/notion-sync-YYYY-MM-DD.md` - Notion sync details
- `pm-workspace-docs/initiatives/*/_meta.json` - Updated with:
  - `notion_project_id`, `notion_project_url` (from Notion)
  - `notion_artifacts` (specs, briefs, launches)
  - `dev_activity` (Linear/GitHub stats)
- `pm-workspace-docs/sync-queue.md` - Ambiguous mappings for user decision

## Options

| Option               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| (none)               | Full sync: Notion → Linear → GitHub + unified report     |
| `--notion`           | Notion-first sync (establish/update initiative mappings) |
| `--resolve`          | Process pending decisions in sync-queue.md only          |
| `--dry-run`          | Show what would be synced without writing                |
| `--json`             | Output JSON format only                                  |
| `--team ASK\|VAN`    | Focus on specific Linear team                            |
| `--since YYYY-MM-DD` | Set start date for GitHub PRs (default: 24h)             |

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         /sync-dev                            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ /sync-notion  │     │ /sync-linear  │     │ /sync-github  │
│               │     │               │     │               │
│ - Projects DB │     │ - Cycle data  │     │ - Merged PRs  │
│ - Eng Specs   │     │ - Issues      │     │ - ASK-XXXX    │
│ - Briefs      │     │ - Projects    │     │   extraction  │
│ - Launches    │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        │              Linear connections           │
        │    ◄────── (from Notion fields) ──────►   │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                ┌───────────────────────┐
                │   Smart Mapping       │
                │                       │
                │ Notion → Linear →     │
                │   GitHub → Initiative │
                │                       │
                │ Confidence scoring    │
                └───────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Update        │     │ Update        │     │ Generate      │
│ _meta.json    │     │ sync-queue.md │     │ Status Report │
│ dev_activity  │     │ (ambiguous)   │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

### Mapping Flow Detail

```
Notion Project "Global Chat"
        │
        ├── "Linear Link" field ────────────┐
        │                                   │
        └── Related Eng Specs ──┐           │
                                │           │
                    "Linear Epic" ──────────┼──► Linear Project ID
                                            │         │
                                            ▼         │
                                    _meta.json lookup │
                                            │         │
                                            ▼         │
                                    Initiative match ◄┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       │                       ▼
            Linear Issues              ASK-XXXX in              Initiative
            in project                GitHub branches           "internal-search"
                    │                       │                       │
                    └───────────────────────┴───────────────────────┘
                                            │
                                            ▼
                                    Unified Pipeline View
```

## Examples

### Daily Standup

```
/sync-dev
```

Quick overview of cycle progress and recent shipping.

### Sprint Planning

```
/sync-dev --json > sprint-data.json
```

Export data for sprint review/planning.

### Team Focus

```
/sync-dev --team VAN
```

Focus on Vanguard team's experimental work.

## Integration

### With Notion

- `/sync-notion` runs first to establish initiative-to-project mappings
- Notion "Linear Link" provides primary Linear connection
- Notion "Linear Epic" in Eng Specs provides secondary validation
- Initiative phase synced from Notion project phase

### With Portfolio Status

After `/sync-dev`, the `/status-all` command shows:

- Dev activity column in artifact matrix
- Health scoring includes development velocity
- Notion artifact counts (specs, briefs)
- Alerts for docs-to-code drift

### With Sync Queue

Ambiguous mappings flow:

1. `/sync-dev` identifies low-confidence mappings
2. Items added to `pm-workspace-docs/sync-queue.md`
3. User reviews and marks decisions
4. `/sync-dev --resolve` processes decisions
5. `_meta.json` updated with confirmed mappings

### Workflow Suggestion

```
Morning routine:
1. /sync-dev          # Full sync: Notion → Linear → GitHub
2. /sync-dev --resolve # Process any queued decisions (if prompted)
3. /status-all        # Check portfolio health
4. Focus on top action item

Weekly routine:
1. /sync-notion --full  # Include completed projects
2. /sync-dev            # Full sync
3. Review sync-queue.md for orphaned work
```

## Troubleshooting

### Partial Sync

If Linear works but GitHub fails (or vice versa):

- Run individual commands: `/sync-linear` or `/sync-github`
- Check specific error messages
- Report still generated with available data

### Slow Performance

- GitHub API can be slow for large date ranges
- Try: `/sync-dev --team ASK` to limit scope
- Or run at off-peak times

### Missing Mappings

Many unlinked items? Run:

- `/sync-linear --map` - See Linear mapping suggestions
- Update `_meta.json` with `github_labels` for PRs
