# Quick Reference -- Plain Language to Design Outcomes

Say what you see and feel. Cursor translates.

---

## Spacing & Layout

| What you say | What Cursor does |
|---|---|
| "This feels too crowded" | Increases padding and/or gap using the 4px grid (usually stepping up one token, e.g., `gap-2` to `gap-4`) |
| "These elements need to breathe" | Adds vertical spacing between sections (`space-y-4` to `space-y-6`) |
| "Too much whitespace" | Tightens spacing by stepping down a token |
| "This section feels disconnected" | Reduces gap between related elements, or adds a shared container |
| "Tighten up the card" | Reduces card padding (e.g., `p-6` to `p-4`) while keeping content readable |
| "The form fields are too far apart" | Reduces `space-y` between form rows |
| "Center this" | Applies flex centering (horizontal, vertical, or both based on context) |
| "Make this a grid" | Converts layout to CSS grid with appropriate columns |
| "Stack these on mobile" | Adds responsive breakpoint to switch from row to column layout |

## Typography & Hierarchy

| What you say | What Cursor does |
|---|---|
| "The hierarchy is weak" | Increases contrast between heading and body (bigger size gap, heavier weight) |
| "This title needs more weight" | Bumps to `font-semibold` or `font-extrabold` |
| "The text is too small" | Steps up the type scale (e.g., `text-xs` to `text-sm`) |
| "De-emphasize this text" | Changes to `text-muted-foreground` and/or smaller size |
| "Make this a heading" | Applies appropriate heading variant (h2, h3, h4) with proper spacing |
| "The label should be quieter" | Uses `text-xs text-muted-foreground uppercase tracking-wider` (form section pattern) |
| "This text should feel like a caption" | Applies `text-[10px] text-muted-foreground` |

## Color & Visual Weight

| What you say | What Cursor does |
|---|---|
| "The colors feel wrong here" | Adjusts to use semantic tokens (primary, secondary, muted, destructive) |
| "This needs to feel like a warning" | Applies warning palette: `text-amber-600 bg-amber-50` |
| "Mark this as successful" | Applies success palette: `text-emerald-700 bg-emerald-50` |
| "This should signal danger" | Applies destructive tokens |
| "Too much visual weight" | Reduces from filled to outline/ghost variant, or lightens background |
| "Not enough contrast" | Increases text/background contrast to meet 4.5:1 ratio |
| "Make this more subtle" | Lowers opacity, uses muted tokens, or switches to ghost/outline |
| "Make this pop" | Adds the primary brand color, increases weight, or adds subtle shadow |

## Buttons & Actions

| What you say | What Cursor does |
|---|---|
| "This should be the primary action" | Changes to `default` or `primary-blue` button variant |
| "This button is too prominent" | Steps down to `outline`, `secondary`, or `ghost` variant |
| "Add a delete action" | Adds a `destructive` or `destructive-ghost` button |
| "The button is too small" | Increases to `size="lg"` (40px height) |
| "Make this look like a link" | Uses `link` button variant |
| "These buttons should be grouped" | Wraps in ButtonGroup component with consistent sizing |

## Components & States

| What you say | What Cursor does |
|---|---|
| "Add a loading state" | Creates a skeleton version of the component using `Skeleton` primitives |
| "What if there's no data?" | Creates an empty state with a helpful message and optional action |
| "Show an error state" | Creates an error display with explanation and recovery action |
| "Make this a card" | Wraps in `Card` with `border bg-card shadow-sm rounded-lg` |
| "Add a badge for status" | Adds a `Badge` with the appropriate status color pattern |
| "Make this dismissable" | Adds a close button (X icon) with proper positioning |
| "This needs a tooltip" | Wraps the element in a `Tooltip` with descriptive text |

## Responsive & Dark Mode

| What you say | What Cursor does |
|---|---|
| "How does this look on mobile?" | Describes the component at 375px viewport or suggests checking Storybook |
| "Make this responsive" | Adds breakpoint classes (mobile-first) for layout changes |
| "Two columns on desktop, one on mobile" | `grid grid-cols-1 md:grid-cols-2` |
| "Check dark mode" | Verifies all colors use semantic tokens (auto dark-mode) |
| "Fix dark mode" | Replaces any hardcoded colors with semantic tokens |
| "Hide this on mobile" | Adds `hidden md:block` (or appropriate breakpoint) |

## Git & Workflow

| What you say | What Cursor does |
|---|---|
| "Save my changes" | Creates atomic commit with design-intent message, pushes to branch |
| "Undo that" | Reverts the last commit |
| "Undo the last 3 changes" | Reverts the last 3 commits |
| "Start a new branch" | Creates `skylar/[description]` branch from current state |
| "Create a PR" | Opens a pull request with a summary of all design changes |
| "What have I changed?" | Shows a summary of all commits on the current branch |
| "Start fresh" | Stashes or resets changes, returns to clean main branch state |

## Storybook & Preview

| What you say | What Cursor does |
|---|---|
| "Start Storybook" | Runs `pnpm storybook` in `elephant-ai/apps/web/` |
| "Start the app" | Runs `pnpm dev` in `elephant-ai/apps/web/` |
| "Show me the button stories" | Describes where to find button stories in Storybook |
| "Add a story for this" | Creates a `*.stories.tsx` file with all relevant variants |
| "Show all states in the story" | Adds story variants for default, loading, empty, error, disabled |
| "Check Chromatic viewports" | Notes the three test viewports: 375px, 768px, 1280px |

## Design Review

| What you say | What Cursor does |
|---|---|
| "Review this component" | Runs design QA: tokens, responsive, dark mode, states, accessibility |
| "Is this accessible?" | Checks contrast ratios, labels, keyboard nav, ARIA attributes |
| "Audit the design system usage" | Scans for anti-patterns (hardcoded colors, off-grid spacing, etc.) |
| "Who is this designed for?" | References persona cards and evaluates against target user needs |

---

## Power Phrases

These phrases trigger the deepest design thinking:

- **"How would a sales rep experience this?"** -- Triggers persona-aware design review
- **"Does this build trust?"** -- Evaluates against AskElephant's trust principles
- **"What would Apple do?"** -- Triggers highest quality bar for polish and consistency
- **"Show me three options"** -- Generates multiple design directions to choose from
- **"Walk me through the flow"** -- Maps the full user journey through the component
