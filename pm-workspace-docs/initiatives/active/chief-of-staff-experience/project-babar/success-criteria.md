# Success Criteria Framework: Project Babar (Chief of Staff Agent)

## 1. Feature Definition and Boundary

### Feature Name
Chief of Staff Agent (Project Babar)

### Scope (Agent-First Only)
- **Primary surface:** Chief of Staff chat/feed (`/chief-of-staff`)
- **Proactive Trigger Engine:** Surfaces high-urgency items from Slack, Gmail, Meetings, and CRM context (e.g., quota proximity, time of day).
- **Feed items:** Cards surfaced by agent (`cos_feed_item_*`)
- **Action items:** Tasks surfaced by agent (`cos_action_item_*`)
- **Proactive drafts:** Auto-drafted replies surfaced by agent (`cos_draft_*`)
- **Meeting Impact Reports:** Surfaces contextual reports in feed (`cos_impact_report_*`)
- **Integrations:** Gmail, Slack, Google Calendar connection flows (`cos_integration_*`)

### Target Persona(s) and Team Types
- Sales Representative
- Sales Leader
- CSM
- RevOps

### Jobs to Be Done
> "When I am overwhelmed by cross-channel communications, meeting follow-ups, and pipeline pressure, I need a Chief of Staff that taps me on the shoulder at the exact right time, handles my administrative triage effortlessly, and acts as a strategic sounding board so I can focus purely on closing deals."

---

## 2. The 3-Pillar Value Architecture

To prove to revenue leaders that we are reducing cognitive load and increasing effective selling capacity, we measure the Agent across three distinct modes of operation:

1. **Pillar 1: Proactive Intervention (The "Right Time" Push)**
   - *The Job:* Context-aware alerts that change behavior. The Agent knows it's 4:50 PM on a Friday and the rep is $10K away from quota, so it suggests staying late to push a specific deal. It knows it's Monday morning, so it prompts a weekly planning session.
   - *Success:* High conversion on time-sensitive, context-aware prompts.
2. **Pillar 2: Frictionless Execution (The "Fast" Triage)**
   - *The Job:* Getting administrative noise out of the way. The Agent drafts replies and extracts tasks so the rep doesn't have to context-switch or type from scratch.
   - *Success:* Speed (one-click approvals) and low edits.
3. **Pillar 3: Seamless Partnership (The "Slow" Deep Work)**
   - *The Job:* Synthesizing complex account history into Impact Reports and Prep Briefs, acting as a strategic sounding board.
   - *Success:* Deep engagement, dwell time, and conversational turns.

---

## 3. Outcome Chain

```
[Chief of Staff Agent] monitors context (time, quota, comms, meetings)
  → so that [it can proactively intervene at the exact right moment (Pillar 1)]
    → so that [reps can frictionlessly execute administrative triage (Pillar 2)]
      → so that [reps have the mental bandwidth for deep, strategic partnership on accounts (Pillar 3)]
        → so that [cognitive load is drastically reduced, returning hours of active selling capacity]
          → so that [revenue velocity increases and 100 PQLs are driven by this experience].
```

---

## 4. Metrics Map (The Cognitive Load Framework)

### North Star: The Cognitive Offload Index (COI)
A composite score per rep per week tracking the shift of mental burden from the Rep to the Agent.
**Formula:** `(Proactive Interventions Actioned) + (Frictionless Executions) + (Deep Work Sessions > 2 mins) - (Alert Fatigue Snoozes)`

### Layer 1: Proactive Intervention (Context & Timing)
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **Contextual Intercept Rate** | % of proactive, time/context-sensitive alerts (e.g., quota warnings, pre-meeting prep) that result in immediate user action | PostHog (`cos_feed_item_reviewed` where `trigger_type = contextual`) |
| **Time-to-Action (Urgent)** | Median seconds from an urgent alert appearing to the user clicking "Review" or "Approve" | PostHog |

### Layer 2: Frictionless Execution (Triage)
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **One-Click Resolution Rate** | % of Agent-surfaced drafts/tasks approved or completed in < 60 seconds with < 10% edits | PostHog |
| **Action Completion Rate** | `cos_action_item_completed` / (`cos_action_item_completed` + `cos_action_item_dismissed`) | PostHog |
| **Draft Approval Rate** | (`cos_draft_approved` + `cos_draft_edited` sent) / `cos_draft_presented` | PostHog |

### Layer 3: Seamless Partnership (Deep Work)
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **Strategic Prep & Planning Rate** | % of sessions where the rep spends > 2 minutes reviewing an Impact Report/Prep Brief OR engages in ≥ 2 conversational turns with the Global Chat | PostHog |
| **Impact Report Read Depth** | Sessions with `cos_impact_report_read_depth` ≥ 75% / Sessions with `cos_impact_report_viewed` | PostHog |

### Layer 4: Foundation (Trust & Signal-to-Noise)
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **Alert Fatigue Indicator** | `cos_feed_item_snoozed` / `cos_feed_item_viewed` | PostHog |
| **Correction Momentum** | Median `edit_length_delta` on `cos_draft_edited` (High delta = low trust in AI context) | PostHog |
| **Silent Overwrite Rate** | `cos_draft_discarded` / `cos_draft_presented` | PostHog |

---

## 5. Metric Definitions (Full Table)

| Metric | Definition (Numerator / Denominator) | Unit of Analysis | Time Window | Target | Decision Rule |
|--------|-------------------------------------|------------------|-------------|--------|---------------|
| **Contextual Intercept Rate** | Contextual alerts actioned / Contextual alerts surfaced | Action | Weekly | > 40% | Iterate triggers if < 25% |
| **One-Click Resolution Rate** | Drafts/Tasks approved in <60s with <10% edits / Total Drafts+Tasks presented | Action | Weekly | > 50% | Improve LLM context if < 30% |
| **Strategic Prep Rate** | Sessions with >2min dwell on reports OR ≥2 chat turns / Total `cos_session_started` | Session | Weekly | > 30% | Improve report depth if < 15% |
| **Draft Approval Rate** | (`cos_draft_approved` + `cos_draft_edited` sent) / `cos_draft_presented` | Action | Weekly | > 60% | Roll back if < 50% |
| **Alert Fatigue Indicator** | `cos_feed_item_snoozed` / `cos_feed_item_viewed` | Action | Daily | < 30% | Roll back if > 35% |
| **Correction Momentum** | Median `edit_length_delta` on `cos_draft_edited` | Action | Weekly | Monitor | Alert if median > 50% of draft length |
| **Agent-Influenced Deal Velocity** | Win rate & time-to-close for deals with ≥3 Agent interactions vs deals with 0 | Deal | Monthly | Stat. Sig. Lift | Ship if positive |

---

## 6. Anti-Metrics Explicitly Ignored

| Anti-Metric | Why Ignore |
|-------------|------------|
| **Raw session count / Time-in-app** | Lower `cos_session_duration` with higher items actioned is ideal (efficiency). We only want high time-in-app for *Deep Work* sessions, not triage. |
| **Raw volume of drafts presented** | 100 drafts with 90 discarded is a failure. Optimize the *Approval Rate*, not the generation volume. |
| **Vanity feed views** | `cos_feed_item_viewed` is a denominator only; it is not a success metric. |

---

## 7. PostHog Event-to-Metric Mapping (cos_* Only)

| Event | Pillar / Layer | Metric(s) |
|-------|-------|-----------|
| `cos_session_started` | Base | Denominator for Strategic Prep Rate |
| `cos_feed_item_viewed` | 4 (Foundation) | Alert Fatigue denominator |
| `cos_feed_item_reviewed` | 1 (Proactive) | Contextual Intercept Rate numerator (if `trigger_type = contextual`) |
| `cos_feed_item_snoozed` | 4 (Foundation) | Alert Fatigue numerator |
| `cos_action_item_completed` | 2 (Frictionless) | Action Completion Rate numerator; One-Click Resolution (if < 60s) |
| `cos_draft_presented` | 2, 4 | Draft Approval Rate denominator; Silent Overwrite denominator |
| `cos_draft_approved` | 2 (Frictionless) | Draft Approval Rate numerator; One-Click Resolution (if < 60s) |
| `cos_draft_edited` | 4 (Foundation) | Correction Momentum |
| `cos_draft_discarded` | 4 (Foundation) | Silent Overwrite numerator |
| `cos_impact_report_viewed` | 3 (Seamless) | Strategic Prep Rate (if dwell > 2m) |
| `cos_chat_turn_completed` | 3 (Seamless) | Strategic Prep Rate (if count ≥ 2 per session) |

---

## 8. Practical Examples & Scenarios

### 🌟 North Star: Cognitive Offload Index (COI)
**Formula:** `(Proactive Interventions Actioned) + (Frictionless Executions) + (Deep Work Sessions > 2 mins) - (Alert Fatigue Snoozes)`

**Example Calculation (A Rep's Week):**
* **+ 5** times they actioned an urgent quota/deal alert
* **+ 12** times they one-click approved an email draft or task
* **+ 3** times they spent >2 mins prepping for a meeting with the agent
* **- 2** times they hit "snooze" on an annoying notification
* **= COI of 18**
* 🟢 **Good Indicator (e.g., COI > 15):** The number is strongly positive and growing week-over-week. The agent is acting as a true multiplier, saving the rep hours of work.
* 🔴 **Poor Indicator (e.g., COI < 5 or Negative):** The rep is snoozing alerts as fast as they come in, and rarely accepting drafts. The agent is a distraction, not a helper.

### 1️⃣ Pillar 1: Proactive Interventions (The "Right Time" Push)
* **Metric:** Contextual Intercept Rate (`Alerts Actioned` / `Total Alerts Surfaced`)
* **Example:** The Agent surfaces 10 alerts this week ("You are $10k from quota, follow up with Acme Corp"). The rep clicks "Review" on 6 of them. (Score: **60%**)
* 🟢 **Good Outcome (> 40%):** The rep trusts the agent's timing. When the agent speaks, the rep listens.
* 🔴 **Bad Outcome (< 25%):** The rep ignores 8 out of 10 alerts. The triggers are misaligned with how the rep actually works, and we need to adjust the logic.

### 2️⃣ Pillar 2: Frictionless Executions (The "Fast" Triage)
* **Metric:** One-Click Resolution Rate (`Drafts/Tasks approved in < 60s with <10% edits` / `Total Drafts presented`)
* **Example:** The agent auto-drafts 20 email replies. The rep sends 12 of them almost instantly with barely any typing. (Score: **60%**)
* 🟢 **Good Outcome (> 50%):** High velocity. The LLM has enough context that it sounds exactly like the rep, allowing them to clear their inbox in minutes instead of hours.
* 🔴 **Bad Outcome (< 30%):** The rep is constantly rewriting the agent's drafts. If they have to rewrite 50% of the email, the agent is adding friction, not removing it.

### 3️⃣ Pillar 3: Seamless Partnership (The "Slow" Deep Work)
* **Metric:** Strategic Prep Rate (`Sessions with > 2 mins dwell time on Impact Reports OR ≥ 2 chat turns` / `Total Sessions`)
* **Example:** A rep opens 10 Meeting Impact Reports over the week. For 4 of them, they sit and read the brief for 3 minutes, or they ask the chat, "What were the main objections last time?" (Score: **40%**)
* 🟢 **Good Outcome (> 30%):** Reps are finding deep value in the synthesis. They are using the agent as a sounding board before walking into big calls.
* 🔴 **Bad Outcome (< 15%):** Reps are opening the briefs but immediately closing them (shallow reads). This indicates the summaries are too generic or inaccurate to be strategically useful.

### 🛡️ Layer 4: Foundation (Alert Fatigue)
* **Metric:** Alert Fatigue Indicator (`Feed items snoozed or dismissed` / `Total feed items viewed`)
* **Example:** The agent shows 20 cards in the feed. The rep actively hits "Snooze" or "Dismiss" on 3 of them. (Score: **15%**)
* 🟢 **Good Outcome (< 30%):** The feed feels curated and highly relevant. The rep feels in control.
* 🔴 **Bad Outcome (> 35%):** The agent is acting like a spammy inbox. If this crosses 35%, we need to actively roll back our proactive triggers to protect the user's trust in the system.

### 💼 Real-World Operational Scenarios

#### 1. The Post-Call Auto-Draft (Matching Their Voice)
*Scenario: A rep gets off a call, and the Agent has already drafted a follow-up email in their exact tone.*
* **Pillar 2 (One-Click Resolution Rate):** If the Agent nailed their voice, the rep hits "Send" almost immediately (< 60 seconds, < 10% edits). This is the ideal Frictionless Execution.
* **Layer 4 (Correction Momentum):** If the email sounds robotic or misses the mark, the rep will have to rewrite chunks of it (`edit_length_delta`). If they delete and rewrite 40% of the draft, our "Correction Momentum" spikes, indicating the LLM's tone/context prompt needs fixing.
* **Layer 4 (Silent Overwrite Rate):** If the draft is completely useless, the rep will just delete it and write their own. This counts as a discarded draft.

#### 2. The "Dormant Account / Forgotten Promise" Nudge
*Scenario: The Agent notices it's been 14 days since the last interaction, or that the rep promised a case study on a call last week but hasn't sent it yet.*
* **Pillar 1 (Contextual Intercept Rate):** The Agent surfaces a card in the feed: *"You promised Acme Corp a case study 5 days ago."* If the rep clicks "Draft Email" or "Snooze until tomorrow," that counts as an *Actioned* alert, proving the nudge was valuable and timely.
* **Layer 4 (Alert Fatigue Indicator):** If the Agent is nudging about an account that the rep knows is dead (but the CRM doesn't), the rep will likely just hit "Dismiss." If this happens too often, the Alert Fatigue score goes up, indicating proactive trigger logic is too aggressive or missing context.

#### 3. The End-of-Day Wrap-Up
*Scenario: At 4:45 PM, the Agent surfaces a summary: "Hey, before you leave, here are 3 things you missed today."*
* **Pillar 1 (Contextual Intercept Rate):** Because this is triggered by a specific context (time of day + missed items), if the rep actually clicks through the items to clear them out, it counts as a successful intercept.
* **Pillar 2 (Action Completion Rate):** If that end-of-day digest contains 3 extracted tasks, and the rep clicks "Mark as Done" on them, it boosts this metric.
* **North Star (COI):** This scenario perfectly tests the **Cognitive Offload Index**. If the wrap-up gives the rep peace of mind and they clear the tasks, their COI score goes up (Frictionless Executions). However, if they are exhausted and just hit "Dismiss All" every day at 4:45 PM to go home, it counts as *Alert Fatigue* and pulls their COI score down.

---

_Last updated: 2026-02-26_  
_Owner: Tyler + Sam Ho_  
_Scope: Agent-first only. Focused on Cognitive Load Reduction via 3 Pillars._