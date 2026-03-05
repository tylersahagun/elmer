# Success Criteria Framework: Project Babar (Chief of Staff Agent)
## Agent-First Only

**Scope:** Agent-first surface only. Excludes all artifact-first pages (Meeting Summary, Daily Brief, Weekly Brief, Meeting Prep, Action Items queue as standalone destinations). Those artifacts are data feeds into the agent, not measured surfaces.

---

## 1. Feature Definition and Boundary

### Feature Name
Chief of Staff Agent (Project Babar)

### Scope (Agent-First Only)
- **Primary surface:** Chief of Staff chat/feed (`/chief-of-staff`)
- **Proactive Trigger Engine:** Surfaces high-urgency items from Slack, Gmail, Meetings
- **Feed items:** Cards surfaced by agent (`cos_feed_item_*`)
- **Action items:** Tasks surfaced by agent (`cos_action_item_*`)
- **Proactive drafts:** Auto-drafted replies surfaced by agent (`cos_draft_*`)
- **Meeting Impact Reports:** Surfaces contextual reports in feed (`cos_impact_report_*`)
- **Integrations:** Gmail, Slack, Google Calendar connection flows (`cos_integration_*`)

### Explicitly Out of Scope
- Meeting Summary as standalone artifact page
- Daily Brief as standalone page
- Weekly Brief as standalone page
- Meeting Prep as standalone page
- Action Items queue as standalone page
- Any `cos_meeting_summary_*`, `cos_daily_brief_*`, `cos_weekly_brief_*`, `cos_prep_*`, `cos_action_queue_*` as page views
- Sub-initiative breakdown (Meeting Summary, Daily Brief, etc.)—these exist only as data feeds into the agent

### Non-Goals
- Fully autonomous sending of communications without user approval
- Complex multi-step workflow automation outside immediate task extraction and drafting

### Target Persona(s) and Team Types
- Sales Representative
- Sales Leader
- CSM
- RevOps

### Jobs to Be Done
> "When I am overwhelmed by cross-channel communications and meeting follow-ups, I need a Chief of Staff that identifies what needs my attention and surfaces drafts and tasks so I can approve quickly—without navigating artifact pages."

---

## 2. Outcome Chain

```
[Chief of Staff Agent] enables [rapid review and approval of proactive drafts, tasks, and impact reports in the feed]
  → so that [cognitive load and administrative time are significantly reduced]
    → so that [users respond to high-urgency items faster and follow up on meetings more consistently]
      → so that [100 Product Qualified Leads (PQLs) are driven by this single-player experience]
```

---

## 3. Primary Success Hypothesis

**Hypothesis:** If we deliver a proactive Chief of Staff agent that surfaces high-urgency items, auto-drafts, and contextual impact reports in the chat/feed, then users will review and approve with minimal edits, resulting in 100 PQLs driven by this experience.

**Key Assumptions:**
- Users will trust the agent enough to connect integrations (Slack, Gmail, Calendar)
- The Proactive Trigger Engine accurately identifies high-urgency items without alert fatigue
- Auto-drafted replies are of sufficient quality that users approve them with minimal edits
- Impact reports surfaced in feed earn attention without requiring artifact page visits
- Time saved translates into higher PQL conversion

---

## 4. Metrics Map (The Five Layers)

### Layer 1: Eligibility and Coverage
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **Integration Coverage** | % of users with at least one `cos_integration_connected` | PostHog |
| **Eligible Feed Volume** | Feed items surfaced per user per session (from `cos_session_started` context) | PostHog |

### Layer 2: Activation and Adoption
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **First-Feed-Item-Reviewed Rate** | % of users with `cos_session_started` who complete first `cos_feed_item_reviewed` | PostHog |
| **Daily Active Engagement Rate** | Users with `cos_feed_item_reviewed` / Users with `cos_session_started` | PostHog |
| **Integration Disconnect Rate** | `cos_integration_disconnected` (reason: user_revoked) / total connections | PostHog |

### Layer 3: Behavioral Conversion
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **Action Completion Rate** | `cos_action_item_completed` / (`cos_action_item_completed` + `cos_action_item_dismissed`) | PostHog |
| **Draft Approval Rate** | (`cos_draft_approved` + `cos_draft_edited` sent) / `cos_draft_presented` | PostHog |
| **Impact Report Engagement Rate** | Users with `cos_impact_report_viewed` / Users with `cos_session_started` (who had meetings in feed) | PostHog |
| **Impact Report Read Depth** | Sessions with `cos_impact_report_read_depth` ≥ 75 / Sessions with `cos_impact_report_viewed` | PostHog |

### Layer 4: Trust and Reliability
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **Correction Momentum** | Median `edit_length_delta` on `cos_draft_edited` | PostHog |
| **Silent Overwrite / Discard Rate** | `cos_draft_discarded` / `cos_draft_presented` | PostHog |
| **Alert Fatigue Indicator** | `cos_feed_item_snoozed` / `cos_feed_item_viewed` | PostHog |
| **Autonomy Lift** | Trend: % of draft outcomes that are `cos_draft_approved` vs `cos_draft_edited` | PostHog |
| **Verification Efficiency** | Median `time_to_approve_seconds` on `cos_draft_approved` | PostHog |
| **Feed Expiry Rate** | `cos_feed_item_expired` / (`cos_feed_item_viewed` + `cos_feed_item_expired`) | PostHog |

### Layer 5: Proof of Value
| Metric | Definition | Instrumentation |
|--------|------------|-----------------|
| **PQL Conversion Lift** | PQL rate (users with ≥3 `cos_session_started`/week) vs PQL rate (no cos sessions) | PostHog + CRM |
| **Passive Value / Cognitive Load Saved** | (`cos_draft_approved` + `cos_action_item_completed`) × 15 minutes per user | PostHog |

---

## 5. Metric Definitions (Full Table)

| Metric | Definition (Numerator / Denominator) | Unit of Analysis | Segmentation | Time Window | Target | Decision Rule | Instrumentation |
|--------|-------------------------------------|------------------|---------------|-------------|--------|---------------|-----------------|
| **Integration Coverage** | Users with ≥1 `cos_integration_connected` / Total Active Users | User | Provider (Gmail/Slack/Cal) | Weekly | > 70% | Iterate if < 60% | PostHog |
| **First-Feed-Item-Reviewed Rate** | Users with ≥1 `cos_feed_item_reviewed` (within 7d of first session) / Users with `cos_session_started` | User | Cohort | 7 days | > 60% | Iterate if < 50% | PostHog |
| **Daily Active Engagement Rate** | Users with `cos_feed_item_reviewed` / Users with `cos_session_started` | User | Cohort, Persona | Daily | > 50% | Iterate if < 40% | PostHog |
| **Integration Disconnect Rate** | `cos_integration_disconnected` (reason: user_revoked) / Total `cos_integration_connected` | Connection | Provider | Weekly | ≤ 5% | Roll back if > 8% | PostHog |
| **Action Completion Rate** | `cos_action_item_completed` / (`cos_action_item_completed` + `cos_action_item_dismissed`) | Action | Source (meeting/slack/gmail) | Weekly | > 60% | Iterate if < 50% | PostHog |
| **Draft Approval Rate** | (`cos_draft_approved` + `cos_draft_edited` sent) / `cos_draft_presented` | Action | Channel (gmail/slack) | Weekly | > 60% | Roll back if < 50% | PostHog |
| **Impact Report Engagement Rate** | Users with `cos_impact_report_viewed` / Users with `cos_session_started` and meeting in feed | User | Persona | Weekly | > 40% | Iterate if < 30% | PostHog |
| **Impact Report Read Depth** | Sessions with `cos_impact_report_read_depth` ≥ 75 / Sessions with `cos_impact_report_viewed` | Session | — | Weekly | > 50% | Monitor | PostHog |
| **Correction Momentum** | Median `edit_length_delta` on `cos_draft_edited` | Action | Channel | Weekly | Monitor; alert if median > 50% of draft length | — | PostHog |
| **Silent Overwrite Rate** | `cos_draft_discarded` / `cos_draft_presented` | Action | Channel | Weekly | < 40% | Roll back if > 45% | PostHog |
| **Alert Fatigue Indicator** | `cos_feed_item_snoozed` / `cos_feed_item_viewed` | Action | Item type, Priority | Daily | < 30% | Roll back if > 35% | PostHog |
| **Feed Expiry Rate** | `cos_feed_item_expired` / (feed items viewed or expired) | Action | Item type | Weekly | < 25% | Monitor | PostHog |
| **PQL Conversion Lift** | PQL rate (≥3 `cos_session_started`/week) vs PQL rate (no cos sessions) | User | Cohort | Monthly | Statistically significant lift | Ship if positive, significant | PostHog + CRM |
| **Cognitive Load Saved** | (`cos_draft_approved` + `cos_action_item_completed`) × 15 min | User | Persona | Daily | 30 min/day per engaged user | — | PostHog |
| **Time to First Action** | Median seconds from `cos_session_started` to first `cos_feed_item_reviewed` or `cos_action_item_completed` or `cos_draft_approved` | Session | Persona | Weekly | < 2 min | Ship if < 2 min | PostHog |

---

## 6. Causal Attribution Plan

| Method | Description | When to Use |
|--------|-------------|-------------|
| **Matched Cohort Analysis** | Compare PQL conversion rate of users who engage with Chief of Staff (≥3 `cos_session_started`/week with `cos_feed_item_reviewed` or `cos_action_item_completed` or `cos_draft_approved`) vs matched cohort with similar historical activity who do not use the agent. | Post-GA, monthly |
| **Randomized Rollout** | Feature-flag Chief of Staff access; measure delta in engagement, action completion, draft approval, and PQL conversion by exposed vs control. | Beta, GA ramp |
| **Time-Series Impact** | Track baseline PQL rate and action completion before GA; measure delta post-launch, controlling for seasonality. | GA + 30/60 days |

---

## 7. Guardrails (SLO-Backed)

### Privacy Guardrails
| Guardrail | Definition | Alert Threshold | Owner |
|-----------|------------|-----------------|-------|
| Cross-tenant data leakage | Zero leakage in Meeting Impact Reports or draft generation | > 0 incidents | Eng + Security |
| OAuth scope adherence | Strict adherence to requested OAuth scopes | Any scope creep | Eng |

### Accuracy / Validity Guardrails
| Guardrail | Definition | Alert Threshold | Owner |
|-----------|------------|-----------------|-------|
| Draft discard rate | `cos_draft_discarded` / `cos_draft_presented` | ≤ 40% | Product |
| Impact Report trajectory dispute rate | Disputes on trajectory verdict (if feedback added) / reports viewed | < 5% | Product |

### Safety / Security Guardrails
| Guardrail | Definition | Alert Threshold | Owner |
|-----------|------------|-----------------|-------|
| No unapproved sending | No automated email/Slack send without `cos_draft_approved` or edited-send | > 0 incidents | Eng |

---

## 8. Trust Proxies

| Proxy | Definition | Instrumentation | Target |
|-------|------------|-----------------|--------|
| **Correction Momentum** | `edit_length_delta` on `cos_draft_edited`; high delta = low trust in draft | PostHog | Alert if median > 50% of draft length |
| **Silent Overwrite Rate** | `cos_draft_discarded` / `cos_draft_presented` | PostHog | < 40% |
| **Autonomy Lift** | Shift from `cos_draft_edited` to `cos_draft_approved` over time per user | PostHog | Positive slope = trust accumulating |
| **Verification Efficiency** | Median `time_to_approve_seconds` on `cos_draft_approved` | PostHog | Decrease over time = efficiency |
| **Policy Friction Index** | Manual interventions, approval gates, blocked actions per 100 feed items | PostHog, Support | < 10 per 100 |
| **Source-of-Truth Challenge Rate** | Explicit "incorrect" feedback or accuracy support tickets per 100 AI-populated outputs | Support, Feedback | < 5 per 100 |

---

## 9. Anti-Metrics to Explicitly Ignore

| Anti-Metric | Why Ignore |
|-------------|------------|
| **Raw session count / Time-in-app** | Lower `cos_session_duration` with higher items actioned is ideal (efficiency) |
| **Raw volume of drafts presented** | 100 drafts with 90 discarded is failure. Optimize approval rate, not volume |
| **Vanity feed views** | `cos_feed_item_viewed` is denominator only; not a success metric |
| **Raw activity counts without quality gates** | "# of summaries generated" or "# of impact reports surfaced" without view/action is vanity |
| **Engagement theater** | Clicks per user, time-in-app without `cos_feed_item_reviewed` / `cos_action_item_completed` / `cos_draft_approved` |
| **Model-centric vanity** | Tokens consumed, prompt count |
| **Speed without correctness** | "Time to generate draft" without approval rate |
| **Adoption without sustainment** | "% users tried feature once" without weekly active engagement |
| **Artifact page metrics** | Meeting Summary, Daily Brief, Weekly Brief, Prep, Action Queue as standalone page views—out of scope |

---

## 10. Launch Gate Recommendation

To proceed with GA, the following Trust/Reliability SLIs must be met during beta:

| SLI | Threshold | Rationale |
|-----|-----------|-----------|
| **Draft Approval Rate** | ≥ 50% | Lower indicates users do not trust drafts |
| **Alert Fatigue Indicator (Snooze Rate)** | ≤ 35% | Higher indicates over-surfacing |
| **Integration Disconnect Rate** (user revoke) | ≤ 5% | High revoke indicates trust or UX failure |
| **Action Completion Rate** | ≥ 60% | Core behavioral outcome |
| **Daily Active Engagement Rate** | ≥ 50% (users who session) | North star adoption |
| **Privacy Incidents** | 0 severe | Hard stop |

---

## 11. Active Usage Definitions (Agent-First Only)

Per the Outcome Engine philosophy: usage = **reliable work completed and trusted outcomes delivered**, not clicks or sessions.

### User-Level Active Usage (Human Activity)
- Judgment actions: approve, edit, override, share, route.
- Delegation actions: enable integrations, complete actions.
- **Counted as active:** `cos_draft_approved`, `cos_draft_edited` (sent), `cos_action_item_completed`, `cos_feed_item_reviewed`, `cos_impact_report_shared`, `cos_impact_report_edited`.

### Agent-Level Active Usage (System Activity)
- Agent surfacing work tied to a business object.
- User commits outcome (approve/complete) and it is not reversed within 24h.
- **Counted as active:** Drafts approved and sent; actions completed; impact reports viewed and shared.

### Business-Level Active Usage (Outcome Activity)
- Measurably changing operational behaviors correlated with revenue.
- **Counted as active:** PQL conversion lift; 100 PQLs driven by this experience.

### Passive Value Formula
```
Passive Value = (cos_draft_approved + cos_action_item_completed) × 15 min − (review + correction minutes)
```
*Only count work as "value" if it meets trust SLOs (approval rate ≥ 50%, discard rate ≤ 40%).*

---

## 12. PostHog Event-to-Metric Mapping (cos_* Only)

| Event | Layer | Metric(s) |
|-------|-------|-----------|
| `cos_session_started` | 2 | First-Feed-Item-Reviewed denominator; Daily Active Engagement denominator; Time to First Action start |
| `cos_session_duration` | — | Context only; not optimized |
| `cos_feed_item_viewed` | 4 | Alert Fatigue denominator; Feed Expiry denominator |
| `cos_feed_item_reviewed` | 2 | First-Feed-Item-Reviewed; Daily Active Engagement numerator |
| `cos_feed_item_snoozed` | 4 | Alert Fatigue numerator |
| `cos_feed_item_dismissed` | — | Conversion path (dismiss vs review vs complete) |
| `cos_feed_item_expired` | 4 | Feed Expiry numerator |
| `cos_action_item_completed` | 3, 5 | Action Completion Rate numerator; Cognitive Load Saved; Passive Value |
| `cos_action_item_snoozed` | — | Monitor; not primary metric |
| `cos_action_item_dismissed` | 3 | Action Completion Rate denominator |
| `cos_draft_presented` | 3, 4 | Draft Approval Rate denominator; Silent Overwrite denominator |
| `cos_draft_approved` | 3, 5 | Draft Approval Rate numerator; Cognitive Load Saved; Verification Efficiency |
| `cos_draft_edited` | 4 | Correction Momentum; Autonomy Lift |
| `cos_draft_discarded` | 4 | Silent Overwrite numerator |
| `cos_impact_report_viewed` | 3 | Impact Report Engagement Rate numerator |
| `cos_impact_report_read_depth` | 3 | Impact Report Read Depth |
| `cos_impact_report_edited` | — | User engagement with agent output |
| `cos_impact_report_shared` | — | User trust signal |
| `cos_integration_connected` | 1 | Integration Coverage |
| `cos_integration_disconnected` | 2, 7 | Integration Disconnect Rate; Launch Gate |

---

_Last updated: 2026-02-25_  
_Owner: Tyler + Sam Ho_  
_Metrics Strategist Subagent_  
_Scope: Agent-first only. No artifact-first metrics._
