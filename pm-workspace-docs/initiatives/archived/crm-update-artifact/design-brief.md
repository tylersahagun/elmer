# Design Brief: CRM Experience End-to-End

## Overview

This design brief covers the complete CRM agent experience from initial setup through daily use. The core design challenge is **building confidence** through education, testing, and visibility.

> "I want to be able to actually test and see an output so that I have confidence. That's the key there is I need the confidence."

---

## Design Principles

### 1. Confidence First

Every interaction should build user confidence. Show, don't tell. Let users test before committing.

### 2. Progressive Disclosure

Start simple (one or handful of things), expand as confidence grows. Don't overwhelm.

### 3. Proactive Communication

The agent should communicate what it did, not wait to be asked. Surface issues before users discover them.

### 4. Clear Boundaries

Users should always know what data is being touched, where the agent is running, and how to stop it.

### 5. Appropriate Control

Admins get full control. Users get personal control. Both get visibility.

---

## User Flows

### Flow 1: Admin Onboarding (Confidence-Building)

**Goal:** Get admin from "I don't know how this works" to "I'm confident this will work for my team"

```
Step 1: Connect CRM
├── OAuth flow with HubSpot
├── Success confirmation with account name
└── "What's next" preview

Step 2: Education
├── "How CRM Agents Work" explainer
├── Visual diagram of meeting → analysis → CRM update
├── Example outputs (before/after)
└── "I understand, let's continue" CTA

Step 3: Select Scope
├── Choose workspace (if multiple)
├── Choose call type (Discovery, Demo, etc.)
└── Explain why this matters

Step 4: Pre-built Templates
├── Show 3-5 recommended workflows for call type
├── Each with description + preview
├── Toggle on/off (start with 1-2 on)
└── "These are proven workflows we know work"

Step 5: Configure Fields
├── For each enabled workflow, show fields
├── Toggle individual fields on/off
├── Show confidence indicators
└── "Start simple, add more later"

Step 6: Test on Real Data
├── Select a recent meeting
├── Run agent in preview mode
├── Show exactly what would be updated
├── Confidence scores per field
└── "This is what would happen"

Step 7: Review & Activate
├── Summary of configuration
├── Low-confidence items flagged
├── "Activate" or "Adjust" options
└── Success celebration

Step 8: Management View
├── Transition to full dashboard
├── See running agents
├── "Configure more" CTA
└── Quick access to activity log
```

### Flow 2: Admin Daily Operations

**Goal:** Give admins visibility, control, and proactive insights

```
Dashboard Home
├── Health Status (green/yellow/red)
├── Recent Activity Summary
├── Alerts & Anomalies (if any)
└── Quick Actions

Activity Log View
├── Timeline of all agent runs
├── Filter by: Agent, Tool, Status, Date
├── Each entry shows:
│   ├── Meeting that triggered
│   ├── What was updated
│   ├── Confidence score
│   └── Status (success/failed/pending)
└── Drill-down to details

Alert Center
├── Broken agents (errors)
├── Anomalies detected
├── Trend warnings
└── Each with:
    ├── What happened
    ├── Why it matters
    └── Recommended action

Troubleshooting Flow
├── Clear error message
├── Suggested fixes
├── One-click retry
└── Escalation path
```

### Flow 3: User Agent Communication Center

**Goal:** Let users see what the agent is doing and respond appropriately

```
Agent Messages View
├── "What I Did" section
│   ├── Recent agent actions
│   ├── What was updated
│   └── Link to CRM record
├── "Needs Your Input" section
│   ├── HITL approval requests
│   ├── Questions from agent
│   └── Quick action buttons
└── "Your Preferences" section
    ├── Notification settings
    ├── Opt-out options
    └── Personal automation access

Message Types
├── Info: "I updated Deal Stage to Proposal"
├── Request: "Should I update this field? [Yes/No]"
├── Alert: "I couldn't find a matching deal"
└── Success: "CRM updated successfully ✓"
```

### Flow 4: Inbox (Human-in-the-Loop)

**Goal:** Fast, confident approval decisions

```
Inbox List View
├── Count badge showing pending items
├── Sort by: Urgency, Date, Type
├── Each item shows:
│   ├── What needs approval
│   ├── Meeting context
│   ├── Confidence score
│   └── Quick approve/reject
└── Batch actions

Item Detail View
├── Full context (meeting, transcript excerpt)
├── Before/After comparison
├── Confidence explanation
├── Approve / Reject / Edit buttons
└── "Don't ask me again for this type"

Slack Integration
├── Notification with summary
├── Inline approve/reject buttons
├── Link to full detail
└── Configurable frequency
```

### Flow 5: User Self-Service Automations

**Goal:** Empower users to customize without admin involvement

```
Discovery View
├── "What can I automate?"
├── Browse available automation types
├── See examples
└── "Create my own" CTA

Builder View
├── Simple trigger selection
├── Action configuration
├── Preview mode
├── "This only affects your data" callout
└── Save & activate

My Automations View
├── List of personal automations
├── Enable/disable toggles
├── Edit/delete options
└── Activity log (personal only)
```

---

## Key Screens

### Screen 1: Onboarding - Education Step

**Purpose:** Build understanding before configuration

**Elements:**

- Hero illustration: Meeting → Agent → CRM
- "How it works" in 3 simple steps
- Example output card showing before/after
- "I understand" primary CTA
- "Learn more" secondary link

**Tone:** Welcoming, educational, confidence-building

---

### Screen 2: Onboarding - Test on Real Data

**Purpose:** Build confidence through demonstration

**Elements:**

- Meeting selector (recent meetings)
- "Run Preview" button
- Results panel showing:
  - Matched record (with confidence)
  - Fields that would update
  - Confidence score per field
  - "View in HubSpot" link
- Success state: Green checkmarks, celebration
- Low confidence state: Yellow warnings, explanations

**Tone:** Transparent, reassuring, actionable

---

### Screen 3: Admin Activity Dashboard

**Purpose:** Full visibility into agent operations

**Elements:**

- Health status banner (green/yellow/red)
- Stats cards: Runs today, Success rate, Pending approvals
- Activity timeline (filterable)
- Alerts section (if any)
- Quick actions: Configure new, View all agents

**Tone:** Professional, informative, in-control

---

### Screen 4: User Agent Communication Center

**Purpose:** Central hub for agent interactions

**Elements:**

- "What I Did" feed with recent actions
- "Needs Your Input" section (prominent if items pending)
- Notification preferences quick access
- "Build Your Own" automation CTA
- Data visibility: "The agent is touching these areas"

**Tone:** Conversational, helpful, transparent

---

### Screen 5: Inbox

**Purpose:** Fast approval workflow

**Elements:**

- Pending count badge
- List of items with:
  - Meeting context
  - What needs approval
  - Confidence indicator
  - Quick approve/reject
- Batch select + batch approve
- Filter/sort controls

**Tone:** Efficient, clear, trustworthy

---

### Screen 6: Anomaly Alert

**Purpose:** Proactive issue surfacing

**Elements:**

- Alert type icon (warning, error, info)
- Clear headline: "Unusual pattern detected"
- Explanation: What happened, why it matters
- Trend visualization (if applicable)
- Recommended actions
- Dismiss / Investigate buttons

**Tone:** Helpful, not alarming, actionable

---

## Interaction Patterns

### Pattern: Confidence Score Display

- High (80%+): Green checkmark, no explanation needed
- Medium (50-79%): Yellow indicator, brief explanation
- Low (<50%): Red warning, requires review, full explanation

### Pattern: Before/After Comparison

- Side-by-side layout
- Highlight changes (green for additions, strikethrough for removals)
- Link to source (meeting transcript)

### Pattern: Quick Actions

- Approve: Single click, immediate feedback
- Reject: Single click, optional feedback prompt
- Edit: Opens inline editor, then approve

### Pattern: Progressive Loading

- Show skeleton states
- Load critical info first
- Lazy load details

### Pattern: Notification Preferences

- Channel selection (Slack, Desktop, Email, In-app)
- Frequency (Immediate, Digest, Off)
- Type filtering (HITL only, All, Errors only)

---

## Edge Cases

### Empty States

**No agents configured:**

- Illustration + "Get started" CTA
- Link to onboarding

**No activity yet:**

- "Waiting for first meeting" message
- Explanation of what will appear

**No pending approvals:**

- "All caught up" celebration
- Link to activity log

### Error States

**CRM connection lost:**

- Clear error message
- Reconnect CTA
- What data is affected

**Agent failed:**

- What went wrong
- What to do
- Retry option

**Low confidence match:**

- Multiple options presented
- User selects correct one
- Agent learns

---

## Accessibility Considerations

- All confidence indicators have text labels (not just color)
- Keyboard navigation for all actions
- Screen reader announcements for status changes
- Focus management in modals and flows
- Sufficient color contrast
- Touch targets minimum 44x44px

---

## Design References

### Internal

- HubSpot Agent Config UI v3 (`prototypes/src/components/HubSpotConfig/v3/`)
- Notification patterns in existing app
- Workflow builder UI patterns

### External

- Linear's inbox and notification patterns
- Notion's onboarding flow
- Zapier's automation builder simplicity
- Slack's notification preferences

---

## Open Design Questions

1. How do we visualize "everywhere the agent is touching" without overwhelming?
2. What's the right density for the activity log?
3. How do we make anomaly detection feel helpful vs alarming?
4. Should personal automations be in a separate section or integrated?
5. How do we handle mobile for HITL approvals?

---

## Prototype Priorities (Revised per James's Stack)

Based on 2026-01-16 planning session, priorities have been reordered:

### Q1 Focus (James's Priority Stack)

| #   | Prototype                         | Rationale                                                 |
| --- | --------------------------------- | --------------------------------------------------------- |
| 1   | **Workflow Visibility Dashboard** | "I don't know if it just failed or never hit triggers"    |
| 2   | **Manual Enrollment/Test**        | "To test something, I have to trigger 40 other workflows" |
| 3   | **AI Context Indicators**         | Guide users to correct nodes for CRM workflows            |
| 4   | **Property Creation Flow**        | "Would you like to create them? Yes."                     |

### Future (Post-Q1)

5. **Onboarding Wizard** - Confidence-building flow
6. **Agent Communication Center** - User daily experience
7. **Inbox** - HITL approval workflow
8. **Anomaly Alerts** - Proactive surfacing

---

## New Flow: Manual Enrollment/Test

**Goal:** Let admins test workflows without contaminating production data or triggering other HubSpot workflows

```
Workflow Detail View
├── "Test" button in header
├── Opens: Record Selector
│   ├── Search HubSpot records
│   ├── Filter by: Deal, Contact, Company
│   ├── Show recent records
│   └── Select one record
├── Opens: Test Preview
│   ├── "Run as if this met trigger criteria"
│   ├── Dry run option (show what would happen)
│   ├── Execute option (actually run, but isolated)
│   └── Results appear in visibility dashboard
└── Results View
    ├── What was updated (or would be)
    ├── Confidence scores
    ├── Link to HubSpot record
    └── "Adjust workflow" CTA if issues
```

**Key Design Requirements:**

- Clear labeling: "This is a TEST run"
- Isolation indicator: "Other HubSpot workflows will NOT be triggered"
- Results clearly marked as test in activity log
- One-click to convert test → production run

---

## New Flow: Workflow Visibility Dashboard

**Goal:** Show exactly what each workflow did—which records, when, successes, failures

```
Workflow List View
├── List of all workflows
├── Each shows:
│   ├── Name
│   ├── Status (active/paused/error)
│   ├── Last run timestamp
│   ├── Success rate (last 7 days)
│   └── "View runs" CTA
└── Quick filters: All, Active, Errors

Workflow Run History (New Screen)
├── Selected workflow name + status
├── Stats: Total runs, Success rate, Avg confidence
├── Run list (newest first):
│   ├── Timestamp
│   ├── HubSpot record (linked)
│   ├── AskElephant event (linked)
│   ├── Status: ✓ Success / ✗ Failed / ⏳ Pending
│   ├── Confidence score
│   └── Expand for details
├── Filters:
│   ├── Date range
│   ├── Status (success/failed/pending)
│   └── Confidence range
└── "Chat with workflow" CTA (future)

Run Detail View
├── Full context:
│   ├── Meeting that triggered
│   ├── HubSpot record updated
│   ├── Fields changed (before/after)
│   ├── Confidence per field
│   └── Any errors/warnings
├── Links:
│   ├── Open in HubSpot
│   ├── View meeting in AskElephant
│   └── Edit workflow
└── "Rerun on this record" CTA
```

---

## New Screen: Property Creation Flow

**Goal:** Create/repurpose HubSpot properties from within workflow builder

```
Property Needed Dialog
├── Triggered when workflow needs field that doesn't exist
├── "This workflow needs: Deal Stage Reason"
├── Options:
│   ├── "Use existing field" (shows matches)
│   │   ├── List of similar unused fields
│   │   └── "These fields exist but aren't used recently"
│   ├── "Create new field"
│   │   ├── Name (pre-filled)
│   │   ├── Type (auto-suggested)
│   │   └── Description
│   └── "Skip this field"
├── Preview: "This will create/use field X in HubSpot"
└── "Approve & Continue" / "Cancel"
```

**Key Design Requirements:**

- Never create without explicit admin approval
- Always show existing fields first
- Explain why field is needed
- Show impact: "This will appear in HubSpot under Deal Properties"

---

_Last updated: 2026-01-16_
_Designer: TBD_
