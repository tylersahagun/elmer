# User & Workspace Lifecycle Audit

**Date:** February 6, 2026
**Author:** Tyler Sahagun
**Sources:** PostHog (Project 81505) + Postgres Production Database

---

## Executive Summary

This audit answers a critical operational question: **when users are added, activated, or have their roles changed in AskElephant — was it done by an AskElephant employee or by the customer's own team?**

By correlating PostHog event data (which tracks _who_ performed each action) with Postgres actor classification (which identifies AskElephant employees by `@askelephant.ai` email domain or `is_super_admin` status), we can now see the full picture of user lifecycle management across all workspaces.

### Key Finding

The overall split is **48% AskElephant-driven / 52% Customer-driven** — but the _types_ of actions differ significantly. AskElephant employees perform the majority of role promotions (especially OWNER assignments), while customers drive self-service team management via the UI.

---

## Methodology

### Data Sources

| Source                         | Purpose                                        | Key Tables/Events                                                                                                                      |
| ------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **PostHog** (Project 81505)    | Event tracking — who did what, when            | `users:create_user:created`, `users:create_user:role_changed`, `create_team_member:form_submit`, `users:create_user:seat_type_changed` |
| **Postgres** (`postgres-prod`) | Actor classification — AskElephant vs Customer | `users`, `auth_users`, `auth_users_users`, `workspaces`                                                                                |

### Actor Classification Logic

An actor is classified as **AskElephant Employee** if:

- Their `auth_email` ends with `@askelephant.ai`, OR
- Their `is_super_admin` flag is `true`

All other actors are classified as **Customer Team**.

### PostHog Event Mapping

| Event                                 | Meaning                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `users:create_user:created`           | A new user record was created in a workspace          |
| `users:create_user:role_changed`      | A user's role was changed (e.g., NOT_INVITED → OWNER) |
| `create_team_member:form_submit`      | Someone used the "Add Team Member" form in the UI     |
| `users:create_user:seat_type_changed` | A user's seat type was modified (billing-related)     |
| `onboarding:flow_completed`           | A user completed the self-service onboarding flow     |

### Key Technical Details

- **`distinct_id`** in PostHog maps to **`users.id`** in Postgres (the actor who performed the action)
- **`$group_1`** in PostHog event properties contains the **`workspace_id`**
- **`team_member_id`** in event properties identifies the **affected user** (the person being added/changed)
- **`role`** in event properties captures the **new role** being assigned

---

## Overall Summary

### Total User Lifecycle Events by Actor Type

| Actor Type      | Total Events | Users Created | Role Changes | Form Submits | Seat Changes |
| --------------- | ------------ | ------------- | ------------ | ------------ | ------------ |
| **AskElephant** | 1,479        | 538           | 306          | 626          | 9            |
| **Customer**    | 1,570        | 480           | 86           | 736          | 268          |
| **Combined**    | **3,049**    | **1,018**     | **392**      | **1,362**    | **277**      |

### Interpretation

- **User Creations** — AskElephant creates slightly more user records (53% vs 47%), reflecting onboarding and deployment workflows
- **Role Changes** — AskElephant dominates (78% vs 22%), as employees activate accounts and assign OWNER/MANAGER roles during setup
- **Form Submits** — Customers lead (54% vs 46%), indicating healthy self-service adoption of the "Add Team Member" UI
- **Seat Type Changes** — Almost entirely customer-driven (97%), as workspace managers adjust billing and seat allocations

---

## Role Change Analysis

When roles are changed, here's what each actor type is assigning:

### Role Changes by Actor Type

| Actor Type      | Role → OWNER | Role → MANAGER | Total   |
| --------------- | ------------ | -------------- | ------- |
| **AskElephant** | 234 (76%)    | 72 (24%)       | 306     |
| **Customer**    | 41 (48%)     | 45 (52%)       | 86      |
| **Combined**    | **275**      | **117**        | **392** |

### Key Insight

AskElephant employees are responsible for **85% of all OWNER role assignments** (234 out of 275). This aligns with the onboarding model where AE employees set up workspace owners during initial customer deployment.

Customer-initiated role changes are more balanced between OWNER and MANAGER, suggesting customers promote existing users as their team grows.

---

## Per-Workspace Breakdown

### Top Workspaces by Activity

| Workspace                       | Domain                  | Active Users | Created    | AE Events | Customer Events | % Customer-Driven |
| ------------------------------- | ----------------------- | ------------ | ---------- | --------- | --------------- | ----------------- |
| ELB Learning                    | elblearning.com         | 182          | 2025-03-07 | 166       | 195             | 54%               |
| Redo                            | getredo.com             | 175          | 2025-03-31 | 154       | 101             | 40%               |
| Intelligent Technical Solutions | itsasap.com             | 148          | 2025-03-12 | 135       | 106             | 44%               |
| Propeller Aero                  | propelleraero.com       | 122          | 2025-03-12 | 78        | 87              | 53%               |
| Pest Share                      | pestshare.com           | 80           | 2025-04-01 | 47        | 126             | 73%               |
| Teikametrics                    | teikametrics.com        | 59           | 2025-06-30 | 38        | 49              | 56%               |
| AskElephant, Inc.               | askelephant.ai          | 52           | 2025-02-24 | 114       | 34              | 23%               |
| KlientBoost                     | klientboost.com         | 39           | 2025-04-07 | 42        | 8               | 16%               |
| Set2Close                       | set2close.io            | 39           | 2025-04-29 | 20        | 57              | 74%               |
| On The Fuze                     | onthefuze.com           | 36           | 2025-05-01 | 32        | 43              | 57%               |
| 401GO                           | 401go.com               | 33           | 2025-05-28 | 3         | 64              | 96%               |
| Solution Reach                  | solutionreach.com       | 32           | 2025-05-20 | 12        | 43              | 78%               |
| Tilt                            | ourtilt.com             | 31           | 2025-06-17 | 15        | 46              | 75%               |
| Sequifi                         | sequifi.com             | 26           | 2025-04-14 | 22        | 28              | 56%               |
| Protocol80                      | protocol80.com          | 23           | 2025-06-03 | 3         | 45              | 94%               |
| Chili Publish                   | chili-publish.com       | 21           | 2026-01-29 | 16        | 30              | 65%               |
| Design Ergonomics               | desergo.com             | 21           | 2025-06-23 | 10        | 31              | 76%               |
| Enzo Health                     | enzo.health             | 18           | 2026-01-23 | 7         | 24              | 77%               |
| Snapshot Interactive            | snapshotinteractive.com | 16           | 2026-01-31 | 10        | 29              | 74%               |
| Tava Health                     | tavahealth.com          | 13           | 2025-09-30 | 5         | 14              | 74%               |
| PerryWeather                    | perryweather.com        | 13           | 2025-09-15 | 3         | 16              | 84%               |

### Customer Self-Service Spectrum

Workspaces fall into three categories based on what percentage of user lifecycle events are customer-driven:

#### 🟢 High Self-Service (>70% customer-driven)

These customers are independently managing their own teams.

| Workspace            | % Customer | Implication           |
| -------------------- | ---------- | --------------------- |
| 401GO                | 96%        | Fully self-sufficient |
| Protocol80           | 94%        | Fully self-sufficient |
| PerryWeather         | 84%        | High independence     |
| Solution Reach       | 78%        | High independence     |
| Enzo Health          | 77%        | High independence     |
| Design Ergonomics    | 76%        | High independence     |
| Tilt                 | 75%        | High independence     |
| Set2Close            | 74%        | High independence     |
| Snapshot Interactive | 74%        | High independence     |
| Tava Health          | 74%        | High independence     |
| Pest Share           | 73%        | High independence     |

#### 🟡 Balanced (40–70% customer-driven)

Mix of AE-assisted setup and customer self-management.

| Workspace                       | % Customer | Implication          |
| ------------------------------- | ---------- | -------------------- |
| Chili Publish                   | 65%        | Growing independence |
| On The Fuze                     | 57%        | Balanced             |
| Teikametrics                    | 56%        | Balanced             |
| Sequifi                         | 56%        | Balanced             |
| ELB Learning                    | 54%        | Balanced             |
| Propeller Aero                  | 53%        | Balanced             |
| Intelligent Technical Solutions | 44%        | More AE-assisted     |
| Redo                            | 40%        | More AE-assisted     |

#### 🔴 AE-Assisted (>60% AskElephant-driven)

These workspaces rely heavily on AskElephant for user management.

| Workspace         | % Customer | Implication                   |
| ----------------- | ---------- | ----------------------------- |
| AskElephant, Inc. | 23%        | Internal workspace (expected) |
| KlientBoost       | 16%        | Heavy AE management           |

---

## Workspace Onboarding Tracking

PostHog tracks the self-service onboarding flow via these events:

| Event                       | Count | Description                             |
| --------------------------- | ----- | --------------------------------------- |
| `onboarding:step_viewed`    | 455   | User viewed an onboarding step          |
| `onboarding:next_clicked`   | 281   | User clicked "Next" in onboarding       |
| `onboarding:flow_completed` | 51    | User completed the full onboarding flow |
| `onboarding:skipped_step`   | 14    | User skipped an onboarding step         |
| `onboarding:back_clicked`   | 13    | User went back in onboarding            |

The `onboarding:flow_completed` event captures:

- **`$group_1`** — the workspace ID
- **`distinct_id`** — the user who completed onboarding (actor)
- **`role`** — the role assigned upon completion (typically OWNER for workspace creators, USER for invitees)

This serves as the closest proxy for **workspace creation events** — the first `onboarding:flow_completed` event for a workspace represents its initial setup.

---

## Identified AskElephant Employees (Top Actors)

These are the AskElephant team members identified as performing user lifecycle events:

| User ID                          | Email                  | Role  | Workspace         |
| -------------------------------- | ---------------------- | ----- | ----------------- |
| `usr_01JNEYHNPRRGPHZTCCQEC2EYFT` | benn@askelephant.ai    | OWNER | AskElephant, Inc. |
| `usr_01JNEYHNPTJXAV0W61TFFQ617G` | brian@askelephant.ai   | OWNER | AskElephant, Inc. |
| `usr_01JNEYHNPV5AVS4N4JGZ22E6BF` | bryn@askelephant.ai    | OWNER | AskElephant, Inc. |
| `usr_01JNEYHNPVQDGHWZ3XDZF88X8M` | dallin@askelephant.ai  | OWNER | AskElephant, Inc. |
| `usr_01JT1Y72TAGFPC1JK0S8PR1H9V` | derek@askelephant.ai   | OWNER | AskElephant, Inc. |
| `usr_01JNRRQWQMSVF8NW12SFPRHZ8E` | ian@askelephant.ai     | OWNER | AskElephant, Inc. |
| `usr_01JY4XKXYYNYV5H30VVST7G624` | kirsten@askelephant.ai | OWNER | AskElephant, Inc. |
| `usr_01JYFBYFF3SQWGEVDH6GWFQZ3D` | kylie@askelephant.ai   | USER  | AskElephant, Inc. |
| `usr_01K1SMTA1GZXDJV2X9VABA6KEE` | lainey@askelephant.ai  | USER  | AskElephant, Inc. |
| `usr_01JYHVR64YKXTGFPKHWBDXGBKD` | mason@askelephant.ai   | OWNER | AskElephant, Inc. |
| `usr_01K45K40TFQN2KHRAW5HHJTF7H` | mckenna@askelephant.ai | USER  | AskElephant, Inc. |
| `usr_01K45M3WC7J37ST1N15E0ZEJQF` | mckenna@askelephant.ai | USER  | Pest Share        |
| `usr_01K726AHR5N6EZBWC6899YH26D` | sam@askelephant.ai     | OWNER | AskElephant, Inc. |
| `usr_01KE7EY8SNSKT1755NZWK2XKS3` | skylar@askelephant.ai  | OWNER | AskElephant, Inc. |
| `usr_01KAMCNY0R2YBKZHZ3FQHWE02Z` | tyler@askelephant.ai   | OWNER | AskElephant, Inc. |

_Note: Some AskElephant employees have user records in customer workspaces (e.g., mckenna@askelephant.ai in Pest Share) — this is how they perform user management actions within those workspaces._

---

## Tracking Gaps

The following lifecycle events are **NOT currently tracked** in PostHog:

### ❌ Workspace Deactivation

- No explicit `workspace:deactivated` or `workspace:deleted` event exists
- The `workspaces` table in Postgres doesn't have a `status` column
- Workspace deactivation would need to be inferred from other signals (e.g., all users set to INACTIVE)

### ❌ User Removal / Deactivation

- No `users:create_user:role_changed` events exist with role → `INACTIVE` or `NOT_INVITED`
- No `users:removed`, `users:deactivated`, or similar events exist
- Role demotions are completely invisible in PostHog
- The only way to detect user removal is by querying Postgres for users currently in `INACTIVE` or `NOT_INVITED` status

### ❌ Explicit Workspace Creation

- No `workspace:created` event exists
- The closest proxy is `onboarding:flow_completed` for self-service workspaces
- AE-created workspaces (via admin tools) have no corresponding PostHog event

---

## Recommendations

### Instrumentation Improvements

To achieve complete user lifecycle visibility, the following PostHog events should be added:

| Proposed Event                | Properties                                                                       | Purpose                                   |
| ----------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| `workspace:created`           | `workspace_id`, `actor_id`, `creation_method` (self-service / ae-assisted / api) | Track workspace creation with attribution |
| `workspace:deactivated`       | `workspace_id`, `actor_id`, `reason`, `active_users_at_deactivation`             | Track workspace churn with context        |
| `users:role_changed:demotion` | `workspace_id`, `actor_id`, `team_member_id`, `old_role`, `new_role`             | Track user deactivation / removal         |
| `users:removed`               | `workspace_id`, `actor_id`, `team_member_id`, `removal_reason`                   | Explicit user removal tracking            |

### Operational Insights

1. **KlientBoost** (16% customer-driven) may need CSM attention to encourage self-service adoption
2. **401GO** and **Protocol80** (>94% customer-driven) are model self-service accounts — study their onboarding patterns
3. The high volume of AE-driven OWNER assignments (234) suggests the onboarding flow may not adequately support customer self-service workspace creation
4. Seat type changes being 97% customer-driven is a positive signal for billing self-service

---

## Appendix: Query Reference

### PostHog — Event Counts by Actor Type

```sql
SELECT
  CASE WHEN distinct_id IN (
    'usr_01JNEYHNPV5AVS4N4JGZ22E6BF', 'usr_01JY4XKXYYNYV5H30VVST7G624',
    'usr_01K726AHR5N6EZBWC6899YH26D', 'usr_01JNEYHNPVQDGHWZ3XDZF88X8M',
    'usr_01JT1Y72TAGFPC1JK0S8PR1H9V', 'usr_01JNRRQWQMSVF8NW12SFPRHZ8E',
    'usr_01JNEYHNPRRGPHZTCCQEC2EYFT', 'usr_01JNEYHNPTJXAV0W61TFFQ617G',
    'usr_01KE7EY8SNSKT1755NZWK2XKS3', 'usr_01KAMCNY0R2YBKZHZ3FQHWE02Z',
    'usr_01KAWBE2ZDQVFYE1CBXR8HVE2Q', 'usr_01JYHVR64YKXTGFPKHWBDXGBKD',
    'usr_01K1SMTA1GZXDJV2X9VABA6KEE', 'usr_01JYFBYFF3SQWGEVDH6GWFQZ3D',
    'usr_01K45K40TFQN2KHRAW5HHJTF7H', 'usr_01K45M3WC7J37ST1N15E0ZEJQF'
  ) THEN 'AskElephant' ELSE 'Customer' END as actor_type,
  count(*) as total_events,
  countIf(event = 'users:create_user:created') as users_created,
  countIf(event = 'users:create_user:role_changed') as role_changes,
  countIf(event = 'create_team_member:form_submit') as form_submits,
  countIf(event = 'users:create_user:seat_type_changed') as seat_changes
FROM events
WHERE event IN (
  'users:create_user:created',
  'users:create_user:role_changed',
  'users:create_user:seat_type_changed',
  'create_team_member:form_submit'
)
GROUP BY actor_type
ORDER BY actor_type
```

### PostHog — Per-Workspace Breakdown

```sql
SELECT
  JSONExtractString(properties, '$group_1') as workspace_id,
  CASE WHEN distinct_id IN (/* AE employee IDs */)
    THEN 'AskElephant' ELSE 'Customer'
  END as actor_type,
  count(*) as total_events,
  countIf(event = 'users:create_user:created') as users_created,
  countIf(event = 'users:create_user:role_changed') as role_changes,
  countIf(event = 'create_team_member:form_submit') as form_submits
FROM events
WHERE event IN (
  'users:create_user:created',
  'users:create_user:role_changed',
  'create_team_member:form_submit'
)
GROUP BY workspace_id, actor_type
HAVING workspace_id != ''
ORDER BY total_events DESC
LIMIT 100
```

### Postgres — Actor Classification

```sql
SELECT
  u.id as user_id,
  u.workspace_id,
  w.name as workspace_name,
  w.primary_domain,
  u.role,
  au.auth_email,
  au.is_super_admin,
  CASE
    WHEN au.auth_email ILIKE '%@askelephant.ai' THEN 'AskElephant Employee'
    WHEN au.is_super_admin = true THEN 'AskElephant Super Admin'
    ELSE 'Customer Team'
  END as actor_type
FROM users u
JOIN auth_users_users auu ON auu.user_id = u.id
JOIN auth_users au ON au.id = auu.auth_user_id
LEFT JOIN workspaces w ON w.id = u.workspace_id
WHERE u.id IN (/* PostHog distinct_id values */)
ORDER BY
  CASE WHEN au.auth_email ILIKE '%@askelephant.ai' THEN 0 ELSE 1 END,
  au.auth_email
```

### Postgres — Workspace Details

```sql
SELECT
  w.id as workspace_id,
  w.name as workspace_name,
  w.primary_domain,
  (SELECT COUNT(*) FROM users u
   WHERE u.workspace_id = w.id
   AND u.role NOT IN ('NOT_INVITED', 'INACTIVE')) as active_users,
  w.created_at
FROM workspaces w
WHERE w.id IN (/* workspace IDs from PostHog */)
ORDER BY w.name
```
