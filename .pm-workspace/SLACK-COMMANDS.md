# Cursor Slack Commands

Simple commands for PM workflows. Say what you want → get docs in Notion + Slack.

---

## Quick Reference

| What you say                             | What happens                                                     |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `@Cursor research hubspot-config`        | Analyzes transcript → Creates Notion Feedback entry → Slack link |
| `@Cursor PM hubspot-config`              | Creates Project + Design + Eng + GTM docs in Notion              |
| `@Cursor prototype hubspot-config`       | Builds Storybook prototype → Updates Notion Design Brief         |
| `@Cursor new initiative salesforce-sync` | Creates local initiative folder from template                    |

---

## Research

Analyze a transcript and log findings to Notion.

```
@Cursor research hubspot-config
```

Or with a transcript:

```
@Cursor research hubspot-config

Here's the transcript from today's call:
[paste transcript]
```

**What it does:**

- Extracts key decisions, user problems, action items
- Saves to `.elmer/initiatives/hubspot-config/research.md`
- Creates Feedback entry in Notion
- Sends you Notion link in Slack

**Slack response:**

```
✅ Research complete for hubspot-config!

Key Findings:
- Users need bulk edit capability
- Field mapping is confusing
- Top pain: no visual sync status

📋 Notion: View Feedback Entry
💾 Local: .elmer/initiatives/hubspot-config/research.md

Next: Say 'PM hubspot-config' to create project documentation
```

---

## PM / PRD

Create full project documentation in Notion.

```
@Cursor PM hubspot-config
```

Or:

```
@Cursor PRD hubspot-config
```

**What it creates:**

| Document             | Notion Database   | Focus                                 |
| -------------------- | ----------------- | ------------------------------------- |
| **Project Overview** | Projects          | Problem, outcomes, MVP scope          |
| **Design Brief**     | Design Briefs     | User flows, interactions, affordances |
| **Engineering Spec** | Engineering Specs | Architecture, APIs, data models       |
| **GTM Brief**        | GTM Plans         | Value prop, messaging, launch tier    |

**Slack response:**

```
✅ Project documentation created for hubspot-config!

📋 Notion Links:
- Project Overview: https://notion.so/...
- Design Brief: https://notion.so/...
- Engineering Spec: https://notion.so/...
- GTM Plan: https://notion.so/...

💾 Local Files:
- prd.md
- design-brief.md
- engineering-spec.md
- gtm-brief.md

Next: Say 'prototype hubspot-config' to build interactive prototype
```

---

## Prototype

Build a Storybook prototype and update Notion.

```
@Cursor prototype hubspot-config
```

Or:

```
@Cursor proto hubspot-config
```

**What it does:**

- Reads PRD and Design Brief
- Creates React components with Storybook stories
- Updates Design Brief status in Notion to "In Progress"
- Adds Figma/Storybook links if applicable
- Documents migration notes

**Slack response:**

```
✅ Prototype created for hubspot-config!

🎨 Components:
- HubSpotFieldMapper.tsx
- HubSpotFieldMapper.stories.tsx
- SyncStatusIndicator.tsx

📋 Design Brief updated in Notion

To preview: cd prototypes && pnpm storybook
```

---

## New Initiative

Create a new initiative folder from template.

```
@Cursor new initiative salesforce-sync
```

With initial context:

```
@Cursor new initiative salesforce-sync

Context: Users report slow sync times. Need to investigate batch processing.
```

---

## Full Workflow Example

**Step 1: After a user call**

```
@Cursor research hubspot-config

Transcript from today's call with James:
[paste transcript]
```

→ Gets Notion Feedback link

**Step 2: Create full documentation**

```
@Cursor PM hubspot-config
```

→ Gets 4 Notion page links (Project, Design, Eng, GTM)

**Step 3: Build prototype**

```
@Cursor prototype hubspot-config
```

→ Gets Storybook components + updated Design Brief

---

## What Gets Created

### In Notion

| Database          | Page Title                      | Status      |
| ----------------- | ------------------------------- | ----------- |
| Projects          | [Initiative Name]               | Discovery   |
| Design Briefs     | [Initiative] - Design Brief     | Not Started |
| Engineering Specs | [Initiative] - Engineering Spec | Not Started |
| GTM Plans         | [Initiative] Launch             | Not Started |

All pages are automatically linked via Notion relations.

### Locally (in elmer)

```
.elmer/initiatives/[name]/
├── prd.md              # Main overview
├── research.md         # User research
├── design-brief.md     # Design spec
├── engineering-spec.md # Tech spec
├── gtm-brief.md        # Marketing spec
├── decisions.md        # Decision log
└── prototype-notes.md  # Migration notes
```

---

## Tips

- **Use short names**: `hubspot-config` not `hubspot-agent-configuration-ui`
- **Paste transcripts directly**: No need to save files first
- **One step at a time**: Research → PM → Prototype
- **Check Notion links**: Click them directly from Slack on mobile
- **Local files are backup**: Everything is also saved in elmer
