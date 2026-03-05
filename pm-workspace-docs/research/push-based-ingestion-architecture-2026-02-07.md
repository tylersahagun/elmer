# Push-Based Ingestion Architecture

**Date:** February 7, 2026  
**Problem:** 2+ hours of catch-up after meetings; system is reactive, not proactive  
**Goal:** Pre-processed priority queue ready when Tyler returns to desk

---

## The Core Problem

```
Current State (Reactive):
┌─────────────────────────────────────────────────────────────────┐
│  8 AM: Tyler runs /morning (15 min)                             │
│  8:15 AM: Start meetings                                        │
│  ...                                                            │
│  2 PM: Meetings end                                             │
│  2 PM: Tyler manually runs:                                     │
│    - /slack-monitor (5 min wait)                                │
│    - /sync-linear (3 min wait)                                  │
│    - /sync-notion (4 min wait)                                  │
│    - /eod to see what happened (5 min wait)                     │
│    - Read and prioritize results (30+ min)                      │
│  3:30 PM: Finally ready to make decisions                       │
│                                                                 │
│  TIME LOST: 90+ minutes of REACTIVE work                        │
└─────────────────────────────────────────────────────────────────┘

Desired State (Proactive):
┌─────────────────────────────────────────────────────────────────┐
│  8 AM: Tyler reviews pre-generated today.md (5 min)             │
│  8:05 AM: Start meetings                                        │
│  ...                                                            │
│  (BACKGROUND: System continuously ingests and processes)        │
│  ...                                                            │
│  2 PM: Meetings end                                             │
│  2 PM: Tyler opens decision-queue.md                            │
│    - Already prioritized                                        │
│    - Already has context pulled                                 │
│    - Shows: "3 decisions needed, 5 FYIs, 2 signals captured"    │
│  2:15 PM: Tyler makes decisions, moves on                       │
│                                                                 │
│  TIME SAVED: 75+ minutes → actual PM work                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Options

### Option A: Composio Triggers → GitHub Actions → Workspace Files

**How it works:**
1. Composio triggers fire on Slack messages, Linear updates, GitHub PRs
2. Trigger calls a GitHub Actions webhook
3. GitHub Action runs a processing script
4. Script writes pre-processed files to the workspace
5. Tyler pulls latest when ready

**Pros:**
- Uses Composio you already have
- No additional infrastructure
- Files are git-tracked

**Cons:**
- GitHub Actions have cold start latency
- Limited processing power
- Requires webhook endpoint (GitHub has this)

**Complexity:** Medium

---

### Option B: n8n Self-Hosted Automation

**How it works:**
1. n8n runs on your Mac (or a cheap VPS)
2. Receives webhooks from Slack, Linear, GitHub
3. Processes events in real-time
4. Writes to local workspace OR pushes to GitHub
5. Classifies and prioritizes automatically

**Pros:**
- True real-time processing
- Full control over logic
- Free (self-hosted)
- Visual workflow builder

**Cons:**
- Requires running server (Mac or VPS)
- Setup complexity
- Maintenance burden

**Complexity:** High initial, Low ongoing

---

### Option C: Scheduled GitHub Actions (Polling)

**How it works:**
1. GitHub Action runs every 30 minutes
2. Polls Slack, Linear, GitHub via APIs/MCP
3. Processes new items since last run
4. Writes `decision-queue.md` and `signals-queue.md`
5. Commits to workspace

**Pros:**
- Simplest to implement
- No webhook infrastructure
- Leverages existing MCP patterns

**Cons:**
- 30-minute lag (not real-time)
- Uses GitHub Actions minutes
- Polling can miss things

**Complexity:** Low

---

### Option D: Cloudflare Workers + D1 (Lightweight Serverless)

**How it works:**
1. Cloudflare Worker receives webhooks (always on)
2. Stores events in D1 (SQLite) database
3. Second worker processes and classifies on schedule
4. Generates `decision-queue.md` and pushes to GitHub

**Pros:**
- True real-time ingestion
- Very cheap ($5/month or free tier)
- No server maintenance
- Fast cold starts

**Cons:**
- New infrastructure to learn
- Requires webhook setup per service

**Complexity:** Medium

---

### Option E: Make.com / Zapier (No-Code)

**How it works:**
1. Make.com scenarios watch Slack, Linear, GitHub
2. Events trigger processing workflows
3. Writes to Google Sheets or Airtable as intermediate storage
4. Scheduled scenario generates daily/hourly summary
5. Posts summary to Slack DM or writes to GitHub

**Pros:**
- No code required
- Fast to set up
- Visual builder

**Cons:**
- Monthly cost ($20-50/month)
- Limited logic complexity
- Another system to manage
- Data lives in third-party tool

**Complexity:** Low

---

## Recommended Architecture: Hybrid Approach

**Best balance of simplicity, reliability, and effectiveness:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PUSH-BASED INGESTION SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ╔════════════════════════════════════════════════════════════════════════╗ │
│  ║                      LAYER 1: EVENT CAPTURE                            ║ │
│  ║                      (Composio Triggers)                               ║ │
│  ╠════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                        ║ │
│  ║   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            ║ │
│  ║   │  Slack   │  │  Linear  │  │  GitHub  │  │  Gmail   │            ║ │
│  ║   │ Trigger  │  │ Trigger  │  │ Trigger  │  │ Trigger  │            ║ │
│  ║   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            ║ │
│  ║        │             │             │             │                  ║ │
│  ║        └─────────────┴─────────────┴─────────────┘                  ║ │
│  ║                              │                                      ║ │
│  ║                              ▼                                      ║ │
│  ║                   ┌─────────────────────┐                          ║ │
│  ║                   │  GitHub Actions     │                          ║ │
│  ║                   │  Webhook Receiver   │                          ║ │
│  ║                   └──────────┬──────────┘                          ║ │
│  ╚══════════════════════════════╪═════════════════════════════════════╝ │
│                                 │                                        │
│  ╔══════════════════════════════╪═════════════════════════════════════╗ │
│  ║                      LAYER 2: RAW STORAGE                          ║ │
│  ║                      (JSON Append-Only Log)                        ║ │
│  ╠══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                      ║ │
│  ║   pm-workspace-docs/inbox/                                          ║ │
│  ║   ├── raw/                                                          ║ │
│  ║   │   ├── slack-events.jsonl      ◀── Append-only event log        ║ │
│  ║   │   ├── linear-events.jsonl                                       ║ │
│  ║   │   ├── github-events.jsonl                                       ║ │
│  ║   │   └── gmail-events.jsonl                                        ║ │
│  ║   └── .last-processed.json        ◀── Cursor position per source   ║ │
│  ║                                                                      ║ │
│  ╚══════════════════════════════╪═════════════════════════════════════╝ │
│                                 │                                        │
│  ╔══════════════════════════════╪═════════════════════════════════════╗ │
│  ║                      LAYER 3: PROCESSING                           ║ │
│  ║                      (Scheduled GitHub Action)                     ║ │
│  ╠══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                      ║ │
│  ║   Runs every 15-30 minutes:                                         ║ │
│  ║                                                                      ║ │
│  ║   1. Read new events since .last-processed                          ║ │
│  ║   2. Classify each event:                                           ║ │
│  ║      - 🔴 DECISION NEEDED (mention, question, blocker)             ║ │
│  ║      - 🟡 REVIEW (from collaborator, product discussion)           ║ │
│  ║      - 🟢 FYI (update, win, announcement)                          ║ │
│  ║      - 📊 SIGNAL (customer feedback, feature request)              ║ │
│  ║   3. Enrich with context:                                           ║ │
│  ║      - Link to initiatives                                          ║ │
│  ║      - Pull customer info from HubSpot                              ║ │
│  ║      - Resolve Slack IDs to names                                   ║ │
│  ║   4. Write decision-queue.md                                        ║ │
│  ║   5. Update .last-processed cursor                                  ║ │
│  ║   6. Commit and push                                                ║ │
│  ║                                                                      ║ │
│  ╚══════════════════════════════╪═════════════════════════════════════╝ │
│                                 │                                        │
│  ╔══════════════════════════════╪═════════════════════════════════════╗ │
│  ║                      LAYER 4: DECISION QUEUE                       ║ │
│  ║                      (Pre-Processed Output)                        ║ │
│  ╠══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                      ║ │
│  ║   pm-workspace-docs/status/                                         ║ │
│  ║   ├── decision-queue.md           ◀── Tyler opens THIS             ║ │
│  ║   ├── signals-queue.md            ◀── Product signals captured     ║ │
│  ║   └── today.md                    ◀── Morning planning view        ║ │
│  ║                                                                      ║ │
│  ║   decision-queue.md format:                                         ║ │
│  ║   ┌─────────────────────────────────────────────────────────────┐  ║ │
│  ║   │ # Decision Queue                                            │  ║ │
│  ║   │ **Last Updated:** 2026-02-07 14:15 MST                      │  ║ │
│  ║   │ **Since Last Check:** 47 events processed                   │  ║ │
│  ║   │                                                             │  ║ │
│  ║   │ ## 🔴 DECISIONS NEEDED (3)                                  │  ║ │
│  ║   │                                                             │  ║ │
│  ║   │ ### 1. PRD Review Request                                   │  ║ │
│  ║   │ **From:** Sam Ho | **Time:** 11:42 AM | **Source:** Slack   │  ║ │
│  ║   │ **Link:** [View in Slack](https://...)                      │  ║ │
│  ║   │ **Context:** Privacy Agent PRD needs your sign-off          │  ║ │
│  ║   │ **Initiative:** privacy-determination-agent                 │  ║ │
│  ║   │ **Suggested Action:** Review and approve or comment         │  ║ │
│  ║   │ **Time Estimate:** 15 min                                   │  ║ │
│  ║   │ - [ ] Done                                                  │  ║ │
│  ║   │                                                             │  ║ │
│  ║   │ ### 2. Linear Issue Blocked                                 │  ║ │
│  ║   │ ...                                                         │  ║ │
│  ║   │                                                             │  ║ │
│  ║   │ ## 🟡 REVIEW (5)                                            │  ║ │
│  ║   │ - [ ] **Skylar** shared design mockup for Rep Workspace     │  ║ │
│  ║   │ - [ ] **Bryan** has question about HubSpot sync priority    │  ║ │
│  ║   │ ...                                                         │  ║ │
│  ║   │                                                             │  ║ │
│  ║   │ ## 🟢 FYI (8)                                               │  ║ │
│  ║   │ - Deal closed: Acme Corp ($15k ARR)                         │  ║ │
│  ║   │ - PR merged: ASK-4591 HubSpot config UI                     │  ║ │
│  ║   │ ...                                                         │  ║ │
│  ║   │                                                             │  ║ │
│  ║   │ ## 📊 SIGNALS CAPTURED (3)                                  │  ║ │
│  ║   │ - Customer quote about workflow builder (→ signals/)       │  ║ │
│  ║   │ ...                                                         │  ║ │
│  ║   └─────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                      ║ │
│  ╚══════════════════════════════════════════════════════════════════════╝ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Event Capture (Week 1)

**Goal:** Get events flowing into raw storage

#### Step 1.1: Create Inbox Structure

```bash
mkdir -p pm-workspace-docs/inbox/raw
touch pm-workspace-docs/inbox/raw/slack-events.jsonl
touch pm-workspace-docs/inbox/raw/linear-events.jsonl
touch pm-workspace-docs/inbox/raw/github-events.jsonl
touch pm-workspace-docs/inbox/.last-processed.json
```

#### Step 1.2: Set Up Composio Triggers

Composio supports triggers that can call webhooks. Configure these:

| Trigger | Event | Webhook Target |
|---------|-------|----------------|
| Slack New Message | `slack.message.im` | GitHub Actions webhook |
| Slack Mention | `slack.message.mention` | GitHub Actions webhook |
| Linear Issue Updated | `linear.issue.updated` | GitHub Actions webhook |
| Linear Comment Added | `linear.comment.created` | GitHub Actions webhook |
| GitHub PR Review Requested | `github.pull_request.review_requested` | GitHub Actions webhook |
| Gmail New Email | `gmail.message.received` | GitHub Actions webhook |

**Composio Trigger Setup (via CLI):**

```bash
# Install Composio CLI if not present
pip install composio-core

# List available triggers
composio triggers list --app slack

# Create trigger for Slack mentions
composio triggers create \
  --app slack \
  --event message.mention \
  --webhook-url https://api.github.com/repos/tylersahagun/pm-workspace/dispatches \
  --webhook-secret $GITHUB_TOKEN

# Similar for Linear, GitHub, Gmail
```

#### Step 1.3: Create GitHub Actions Webhook Receiver

```yaml
# .github/workflows/ingest-event.yml
name: Ingest Event

on:
  repository_dispatch:
    types: [slack_event, linear_event, github_event, gmail_event]

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Append to event log
        run: |
          SOURCE="${{ github.event.action }}"
          TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
          EVENT_DATA='${{ toJson(github.event.client_payload) }}'
          
          # Append to appropriate JSONL file
          case "$SOURCE" in
            slack_event)
              echo "{\"timestamp\":\"$TIMESTAMP\",\"data\":$EVENT_DATA}" >> pm-workspace-docs/inbox/raw/slack-events.jsonl
              ;;
            linear_event)
              echo "{\"timestamp\":\"$TIMESTAMP\",\"data\":$EVENT_DATA}" >> pm-workspace-docs/inbox/raw/linear-events.jsonl
              ;;
            # ... etc
          esac
      
      - name: Commit and push
        run: |
          git config user.name "PM Workspace Bot"
          git config user.email "bot@pm-workspace.local"
          git add pm-workspace-docs/inbox/raw/
          git commit -m "Ingest: ${{ github.event.action }} event" || exit 0
          git push
```

---

### Phase 2: Processing Pipeline (Week 2)

**Goal:** Turn raw events into decision queue

#### Step 2.1: Create Processing Script

```python
# scripts/process-inbox.py
"""
Process raw events from inbox/ and generate decision-queue.md
"""
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

INBOX_PATH = Path("pm-workspace-docs/inbox")
RAW_PATH = INBOX_PATH / "raw"
STATUS_PATH = Path("pm-workspace-docs/status")
CURSOR_FILE = INBOX_PATH / ".last-processed.json"

# Load org chart for name resolution
ORG_CHART = json.loads(Path("pm-workspace-docs/company-context/org-chart.json").read_text())

# Priority people (messages from these are 🔴 or 🟡)
LEADERSHIP = ["U0A99G89V43", "U0605SZVBDJ", "U086JDRUYFJ"]  # Sam, Woody, Bryan
COLLABORATORS = ["U081YKKDGR5", "U0932C4LFEV", "U092NQWH9PF"]  # Skylar, Adam, Ben H

def load_cursor():
    if CURSOR_FILE.exists():
        return json.loads(CURSOR_FILE.read_text())
    return {"slack": None, "linear": None, "github": None, "gmail": None}

def save_cursor(cursor):
    CURSOR_FILE.write_text(json.dumps(cursor, indent=2))

def classify_event(event, source):
    """Classify event into priority bucket"""
    
    if source == "slack":
        user_id = event.get("user")
        text = event.get("text", "")
        
        # Direct mention of Tyler
        if "U08JVM8LBP0" in text:
            return "decision", "Direct mention"
        
        # From leadership
        if user_id in LEADERSHIP:
            return "review", "From leadership"
        
        # From collaborators
        if user_id in COLLABORATORS:
            return "review", "From collaborator"
        
        # Product channels with questions
        if "?" in text and event.get("channel") in ["product-forum", "product-requests"]:
            return "review", "Product question"
        
        return "fyi", "General update"
    
    if source == "linear":
        # Blocked issues assigned to Tyler
        if event.get("state") == "blocked" and event.get("assignee") == "tyler":
            return "decision", "Blocked issue"
        
        # Needs definition labels
        labels = event.get("labels", [])
        if any("needs-prd" in l or "needs-decisions" in l for l in labels):
            return "decision", "Needs definition"
        
        return "fyi", "Issue update"
    
    if source == "github":
        # Review requested
        if event.get("action") == "review_requested":
            return "review", "Review requested"
        
        return "fyi", "PR update"
    
    return "fyi", "Unknown"

def process_events():
    cursor = load_cursor()
    
    decisions = []
    reviews = []
    fyis = []
    signals = []
    
    for source in ["slack", "linear", "github", "gmail"]:
        events_file = RAW_PATH / f"{source}-events.jsonl"
        if not events_file.exists():
            continue
        
        last_ts = cursor.get(source)
        new_last_ts = last_ts
        
        with open(events_file) as f:
            for line in f:
                event = json.loads(line)
                ts = event["timestamp"]
                
                # Skip already processed
                if last_ts and ts <= last_ts:
                    continue
                
                new_last_ts = ts
                
                # Classify
                priority, reason = classify_event(event["data"], source)
                
                item = {
                    "timestamp": ts,
                    "source": source,
                    "reason": reason,
                    "data": event["data"]
                }
                
                if priority == "decision":
                    decisions.append(item)
                elif priority == "review":
                    reviews.append(item)
                else:
                    fyis.append(item)
        
        cursor[source] = new_last_ts
    
    # Generate decision-queue.md
    generate_queue(decisions, reviews, fyis, signals)
    
    # Save cursor
    save_cursor(cursor)

def generate_queue(decisions, reviews, fyis, signals):
    """Generate the decision-queue.md file"""
    
    output = f"""# Decision Queue

**Last Updated:** {datetime.now().strftime("%Y-%m-%d %H:%M")} MST
**Events Processed:** {len(decisions) + len(reviews) + len(fyis)} new

---

## 🔴 DECISIONS NEEDED ({len(decisions)})

"""
    
    for i, item in enumerate(decisions, 1):
        output += format_decision_item(i, item)
    
    output += f"""
## 🟡 REVIEW ({len(reviews)})

"""
    for item in reviews:
        output += format_review_item(item)
    
    output += f"""
## 🟢 FYI ({len(fyis)})

"""
    for item in fyis[:10]:  # Limit to 10
        output += format_fyi_item(item)
    
    STATUS_PATH.mkdir(exist_ok=True)
    (STATUS_PATH / "decision-queue.md").write_text(output)

def format_decision_item(num, item):
    # Format decision item with context
    return f"""
### {num}. {item['reason']}

**Source:** {item['source']} | **Time:** {item['timestamp']}
**Context:** {item['data'].get('text', 'No text')[:200]}

- [ ] Done

---
"""

# ... additional formatting functions

if __name__ == "__main__":
    process_events()
```

#### Step 2.2: Create Scheduled Processor

```yaml
# .github/workflows/process-inbox.yml
name: Process Inbox

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install -r scripts/requirements.txt
      
      - name: Process inbox
        run: python scripts/process-inbox.py
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Commit decision queue
        run: |
          git config user.name "PM Workspace Bot"
          git config user.email "bot@pm-workspace.local"
          git add pm-workspace-docs/status/decision-queue.md
          git add pm-workspace-docs/inbox/.last-processed.json
          git diff --staged --quiet || git commit -m "Update decision queue"
          git push
```

---

### Phase 3: Enhanced Morning Command (Week 3)

**Goal:** `/morning` reads from decision-queue.md instead of making live API calls

#### Step 3.1: Update Daily Planner Skill

```markdown
## Modified Procedure

1. **Pull latest** (git pull)
2. **Read decision-queue.md** (pre-processed, instant)
3. **Read Google Calendar** (still live, fast)
4. **Combine into today.md** with time estimates
5. **Suggest time blocks** for decision items
```

#### Step 3.2: Add Quick Review Command

```markdown
# /queue Command

Instantly shows what needs attention:

1. Read decision-queue.md
2. Display 🔴 items with one-line summaries
3. Offer to open each item's source link
4. Mark items as done (update the checkbox)
```

---

## Alternative: Simpler Polling Approach

If Composio triggers are too complex, use pure polling:

```yaml
# .github/workflows/poll-sources.yml
name: Poll All Sources

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes

jobs:
  poll:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Poll Slack
        run: |
          # Use Slack API to fetch recent messages
          curl -H "Authorization: Bearer $SLACK_TOKEN" \
            "https://slack.com/api/conversations.history?channel=C..." \
            > /tmp/slack-recent.json
      
      - name: Poll Linear
        run: |
          # Use Linear API
          curl -H "Authorization: $LINEAR_TOKEN" \
            "https://api.linear.app/graphql" \
            -d '{"query": "..."}' \
            > /tmp/linear-recent.json
      
      - name: Process and generate queue
        run: python scripts/process-all.py
      
      - name: Commit
        run: |
          git add .
          git commit -m "Poll update $(date)" || exit 0
          git push
```

---

## Decision Matrix

| Approach | Real-Time | Complexity | Cost | Maintenance |
|----------|-----------|------------|------|-------------|
| **Composio Triggers + GH Actions** | Near (seconds) | Medium | Free | Low |
| **Polling every 15 min** | 15 min lag | Low | Free | Low |
| **n8n self-hosted** | Real-time | High | Free | Medium |
| **Make.com** | Real-time | Low | $30/mo | Low |
| **Cloudflare Workers** | Real-time | Medium | $5/mo | Low |

**Recommendation:** Start with **Polling every 15 minutes** (simplest), then upgrade to **Composio Triggers** once the processing logic is proven.

---

## What Tyler's Day Looks Like After Implementation

```
7:55 AM: git pull (gets latest decision-queue.md)
8:00 AM: Open decision-queue.md
         "3 decisions needed, 5 reviews, 8 FYIs"
         
8:05 AM: Review decisions (already has context!)
         - Approve Sam's PRD (click link, comment, done)
         - Answer Bryan's question (click link, respond)
         - Unblock Linear issue (click link, add clarification)
         
8:20 AM: Scan reviews, mark 2 for later, skip 3
8:25 AM: Glance at FYIs, note deal win
8:30 AM: Start meetings

... 6 hours of meetings ...

2:00 PM: git pull (gets updated queue)
2:02 PM: Open decision-queue.md
         "2 new decisions, 3 reviews"
         
2:10 PM: Handle new decisions
2:20 PM: Back to actual PM work

TIME SAVED: 70+ minutes per day
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `pm-workspace-docs/inbox/raw/*.jsonl` | Append-only event logs |
| `pm-workspace-docs/inbox/.last-processed.json` | Cursor position |
| `pm-workspace-docs/status/decision-queue.md` | Pre-processed queue |
| `.github/workflows/ingest-event.yml` | Event receiver |
| `.github/workflows/process-inbox.yml` | Scheduled processor |
| `scripts/process-inbox.py` | Processing logic |
| `.cursor/commands/queue.md` | Quick queue review |

---

## Next Steps

1. **Decide on approach:** Polling (simple) vs Triggers (real-time)
2. **Create inbox structure** (5 min)
3. **Set up first trigger** (Slack mentions → GitHub Actions)
4. **Build processing script** (2-3 hours)
5. **Test for one week**
6. **Expand to other sources**

---

## Questions to Answer

1. **How real-time do you need?** 
   - 15-30 min lag acceptable? → Polling
   - Need instant? → Triggers

2. **Where should notifications go?**
   - Just workspace file? 
   - Also Slack DM summary?
   - Push notification to phone?

3. **How much context per item?**
   - Just link?
   - Pull related initiative?
   - Include customer HubSpot data?

---

*This architecture trades real-time for simplicity. The key insight is that **pre-processed > real-time** for busy PMs.*
