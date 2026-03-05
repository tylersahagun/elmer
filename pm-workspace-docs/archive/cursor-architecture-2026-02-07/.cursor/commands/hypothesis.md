# Hypothesis Management Command

Manage problem hypotheses through their lifecycle.

## Usage

```
/hypothesis new [name]
/hypothesis validate [name]
/hypothesis commit [name]
/hypothesis retire [name]
/hypothesis list [status]
/hypothesis show [name]
```

## Behavior

**Delegates to**: `hypothesis-manager` subagent

## Subcommands

### `new [name]` - Create Hypothesis

Creates new hypothesis in `hypotheses/active/[name].md`.
Will ask for: problem statement, initial evidence, persona affected.

### `validate [name]` - Move to Validated

Checks validation criteria:
- 3+ independent evidence sources
- Clear persona identification
- Severity/frequency assessed
- Outcome chain articulated

If criteria met, moves to `hypotheses/validated/`.

### `commit [name]` - Create Initiative

Moves hypothesis to `hypotheses/committed/` and creates:
- Initiative folder at `initiatives/active/[name]/`
- `_meta.json` linked to hypothesis
- `research.md` seeded with evidence

### `retire [name]` - Archive Hypothesis

Archives with reason (invalidated, deprioritized, completed, merged).
Moves to `hypotheses/retired/`.

### `list [status]` - List Hypotheses

Shows hypotheses by status: `active`, `validated`, `committed`, `retired`, `all`

### `show [name]` - Show Details

Displays full hypothesis details from any status folder.

## Lifecycle

```
Signal → new → validate → commit → /research → /pm → /proto
           (3+ evidence)  (creates initiative)
```

## File Locations

| Status | Location |
|--------|----------|
| Active | `hypotheses/active/` |
| Validated | `hypotheses/validated/` |
| Committed | `hypotheses/committed/` |
| Retired | `hypotheses/retired/` |
| Index | `hypotheses/_index.json` |

## Next Steps

After `commit`:
- Continue discovery: `/research [name]`
- Create PRD when ready: `/pm [name]`
