# Figma Sync Command

Synchronize Figma designs into Storybook stories and code scaffolds.

## Usage

```
/figma-sync [initiative-name] [figma-url]
/figma-sync [initiative-name] [figma-url] --exact
```

## Behavior

**Delegates to**: `figma-sync` subagent

The subagent will:
1. Extract component spec from Figma using MCP tools
2. Map variants to TypeScript prop enums
3. Generate Storybook stories for all variants
4. Scaffold component code with proper types
5. Create Figma embed for design reference
6. Save spec for re-sync capability

## Prerequisites

- Figma URL can be a full file link (`/design/...` or `/proto/...`) or a node link
- `node-id` is preferred for component scaffolding; if missing, the subagent runs a design-language pass first
- Component must use Figma's Component Set variants

## Modes

### Default Mode
Generates clean, production-ready scaffolds:
- TypeScript types from spec
- Story for each variant
- Component scaffold with Tailwind

When URL has no `node-id`, default mode performs a **design-language pass** first:
- Extract top-level frame/component inventory
- Extract variable collections/tokens
- Save reusable design language notes for `/proto`
- Recommend the next node-level `/figma-sync` links

### Exact Mode (--exact)
Preserves exact Figma output:
- Creates `figma-generated/` subfolder
- Raw Figma code preserved
- For pixel-perfect comparison

## Output Files

```
elephant-ai/web/src/components/prototypes/[ProjectName]/
├── [ComponentName].tsx              # Component scaffold
├── [ComponentName].stories.tsx      # Stories with Figma embed
├── types.ts                         # TypeScript types
└── index.ts                         # Barrel export

pm-workspace-docs/initiatives/active/[name]/
├── figma-spec.json                  # Canonical spec
├── figma-language.md                # Design language + token mapping notes
└── figma-sync-log.md                # Sync history
```

## Figma Naming Requirements

For reliable extraction:
- Use Component Set variants (properly named)
- Boolean properties for toggles
- Consistent naming: `Button / variant=primary, size=md`

## Re-Sync

When Figma changes, run again:
- Preserves custom logic
- Updates variant names, prop types
- Flags breaking changes

## Next Steps

After sync:
- Preview in Storybook: `cd elephant-ai && npm run storybook -w web`
- Validate with jury: `/validate [name]`
