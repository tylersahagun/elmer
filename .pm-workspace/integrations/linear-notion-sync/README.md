# Linear → Notion Sync

Syncs Linear project data into Notion Projects database.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Notion    │────▶│  Pipedream/Cron  │────▶│   Linear    │
│  Projects   │     │    Workflow      │     │   GraphQL   │
│  Database   │◀────│                  │◀────│     API     │
└─────────────┘     └──────────────────┘     └─────────────┘
```

## Sync Logic

1. **Query Notion Projects** with non-empty `Linear Link` field
2. **Extract Linear project ID** from URL (format: `linear.app/.../project/[slug]-[id]`)
3. **Fetch Linear issues** for each project
4. **Calculate metrics:**
   - Total issues count
   - % Complete = (Done + Canceled issues) / Total
   - Blockers = Issues with "Blocked" label or priority 0
   - In Progress = Issues in "started" state with assignees
5. **Update Notion** with calculated values

## Setup Instructions

### 1. Create Linear API Key
- Go to: https://linear.app/askelephant/settings/api
- Create a personal API key with read access to projects and issues
- Save as `LINEAR_API_KEY`

### 2. Create Notion Integration
- Go to: https://www.notion.so/my-integrations
- Create new internal integration for "Ask Elephant" workspace
- Grant access to the Projects database
- Save as `NOTION_API_KEY`

### 3. Deploy to Pipedream
- Import workflow from `pipedream-workflow.json`
- Add environment secrets: `LINEAR_API_KEY`, `NOTION_API_KEY`
- Set schedule (recommended: every 15 minutes)

## Notion Database IDs

- **Projects Database ID**: `2c0f79b2-c8ac-805c-981b-000b9873980f`
- **Database URL**: https://www.notion.so/2c0f79b2c8ac802c8b15c84a8fce3513

## Linear Workflow States

| State | Type | Counts Toward |
|-------|------|---------------|
| Done | completed | % Complete |
| Canceled | canceled | % Complete |
| In Progress | started | In Progress list |
| In Review | started | In Progress list |
| Waiting on Client | started | In Progress list |
| Todo | unstarted | - |
| Backlog | backlog | - |
| Triage | triage | - |

## Fields Updated

| Notion Property | Type | Value |
|-----------------|------|-------|
| Linear Issues Count | Number | Total issue count |
| Linear % Complete | Number (%) | done / total × 100 |
| Linear Blockers | Text | "ASK-123: Title\nASK-456: Title" |
| Linear In Progress | Text | "ASK-789: Title (@Assignee)" |
| Linear Project ID | Text | *(Optional)* Linear project UUID |
