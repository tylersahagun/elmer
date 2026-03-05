# Product Definition: PostHog Event Schema

**Week**: 8 (Apr 16 – Apr 22)
**Owner**: Tyler Sahagun + Sam Ho
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Define the exact PostHog events, properties, and dashboard structure needed to measure whether the Chief of Staff Agent is removing cognitive load and driving PQL conversion.

---

## Measurement Philosophy

We are measuring two things:
1. **Engagement Proxy** (leading): Did the user act on an Agent-surfaced item? If yes, we count ~15 minutes of cognitive load saved per action.
2. **Business Outcome** (lagging): Did users who engage with the Agent become PQLs at a higher rate than those who don't?

Tyler and Sam Ho must sign off on the metric definitions below before instrumentation begins.

---

## Core Event Schema

### Session Events

| Event Name | Trigger | Key Properties |
|---|---|---|
| `cos_session_started` | User navigates to `/chief-of-staff` | `user_id`, `integrations_connected: string[]`, `feed_item_count: number` |
| `cos_session_duration` | User leaves `/chief-of-staff` | `user_id`, `duration_seconds: number`, `items_actioned: number` |

### Feed Interaction Events

| Event Name | Trigger | Key Properties |
|---|---|---|
| `cos_feed_item_viewed` | A feed card enters the viewport (intersection observer) | `user_id`, `item_id`, `item_type`, `priority`, `contact_id`, `company_id` |
| `cos_feed_item_reviewed` | User clicks "Review" on any card | `user_id`, `item_id`, `item_type`, `priority`, `urgency` |
| `cos_feed_item_snoozed` | User clicks "Remind me later" | `user_id`, `item_id`, `item_type`, `snooze_count` (how many times this item has been snoozed) |
| `cos_feed_item_dismissed` | User permanently dismisses a card | `user_id`, `item_id`, `item_type`, `was_actioned_before: boolean` |
| `cos_feed_item_expired` | Item expires without action | `user_id`, `item_id`, `item_type` (tracked server-side, not client-side) |

### Action Item Events

| Event Name | Trigger | Key Properties |
|---|---|---|
| `cos_action_item_completed` | User marks action item as done | `user_id`, `item_id`, `source: 'meeting'|'slack'|'gmail'`, `days_to_complete: number`, `deal_value: number` |
| `cos_action_item_snoozed` | User snoozes an action item | `user_id`, `item_id`, `snooze_number` |
| `cos_action_item_dismissed` | User dismisses action item | `user_id`, `item_id`, `reason: string` |

### Communication Events

| Event Name | Trigger | Key Properties |
|---|---|---|
| `cos_draft_presented` | Agent surfaces a draft reply | `user_id`, `item_id`, `channel: 'gmail'|'slack'`, `contact_id` |
| `cos_draft_approved` | User sends draft without editing | `user_id`, `item_id`, `channel`, `time_to_approve_seconds` |
| `cos_draft_edited` | User edits draft before sending | `user_id`, `item_id`, `channel`, `edit_length_delta: number` |
| `cos_draft_discarded` | User discards draft | `user_id`, `item_id`, `channel` |

### Impact Report Events

| Event Name | Trigger | Key Properties |
|---|---|---|
| `cos_impact_report_viewed` | User opens an Impact Report | `user_id`, `meeting_id`, `trajectory_verdict`, `call_type`, `seconds_since_meeting_end` |
| `cos_impact_report_read_depth` | User scrolls to end of report | `user_id`, `meeting_id`, `scroll_percentage: 25|50|75|100` |
| `cos_impact_report_edited` | User edits any section | `user_id`, `meeting_id`, `section_edited: 'relationship_summary'|'meeting_narrative'|'trajectory'` |
| `cos_impact_report_shared` | User copies/shares the report | `user_id`, `meeting_id` |

### Integration Events

| Event Name | Trigger | Key Properties |
|---|---|---|
| `cos_integration_connected` | User completes OAuth for any integration | `user_id`, `provider: 'gmail'|'slack'|'google_calendar'`, `is_first_integration: boolean` |
| `cos_integration_disconnected` | User revokes or OAuth fails | `user_id`, `provider`, `reason: 'user_revoked'|'token_expired'|'api_error'` |

---

## Derived Metrics (Calculated in PostHog or Dashboard)

| Metric | Formula | Target |
|---|---|---|
| Daily Active Engagement Rate | `users with cos_feed_item_reviewed / users with cos_session_started` (daily) | > 50% |
| Draft Approval Rate | `cos_draft_approved / cos_draft_presented` | > 60% |
| Action Completion Rate | `cos_action_item_completed / (cos_action_item_completed + cos_action_item_dismissed)` | > 60% |
| Cognitive Load Saved (proxy) | `(cos_draft_approved + cos_action_item_completed) * 15 minutes` (user-level) | 30 min/day per engaged user |
| Impact Report Read Rate | `cos_impact_report_viewed / meetings_completed` | > 40% |
| Alert Fatigue Indicator | `cos_feed_item_snoozed / cos_feed_item_viewed` | < 30% |
| PQL Conversion Lift | Compare `PQL rate (users with cos_session_started ≥ 3)` vs `PQL rate (no cos sessions)` | Statistically significant lift |

---

## PostHog Dashboard Structure

### Dashboard: "Chief of Staff Agent — Daily Health"

1. **Feed Volume**: Number of feed items generated (by type) per day
2. **Engagement Rate**: % of feed items actioned vs. snoozed vs. expired
3. **Draft Approval Rate**: Trend over time
4. **Action Completion Rate**: Trend over time
5. **Integration Adoption**: % of active users with each integration connected

### Dashboard: "Chief of Staff Agent — PQL Conversion"

1. **PQL Count**: Running total toward 100 PQL target by June 1
2. **PQL Cohort Comparison**: PQL rate for Agent-engaged users vs. non-engaged users
3. **Time-to-First-Value**: Median time from first login to first `cos_feed_item_reviewed`

---

## Baseline Measurements (Required Before GA)

These baselines must be captured during Week 8 (before any GA traffic):

- [ ] Current PQL rate for all active users (baseline)
- [ ] Current daily session rate on the old homepage
- [ ] Average number of action items completed per week (legacy)
- [ ] Current Impact Report generation volume (any pre-existing TLDR output)

Owner: Tyler + Sam Ho. Must be documented in a comment on the Linear milestone before Week 9.

---

_Last updated: 2026-02-26_
_Owner: Tyler Sahagun + Sam Ho_
