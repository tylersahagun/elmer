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

### 5. Inline Over Panels (NEW)
Configuration happens where the data is. No separate "configuration mode"—everything is always editable in place.

> Inspired by Notion: Users never feel "locked out" or need to find a settings page.

### 6. Results First, Configure Second (NEW)
Show sample results immediately after typing a prompt. Refine configuration based on what you see, not what you imagine.

> Inspired by Clay's preview pattern, but faster and less intimidating.

---

## Configuration UX Paradigm

*Research source: `research/configuration-ux-patterns.md`*

### Core Philosophy: Notion's Accessibility + Clay's AI Power

We want the ease of Notion databases with the AI capability of Clay—without Clay's complexity.

| What We Take from Notion | What We Take from Clay |
|--------------------------|------------------------|
| No separate "config mode" | AI-assisted column creation |
| Click-to-add columns | Conditional execution |
| Inline editing everywhere | Natural language prompts |
| Direct manipulation (drag, resize) | Preview before full run |
| Templates as shortcuts, not requirements | Output type selection |

| What We Avoid from Clay |
|-------------------------|
| Credit/token anxiety visible |
| 100+ integration decisions |
| Complex variable syntax `{Company.Name}` |
| Nested configuration menus |
| Wizard-heavy flows |

### Inline Configuration (Primary)

Configuration happens where the data is—not in a separate panel.

```
Column Header Click → Popover Appears
┌─────────────────────────────────────────────────────────────┐
│ Engagement │ Rep  │ Competitor? 🔧 │ Which?    │  +        │
├────────────┼──────┼────────────────┼───────────┼───────────┤
│            │      │     ↓          │           │           │
│            │      │ ┌─────────────────────────┐│           │
│            │      │ │ 🎯 Competitor Mentioned │││           │
│            │      │ │                         ││           │
│            │      │ │ Prompt:                 ││           │
│            │      │ │ ┌─────────────────────┐ ││           │
│            │      │ │ │Was a competitor     │ ││           │
│            │      │ │ │mentioned? (Yes/No)  │ ││           │
│            │      │ │ └─────────────────────┘ ││           │
│            │      │ │                         ││           │
│            │      │ │ Output: ● Yes/No ○ Text ││           │
│            │      │ │                         ││           │
│            │      │ │ ⚡ Only run if: [none]  ││           │
│            │      │ │                         ││           │
│            │      │ │ [Run on all] [Preview 3]││           │
│            │      │ │                         ││           │
│            │      │ │ ─────────────────────── ││           │
│            │      │ │ Rename │ Duplicate │ 🗑 ││           │
│            │      │ └─────────────────────────┘│           │
└─────────────────────────────────────────────────────────────┘
```

**Popover contains everything:**
- Column name (editable)
- Prompt (editable, auto-saves)
- Output type (Yes/No, Text, List)
- Conditional execution toggle
- Run/Preview buttons
- Delete, duplicate, rename actions

**Builder Panel becomes secondary:**
- Available for power users who want overview
- Shows all columns at once with dependencies visualized
- Collapsed by default after first table

### One-Click Column Creation

**Goal:** New column in < 3 seconds, no wizard.

```
Step 1: Click "+"     Step 2: Choose Type     Step 3: Start Typing
       (0.5s)               (1s)                    (done)
         ↓                    ↓                        ↓
      ┌─────┐          ┌──────────────┐          ┌──────────────┐
      │  +  │   →      │ 🤖 AI Column │   →      │ Prompt: _    │
      └─────┘          │ 📝 Manual    │          │              │
                       │ 🧮 Formula   │          │ (typing...)  │
                       └──────────────┘          └──────────────┘
```

**Click paths (every action < 3 clicks):**

| Goal | Clicks | Path |
|------|--------|------|
| Add AI column | 2 | "+" → "AI Column" → (type prompt) |
| Use template | 2 | "+" → Template chip |
| Edit prompt | 1 | Click column header |
| Set condition | 2 | Click header → Toggle "Only run if" |
| Delete column | 2 | Right-click → Delete |
| Reorder columns | 1 | Drag column header |
| Rename column | 2 | Double-click header → (type) |

### Auto-Preview (Zero-Click)

When user types a prompt, preview runs automatically:

```
User types: "Was pricing discussed?"
                    ↓
        [500ms debounce after typing stops]
                    ↓
        [Runs on 3 sample rows automatically]
                    ↓
┌──────────────────────────────────────────────────┐
│ Preview (3 of 142 calls):                        │
│ ┌─────────────────────────────────────────────┐  │
│ │ Acme Q4 Call      │ Yes ✓                   │  │
│ │ Beta Renewal      │ No                      │  │
│ │ Gamma Onboard     │ Yes ✓                   │  │
│ └─────────────────────────────────────────────┘  │
│                                                  │
│ Looks right? [Run on all 142] [Refine prompt]    │
└──────────────────────────────────────────────────┘
```

**No explicit "Preview" button needed.** AI shows its work immediately.

### Templates as Shortcuts

Templates appear inline, not in a modal:

```
┌─────────────────────────────────────────────────────────────┐
│ New AI Column                                               │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ What do you want to know about each call? _             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Or try a quick start:                                       │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ 🎯 Competitor│ │ 🚧 Objection│ │ 📅 Next Step│            │
│ │   Mentioned? │ │   Raised?   │ │   Discussed?│            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│ ┌─────────────┐ ┌─────────────┐                            │
│ │ 💰 Budget   │ │ 👤 Decision │                            │
│ │   Discussed?│ │   Maker?    │                            │
│ └─────────────┘ └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

**One click applies the template prompt.** User can immediately edit.

### Direct Manipulation

Every common action uses direct manipulation:

| Action | Gesture | Visual Feedback |
|--------|---------|-----------------|
| Reorder columns | Drag header | Ghost column follows cursor |
| Resize columns | Drag border | Resize cursor appears |
| Edit inline | Click cell | Border highlights, cursor blinks |
| Select row | Click row | Row highlights |
| Multi-select | Shift+click | Range highlights |
| Context menu | Right-click | Menu appears at cursor |

### Progressive Complexity

Features reveal as user sophistication grows:

| Level | Trigger | New Features Revealed |
|-------|---------|----------------------|
| 1 | First column | Basic prompt, run button |
| 2 | Select output type | Yes/No vs Text vs List options |
| 3 | Add second column | "Only run if" conditional appears |
| 4 | Save table | "Re-run on new data" appears |
| 5 | Return to saved | "Graduate to signal" option |
| 6 | Create 3+ tables | Template creation option |

**Never show Level 5 features to Level 1 users.**

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

### Pattern 1: Column Creation via Chat

Chat creates columns, but configuration appears inline:

```
User: "I want to know if pricing was discussed"
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ AI: Creating column for pricing discussions...              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💰 Pricing Discussed                           [Add ↗] │ │
│ │                                                         │ │
│ │ Prompt: "Was pricing, cost, budget, or                 │ │
│ │          payment discussed? (Yes/No)"                  │ │
│ │                                                         │ │
│ │ Output: Yes/No                                         │ │
│ │                                                         │ │
│ │ Preview on 3 calls:                                    │ │
│ │ • Acme Q4 → Yes ✓                                      │ │
│ │ • Beta Renewal → No                                    │ │
│ │ • Gamma Demo → Yes ✓                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Add Column]  [Modify Prompt]  [Try Different Question]     │
└─────────────────────────────────────────────────────────────┘
```

**Key difference from original:** Chat shows preview results immediately—AI demonstrates its understanding before user commits.

### Pattern 2: Inline Column Creation (No Chat)

Direct manipulation path for users who prefer clicking:

```
Click "+" at end of headers:
┌───────────┬───────────┬───────────┬─────────────────────────┐
│ Date      │ Rep       │ Duration  │  + (clicked)            │
├───────────┼───────────┼───────────┼─────────────────────────┤
│           │           │           │  ┌───────────────────┐  │
│           │           │           │  │ 🤖 AI Column      │  │
│           │           │           │  │ ─────────────────  │  │
│           │           │           │  │ Ask anything about │  │
│           │           │           │  │ your calls         │  │
│           │           │           │  │                    │  │
│           │           │           │  │ Quick starts:      │  │
│           │           │           │  │ [Competitor?]      │  │
│           │           │           │  │ [Objection?]       │  │
│           │           │           │  │ [Next steps?]      │  │
│           │           │           │  ├───────────────────┤  │
│           │           │           │  │ 📝 Manual Column   │  │
│           │           │           │  │ 🧮 Formula         │  │
│           │           │           │  └───────────────────┘  │
└───────────┴───────────┴───────────┴─────────────────────────┘
```

**Quick starts are single-click.** Selecting "Competitor?" immediately:
1. Creates column with pre-filled prompt
2. Runs preview on 3 rows
3. Shows results inline

### Pattern 3: Conditional Column Setup (Inline)

Conditions appear in the column popover, not a separate modal:

```
Click "Which Competitor?" column header:
                    ↓
        ┌───────────────────────────────────────┐
        │ 🏢 Which Competitor?                  │
        │                                       │
        │ Prompt:                               │
        │ ┌───────────────────────────────────┐ │
        │ │If a competitor was mentioned,     │ │
        │ │which one? (name only)             │ │
        │ └───────────────────────────────────┘ │
        │                                       │
        │ Output: ● Text  ○ List               │
        │                                       │
        │ ⚡ Conditional Execution              │
        │ ┌───────────────────────────────────┐ │
        │ │ ☑ Only run if:                    │ │
        │ │   [Competitor Mentioned?] = [Yes] │ │
        │ │                                   │ │
        │ │ 💡 Saves ~60% (skips 89 rows)     │ │
        │ └───────────────────────────────────┘ │
        │                                       │
        │ [Run on 53 matching rows] [Preview]   │
        └───────────────────────────────────────┘
```

**Key improvements:**
- Condition toggle is inline, not buried in settings
- Shows exact savings ("skips 89 rows")
- Run button updates to show matching row count

### Pattern 4: Template as Prompt Injection

Templates are not separate workflows—they're prompt shortcuts:

```
Empty table state:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              📊 What would you like to explore?              │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Ask anything: "Did we discuss pricing?"                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Or start with a common question:                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ 🎯 Competitors  │  │ 🚧 Objections   │  │ 📅 Next     │ │
│  │    mentioned?   │  │    raised?      │  │    Steps?   │ │
│  │                 │  │                 │  │             │ │
│  │ Yes/No + Details│  │ Yes/No + List   │  │ Yes/No+What │ │
│  │ 2 columns       │  │ 2 columns       │  │ 2 columns   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ 💰 Budget       │  │ 👤 Decision     │  │ 📈 Deal     │ │
│  │    discussed?   │  │    Maker?       │  │    Stage?   │ │
│  │                 │  │                 │  │             │ │
│  │ Yes/No          │  │ Yes/No + Name   │  │ Select      │ │
│  │ 1 column        │  │ 2 columns       │  │ 1 column    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Clicking a template:**
1. Instantly adds the column(s)
2. Runs preview automatically
3. User can immediately edit prompts
4. No confirmation modal

### Pattern 5: Edit Prompt Inline

After column exists, editing is direct:

```
Double-click "Competitor Mentioned?" cell with value "Yes":
                    ↓
┌──────────────────────────────────────────────────────────┐
│ Competitor Mentioned?                                    │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Yes ✓                                                │ │
│ │                                                      │ │
│ │ 📎 Evidence:                                         │ │
│ │ "...they mentioned comparing us to Gong because      │ │
│ │ their VP used it at Salesforce..."                   │ │
│ │                                                      │ │
│ │ [View in transcript ↗]                               │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ✓ Correct  │  ✗ Wrong  │  ✏️ Override to: [____]  │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**This supports trust AND feedback:**
- Evidence shown (receipt pattern)
- User can mark correct/wrong
- Manual override available

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
- Popover pattern: Match existing component popovers

### External Inspiration

#### Notion Databases (Primary Reference)
What we're taking:
- **Inline everything**: No separate config mode
- **Click header to configure**: Contextual popover
- **"+" to add column**: Single-click creation
- **Drag to reorder**: Direct manipulation
- **Templates as shortcuts**: Not required, just helpful
- **Auto-save**: No explicit save button

What we're adapting:
- Property types → AI output types (Yes/No, Text, List)
- Formulas → AI prompts with natural language

#### Clay AI Tables (Selective Reference)
What we're taking:
- **AI-assisted column creation**: Natural language → configuration
- **Conditional execution**: "Only run if Column A = Yes"
- **Preview before full run**: Build confidence before commitment
- **Use case selection**: Guide new users to common patterns

What we're explicitly avoiding:
- Credit/token visibility (creates anxiety)
- Model selection (we pick the right one)
- Complex variable syntax `{Column.Name}` (natural language instead)
- Deep nested menus (flat configuration)
- Wizard-heavy flows (inline everything)

> "Clay scares people... our version cannot scare people." — Woody

#### Cursor (Paradigm Reference)
- Chat + visible artifact pattern
- AI shows its work in real-time
- User can switch between chat and direct editing

#### Linear (Speed Reference)
- Keyboard-first interactions
- Fast everything (< 100ms feedback)
- Minimal chrome, maximum content

### Key Differentiator: Simpler Because We Own the Data

Clay orchestrates external APIs (100+ integrations). We query our own data.

| Clay | AskElephant Signal Tables |
|------|---------------------------|
| "Find company domain via Clearbit, then find CEO via Apollo, then get email via Hunter" | "Was a competitor mentioned?" |
| 3+ API calls, variable syntax, error handling | 1 AI extraction from transcript we already have |
| Minutes to configure | Seconds to configure |
| Many ways to fail | One source of truth |

This is why we can be faster and simpler—we're not a workflow orchestrator.

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

### Resolved (Jan 9)
1. ~~**Chat placement**~~: Bottom of screen ✓ (familiar input position)
2. ~~**Builder visibility**~~: Secondary to inline popovers ✓ (Notion pattern)
3. ~~**Column limit indicator**~~: Subtle until 4/5, then amber ✓
4. ~~**Template UX**~~: Inline cards in empty state + quick-start chips ✓
5. ~~**Saved table naming**~~: Auto-name from first column, editable ✓

### Still Open
6. **Popover vs. slide-out panel**: For column config, should we use a small popover (Notion) or a larger slide-out panel (more room for preview)?
7. **Auto-preview trigger**: Run preview on every keystroke (with debounce) or require explicit button click?
8. **Cell click behavior**: Click cell to see evidence, or require double-click?
9. **Keyboard shortcuts**: What shortcuts for power users? (Cmd+K for new column? Arrow keys to navigate?)
10. **Confidence indicator design**: How to show low-confidence cells without creating visual noise?

---

## Prototype Deliverables

### Phase 1 (Jan 8) — Complete ✅
- [x] Basic table layout with filter panel
- [x] Column add interaction (manual)
- [x] Chat input placement
- [x] Builder panel mockup
- [x] Chat variant exploration (A/B/C)

### Phase 2 (Jan 10) — In Progress 🔄
- [ ] **Inline column configuration popover** (NEW - Notion pattern)
- [ ] **One-click column creation from "+"** (NEW)
- [ ] **Auto-preview on prompt entry** (NEW)
- [ ] Template selection flow (inline chips, not modal)
- [ ] Conditional column UX (in popover)
- [ ] Progress/loading states
- [ ] Saved tables list

### Phase 3 (Jan 13)
- [ ] **Cell click → evidence popover** (NEW - trust/receipts)
- [ ] **Drag-to-reorder columns** (NEW - direct manipulation)
- [ ] **Keyboard shortcuts** (Cmd+K, arrow keys)
- [ ] Full interactive prototype
- [ ] Mobile responsive check
- [ ] Accessibility audit
- [ ] User testing prep

### New Components Needed (from Configuration UX Research)

| Component | Purpose | Reference |
|-----------|---------|-----------|
| `ColumnConfigPopover` | Inline column configuration | Notion property popover |
| `QuickStartChips` | Template shortcuts | Notion "quick add" |
| `AutoPreview` | Instant preview on 3 rows | Clay preview, but faster |
| `EvidencePopover` | Show source quotes for cells | Receipt pattern |
| `ConfidenceIndicator` | Visual for uncertain extractions | TBD |
| `DragHandle` | Column reordering | Notion/Linear drag |

---

## Appendix: Configuration UX Research

For detailed research on Notion and Clay configuration patterns, see:
- `research/configuration-ux-patterns.md`

---

*Last updated: 2026-01-09*
*Design Lead: Adam*
*Configuration UX Research: Tyler (via PM Copilot + Design Companion)*

