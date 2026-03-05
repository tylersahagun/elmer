# Storybook Components Audit

**Generated:** 2026-02-28  
**Scope:** `elephant-ai/apps/web/src/components/`  
**Total component files (non-test, non-prototype):** ~626  
**Existing story files:** 144  
**Estimated components missing stories:** ~480+

> Components in `prototypes/` are excluded — they are PM experiment files, not production UI.  
> Components in `primitives/` largely duplicate `ui/` coverage and are also noted where relevant.

---

## Coverage Summary by Area

| Area | Components | Has Stories | Coverage |
|------|-----------|-------------|----------|
| `ui/` primitives | ~75 | ~60 | ~80% |
| `engagements/` | ~30 | 7 | ~23% |
| `chat/` | ~25 | 3 | ~12% |
| `ai-elements/` | ~25 | 0 | 0% |
| `workflows/` | ~40 | 0 | 0% |
| `navigation/` | ~20 | 1 | 5% |
| `company/` | ~8 | 1 | ~12% |
| `settings-v2/` | ~5 | 0 | 0% |
| `knowledge-base/` | ~4 | 0 | 0% |
| `notifications/` | ~4 | 0 | 0% |
| `signals/` | ~15 | 0 | 0% |
| `custom-projects/` | ~5 | 0 | 0% |
| Root-level utils | ~30 | ~15 | ~50% |

---

## Category 1: Top-Level Layout / Navigation

**Priority: CRITICAL** — These are the app shell components. Every engineer and designer needs to know how they work.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `AppSidebar` | `navigation/app-sidebar.tsx` | Extends `React.ComponentProps<typeof Sidebar>` (pass-through) |
| `TopNav` | `navigation/top-nav.tsx` | No props (reads from router/auth context) |
| `NavMain` | `navigation/nav-main.tsx` | No external props |
| `NavHeader` | `navigation/nav-header.tsx` | No external props |
| `NavActions` | `navigation/nav-actions.tsx` | No external props |
| `GlobalCommand` | `navigation/global-command.tsx` | No external props (command palette, Cmd+K) |
| `ContentHeader` | `navigation/content-header.tsx` | Likely `title`, `actions` slot |
| `Content` | `navigation/content.tsx` | Layout wrapper, `children` |
| `TopNavMain` | `navigation/top-nav-main.tsx` | No external props |
| `TopNavMobile` | `navigation/top-nav-mobile.tsx` | No external props |

**What to mock:** Wrap in a `MemoryRouter` or stub the sidebar context. Use `SidebarProvider` wrapper. Show collapsed/expanded states.

---

## Category 2: Core UI Primitives (Missing from `ui/`)

**Priority: HIGH** — These are reusable building blocks with no stories despite being design-system-level components.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `Chart` | `ui/chart.tsx` | Wraps Recharts; `config: ChartConfig`, `children` |
| `Copyable` | `ui/copyable.tsx` | `value?: string`, `formats?: { label, value }[]`, `text?: string`, `disabled?: boolean`, `children` |
| `CornerCalloutRibbon` | `ui/corner-callout-ribbon.tsx` | `label: string` |
| `CustomVideoPlayer` | `ui/custom-video-player.tsx` | `url: string`, `duration: number\|null`, `setDuration`, `thumbnailUrl?`, `hideSlider?`, `videoPlayAndPauseContainerRef` |
| `DeleteConfirmationDialog` | `ui/delete-confirmation-dialog.tsx` | `open`, `onOpenChange`, `onConfirm`, `title`, `description`, `confirmButtonText?`, `cancelButtonText?`, `isLoading?`, `data-analyticsid` |
| `ImageLightbox` | `ui/image-lightbox.tsx` | `open`, `onOpenChange`, `src: string`, `alt?`, `filename?`, `showDownload?` (default true) |
| `LoadingElephant` / `LoadingState` | `ui/loading-state.tsx` | `size?: 'xs' \| 'sm' \| 'lg'`, `className?` |
| `SearchInputV2` | `ui/search-input-v2.tsx` | Extends `InputProps`; `autoFocus?`, `placeholder?` |
| `ScreenHeightContainer` | `ui/screen-height-container.tsx` | Layout utility, likely `children`, `className?` |
| `AdminDot` / `AdminTooltip` / `AdminIndicator` | `ui/admin-indicator.tsx` | `children?`, `tooltipText?`, `showTooltip?`, `className?` |
| `AdminIndicatorV2` | `ui/admin-indicator-v2.tsx` | Similar to above — admin-only visual marker |
| `InputGroup` | `ui/input-group.tsx` | Grouped inputs with labels — check `primitives/input-group.stories.tsx` for reference |
| `ScrollArea` | `ui/scroll-area.tsx` | Base scroll area (differs from `scroll-area-v2`) — check `primitives/scroll-area.stories.tsx` |
| `Typography tokens` | `ui/tokens/typography.tsx` | Semantic type scale: `h1`–`h4`, `p`, `lead`, `large`, `small`, `extraSmall`, `tiny` |

**What to mock:** Most are self-contained. `Chart` needs a `ChartConfig` object and sample data array. `CustomVideoPlayer` needs a hosted video URL stub.

---

## Category 3: Engagement / Meeting Features

**Priority: HIGH** — The core product surface. Many components exist but only email sub-components and timeline have stories.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `EngagementTranscript` | `engagements/engagement-transcript.tsx` | `engagement?: FragmentType<...>`, `clipStart?: number`, `clipEnd?: number` |
| `MeetingSummaryCard` | `engagements/meeting-summary-card.tsx` | `summary: FragmentType<typeof EngagementSummaryDetails>` |
| `MyEngagementCard` | `engagements/my-engagement-card.tsx` | `engagement?`, `isUpcoming?`, `horizontal?`, `onDismiss?`, `dataAnalyticsId?` |
| `MyEngagementCardLight` | `engagements/my-engagement-card.tsx` | `engagement?` (lighter display variant) |
| `MyEngagementEmptyState` | `engagements/my-engagement-empty-state.tsx` | No props (empty state illustration) |
| `EngagementStateBadge` | `engagements/engagement-state-badge.tsx` | `engagementId`, `isRecorded`, `isTranscribing`, `isAnalyzing`, `adverseRecordingReason`, `currentStateConfig`, `variant?: 'default' \| 'compact'`, `onClick?` |
| `EngagementSignals` | `engagements/engagement-signals.tsx` | Likely `engagementId: string` |
| `EngagementCompanyPrep` | `engagements/engagement-company-prep.tsx` | Likely `engagementId: string` |
| `EngagementDropdownMenu` | `engagements/engagement-dropdown-menu.tsx` | `engagementId`, action callbacks |
| `EngagementParticipantsDetails` | `engagements/engagement-participants-details.tsx` | Engagement fragment |
| `EngagementsDataTable` | `engagements/engagements-data-table.tsx` | `engagements?`, `onSortChange`, `nextPageHandler`, `hasNextPage`, `loading?`, `onSelectionChange?` |
| `EngagementLogHistory` | `engagements/engagements-log-history/engagement-log-history.tsx` | `engagementId: string` |
| `EngagementEventLogItem` | `engagements/engagements-log-history/engagement-event-log-item.tsx` | Event object |
| `RecordingReprocessingEvent` | `engagements/engagements-log-history/recording-reprocessing-event.tsx` | Event data |
| `MediaClipDialog` | `engagements/media-clip-dialog.tsx` | `open`, `onOpenChange`, clip data |

**What to mock:** Use `makeFragmentData()` from gql-tada or build a mock fragment helper. For data tables, pass raw mock arrays.

---

## Category 4: AI Chat Interface

**Priority: HIGH** — The central AI interaction surface. Only `ChatMessage` and new-chat sidebar have stories.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `ChatMessageComposer` | `chat/chat-message-composer.tsx` | `handleSubmit`, `loading: boolean`, `attachments`, `showWarning?`, `chatId?`, `showContextIndicator?`, `shouldFocusInput?`, `chatCreatedAt?`, `chatMessageCount?` |
| `ContextIndicator` | `chat/context-indicator.tsx` | Page context entity (company/person/engagement) |
| `EnabledToolsChips` | `chat/enabled-tools-chips.tsx` | List of active tool names |
| `ChatAttachments` | `chat/chat-attachments.tsx` | `attachments` array |
| `ChatsOverview` | `chat/chats-overview.tsx` | No external props (reads from router) |
| `ChatsTabs` | `chat/chats-tabs.tsx` | Tab data, `activeTab`, `onTabChange` |
| `ChatMessageMarkdown` | `chat/messages/chat-message-markdown.tsx` | `content: string` |
| `ReasoningPart` | `chat/messages/reasoning-part.tsx` | Reasoning text content |
| `ToolInvocationPart` | `chat/messages/tool-invocation-part.tsx` | Tool name, args, result |
| `StatusUpdatesPart` | `chat/messages/status-updates-container.tsx` | Status message array |
| `NoteArtifactPart` | `chat/messages/note-artifact-part.tsx` | Note data |
| `SignalArtifactPart` | `chat/messages/signal-artifact-part.tsx` | Signal data |
| `SourcePart` | `chat/messages/source-part.tsx` | Source citations array |

**What to mock:** `ChatMessageComposer` needs `handleSubmit` stub and empty `attachments: []`. Use static mock strings for markdown and reasoning parts.

---

## Category 5: AI Elements (Fully Missing — 0% Coverage)

**Priority: HIGH** — These are AskElephant's most distinctive UI components. Zero stories exist.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `ChainOfThought` / `ChainOfThoughtStep` | `ai-elements/chain-of-thought.tsx` | `ChainOfThought`: `ComponentProps<'div'>` + `defaultOpen?`; `ChainOfThoughtStep`: `title?: string`, `icon?` |
| `Suggestion` / `Suggestions` | `ai-elements/suggestion.tsx` | `Suggestion`: extends `ButtonProps` + `onClick?: () => void`; `Suggestions`: extends `ScrollAreaProps` |
| `InlineCitation` family | `ai-elements/inline-citation.tsx` | `InlineCitationCardTrigger`: `sources: Source[]`; wraps `Badge` |
| `Loader` | `ai-elements/loader.tsx` | `size?: number` (default 16), extends `HTMLAttributes<div>` |
| `CodeBlock` | `ai-elements/code-block.tsx` | `language?: string`, `code: string` |
| `Reasoning` | `ai-elements/reasoning.tsx` | Reasoning step display |
| `Sources` | `ai-elements/sources.tsx` | `sources: Source[]` |
| `PromptInput` | `ai-elements/prompt-input.tsx` | Lexical-based prompt input |
| `ModelSelector` | `ai-elements/model-selector.tsx` | `value: string`, `onChange: (model) => void`, models list |
| `Task` | `ai-elements/task.tsx` | Task status/progress display |
| `Artifact` | `ai-elements/artifact.tsx` | Artifact content renderer |
| `Canvas` | `ai-elements/canvas.tsx` | Canvas/whiteboard surface |
| `Plan` | `ai-elements/plan.tsx` | Agent plan steps |
| `Queue` | `ai-elements/queue.tsx` | Agent task queue |
| `OpenInChat` | `ai-elements/open-in-chat.tsx` | `entityId`, `entityType` |

**What to mock:** Pure presentational components — pass static strings/arrays. ChainOfThought needs 2–3 step objects. InlineCitation needs `sources: [{ title, url }]`.

---

## Category 6: Workflow Builder

**Priority: HIGH** — Core product feature for automation. Zero stories exist.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `WorkflowCards` | `workflows/workflow-cards.tsx` | `workflows: WorkflowFormDialogDetailsFragment[]`, `engagementId?`, `attendeeEmails?`, `emailArtifacts?` |
| `WorkflowCard` | `workflows/workflow-cards.tsx` | `workflow: WorkflowFormDialogDetailsFragment`, `onWorkflowRun`, `workflowRunning: boolean` |
| `WorkflowRunStepCard` | `workflows/workflow-run-step-card.tsx` | `step: WorkflowRunStep`, `isExpanded?`, `onToggle?` |
| `WorkflowNodes` | `workflows/workflow-nodes.tsx` | Extends ReactFlow `NodeProps<WorkflowNodeType>` |
| `WorkflowNodeHeader` | `workflows/workflow-node-header.tsx` | Node title, status, actions |
| `WorkflowRunsTable` | `workflows/workflow-runs-table.tsx` | `workflowRuns[]`, pagination props |
| `WorkflowsTable` | `workflows/workflows-table.tsx` | `workflows[]`, actions |
| `WorkflowRunStepsDrawer` | `workflows/workflow-run-steps-drawer.tsx` | `open`, `workflowRun`, `onClose` |
| `WorkflowActionsDialog` | `workflows/workflow-actions-dialog.tsx` | Dialog open/close + workflow context |
| `WorkflowFormDialog` | `workflows/workflow-form-dialog.tsx` | Create/edit form |
| `WorkflowStateNode` | `workflows/workflow-state-node.tsx` | State machine node |

**What to mock:** Define a `mockWorkflow` object matching `WorkflowFormDialogDetailsFragment` shape. For node components, wrap in a ReactFlow Provider.

---

## Category 7: Company & Contact Views

**Priority: MEDIUM** — Core CRM-adjacent views. Only `HealthScorePanel` has a story.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `CompanyLogo` | `company/company-logo.tsx` | `domain?: string`, `name?: string`, `containerSize: number`, `imgSize: number`, `className?` |
| `CompanyDetail` | `company/company-detail.tsx` | `companyId: string` (loads via GraphQL fragment) |
| `CompanyDataTable` | `company/company-data-table.tsx` | `companies[]`, sort/filter props |
| `CompanySelect` | `company/company-select.tsx` | `value?`, `onChange`, `placeholder?` |
| `CompanyMeetingsPanel` | `company/company-meetings-panel.tsx` | `companyId: string` |
| `ImportCompanyDialog` | `company/import-company-dialog.tsx` | `open`, `onOpenChange` |
| `ContactSelect` | `contacts/contact-select.tsx` | `value?`, `onChange`, `companyId?` |

**What to mock:** `CompanyLogo` is fully self-contained — just pass `domain="google.com"` and sizes. Others need GraphQL mock wrappers (use `MockedProvider`).

---

## Category 8: Notification & System Shell

**Priority: MEDIUM** — Global app-level components every user sees.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `NotificationCenter` | `notifications/notification-center.tsx` | No props (reads from context) |
| `NotificationSettings` | `notifications/notification-settings.tsx` | No props |
| `NotificationPermissionModal` | `notifications/notification-permission-modal.tsx` | `open`, `onOpenChange` |
| `SystemBanner` | `system-banner.tsx` | No props (reads from app config/context) |
| `SplashScreen` | `splash-screen.tsx` | No props (loading screen) |

**What to mock:** Most are zero-prop. Wrap in a theme provider and show light/dark variants. For `NotificationCenter`, mock the notification list via context.

---

## Category 9: Settings

**Priority: MEDIUM** — Settings are a key retention surface.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `SettingsV2` | `settings-v2/settings-v2.tsx` | Container/router for settings pages |
| `SettingsSidebar` | `settings-v2/settings-sidebar.tsx` | Navigation items, active section |
| `Profile` | `settings-v2/profile.tsx` | User profile form |
| `BotSettings` | `workspaces/bot-settings.tsx` | Notetaker bot config form |
| `SecuritySettings` | `workspaces/security-settings.tsx` | SSO/security form |
| `ApiKeysTable` | `workspaces/api-keys-table.tsx` | `apiKeys[]`, `onRevoke`, `onCreate` |
| `ZoomSettings` | `workspaces/zoom-settings.tsx` | Zoom OAuth connection form |

**What to mock:** Use controlled form state (React Hook Form mocks). For containers, show the layout with stubbed child content.

---

## Category 10: Knowledge Base

**Priority: MEDIUM** — Feature for agent grounding. No stories at all.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `KnowledgeSourceCard` | `knowledge-base/knowledge-source-card.tsx` | `knowledgeSource: FragmentType<typeof KnowledgeSourceCardDetails>` |
| `KnowledgeSourceTable` | `knowledge-base/knowledge-source-table.tsx` | `knowledgeSources[]`, pagination |
| `KnowledgeBaseSelectDialog` | `knowledge-base/knowledge-base-select-dialog.tsx` | `open`, `onOpenChange`, `onSelect` |
| `TextKnowledgeSourceFormDialog` | `knowledge-base/text-knowledge-source-form-dialog.tsx` | Create form dialog |

**What to mock:** Build a `mockKnowledgeSource` object with `id`, `name`, `isReviewed`, `type` fields.

---

## Category 11: Tags, Signals & Custom Projects

**Priority: MEDIUM** — Feature-specific but widely used across the app.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `TagSelector` | `tags/tag-selector.tsx` | `value?: string[]`, `onChange`, `placeholder?` |
| `TagsList` | `tags/tags-list.tsx` | `tags: Tag[]`, `onRemove?` |
| `TagsTable` | `tags/tags-table.tsx` | `tags[]`, edit/delete actions |
| `UnifiedTagManager` | `tags/unified-tag-manager.tsx` | Full tag CRUD interface |
| `PropertyTable` | `signals/property-table.tsx` | Signal property definitions table |
| `SignalsTable` | `signals/signals-table.tsx` | `signals[]`, column config |
| `CustomProjectCard` | `custom-projects/custom-project-card.tsx` | `project`, `stageDefinitions`, `onDragStart`, `onDragEnd`, `onOpen` |
| `CustomProjectsBoard` | `custom-projects/custom-projects-board.tsx` | `projects[]`, `stages[]`, drag-drop callbacks |
| `CustomProjectDetailsModal` | `custom-projects/custom-project-details-modal.tsx` | `projectId`, `open`, `onOpenChange` |

---

## Category 12: Root-Level Utility Components (Partially Covered)

**Priority: LOW–MEDIUM** — Small utilities; some already have stories, these are the gaps.

### Missing Stories

| Component | File | Primary Props |
|-----------|------|---------------|
| `AiFilterInfo` | `ai-filter-info.tsx` | AI-generated filter context indicator |
| `AlertTryAgainContactSupport` | `alert-try-again-contact-support.tsx` | `onRetry?: () => void` |
| `ButtonOverlay` | `button-overlay.tsx` | Overlay button on a content block |
| `ComingSoonTooltip` | `coming-soon-tooltip.tsx` | `children`, `message?` |
| `ConnectToCrmPlatform` | `connect-to-crm-platform.tsx` | `platform: 'hubspot' \| 'salesforce'` |
| `CopyToClipboard` | `copy-to-clipboard.tsx` | `text: string` |
| `DataSourceIcons` | `data-source-icons.tsx` | `sources: DataSource[]` |
| `EnabledToolsSelector` | `enabled-tools-selector.tsx` | `value: string[]`, `onChange` |
| `TeamMemberStatusBadge` | `team-member-status-badge.tsx` | `role: UserRole`, `size?: 'sm' \| 'md'` |
| `VideoPlayer` | `video-player.tsx` | `url: string`, `poster?`, control props |

---

## Recommended Build Order

Based on impact × effort:

1. **AI Elements** (`ai-elements/`) — Unique to AskElephant, designers need these for any new AI feature work. All are small, presentational, zero GraphQL.
2. **Core UI gaps** (`ui/chart`, `ui/loading-state`, `ui/delete-confirmation-dialog`, `ui/image-lightbox`, `ui/copyable`) — High reuse, easy to mock.
3. **Engagement cards** (`MyEngagementCard`, `EngagementStateBadge`, `MeetingSummaryCard`) — Appear on every rep's dashboard.
4. **Chat Composer** (`ChatMessageComposer`) — The primary input. One complex story covers most states.
5. **Workflow cards** (`WorkflowCard`, `WorkflowRunStepCard`) — Needed for workflow builder design work.
6. **Navigation** (`AppSidebar`, `TopNav`) — Once layout stories exist, all page-level stories become much easier.

---

## Notes on GraphQL-Heavy Components

Many feature components (Engagements, Company, Chat) use `FragmentType<...>` from `gql-tada`. To mock these in Storybook:

```tsx
// Option A: MockedProvider (Apollo)
import { MockedProvider } from '@apollo/client/testing';

// Option B: makeFragmentData helper
import { makeFragmentData } from '@/graphql/tada';
const mockEngagement = makeFragmentData({ id: '1', title: 'Discovery Call', ... }, MyEngagementCardFragment);

// Option C: Cast for stories only
const mockData = { id: '1', ... } as unknown as FragmentType<typeof SomeFragment>;
```

Option C is fastest for story scaffolding. Option B is more correct for long-term maintenance.
