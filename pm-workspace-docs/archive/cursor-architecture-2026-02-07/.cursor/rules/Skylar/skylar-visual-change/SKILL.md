---
name: skylar-visual-change
description: Make visual design changes to AskElephant components using plain language. Use when the designer says "change", "update", "make it", "adjust", "redesign", "tweak", or describes any visual modification they want to see.
---

# Visual Change -- The Core Designer Workflow

This is the primary skill for translating a designer's visual intent into production-quality code changes. Follow every step. Never skip the clarification or verification phases.

---

## Triggers

Activate when the designer describes any visual change:
- "Make the button bigger"
- "This feels too crowded"
- "The hierarchy is weak"
- "Change the color of..."
- "Redesign the card layout"
- "Adjust the spacing"
- "The sidebar needs work"
- Any description of what something should look or feel like

---

## The Seven-Step Workflow

### Step 1: UNDERSTAND -- Parse the Design Intent

Read the designer's request carefully. Identify:

1. **What component(s)** are they talking about? (May need to ask if unclear)
2. **What aspect** needs changing? (spacing, color, typography, layout, states, hierarchy)
3. **What direction** are they pushing toward? (more open, tighter, bolder, subtler, etc.)

**If the request is ambiguous**, ask a clarifying question with 2-3 concrete options:

"I want to make sure I nail this. When you say the card 'feels off,' which of these resonates?
1. The content is too cramped -- needs more internal padding and spacing between elements
2. The visual hierarchy is flat -- title and description look the same importance
3. The card doesn't have enough presence -- it blends into the background"

**Never guess.** A clarifying question takes 10 seconds. A wrong implementation wastes minutes.

### Step 2: LOCATE -- Find the Component

Search the codebase to find the relevant file(s):

1. Check `elephant-ai/apps/web/src/components/` for the component
2. Key directories to search:
   - `ui/` -- Design system primitives (Button, Card, Dialog, Badge, etc.)
   - `chat/` -- Chat interface components
   - `engagements/` -- Meeting/call views
   - `workflows/` -- Workflow builder
   - `navigation/` -- Sidebar, top nav, breadcrumbs
   - `person/` -- Contact/person views
   - `company/` -- Company views
   - `signals/` -- Signal UI
   - `ai-elements/` -- AI-specific components
   - `prototypes/` -- Prototype iterations

3. Read the component file to understand its current structure
4. Check if it has a `.stories.tsx` file for Storybook

### Step 3: PLAN -- Describe the Change Before Making It

Before writing any code, describe the change to the designer in design language:

"Here's what I'm planning:
- Increasing the card's internal padding from 16px to 24px for more breathing room
- Adding 8px of space between the title and description
- Making the title semibold to strengthen the hierarchy over the body text

This follows our spacing grid (4px multiples) and typography scale. Want me to go ahead?"

**For small, obvious changes** (e.g., "make the button blue"), proceed without asking for confirmation but still describe what you did after.

**For significant changes** (layout restructure, new component, major visual shift), always get confirmation first.

### Step 4: EXECUTE -- Make the Code Change

Apply the change using the AskElephant design system:

**Rules:**
- All colors via semantic tokens (never hardcoded)
- All spacing on the 4px grid (never arbitrary values)
- All typography from the type scale
- Use `cn()` for conditional class merging
- Use existing UI primitives from `@/components/ui/` when possible
- Import icons from `lucide-react`

**Code quality:**
- Maintain existing code patterns in the file
- Don't refactor unrelated code
- Keep changes focused and minimal
- Add TypeScript types if creating new props

### Step 5: VERIFY -- Check Quality

After making the change, verify against the quality gate:

1. **Responsive**: Does the change work at 375px, 768px, 1280px?
   - If you changed a layout, add responsive classes (`grid-cols-1 md:grid-cols-2`)
   - If you changed spacing, ensure it doesn't overflow on mobile

2. **Dark mode**: Did you use semantic tokens?
   - Semantic tokens auto-adapt. If you used them correctly, dark mode works.
   - If you used any Tailwind color classes (e.g., `emerald-50` for status), verify they're readable in dark mode.

3. **States**: If the component displays data, does it handle loading/empty/error?
   - If those states don't exist yet and the change is small, note it as a follow-up rather than blocking.

4. **Accessibility**: Focus rings, contrast, labels present?

5. **Transitions**: Did you add `transition-colors` to interactive elements?

### Step 6: COMMIT -- Atomic Commit with Design-Intent Message

Stage and commit the change:

```bash
git add [changed files]
git commit -m "Design: [describe the visual change]"
```

Good commit messages:
- "Design: Increase card padding to 24px for better content breathing room"
- "Design: Strengthen heading hierarchy with semibold weight on section titles"
- "Design: Add skeleton loading state to engagement card"
- "Design: Switch CTA button from outline to filled primary-blue"

If not on a feature branch, create one first:
```bash
git checkout -b skylar/[short-description]
```

### Step 7: REPORT -- Describe the Visual Impact

Tell the designer what changed in their language:

"Done. Here's what changed:

The card now has 24px of internal padding (up from 16px), giving the content room to breathe. The title is now semibold at 14px, creating a clear hierarchy over the 12px muted description below it. The gap between title and description is 6px.

To see it: refresh Storybook and look at the [Component Name] story. Try switching between mobile and desktop viewports to see how it adapts."

---

## Handling Multiple Components

If the designer's request affects multiple components:

1. Identify all affected components
2. List them: "This change will touch the Card, the Badge inside it, and the status indicator. I'll update all three."
3. Make changes component by component
4. One commit per logical change (not one per file)
5. Report all changes together

---

## Handling "Show Me Options"

When the designer asks to see multiple directions:

1. Describe 2-3 options in design language (don't build them all)
2. Let the designer pick a direction
3. Build the chosen option
4. If they want to see it built to compare, create the alternatives as separate Storybook stories

---

## Handling "Undo" or "That's Not Right"

When the designer doesn't like the result:

1. "No problem. Can you tell me what feels off? Is it the spacing, the color, the weight, or something else?"
2. Revert the commit: `git revert HEAD`
3. Try again with their clarification
4. If they want to go back multiple steps: `git revert HEAD~N..HEAD`

---

## Reference Files

Before making changes, consult:
- `.skylar/DESIGN-SYSTEM.md` for token reference
- `.skylar/PERSONAS.md` if the change relates to a specific user type
- The component's existing `.stories.tsx` for context on current behavior
