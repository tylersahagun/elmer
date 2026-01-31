# Signal Ingest

Capture and process signals from various sources into the PM workspace.

## Usage

- `/ingest transcript` - Process a meeting transcript (paste or provide path)
- `/ingest ticket` - Process a support ticket
- `/ingest issue [linear-id]` - Pull and process a Linear issue
- `/ingest conversation` - Process a Slack/email thread

## Common Workflow

1. User provides raw input (transcript, ticket, etc.)
2. Agent extracts structured information
3. Agent saves to `pm-workspace-docs/signals/[type]/YYYY-MM-DD-[topic].md`
4. Agent updates `pm-workspace-docs/signals/_index.json`
5. Agent suggests hypothesis matches or creation

## Subcommands

### `ingest transcript`

Process a meeting transcript.

**Extract:**

- TL;DR (2-3 sentences)
- Key decisions made
- Action items (who, what, when)
- User problems with verbatim quotes
- Feature requests with severity/frequency
- Personas mentioned
- Strategic alignment signals

**Save to:** `pm-workspace-docs/signals/transcripts/YYYY-MM-DD-[source]-[topic].md`

**Output format:**

```markdown
# Transcript: [Topic]

**Date:** YYYY-MM-DD
**Source:** [meeting type]
**Participants:** [list]

## TL;DR

[2-3 sentence summary]

## Key Decisions

- Decision 1
- Decision 2

## Action Items

- [ ] [Action] - @[owner] - [due date]

## Problems Identified

### Problem 1: [Name]

> "[Verbatim quote]"

- **Persona:** [who has this problem]
- **Severity:** High/Medium/Low
- **Frequency:** Common/Occasional/Rare

## Feature Requests

- **Request:** [description]
- **Quote:** "[verbatim]"
- **Persona:** [who]

## Strategic Alignment

- ✅ [Aligned element]
- ⚠️ [Concern with question]

## Hypothesis Candidates

Based on this transcript, consider these hypotheses:

1. [hypothesis 1] - matches existing: [yes/no]
2. [hypothesis 2] - matches existing: [yes/no]
```

### `ingest ticket`

Process a support ticket.

**Extract:**

- Customer pain point
- Severity and urgency
- Persona type
- Related feature area
- Suggested solution (if any)

**Save to:** `pm-workspace-docs/signals/tickets/YYYY-MM-DD-[id]-[summary].md`

### `ingest issue [linear-id]`

Pull a Linear issue using MCP and process it.

**Process:**

1. Use Linear MCP to fetch issue details
2. Extract: title, description, labels, priority, assignee
3. Identify product signals vs engineering tasks
4. Save to `pm-workspace-docs/signals/issues/linear-[id].md`

### `ingest conversation`

Process a Slack thread or email conversation.

**Extract:**

- Context and participants
- Key questions raised
- Decisions or conclusions
- Action items
- Problems mentioned

**Save to:** `pm-workspace-docs/signals/conversations/YYYY-MM-DD-[channel]-[topic].md`

## Index Update

After saving any signal, update `pm-workspace-docs/signals/_index.json`:

```json
{
  "signals": [
    {
      "id": "sig-YYYY-MM-DD-001",
      "type": "transcript|ticket|issue|conversation",
      "source": "[source name]",
      "topic": "[topic]",
      "captured_at": "ISO8601",
      "status": "processed",
      "problems_extracted": ["problem 1", "problem 2"],
      "personas_mentioned": ["sales-rep", "revops"],
      "hypothesis_matches": ["hyp-existing-1"],
      "hypothesis_candidates": ["potential new hypothesis"]
    }
  ]
}
```

## Hypothesis Matching

After extracting problems, check `hypotheses/_index.json` for matches:

1. Compare extracted problems to existing hypothesis problem statements
2. If match found (>70% similarity), suggest adding as evidence
3. If no match, suggest creating new hypothesis

**Output:**

```
## Hypothesis Matching

### Matches Found
- **[Problem]** matches hypothesis: `hyp-config-complexity`
  - Run: `hypothesis show config-complexity` to view
  - Add evidence? [suggest command]

### New Hypothesis Candidates
- **[Problem]** - no match found
  - Run: `hypothesis new [suggested-name]` to create
```

## Quick Commands

After ingesting, suggest next steps:

- "Add evidence to existing hypothesis: `hypothesis show [name]`"
- "Create new hypothesis: `hypothesis new [name]`"
- "View all signals: check `signals/_index.json`"
