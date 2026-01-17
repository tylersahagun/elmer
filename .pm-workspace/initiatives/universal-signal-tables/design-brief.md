# Design Brief: Universal Signal Tables

## Overview

Create an AI-powered table interface that lets sales leaders explore engagement data through custom AI columns. The experience should feel like a "flashlight in the dark" — enabling exploration without requiring expertise.

**Key design mandate from leadership:**
> "Our version cannot scare people. That should be a banner." — Woody Klemetson, CEO

---

## Design Principles

### 1. Simple Until You Need More
Progressive disclosure. Start with the simplest possible table; complexity only appears when requested.

### 2. Show AI's Work
Trust through transparency. Users should see what AI is doing, not just results.

> "When I use the Cursor plan agent and it shows me a flowchart, then I review the plan... I have to understand it." — Woody

### 3. Exploration > Configuration
Design for wandering, not destination. Users often don't know their question yet.

### 4. Cost-Conscious by Default
Guide users toward efficient patterns (conditional execution) without requiring them to understand token economics.

---

## User Flow

### Entry Points

1. **Nav item:** "Tables" in main navigation (new)
2. **Chat prompt:** "I want to analyze my calls" → Creates new table
3. **Engagement list:** "Create table from these" action

### Primary Flow: New Table Creation

```
┌─────────────────────────────────────────────────────────────┐
│  1. START                                                    │
│  ┌─────────────┐                                            │
│  │ New Table   │  or  💬 "I want to see which competitors   │
│  │   button    │       came up in my calls this month"      │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. FILTER (Left Panel)                                     │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │ Date: Last 30 days  │  │ Rep: All / Select reps     │   │
│  │ Type: All calls     │  │ Keywords: (optional)       │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
│                                                             │
│  📊 142 engagements match                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. ADD COLUMNS (Max 5)                                     │
│                                                             │
│  💬 Chat: "Was a competitor mentioned?"                     │
│       → AI creates column: "Competitor Mentioned (Y/N)"     │
│                                                             │
│  or  ➕ Add Column → Choose template or write custom prompt │
│                                                             │
│  Builder shows:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Column 1: Competitor Mentioned                       │    │
│  │ Prompt: "Did any competitor get mentioned? Y/N"     │    │
│  │ [Edit] [Delete]                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Column 2: Which Competitor                          │    │
│  │ Prompt: "If a competitor was mentioned, which one?" │    │
│  │ Depends on: Column 1 = Yes                         │    │
│  │ [Edit] [Delete]                                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. PREVIEW (3-5 sample rows)                               │
│                                                             │
│  "Preview on 5 calls to test your columns"                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Call     │ Rep  │ Competitor? │ Which?             │    │
│  │──────────│──────│─────────────│────────────────────│    │
│  │ Acme Q4  │ Pete │ Yes         │ Gong               │    │
│  │ Beta Ren │ Sara │ No          │ (skipped)          │    │
│  │ ...      │      │             │                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Looks good? Run on all 142 calls]                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. FULL TABLE                                              │
│                                                             │
│  Running... 23/142 complete                                 │
│  (Can background this and come back)                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Full table with all columns populated               │    │
│  │ Sortable, filterable, searchable                   │    │
│  │ Click row → Opens engagement detail                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Save Table] [Export CSV] [Add Column (4/5 remaining)]    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Screens/States

### 1. Empty State (First Time)
- Welcoming, not intimidating
- Clear value proposition: "Answer questions about your calls"
- Start options: Templates, blank table, or describe what you want

### 2. Filter Panel
- Left side, collapsible
- Smart defaults (last 30 days, all reps)
- Live count of matching engagements
- Quick presets: "This week", "This quarter", "My team"

### 3. Chat Interface
- Persistent input at bottom of screen (not modal)
- AI suggestions appear inline
- Can toggle between chat and builder views
- Shows "thinking" state when processing

### 4. Builder Panel
- Collapsible right panel (similar to Cursor)
- Shows all column configurations
- Visual dependencies between columns
- Edit prompt inline
- Drag to reorder

### 5. Table View
- Clean, spreadsheet-like
- Column headers show truncated prompts (hover for full)
- Click row to open engagement detail
- Inline sorting and filtering
- Visual indicator for "skipped" cells (conditional execution)

### 6. Progress State
- Non-blocking (can continue using app)
- Progress bar with estimate
- "Background this" option
- Notification when complete

### 7. Saved Tables List
- Grid or list view
- Shows: Name, date created, last run, column count
- Quick actions: Open, Duplicate, Delete

---

## Interaction Patterns

### Column Creation via Chat
```
User: "I want to know if pricing was discussed"

AI: I'll create a column to detect pricing discussions.
    ┌────────────────────────────────────────┐
    │ Column: Pricing Discussed              │
    │ Type: Yes/No                           │
    │ Prompt: "Was pricing, cost, budget,    │
    │          or payment discussed? Y/N"    │
    │                                        │
    │ [Add Column]  [Modify]                 │
    └────────────────────────────────────────┘
```

### Conditional Column Setup
```
┌────────────────────────────────────────────────┐
│ Column 2: Competitor Details                    │
│                                                │
│ Prompt: What did they say about the competitor? │
│                                                │
│ ⚙️ Execution:                                  │
│ ○ Always run                                   │
│ ● Only run if: [Column 1] = [Yes] ▼           │
│                                                │
│ 💡 This will save ~60% on this column          │
└────────────────────────────────────────────────┘
```

### Template Selection
```
Popular Templates:
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 🎯 Competitors  │ │ 🚧 Objections   │ │ 📅 Next Steps   │
│ Mentioned       │ │ Raised          │ │ Discussed       │
│                 │ │                 │ │                 │
│ 2 columns       │ │ 2 columns       │ │ 3 columns       │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 💰 Budget       │ │ 👤 Decision     │ │ ✨ Custom       │
│ Discussed       │ │ Maker Present   │ │ Start blank     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Edge Cases

### Error States

| State | Display | Recovery |
|-------|---------|----------|
| Extraction fails on some rows | Show ⚠️ icon in cell; "3 rows failed" banner | "Retry failed" button |
| No results match filter | "No engagements match. Try broadening your filters." | Suggest filter changes |
| Column limit reached | "Maximum 5 columns. Remove one to add another." | Highlight remove buttons |
| Token limit reached | "This table is large. Consider narrowing filters." | Show filter suggestions |

### Empty States

| State | Display |
|-------|---------|
| No saved tables | "Create your first table to start exploring" + templates |
| Filter returns 0 | "No engagements match" + filter adjustment suggestions |
| Column returns all empty | "This prompt didn't find anything. Try rewording." |

### Loading States

| State | Display |
|-------|---------|
| Initial load | Skeleton table with animated rows |
| Column extraction | Per-cell spinner; overall progress bar |
| Chat thinking | Typing indicator + "Thinking..." |

---

## Accessibility Considerations

- [ ] Full keyboard navigation for table and builder
- [ ] Screen reader support for table data and column configurations
- [ ] Color contrast meets WCAG AA for all states
- [ ] Focus management when modals/panels open
- [ ] Alternative text for all icons and visual indicators
- [ ] Error messages announced to assistive tech

---

## Design References

### Internal Patterns
- Chat UI: Follow Global Chat patterns (launching ~Jan 9)
- Table styling: Match existing engagement list components
- Builder panel: Similar to workflow builder right panel

### External Inspiration
- **Cursor**: Chat + Builder side-by-side paradigm
- **Notion databases**: Clean table UX with inline editing
- **Linear**: Keyboard-first, fast interactions
- **NOT Clay**: Avoid overwhelming configuration options

---

## Mobile Considerations

| Screen | Mobile Support |
|--------|----------------|
| Tables list | Full support (read/view) |
| Table view | Full support (scrollable, responsive) |
| Table creation | Not supported (show "Use desktop") |
| Builder panel | Not supported |
| Chat | Limited support (view only) |

---

## Open Design Questions

1. **Chat placement**: Bottom of screen vs. left panel vs. floating?
2. **Builder visibility**: Always visible vs. toggled vs. auto-hide when not editing?
3. **Column limit indicator**: How prominent? When to show?
4. **Template UX**: Modal selection vs. inline vs. chat-suggested?
5. **Saved table naming**: Auto-name vs. require name vs. both?

---

## Prototype Deliverables

### Phase 1 (Jan 8)
- [ ] Basic table layout with filter panel
- [ ] Column add interaction (manual)
- [ ] Chat input placement
- [ ] Builder panel mockup

### Phase 2 (Jan 10)
- [ ] Template selection flow
- [ ] Conditional column UX
- [ ] Progress/loading states
- [ ] Saved tables list

### Phase 3 (Jan 13)
- [ ] Full interactive prototype
- [ ] Mobile responsive check
- [ ] Accessibility audit
- [ ] User testing prep

---

*Last updated: 2026-01-07*
*Design Lead: Adam*

