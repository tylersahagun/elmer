# Prototype Notes: Agent Command Center

## Version 1 — 2026-02-07

### Overview

First prototype of the Agent Command Center — a chat-centric experience merging 4 previous initiatives (CRM-ETE, Rep Workspace, Chief-of-Staff Hub, Chief-of-Staff Recap Hub) into a single surface where users configure agents, monitor activity, and consume polished artifacts.

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v1/
```

### Three Creative Directions

| Direction | Name          | User Control | Trust Required | Best Persona                      |
| --------- | ------------- | ------------ | -------------- | --------------------------------- |
| Option A  | Control Tower | Maximum      | Low            | RevOps admins, power users        |
| Option B  | Chat Hub      | Balanced     | Medium         | Most users (reps, CSMs, managers) |
| Option C  | Ambient Feed  | Minimal      | High           | Reps focused on selling           |

#### Option A: Control Tower

Dense, dashboard-like layout with all panels visible simultaneously. Left sidebar shows agent status, center panel toggles between Daily Hub / Activity Feed / Artifacts, right sidebar has persistent chat. Designed for admins who need full oversight of all agent behavior.

#### Option B: Chat Hub (Recommended)

Chat is the primary surface, taking center stage. Contextual panels (Daily Hub, Activity Feed) appear on the right when relevant and can be toggled. Represents the "chat IS the product" vision from Sam Ho. Best balance of simplicity and power.

#### Option C: Ambient Feed

Minimal, notification-first design. Opens with a greeting ("Good morning, Tyler") and surfaces only what needs attention. Urgent items (approvals) get prominent treatment, completed items are compact. Chat input at the bottom for questions. Best for reps who don't want to manage agents.

### Components Built

| Component          | Description                                                      | States          |
| ------------------ | ---------------------------------------------------------------- | --------------- |
| DailyHub           | Three-bucket display: Done, Needs Approval, Scheduled            | All 6 AI states |
| AgentConfigChat    | Chat-based agent configuration with preview cards                | All 6 AI states |
| ArtifactView       | Meeting page with Recap/Prep/Coaching tabs, privacy chips, share | All 6 AI states |
| ActivityFeed       | Filterable audit trail with detail panel                         | All 6 AI states |
| AgentCommandCenter | Main component composing all 3 directions                        | All 6 AI states |

### Flow Stories

| Flow               | Description                                | Scenario                               |
| ------------------ | ------------------------------------------ | -------------------------------------- |
| Flow_Discovery     | How user learns about Agent Command Center | Banner → chat welcome                  |
| Flow_Activation    | First-time agent setup via chat            | Describe goal → preview → activate     |
| Flow_Day2          | Returning user morning routine             | Hub → recap → approvals → deal Q&A     |
| Flow_HappyPath     | Full end-to-end success                    | Command Center → approve → recap       |
| Flow_ErrorRecovery | How errors surface and resolve             | Failed action → hub alert → chat debug |

### Demo & Walkthrough

- **Demo_Clickthrough**: Interactive sidebar navigation through all sections (Overview, 3 directions, components, artifacts)
- **Walkthrough**: Step-by-step narrated flow covering setup, daily experience, artifacts, and trust mechanisms

### Key Design Decisions

1. **Chat as primary surface** — Per Sam Ho: "Your settings are not toggles anymore...It's a chat"
2. **Approval by exception** — Low-risk auto-runs, only high-risk surfaces for review
3. **Artifacts, not chat threads** — Per Sam Ho: "These workflows don't generate a chat. They generate artifacts."
4. **Confidence scores on everything** — Every AI action shows its confidence level
5. **Privacy gating on shares** — Privacy status chip visible, share blocked when pending
6. **Audit trail** — Every action traceable to source meeting, with before/after data

### Mock Data Scenarios

Based on real evidence from PRD:

- **Acme Corp Discovery Call** — Recap artifact, CRM updates, deal stage change approval
- **Widget Inc Demo** — Prep artifact with stakeholder map and talking points
- **DataFlow Close** — Failed action demonstrating error recovery flow
- **Self-coaching** — Coaching artifact with talk ratio and question quality patterns

### Evidence Connection

| Feature            | Evidence Source      | Quote                                                                 |
| ------------------ | -------------------- | --------------------------------------------------------------------- |
| Chat config        | Leadership direction | "Your settings are not toggles anymore...It's a chat"                 |
| 80h → 5min         | James Hinkson        | "I'm probably like a hundred hours now"                               |
| Daily Hub buckets  | Rob Henderson        | "Tell me what you've done, what needs approval, and what's scheduled" |
| Artifacts not chat | Sam Ho               | "These workflows don't generate a chat. They generate artifacts"      |
| Trust cascade      | James Hinkson        | "It's AskElephant's problem...I don't trust AskElephant"              |
| Approval fatigue   | Sam Ho               | "I hate that Cloud Code asks me all the time to approve"              |
| 42% adoption churn | Slack synthesis      | Revenue data analysis                                                 |
| Pipeline view      | Maple/Jared          | "Pipeline view mirroring HubSpot"                                     |

### Storybook Structure

```
Prototypes/AgentCommandCenter/v1/
├── AgentCommandCenter
│   ├── OptionA_ControlTower
│   ├── OptionB_ChatHub
│   ├── OptionC_AmbientFeed
│   ├── State_LoadingShort
│   ├── State_LoadingLong
│   ├── State_Error
│   ├── State_Empty
│   └── State_LowConfidence
├── DailyHub
│   ├── Default
│   ├── State_LoadingShort/Long
│   ├── State_Error
│   └── State_Empty
├── AgentConfigChat
│   ├── Default
│   ├── FirstTimeUser
│   ├── State_LoadingShort/Long
│   ├── State_Error
│   └── State_Empty
├── ArtifactView
│   ├── Recap
│   ├── Prep
│   ├── Coaching
│   ├── PrivacyPending
│   ├── State_LowConfidence
│   └── State_LoadingShort/Long/Error/Empty
├── ActivityFeed
│   ├── Default
│   └── State_LoadingShort/Long/Error/Empty
├── Journeys
│   ├── Flow_Discovery
│   ├── Flow_Activation
│   ├── Flow_Day2
│   ├── Flow_HappyPath
│   └── Flow_ErrorRecovery
├── Demo
│   └── Demo_Clickthrough
└── Walkthrough
    └── Default
```

### Next Steps (v1)

1. ~~Review with Sam and Rob — get direction preference (A/B/C)~~ → Moved to v2 (Codex-inspired simplification)
2. Run `/validate agent-command-center` for jury evaluation
3. Build design brief from selected direction

---

## Version 2 — 2026-02-07

### Overview

Radical simplification inspired by Codex's UI patterns. Drops the three-direction model (Control Tower / Chat Hub / Ambient Feed) in favor of a single, ultra-clean design with three view modes that transition naturally based on context.

### Design Philosophy

Inspired by Tyler's Codex screenshots, the v2 design follows these principles:

1. **Chat is the only surface** — No sidebar navigation, no dashboard panels, no mode switcher. Just a centered chat input.
2. **Questions replace chat** — When the system needs a structured decision (like Codex's "What should this planning turn produce?"), a clean question dialog replaces the conversation view entirely.
3. **Artifacts appear on the right** — When content is generated (recap, agent preview, CRM diff), a right panel slides in creating a two-panel split view, exactly like Codex's Plan mode output.
4. **Minimal chrome** — Thread history is a collapsible sidebar that defaults to collapsed. Settings are hidden. The UI is almost entirely whitespace and content.
5. **Empty state = suggestion cards** — Like Codex's "Start with a task" cards, the empty state shows 3 simple suggestion cards.

### Key Design Decisions (v2)

1. **Dropped the three-direction model** — Instead of Control Tower / Chat Hub / Ambient Feed as separate layouts, v2 has one adaptive layout with three view modes (chat-only, split, question) that transition based on content.
2. **Question dialog replaces chat** — Structured questions take over the full chat area (not modals, not inline), similar to Codex's prompt UI.
3. **Artifacts are first-class side panels** — Recap, agent preview, CRM diff, activity summary all render in the same right-panel slot. No tabs, no navigation within the panel.
4. **Dark-on-light, no color** — Following Codex's monochrome aesthetic. The only color is confidence bars and diff highlighting.
5. **Removed stats/metrics from main view** — No "4 agents active", no success rate bars, no time saved badges. These can surface in artifacts when asked about.

### View Modes

| Mode        | When Active                     | What User Sees                               |
| ----------- | ------------------------------- | -------------------------------------------- |
| `chat-only` | Default, no artifact open       | Centered chat with messages, input at bottom |
| `split`     | Artifact generated or viewed    | Chat on left, artifact panel on right        |
| `question`  | System asks structured question | Question dialog replaces chat area entirely  |

### Components Built (v2)

| Component              | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `AgentCommandCenterV2` | Main orchestrator — manages view mode transitions  |
| `Sidebar`              | Collapsible thread history (defaults collapsed)    |
| `EmptyState`           | Suggestion cards with greeting                     |
| `ChatInput`            | Clean input bar with send button                   |
| `ChatMessageView`      | Individual message with artifact chip and actions  |
| `QuestionDialogView`   | Full-screen question chooser with numbered options |
| `ArtifactPanel`        | Right-side panel for any artifact type             |
| `ArtifactSectionView`  | Renders body, bullets, code, and diff sections     |
| `ThinkingIndicator`    | Minimal "Thinking..." / "Generating..." state      |
| `ErrorBanner`          | Inline error display                               |

### Storybook Structure (v2)

```
Prototypes/AgentCommandCenter/v2/
├── AgentCommandCenter
│   ├── 1. Empty — Welcome
│   ├── 1b. Empty — With Thread History
│   ├── 2. Chat — Conversation
│   ├── 3. Chat — Thinking
│   ├── 3b. Chat — Generating Artifact
│   ├── 4. Question Dialog — Replaces Chat
│   ├── 4b. Question Dialog — Step 2 of 3
│   ├── 5a. Split — Agent Preview
│   ├── 5b. Split — Meeting Recap
│   ├── 5c. Split — Activity Summary
│   ├── 5d. Split — CRM Changes Diff
│   ├── 6. Full — Sidebar + Chat + Artifact
│   ├── 7. Error
│   ├── Flow: First-Time User
│   ├── Flow: Morning Routine
│   └── Flow: Agent Configuration
```

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v2/
```

### What Changed from v1

| Aspect         | v1                                                         | v2                                         |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Layout options | 3 directions (Control Tower, Chat Hub, Ambient Feed)       | 1 adaptive layout with 3 view modes        |
| Navigation     | Left sidebar with nav items, agent list                    | Collapsible thread history only            |
| Stats/metrics  | Always visible (success rate, confidence, time saved)      | Hidden — surfaced in artifacts on demand   |
| Questions      | Inline in chat as action buttons                           | Full-screen question dialog replacing chat |
| Artifacts      | Separate components (DailyHub, ArtifactView, ActivityFeed) | Unified right panel for all artifact types |
| Color          | Blue/green/amber semantic colors                           | Monochrome with minimal color accents      |
| Chrome         | Header bars, tab buttons, filter dropdowns                 | Almost zero chrome                         |
| File count     | 8 component files                                          | 1 component file + types + mock data       |

### Evidence Connection (carried from v1)

| Design Decision            | Evidence                                                                  |
| -------------------------- | ------------------------------------------------------------------------- |
| Chat as only surface       | Sam Ho: "Your settings are not toggles anymore...It's a chat"             |
| Artifacts in side panel    | Sam Ho: "These workflows don't generate a chat. They generate artifacts"  |
| Question dialog for config | Codex UI pattern: structured choices replace chat for decisions           |
| Minimal chrome             | Sam Ho: "It's just a lot of things I could click here. Cannot have that." |
| Approval inline            | Sam Ho: "I hate that Cloud Code asks me all the time to approve"          |

### Next Steps (v2)

1. ~~Review v2 in Storybook~~ → Done
2. ~~Run `/validate agent-command-center` for jury evaluation on v2~~ → Done (67% would-use, CONTESTED)
3. ~~Address 4 critical + 5 important issues from validation~~ → Built v3

---

## Version 3 — 2026-02-07

### Overview

v3 directly addresses all 9 issues identified in the v2 validation report (67% would-use, CONTESTED). The goal is to push past the 70% validation threshold by fixing the specific gaps that prevented jury pass.

### Issues Addressed

| #   | Issue                                    | Severity  | Fix in v3                                                                                                                                                                                                                     |
| --- | ---------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No daily hub / returning-user experience | Critical  | Added `MorningHubView` — greeting + summary strip (done/approvals/scheduled/time saved) + inline approval cards with diff preview. New `morning` view mode is default for returning users.                                    |
| 2   | No post-action confirmation / undo       | Critical  | Added `ToastContainer` with success/info/warning variants. Each toast can carry an `undoLabel` that triggers `onUndo`. Positioned above input bar.                                                                            |
| 3   | No "go back" in question dialog          | Critical  | Added `canGoBack` flag to `QuestionDialog` type. Back button appears when `current > 1`. `onQuestionBack` callback navigates to previous question.                                                                            |
| 4   | Feedback/correction mechanism unclear    | Critical  | Three additions: (a) correction hint below chat input ("Say 'that's wrong' to correct"), (b) `editable` flag on artifact sections with inline Edit button, (c) mock correction flow showing user → AI → corrected diff.       |
| 5   | Low-confidence hedging language          | Important | Added amber badge "AI is less certain — please review carefully" on confidence bar when < 70%. New `mockLowConfidenceArtifact` demonstrates this.                                                                             |
| 6   | No share action on artifacts             | Important | Added share menu (Slack, HubSpot, Email, Copy) in artifact panel header. Controlled by `shareable` flag on Artifact type.                                                                                                     |
| 7   | Accessibility gaps                       | Important | Added `aria-label` to all icon buttons, `aria-live="polite"` on thinking indicator and artifact panel, `aria-live="assertive"` on toast container, `role="radiogroup"` + `role="radio"` + `aria-checked` on question options. |
| 8   | No keyboard nav in question dialog       | Important | Arrow keys navigate options (up/down/left/right), Enter confirms selection. Keyboard hint shown below options.                                                                                                                |
| 9   | Skeptic "show settings" fallback         | Partial   | Not yet addressed as standalone UI — deferred to post-validation. Agent preview artifact already shows settings in a readable format.                                                                                         |

### View Modes

| Mode        | When Active                              | What User Sees                              |
| ----------- | ---------------------------------------- | ------------------------------------------- |
| `morning`   | **NEW** — Returning user, no active chat | Summary strip + approval cards + chat input |
| `chat-only` | Active thread, no artifact               | Centered chat with correction hints         |
| `split`     | Artifact generated                       | Chat + artifact panel with share/edit       |
| `question`  | Structured question                      | Question dialog with back nav + keyboard    |

### Components Built (v3)

| Component              | New/Changed | Description                                   |
| ---------------------- | ----------- | --------------------------------------------- |
| `AgentCommandCenterV3` | New         | Main orchestrator with 4 view modes           |
| `MorningHubView`       | **New**     | Daily briefing for returning users            |
| `ApprovalCard`         | **New**     | Inline approval with diff preview             |
| `SummaryChip`          | **New**     | Compact done/approval/scheduled counts        |
| `ToastContainer`       | **New**     | Post-action confirmation with undo            |
| `ShareMenuItem`        | **New**     | Share menu in artifact panel                  |
| `QuestionDialogView`   | Changed     | Added back button + keyboard navigation       |
| `ArtifactPanel`        | Changed     | Added share menu, hedging label, edit buttons |
| `ArtifactSectionView`  | Changed     | Added editable section support                |
| `ChatInput`            | Changed     | Added correction hint                         |
| `ThinkingIndicator`    | Changed     | Added aria-live                               |
| `Sidebar`              | Changed     | Added aria-labels                             |

### Storybook Structure (v3)

```
Prototypes/AgentCommandCenter/v3/
├── AgentCommandCenter
│   ├── 1a. Empty — First-Time User
│   ├── 1b. Empty — With Thread History
│   ├── 2a. Morning Hub — Daily Briefing ← NEW
│   ├── 2b. Morning Hub — No Pending Approvals ← NEW
│   ├── 3a. Chat — Conversation
│   ├── 3b. Chat — Thinking
│   ├── 3c. Chat — Generating Artifact
│   ├── 4a. Question Dialog — Step 1 (no back)
│   ├── 4b. Question Dialog — Step 2 (with back) ← FIXED #3
│   ├── 5a. Split — Agent Preview
│   ├── 5b. Split — Meeting Recap (editable) ← FIXED #4
│   ├── 5c. Split — Activity Summary
│   ├── 5d. Split — CRM Changes Diff
│   ├── 6. Split — Low Confidence (hedging) ← NEW #5
│   ├── 7a. Toast — Success with Undo ← NEW #2
│   ├── 7b. Toast — Warning ← NEW
│   ├── 7c. Toast — Multiple ← NEW
│   ├── 8. Correction Flow ← NEW #4
│   ├── 9. Error
│   ├── 10. Full — Sidebar + Chat + Artifact
│   ├── Flow: First-Time User
│   ├── Flow: Morning Routine
│   ├── Flow: Agent Configuration
│   ├── Flow: Correction + Toast Confirm ← NEW
│   └── Flow: Morning Hub → Chat ← NEW
```

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v3/
```

### What Changed from v2

| Aspect               | v2                             | v3                                                       |
| -------------------- | ------------------------------ | -------------------------------------------------------- |
| View modes           | 3 (chat-only, split, question) | 4 (+morning for returning users)                         |
| Returning users      | Same empty state as first-time | Morning hub with approvals + summary                     |
| Post-action feedback | None                           | Toast with undo for every CRM change                     |
| Question navigation  | Forward-only + dismiss         | Back + forward + dismiss + keyboard                      |
| Correction           | No mechanism                   | Hint in input, edit buttons on sections, correction flow |
| Low confidence       | Confidence bar only            | Bar + hedging text badge                                 |
| Sharing              | Not available                  | Share menu (Slack, HubSpot, Email, Copy)                 |
| Accessibility        | Minimal                        | aria-live, aria-labels, role=radiogroup, keyboard nav    |
| Story count          | 15                             | 22 (+7 new states/flows)                                 |

### Evidence Connection (updated)

| Design Decision                 | Evidence                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Morning hub for returning users | Raj (jury): "What happens after I set up the agent? Where do I go tomorrow?"    |
| Toast with undo                 | Marcus (jury): "How do I know it's not going to mess up my CRM?"                |
| Back button in questions        | Lisa (jury): "I need to review my previous answers"                             |
| Correction flow                 | Dave (jury): "I don't trust chat to manage my CRM. I need to SEE the settings." |
| Hedging language                | Design companion audit: "Low-confidence state lacks hedging language"           |
| Share menu                      | Tomiko (jury): "I'd want to share recaps from here directly to Slack"           |

### Next Steps (v3)

1. ~~Review v3 in Storybook~~ → Done
2. ~~Run `/validate agent-command-center`~~ → Done (83% would-use, VALIDATED)
3. ~~Brainstorm v4 features for three persona modes~~ → Done (persona-hypothesis-map.md)
4. ~~Build v4 prototype~~ → Done

---

## Version 4 — 2026-02-07

### Overview

v4 expands the validated v3 core into a comprehensive prototype covering three distinct persona modes identified through hypothesis and signal analysis:

1. **Configurators** — People who set up and manage agents (templates, skills, test runs, config history, CRM readiness)
2. **Elsewhere Workers** — People who interact with agent output outside AskElephant (HubSpot CRM card, email digest, Slack notifications)
3. **Daily Drivers** — People who use the ACC daily (team view, proactive suggestions, deal pipeline, self-coaching)

### Persona Coverage

| Persona              | New Features                                                                                        | Hypotheses Validated                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Configurator**     | Template marketplace, skill selection, test run (live preview), config history, CRM readiness check | `hyp-workflow-templates-reduce-setup`, `hyp-agent-skills-reduce-config` |
| **Elsewhere Worker** | HubSpot CRM card, email digest, Slack notification previews                                         | `hyp-hubspot-sidebar-integration`, `hyp-one-seat-adoption-churn`        |
| **Daily Driver**     | Team view (leader toggle), proactive suggestions, deal pipeline, self-coaching artifact             | `hyp-proactive-deal-intelligence`, `hyp-solo-rep-self-coaching`         |

### View Modes

| Mode        | When Active                    | What User Sees                                                                                             | Persona      |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------ |
| `morning`   | Returning user, no active chat | Summary strip + approvals + proactive suggestions + team toggle                                            | Daily Driver |
| `chat-only` | Active thread, no artifact     | Centered chat with correction hints                                                                        | All          |
| `split`     | Artifact generated             | Chat + artifact panel (new types: test-run, config-history, crm-readiness, deal-context, coaching-insight) | All          |
| `question`  | Structured question            | Question dialog with skills + templates                                                                    | Configurator |
| `deal-view` | Pipeline view requested        | Kanban-style deal pipeline with deal cards                                                                 | Daily Driver |

### New Artifact Types (v4)

| Type               | Persona      | Description                                                                 |
| ------------------ | ------------ | --------------------------------------------------------------------------- |
| `test-run`         | Configurator | What the agent WOULD have done on a real past meeting                       |
| `config-history`   | Configurator | Timeline of agent configuration changes                                     |
| `crm-readiness`    | Configurator | HubSpot setup check before agent configuration                              |
| `deal-context`     | Daily Driver | Full deal intelligence (meeting history, action items, AI insights, MEDDIC) |
| `coaching-insight` | Daily Driver | Private cross-call patterns and coaching trends                             |

### New Components (v4)

| Component              | New/Changed          | Persona          | Description                                             |
| ---------------------- | -------------------- | ---------------- | ------------------------------------------------------- |
| `AgentCommandCenterV4` | New                  | All              | Main orchestrator with 5 view modes                     |
| `TemplateEmptyState`   | **New**              | Configurator     | Template marketplace replacing generic suggestions      |
| `TeamMemberRow`        | **New**              | Daily Driver     | Per-rep activity row in team view                       |
| `DealPipelineView`     | **New**              | Daily Driver     | Kanban pipeline with deal cards                         |
| `DealCardView`         | **New**              | Daily Driver     | Individual deal card with agent action info             |
| `HubSpotCardPreview`   | **New** (standalone) | Elsewhere Worker | Mockup of HubSpot sidebar card                          |
| `EmailDigestPreview`   | **New** (standalone) | Elsewhere Worker | Mockup of daily digest email                            |
| `SlackMessagePreview`  | **New** (standalone) | Elsewhere Worker | Mockup of Slack bot notification                        |
| `MorningHubView`       | Changed              | Daily Driver     | Added team toggle + proactive suggestions section       |
| `ArtifactPanel`        | Changed              | All              | Added privacy badge for coaching, new section renderers |
| `ArtifactSectionView`  | Changed              | All              | Added timeline, checklist, and stats renderers          |
| `ArtifactTypeIcon`     | Changed              | All              | Added icons for 5 new artifact types                    |

### Storybook Structure (v4)

```
Prototypes/AgentCommandCenter/v4/
├── 1a. Empty — First-Time User
├── 1b. Empty — With Thread History
├── 1c. Empty — Template Marketplace              ← NEW (Configurator)
├── 2a. Morning Hub — Daily Briefing
├── 2b. Morning Hub — No Pending Approvals
├── 2c. Morning Hub — Team View (Leader)           ← NEW (Daily Driver)
├── 2d. Morning Hub — Proactive Suggestions        ← NEW (Daily Driver)
├── 3a-3c. Chat stories (unchanged from v3)
├── 4a. Question Dialog — Step 1
├── 4b. Question Dialog — Step 2 (with back)
├── 4c. Question Dialog — Skill Selection          ← NEW (Configurator)
├── 5a-5d. Split stories (unchanged from v3)
├── 5e. Split — Test Run (Live Preview)            ← NEW (Configurator)
├── 5f. Split — Agent Config History               ← NEW (Configurator)
├── 5g. Split — Deal Context Artifact              ← NEW (Daily Driver)
├── 5h. Split — Self-Coaching Insights             ← NEW (Daily Driver)
├── 6. Low Confidence (unchanged)
├── 7a-7c. Toast stories (unchanged)
├── 8. Correction Flow (unchanged)
├── 9. Error State (unchanged)
├── 10. Full Experience (unchanged)
├── 11a. CRM Card — Deal Activity                  ← NEW (Elsewhere Worker)
├── 11b. CRM Card — Approval Needed                ← NEW (Elsewhere Worker)
├── 12. Email Digest — Daily Summary               ← NEW (Elsewhere Worker)
├── 13a. Slack — Deal Update                       ← NEW (Elsewhere Worker)
├── 13b. Slack — Recap Available                   ← NEW (Elsewhere Worker)
├── 14. Deal Pipeline View                         ← NEW (Daily Driver)
├── Flow: First-Time User
├── Flow: Morning Routine
├── Flow: Agent Configuration
├── Flow: Correction + Toast Confirm
├── Flow: Morning Hub → Chat
├── Flow: CRM Readiness → Agent Setup              ← NEW (Configurator)
├── Flow: Morning → Deal → Recap                   ← NEW (Daily Driver)
└── Flow: Template → Config → Activate             ← NEW (Configurator)
```

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v4/
```

### What Changed from v3

| Aspect             | v3                                      | v4                                                                                  |
| ------------------ | --------------------------------------- | ----------------------------------------------------------------------------------- |
| View modes         | 4 (chat-only, split, question, morning) | 5 (+deal-view for pipeline)                                                         |
| Persona coverage   | Generic (all users same experience)     | Three distinct modes (Configurator, Elsewhere Worker, Daily Driver)                 |
| Empty state        | Generic suggestion cards                | Template marketplace with usage stats and persona fit                               |
| Question dialog    | Generic options only                    | Added skill selection variant                                                       |
| Morning hub        | Personal activity only                  | Team toggle (leader view) + proactive suggestions                                   |
| Artifact types     | 7 types                                 | 12 types (+test-run, config-history, crm-readiness, deal-context, coaching-insight) |
| Section renderers  | body, bullets, diff, code               | +timeline, checklist, stats                                                         |
| Elsewhere surfaces | None                                    | HubSpot card, email digest, Slack notification previews                             |
| Pipeline view      | None                                    | Deal-centric kanban with agent action overlay                                       |
| Coaching           | Generic coaching artifact               | Private self-coaching with patterns and trends                                      |
| Privacy            | None                                    | Private badge for coaching artifacts                                                |
| Story count        | 22                                      | 37+ (15 new stories for persona-specific features)                                  |

### Evidence Connection (v4)

| Design Decision         | Evidence                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Template marketplace    | Hypothesis: "If users see pre-built templates with social proof, setup time drops from 30min to 5min" |
| Skill selection         | Hypothesis: "Pre-built agent skills reduce config by 60% vs custom descriptions"                      |
| Test run preview        | Hypothesis: "Showing what WOULD have happened on a real call increases activation by 40%"             |
| CRM readiness check     | Signal: "Users who hit field mismatch errors during setup churn at 3x rate"                           |
| Team view for leaders   | Sam Ho: "Leaders need to see what the team's agents are doing, not just their own"                    |
| Proactive suggestions   | Hypothesis: "Proactive deal intelligence reduces time-to-action by 50%"                               |
| Deal pipeline view      | Maple/Jared signal: "Pipeline view mirroring HubSpot"                                                 |
| Self-coaching (private) | Hypothesis: "Solo rep coaching that's explicitly NOT visible to managers drives 2x adoption"          |
| HubSpot sidebar card    | Hypothesis: "Embedding in HubSpot reduces context-switching by 70%"                                   |
| Email/Slack digest      | Hypothesis: "Async digests reduce single-seat churn by engaging users who don't log in daily"         |

### Hypotheses v4 Aims to Validate

| Hypothesis                            | Status After v3 | v4 Target                          |
| ------------------------------------- | --------------- | ---------------------------------- |
| `hyp-proactive-deal-intelligence`     | Not addressed   | Validate via proactive suggestions |
| `hyp-solo-rep-self-coaching`          | Not addressed   | Validate via coaching artifact     |
| `hyp-workflow-templates-reduce-setup` | Not addressed   | Validate via template marketplace  |
| `hyp-agent-skills-reduce-config`      | Not addressed   | Validate via skill selection       |
| `hyp-hubspot-sidebar-integration`     | Not addressed   | Validate via CRM card preview      |
| `hyp-one-seat-adoption-churn`         | Not addressed   | Validate via email/Slack digests   |
| `hyp-chat-config-replaces-settings`   | Validated (v3)  | Strengthen                         |
| `hyp-approval-by-exception`           | Validated (v3)  | Strengthen                         |
| `hyp-artifacts-not-threads`           | Validated (v3)  | Strengthen with 5 new types        |

### Next Steps (v4)

1. Review v4 in Storybook — verify all three persona modes render correctly
2. Run `/validate agent-command-center` for jury evaluation on v4
3. Share with Sam and Rob for persona mode feedback
4. Create design brief from validated v4 direction
5. Prioritize which persona mode to build first for production

---

## Version 6 (Scaffold Baseline from v4)

### Summary

Created `v6` as the new latest prototype baseline for Agent Command Center in Storybook.

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v6/
```

### Notes

- `v6` currently mirrors the validated `v4` interaction model and story set.
- Main purpose is to establish a new version slot for the next design-language iteration.
- Export surface now points to `v6` as latest in:
  - `elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/index.ts`

---

---

## Version 5 (Figma + Codex Automations Iteration)

### Summary

v5 introduces three major design changes informed by the Figma "Agent configuration" design file and Codex's Automations/Skills UI:

1. **Top-level tabs: Chat / Automations / Skills** -- Separates ephemeral automation runs from personal chat threads (Codex-inspired)
2. **Inline Question Picker** -- Questions render in the chat input area, not full-screen (keeps chat history visible)
3. **Natural chat-based agent personalization** -- Agent corrections via conversation produce config-diff artifacts; agent cards show provenance (creator, fork status)

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v5/
├── types.ts
├── mock-data.ts
├── AgentCommandCenterV5.tsx
└── AgentCommandCenterV5.stories.tsx
```

### What Was Incorporated from Figma

| Figma Pattern                              | How Used in v5                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| Agent list with stats (users, runs, nodes) | `AgentListView` with `AgentCard` components showing stats, status, provenance |
| Agent card component                       | `AgentCard` with icon, status badge, stats row, persona fit labels            |
| History Log (task name, step, status)      | `agent-history` artifact type rendered in split view                          |
| Agent Analytics (per-agent performance)    | `agent-analytics` artifact type with stats cards and trend indicators         |
| Role-based language (AE, CSM, Operations)  | Persona fit badges on agent cards and templates                               |
| Task config sections                       | Agent corrections via chat produce `agent-config-diff` artifacts              |

### What Was Intentionally Left Separate (NOT in v5)

| Figma Pattern                 | Reason                                            |
| ----------------------------- | ------------------------------------------------- |
| Full sidebar navigation       | Contradicts v4's minimal chrome (Sam Ho feedback) |
| Global navigation component   | Platform-level concern, not ACC                   |
| Settings pages / Pro Blocks   | Admin surface, not command center                 |
| HubSpot Meeting Details page  | Already covered by v4 CRM card                    |
| Task drawer for detail/config | Replaced by natural chat corrections              |

### What Was Added from Codex Automations UI

| Codex Pattern                         | How Used in v5                                                         |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Automations top-level tab             | `TopLevelTabBar` with Chat / Automations / Skills tabs                 |
| Scheduled/Completed/Archived sections | `AutomationsView` with three collapsible sections                      |
| Automation edit modal                 | `AutomationEditModal` with name, prompt, schedule, day-of-week toggles |
| Schedule badges ("Weekdays · 15:00")  | Schedule badges on automation rows                                     |
| "No unread automations" empty state   | Empty state with icon when no automations exist                        |
| Skills tab                            | `SkillsView` with card grid, category filter, install status           |

### New Components (v5)

| Component              | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `TopLevelTabBar`       | Three tabs above content (Chat, Automations, Skills) with unread badge |
| `AutomationsView`      | Scheduled/Completed/Archived automation run list                       |
| `AutomationRow`        | Individual scheduled automation with schedule badge                    |
| `CompletedRunRow`      | Completed run with summary, duration, archive action                   |
| `AutomationEditModal`  | Edit modal with name, prompt, schedule, day-of-week, actions           |
| `SkillsView`           | Browsable skill catalog with category filter                           |
| `InlineQuestionPicker` | Compact question UI in input area (replaces full-screen dialog)        |
| `AgentListView`        | Agent card grid for returning users (replaces template marketplace)    |
| `AgentCard`            | Agent with icon, status, stats, provenance, persona fit                |

### Updated View Mode Logic

```
TopLevelTab determines the "world":
  'chat'        -> Standard chat (view modes apply here)
  'automations' -> AutomationsView (Scheduled/Completed/Archived)
  'skills'      -> SkillsView (browsable catalog)

ViewMode (ONLY within 'chat' tab):
  'agent-list'  -> hasAgents && no messages/morning/pipeline
  'deal-view'   -> hasDealPipeline
  'morning'     -> hasMorningHub
  'split'       -> hasArtifact
  'chat-only'   -> default

Questions are NO LONGER a view mode — they render as InlineQuestionPicker
in the input area, visible in ANY view mode.
```

### New Artifact Types (v5)

| Type                | Source                             |
| ------------------- | ---------------------------------- |
| `agent-analytics`   | From Figma analytics patterns      |
| `agent-history`     | From Figma history log             |
| `agent-config-diff` | From natural chat correction flow  |
| `automation-output` | From Codex completed run expansion |

### Storybook Structure (v5)

```
Prototypes/AgentCommandCenter/v5/
├── 1a-1c. Empty States (carried from v4)
├── 2a-2d. Morning Hub (carried from v4)
├── 3a-3c. Chat States (carried from v4)
├── 5a-5h. Split View Artifacts (carried from v4)
├── 6-9. Error/Low Confidence/Toasts/Correction (carried from v4)
├── 14. Deal Pipeline (carried from v4)
├── 15a-15b. Agent List — Configured / Forked (NEW)
├── 16a-16c. Inline Question Picker (NEW)
├── 17a-17c. Agent Analytics / History / Config Diff (NEW)
├── 18. Agent Correction Flow (NEW)
├── 19a-19e. Automations Tab (NEW)
├── 20a-20b. Skills Tab (NEW)
├── Flow: Agent List -> Chat -> Correct Agent (NEW)
├── Flow: Agent List -> Analytics -> History (NEW)
├── Flow: Inline Question -> Answer -> Continue (NEW)
├── Flow: Chat -> Automations -> View Run (NEW)
├── Flow: Full Experience (all tabs) (NEW)
└── Flow stories carried from v4
```

### Key Design Decisions (v5)

1. **Questions live in the input area, not full-screen** -- Chat history stays visible while answering
2. **Agent personalization through natural chat** -- "I don't like how you update deal stage" -> config diff artifact
3. **Agent provenance and forking** -- Fork created when someone else's agent is shared to you
4. **Top-level tabs separate chat from automations** -- Automation runs don't clutter thread list
5. **Automation runs are ephemeral** -- Fire-and-forget, can be archived once reviewed
6. **Skills as browsable catalog** -- Separates "what agents can do" from "what agents are doing"
7. **No heavy sidebar** -- Consistent with v4's minimal chrome philosophy
8. **History/analytics as artifacts** -- Rendered in split view, not as separate pages

### Evidence Connection (v5)

| Design Decision                | Evidence                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| Top-level tabs                 | Codex Automations UI (user screenshots) — separation of automated vs personal threads |
| Inline question picker         | Codex question UI (user screenshot) — numbered options in input area                  |
| Agent provenance               | User feedback: "somebody else might have made it, it will create duplicates"          |
| Chat-based corrections         | User feedback: "communicate through inline corrections in regular chat"               |
| Agent list for returning users | Figma "Single-tool Agent concept" frame — agent grid with stats                       |
| Automation edit modal          | Codex edit automation modal (user screenshot) — name/prompt/schedule/day toggles      |
| Schedule badges                | Codex automation row pattern — "Weekdays · 15:00" with countdown                      |

### v4 -> v5 Delta

| Aspect                | v4                                                 | v5                                                                         |
| --------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| Navigation            | Single view                                        | Top-level tabs (Chat/Automations/Skills)                                   |
| View modes            | 5 (chat-only, split, question, morning, deal-view) | 5 (question removed, agent-list added)                                     |
| Questions             | Full-screen dialog replacing chat                  | Inline picker in input area                                                |
| Agent management      | Template marketplace only                          | Agent list with stats, provenance, forking                                 |
| Agent personalization | None                                               | Natural chat corrections -> config diff artifacts                          |
| Automation tracking   | None                                               | Scheduled/Completed/Archived sections                                      |
| Skills                | Generic skill selection question                   | Browsable catalog with categories                                          |
| Artifact types        | 12                                                 | 16 (+agent-analytics, agent-history, agent-config-diff, automation-output) |
| Story count           | 37+                                                | 50+                                                                        |

### Next Steps (v5)

1. Review v5 in Storybook — verify all three tabs render correctly
2. Test inline question picker keyboard navigation
3. Share with Sam for feedback on the Automations tab concept
4. Consider adding automation "Test" (dry run) functionality
5. Evaluate whether Skills tab should show skill config or just browsing
6. Run `/validate agent-command-center` for jury evaluation on v5

---

---

## Version 7 — 2026-02-08

### Overview

v7 is a fundamental reimagining of the Agent Command Center based on deep research synthesis (Zain Hoda's "The Agent Will Eat Your System of Record" article, 15+ Slack conversations, customer feedback, leadership signals). It introduces four new concepts:

1. **Goal-Aware Narrative Hub** — Morning rundown personalized to role and objectives
2. **Agent Knowledge Profile** — What the agent knows about you, how it learned it, ability to review and correct
3. **Persistent Living Artifacts** — Documents that evolve over time, are shared, and become dynamic sources of truth
4. **Unified Elsewhere Surfaces** — One place per platform (Slack, HubSpot, Extension, Email)

### Design Philosophy (v7)

Informed by Tyler's decisions on the research synthesis:

1. **The narrative is contextual to goals** — An AE sees everything through their quota. A manager sees rep performance. A revenue leader sees both sales and CS.
2. **One surface per platform, never noisy** — Slack is one thread. HubSpot is one card. Email is one daily digest. Not notification spam.
3. **The agent learns passively and asks occasionally** — Over time the agent builds a deep profile of role, expectations, communication style, relationships. It checks in: "I've redefined your job expectations. Review?"
4. **Artifacts have permanence** — When James asks for a forecast, it becomes a living document that auto-updates, can be shared, and persists on the hub.
5. **Dynamic UI based on role** — Different roles see fundamentally different experiences, not just filtered data.

### Role Variants

| Role               | Goal Context                   | Key Sections                                               |
| ------------------ | ------------------------------ | ---------------------------------------------------------- |
| **AE**             | Monthly quota progression      | Quota bar, deal momentum, attention items, coaching nudges |
| **Sales Manager**  | Team quota + rep performance   | Team breakdown, coaching priorities, deal decisions        |
| **CSM**            | Retention + expansion targets  | Account health scores, renewal pipeline, expansion signals |
| **Revenue Leader** | Cross-function (sales + CS)    | Both team and account views, NRR + ARR combined            |
| **RevOps**         | Forecast accuracy + CRM health | Forecast scenarios, data quality, agent accuracy trending  |

### New Concepts

#### Agent Knowledge Profile

What the agent knows about the user, organized into sections:

- **Role & Responsibilities** — Title, reporting, territory (from CRM + meetings)
- **Goals & Expectations** — Quota, activity targets, focus areas (from CRM + 1:1s)
- **Communication Style** — Talk ratio, strengths, growth areas (from call analysis)
- **Key Relationships** — Accounts, champions, internal allies (from CRM + Slack + meetings)
- **Sales Methodology** — Framework, discovery approach, pricing strategy (from training + patterns)
- **Work Preferences** — Best meeting times, CRM update preference, notification preference (from behavior)

Each item shows:

- Where it was learned (meeting, CRM, Slack, inferred)
- Confidence level
- Edit/Confirm buttons
- Source and date

The agent can ask questions: "I noticed you always adjust the 'Next Steps' field after I update it. Would you like me to use a different format?"

#### Persistent Living Artifacts

Artifacts that don't disappear when the chat ends:

- **Forecast** — Q1 projection with scenarios (conservative/likely/optimistic), auto-updates daily
- **Team Scorecard** — Rep performance metrics, auto-updates after every meeting
- **Account Review** — Customer health assessment, evolves as data changes
- Pinned to the user's hub, shared with teammates, auto-refreshing

#### Unified Elsewhere Surfaces

One place per platform:

- **Slack** — Single DM thread: morning brief, approvals, deal alerts, coaching nudges
- **HubSpot** — Contextual sidebar card on each deal: agent insight, recent actions, next step
- **Browser Extension** — Floating badge with attention items, context detection (LinkedIn → shows contact info)
- **Email** — Daily digest: 3 bullets, 2 actions, 1 insight, goal-aware subject line

### View Modes (v7)

| Mode        | When Active                            | What User Sees                                             |
| ----------- | -------------------------------------- | ---------------------------------------------------------- |
| `narrative` | **NEW** — Returning user, default view | Goal-aware story + progress bars + attention items         |
| `chat-only` | Active thread, no artifact             | Chat with suggestions                                      |
| `split`     | Artifact generated                     | Chat + artifact with pin/share/refresh                     |
| `question`  | Structured decision                    | Question dialog (inherited from v3)                        |
| `knowledge` | **NEW** — Profile view                 | Agent Knowledge Profile with sections, questions, changes  |
| `hub`       | **NEW** — Pinned artifacts             | Grid of living artifacts with refresh/share                |
| `elsewhere` | **NEW** — Surface preview              | Clickable surface cards (Slack, HubSpot, Extension, Email) |

### Storybook Structure (v7)

```
Prototypes/AgentCommandCenter/v7/
├── 1a. Narrative Hub — AE (Quota Carrier)
├── 1b. Narrative Hub — Sales Manager (Team View)
├── 1c. Narrative Hub — CSM (Account Health)
├── 1d. Narrative Hub — RevOps (Forecasting)
├── 1e. Narrative Hub — Revenue Leader (Cross-Function)
├── 2a. Knowledge Profile — Full View
├── 2b. Knowledge Profile — Agent Has Questions
├── 2c. Knowledge Profile — Opened via Chat
├── 3a. Pinned Artifacts Hub
├── 3b. Living Forecast — Created via Chat
├── 3c. Living Team Scorecard
├── 4a. Elsewhere — Surface Selector
├── 5a. Chat — Empty State with Suggestions
├── 5b. Chat — Quota Conversation
├── 5c. Chat — Thinking State
├── 5d. Chat — Error State
├── 6a. Toast — Success with Undo
├── 6b. Toast — Knowledge Profile Updated
├── Flow: AE Morning Routine
├── Flow: Manager Team Review
├── Flow: Agent Learns About You
└── Flow: Living Forecast Creation
```

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v7/
├── types.ts          — Full type system with roles, knowledge, persistent artifacts, elsewhere
├── mock-data.ts      — 5 role variant datasets + knowledge profile + living artifacts + surfaces
├── AgentCommandCenterV7.tsx  — Main component with all 7 view modes
└── AgentCommandCenterV7.stories.tsx  — 20+ stories covering all concepts and flows
```

### What Changed from v4/v6

| Aspect             | v4/v6                                  | v7                                                                                     |
| ------------------ | -------------------------------------- | -------------------------------------------------------------------------------------- |
| Morning hub        | Generic summary strips                 | Goal-aware narrative paragraphs per role                                               |
| Roles              | 3 persona modes (same underlying data) | 5 distinct role experiences with different narratives and metrics                      |
| Agent knowledge    | None                                   | Full knowledge profile with learning, questions, review                                |
| Artifacts          | Ephemeral (disappear after chat)       | Persistent living documents that auto-update and share                                 |
| Elsewhere surfaces | Standalone mockup components           | Unified "one place per platform" concept with Slack DM, HubSpot card, extension, email |
| View modes         | 5                                      | 7 (+narrative, knowledge, hub, elsewhere; -morning replaced by narrative)              |
| Trust mechanism    | Confidence bar + hedging               | Knowledge profile showing what agent knows and how it learned it                       |
| Team view          | Simple row list                        | Full team narrative with coaching priorities and status indicators                     |
| Account view       | None                                   | Account health with risk factors, expansion signals, renewal pipeline                  |
| Forecast/reporting | None                                   | Persistent forecast artifact with scenarios, charts, assumptions                       |

### Evidence Connection (v7)

| Design Decision         | Evidence                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Goal-aware narrative    | Tyler: "An AE should see emails, Slacks, coaching stats, and deals in context of quota progression"                                             |
| Role-specific views     | Tyler: "A sales manager would be concerned for monthly quota but in context of rep performance"                                                 |
| One place per platform  | Tyler: "If it's in Slack it should be one place to interact with AskElephant, same with HubSpot"                                                |
| Agent Knowledge Profile | Tyler: "What would it look like for every rep to have a view of what the agent knows about their role, title, expectations, goals"              |
| Agent learns passively  | Tyler: "This shouldn't be something they have to tell the agent but over time it would learn"                                                   |
| Agent asks occasionally | Tyler: "Every once in a while it might ask, 'I've redefined your job expectations, would you like to review?'"                                  |
| Persistent artifacts    | Tyler: "The report or graph has a sense of permanence that James can refer back to or create as a dynamic source of truth"                      |
| Dynamic UI              | Tyler: "Completely dynamic UIs that lean on outside information... helping on one sales call or forecasting for the next year"                  |
| Not CRM replacement     | Tyler: "Not about replacing HubSpot's UI at all, it is about creating a proactive system of record assistant hub"                               |
| Full customer journey   | Tyler: "Manages a revenue team's customer journey from the first time they're introduced to the brand until they've been customers for decades" |

### Research Sources

Based on deep research synthesis (`pm-workspace-docs/research/synthesis/2026-02-08-agent-command-center-deep-research.md`):

- Zain Hoda, "The Agent Will Eat Your System of Record" (Feb 4, 2026)
- 15+ Slack conversations across product, leadership, and customer channels
- 6 prototype iterations (v1-v6) with validation data
- Leadership signals: Sam Ho, Rob Henderson, Woody Klemetson
- Customer feedback: Joshua Oakes, David Karp, James Hinkson, Annie, Matt Bennett
- Weekly Signal Synthesis Report (Feb 1, 2026)
- Persona Hypothesis Map analysis

### Next Steps (v7)

1. Review v7 in Storybook — verify all 5 role variants render correctly
2. Run `/validate agent-command-center` for jury evaluation on v7
3. Build detailed Elsewhere surface prototypes (Slack DM thread, HubSpot sidebar card)
4. Share with Sam and Rob — get feedback on Agent Knowledge Profile concept
5. Prototype the "agent asks a question" interaction pattern more deeply
6. Test the persistent artifact concept with James (RevOps) — does the forecast scenario match his mental model?
7. Consider: should the knowledge profile be visible to managers? (Privacy implications)

---

## Version 7 (Implementation) — 2026-02-08

### Overview

v7 implements Skylar's new designs for top-level navigation and enhanced chat input, incorporating them into all three creative directions (A: Control Tower, B: Chat Hub, C: Ambient Feed) from v6. Focus is on complete interactive flows where every button, tab, and interaction works.

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v7/
```

### New Design Components (from Skylar's Figma)

#### 1. Top-Level Navigation (replaces sidebar)

- **Source**: `figma.com/design/CTuVNq1pANDsYr2Az4ktZE` — Global navigation component (824:1249)
- Horizontal nav bar with warm stone background (`#f1eeeb`)
- AskElephant logo + tab navigation: Meetings, Ask, Agents, Analytics
- Active tab uses pill background (`#dbd9d7`), inactive is `#737373`
- Right side: notification bell (with badge count), settings, help icons
- **Chat CMD+K button**: white with border, subtle shadow, keyboard shortcut display
- Avatar: lime green (`#bef264`) circle with user initial
- Multiple instances showing different tab states and screen sizes

#### 2. Enhanced Chat Input (replaces basic input)

- **Source**: `figma.com/design/EgEsOKl70B0iULW29ZrjJj` — New Chat input component (604:11533)
- Rounded container (12px radius) with `#e5e5e5` border
- **Context chips**: Entity tags above input (contact=blue, company=purple, meeting=amber, deal=green)
- **Slash command menu**: Categorized commands (Generate, Search, Actions) with icons + descriptions
- **Footer toolbar**: Context (+) and Commands (/) buttons, send button
- Multi-line expansion with text flowing to upper section
- Overflow menu with categorized slash commands matching Figma design

#### 3. Chat Sidebar Panel (from sidebar design)

- **Source**: `figma.com/design/EgEsOKl70B0iULW29ZrjJj` — New Chat sidebar component (608:13424)
- Shows full chat panel with header, message body, footer
- Integrated with global navigation at top
- Panels for different chat states (empty, active, with context)

### Three Creative Directions (v7)

All three options now share the top-level navigation and enhanced chat input:

| Direction | Name          | Focus Tab             | Best For                          |
| --------- | ------------- | --------------------- | --------------------------------- |
| Option A  | Control Tower | All tabs equally      | RevOps admins, power users        |
| Option B  | Chat Hub      | Ask tab primary       | Most users (reps, CSMs, managers) |
| Option C  | Ambient Feed  | Ask tab (morning hub) | Reps focused on selling           |

### Components Built (v7-specific)

| Component         | Description                                                           | Interactive?                                                |
| ----------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| TopNavigation     | Horizontal nav from Figma with tabs, icons, CMD+K button, avatar      | Yes — all tabs switch views                                 |
| EnhancedChatInput | Redesigned input with context chips, slash commands, footer toolbar   | Yes — chips removable, slash menu opens, commands clickable |
| MeetingsView      | Meeting list with filter tabs (all/upcoming/completed), status badges | Yes — filter toggles, meeting rows clickable                |
| AgentsView        | Agent management list with status, confidence, create button          | Yes — agent rows clickable, create button                   |
| AnalyticsView     | Stats grid + activity chart with 6 key metrics                        | Yes — hover states on chart bars                            |

### Stories (37 total)

| Category    | Stories | Description                                                                                                               |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Option A    | 5       | Control Tower: Meetings, Ask+Chat, Agents, Analytics, Deal Pipeline                                                       |
| Option B    | 8       | Chat Hub: First-time, Templates, Chat, Context Chips, Questions, Thinking, Generating, Error                              |
| Option C    | 5       | Ambient Feed: Morning, All Clear, Proactive, Team View, Self-Coaching                                                     |
| Split Views | 5       | Recap, CRM Diff, Test Run, Deal Context, Low Confidence                                                                   |
| Toasts      | 2       | Success+Undo, Multiple                                                                                                    |
| Correction  | 1       | Correction + Toast confirmation                                                                                           |
| Elsewhere   | 3       | CRM Card, Email Digest, Slack Notification                                                                                |
| Full Flows  | 8       | OptionA Full Day, OptionB Setup, OptionB Config→Activate, OptionC Morning, OptionC Deal, CRM Readiness, Questions, Skills |

### Key Design Decisions (v7)

1. **Top nav replaces sidebar** — Skylar's horizontal nav gives more horizontal space for content, matches modern SaaS patterns (Linear, Notion, Figma)
2. **Four primary tabs** — Meetings, Ask, Agents, Analytics covers all user intents without overwhelming
3. **CMD+K for global chat** — Chat accessible from any tab via keyboard shortcut, not just the Ask tab
4. **Context chips in input** — Users can tag entities (contacts, companies, meetings) for context-aware questions
5. **Slash commands** — `/` prefix opens categorized command menu for power users
6. **Warm stone palette** — Nav uses `#f1eeeb` matching AskElephant brand warmth (from Figma design tokens)
7. **All v6 features preserved** — Morning hub, deal pipeline, question dialogs, artifacts, correction flow, toasts all work within new layout

### Storybook Structure

```
Prototypes/AgentCommandCenter/v7/
├── Option A
│   ├── A. Control Tower — Meetings Tab
│   ├── A. Control Tower — Ask Tab (Chat)
│   ├── A. Control Tower — Agents Tab
│   ├── A. Control Tower — Analytics Tab
│   └── A. Control Tower — Deal Pipeline
├── Option B
│   ├── B. Chat Hub — First-Time User
│   ├── B. Chat Hub — Template Marketplace
│   ├── B. Chat Hub — Active Chat
│   ├── B. Chat Hub — Context Chips
│   ├── B. Chat Hub — Question Dialog
│   ├── B. Chat Hub — Thinking State
│   ├── B. Chat Hub — Generating Artifact
│   └── B. Chat Hub — Error
├── Option C
│   ├── C. Ambient Feed — Morning Briefing
│   ├── C. Ambient Feed — All Clear
│   ├── C. Ambient Feed — Proactive Suggestions
│   ├── C. Ambient Feed — Team View (Leader)
│   └── C. Ambient Feed — Self-Coaching
├── Split Views (5)
├── Toasts (2)
├── Correction Flow (1)
├── Elsewhere Workers (3)
└── Full Interactive Flows (8)
```

### Figma Design References

| Component         | Figma File          | Node ID                      | URL                                                                                               |
| ----------------- | ------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Global Navigation | Agent configuration | 824:1249                     | [Link](https://www.figma.com/design/CTuVNq1pANDsYr2Az4ktZE/Agent-configuration?node-id=824-1249)  |
| Nav Variants      | Agent configuration | 824:1422, 824:1334, 824:1449 | Same file, different instances                                                                    |
| Chat Input        | New Chat (side bar) | 604:11533                    | [Link](https://www.figma.com/design/EgEsOKl70B0iULW29ZrjJj/New-Chat--side-bar-?node-id=604-11532) |
| Chat Sidebar      | New Chat (side bar) | 608:13424                    | Same file                                                                                         |

---

---

## Version 9 — 2026-02-08

### Overview

Fully interactive, production-fidelity prototype with AskElephant navigation chrome. Every component is interactive — users can type messages and receive simulated AI responses, edit artifact sections inline, confirm/edit knowledge profile items, and navigate between views seamlessly. Replaces the sidebar with the actual AskElephant top navigation and uses the production chat input design.

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v9/
```

### Key Changes from v8

| Change                | v8                              | v9                                                                                                     |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Navigation**        | Sidebar with hamburger toggle   | Top-level AskElephant nav bar (Search, My meetings, Customers, Chats, Automations)                     |
| **Chat Input**        | Simple text input + Send button | Production chat input with "/" prompt library, Tools menu, Ask button, purple focus border             |
| **Interactivity**     | Props-driven, no internal state | Fully stateful with simulated AI, editable artifacts, persistent session state                         |
| **AI Responses**      | Static mock messages            | Pattern-matched simulated responses with artifacts (pipeline, forecast, knowledge, scorecard, prep)    |
| **Artifact Editing**  | Read-only display               | Click "Edit" on any editable section → inline textarea → Save/Cancel                                   |
| **Knowledge Profile** | Static display                  | Confirm items, edit values inline, answer/dismiss questions, review changes                            |
| **Slash Commands**    | Not available                   | Type "/" to see prompt library (pipeline, forecast, prep, team, crm-update, coaching, accounts, deals) |
| **Tools Menu**        | Not available                   | "Tools" button opens data source selector (CRM, Meeting Notes, Email, Calendar, Slack, Documents)      |
| **Toast System**      | Props-driven                    | Auto-dismissing toasts on all interactions (edits, confirms, shares)                                   |

### Interactive Features

| Feature                 | How to Trigger                     | What Happens                                                                    |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| Chat with AI            | Type message + "Ask" button        | Thinking → Generating → AI response (possibly with artifact)                    |
| Slash commands          | Type "/" in chat                   | Dropdown with 8 commands, filtered as you type                                  |
| Tools menu              | Click "Tools" button               | Data source selector populates chat with `@source`                              |
| Click suggestion        | Click any suggestion card          | Sends as message, AI responds with relevant artifact                            |
| Click attention item    | Click item in morning brief        | Switches to chat, starts conversation about that item                           |
| Edit artifact section   | Click "✏️ Edit" on section         | Inline textarea editor with Save/Cancel                                         |
| Confirm knowledge       | Click "✓" on knowledge item        | Item marked confirmed, toast shown                                              |
| Edit knowledge          | Click "Edit" on knowledge item     | Inline input editor with Enter/Escape                                           |
| Answer question         | Click "Yes, adapt" or "Not now"    | Question removed from pending list                                              |
| Review change           | Click "Looks right" or "Incorrect" | Change marked as reviewed                                                       |
| View artifact from chat | Click artifact card in message     | Opens split view with editable artifact panel                                   |
| Share artifact          | Click "Share" on artifact          | Toast: "Link copied to clipboard"                                               |
| Navigate views          | Click top nav tabs                 | Chats → chat, My meetings → narrative, Customers → knowledge, Automations → hub |
| Chat toggle             | Click "Chat CMD+K"                 | Switches to chat view                                                           |

### Simulated AI Responses

| User Input Pattern                | AI Response                          | Artifact                      |
| --------------------------------- | ------------------------------------ | ----------------------------- |
| quota, pipeline, deals, tracking  | Pipeline status + top deals          | Pipeline Report (editable)    |
| forecast, projection, predict     | 3 scenarios + pipeline breakdown     | Living Forecast (with charts) |
| know about me, profile            | Knowledge summary + learning gaps    | Knowledge Profile             |
| team, scorecard, reps, coaching   | Rep breakdown + coaching priorities  | Team Scorecard (with charts)  |
| prep, meeting, demo               | Attendees + talking points + risks   | Meeting Prep (editable)       |
| account, health, retention, churn | At-risk accounts + expansion signals | —                             |
| crm, update, approve              | Overnight changes needing approval   | —                             |
| (default)                         | Generic helpful response             | —                             |

### Storybook Structure

```
Prototypes/AgentCommandCenter/v9/
├── Interactive Narratives (5 role variants)
│   ├── 1a. Interactive — AE Morning Brief
│   ├── 1b. Interactive — Sales Manager Morning
│   ├── 1c. Interactive — CSM Morning Brief
│   ├── 1d. Interactive — RevOps Morning Brief
│   └── 1e. Interactive — Revenue Leader
├── Interactive Knowledge (1)
│   └── 2a. Interactive — Knowledge Profile
├── Interactive Hub (1)
│   └── 3a. Interactive — Pinned Artifacts Hub
├── Interactive Chat (5 starting points)
│   ├── 4a. Interactive — Empty Chat with Suggestions
│   ├── 4b. Interactive — Pipeline Conversation
│   ├── 4c. Interactive — Living Forecast
│   ├── 4d. Interactive — Team Scorecard
│   └── 4e. Interactive — Knowledge via Chat
└── Complete Flows (4)
    ├── Flow: AE Full Day Experience
    ├── Flow: Manager Coaching Session
    ├── Flow: RevOps Forecasting Session
    └── Flow: CSM Account Review
```

### Design References (from production app)

| Element        | Source                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Top Navigation | AskElephant production app — Logo, Search, My meetings, Customers, Chats, Automations, Settings, Chat CMD+K, Avatar |
| Chat Input     | AskElephant production app — "/" prompt library, Tools button, Ask button, purple focus border                      |

---

---

## Version 10 — 2026-02-09

### Overview

v10 is a fundamental redesign of the Agent Command Center based on Rob Henderson's CEO feedback session (2026-02-09). The core shift: **action-driven instead of insight-driven**. Rob's framework: "When I'm proactive, AI is reactive. When AI is proactive, I'm reactive."

### Location

```
elephant-ai/apps/web/src/components/prototypes/AgentCommandCenter/v10/
├── types.ts
├── mock-data.ts
├── AgentCommandCenterV10.tsx
└── AgentCommandCenterV10.stories.tsx
```

### Rob's Key Feedback Quotes

> "If you focus on the action, then the insights are a byproduct of what should be done."
> — Rob Henderson [0:17:01]

> "When I'm proactive, AI is reactive. When AI is proactive, I'm reactive."
> — Rob Henderson [0:21:35]

> "Each meeting is like its own card... boom boom boom. Eight meetings done. Fifteen minutes. I just saved four hours."
> — Rob Henderson [0:25:59]

> "I really care about am I going to hit? Don't care about where I'm at."
> — Rob Henderson [0:16:42]

> "Lowest hanging fruit for biggest impact... every single user that logged in saw, hey Tyler, I just updated these four things for you."
> — Rob Henderson [0:39:47]

### What Changed from v9

| Aspect | v9 | v10 |
| --- | --- | --- |
| Morning view | Insight-driven narrative with data | Action-first: "Here are 3 things to do and why" |
| Login experience | No value attribution | "What I Did For You" banner on every login |
| Interaction model | Single mode | AI-Led / User-Led toggle |
| End of day | Same as morning | Rapid-fire meeting card clearing |
| Metrics framing | Current state ("62% of quota") | Trajectory ("Forecasting +$300K over target") |
| Goal navigation | Flat | Goal → Team → Person → Action drill-down |
| Time awareness | None | Dynamic based on time of day (8am prep vs 5pm clearing) |
| Proactive alerts | None | AI surfaces issues with suggested actions |
| View modes | narrative, chat-only, split, knowledge, hub | action-morning, action-queue, planning, drill-down, chat-only, split |

### New Components (v10)

| Component | Description |
| --- | --- |
| ValueBanner | Purple gradient strip: "I handled 7 things for you since Friday" with expandable list |
| ModeToggle | Pill toggle: "🤖 AskElephant leads" / "📋 I'm planning" |
| ActionCard | Recommended action with reasoning, impact badge, approve/defer/explore buttons |
| ForecastBar | Trajectory-first: "+$300K over target" or "-$150K under target" with reasoning |
| MeetingClearCard | Full-width card with CRM diffs, drafted email, next steps, progress bar |
| ProactiveAlertBanner | Amber/red alert with suggested action when AI detects issues |
| DrillDownView | Breadcrumb navigation: Net New ARR → Teams → Person → Actions |
| TimeAwareBadge | Context badge: "☀️ Morning Prep · 58 min to next meeting" |

### View Modes

| Mode | When Active | What User Sees |
| --- | --- | --- |
| `action-morning` | **DEFAULT** — Returning user | Value banner + forecast + mode toggle + recommended actions |
| `action-queue` | End of day clearing | Rapid-fire meeting cards with progress bar |
| `planning` | User-led mode selected | Suggestion grid for goal-setting and strategic review |
| `drill-down` | Goal exploration | Breadcrumb nav: Goal → Team → Person → Actions |
| `chat-only` | Active conversation | Chat with AI (v9 preserved) |
| `split` | Artifact generated | Chat + artifact panel (v9 preserved) |

### Storybook Structure (v10)

```
Prototypes/AgentCommandCenter/v10/
├── 1a. Action Morning — AE (value banner + 3 actions + forecast)
├── 1b. Action Morning — Manager (team-focused actions)
├── 2a. Rapid-Fire — End of Day (8 meeting cards)
├── 3a. AI-Led — Proactive Alert (forecast dropped $40K)
├── 3b. User-Led — Planning Session
├── 4a. Time-Aware — Morning 8am (meeting prep focus)
├── 4b. Time-Aware — Evening 5pm (action clearing focus)
├── 5a. Goal Drill-Down — Top Level (teams)
├── 5b. Goal Drill-Down — Person Level (Jake Morrison)
├── 6a. Forecast-First — Exceeding Target
├── 6b. Forecast-First — At Risk
├── 7a. Interactive Chat
├── Flow: Full Day Experience
├── Flow: Proactive → Action
└── Flow: Drill-Down Journey
```

### Evidence Connection

| Design Decision | Evidence |
| --- | --- |
| Action-first morning | Rob: "Think through the next 5 things and present that to me" |
| Value banner on login | Rob: "Lowest hanging fruit for biggest impact... I just updated these four things for you" |
| AI-Led / User-Led toggle | Rob: "When I'm proactive, AI is reactive. When AI is proactive, I'm reactive." |
| Rapid-fire meeting cards | Rob: "Each meeting is its own card... boom boom boom. 8 meetings done. 15 minutes." |
| Time-aware experience | Rob: "If I log in at 8AM, my homepage is different than at 5PM" |
| Forecast-first framing | Rob: "I really care about am I going to hit? Don't care about where I'm at." |
| Goal drill-down | Rob: "Click into this, break it down into buckets, who's doing well, who's not" |
| Proactive alerts | Rob: "AskElephant should think through the next 5 things and present that to me" |

### Hypotheses v10 Aims to Validate

| Hypothesis | Source | v10 Feature |
| --- | --- | --- |
| `hyp-action-over-insight-engagement` | Rob feedback (NEW) | Action-first morning view |
| `hyp-value-attribution-retention` | Rob feedback (NEW) | Value banner on login |
| `hyp-time-aware-dynamic-ux` | Rob feedback (NEW) | Time-aware rendering |
| `hyp-proactive-deal-intelligence` | Existing (strengthened) | Proactive alerts + forecast-first |
| `hyp-rep-workspace-viral-anchor` | Existing (strengthened) | Rapid-fire meeting clearing |

### Next Steps (v10)

1. Review v10 in Storybook — verify all view modes and interactions work
2. Run `/validate agent-command-center` for jury evaluation on v10
3. Share Chromatic link with Rob Henderson for direct feedback
4. Schedule Rob + Sam alignment session on the AI-Led/User-Led framework
5. Prototype the "system that learns" concept (monthly planning ritual)
6. Consider mobile-first rapid-fire card clearing (swipe gestures)

---

_Created: 2026-02-07_
_Updated: 2026-02-09 (v10 — Action-First Redesign from Rob Henderson Feedback)_
_Owner: Tyler_
