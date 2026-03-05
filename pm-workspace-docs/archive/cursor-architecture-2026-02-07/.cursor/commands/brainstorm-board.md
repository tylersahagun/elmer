# Brainstorm Board Command

Generate creative ideas and explore options for a problem or feature.

## Usage

```
/brainstorm-board [topic]
```

## Behavior

**Applies:** `brainstorm` skill

Interactive brainstorming session focused on divergent thinking.

## Process

1. **Clarify the problem** - What are we solving?
2. **Generate ideas** - Quantity over quality first
3. **Categorize** - Group by theme or approach
4. **Evaluate** - Rough feasibility/impact assessment
5. **Capture** - Save promising directions

## Output Format

```markdown
# Brainstorm: [Topic]

## Problem Statement
[Clear articulation of what we're solving]

## Ideas Generated

### Category 1: [Theme]
- Idea A - [brief description]
- Idea B - [brief description]

### Category 2: [Theme]
- Idea C - [brief description]

## Top Candidates

| Idea | Impact | Effort | Notes |
|------|--------|--------|-------|
| [Idea] | High/Med/Low | High/Med/Low | [why promising] |

## Next Steps
- [What to explore further]
```

## Save Location

`pm-workspace-docs/research/brainstorms/YYYY-MM-DD-[topic].md`

## Next Steps

After brainstorming:
- Test assumptions: `/hypothesis new [name]`
- Start initiative: `/new-initiative [name]`
- Need more research: `/research [name]`
