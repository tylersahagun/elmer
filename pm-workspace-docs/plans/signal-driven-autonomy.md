# Signal-Driven Autonomy

> Middle ground: Signals come in, system decides how far to take them

---

## The Concept

Instead of:
- **Full HITL**: You review every signal and decide what to do
- **Full Autonomy**: System works on everything continuously

**Signal-Driven**: Signals arrive → System classifies → Executes to appropriate depth → Escalates only when needed

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGNAL-DRIVEN AUTONOMY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SIGNALS IN                                                                │
│   ──────────                                                                │
│   • Slack message in #customer-feedback                                     │
│   • HubSpot deal note                                                       │
│   • Linear issue from customer                                              │
│   • Call transcript                                                         │
│   • Churn alert                                                             │
│                                                                             │
│           │                                                                  │
│           ▼                                                                  │
│   ┌───────────────────┐                                                     │
│   │  SIGNAL ROUTER    │  ← Classifies signal, decides action depth          │
│   │                   │                                                     │
│   │  "What level of   │                                                     │
│   │   response does   │                                                     │
│   │   this warrant?"  │                                                     │
│   └─────────┬─────────┘                                                     │
│             │                                                                │
│             ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      ACTION LEVELS                                   │  │
│   │                                                                      │  │
│   │  L1: LOG       L2: REPORT     L3: INITIATIVE    L4: SHIP            │  │
│   │  ────────      ──────────     ──────────────    ──────              │  │
│   │  Just save     Synthesize     Create PRD,       All the way to      │  │
│   │  to signals/   + surface      prototype,        Linear + PR         │  │
│   │               to Tyler        validate                              │  │
│   │                                                                      │  │
│   │  Auto: ✓       Auto: ✓        Auto: ✓           Human gate: ✓       │  │
│   │  No review     Async review   Review before     Approve before      │  │
│   │                               ship              merge               │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Action Levels

### L1: Log
**Just capture and categorize**

- Save to `signals/[type]/`
- Tag with initiative, persona, sentiment
- Update `signals/_index.json`
- No notification unless pattern detected

**Triggers:**
- Single data point (one user mentioned X)
- Low urgency signals
- Already-known issues

**Example:**
> "User mentioned they wish the HubSpot sync was faster"
> → Save to signals, tag `hubspot-config`, `performance`

---

### L2: Report
**Synthesize and surface**

- L1 + generate synthesis
- Connect to existing initiatives
- Surface patterns
- Notify Tyler async (daily digest or immediate if urgent)

**Triggers:**
- Multiple signals on same topic (pattern emerging)
- Signals from high-value accounts
- Churn-related signals
- Competitive mentions

**Example:**
> Third user this week mentioned HubSpot sync speed
> → Generate synthesis report, add to daily digest
> → "Pattern detected: HubSpot performance (3 signals this week)"

---

### L3: Initiative
**Create/advance initiative autonomously**

- L2 + create or update initiative
- Generate/update PRD
- Build prototype
- Run validation
- Stop before external action

**Triggers:**
- Strong pattern (5+ signals)
- Revenue-impacting signal
- Churn reason
- Leadership directive
- Roadmap item surfaced

**Example:**
> 5 users + 2 churns mention HubSpot performance
> → Create initiative `hubspot-performance`
> → Generate PRD from signals
> → Build prototype
> → Run jury validation
> → Notify Tyler: "Initiative ready for review"

---

### L4: Ship
**All the way to implementation**

- L3 + create Linear project/issues
- Generate engineering spec
- Create PRs (if possible)
- Human approval gate before merge

**Triggers:**
- Pre-approved initiative types
- Critical bugs
- Security issues
- Explicitly approved by Tyler

**Example:**
> Validated initiative + Tyler approves "ship it"
> → Create Linear project
> → Create issues from engineering spec
> → Assign to appropriate team
> → Track until shipped

---

## Signal Router

The brain that decides action level.

```yaml
# .cursor/agents/signal-router.md

---
name: signal-router
description: Classifies incoming signals and decides appropriate action depth
model: fast
---

# Signal Router

You decide how to handle incoming signals.

## Classification Process

### 1. Extract Signal Metadata

```json
{
  "source": "slack|hubspot|linear|transcript|manual",
  "account_tier": "enterprise|growth|starter|free",
  "account_arr": 50000,
  "user_role": "champion|user|admin|exec",
  "sentiment": "positive|neutral|negative|urgent",
  "topic_match": ["hubspot-config", "performance"],
  "existing_initiative": "hubspot-config|null",
  "signal_count_7d": 3,  // Similar signals this week
  "churn_risk": "high|medium|low|none"
}
```

### 2. Apply Decision Rules

```python
def decide_level(signal):
    # L4: Ship (rare, explicit)
    if signal.explicit_ship_approval:
        return L4_SHIP
    
    # L4: Critical (auto-escalate)
    if signal.is_security_issue or signal.is_critical_bug:
        return L4_SHIP  # With human gate
    
    # L3: Initiative
    if (signal.signal_count_7d >= 5 or
        signal.churn_risk == "high" or
        signal.account_arr >= 100000 or
        signal.is_churn_reason):
        return L3_INITIATIVE
    
    # L2: Report
    if (signal.signal_count_7d >= 2 or
        signal.account_tier == "enterprise" or
        signal.sentiment == "urgent" or
        signal.user_role == "exec"):
        return L2_REPORT
    
    # L1: Log (default)
    return L1_LOG
```

### 3. Execute Action

Based on level, invoke appropriate workflow:

| Level | Workflow |
|-------|----------|
| L1 | `signals-processor` (ingest mode) |
| L2 | `signals-processor` (synthesize) → digest |
| L3 | Full initiative workflow (see below) |
| L4 | L3 + Linear/GitHub workflow |

## Output

```json
{
  "signal_id": "sig-2026-02-01-001",
  "classification": {
    "level": "L3_INITIATIVE",
    "confidence": 0.85,
    "reasoning": "5 signals on same topic, 2 from enterprise accounts"
  },
  "action": {
    "workflow": "initiative-creation",
    "initiative": "hubspot-performance",
    "steps": ["research", "prd", "prototype", "validate"]
  },
  "human_gates": ["before_ship"],
  "notifications": ["daily_digest"]
}
```
```

---

## L3 Initiative Workflow (Autonomous)

When signal router decides L3, this runs automatically:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    L3: AUTONOMOUS INITIATIVE WORKFLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Signal(s)                                                                  │
│      │                                                                      │
│      ▼                                                                      │
│  ┌─────────────────┐                                                       │
│  │ 1. RESEARCH     │  signals-processor (synthesize)                       │
│  │                 │  → research.md with signal quotes                     │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 2. JUDGE        │  Is research sufficient?                              │
│  │                 │  ✓ Yes → Continue                                     │
│  │                 │  ✗ No → Gather more signals, wait                     │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 3. PRD          │  prd-writer                                           │
│  │                 │  → prd.md from research                               │
│  │                 │  → design-brief.md                                    │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 4. JUDGE        │  Is PRD aligned with vision?                          │
│  │                 │  ✓ Yes → Continue                                     │
│  │                 │  ✗ No → Flag for human review                         │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 5. PROTOTYPE    │  proto-builder                                        │
│  │                 │  → Components in prototypes/                          │
│  │                 │  → Deploy to Chromatic                                │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 6. JUDGE        │  Does prototype meet standards?                       │
│  │                 │  ✓ Yes → Continue                                     │
│  │                 │  ↻ Needs work → Iterate (max 3x)                      │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 7. VALIDATE     │  validator (jury evaluation)                          │
│  │                 │  → jury-evaluations/                                  │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 8. NOTIFY       │  Initiative ready for review                          │
│  │                 │  → Slack Tyler with summary                           │
│  │                 │  → Links: PRD, Prototype, Validation                  │
│  │                 │                                                       │
│  │                 │  "HubSpot Performance ready:                          │
│  │                 │   - 5 signals synthesized                             │
│  │                 │   - PRD generated                                     │
│  │                 │   - Prototype at [chromatic]                          │
│  │                 │   - Jury: 78% approval                                │
│  │                 │                                                       │
│  │                 │   Reply 'ship' to create Linear project"              │
│  └─────────────────┘                                                       │
│                                                                             │
│  ════════════════════════════════════════════════════════════════════════  │
│                         🚦 HUMAN GATE HERE 🚦                               │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Tyler reviews and replies:                                                 │
│  • "ship" → Continue to L4                                                 │
│  • "iterate [feedback]" → Back to prototype                                │
│  • "hold" → Park initiative                                                │
│  • "kill" → Archive initiative                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## L4 Ship Workflow (Human-Gated)

When Tyler approves, this runs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    L4: SHIP WORKFLOW (AFTER APPROVAL)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tyler: "ship"                                                              │
│      │                                                                      │
│      ▼                                                                      │
│  ┌─────────────────┐                                                       │
│  │ 1. ENG SPEC     │  Generate engineering-spec.md                         │
│  │                 │  → Technical requirements                             │
│  │                 │  → API contracts                                      │
│  │                 │  → Data models                                        │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 2. LINEAR       │  Create Linear project + issues                       │
│  │    PROJECT      │                                                       │
│  │                 │  → Project: "HubSpot Performance"                     │
│  │                 │  → Issues from eng spec sections                      │
│  │                 │  → Link to PRD, prototype                             │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 3. NOTIFY       │  Alert engineering                                    │
│  │    ENG TEAM     │                                                       │
│  │                 │  → Post to #team-dev                                  │
│  │                 │  → "New project ready: [Linear link]"                 │
│  │                 │  → Include prototype link, PRD link                   │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                       │
│  │ 4. TRACK        │  Monitor Linear progress                              │
│  │                 │                                                       │
│  │                 │  → Update initiative status                           │
│  │                 │  → Surface blockers                                   │
│  │                 │  → Notify Tyler on completion                         │
│  └─────────────────┘                                                       │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  OPTIONAL: Auto-PR (if configured)                                          │
│                                                                             │
│  ┌─────────────────┐                                                       │
│  │ 5. PR CREATION  │  If codebase patterns allow                           │
│  │    (optional)   │                                                       │
│  │                 │  → Create branch                                      │
│  │                 │  → Scaffold component from prototype                  │
│  │                 │  → Create draft PR                                    │
│  │                 │  → Human approval before merge                        │
│  └─────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Signal Sources & Ingestion

### Automatic Ingestion (Continuous)

```yaml
# Signal sources that feed the system automatically

slack_channels:
  - channel: "#customer-feedback"
    poll_interval: 15min
    filter: "contains customer quote or feedback"
    default_level: L1
    
  - channel: "#churn-alert"
    poll_interval: 5min
    filter: "all messages"
    default_level: L2  # Always surface churn
    
  - channel: "#sales-closed-won"
    poll_interval: 30min
    filter: "deal notes with product feedback"
    default_level: L1

hubspot:
  - trigger: "deal_lost"
    extract: "churn_reason"
    default_level: L2
    
  - trigger: "deal_won"
    extract: "why_they_bought"
    default_level: L1

linear:
  - trigger: "issue_created"
    filter: "label:customer-reported"
    default_level: L2
    
  - trigger: "issue_created"
    filter: "label:bug AND priority:urgent"
    default_level: L3  # Auto-investigate

transcripts:
  - source: "gong_webhook"
    filter: "calls with target accounts"
    default_level: L2
```

### Manual Signal Injection

Tyler can still inject signals manually:

```
/signal "Customer X said they need bulk field editing"
→ Signal router classifies and routes

/signal --level=L3 "We need to address HubSpot performance ASAP"
→ Force L3 (initiative) level
```

---

## Daily Operation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SIGNAL-DRIVEN DAILY FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONTINUOUS (24/7)                                                          │
│  ─────────────────                                                          │
│  • Signal ingestion from all sources                                        │
│  • L1 logging (no notification)                                             │
│  • L2 pattern detection (queue for digest)                                  │
│                                                                             │
│  TRIGGERED (when L3+ detected)                                              │
│  ─────────────────────────────                                              │
│  • L3 initiative workflow starts                                            │
│  • Runs through research → PRD → prototype → validate                       │
│  • Notifies Tyler when ready for review                                     │
│                                                                             │
│  MORNING DIGEST (9 AM)                                                      │
│  ─────────────────────                                                      │
│  "📊 Signal Digest - Feb 1, 2026                                            │
│                                                                             │
│   🆕 New Signals (24h)                                                      │
│   • 12 logged (L1)                                                          │
│   • 3 surfaced for review (L2)                                              │
│   • 1 initiative created (L3)                                               │
│                                                                             │
│   📈 Patterns Detected                                                      │
│   • 'HubSpot sync speed' - 5 mentions (↑ from 2 last week)                  │
│   • 'Bulk editing' - 3 mentions (new pattern)                               │
│                                                                             │
│   🚀 Initiatives Ready for Review                                           │
│   • hubspot-performance - [View PRD] [View Prototype] [Jury: 78%]          │
│     Reply 'ship hubspot-performance' to create Linear project              │
│                                                                             │
│   ⏳ In Progress                                                            │
│   • rep-workspace-v4 - Building prototype (ETA: 2 hours)                   │
│                                                                             │
│   🔴 Needs Attention                                                        │
│   • signal-tables - Validation failed (62%), needs iteration"              │
│                                                                             │
│  TYLER'S INTERACTION                                                        │
│  ───────────────────                                                        │
│  Most days: Read digest, reply to ship/iterate/hold                         │
│  Sometimes: Deep dive on flagged items                                      │
│  Rarely: Override level, inject signal manually                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Level Thresholds (Tunable)

```yaml
# pm-workspace-docs/autonomous/config.yaml

thresholds:
  L2_report:
    min_signals: 2
    account_tiers: ["enterprise"]
    sentiment: ["urgent", "negative"]
    
  L3_initiative:
    min_signals: 5
    min_arr_single_account: 100000
    churn_reasons: true
    roadmap_items: true
    
  L4_ship:
    requires_approval: true
    auto_approve:
      - security_fixes
      - critical_bugs

iteration_limits:
  prototype: 3
  prd: 2
  
timeouts:
  research: 2h
  prd: 1h
  prototype: 4h
  validation: 2h
```

### Human Gates (Where You Stay in Control)

```yaml
human_gates:
  # Always require approval
  required:
    - before_linear_project  # Creating engineering work
    - before_external_comms  # Posting to customer-facing channels
    - before_pr_merge        # Code changes
    
  # Optional approval (async review OK)
  optional:
    - prd_created           # Notify but don't block
    - prototype_complete    # Notify but don't block
    - validation_complete   # Notify, wait for ship command
    
  # Never require approval
  autonomous:
    - signal_logging        # L1
    - pattern_detection     # L2
    - research_synthesis    # Part of L3
    - prototype_iteration   # Within limits
```

---

## Implementation

### New Components

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `signal-router` subagent | Classify signals, decide level | Medium |
| `initiative-runner` subagent | Orchestrate L3 workflow | High |
| `ship-runner` subagent | Orchestrate L4 workflow | Medium |
| `config.yaml` | Tunable thresholds | Low |
| Signal ingestion cron | Pull from sources | Medium |

### Modified Components

| Component | Change |
|-----------|--------|
| `signals-processor` | Trigger from router, not manual |
| `prd-writer` | Accept signal context as input |
| `proto-builder` | Auto-iterate on judge feedback |
| `validator` | Output structured verdict |
| Daily digest | Include signal summary |

### Timeline

| Week | Focus |
|------|-------|
| 1 | Signal router + L1/L2 automation |
| 2 | L3 initiative workflow |
| 3 | L4 ship workflow (Linear integration) |
| 4 | Tuning thresholds, testing |

---

## Examples

### Example 1: Low Signal (L1)

```
SIGNAL: User in #customer-feedback says "I like the new dashboard"

ROUTER:
  - sentiment: positive
  - signal_count_7d: 0 (first mention)
  - account_tier: starter
  → Level: L1

ACTION:
  - Save to signals/slack/2026-02-01-dashboard-positive.md
  - Tag: dashboard, positive, starter
  - No notification

TYLER SEES: Nothing (unless checks signals/)
```

### Example 2: Pattern Emerging (L2)

```
SIGNAL: Third user this week mentions HubSpot sync being slow

ROUTER:
  - topic: hubspot-config, performance
  - signal_count_7d: 3 (pattern!)
  - account_tier: mixed (1 enterprise)
  → Level: L2

ACTION:
  - Save signal
  - Generate synthesis: "HubSpot Performance Pattern"
  - Add to daily digest

TYLER SEES: In morning digest
  "📈 Pattern: 'HubSpot sync speed' - 3 mentions this week"
```

### Example 3: Initiative Triggered (L3)

```
SIGNAL: Enterprise customer churned, reason: "HubSpot sync too slow for our volume"

ROUTER:
  - is_churn_reason: true
  - account_arr: 85000
  - existing_signals: 3 on same topic
  → Level: L3

ACTION (autonomous):
  1. Research: Synthesize all 4 signals
  2. PRD: Generate hubspot-performance PRD
  3. Prototype: Build performance-focused options
  4. Validate: Run jury (result: 78%)
  5. Notify Tyler

TYLER SEES: Slack DM
  "🚀 Initiative Ready: hubspot-performance
   
   - 4 signals synthesized (incl. $85K churn)
   - PRD: [link]
   - Prototype: [chromatic link]
   - Jury: 78% approval
   
   Reply:
   • 'ship' - Create Linear project
   • 'iterate [feedback]' - Refine prototype
   • 'hold' - Park for later"
```

### Example 4: Ship Approved (L4)

```
TYLER: "ship"

ACTION (after approval):
  1. Generate engineering-spec.md
  2. Create Linear project "HubSpot Performance"
  3. Create issues:
     - "Optimize HubSpot sync batch size"
     - "Add progress indicator for large syncs"
     - "Implement sync queue prioritization"
  4. Post to #team-dev:
     "New project: HubSpot Performance
      PRD: [link]
      Prototype: [link]
      Issues: [Linear project link]"
  5. Track until shipped

TYLER SEES: Confirmation + Linear link
```

---

## Why This is the Sweet Spot

| Aspect | Full HITL | Signal-Driven | Full Autonomy |
|--------|-----------|---------------|---------------|
| **Tyler's load** | Reviews everything | Reviews outcomes | Reviews exceptions |
| **Response speed** | Hours/days | Minutes/hours | Minutes |
| **Risk** | Low (full control) | Low (gates on ship) | Medium (drift) |
| **Coverage** | Limited by time | Handles volume | Handles volume |
| **Cost** | Low (on-demand) | Medium | High |
| **Overnight work** | None | Yes (L1-L3) | Yes (all) |

**Signal-driven gives you:**
- ✓ Signals never fall through cracks
- ✓ Patterns automatically detected
- ✓ Initiatives auto-generated when warranted
- ✓ You only review outcomes, not inputs
- ✓ Human gate before any external action
- ✓ Scales with signal volume

---

## Your Daily Interaction

**Morning (5 min):**
- Read digest
- Reply "ship"/"iterate"/"hold" to ready initiatives

**Throughout day:**
- Occasional Slack notification when L3 completes
- Override if needed (rare)

**Evening:**
- EOD summary of what shipped
- System continues overnight (L1-L3)

**You're in control of WHAT ships, not WHAT gets analyzed.**

---

*Created: February 1, 2026*
*Status: Recommended middle-ground approach*
