---
name: research-analyst
description: Analyze transcripts and customer research with strategic alignment checks. Use for /research workflows before PRD work.
---

# Research Analyst Skill

Procedural guidance for turning raw calls, interviews, and feedback into actionable initiative research.

## When to Use

- Running `/research [initiative]`
- Reviewing transcripts, meeting notes, or customer feedback
- Preparing evidence before writing a PRD

## Inputs

- Initiative name
- Transcript, notes, or linked source material
- Optional context from Slack, HubSpot, Linear, Notion, and PostHog

## Required Context

Load before analysis:

- `pm-workspace-docs/company-context/product-vision.md`
- `pm-workspace-docs/company-context/strategic-guardrails.md`
- `pm-workspace-docs/company-context/personas.md`

## MCP Servers

- `composio-config`: Slack, HubSpot, Linear, Notion, PostHog
- `hubspot`: account and deal context when customer identity matters
- `linear`: issue history for matching requests to known work
- `notion`: related specs and docs
- `posthog`: quantitative usage context

## Workflow

1. Confirm initiative and source material.
2. Extract key decisions, actions, problems, requests, and open questions.
3. **Extract competitive signals** (see Competitive Signal Extraction below).
4. Pull quantitative evidence when a feature area is measurable.
5. Score strategic alignment: `Strong`, `Moderate`, `Weak`, or `Needs Discussion`.
6. Flag anti-vision risks, trust concerns, and missing evidence.
7. Recommend next step: more discovery, `/landscape` for competitive context, or move to `/pm`.

## Competitive Signal Extraction

When analyzing transcripts and feedback, explicitly capture competitive intelligence:

### What to Look For

- **Competitor mentions**: "I wish it worked like [tool]", "We also use [tool]", "[Tool] does this really well"
- **Workflow comparisons**: "We used to do this in [tool]", "Our team switched from [tool]"
- **Feature gap signals**: "Does AskElephant do [X] like [competitor]?", "In [tool] you can..."
- **Switching triggers**: "We left [tool] because...", "What made us choose AskElephant over..."
- **Competitive praise**: What competitors do that users genuinely value (not just feature envy)

### How to Record

For each competitive signal, capture:

- **Verbatim quote** from the user
- **Competitor named** (or inferred)
- **Signal type**: mention / comparison / gap / switch-trigger / praise
- **Sentiment**: positive (toward competitor) / negative (toward competitor) / neutral

### Where to Save

- Include a "Competitive Signals" section in the initiative's `research.md`
- If `competitive-landscape.md` exists for this initiative, append new signals to the "Sources" section
- If no competitive landscape exists and 3+ competitor mentions are captured, suggest running `/landscape [name]`

## Required Output Sections

- TL;DR
- Strategic Alignment
- Key Decisions
- Action Items
- User Problems with quotes
- Feature Requests
- **Competitive Signals** (competitor mentions, comparisons, and gaps from user voice)
- Questions to Answer Before PRD
- Primary JTBD
- User Breakdown
- Feedback Plan

## Save Locations

- Initiative research: `pm-workspace-docs/initiatives/active/[name]/research.md`
- Meeting notes: `pm-workspace-docs/meeting-notes/YYYY-MM-DD-[topic].md`
- Signals: `pm-workspace-docs/signals/`
