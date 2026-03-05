# New Initiative Command

Create a new initiative folder structure.

## Usage

```
/new-initiative [name]
```

Example:
```
/new-initiative hubspot-config
```

## Behavior

This is a thin wrapper that creates the folder structure.

## Process

1. **Copy template** - From `initiatives/_template/` to `initiatives/active/[name]/`
2. **Initialize meta** - Create `_meta.json` with phase: discovery
3. **Update title** - If context provided, update PRD title
4. **Commit** - Push with message "New initiative: [name]"

## Created Files

```
pm-workspace-docs/initiatives/active/[name]/
├── _meta.json          # Phase, status, timestamps
├── prd.md              # PRD template (empty)
├── research.md         # Research notes (empty)
├── design-brief.md     # Design brief template
├── engineering-spec.md # Eng spec template
├── gtm-brief.md        # GTM brief template
├── decisions.md        # Decision log
└── prototype-notes.md  # Prototype documentation
```

## Naming Convention

Use kebab-case: `hubspot-config`, `crm-sync`, `settings-redesign`

## Next Steps

After creating initiative:
- Have research? Run `/research [name]`
- Ready for PRD? Run `/pm [name]`
- Quick prototype? Run `/lofi-proto [name]`
