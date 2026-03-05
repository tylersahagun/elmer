# Design Brief: Meeting Summary

**Initiative:** Meeting Summary
**Parent:** Chief of Staff Experience
**Owner:** Tyler Sahagun
**Phase:** Define
**Placement:** Embedded in engagement detail page — new tab in ChatsTabs
**Component Location:** `components/engagements/meeting-summary/`
**Prototype:** `elephant-ai/apps/web/src/components/prototypes/ChiefOfStaff/MeetingSummary/` (v2 current)

---

## Prototype Iteration: v2 (2026-02-18)

v2 incorporates Skylar (Design) + Palmer (Engineering) feedback:

- **TLDR at top** — Surface existing `meeting.description` field
- **Full-screen artifact feel** — Borderless sections, dividers instead of cards; `min-h-85vh`
- **Action items actionable** — Checkboxes, completion state, "AskElephant will: [action]" automation badges
- **Edit in chat** — Section edit opens Global Chat slide-out with section/template context pre-seeded
- **Template auto-inferred** — "Auto-detected" badge; user can override
- **Escape the summary** — "Add to deal" affordance on action items
- **Stronger hierarchy** — Section titles `text-base font-semibold`; headers-first layout

See `prototype-notes.md` for full iteration details.

---

## Information Architecture

```
Engagement Detail Page
└── ChatsTabs (tab bar)
    ├── Chat (existing)
    ├── Summary ← NEW (default active when transcript exists)
    │   ├── Summary Header
    │   │   ├── Template picker dropdown
    │   │   ├── Meeting metadata (type, date, participants)
    │   │   └── Actions (Share, Export, Save as Template)
    │   ├── Section Blocks (editable)
    │   │   ├── Section 1 (e.g., Overview)
    │   │   │   ├── Section header (title + collapse toggle)
    │   │   │   ├── Content with evidence links
    │   │   │   └── AI edit affordance (on hover/focus)
    │   │   ├── Section 2 (e.g., Key Discussion Points)
    │   │   ├── Section 3 (e.g., Action Items)
    │   │   └── … (varies by template)
    │   └── Summary Footer
    │       ├── "Save as Template" action
    │       ├── Last edited timestamp
    │       └── Micro-feedback prompt (after 5th view)
    ├── Transcript (existing)
    └── … (other existing tabs)
```

---

## Design Tokens Reference

All components use the AskElephant design system. Key tokens:

| Token                                          | Usage                                                 |
| ---------------------------------------------- | ----------------------------------------------------- |
| `bg-card` / `border-border`                    | Summary container card                                |
| `text-foreground`                              | Primary text (section content)                        |
| `text-muted-foreground`                        | Secondary text (metadata, timestamps)                 |
| `text-sm` (14px)                               | Body text                                             |
| `text-sm font-medium uppercase tracking-wider` | Section headers                                       |
| `text-xs` (12px)                               | Metadata, evidence link labels                        |
| Spacing: 4px grid                              | `gap-4` (16px) between sections, `gap-2` (8px) within |
| `rounded-lg`                                   | Card containers                                       |
| `rounded-md`                                   | Buttons, inputs                                       |
| `shadow-sm` + `border`                         | Card depth                                            |
| `transition-colors`                            | Interactive element hover states                      |

---

## Key Screens & States

### Screen 1: Summary View (Default)

**Purpose:** Primary meeting artifact — the first thing users see after a meeting

**Layout:**

- Full-width within ChatsTabs content area
- Summary header pinned at top with template picker and actions
- Scrollable section blocks below
- Sections stack vertically with 16px gap
- Each section is a card with subtle border and 24px internal padding

**Template Picker (Dropdown):**

- Position: Top-left of summary header, next to meeting metadata
- Trigger: Click to open dropdown
- Options: Discovery, Demo, QBR, 1:1, Internal, General, + saved custom templates (divider between system and custom)
- Current selection shown as label with chevron-down icon
- On selection: brief skeleton loading state while sections re-render (1-3 seconds)
- Width: Auto-fit content, min 160px

**Section Blocks:**

- Each section has: header row (title + collapse/expand chevron), content area, evidence link indicators
- Section header: `text-sm font-medium uppercase tracking-wider text-muted-foreground`
- Section content: `text-sm text-foreground` with standard line-height
- Evidence links: Inline icons (link-2 icon, `h-3 w-3`, `text-muted-foreground`) next to key insights
- Action items render as checkbox-style list items within their section

**Actions Bar:**

- Position: Top-right of summary header
- Buttons: Share (primary), more menu (Save as Template, Export, Edit History)
- Share button: `Button variant="default"` (filled primary)
- More menu: `DropdownMenu` with icon trigger (MoreHorizontal, `h-4 w-4`)

### Screen 2: Template Picker (Expanded)

**Purpose:** Select meeting-type format

**Behavior:**

- Standard shadcn `Select` dropdown component
- Options grouped: "Meeting Types" (system templates), "My Templates" (saved custom)
- Each option shows: template name + brief description (e.g., "Discovery — Pain points, qualification, next steps")
- Hover state: `bg-accent` background
- Selected state: Check icon + `text-accent-foreground`
- Keyboard: Arrow keys navigate, Enter selects, Escape closes

### Screen 3: Section AI Edit

**Purpose:** Rewrite a specific section with AI assistance

**Trigger:** Hover over section → "Rewrite with AI" button fades in (top-right of section)

- Button: Ghost variant, small size, sparkles icon + "Rewrite" label
- Position: Absolute top-right of section card, offset by 8px

**Inline Edit Panel (expanded below section):**

- Appears directly below the section being edited (pushes content down, does not overlay)
- Background: `bg-muted` with subtle border-top
- Prompt input: Text input with placeholder "How should this section be rewritten?"
- Quick suggestion chips: "More concise", "Add bullet points", "Focus on actions" — pill-shaped, `text-xs`, `bg-secondary`
- Submit: "Rewrite" button (primary, small) + keyboard shortcut hint (Cmd+Enter)

**Preview State:**

- Section content shows diff: additions highlighted with `bg-green-50` (light) / `bg-green-950` (dark), removals with `bg-red-50` / `bg-red-950`
- Two action buttons: "Apply" (primary), "Discard" (ghost)
- Applied change: smooth transition from diff to clean content

**Loading State:**

- Section shows shimmer animation during AI processing
- Rest of summary remains interactive (non-blocking)
- If >5 seconds: "Working on your rewrite…" message with cancel option

### Screen 4: Evidence Display

**Purpose:** Show source quotes for AI-extracted insights

**Trigger:** Click evidence link icon next to an insight

**Behavior (Tooltip / Popover):**

- `Popover` component anchored to the evidence icon
- Width: 320px max
- Content: Source quote in `text-sm italic`, speaker name in `text-xs font-medium`, timestamp link in `text-xs text-muted-foreground`
- "View in transcript" link at bottom navigates to transcript tab with timestamp scroll
- "Flag inaccurate" subtle link for trust feedback

**Why tooltip/popover (not sidebar):**

- Keeps user in summary context
- Lower cognitive load than panel switch
- Multiple evidence links can be checked in sequence without layout shift

### Screen 5: Share with Privacy Check

**Purpose:** Share summary with privacy compliance

**Trigger:** Click "Share" button

**Behavior (Dialog):**

- `Dialog` component (modal), 480px width
- Header: "Share Meeting Summary"
- Privacy notice: Card with warning icon — "This summary contains content from a recorded meeting. Confirm you have permission to share."
- If external participants detected: Additional amber warning: "This meeting included external participants. Review content carefully."
- Section selection: Checklist of sections to include (all checked by default)
- Share method: Button group — Copy Link, Email, Slack
- Confirm button: "Share" (primary) — disabled until privacy acknowledgment checkbox is checked
- Cancel: Ghost button

### Screen 6: Save as Template

**Purpose:** Persist current summary format as reusable template

**Trigger:** "Save as Template" from actions menu

**Behavior (Dialog):**

- `Dialog` component, 400px width
- Header: "Save as Template"
- Template name: Pre-filled text input with meeting type (e.g., "My Discovery Template")
- Meeting type association: Select dropdown (which meeting type does this apply to?)
- Description: Optional textarea
- Confirm: "Save Template" (primary)
- Success toast: "Template saved. Future [type] summaries will use this format."

---

## States

### Loading State

- **Skeleton:** Progressive section reveal — sections appear top-to-bottom with shimmer animation
- **Structure:** Template picker shows as skeleton rectangle; each section shows as card with 3 shimmer lines
- **Timing:** First section appears within 500ms; all sections within 2 seconds
- **Interaction:** Template picker interactive immediately (user can switch while loading)

### Empty State

- **No transcript:** Card with `FileText` icon (muted), heading "Summary not available yet", body "This meeting hasn't been processed yet. We'll generate a summary once the transcript is ready.", and estimated time if available
- **No recording:** Card with `MicOff` icon, heading "No recording available", body "This meeting wasn't recorded. Summaries require a meeting recording."
- **Layout:** Centered in content area with 48px top padding

### Error State

- **Generation failed:** Card with `AlertTriangle` icon (destructive), heading "Couldn't generate summary", body "Something went wrong while creating this summary.", actions: "Try Again" (primary button) + "View Transcript" (ghost link)
- **Network error:** Similar card with "Check your connection and try again"
- **Layout:** Same centered placement as empty state

### Editable State (Active)

- **Visual cue:** Subtle edit mode indicator — top bar shows "Editing" badge with dot indicator
- **Section hover:** Section card gets `ring-1 ring-ring` on hover to indicate editability
- **Active section:** Section being edited shows `ring-2 ring-primary` border
- **Unsaved changes:** "Unsaved changes" pill in header bar; "Save" button becomes primary

---

## Interaction Specifications

### Mouse/Pointer

| Element                  | Hover                                                        | Click                                | Long Press |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------ | ---------- |
| Template picker          | Subtle background change                                     | Open dropdown                        | —          |
| Section card             | `ring-1 ring-ring` border, "Rewrite with AI" button fades in | — (sections are not clickable)       | —          |
| "Rewrite with AI" button | Standard button hover                                        | Open inline edit panel               | —          |
| Evidence link icon       | Tooltip preview (truncated quote)                            | Open full evidence popover           | —          |
| Quick suggestion chip    | Background darken                                            | Submit rewrite with that instruction | —          |
| Section content text     | Text cursor for inline editing                               | Place cursor for manual edit         | —          |
| Share button             | Standard button hover                                        | Open share dialog                    | —          |

### Keyboard

| Key           | Context                     | Action                                  |
| ------------- | --------------------------- | --------------------------------------- |
| Tab           | Summary view                | Navigate between sections, then actions |
| Enter         | Template picker focused     | Open/close dropdown                     |
| Arrow Up/Down | Template dropdown open      | Navigate options                        |
| Escape        | Any dialog/dropdown/popover | Close                                   |
| Cmd+E         | Section focused             | Open AI edit panel                      |
| Cmd+Enter     | Edit panel, text entered    | Submit rewrite                          |
| Cmd+S         | Unsaved changes exist       | Save all changes                        |
| Cmd+Z         | After applying AI edit      | Undo last edit                          |

### Touch (Tablet/Mobile)

| Element         | Tap                                                         | Swipe |
| --------------- | ----------------------------------------------------------- | ----- |
| Section card    | Tap to reveal edit toolbar (persistent until tap elsewhere) | —     |
| Evidence link   | Tap to open popover                                         | —     |
| Template picker | Tap to open (native select on mobile)                       | —     |
| Section content | Tap to enter edit mode                                      | —     |

---

## Responsive Behavior

### Desktop (≥1280px)

- Summary fills full ChatsTabs content width
- Template picker and actions on same header row
- Evidence popovers anchor to link icons
- 24px section padding

### Tablet (768px–1279px)

- Summary fills available width
- Template picker and actions remain on same row (may wrap at narrow tablet)
- Evidence popovers remain anchored, max-width constrained
- 20px section padding

### Mobile (≤767px)

- Summary fills full width with 16px horizontal padding
- Template picker: Full-width select (native mobile dropdown)
- Actions: Stacked or collapsed into single "Actions" menu
- Evidence links: Tap opens popover; popover displays as bottom sheet on small screens
- Section AI edit: Edit panel is full-width below section
- 16px section padding

---

## Dark Mode Considerations

All colors use semantic tokens — dark mode is automatic. Specific considerations:

- **Evidence popover:** `bg-popover` / `text-popover-foreground` — no hardcoded colors
- **AI edit diff:** Green/red diff colors use theme-aware tokens: `bg-green-50` → `bg-green-950` in dark, `bg-red-50` → `bg-red-950` in dark
- **Skeleton shimmer:** Uses `bg-muted` animated pulse — adapts to dark automatically
- **Section hover ring:** `ring-ring` token adapts to both modes
- **Evidence link icons:** `text-muted-foreground` provides sufficient contrast in both modes (verify 4.5:1 ratio)

---

## Accessibility Requirements

- **Focus management:** All interactive elements have visible focus rings (`ring-2 ring-ring ring-offset-2`)
- **Keyboard navigation:** Full keyboard access for all flows (template switch, AI edit, share, evidence)
- **Screen reader:** Section headers use proper heading hierarchy (h3 within summary container); evidence links have `aria-label` describing the source; AI edit state changes announced via `aria-live` region
- **Color contrast:** All text meets WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text)
- **Motion:** Skeleton animation and transitions respect `prefers-reduced-motion`; if reduced, skeleton shows static placeholder
- **Labels:** Template picker has `aria-label="Select meeting type template"`; Share dialog has proper dialog semantics with `role="dialog"` and `aria-modal`

---

## Animation & Transition Specifications

| Element                              | Animation                                     | Duration                            | Easing      |
| ------------------------------------ | --------------------------------------------- | ----------------------------------- | ----------- |
| Template switch (sections re-render) | Fade out old → skeleton shimmer → fade in new | 300ms fade + load time + 200ms fade | ease-in-out |
| AI edit panel open                   | Slide down + fade in                          | 200ms                               | ease-out    |
| AI edit panel close                  | Slide up + fade out                           | 150ms                               | ease-in     |
| AI rewrite loading                   | Shimmer pulse on section                      | 1.5s loop                           | linear      |
| AI rewrite diff → apply              | Diff colors fade, text transitions            | 300ms                               | ease-in-out |
| Evidence popover                     | Scale from 0.95 + fade in                     | 150ms                               | ease-out    |
| Share dialog                         | Standard Radix dialog animation               | 200ms                               | spring      |
| Section hover ring                   | Border-color transition                       | 150ms                               | ease        |
| "Rewrite with AI" button appear      | Opacity 0→1                                   | 150ms                               | ease-in     |
| Toast notifications                  | Slide in from bottom-right                    | 200ms                               | ease-out    |

---

## Component Inventory

New components to create in `components/engagements/meeting-summary/`:

| Component              | Purpose                                      | Dependencies                 |
| ---------------------- | -------------------------------------------- | ---------------------------- |
| `MeetingSummary`       | Root container; orchestrates tab content     | ChatsTabs integration        |
| `SummaryHeader`        | Template picker, metadata, actions           | Select, DropdownMenu, Button |
| `SummarySection`       | Individual section card with edit affordance | Card, Button, Popover        |
| `SummarySectionEdit`   | Inline AI edit panel with prompt + preview   | Input, Button, diff display  |
| `TemplatePickerSelect` | Meeting-type template dropdown               | Select (shadcn)              |
| `EvidencePopover`      | Source quote display for evidence links      | Popover (shadcn)             |
| `ShareDialog`          | Privacy check + share method selection       | Dialog, Checkbox, Button     |
| `SaveTemplateDialog`   | Name and save current format                 | Dialog, Input, Select        |
| `SummarySkeleton`      | Loading state with progressive reveal        | Skeleton (shadcn)            |
| `SummaryEmpty`         | Empty/no-transcript state                    | Card, icons                  |
| `SummaryError`         | Error state with retry                       | Card, Button, icons          |

Existing components to modify:

| Component              | Change                                                    |
| ---------------------- | --------------------------------------------------------- |
| `ChatsTabs`            | Add "Summary" tab; make it default when transcript exists |
| Engagement detail page | Pass summary data to new tab                              |

---

## Non-Goals

- Rebuilding workflow engine internals
- Generic transcript-only note output
- Full re-generation of historical meetings on template change (scope for later)
- Team-level template library (requires admin UX — v2)
- Custom section types (v1 uses template-defined sections only)

---

_Last updated: 2026-02-18_
