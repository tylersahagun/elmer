# Prototype Notes: Universal Signal Tables

## Prototype Status
- **Created:** 2026-01-07
- **Owner:** Tyler (PM), Adam (Design review)
- **Status:** ✅ Phase 1 Complete

---

## Components Created

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| `SignalTables` | `SignalTables.tsx` | Main container with header, three-panel layout, and state management |
| `FilterPanel` | `FilterPanel.tsx` | Left panel with date range, rep, and meeting type filters |
| `BuilderPanel` | `BuilderPanel.tsx` | Right panel for column configuration and templates |
| `TableView` | `TableView.tsx` | Center table with engagements and AI column results |
| `ChatInput` | `ChatInput.tsx` | Bottom chat input for natural language column creation |
| `ColumnCard` | `ColumnCard.tsx` | Individual column configuration card with conditional execution |

### Supporting Files

| File | Description |
|------|-------------|
| `types.ts` | All TypeScript interfaces, sample data, and column templates |
| `index.ts` | Barrel exports |
| `SignalTables.stories.tsx` | Storybook stories for all components |

---

## Features Implemented

### Phase 1 (Complete ✅)

- [x] Basic table layout with filter panel
- [x] Column add interaction (manual + templates)
- [x] Chat input placement with message history
- [x] Builder panel with column cards
- [x] Collapsible panels (filter + builder)
- [x] Conditional column execution UI
- [x] Progress indicator for running extraction
- [x] Sample data for demo purposes

### Phase 2 (Ready for next iteration)

- [ ] Template selection modal
- [ ] Drag-to-reorder columns
- [ ] Full progress/loading states
- [ ] Saved tables list view
- [ ] Mobile responsive check

---

## Design Decisions in Prototype

### Layout: Three-Panel with Collapsible Sides

```
┌──────────┬─────────────────────────────┬──────────┐
│ Filters  │         Table View          │ Builder  │
│ (Left)   │                             │ (Right)  │
│ 272px    │         Flexible            │  320px   │
│          │                             │          │
│ Collapse │  Engagements + AI Columns   │ Collapse │
│   to     │                             │    to    │
│  48px    │                             │   48px   │
├──────────┴─────────────────────────────┴──────────┤
│                   Chat Input                       │
│                    (Bottom)                        │
└────────────────────────────────────────────────────┘
```

**Rationale:** Matches Cursor's paradigm of chat + builder side-by-side. Collapsible panels allow users to focus on table when needed.

### Chat at Bottom (Not Left Panel)

Placed chat input at the bottom of the center area, not as a separate left panel.

**Rationale:** 
- Users associate bottom-of-screen with input (Slack, ChatGPT, etc.)
- Keeps chat contextual to the table they're building
- Leaves room for message history to expand upward

### Column Limit Indicator

Shows `3/5` badge in builder header, with amber warning when limit reached.

**Rationale:** Clear but not intrusive. Only becomes prominent when it matters.

### Conditional Execution Toggle

Inline toggle within column card, with visual indicator (⚡) in table headers for columns with conditions.

**Rationale:** Makes cost-saving feature discoverable without being mandatory. Shows "~60% savings" to reinforce benefit.

---

## Deviations from PRD

| PRD Requirement | Prototype Implementation | Reason |
|-----------------|-------------------------|--------|
| "Preview on 3-5 engagements" | Combined preview/run button | Simplify for prototype; can split later |
| Entity selection (engagements only) | No entity selector shown | v1 is engagements-only, so hidden for simplicity |
| Re-run on new data button | Generic "Re-run" button | Same UI, backend would handle delta |

---

## Technical Notes for Migration

### Dependencies Needed in Main Repo

1. **Lucide React icons** - Already used in main repo
2. **cn() utility** - Already exists in main repo
3. **Tailwind CSS** - Already used in main repo

### State Management

Prototype uses local React state. Main repo should consider:
- React Query for server state (table data, results)
- Zustand for UI state (panel collapse, active column)

### API Integration Points

| UI Action | API Endpoint (Proposed) |
|-----------|------------------------|
| Load table | `GET /api/tables/:id` |
| Save table | `POST /api/tables` |
| Update table | `PATCH /api/tables/:id` |
| Run extraction | `POST /api/tables/:id/run` |
| Get results | `GET /api/tables/:id/results` |
| Chat message | `POST /api/tables/chat` (for column suggestion) |

### Component Reuse from Main Repo

| Prototype Component | Main Repo Equivalent |
|--------------------|---------------------|
| Table layout | `ag-grid` patterns or custom |
| Chat input | Global Chat components (post Jan 9) |
| Button styles | `ui/button.tsx` |
| Panel collapse | Workflow builder patterns |

---

## Open Questions for Design Review

1. **Chat placement confirmation** - Bottom works well, but confirm with Adam
2. **Column card expanded by default?** - Currently yes; could start collapsed
3. **Template selection flow** - Inline in builder panel; could be modal
4. **Empty state messaging** - Current copy is placeholder; needs polish
5. **Mobile behavior** - Not implemented; need to discuss priority

---

## Storybook Stories

| Story Name | Description |
|------------|-------------|
| `Default` | Full experience with default state |
| `WithLastRun` | Shows "last run" timestamp in header |
| `FilterPanelStory` | Isolated filter panel |
| `BuilderPanelStory` | Builder with sample columns |
| `BuilderPanelEmpty` | Builder empty state |
| `TableViewWithData` | Table with sample results |
| `TableViewRunning` | Table with progress indicator |
| `TableViewEmpty` | Table empty state |
| `ChatInputStory` | Chat with message history |
| `FullWorkflow` | Documented full workflow |

---

## Chat Emphasis Variants (Jan 7)

Based on Woody's feedback about Cursor's planning agent, created three alternative prototypes exploring different levels of AI chat as the primary controller.

### Variant Comparison

| Variant | AI Emphasis | Description | Inspiration |
|---------|-------------|-------------|-------------|
| **A. Chat-First** | 100% | Chat is primary; table appears as "artifact" | Claude Artifacts, Cursor Agent |
| **B. Chat-Central** | 70% | Chat takes lead; table/builder always visible | Cursor Chat + Editor |
| **C. Chat-Companion** | 30% | Traditional builder; chat is floating helper | GitHub Copilot, VS Code |

### Key Design Question

> "When I use the Cursor plan agent and it shows me a flowchart, then I review the plan... I have to understand it." — Woody

**Where does trust come from?**
- **Chat-First:** Trust the AI, inspect when curious
- **Chat-Central:** AI builds, you watch and verify in real-time
- **Chat-Companion:** You build, AI assists when asked

### Files Created

| File | Description |
|------|-------------|
| `variants/ChatFirstTables.tsx` | Full-screen chat, table as artifact |
| `variants/ChatCentralTables.tsx` | Three-panel: Chat | Table | Builder |
| `variants/ChatCompanionTables.tsx` | Traditional builder + floating chat |
| `variants/ChatVariants.stories.tsx` | Stories with comparison view |
| `variants/index.ts` | Barrel exports |

### Recommended Next Step

**Chat-Central (Variant B)** appears to best balance:
- AI assistance for speed
- Transparency for trust
- Manual control for precision

Discuss with team before finalizing direction.

---

## Next Steps

1. **Design Review (Jan 8)** - Walk through prototype with Adam
   - **NEW:** Include chat variant comparison discussion
2. **User Testing Prep** - Prepare script for testing with Matt's team
3. **Phase 2 Components** - Template modal, saved tables list
4. **Engineering Handoff** - Review with Dylan post-Global Chat

---

*Last updated: 2026-01-07*
*Prototype: https://main--695ece8a989a140b6546402c.chromatic.com*
