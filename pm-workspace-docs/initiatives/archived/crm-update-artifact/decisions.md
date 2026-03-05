# Decisions Log: CRM Experience End-to-End

## Purpose
Track key decisions, their rationale, and any alternatives considered.

---

## Decision: Confidence-Building as Core Design Principle
**Date:** 2026-01-16
**Deciders:** Tyler, Bryan (based on user story from leadership)
**Status:** Accepted

### Context
User story brain dump emphasized that the key emotion users need is **confidence** that the system will work before they commit to automation.

> "I want to be able to actually test and see an output so that I have confidence. That's the key there is I need the confidence of, k. I just got this set up, and it is actually going to work how I want it to work."

### Options Considered
1. **Option A: Configuration-first approach**
   - Jump straight to field configuration
   - Pros: Faster for power users
   - Cons: Doesn't build confidence, higher abandonment

2. **Option B: Education + Test approach (Selected)**
   - Education first, then test on real data before activating
   - Pros: Builds confidence, reduces fear of mistakes
   - Cons: Longer initial setup time

### Decision
Go with Option B. The user story is clear that confidence is the key barrier to adoption. A few extra minutes in onboarding is worth it if it leads to higher activation and retention.

### Consequences
- Onboarding wizard will have education step
- Must support "preview mode" before activation
- Need to show confidence scores prominently
- May need to revisit for power users who want to skip

---

## Decision: Separate Admin vs User Experiences
**Date:** 2026-01-16
**Deciders:** Tyler, Bryan
**Status:** Accepted

### Context
User story describes two distinct personas with different needs:
- **Admin/RevOps:** Full visibility, team-wide control, anomaly detection
- **User/Rep:** Personal view, agent communication, self-service automations

### Options Considered
1. **Option A: Single unified view with role-based filtering**
   - One interface, different data based on role
   - Pros: Simpler to build, consistent UX
   - Cons: May be overwhelming for users, hard to optimize for both

2. **Option B: Distinct experiences (Selected)**
   - Admin gets dashboard, users get communication center
   - Pros: Optimized for each persona, clearer mental model
   - Cons: More to build, potential inconsistency

### Decision
Go with Option B. The needs are different enough that a unified view would be a compromise for both. Admin needs density and control; users need simplicity and personal relevance.

### Consequences
- Two distinct entry points in navigation
- Admin dashboard with full activity log
- User communication center with personal focus
- Shared inbox component (both can access)

---

## Decision: Agent Communication as Distinct Concept
**Date:** 2026-01-16
**Deciders:** Tyler, Bryan
**Status:** Accepted

### Context
User story explicitly calls out wanting "a place where I can see the agent communicating to me."

> "When I log in to AskElephant, I want a place where I can see the agent communicating to me. This is what I did. And if it's human in the loop asking for permission or it's just reporting."

### Options Considered
1. **Option A: Merge with inbox**
   - All agent interactions in one place
   - Pros: Single location, simpler navigation
   - Cons: Mixes approvals with informational messages

2. **Option B: Merge with activity log**
   - Agent messages as part of activity
   - Pros: Chronological view
   - Cons: Too admin-focused, loses conversational feel

3. **Option C: Separate communication center (Selected)**
   - Dedicated space for agent-to-user communication
   - Pros: Matches user mental model, conversational feel
   - Cons: Another place to check

### Decision
Go with Option C. The user story language ("communicating to me") suggests users think of this as a conversation, not a log or inbox. The communication center should feel like the agent talking to you.

### Consequences
- New "Agent Communication Center" component
- Messages should have a conversational tone
- Clear separation from inbox (approvals) and dashboard (admin)
- May need to link between them for context

---

## Decision: Start Simple, Expand Later
**Date:** 2026-01-16
**Deciders:** Tyler, Bryan
**Status:** Accepted

### Context
User story emphasizes starting with "one or just a handful of things first" to build confidence.

> "Once I do that and it really should be for probably one or just a handful of things first. I have the confidence."

### Options Considered
1. **Option A: Full configuration upfront**
   - Show all options, let users configure everything
   - Pros: Power users can do everything at once
   - Cons: Overwhelming, reduces confidence

2. **Option B: Progressive disclosure (Selected)**
   - Start with 1-2 templates, expand as confidence grows
   - Pros: Matches user mental model, builds confidence
   - Cons: May frustrate power users

### Decision
Go with Option B. Progressive disclosure aligns with the confidence-building principle. We can add "advanced mode" later for power users.

### Consequences
- Onboarding defaults to 1-2 templates enabled
- "Add more" CTA after initial success
- Advanced configuration available but not prominent
- Track which users want more upfront (potential segment)

---

## Decision: Proactive Anomaly Detection
**Date:** 2026-01-16
**Deciders:** Tyler, Bryan
**Status:** Accepted

### Context
User story emphasizes AskElephant being proactive about surfacing issues.

> "AskElephant is working with me and being proactive to help me understand trends, things that might not be that seem like they're anomalies."

### Options Considered
1. **Option A: Reactive only**
   - Users check logs when they suspect issues
   - Pros: Simpler to build
   - Cons: Issues discovered late, reduces trust

2. **Option B: Proactive alerts (Selected)**
   - System detects and surfaces anomalies automatically
   - Pros: Builds trust, catches issues early
   - Cons: Risk of alert fatigue, false positives

### Decision
Go with Option B. Proactive alerting is a key differentiator and aligns with the "working with me" language in the user story. Must be careful about alert fatigue.

### Consequences
- Build anomaly detection service
- Tunable thresholds to reduce false positives
- Alerts should feel helpful, not alarming
- User feedback loop to improve detection

---

## Decision: Slack as Primary HITL Channel
**Date:** 2026-01-16
**Deciders:** Palmer, David (implementation), Tyler (PM)
**Status:** In Progress

### Context
Palmer is working on Slack human-in-the-loop based on recent backend work.

> "What's now possible based off of what David and I finished last night is human in the loop through Slack."

### Options Considered
1. **Option A: In-app only**
   - All approvals happen in AskElephant
   - Pros: Full control over UX
   - Cons: Users must check another app

2. **Option B: Slack-first (Selected)**
   - Notifications and quick actions in Slack
   - Pros: Meet users where they are
   - Cons: Limited UX in Slack, dependency on Slack API

3. **Option C: Multi-channel**
   - Slack + Desktop + Email
   - Pros: User choice
   - Cons: More to build and maintain

### Decision
Start with Option B (Slack-first), expand to Option C over time. Slack is where our users already work, and the interactive message capabilities are sufficient for quick approvals.

### Consequences
- Slack bot integration required
- Interactive message buttons for approve/reject
- Link to full detail in app for complex cases
- Desktop notifications as future enhancement

---

## Pending Decisions

### Decision: Confidence Threshold for Auto-Approve
**Status:** Open
**Question:** At what confidence level should we auto-approve vs require HITL?

**Options:**
- 80%+ auto-approve
- 90%+ auto-approve
- Always HITL initially, learn threshold from user behavior

**Considerations:**
- Higher threshold = more interruptions, more trust
- Lower threshold = less interruptions, more risk
- User-configurable?

---

### Decision: User Automation Scope
**Status:** Open
**Question:** What can users automate for themselves vs what requires admin?

**Options:**
- Users can only adjust notification preferences
- Users can create personal automations (own data only)
- Users can request automations that admin approves

**Considerations:**
- User story says "only impact my own" data
- Need clear boundaries
- Admin visibility into user automations?

---

*Last updated: 2026-01-16*
