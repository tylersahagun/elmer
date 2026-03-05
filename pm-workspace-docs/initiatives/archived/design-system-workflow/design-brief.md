# Design Brief: Design System & Workflow Modernization

## Overview

This brief documents the design principles, patterns, and workflows for AskElephant's design system modernization. It codifies Skyler's design philosophy into enforceable rules.

---

## Skyler's Design Framework

### Human-First Design (3 Pillars)

> "It's meeting them where they're at, and then it's making their lives better." — Skyler

#### 1. Meet Them Where They're At

**Principle:** Design for the user's current context, mental model, and expectations.

**Application:**
- Use familiar patterns before introducing novel ones
- Progressive disclosure — show complexity when needed, not upfront
- Match user's vocabulary in labels and messaging
- Consider the user's emotional state (stressed sales rep vs. reviewing leader)

**Design Check Questions:**
- Does this require the user to learn something new?
- Can we use a pattern they already know?
- Is the learning cost justified by the value delivered?

#### 2. Make It Obvious

**Principle:** Clarity over cleverness. The user should never wonder "what do I do next?"

**Application:**
- Primary action is visually dominant
- Secondary actions are clearly subordinate
- Error states explain what went wrong AND what to do
- Empty states guide toward the first action
- Never sacrifice usability for aesthetics

**Design Check Questions:**
- Is the next step clear without explanation?
- Could a new user complete this flow?
- Are we being clever at the expense of clarity?

#### 3. Make Their Lives Better

**Principle:** Every interaction should leave the user better off. Time saved, stress reduced, confidence increased.

**Application:**
- Remove friction before adding features
- Automate the tedious, preserve the meaningful
- Celebrate completions, acknowledge progress
- Respect user's time (no unnecessary clicks)
- Fail gracefully with dignity

**Design Check Questions:**
- Does this save the user time or effort?
- Would they thank us for this?
- Are we solving a problem or creating one?

---

## UX Visual Consistency Standards

> "When somebody notices high quality work, their opinion of that brand can resonate through other touch points." — Skyler

### The Apple Effect

Consistency creates trust. When one element is polished, users assume everything is polished. When one element is rough, users assume everything is rough.

**Goal:** Every pixel reinforces the same level of care.

### Pattern Library

| Pattern | Required Component | Variants Allowed | Notes |
|---------|-------------------|------------------|-------|
| **Page Headers** | `PageHeader` | Standard, with tabs | Never custom headers |
| **Modals/Dialogs** | `Dialog` (shadcn) | Standard, drawer | Always include dismiss |
| **Buttons** | `Button` (ui/) | default, outline, ghost, destructive, etc. | See button.tsx variants |
| **Forms** | `Form` + `Input` | Various input types | Always with validation |
| **Cards** | `Card` (ui/) | Standard, interactive | Consistent padding |
| **Tables** | AG Grid or Table | List, data | Match existing patterns |
| **Toasts** | `toast` (sonner) | Success, error, info | Brief, actionable |
| **Dropdowns** | `DropdownMenu` | Standard | Keyboard accessible |

### Prohibited Patterns

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Custom buttons (`<button>`) | Use `<Button>` from ui/ |
| Hardcoded colors (`#5B5FC7`) | Use tokens (`bg-primary`) |
| Arbitrary spacing (`p-[17px]`) | Use scale (`p-4`) |
| Custom shadows | Use token shadows |
| Inline styles | Use Tailwind classes |
| New modal implementations | Extend existing Dialog |

---

## Color System

### Semantic Tokens (Use These)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | Blue | Blue | Primary actions, links |
| `secondary` | Gray | Gray | Secondary actions |
| `destructive` | Red | Red | Danger, delete |
| `muted` | Light gray | Dark gray | Subtle backgrounds |
| `accent` | Blue tint | Blue tint | Highlights |
| `background` | Near-white | Near-black | Page background |
| `foreground` | Near-black | Near-white | Primary text |
| `muted-foreground` | Gray | Gray | Secondary text |

### Color Rules

1. **Never use hex values** — Always use semantic tokens
2. **Contrast matters** — Foreground on background must pass WCAG AA
3. **Meaning over aesthetics** — Red = danger, green = success, etc.
4. **Theme-aware** — All colors must work in both light and dark mode

---

## Typography System

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | 400 | Labels, captions |
| `text-sm` | 14px | 400 | Body text, UI elements |
| `text-base` | 16px | 400 | Primary content |
| `text-lg` | 18px | 500 | Section headers |
| `text-xl` | 20px | 600 | Page titles |
| `text-2xl` | 24px | 600 | Major headings |

### Typography Rules

1. **Font family:** System fonts via Tailwind (Inter-like)
2. **Line height:** Default Tailwind leading
3. **Truncation:** Use `truncate` class, never custom ellipsis
4. **Hierarchy:** Maximum 3 levels visible at once

---

## Spacing System

### The Scale

| Token | Value | Common Uses |
|-------|-------|-------------|
| `0` | 0px | Reset |
| `1` | 4px | Icon gaps |
| `2` | 8px | Tight padding |
| `3` | 12px | Standard gaps |
| `4` | 16px | Component padding |
| `6` | 24px | Section spacing |
| `8` | 32px | Large gaps |
| `12` | 48px | Page margins |
| `16` | 64px | Major sections |

### Spacing Rules

1. **Use the scale** — Never arbitrary values (`p-[17px]`)
2. **Consistent padding** — Cards always use `p-4` or `p-6`
3. **Gap over margin** — Prefer `gap-4` in flex/grid over individual margins
4. **Breathing room** — When in doubt, add more space

---

## Shadow & Depth System

### Shadow Tokens

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation (cards) |
| `shadow-md` | Moderate elevation (dropdowns) |
| `shadow-lg` | High elevation (modals) |
| `shadow-even` | Uniform shadow (floating elements) |

### Depth Rules

1. **Use semantic shadows** — Never custom box-shadow
2. **Elevation hierarchy** — Higher = more shadow
3. **Dark mode aware** — Shadows adjust automatically
4. **Sparingly applied** — Not everything needs shadow

---

## Interaction States

### Button States

| State | Visual | Cursor |
|-------|--------|--------|
| Default | Base variant | pointer |
| Hover | Brightness/opacity shift | pointer |
| Active | Further shift | pointer |
| Disabled | 50% opacity | not-allowed |
| Loading | Spinner + disabled | wait |

### Focus States

- All interactive elements must have visible focus rings
- Use `focus-visible:ring-2 focus-visible:ring-ring`
- Never remove focus styles for aesthetics

### Error States

- Red border on invalid inputs
- Error message below field (not tooltip)
- Clear explanation + how to fix
- Preserve user input on validation failure

---

## Animation Standards

### Timing

| Token | Duration | Usage |
|-------|----------|-------|
| `duration-fast` | 100ms | Micro-interactions |
| `duration-normal` | 200ms | Standard transitions |
| `duration-slow` | 300ms | Page transitions |

### Easing

| Token | Curve | Usage |
|-------|-------|-------|
| `ease-out` | Standard | Most animations |
| `ease-out-expo` | Dramatic | Emphasis |
| `ease-in-out` | Symmetric | Looping |

### Animation Rules

1. **Purposeful motion** — Animation should communicate, not decorate
2. **Reduce motion** — Respect `prefers-reduced-motion`
3. **Consistent timing** — Same elements animate the same way
4. **Performance** — GPU-accelerated properties only (transform, opacity)

---

## Accessibility Standards

### Minimum Requirements

- **Color contrast:** WCAG AA (4.5:1 text, 3:1 UI)
- **Keyboard navigation:** All interactive elements focusable
- **Screen readers:** Semantic HTML + ARIA labels
- **Touch targets:** Minimum 44x44px
- **Error messages:** Associated with inputs

### ARIA Patterns

- Use semantic HTML first (`<button>`, `<a>`, `<nav>`)
- Add ARIA only when semantic HTML isn't sufficient
- Test with screen reader before shipping

---

## Design Review Process

### Red/Yellow/Green Classification

| 🔴 Red (Blocking) | 🟡 Yellow (Warning) | 🟢 Green (Pass) |
|-------------------|---------------------|-----------------|
| Hardcoded colors | Unusual spacing | All tokens used |
| Custom button | New component pattern | Existing components |
| No focus states | Minor hierarchy issue | Accessible |
| Broken in dark mode | Edge case not covered | Theme-aware |

### Review Checklist

- [ ] Uses existing components from ui/
- [ ] Colors are semantic tokens
- [ ] Spacing follows scale
- [ ] Focus states visible
- [ ] Works in light AND dark mode
- [ ] Error states defined
- [ ] Loading states defined
- [ ] Empty states defined
- [ ] Keyboard accessible
- [ ] Mobile responsive

---

## Migration Guide

### Converting Rogue Components

**Before (Rogue):**
```tsx
<button 
  style={{ backgroundColor: '#5B5FC7', padding: '10px 20px' }}
  onClick={handleClick}
>
  Submit
</button>
```

**After (Componentized):**
```tsx
<Button variant="default" onClick={handleClick}>
  Submit
</Button>
```

### Converting Hardcoded Values

**Before:**
```tsx
<div className="p-[17px] bg-[#f8f8f8] text-[#333]">
```

**After:**
```tsx
<div className="p-4 bg-muted text-foreground">
```

---

## Resources

### Reference Files

- Token definitions: `web/design-tokens/`
- Button variants: `web/src/components/ui/button.tsx`
- Component library: `web/src/components/ui/`
- Storybook: `npm run storybook -w web`

### External Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Open Design Questions

1. **New component variants** — What's the process for proposing new button variants?
2. **Exception handling** — How do we document legitimate exceptions to rules?
3. **Dark mode priority** — Which do we design first, light or dark?
4. **Responsive breakpoints** — What are our standard breakpoints?
