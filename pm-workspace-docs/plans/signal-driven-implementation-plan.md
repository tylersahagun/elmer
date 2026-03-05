# Signal-Driven Autonomy: Full Implementation Plan

> Complete plan for automatic signal ingestion, routing, and autonomous initiative execution

---

## Executive Summary

This plan implements a signal-driven PM system where:
- Signals flow in automatically from Slack, HubSpot, Linear, and AskElephant transcripts
- A router classifies each signal and decides the action level (L1-L4)
- Initiatives are created and progressed autonomously to the validation stage
- You approve before anything ships to Linear/engineering

**Timeline:** 6 weeks
**Estimated Monthly Cost:** $400-800 (API calls)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         SIGNAL-DRIVEN AUTONOMY SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                           SIGNAL SOURCES                                      │  │
│  │                                                                               │  │
│  │   AUTOMATIC (Polling)                    WEBHOOK                              │  │
│  │   ─────────────────────                  ────────                             │  │
│  │   ┌─────────┐ ┌─────────┐ ┌─────────┐   ┌──────────────────────────────┐    │  │
│  │   │  Slack  │ │ HubSpot │ │  Linear │   │ AskElephant Transcript Hook  │    │  │
│  │   │   MCP   │ │   MCP   │ │   MCP   │   │ POST /webhooks/transcript    │    │  │
│  │   └────┬────┘ └────┬────┘ └────┬────┘   └──────────────┬───────────────┘    │  │
│  │        │           │           │                       │                     │  │
│  │        └───────────┴───────────┴───────────────────────┘                     │  │
│  │                                │                                              │  │
│  └────────────────────────────────┼──────────────────────────────────────────────┘  │
│                                   │                                                  │
│                                   ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                         SIGNAL INTAKE QUEUE                                   │  │
│  │                                                                               │  │
│  │   pm-workspace-docs/autonomous/intake-queue.json                             │  │
│  │   ─────────────────────────────────────────────                              │  │
│  │   [                                                                          │  │
│  │     { "id": "...", "source": "slack", "raw": {...}, "received_at": "..." },  │  │
│  │     { "id": "...", "source": "hubspot", "raw": {...}, "received_at": "..." },│  │
│  │     { "id": "...", "source": "transcript", "raw": {...}, "received_at": "..."}│  │
│  │   ]                                                                          │  │
│  │                                                                               │  │
│  └────────────────────────────────┬──────────────────────────────────────────────┘  │
│                                   │                                                  │
│                                   ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                          SIGNAL ROUTER                                        │  │
│  │                                                                               │  │
│  │   .cursor/agents/signal-router.md                                            │  │
│  │   ────────────────────────────────                                           │  │
│  │                                                                               │  │
│  │   1. Parse signal content                                                    │  │
│  │   2. Extract metadata (account, persona, topic, sentiment)                   │  │
│  │   3. Check for patterns (similar signals in last 7 days)                    │  │
│  │   4. Apply decision rules → L1 / L2 / L3 / L4                               │  │
│  │   5. Route to appropriate handler                                            │  │
│  │                                                                               │  │
│  └────────────────────────────────┬──────────────────────────────────────────────┘  │
│                                   │                                                  │
│          ┌────────────────────────┼────────────────────────┐                        │
│          │                        │                        │                        │
│          ▼                        ▼                        ▼                        │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────────────────────┐  │
│  │   L1: LOG     │      │  L2: REPORT   │      │  L3: INITIATIVE              │  │
│  │               │      │               │      │                               │  │
│  │ Save to       │      │ Synthesize +  │      │ Research → PRD → Proto →     │  │
│  │ signals/      │      │ Daily Digest  │      │ Validate → Notify Tyler      │  │
│  │               │      │               │      │                               │  │
│  │ No notify     │      │ Async notify  │      │ 🚦 HUMAN GATE before L4      │  │
│  └───────────────┘      └───────────────┘      └───────────────────────────────┘  │
│                                                             │                       │
│                                                             │ Tyler: "ship"         │
│                                                             ▼                       │
│                                                 ┌───────────────────────────────┐  │
│                                                 │  L4: SHIP                     │  │
│                                                 │                               │  │
│                                                 │ Eng Spec → Linear Project →  │  │
│                                                 │ Issues → Notify #team-dev    │  │
│                                                 └───────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Signal Sources Configuration

```yaml
# pm-workspace-docs/autonomous/sources-config.yaml

polling_sources:
  slack:
    enabled: true
    poll_interval_minutes: 15
    channels:
      - id: "C_CUSTOMER_FEEDBACK"
        name: "#customer-feedback"
        signal_types: ["feedback", "pain_point", "feature_request"]
        default_level: "L1"
        escalate_to_L2_if: "enterprise_account OR negative_sentiment"
        
      - id: "C_CHURN_ALERT"
        name: "#churn-alert"
        signal_types: ["churn_reason", "at_risk"]
        default_level: "L2"  # Always surface churn
        escalate_to_L3_if: "arr >= 50000"
        
      - id: "C_PRODUCT_FORUM"
        name: "#product-forum"
        signal_types: ["feature_request", "feedback", "question"]
        default_level: "L1"
        
      - id: "C_SALES_CLOSED_WON"
        name: "#sales-closed-won"
        signal_types: ["win_reason", "competitive_intel"]
        default_level: "L1"
        extract_fields: ["why_they_bought", "competitive_alternative"]
        
      - id: "C_PRODUCT_ISSUES"
        name: "#product-issues"
        signal_types: ["bug", "issue", "incident"]
        default_level: "L2"
        escalate_to_L3_if: "priority:critical OR multiple_customers"

  hubspot:
    enabled: true
    poll_interval_minutes: 60
    triggers:
      - event: "deal.closed_lost"
        extract: ["churn_reason", "lost_to_competitor", "deal_notes"]
        default_level: "L2"
        escalate_to_L3_if: "arr >= 100000"
        
      - event: "deal.closed_won"
        extract: ["why_won", "decision_factors"]
        default_level: "L1"
        
      - event: "ticket.created"
        filter: "priority:high OR priority:urgent"
        default_level: "L2"

  linear:
    enabled: true
    poll_interval_minutes: 30
    filters:
      - label: "customer-reported"
        default_level: "L2"
        escalate_to_L3_if: "priority <= 2 AND count_7d >= 3"
        
      - label: "feature-request"
        default_level: "L1"
        escalate_to_L2_if: "count_7d >= 3"
        
      - label: "churn-risk"
        default_level: "L3"  # Always create initiative for churn

webhook_sources:
  askelephant_transcript:
    enabled: true
    endpoint: "/webhooks/transcript"
    auth_type: "shared_secret"
    secret_env: "ASKELEPHANT_WEBHOOK_SECRET"
    default_level: "L1"
    escalate_rules:
      - condition: "account_tier == 'enterprise'"
        level: "L2"
      - condition: "sentiment == 'negative' AND topics includes 'churn'"
        level: "L3"
      - condition: "participant_role == 'executive'"
        level: "L2"
```

### 2. Webhook Server for AskElephant Transcripts

```typescript
// pm-workspace-docs/autonomous/webhook-server/index.ts

import express from 'express';
import crypto from 'crypto';
import { appendFileSync, writeFileSync, readFileSync, existsSync } from 'fs';

const app = express();
app.use(express.json({ limit: '10mb' }));

const WEBHOOK_SECRET = process.env.ASKELEPHANT_WEBHOOK_SECRET || '';
const INTAKE_QUEUE_PATH = '../intake-queue.json';

interface TranscriptWebhook {
  event_type: 'transcript.ready';
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  duration_minutes: number;
  participants: Array<{
    name: string;
    email: string;
    role?: string;
    is_external: boolean;
  }>;
  account?: {
    id: string;
    name: string;
    tier: 'enterprise' | 'growth' | 'starter' | 'free';
    arr?: number;
  };
  transcript: {
    full_text: string;
    speakers: Array<{
      name: string;
      segments: Array<{
        start: number;
        end: number;
        text: string;
      }>;
    }>;
  };
  ai_summary?: {
    tldr: string;
    key_points: string[];
    action_items: Array<{
      owner: string;
      task: string;
      due_date?: string;
    }>;
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
  };
  metadata: {
    source: 'zoom' | 'teams' | 'meet' | 'dialpad' | 'ringcentral';
    recording_url?: string;
  };
}

// Verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Add signal to intake queue
function addToIntakeQueue(signal: any) {
  let queue: any[] = [];
  
  if (existsSync(INTAKE_QUEUE_PATH)) {
    queue = JSON.parse(readFileSync(INTAKE_QUEUE_PATH, 'utf-8'));
  }
  
  queue.push({
    id: `sig-${Date.now()}-transcript-${signal.meeting_id}`,
    source: 'askelephant_transcript',
    received_at: new Date().toISOString(),
    processed: false,
    raw: signal
  });
  
  writeFileSync(INTAKE_QUEUE_PATH, JSON.stringify(queue, null, 2));
}

// Transcript webhook endpoint
app.post('/webhooks/transcript', (req, res) => {
  // Verify signature
  const signature = req.headers['x-askelephant-signature'] as string;
  if (!verifySignature(JSON.stringify(req.body), signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const payload: TranscriptWebhook = req.body;
  
  // Validate event type
  if (payload.event_type !== 'transcript.ready') {
    return res.status(400).json({ error: 'Unknown event type' });
  }
  
  // Add to intake queue
  addToIntakeQueue(payload);
  
  console.log(`[${new Date().toISOString()}] Transcript received: ${payload.meeting_title}`);
  
  res.status(200).json({ 
    status: 'queued',
    signal_id: `sig-${Date.now()}-transcript-${payload.meeting_id}`
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.WEBHOOK_PORT || 3847;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
```

**package.json:**

```json
{
  "name": "signal-webhook-server",
  "version": "1.0.0",
  "scripts": {
    "start": "ts-node index.ts",
    "dev": "nodemon index.ts"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "nodemon": "^3.0.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### 3. Signal Ingestion Daemon

```yaml
# .cursor/agents/signal-ingester.md

---
name: signal-ingester
description: Continuously polls external sources and adds signals to intake queue
model: fast
---

# Signal Ingester

You poll configured sources and add raw signals to the intake queue.

## Operation Mode

Run on a schedule (cron or daemon):
- Every 15 minutes: Poll Slack channels
- Every 30 minutes: Poll Linear issues  
- Every 60 minutes: Poll HubSpot events

## Process

### 1. Load Configuration

Read `pm-workspace-docs/autonomous/sources-config.yaml`

### 2. Poll Each Source

#### Slack Polling

For each configured channel:

```
SLACK_FETCH_CONVERSATION_HISTORY
{
  "channel": "[channel_id]",
  "oldest": "[last_poll_timestamp]",
  "limit": 100
}
```

Filter messages:
- Skip bot messages
- Skip thread replies (fetch separately if main message is signal)
- Look for signal patterns (see signals-processor patterns)

#### Linear Polling

```
LINEAR_LIST_LINEAR_ISSUES
{
  "first": 100,
  "filter": {
    "labels": { "name": { "in": ["customer-reported", "feature-request"] } },
    "createdAt": { "gte": "[last_poll_timestamp]" }
  }
}
```

#### HubSpot Polling

```
HUBSPOT_SEARCH_CRM_OBJECTS_BY_CRITERIA
{
  "objectType": "deals",
  "filterGroups": [{
    "filters": [{
      "propertyName": "closedate",
      "operator": "GTE", 
      "value": "[last_poll_timestamp]"
    }, {
      "propertyName": "dealstage",
      "operator": "EQ",
      "value": "closedlost"
    }]
  }],
  "properties": ["dealname", "amount", "closedate", "hs_closed_lost_reason"]
}
```

### 3. Add to Intake Queue

For each signal found:

```json
{
  "id": "sig-[timestamp]-[source]-[hash]",
  "source": "slack|linear|hubspot",
  "received_at": "ISO8601",
  "processed": false,
  "raw": {
    // Source-specific data
  },
  "metadata": {
    "channel": "...",  // for Slack
    "account_id": "...",  // for HubSpot
    "issue_id": "..."  // for Linear
  }
}
```

### 4. Update Last Poll Timestamp

```json
// pm-workspace-docs/autonomous/poll-state.json
{
  "slack": {
    "C_CUSTOMER_FEEDBACK": "2026-02-01T10:15:00Z",
    "C_CHURN_ALERT": "2026-02-01T10:15:00Z"
  },
  "linear": "2026-02-01T10:30:00Z",
  "hubspot": "2026-02-01T11:00:00Z"
}
```

## Output

Log summary:

```
[2026-02-01 10:15:00] Signal Ingestion Complete
- Slack: 3 new signals (2 from #customer-feedback, 1 from #churn-alert)
- Linear: 1 new signal
- HubSpot: 0 new signals
- Total queued: 4
```
```

### 4. Signal Router

```yaml
# .cursor/agents/signal-router.md

---
name: signal-router
description: Classifies signals from intake queue and routes to appropriate action level
model: fast
---

# Signal Router

You process the intake queue and route each signal to the appropriate action level.

## Process

### 1. Load Context

- `pm-workspace-docs/autonomous/sources-config.yaml` (routing rules)
- `pm-workspace-docs/autonomous/intake-queue.json` (unprocessed signals)
- `pm-workspace-docs/signals/_index.json` (existing signals for pattern detection)
- `pm-workspace-docs/initiatives/*/\_meta.json` (link to initiatives)

### 2. For Each Unprocessed Signal

#### A. Parse Content

Extract from raw signal:

```json
{
  "content_text": "...",
  "author": "...",
  "timestamp": "...",
  "source_type": "slack|hubspot|linear|transcript",
  "source_id": "..."
}
```

#### B. Extract Metadata

```json
{
  "account": {
    "id": "...",
    "name": "...",
    "tier": "enterprise|growth|starter|free",
    "arr": 50000
  },
  "persona": {
    "role": "rep|leader|csm|revops|exec",
    "name": "..."
  },
  "sentiment": "positive|neutral|negative|urgent",
  "topics": ["hubspot", "performance", "sync"],
  "signal_type": "feedback|feature_request|bug|churn|win_reason"
}
```

#### C. Pattern Detection

Check for similar signals in last 7 days:

```python
similar_signals = query_index(
  topics=signal.topics,
  date_range="7d",
  exclude_id=signal.id
)

signal_count_7d = len(similar_signals)
unique_accounts = len(set(s.account_id for s in similar_signals))
```

#### D. Apply Decision Rules

```python
def decide_level(signal, similar_count, config):
    source_config = config.sources[signal.source_type]
    
    # Check explicit escalation rules from config
    for rule in source_config.escalate_rules:
        if evaluate_condition(rule.condition, signal):
            return rule.level
    
    # L4: Only via explicit approval (never auto-assigned)
    
    # L3: Initiative creation
    if (
        signal.is_churn_reason or
        similar_count >= 5 or
        (signal.account.arr >= 100000 and signal.sentiment == 'negative') or
        signal.signal_type == 'critical_bug'
    ):
        return 'L3'
    
    # L2: Report and surface
    if (
        similar_count >= 2 or
        signal.account.tier == 'enterprise' or
        signal.sentiment == 'urgent' or
        signal.persona.role == 'exec' or
        signal.source_type == 'churn_alert'
    ):
        return 'L2'
    
    # L1: Log only (default)
    return 'L1'
```

### 3. Route Signal

Based on level, invoke appropriate handler:

| Level | Handler | Action |
|-------|---------|--------|
| L1 | `signals-processor` (ingest) | Save to signals/, update index |
| L2 | `signals-processor` (synthesize) | L1 + generate report, add to digest |
| L3 | `initiative-runner` | Full autonomous initiative workflow |
| L4 | (blocked) | Never auto-assign, requires approval |

### 4. Update Queue Entry

```json
{
  "id": "sig-...",
  "processed": true,
  "processed_at": "ISO8601",
  "classification": {
    "level": "L2",
    "confidence": 0.85,
    "reasoning": "Enterprise account + 3 similar signals"
  },
  "routed_to": "signals-processor",
  "signal_file": "signals/slack/2026-02-01-hubspot-performance.md"
}
```

## Output Format

```markdown
## Signal Routing Report

**Processed:** 4 signals
**Time:** 2026-02-01 10:20:00

| Signal ID | Source | Level | Reasoning |
|-----------|--------|-------|-----------|
| sig-001 | Slack #customer-feedback | L1 | Single mention, starter account |
| sig-002 | Slack #churn-alert | L3 | Churn reason, $85K ARR |
| sig-003 | Linear | L2 | 3 similar issues this week |
| sig-004 | Transcript | L2 | Enterprise account, negative sentiment |

### Actions Taken

- **L1 (1):** Logged to signals/
- **L2 (2):** Added to daily digest
- **L3 (1):** Initiated autonomous workflow for `hubspot-performance`
```
```

### 5. Initiative Runner (L3 Workflow)

```yaml
# .cursor/agents/initiative-runner.md

---
name: initiative-runner
description: Orchestrates the autonomous L3 initiative workflow from signal to validated prototype
model: inherit
---

# Initiative Runner

You run the full autonomous initiative workflow when a signal is classified as L3.

## Workflow

```
Signal (L3)
    │
    ▼
┌─────────────────────┐
│ 1. CHECK EXISTING   │
│    Does initiative  │
│    already exist?   │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  EXISTS      NEW
     │           │
     │           ▼
     │   ┌─────────────────────┐
     │   │ 2. CREATE INITIATIVE │
     │   │    - Folder structure │
     │   │    - _meta.json       │
     │   └──────────┬───────────┘
     │              │
     └──────┬───────┘
            │
            ▼
┌─────────────────────┐
│ 3. RESEARCH         │
│    signals-processor│
│    (synthesize mode)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. JUDGE RESEARCH   │
│    Sufficient for   │
│    PRD? (3+ quotes) │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  PASS        FAIL
     │           │
     │           ▼
     │      Queue for
     │      more signals
     │           │
     ▼           │
┌─────────────────────┐
│ 5. GENERATE PRD     │
│    prd-writer       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. JUDGE PRD        │
│    Aligned with     │
│    vision?          │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  PASS       CONCERN
     │           │
     │           ▼
     │      Flag for
     │      Tyler review
     │           │
     ▼           │
┌─────────────────────┐
│ 7. BUILD PROTOTYPE  │
│    proto-builder    │
│    (with iterations)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 8. JUDGE PROTOTYPE  │
│    Quality bar?     │
│    Max 3 iterations │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  PASS        ITERATE
     │           │
     │      (max 3x)
     │           │
     ▼           │
┌─────────────────────┐
│ 9. VALIDATE         │
│    validator        │
│    (jury system)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 10. NOTIFY TYLER    │
│     Initiative ready│
│     for review      │
└─────────────────────┘
```

## Execution

### Step 1: Check Existing

```python
existing = find_initiative_by_topic(signal.topics)
if existing:
    initiative_slug = existing.slug
    add_signal_to_initiative(existing, signal)
else:
    initiative_slug = create_initiative(signal)
```

### Step 2: Create Initiative

If new:

```
pm-workspace-docs/initiatives/[slug]/
├── _meta.json
├── research.md (will be generated)
└── signals/  (linked signals)
```

```json
// _meta.json
{
  "slug": "hubspot-performance",
  "name": "HubSpot Performance",
  "phase": "discovery",
  "status": "autonomous",
  "created_at": "2026-02-01T10:30:00Z",
  "created_by": "signal-router",
  "trigger_signal": "sig-002",
  "signals": ["sig-002"],
  "autonomous_state": {
    "current_step": "research",
    "iteration": 1,
    "started_at": "2026-02-01T10:30:00Z"
  }
}
```

### Step 3: Research

Invoke `signals-processor` with synthesize mode:

```
/synthesize [initiative-slug] --sources=linked
```

Output: `research.md` with synthesized findings

### Step 4-9: Continue Workflow

Each step:
1. Invoke appropriate subagent
2. Judge output
3. If pass → next step
4. If fail → iterate or flag
5. Update `_meta.json` state

### Step 10: Notify

When validation complete:

```json
// Slack message to Tyler
{
  "channel": "U08JVM8LBP0",
  "blocks": [
    {
      "type": "header",
      "text": "🚀 Initiative Ready: hubspot-performance"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Triggered by:* Churn signal ($85K ARR)\n*Signals:* 5 synthesized\n*Jury:* 78% approval\n\n*Time from signal to validation:* 3.5 hours"
      }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*PRD:*\n<link|View>" },
        { "type": "mrkdwn", "text": "*Prototype:*\n<link|Chromatic>" },
        { "type": "mrkdwn", "text": "*Validation:*\n<link|Report>" }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "✅ Ship to Linear" },
          "value": "ship_hubspot-performance",
          "style": "primary"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "🔄 Iterate" },
          "value": "iterate_hubspot-performance"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "⏸️ Hold" },
          "value": "hold_hubspot-performance"
        }
      ]
    }
  ]
}
```

## Error Handling

If any step fails after max retries:

1. Update `_meta.json` with `status: "blocked"`
2. Notify Tyler with error details
3. Suggest manual intervention

## State Recovery

If system restarts, check `_meta.json.autonomous_state`:
- Resume from `current_step`
- Respect `iteration` count
```

### 6. Ship Runner (L4 Workflow)

```yaml
# .cursor/agents/ship-runner.md

---
name: ship-runner
description: Executes L4 ship workflow after Tyler approval - creates Linear project and issues
model: inherit
---

# Ship Runner

You execute the ship workflow when Tyler approves an initiative.

## Trigger

Tyler responds to initiative notification with:
- "ship" / "ship it" / "approved"
- Button click: "✅ Ship to Linear"
- `/ship [initiative-slug]`

## Workflow

### 1. Generate Engineering Spec

If not exists, generate `engineering-spec.md`:

```markdown
# Engineering Spec: [Initiative]

## Overview
[From PRD]

## Technical Requirements

### Data Models
[Changes needed]

### API Changes
[New endpoints, modifications]

### UI Components
[From prototype, what needs production implementation]

### Migrations
[Database changes if any]

## Implementation Plan

### Phase 1: [Name]
- Task 1.1: [Description]
- Task 1.2: [Description]

### Phase 2: [Name]
- Task 2.1: [Description]

## Testing Requirements
[Key test cases]

## Rollout Plan
[Feature flags, gradual rollout]
```

### 2. Create Linear Project

```
LINEAR_CREATE_LINEAR_PROJECT
{
  "name": "[Initiative Name]",
  "description": "PRD: [link]\nPrototype: [link]\nValidation: [link]",
  "teamIds": ["[product-team-id]"]
}
```

Update `_meta.json`:
```json
{
  "linear_project_id": "[new-project-id]"
}
```

### 3. Create Linear Issues

For each task in engineering spec:

```
LINEAR_CREATE_LINEAR_ISSUE
{
  "title": "[Task title]",
  "description": "[Task description]\n\nFrom: [initiative-slug]\nSpec section: [section]",
  "projectId": "[project-id]",
  "priority": [1-4],
  "labels": ["from-pm-workspace"]
}
```

### 4. Notify Engineering

Post to #team-dev:

```json
{
  "channel": "C_TEAM_DEV",
  "blocks": [
    {
      "type": "header",
      "text": "📦 New Project: [Initiative Name]"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Background:* [1-sentence from PRD]\n*Issues:* X created\n*Priority:* [P level]"
      }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Linear:*\n<link|Project>" },
        { "type": "mrkdwn", "text": "*PRD:*\n<link|Document>" },
        { "type": "mrkdwn", "text": "*Prototype:*\n<link|Chromatic>" }
      ]
    }
  ]
}
```

### 5. Update Initiative Status

```json
{
  "phase": "build",
  "status": "shipped_to_linear",
  "shipped_at": "ISO8601",
  "linear_project_id": "...",
  "linear_issues": ["ASK-XXX", "ASK-YYY", ...]
}
```

### 6. Confirm to Tyler

```
✅ Shipped: hubspot-performance

Linear project created: [link]
Issues created: 5
Posted to #team-dev

I'll track progress and notify you when shipped.
```
```

### 7. Cycle Manager (Orchestrator)

```yaml
# .cursor/agents/cycle-manager.md

---
name: cycle-manager
description: Orchestrates the signal-driven system - runs ingestion, routing, and monitors autonomous work
model: fast
---

# Cycle Manager

You orchestrate the signal-driven autonomy system.

## Modes

### Daemon Mode (Recommended)

Runs continuously with sleep intervals:

```
while True:
    run_cycle()
    sleep(CYCLE_INTERVAL)  # 15 minutes default
```

### Cron Mode

Run via cron/scheduler:
- `*/15 * * * *` - Every 15 minutes

## Cycle Execution

```python
def run_cycle():
    timestamp = now()
    
    # 1. Ingest new signals
    log("Starting signal ingestion...")
    invoke_subagent("signal-ingester")
    
    # 2. Route queued signals
    log("Routing signals...")
    invoke_subagent("signal-router")
    
    # 3. Check autonomous initiatives
    log("Checking autonomous initiatives...")
    for initiative in get_autonomous_initiatives():
        check_initiative_progress(initiative)
    
    # 4. Generate reports if scheduled
    if is_digest_time(timestamp):
        generate_daily_digest()
    
    # 5. Save cycle state
    save_cycle_state(timestamp)
```

## Daily Digest

Generate at 9 AM:

```markdown
# 📊 Signal Digest - [Date]

## New Signals (24h)

| Level | Count | Action |
|-------|-------|--------|
| L1 (Logged) | 12 | Saved to signals/ |
| L2 (Reported) | 4 | See patterns below |
| L3 (Initiative) | 1 | Auto-created |

## 📈 Patterns Detected

### HubSpot Performance (5 signals)
- Sources: 3 Slack, 1 churn, 1 Linear
- Accounts: 2 enterprise, 1 growth
- **Action:** L3 initiative auto-created

### Bulk Editing (3 signals)
- Sources: 2 Slack, 1 transcript
- Personas: 3 reps
- **Action:** Monitoring (L2)

## 🚀 Initiatives Ready for Review

### hubspot-performance
- **Trigger:** Churn signal ($85K ARR)
- **Status:** Validated (78% jury)
- **Links:** [PRD] [Prototype] [Validation]
- **Reply:** "ship hubspot-performance" to create Linear project

## ⏳ Autonomous Work in Progress

### rep-workspace-v4
- **Step:** Building prototype (iteration 2/3)
- **ETA:** ~2 hours

## 🔴 Needs Attention

- signal-tables: Validation failed (62%), needs manual review

## 📋 Quick Actions

- "ship [slug]" - Approve initiative for Linear
- "iterate [slug] [feedback]" - Request changes
- "hold [slug]" - Pause initiative
- "status" - See all initiatives
```

## Commands

Tyler can interact via:

- **Slack reply:** "ship hubspot-performance"
- **Command:** `/ship [slug]`
- **Command:** `/iterate [slug] [feedback]`
- **Command:** `/hold [slug]`
- **Command:** `/signal-status` - See all autonomous work
```

---

## File Structure

```
pm-workspace-docs/
├── autonomous/
│   ├── config.yaml              # System configuration
│   ├── sources-config.yaml      # Signal source definitions
│   ├── intake-queue.json        # Pending signals
│   ├── poll-state.json          # Last poll timestamps
│   ├── cycle-state.json         # Cycle execution state
│   └── webhook-server/          # Express server for transcripts
│       ├── package.json
│       ├── tsconfig.json
│       └── index.ts
├── signals/
│   ├── _index.json              # Signal index (existing)
│   ├── transcripts/             # (existing)
│   ├── slack/                   # (existing)
│   ├── hubspot/                 # NEW: HubSpot signals
│   ├── issues/                  # (existing)
│   └── auto-ingested/           # NEW: Auto-ingested signals
├── initiatives/
│   └── [slug]/
│       └── _meta.json           # Updated with autonomous_state

.cursor/
├── agents/
│   ├── signal-ingester.md       # NEW
│   ├── signal-router.md         # NEW
│   ├── initiative-runner.md     # NEW
│   ├── ship-runner.md           # NEW
│   ├── cycle-manager.md         # NEW
│   └── work-judge.md            # NEW
├── commands/
│   ├── ship.md                  # NEW
│   ├── signal-status.md         # NEW
│   └── hold.md                  # NEW
└── skills/
    └── signal-classification/   # NEW
        └── SKILL.md
```

---

## Implementation Timeline

### Week 1: Foundation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Create autonomous folder structure | Config files, queue files |
| 3-4 | Build signal-ingester subagent | Polling from Slack, Linear |
| 5 | Test manual ingestion cycle | Signals appearing in queue |

### Week 2: Routing & Webhook

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Build signal-router subagent | Classification working |
| 3-4 | Build webhook server | Transcript endpoint live |
| 5 | Integrate with AskElephant | Transcripts flowing in |

### Week 3: L3 Workflow

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Build initiative-runner subagent | Research → PRD working |
| 3-4 | Add prototype step | Proto-builder integration |
| 5 | Add validation step | Full L3 workflow working |

### Week 4: L4 & Notifications

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Build ship-runner subagent | Linear project creation |
| 3-4 | Build notification system | Slack DMs working |
| 5 | Add approval commands | /ship, /hold working |

### Week 5: Cycle Manager & Digest

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Build cycle-manager | Continuous operation |
| 3-4 | Build daily digest | Morning summary |
| 5 | Testing and tuning | Thresholds calibrated |

### Week 6: Production & Monitoring

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Deploy webhook server | Production endpoint |
| 3-4 | Set up monitoring | Alerts on failures |
| 5 | Documentation | AGENTS.md updated |

---

## Configuration Tuning

### Signal Classification Thresholds

```yaml
# Start conservative, tune based on experience

thresholds:
  L2_minimum_signals: 2           # Tune down if missing patterns
  L3_minimum_signals: 5           # Tune down if missing initiatives
  L3_churn_arr_threshold: 50000   # Tune based on your ARR distribution
  L3_enterprise_negative: true    # Always L3 for enterprise complaints
  
iteration_limits:
  prototype_max_iterations: 3     # Tune up if quality needs more passes
  research_min_quotes: 3          # Tune down if blocking too much
  
timeouts:
  research_hours: 2
  prd_hours: 1
  prototype_hours: 4
  validation_hours: 2
```

### Monitoring

Track these metrics:

```yaml
metrics:
  - name: signals_per_day
    target: ">10"
    alert_if: "<5 for 2 days"
    
  - name: l3_initiatives_per_week
    target: "1-3"
    alert_if: ">5"  # Over-triggering
    
  - name: time_to_validation_hours
    target: "<6"
    alert_if: ">12"
    
  - name: prototype_iteration_avg
    target: "<2"
    alert_if: ">2.5"  # Quality issues
    
  - name: human_override_rate
    target: "<20%"
    alert_if: ">30%"  # Classification issues
```

---

## AskElephant Webhook Integration

### Setup in AskElephant

1. Go to AskElephant Settings → Integrations → Webhooks
2. Add new webhook:
   - **URL:** `https://[your-domain]:3847/webhooks/transcript`
   - **Events:** `transcript.ready`
   - **Secret:** Generate and save to `ASKELEPHANT_WEBHOOK_SECRET`

### Webhook Payload (Expected)

```json
{
  "event_type": "transcript.ready",
  "meeting_id": "mtg_abc123",
  "meeting_title": "Customer Call - Acme Corp",
  "meeting_date": "2026-02-01T14:00:00Z",
  "duration_minutes": 45,
  "participants": [
    {
      "name": "John Smith",
      "email": "john@acme.com",
      "role": "VP Sales",
      "is_external": true
    },
    {
      "name": "Tyler Sahagun",
      "email": "tyler@askelephant.com",
      "is_external": false
    }
  ],
  "account": {
    "id": "acc_xyz789",
    "name": "Acme Corp",
    "tier": "enterprise",
    "arr": 120000
  },
  "transcript": {
    "full_text": "...",
    "speakers": [...]
  },
  "ai_summary": {
    "tldr": "Customer expressed concerns about HubSpot sync speed...",
    "key_points": ["Performance issues", "Considering alternatives"],
    "action_items": [...],
    "sentiment": "negative",
    "topics": ["hubspot", "performance", "churn-risk"]
  }
}
```

### Processing Flow

```
Transcript arrives via webhook
    │
    ▼
Webhook server validates signature
    │
    ▼
Adds to intake-queue.json
    │
    ▼
Signal router classifies:
    - Enterprise + negative + churn-risk topics = L3
    │
    ▼
Initiative runner creates/updates initiative
    │
    ▼
Tyler notified when ready
```

---

## Quick Start Commands

After implementation, your daily workflow:

```bash
# Morning: Check what happened overnight
/signal-status

# React to ready initiatives
"ship hubspot-performance"
"iterate rep-workspace feedback: focus more on quota tracking"
"hold signal-tables"

# Manual signal injection (rare)
/signal "Customer X mentioned they need bulk editing"
/signal --level=L3 "Critical: HubSpot sync failing for enterprise accounts"

# Check specific initiative
/status hubspot-performance

# Pause all autonomous work (if needed)
/autonomous pause

# Resume
/autonomous resume
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Signals captured vs. manual | 10x more signals flowing in |
| Time from signal to initiative | <4 hours (was: whenever Tyler noticed) |
| Initiatives ready for review per week | 1-3 high-quality |
| Tyler's daily PM time | 30 min review vs. hours of manual work |
| Missed patterns | Near zero |

---

*Created: February 1, 2026*
*Status: Ready for implementation*
