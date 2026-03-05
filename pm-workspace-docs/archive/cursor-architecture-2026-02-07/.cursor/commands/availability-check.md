# Feature Availability Check Command

Check if product updates and features are customer-facing by cross-referencing against PostHog feature flags.

## Usage

```bash
/availability-check                    # Check most recent signal
/availability-check [signal-id]        # Check specific signal
/availability-check --refresh          # Force refresh PostHog cache
```

## Behavior

**Uses:** `feature-availability` skill

The command:

1. Loads the specified signal (or most recent from `signals/_index.json`)
2. Extracts feature mentions from content
3. Queries PostHog for feature flags (project ID: 81505)
4. Queries Early Access features for linkage
5. Classifies each feature:
   - ✅ **GA** - 100% rollout, safe for customer communication
   - ⚠️ **Partial/EA** - Some customers only (Early Access or partial rollout)
   - ❌ **Internal** - AskElephant workspace only, not customer-facing
6. Generates availability report
7. Creates customer-safe version with internal features removed

## Output

### Console Output

```markdown
## Feature Availability Check

**Signal:** sig-2026-01-26-slack-product-updates
**Checked:** 2026-01-26 12:30

### Summary

| Status | Count |
|--------|-------|
| ✅ Customer Visible | 5 |
| ⚠️ Partial/EA | 2 |
| ❌ Internal Only | 3 |

### Detailed Breakdown

| Feature | Flag Key | Rollout | Status |
|---------|----------|---------|--------|
| Internal Search | `chat-tool-internal-search` | 100% + EA | ✅ GA |
| Privacy Agent | `privacy-determination-agent` | Internal | ❌ Internal |
| Dialpad | `integration-dialpad` | Internal | ❌ Internal |

### ✅ Safe for Customer Communication

- Internal Search
- Entity Mentions
- Page Load Performance
- Workflow AI Assistant

### ❌ Remove from Customer Communication

- Privacy Agent (internal beta)
- Dialpad integration (internal only)
- Ringcentral improvements (internal only)
```

### Files Generated

| File | Content |
|------|---------|
| `[original-signal].md` | Availability report appended |
| `[original-signal]-customer-safe.md` | Customer-safe version |

## PostHog Integration

**Server:** `posthog`
**Project ID:** `81505`

### Tools Used

- `POSTHOG_LIST_AND_MANAGE_PROJECT_FEATURE_FLAGS` - Get all flags with rollout %
- `POSTHOG_LIST_PROJECT_EARLY_ACCESS_FEATURES` - Get EA linkages

### Cache

Feature flag data is cached for 1 hour at:
`pm-workspace-docs/status/.feature-flags-cache.json`

Use `--refresh` to force update from PostHog.

## Examples

```bash
# Check the most recent signal
/availability-check

# Check a specific signal from today
/availability-check sig-2026-01-26-slack-product-updates

# Check with fresh PostHog data
/availability-check --refresh

# After ingesting product updates
/ingest slack #product-updates
/availability-check
```

## Use Cases

- **Release notes validation** - Before publishing customer communications
- **Sales enablement** - Confirm feature availability before demos
- **Support documentation** - Verify what to include in help docs
- **Customer newsletters** - Filter internal-only features

## Related Commands

- `/ingest ... --customer-check` - Ingest + check in one command
- `/posthog audit` - Full PostHog feature flag audit
- `/synthesize` - Pattern analysis across signals
