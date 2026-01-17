# In-Context Prototype Builder

You build prototypes that demonstrate how a feature will look and feel **integrated with the actual app UI**. Unlike `/proto` which creates isolated components, `/context-proto` researches where the feature belongs and builds it in that production context—with real navigation, layouts, and adjacent features.

## Purpose

| Command          | Approach                      | Best For                       |
| ---------------- | ----------------------------- | ------------------------------ |
| `/proto`         | Standalone, PRD-driven        | Exploring the feature itself   |
| `/context-proto` | Integrated, codebase-informed | Showing how it fits in the app |

Both are valid starting points. Run them independently to get two perspectives, then compare.

## What This Command Does

1. **Analyzes the codebase** to determine where this feature should live
2. **Recommends integration type** (new page, panel, modal, embedded section)
3. **Builds a prototype** showing the component in that context
4. **Documents the placement decision** for future reference

## Prerequisites

This command requires a product repo to be configured in `workspace-config.json`. If no repo is configured, use `/proto` for standalone prototypes instead.

## Auto-Context Loading

When building a context prototype, automatically load:

1. Load foundation: `@elmer-docs/company-context/product-vision.md`
2. Load workspace config: `@elmer-docs/workspace-config.json`
3. Load initiative PRD: `@elmer-docs/initiatives/[name]/prd.md`
4. Load Design Brief: `@elmer-docs/initiatives/[name]/design-brief.md`
5. Study existing patterns: `@product-repos/[repo]/src/components/` (from config)
6. Study navigation structure: `@product-repos/[repo]/src/` routing and layouts
7. If exists, load prior standalone prototype: `@prototypes/src/components/[ProjectName]/`

## No Additional Prerequisites Required

Unlike the standalone `/proto`, this command does its own analysis:

- Does NOT require `/proto` to run first (builds fresh from PRD)
- Does NOT require `/placement` (does placement research inline)

However, if a standalone `/proto` exists, it will reference that work.

## Build Process

### Step 1: Check Configuration

Read `workspace-config.json` to find:

- Configured repos in `repos[]`
- Prototype path for each repo
- Components path for reference

If no repo is configured:

```
No product repo configured. Use `/proto` for standalone prototypes,
or run `/setup` to add a product codebase.
```

### Step 2: Placement Analysis (Inline)

Analyze the codebase to determine integration approach:

**Questions to answer:**

- What type of feature is this? (CRUD, dashboard, config, workflow step)
- Where do similar features live in the app?
- How do users typically access this type of feature?
- What existing components can we reuse?

**Output a placement recommendation:**

```markdown
## Placement Recommendation

**Feature type:** [type]
**Integration type:** [New page / Slide-out panel / Modal / Embedded section]
**Location:** `product-repos/[repo]/src/components/[path]/`
**Adjacent to:** [List nearby features]

### Rationale

[Why this location makes sense]

### Alternative considered

[Other option and why it was rejected]
```

### Step 3: Build Context Prototype

Create components that show the feature **in its actual context**:

```
product-repos/[repo]/src/components/prototypes/[ProjectName]/
├── [ComponentName].tsx
├── [ComponentName].stories.tsx
├── [ComponentName]InContext.tsx       # Shows component in page/panel context
├── [ComponentName].context.stories.tsx # Stories showing integration
└── index.ts
```

**Context Story Structure:**

```typescript
const meta = {
  title: 'Prototypes/[ProjectName]/InContext',
  component: ComponentNameInContext,
  parameters: {
    layout: 'fullscreen',  // Show full page context
  },
};

// Show in different integration contexts
export const InSlidingPanel: Story = { ... };
export const InModal: Story = { ... };
export const InPage: Story = { ... };
```

### Step 4: Document the Decision

Update `elmer-docs/initiatives/[name]/placement-research.md`:

```markdown
# Placement Research: [Feature Name]

## Decision

[Where this feature will live]

## Integration Type

[Panel / Modal / Page / Section]

## Rationale

[Why this location]

## Context Prototype

Stories showing integration:

- `Prototypes/[ProjectName]/InContext`

## Technical Notes

[Any implementation considerations]
```

## Output

After building, reply with:

```
✅ Context prototype created for [name]!

📍 **Placement Decision:**
- Integration type: [Panel / Modal / Page]
- Location: `product-repos/[repo]/src/components/[path]/`

🎨 **Components created:**
- [ComponentName].tsx
- [ComponentName]InContext.tsx
- [ComponentName].context.stories.tsx

📱 **Preview:**
cd product-repos/[repo] && [storybook command]
→ Navigate to "Prototypes/[ProjectName]/InContext"

📄 **Documentation:**
- elmer-docs/initiatives/[name]/placement-research.md
```

## Fallback: No Repo Configured

If no product repo is available but user wants context prototype:

1. Suggest `/proto` for standalone prototype
2. Offer to create a mock context showing integration concept
3. Document intended placement for when repo is added

```
No product codebase configured. I can either:

1. `/proto [name]` - Build standalone prototype in prototypes/
2. Build a mock showing the integration concept (without real components)

Which would you prefer?
```

## When to Use `/placement` vs `/context-proto`

| Need                        | Command                        |
| --------------------------- | ------------------------------ |
| Just research, no building  | `/placement`                   |
| Research + build in context | `/context-proto`               |
| Build standalone first      | `/proto` then `/context-proto` |
| Compare multiple placements | `/placement`                   |
