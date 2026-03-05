# Research: Composio Agent Framework

**Date:** 2026-01-22  
**Participants:** Tyler, Woody (likely)  
**Type:** Internal Strategy Discussion

---

## TL;DR

This conversation outlines the evolution of AskElephant's integration strategy from chat-based user-level connections to workflow automation and ultimately to a new **agent configurator** paradigm. The short-term focus is enabling Composio integrations in workflows with service account recommendations for transparency. The long-term vision is replacing complex workflow building with simple agent templates that users opt into with personal authentication—dramatically simplifying automation UX.

---

## Strategic Alignment

**Score:** Strong ✅

**Aligned:**
- ✅ **AI-First UX**: "Your settings are not toggles anymore...It's a chat...AI first" — This directly replaces complex workflow node chains with simple agent configuration
- ✅ **Human Empowerment**: Users opt-in, control their own authentication, can fork templates
- ✅ **Trust Foundation**: Service account recommendations, transparency about "who did this"
- ✅ **Outcome Chain**: Simpler automation → More adoption → More value from integrations → Expansion revenue
- ✅ **2026 Priority**: Directly aligns with "Workflow Builder / AI Assistant Tool" strategic initiative

**Concerns:**
- ⚠️ **Error handling unclear**: What happens when agents fail? How do we recover trust?
- ⚠️ **Scope ambiguity**: Short-term vs long-term timeline not explicit
- ⚠️ **Per-user learning**: Is Composio's reinforcement learning at user/workspace/global level? Privacy implications

---

## Key Decisions

1. **Short-term: Universal Agent Node in Workflows**
   - Enables Composio integrations in existing workflow system
   - Admin connects workspace-level integrations
   - Recommend service accounts for transparency
   - Education-based rollout

2. **Long-term: Agent Configurator (Outside Workflows)**
   - Standalone agent template builder
   - Admin creates templates → Users opt-in with personal auth
   - Replaces need for complex node-based workflow building
   - Could replace most current workflow use cases

3. **Transparency principle adopted**
   - Aligned with Linear's agent guidelines
   - Actions should be attributable to "AskElephant" (service account) not a person
   - When agents act, it should be clear who/what is acting

---

## Action Items

- [ ] **Tyler**: Push working prototype (currently local) for team review
- [ ] **Woody**: Explore UX designs for agent configurator before Tyler finishes short-term work
- [ ] **Tyler**: Clarify with Composio what level reinforcement learning operates (user/workspace/global)
- [ ] **Tyler**: Document service account recommendation guidelines for GTM

---

## User Problems Identified

### Problem 1: Workspace vs User Authentication Mismatch
> "So, like, in the case of Composio where they have, like, Slack, they have Gmail, if me as an admin goes and connects Gmail for workflows to utilize, it's now operating in Gmail as my user on workflows that might be running for other people."

- **Severity:** High
- **Frequency:** Common (affects all workspace-level workflow integrations)
- **Persona:** RevOps, Admins
- **Current workaround:** None—creates confusing attribution in target systems

### Problem 2: Tool Overload
> "With them having 877 integrations that have some of those single integrations have hundreds of tools on a single integration, you can't give all those tools to an agent all at once."

- **Severity:** High
- **Frequency:** Common
- **Persona:** All users configuring integrations
- **Composio solution:** Tool Router pattern—exposes meta-tools for discovery

### Problem 3: Attribution Confusion
> "If I go into ClickUp and I see, oh, this task was created by, like, my admin. And I'm like, okay. This is weird... And the admin's like, I don't know what the heck you're talking about."

- **Severity:** Medium
- **Frequency:** Occasional
- **Persona:** All workspace users
- **Solution:** Service accounts with clear naming (e.g., "AskElephant Bot")

### Problem 4: Personal Integration Limitations
> "If I wanna create an email draft agent, I can't create a service account that drafts my emails. Like, I have to connect it at a personal level for it to draft emails for me as me."

- **Severity:** High
- **Frequency:** Common (email, personal calendar, etc.)
- **Persona:** Sales Reps, CSMs
- **Solution:** Agent Configurator with personal opt-in authentication

### Problem 5: Workflow Complexity
> "Workflow building is so complex... Just like the trigger, give it permissions, and then tell it what you wanna do."

- **Severity:** Medium
- **Frequency:** Common
- **Persona:** RevOps, Admins building workflows
- **Solution:** Agent Configurator simplifies to: triggers + integrations + prompt

---

## Feature Ideas

### Short-term: Universal Agent Node

- **Description:** New workflow node that exposes Composio integrations with tool enable/disable controls
- **Outcome chain:** Enable integrations in workflows → Test automation patterns → Validate demand → Build long-term solution
- **Persona:** RevOps building workflows

### Long-term: Agent Configurator

- **Description:** Standalone page for creating agent templates outside workflows
- **Components:**
  - Agent name, description, instructions (prompt)
  - Integration selection with tool scoping
  - Trigger configuration (from Composio's trigger library)
  - Share/publish at workspace level
  - User opt-in with personal authentication
  - Template forking for customization
- **Outcome chain:** ✅ Clear: Simpler automation UX → Higher adoption → More automations running → More value delivered → Expansion
- **Persona:** RevOps (creating templates), All users (opting in)

### Future: Team-level Agent Requirements
> "Required ones for teams where it's like, if you're a member of this team, you need to go turn these agents on"

- **Description:** Mark certain agents as required/recommended per team
- **Outcome chain:** ⚠️ Needs validation—could feel coercive
- **Persona:** Admins, team leads

---

## Composio Capabilities (Reference)

| Capability | Description | Relevance |
|------------|-------------|-----------|
| **Tool Router** | 4-5 meta-tools that search/surface relevant integrations | Solves tool overload |
| **Triggers** | Per-integration event triggers | Powers agent configurator |
| **Workbench** | Sandbox for testing agent actions | Development/debugging |
| **Reinforcement Learning** | Agent learns from failures, improves over time | Quality improvement (privacy TBD) |
| **Slack vs Slackbot** | Two integrations—personal level vs bot level | Solves attribution for Slack specifically |
| **877 Integrations** | Massive integration library | Competitive advantage |

---

## Competitive Context

- **Linear's Agent Guidelines:** Explicitly recommend transparency when agents act on behalf of users. AskElephant is adopting this principle.
- **Pipedream:** Raw integration tooling, requires manual configuration. No agent layer.
- **Composio:** Provides the integration/agent infrastructure we're building on top of.

---

## Insights

1. **Agent Configurator could replace most workflows** — The conversation reveals that complex node-based workflow building exists primarily because integrations require chaining. Agents with tool access collapse this complexity.

2. **Two authentication patterns are fundamentally different:**
   - Workspace-level: Service accounts, bot attribution, shared workflows
   - User-level: Personal opt-in, acts as the user, requires individual setup

3. **UX simplification is massive:**
   > "Just like the trigger, give it permissions, and then tell it what you wanna do."
   
   This is orders of magnitude simpler than current workflow builder.

4. **Template marketplace potential** — Admin-created, Solutions-created, or AskElephant-preconfigured agents that users can adopt. Creates network effects and reduces time-to-value.

5. **Forking enables power users** — Users who've used a template can customize it, preserving simplicity for beginners while enabling sophistication.

---

## Questions to Answer Before PRD

1. **What's the explicit short-term vs long-term timeline?** When do we expect each phase to ship?

2. **What's the error handling strategy?** When agents fail mid-action, how do we:
   - Notify the user?
   - Roll back partial actions?
   - Preserve trust?

3. **What integrations are must-haves for launch?** Presumably Slack, HubSpot, Salesforce, Gmail—but should validate.

4. **How do we handle integration scoping UI?** With 877 integrations and hundreds of tools per integration, what's the UX for selecting/filtering?

5. **At what level does Composio's reinforcement learning operate?** Per-user? Per-workspace? Global? Privacy implications need clarity.

6. **What's the competitive moat?** If we're building on Composio, what prevents competitors from doing the same? (Answer likely: UX + pre-configured templates + AskElephant-specific context like meeting data)

7. **How does this interact with Privacy Determination Agent?** If agents trigger on meetings, do they respect privacy classification?

---

## Open Questions

1. What triggers should be prioritized beyond Composio's native triggers? (e.g., "after every meeting", "when deal stage changes")

2. Should templates be version-controlled? If admin updates a template, what happens to users who've opted in?

3. How do we handle integrations that require both workspace AND user auth simultaneously?

4. What's the billing model? Per-agent-run? Per-integration? Unlimited?

5. What guardrails prevent runaway agents? Rate limits? Approval gates for destructive actions?

---

## Design Feedback Sessions

### Adam: Design Walkthrough (2026-01-22)

**Signal:** `sig-2026-01-22-adam-composio-agent-feedback`  
**Full transcript:** `signals/transcripts/2026-01-22-adam-composio-agent-feedback.md`

**Key Findings:**

1. **Option B > Option A** — Cleaner layout preferred
2. **Conversational setup strongly preferred** — Users shouldn't face blank prompt fields
3. **Workspace vs User auth is critical problem** — Needs per-integration auth scope controls
4. **Test before activate** — Show hypothetical output before enabling agent

**New Problems Identified:**
- Non-deterministic output: Customers want consistent formatting (temperature issue)
- Option C missing visibility settings (draft/shared/recommended)

**Feature Ideas from Session:**
- Conversational agent setup (chat-based configuration)
- Smart suggestions based on user context/call history  
- Automatic agent detection in chat (no @-mention needed)

**Action Items:**
- [ ] Adam to send conversational agent prototype to Tyler
- [ ] Tyler to show prototypes to Caden
- [ ] Create v2 of Figma Make prototype incorporating feedback

### Figma Make Prototype Spec (2026-01-22)

**Signal:** `sig-2026-01-22-composio-figma-make-chat-interface`  
**Full spec:** `signals/documents/2026-01-22-composio-figma-make-chat-interface-spec.md`

Design patterns from Adam's Figma Make exploration (Options A, B, C):
- Sequential message reveal with typewriter effect
- Artifact chains that fade in after text completes
- Sticky footer input with auto-expanding textarea
- `onAnimationEnd` callbacks for reliable timing

---

## Related Research

- HubSpot Agent Config UI — Similar integration configuration UX patterns
- Workflow Builder documentation — Understanding current state complexity
- Linear Agent Guidelines — Industry best practice reference
- Composio documentation — Technical capabilities

---

## Verbatim Quotes (Key)

### On the Vision
> "This could replace workflows. A lot of them, I think."

### On UX Improvement
> "Workflow building is so complex... Just like the trigger, give it permissions, and then tell it what you wanna do."

### On Transparency
> "Linear's guidelines... They believe in making it very transparent and clear when an agent is doing things on the behalf of a person and not just, like, having a person do it."

### On Short-term Strategy
> "My short term solution to, like, go to market with this quickly is just more of an education piece... we create this new universal agent node in Workflows..."

### On the Template Model
> "Everybody in the company can discover these shared agents that have been defined and prebuilt for them, and they can opt into them... I wanna use this agent template. I'm opting in to turn it on. Oh, now I need to go connect my integrations."

---

## Next Steps

1. **Run `/PM composio-agent-framework`** to create full project documentation with:
   - Short-term scope (Universal Agent Node)
   - Long-term vision (Agent Configurator)
   - Engineering spec for both phases

2. **Prototype the Agent Configurator UX** — Woody expressed interest in exploring this ahead of Tyler's short-term work

3. **Validate with RevOps persona** — This is primarily an admin/RevOps tool; need to ensure the UX works for them
