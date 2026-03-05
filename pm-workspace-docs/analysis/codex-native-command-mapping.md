# Legacy Command to Codex Prompt Mapping

This file maps deprecated slash commands to codex-native prompt contracts.

## Mapping Table

| Legacy Command | Codex-Native Prompt Contract | Expected Output |
| --- | --- | --- |
| `/morning` | "Generate today's PM focus plan using current status, active initiatives, and urgent Slack/Linear signals." | Priorities, time blocks, blockers, collaborators |
| `/triage` | "Triage Slack + email + Linear activity since last check and produce an action queue." | Urgent responses, defer queue, delegation, draft replies |
| `/eod` | "Create EOD report with shipped progress, decisions, risks, and tomorrow setup." | Moved today, decisions, risks, next actions |
| `/eow` | "Create EOW report with wins, trends, KPI movement, and next-week priorities." | Weekly outcomes, trends, KPI status, priorities |
| `/sync-dev` | "Summarize current Notion, Linear, and GitHub status; flag mismatches and propose corrections." | In-sync items, mismatches, fix plan |
| `/sync-linear` | "Summarize active Linear project/cycle state relevant to PM priorities." | Cycle status, blockers, owners |
| `/sync-notion` | "Summarize Notion project/spec/brief status and detect stale artifacts." | Freshness map, required updates |
| `/sync-github` | "Summarize merged PRs, open PR risk, and release-relevant changes." | Ship summary, risk list, release notes input |

## Usage Rules

1. Prefer direct prompts over command aliases.
2. Include expected section headings in the prompt when repeatability matters.
3. For automation prompts, keep schedule details out of the task prompt.

## Suggested Prompt Suffix for Repeatability

Append this suffix when needed:

"Return output with explicit section headers and include confidence + missing data notes when MCP tools are unavailable."
