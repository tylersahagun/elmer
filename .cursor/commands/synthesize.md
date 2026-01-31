# Signal Synthesis

Aggregate and analyze signals across sources to identify patterns and generate hypothesis candidates.

## Usage

- `/synthesize [topic]` - Analyze signals related to a topic
- `/synthesize --all` - Analyze all recent signals
- `/synthesize --persona [persona]` - Filter by persona
- `/synthesize --source [type]` - Filter by source type

## Purpose

The synthesize command helps you:

1. Find patterns across multiple signals
2. Identify emerging themes before they become obvious
3. Generate hypothesis candidates backed by evidence
4. Cross-reference with existing hypotheses

## Process

### 1. Load Signals

Read from `pm-workspace-docs/signals/`:

- `_index.json` for signal metadata
- Individual signal files for content

Filter by:

- Topic keywords (if specified)
- Persona mentions
- Source type (transcript, ticket, issue, conversation)
- Date range (default: last 30 days)

### 2. Extract and Aggregate

For each matching signal, extract:

- Problems mentioned
- Personas affected
- Severity indicators
- Frequency indicators
- Verbatim quotes

Aggregate into themes:

- Group similar problems
- Count occurrences across signals
- Track which personas mention each theme
- Note source diversity (more sources = stronger signal)

### 3. Generate Synthesis Report

Output format:

```markdown
# Signal Synthesis: [Topic or "All Signals"]

**Generated:** YYYY-MM-DD
**Signals Analyzed:** X
**Date Range:** [start] to [end]
**Filters:** [any applied filters]

## Executive Summary

[2-3 sentence overview of key patterns]

## Theme Analysis

### Theme 1: [Name]

**Strength:** Strong / Moderate / Weak
**Occurrences:** X signals
**Sources:** X transcripts, X tickets, X issues

| Dimension        | Value                      |
| ---------------- | -------------------------- |
| Severity         | High / Medium / Low        |
| Frequency        | Common / Occasional / Rare |
| Personas         | [list]                     |
| Source Diversity | X unique sources           |

**Evidence:**

> "[Quote 1]" - [source, date]
> "[Quote 2]" - [source, date]

**Hypothesis Match:** [existing hypothesis or "None"]
**Recommendation:** [Add evidence to X | Create new hypothesis]

---

### Theme 2: [Name]

...

## Hypothesis Candidates

Based on this synthesis, consider these new hypotheses:

### Candidate 1: [Suggested Name]

- **Problem:** [synthesized problem statement]
- **Evidence Count:** X signals
- **Personas:** [list]
- **Confidence:** High / Medium / Low

**Action:** Run `hypothesis new [name]` to create

### Candidate 2: [Suggested Name]

...

## Existing Hypothesis Updates

These existing hypotheses have new supporting evidence:

| Hypothesis            | New Evidence  | Action       |
| --------------------- | ------------- | ------------ |
| hyp-config-complexity | 3 new signals | Add evidence |
| hyp-visibility-gap    | 1 new signal  | Add evidence |

## Signal Quality Assessment

| Metric        | Value |
| ------------- | ----- |
| Total Signals | X     |
| With Quotes   | X%    |
| With Personas | X%    |
| Processed     | X%    |
| Unprocessed   | X%    |

## Recommended Actions

1. [Priority action 1]
2. [Priority action 2]
3. [Priority action 3]
```

### 4. Update Hypothesis Links

If synthesis identifies matches to existing hypotheses:

- Suggest adding evidence to hypothesis
- Update signal index with `hypothesis_matches`

## Theme Detection

Themes are detected by:

1. **Keyword clustering** - Similar words/phrases across signals
2. **Persona correlation** - Same persona mentioning similar issues
3. **Temporal clustering** - Issues appearing in same time period
4. **Feature area mapping** - Issues related to same product area

## Strength Indicators

**Strong Signal:**

- 5+ occurrences
- 3+ unique sources
- Multiple personas affected
- High severity mentions

**Moderate Signal:**

- 3-4 occurrences
- 2+ unique sources
- At least one persona
- Medium severity mentions

**Weak Signal:**

- 1-2 occurrences
- Single source type
- May need more data

## Integration with Hypothesis Workflow

```
Signals ──► /synthesize ──► Themes Identified
                              │
                              ├── Match existing? ──► Add evidence
                              │
                              └── New pattern? ──► hypothesis new
```

## Example Queries

```
# Analyze all signals about configuration
synthesize configuration

# Find patterns affecting RevOps
synthesize --persona revops

# Analyze recent support tickets
synthesize --source ticket

# Full analysis of all signals
synthesize --all
```

## Output Location

Synthesis reports should be saved to:
`pm-workspace-docs/signals/synthesis-YYYY-MM-DD-[topic].md`
