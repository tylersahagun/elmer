# AskElephant Product Taxonomy (Canonical Draft for PostHog)

Last updated: 2026-02-11  
Sources: `elephant-ai/apps/web/src` routes/components, `elephant-ai/apps/functions/src` workflows/agents/jobs, PM workspace docs.

This document is intentionally exhaustive. Any uncertain item is marked `[NEEDS VERIFICATION]` instead of omitted.

---

# Product Area: Global Navigation & App Shell

## Overview
- Name: Global Navigation & App Shell
- Description: The persistent application framework that provides navigation, routing, workspace context, command execution, chat access, and global utilities.
- Core user personas: Sales reps, managers, CS, RevOps, workspace owners/admins, super admins.
- Human vs. automated: 95% human-initiated, 5% system-initiated (feature-flag layout changes, notification permission prompts).

## Features

### Feature: Sidebar / Top Navigation
- Description: Primary way users move across product surfaces.
- Entry points: Post-auth app load in `RootLayout`.
- Key user actions:
  - Navigate to Search, Meetings, Chats, Workflows, Customers/Companies.
  - Open settings/profile menu.
  - Trigger quick actions (upload, send notetaker, audio recorder).
- Key system/AI actions:
  - Feature flags switch between sidebar/top-nav (`top-navigation-enabled`).
  - Role checks hide/show protected items.
- Success criteria: Users can reach core workflows in 1-2 clicks; low nav backtracking.

### Feature: Global Command Palette
- Description: Keyboard-first launcher for navigation and settings.
- Entry points: `Cmd/Ctrl+K` or `Cmd/Ctrl+L` (depends on `global-chat-enabled`).
- Key user actions:
  - Open palette, type command, navigate.
  - Jump to Search, Meetings, Ask Elephant, Settings.
- Key system/AI actions:
  - Suggestion groups adapt to role (super-admin items only when allowed).
- Success criteria: High usage among power users; reduced time-to-destination.

### Feature: Global Chat Surface
- Description: Chat panel that can be embedded in layout and contextually scoped.
- Entry points: Header/nav chat action; route-based chat pages; layout panel.
- Key user actions:
  - Open/close panel, ask questions, run tools.
- Key system/AI actions:
  - Layout behavior changes in workflow builder and flagged modes.
- Success criteria: Frequent use from non-chat pages; reduced context switching.

### Feature: Notification Permissions + In-app Notification Access
- Description: Browser notification permission handling and notification preference access.
- Entry points: Permission modal in layout; notifications route.
- Key user actions:
  - Accept/dismiss browser notification permission.
  - Configure workflow notification preferences.
- Key system/AI actions:
  - Show modal based on permission state + feature flag.
- Success criteria: High permission acceptance and active preference configuration.

## Pages & Views

### Page: Root App Layout — `/workspaces/:workspaceId/*`
#### Section: App Frame
- Element: layout container — route outlet renders active page — always.
- Element: sidebar/top-nav switch — toggles nav paradigm by `top-navigation-enabled` — conditional (feature flag).
- Element: banner area — shows system/impersonation banners — conditional (state-based).

#### Section: Primary Navigation (`NavMain` / `TopNavMain`)
- Element: link — `Search` — navigates to `/workspaces/:workspaceId/search` — always.
- Element: link — `My meetings` — navigates to `/workspaces/:workspaceId/engagements` — always.
- Element: link — `Action items` — navigates to `/workspaces/:workspaceId/action-items` — conditional (`action-items-page`).
- Element: link — `Customers` — navigates to `/workspaces/:workspaceId/customers` — conditional (`customers-page`).
- Element: link — `Companies` — navigates to `/workspaces/:workspaceId/companies` — conditional (fallback when `customers-page` off).
- Element: link — `Contacts` — navigates to `/workspaces/:workspaceId/contacts` — conditional (fallback when `customers-page` off).
- Element: link — `Chats` / `AskElephant` — navigates to new chat route — label conditional (`chats-sidebar-update`).
- Element: link — `Knowledge base(s)` — navigates to KB route(s) — conditional (`knowledge-bases`, role/availability).
- Element: link — `Workflows` / `Automations` — navigates to `/workspaces/:workspaceId/workflows` — conditional (`useIsManager()`).

#### Section: Nav Actions
- Element: button — `Upload` — starts upload flow — always.
- Element: button — `Send notetaker` — opens notetaker scheduling flow — always.
- Element: button — `Audio recorder` — opens recording utility — always.

#### Section: Viewer / Account Menu
- Element: menu item — `Settings` — opens settings route — always.
- Element: menu item — `Integrations` — opens integrations settings — conditional (`owner`).
- Element: menu item — `Billing` — opens billing settings — conditional (`owner`).
- Element: menu item — `Authorization` — opens authz settings — conditional (`owner` + `fga-engine-beta`).
- Element: menu item — `Sign out` — logs out and redirects to `/login` — always.

#### Section: Super Admin Nav
- Element: link — `Workspaces` — `/admin/workspaces` — conditional (`useIsSuperAdmin()`).
- Element: link — `Users` — `/admin/users` — conditional (`useIsSuperAdmin()`).
- Element: link — `Recipes` — `/admin/recipes` — conditional (`useIsSuperAdmin()`).
- Element: link — `Adverse engagements` — `/admin/adverse-engagements` — conditional (`useIsSuperAdmin()`).

### Page: Command Palette — global overlay
#### Section: Command Dialog
- Element: keyboard shortcut — open palette (`Cmd/Ctrl+K/L`) — always.
- Element: input — command search field — filters command items — always.
- Element: list item — `Search` — navigate to search page — always.
- Element: list item — `My Meetings` — navigate to engagements list — always.
- Element: list item — `Ask Elephant` — navigate to chats — always.
- Element: list item — `Settings` and sub-settings — navigate to settings routes — conditional (role + feature flags).
- Element: list item — `Admin` commands — navigate to admin routes — conditional (`super admin`).

### Page: Notifications Preferences — `/workspaces/:workspaceId/notifications`
#### Section: Notification Preferences Card
- Element: toggle — per-workflow push notification preference — updates Novu/workflow preference — conditional (`browser-notifications-feature`).
- Element: disabled toggle — critical workflows locked — view only — conditional (workflow type).

### Page: Browser Notification Permission Modal — global overlay
#### Section: Permission Prompt
- Element: button — `Accept` — request browser notification permission — conditional (`shouldShowModal` + feature flag).
- Element: button — `Dismiss` — close modal without permission grant — conditional (`shouldShowModal` + feature flag).

## Automated Processes
- Trigger: app load + permission state check  
  - Process: evaluate browser notification capability and whether modal should show  
  - Outputs: modal state, permission prompts  
  - Entities affected: user/browser permission context.
- Trigger: feature flag evaluation (PostHog)  
  - Process: swap nav layout/labels/routes visibility  
  - Outputs: conditional UI exposure  
  - Entities affected: workspace/user feature exposure.

---

# Product Area: Marketing Site & Signup

## Overview
- Name: Marketing Site & Signup
- Description: Public-facing acquisition surfaces and auth entry into the product experience. Marketing pages are confirmed to exist (managed outside this app codebase).
- Core user personas: Prospects, trial users, evaluators, admins setting up workspace.
- Human vs. automated: 90% human-initiated, 10% automated (redirects, auth verification emails, feature-flag gating).

## Features

### Feature: Login
- Description: Multi-path login flow (email, Google, Microsoft, SSO).
- Entry points: `/login`, deep-link redirects, logout redirect.
- Key user actions:
  - Enter email and authenticate.
  - Choose identity provider.
  - Verify code in follow-up step.
- Key system/AI actions:
  - Determine auth path (`authInitiateLogin`).
  - Route enterprise emails to password flow.
- Success criteria: High login completion rate; low auth drop-off.

### Feature: Signup
- Description: 2-step account + workspace creation flow.
- Entry points: `/signup`.
- Key user actions:
  - Enter personal details.
  - Enter workspace/company metadata.
  - Submit and continue to success/login.
- Key system/AI actions:
  - Create user + workspace (`createWorkspaceWithUser`).
  - Gate signup via `signup-enabled` feature flag.
- Success criteria: Trial/workspace creation completion and first-login conversion.

### Feature: Onboarding Wizard
- Description: Guided activation for persona setup, calendar connect, team invite, app download.
- Entry points: first authenticated session (`/onboarding`).
- Key user actions:
  - Complete role/persona step(s).
  - Connect calendar.
  - Invite teammates.
  - Download desktop app.
- Key system/AI actions:
  - Persist onboarding state and step transitions.
  - Skip/continue logic by required/optional step.
- Success criteria: Onboarding completion and first recorded meeting.

### Feature: Public Clip Share
- Description: Public link to a meeting clip with playback and chat summary experience.
- Entry points: `/share/clips/:clipId`.
- Key user actions:
  - Watch clip.
  - Read/copy transcript.
  - Ask follow-up questions in clip chat.
- Key system/AI actions:
  - Poll for clip/transcript readiness.
  - Enforce message limits in public chat experience.
- Success criteria: Clip viewed-to-shared conversion; clip-chat engagement.

## Pages & Views

### Page: Login — `/login`
#### Section: Login Form
- Element: input — `Email` — starts auth initiation — always.
- Element: button — `Continue` — submit email path — always.
- Element: button — `Continue with Google` — OAuth login — always.
- Element: button — `Continue with Microsoft` — OAuth login — always.
- Element: button/link — `SSO` — start WorkOS SSO flow — conditional (tenant/org usage) `[NEEDS VERIFICATION]`.
- Element: link — `Sign up` — navigate to signup — always.

### Page: Verify Code — `/login/verify-code`
#### Section: Verification Form
- Element: input — code/verification token — verify auth — always.
- Element: button — `Verify` — complete login — always.
- Element: link/button — resend code — resend verification — `[NEEDS VERIFICATION]`.

### Page: Signup — `/signup`
#### Section: Step 1 (Personal Info)
- Element: input — `First name` — update form state — always.
- Element: input — `Last name` — update form state — always.
- Element: input — `Email` — update form state — always.
- Element: button — `Continue` — validate and proceed to step 2 — always.
- Element: link — `Log in` — navigate to `/login` — always.

#### Section: Step 2 (Workspace Info)
- Element: input — `Workspace name` — update form state — always.
- Element: dropdown — `Company size` — select enum — always.
- Element: dropdown — `Industry` — select enum — always.
- Element: button — `Create workspace` — submit create mutation — always.

### Page: Signup Success — `/signup/success`
#### Section: Success Confirmation
- Element: button/link — `Go to login` — navigate to `/login` — always.

### Page: Onboarding — `/onboarding`
#### Section: Step Container
- Element: button — `Back` — go to previous step — conditional (disabled on first step).
- Element: button — `Next` / `Continue` — advance step — always.
- Element: button/link — `Skip` — skip optional steps — conditional (non-required steps).

#### Section: Persona Selection
- Element: option card — persona role selection — set persona — always.

#### Section: Conversation Vibe
- Element: selector controls — set style/tone prefs — `[NEEDS VERIFICATION]`.

#### Section: Special Powers
- Element: multi-select/toggles — choose capabilities/interests — `[NEEDS VERIFICATION]`.

#### Section: Review Info
- Element: editable fields/buttons — confirm profile/workspace metadata — `[NEEDS VERIFICATION]`.

#### Section: Connect Calendar
- Element: button — connect Google/Microsoft calendar — begin OAuth connect — always.
- Element: button — continue without connect — conditional `[NEEDS VERIFICATION]`.

#### Section: Invite Team
- Element: input — teammate email(s) — add invite recipients — always.
- Element: button — `Send invites` — invite users — always.
- Element: button — `Skip` — skip invites — conditional.

#### Section: Download App
- Element: button — download desktop app — starts download flow — always.
- Element: button — `Continue to AskElephant` — completes onboarding — always.

### Page: Public Clip Share — `/share/clips/:clipId`
#### Section: Header
- Element: button — `Copy link` — copies clip URL — always.
- Element: button/icon — `Open playback sheet` — opens mobile playback panel — conditional (mobile).

#### Section: Playback
- Element: video player — play/pause/seek clip — conditional (video available).
- Element: button — `Copy transcript` — copies transcript text — conditional (transcript available).
- Element: toggle — transcript auto-scroll — toggles follow mode — conditional (transcript available).
- Element: row click — transcript entry — seeks video to timestamp — conditional (timestamped lines).

#### Section: Clip Chat
- Element: tab — `Action items` — swap prompt context — always.
- Element: tab — `Summary` — swap prompt context — always.
- Element: tab — `Something else...` — freeform chat context — always.
- Element: input — chat message box — submit question — conditional (message limit not reached).
- Element: button — `Send` — send prompt — conditional (`!isAIResponding` and message budget).
- Element: link/button — `Learn more` / `AskElephant` — open landing page — always.

#### Section: Empty/Error/Loading States
- Element: state view — `Waiting for transcript to process...` — appears while transcript unavailable.
- Element: state view — `NotFound` — shown when clip missing or timeout.
- Element: state view — message limit warning/counter — shown near limit.

## Automated Processes
- Trigger: signup form submit  
  - Process: create workspace + user record  
  - Outputs: user/session state, workspace object  
  - Entities affected: user, workspace.
- Trigger: login initiation  
  - Process: determine auth method and send verification/email flow  
  - Outputs: verification state, token exchange  
  - Entities affected: user auth session.
- Trigger: public clip page open  
  - Process: poll for clip/transcript readiness  
  - Outputs: playable media and transcript availability status  
  - Entities affected: clip, transcript metadata.

---

# Product Area: Call/Meeting Recording & Transcription

## Overview
- Name: Call/Meeting Recording & Transcription
- Description: Captures meeting content from bots, platform imports, and uploads; provides searchable recordings, transcripts, clips, and participant context.
- Core user personas: Sales reps, managers, CS, RevOps.
- Human vs. automated: 40% human-initiated, 60% automated (bot joins, ingestion, transcription, embedding, post-processing).

## Features

### Feature: Meetings List & Calendar Context
- Description: Central view for upcoming and past engagements with tabs, search, and clip access.
- Entry points: nav `My meetings`, direct route.
- Key user actions:
  - Browse upcoming/recorded/all meetings.
  - Search/filter meetings.
  - Open meeting detail.
  - Import Zoom recordings.
- Key system/AI actions:
  - Detect connected integrations and meeting eligibility.
  - Generate empty-state CTAs dynamically.
- Success criteria: Users consistently reach recorded meeting detail quickly; reduced missed meetings.

### Feature: Engagement Detail Workspace
- Description: Full meeting detail with transcript, chat tabs, recording state, participant/company context, and side-panel insights.
- Entry points: meetings list row click, search row click, deep-link.
- Key user actions:
  - View transcript and signals.
  - Start/join recording flow for upcoming meetings.
  - Create media clips.
  - Toggle visibility/audience.
- Key system/AI actions:
  - Show adverse recording state when capture fails.
  - Power chat tabs with AI artifacts and summaries.
- Success criteria: Meeting-to-insight time drops; high transcript + chat consumption.

### Feature: Transcript + Clips
- Description: Generates and displays transcript; allows extraction and sharing via clips.
- Entry points: engagement detail, clip creation dialog, public clip links.
- Key user actions:
  - Read transcript and jump via timestamps.
  - Create/share clips.
  - Copy transcript content.
- Key system/AI actions:
  - Speaker assignment + metadata extraction.
  - Clip naming/transcript readiness polling.
- Success criteria: Clip creation and external share rates; transcript usage frequency.

### Feature: Recording Controls & Visibility
- Description: Controls recording intent and who can access meeting content.
- Entry points: engagement header controls, dropdown menus.
- Key user actions:
  - Start/stop/schedule recording.
  - Manage meeting audience/visibility.
  - Reprocess/retranscribe failed sessions.
- Key system/AI actions:
  - Apply recording state badges and adverse reason handling.
- Success criteria: Fewer failed recordings; higher confidence in capture reliability.

## Pages & Views

### Page: Meetings List — `/workspaces/:workspaceId/engagements`
#### Section: Header + Tabs
- Element: tab — `Upcoming meetings` — show upcoming list — conditional (layout mode).
- Element: tab — `Recorded` — show recorded meetings — always.
- Element: tab — `All Meetings` — include not-recorded meetings — always.
- Element: tab — `Clips` — show media clips — always.
- Element: button — search toggle — reveal search input — always.
- Element: input — search meetings — filters meeting list — conditional (search mode on).

#### Section: Calendar + Upcoming Strip
- Element: button — `Scroll left` — horizontal upcoming list navigation — conditional (`canScrollLeft`).
- Element: button — `Scroll right` — horizontal upcoming list navigation — conditional (`canScrollRight`).
- Element: button — `Undo` — restore dismissed upcoming meeting cards — conditional (dismissed list non-empty).
- Element: button — `Return to top` — scrolls page to top — conditional (scrolled below threshold).

#### Section: Integrations / Import
- Element: button — `Import Zoom recordings` — opens import dialog — conditional (`hasFullZoomAccess`).
- Element: date picker + action controls — import range selection — inside modal.

#### Section: Empty States
- Element: CTA button — `Connect calendar` — launches calendar connect flow — conditional (no calendar integration).
- Element: CTA button — `Connect Zoom` — launches Zoom connect flow — conditional (Zoom host context + not connected).
- Element: button — `Decline` (Zoom prompt) — suppresses CTA — conditional.

### Page: Engagement Detail — `/workspaces/:workspaceId/engagements/:engagementId`
#### Section: Header
- Element: recording control — notetaker controller — controls recording intent — conditional (upcoming meetings).
- Element: badge — engagement state — shows recording/transcription state — conditional (past meetings).
- Element: participant pill/list — inspect participants — always.
- Element: link(s) — company references — navigate to company pages — conditional (companies present).
- Element: menu — engagement dropdown — opens edit/delete/reprocess options — always.
- Element: button — visibility toggle — update audience visibility — always.
- Element: button — `Join meeting` — open meeting URL — conditional (`hasMeetingUrl` and upcoming).
- Element: button — `Create clip` — opens clip creation dialog — conditional (past meeting).

#### Section: Main Content
- Element: tab/list controls — `ChatsTabs` selections (overview/chat/action items/notes/scorecard/CRM/external sync) — always.
- Element: email thread area — email engagement content — conditional (engagement type email).
- Element: adverse state panel — failure explanation with recovery CTAs — conditional (adverse recording reason).

#### Section: Right Panel
- Element: toggle button — minimize/expand panel — always.
- Element: tab/selector — `Transcript` — show transcript panel — conditional (past meeting).
- Element: tab/selector — `Signals` — show extraction table — conditional (`extractions-table` flag).
- Element: tab/selector — `Event log` — show notetaker event log — conditional (`notetaker-event-log` flag).
- Element: tag selector — assign tags to engagement — conditional (past meeting panel).
- Element: prep panel — `EngagementCompanyPrep` — pre-meeting prep context — conditional (upcoming + company context).

#### Section: Modals
- Element: dialog — `Edit title` — update engagement title — from dropdown.
- Element: dialog — `Delete engagement` — confirm deletion — from dropdown.
- Element: dialog — `Audience` — manage visibility audiences — from dropdown.
- Element: dialog — `Create media clip` — configure/start/end clip — from header.

#### Section: Empty/Error/Loading
- Element: state view — loading skeleton/spinner — appears while fetching.
- Element: state view — not found page — appears when engagement missing/invalid.
- Element: state view — adverse recording CTA panel — appears on failed capture/reprocessing scenarios.

### Page: Engagement Search — `/workspaces/:workspaceId/search`
#### Section: Search Controls
- Element: tab — `All events` — set quick filter — always.
- Element: tab — `My events` — set owner-scoped quick filter — always.
- Element: tab — `Folders` — folder-based view — always.
- Element: input — search text — debounced query over engagements — always.

#### Section: Header Actions
- Element: control — `UnifiedTagManager` — bulk tag operations — conditional (selected rows).
- Element: dropdown — `Filter` — apply filter predicates — always.
- Element: drawer toggle — `ColumnSelector` — select visible columns — conditional (`extractions-table`).
- Element: button — `Export CSV` — exports current table — conditional (grid ready + rows exist).
- Element: button — `Run Signals` — trigger signal evaluation — conditional (flag + selection/state).
- Element: button — `New Chat` — start chat with selected engagements context — conditional (selected rows).

#### Section: Table (`EngagementsDataTable`)
- Element: checkbox — row selection — selects engagements for bulk actions — always.
- Element: link cell — title — navigate to engagement detail — always.
- Element: column header — sort control — sorts dataset — always.
- Element: tags cell controls — add/remove tags inline — conditional (permissions).
- Element: infinite-scroll row — load more data — conditional (more pages).

#### Section: State-dependent UI
- Element: alert + button — `Reset to default` for privacy configuration mode — conditional (`privacyconfiguration=true`).
- Element: no-rows display — empty table state — conditional (no results).

## Automated Processes
- Trigger: new meeting/engagement ingestion (Firestore/event/webhook)  
  - Process: `processNewEngagementEventHandler`, platform-specific ingestion (Recall/Zoom/Gong/etc.)  
  - Outputs: engagement records, media/transcript pipeline enqueue  
  - Entities affected: engagements, recordings, participants.
- Trigger: uploaded media file finalized  
  - Process: `processUploadedFileEventHandler` + transcription metadata extraction  
  - Outputs: transcript payload, metadata, processing states  
  - Entities affected: uploaded files, engagements, transcripts.
- Trigger: transcript available  
  - Process: embedding + annotation extraction (`processTranscriptEmbeddingHandler`, metadata functions)  
  - Outputs: searchable transcript vectors, extracted entities/signals  
  - Entities affected: transcript chunks, embeddings, signal candidates.
- Trigger: scheduled maintenance windows  
  - Process: post-meeting email sends, chunk timeout schedulers  
  - Outputs: recap notifications, stale processing recovery  
  - Entities affected: users, engagement processing queues.

---

# Product Area: AI Chat ("Ask Elephant")

## Overview
- Name: AI Chat (Ask Elephant)
- Description: Conversational intelligence layer for querying meetings, customers, CRM context, and knowledge sources across the workspace.
- Core user personas: Sales reps, managers, CS, RevOps, workspace owners.
- Human vs. automated: 70% human-initiated, 30% automated (tool calls, retrieval, status updates, background chat processing).

## Features

### Feature: Standalone Chat Workspace
- Description: Dedicated chats area with pinned/unpinned conversations and message threads.
- Entry points: nav item (`Chats/AskElephant`), direct routes.
- Key user actions:
  - Create new chat.
  - Search chats.
  - Pin/unpin, rename, delete chat.
  - Send messages and follow responses.
- Key system/AI actions:
  - Stream responses and tool outputs.
  - Auto-handle chat status/errors.
- Success criteria: Repeat chat usage and successful answer completion.

### Feature: Contextual Embedded Chat
- Description: Chat surfaces embedded in engagement, company, and contact views (via `ChatsTabs`).
- Entry points: engagement/company/contact detail pages.
- Key user actions:
  - Ask context-aware questions.
  - Switch between chat and artifacts (action items, notes, scorecards, CRM updates).
- Key system/AI actions:
  - Attach relevant documents/context automatically.
  - Render workflow/status artifacts inline.
- Success criteria: High embedded usage relative to standalone chat.

### Feature: Tool Invocation + Prompting
- Description: AI responses can invoke tools, show status updates, and return actionable outputs.
- Entry points: message composer + tool selectors.
- Key user actions:
  - Select/enable tools.
  - Use suggested prompts.
  - Review tool output and follow-ups.
- Key system/AI actions:
  - Execute tool calls (`chatApiHandler`, tool routing, MCP integrations).
  - Return citations/status/errors.
- Success criteria: Tool-call completion and downstream action adoption.

### Feature: Chat Response Actions
- Description: User-level interactions on AI outputs (copy, navigate, review source parts, CRM/handoff follow-up in embedded contexts).
- Entry points: message action controls and embedded cards.
- Key user actions:
  - Copy text/output.
  - Open linked entities (CRM/object links).
  - Approve/retry downstream sync actions from related cards.
- Key system/AI actions:
  - Track response states and retry paths.
- Success criteria: High conversion from response to action.

## Pages & Views

### Page: Chats Layout — `/workspaces/:workspaceId/chats`
#### Section: Header
- Element: button — `New Chat` — creates/navigates to new chat — always.

#### Section: Sidebar
- Element: input — `Search chats` — filters pinned/unpinned chats — always.
- Element: button/icon — new chat — creates chat — always.
- Element: link row — pinned/unpinned chat title — open selected chat — always.
- Element: button — sidebar collapse toggle — collapse/expand chat list — always.
- Element: dropdown action — `Pin/Unpin` — toggle pinned state — per-chat.
- Element: dropdown action — `Update title` — opens rename dialog — per-chat.
- Element: dropdown action — `Delete` — opens delete confirmation — per-chat.
- Element: dropdown action — `Go to workflow` — navigates to linked workflow — conditional (chat linked to workflow).

#### Section: Sidebar States
- Element: empty state — `No Pinned chats` — shown when list empty.
- Element: empty state — `No chats` — shown when no unpinned chats.
- Element: spinner — loading chats — shown while loading and no list yet.

### Page: Chat Thread — `/workspaces/:workspaceId/chats/:chatId`
#### Section: Message Stream
- Element: scroll container — message history — always.
- Element: button — `New messages` indicator — scroll to bottom — conditional (`hasNewMessages`).
- Element: message action(s) — copy/open links/tool part actions — conditional (message part type) `[NEEDS VERIFICATION]`.

#### Section: Composer
- Element: lexical input — message text entry — always.
- Element: button — send/submit — submits prompt — conditional (not streaming/submitting).
- Element: control — tool selector — include/exclude tools — conditional (tool-enabled mode).
- Element: control — model selector — choose model — conditional (feature/config).
- Element: control — attachment picker — attach files/docs — conditional.
- Element: control — prompt library quick picks — insert prompts — conditional.

#### Section: States
- Element: empty state card — `Secure and Trusted Communication` — shown when no messages.
- Element: error card — chat error type display — shown on chat errors.
- Element: not-found card — `Chat Not Found` — shown on missing/deleted chat.
- Element: loading state — large loader before initial data.

### Page: Embedded Chat Surfaces — in detail pages
#### Section: `ChatsTabs` Sidebar
- Element: button — `New chat` — create new contextual chat — always.
- Element: tab item — `Prepare for meeting` — show pre-meeting prep state — conditional (engagement context).
- Element: tab item — `CRM Sync` — open CRM field update card — conditional (`crm-field-updates` + events exist).
- Element: tab item — external integration sync items — open external object sync cards — conditional (events exist and flag allows).
- Element: tab item — `Scorecard` — open scorecard artifact — conditional (`scorecard-component` + artifacts exist).
- Element: tab item — `Action items` — open action item overview — conditional (items exist).
- Element: tab item — `Notes` — open notes card — conditional (notes exist).
- Element: chat list item — open existing conversation — always.

#### Section: Contextual Main Panel
- Element: panel switcher logic — render overview/chat/action/note/scorecard/CRM/external sync — conditional by URL params + available entities.
- Element: adverse state replacement panel — blocks chat and shows remediation — conditional (`adverseRecordingReason`).

### Page: Knowledge-base scoped chat — `/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId/chats/:chatId?`
#### Section: Chat content
- Element: same core chat elements as thread page — scoped by KB context — conditional (`knowledge-bases` feature enabled).

## Automated Processes
- Trigger: chat message submitted  
  - Process: `chatApiHandler`/`chatApiHandlerV2` pipelines message to agent/tool stack  
  - Outputs: streamed assistant messages, tool invocations, status updates  
  - Entities affected: conversations, messages, tool execution records.
- Trigger: tool invocation needed  
  - Process: resolve and execute tool (including MCP/composio integrations)  
  - Outputs: tool results, side effects (e.g., CRM update candidates)  
  - Entities affected: tool-run logs, associated domain entities.
- Trigger: document attachment/context request  
  - Process: `attachDocumentsToConversation` and retrieval steps  
  - Outputs: contextualized responses with source references  
  - Entities affected: conversation-document associations.

---

# Product Area: AI Agents & Workflow Automation

## Overview
- Name: AI Agents & Workflow Automation
- Description: No-code automation builder for event-triggered and scheduled workflows, AI-assisted node configuration, and execution monitoring.
- Core user personas: Managers, RevOps, admins/power users.
- Human vs. automated: 35% human-initiated, 65% automated (triggered runs, scheduled executions, background orchestration).

## Features

### Feature: Workflow List + Templates
- Description: Browse/create/edit workflows, including template/recipe starts.
- Entry points: nav `Workflows/Automations`, settings redirects, tab deep links.
- Key user actions:
  - Create workflow (blank or from recipe).
  - Search/filter workflows.
  - Open workflow history.
  - Delete (single/bulk).
- Key system/AI actions:
  - Populate list from backend with status metadata.
  - Gate features via flags (bulk delete, prompts tab).
- Success criteria: Workflow creation-to-first-run conversion.

### Feature: Workflow Builder (Canvas)
- Description: React Flow builder with triggers, actions, node sheets, AI fix assistance, and run testing.
- Entry points: workflow detail route.
- Key user actions:
  - Add trigger/action nodes.
  - Configure node schema in side sheet.
  - Save/activate workflow.
  - Test-run workflow.
- Key system/AI actions:
  - Validate graph (single trigger, schema validity).
  - Suggest or auto-fix errors with AI.
- Success criteria: Successful save + activation + valid runs.

### Feature: Workflow Run History / Monitoring
- Description: Run-level observability for statuses and step-level detail.
- Entry points: history route, history dialogs/drawers.
- Key user actions:
  - Review runs.
  - Inspect failed steps.
  - Retry or adjust workflow config.
- Key system/AI actions:
  - Persist run logs/status transitions.
  - Detect stuck runs.
- Success criteria: Faster mean time to resolution for failed automations.

### Feature: AI Workflow Assistant ("Describe What You Need")
- Description: Assistant-driven workflow composition and fix suggestions.
- Entry points: builder assistant dialogs, `Fix with AI`.
- Key user actions:
  - Provide natural language request.
  - Review suggested nodes/changes.
  - Approve and save changes.
- Key system/AI actions:
  - Parse intent into workflow operations.
  - Generate workflow snapshots/summaries.
- Success criteria: Reduced time-to-build and fewer config errors.

### Feature: Agent Types (CRM, coaching, prep, churn, etc.)
- Description: Workflow operations and agent nodes for domain-specific execution.
- Entry points: action/triggers dialog, node selector.
- Key user actions:
  - Select operation/toolkits.
  - Configure node inputs.
- Key system/AI actions:
  - Execute operation-specific logic (meeting received, prompt run, Slack/CRM actions).
- Success criteria: Measurable automation outcomes (handoffs sent, CRM updates, prep generated).

## Pages & Views

### Page: Workflows List — `/workspaces/:workspaceId/workflows`
#### Section: Header + Tabs
- Element: tab — `Workflows` — show workflow table — always.
- Element: tab — `Prompts` — show prompt library table — conditional (`prompt-library`/`unified-automations`).
- Element: tab — `Signals` — show signals table — conditional (`extractions-table`).
- Element: tab — `Tags` — show tags table — conditional (`auto-tagging-v2`).
- Element: input — workflow search — filters table and persists query param.
- Element: button dropdown — `New Workflow` (`With AI`, `From recipe`) — creates workflow/dialog.

#### Section: Workflows Table
- Element: row click — open workflow detail — always.
- Element: row action — `Edit` — opens workflow form dialog.
- Element: row action — `Delete` — opens delete dialog.
- Element: row action — `View history` — navigates to history route.
- Element: checkbox — bulk select — conditional (`multiple_workflow_deletions`).
- Element: button — `Delete selected` — opens bulk delete dialog — conditional (selected rows + flag).

#### Section: Empty/Error/Loading
- Element: skeleton rows/loading overlays — while fetching.
- Element: inline error text — shown when query fails.

### Page: Workflow Builder — `/workspaces/:workspaceId/workflows/:workflowId`
#### Section: Builder Header
- Element: status badge — active/inactive indicator — always.
- Element: menu item — `Save as Recipe` — super-admin template action — conditional (`isSuperAdmin`).
- Element: button — `History` — opens history dialog or route.
- Element: button — `Test` — starts test run flow — conditional (valid graph).
- Element: button — `Save` — persists graph changes — conditional (pending changes).

#### Section: Canvas
- Element: node — select/drag — updates selected node and position — always.
- Element: edge handle — connect nodes — creates workflow edge — always.
- Element: overlay button — `Add Trigger` — opens triggers dialog — conditional (no trigger).
- Element: context action — `Add Action` — opens actions dialog — always.
- Element: keyboard shortcut — node search/open dialogs/hotkeys — always.

#### Section: Node Sheet
- Element: form fields — configure node schema properties — conditional (single node selected).
- Element: selector controls — choose object refs/signals/knowledge bases/tags depending on node type — conditional.

#### Section: Toolbar
- Element: button — `Copy` — copy selected node(s).
- Element: button — `Paste` — paste node(s).
- Element: button — `Undo` — revert change.
- Element: button — `Redo` — reapply change.
- Element: button — `Auto layout` — auto-arrange graph.

#### Section: Error Panel
- Element: error row/list — shows validation/build errors — conditional (errors exist).
- Element: button — `Fix with AI` — attempts AI-assisted fix — conditional (errors exist).

#### Section: Modals/Dialogs/Drawers
- Element: dialog — `WorkflowFormDialog` — create/edit metadata.
- Element: dialog — `WorkflowRecipesDialog` — choose template.
- Element: dialog — `WorkflowTriggersDialog` — choose trigger.
- Element: dialog — `WorkflowActionsDialog` — choose action.
- Element: dialog — `HotkeyHelpDialog` — keyboard references.
- Element: dialog — `WorkflowNavigationDialog` — quick workflow switch.
- Element: dialog — `ConfirmationDialog` (save active changes) — confirm active workflow update.
- Element: dialog — `ConfirmationDialog` (delete workflow) — confirm delete.
- Element: dialog — `WorkflowAssistantRunsDialog` — assistant run list.
- Element: drawer — `WorkflowRunStepsDrawer` — test run step details.
- Element: picker dialogs — meeting/contact/company/annotation/external object selectors for test-run context — conditional by trigger type.

#### Section: Empty/Error/State
- Element: empty overlay — prompt to start with trigger — when no trigger.
- Element: inline builder error — when workflow load/config fails.

### Page: Workflow History — `/workspaces/:workspaceId/workflows/:workflowId/history`
#### Section: Runs Table
- Element: row — run record — opens run details.
- Element: filters/sorting controls — filter by status/time `[NEEDS VERIFICATION]`.
- Element: pagination/infinite controls — load additional runs `[NEEDS VERIFICATION]`.

## Automated Processes
- Trigger: event-based workflow trigger (e.g., meeting received)  
  - Process: dispatch workflow run (`workflowDispatcherHandler`, run requested handlers)  
  - Outputs: run records, node executions, side effects (Slack/CRM/etc.)  
  - Entities affected: workflows, runs, related domain entities.
- Trigger: scheduled trigger tick  
  - Process: `scheduledTriggerWorkflowHandler` scans and executes due workflows  
  - Outputs: scheduled run records  
  - Entities affected: workflow runs.
- Trigger: run enters stuck/failure states  
  - Process: stuck run checks and monitoring jobs  
  - Outputs: error states, retry/remediation pathways  
  - Entities affected: workflow runs/logs.
- Trigger: pre-meeting prep request  
  - Process: static workflow run (`runPreMeetingPrep`)  
  - Outputs: prep conversation/messages  
  - Entities affected: engagements, conversations.

---

# Product Area: CRM Integration (HubSpot & Salesforce + related objects)

## Overview
- Name: CRM Integration
- Description: Connects AskElephant to CRM systems for context sync, update recommendations, and object-level enrichment across meetings/chats.
- Core user personas: RevOps, managers, admins/owners, reps.
- Human vs. automated: 45% human-initiated, 55% automated (webhooks, sync jobs, import processors, conflict handling).

## Features

### Feature: Integration Setup & Health
- Description: Connect/disconnect/reconnect CRM and adjacent integrations; manage credentials/import jobs.
- Entry points: settings integrations page.
- Key user actions:
  - Connect CRM.
  - Disconnect/reconnect expired auth.
  - Start historical import jobs.
- Key system/AI actions:
  - OAuth/token state handling.
  - Integration health/status display.
- Success criteria: Connected integration adoption and low auth-expiry churn.

### Feature: CRM Context in Product Surfaces
- Description: CRM-adjacent objects and links shown in meetings, companies, contacts, and projects.
- Entry points: companies/contacts/customers pages, chats tabs, project pages.
- Key user actions:
  - Navigate from AskElephant entities to CRM context.
  - Review entity cards/panels and synced fields.
- Key system/AI actions:
  - Keep object metadata fresh from sync/import pipelines.
- Success criteria: Users operate in-context without leaving app unnecessarily.

### Feature: AI-generated CRM Updates
- Description: AI proposes CRM field/object updates for human review and approval.
- Entry points: embedded `CRM Sync`/external sync tabs in `ChatsTabs`.
- Key user actions:
  - Review proposed updates.
  - Approve + sync.
  - Retry failed updates.
  - Reject/unreject create operations (external objects).
- Key system/AI actions:
  - Generate update payloads from conversation context.
  - Execute sync and map statuses.
- Success criteria: Approval-to-sync rate and reduced manual CRM entry.

### Feature: Entity Management (Companies, Contacts, Customers, Projects)
- Description: CRUD and enrichment surfaces for core business entities linked to CRM processes.
- Entry points: nav routes.
- Key user actions:
  - Search/edit companies and contacts.
  - Merge duplicates/import records.
  - Link contacts to companies.
  - Manage project definitions/stages.
- Key system/AI actions:
  - Normalize canonical IDs and redirects.
  - Load relationship graph and score signals.
- Success criteria: Complete, trusted account/contact context in daily workflows.

## Pages & Views

### Page: Integrations — `/workspaces/:workspaceId/settings/integrations`
#### Section: Integration List
- Element: button — `Connect` — start OAuth/credential flow — conditional (not connected).
- Element: button — `Disconnect` — open disconnect confirmation — conditional (connected).
- Element: button — `Reconnect` — reconnect expired integration — conditional (auth expired/invalid).
- Element: button — `Import calls` (HubSpot/RingCentral/Grain) — start import flow — conditional (integration-specific).
- Element: input/form — API credentials (e.g., Gong/Grain) — save credentials — conditional (integration-specific).

#### Section: Modals
- Element: dialog — disconnect confirmation — confirms disconnect.
- Element: dialog — Grain historical import — configure date range and import.

#### Section: Access/State
- Element: state view — NotFound — shown for non-owner users.
- Element: toast/inline error — shown on connect/save/import failures.

### Page: Companies List — `/workspaces/:workspaceId/companies`
#### Section: Header
- Element: input — search by name/domain — filters rows.
- Element: button — `Merge duplicates` — open confirmation — conditional (`owner`).
- Element: button — `Import company` — open import dialog — conditional (HubSpot connected).
- Element: button — `New company` — open create form.

#### Section: Companies Table
- Element: link cell — company name — open company detail.
- Element: link cell — domain — open external domain URL.
- Element: row action — `Edit` — open edit dialog.
- Element: infinite scroll/load row — fetch more rows.

#### Section: Modals
- Element: dialog — merge duplicates confirmation.
- Element: dialog — company create/edit form.
- Element: dialog — company import.

### Page: Company Detail — `/workspaces/:workspaceId/companies/:companyId`
#### Section: Header
- Element: button — `Share` — copy page URL.
- Element: button — `Edit Company` — open edit form.
- Element: link — domain — open website.

#### Section: Main + Side Panel
- Element: embedded `ChatsTabs` interactions — context-aware content switching.
- Element: side panel toggle — show/hide meetings panel — conditional (`meetings-list-panel`).

#### Section: State
- Element: loading spinner — while fetching.
- Element: canonical redirect behavior — route canonicalization when ID mismatch.

### Page: Contacts List — `/workspaces/:workspaceId/contacts`
#### Section: Header
- Element: input — search name/email/phone — filters rows.
- Element: button — `Connect to company` — opens bulk mapping dialog — conditional (rows selected).
- Element: button — `New contact` — opens contact form.

#### Section: Contacts Table
- Element: checkbox — row selection.
- Element: row action — `Edit` — open contact edit.
- Element: row navigation — open contact detail.

#### Section: Modals
- Element: dialog — connect company to contacts.
- Element: dialog — contact create/edit form.

### Page: Contact Detail — `/workspaces/:workspaceId/contacts/:contactId`
#### Section: Header
- Element: button — `Edit Contact` — open edit form.
- Element: copyable field — email — copy interaction.
- Element: link — company — navigate to company detail.

#### Section: Main + Side Panel
- Element: `ChatsTabs` interactions — context-aware chat/artifact controls.
- Element: side panel toggle — show/hide meetings panel.

#### Section: Error State
- Element: inline error text — shown when query errors.

### Page: Customers Unified View — `/workspaces/:workspaceId/customers`
#### Section: Tabs
- Element: tab — `Companies` — show companies surface.
- Element: tab — `Contacts` — show contacts surface.

#### Section: Per-tab controls
- Element: same controls as respective companies/contacts pages — behaviors preserved.

### Page: Projects List — `/workspaces/:workspaceId/projects`
#### Section: Pipeline Overview
- Element: progress block — HubSpot deals import progress indicator.
- Element: pipeline list/cards — open project pipelines `[NEEDS VERIFICATION]`.

#### Section: State
- Element: loading placeholder — while projects fetch.
- Element: route redirect — fallback to engagements when `projects-page` disabled.

### Page: Project Detail — `/workspaces/:workspaceId/projects/:projectId`
#### Section: Header + Stages
- Element: stage cards/columns — inspect project progression.
- Element: stage interactions — update stage/metadata `[NEEDS VERIFICATION]`.

#### Section: State
- Element: not found page — shown on missing/error project.

### Page: Project Definitions — `/workspaces/:workspaceId/projects/definitions`
#### Section: Header
- Element: button — `New definition` — open project definition form.

#### Section: Definition Cards
- Element: button — `Edit definition` — open definition form.
- Element: button — `Add stage` — open stage form.
- Element: button — `Edit stage` — open stage edit.

#### Section: Empty/Error
- Element: empty card — `No project definitions yet`.
- Element: stage empty dashed area — prompts stage creation.
- Element: error content view — workspace missing/error.

### Page: Embedded CRM Sync Panel — within `ChatsTabs` (engagement/company/contact)
#### Section: CRM Field Updates Card
- Element: button — `Approve and update` — commits pending CRM updates — conditional (in-review status).
- Element: button — `Retry failed fields` — retries failed subset — conditional (failed status).
- Element: link/button — `View in CRM` — opens CRM record — conditional (external URL present).
- Element: badge/status display — in-review/success/failed statuses — always when panel shown.

### Page: Embedded External Object Sync Panel — within `ChatsTabs`
#### Section: External Object Create/Update Cards
- Element: button — `Approve and create` — creates external object — conditional (in-review create).
- Element: button — `Reject` — rejects pending create — conditional.
- Element: button — `Unreject` — reopens rejected create — conditional (cancelled/rejected).
- Element: button — `Approve and update` — approves update mutation — conditional.
- Element: button — `Retry failed fields` — retries update failure — conditional.
- Element: link/button — `View in [integration]` — opens external object URL — conditional.

## Automated Processes
- Trigger: CRM webhook events (HubSpot/Salesforce/etc.)  
  - Process: webhook handlers ingest updates and normalize records  
  - Outputs: synced objects, change events, relationship updates  
  - Entities affected: companies, contacts, deals/projects, sync logs.
- Trigger: scheduled import jobs  
  - Process: periodic ingestion from HubSpot/Salesforce/RingCentral/Dialpad/Gong/Grain  
  - Outputs: imported calls/objects and progress states  
  - Entities affected: engagements, CRM-linked entities.
- Trigger: AI update proposal generation from chat/workflow  
  - Process: compute field/object update suggestions  
  - Outputs: in-review sync cards and actionable payloads  
  - Entities affected: CRM update records, chats/artifacts.
- Trigger: user approval/retry/reject actions  
  - Process: execute outbound updates and status transitions  
  - Outputs: success/failure records and external IDs  
  - Entities affected: CRM objects, sync history.

---

# Product Area: Coaching & Performance

## Overview
- Name: Coaching & Performance
- Description: AI-supported rep coaching insights via scorecards, coaching agent logic, and meeting-performance artifacts embedded in core workflows.
- Core user personas: Sales managers, reps, enablement leads.
- Human vs. automated: 30% human-initiated, 70% automated (artifact generation, scoring logic, prep/analysis runs).

## Features

### Feature: Scorecard Artifact
- Description: Structured performance artifact generated from meeting context and displayed in chat/artifact panels.
- Entry points: engagement chats/tool invocation.
- Key user actions:
  - Open scorecard tab/artifact.
  - Review scores/feedback.
  - Compare improvement opportunities across calls `[NEEDS VERIFICATION]`.
- Key system/AI actions:
  - Create `SCORECARD` artifacts via tool calls.
  - Render score details and criteria from artifact schema.
- Success criteria: Managers/reps consume scorecards and adjust call behaviors.

### Feature: Coaching Agent Node
- Description: Agent node that produces coaching feedback with style controls.
- Entry points: workflow/agent node invocation.
- Key user actions:
  - Configure coaching style.
  - Run coaching on engagement.
- Key system/AI actions:
  - Analyze transcript and return coaching conversation output.
- Success criteria: Coaching outputs adopted in rep behavior.
- Note: currently appears implemented but commented out in configurable agents `[NEEDS VERIFICATION]`.

### Feature: Pre-Meeting Prep (Performance-adjacent)
- Description: Automated prep run creates actionable meeting brief and context before calls.
- Entry points: engagement detail (`prepare=true`) and run mutation paths.
- Key user actions:
  - Trigger prep run.
  - Review prep status/output.
- Key system/AI actions:
  - Execute static workflow to produce prep conversation sequence.
- Success criteria: Prep run-to-use rate and meeting quality uplift.

### Feature: Health Score / Performance Signals
- Description: Company/engagement health calculations and signal-based scoring pathways.
- Entry points: health score settings and agent flows.
- Key user actions:
  - Review health score outputs `[NEEDS VERIFICATION]`.
- Key system/AI actions:
  - Run health-score agent calculations.
- Success criteria: Earlier risk detection and better manager interventions.

## Pages & Views

### Page: Embedded Scorecard Surface — in engagement `ChatsTabs`
#### Section: Sidebar Item
- Element: tab item — `Scorecard` — opens scorecard artifact — conditional (`scorecard-component` + scorecard exists).

#### Section: Artifact Renderer
- Element: score row controls/expansions — inspect rubric details `[NEEDS VERIFICATION]`.
- Element: feedback text blocks — review recommendations.

#### Section: States
- Element: absent-tab state — scorecard tab hidden when no artifact/flag off.

### Page: Pre-meeting Prep Status — embedded in engagement detail
#### Section: Prep Status Panel
- Element: status indicator — run pending/running/succeeded/failed — conditional (prep runs exist).
- Element: action control — rerun prep `[NEEDS VERIFICATION]`.

### Page: Coaching Manager View — Not in current product
#### Section: Manager comparisons / rep benchmarking
- Element: manager-only performance comparisons (talk ratio/question rate/fillers) — not available as a dedicated dashboard in current product.

## Automated Processes
- Trigger: scorecard tool invocation  
  - Process: generate scorecard artifact from engagement context  
  - Outputs: `SCORECARD` artifact records  
  - Entities affected: artifacts, engagements, conversations.
- Trigger: coaching node execution  
  - Process: transcript analysis with configurable style  
  - Outputs: coaching conversation output  
  - Entities affected: conversations, engagement-linked analysis.
- Trigger: pre-meeting prep mutation  
  - Process: static workflow run with staged messages and context attachments  
  - Outputs: prep conversation thread/status  
  - Entities affected: workflow runs, conversations, engagements.
- Trigger: health score calculation event  
  - Process: evaluate engagement/company signals and compute health score  
  - Outputs: health score values and supporting analysis  
  - Entities affected: companies, health score records.

---

# Product Area: Signals & Tags

## Overview
- Name: Signals & Tags
- Description: Configurable AI extraction and tagging system used to classify meeting data and drive downstream workflows/insights.
- Core user personas: Managers, RevOps, admins.
- Human vs. automated: 35% human-initiated, 65% automated (annotation inference, embedding queues, extraction runs).

## Features

### Feature: Signal Configuration
- Description: Define/edit signal extraction properties (data type, model, tags, prompts).
- Entry points: workflows tabs (`Signals`) or settings signal routes.
- Key user actions:
  - Create signal.
  - Edit configuration.
  - Delete/duplicate signal.
  - Filter/search signal list.
- Key system/AI actions:
  - Run annotation inference and persist values.
  - Embed annotation content for search/reuse.
- Success criteria: Signal coverage + extraction accuracy + operational usage.

### Feature: Tags Management (Manual + Auto-tagging)
- Description: Configure tags and optional AI auto-tagging behavior.
- Entry points: workflows `Tags` tab, settings tags routes.
- Key user actions:
  - Create/edit/delete tag.
  - Enable/disable AI auto-tagging.
  - Test auto-tagging behavior.
- Key system/AI actions:
  - Apply tags from signal/AI inference pipelines.
- Success criteria: Tag consistency and adoption in filtering/reporting.

### Feature: Signal/Tag Application in Search Tables
- Description: Signals and tags are surfaced and managed inside engagement tables.
- Entry points: search page table interactions.
- Key user actions:
  - View dynamic signal columns.
  - Bulk run signals.
  - Add/remove tags inline.
- Key system/AI actions:
  - Compute/refresh signal values on selected events.
- Success criteria: Faster triage and pattern discovery in meeting datasets.

## Pages & Views

### Page: Signals List — `/workspaces/:workspaceId/settings/signals` (or workflows tab redirect)
#### Section: Filters/Search
- Element: input — signal search — filters rows.
- Element: dropdown — tag filter (`MultiSelectDropdown`) — filters signals by tags.
- Element: button — `Clear filters` — reset active filters.

#### Section: Signals Table
- Element: button — `New signal` — navigate to signal detail with `new`.
- Element: row click — open signal detail.
- Element: row action — `Edit` — open detail.
- Element: row action — `Delete` — open confirmation dialog.

#### Section: State
- Element: loading skeleton/overlay — while fetching.
- Element: error text — when loading fails.

### Page: Signal Detail — `/workspaces/:workspaceId/settings/signals/:signalId`
#### Section: Header / Actions
- Element: button/link — breadcrumb back to Workflows/Signals — route depends on entry context.
- Element: button — `Save` — persist signal config.
- Element: menu action — `Duplicate` — clone signal.
- Element: menu action — `Delete` — delete signal.

#### Section: Configuration Form (`PropertyConfigurationTab`)
- Element: inputs/dropdowns/selectors — define name/description/type/model/tags and extraction config.
- Element: specialized renderers — object reference, signal-tags selector, knowledge-base selector — conditional by schema.

#### Section: State
- Element: loading text — `Loading signal details...`.
- Element: not found state — `Signal not found or access denied.`

### Page: Tags List — `/workspaces/:workspaceId/settings/tags` (or workflows tab redirect)
#### Section: Header
- Element: input — tag search — filters tags.
- Element: button — `Test auto tagging` — opens test dialog.
- Element: button — `New tag` — opens create dialog.

#### Section: Tag Suggestions
- Element: collapse toggle — show/hide suggestions — conditional (suggestions exist).
- Element: button — `Add` (suggestion row) — create tag from suggestion.

#### Section: Tags Table
- Element: row action — `Edit AI config` — opens tag form dialog.
- Element: row action — `Delete` — opens delete confirmation.
- Element: status badge — `Enabled/Disabled` auto-tagging indicator.

#### Section: State
- Element: error page — shown on query failure.
- Element: table no-data state — implicit empty table.

### Page: Engagement Search Table Integration — `/workspaces/:workspaceId/search`
#### Section: Dynamic Signal/Tag Controls
- Element: button — `Run Signals` — trigger signal run on selected engagements — conditional (flag + selection).
- Element: inline tag list control — add/remove tags from row.
- Element: dynamic signal columns — display extracted values with special render formatting.

## Automated Processes
- Trigger: annotation value update event  
  - Process: inference + propagation handlers (`annotationInferenceHandler`, `annotationValueUpdatedHandler`)  
  - Outputs: refreshed signal values  
  - Entities affected: annotations, engagements, signal properties.
- Trigger: transcription/content ingestion  
  - Process: action-item extraction and annotation embedding queue  
  - Outputs: extracted action items/signals, vectorized annotation content  
  - Entities affected: transcripts, annotations, embeddings.
- Trigger: tag subscription changes  
  - Process: tag subscription handlers and downstream updates  
  - Outputs: updated tag mappings  
  - Entities affected: tags, subscriptions, engagements.

---

# Product Area: Clay-Style Tables / Universal Signals

## Overview
- Name: Clay-Style Tables / Universal Signals
- Description: Data-table-first working surface (AG Grid) with extracted columns, inline operations, filters, and bulk actions over meeting/event entities.
- Core user personas: RevOps, managers, power users, analysts.
- Human vs. automated: 60% human-initiated, 40% automated (infinite loading, dynamic extraction columns, signal processing).

## Features

### Feature: Universal Event Table
- Description: Searchable/sortable event table with rich row metadata and dynamic columns.
- Entry points: `/workspaces/:workspaceId/search`.
- Key user actions:
  - Sort/filter/search rows.
  - Select rows for bulk operations.
  - Navigate to event details.
- Key system/AI actions:
  - Provide infinite scrolling and dynamic column resolution.
- Success criteria: Frequent table use for triage and decision workflows.

### Feature: AI-extracted Columns
- Description: Dynamic columns for signal/annotation outputs and computed values.
- Entry points: search table + column selector.
- Key user actions:
  - Show/hide extraction columns.
  - Evaluate extracted values in-row.
- Key system/AI actions:
  - Resolve extracted values and apply custom formatting.
- Success criteria: Increased use of extracted columns in filtering/decisioning.

### Feature: Table Configuration + Export
- Description: Control visible columns and export current table state.
- Entry points: table header actions.
- Key user actions:
  - Open column selector.
  - Export CSV.
  - Save filter contexts `[NEEDS VERIFICATION]`.
- Key system/AI actions:
  - Persist or apply table configuration state.
- Success criteria: Export completion and reduced manual spreadsheet work.

## Pages & Views

### Page: Search Table — `/workspaces/:workspaceId/search`
#### Section: Top Controls
- Element: input — search — filters by text/query.
- Element: dropdown — filter menu — applies structured filters.
- Element: drawer toggle — `Column selector` — controls visible columns.
- Element: button — `Export CSV` — exports table data.

#### Section: Grid Body
- Element: checkbox — select row(s) — enables bulk actions.
- Element: title link — open engagement detail.
- Element: column header sort toggles — sort data.
- Element: inline controls — tags add/remove.
- Element: infinite-loading sentinel row — triggers next-page fetch.

#### Section: Conditional Columns
- Element: column — `Recorded` — visible to super admins.
- Element: columns — privacy/privacy-details — visible to managers.
- Element: columns — extraction/signal values — conditional (`extractions-table` + selected defs).

#### Section: Empty/Error
- Element: loading overlay — while fetching.
- Element: no-rows empty grid state — when query returns none.

## Automated Processes
- Trigger: table scroll near end  
  - Process: fetch next page (`InfiniteScrollAgGrid` behavior)  
  - Outputs: appended rows  
  - Entities affected: client table state.
- Trigger: sort/filter change  
  - Process: debounce/refetch query  
  - Outputs: reordered/refined table results  
  - Entities affected: search query/session state.
- Trigger: extraction-related configuration  
  - Process: include/exclude extraction columns and value renderers  
  - Outputs: dynamic schema projection  
  - Entities affected: table schema state.

---

# Product Area: Knowledge Base & Search

## Overview
- Name: Knowledge Base & Search
- Description: Structured memory layer for source materials and retrieval, used in dedicated KB views and embedded into chat/workflow contexts.
- Core user personas: Reps, managers, CS, RevOps, admins.
- Human vs. automated: 50% human-initiated, 50% automated (embedding/index updates, retrieval scoring).

## Features

### Feature: Knowledge Base Management
- Description: Create/manage knowledge bases and sources from settings and dedicated KB views.
- Entry points: settings knowledge bases routes, nav KB links.
- Key user actions:
  - Create knowledge base.
  - Add/edit/delete sources.
  - Inspect source status/content.
- Key system/AI actions:
  - Re-embed/update source vectors when content changes.
- Success criteria: Active source coverage and retrieval usage in chat.

### Feature: Global Search (Meetings Search)
- Description: Search across engagement history with filters and quick tabs.
- Entry points: nav search, command palette.
- Key user actions:
  - Query by text.
  - Filter by ownership/folders and metadata.
  - Open target engagement.
- Key system/AI actions:
  - Query text/vector indexes and return ranked results.
- Success criteria: Search-to-open conversion and reduced time to find context.

### Feature: Knowledge in Chat/Workflows
- Description: Attach/select knowledge bases for chat and workflow operations.
- Entry points: chat composer tool menu, workflow form renderers.
- Key user actions:
  - Attach KB to chat context.
  - Select KBs in workflow node forms.
- Key system/AI actions:
  - Retrieve relevant source chunks for responses/actions.
- Success criteria: Higher answer quality and lower follow-up query rates.

## Pages & Views

### Page: KB Settings List — `/workspaces/:workspaceId/settings/knowledge-bases`
#### Section: KB List
- Element: button — `Create knowledge base` `[NEEDS VERIFICATION: exact label]` — starts KB creation flow.
- Element: list/card row — open KB detail.
- Element: row action — edit KB metadata.
- Element: row action — delete KB.

### Page: KB Settings Detail — `/workspaces/:workspaceId/settings/knowledge-bases/:knowledgeBaseId`
#### Section: Source Table
- Element: button — `Add source` — opens source form/dialog.
- Element: row/card action — view source detail.
- Element: row/card action — edit source.
- Element: row/card action — delete source.
- Element: source status indicators — embedding/ready/error states.

### Page: KB App Layout — `/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId`
#### Section: Tabs/Routes
- Element: tab/link — conversations/chats view — open KB scoped chats.
- Element: tab/link — sources view — open source list/select.

### Page: KB Source Detail — `/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId/sources/:knowledgeSourceId`
#### Section: Source Content Viewer
- Element: read/view panel — displays source content.
- Element: edit/delete controls — manage source `[NEEDS VERIFICATION]`.

### Page: Meetings Search — `/workspaces/:workspaceId/search`
#### Section: Search entry + tabs
- Element: input — search past events.
- Element: tab — `All events`.
- Element: tab — `My events`.
- Element: tab — `Folders`.

### Page: Embedded KB Attachment Controls
#### Section: Chat Composer
- Element: menu item/button — `Attach Knowledge Base` — open `KnowledgeBaseSelectDialog` — conditional (`knowledge-bases` flag).
- Element: selector list — choose one/many KBs for chat context.

#### Section: Workflow Node Forms
- Element: renderer control — `knowledgeBases` selector — choose KB(s) for workflow node execution.

## Automated Processes
- Trigger: knowledge source content/name update  
  - Process: update embeddings (`updateKnowledgeSourceEmbeddingHandler`, embedding context methods)  
  - Outputs: refreshed vectors and searchable state  
  - Entities affected: knowledge sources, embedding indexes.
- Trigger: object finalized or source ingestion  
  - Process: source parsing + embedding pipeline  
  - Outputs: retrievable content chunks  
  - Entities affected: knowledge source records.
- Trigger: search/chat retrieval request  
  - Process: run text/vector search over engagement and KB indexes  
  - Outputs: ranked source candidates/context docs  
  - Entities affected: query results, chat context attachments.

---

# Product Area: Handoffs (Sales -> CS)

## Overview
- Name: Handoffs (Sales -> CS)
- Description: Dedicated Sales -> CS handoff product surfaces are not present in the current product. Related context transfer occurs indirectly through workflows, chat artifacts, and CRM sync interactions.
- Core user personas: Sales reps, AEs, CSMs, managers, RevOps.
- Human vs. automated: Not applicable as a standalone area in the current product (no dedicated handoff module).

## Features

### Feature: Workflow-driven Handoff Automation
- Description: Not a first-class product feature today; can be approximated with custom workflows.
- Entry points: workflow builder templates and operation selection.
- Key user actions:
  - Configure trigger (e.g., meeting received/deal stage).
  - Add AI prompt grading/summarization step.
  - Add Slack/CRM downstream action.
- Key system/AI actions:
  - Evaluate handoff criteria via prompts.
  - Push outputs to designated destination.
- Success criteria: Reduced manual handoff prep and faster CS readiness.

### Feature: Context Transfer via Embedded Surfaces
- Description: Indirect context transfer path (meetings/chats/CRM sync) used instead of a dedicated handoff experience.
- Entry points: engagement detail, clip share, CRM sync cards.
- Key user actions:
  - Share clips and summaries.
  - Approve CRM updates that codify handoff details.
- Key system/AI actions:
  - Generate actionable summaries and update payloads.
- Success criteria: CS receives complete context with fewer follow-up clarifications.

## Pages & Views

### Page: Workflow Builder (handoff implementation surface) — `/workspaces/:workspaceId/workflows/:workflowId`
#### Section: Trigger + Action graph
- Element: node selection/config controls — define handoff pipeline — always.
- Element: test-run dialogs — validate with sample meeting/contact/company contexts.
- Element: save/activate controls — deploy handoff automation.

### Page: Engagement Detail (handoff content source) — `/workspaces/:workspaceId/engagements/:engagementId`
#### Section: `ChatsTabs` + clip creation + CRM sync
- Element: button — `Create clip` — create shareable snippet for handoff.
- Element: tab items — summary/action items/notes/CRM sync — gather context artifacts.
- Element: CRM/external sync approvals — ensure CRM handoff data is updated.

### Page: Dedicated Handoff Package UI — Not in current product
#### Section: Handoff package list/detail/review
- Element: package creation/review actions — not available (no dedicated routes/components in current product).

## Automated Processes
- Trigger: workflow event (meeting received/deal state/timing)  
  - Process: AI summarize/grade + Slack/CRM action chain  
  - Outputs: handoff messages/cards/updates  
  - Entities affected: conversations, Slack channels, CRM records.
- Trigger: user-approved CRM update  
  - Process: outbound sync to CRM object for handoff continuity  
  - Outputs: updated fields and statuses  
  - Entities affected: deals/contacts/companies.

---

# Product Area: Settings & Administration

## Overview
- Name: Settings & Administration
- Description: Personal/workspace administration including profile, team, integrations, permissions, beta features, API keys, and super-admin controls.
- Core user personas: Owners/admins, managers, super admins, all users (personal settings).
- Human vs. automated: 85% human-initiated, 15% automated (policy/role enforcement, feature flag redirects).

## Features

### Feature: Unified Settings (Personal + Workspace)
- Description: Tabbed or section-based settings experience controlled by feature flags.
- Entry points: viewer menu, command palette, direct routes.
- Key user actions:
  - Update notification preferences and personal settings.
  - Manage workspace settings (owner).
  - Access API keys/security/beta features.
- Key system/AI actions:
  - Redirect unauthorized tabs.
  - Show/hide sections by role.
- Success criteria: Successful completion of settings tasks with low access confusion.

### Feature: Team & Permission Administration
- Description: Team member management and role/authorization settings.
- Entry points: team settings and authorization routes.
- Key user actions:
  - Invite/manage team users.
  - Adjust role-based access.
  - Configure authorization domains/condition groups.
- Key system/AI actions:
  - Enforce role gates at route/component level.
- Success criteria: Correct role assignment and secure workspace access.

### Feature: Full Privacy/Security Suite (SSO, 2FA, audit logs, retention)
- Description: Not in current product as a dedicated, comprehensive suite.
- Entry points: None (only partial/privacy-adjacent settings currently exist).
- Key user actions: N/A.
- Key system/AI actions: N/A.
- Success criteria: N/A (tracked as out-of-scope/not present).

### Feature: Integrations & Billing
- Description: Workspace-level commercial and integration controls.
- Entry points: integrations/billing settings.
- Key user actions:
  - Connect integrations.
  - Access billing page-level controls (granular billing flows are not currently in product).
- Key system/AI actions:
  - Sync billing state and integration status.
- Success criteria: Active paid workspaces and stable integration connectivity.

### Feature: Super Admin Console
- Description: Internal administration across workspaces/users/recipes/adverse engagements.
- Entry points: super-admin navigation.
- Key user actions:
  - Inspect workspace/user records.
  - Manage recipes/admin datasets.
- Key system/AI actions:
  - Restrict access to super-admin only.
- Success criteria: Efficient support/debug operations.

## Pages & Views

### Page: Settings Index — `/workspaces/:workspaceId/settings`
#### Section: Tab Controls (legacy unified)
- Element: tab — `Personal` — show personal settings — always.
- Element: tab — `Workspace` — show workspace settings — conditional (`owner`).
- Element: redirect behavior — non-owner opening workspace tab gets redirected to personal.

#### Section: Personal Settings Tab
- Element: control — notification preferences manage button/modal.
- Element: control — notetaker settings.
- Element: control — automatic email recap settings.
- Element: control — event privacy settings — conditional (manager+).
- Element: control — connected accounts management.
- Element: control — API keys management.
- Element: button — `Delete account`.

#### Section: Workspace Settings Tab (owner)
- Element: controls — workspace/team/integration/billing/security settings `[NEEDS VERIFICATION: exact component granularity varies by flag rollout]`.

### Page: Settings V2 — `/workspaces/:workspaceId/settings?section=...` (EA)
#### Section: Navigation Sections
- Element: section item — `Profile`.
- Element: section item — `Email Recap`.
- Element: section item — `Notetaker`.
- Element: section item — `Security`.
- Element: section item — `Beta Features`.
- Element: section item — `API Keys` — conditional (`ownerOnly`).

### Page: Team Settings — `/workspaces/:workspaceId/settings/team`
#### Section: Team Management
- Element: invite controls — email input + send invite.
- Element: role controls — set member role.
- Element: member row actions — remove/deactivate/reactivate `[NEEDS VERIFICATION]`.
- Condition: manager+ access required.

### Page: Billing — `/workspaces/:workspaceId/settings/billing`
#### Section: Subscription
- Element: page-level billing access/control — billing page exists.
- Element: granular flows (invoices, seat management, detailed plan-limit banners) — not in current product.

### Page: Authorization — `/workspaces/:workspaceId/settings/authorization`
#### Section: Authorization Domain Config
- Element: list rows/links — open domain-specific authorization.
- Element: route links — condition groups.
- Condition: visible when `fga-engine-beta` and owner; otherwise redirect to team settings.

### Page: Authorization Domain Detail — `/workspaces/:workspaceId/settings/authorization/:domain`
#### Section: Domain-specific rules
- Element: controls — rule/permission configuration `[NEEDS VERIFICATION]`.

### Page: Authorization Condition Groups — `/workspaces/:workspaceId/settings/authorization/condition-groups`
#### Section: Group Rules
- Element: controls — create/edit condition groups `[NEEDS VERIFICATION]`.

### Page: Beta Features — `/workspaces/:workspaceId/settings/beta-features`
#### Section: Feature Toggles
- Element: toggle controls — enable/disable beta features `[NEEDS VERIFICATION]`.

### Page: Integrations — `/workspaces/:workspaceId/settings/integrations`
#### Section: See CRM section above
- Element inventory intentionally reused from CRM Integration area.

### Page: Health Score — `/workspaces/:workspaceId/settings/health-score`
#### Section: Health score config
- Element: configuration inputs/toggles `[NEEDS VERIFICATION]`.

### Page: Admin Workspaces — `/admin/workspaces`
#### Section: Workspace Table
- Element: row click — open workspace detail.
- Element: filters/search `[NEEDS VERIFICATION]`.

### Page: Admin Workspace Detail — `/admin/workspaces/:workspaceId`
#### Section: Workspace Admin Detail
- Element: drill-in actions for workspace metadata/team members `[NEEDS VERIFICATION]`.

### Page: Admin Team Member Detail — `/admin/workspaces/:workspaceId/team-members/:userId`
#### Section: Member Detail
- Element: user/workspace-specific admin controls `[NEEDS VERIFICATION]`.

### Page: Admin Users — `/admin/users`
#### Section: User Admin
- Element: search/filter/edit controls `[NEEDS VERIFICATION]`.

### Page: Admin Recipes — `/admin/recipes`
#### Section: Recipe Admin
- Element: list/edit recipe controls `[NEEDS VERIFICATION]`.

### Page: Admin Adverse Engagements — `/admin/adverse-engagements`
#### Section: Adverse Engagement Monitoring
- Element: list/detail controls `[NEEDS VERIFICATION]`.

## Automated Processes
- Trigger: route access attempt  
  - Process: enforce role checks (`useIsOwner`, `useIsManager`, `useIsSuperAdmin`)  
  - Outputs: allow, redirect, or `NotFound`  
  - Entities affected: UI access state.
- Trigger: feature flag changes  
  - Process: reroute settings tabs (unified settings, unified automations, authz visibility)  
  - Outputs: route redirection and section visibility  
  - Entities affected: user UI configuration.
- Trigger: integration/auth state changes  
  - Process: update settings cards/connectivity statuses  
  - Outputs: connect/reconnect/disconnect availability  
  - Entities affected: integration records.

---

# Product Area: AI Agents & Workflow Automation (Agent Types Inventory)

## Overview
- Name: Agent Types Inventory (cross-cutting automation subarea)
- Description: Catalog of agent/workflow patterns currently represented in codebase and templates.
- Core user personas: Managers, RevOps, advanced builders.
- Human vs. automated: 20% human-initiated, 80% automated once deployed.

## Features

### Feature: CRM Automation Agents
- Description: Suggest and apply CRM field/object updates.
- Entry points: chats tabs, workflow nodes.
- Key user actions: approve/retry/reject changes.
- Key system actions: compute update payloads and sync.
- Success criteria: reduced manual CRM updates.

### Feature: Meeting Prep Agents
- Description: Build pre-meeting briefs and context.
- Entry points: engagement prep trigger and workflows.
- Key user actions: run prep, review output.
- Key system actions: generate staged prep messages.
- Success criteria: prep completion before meetings.

### Feature: Coaching Agents
- Description: Generate coaching feedback and scorecards.
- Entry points: tool invocation/workflow node.
- Key user actions: review scorecards/coaching notes.
- Key system actions: transcript analysis and rubric scoring.
- Success criteria: rep performance improvement signals.

### Feature: Handoff/Churn/Feature/Competitive Intel Agents
- Description: Appears as workflow-composable patterns rather than dedicated UI modules.
- Entry points: workflow builder action/trigger combinations.
- Key user actions: configure prompts + destinations.
- Key system actions: evaluate meetings and dispatch outputs.
- Success criteria: automatic alerts and operational follow-through.
- Note: dedicated first-class pages/templates for each listed type are `[NEEDS VERIFICATION]`.

## Pages & Views
- Primary surfaces: workflow list/detail/history and embedded chat tool actions (documented above).

## Automated Processes
- Trigger: workflow trigger satisfied  
  - Process: run selected agent nodes and downstream operations  
  - Outputs: messages, updates, alerts, artifacts  
  - Entities affected: conversations, workflows, CRM/Slack objects.

---

# Product Area: AI Chat Embedding Map (Cross-Surface Inventory)

## Overview
- Name: Chat Embedding Map
- Description: Inventory of where Ask Elephant chat appears beyond standalone chat routes.
- Core user personas: All workspace users.
- Human vs. automated: 75% human-initiated, 25% automated.

## Features

### Feature: Embedded Chat in Engagement Detail
- Entry points: engagement page main panel.
- Key actions: ask contextual questions, switch to artifacts/sync tabs.
- Key system actions: bind engagement context, show adverse state.
- Success criteria: high engagement-level chat usage.

### Feature: Embedded Chat in Company Detail
- Entry points: company detail main panel.
- Key actions: ask account-level questions, inspect CRM/sync outputs.
- Key system actions: bind company context.

### Feature: Embedded Chat in Contact Detail
- Entry points: contact detail main panel.
- Key actions: ask contact-level questions, inspect notes/actions/sync outputs.
- Key system actions: bind contact context.

### Feature: KB-scoped Chat
- Entry points: KB routes and chat composer attachments.
- Key actions: ask against selected KB sources.
- Key system actions: source retrieval scoped to KB.

## Pages & Views
- `/workspaces/:workspaceId/engagements/:engagementId` (main panel)
- `/workspaces/:workspaceId/companies/:companyId` (main panel)
- `/workspaces/:workspaceId/contacts/:contactId` (main panel)
- `/workspaces/:workspaceId/knowledge-bases/:knowledgeBaseId/chats/:chatId?`
- Global panel in app layout (`global-chat-enabled`) `[NEEDS VERIFICATION: exact route-state matrix]`

## Automated Processes
- Trigger: page context load  
  - Process: contextual chat data binding  
  - Outputs: scoped conversation/tool options  
  - Entities affected: chat context metadata.

---

# Product Area: Automated / Background Processing (Cross-Product Canonical Layer)

## Overview
- Name: Automated & Background Processing
- Description: The non-UI operational layer that powers ingestion, AI processing, workflows, integrations, and indexing.
- Core user personas: Internal system operators (indirectly all product users benefit).
- Human vs. automated: 5% human-initiated, 95% automated.

## Features

### Feature: Scheduled Jobs
- Description: Recurring tasks for syncs, trigger checks, reminders, retries, and maintenance.
- Entry points: scheduler/cron infrastructure.
- Key system actions:
  - Workflow scheduled trigger processing.
  - Stuck workflow run checks.
  - Platform import jobs (HubSpot/Salesforce/RingCentral/Gong/Grain/Dialpad).
  - Post-meeting recap/email jobs.
- Success criteria: low stale backlog, high run success, timely data freshness.

### Feature: Event-triggered Pipelines
- Description: Event/webhook/pubsub-driven processing across recording, transcription, chat, workflows, and CRM.
- Entry points: Firestore, Pub/Sub, webhooks, storage events.
- Key system actions:
  - Process new engagement/upload events.
  - Run transcription and embedding.
  - Execute workflow dispatches.
  - Handle integration webhooks.
- Success criteria: reliable end-to-end processing with low failure rates.

### Feature: AI Agent Executions
- Description: LLM/agent runs for chat responses, scorecards, coaching, prep, and extraction.
- Entry points: chat submissions, workflow node execution, tool invocation.
- Key system actions:
  - Generate outputs and artifacts.
  - Execute tool calls and return structured results.
- Success criteria: high completion quality and low error/retry loops.

### Feature: Indexing and Retrieval
- Description: Keeps engagement search and KB embeddings queryable.
- Entry points: source updates, transcript ingestion, search requests.
- Key system actions:
  - Update vector/text indexes.
  - Retrieve nearest content on demand.
- Success criteria: fast, relevant retrieval quality.

## Pages & Views
- No dedicated user-facing page; monitored through workflow history, admin/debug tools, and state surfaces in pages above.

## Automated Processes
- Trigger: Firestore `new engagement` event  
  - Process: ingestion + downstream pipeline orchestration  
  - Outputs: engagement records, queued processing.
- Trigger: file upload/storage finalization  
  - Process: media/transcript processing and metadata extraction  
  - Outputs: transcripts, embeddings, readiness statuses.
- Trigger: integration webhooks  
  - Process: normalize inbound external changes  
  - Outputs: synced objects and event records.
- Trigger: Pub/Sub messages  
  - Process: chat/workflow/signal-specific handlers  
  - Outputs: run records, annotations, embeddings.
- Trigger: scheduled cron intervals  
  - Process: imports, trigger checks, retries, recaps  
  - Outputs: updated data, notifications, health signals.

---

# Product Area: Gaps / Verification Queue

## Overview
- Name: Needs Verification
- Description: Potentially existing surfaces requested in scope but not confidently found in current code mapping.

## Features / Pages Requiring Verification
- Feature: Dedicated marketing pages (`homepage`, `pricing`, `product pages`, `use cases`, `blog`, `demo request`)  
  - Status: Confirmed to exist (outside this app codebase); include as canonical product surface and source from marketing stack/docs.
- Feature: Dedicated handoff package module (manual + automated package views, recipient review flow)  
  - Status: Confirmed not in current product.
- Feature: Manager performance comparison dashboards (talk ratio, question rate, filler trends as dedicated pages)  
  - Status: Confirmed not in current product.
- Feature: Full privacy/security admin suite (SSO, 2FA, audit logs, retention, API key lifecycle UI details)  
  - Status: Confirmed not in current product as a dedicated/privacy-suite experience.
- Feature: Billing/subscription granular flows (upgrade, invoices, seat management, plan limits banners)  
  - Status: Confirmed not in current product as a granular billing-flow experience.

## KB Article Cross-check (Notion)
- Feature cluster: Workflow recipes catalog coverage (`Churn Alert`, `Closed Won/Lost Reasoning`, `Coach`, `Customer Quote Generator`, `Meeting Prep - HubSpot`, `Recap Email`, `Sales to Customer Success Handoff`, `Weekly Summary`, `HubSpot Agent - Deals`)  
  - Status: Added as explicit recipe inventory under AI Agents/Workflows; dedicated per-recipe pages in product UI are not assumed unless present in app routes/components.
- Feature cluster: Workflow node taxonomy (`AskElephant - triggers overview`, `actions overview`, `prompt nodes`, `send nodes`, `conversation nodes`, `additional nodes`)  
  - Status: Added as missing instrumentation dimension (node-type-level events) for builder interactions and execution monitoring.
- Feature: `Meeting Privacy Agent`  
  - Status: Added as explicit sub-feature under Signals/Privacy/Automation; dedicated standalone UI route remains `[NEEDS VERIFICATION]`.
- Feature: `Internal Search: Find Workspace Data in Seconds`  
  - Status: Covered by Knowledge/Search area, but should be tagged as a first-class feature name for analytics alignment.
- Feature: `Groups` (separate from tags and authorization condition groups)  
  - Status: Added to verification queue as likely separate settings surface; exact route/component mapping `[NEEDS VERIFICATION]`.
- Feature: `Customer Data Export API`  
  - Status: Added to Settings & Administration verification queue as a likely admin/security/API surface requiring explicit page/element inventory.
- Feature: `Global Chat` article  
  - Status: Partially covered in cross-surface chat embedding; final route/state matrix and element-level differences still `[NEEDS VERIFICATION]`.

## Suggested next validation step
- Run a route-by-route UI crawl (browser automation) and emit one JSON row per element (`route`, `section`, `element_type`, `label`, `condition`) to finalize Layer 3 event coverage.

