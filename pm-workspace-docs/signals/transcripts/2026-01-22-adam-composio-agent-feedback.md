# Adam: Composio Agent Framework Feedback Session

**Signal Type:** Internal Design Review  
**Source:** Tyler + Adam design walkthrough  
**Captured:** 2026-01-22  
**Initiative:** composio-agent-framework  
**Participants:** Adam, Tyler  

---

## TL;DR

Adam walked through the Figma Make prototype (Options A, B, C) for agent configuration. Key finding: **Option C with conversational setup** is preferred over blank prompt fields. Major concern identified around **workspace vs. user-level authentication** for integrations. Adam shared an existing prototype showing chat-based agent creation flow.

---

## Key Decisions Made

1. **Option B > Option A** — Cleaner layout with name/description/trigger/instructions/visibility
2. **Option C needs visibility settings** — Currently missing draft/shared/recommended controls
3. **Conversation-driven setup preferred** — Users shouldn't face blank prompt fields
4. **Need to show Adam's existing prototype to Caden** — Has chat-based agent creation flow

---

## Action Items

| Who | What | Status |
|-----|------|--------|
| Adam | Send Tyler the conversational agent setup prototype | Mentioned |
| Tyler | Show prototype to Caden (working on this feature) | Pending |
| Tyler | Create v2 of Figma Make prototype with feedback | Pending |

---

## Problems Identified

### 1. Workspace vs. User Authentication Problem (Critical)

> "If we're combining the integration experience with the workflow experience into one experience, then we're presented with this really big problem, which is how do we manage workspace level authentication versus user level authentication."

**The problem:**
- Workflows run at **workspace level**
- Integrations in chat run at **personal level**
- If agents combine both, who owns the authentication?

**Example scenario:**
- User creates HubSpot agent with their personal auth
- Sets visibility to "workspace" (available to 20 people)
- Now 20 people are using one person's HubSpot credentials

**Some integrations are easier:**
- Email: Use generic workspace email (AskElephant bot)
- Slack: Use Slack bot account
- HubSpot: **Hard** — needs granular per-integration visibility controls

### 2. Blank Prompt Fields Are Intimidating

> "People see this blank text field, and they have no clue what to do."

**Current state:** User faces empty instructions textarea with no guidance.

**Desired state:** Conversational setup that asks clarifying questions:
- "What are you trying to do?"
- "What CRM fields should it update?"
- "What structure do you want the output in?"
- Shows 3 example outputs, user picks one

### 3. Non-Deterministic Output Problem

> "Our workflows aren't actually deterministic. Given different calls, our Slack output could be three different looks and structures. We really just want one specific format."

**Customer pain:** Temperature 0.7 creates inconsistent outputs.

**Desired solution:**
- Ability to configure strictness
- Select a real call, see 10 different output versions
- System iterates on prompt to improve consistency
- "Which of these do you like most?"

---

## Feature Requests / Ideas

### Conversational Agent Setup (Strong preference)

Instead of form fields → chat-based configuration:

```
User: "I want to update HubSpot after meetings"
AI: "That's a little vague. Tell me more."
User: "After each meeting, summarize key points and update the CRM deal with next steps"
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

### Smart Suggestions Based on User Context

> "Based on the calls that you've had, based on what your role is, here's some things that might be valuable to you."

- Personalized agent recommendations
- "It looks like you're on a lot of sales calls. Did you update HubSpot?"
- Proactive suggestions, not blank slate

### Test Before Activate

> "Would you like me to test it? And then it tests it for you in chat."

- Show hypothetical output before enabling
- "Here's what I would have done on your last call"
- Builds trust before automation goes live

### Agents as Chat Integrations

> "Unlike Pipedream where you have to go in and toggle on your agents, you can actually just say [in chat]... and it should be able to look through all your agents and know which ones to use."

- No explicit agent invocation needed
- System automatically detects relevant agents
- Similar to Cursor's context awareness

---

## Design Feedback on Options A/B/C

### Option A
- More cluttered
- Less preferred

### Option B (Preferred layout)
- Name, description, trigger at top
- Clean instructions section
- **Has visibility settings** (draft/shared/recommended)
- "This is nice"

### Option C
- Generated agent from natural language
- Automatically suggests trigger + integrations
- **Missing visibility settings** ← Bug to fix
- Needs edit capability after generation
- "This is crazy" (positive)

### Visual Design Notes
- Components look like AskElephant / shadcn ✅
- Agent emoji looks "awful" — needs replacement
- Upload window styling looks off
- Top-level navigation pattern is new but liked

---

## Related Context

### Adam's Existing Prototype

Adam mentioned having a prototype for the conversational agent setup flow:
- Shows chat-based configuration
- Gives suggestions based on user context
- Shows hypothetical test before activation
- **Action:** Adam to send to Tyler

### Caden Context

- Caden is actively working on this feature
- Tyler needs to show prototype to Caden
- Adam wants to understand what's feasible from Caden's perspective

### Sam's Customer Feedback

Referenced customer conversation about non-deterministic outputs:
- Temperature settings causing inconsistent Slack messages
- Customer wants strict, predictable formatting

---

## Key Quotes

> "The agent is supposed to replace workflows... it's not just like it does manual tasks for you, but it's actually supposed to automate things in the background."

> "You set up your agent in chat. It's like a conversation."

> "People see this blank text field and they have no clue what to do."

> "If we're combining the integration experience with the workflow experience into one experience, then we're presented with this really big problem."

> "Unlike Pipedream where you have to toggle on your agents, you can actually just say [in chat]... and it should know which ones to use."

---

## Implications for Design Brief

| Design Brief Section | Update Needed |
|----------------------|---------------|
| Phase 2: Agent Configurator | Add conversational setup flow option |
| Connection Flow | Add workspace vs. user auth decision tree |
| Design Questions | Add: "Form-based vs. chat-based configuration?" |
| Interaction Patterns | Add: Test before activate flow |
| Edge Cases | Add: Integration auth scope conflicts |

---

## Next Steps

1. **Get Adam's prototype** — Conversational setup reference
2. **Show to Caden** — Validate feasibility 
3. **Update Option C** — Add visibility settings
4. **Design auth scope UX** — Per-integration workspace/user controls
5. **Prototype test-before-activate** — Show hypothetical output flow
