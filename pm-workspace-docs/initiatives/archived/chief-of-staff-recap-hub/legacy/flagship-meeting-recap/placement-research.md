# Flagship Meeting Recap - Placement Research

**Date:** 2026-01-28  
**Analyst:** AI Placement Analysis  
**Status:** Complete

---

## Executive Summary

The flagship meeting recap feature should **extend the existing `ChatsTabs` component** on the engagement (meeting) detail page, NOT create a new page. The current architecture already supports artifact types (Scorecard, CRM Updates) and uses a sidebar + content area pattern that matches our design vision.

**Recommended Approach:** Add new artifact types (Recap, Coaching, Prep) to the existing system, promoted to top-level tabs in the sidebar.

---

## Feature Classification

| Attribute            | Value                                           |
| -------------------- | ----------------------------------------------- |
| **Type**             | Detail View / Artifact Display                  |
| **Frequency of Use** | Daily (every meeting page visit)                |
| **User Goal**        | View and customize AI-generated meeting outputs |
| **Container**        | Embedded within existing meeting page           |
| **Discovery**        | Primary tabs on meeting page (not hidden)       |

---

## Codebase Analysis

### Current Meeting Page Architecture

**Route:** `routes/workspaces/$workspaceId/engagements/$engagementId.tsx`

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Content Header (Title, Participants, Actions)                           │
├─────────────────────────────────────────────────────────────────────────┤
│ ResizablePanelGroup                                                     │
│ ┌───────────────────────────────────────┬─────────────────────────────┐ │
│ │ ChatsTabs (Main Content)              │ Side Panel                  │ │
│ │ ┌─────────┬──────────────────────────┐│ ┌─────────────────────────┐ │ │
│ │ │Sidebar  │ Content Area             ││ │ Tabs: Transcript |      │ │ │
│ │ │         │                          ││ │       Signals | Log     │ │ │
│ │ │[NewChat]│ [Overview / Chat /       ││ ├─────────────────────────┤ │ │
│ │ │         │  Scorecard / CRM /       ││ │ Video Player            │ │ │
│ │ │[CRM]    │  Action Item]            ││ │ Transcript / Properties │ │ │
│ │ │[Score]  │                          ││ │                         │ │ │
│ │ │[Tasks]  │                          ││ │                         │ │ │
│ │ │[Chats]  │                          ││ │                         │ │ │
│ │ └─────────┴──────────────────────────┘│ └─────────────────────────┘ │ │
│ └───────────────────────────────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Files

| File                                       | Purpose                               | Relevance                        |
| ------------------------------------------ | ------------------------------------- | -------------------------------- |
| `routes/.../engagements/$engagementId.tsx` | Meeting detail page                   | Parent container                 |
| `components/chat/chats-tabs.tsx`           | Sidebar + content for meeting outputs | **Primary extension point**      |
| `components/artifact/artifact.tsx`         | Artifact renderer by type             | Add Recap type here              |
| `components/chat/global-chat.tsx`          | Side sheet chat                       | In-place editing integration     |
| `components/chat/chats-overview.tsx`       | Overview state content                | Reference for new artifact views |

### Current Content Types in ChatsTabs

```typescript
type ContentType =
  | "overview" // Default state, workflow list
  | "chat" // Individual chat view
  | "action-item" // Action item detail
  | "scorecard" // Scorecard artifact
  | "crm-field-updates" // CRM sync status
  | `external-object-sync-${string}`; // External integrations
```

### URL Parameter Pattern

ChatsTabs uses URL params for navigation state:

- `?chatId=xxx` → Opens specific chat
- `?taskId=xxx` → Opens action item
- `?artifactId=xxx` → Opens artifact (scorecard, crm-updates)

**This pattern should be extended for:**

- `?artifactId=recap` → Opens Recap artifact
- `?artifactId=coaching` → Opens Coaching artifact
- `?artifactId=prep` → Opens Prep artifact

---

## Similar Features in Codebase

| Feature                  | Location                                             | Pattern                   | Similarity                     |
| ------------------------ | ---------------------------------------------------- | ------------------------- | ------------------------------ |
| **Scorecard**            | `components/artifact/scorecard.tsx`                  | Artifact in ChatsTabs     | ⭐⭐⭐⭐⭐ Direct model        |
| **CRM Updates**          | `components/crm-update/crm-field-updates.tsx`        | Content type in ChatsTabs | ⭐⭐⭐⭐ Similar UX            |
| **Action Item Overview** | `components/action-items/action-item-overview.tsx`   | Detail view in ChatsTabs  | ⭐⭐⭐⭐ Similar structure     |
| **Meeting Prep**         | `components/engagements/engagement-company-prep.tsx` | Side panel content        | ⭐⭐⭐ Prep pattern exists     |
| **Global Chat**          | `components/chat/global-chat.tsx`                    | Side sheet                | ⭐⭐⭐⭐⭐ In-place edit model |

### Scorecard Pattern (Primary Reference)

```typescript
// components/artifact/artifact.tsx
export const Artifact = (props) => {
  const artifact = useFragment(ArtifactDetailsFragment, props.artifact);

  if (artifact.type === ArtifactType.Scorecard) {
    return <Scorecard artifact={artifact} />;
  }

  // Add new types here:
  // if (artifact.type === ArtifactType.Recap) {
  //   return <RecapArtifact artifact={artifact} />;
  // }

  return null;
};
```

---

## Placement Recommendation

### Integration Type: **Embedded Extension**

Do NOT create a new page. Extend the existing `ChatsTabs` component.

### Specific Location

| Component               | Path                                         | Change Type                 |
| ----------------------- | -------------------------------------------- | --------------------------- |
| **RecapArtifact**       | `components/recap/recap-artifact.tsx`        | NEW - Main recap view       |
| **CoachingArtifact**    | `components/recap/coaching-artifact.tsx`     | NEW - Coaching view         |
| **PrepArtifact**        | `components/recap/prep-artifact.tsx`         | NEW - Prep view             |
| **RecapFeedbackButton** | `components/recap/recap-feedback-button.tsx` | NEW - Opens global chat     |
| **ChatsTabs**           | `components/chat/chats-tabs.tsx`             | MODIFY - Add content types  |
| **Artifact**            | `components/artifact/artifact.tsx`           | MODIFY - Add artifact types |

### Navigation Entry

**Current sidebar pattern in ChatsTabs:**

```
[+ New Chat]
───────────────
[HubSpot (beta)] ← CRM Updates
[Scorecard]      ← If exists
───────────────
Action items (3)
  • Follow up with John
  • Send proposal
───────────────
Chats
  • Meeting summary
  • Competitor analysis
```

**Proposed sidebar with Recap:**

```
[+ New Chat]
───────────────
[📝 Recap]       ← NEW: Primary artifact (always visible)
[🎯 Coaching]    ← NEW: If coaching enabled
[📋 Prep]        ← NEW: Pre-meeting only
───────────────
[HubSpot (beta)]
[Scorecard]
───────────────
Action items (3)
  ...
```

**Key Changes:**

1. Recap/Coaching/Prep appear at TOP of sidebar (above CRM)
2. They're artifacts, not chats (use `artifactId` param)
3. They have icons to distinguish from chat items
4. They're always visible (not collapsed under "Chats")

---

## Technical Integration

### 1. Extend ContentType

```typescript
// components/chat/chats-tabs.tsx
type ContentType =
  | "overview"
  | "chat"
  | "action-item"
  | "scorecard"
  | "crm-field-updates"
  | `external-object-sync-${string}`
  | "recap" // NEW
  | "coaching" // NEW
  | "prep"; // NEW
```

### 2. Add Artifact Types

```typescript
// Likely in lib/gql/graphql.ts (generated)
enum ArtifactType {
  SCORECARD = "SCORECARD",
  EMAIL = "EMAIL",
  RECAP = "RECAP", // NEW
  COACHING = "COACHING", // NEW
  PREP = "PREP", // NEW
}
```

### 3. Sidebar Item Rendering

```tsx
// Inside ChatsTabs sidebar
{
  recapArtifact && (
    <SidebarMenuItem>
      <Button
        variant="ghost"
        className={cn(
          chatsSidebarButtonClasses,
          contentType === "recap" ? "bg-neutral-200" : ""
        )}
        onClick={() => setSearchParams({ artifactId: "recap" })}
      >
        <FileTextIcon className="size-4" />
        <span>Recap</span>
      </Button>
    </SidebarMenuItem>
  );
}
```

### 4. Content Rendering

```tsx
// Inside ChatsTabs content switch
case 'recap':
  return recapArtifact ? (
    <RecapArtifact
      artifact={recapArtifact}
      onFeedback={() => openGlobalChat(recapContext)}
    />
  ) : null;
```

### 5. Feedback Button → Global Chat

```tsx
// components/recap/recap-feedback-button.tsx
export const RecapFeedbackButton = ({ recapId, onOpen }) => {
  const { setIsOpen, setContext } = useGlobalChat();

  const handleClick = () => {
    setContext({
      type: "recap-feedback",
      recapId,
      initialMessage:
        "I'm looking at your meeting recap. What would you like to change?",
    });
    setIsOpen(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <MessageCircleIcon className="size-4" />
    </Button>
  );
};
```

---

## Data Flow

### Recap Generation

```
Meeting Ends
    ↓
Workflow Runs (existing system)
    ↓
Artifact Created (type: RECAP)
    ↓
Stored in engagement.artifacts
    ↓
Query fetches via ArtifactDetailsFragment
    ↓
RecapArtifact renders content
```

### Template Configuration

```
User Opens Template Config
    ↓
Chat interface (NEW: TemplateConfigChat component)
    ↓
User describes preferences
    ↓
AI updates template (stored in user preferences)
    ↓
Template applied to future recaps
```

### In-Place Editing

```
User Clicks Feedback Icon on Recap
    ↓
Global Chat opens with recap context
    ↓
User describes change
    ↓
AI updates template OR regenerates current recap
    ↓
Recap artifact refreshes
```

---

## GraphQL Changes Required

### New Artifact Types

The backend needs to support new artifact types. Check if `ArtifactType` enum can be extended:

```graphql
enum ArtifactType {
  SCORECARD
  EMAIL
  RECAP # NEW
  COACHING # NEW
  PREP # NEW
}
```

### Query Changes

The `EngagementSpaceQuery` already fetches `scorecardArtifacts`. Similar pattern for recap:

```graphql
recapArtifacts: artifacts(filter: { type: RECAP }) {
  id
  ...ArtifactDetails
}
coachingArtifacts: artifacts(filter: { type: COACHING }) {
  id
  ...ArtifactDetails
}
prepArtifacts: artifacts(filter: { type: PREP }) {
  id
  ...ArtifactDetails
}
```

---

## File Structure Recommendation

```
elephant-ai/web/src/components/
├── recap/                          # NEW DOMAIN
│   ├── index.ts                    # Exports
│   ├── recap-artifact.tsx          # Main recap view
│   ├── recap-artifact.stories.tsx  # Storybook
│   ├── coaching-artifact.tsx       # Coaching view
│   ├── coaching-artifact.stories.tsx
│   ├── prep-artifact.tsx           # Prep view
│   ├── prep-artifact.stories.tsx
│   ├── recap-feedback-button.tsx   # Opens global chat
│   ├── recap-section.tsx           # Reusable section component
│   ├── recap-skeleton.tsx          # Loading state
│   └── types.ts                    # TypeScript types
├── artifact/
│   └── artifact.tsx                # MODIFY: Add recap/coaching/prep
└── chat/
    └── chats-tabs.tsx              # MODIFY: Add to sidebar
```

---

## Alternatives Considered

### Alternative 1: New Dedicated Route

**Approach:** `/workspaces/:id/engagements/:id/recap`

**Pros:**

- Clean separation
- Can have own layout

**Cons:**

- ❌ Breaks existing meeting page experience
- ❌ Users navigate away from transcript/video
- ❌ Duplicates header/navigation code
- ❌ Doesn't match "tabs on meeting page" vision

**Decision:** Rejected

### Alternative 2: Replace ChatsTabs Entirely

**Approach:** New component `MeetingOutputsTabs` replaces ChatsTabs

**Pros:**

- Clean slate design
- No legacy constraints

**Cons:**

- ❌ High risk (ChatsTabs is complex, 500+ lines)
- ❌ Breaks existing chat/workflow UX
- ❌ Longer implementation time
- ❌ Loses existing patterns users know

**Decision:** Rejected (extend instead)

### Alternative 3: Side Panel Tabs (Right Side)

**Approach:** Add recap tabs to the right-side panel (where Transcript lives)

**Pros:**

- Utilizes existing space
- Doesn't change main content area

**Cons:**

- ❌ Right panel is collapsible, often hidden
- ❌ Transcript is primary use case for that panel
- ❌ Less visual prominence than main content area

**Decision:** Rejected

---

## Migration Considerations

### Existing Workflows → Recap Artifacts

Current state:

- Workflows run and create chat threads
- Users find recap in chat list

Future state:

- Workflows ALSO create Recap artifacts
- Recap artifact is promoted to top of sidebar
- Original chat still accessible in "Chats" section

**Backward Compatibility:**

- Don't remove existing chat-based workflow outputs
- Recap artifact is an ADDITION, not replacement
- Power users can still access raw workflow chats

---

## Implementation Phases

### Phase 1: Artifact Infrastructure

1. Add `RECAP`, `COACHING`, `PREP` artifact types (backend)
2. Update `EngagementSpaceQuery` to fetch new artifacts
3. Create `RecapArtifact` component (static content)
4. Add to ChatsTabs sidebar and content switch

### Phase 2: Polished Artifact Views

1. Design system integration (states, loading, errors)
2. Add feedback button with global chat integration
3. Implement skeleton loading
4. Add accessibility attributes

### Phase 3: Template Configuration

1. Template config chat interface
2. Template storage (user preferences)
3. Preview panel during configuration
4. Meeting type detection and mapping

### Phase 4: Channel Delivery

1. Share modal with channel selection
2. HubSpot/Slack/Teams integrations
3. Confirmation and undo flows

---

## Summary

| Decision                    | Value                                   |
| --------------------------- | --------------------------------------- |
| **Integration Type**        | Embedded Extension (not new page)       |
| **Primary Extension Point** | `components/chat/chats-tabs.tsx`        |
| **New Component Location**  | `components/recap/`                     |
| **Navigation**              | Sidebar item using `?artifactId=recap`  |
| **Artifact Types**          | RECAP, COACHING, PREP (new enum values) |
| **In-Place Editing**        | Global Chat (already exists)            |

**Rationale:**

The existing `ChatsTabs` architecture is well-suited for this feature:

1. Already supports multiple content types (scorecard, CRM, action items)
2. Uses URL params for state (easy to add recap/coaching/prep)
3. Sidebar pattern matches our tab vision
4. Global chat is already a side sheet (perfect for in-place editing)
5. Artifact fragment pattern is established (Scorecard model)

Building within this system means:

- Faster implementation (reuse existing patterns)
- Consistent UX (users already know the meeting page)
- Lower risk (extend, don't replace)
- Better maintainability (one system, not parallel implementations)

---

_Placement research complete. Ready for prototype phase._
