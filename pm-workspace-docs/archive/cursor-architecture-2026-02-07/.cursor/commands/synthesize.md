# Signal Synthesis Command

Analyze signals across sources to identify patterns and generate hypothesis candidates.

## Usage

```
/synthesize [topic]
/synthesize --all
/synthesize --persona [persona]
/synthesize --source [type]
```

## Behavior

**Delegates to**: `signals-processor` subagent
**Uses**: `signals-synthesis` skill

The subagent will:
1. Load signals from `pm-workspace-docs/signals/`
2. Filter by topic, persona, source type, or date range
3. Detect themes through keyword clustering, persona correlation, temporal patterns
4. Assess signal strength (Strong/Moderate/Weak)
5. Match to existing hypotheses
6. Generate synthesis report
7. Suggest hypothesis candidates

## Filters

| Filter | Example | Description |
|--------|---------|-------------|
| Topic | `/synthesize configuration` | Filter by keyword |
| Persona | `/synthesize --persona revops` | Filter by persona |
| Source | `/synthesize --source ticket` | Filter by source type |
| All | `/synthesize --all` | Analyze all recent signals |

## Signal Strength

| Strength | Criteria |
|----------|----------|
| **Strong** | 5+ occurrences, 3+ unique sources, multiple personas |
| **Moderate** | 3-4 occurrences, 2+ unique sources |
| **Weak** | 1-2 occurrences, single source type |

## Output

Synthesis report saved to: `pm-workspace-docs/research/synthesis/YYYY-MM-DD-[topic].md`

Contains:
- Executive summary
- Theme analysis with evidence
- Hypothesis matches
- New hypothesis candidates
- Recommended actions

## Next Steps

After synthesis:
- Strong new pattern? `/hypothesis new [name]`
- Matches existing? `/hypothesis show [name]` to add evidence
- Ready to commit? `/hypothesis commit [name]`
