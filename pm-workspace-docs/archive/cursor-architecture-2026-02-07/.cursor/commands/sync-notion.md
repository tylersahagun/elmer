# Sync Notion Command

Sync Notion Projects, Engineering Specs, Design Briefs, and Launch Planning to PM workspace.

**Applies:** `notion-sync` skill

## Usage

```
/sync-notion                    # Full sync of all active projects
/sync-notion --project "Name"   # Sync specific project
/sync-notion --full             # Include completed/on-hold projects
/sync-notion --dry-run          # Preview changes without writing
/sync-notion --json             # Output JSON format only
```

## What It Does

Pulls from Notion as source of truth for initiative structure:

1. **Projects Database** - Main execution tracking
   - Creates/updates local initiatives from Notion projects
   - Syncs phase, stakeholders, Linear Link
2. **Engineering Specs** - Technical documentation
   - Extracts Linear Epic URLs (secondary Linear connection)
   - Tracks spec status and complexity
3. **Design Briefs** - Design documentation
   - Extracts Figma Links
   - Tracks design status and due dates
4. **Launch Planning** - Ship dates & rollout
   - Extracts launch dates and tiers (P1-P5)
   - Informs timeline tracking

## Output

### Notion Sync Report

```markdown
# Notion Sync Status

**Generated:** 2026-01-23 18:00
**Source:** Notion Product Command Center

---

## Projects Synced

| Project       | Phase     | Initiative    | Linear | Specs | Briefs | Launches |
| ------------- | --------- | ------------- | ------ | ----- | ------ | -------- |
| Global Chat   | Build     | global-chat   | ✅     | 2     | 1      | 1        |
| CRM Agent     | Build     | crm-exp-ete   | ✅     | 1     | 2      | 1        |
| Rep Workspace | Discovery | rep-workspace | ❌     | 0     | 1      | 0        |

---

## New Initiatives Created

- **customer-health-scoring** (from "Customer Health Scoring")
  - Phase: Discovery
  - Needs confirmation in sync-queue.md

---

## Artifact Summary

### Engineering Specs (3 synced)

- Chat Architecture (Global Chat) - Complete, Linear: ASK-4200
- CRM Sync Engine (CRM Agent) - In Progress, Linear: ASK-4350
- Auth Migration (CRM Agent) - Not Started

### Design Briefs (4 synced)

- Chat UX v2 (Global Chat) - Review, Due: Feb 1
- CRM Dashboard (CRM Agent) - In Progress, Due: Feb 15
- Rep Workspace Layout (Rep Workspace) - Not Started

### Launch Planning (2 synced)

- Chat v2 Launch (Feb 15) - P2 - Global Chat
- CRM Beta (Mar 1) - P3 - CRM Agent

---

## Linear Cross-Reference

Secondary Linear connections found via Engineering Specs:
| Initiative | Eng Spec | Linear Epic |
|------------|----------|-------------|
| global-chat | Chat Architecture | ASK-4200 |
| crm-exp-ete | CRM Sync Engine | ASK-4350 |

These can validate/supplement Linear sync mappings.

---

## Sync Queue

**3 items need attention:**
→ `pm-workspace-docs/sync-queue.md`

- New initiative needs confirmation
- Conflicting Linear connections
- Orphaned Engineering Spec
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       /sync-notion                           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Projects DB  │     │   Eng Specs   │     │ Design Briefs │
│               │     │               │     │               │
│ - Phase       │     │ - Linear Epic │     │ - Figma Link  │
│ - Linear Link │     │ - Complexity  │     │ - Status      │
│ - Stakeholders│     │ - Status      │     │ - Due Date    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌───────────────────┐
                    │  Launch Planning  │
                    │                   │
                    │ - Ship Date       │
                    │ - Launch Tier     │
                    │ - Status          │
                    └───────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Create/Update │     │ Update        │     │ Generate      │
│ Initiatives   │     │ _meta.json    │     │ Sync Report   │
│               │     │ notion_*      │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

## Files Updated

- `pm-workspace-docs/initiatives/*/_meta.json` - Initiative metadata updated
- `pm-workspace-docs/status/notion-sync-YYYY-MM-DD.md` - Sync report saved
- `pm-workspace-docs/sync-queue.md` - Ambiguous items queued for review

## Options

| Option             | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| (none)             | Sync all active projects (Phase not Done/Cancelled/On Hold) |
| `--project "Name"` | Sync specific project by name                               |
| `--full`           | Include completed and on-hold projects                      |
| `--dry-run`        | Show what would be synced without writing                   |
| `--json`           | Output JSON format only                                     |
| `--create-missing` | Auto-create initiatives for new Notion projects             |

## Notion Databases Referenced

| Database          | Collection ID                          | URL                                                                         |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| Projects          | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` | [Link](https://www.notion.so/ask-elephant/2c0f79b2c8ac805c981b000b9873980f) |
| Engineering Specs | `2c4afb5d-2729-439b-8a07-c2243d7c60a7` | [Link](https://www.notion.so/ask-elephant/7321cbcb31a9470fb15d0f472d2c5eb8) |
| Design Briefs     | `52148f9a-fe0b-4d8f-a666-e89fc6f3c504` | [Link](https://www.notion.so/ask-elephant/70fd3050f9ce473a99767e2933b684cc) |
| Launch Planning   | `296f79b2-c8ac-8002-9aae-000bf14c5a26` | [Link](https://www.notion.so/ask-elephant/296f79b2c8ac805682d2e2c49a1b53ef) |

## Examples

### Daily Sync

```
/sync-notion
```

Syncs all active projects, updates initiatives, generates report.

### Check Specific Project

```
/sync-notion --project "Global Chat"
```

Deep sync of one project with all related artifacts.

### Preview Before Syncing

```
/sync-notion --dry-run
```

See what would change without making updates.

### Full Audit

```
/sync-notion --full
```

Include completed projects for historical tracking.

## Integration

### With /sync-dev

The unified `/sync-dev` command includes Notion sync:

1. `/sync-notion` - Notion projects + artifacts
2. `/sync-linear` - Linear issues + cycle
3. `/sync-github` - GitHub PRs + merges

### With /status-all

After Notion sync, portfolio status shows:

- Notion artifacts in completeness scoring
- Launch dates in timeline view
- Design brief status in health checks

### With /sync-queue

When Notion sync finds ambiguous mappings:

1. Items added to `sync-queue.md`
2. User reviews and confirms
3. `/sync-dev --resolve` processes queue

## Troubleshooting

### No Projects Found

```
ℹ️ No active projects found in Notion.

All projects may be marked Done, Cancelled, or On Hold.
Try: /sync-notion --full
```

### Missing Notion Access

```
⚠️ Cannot access Notion database.

Ensure Notion MCP is configured and has access to the Product Command Center.
```

### Conflicting Data

```
⚠️ Conflicting Linear connections found.

Project "Global Chat" has different Linear links in:
- Projects DB: project-a
- Eng Specs: project-b

Added to sync-queue.md for manual resolution.
```
