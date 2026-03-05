# Notion Admin Command

Manage Notion workspace as product command center - Projects database, Launch Planning, PRDs, EOW syncs, and feature flag rollout tracking.

## Usage

```
/notion-admin [mode] [options]
```

## Modes

### Database Operations

| Mode | Description | Example |
|------|-------------|---------|
| `audit` | Audit Notion structure, identify orphans, check relations | `/notion-admin audit` |
| `projects` | Manage Projects database - clean, link, update | `/notion-admin projects` |
| `launches` | Manage Launch Planning database | `/notion-admin launches` |
| `roadmap` | View/update Roadmap database | `/notion-admin roadmap` |
| `prd [name]` | Create/update PRD page in Projects | `/notion-admin prd global-chat` |
| `eow [date]` | Create End-of-Week sync page | `/notion-admin eow 2026-01-24` |
| `flags [name]` | Track feature flag rollout | `/notion-admin flags crm-agent` |

### Sync Operations

| Mode | Description | Example |
|------|-------------|---------|
| `sync-gtm` | Connect Go-to-Market to Launch Planning | `/notion-admin sync-gtm` |
| `disconnect-design` | Remove Design Brief relations (use Figma) | `/notion-admin disconnect-design` |
| `disconnect-specs` | Remove Eng Spec relations (use Linear) | `/notion-admin disconnect-specs` |
| `link [project] [launch]` | Link a project to launch planning | `/notion-admin link crm-agent crm-beta-launch` |

### Page Operations

| Mode | Description | Example |
|------|-------------|---------|
| `update [page]` | Update a specific page | `/notion-admin update product-command-center` |
| `create [type] [name]` | Create new page/row | `/notion-admin create project New Feature` |
| `search [query]` | Search across Notion | `/notion-admin search "CRM"` |

## Key Notion Pages

The command has access to these pages and databases:

| Name | Type | Purpose |
|------|------|---------|
| Product Command Center | Page | Main product dashboard |
| Revenue Team Hub | Page | Revenue operations hub |
| Projects | Database | Project tracking (main execution) |
| Launch Planning | Database | Ship dates, feature flags, rollout |
| Roadmap | Database | Strategic initiatives (Now/Next/Later) |

## Behavior

**Delegates to**: `notion-admin` subagent

**Uses**: `notion-admin` skill for procedural knowledge

## Common Workflows

### Clean Up Projects Database

```
/notion-admin audit
/notion-admin projects --clean
```

This will:
1. Find orphaned projects (no Linear, no Launch Plan)
2. Identify duplicate/stale entries
3. Suggest cleanup actions (confirm before executing)

### Create EOW Sync

```
/notion-admin eow
```

This will:
1. Create new EOW page with current date
2. Auto-populate from roadmap status
3. Include feature flag rollout progress
4. Link to relevant projects and launches

### Track Feature Flag Rollout

```
/notion-admin flags crm-agent
```

This will:
1. Create/update rollout tracking page
2. Connect to Launch Planning entry
3. Track percentage rollout progression
4. Document criteria and signals

### Connect GTM to Launch Planning

```
/notion-admin sync-gtm
```

This will:
1. Find projects with GTM briefs
2. Match to Launch Planning entries
3. Create/update relations

## MCP Tools Used

**Server:** `notion`

| Tool | Purpose |
|------|---------|
| `NOTION_QUERY_DATABASE` | Query projects, launches, roadmap |
| `NOTION_FETCH_DATABASE` | Get database schemas |
| `NOTION_RETRIEVE_PAGE` | Get page properties |
| `NOTION_UPDATE_PAGE` | Update page properties |
| `NOTION_UPDATE_ROW_DATABASE` | Update database rows |
| `NOTION_CREATE_NOTION_PAGE` | Create new pages |
| `NOTION_SEARCH_NOTION_PAGE` | Search across workspace |
| `NOTION_FETCH_ALL_BLOCK_CONTENTS` | Get page content |

## Output

Results are displayed inline and optionally saved to:
- `pm-workspace-docs/status/notion-admin-*.md` - Audit reports
- `pm-workspace-docs/signals/notion/` - Notable changes captured

## Related Commands

| Command | When to Use |
|---------|-------------|
| `/sync-notion` | Pull Notion → PM workspace (read-only sync) |
| `/notion-admin` | Admin operations on Notion itself |
| `/sync-dev` | Unified dev sync (includes Notion) |
