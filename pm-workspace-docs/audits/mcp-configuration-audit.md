# MCP Configuration Audit

**Date:** 2026-01-24 (Updated)  
**Status:** Optimized - pm-mcp-config Fully Configured

---

## Executive Summary

The `pm-mcp-config` Composio MCP server is now fully configured with **5 toolkits** and **700+ tools**:
- Slack (110+ tools)
- Linear (35+ tools)
- Notion (55+ tools)
- HubSpot (200+ tools)
- PostHog (300+ tools)

This provides unified access to all major external systems from a single MCP server.

## Current MCP Configuration

### pm-mcp-config (Composio)

**Server Name:** `pm-mcp-config`  
**Type:** Composio-hosted MCP  
**URL:** `https://backend.composio.dev/v3/mcp/ee15a98e-80bb-4589-8340-eeaf6a4894c1`

| Toolkit | Tools | Key Operations |
|---------|-------|----------------|
| **Slack** | 110+ | `SLACK_FETCH_CONVERSATION_HISTORY`, `SLACK_SEARCH_MESSAGES`, `SLACK_SEND_MESSAGE`, `SLACK_LIST_ALL_CHANNELS` |
| **Linear** | 35+ | `LINEAR_CREATE_LINEAR_ISSUE`, `LINEAR_SEARCH_ISSUES`, `LINEAR_UPDATE_ISSUE`, `LINEAR_LIST_LINEAR_PROJECTS` |
| **Notion** | 55+ | `NOTION_CREATE_NOTION_PAGE`, `NOTION_QUERY_DATABASE`, `NOTION_SEARCH_NOTION_PAGE` |
| **HubSpot** | 200+ | `HUBSPOT_GET_CONTACT_IDS`, `HUBSPOT_GET_DEALS`, `HUBSPOT_CREATE_TICKET`, `HUBSPOT_GET_COMPANY` |
| **PostHog** | 300+ | `POSTHOG_RETRIEVE_PROJECT_INSIGHTS`, `POSTHOG_CREATE_PROJECT_COHORTS`, `POSTHOG_RETRIEVE_CURRENT_USER_PROFILE` |

**Total: 700+ tools**

### Other MCP Servers

| Server | Type | Tools | Status |
|--------|------|-------|--------|
| `Figma` | Direct MCP | 28 tools | Working |

## Cursor mcp.json Configuration

Current `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Figma": {
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    },
    "pm-mcp-config": {
      "url": "https://backend.composio.dev/v3/mcp/ee15a98e-80bb-4589-8340-eeaf6a4894c1/mcp?user_id=pg-test-dd115094-1a07-4450-960a-e69f2ad348b2"
    }
  }
}
```

## Tool Naming Convention

All Composio tools follow the pattern: `{TOOLKIT}_{ACTION}_{ENTITY}`

Examples:
- `SLACK_FETCH_CONVERSATION_HISTORY`
- `LINEAR_CREATE_LINEAR_ISSUE`
- `HUBSPOT_GET_DEALS`
- `NOTION_QUERY_DATABASE`
- `POSTHOG_RETRIEVE_PROJECT_INSIGHTS`

## Usage in Skills and Subagents

### Skills Using pm-mcp-config

| Skill | Toolkits Used | Purpose |
|-------|---------------|---------|
| `slack-sync` | Slack | Channel monitoring, revenue wins |
| `activity-reporter` | Slack | EOD/EOW activity reports |
| `linear-sync` | Linear (alternative) | Issue tracking |
| `notion-sync` | Notion (alternative) | Project sync |
| `portfolio-status` | Linear, PostHog | Live status enrichment |
| `initiative-status` | Linear, PostHog | Initiative health |

### Subagents Using pm-mcp-config

| Subagent | Toolkits Used | Purpose |
|----------|---------------|---------|
| `signals-processor` | Slack, HubSpot, Linear | Signal ingestion |
| `research-analyzer` | Slack, HubSpot, Linear | Research enrichment |

## Authentication

Auth configs attached to pm-mcp-config:
- `ac_xyY2Mgj0CQmK` - Slack
- `ac_ePh7BgoLt5kI` - Linear
- `ac_gFE7y3Zt8VO6` - Notion
- `ac_9g8JKBPpo89W` - HubSpot
- `ac_oKGmc0Kj5DBZ` - PostHog

## Key Slack Tools (for activity reports)

| Tool | Purpose |
|------|---------|
| `SLACK_FETCH_CONVERSATION_HISTORY` | Get messages from a channel |
| `SLACK_SEARCH_MESSAGES` | Search across workspace |
| `SLACK_LIST_ALL_CHANNELS` | List available channels |
| `SLACK_FIND_USERS` | Look up users |
| `SLACK_SEND_MESSAGE` | Post messages |

## Key Linear Tools

| Tool | Purpose |
|------|---------|
| `LINEAR_SEARCH_ISSUES` | Search issues by criteria |
| `LINEAR_GET_LINEAR_ISSUE` | Get issue details |
| `LINEAR_CREATE_LINEAR_ISSUE` | Create new issues |
| `LINEAR_UPDATE_ISSUE` | Update existing issues |
| `LINEAR_LIST_LINEAR_PROJECTS` | List projects |
| `LINEAR_LIST_LINEAR_CYCLES` | List cycles |

## Key HubSpot Tools

| Tool | Purpose |
|------|---------|
| `HUBSPOT_GET_DEALS` | Get deal information |
| `HUBSPOT_GET_COMPANY` | Get company details |
| `HUBSPOT_GET_CONTACT_IDS` | Look up contacts |
| `HUBSPOT_CREATE_TICKET` | Create support tickets |
| `HUBSPOT_LIST_ASSETS` | List CRM assets |

## Key PostHog Tools

| Tool | Purpose |
|------|---------|
| `POSTHOG_RETRIEVE_PROJECT_INSIGHTS` | Get dashboard insights |
| `POSTHOG_CREATE_PROJECT_COHORTS` | Create user cohorts |
| `POSTHOG_RETRIEVE_PROJECT_INSIGHT_DETAILS` | Get insight details |
| `POSTHOG_LIST_ERRORS` | List error tracking issues |

## Validation Checklist

- [x] pm-mcp-config has all 5 toolkits enabled
- [x] Slack authentication active
- [x] Linear authentication active
- [x] Notion authentication active
- [x] HubSpot authentication active
- [x] PostHog authentication active
- [x] Skills updated to reference pm-mcp-config
- [x] Subagents updated with MCP awareness
- [ ] Test Slack channel fetch
- [ ] Test Linear issue query
- [ ] Test HubSpot deal lookup

## Troubleshooting

### MCP Not Loading

If `pm-mcp-config` isn't available in Cursor:

1. **Restart Cursor** to reload MCP configuration
2. Run Composio setup command:
   ```bash
   npx @composio/mcp@latest setup "https://backend.composio.dev/v3/mcp/ee15a98e-80bb-4589-8340-eeaf6a4894c1" --client cursor
   ```

### Authentication Issues

If a toolkit isn't working:

1. Log into [platform.composio.dev](https://platform.composio.dev)
2. Navigate to your MCP config
3. Re-authenticate the affected toolkit
4. Restart Cursor

---

*Last updated: 2026-01-24*
