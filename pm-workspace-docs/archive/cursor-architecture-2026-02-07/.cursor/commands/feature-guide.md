# Feature Guide Command

Generate customer support docs for a released feature by synthesizing Slack, GitHub PRs,
Linear issues, existing initiative docs, and code references.

## Usage

```
/feature-guide [feature-name]
/feature-guide [feature-name] --initiative [initiative-slug]
/feature-guide [feature-name] --slack "#channel-1,#channel-2"
/feature-guide [feature-name] --linear "Project Name"
/feature-guide [feature-name] --github "org/repo"
/feature-guide [feature-name] --time-range "last 90 days"
/feature-guide [feature-name] --output "pm-workspace-docs/feature-guides/<slug>.md"
```

## Behavior

**Delegates to**: `feature-guide` subagent

The subagent will:

1. Clarify missing inputs (feature name, initiative slug, sources, time range).
2. Pull evidence from Slack, GitHub PRs, Linear issues, and initiative docs.
3. Inspect relevant code paths to describe UI placement and behavior.
4. Generate a user-facing guide with troubleshooting and FAQs.
5. Save to `pm-workspace-docs/feature-guides/<feature-slug>.md`.

# Feature Guide Command

Generate customer support docs for a released feature by synthesizing Slack, GitHub PRs,
Linear issues, existing initiative docs, and code references.

## Usage

```
/feature-guide [feature-name]
/feature-guide [feature-name] --initiative [initiative-slug]
/feature-guide [feature-name] --slack "#channel-1,#channel-2"
/feature-guide [feature-name] --linear "Project Name"
/feature-guide [feature-name] --github "org/repo"
/feature-guide [feature-name] --time-range "last 90 days"
/feature-guide [feature-name] --output "pm-workspace-docs/feature-guides/<slug>.md"
```

## Behavior

**Delegates to**: `feature-guide` subagent

The subagent will:

1. Clarify missing inputs (feature name, initiative slug, sources, time range).
2. Pull evidence from Slack, GitHub PRs, Linear issues, and initiative docs.
3. Inspect relevant code paths to describe UI placement and behavior.
4. Generate a user-facing guide with troubleshooting and FAQs.
5. Save to `pm-workspace-docs/feature-guides/<feature-slug>.md`.
