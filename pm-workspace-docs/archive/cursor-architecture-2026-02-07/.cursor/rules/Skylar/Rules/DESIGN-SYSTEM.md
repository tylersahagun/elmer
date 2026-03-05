# AskElephant Design System Reference

**Direction:** Sophistication & Trust
**Source of truth:** `elephant-ai/apps/web/src/index.css`

> When the design system and this document disagree, the CSS source file wins. This document is a designer-friendly reference, not a replacement for the live code.

---

## Colors

### Semantic Color Tokens

These are the colors you should reference by name. They automatically adapt for dark mode.

| Token | Light Mode | Dark Mode | When to use |
|---|---|---|---|
| `background` | Near-white `hsl(0 0% 98%)` | Deep navy `hsl(222.2 84% 4.9%)` | Page backgrounds |
| `foreground` | Near-black `hsl(222.2 84% 4.9%)` | Near-white `hsl(210 40% 98%)` | Primary body text |
| `primary` | Indigo blue `hsl(240 86% 49%)` | Same indigo | Primary actions, links, brand accent |
| `primary-light` | Soft lavender `hsl(250.91 78.57% 94.51%)` | -- | Light primary backgrounds |
| `primary-dark` | Near-black `hsl(0 0% 9%)` | Near-white `hsl(0 0% 98%)` | Default button background |
| `secondary` | Light gray `hsl(210 40% 96.1%)` | Dark gray `hsl(217.2 32.6% 17.5%)` | Secondary buttons, subtle backgrounds |
| `muted-foreground` | Medium gray `hsl(0 0% 50%)` | Muted blue-gray `hsl(215 20.2% 65.1%)` | De-emphasized text, captions |
| `destructive` | Red-600 | Darker red `hsl(0 62.8% 30.6%)` | Delete actions, errors |
| `destructive-light` | Red-100 | -- | Error state backgrounds |
| `warning` | Amber `hsl(35 90% 50%)` | Same amber | Warnings, at-risk states |
| `warning-light` | Soft peach `hsl(31.43 91.3% 95.49%)` | -- | Warning backgrounds |
| `success` | Green-600 | -- | Success confirmations |
| `success-light` | Green-100 | -- | Success backgrounds |
| `border` | Light blue-gray `hsl(214.3 31.8% 91.4%)` | Dark gray `hsl(217.2 32.6% 17.5%)` | All borders |
| `card` | Pure white `hsl(0 0% 100%)` | Deep navy `hsl(222.2 84% 4.9%)` | Card surfaces |
| `hyperlink` | Blue `hsl(221 83% 53%)` | -- | Link text |
| `ring` | Indigo `hsl(240 86% 49%)` | Same | Focus rings on interactive elements |

### Status Colors

Use these for badges, alerts, and status indicators:

| Status | Text color | Background | Border | When to use |
|---|---|---|---|---|
| Success | `emerald-600/700` | `emerald-50/100` | `emerald-200` | Completed, healthy, positive |
| Warning | `amber-600` | `amber-50` | `amber-200` | At-risk, needs attention |
| Error | `destructive` token | `destructive-light` token | -- | Failed, broken, critical |
| Info | `blue-600` | `blue-50` | `blue-200` | Informational, neutral |

### Badge Palette

For categorical badges (tags, labels, categories):

```
rose, orange, yellow, lime, green, teal, blue, indigo, fuchsia, purple, stone
```

Pattern: `bg-{color}-50 text-{color}-600` (light mode)

### Privacy Colors

| Privacy level | Text | Background |
|---|---|---|
| Public | `teal-700` | `teal-50` |
| Private | `purple-600` | `purple-50` |

### Colors to NEVER Use

- Hardcoded hex values like `#6366f1` -- always use semantic tokens
- Raw Tailwind colors like `text-red-500` for errors -- use `text-destructive`
- Arbitrary color values like `text-[#custom]`

---

## Typography

### Font Families

| Font | Usage |
|---|---|
| **Inter** | Everything -- body, headers, labels, buttons |
| **JetBrains Mono** | Code blocks, monospace content only |

### Type Scale

| Variant | Size | Tailwind classes | Usage |
|---|---|---|---|
| h1 | 36px / 48px on large screens | `text-4xl font-extrabold tracking-tight lg:text-5xl` | Page titles only |
| h2 | 30px | `text-3xl font-semibold tracking-tight` | Section headers |
| h3 | 24px | `text-2xl font-semibold tracking-tight` | Card titles |
| h4 | 20px | `text-xl font-semibold tracking-tight` | Subsection headers |
| lead | 20px | `text-xl` | Introductory paragraphs |
| large | 18px | `text-lg font-medium` | Emphasized body |
| body | 14px | `text-sm` | Primary content (this is the default) |
| small | 12px | `text-xs` | Secondary content, badges |
| extraSmall | 10px | `text-[10px]` | Captions, timestamps |
| tiny | 10px | `text-[10px] font-regular` | Smallest readable text |

### Weight Patterns

| Weight | Tailwind | Where it appears |
|---|---|---|
| Extrabold (800) | `font-extrabold` | h1 only |
| Semibold (600) | `font-semibold` | h2, h3, h4 headers |
| Medium (500) | `font-medium` | Labels, emphasized text |
| Normal (400) | `font-normal` | Body text |

### Muted Text

Use `text-muted-foreground` for de-emphasized content like descriptions, timestamps, and helper text. Never use raw grays.

---

## Spacing

### The Grid

**Base unit: 4px.** All spacing should be a multiple of 4px.

| Token | Value | Tailwind | When to use |
|---|---|---|---|
| xs | 4px | `p-1`, `gap-1` | Icon padding, tightest gaps |
| sm | 8px | `p-2`, `gap-2` | Standard inline gaps, form label-to-input |
| md | 12px | `p-3`, `gap-3` | Component internal padding |
| lg | 16px | `p-4`, `gap-4` | Card padding, section gaps |
| xl | 24px | `p-6`, `gap-6` | Page sections, header padding |
| 2xl | 32px | `p-8`, `gap-8` | Page margins, largest gaps |

### Common Spacing Patterns

| Pattern | Spacing | Tailwind |
|---|---|---|
| Card internal padding | 24px all sides | `p-6` |
| Card header to content | 6px | `space-y-1.5` |
| Card content (no top pad) | 24px sides/bottom, 0 top | `p-6 pt-0` |
| Section vertical rhythm | 16-32px | `space-y-4` to `space-y-8` |
| Form field spacing | 8px between label and input | `space-y-2` |
| Inline element gaps | 8px | `gap-2` |
| Icon to text gap | 8px | `gap-2` |

### Spacing to NEVER Use

- Arbitrary values like `p-[13px]` -- stick to the 4px grid
- Inconsistent spacing within the same component
- Pixel values outside the scale (5px, 7px, 9px, etc.)

---

## Border Radius

| Size | Value | Tailwind | Usage |
|---|---|---|---|
| sm | 4px (radius - 4px) | `rounded-sm` | Small badges, tight containers |
| md | 6px (radius - 2px) | `rounded-md` | Buttons, inputs, badges |
| lg | 8px (radius) | `rounded-lg` | Cards, dialogs |
| full | 50% | `rounded-full` | Avatars, circular buttons, pills |

---

## Depth & Elevation

### Shadow Scale

| Shadow | Tailwind | Usage |
|---|---|---|
| Subtle | `shadow-sm` | Cards, dropdowns (default for most surfaces) |
| Elevated | `shadow-lg` | Modals, popovers, elevated panels |

### Card Surface Pattern

Cards always use both border AND shadow:

```
border bg-card shadow-sm
```

Never use shadow without border, or border without shadow on cards.

---

## Component Heights

| Component | Height | Tailwind |
|---|---|---|
| Button (default) | Auto (padding-based) | `px-4 py-2` |
| Button (small) | 32px | `h-8` |
| Button (large) | 40px | `h-10` |
| Button (icon only) | 32px | `h-8` |
| Input | 30px | `h-input-height` |
| Badge (small) | ~20px | `px-1.5 py-0.5` |
| Badge (medium) | ~24px | `px-2 py-0.5` |

---

## Button Variants

| Variant | Appearance | When to use |
|---|---|---|
| **default** | Dark background, light text | Primary page actions |
| **primary-blue** | Indigo background, white text | Brand-accent actions, CTAs |
| **outline** | Transparent with border | Secondary actions alongside a primary button |
| **secondary** | Light gray background | Tertiary actions, less emphasis |
| **ghost** | Transparent, no border | Toolbar actions, minimal presence |
| **destructive** | Red background, white text | Delete, remove, dangerous actions |
| **destructive-ghost** | Red text only | Subtle destructive actions |
| **link** | Underlined text | Inline text actions |

---

## Icons

Using **lucide-react** for standard icons and `@/components/icons` for brand icons.

| Context | Size | Tailwind |
|---|---|---|
| Inline with body text (14px) | 16px | `h-4 w-4` |
| Inline with small text (12px) | 12px | `h-3 w-3` |
| Standalone button icons | 16-20px | `h-4 w-4` to `h-5 w-5` |
| Feature/hero icons | 20-32px | `h-5 w-5` to `h-8 w-8` |

---

## Interactive States

### Buttons

| State | Behavior |
|---|---|
| Hover | Color shift (typically `/90` opacity or brightness change) |
| Focus | `focus-visible:ring-1 focus-visible:ring-ring` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Active | Slight scale or brightness reduction |

### Cards (Selectable)

| State | Behavior |
|---|---|
| Default | `border-border` |
| Hover | `hover:border-primary/50` |
| Selected | `border-primary bg-primary/5` |

### All Interactive Elements

Every interactive element MUST have:
- Visible focus ring (`focus-visible:ring-*`)
- Hover state with `transition-colors`
- Disabled state with reduced opacity

---

## Animation

### Transition Tokens

| Token | Value | Usage |
|---|---|---|
| `--duration-550` | 550ms | Standard transition duration |
| `--ease-out-expo` | `cubic-bezier(0.46, 0.7, 0.41, 1)` | Smooth deceleration |

### Loading Animations

| Animation | Tailwind | Usage |
|---|---|---|
| Spin | `animate-spin` | Loading spinners |
| Pulse | `animate-pulse` | Skeleton loading |
| Shimmer | `animate-shimmer` | Content loading placeholder |

### Motion Principles

- Color changes: `transition-colors`
- Layout shifts: `transition-transform`
- Always respect `prefers-reduced-motion`
- Animations should feel purposeful, not decorative

---

## Component Patterns

### Card Anatomy

```
Card (border + bg-card + shadow-sm + rounded-lg)
  CardHeader (p-6, space-y-1.5)
    CardTitle (text-sm font-semibold)
    CardDescription (text-xs text-muted-foreground)
  CardContent (p-6 pt-0)
    [Content]
  CardFooter (optional, flex items-center p-6 pt-0)
```

### Form Section Anatomy

```
section (space-y-4)
  h2 (text-sm font-medium text-muted-foreground uppercase tracking-wider)
    "Section Title"
  [Form fields with space-y-2 between label and input]
```

### Status Badge Pattern

```
Low risk:    bg-emerald-50 text-emerald-700 border-emerald-200
Medium risk: bg-amber-50 text-amber-700 border-amber-200
High risk:   bg-rose-50 text-rose-700 border-rose-200
```

### Dialog Pattern

Dialogs use the same surface tokens as popovers:
- Background: `bg-popover`
- Text: `text-popover-foreground`
- Overlay: semi-transparent black backdrop

---

## Anti-Patterns (What to NEVER Do)

1. **Off-grid spacing** -- No arbitrary values like `p-[13px]`. Use the 4px grid.
2. **Mixed depth strategy** -- Don't use borders on some cards and shadows on others. Cards always get both.
3. **Hardcoded colors** -- Use CSS variable tokens, never hex values or raw Tailwind colors for semantic meaning.
4. **Inconsistent heights** -- Buttons in the same group must match. Don't mix small and default.
5. **Missing transitions** -- Every interactive element needs `transition-colors` or `transition-transform`.
6. **Forgotten focus states** -- Every clickable/tappable element needs `focus-visible:ring-*`.
7. **Raw grays for text** -- Use `text-muted-foreground` not `text-gray-500`.
8. **Inline styles** -- Never use `style={}` attributes. Everything goes through Tailwind.
