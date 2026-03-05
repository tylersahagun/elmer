# Customer Export - Monthly User Activity Dashboard

**Created:** 2026-02-16  
**Status:** Ready for setup and export  
**PostHog Project:** 81505

---

## Recommendation

Use **Postgres as source of truth** for the CSV export request, and use PostHog as a visualization layer for chats/workflows/login proxy trends.

Why:

- The request needs user profile and licensing fields that are not fully present in PostHog.
- The app schema has first-class tables for chats, workflow runs, and recordings.
- Login counts are not fully modeled in Postgres (only first-login timestamp exists), so PostHog is the best proxy for repeated login/session behavior.

---

## Confirmed Data Availability

### Fully Available in Postgres

- User ID (`users.id`)
- Full Name (`users.first_name`, `users.last_name`)
- Email (`user_emails.email`)
- Team/Department (closest alternative: `user_groups` via `user_groups_users`)
- Account Status (closest alternative: `users.role` + `users.deleted_at`)
- Month (`YYYY-MM`)
- Number of Recordings Created (`engagements` with `recording_media_bucket_path IS NOT NULL`)
- Total Recording Duration Minutes (`engagements.duration_seconds`)
- Number of AI Chats Initiated (`chats`)
- Number of Workflow Runs Triggered (`workflow_runs`)

### Partially Available

- Number of Logins: only first login timestamp exists in DB (`auth_users.first_logged_in_at`), not full recurring login counts
- License Start Date: closest alternative is earliest `payment_subscriptions.created_at` for the workspace
- License Renewal Date: no explicit renewal date column in current schema; closest alternative is latest `payment_subscriptions.created_at`

---

## Postgres Export Query

Run this query (see companion SQL file):

- `pm-workspace-docs/status/posthog/monthly-user-activity-export.sql`

It outputs one row per **user x month** with:

- `user_id`
- `full_name`
- `email`
- `team_or_department`
- `account_status`
- `license_start_date` (workspace-level proxy)
- `license_renewal_date` (workspace-level proxy)
- `month` (`YYYY-MM`)
- `recordings_created`
- `total_recording_duration_minutes`
- `logins` (first-login-only proxy)
- `ai_chats_initiated`
- `workflow_runs_triggered`

---

## PostHog Dashboard Setup (Optional but useful)

Dashboard name:

- `Customer Export - Monthly User Activity`

Panels:

1. **AI Chats Initiated**
   - Event: `chat_created`
   - Interval: Month
   - Breakdown: Person
2. **Workflow Runs Triggered**
   - Event: `workflows:run_completed` (or `workflows:run_started` if preferred)
   - Interval: Month
   - Breakdown: Person
3. **Login Proxy**
   - Event: `$session_start` (preferred) or best available auth event in your project
   - Interval: Month
   - Breakdown: Person

Note:

- Use PostHog mainly for trend visibility; use Postgres export for customer-deliverable CSV accuracy.

---

## Customer-Facing Field Mapping Notes

When sharing results externally, include these caveats:

- **Team or Department** is mapped from internal user groups.
- **Account Status** is mapped from user role and soft-delete state (not billing status).
- **License dates** are workspace billing proxies from `payment_subscriptions`, not per-user seat lifecycle timestamps.
- **Logins** are currently approximate unless a dedicated recurring login event is implemented.
