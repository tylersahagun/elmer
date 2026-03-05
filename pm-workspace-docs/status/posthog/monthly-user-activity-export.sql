-- Monthly per-user export for customer reporting.
-- Output: one row per user x month, CSV-ready.
--
-- PARAMETERS
--   :workspace_id   text      -- required
--   :start_month    date      -- optional, inclusive (example: '2025-01-01')
--   :end_month      date      -- optional, inclusive (example: '2025-12-01')
--
-- NOTES / CLOSEST ALTERNATIVES
-- 1) logins uses auth_users.first_logged_in_at only (first-login proxy, not recurring logins).
-- 2) license dates are workspace-level proxies from payment_subscriptions:
--      - license_start_date   = MIN(created_at)
--      - license_renewal_date = MAX(created_at)
-- 3) team_or_department is mapped from user_groups (users may belong to multiple groups).

WITH params AS (
  SELECT
    :workspace_id::text AS workspace_id,
    date_trunc('month', COALESCE(:start_month::date, (current_date - INTERVAL '11 months')::date))::date AS start_month,
    date_trunc('month', COALESCE(:end_month::date, current_date::date))::date AS end_month
),
months AS (
  SELECT
    generate_series(
      (SELECT start_month FROM params),
      (SELECT end_month FROM params),
      INTERVAL '1 month'
    )::date AS month_start
),
base_users AS (
  SELECT
    u.id,
    u.workspace_id,
    u.first_name,
    u.last_name,
    u.role,
    u.deleted_at
  FROM users u
  WHERE u.workspace_id = (SELECT workspace_id FROM params)
),
primary_email AS (
  SELECT
    x.user_id,
    x.email
  FROM (
    SELECT
      ue.user_id,
      ue.email,
      ROW_NUMBER() OVER (
        PARTITION BY ue.user_id
        ORDER BY ue.primary_updated_at DESC NULLS LAST, ue.created_at DESC
      ) AS rn
    FROM user_emails ue
    WHERE ue.deleted_at IS NULL
  ) x
  WHERE x.rn = 1
),
team_map AS (
  SELECT
    ugu.user_id,
    STRING_AGG(DISTINCT ug.name, '; ' ORDER BY ug.name) AS team_or_department
  FROM user_groups_users ugu
  JOIN user_groups ug
    ON ug.id = ugu.user_group_id
   AND ug.deleted_at IS NULL
  WHERE ugu.deleted_at IS NULL
  GROUP BY ugu.user_id
),
license_map AS (
  SELECT
    ps.workspace_id,
    MIN(ps.created_at)::date AS license_start_date,
    MAX(ps.created_at)::date AS license_renewal_date
  FROM payment_subscriptions ps
  WHERE ps.deleted_at IS NULL
  GROUP BY ps.workspace_id
),
recording_metrics AS (
  SELECT
    e.owner_user_id AS user_id,
    date_trunc('month', e.created_at)::date AS month_start,
    COUNT(*) AS recordings_created,
    ROUND(COALESCE(SUM(e.duration_seconds), 0) / 60.0, 2) AS total_recording_duration_minutes
  FROM engagements e
  WHERE e.workspace_id = (SELECT workspace_id FROM params)
    AND e.deleted_at IS NULL
    AND e.recording_media_bucket_path IS NOT NULL
    AND e.created_at >= (SELECT start_month FROM params)
    AND e.created_at < ((SELECT end_month FROM params) + INTERVAL '1 month')
  GROUP BY e.owner_user_id, date_trunc('month', e.created_at)::date
),
workflow_metrics AS (
  SELECT
    wr.viewer_user_id AS user_id,
    date_trunc('month', wr.created_at)::date AS month_start,
    COUNT(*) AS workflow_runs_triggered
  FROM workflow_runs wr
  JOIN users u
    ON u.id = wr.viewer_user_id
  WHERE u.workspace_id = (SELECT workspace_id FROM params)
    AND wr.status = 'COMPLETED'
    AND wr.created_at >= (SELECT start_month FROM params)
    AND wr.created_at < ((SELECT end_month FROM params) + INTERVAL '1 month')
  GROUP BY wr.viewer_user_id, date_trunc('month', wr.created_at)::date
),
chat_metrics AS (
  SELECT
    c.user_id,
    date_trunc('month', c.created_at)::date AS month_start,
    COUNT(*) AS ai_chats_initiated
  FROM chats c
  WHERE c.workspace_id = (SELECT workspace_id FROM params)
    AND c.deleted_at IS NULL
    AND c.user_id IS NOT NULL
    AND c.created_at >= (SELECT start_month FROM params)
    AND c.created_at < ((SELECT end_month FROM params) + INTERVAL '1 month')
  GROUP BY c.user_id, date_trunc('month', c.created_at)::date
),
login_metrics_first_only AS (
  SELECT
    auu.user_id,
    date_trunc('month', au.first_logged_in_at)::date AS month_start,
    COUNT(*) AS logins
  FROM auth_users au
  JOIN auth_users_users auu
    ON auu.auth_user_id = au.id
  JOIN users u
    ON u.id = auu.user_id
  WHERE u.workspace_id = (SELECT workspace_id FROM params)
    AND au.first_logged_in_at IS NOT NULL
    AND au.first_logged_in_at >= (SELECT start_month FROM params)
    AND au.first_logged_in_at < ((SELECT end_month FROM params) + INTERVAL '1 month')
  GROUP BY auu.user_id, date_trunc('month', au.first_logged_in_at)::date
)
SELECT
  bu.id AS user_id,
  NULLIF(TRIM(CONCAT(COALESCE(bu.first_name, ''), ' ', COALESCE(bu.last_name, ''))), '') AS full_name,
  pe.email AS email,
  tm.team_or_department AS team_or_department,
  CASE
    WHEN bu.deleted_at IS NOT NULL OR bu.role = 'INACTIVE' THEN 'Inactive'
    ELSE 'Active'
  END AS account_status,
  lm.license_start_date,
  lm.license_renewal_date,
  TO_CHAR(m.month_start, 'YYYY-MM') AS month,
  COALESCE(rm.recordings_created, 0) AS recordings_created,
  COALESCE(rm.total_recording_duration_minutes, 0) AS total_recording_duration_minutes,
  COALESCE(lmfo.logins, 0) AS logins,
  COALESCE(cm.ai_chats_initiated, 0) AS ai_chats_initiated,
  COALESCE(wm.workflow_runs_triggered, 0) AS workflow_runs_triggered
FROM base_users bu
CROSS JOIN months m
LEFT JOIN primary_email pe
  ON pe.user_id = bu.id
LEFT JOIN team_map tm
  ON tm.user_id = bu.id
LEFT JOIN license_map lm
  ON lm.workspace_id = bu.workspace_id
LEFT JOIN recording_metrics rm
  ON rm.user_id = bu.id
 AND rm.month_start = m.month_start
LEFT JOIN chat_metrics cm
  ON cm.user_id = bu.id
 AND cm.month_start = m.month_start
LEFT JOIN workflow_metrics wm
  ON wm.user_id = bu.id
 AND wm.month_start = m.month_start
LEFT JOIN login_metrics_first_only lmfo
  ON lmfo.user_id = bu.id
 AND lmfo.month_start = m.month_start
ORDER BY bu.id, m.month_start;
