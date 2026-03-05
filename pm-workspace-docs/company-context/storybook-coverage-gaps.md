# Storybook Coverage Gaps Analysis

## Executive Summary

Current Storybook coverage is **~17%** (92 stories / 541 components). Key product areas have critical gaps that prevent effective in-context prototyping.

## Coverage by Feature Area

| Area | Stories | Components | Coverage | Priority |
|------|---------|------------|----------|----------|
| **ui/** | 46 | 66 | 70% | Low - Well covered |
| **engagements/** | 16 | 50 | 32% | **P0 - Critical** (main pages missing) |
| **workflows/** | 2 | 63 | 3% | **P0 - Critical** |
| **chat/** | 1 | 48 | 2% | **P0 - Critical** |
| **signals/** | 0 | 18 | 0% | **P0 - Critical** |
| **company/** | 1 | 10 | 10% | **P0 - Critical** (entity pages) |
| **person/** | 4 | 33 | 12% | **P0 - Critical** (contact pages) |
| **ai-elements/** | 0 | 30 | 0% | **P1 - High** |
| **ai-agents/** | 0 | 4 | 0% | P1 - High |
| **navigation/** | 2 | 10 | 20% | Medium |
| **health-score/** | 0 | 5 | 0% | P2 |
| **knowledge-base/** | 0 | 4 | 0% | P2 |
| **tags/** | 0 | 6 | 0% | P2 |
| **filters/** | 0 | 4 | 0% | P2 |
| **workspaces/** | 0 | 10 | 0% | P3 |
| **notifications/** | 0 | 4 | 0% | P3 |

---

## P0 Critical - Required for Prototyping

### 1. Engagements Ecosystem (16 stories / 50+ components)

The engagement ecosystem is the **core user experience** - where users spend most of their time viewing past meetings, searching recordings, and accessing company/contact context.

#### Route Pages (0 stories - CRITICAL)

| Page Route | File | Purpose | Why Critical |
|-----------|------|---------|--------------|
| **My Meetings** | `routes/.../engagements/index.tsx` | Main home page with upcoming/past meetings | Primary landing page |
| **Search** | `routes/.../engagements/search.tsx` | AG Grid data table with filters | Power user workflow |
| **Single Engagement** | `routes/.../engagements/$engagementId.tsx` | Meeting detail with video, transcript, chat | Core content consumption |
| **Company Detail** | `routes/.../companies/$companyId.tsx` | Company context with meetings panel | Account research |
| **Contact Detail** | `routes/.../contacts/$contactId.tsx` | Contact context with meetings panel | Contact research |

#### Key Engagements Components Missing Stories

| Component | Purpose | Has Story? |
|-----------|---------|------------|
| `my-past-engagements.tsx` | Past meeting list | ❌ |
| `my-upcoming-engagements.tsx` | Upcoming meetings carousel | ❌ |
| `engagements-data-table.tsx` | AG Grid search table | ❌ |
| `engagement-transcript.tsx` | Transcript display with timeline | ✅ (stub) |
| `engagement-signals.tsx` | Signal/property display | ❌ |
| `engagement-dropdown-menu.tsx` | Action menu | ❌ |
| `engagement-visibility-button.tsx` | Privacy toggle | ❌ |
| `column-selector-drawer.tsx` | Table column config | ❌ |

#### Email Components (4 stories - decent coverage)
- `email-body.stories.tsx` ✅
- `email-header.stories.tsx` ✅  
- `email-thread.stories.tsx` ✅
- `email-content.stories.tsx` ✅

#### Company Components (1 story - needs expansion)

| Component | Purpose | Has Story? |
|-----------|---------|------------|
| `company-detail.tsx` | Main company view | ❌ |
| `company-logo.tsx` | Company avatar | ❌ |
| `company-meetings-panel.tsx` | Right panel meetings list | ❌ |
| `companies-object-links-group.tsx` | CRM links display | ❌ |
| `companies-form-dialog.tsx` | Edit company | ❌ |

#### Contact/Person Components (4 stories - needs main views)

| Component | Purpose | Has Story? |
|-----------|---------|------------|
| `contact-meetings-panel.tsx` | Right panel meetings list | ❌ |
| `contact-detail.tsx` | Main contact view | ❌ |
| `contact-form-dialog.tsx` | Edit contact | ❌ |
| `person-avatar.tsx` | Contact avatar | ✅ |
| `person-card.tsx` | Contact summary card | ✅ |

---

### 2. Workflows (2 stories / 63 components)

The workflow builder is central to the product. Current stories (just added):
- `workflow-node-sheet.stories.tsx` (mock version)
- `labeled-renderer.stories.tsx`

**Missing - Must Add:**

| Component | Why Critical |
|-----------|--------------|
| `workflow-nodes.tsx` | Core node rendering |
| `workflow-edges.tsx` | Connection visualization |
| `workflow-cards.tsx` | Workflow list display |
| `workflow-triggers-dialog.tsx` | Trigger configuration |
| `workflow-actions-dialog.tsx` | Action selection |
| `run-workflow-button.tsx` | Execution UX |
| `workflow-runs-table.tsx` | Run history display |
| `workflow-run-step-card.tsx` | Step execution visualization |

**Form Renderers (critical for node configuration):**
- `enum-selector.tsx`
- `language-model-selector.tsx`
- `document-selector.tsx`
- `person-selector.tsx` / `people-selector.tsx`
- `tag-selector.tsx`
- `signal-property-select.tsx`

### 2. Chat (1 story / 48 components)

Chat is the core AI interaction surface.

**Missing - Must Add:**

| Component | Why Critical |
|-----------|--------------|
| `global-chat.tsx` | Main chat container |
| `chat-message-composer.tsx` | Message input |
| `lexical-chat-input.tsx` | Rich text input |
| `chats-tabs.tsx` / `chats-tabs-sidebar.tsx` | Chat navigation |
| `context-indicator.tsx` | Shows chat context |

**Messages (1 story exists, need more):**
- `tool-invocation-part.tsx` - Tool call display
- `reasoning-part.tsx` - AI reasoning visualization
- `source-part.tsx` - Citation display
- `status-update-part.tsx` - Progress indicators

**Tools (tool call result rendering):**
- `scorecard-v1.tsx` - Deal scorecard display
- `email-draft.tsx` - Email composition
- `workflow-action-executor-tool-part.tsx` - Workflow execution
- `internal-search.tsx` - Search results
- `navigation.tsx` - Navigation suggestions

### 3. Signals (0 stories / 18 components)

Signal tables and property configuration are core to the data model.

**Missing - Must Add:**

| Component | Why Critical |
|-----------|--------------|
| `signals-table.tsx` | Main signals display |
| `property-table.tsx` | Property listing |
| `property-configuration-tab.tsx` | Property config UI |
| `property-data-tab.tsx` | Property data view |

**Form Renderers:**
- `filter-builder-renderer.tsx`
- `multi-select-dropdown.tsx`
- `json-schema-renderer.tsx`

---

## P1 High - Important for Full Experience

### 4. AI Elements (0 stories / 30 components)

These are the building blocks for AI-powered UI.

**Key Components:**
- `message.tsx` - AI message rendering
- `reasoning.tsx` - Chain of thought display
- `sources.tsx` - Citation rendering
- `code-block.tsx` - Code display
- `artifact.tsx` - Generated content
- `confirmation.tsx` - User confirmations
- `suggestion.tsx` - AI suggestions
- `plan.tsx` - AI plan visualization
- `shimmer.tsx` - Loading states

### 5. AI Agents (0 stories / 4 components)

Agent configuration form renderers:
- `string-array.tsx`
- `string-array-textarea.tsx`
- `text-input.tsx`

---

## P2 Medium - Feature Completeness

### 6. Health Score (0 stories / 5 components)
- `health-score-details-card.tsx`
- `suggested-signal.tsx`
- `create-form-dialog.tsx`

### 7. Knowledge Base (0 stories / 4 components)
- `knowledge-source-table.tsx`
- `knowledge-source-card.tsx`
- `text-knowledge-source-form-dialog.tsx`

### 8. Tags (0 stories / 6 components)
- `tags-table.tsx`
- `tag-selector.tsx`
- `unified-tag-manager.tsx`

### 9. Filters (0 stories / 4 components)
- Filter components for search/list views

---

## Implementation Roadmap

### Phase 1: Engagement Ecosystem (2-3 days) - HIGHEST PRIORITY

The engagement pages are where users spend 80%+ of their time. Getting these into Storybook enables prototyping new features in realistic context.

#### 1A. Main Page Containers
1. `MyMeetingsPage.stories.tsx` - The main `/engagements` page
   - Composition of `MyUpcomingEngagements` + `MyPastEngagements`
   - Mock upcoming/past meeting data
   - Tab navigation (Recordings, Clips, Zoom imports)

2. `EngagementSearchPage.stories.tsx` - The `/engagements/search` AG Grid page
   - Full AG Grid table with mock rows
   - Filter controls, column selector
   - Bulk actions

3. `EngagementDetailPage.stories.tsx` - The `$engagementId` detail page
   - Video player with transcript
   - Chat panel
   - Resizable layout

#### 1B. Entity Detail Pages
4. `CompanyDetailPage.stories.tsx` - Company view with meetings panel
5. `ContactDetailPage.stories.tsx` - Contact view with meetings panel

#### 1C. Key Sub-components
6. `my-past-engagements.stories.tsx` - Meeting list with infinite scroll
7. `my-upcoming-engagements.stories.tsx` - Horizontal card scroll
8. `engagements-data-table.stories.tsx` - AG Grid with mock data
9. `engagement-signals.stories.tsx` - Property display
10. `company-meetings-panel.stories.tsx` - Right panel meetings list
11. `contact-meetings-panel.stories.tsx` - Right panel meetings list

### Phase 2: Workflow Builder Context (1-2 days)
1. Add stories for `workflow-nodes.tsx` with mock data
2. Add stories for key form renderers (`enum-selector`, `language-model-selector`)
3. Add stories for `workflow-cards.tsx` and `workflow-runs-table.tsx`

### Phase 3: Chat Components (1-2 days)
1. Add stories for `global-chat.tsx` container
2. Add stories for message parts (tool invocation, reasoning, sources)
3. Add stories for chat input (`chat-message-composer.tsx`)

### Phase 4: Signals Tables (1 day)
1. Add stories for `signals-table.tsx`
2. Add stories for `property-table.tsx`
3. Add form renderer stories

### Phase 5: AI Elements (1 day)
1. Add stories for core AI elements (message, reasoning, sources)
2. Add stories for interactive elements (confirmation, suggestion)

---

## Quick Win: Mock Data Patterns

For rapid story creation, establish mock data files:

```
elephant-ai/web/src/components/
├── __mocks__/
│   ├── engagement-data.ts  # Mock meetings, transcripts, participants
│   ├── company-data.ts     # Mock companies with CRM links
│   ├── contact-data.ts     # Mock contacts with company associations
│   ├── workflow-data.ts    # Mock workflow nodes, edges
│   ├── chat-data.ts        # Mock messages, tool calls
│   ├── signal-data.ts      # Mock properties, signals
│   └── user-data.ts        # Mock users, workspaces
```

### Engagement Mock Data Structure

```typescript
// engagement-data.ts
export const mockEngagement = {
  id: 'eng-1',
  title: 'Discovery Call with Acme Corp',
  startAt: new Date().toISOString(),
  endAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  duration: '30 mins',
  isRecorded: true,
  isUpcoming: false,
  isPublic: false,
  companies: [{ id: 'co-1', displayName: 'Acme Corp', primaryDomain: 'acme.com' }],
  allParticipants: {
    edges: [
      { node: { id: 'p-1', displayName: 'John Buyer', primaryEmail: 'john@acme.com' } },
      { node: { id: 'p-2', displayName: 'Jane Seller', primaryEmail: 'jane@company.com' } },
    ],
  },
  tags: [{ id: 't-1', name: 'Discovery', hexColor: '#4CAF50' }],
  content: {
    recordingUrl: null, // Use placeholder
    thumbnailUrl: null,
    transcriptText: 'Sample transcript text...',
  },
};

export const mockEngagementList = [
  mockEngagement,
  { ...mockEngagement, id: 'eng-2', title: 'Demo with Beta Inc' },
  { ...mockEngagement, id: 'eng-3', title: 'Quarterly Review', isUpcoming: true },
];
```

This allows stories to render realistic data without GraphQL dependencies.

---

## Components Already Covered (Reference)

### Well-Covered Areas
- **ui/** - 46 stories covering buttons, forms, dialogs, etc.
- **engagements/** - 16 stories for meeting cards, transcripts

### Partially Covered
- **person/** - 4 stories (avatars, contact detail)
- **navigation/** - 2 stories (header, 404)
- **company/** - 1 story
- **artifact/** - 1 story

---

## Next Steps

1. **Start with Engagement ecosystem** - This is where users live day-to-day
2. **Create mock data utilities** - Enable rapid story creation
3. **Add page-level stories** - Show full pages with realistic data
4. **Then tackle Workflows, Chat, Signals** - Secondary but important
5. **Document patterns** - So team can add stories consistently

## Story Naming Convention

```
elephant/Pages/Engagements/MyMeetings     # Full page views
elephant/Pages/Companies/CompanyDetail    # Entity pages
elephant/Engagements/MyPastEngagements    # Component level
elephant/Company/CompanyMeetingsPanel     # Sub-components
Prototypes/HubSpotConfig                  # Prototype components
```

## Priority Summary

| Priority | Area | Stories to Add | Impact |
|----------|------|----------------|--------|
| **P0** | Engagement Pages | ~12 stories | Enables realistic prototyping |
| **P0** | Entity Pages (Company/Contact) | ~6 stories | Account research context |
| **P1** | Workflow Builder | ~10 stories | Automation testing |
| **P1** | Chat | ~8 stories | AI interaction testing |
| **P2** | Signals | ~5 stories | Data model visualization |
| **P2** | AI Elements | ~8 stories | AI primitives |

_Generated: January 2026_

