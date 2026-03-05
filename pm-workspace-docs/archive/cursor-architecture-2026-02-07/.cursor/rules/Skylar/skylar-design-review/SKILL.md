---
name: skylar-design-review
description: Run a comprehensive design quality audit on components. Use when the designer says "review", "check quality", "is this good", "design QA", "audit this", "does this pass", or asks about the quality of any design change.
---

# Design Review -- Comprehensive Quality Audit

Run a thorough design review on any component or set of changes. Produce a scored report with specific, actionable findings. This is the designer's quality assurance tool.

---

## Triggers

Activate when the designer asks:
- "Review this component"
- "Check the quality"
- "Is this good enough?"
- "Design QA"
- "Audit this"
- "Does this pass?"
- "What could be better?"
- "Rate this design"

---

## Procedure

### Step 1: Identify Scope

Ask the designer what to review if not specified:
- A specific component?
- All recent changes on this branch?
- A specific screen or flow?

### Step 2: Read the Component(s)

Read all relevant files:
- The component `.tsx` file(s)
- The `.stories.tsx` file if it exists
- Any related CSS or utility files
- Parent and child components for context

### Step 3: Run the Eight-Point Audit

Score each dimension from 1-5 (1 = failing, 3 = acceptable, 5 = excellent). Report findings for each.

---

## The Eight-Point Audit

### 1. Design Token Compliance (Score 1-5)

Check every style declaration in the component:

**Colors:**
- [ ] All colors use semantic tokens (primary, destructive, muted-foreground, etc.)
- [ ] No hardcoded hex values
- [ ] No raw Tailwind colors for semantic purposes (e.g., `text-gray-500` instead of `text-muted-foreground`)
- [ ] Status colors follow the pattern (emerald/amber/rose/blue with 50/600-700 pairings)

**Spacing:**
- [ ] All padding/margin/gap values are on the 4px grid
- [ ] No arbitrary values (e.g., `p-[13px]`)
- [ ] Card padding follows the `p-6` / `p-6 pt-0` pattern
- [ ] Section spacing uses `space-y-4` to `space-y-8`

**Typography:**
- [ ] Text sizes from the type scale (not arbitrary)
- [ ] Heading weights are `font-semibold` or `font-extrabold`
- [ ] Body text is `text-sm` (14px)
- [ ] Muted text uses `text-muted-foreground` not raw grays

**Border radius:**
- [ ] Uses `rounded-md` (buttons/inputs), `rounded-lg` (cards), or `rounded-full` (avatars)
- [ ] No arbitrary radius values

**Findings format:**
"Token Compliance: 4/5 -- Found 2 instances of `text-gray-500` that should be `text-muted-foreground`. All spacing is on-grid. Colors are semantic."

### 2. Responsive Behavior (Score 1-5)

Evaluate the component at three breakpoints:

**At 375px (mobile):**
- [ ] Content is readable and accessible
- [ ] No horizontal overflow
- [ ] Touch targets are at least 44x44px
- [ ] Layout adapts (columns collapse, etc.)

**At 768px (tablet):**
- [ ] Layout takes advantage of medium width
- [ ] No awkward stretching or dead space

**At 1280px (desktop):**
- [ ] Content uses the space well
- [ ] Maximum content width is constrained (not stretched across entire monitor)

**Findings format:**
"Responsive: 3/5 -- Works well at desktop. The three-column grid doesn't collapse on mobile and overflows horizontally. Needs `grid-cols-1 md:grid-cols-3`."

### 3. Dark Mode Rendering (Score 1-5)

Check every visual element in dark mode:

- [ ] Text is readable against dark backgrounds
- [ ] Borders are visible but not glaring
- [ ] Card surfaces use `bg-card` not `bg-white`
- [ ] Status badges remain readable (emerald/amber on dark backgrounds)
- [ ] No elements become invisible
- [ ] No jarring color mismatches

**Findings format:**
"Dark Mode: 5/5 -- All colors use semantic tokens. Verified readable at all text sizes. Status badges maintain contrast."

### 4. State Completeness (Score 1-5)

Check for all required states:

- [ ] **Loading**: Skeleton placeholders that match content shape
- [ ] **Empty**: Helpful message with optional action
- [ ] **Error**: Plain-language error with recovery action
- [ ] **Disabled**: Reduced opacity, cursor-not-allowed
- [ ] **Success/confirmation**: If applicable, a success state

**Findings format:**
"States: 2/5 -- Only has the default state. Missing loading skeleton, empty state, and error handling. These are required before this ships."

### 5. Accessibility (Score 1-5)

- [ ] Contrast ratio meets 4.5:1 for body text
- [ ] Focus rings visible on all interactive elements
- [ ] Form inputs have associated labels
- [ ] Icon-only buttons have `aria-label`
- [ ] Color is not the only indicator of meaning (icons or text supplement it)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Logical focus order (matches visual order)

**Findings format:**
"Accessibility: 4/5 -- Good contrast and focus states. One icon-only button missing `aria-label`. The status indicator uses only color -- needs an icon or text label too."

### 6. Persona Alignment (Score 1-5)

Reference `.skylar/PERSONAS.md` and evaluate:

- [ ] Target persona identified (who is this for?)
- [ ] Information hierarchy matches persona's scanning behavior
- [ ] Interaction complexity is appropriate for the persona
- [ ] Trust signals are present if needed (evidence, transparency, verifiability)
- [ ] Speed of task completion is considered

**Findings format:**
"Persona Alignment: 4/5 -- This dashboard targets Sales Leaders who scan for patterns. The summary at top is good. The 15 metrics below could overwhelm -- consider grouping into 3-4 categories with progressive disclosure."

### 7. Strategic Alignment (Score 1-5)

Reference product vision and guardrails:

- [ ] Serves a clear outcome chain (feature -> behavior -> business result)
- [ ] Not in anti-vision territory (generic AI, feature parity, automation without trust)
- [ ] Trust principles followed (show the work, let users verify, fail gracefully)
- [ ] Aligned with "revenue outcome system" positioning

**Findings format:**
"Strategic Alignment: 5/5 -- This component surfaces deal risk with evidence quotes, allowing leaders to coach proactively. Clear outcome chain to improved win rates."

### 8. Visual Consistency (Score 1-5)

Compare with adjacent components and the broader app:

- [ ] Consistent with other components in the same view
- [ ] Card depth matches nearby cards (same border + shadow treatment)
- [ ] Button hierarchy is clear (one primary, secondary/ghost for others)
- [ ] Spacing rhythms match the page
- [ ] Animation/transition behavior matches similar interactions elsewhere

**Findings format:**
"Consistency: 3/5 -- The card uses shadow-md while adjacent cards use shadow-sm. Button sizes mix default and small within the same card. Both should be normalized."

---

## Report Template

After completing all eight checks, present the report:

```
## Design Review: [Component Name]

### Overall Score: [X]/40

| Dimension | Score | Status |
|---|---|---|
| Token Compliance | X/5 | [Pass/Needs Work/Failing] |
| Responsive | X/5 | [Pass/Needs Work/Failing] |
| Dark Mode | X/5 | [Pass/Needs Work/Failing] |
| States | X/5 | [Pass/Needs Work/Failing] |
| Accessibility | X/5 | [Pass/Needs Work/Failing] |
| Persona Alignment | X/5 | [Pass/Needs Work/Failing] |
| Strategic Alignment | X/5 | [Pass/Needs Work/Failing] |
| Visual Consistency | X/5 | [Pass/Needs Work/Failing] |

### Critical Issues (Must Fix)
1. [Issue with specific fix]
2. [Issue with specific fix]

### Improvement Opportunities
1. [Suggestion]
2. [Suggestion]

### What's Working Well
1. [Positive finding]
2. [Positive finding]
```

### Scoring Guide

| Total Score | Quality Level | Recommendation |
|---|---|---|
| 36-40 | Excellent | Ship it |
| 28-35 | Good | Fix critical issues, then ship |
| 20-27 | Needs Work | Address all issues before shipping |
| Below 20 | Failing | Significant redesign needed |

---

## After the Review

Ask the designer: "Want me to fix the critical issues now?"

If yes, apply the `skylar-visual-change` workflow for each fix, committing each as an atomic change.

If the designer wants to address them later, note the issues in the Storybook story as TODO comments so they're not forgotten.
