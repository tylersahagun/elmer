# Measurement Plan

## 1) Product Outcomes

### North Star Metric
| Metric | Definition | Formula | Current | Target |
|--------|------------|---------|---------|--------|
| [Metric name] | [What it measures] | [How to calculate] | [Baseline] | [Goal] |

### Leading Indicators
| Indicator | Definition | Why It Matters | Target |
|-----------|------------|----------------|--------|
| [Indicator 1] | | | |
| [Indicator 2] | | | |
| [Indicator 3] | | | |

### Guardrail Metrics
_Metrics that should NOT degrade as we optimize the north star._

| Guardrail | Threshold | Alert If |
|-----------|-----------|----------|
| [e.g., Error rate] | <1% | Exceeds threshold |
| [e.g., Support tickets] | No increase | +10% week-over-week |

---

## 2) Hypotheses & Decision Rules

### Core Hypotheses

#### H1: [Hypothesis Name]
- **We believe:** [statement]
- **Because:** [evidence/reasoning]
- **We'll know we're right when:** [measurable outcome]
- **We'll know we're wrong when:** [failure signal]

#### H2: [Hypothesis Name]
- **We believe:** 
- **Because:** 
- **We'll know we're right when:** 
- **We'll know we're wrong when:** 

### Decision Rules

| If... | Then... |
|-------|---------|
| [Metric] improves by ≥[X]% | Ship to 100% |
| [Metric] improves by [Y-X]% | Iterate on [area] |
| [Metric] shows no change | Re-evaluate problem framing |
| [Guardrail] degrades | Pause rollout, investigate |

---

## 3) Event Taxonomy (PostHog)

### Key Events

| Event Name | Trigger | Required Properties | Optional Properties | Notes |
|------------|---------|---------------------|---------------------|-------|
| `feature_viewed` | User opens feature | `user_id`, `account_id`, `feature_name` | `source`, `session_id` | |
| `action_taken` | User completes action | `user_id`, `action_type`, `success` | `duration_ms`, `item_count` | |
| `error_occurred` | Action fails | `user_id`, `error_type`, `error_code` | `stack_trace` | No PII in errors |

### Property Standards
- `user_id` - Unique user identifier (required on all events)
- `account_id` - Organization/workspace ID
- `plan` - Subscription tier (free, pro, enterprise)
- `session_id` - Browser session for flow analysis
- `timestamp` - ISO 8601 (auto-captured by PostHog)

### Privacy Constraints
- [ ] No email addresses in event properties
- [ ] No personally identifiable info unless consented
- [ ] Customer content (messages, notes) never logged

---

## 4) Funnels & Activation

### Activation Funnel

| Step | Event | Target Conversion | Drop-off Action |
|------|-------|-------------------|-----------------|
| 1. Sign up | `user_signed_up` | 100% (entry) | - |
| 2. First action | `[event_name]` | ≥80% | Improve onboarding |
| 3. Value moment | `[event_name]` | ≥60% | Simplify path |
| 4. Repeat usage | `[event_name]` (2+ times) | ≥40% | Add guidance |

### Segmentation Dimensions
- Role (sales rep, leader, ops, csm)
- Company size
- Integration connected (yes/no)
- AI adoption stage (skeptic → power user)

### Drop-off Diagnostics
When drop-off exceeds threshold:
1. Review session replays at that step
2. Check for error events in same session
3. Survey users who dropped off (if email available)

---

## 5) Retention & Habit Formation

### Retention Definition
| Timeframe | Definition | Target |
|-----------|------------|--------|
| D1 | Returns within 24 hours | ≥50% |
| D7 | Returns within 7 days | ≥40% |
| D30 | Returns within 30 days | ≥30% |

### Returning User Definition
A user "returns" when they: `[specific event or action]`

### Cohorts to Monitor
| Cohort | Definition | Why |
|--------|------------|-----|
| Power users | [X]+ actions/week | Understand what drives engagement |
| Churned | No activity in 14+ days | Win-back targeting |
| New users | Signed up <7 days ago | Activation focus |
| [Custom cohort] | | |

---

## 6) Experiments / Rollout

### Feature Flag Strategy
| Flag Name | Default | Rollout Plan |
|-----------|---------|--------------|
| `feature_[name]_enabled` | `false` | 10% → 50% → 100% |

### Experiment Success Criteria

| Variant | Primary Metric | Secondary Metrics | Sample Size | Duration |
|---------|----------------|-------------------|-------------|----------|
| Control | [baseline] | | | |
| Treatment A | ≥[X]% lift | [list] | [N] users | [days] |

### Statistical Requirements
- Confidence level: 95%
- Minimum detectable effect: [X]%
- Power: 80%

---

## 7) Dashboards & Alerts

### Dashboards

| Dashboard | Purpose | Audience | Refresh |
|-----------|---------|----------|---------|
| [Initiative] Overview | North star + leading indicators | PM, leadership | Real-time |
| Funnel Health | Conversion rates by step | PM, design | Daily |
| Error Monitoring | Error rates and types | Engineering | Real-time |

### Alerts

| Alert | Condition | Owner | Response |
|-------|-----------|-------|----------|
| Activation drop | D1 retention <[X]% | PM | Review recent changes |
| Error spike | Error rate >1% | Eng | On-call investigation |
| [Custom alert] | | | |

---

## Implementation Checklist

### Before Launch
- [ ] Events defined in this plan
- [ ] Events implemented in code
- [ ] Events verified in PostHog (test mode)
- [ ] Dashboards created
- [ ] Alerts configured

### After Launch
- [ ] D1 metrics reviewed
- [ ] D7 metrics reviewed
- [ ] Funnel drop-offs analyzed
- [ ] Iteration decisions documented

---
*Last updated: YYYY-MM-DD*
*Owner: [Name]*
