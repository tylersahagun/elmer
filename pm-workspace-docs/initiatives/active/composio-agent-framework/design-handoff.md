# Design Handoff: Composio Agent Framework

**Initiative:** composio-agent-framework  
**Handoff Date:** 2026-01-22  
**Designer:** Woody (pending assignment)  
**PM:** Tyler  
**Version:** v6 (Unified Framework)  
**Status:** Ready for Design Review

---

## 🎯 The Why (Start Here)

### Problem We're Solving

AskElephant users want to automate actions across their tools (CRM, Slack, email, task management) based on meeting insights. Today, this requires complex workflow building, confusing authentication patterns, and offers no way to automate personal tools like email drafts.

> "Workflow building is so complex... Just like the trigger, give it permissions, and then tell it what you wanna do."

The current workflow builder requires:
1. **Connecting multiple nodes** — Each integration needs manual configuration
2. **Understanding authentication** — Workspace-level connections make actions appear as the admin
3. **Technical expertise** — Natural language isn't possible; users must learn the node system

### Business Impact

- **Revenue connection**: Higher automation adoption → more value delivered → expansion revenue
- **Competitive positioning**: Composio gives us 877 integrations; UX is our moat
- **Efficiency gain**: Minutes to first automation vs. days

### Why Now?

1. **Composio integration ready** — We have API access to 877 integrations
2. **Workflow builder exists** — Phase 1 builds on existing infrastructure
3. **2026 Strategic Initiative** — "Workflow Builder / AI Assistant Tool" is a leadership priority
4. **Trust foundation in place** — Privacy Determination Agent enables safe automation

---

## 👤 Who This Is For

### Primary Persona: RevOps

**Their goal**: Create and manage automation templates for the sales org

**Their fear**: Complex tools that require constant maintenance; automation that breaks silently

**Success looks like**: Non-technical teammates successfully using agents they created

> "I need to set this up once and have it work reliably for 20 reps."

### Secondary Personas

| Persona | Role | What They Need |
|---------|------|----------------|
| **Sales Leader** | Adopts team agents, monitors usage | Simple opt-in, clear reporting |
| **Sales Rep** | Opts into personal agents | One-click enable, works in background |
| **CSM** | Adopts customer health agents | Automated escalations, less manual tracking |

---

## 🗺️ Customer Journey

### Current State (Pain)

```
Admin wants to automate CRM updates after meetings
  → Opens workflow builder
    → Adds trigger node
      → Adds integration node (HubSpot)
        → Configures each field manually
          → Connects personal account (appears as them)
            → Teammates confused: "Why did YOU update my deal?"
```

**Emotion**: Frustrated, confused, worried about mistakes

### Desired State (After This Feature)

```
Admin wants to automate CRM updates after meetings
  → Opens Agent Configurator
    → Describes what they want in natural language
      → AI suggests configuration, user reviews
        → Connects service account (recommended)
          → Publishes to workspace as "Recommended"
            → Reps opt-in, agent works transparently
```

**Emotion**: Confident, efficient, in control

### Journey Map

| Stage | User Action | User Feeling | Feature Role |
|-------|-------------|--------------|--------------|
| **Discovery** | Learns about agents | Curious but skeptical | Dashboard shows quick wins |
| **Setup** | Creates first agent | Nervous about complexity | Conversational setup guides |
| **Test** | Previews what agent would do | Cautiously optimistic | Dry run builds trust |
| **Activate** | Enables agent | Excited but watchful | Activity log shows transparency |
| **Ongoing** | Monitors agent actions | Confident delegation | Rollback if needed |

---

## 🧠 Key Design Decisions (And Why)

### Decision 1: Conversational Setup (Option D) as Primary Flow

**What**: Chat-based agent configuration instead of traditional forms

**Why**: Adam's design feedback + user testing showed blank prompt fields intimidate users

**Evidence**: 
> "People see a blank text field and they have no clue what to do." — Adam, Design Review

**Pattern**:
```
User: "I want to update HubSpot after meetings"
AI: "That's a little vague. Tell me more about what you want updated."
User: "Summarize meeting and add next steps to the deal"
AI: [Shows 3 format options] "Which style do you prefer?"
```

### Decision 2: Service Accounts as Default Recommendation

**What**: Recommend service accounts for workspace integrations

**Why**: Transparency about "who did this" — aligned with Linear's agent guidelines

**Evidence**: Attribution confusion was a top research problem:
> "If I go into ClickUp and I see, oh, this task was created by my admin. And I'm like, okay. This is weird..."

### Decision 3: Skills Layer for Reduced Friction

**What**: Reusable domain expertise prompts that attach to agents

**Why**: Expert-authored skills make agent setup dramatically simpler

**Evidence**: 
> "The more complex and better the skills get, the less instructions I need to give to the agent because it will then be able to fill in the gaps."

**Built-in skills**: RevOps Expert, Follow-up Best Practices, Deal Intelligence

### Decision 4: Activity Log with Full Audit Trail

**What**: Complete visibility into what agents did and why

**Why**: Top jury concern — users need transparency to trust automation

**Evidence**: 26 mentions in jury evaluation:
> "Need to see audit trail of what agent did"

### Decision 5: Test Before Activate (Dry Run)

**What**: Preview what agent would do on a real past meeting before enabling

**Why**: Second-highest jury suggestion (18 mentions) — builds trust

**Pattern**:
1. User finishes configuring agent
2. "Would you like to test it first?" prompt
3. Select a real past meeting
4. Show "Here's what the agent would have done"
5. User approves → Enable becomes available

---

## 🎨 Prototype Overview

### Links

| Resource | Link |
|----------|------|
| **Chromatic Preview** | See story URLs below |
| **PRD** | `pm-workspace-docs/initiatives/composio-agent-framework/prd.md` |
| **Research** | `pm-workspace-docs/initiatives/composio-agent-framework/research.md` |
| **Design Brief** | `pm-workspace-docs/initiatives/composio-agent-framework/design-brief.md` |
| **Engineering Spec** | `pm-workspace-docs/initiatives/composio-agent-framework/engineering-spec.md` |
| **Prototype Location** | `elephant-ai/web/src/components/prototypes/ComposioAgentFramework/` |

### Version: v6 (Unified Framework)

This is the **production-ready unified experience** bringing together ALL features from v1-v5.

### States Covered

- [x] Dashboard (default view with metrics)
- [x] Loading (skeleton states)
- [x] Success (agent enabled confirmation)
- [x] Error (with recovery actions)
- [x] Empty state (no agents, onboarding flow)
- [x] Mobile responsive
- [x] Tablet responsive

### Interactive User Journeys (Click Through!)

> 💡 **Start here!** These stories show the complete experience, not just isolated states.

| Journey | What It Shows | Story URL |
|---------|---------------|-----------|
| **Dashboard** | Metrics, quick actions, recent agents | `v6-SkillsIntegration--Dashboard` |
| **Create Agent Flow** | Full wizard with conversational setup | `v6-SkillsIntegration--CreateAgentFlow` |
| **Option D: Conversational** | Chat-based setup (primary) | `v6-SkillsIntegration--OptionD_Conversational` |
| **Skills Library** | Browse and toggle skills | `v6-SkillsIntegration--SkillsLibrary` |
| **Activity Log** | Audit trail with retry capability | `v6-SkillsIntegration--ActivityView` |

**How to use flow stories:**
1. Open in Storybook via Chromatic
2. Click through interactive elements
3. See how states transition (not just what they look like)
4. Understand the complete user experience

### Components Built

| Component | Purpose | Location |
|-----------|---------|----------|
| `AgentSkillsFramework` | Unified full-page dashboard | `v6/AgentSkillsFramework.tsx` |
| `ConversationalSetup` | Chat-based agent creation | `v3/components/ConversationalSetup.tsx` |
| `SkillsSelector` | Domain expertise selection | `v5/components/SkillsSelector.tsx` |
| `AuthScopeSelector` | Workspace vs. personal auth | `v3/components/AuthScopeSelector.tsx` |
| `ActivityLog` | Audit trail timeline | `v2/components/ActivityLog.tsx` |
| `TestPreview` | Dry run preview | `v2/components/TestPreview.tsx` |
| `RollbackPanel` | Undo agent actions | `v3/components/RollbackPanel.tsx` |
| `ConflictDetector` | Field conflict resolution | `v4/components/ConflictDetector.tsx` |

---

## 📋 Story URLs for Storybook Connect

Copy these into the Storybook Connect plugin in Figma.

> **Note**: Replace `[CHROMATIC_URL]` with your actual Chromatic project URL.
> Project ID: `13737860` | Token: `chpt_b6891b00696fe57`

### v6 Unified Framework (Primary)

| Component | Story URL |
|-----------|-----------|
| Dashboard | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--dashboard` |
| Agents List | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--agents-list` |
| Skills Library | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--skills-library` |
| Activity View | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--activity-view` |
| Create Agent Flow | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--create-agent-flow` |
| Option D: Conversational | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--option-d-conversational` |
| Empty State | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--empty-state` |
| Mobile View | `[CHROMATIC_URL]/iframe.html?id=prototypes-composioagentframework-v6-skillsintegration--mobile-view` |

### Creative Options Comparison

| Option | Philosophy | Story URL |
|--------|------------|-----------|
| **A: Maximum Control** | Step-by-step wizard | `v6-skillsintegration--option-a-maximum-control` |
| **B: Balanced** | AI suggests, user confirms | `v6-skillsintegration--option-b-balanced` |
| **C: Maximum Efficiency** | AI handles most decisions | `v6-skillsintegration--option-c-maximum-efficiency` |
| **D: Conversational** ⭐ | Chat-based progressive | `v6-skillsintegration--option-d-conversational` |

### Component-Level Stories (v2-v4)

| Component | Story URL |
|-----------|-----------|
| Activity Log | `prototypes-composioagentframework-v2-iteration--activity-log` |
| Test Preview | `prototypes-composioagentframework-v2-iteration--test-preview` |
| Conversational Setup | `prototypes-composioagentframework-v3iteration--conversational-setup` |
| Auth Scope Selector | `prototypes-composioagentframework-v3iteration--auth-scope-selector` |
| Rollback Panel | `prototypes-composioagentframework-v3iteration--rollback-panel` |
| Conflict Detection | `prototypes-composioagentframework-v4iteration--conflict-detection` |

---

## ✨ What Needs Designer Polish

### Visual Refinement

- [ ] **Spacing refinement** — Currently using 4px grid, may need tightening
- [ ] **Icon selection** — Some placeholders used (Bot, Settings, Activity icons)
- [ ] **Color/contrast verification** — Ensure accessibility compliance
- [ ] **Typography hierarchy** — Dashboard metrics, card headers, body text
- [ ] **Visual weight balance** — Dashboard sidebar vs. main content

### Content & Copy

- [ ] **Micro-copy review** — Button labels, tooltips, helper text
- [ ] **Empty state messaging** — "No agents yet" copy and illustration
- [ ] **Error message tone** — Friendly but actionable
- [ ] **Success confirmation copy** — "Agent created!" celebration moment
- [ ] **Skill descriptions** — Clear, non-technical explanations

### Motion & Delight

- [ ] **Animation timing** — Typewriter effect speed in conversational setup
- [ ] **Transition easing** — View changes, modal opens
- [ ] **Loading state animation** — Skeleton pulse timing
- [ ] **Success micro-interactions** — Confetti? Checkmark animation?
- [ ] **Chat message reveal** — Artifact chains after text completes

### Edge Cases

- [ ] **Empty state illustration** — No agents, no activity
- [ ] **Error state visuals** — Connection failed, action failed
- [ ] **Low confidence styling** — Warning state in activity log
- [ ] **Conflict resolution UI** — Visual hierarchy for conflict cards

---

## 🚫 Constraints & Guardrails

### Must Preserve

| Element | Why |
|---------|-----|
| **Conversational setup flow** | Tested well with users; Adam's preferred direction |
| **Activity log timeline** | Top jury concern; transparency builds trust |
| **Test before activate** | Second-highest jury suggestion; reduces fear |
| **Service account recommendation** | Aligned with Linear agent guidelines |
| **Skill auto-discovery** | Reduces config friction significantly |

### Avoid

| Anti-pattern | Why |
|--------------|-----|
| **Dense forms upfront** | Users prefer progressive disclosure via chat |
| **Hiding audit trail** | Trust requires transparency about agent actions |
| **Auto-enable without preview** | Users want to test before committing |
| **Generic "AI doing things" vibes** | Must feel like a trusted assistant, not surveillance |
| **One-size-fits-all auth** | Some integrations need workspace, some need personal |

### Open Questions for Designer

1. **Dashboard layout**: Should activity feed be sidebar or bottom panel?
2. **Skills visualization**: How do we show "agent is using RevOps Expert skill" without noise?
3. **Conflict resolution**: Current cards feel heavy — can we make it lighter?
4. **Mobile navigation**: Bottom tabs or hamburger menu?
5. **Celebration moment**: What does "agent successfully created" feel like?

---

## 📊 Jury Validation Results

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Combined Pass Rate** | 92% | ≥80% | ✅ Exceeds |
| **Approval Rate** | 78% | ≥70% | ✅ Exceeds |
| **Conditional Rate** | 14% | — | — |
| **Rejection Rate** | 8% | <20% | ✅ Exceeds |

### By Persona

| Persona | Pass Rate | Approval Rate |
|---------|-----------|---------------|
| Operations (RevOps) | 94% | 82% |
| Sales Leader | 96% | 84% |
| Sales Rep | 90% | 74% |
| CSM | 89% | 72% |

### Top Concerns (All Addressed)

| Concern | Version Addressed | Component |
|---------|-------------------|-----------|
| Audit trail / visibility | v2 | `ActivityLog` |
| Error handling / recovery | v2 | `TestPreview` |
| Rollback / undo | v3 | `RollbackPanel` |
| Agent conflict resolution | v4 | `ConflictDetector` |

### Recommended Creative Option

**Option B (Balanced)** had highest approval at 78%, but **Option D (Conversational)** showed 31% preference in feedback and was Adam's strong recommendation. v6 implements **Option D as primary** with Option B patterns as fallback for power users.

---

## 🔄 Handoff Logistics

### Source of Truth Decision

**Recommendation**: **Workflow A (Figma Refinement)**

This initiative needs visual polish for:
- Dashboard layout and metrics
- Conversational chat interface aesthetics
- Skill cards and agent cards
- Motion/animation timing

Designer creates/refines Figma → becomes visual source of truth → Dev references both Figma (visuals) + Storybook (interaction/states).

### Timeline

| Milestone | Target | Owner |
|-----------|--------|-------|
| Designer review of prototype | +1 week | Woody |
| Figma refinement | +2 weeks | Woody |
| Stakeholder approval | +3 weeks | Tyler/Woody |
| Dev implementation | After approval | Engineering |

### When Figma is Ready

1. Share Figma URL with Tyler
2. Tyler runs `/figma-sync composio-agent-framework [url]` to pull specs
3. Engineering references both Figma (visuals) + Storybook (interaction)

---

## 🔗 External References

### Design System

- **Linear's Agent Guidelines** — Transparency principles we adopted
- **Zapier's Zap builder** — Integration picker UX reference
- **Slack's Workflow Builder** — Trigger selection patterns
- **Notion's connections** — OAuth and permission UX

### Internal References

- **HubSpot Agent Config UI** — Similar integration configuration patterns
- **Workflow Builder nodes** — Existing node styling and patterns
- **Settings pages** — Toggle and form patterns

---

## 📝 Next Steps

1. **Woody reviews this brief** — Understand the why, not just the what
2. **View prototype in Storybook** — Link via Storybook Connect in Figma
3. **Choose polish priorities** — What needs the most attention?
4. **Create/refine Figma** — Becomes visual source of truth
5. **Schedule review with Tyler** — Validate before stakeholder presentation

---

## Questions?

Check this brief first, then ping Tyler in Slack!

Let me know when Figma is ready for `/figma-sync`!
