#!/usr/bin/env python3
"""
AskElephant Usage Report Generator
===================================
Generates a Gong-style per-user activity report for any customer account,
pulling data from PostHog Production (project 81505).

Usage:
  python generate-usage-report.py --company "Motivosity"
  python generate-usage-report.py --group-key "id:wrks_01JNKS4WZPFTCZ2QF8E74C474G"
  python generate-usage-report.py --company "Acme" --format csv
  python generate-usage-report.py --company "Acme" --format html
  python generate-usage-report.py --company "Acme" --format both  (default)

Environment:
  POSTHOG_API_KEY  — your PostHog personal API key (starts with phx_)

Output files are saved to:
  pm-workspace-docs/status/<company-slug>-usage-report.csv
  pm-workspace-docs/status/<company-slug>-usage-report.html

Columns (v2):
  - Monthly meetings avg  (total meetings ÷ months active)
  - Automated meetings     (workflows:run_completed)
  - Manual/pipeline meetings (pipelines:run_completed)
  - AI Interactions        (conversation:message_sent + chat_created combined)
  - 30-day activity trend  (weekly sparkline in HTML)
"""

import argparse
import csv
import json
import math
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    print("Missing dependency: pip install requests")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────

POSTHOG_BASE     = "https://us.posthog.com"
PROJECT_ID       = "81505"
GROUP_TYPE_INDEX = 0   # org-level groups (workspace / company)

OUTPUT_DIR = Path(__file__).parent.parent / "status"


# ── PostHog API helpers ──────────────────────────────────────────────────────

class PostHogClient:
    def __init__(self, api_key: str):
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })

    def get(self, path: str, **params) -> dict:
        r = self.session.get(f"{POSTHOG_BASE}{path}", params=params)
        r.raise_for_status()
        return r.json()

    def post(self, path: str, body: dict) -> dict:
        r = self.session.post(f"{POSTHOG_BASE}{path}", json=body)
        r.raise_for_status()
        return r.json()

    def hogql(self, query: str, retry: int = 3) -> dict:
        for attempt in range(retry):
            try:
                return self.post(
                    f"/api/projects/{PROJECT_ID}/query/",
                    {"query": {"kind": "HogQLQuery", "query": query}},
                )
            except requests.HTTPError:
                if attempt < retry - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise

    def find_groups(self, company_name: str) -> list[dict]:
        resp = self.get(
            f"/api/projects/{PROJECT_ID}/groups/",
            group_type_index=GROUP_TYPE_INDEX,
            search=company_name,
        )
        return resp.get("results", [])

    def find_groups_by_key(self, group_key: str) -> list[dict]:
        resp = self.get(
            f"/api/projects/{PROJECT_ID}/groups/",
            group_type_index=GROUP_TYPE_INDEX,
            search=group_key,
        )
        return [g for g in resp.get("results", []) if g["group_key"] == group_key]


# ── Query 1: All-time per-user activity ──────────────────────────────────────

ACTIVITY_QUERY = """
SELECT
    person.properties.email           AS email,
    person.properties.name            AS name,
    person.properties.workspaceName   AS workspace,
    person.properties.is_manager      AS is_manager,
    min(timestamp)                    AS first_active,
    max(timestamp)                    AS last_active,
    count(DISTINCT toDate(timestamp)) AS days_active,

    -- Meetings: automated (workflow engine) vs manual/pipeline
    countIf(event = 'workflows:run_completed')   AS meetings_automated,
    countIf(event = 'pipelines:run_completed')   AS meetings_manual,

    -- Artifact engagement
    countIf(event IN ('pipelines:artifact_viewed',       'workflows:artifact_viewed'))        AS artifacts_viewed,
    countIf(event IN ('pipelines:artifact_interacted_with','workflows:artifact_interacted_with')) AS artifacts_interacted,

    -- AI interactions: conversation messages + chat sessions combined
    countIf(event = 'conversation:message_sent') + countIf(event = 'chat_created') AS ai_interactions,

    -- Recording
    countIf(event = 'recall:bot_done')           AS bot_recordings,
    countIf(event = 'conversation_created')      AS conversations_created,
    countIf(event = '$pageview')                 AS pageviews

FROM events
WHERE
    $group_0 IN ({group_keys})
    AND person.properties.email IS NOT NULL
GROUP BY email, name, workspace, is_manager
ORDER BY days_active DESC
LIMIT 500
"""

# ── Query 2: 30-day trend — weekly event buckets per user ────────────────────

TREND_QUERY = """
SELECT
    person.properties.email    AS email,
    toStartOfWeek(timestamp)   AS week_start,
    count()                    AS events
FROM events
WHERE
    $group_0 IN ({group_keys})
    AND person.properties.email IS NOT NULL
    AND timestamp >= now() - INTERVAL 30 DAY
    AND event NOT IN ('$feature_flag_called', '$web_vitals', '$pageleave', '$set')
GROUP BY email, week_start
ORDER BY email ASC, week_start ASC
"""


def build_queries(group_keys: list[str]) -> tuple[str, str]:
    quoted = ", ".join(f"'{k}'" for k in group_keys)
    return (
        ACTIVITY_QUERY.format(group_keys=quoted),
        TREND_QUERY.format(group_keys=quoted),
    )


# ── Data processing ───────────────────────────────────────────────────────────

THIRTY_DAYS_AGO = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")


def parse_date(ts: str) -> str:
    return ts[:10] if ts else ""


def months_between(first: str, last: str) -> float:
    """Approximate months between two YYYY-MM-DD strings (min 1)."""
    if not first or not last:
        return 1.0
    try:
        d0 = datetime.strptime(first[:10], "%Y-%m-%d")
        d1 = datetime.strptime(last[:10], "%Y-%m-%d")
        months = (d1.year - d0.year) * 12 + (d1.month - d0.month) + 1
        return max(1.0, float(months))
    except ValueError:
        return 1.0


def utilized(last_active: str) -> str:
    return "Yes" if last_active and last_active >= THIRTY_DAYS_AGO else "No"


def results_to_rows(results: list, columns: list) -> list[dict]:
    col_map = {c: i for i, c in enumerate(columns)}
    rows = []
    for r in results:
        row = {c: r[col_map[c]] for c in col_map}
        for f in ["days_active", "meetings_automated", "meetings_manual",
                  "artifacts_viewed", "artifacts_interacted", "ai_interactions",
                  "bot_recordings", "conversations_created", "pageviews"]:
            row[f] = int(row.get(f) or 0)
        row["first_active"] = parse_date(str(row.get("first_active") or ""))
        row["last_active"]  = parse_date(str(row.get("last_active")  or ""))
        # Derived fields
        row["meetings_total"] = row["meetings_automated"] + row["meetings_manual"]
        row["avg_meetings_per_month"] = round(
            row["meetings_total"] / months_between(row["first_active"], row["last_active"]), 1
        )
        rows.append(row)
    return rows


def dedup_users(rows: list[dict]) -> list[dict]:
    """Per email: keep highest days_active; take max last_active across duplicates."""
    best: dict[str, dict] = {}
    latest: dict[str, str] = {}
    for row in rows:
        email = row.get("email") or ""
        if not email:
            continue
        latest[email] = max(latest.get(email, ""), row["last_active"])
        if email not in best or row["days_active"] > best[email]["days_active"]:
            best[email] = row
    for email, row in best.items():
        row["last_active"] = latest[email]
    return sorted(best.values(), key=lambda r: r["days_active"], reverse=True)


def build_trend_map(results: list, columns: list) -> dict[str, list[int]]:
    """
    Returns {email: [w0_events, w1_events, w2_events, w3_events, w4_events]}
    covering the 5 most recent Sunday-aligned weeks (oldest → newest).
    """
    col_map = {c: i for i, c in enumerate(columns)}
    # Bucket by email → week_start → count
    raw: dict[str, dict[str, int]] = defaultdict(dict)
    for r in results:
        email      = r[col_map["email"]] or ""
        week_start = str(r[col_map["week_start"]])[:10]
        events     = int(r[col_map["events"]] or 0)
        if email:
            raw[email][week_start] = raw[email].get(week_start, 0) + events

    # Build a fixed 5-slot array aligned to the 5 most recent weeks
    today = datetime.now(timezone.utc).date()
    # Sunday of each of the last 5 weeks
    current_sunday = today - timedelta(days=today.weekday() + 1)  # last Sunday
    weeks = [(current_sunday - timedelta(weeks=i)).isoformat() for i in range(4, -1, -1)]

    trend_map: dict[str, list[int]] = {}
    for email, week_dict in raw.items():
        trend_map[email] = [week_dict.get(w, 0) for w in weeks]
    return trend_map


# ── CSV export ────────────────────────────────────────────────────────────────

CSV_HEADERS = [
    "User Name",
    "User Email Address",
    "Home Workspace",
    "Is Manager",
    "Has Paid Seat",
    "Utilized Seat",
    "First Active",
    "Last Active in AskElephant",
    "# of Days Active",
    "Avg Meetings / Month",
    "# of Meetings Total",
    "# of Automated Meetings (Workflows)",
    "# of Manual/Pipeline Meetings",
    "# of Bot Recordings",
    "# of Artifacts Viewed",
    "# of Artifacts Interacted With",
    "# of AI Interactions (Chat + Messages)",
    "# of Conversations Created",
    "# of Page Views",
]


def export_csv(users: list[dict], output_path: Path):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for u in users:
            writer.writerow({
                "User Name":                              u.get("name") or "",
                "User Email Address":                     u.get("email") or "",
                "Home Workspace":                         u.get("workspace") or "",
                "Is Manager":                             u.get("is_manager") or "Unknown",
                "Has Paid Seat":                          "Unknown",
                "Utilized Seat":                          utilized(u["last_active"]),
                "First Active":                           u["first_active"],
                "Last Active in AskElephant":             u["last_active"],
                "# of Days Active":                       u["days_active"],
                "Avg Meetings / Month":                   u["avg_meetings_per_month"],
                "# of Meetings Total":                    u["meetings_total"],
                "# of Automated Meetings (Workflows)":   u["meetings_automated"],
                "# of Manual/Pipeline Meetings":         u["meetings_manual"],
                "# of Bot Recordings":                    u["bot_recordings"],
                "# of Artifacts Viewed":                  u["artifacts_viewed"],
                "# of Artifacts Interacted With":         u["artifacts_interacted"],
                "# of AI Interactions (Chat + Messages)": u["ai_interactions"],
                "# of Conversations Created":             u["conversations_created"],
                "# of Page Views":                        u["pageviews"],
            })
    print(f"  ✓ CSV  → {output_path}")


# ── HTML export ───────────────────────────────────────────────────────────────

def export_html(
    users: list[dict],
    company_name: str,
    output_path: Path,
    group_keys: list[str],
    trend_map: dict[str, list[int]],
):
    active_count   = sum(1 for u in users if utilized(u["last_active"]) == "Yes")
    total_meetings = sum(u["meetings_total"] for u in users)
    total_bot_rec  = sum(u["bot_recordings"] for u in users)
    total_ai       = sum(u["ai_interactions"] for u in users)
    avg_meetings   = round(sum(u["avg_meetings_per_month"] for u in users) / max(1, len(users)), 1)
    max_meetings   = max((u["meetings_total"] for u in users), default=1)
    max_days       = max((u["days_active"] for u in users), default=1)
    most_active    = users[0] if users else None
    today_str      = datetime.now().strftime("%B %d, %Y")

    # Attach trend data to each user dict for JSON embed
    for u in users:
        u["trend"] = trend_map.get(u.get("email") or "", [0, 0, 0, 0, 0])

    json_data = json.dumps(users, default=str)

    most_active_html = ""
    if most_active:
        most_active_html = (
            f'<div class="stat-card">'
            f'<div class="label">Top User</div>'
            f'<div class="value" style="font-size:15px;padding-top:4px">{most_active.get("name","")}</div>'
            f'<div class="sub">{most_active["avg_meetings_per_month"]:g} mtgs/mo · {most_active["days_active"]} days</div>'
            f'</div>'
        )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{company_name} — AskElephant Usage Report</title>
<style>
  :root {{
    --bg:#0f1117; --surface:#1a1d27; --surface2:#22263a; --border:#2d3250;
    --accent:#6366f1; --accent2:#8b5cf6; --green:#22c55e; --amber:#f59e0b;
    --rose:#f43f5e; --sky:#38bdf8; --text:#e2e8f0; --muted:#64748b;
    --card-shadow:0 4px 24px rgba(0,0,0,.4);
  }}
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }}
  header {{ background:linear-gradient(135deg,#1a1d27,#161929); border-bottom:1px solid var(--border); padding:20px 32px; display:flex; align-items:center; justify-content:space-between; }}
  .header-left {{ display:flex; align-items:center; gap:16px; }}
  .logo {{ width:36px; height:36px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }}
  header h1 {{ font-size:20px; font-weight:700; letter-spacing:-.3px; }}
  header p {{ font-size:13px; color:var(--muted); margin-top:2px; }}
  .header-actions {{ display:flex; gap:10px; align-items:center; }}
  .badge {{ display:inline-flex; align-items:center; gap:6px; background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.3); color:#a5b4fc; border-radius:20px; padding:4px 12px; font-size:12px; font-weight:500; }}
  .btn {{ background:rgba(99,102,241,.2); border:1px solid rgba(99,102,241,.4); color:#a5b4fc; border-radius:8px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; transition:background .15s; }}
  .btn:hover {{ background:rgba(99,102,241,.35); }}
  .main {{ padding:28px 32px; }}
  .stats-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:28px; }}
  .stat-card {{ background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 20px; box-shadow:var(--card-shadow); }}
  .stat-card .label {{ font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }}
  .stat-card .value {{ font-size:26px; font-weight:700; letter-spacing:-.5px; }}
  .stat-card .sub {{ font-size:12px; color:var(--muted); margin-top:4px; }}
  .controls {{ display:flex; gap:12px; align-items:center; margin-bottom:20px; flex-wrap:wrap; }}
  .search-input {{ background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:8px 14px; color:var(--text); font-size:13px; width:240px; }}
  .search-input:focus {{ outline:none; border-color:var(--accent); }}
  .search-input::placeholder {{ color:var(--muted); }}
  select.fsel {{ background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:8px 14px; color:var(--text); font-size:13px; cursor:pointer; }}
  .table-container {{ background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:auto; box-shadow:var(--card-shadow); }}
  table {{ width:100%; border-collapse:collapse; font-size:13px; }}
  thead {{ background:var(--surface2); border-bottom:1px solid var(--border); }}
  th {{ padding:12px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); white-space:nowrap; cursor:pointer; user-select:none; }}
  th:hover {{ color:var(--text); }}
  th.sorted {{ color:var(--accent); }}
  td {{ padding:10px 14px; border-bottom:1px solid rgba(45,50,80,.5); white-space:nowrap; }}
  tr:last-child td {{ border-bottom:none; }}
  tr:hover td {{ background:rgba(99,102,241,.05); }}
  .user-cell {{ display:flex; align-items:center; gap:10px; }}
  .avatar {{ width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#fff; flex-shrink:0; }}
  .user-name {{ font-weight:500; }}
  .user-email {{ font-size:11px; color:var(--muted); margin-top:1px; }}
  .pill {{ display:inline-flex; align-items:center; gap:4px; border-radius:20px; padding:3px 9px; font-size:11px; font-weight:500; }}
  .pill-green {{ background:rgba(34,197,94,.15); color:var(--green); border:1px solid rgba(34,197,94,.25); }}
  .pill-rose {{ background:rgba(244,63,94,.15); color:var(--rose); border:1px solid rgba(244,63,94,.25); }}
  .pill-muted {{ background:rgba(100,116,139,.15); color:var(--muted); border:1px solid rgba(100,116,139,.25); }}
  .num {{ text-align:right; font-variant-numeric:tabular-nums; }}
  .bar-wrap {{ display:flex; align-items:center; gap:8px; }}
  .bar {{ height:4px; background:var(--border); border-radius:2px; flex:1; min-width:40px; }}
  .bar-fill {{ height:100%; border-radius:2px; background:linear-gradient(90deg,var(--accent),var(--accent2)); }}
  .avg-cell {{ display:flex; flex-direction:column; align-items:flex-end; gap:2px; }}
  .avg-main {{ font-weight:600; font-variant-numeric:tabular-nums; }}
  .avg-sub {{ font-size:10px; color:var(--muted); }}
  /* Sparkline */
  .sparkline-cell {{ min-width:90px; }}
  .sparkline {{ display:block; }}
  .spark-zero {{ color:var(--muted); font-size:11px; }}
  .note {{ background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.2); border-radius:10px; padding:14px 18px; margin-bottom:20px; font-size:13px; color:var(--muted); }}
  .note strong {{ color:var(--text); }}
  .footer {{ margin-top:16px; display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--muted); padding:0 4px; }}
  .split-cell {{ display:flex; flex-direction:column; align-items:flex-end; gap:1px; }}
  .split-main {{ font-variant-numeric:tabular-nums; }}
  .split-sub {{ font-size:10px; color:var(--muted); }}
</style>
</head>
<body>
<header>
  <div class="header-left">
    <div class="logo">🐘</div>
    <div>
      <h1>{company_name} — AskElephant Usage Report</h1>
      <p>PostHog Production · Generated {today_str} · {len(users)} identified users</p>
    </div>
  </div>
  <div class="header-actions">
    <span class="badge">⚡ Live Data</span>
    <button class="btn" onclick="exportCSV()">⬇ Export CSV</button>
  </div>
</header>

<div class="main">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="label">Total Users</div>
      <div class="value" style="color:var(--accent)">{len(users)}</div>
      <div class="sub">identified users</div>
    </div>
    <div class="stat-card">
      <div class="label">Active (30d)</div>
      <div class="value" style="color:var(--green)">{active_count}</div>
      <div class="sub">last active after {THIRTY_DAYS_AGO}</div>
    </div>
    <div class="stat-card">
      <div class="label">Avg Meetings / Month</div>
      <div class="value" style="color:var(--sky)">{avg_meetings:g}</div>
      <div class="sub">across all active users</div>
    </div>
    <div class="stat-card">
      <div class="label">Total Meetings</div>
      <div class="value" style="color:var(--sky)">{total_meetings:,}</div>
      <div class="sub">automated + manual runs</div>
    </div>
    <div class="stat-card">
      <div class="label">Bot Recordings</div>
      <div class="value" style="color:var(--amber)">{total_bot_rec:,}</div>
      <div class="sub">recall:bot_done events</div>
    </div>
    <div class="stat-card">
      <div class="label">AI Interactions</div>
      <div class="value" style="color:var(--accent2)">{total_ai:,}</div>
      <div class="sub">chat sessions + messages</div>
    </div>
    {most_active_html}
  </div>

  <div class="note">
    <strong>Note:</strong>
    <em>Is Manager</em> and <em>Has Paid Seat</em> are not yet tracked in PostHog.
    <em>Utilized Seat</em> = active within last 30 days (after {THIRTY_DAYS_AGO}).
    <em>Automated meetings</em> = <code>workflows:run_completed</code>;
    <em>Manual meetings</em> = <code>pipelines:run_completed</code>.
    <em>AI Interactions</em> = <code>conversation:message_sent</code> + <code>chat_created</code>.
    <em>30d Trend</em> = weekly event counts over last 5 weeks (oldest → newest).
  </div>

  <div class="controls">
    <input type="text" class="search-input" id="searchInput" placeholder="Search by name or email…" oninput="filterTable()">
    <select class="fsel" id="statusFilter" onchange="filterTable()">
      <option value="all">All Users</option>
      <option value="yes">Active (30d)</option>
      <option value="no">Inactive</option>
    </select>
    <span id="rowCount" style="font-size:13px;color:var(--muted);margin-left:auto"></span>
  </div>

  <div class="table-container">
    <table id="usageTable">
      <thead><tr>
        <th onclick="sortTable(0)">User</th>
        <th onclick="sortTable(1)">Workspace</th>
        <th onclick="sortTable(2)">Seat</th>
        <th onclick="sortTable(3)" class="num">Last Active</th>
        <th onclick="sortTable(4)" class="num">Days Active</th>
        <th onclick="sortTable(5)" class="num">Avg Mtgs/Mo</th>
        <th onclick="sortTable(6)" class="num">Meetings</th>
        <th onclick="sortTable(7)" class="num">Bot Rec.</th>
        <th onclick="sortTable(8)" class="num">Art. Viewed</th>
        <th onclick="sortTable(9)" class="num">Art. Interact</th>
        <th onclick="sortTable(10)" class="num">AI Interact.</th>
        <th onclick="sortTable(11)" class="num">Convos</th>
        <th onclick="sortTable(12)" class="num">Pageviews</th>
        <th class="num">30d Trend</th>
      </tr></thead>
      <tbody id="tableBody"></tbody>
    </table>
  </div>

  <div class="footer">
    <span>Source: PostHog Production (project {PROJECT_ID}) · Group keys: {", ".join(group_keys)} · Generated {today_str}</span>
    <span id="footerCount"></span>
  </div>
</div>

<script>
const RAW      = {json_data};
const MAX_DAYS = {max_days};
const MAX_MEET = {max_meetings};
const CUTOFF   = '{THIRTY_DAYS_AGO}';

function util(u) {{ return u.last_active >= CUTOFF ? 'Yes' : 'No'; }}
function ini(n) {{ return (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }}

function numCell(n) {{
  if (!n) return '<td class="num" style="color:var(--muted)">—</td>';
  const col = n>200?'var(--green)':n>30?'var(--amber)':'inherit';
  return `<td class="num" style="color:${{col}}">${{n.toLocaleString()}}</td>`;
}}

function barCell(n, max) {{
  const pct = max ? Math.min(100, Math.round(n/max*100)) : 0;
  return `<td><div class="bar-wrap"><div class="bar"><div class="bar-fill" style="width:${{pct}}%"></div></div><span class="num" style="min-width:40px;color:${{n?'inherit':'var(--muted)'}}">${{n||'—'}}</span></div></td>`;
}}

function avgCell(u) {{
  const avg = u.avg_meetings_per_month;
  const col = avg>100?'var(--green)':avg>20?'var(--amber)':'inherit';
  const sub = `${{u.meetings_automated}}A / ${{u.meetings_manual}}M`;
  return `<td><div class="avg-cell"><span class="avg-main" style="color:${{col}}">${{avg||'—'}}</span><span class="avg-sub">${{sub}}</span></div></td>`;
}}

function sparkCell(trend) {{
  const vals = trend || [0,0,0,0,0];
  const maxV = Math.max(...vals, 1);
  if (maxV === 0) return '<td class="num spark-zero sparkline-cell">—</td>';
  const W=80, H=24, n=vals.length;
  const pts = vals.map((v,i) => {{
    const x = Math.round(i*(W/(n-1)));
    const y = Math.round(H - (v/maxV)*H);
    return `${{x}},${{y}}`;
  }}).join(' ');
  // Area fill
  const areaFirst = `0,${{H}}`;
  const areaLast  = `${{W}},${{H}}`;
  const areaPoints = `${{areaFirst}} ${{pts}} ${{areaLast}}`;
  // Color by trend: last week vs first week
  const trend_dir = vals[4] >= vals[0] ? '#6366f1' : '#f43f5e';
  const fill_dir  = vals[4] >= vals[0] ? 'rgba(99,102,241,0.15)' : 'rgba(244,63,94,0.1)';
  return `<td class="sparkline-cell">
    <svg class="sparkline" width="${{W}}" height="${{H}}" viewBox="0 0 ${{W}} ${{H}}">
      <polygon points="${{areaPoints}}" fill="${{fill_dir}}" />
      <polyline points="${{pts}}" fill="none" stroke="${{trend_dir}}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${{Math.round((n-1)*(W/(n-1)))}}" cy="${{Math.round(H-(vals[n-1]/maxV)*H)}}" r="2.5" fill="${{trend_dir}}"/>
    </svg>
  </td>`;
}}

let sorted = [...RAW];
let sortState = {{col:4, asc:false}};

function renderRows(data) {{
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  for (const u of data) {{
    const utilVal  = util(u);
    const utilPill = utilVal==='Yes'
      ? '<span class="pill pill-green">● Active</span>'
      : '<span class="pill pill-rose">○ Inactive</span>';
    tbody.insertAdjacentHTML('beforeend', `<tr>
      <td><div class="user-cell">
        <div class="avatar">${{ini(u.name)}}</div>
        <div><div class="user-name">${{u.name||''}}</div><div class="user-email">${{u.email||''}}</div></div>
      </div></td>
      <td>${{u.workspace||''}}</td>
      <td>${{utilPill}}</td>
      <td class="num">${{u.last_active||''}}</td>
      ${{barCell(u.days_active, MAX_DAYS)}}
      ${{avgCell(u)}}
      ${{barCell(u.meetings_total, MAX_MEET)}}
      ${{numCell(u.bot_recordings)}}
      ${{numCell(u.artifacts_viewed)}}
      ${{numCell(u.artifacts_interacted)}}
      ${{numCell(u.ai_interactions)}}
      ${{numCell(u.conversations_created)}}
      ${{numCell(u.pageviews)}}
      ${{sparkCell(u.trend)}}
    </tr>`);
  }}
  document.getElementById('rowCount').textContent = `Showing ${{data.length}} users`;
  document.getElementById('footerCount').textContent = `${{data.length}} of ${{RAW.length}} users`;
}}

function filterTable() {{
  const q  = document.getElementById('searchInput').value.toLowerCase();
  const st = document.getElementById('statusFilter').value;
  const filtered = sorted.filter(u => {{
    const ms = !q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q);
    const mu = st==='all' || util(u).toLowerCase()===st;
    return ms && mu;
  }});
  renderRows(filtered);
}}

function sortTable(col) {{
  sortState = {{col, asc: sortState.col===col ? !sortState.asc : col<3}};
  document.querySelectorAll('th').forEach((th,i)=>th.classList.toggle('sorted',i===col));
  const keys = ['name','workspace','_util','last_active','days_active','avg_meetings_per_month','meetings_total','bot_recordings','artifacts_viewed','artifacts_interacted','ai_interactions','conversations_created','pageviews'];
  sorted.sort((a,b)=>{{
    let av = col===2?util(a):a[keys[col]];
    let bv = col===2?util(b):b[keys[col]];
    if(typeof av==='string') return sortState.asc?av.localeCompare(bv):bv.localeCompare(av);
    return sortState.asc?(av||0)-(bv||0):(bv||0)-(av||0);
  }});
  filterTable();
}}

function exportCSV() {{
  const h = ["User Name","User Email","Workspace","Is Manager","Has Paid Seat","Utilized Seat","First Active","Last Active","Days Active","Avg Meetings/Month","Meetings Total","Automated Meetings","Manual Meetings","Bot Recordings","Artifacts Viewed","Artifacts Interacted","AI Interactions","Conversations","Pageviews"];
  const rows = sorted.map(u=>[u.name||'',u.email||'',u.workspace||'',u.is_manager||'Unknown','Unknown',util(u),u.first_active||'',u.last_active||'',u.days_active,u.avg_meetings_per_month,u.meetings_total,u.meetings_automated,u.meetings_manual,u.bot_recordings,u.artifacts_viewed,u.artifacts_interacted,u.ai_interactions,u.conversations_created,u.pageviews]);
  const csv = [h,...rows].map(r=>r.map(v=>`"${{v}}"`).join(',')).join('\\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{{type:'text/csv'}}));
  a.download = '{company_name.lower().replace(" ","-")}-askelephant-usage-report.csv';
  a.click();
}}

renderRows(sorted);
</script>
</body>
</html>
"""
    output_path.write_text(html, encoding="utf-8")
    print(f"  ✓ HTML → {output_path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    parser = argparse.ArgumentParser(
        description="Generate AskElephant usage report for a customer account."
    )
    grp = parser.add_mutually_exclusive_group(required=True)
    grp.add_argument("--company",   type=str, help="Company name to search in PostHog groups")
    grp.add_argument("--group-key", type=str, help="Exact PostHog group key (e.g. id:wrks_01...)")
    parser.add_argument("--format", choices=["csv", "html", "both"], default="both")
    parser.add_argument("--output-dir", type=str, default=str(OUTPUT_DIR))
    args = parser.parse_args()

    api_key = os.environ.get("POSTHOG_API_KEY")
    if not api_key:
        print("Error: POSTHOG_API_KEY environment variable not set.")
        print("  export POSTHOG_API_KEY=phx_your_key_here")
        sys.exit(1)

    client     = PostHogClient(api_key)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # ── Step 1: Resolve group keys ────────────────────────────────────────────
    print("\n🔍 Looking up groups in PostHog…")
    if args.company:
        groups       = client.find_groups(args.company)
        company_name = args.company
    else:
        groups       = client.find_groups_by_key(args.group_key)
        company_name = (
            groups[0]["group_properties"].get("name", args.group_key)
            if groups else args.group_key
        )

    if not groups:
        print(f"❌ No groups found for: {args.company or args.group_key}")
        sys.exit(1)

    group_keys = [g["group_key"] for g in groups]
    print(f"  Found {len(group_keys)} group(s) for '{company_name}':")
    for g in groups:
        print(f"    • {g['group_key']}  (created {g.get('created_at','?')[:10]})")

    activity_query, trend_query = build_queries(group_keys)

    # ── Step 2: All-time activity query ───────────────────────────────────────
    print("\n📊 Querying all-time user activity…")
    result  = client.hogql(activity_query)
    if result.get("error"):
        print(f"❌ Query error: {result['error']}")
        sys.exit(1)
    rows  = results_to_rows(result.get("results", []), result.get("columns", []))
    users = dedup_users(rows)

    if not users:
        print("⚠️  No identified users found.")
        sys.exit(0)

    active_30d = sum(1 for u in users if utilized(u["last_active"]) == "Yes")
    print(f"  {len(users)} identified users  ({active_30d} active in last 30 days)")

    # ── Step 3: 30-day trend query ────────────────────────────────────────────
    trend_map: dict[str, list[int]] = {}
    if args.format in ("html", "both"):
        print("\n📈 Querying 30-day activity trend…")
        try:
            trend_result = client.hogql(trend_query)
            trend_map    = build_trend_map(
                trend_result.get("results", []),
                trend_result.get("columns", []),
            )
            print(f"  Trend data for {len(trend_map)} users")
        except Exception as e:
            print(f"  ⚠️  Trend query failed (sparklines will be empty): {e}")

    # ── Step 4: Export ────────────────────────────────────────────────────────
    slug = slugify(company_name)
    print("\n💾 Saving report…")

    if args.format in ("csv", "both"):
        export_csv(users, output_dir / f"{slug}-usage-report.csv")

    if args.format in ("html", "both"):
        export_html(users, company_name, output_dir / f"{slug}-usage-report.html",
                    group_keys, trend_map)

    print(f"\n✅ Done! Report for {company_name} ({len(users)} users)")


if __name__ == "__main__":
    main()
