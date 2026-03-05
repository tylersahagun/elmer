# Transcript: Tyler & Sam - Flagship Meeting Recap UX

**Date:** 2026-01-28
**Source:** Voice Memo (Internal Strategy Discussion)
**Participants:** Tyler Sahagun, Sam (Head of Product)

## TL;DR

Tyler and Sam discussed the need to build a "flagship experience" from the ground up, starting with meeting recaps. The core insight: users shouldn't need to navigate workflows to get a beautiful meeting summary—it should be a first-class, dedicated experience with chat-based configuration and in-place editing.

## Key Decisions

- **Start from zero**: Build the foundational experience before layering complexity
- **Meeting recap as flagship**: Make the meeting summary a world-class, dedicated artifact—not buried in workflow outputs
- **Chat-first configuration**: Users configure templates through conversation, not settings pages
- **Per-meeting-type templates**: Different recap formats for different call types (onboarding, QBRs, follow-ups)
- **In-place editing**: Edit the output directly from the meeting page without navigating to workflows

## Vision: The "Zero to One" Experience Ladder

| Level   | Experience                                  |
| ------- | ------------------------------------------- |
| **0**   | Note-taker (baseline capture)               |
| **0.5** | Automated meeting notes (structured output) |
| **1**   | Customized meeting templates per call type  |
| **1+**  | Coaching, prep, automated actions           |

## Problems Identified

### Problem 1: Workflow Navigation Friction

> "Right now, to generate a meeting recap, you have to go to workflows, and you have to create work with all these notes, and this config and go through a lot of different things."

- **Persona:** All users (Reps, CSMs, Leaders)
- **Severity:** High
- **Frequency:** Every time someone wants a meeting recap

### Problem 2: Testing Workflows Is Messy

> "If you want to test it, you have to actually use a call, and it's like messy to actually see it."

- **Persona:** Power users configuring workflows
- **Severity:** Medium
- **Frequency:** Common during setup

### Problem 3: Output Discovery Pain

> "If you see it and you don't like it, now you have to go find the workflow that's not generating that output, which isn't like pretty. It's in chat conversation. It is not its own dedicated thing."

- **Persona:** Users wanting to customize output
- **Severity:** High
- **Frequency:** Common

### Problem 4: Meeting Prep Is Hidden

> "It actually like requires a manual trigger to run where it should just happen before every single call and it shouldn't be hidden inside of like an artifact."

- **Persona:** Reps preparing for calls
- **Severity:** Medium
- **Frequency:** Every scheduled meeting

### Problem 5: Output Clutter

> "Part of the problem is that, like, you have so many outputs and it's just so muddied by the view."

- **Persona:** All users viewing meeting pages
- **Severity:** High
- **Frequency:** Every meeting page view

## Feature Requests

### 1. Chat-Based Template Configuration

**Request:** When configuring meeting summaries, use a chat interface that walks users through setup and shows a live preview.

> "I have a chat where it asks like, what are the most common types of calls that you have? And it walks me through."

**UX Pattern:**

- Left side: Chat configuration
- Right side: Live artifact preview
- Chat accepts natural language: "I don't like how wordy it is" or "I want more bullet points"

### 2. Per-Meeting-Type Templates (Tags → Templates)

**Request:** Map meeting tags (types) to specific recap templates.

> "For every meeting that's tagged, every meeting type, I will have a special meeting summary for that."

**Example Templates:**

- Onboarding calls → Structured headers, key milestones, next steps
- QBRs → Business outcomes, risks, renewals focus
- Customer follow-ups → Action items, status updates

### 3. Dedicated Recap Artifact (Not Workflow Output)

**Request:** Replace workflow output cards with a dedicated, tabbed artifact view.

> "Instead of having all of those workflow outputs on the left-hand side... maybe it's like a tab view. You click on it and it opens up, and there you have your beautifully crafted meeting recap."

**UX Pattern:**

- Tabs at top: Recap | Coaching | Prep | [Custom]
- Pinnable tabs
- Limited view options to reduce clutter

### 4. In-Place Editing via Global Chat

**Request:** PostHog-style feedback icon on artifacts that opens global chat for editing.

> "It's kind of like in PostHog where it has the icon in the top right corner with like a dotted line where it says like, don't like something, click here."

**Flow:**

1. View meeting recap
2. Don't like something → Click feedback icon
3. Opens global chat with context
4. Say "I want this formatted differently"
5. AI updates the template (affects future calls too)

### 5. Auto-Running Meeting Prep

**Request:** Meeting prep should run automatically before every call and appear as a dedicated view.

> "It should just happen before every single call and it shouldn't be hidden inside of like an artifact."

**UX Pattern:**

- Pre-meeting: Prep tab populates automatically
- No manual trigger needed
- Visible like a "file tab" at the top

### 6. Communication Channel Selection

**Request:** When creating meeting recap/notes/coaching, allow selecting the output channel.

> "The other piece I want to make sure of is that when creating the meeting recap/notes/coaching it allows you select the communication channel like Slack, HubSpot, Teams, email, etc."

**Channels:**

- Slack (DM or channel)
- HubSpot (activity log, deal notes)
- Microsoft Teams
- Email

## Strategic Alignment

### ✅ Strong Alignment

- **AI-First UX**: "Your settings are not toggles anymore... It's a chat... AI first." - This proposal embodies the AI-first configuration principle.
- **Outcomes > Outputs**: Moving from "here's your workflow output" to "here's your beautiful, dedicated meeting recap" focuses on the delivered experience.
- **Human-Centered AI**: Chat-based customization keeps humans in control while AI handles the complexity.

### ✅ Addresses Core Value Props

- **Never miss what matters**: Tags auto-applied, templates auto-run
- **Context at your fingertips**: Tabbed artifact view organizes outputs
- **Automatic follow-ups**: Channel selection enables push to CRM/Slack

## Design Principles Emerging

1. **Configuration through conversation, not settings**
2. **Preview while you configure**
3. **Edit where you see it, not where it's built**
4. **Auto-run by default, manual trigger as exception**
5. **Reduce visual clutter with selective, pinnable views**
6. **Beautiful dedicated artifacts, not inline markdown**

## Hypothesis Candidates

### H1: Chat-Based Configuration Reduces Setup Time

**We believe that** replacing workflow configuration with chat-based template setup **will result in** faster time-to-value for meeting recaps **because** users can describe what they want in natural language instead of navigating complex settings.

**Evidence:** Users currently abandon workflow setup or use defaults because configuration is too complex.

### H2: Dedicated Artifact Views Increase Recap Usage

**We believe that** moving meeting recaps from workflow outputs to dedicated tabbed artifacts **will result in** higher engagement with AI-generated content **because** beautiful, focused presentation builds trust and reduces cognitive load.

**Evidence:** Current meeting pages are cluttered; users may miss valuable insights.

### H3: In-Place Editing Improves Output Quality Over Time

**We believe that** allowing users to edit templates directly from the meeting page **will result in** better-customized outputs over time **because** the feedback loop is immediate (see problem → fix problem → see result).

**Evidence:** Current flow requires finding the workflow, finding the prompt, expanding it, editing it—high friction.

## Action Items

- [ ] Create initiative folder for "flagship-meeting-recap" - @Tyler
- [ ] Research competitive implementations (meeting recap UX patterns) - @Tyler
- [ ] Document current workflow → recap user journey for baseline - @Product
- [ ] Prototype chat-based configuration flow - @Design
- [ ] Evaluate tag-to-template mapping in current architecture - @Engineering

## Related Initiatives

- **Global Chat**: The in-place editing flow depends on global chat
- **Workflow Builder**: Current state to be replaced/simplified
- **Settings Redesign**: Moves configuration to conversation

## Quotes for PRD

> "All I want is a meeting output. Then I want that to be like a single meeting summary." — Tyler

> "You should never have to actually edit a workflow just to get a meeting recap or an automated email that you like correct—that should be able to be done in chat." — Tyler

> "The recap itself shouldn't actually be a conversation. It should be a dedicated page, um, in and of itself, where then you can use global chat, like on that right-hand side to actually work through it." — Tyler

> "We have to start from zero, from the base of what we do, and make sure that we're creating a flagship experience." — Sam (paraphrased)

---

## Next Steps

1. **Create Initiative**: `/new-initiative flagship-meeting-recap`
2. **Research Phase**: Competitive analysis, current UX audit
3. **PRD Draft**: Use this signal as input for `/pm flagship-meeting-recap`
4. **Prototype**: Chat config + artifact preview mockup
