# Prototype Notes: Composio Agent Framework

**Created:** 2026-01-22  
**Prototype Type:** Standalone (Storybook)  
**Location:** `elephant-ai/web/src/components/prototypes/ComposioAgentFramework/`

---

## Overview

This prototype explores the UX for the Composio Agent Framework, covering both phases:

- **Phase 1: Universal Agent Node** — A workflow builder node for Composio integrations
- **Phase 2: Agent Configurator** — A standalone page for creating/managing agent templates

## Creative Options Explored

Three creative directions were built to explore the autonomy spectrum:

### Option A: Maximum Control

**Philosophy:** Step-by-step wizard with explicit confirmations. Nothing happens without user approval.

**Characteristics:**
- 6-step wizard (Basics → Trigger → Integrations → Tools → Instructions → Review)
- Each step must complete before proceeding
- Maximum transparency about configuration
- Clear progress indicator

**Best For:**
- New users learning the system
- High-stakes agents (e.g., those with delete permissions)
- Organizations prioritizing control over efficiency

**Trade-offs:**
- Most steps, slowest path to creation
- May feel tedious for experienced users

---

### Option B: Balanced ⭐ (Recommended)

**Philosophy:** AI suggests, user easily overrides. Building trust through helpful defaults.

**Characteristics:**
- Single-page form with collapsible sections
- AI "Suggest" button for instructions
- Inline tool selection with expandable integration cards
- Dialog for integration picker

**Best For:**
- Most users in general scenarios
- Balance of control and efficiency
- Trust-building journey

**Trade-offs:**
- Middle ground may not fully satisfy either extreme
- More cognitive load than wizard (all at once)

**Why Recommended:**
This option balances trust-building (users see everything, can override) with productivity (single page, AI assists). It follows the human-centric AI design principle of "AI suggests, human decides."

---

### Option C: Maximum Efficiency

**Philosophy:** AI acts, user reviews. Minimum steps for experienced users.

**Characteristics:**
- Single input: "What should this agent do?"
- AI generates complete configuration
- User reviews and approves or edits
- Fastest path to creation

**Best For:**
- Power users who trust AI
- Routine agent creation
- Speed-focused workflows

**Trade-offs:**
- May feel "black box" to new users
- Requires established trust
- User may not understand what was configured

---

## Human-Centric AI Design Principles Applied

### Trust Calibration
- **Tool risk indicators**: Read (green) / Write (amber) / Delete (red) with icons
- **Service account recommendation**: Prominently suggests transparency
- **Connection status**: Clear visual for connected vs. needs-connection

### Emotional Design
- **Visceral**: Clean, professional interface builds trust
- **Behavioral**: Consistent patterns across all options
- **Reflective**: Users feel in control, agents assist (not replace)

### Accessibility
- Keyboard navigable throughout
- Clear focus states
- Color not sole indicator (icons + labels)
- Aria-live regions for dynamic content

### All States Implemented
- ✅ Loading (skeleton cards)
- ✅ Success (agent enabled confirmation)
- ✅ Error (connection failed alerts)
- ✅ Low Confidence (not applicable—no AI inference)
- ✅ Empty (no agents, admin vs. user variants)

---

## Key Components Created

| Component | Purpose | Location |
|-----------|---------|----------|
| `IntegrationPicker` | Search/select from 877 integrations | `components/IntegrationPicker.tsx` |
| `ToolSelector` | Toggle tools with risk indicators | `components/ToolSelector.tsx` |
| `InstructionsEditor` | Natural language prompt with variables | `components/InstructionsEditor.tsx` |
| `AgentCard` | Display card for agent listing | `components/AgentCard.tsx` |
| `UniversalAgentNode` | Phase 1 workflow node | `UniversalAgentNode.tsx` |

---

## Storybook Stories

Navigate to `Prototypes/ComposioAgentFramework/` in Storybook:

| Story | Description |
|-------|-------------|
| `Option A: Maximum Control` | Wizard-based configurator |
| `Option B: Balanced` | Single-page form (recommended) |
| `Option C: Maximum Efficiency` | AI-generated config |
| `Agent List: User View` | Discovery & opt-in experience |
| `Agent List: Admin View` | Management interface |
| `States: Loading` | Skeleton loading states |
| `States: Empty` | Empty state variants |
| `Component: *` | Individual component demos |
| `Options Comparison` | Side-by-side comparison |

### Universal Agent Node Stories
Navigate to `Prototypes/ComposioAgentFramework/UniversalAgentNode/`:

| Story | Description |
|-------|-------------|
| `Empty State` | No integrations added |
| `With Integrations` | Configured with tools |
| `Needs Connection` | Mixed connection status |
| `Collapsed` | Collapsed node state |
| `In Workflow Context` | Full workflow preview |

---

## Recommendations

### Short-term (Phase 1)
- Ship **Universal Agent Node** with Option B patterns
- Focus on HubSpot, Slack, Salesforce integrations first
- Ensure service account recommendation is prominent

### Long-term (Phase 2)
- Start with **Option B** for Agent Configurator
- Offer Option A as "guided mode" for new users
- Consider Option C as "quick create" for power users

### Design Questions to Resolve

1. **Card vs. list for integration picker?**
   - Current: Card-based with search
   - Alternative: List with inline toggle

2. **Where does Agent Configurator live?**
   - Recommendation: `/agents` or nested under `/settings/agents`

3. **How to handle template versioning?**
   - When admin updates, do opted-in users auto-update?

---

## Open Items for Review

- [ ] Woody to review Phase 2 UX vision
- [ ] Engineering to confirm Composio API integration patterns
- [ ] RevOps persona validation (is wizard too slow?)
- [ ] Accessibility audit on final option

---

## Files Created

```
elephant-ai/web/src/components/prototypes/ComposioAgentFramework/
├── index.ts
├── types.ts
├── AgentConfigurator.tsx
├── AgentConfigurator.stories.tsx
├── UniversalAgentNode.tsx
├── UniversalAgentNode.stories.tsx
└── components/
    ├── index.ts
    ├── IntegrationPicker.tsx
    ├── ToolSelector.tsx
    ├── InstructionsEditor.tsx
    └── AgentCard.tsx
```

---

## v2 Iteration (2026-01-22)

### Signals Consumed

| Signal ID | Type | Key Contribution |
|-----------|------|------------------|
| `sig-2026-01-22-adam-composio-agent-feedback` | transcript | Conversational setup preference, auth scope problem |
| `sig-2026-01-22-composio-figma-make-chat-interface` | document | Animation patterns, typewriter effect |
| Jury Evaluation (100 users) | validation | 87% pass rate, top concerns identified |

### Key Changes Made

#### 1. ActivityLog Component (Jury Top Concern #1)

**Problem addressed:** "Need to see audit trail of what agent did" (26 mentions)

**Features:**
- Timeline grouped by date (Today, Yesterday, etc.)
- Per-action expandable entries with evidence
- Status indicators: success, error, pending, low-confidence
- Retry capability for failed actions
- Agent attribution (which agent did what)
- Confidence indicators

**Location:** `v2/components/ActivityLog.tsx`

#### 2. TestPreview Component (Jury Suggestion #2)

**Problem addressed:** "Show preview before agent runs" (18 mentions)

**Features:**
- Select a past meeting to test against
- "Dry run" showing hypothetical output
- Feedback buttons (Looks good / Needs changes)
- Edit instructions flow if preview is wrong
- Builds trust before enabling automation

**Location:** `v2/components/TestPreview.tsx`

#### 3. Error Recovery Flow (Jury Concern #2)

**Problem addressed:** "What happens when an action fails?" (18 mentions)

**Features:**
- Clear error states with colored borders/backgrounds
- Error messages with actionable recovery
- Retry buttons where applicable
- Link to edit agent if config issue

### Documentation Updates

- **PRD:** Added auth scope problem, jury results, activity log requirement
- **Design Brief:** Added conversational setup flow, error handling UX, test-before-activate

### Open Items for v3 — ✅ ADDRESSED

All three items have been implemented in v3:

1. ✅ **Conversational Setup (Option D)** — Implemented as `ConversationalSetup.tsx`
2. ✅ **Workspace vs. User Auth Controls** — Implemented as `AuthScopeSelector.tsx`
3. ✅ **Rollback / Undo** — Implemented as `RollbackPanel.tsx`

---

## v3 Iteration (2026-01-22)

### What Was Built

#### 1. ConversationalSetup Component (Option D - Adam's Preference)

**Problem addressed:** "People see a blank text field and they have no clue what to do."

**Features:**
- Chat-based agent configuration instead of forms
- AI asks clarifying questions progressively
- Shows 3 output format previews, user picks preferred
- Auth scope selection built into conversation
- Test before activate flow integrated
- Typewriter effect for AI messages with artifact reveals
- Quick-select buttons for common intents

**Location:** `v3/components/ConversationalSetup.tsx`

**Key UX Pattern:**
```
User: "I want to update HubSpot after meetings"
AI: "That's a little vague. Tell me more about what you want updated."
User: "Summarize meeting and add next steps to the deal"
AI: [Shows 3 format options] "Which style do you prefer?"
User: [Clicks Option 2]
AI: "Great! How should I authenticate?"
...
AI: "Here's your agent. Ready to activate?"
```

#### 2. AuthScopeSelector Component

**Problem addressed:** Workspace vs. user-level authentication for shared agents.

**Features:**
- Global scope selector (Workspace recommended vs. Personal)
- Per-integration override with collapsible advanced settings
- **Shared agent warning** — Alerts when personal auth used in shared agents
- Connection status per integration
- "Requires personal" indicator for email drafts etc.
- Clear visual distinction (Building icon vs. User icon)

**Location:** `v3/components/AuthScopeSelector.tsx`

**Key UX Pattern:**
- Default to workspace for safety
- Warn when shared agent has personal integrations
- Let users override per-integration in advanced mode

#### 3. RollbackPanel Component

**Problem addressed:** "What if the agent does something wrong?" (Jury concern #3 - 14 mentions)

**Features:**
- Scrollable action history with timeline grouping
- Checkbox selection for batch rollback
- Status badges: Completed, Reverted, Failed, Pending
- Before/after diff preview for CRM updates
- Confirmation dialog with action summary
- "Cannot revert" indicators for permanent actions (sent emails)
- Success message after rollback

**Location:** `v3/components/RollbackPanel.tsx`

**Key UX Pattern:**
- Select 1+ actions → "Rollback (N)" button → Confirmation dialog → Execute

---

## Storybook Stories (v3)

Navigate to `Prototypes/ComposioAgentFramework/V3Iteration/`:

| Story | Description |
|-------|-------------|
| `Option D: Conversational Setup` | Full chat-based agent creation flow |
| `Auth Scope: Workspace Selected` | Default workspace auth selection |
| `Auth Scope: Shared Agent Warning` | Warning when personal auth + shared |
| `Rollback / Undo Panel` | Action history with rollback capability |
| `V3 Complete Dashboard` | Tabbed view of all v3 components |
| `Options A-D Comparison` | Side-by-side all four options |

---

## Files Created (v3)

```
elephant-ai/web/src/components/prototypes/ComposioAgentFramework/v3/
├── index.ts
├── V3Iteration.stories.tsx
└── components/
    ├── index.ts
    ├── ConversationalSetup.tsx
    ├── AuthScopeSelector.tsx
    └── RollbackPanel.tsx
```

---

## Design Options Summary

| Option | Philosophy | Best For | Status |
|--------|-----------|----------|--------|
| **A: Maximum Control** | Step-by-step wizard | New users, high-stakes | v1 ✅ |
| **B: Balanced** ⭐ | AI suggests, user overrides | Most users | v1 ✅ Recommended |
| **C: Maximum Efficiency** | AI generates, user reviews | Power users | v1 + v2 ✅ |
| **D: Conversational** | Chat-based progressive | Everyone (Adam's pref) | v3 ✅ **NEW** |

---

## v4 Iteration (2026-01-22) — FOCUSED

### Problem Addressed

**Agent conflict resolution** — v3 jury's highest-severity new concern (9 mentions)

> "What happens if two agents try to update the same field? Which one wins?"

### What Was Built

#### 1. ConflictDetector Component

**Purpose:** Detect and resolve field conflicts during agent creation.

**Features:**
- Scans existing agents for field overlap when creating new agent
- Visual conflict cards showing which agents target same field
- Three resolution strategies:
  - **Priority** — This agent's value overwrites others
  - **Merge** — Values combined (append to text fields)
  - **Skip** — Don't update if another agent already did
- Must resolve all conflicts before saving agent
- Clear progress indicator (N of M resolved)

**Location:** `v4/components/ConflictDetector.tsx`

**Key UX Pattern:**
```
[Creating "Post-Meeting Updater"]

⚠️ 1 Field Conflict Detected

┌─────────────────────────────────────────────────┐
│ 🔶 HubSpot → Deal.Next Steps                    │
│    Conflicts with: Meeting Follow-up Drafter    │
│                                                 │
│    How should this conflict be handled?         │
│    ○ This agent takes priority                  │
│    ● Merge values (append)                      │
│    ○ Skip if already updated                    │
└─────────────────────────────────────────────────┘

[Save & Continue]
```

#### 2. ConflictWarning Component

**Purpose:** Show conflict outcomes in Activity Log after agents run.

**Features:**
- Compact inline badge for timeline views
- Expandable card showing full conflict details
- Visualization of both agents + their proposed values
- Final value display with resolution applied
- Outcome badges: Priority Applied, Values Merged, Update Skipped
- "Adjust Conflict Settings" button for quick access

**Location:** `v4/components/ConflictWarning.tsx`

---

## Storybook Stories (v4)

Navigate to `Prototypes/ComposioAgentFramework/V4Iteration/`:

| Story | Description |
|-------|-------------|
| `Conflict Detection (During Creation)` | Full conflict resolution flow |
| `No Conflicts (Clean Creation)` | When fields don't overlap |
| `Conflict Warnings (Activity Log)` | Runtime conflict display |
| `Resolution Outcomes (All 3 Types)` | Priority, Merge, Skip examples |
| `Inline Badges (Compact View)` | Compact conflict indicators |
| `Complete Conflict Flow` | End-to-end creation → runtime |

---

## Files Created (v4)

```
elephant-ai/web/src/components/prototypes/ComposioAgentFramework/v4/
├── index.ts
├── V4Iteration.stories.tsx
└── components/
    ├── index.ts
    ├── ConflictDetector.tsx
    └── ConflictWarning.tsx
```

---

## All Jury Concerns Status

| Concern | Version | Component | Status |
|---------|---------|-----------|--------|
| Audit trail / visibility | v2 | `ActivityLog` | ✅ Resolved |
| Error handling / recovery | v2 | `TestPreview` | ✅ Resolved |
| Rollback / undo | v3 | `RollbackPanel` | ✅ Resolved |
| **Agent conflict resolution** | **v4** | **`ConflictDetector` + `ConflictWarning`** | **✅ Resolved** |
| Template versioning | — | Policy doc | 📋 Not prototype |
| Team adoption reporting | — | Analytics feature | 📊 Phase 2 |

---

## v5 Iteration (2026-01-22) — Skills Layer

### Problem Addressed

**Skills Layer (Phase 3)** — Reduce agent configuration friction with domain expertise.

> "People see a blank text field and they have no clue what to do." — Adam

### What Was Built

#### 1. SkillsSelector Component

**Purpose:** Select domain expertise skills that make agents smarter.

**Features:**
- Built-in skills (RevOps Expert, Follow-up Best Practices, Deal Intelligence)
- Workspace custom skills created by team
- Auto-discovery based on agent instructions
- Search and filter by category
- Skill details dialog with usage stats
- Toggle skills on/off

**Location:** `v5/components/SkillsSelector.tsx`

### Files Created (v5)

```
elephant-ai/web/src/components/prototypes/ComposioAgentFramework/v5/
├── index.ts
├── v5.stories.tsx
└── components/
    ├── index.ts
    ├── SkillsSelector.tsx
    └── AgentFrameworkDashboard.tsx
```

---

## v6 Iteration (2026-01-22) — Unified Framework

### Problem Addressed

**Unified Experience** — Bring together ALL features from v1-v5 into a cohesive, production-ready experience.

### What Was Built

#### AgentSkillsFramework Component

**Purpose:** Full-page dashboard unifying all agent framework features.

**Features:**
- **Dashboard View**: Metrics, quick actions, recent agents, activity feed
- **Agents View**: Full agent list with search, filter, CRUD operations
- **Skills View**: Browse and toggle built-in and workspace skills
- **Activity View**: Complete audit trail with ActivityLog component
- **Create Wizard**: Multi-step wizard with:
  - Conversational Setup (Option D)
  - Skills Selection with auto-discovery
  - Auth Scope Configuration
  - Test Preview before activation
  - Review & Activate

**Location:** `v6/AgentSkillsFramework.tsx`

### Key Integration Points

| Feature | Source | Integration |
|---------|--------|-------------|
| Activity Log | v2 | Embedded in Activity view + Dashboard sidebar |
| Test Preview | v2 | Step 4 of Create Wizard |
| Conversational Setup | v3 | Step 1 of Create Wizard |
| Auth Scope Selector | v3 | Step 3 of Create Wizard |
| Rollback Panel | v3 | Available from agent actions |
| Conflict Detector | v4 | Step 3 of Create Wizard (with Auth) |
| Skills Selector | v5 | Step 2 of Create Wizard + Skills View |

### Storybook Stories (v6)

Navigate to `Prototypes/ComposioAgentFramework/v6-SkillsIntegration/`:

| Story | Description |
|-------|-------------|
| `Dashboard` | Default view with metrics and quick actions |
| `AgentsList` | Full agent management view |
| `SkillsLibrary` | Browse and toggle skills |
| `ActivityView` | Complete audit trail |
| `CreateAgentFlow` | Interactive wizard demo |
| `QuickActionDemo` | Quick create from template |
| `SearchDemo` | Search functionality |
| `OptionA_MaximumControl` | Reference to v1 wizard approach |
| `OptionB_Balanced` | Reference to v1 single-page approach |
| `OptionC_MaximumEfficiency` | Quick create templates |
| `OptionD_Conversational` | Chat-based setup (primary) |
| `SkillsAutoDiscovery` | Auto-suggest skills demo |
| `TrustCalibration` | Activity log trust patterns |
| `MobileView` | Responsive mobile layout |
| `TabletView` | Responsive tablet layout |

### Files Created (v6)

```
elephant-ai/web/src/components/prototypes/ComposioAgentFramework/v6/
├── index.ts
├── AgentSkillsFramework.tsx
└── AgentSkillsFramework.stories.tsx
```

---

## Design Options Summary (Updated)

| Option | Philosophy | Best For | Status |
|--------|-----------|----------|--------|
| **A: Maximum Control** | Step-by-step wizard | New users, high-stakes | v1 ✅ |
| **B: Balanced** | AI suggests, user overrides | Most users | v1 ✅ |
| **C: Maximum Efficiency** | AI generates, user reviews | Power users | v1 + v2 ✅ |
| **D: Conversational** ⭐ | Chat-based progressive | Everyone | v3 + v6 ✅ **Recommended** |

---

## All Jury Concerns Status (Final)

| Concern | Version | Component | Status |
|---------|---------|-----------|--------|
| Audit trail / visibility | v2 | `ActivityLog` | ✅ Resolved |
| Error handling / recovery | v2 | `TestPreview` | ✅ Resolved |
| Rollback / undo | v3 | `RollbackPanel` | ✅ Resolved |
| Agent conflict resolution | v4 | `ConflictDetector` + `ConflictWarning` | ✅ Resolved |
| Configuration friction | v5 | `SkillsSelector` | ✅ Resolved |
| Template versioning | — | Policy doc | 📋 Not prototype |
| Team adoption reporting | — | Analytics feature | 📊 Phase 2 |

---

## Next Steps

1. **Schedule Woody design review** — Get sign-off on v6 unified experience
2. **Show to Caden** — Engineering feasibility for conflict detection + skills APIs
3. **Draft template versioning policy** — Document in PRD, not prototype
4. **Consider phase 2 analytics** — Team adoption dashboards
5. **User testing** — Validate v6 with real users before launch
