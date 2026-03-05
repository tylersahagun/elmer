# PostHog Data Warehouse Inventory

**Generated:** 2026-01-24  
**Purpose:** Document available data sources for metrics analysis and revenue correlation

---

## Executive Summary

PostHog has robust data warehouse connections enabling revenue-to-usage correlation:

| Source             | Tables Available | Key Use Cases                                     |
| ------------------ | ---------------- | ------------------------------------------------- |
| **Stripe**         | 4 tables         | Revenue tracking, churn analysis, MRR calculation |
| **HubSpot**        | 2 tables         | Company enrichment, deal pipeline                 |
| **PostHog Groups** | 1 table          | Workspace-level aggregation                       |
| **PostHog Events** | Core tables      | Product usage, feature adoption                   |

**Key Capability:** Can join Stripe revenue data with PostHog usage data via `stripe_customer.metadata.workspaceId` → `groups.key`.

---

## Available Data Sources

### 1. Stripe (Revenue Data)

#### `stripe_charge`

| Field             | Type     | Description                      |
| ----------------- | -------- | -------------------------------- |
| `id`              | String   | Charge ID                        |
| `customer_id`     | String   | Stripe customer ID               |
| `amount`          | Integer  | Amount in cents                  |
| `status`          | String   | `succeeded`, `failed`, `pending` |
| `created_at`      | DateTime | When charge occurred             |
| `billing_details` | JSON     | Contains `email`                 |

**Example Use:** Gross revenue calculation

```sql
SELECT
    toStartOfMonth(created_at) as month,
    SUM(amount) / 100 as gross_revenue
FROM stripe_charge
WHERE status = 'succeeded'
GROUP BY month
```

#### `stripe_invoice`

| Field         | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `id`          | String   | Invoice ID             |
| `customer_id` | String   | Stripe customer ID     |
| `amount_paid` | Integer  | Amount paid in cents   |
| `status`      | String   | `paid`, `open`, `void` |
| `created_at`  | DateTime | Invoice date           |

**Example Use:** Monthly paid invoices

```sql
SELECT
    toStartOfMonth(created_at) as month,
    SUM(amount_paid) / 100 as mrr
FROM stripe_invoice
WHERE status = 'paid'
GROUP BY month
```

#### `stripe_subscription`

| Field                  | Type     | Description                                   |
| ---------------------- | -------- | --------------------------------------------- |
| `id`                   | String   | Subscription ID                               |
| `customer_id`          | String   | Stripe customer ID                            |
| `status`               | String   | `active`, `canceled`, etc.                    |
| `current_period_start` | DateTime | Current billing period start                  |
| `items`                | JSON     | Array of subscription items with plan details |

**Example Use:** Active subscription count

```sql
SELECT COUNT(DISTINCT customer_id)
FROM stripe_subscription
WHERE status = 'active'
```

#### `stripe_customer`

| Field        | Type     | Description                |
| ------------ | -------- | -------------------------- |
| `id`         | String   | Customer ID                |
| `email`      | String   | Customer email             |
| `metadata`   | JSON     | **Contains `workspaceId`** |
| `created_at` | DateTime | Customer creation date     |

**Critical:** `metadata.workspaceId` enables joining to PostHog groups!

---

### 2. HubSpot (CRM Data)

#### `hubspot_companies`

| Field           | Type   | Description        |
| --------------- | ------ | ------------------ |
| `id`            | String | HubSpot company ID |
| `name`          | String | Company name       |
| `total_revenue` | String | Revenue from deals |
| `industry`      | String | Company industry   |
| `domain`        | String | Company domain     |

**Example Use:** Top revenue companies

```sql
SELECT name, round(sum(toFloat(total_revenue)), 2) as revenue
FROM hubspot_companies
GROUP BY name
ORDER BY revenue DESC
LIMIT 20
```

#### `hubspot_contacts`

| Field                | Type    | Description       |
| -------------------- | ------- | ----------------- |
| `id`                 | String  | Contact ID        |
| `email`              | String  | Contact email     |
| `lifecyclestage`     | String  | Lead stage        |
| `recent_deal_amount` | Numeric | Recent deal value |

**Example Use:** Customer contacts

```sql
SELECT email, recent_deal_amount
FROM hubspot_contacts
WHERE lifecyclestage = 'customer'
```

---

### 3. PostHog Core Tables

#### `events`

| Field         | Type     | Description           |
| ------------- | -------- | --------------------- |
| `uuid`        | String   | Event UUID            |
| `event`       | String   | Event name            |
| `timestamp`   | DateTime | When event occurred   |
| `distinct_id` | String   | User identifier       |
| `properties`  | JSON     | Event properties      |
| `$group_0`    | String   | Group key (workspace) |

#### `persons`

| Field        | Type     | Description       |
| ------------ | -------- | ----------------- |
| `id`         | UUID     | Person UUID       |
| `properties` | JSON     | Person properties |
| `created_at` | DateTime | First seen        |

#### `groups`

| Field              | Type    | Description                     |
| ------------------ | ------- | ------------------------------- |
| `key`              | String  | Group identifier (workspaceId)  |
| `group_type_index` | Integer | Group type (0 = workspace)      |
| `properties`       | JSON    | Group properties (name, domain) |

**Example:** Get workspace name

```sql
SELECT
    key as workspace_id,
    properties.name as workspace_name,
    properties.primaryDomain as domain
FROM groups
WHERE group_type_index = 0
```

---

## Key Join Patterns

### Revenue to Workspace

Join Stripe data with PostHog groups via customer metadata:

```sql
WITH workspace_mapping AS (
    SELECT
        g.properties.name AS workspace_name,
        g.key AS workspace_id,
        sc.id AS stripe_customer_id
    FROM stripe_customer sc
    JOIN groups g ON sc.metadata.workspaceId = g.key
    WHERE g.group_type_index = 0
)
SELECT
    wm.workspace_name,
    SUM(si.amount_paid) / 100 AS total_revenue
FROM stripe_invoice si
JOIN workspace_mapping wm ON si.customer_id = wm.stripe_customer_id
WHERE si.status = 'paid'
GROUP BY wm.workspace_name
ORDER BY total_revenue DESC
```

### Usage to Revenue Correlation

Join product events with revenue data:

```sql
WITH workspace_revenue AS (
    SELECT
        sc.metadata.workspaceId as workspace_id,
        SUM(si.amount_paid) / 100 as mrr
    FROM stripe_invoice si
    JOIN stripe_customer sc ON si.customer_id = sc.id
    WHERE si.status = 'paid'
        AND si.created_at > now() - INTERVAL 30 DAY
    GROUP BY workspace_id
),
workspace_usage AS (
    SELECT
        $group_0 as workspace_id,
        countIf(event = 'workflows:run_completed') as workflow_runs,
        count(DISTINCT distinct_id) as active_users
    FROM events
    WHERE timestamp > now() - INTERVAL 30 DAY
    GROUP BY workspace_id
)
SELECT
    wu.workspace_id,
    g.properties.name as workspace_name,
    wu.workflow_runs,
    wu.active_users,
    wr.mrr
FROM workspace_usage wu
LEFT JOIN workspace_revenue wr ON wu.workspace_id = wr.workspace_id
LEFT JOIN groups g ON wu.workspace_id = g.key AND g.group_type_index = 0
ORDER BY wr.mrr DESC
```

---

## Existing Revenue Insights

These insights already exist in PostHog:

| Insight                         | ID       | Description                         |
| ------------------------------- | -------- | ----------------------------------- |
| Revenue churn                   | RNhJZ6dG | Churned subscription revenue        |
| Stripe Gross Revenue            | mznHkeax | Monthly charge totals               |
| Monthly recurring revenue (avg) | vd00aC0a | MRR by average revenue per customer |
| Monthly Stripe Gross Revenue    | frP8w7oG | Bold number view                    |
| Revenue growth rate             | rBg1HshU | 3-month rolling growth              |
| MRR (normalized)                | HKE8J5SE | Subscription-based MRR              |
| Top revenue companies           | cflHlnnt | HubSpot company revenue             |
| Revenue from closed deals       | MQFnvkJ6 | HubSpot + Stripe join               |
| Workspace revenue               | DoO9yZM6 | Revenue by workspace                |

**Dashboard:** Revenue Dashboard (ID: 237576)

---

## Validation Capabilities

### North Star Validation

Can correlate workflow activity with revenue:

```sql
-- Workspaces with 3+ workflow runs vs MRR
WITH workflow_tiers AS (
    SELECT
        $group_0 as workspace_id,
        countIf(event = 'workflows:run_completed') as runs,
        CASE
            WHEN countIf(event = 'workflows:run_completed') >= 3 THEN 'active'
            ELSE 'inactive'
        END as tier
    FROM events
    WHERE timestamp > now() - INTERVAL 7 DAY
        AND event = 'workflows:run_completed'
    GROUP BY workspace_id
)
SELECT
    tier,
    avg(mrr) as avg_mrr,
    count(*) as workspace_count
FROM workflow_tiers wt
LEFT JOIN (
    SELECT sc.metadata.workspaceId as workspace_id, SUM(si.amount_paid)/100 as mrr
    FROM stripe_invoice si
    JOIN stripe_customer sc ON si.customer_id = sc.id
    WHERE si.status = 'paid' AND si.created_at > now() - INTERVAL 30 DAY
    GROUP BY workspace_id
) rev ON wt.workspace_id = rev.workspace_id
GROUP BY tier
```

### Retention to Revenue

Can analyze retention by revenue tier:

```sql
-- High MRR vs Low MRR retention comparison
WITH revenue_tiers AS (
    SELECT
        sc.metadata.workspaceId as workspace_id,
        CASE
            WHEN SUM(si.amount_paid)/100 >= 500 THEN 'high_mrr'
            ELSE 'low_mrr'
        END as revenue_tier
    FROM stripe_invoice si
    JOIN stripe_customer sc ON si.customer_id = sc.id
    WHERE si.status = 'paid'
    GROUP BY workspace_id
)
-- Then join with retention analysis
```

---

## Data Quality Notes

### Known Issues

1. **Stripe metadata:** Not all customers have `workspaceId` in metadata
2. **HubSpot sync:** May have delay in deal updates
3. **Group properties:** Some workspaces missing enrichment data

### Recommended Validations

Before building metrics:

1. Verify Stripe customer → workspace mapping coverage
2. Check for duplicate workspaces in groups table
3. Validate date ranges in Stripe data

```sql
-- Check Stripe mapping coverage
SELECT
    COUNT(*) as total_customers,
    countIf(metadata.workspaceId IS NOT NULL) as with_workspace,
    countIf(metadata.workspaceId IS NULL) as missing_workspace
FROM stripe_customer
```

---

## Gaps & Limitations

### Data Not Available

| Data                     | Impact                            | Workaround                          |
| ------------------------ | --------------------------------- | ----------------------------------- |
| Seat count per workspace | Cannot calculate per-seat revenue | Estimate from user events           |
| Plan tier                | Cannot segment by plan            | Derive from MRR amount              |
| Trial status             | Cannot analyze trial conversion   | Use signup date + subscription date |
| Contract dates           | Cannot do cohort by contract      | Use first invoice date              |

### Join Limitations

| Join                    | Issue                          | Solution                       |
| ----------------------- | ------------------------------ | ------------------------------ |
| Events → Stripe         | Some events missing `$group_0` | Fix instrumentation            |
| HubSpot → Stripe        | Email matching unreliable      | Use workspace ID when possible |
| Mobile events → Revenue | No workspace context           | Priority instrumentation fix   |

---

## Recommended Dashboards to Create

### 1. Revenue-Usage Correlation Dashboard

- MRR by value ladder tier (Basic, CRM, Automation, Power)
- Workflow runs vs revenue scatter plot
- Feature adoption vs expansion revenue

### 2. Customer Health + Revenue Dashboard

- Health score distribution by revenue tier
- At-risk revenue (declining usage + high MRR)
- Expansion candidates (high usage + low MRR)

### 3. North Star Validation Dashboard

- North Star metric trend
- Revenue correlation coefficient
- Retention by North Star achievement

---

## Next Steps

1. **Validate join quality:** Run coverage queries for Stripe-workspace mapping
2. **Create North Star validation queries:** Test correlation hypotheses
3. **Build revenue cohorts:** Segment by MRR for analysis
4. **Document gaps:** Track what data is missing for key questions

---

_Generated as part of PostHog Metrics Discovery initiative_
