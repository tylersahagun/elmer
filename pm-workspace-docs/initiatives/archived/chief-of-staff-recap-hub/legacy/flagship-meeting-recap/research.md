# Flagship Meeting Recap - Research Synthesis

**Last Updated:** 2026-01-28  
**Status:** Active Discovery → Define Transition

---

## Evidence Summary

| Source                   | Date       | Key Finding                                                                        |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| Tyler-Sam UX Vision      | 2026-01-28 | Detailed vision for chat-based template config, tabbed artifacts, in-place editing |
| Tyler-Sam Prioritization | 2026-01-27 | Agreement: "Prioritize a flagship meeting summary experience"                      |
| Council of Product       | 2026-01-26 | "47 workflow outputs you'll never look at", Matt building Portable Artifacts       |
| Council of Product       | 2026-01-24 | Global chat Feb 1, proactive home page idea, chief-of-staff bundle                 |
| Slack Synthesis (14d)    | 2026-01-26 | 42% churn from adoption failure, workflow versioning confusion                     |

---

## Problem Evidence

### Problem 1: Workflow Navigation Friction

**Signal Count:** 4+ sources

> "Right now, to generate a meeting recap, you have to go to workflows, and you have to create work with all these notes, and this config and go through a lot of different things."
> — Tyler (2026-01-28)

> "A workflow an average user doesn't wanna deal with... it's too complicated."
> — Sam (2026-01-27)

> "Here's 47 workflow outputs and chats that you will never look at."
> — Tyler (2026-01-26)

**Impact:** Users don't engage with AI-generated content because access requires navigating complex workflow system.

### Problem 2: Output Discovery & Editing Pain

**Signal Count:** 3+ sources

> "If you see it and you don't like it, now you have to go find the workflow that's not generating that output, which isn't pretty. It's in chat conversation. It is not its own dedicated thing."
> — Tyler (2026-01-28)

> "An onboarding gap I've been seeing more recently is a note about how workflows will not re-run when you make changes."
> — CSM Team (Slack, 2026-01-26)

**Impact:** High-friction editing loop prevents users from customizing outputs, leading to disengagement.

### Problem 3: Visual Clutter & Cognitive Overload

**Signal Count:** 3+ sources

> "Part of the problem is that, like, you have so many outputs and it's just so muddied by the view."
> — Tyler (2026-01-28)

> "Right now, we're just generating coaching calls for everything."
> — Sam (2026-01-27)

**Impact:** Information overload reduces trust in AI outputs; users can't find what they need.

### Problem 4: Meeting Prep Hidden & Manual

**Signal Count:** 2+ sources

> "It actually like requires a manual trigger to run where it should just happen before every single call and it shouldn't be hidden inside of like an artifact."
> — Tyler (2026-01-28)

> "The proactive nature of what AskElephant is meant to be... telling me what I need and what I need to do next."
> — Woody (Council of Product, 2026-01-26)

**Impact:** Valuable prep content not surfaced when users need it most.

### Problem 5: Adoption Failure Driving Churn

**Signal Count:** Quantified in Slack synthesis

> "42% of churn is adoption failure."
> — Slack Synthesis (2026-01-26)

> "Rivvet: Not 'using it'. Shawn wasn't interested in an optimization call."
> — Churn Signal

**Impact:** Simplified UX could directly reduce churn by improving initial value delivery.

---

## Feature Request Themes

### 1. Chat-Based Configuration (AI-First UX)

**Sources:** Tyler-Sam conversations, Council of Product

**Request:** Configure meeting templates through conversation, not settings pages.

**Design Principle:** "Your settings are not toggles anymore... It's a chat... AI first." — Leadership

**Key Quote:**

> "I have a chat where it asks like, what are the most common types of calls that you have? And it walks me through."
> — Tyler (2026-01-28)

### 2. Per-Meeting-Type Templates (Tags → Templates)

**Sources:** Tyler-Sam (2026-01-28), Sam idea on meeting type detection (2026-01-27)

**Request:** Different recap formats for different call types.

**Examples:**

- Onboarding calls → Structured milestones, next steps
- QBRs → Business outcomes, renewal focus
- Discovery → Pain points, competitive mentions
- Internal → Action items, decisions

### 3. Dedicated Artifact Views (Not Workflow Output)

**Sources:** Tyler-Sam (2026-01-28), Council of Product (Matt's Portable Artifacts)

**Request:** Tab-based interface for meeting outputs.

**Pattern:**

- Tabs: Recap | Coaching | Prep | [Custom]
- Each tab is a beautiful, dedicated artifact
- Not inline markdown in workflow chat

### 4. In-Place Editing via Global Chat

**Sources:** Tyler-Sam (2026-01-28)

**Request:** PostHog-style feedback icon → opens global chat with context.

**Flow:**

1. View meeting recap
2. Don't like something → Click icon
3. Chat opens with context
4. Natural language: "Make it more bullet-pointed"
5. AI updates template for future calls

### 5. Auto-Running Meeting Prep

**Sources:** Tyler-Sam (2026-01-28), Woody's proactive vision

**Request:** Prep runs automatically before every scheduled call.

**Design Principle:** "Auto-run by default, manual trigger as exception."

### 6. Communication Channel Selection

**Sources:** Tyler-Sam (2026-01-28)

**Request:** Select where outputs go: Slack, HubSpot, Teams, email.

---

## Strategic Alignment Assessment

### ✅ Strongly Aligned

| Principle                 | How This Aligns                                     |
| ------------------------- | --------------------------------------------------- |
| **AI-First UX**           | Configuration through conversation, not settings    |
| **Outcomes > Outputs**    | Focus on delivering beautiful, useful recaps        |
| **Human-Centered AI**     | Users control customization; AI handles complexity  |
| **Trust Foundation**      | Consistent, reliable outputs build confidence       |
| **Quality Over Velocity** | Building flagship experience, not feature checklist |

### ✅ Addresses Core Value Props

- **Never miss what matters:** Auto-tagging, auto-templates
- **Context at your fingertips:** Tabbed artifact views
- **Automatic follow-ups:** Channel selection enables CRM/Slack push

### ✅ Supports 2026 Strategic Initiatives

- **Global Chat:** In-place editing requires global chat
- **Workflow Builder / AI Assistant:** Simplifies the backend, improves frontend
- **CRM Agent Upgrades:** Channel selection enables CRM automation

---

## Hypothesis Candidates (Testable)

### H1: Chat-Based Configuration Reduces Setup Time

**We believe that** replacing workflow configuration with chat-based template setup  
**will result in** 50%+ reduction in time-to-first-customized-recap  
**because** users can describe what they want in natural language instead of navigating complex settings.

**Validation:** A/B test new vs old setup flow; measure time to completion.

### H2: Dedicated Artifact Views Increase Engagement

**We believe that** moving meeting recaps from workflow outputs to dedicated tabbed artifacts  
**will result in** 2x increase in recap views per user per week  
**because** beautiful, focused presentation reduces cognitive load and builds trust.

**Validation:** Track artifact view rate pre/post launch.

### H3: In-Place Editing Improves Output Quality

**We believe that** allowing users to edit templates directly from the meeting page  
**will result in** 30%+ increase in template customization rate  
**because** the feedback loop is immediate (see problem → fix → see result).

**Validation:** Track template edit frequency pre/post.

### H4: Flagship Experience Reduces Adoption Churn

**We believe that** a simplified, beautiful meeting recap experience  
**will result in** 20%+ reduction in "failure to adopt" churn  
**because** users immediately see value without workflow complexity.

**Validation:** Cohort analysis: users who use new recap UX vs control.

---

## Competitive Context

From Slack Synthesis (2026-01-26):

### Where We Win

- **Automation differentiation:** "Gong workflows are pretty shit" — Customer quote
- **HubSpot-first:** Momentum requires Salesforce
- **Customization:** "Just the customizability is what's most important to me" — Customer

### Where We Lose

- **Complexity:** "A workflow an average user doesn't wanna deal with"
- **Visual polish:** Outputs feel like developer markdown, not polished artifacts

### Competitor Reference: Fathom

> "Recap email with checkable action items"  
> "Consent-based recording with memory"

**Learning:** Fathom wins on simplicity. We need to match simplicity while delivering more value.

---

## Open Questions for Discovery

1. **Meeting Type Detection:** How accurately can we auto-detect meeting type from calendar + participants?
2. **Template Inheritance:** Should templates cascade (company → team → user)?
3. **Channel Permissions:** What permissions are needed for Slack/HubSpot/Teams push?
4. **Migration Path:** How do existing workflow users transition to new system?
5. **Performance:** Can we generate recap artifacts in real-time as meetings end?

---

## Related Signals (Full Index)

- `sig-2026-01-28-tyler-sam-flagship-meeting-recap-ux` (this initiative's primary source)
- `sig-2026-01-27-tyler-sam-prioritization-workflow`
- `sig-2026-01-26-council-of-product`
- `sig-2026-01-24-council-of-product`
- `sig-2026-01-26-14day-slack-synthesis`

---

## Next Steps

1. **Complete PRD** with outcome chain and requirements
2. **Design Brief** outlining chat config + artifact UX
3. **Sam Review** for alignment with prioritization conversation
4. **Engineering Feasibility** check on template system architecture
