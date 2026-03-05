# In-Context Prototype Command

Build prototypes that show how features integrate with the actual app UI.

## Usage

```
/context-proto [initiative-name]
```

## Behavior

**Delegates to**: `context-proto-builder` subagent
**Uses**: `placement-analysis` skill

The subagent will:
1. Analyze codebase to determine where feature belongs
2. Recommend integration type (page, panel, modal, embedded)
3. Build prototype showing component in production context
4. Create context stories with real navigation and layouts
5. Include interactive Flow_* journey stories
6. Document placement decision

## Difference from /proto

| Command | Approach | Best For |
|---------|----------|----------|
| `/proto` | Standalone, isolated | Exploring the feature itself |
| `/context-proto` | Integrated with app UI | Showing how it fits in the app |

Both can be run independently to compare perspectives.

## Integration Types

| Type | When Used |
|------|-----------|
| **New Page** | Primary feature, needs full space |
| **Side Panel** | Detail view, quick edits |
| **Modal** | Focused action, confirmation |
| **Embedded** | Part of existing page |

## Output

### Files Created
```
elephant-ai/web/src/components/prototypes/[Initiative]/v1/
├── [ComponentName].tsx
├── [ComponentName].stories.tsx
└── contexts/
    ├── [ComponentName]InPage.tsx
    ├── [ComponentName]InPanel.tsx
    └── [ComponentName].context.stories.tsx

pm-workspace-docs/initiatives/active/[name]/
└── placement-research.md
```

### Stories Created
- `AsFullPage` - Component on dedicated page
- `AsSidePanel` - Component in slide-out panel
- `NavigationDiscovery` - How users find it
- `Flow_HappyPath` - Complete in-context journey
- `Flow_ErrorRecovery` - Error handling in app UI

## Prerequisites

- PRD should exist at `initiatives/active/[name]/prd.md`
- Design Brief helps but optional

## Next Steps

After context prototype:
- Compare with standalone: Run `/proto [name]` too
- Validate: `/validate [name]`
- Iterate: `/iterate [name]` when feedback arrives
