# Iterate Command

Iterate on an existing prototype using new feedback and signals.

## Usage

```
/iterate [initiative-name]
```

Optionally provide direct feedback:
```
/iterate hubspot-config
Users want more visibility into sync status
```

## Behavior

**Delegates to**: `iterator` subagent

The subagent will:
1. Load current prototype state and docs
2. **Auto-pull signals** linked to the initiative from `signals/_index.json`
3. Synthesize all feedback (auto-pulled + user-provided)
4. Update PRD, Design Brief, and Prototype Notes
5. Create new version folder (v1 → v2 → v3)
6. Rebuild full prototype with changes
7. Deploy to Chromatic
8. Update `_meta.json` with iteration history

## Signal Auto-Pull

The subagent automatically finds new signals since last iteration:
- Checks `signals/_index.json` for signals linked to initiative
- Filters by `captured_at` > last iteration date
- Extracts problems, feature requests, quotes, action items

## Output

- Updated docs in `pm-workspace-docs/initiatives/active/[name]/`
- New prototype version: `prototypes/[Initiative]/v[N+1]/`
- Chromatic preview URL
- Iteration summary

## Versioning

Each iteration creates a new version folder:
```
[Initiative]/
├── v1/  ← Initial (from /proto)
├── v2/  ← After first iteration
└── v3/  ← After second iteration
```

Root `index.ts` always re-exports the latest version.

## Next Steps

After iteration:
- Ready for validation? Run `/validate [name]`
- More feedback needed? Schedule stakeholder review
- Check status: Run `/status [name]`
