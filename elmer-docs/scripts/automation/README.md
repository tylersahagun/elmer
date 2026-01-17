# PM Workspace Automation

Automated health checks, signal ingestion, notifications, and reports for your PM workspace.

## Signal Ingestion Workflows

### How Signals Flow Into Your System

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL SOURCES                                │
├─────────────────────────────────────────────────────────────────┤
│  Files (Manual)     │  Linear (MCP)      │  Notion (MCP)        │
│  ─────────────────  │  ──────────────    │  ─────────────       │
│  Drop files into    │  Issues with       │  Items in PM         │
│  signals/inbox/     │  "pm-review"       │  Inbox database      │
│  folders            │  label             │                      │
└─────────┬───────────┴────────┬───────────┴──────────┬───────────┘
          │                    │                      │
          ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING                                    │
├─────────────────────────────────────────────────────────────────┤
│  auto-ingest.py     │  /sync linear      │  /sync notion        │
│  (runs every 15min) │  (Cursor command)  │  (Cursor command)    │
└─────────┬───────────┴────────┬───────────┴──────────┬───────────┘
          │                    │                      │
          └────────────────────┼──────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL STORAGE                                │
│  elmer-docs/signals/                                      │
│  ├── transcripts/    (meeting notes, calls)                     │
│  ├── tickets/        (support requests)                         │
│  ├── conversations/  (Slack, email threads)                     │
│  ├── issues/         (Linear, GitHub)                           │
│  └── _index.json     (searchable metadata)                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYSIS                                      │
│  /synthesize - Find patterns across signals                     │
│  /hypothesis - Create/validate problem hypotheses               │
│  /ingest     - Full AI extraction from individual signals       │
└─────────────────────────────────────────────────────────────────┘
```

### Option 1: File-Based Inbox (Automatic)

Drop files into inbox folders and they'll be auto-processed every 15 minutes.

**Inbox folders:**
```
signals/inbox/
├── transcripts/   ← Drop meeting transcripts, call notes
├── tickets/       ← Drop support tickets, bug reports
├── conversations/ ← Drop Slack exports, email threads
└── misc/          ← Drop anything else
```

**What happens:**
1. `auto-ingest.py` runs every 15 minutes
2. Extracts personas, severity, problems from content
3. Moves file to appropriate `signals/` folder
4. Updates `signals/_index.json`
5. Flags for full AI processing

**Manual run:**
```bash
python3 scripts/automation/auto-ingest.py
python3 scripts/automation/auto-ingest.py --dry-run  # Preview only
python3 scripts/automation/auto-ingest.py --watch    # Continuous mode
```

### Option 2: MCP Integration (Semi-Automatic)

Pull from Linear and Notion using Cursor commands.

**Linear Sync:**
```
/sync linear           # Pull issues with pm-review label
/sync linear --all     # Pull all recent issues
/sync linear ENG-123   # Pull specific issue
```

**Notion Sync:**
```
/sync notion           # Pull from PM Inbox database
/sync notion feedback  # Pull from Feedback database
```

**Setup required:**
- Linear: Create a "pm-review" label
- Notion: Create an "Inbox" database with Status property

---

## Quick Start

### Option 1: macOS Launch Agents (Recommended for local)

```bash
# 1. Set up your Slack webhook (optional)
export PM_SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# 2. Load the agents using bootstrap (modern macOS)
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pmworkspace.auto-ingest.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pmworkspace.daily-health.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pmworkspace.weekly-recap.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pmworkspace.roadmap-snapshot.plist

# 3. Verify they're running
launchctl list | grep pmworkspace
```

**Scheduled jobs:**
| Job | Schedule | Purpose |
|-----|----------|---------|
| `auto-ingest` | Every 15 min | Process inbox files |
| `daily-health` | 9am weekdays | Health check alerts |
| `weekly-recap` | Monday 8:30am | Weekly summary |
| `roadmap-snapshot` | Midnight daily | Archive roadmap state |

### Option 2: Cron Jobs (Linux/Unix)

Add to crontab (`crontab -e`):

```cron
# Auto-ingest every 15 minutes
*/15 * * * * cd /path/to/elmer-docs && python3 scripts/automation/auto-ingest.py

# Daily health check at 9am weekdays
0 9 * * 1-5 cd /path/to/elmer-docs && python3 scripts/automation/daily-health.py --refresh --slack

# Weekly recap Monday 8:30am
30 8 * * 1 cd /path/to/elmer-docs && python3 scripts/automation/weekly-recap.py --slack

# Daily roadmap snapshot at midnight
0 0 * * * cd /path/to/elmer-docs && python3 scripts/generate-roadmap.py
```

### Option 3: n8n Workflow (Cloud/Self-hosted)

See `n8n-workflow.json` for a pre-built workflow that:
- Runs on schedule
- Reads roadmap.json
- Sends Slack notifications
- Can trigger from Linear/Notion webhooks

---

## Scripts

### `auto-ingest.py`

Monitors inbox folders and processes new signals automatically.

```bash
# Process all inbox files once
python3 auto-ingest.py

# Watch continuously (check every 60s)
python3 auto-ingest.py --watch

# Preview without making changes
python3 auto-ingest.py --dry-run

# With Slack notifications
python3 auto-ingest.py --slack
```

**What it extracts automatically:**
- Personas mentioned (sales-rep, csm, revops, etc.)
- Severity (high/medium/low based on keywords)
- Problem statements
- Word count and source metadata

**Status: `unprocessed`** - Run `/ingest` in Cursor for full AI extraction.

---

### `daily-health.py`

Daily health check that alerts on:
- Stale initiatives (>14 days = alert, >7 days = warning)
- Blocked items
- Missing owners on P0/P1 items
- Status changes

```bash
# Terminal output only
python3 daily-health.py

# With Slack notification
python3 daily-health.py --slack

# Refresh roadmap first
python3 daily-health.py --refresh --slack

# Quiet mode (only output if issues)
python3 daily-health.py --quiet --slack
```

### `weekly-recap.py`

Weekly summary comparing to previous week:
- Phase transitions
- New initiatives
- Status changes
- Recommended focus areas

```bash
python3 weekly-recap.py
python3 weekly-recap.py --slack
```

---

## Slack Setup

### 1. Create a Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "PM Workspace" and select your workspace

### 2. Enable Incoming Webhooks

1. Go to "Incoming Webhooks" in the sidebar
2. Toggle "Activate Incoming Webhooks" ON
3. Click "Add New Webhook to Workspace"
4. Select the channel (e.g., #product-updates)
5. Copy the Webhook URL

### 3. Set Environment Variable

```bash
# Add to ~/.zshrc or ~/.bashrc
export PM_SLACK_WEBHOOK="your-webhook-url-here"
```

---

## Notification Examples

### Daily Health Check

```
✅ Daily PM Health Check

9 initiatives across phases:
Discovery: 1 | Define: 4 | Build: 3 | Validate: 1

⚠️ Approaching Stale (7-14 days):
• Automated Metrics Observability - 7 days in define

Generated 2026-01-16 09:00 | Run /roadmap for details
```

### Weekly Recap

```
📊 Weekly PM Recap
Week of January 16, 2026

9 total initiatives (+2)

🎯 Phase Transitions:
• HubSpot Config: build → validate
• Signal Tables: define → build

🆕 New Initiatives:
• Call Import Engine (P2) - discovery

🎯 This Week's Focus:
1. HubSpot Config UI (validate)
   Run jury evaluation before launch
2. Universal Signal Tables (build)
   P0 priority - prototype completion
```

---

## Alternative: n8n Integration

For more complex workflows, use n8n:

### Capabilities

1. **Trigger on file changes** - Watch `_meta.json` files
2. **Linear integration** - Create issues when initiatives are blocked
3. **Notion sync** - Update Notion database on phase changes
4. **Custom alerts** - Different channels for different priorities

### Sample Workflow

```json
{
  "name": "PM Workspace Daily Health",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "cronExpression", "expression": "0 9 * * 1-5" }] }
      }
    },
    {
      "name": "Read Roadmap",
      "type": "n8n-nodes-base.readBinaryFile",
      "parameters": {
        "filePath": "/path/to/elmer-docs/roadmap/roadmap.json"
      }
    },
    {
      "name": "Check Health",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Parse and analyze roadmap..."
      }
    },
    {
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#product-updates",
        "text": "={{ $json.message }}"
      }
    }
  ]
}
```

---

## Extending Automation

### Add Email Notifications

```python
# In daily-health.py, add:
import smtplib
from email.mime.text import MIMEText

def send_email(subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = os.environ.get('EMAIL_FROM')
    msg['To'] = os.environ.get('EMAIL_TO')
    
    with smtplib.SMTP(os.environ.get('SMTP_HOST'), 587) as server:
        server.starttls()
        server.login(os.environ.get('SMTP_USER'), os.environ.get('SMTP_PASS'))
        server.send_message(msg)
```

### Add Linear Issue Creation

```python
# When initiative is blocked, create Linear issue
def create_linear_issue(initiative_name, blockers):
    # Use Linear MCP or API
    pass
```

### Add Notion Database Updates

```python
# Sync phase changes to Notion
def update_notion_project(initiative_id, phase, status):
    # Use Notion MCP
    pass
```

---

## Logs

Logs are stored in `elmer-docs/maintenance/logs/`:

- `auto-ingest.log` - Signal ingestion output
- `auto-ingest.error.log` - Ingestion errors
- `daily-health.log` - Daily check output
- `daily-health.error.log` - Health check errors
- `weekly-recap.log` - Weekly recap output
- `roadmap-snapshot.log` - Snapshot generation

View recent logs:
```bash
tail -50 maintenance/logs/daily-health.log
```

---

## Troubleshooting

### Agent not running?

```bash
# Check if loaded
launchctl list | grep pmworkspace

# Check for errors
cat ~/Library/Logs/com.pmworkspace.daily-health.log

# Manually trigger
launchctl start com.pmworkspace.daily-health
```

### Slack not receiving?

1. Verify webhook URL is set: `echo $PM_SLACK_WEBHOOK`
2. Test webhook directly: `curl -X POST -H 'Content-type: application/json' --data '{"text":"Test"}' $PM_SLACK_WEBHOOK`
3. Check Slack app permissions

### Wrong timezone?

macOS launch agents use system timezone. Verify with:
```bash
date
```
