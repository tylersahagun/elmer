# Placement Research Command

Research where a component should live in the production codebase.

## Usage

```
/placement [initiative-name]
```

## Behavior

**Delegates to**: `context-proto-builder` subagent (placement-only mode)
**Uses**: `placement-analysis` skill

The subagent will:
1. Analyze PRD and design brief for feature type
2. Study existing patterns in `elephant-ai/web/src/components/`
3. Analyze navigation structure
4. Recommend integration type and location
5. Document decision with rationale

## When to Use

Use `/placement` when you want **research only** without building a prototype.

For placement + prototype, use `/context-proto` instead (does both).

## Output

### Placement Decision

| Decision | Options |
|----------|---------|
| Integration Type | New Page / Side Panel / Modal / Embedded |
| Navigation Entry | Sidebar / Header / Context menu / Deep link |
| Location | `components/[domain]/[feature]/` |
| Parent Context | Which existing page contains this |

### Save Location

`pm-workspace-docs/initiatives/active/[name]/placement-research.md`

## Questions Answered

- What type of feature is this?
- Where do similar features live?
- How do users discover this?
- What's the right container?
- What's adjacent to this feature?

## Next Steps

After placement research:
- Build in context: `/context-proto [name]`
- Build standalone: `/proto [name]`
