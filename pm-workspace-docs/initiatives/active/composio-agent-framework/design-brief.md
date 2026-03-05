# Design Brief: Composio Agent Framework

**Initiative:** composio-agent-framework  
**Designer:** Woody (awaiting review)  
**Last Updated:** 2026-02-09  
**Prototype Version:** v6 (Unified Framework)  
**Linear Project:** [Deprecating the Pipedream](https://linear.app/askelephant/project/deprecating-the-pipedream-70c7a6bf99aa)

---

## Design Challenge

How do we take the complexity of 877 integrations with hundreds of tools each and make it feel simple enough that:
1. An admin can configure an automation in minutes, not hours
2. A non-technical user can opt into an agent without understanding the underlying infrastructure
3. Everyone trusts what the agent is doing on their behalf

> "Workflow building is so complex... Just like the trigger, give it permissions, and then tell it what you wanna do."

---

## User Flows

### Flow 1: Admin Creates Universal Agent Node (Phase 1)

```
Workflow Builder
  └── + Add Node
        └── "Universal Agent" (new node type)
              └── Integration Picker
                    ├── Search/browse 877 integrations
                    ├── Toggle integrations on/off
                    └── Per-integration: toggle tools on/off
              └── Instructions (natural language prompt)
                    └── "After each meeting, update the HubSpot deal with..."
              └── Connection Status
                    ├── "Connect [Integration]" → OAuth flow
                    └── ⚠️ "We recommend using a service account for transparency"
```

**Key States:**
- Empty state (no integrations selected)
- Integration search/browse
- Tool selection within integration
- Connection pending
- Connected (with service account badge)
- Connected (with personal account warning)

### Flow 2: Admin Creates Agent Template (Phase 2)

```
/agents (new page)
  └── + Create Agent
        └── Basic Info
              ├── Name: "Follow-up Drafter"
              ├── Description: "Drafts personalized follow-up emails..."
              └── Icon picker
        └── Triggers
              ├── "When does this agent run?"
              ├── AskElephant triggers: "After meeting ends", "Deal stage changes"
              └── Composio triggers: "New Slack message in channel", "Email received"
        └── Integrations & Tools
              ├── + Add Integration
              │     └── Search/select from Composio
              └── Per-integration tool toggles
        └── Instructions
              └── Rich text prompt editor
                    └── Variables: {{meeting_summary}}, {{attendees}}, {{deal_name}}
        └── Publish Settings
              ├── Draft (only you can see)
              ├── Shared (visible to workspace)
              ├── Recommended (suggested for users)
              └── Required (mandatory for team members)
```

### Flow 3: User Opts Into Agent (Phase 2)

```
/agents (user view)
  └── Available Agents
        ├── Recommended for You
        │     └── [Agent Card]
        │           ├── Name, description, creator
        │           ├── "Used by 12 teammates"
        │           └── [Enable] button
        └── All Workspace Agents
              └── [Agent Card]...

  └── [Enable] clicked
        └── Connection Modal
              ├── "This agent needs access to:"
              │     ├── Gmail (not connected) → [Connect]
              │     └── HubSpot (connected ✅)
              └── [Enable Agent] (disabled until all connected)

  └── My Agents (enabled)
        └── [Agent Card]
              ├── Status: Active ✅
              ├── Last run: 2 hours ago
              ├── [View Activity] → logs
              └── [Disable]
```

---

## Key Screens/States

### Phase 1: Universal Agent Node

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| Node empty state | First-time configuration | Friendly illustration, "Add your first integration" |
| Integration picker | Select which integrations | Search, categories, popular, recently used |
| Tool selector | Scope which tools | Checklist with descriptions, "Select all" / "Clear" |
| Instructions editor | Natural language prompt | Large textarea, variable hints |
| Connection status | Show auth state | Green check / warning / connect button |
| Service account guidance | Educate on best practice | Info banner explaining recommendation |

### Phase 2: Agent Configurator

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| Agent list (admin) | Manage all agents | Cards with status badges, usage stats |
| Agent list (user) | Discover & opt-in | Recommended section, search/filter |
| Agent builder | Create/edit template | Stepper or tabs for each section |
| Trigger picker | When to run | Category tabs, search, multi-select |
| User opt-in modal | Connect & enable | Progress indicator, clear requirements |
| Agent activity log | See what happened | Timeline of actions with outcomes |

---

## Interaction Patterns

### Integration Selection
- **Search-first:** Given 877 options, search must be fast and prominent
- **Smart defaults:** Show "Popular" and "Recently used" sections
- **Bulk actions:** "Enable all HubSpot tools" vs. individual toggles
- **Visual hierarchy:** Integration icon + name + tool count

### Tool Scoping
- **Default OFF:** Don't give agent every tool by default
- **Grouped tools:** Read vs. Write vs. Delete categories
- **Risk indicators:** ⚠️ badge on destructive tools (archive, delete)
- **Descriptions:** Brief explanation of what each tool does

### Natural Language Instructions
- **Large, comfortable textarea** — This is the core input
- **Variable insertion:** Dropdowns or `/` commands to insert {{variables}}
- **Examples:** "See examples" link with common patterns
- **Validation:** Warning if prompt is too vague

### Connection Flow
- **OAuth popup** — Standard pattern
- **Service account nudge:** "For best results, connect a dedicated service account"
- **Fallback:** "Connect your personal account (not recommended for shared workflows)"

### Agent Opt-in (Phase 2)
- **One-click for connected users** — If all integrations already connected
- **Progressive disclosure:** Show what's needed, connect one-by-one
- **Social proof:** "Used by 12 teammates" builds trust
- **Easy out:** Disable anytime, clear what stopping does

---

## Edge Cases

### Error States (Updated v2 - Jury Top Concern #2)

| Error | UX Response | Recovery Action |
|-------|-------------|-----------------|
| Integration connection fails | Inline error with "Try again" + "Get help" | Retry OAuth flow |
| Agent action fails at runtime | Toast notification + entry in activity log | "View details" → Activity Log |
| Rate limit hit | "Agent paused—try again in X minutes" | Auto-resume after cooldown |
| Integration revoked mid-run | Clear notification, prompt to reconnect | "Reconnect [Integration]" button |
| Partial success (some actions failed) | Summary toast: "2/3 actions completed" | Activity log shows which failed |
| Network timeout | "Connection lost. Retrying..." | Auto-retry with exponential backoff |

**Error Recovery Flow:**
```
Agent action fails
  → Toast: "Action failed: [brief reason]"
    → [View Details] → Opens Activity Log
      → Activity entry shows:
        - What was attempted
        - Why it failed
        - [Retry] button
        - [Edit Agent] button (if config issue)
```

**Error Attribution:**
- Errors clearly show "Agent: [Agent Name]" so users know which agent failed
- Timestamp helps correlate with specific meetings/triggers
- Evidence section shows what context the agent had

### Empty States

| State | UX Response |
|-------|-------------|
| No integrations added | Illustration + "Add your first integration to get started" |
| No agents in workspace (user view) | "No agents available yet. Ask your admin!" |
| No activity yet | "Run your first agent to see activity here" |

### Loading States

| State | UX Response |
|-------|-------------|
| Integration search | Skeleton cards while loading |
| Connection in progress | Spinner with "Connecting to [Integration]..." |
| Agent running | "Running..." badge with spinner on agent card |

### Permission Boundaries

| Scenario | UX Response |
|----------|-------------|
| User tries to create agent (admin-only) | "Contact your admin to create agents" |
| Required agent can't be disabled | Disabled toggle + "Required by your admin" |
| User not eligible for agent (team restriction) | Hidden from their list (not shown as locked) |

---

## Accessibility Considerations

### Keyboard Navigation
- Tab through integration cards
- Enter to toggle, Space to expand details
- Escape to close modals

### Screen Reader
- Integration cards have descriptive labels: "[Integration name], [X tools enabled]"
- Connection status announced: "Gmail, connected" vs. "Gmail, not connected, button to connect"
- Agent status announced: "Follow-up Drafter agent, active, last run 2 hours ago"

### Color Independence
- Don't rely only on green/red for status
- Use icons (✓, ⚠️, ✕) alongside colors
- Text labels always present

### Motion
- Respect `prefers-reduced-motion`
- No required animations for understanding state

---

## Design References

### Internal (AskElephant)
- **HubSpot Agent Config UI** — Similar integration configuration patterns
- **Workflow Builder nodes** — Existing node styling and patterns
- **Settings pages** — Toggle and form patterns

### External
- **Linear's Agent Guidelines** — Transparency principles
- **Zapier's Zap builder** — Integration picker UX
- **Slack's Workflow Builder** — Trigger selection patterns
- **Notion's connections** — OAuth and permission UX

---

## Design Questions to Explore

1. **Card vs. list for integrations?** 
   - Cards are scannable but take space
   - List is compact but less visual

2. **Stepper vs. tabs for agent builder?**
   - Stepper implies order (might be unnecessary)
   - Tabs allow jumping around

3. **How prominent is the service account recommendation?**
   - Banner that can be dismissed?
   - Inline warning every time?
   - Onboarding-only?

4. **How do we visualize "what this agent can do"?**
   - List of permissions?
   - Visual scope indicator?
   - "This agent can read and write to HubSpot"

5. **Activity log granularity?**
   - Every API call?
   - Summary per run?
   - Only errors and successes?

---

## NEW: Trigger/Integration Ordering UX Problem (2026-01-22)

**Signal:** `sig-2026-01-22-composio-agent-architecture-deep-dive`

### The Problem

> "How do we show all the possible triggers for all possible integrations up front? Like, that just doesn't seem feasible unless you narrow it down."

**User mental model:** "When a meeting ends, update my CRM" (trigger-first)  
**System requirement:** "Which integration provides that trigger?" (integration-first)

This creates a chicken-and-egg problem:
- Users don't know which integrations have which triggers
- Can't show all triggers from all 877 integrations at once
- First-time users don't know their own tech stack yet

### Proposed Solutions

#### Option 1: Generic Trigger Categories
```
"When should this agent run?"
├── On a schedule (daily, weekly, custom)
├── After a meeting ends ← AskElephant native
├── When an event happens in...
│   └── [Shows integration picker]
│       └── [Shows integration-specific triggers]
```

**Pros:** Matches user mental model  
**Cons:** Hides integration complexity; may confuse power users

#### Option 2: AI-Assisted Progressive Disclosure
```
AI: "What do you want this agent to do?"
User: "Update HubSpot after meetings"
AI: "Got it! I'll trigger after meetings and connect to HubSpot."
    [Shows: Trigger: After meeting | Integration: HubSpot]
AI: "Which HubSpot actions should it have access to?"
    [Shows: Search/filter for HubSpot tools]
```

**Pros:** Natural, conversational, already preferred (Option D)  
**Cons:** Longer flow; requires good NLU

#### Option 3: Smart Defaults + Manual Override
```
"Popular triggers:"
├── After meeting ends (AskElephant)
├── New email received (Gmail/Outlook)
├── Deal stage changes (HubSpot/Salesforce)
└── [+ More triggers...] → Opens full integration picker
```

**Pros:** Fast for common cases; discoverable for advanced  
**Cons:** Requires knowing what's "popular"; may not match user's stack

### Tool Discovery at Scale

**Problem:** Slack has 100+ tools. How do users find the right ones?

**Proposed UX:**
- Search always visible
- Categorized by action type (Read, Write, Delete)
- "Recommended for this trigger" section
- Risk indicators (⚠️) on destructive tools
- "Select all / Clear all" for bulk actions

### Design Recommendation

Combine **Option 1 + Option 2**:
1. Start with generic trigger categories (schedule, after meeting, on event)
2. "On event" reveals AI-assisted integration picker
3. AI suggests integrations based on user's instruction text
4. Tool selection uses search + categories + bulk actions

---

## Design Explorations

### Chat Interface Prototype (Adam, 2026-01-22)

**Signal:** `sig-2026-01-22-composio-figma-make-chat-interface`  
**Source:** Figma Make prototype (Options A, B, C)  
**Full Spec:** `signals/documents/2026-01-22-composio-figma-make-chat-interface-spec.md`

Key patterns explored:
- **Typewriter effect** — Character-by-character text reveal simulates AI thinking
- **Artifact chains** — UI cards/lists fade in only AFTER text completes
- **Sticky input** — Floating input card at viewport bottom with auto-expanding textarea
- **Animation timing** — Uses `onAnimationEnd` callbacks (not timeouts) for reliability

**Applicability to Composio:**
| Design Brief Section | Potential Application |
|----------------------|-----------------------|
| Natural Language Instructions | Large textarea pattern, comfortable input |
| Agent Opt-in UX | Sequential reveal builds trust |
| Activity Log | Streaming responses for real-time feel |

**Open Questions:**
1. Does this pattern extend to the Universal Agent Node, or only standalone chat?
2. Should "Suggested Workflows" artifacts map to actual Composio integrations?
3. Consider `prefers-reduced-motion` for accessibility

---

### Conversational Setup (Option D) - Adam Feedback Session (2026-01-22)

**Signal:** `sig-2026-01-22-adam-composio-agent-feedback`  
**Key Insight:** Blank prompt fields intimidate users—conversational setup preferred.

**Proposed Flow:**
```
User: "I want to update HubSpot after meetings"
AI: "That's a little vague. Tell me more."
User: "After each meeting, summarize key points and update the CRM deal"
AI: [Shows 3 artifact examples]
    "Which format do you prefer?"
User: [Selects Option 2]
AI: "Is there anything missing? Any edge cases?"
User: "Looks good"
AI: "Would you like me to test it?"
AI: [Shows hypothetical test output]
    "Does everything look good?"
User: "Love it"
AI: "Great! Next step is to activate..."
```

**Design Implications:**
- Add "Option D: Conversational Setup" to prototype
- Include test-before-activate flow in all options
- Smart suggestions based on user's call history

---

### Activity Log Design (v2 Iteration - Jury Top Concern)

**Signal:** Jury evaluation top concern (26 mentions)

**Required Components:**
| Component | Purpose | Key Elements |
|-----------|---------|--------------|
| `ActivityLog` | Show what agent did | Timeline, per-action breakdown |
| `ActivityEntry` | Single action row | Timestamp, action, status, evidence |
| `ActivityDetail` | Expanded view | Full reasoning, confidence, retry button |

**Activity Entry States:**
- ✅ Success — Green check, "Completed" badge
- ⏳ Pending — Spinner, "Running..." badge
- ❌ Error — Red X, error message, "Retry" button
- ⚠️ Low Confidence — Amber warning, "Review" prompt

**Information Architecture:**
```
Activity Log
├── Today
│   ├── 10:30 AM — Created email draft for Acme Corp ✅
│   │   └── [Expand] Evidence: "Meeting discussed Q1 roadmap"
│   └── 9:15 AM — Updated HubSpot deal ✅
├── Yesterday
│   └── 4:45 PM — Failed to create draft ❌
│       └── [Expand] Error: Gmail not connected. [Retry]
```

---

### Test Before Activate (Dry Run)

**Signal:** Jury suggestion (18 mentions)

**Flow:**
1. User finishes configuring agent
2. "Would you like to test it first?" prompt
3. Select a real past meeting
4. Show "Here's what the agent would have done"
5. Display hypothetical output artifact
6. User approves → "Enable Agent" becomes available

**UI Pattern:**
- Modal or slide-out panel
- Meeting selector (dropdown of recent meetings)
- Preview card showing hypothetical output
- "Looks good" / "Edit instructions" actions

---

## Phase 3: Skills Layer UX (2026-01-22)

**Signal:** `sig-2026-01-22-composio-agent-architecture-deep-dive`

### What Are Skills?

> "Skills are literally just a massive prompt that teaches [the agent] how to be an expert in a specific topic."

Skills are NOT agents. They're reusable expertise that agents can draw upon.

### UX Mental Model

**For Admins (Creating/Managing Skills):**
```
/settings/skills
├── Built-in Skills (read-only)
│   ├── RevOps Expert ✓ Enabled
│   ├── Follow-up Best Practices ✓ Enabled
│   └── Meeting Summary Templates ○ Disabled
├── Workspace Skills (admin-created)
│   ├── [+ Create Skill]
│   └── "Our Sales Playbook" ✓ Enabled
└── [Learn about Skills →]
```

**For Users (Seeing Skills in Agent Config):**
```
Agent Builder > Step 4: Skills
"Which expertise should this agent use?"

[✓] RevOps Expert
    "CRM best practices for HubSpot/Salesforce"
    
[✓] Follow-up Best Practices
    "How to write effective follow-up emails"
    
[ ] Our Sales Playbook (Workspace)
    "Company-specific sales methodology"
```

### Skill Builder Flow

```
Create New Skill
├── 1. Basic Info
│   ├── Name: "RevOps Expert"
│   ├── Description: "CRM best practices for..."
│   └── Category: [RevOps ▼]
├── 2. When to Use
│   ├── "This skill is relevant when..."
│   └── Keywords: "CRM, HubSpot, deal, contact, property"
├── 3. Instructions
│   └── [Large textarea - Markdown supported]
│       "When updating CRM records, always..."
└── 4. Publish
    ├── ○ Draft (only you)
    ├── ● Enabled for workspace
    └── [Save Skill]
```

### Key Design Principles

1. **Skills are invisible until needed**
   - Users don't configure skills per-agent (mostly)
   - Agent auto-discovers relevant skills based on task
   - Advanced: Override auto-selection if needed

2. **Progressive disclosure applies to users too**
   - Show skill name + description by default
   - "View full instructions" expands for power users
   - Don't overwhelm with complexity

3. **Clear distinction from Agents**
   - Agents = things that DO stuff (active)
   - Skills = things agents KNOW (passive)
   - Visual/naming must reinforce this

### Design Questions

1. **Should skills be visible in agent output?**
   - "This response used: RevOps Expert skill"
   - Builds trust but adds noise?

2. **Skill conflicts?**
   - What if two skills give contradictory advice?
   - Priority system? Or AI resolves?

3. **Skill versioning?**
   - If admin updates a skill, do agents use new version immediately?
   - Notification to users? Change log?

---

## Design Review Status (2026-02-09)

### Completed
1. ~~**Woody to explore Phase 2 UX**~~ — Pending Woody review
2. ~~**Design Phase 1 node UX**~~ ✅ Complete (v1 prototype)
3. ~~**Prototype key flows**~~ ✅ Complete (v1 with jury validation)
4. ~~**Build Activity Log component**~~ ✅ Complete (v2 iteration)
5. ~~**Build Test Before Activate flow**~~ ✅ Complete (v2 iteration)
6. ~~**Design auth scope UX**~~ ✅ Complete (v3 AuthScopeSelector)
7. ~~**Explore Option D (Conversational Setup)**~~ ✅ Complete (v3 ConversationalSetup)
8. ~~**Agent conflict resolution**~~ ✅ Complete (v4 ConflictDetector)
9. ~~**Skills Layer**~~ ✅ Complete (v5 SkillsSelector)
10. ~~**Unified Framework**~~ ✅ Complete (v6 AgentSkillsFramework)

### Pending (Next Steps)
1. **Schedule Woody design review** — v6 unified framework needs visual polish sign-off
2. **Show to Caden** — Engineering feasibility for conflict detection + skills APIs
3. **Pipedream migration UX** — Ivan's migration work (ASK-4996, 4997, 4998) may need UX for transition states
4. **Feature flag rollout plan** — PostHog flags needed for phased launch (ASK-4998)
5. **RevOps persona validation** — Is wizard too slow for operations users?

### Engineering Context for Design
- Ivan is actively migrating chat and workflow paths from Pipedream to Composio
- PostHog feature flags will control rollout (ASK-4998, pending)
- `@elephant-ai/workflows` shared package migration underway (ASK-5020)
- Global chat integration with Composio deferred (ASK-4903, backlog)
