# Design Brief: Release Lifecycle Process

## Overview

Design work to support the release lifecycle process, including the self-serve beta toggle UI, stage badges, and internal dashboards.

**Related PRD:** [prd.md](./prd.md)  
**Status:** Not Started  
**Type:** UI/UX Design  
**Priority:** P1

---

## Design Goals

1. **Discoverability:** Users can easily find and understand beta features
2. **Clarity:** Feature maturity is immediately obvious (badge system)
3. **Control:** Users feel empowered to try new things, not pushed
4. **Trust:** Clear expectations prevent disappointment

---

## Component 1: Beta Features Settings Panel

### Location

Settings → Beta Features (new section/tab)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                                      │
├─────────────────────────────────────────────────────────────────┤
│ Profile │ Workspace │ Integrations │ [Beta Features]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🧪 Beta Features                                               │
│  ─────────────────                                              │
│  Try new features before they're released to everyone.          │
│  Beta features may change or be removed.                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟡 Beta   Auto-Tagging V2                         [ON ] │   │
│  │           Automatically tag meetings based on content    │   │
│  │           Learn more →                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔷 Alpha  Internal Search                         [OFF] │   │
│  │           Search across all your meetings and contacts   │   │
│  │           Learn more →                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟡 Beta   Global Chat                             [OFF] │   │
│  │           Chat with AskElephant from anywhere in the app │   │
│  │           Learn more →                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Feature Card Anatomy

```
┌───────────────────────────────────────────────────────────────┐
│ [Badge]  Feature Name                              [Toggle]   │
│          Description text (1-2 lines max)                     │
│          Learn more →                                          │
└───────────────────────────────────────────────────────────────┘
```

| Element      | Specs                                    |
| ------------ | ---------------------------------------- |
| Badge        | Pill, left of name (🔷 Alpha / 🟡 Beta)  |
| Feature Name | Bold, 16px                               |
| Description  | Gray, 14px, 2 lines max with ellipsis    |
| Learn More   | Link to KB article, 12px                 |
| Toggle       | Right-aligned, standard switch component |

### States

| State          | Visual                                                   |
| -------------- | -------------------------------------------------------- |
| Default        | Cards visible, toggles show current state                |
| Loading        | Skeleton cards                                           |
| Empty          | "No beta features available right now. Check back soon!" |
| Error          | Error message + retry button                             |
| Toggle loading | Spinner on toggle only                                   |

### Interactions

- **Toggle ON:** Immediate effect, toast confirmation
- **Toggle OFF:** Immediate effect, toast confirmation
- **Learn More:** Opens KB article in new tab or modal

---

## Component 2: Stage Badge System

### Badge Variants

| Stage | Badge      | Color        | Use Case                 |
| ----- | ---------- | ------------ | ------------------------ |
| Alpha | `🔷 Alpha` | Blue         | Internal testing only    |
| Beta  | `🟡 Beta`  | Amber/Yellow | Invite-only or open beta |
| GA    | None       | —            | No badge, default state  |

### Badge Specs

```
┌──────────────┐
│ 🟡 Beta      │  ← Pill shape, rounded-full
└──────────────┘
   │
   ├─ Background: amber-100 (light mode) / amber-900 (dark mode)
   ├─ Text: amber-800 (light mode) / amber-100 (dark mode)
   ├─ Font: 12px, medium weight
   ├─ Padding: 4px 8px
   └─ Icon: Emoji or custom icon (16px)
```

### Badge Placement

| Location        | When to Show                    | Size    |
| --------------- | ------------------------------- | ------- |
| Settings panel  | Always for beta features        | Default |
| Navigation item | When beta feature adds nav item | Small   |
| Page header     | When entering beta feature area | Default |
| Tooltip         | On hover over beta UI elements  | Tooltip |

### Hover Behavior

Badge on hover shows tooltip:

> "**Beta Feature**  
> This feature is in testing. Some things may change.  
> [Give Feedback]"

---

## Component 3: Toast Notifications

### Enable Toast

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Auto-Tagging V2 enabled                                  │
│    Look for the Beta badge in Settings → Tags               │
│                                              [View Feature] │
└─────────────────────────────────────────────────────────────┘
```

### Disable Toast

```
┌─────────────────────────────────────────────────────────────┐
│ Auto-Tagging V2 disabled                                    │
│    You can re-enable anytime in Settings → Beta Features    │
└─────────────────────────────────────────────────────────────┘
```

### Toast Specs

- Duration: 5 seconds (or until dismissed)
- Position: Bottom-right
- Action: Optional "View Feature" link

---

## Component 4: First-Time Discovery

When user first sees a beta feature in the UI (after enabling):

### Option A: Pulse Animation

- Subtle pulse on new beta feature nav item/button
- Clears after first click

### Option B: Tooltip Callout

```
         ┌─────────────────────────┐
         │ 🟡 New! Auto-Tagging   │
         │ is now enabled.        │
         │ [Got it]               │
         └─────────────────────────┘
                    │
                    ▼
            [Auto-Tagging Tab]
```

### Recommendation

Start with Option A (less intrusive). Add Option B if discovery is low.

---

## Component 5: Internal Release Dashboard (P2)

### Purpose

Internal tool for Product/Engineering to track features by stage.

### Layout Concept

```
┌─────────────────────────────────────────────────────────────────┐
│ Release Status Dashboard                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🔷 Alpha (3)       🟡 Invite-only (5)  🟡 Open Beta (8) ✅ GA    │
│ ──────────         ───────────         ──────────     ──────    │
│ Process Agent      Privacy Agent       Auto-Tag V2    Folders   │
│ 45 days left       12 days left        67 days left   ✓         │
│ ...                ...                 ...                       │
│                                                                  │
│ ⚠️ TTL Warnings (2 features approaching deadline)               │
│ ─────────────────────────────────────────────────               │
│ • Privacy Agent (Alpha) - 12 days remaining                     │
│ • Notion Integration (Beta) - 8 days remaining                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Priority

P2 - Nice to have for Phase 1. Can use PostHog directly initially.

---

## Accessibility Considerations

### Badge Accessibility

- [ ] Not color-only: includes text label
- [ ] Sufficient contrast (WCAG AA)
- [ ] Screen reader friendly: "Beta feature" announced

### Toggle Accessibility

- [ ] Proper ARIA labels: "Enable Auto-Tagging V2 beta feature"
- [ ] Focus states visible
- [ ] Keyboard navigable (Tab + Space to toggle)

### Motion

- [ ] Respect `prefers-reduced-motion` for pulse animations
- [ ] Toast duration sufficient for reading

---

## Design References

### Internal

- Existing toggle switches in Settings
- Existing toast notification system
- Existing navigation patterns

### External Inspiration

| Company    | What to Reference                |
| ---------- | -------------------------------- |
| **GitHub** | Feature Preview settings panel   |
| **Linear** | Labs section, badge styling      |
| **Figma**  | Beta badge treatment in UI       |
| **Arc**    | Labs tab, experimental messaging |

---

## Deliverables

| Deliverable                  | Priority | Status      | Notes                   |
| ---------------------------- | -------- | ----------- | ----------------------- |
| Beta Features settings panel | P0       | Not started | Main UI                 |
| Stage badge component        | P0       | Not started | Reusable                |
| Toast patterns               | P1       | Not started | Enable/disable feedback |
| Feature card component       | P0       | Not started | For settings panel      |
| First-time discovery         | P2       | Not started | Pulse or tooltip        |
| Internal dashboard           | P2       | Deferred    | Use PostHog initially   |

---

## Open Design Questions

1. **Tab vs. section:** New tab in Settings or section within existing?
2. **Badge icon:** Emoji (🟡) vs. custom icon vs. text-only?
3. **Empty state:** Illustration or just text?
4. **Mobile:** How does beta toggle work in mobile app?
5. **Dark mode:** Confirm badge colors work in both themes

---

## Success Criteria

- Users can find Beta Features settings in <10 seconds
- Users understand badge meaning without explanation
- Toggle action feels immediate and confident
- Badge is visible but not distracting in feature areas

---

_Design Owner: TBD_  
_Last Updated: January 13, 2026_
