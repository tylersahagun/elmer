# AskElephant Value Ladder

**Last Updated:** January 23, 2026  
**Purpose:** Define activation tiers for measuring time-to-value and user progression

---

## Overview

The Value Ladder defines progressive levels of product value that users achieve. This framework helps:

1. **Measure Time-to-Value** - How quickly users reach each tier
2. **Identify Activation Gaps** - Where users get stuck
3. **Segment Users** - For targeted engagement and analysis
4. **Track Business Health** - Leading indicators of retention

---

## Value Tiers

### Tier 1: Basic Activation

**Description:** User has achieved core meeting intelligence value - meetings are being processed and insights delivered.

**Target Timeline:** Day 1

**Key Events:**
| Event | Description | Required |
|-------|-------------|----------|
| `meeting:processed` | First meeting successfully processed | Yes |
| `onboarding:flow_completed` | Completed initial setup | Yes |
| `email:briefing_sent` OR `email:followup_sent` | Received automated email | No |

**Cohort Definition:**

```
Completed event: meeting:processed
Count: at least 1 time
Time range: in the last 90 days
```

**Success Criteria:**

- User has calendar connected
- At least one meeting has been processed
- User has seen meeting summary/transcript

**PostHog Query:**

```json
{
  "kind": "TrendsQuery",
  "series": [
    {
      "kind": "EventsNode",
      "event": "meeting:processed",
      "custom_name": "Basic Activation",
      "math": "unique_users"
    }
  ],
  "interval": "day"
}
```

---

### Tier 2: CRM Connected

**Description:** User has connected their CRM and is receiving synchronized data between AskElephant and their revenue system.

**Target Timeline:** Week 1

**Key Events:**
| Event | Description | Required |
|-------|-------------|----------|
| `hubspot_agent:enabled` OR `salesforce_agent:enabled` | CRM agent activated | Yes (one of) |
| `hubspot:contact:synced` OR `salesforce:contact:synced` | First sync occurred | Yes |

**Cohort Definition:**

```
Completed event: hubspot_agent:enabled OR salesforce_agent:enabled
Count: at least 1 time
Time range: in the last 90 days
```

**Success Criteria:**

- CRM integration connected and authenticated
- At least one contact/company synced
- Meeting data flowing to CRM

**Personas Most Likely:**

- RevOps (primary)
- Sales Managers
- Individual AEs (with admin help)

---

### Tier 3: Automation Active

**Description:** User has workflows running that deliver automated value without manual intervention.

**Target Timeline:** Week 2-4

**Key Events:**
| Event | Description | Required |
|-------|-------------|----------|
| `workflows:created` | Workflow configured | Yes |
| `workflows:run_started` | Workflow executed | Yes |
| `workflows:run_completed` | Workflow succeeded | Yes |

**Cohort Definition:**

```
Completed event: workflows:run_completed
Count: at least 5 times
Time range: in the last 30 days
```

**Success Criteria:**

- At least one active workflow
- Workflow has run successfully multiple times
- User receiving automated outputs (chat messages, CRM updates, etc.)

**Value Attribution Note:**

> "Successful runs of workflows probably seems like something to have a sense of, like, who's being impacted by that." - Sachin (PostHog TAM)

Successful workflow runs count as value delivered, even if user doesn't interact with the output.

---

### Tier 4: Power User

**Description:** User is deeply embedded with multiple integrations, high workflow volume, and/or team adoption.

**Target Timeline:** Month 1+

**Key Events:**
| Event | Description | Threshold |
|-------|-------------|-----------|
| `workflows:run_completed` | Heavy automation usage | ≥50/month |
| Multiple agent events | Multi-integration | ≥2 integrations enabled |
| Team activity | Multi-user workspace | ≥3 active users in workspace |

**Cohort Definition (Power User - Workflows):**

```
Completed event: workflows:run_completed
Count: at least 50 times
Time range: in the last 30 days
```

**Cohort Definition (Power User - Multi-Integration):**

```
Completed event: hubspot_agent:enabled
AND Completed event: salesforce_agent:enabled (or other combination)
```

**Success Criteria:**

- Deep feature engagement
- Multiple integrations active
- Team-wide adoption (multiple users)
- High automation volume

---

## Measuring Time-to-Value

### Funnel: Signup to Basic

```
Step 1: users:create_user:created (Signup)
Step 2: onboarding:flow_completed (Setup Complete)
Step 3: meeting:processed (First Meeting)
```

**Target:** 70% reach Step 3 within 7 days

### Funnel: Basic to CRM Connected

```
Step 1: meeting:processed (Basic Activation)
Step 2: hubspot_agent:enabled OR salesforce_agent:enabled
Step 3: hubspot:contact:synced OR salesforce:contact:synced
```

**Target:** 40% of Basic users reach CRM Connected within 14 days

### Funnel: CRM to Automation

```
Step 1: hubspot_agent:enabled OR salesforce_agent:enabled
Step 2: workflows:created
Step 3: workflows:run_completed (count ≥5)
```

**Target:** 30% of CRM users reach Automation Active within 30 days

---

## Persona Mapping

Different personas progress through the value ladder differently.

| Persona               | Typical Path                           | Target Tier |
| --------------------- | -------------------------------------- | ----------- |
| **Individual AE/Rep** | Basic → (CRM via admin) → Chat queries | Tier 1-2    |
| **Sales Manager**     | Basic → Team views → Reports           | Tier 2      |
| **RevOps**            | Basic → CRM → Automation → Power       | Tier 4      |
| **CSM**               | Basic → Customer pages → Workflows     | Tier 3      |

**Implication:** Don't measure all personas against the same activation bar.

---

## Standard Cohorts by Tier

Create these cohorts in PostHog for segmentation:

| Cohort Name             | Tier | Definition                                                             |
| ----------------------- | ---- | ---------------------------------------------------------------------- |
| `value-tier-basic`      | 1    | Completed `meeting:processed` in 90d                                   |
| `value-tier-crm`        | 2    | Completed `hubspot_agent:enabled` OR `salesforce_agent:enabled` in 90d |
| `value-tier-automation` | 3    | Completed `workflows:run_completed` ≥5 times in 30d                    |
| `value-tier-power`      | 4    | Completed `workflows:run_completed` ≥50 times in 30d                   |
| `not-activated`         | 0    | Has `$pageview` but NOT `meeting:processed` in 30d                     |

---

## Alerts Based on Value Ladder

| Alert               | Trigger                                 | Action                 |
| ------------------- | --------------------------------------- | ---------------------- |
| Activation Drop     | Basic tier % drops >10% WoW             | Investigate onboarding |
| CRM Stall           | Users at Tier 1 >14 days without Tier 2 | CS outreach            |
| Automation Adoption | Tier 3 % drops >5%                      | Check workflow UX      |
| Power User Churn    | Power users dropping to Tier 2          | High-priority save     |

---

## Dashboard Recommendations

### Executive Dashboard

- % of users at each tier
- Time-to-value trends by tier
- Tier progression funnel

### Activation Dashboard

- Detailed funnel: Signup → Basic
- Breakdown by signup source
- Dropoff analysis

### Retention Dashboard

- Retention by tier (users at Tier 3+ retain better)
- Tier regression tracking
- At-risk users (tier dropping)

---

## Implementation Status

| Tier              | Events Exist | Cohort Created | Dashboard |
| ----------------- | ------------ | -------------- | --------- |
| Basic             | ✅           | ⬜ TODO        | ⬜ TODO   |
| CRM Connected     | ✅           | ⬜ TODO        | ⬜ TODO   |
| Automation Active | ✅           | ⬜ TODO        | ⬜ TODO   |
| Power User        | ✅           | ⬜ TODO        | ⬜ TODO   |

---

## References

- `pm-workspace-docs/research/posthog-best-practices-sachin.md` - Original conversation
- `pm-workspace-docs/audits/posthog-audit-2026-01-23.md` - Current state analysis
- `pm-workspace-docs/company-context/personas.md` - Persona definitions

---

_Framework derived from PostHog TAM consultation - January 23, 2026_
