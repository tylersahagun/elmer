# Placement Research

You analyze where a feature should live in the production codebase. This command produces a detailed placement report without building anything.

## When to Use

| Scenario                                 | Use This | Use `/context-proto` Instead |
| ---------------------------------------- | -------- | ---------------------------- |
| Deep research before any building        | ✅       |                              |
| Engineering planning discussion          | ✅       |                              |
| Quick prototype with integration context |          | ✅ (does placement inline)   |
| Comparing multiple placement options     | ✅       |                              |

**Note:** `/context-proto` includes lightweight placement analysis automatically. Use `/placement` when you want thorough research without building, or when comparing multiple possible locations.

## Prerequisites

This command requires a product repo to be configured in `workspace-config.json`. If no repo is configured, the output will be theoretical recommendations.

## Auto-Context Loading

When researching placement, automatically load:

1. Load foundation: `@elmer-docs/company-context/product-vision.md`
2. Load workspace config: `@elmer-docs/workspace-config.json`
3. Load initiative PRD: `@elmer-docs/initiatives/[name]/prd.md`
4. Load Design Brief: `@elmer-docs/initiatives/[name]/design-brief.md`
5. Study component organization: `@product-repos/[repo]/src/components/` (if configured)
6. Study routing/pages: `@product-repos/[repo]/src/pages/` or routing config

## Research Process

### Step 1: Understand the Feature

From the PRD and design brief, identify:

- **Feature type**: UI component, page, modal, panel, data display, form, workflow step?
- **Scope**: Single component, component family, full page, or cross-cutting feature?
- **Data sources**: What APIs/hooks does it need?
- **User entry points**: How do users get to this feature?

### Step 2: Analyze Existing Structure (When Repo Available)

Explore the configured repo's component structure to understand:

| Category              | Pattern                     | Examples                       |
| --------------------- | --------------------------- | ------------------------------ |
| **Domain folders**    | Features grouped by domain  | `integrations/`, `workflows/`  |
| **Shared components** | Reusable UI primitives      | `ui/`, standalone `.tsx` files |
| **Feature groupings** | Related components together | `settings/`, `dashboard/`      |
| **Root-level**        | Single-purpose utilities    | `copy-to-clipboard.tsx`        |

### Step 3: Identify Integration Points

Research how the feature connects to existing parts of the app:

**Entry Points:**

- Which routes/pages would link to this?
- Is there a natural navigation path?
- Should this be in global nav or contextual?

**Data Dependencies:**

- What existing hooks/queries does it need?
- Are there shared state patterns to follow?

**Component Relationships:**

- Which existing components would be adjacent?
- Are there parent containers to consider?

### Step 4: Evaluate Integration Types

Consider these patterns:

| Integration Type     | When to Use                                           | Example                   |
| -------------------- | ----------------------------------------------------- | ------------------------- |
| **New Page**         | Feature needs dedicated space, complex layout         | `/settings/new-feature`   |
| **Slide Panel**      | Quick access from context, doesn't leave current view | Side panel from list item |
| **Modal**            | Focused task, no navigation needed                    | Confirmation, quick edit  |
| **Embedded Section** | Part of existing page                                 | New section in settings   |
| **Floating Element** | Always available, contextual                          | Chat widget, help button  |

### Step 5: Make Recommendation

Produce a placement report:

```markdown
# Placement Research: [Feature Name]

## Summary

[One sentence on where this should live]

## Feature Analysis

**Type:** [Component / Page / Panel / Modal]
**Scope:** [Single / Family / Full Page]
**Entry points:** [How users get here]

## Recommended Location

**Integration Type:** [Page / Panel / Modal / Section]
**Path:** `src/components/[domain]/[feature]/`
**Adjacent to:** [Related features]

### Rationale

[2-3 sentences on why this location]

## Alternative Options

### Option 2: [Alternative location]

- Pros: [list]
- Cons: [list]
- Why not chosen: [reason]

## Implementation Notes

### Routing

[Any routing considerations]

### State Management

[Any state/context considerations]

### Existing Components to Reuse

[List components that could be leveraged]

## Next Steps

- [ ] Review with engineering
- [ ] Run `/context-proto` to visualize
- [ ] Finalize location before building
```

## Output Location

Save the research to: `elmer-docs/initiatives/[name]/placement-research.md`

## No Repo Configured

If no product repo is available, provide theoretical recommendations:

```markdown
# Placement Research: [Feature Name]

> Note: No product codebase configured. These are theoretical recommendations.

## Recommended Integration Type

[Panel / Modal / Page / Section]

## Suggested Structure
```

src/components/[domain]/[feature]/
├── [FeatureName].tsx
├── [FeatureName].stories.tsx
└── index.ts

````

## Considerations for Implementation
[List of things to consider when adding repo]

---

To configure a product codebase, run `/setup` or add to workspace-config.json:

```json
{
  "repos": [{
    "name": "your-app",
    "path": "product-repos/your-app",
    "prototype_path": "src/components/prototypes/"
  }]
}
````

```

## Follow-up Commands

After placement research:

| Next Step | Command |
|-----------|---------|
| Build in context | `/context-proto [name]` |
| Build standalone | `/proto [name]` |
| Discuss with team | Share placement-research.md |
```
