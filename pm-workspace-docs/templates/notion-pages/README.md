# Notion Page Templates — AI Generator Prompts

This directory contains two types of templates:

1. **Tier templates** (`tier-templates/`) — Full project page templates for the Projects DB. Select one when creating a new project to get pre-populated properties, launch checklists, and auto-created nested pages per PMM tier (P1-P4).
2. **Document generator prompts** (this directory) — AI agent prompts that search across Linear, GitHub, transcripts, elephant-ai codebase, Loom videos, PostHog, and HubSpot to generate complete, production-ready documents.

## How the generator prompts work

Each template file contains a two-step prompt:

1. **Step 1: Gather context** — Instructions for the AI agent to search specific sources (Linear issues, GitHub code, meeting transcripts, Slack signals, PostHog data, HubSpot records) and extract relevant information.
2. **Step 2: Write the document** — Detailed output spec with required sections, formatting rules, and quality standards.

### To use a generator prompt:

1. Open the template file for the document type you need
2. Replace `[FEATURE NAME]` with the actual feature/project name
3. Replace `[initiative]` in file paths with the actual initiative folder name
4. Feed the prompt to an AI agent with access to Linear, GitHub, Slack, PostHog, HubSpot, and the pm-workspace filesystem
5. Review and refine the generated output

### Quality bar

The KB article generator references `elephant-ai/docs/help-center/universal-agent-workflow-node.md` as the gold standard for output quality. All generators aim for production-ready output, not fill-in-the-blank templates.

## Tier Templates (for new projects)

| Template | File | Auto-Created Pages |
|----------|------|--------------------|
| P1 Launch (Major) | `tier-templates/p1-major-launch.md` | KB Article, SOP, Marketing Brief, Customer Email, FAQ, PRD, Design Brief, Eng Spec, Research, Metrics |
| P2 Launch (Significant) | `tier-templates/p2-significant-launch.md` | KB Article, SOP, FAQ, PRD, Design Brief (optional), Eng Spec |
| P3 Launch (Minor) | `tier-templates/p3-minor-launch.md` | KB Article |
| P4 Launch (Internal-only) | `tier-templates/p4-internal-only.md` | None |

See `tier-templates/README.md` for setup instructions.

## Document Generator Prompts

| Generator | File | Typical Owner | Sources Used |
| --------- | ---- | ------------- | ------------ |
| PRD | `prd.md` | Tyler | Linear, GitHub, transcripts, Slack, PostHog, personas, vision |
| Design Brief | `design-brief.md` | Tyler / Skylar | PRD, GitHub, Figma, Linear, transcripts, Storybook guide |
| Eng Spec | `eng-spec.md` | Tyler / Bryan | Linear, GitHub (deep), PRD, transcripts, PostHog, prod DB |
| Research | `research.md` | Tyler | Transcripts (primary), signals, PostHog, HubSpot, Linear, personas |
| Metrics | `metrics.md` | Tyler | PRD, PostHog (baselines), Linear, GitHub (tracking code), transcripts |
| KB Article | `kb-article.md` | Kenzie | Linear, GitHub, transcripts, Slack, Loom, PostHog, PRD |
| SOP | `sop.md` | Tyler | Loom (primary), GitHub, Linear, transcripts, KB article |
| Marketing Brief | `marketing-brief.md` | Kenzie / Tony | PRD, transcripts, PostHog, HubSpot, Loom, GitHub, GTM brief |
| Customer Email | `customer-email.md` | Kenzie | PRD, KB article, transcripts, HubSpot, marketing brief, Loom |
| FAQ | `faq.md` | Kenzie | Transcripts, Slack, Linear, HubSpot, PostHog, beta feedback |
| GTM Brief | `gtm-brief.md` | Kenzie / Tony | PRD, Linear, transcripts, PostHog, HubSpot, Loom, metrics |
| Launch Checklist | `launch-checklist.md` | Tyler / Kenzie | Linear, PostHog, GitHub, Slack, Notion, PM workspace |

## Reference

- Schema proposal: `pm-workspace-docs/audits/notion-schema-proposal.md`
- Migration SOP: `pm-workspace-docs/audits/notion-migration-sop.md`
- Tier template details: `tier-templates/README.md`
- KB article quality bar: `elephant-ai/docs/help-center/universal-agent-workflow-node.md`
