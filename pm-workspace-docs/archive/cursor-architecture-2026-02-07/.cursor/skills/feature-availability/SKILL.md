---
name: feature-availability
description: Cross-reference product updates and signals against PostHog feature flags to determine customer visibility. Use when running /ingest with --customer-check flag or /availability-check command.
---

# Feature Availability Skill

Cross-reference product updates, releases, and signals against PostHog feature flags to determine what's customer-facing vs internal-only.

## When to Use

- After ingesting signals from #product-updates or release channels
- Before creating customer-facing communications
- When validating what features are GA vs internal
- Running `/ingest ... --customer-check`
- Running `/availability-check`

## PostHog Project

**Project ID:** `81505`

## MCP Tools Required

**Server:** `posthog`

| Tool | Purpose |
|------|---------|
| `POSTHOG_LIST_AND_MANAGE_PROJECT_FEATURE_FLAGS` | Get all feature flags with rollout status |
| `POSTHOG_LIST_PROJECT_EARLY_ACCESS_FEATURES` | Get Early Access feature linkages |
| `POSTHOG_RETRIEVE_FEATURE_FLAG_DETAILS` | Get specific flag details |

## Process

### Step 1: Extract Feature Mentions

Scan the signal content for:

**Explicit Feature Names:**
- Product features: "Internal Search", "Entity Mentions", "Workflows", etc.
- Integration names: "HubSpot", "Salesforce", "Dialpad", "Ringcentral"
- Agent names: "Privacy Agent", "Process Agent", "HubSpot Agent"

**Flag Name Patterns:**
- kebab-case: `chat-tool-internal-search`, `privacy-determination-agent`
- Keywords: "integration-*", "*-enabled", "*-beta", "*-v2"

**Internal Indicators:**
- "internal only", "internally", "just us", "our workspace"
- "not yet released", "before rolling out", "testing"
- "feedback in [internal-channel]"

### Step 2: Query PostHog Feature Flags

```
CallMcpTool: posthog / POSTHOG_LIST_AND_MANAGE_PROJECT_FEATURE_FLAGS
{
  "project_id": "81505",
  "limit": 200
}
```

### Step 3: Query Early Access Features

```
CallMcpTool: posthog / POSTHOG_LIST_PROJECT_EARLY_ACCESS_FEATURES
{
  "project_id": "81505",
  "limit": 100
}
```

### Step 4: Classify Each Feature

| Classification | Criteria | Customer Visible? |
|----------------|----------|-------------------|
| **GA** | 100% rollout, no restrictions, no EA link | ✅ Yes |
| **GA with EA Conflict** | 100% rollout + Early Access linked | ⚠️ Yes, but EA toggle can disable |
| **Early Access** | < 100% rollout + EA linked, user opt-in | ⚠️ Only if user opted in |
| **Internal Only** | Restricted to AskElephant workspace | ❌ No |
| **Partial Rollout** | < 100%, no EA, gradual release | ⚠️ Some customers |
| **Not Flagged** | No matching flag found | ✅ Likely GA (verify) |
| **Inactive** | Flag exists but marked inactive | ❌ No (disabled) |

### Step 5: Generate Availability Report

```markdown
## Feature Availability Check

**Signal:** [signal-id or source]
**Checked:** YYYY-MM-DD HH:MM

### Summary

| Status | Count |
|--------|-------|
| ✅ Customer Visible | X |
| ⚠️ Partial/EA | X |
| ❌ Internal Only | X |
| ❓ Not Flagged | X |

### Detailed Breakdown

| Feature | Flag Key | Rollout | EA Linked? | Status | Notes |
|---------|----------|---------|------------|--------|-------|
| Internal Search | `chat-tool-internal-search` | 100% | Yes | ⚠️ GA+EA | EA toggle can disable |
| Privacy Agent | `privacy-determination-agent` | Internal | No | ❌ Internal | AskElephant only |
| Dialpad | `integration-dialpad` | Internal | No | ❌ Internal | AskElephant only |
| Page Performance | `dataloaders-enabled` | 100% | No | ✅ GA | Safe to announce |

### ✅ Safe for Customer Communication

[List of features that are confirmed GA]

### ❌ Remove from Customer Communication

[List of features that are internal-only or not yet released]

### ⚠️ Needs Review

[List of features with partial rollout or EA conflicts]
```

## Feature-to-Flag Mapping

Common mappings (update as needed):

| Feature Name | Likely Flag Key(s) |
|--------------|-------------------|
| Internal Search | `chat-tool-internal-search` |
| Entity Mentions | `chat-entity-mentions` |
| Privacy Agent | `privacy-determination-agent` |
| Process Agent | `process-agent` |
| HubSpot Agent | `hubspot-mcp`, `hubspot-agent` |
| Salesforce Agent | `salesforce-agent-in-chat`, `salesforce-beta` |
| Dialpad | `integration-dialpad` |
| Ringcentral | `ring-central` |
| Workflows AI | `workflow-ai-assistant-alpha` |
| Global Chat | `global-chat-enabled` |
| Knowledge Base | `knowledge-bases` |
| Desktop App | (not flagged) |
| Onboarding | (not flagged) |

## Integration Flags Pattern

Integration flags follow the pattern:
- `integration-[name]-mcp-enabled` - AI chat tool
- `integration-[name]-workflow-enabled` - Workflow action
- `integration-[name]` - Core integration

If ANY of these are internal-only, the integration is not customer-facing.

## Workspace Restriction Detection

Look for these patterns in flag filters:

**Internal Only Indicators:**
```json
{
  "properties": [
    {
      "key": "workspace_id",
      "value": ["askelephant-workspace-id"]
    }
  ]
}
```

**Percentage Rollout:**
```json
{
  "rollout_percentage": 100  // GA
  "rollout_percentage": 0    // Disabled/internal
  "rollout_percentage": 50   // Partial rollout
}
```

## Output Locations

| Output Type | Location |
|-------------|----------|
| Availability report | Appended to signal file |
| Customer-safe copy | `[signal-file]-customer-safe.md` |
| Standalone check | `pm-workspace-docs/status/availability-check-YYYY-MM-DD.md` |

## Customer-Safe Content Generation

When `--customer-check` flag is used, automatically generate a customer-safe version:

1. **Remove** all features marked ❌ Internal Only
2. **Add caveat** to features marked ⚠️ Partial/EA
3. **Keep** all features marked ✅ GA
4. **Rewrite** in benefit-focused language (optional, if requested)

```markdown
## Customer-Safe Version

[Content with internal features removed]

---

*Features removed from this version (internal only):*
- [list of removed features]
```

## Cache Behavior

Feature flag data can be cached for efficiency:

- **Cache location:** `pm-workspace-docs/status/.feature-flags-cache.json`
- **Cache TTL:** 1 hour (flags don't change frequently)
- **Force refresh:** Add `--refresh` to command

```json
{
  "cached_at": "ISO8601",
  "project_id": "81505",
  "flags": [...],
  "early_access": [...]
}
```

## Error Handling

| Error | Action |
|-------|--------|
| PostHog API failure | Use cached data if available, warn user |
| Flag not found | Mark as "Not Flagged" - likely GA or new feature |
| Ambiguous match | List all possible flags, ask for clarification |

## Integration with Signals Processor

When called from signals-processor with `--customer-check`:

1. Receive extracted signal content
2. Run availability check
3. Append availability report to signal file
4. Generate customer-safe version if requested
5. Return summary to signals-processor for index update

Add to signal index entry:
```json
{
  "availability_check": {
    "checked_at": "ISO8601",
    "ga_count": 5,
    "internal_count": 3,
    "partial_count": 2,
    "customer_safe_file": "path/to/customer-safe.md"
  }
}
```
