# Call Type Analysis & Processing Strategy

> Comprehensive analysis of call types across AskElephant org and optimal processing for PM workspace ingestion

---

## Executive Summary

This document maps every call type across the 39-person org, categorizes them by PM signal value, and recommends whether AskElephant should:

1. **Pre-process → Structured payload** (recommended for most)
2. **Send raw transcript** (for high-context calls)
3. **Skip entirely** (no PM signal value)

**Key Recommendation:** AskElephant should send **structured payloads** for 80% of calls, with the option to include raw transcript for flagged high-value calls.

---

## Org Call Matrix

### Sales Team (10 people)

| Role | People | Call Types | Volume Est. |
|------|--------|------------|-------------|
| SDRs | 4 | Prospecting, Qualification | 40-60/week each |
| AEs | 2 | Discovery, Demo, Negotiation, Close | 15-25/week each |
| Partnerships | 3 | Partner, Co-selling, Enablement | 10-15/week each |

### Customer Experience (7 people)

| Role | People | Call Types | Volume Est. |
|------|--------|------------|-------------|
| CSMs | 5 | Onboarding, Check-in, QBR, Renewal, Escalation | 15-25/week each |
| Technical Support | 1 | Support, Troubleshooting | 20-30/week |
| Solutions Engineer | 1 | Technical Discovery, Implementation | 10-15/week |

### Product (4 people)

| Role | People | Call Types | Volume Est. |
|------|--------|------------|-------------|
| VP Product | 1 | Strategy, Customer Research, Leadership | 8-12/week |
| PM (Tyler) | 1 | User Research, Planning, Stakeholder | 5-10/week |
| Designers | 2 | Design Review, User Testing | 5-8/week each |

### Engineering (7 people)

| Role | People | Call Types | Volume Est. |
|------|--------|------------|-------------|
| Leadership | 2 | Architecture, Planning, Cross-team | 5-10/week each |
| Engineers | 5 | Standups, Pairing, Reviews | 10-15/week each |

### Marketing (6 people)

| Role | People | Call Types | Volume Est. |
|------|--------|------------|-------------|
| VP Marketing | 1 | Strategy, Agency, Analyst | 5-10/week |
| Team | 5 | Webinars, Podcasts, Customer Reference | 3-8/week each |

### Executive (1 person)

| Role | People | Call Types | Volume Est. |
|------|--------|------------|-------------|
| Founder | 1 | Board, Investor, Strategic, All-hands | 10-15/week |

---

## Call Type Deep Dive

### 1. SDR Calls

**Participants:** Adia Barkley, Carter Thomas, Jamis Benson, Michael Haimowitz

#### Cold/Prospecting Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Low (volume too high, mostly rejection) |
| **Volume** | 150-200/week total |
| **External Participants** | Prospects (unknown tier) |
| **Typical Duration** | 2-5 minutes |

**Processing Recommendation:** 
```
┌─────────────────────────────────────────────────────────────┐
│  SKIP or MINIMAL                                            │
│                                                             │
│  • Don't send to PM workspace by default                    │
│  • Exception: Flag calls where prospect mentions competitor │
│    or specific pain point                                   │
│  • AskElephant pre-filters based on keywords               │
└─────────────────────────────────────────────────────────────┘
```

**If sent, payload:**
```json
{
  "call_type": "sdr_prospecting",
  "send_to_pm": false,
  "flag_if": ["competitor_mentioned", "pain_point_expressed", "interest_shown"],
  "payload_if_flagged": "minimal"
}
```

#### Qualification/Discovery Calls (SDR)

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Medium (ICP validation, pain point discovery) |
| **Volume** | 20-30/week total |
| **External Participants** | Qualified prospects |
| **Typical Duration** | 15-30 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED → STRUCTURED                                 │
│                                                             │
│  AskElephant extracts:                                      │
│  • Pain points mentioned                                    │
│  • Current tools/competitors                                │
│  • Use case fit (which persona)                             │
│  • Objections raised                                        │
│                                                             │
│  PM workspace receives structured payload only              │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "sdr_qualification",
  "processing": "askelephant_structured",
  "payload": {
    "pain_points": ["manual CRM updates", "missing meeting notes"],
    "current_tools": ["Gong", "HubSpot"],
    "persona_fit": "sales_rep",
    "objections": ["price concern", "already have solution"],
    "icp_score": 7,
    "key_quotes": [
      { "topic": "pain", "quote": "We spend 2 hours a day on CRM updates" }
    ]
  },
  "include_transcript": false
}
```

---

### 2. AE Calls

**Participants:** Michael Cook, Reuben Tang

#### Discovery Calls (AE)

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | High (deep pain point exploration, buying criteria) |
| **Volume** | 10-15/week total |
| **External Participants** | Decision makers, champions |
| **Typical Duration** | 30-45 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW AVAILABLE                              │
│                                                             │
│  AskElephant extracts:                                      │
│  • Business problems (with quotes)                          │
│  • Success criteria                                         │
│  • Decision process                                         │
│  • Competitive landscape                                    │
│  • Budget/timeline signals                                  │
│                                                             │
│  PM workspace receives structured + transcript on request   │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "ae_discovery",
  "processing": "askelephant_structured",
  "account": {
    "name": "Acme Corp",
    "tier": "enterprise",
    "arr_potential": 85000
  },
  "payload": {
    "business_problems": [
      {
        "problem": "Reps not logging meeting notes",
        "impact": "Forecast accuracy suffering",
        "quote": "We're flying blind on 40% of our pipeline",
        "speaker": "VP Sales"
      }
    ],
    "success_criteria": ["95% meeting capture", "CRM sync accuracy"],
    "decision_process": {
      "timeline": "Q1",
      "stakeholders": ["VP Sales", "RevOps", "IT"],
      "budget_holder": "VP Sales"
    },
    "competitive_context": {
      "current_tool": "Gong",
      "pain_with_current": "Too expensive, low adoption"
    }
  },
  "transcript_available": true,
  "transcript_url": "askelephant://transcripts/xxx"
}
```

#### Demo Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | High (feature reactions, objections, use case validation) |
| **Volume** | 8-12/week total |
| **External Participants** | Buyers, evaluators |
| **Typical Duration** | 45-60 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW AVAILABLE                              │
│                                                             │
│  AskElephant extracts:                                      │
│  • Feature reactions (positive/negative)                    │
│  • Questions asked (feature gaps)                           │
│  • Objections raised                                        │
│  • "Aha moments"                                            │
│  • Competitive comparisons mentioned                        │
│                                                             │
│  Critical for: Feature prioritization, positioning         │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "ae_demo",
  "processing": "askelephant_structured",
  "payload": {
    "feature_reactions": [
      {
        "feature": "auto_crm_sync",
        "reaction": "positive",
        "quote": "This would save my team 10 hours a week",
        "speaker": "RevOps Manager"
      },
      {
        "feature": "workflow_builder",
        "reaction": "question",
        "quote": "Can this integrate with our custom objects?",
        "gap_signal": true
      }
    ],
    "objections": [
      {
        "type": "integration",
        "detail": "Need Salesforce support, not just HubSpot",
        "blocker": true
      }
    ],
    "aha_moments": [
      {
        "feature": "meeting_prep",
        "quote": "Wait, it pulls in the deal context automatically?",
        "timestamp": "23:45"
      }
    ],
    "competitive_mentions": ["Gong", "Chorus"]
  },
  "transcript_available": true
}
```

#### Negotiation/Close Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Medium (pricing feedback, final objections) |
| **Volume** | 5-8/week total |
| **External Participants** | Decision makers, procurement |
| **Typical Duration** | 30-45 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED → STRUCTURED                                 │
│                                                             │
│  AskElephant extracts:                                      │
│  • Pricing objections                                       │
│  • Final blockers                                           │
│  • Win/loss signals                                         │
│  • Competitive positioning                                  │
│                                                             │
│  Less transcript needed (mostly commercial discussion)      │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. CSM Calls

**Participants:** Eli Gomez, Erika Vasquez, Parker Alexander, Tyler Whittaker, Jasmin Beckwith

#### Onboarding Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | High (activation friction, first impressions, use case clarity) |
| **Volume** | 10-15/week total |
| **External Participants** | New customers, admins |
| **Typical Duration** | 30-60 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW AVAILABLE                              │
│                                                             │
│  AskElephant extracts:                                      │
│  • Setup friction points                                    │
│  • Integration issues                                       │
│  • Use case expectations vs reality                         │
│  • Feature questions (onboarding gaps)                      │
│  • Success criteria defined                                 │
│                                                             │
│  Critical for: Onboarding UX, activation metrics           │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "csm_onboarding",
  "processing": "askelephant_structured",
  "account": {
    "name": "Beta Inc",
    "tier": "growth",
    "arr": 24000,
    "days_since_close": 5
  },
  "payload": {
    "setup_friction": [
      {
        "step": "calendar_integration",
        "issue": "Google Workspace SSO confusion",
        "severity": "medium",
        "quote": "We couldn't figure out how to connect our team calendars"
      }
    ],
    "integration_issues": [
      {
        "integration": "hubspot",
        "issue": "Custom properties not syncing",
        "blocker": false
      }
    ],
    "use_case_expectations": {
      "primary": "meeting capture for SDR team",
      "secondary": "coaching for AEs",
      "gap_identified": "Expected bulk meeting import"
    },
    "feature_questions": [
      "Can we record Zoom and Teams?",
      "How do we set up team-wide privacy rules?"
    ],
    "success_criteria": {
      "metric": "95% meeting capture",
      "timeline": "30 days"
    }
  },
  "transcript_available": true
}
```

#### Check-in / QBR Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Very High (usage patterns, satisfaction, churn signals, expansion) |
| **Volume** | 15-25/week total |
| **External Participants** | Champions, executives |
| **Typical Duration** | 30-45 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW FOR HIGH-VALUE                         │
│                                                             │
│  AskElephant extracts:                                      │
│  • Satisfaction signals (NPS proxy)                         │
│  • Feature requests                                         │
│  • Churn risk indicators                                    │
│  • Expansion signals                                        │
│  • Competitive threats                                      │
│  • Success/failure stories                                  │
│                                                             │
│  CRITICAL: Enterprise + negative sentiment → include raw   │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "csm_qbr",
  "processing": "askelephant_structured",
  "account": {
    "name": "Gamma Corp",
    "tier": "enterprise",
    "arr": 120000,
    "tenure_months": 8
  },
  "payload": {
    "satisfaction": {
      "overall": "positive",
      "nps_proxy": 8,
      "sentiment_quotes": [
        { "sentiment": "positive", "quote": "Our reps actually use it daily now" }
      ]
    },
    "feature_requests": [
      {
        "request": "Bulk field editing in HubSpot sync",
        "priority": "high",
        "use_case": "RevOps quarterly cleanup",
        "quote": "We need to update 500 contacts at once"
      }
    ],
    "churn_signals": [],  // Empty = good
    "expansion_signals": [
      {
        "type": "new_team",
        "detail": "CS team wants to use for customer calls",
        "potential_seats": 15
      }
    ],
    "competitive_mentions": [],
    "success_stories": [
      {
        "metric": "CRM data accuracy",
        "before": "60%",
        "after": "95%",
        "quote": "Our forecast accuracy improved by 20%"
      }
    ]
  },
  "transcript_available": true,
  "auto_include_raw": false  // Would be true if churn_signals not empty
}
```

#### Renewal Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Very High (churn reasons, value validation) |
| **Volume** | 3-5/week total |
| **External Participants** | Decision makers, finance |
| **Typical Duration** | 30-45 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + ALWAYS INCLUDE RAW                         │
│                                                             │
│  Renewal calls are gold for PM:                             │
│  • Why they're staying (value proof)                        │
│  • Why they might leave (churn prevention)                  │
│  • Price sensitivity signals                                │
│  • Competitive pressure                                     │
│                                                             │
│  Always include full transcript for these                   │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "csm_renewal",
  "processing": "askelephant_structured",
  "account": {
    "name": "Delta LLC",
    "tier": "growth",
    "arr": 36000,
    "renewal_date": "2026-03-01"
  },
  "payload": {
    "renewal_likelihood": "at_risk",
    "decision_factors": [
      {
        "factor": "ROI clarity",
        "status": "concern",
        "quote": "We're not sure we're getting value compared to Gong"
      },
      {
        "factor": "adoption",
        "status": "positive",
        "quote": "The team does use it daily"
      }
    ],
    "churn_risk_reasons": [
      {
        "reason": "pricing",
        "detail": "Budget cut, evaluating alternatives",
        "severity": "high"
      }
    ],
    "competitive_pressure": {
      "competitor": "Gong",
      "threat_level": "medium",
      "quote": "Gong is offering us a steep discount"
    },
    "save_opportunity": {
      "type": "discount",
      "detail": "Would stay at 20% discount"
    }
  },
  "transcript_available": true,
  "include_transcript": true,  // Always for renewals
  "transcript": "..." // Full text included
}
```

#### Escalation / Support Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | High (bugs, UX issues, reliability) |
| **Volume** | 5-10/week total |
| **External Participants** | Frustrated users |
| **Typical Duration** | 15-30 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW FOR P1/P2                              │
│                                                             │
│  AskElephant extracts:                                      │
│  • Issue category                                           │
│  • Severity/impact                                          │
│  • Steps to reproduce                                       │
│  • User frustration level                                   │
│  • Workaround provided?                                     │
│                                                             │
│  Link to Linear if issue created                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Product Calls

**Participants:** Sam Ho, Tyler Sahagun, Skylar Sanford, Adam Shumway

#### Customer Research Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Critical (primary research source) |
| **Volume** | 3-8/week total |
| **External Participants** | Users, champions |
| **Typical Duration** | 30-60 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  ALWAYS SEND RAW + PRE-PROCESSED                            │
│                                                             │
│  These are gold - full context needed:                      │
│  • Pre-processed summary for quick review                   │
│  • Full transcript for deep analysis                        │
│  • Verbatim quotes preserved                                │
│                                                             │
│  PM workspace should receive both formats                   │
└─────────────────────────────────────────────────────────────┘
```

**Payload:**
```json
{
  "call_type": "product_research",
  "processing": "askelephant_structured",
  "research_metadata": {
    "initiative": "hubspot-config",
    "research_question": "How do users manage field mappings?",
    "participant_persona": "revops",
    "participant_company_size": "mid-market"
  },
  "payload": {
    "key_insights": [
      {
        "insight": "Users expect bulk editing for field mappings",
        "evidence_strength": "strong",
        "quotes": [
          "I have 200 custom properties, there's no way I'm doing them one by one"
        ]
      }
    ],
    "jobs_to_be_done": [
      {
        "job": "Keep HubSpot data clean after meetings",
        "current_solution": "Manual export to Excel, clean, re-import",
        "pain_level": "high"
      }
    ],
    "feature_reactions": [...],
    "prototype_feedback": [...],
    "verbatim_quotes": [
      {
        "topic": "workflow",
        "quote": "...",
        "timestamp": "12:34",
        "speaker": "participant"
      }
    ]
  },
  "transcript_available": true,
  "include_transcript": true,
  "transcript": "..."  // Full text
}
```

#### Internal Planning Calls (Product)

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Low for external signals, High for context |
| **Volume** | 5-10/week total |
| **Participants** | Internal only |
| **Typical Duration** | 30-60 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED FOR CONTEXT UPDATES                          │
│                                                             │
│  AskElephant extracts:                                      │
│  • Decisions made                                           │
│  • Action items                                             │
│  • Strategy changes                                         │
│  • Roadmap updates                                          │
│                                                             │
│  → company-context updates, not signals/                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Executive Calls

**Participants:** Woody Klemetson, Robert Henderson, Sam Ho

#### Leadership Strategy Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Critical (company direction, priorities) |
| **Volume** | 5-10/week total |
| **Participants** | Leadership team |
| **Typical Duration** | 30-60 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW AVAILABLE                              │
│                                                             │
│  AskElephant extracts:                                      │
│  • Strategic decisions                                      │
│  • Priority changes                                         │
│  • Leadership quotes (for product-vision.md)                │
│  • OKR/goal updates                                         │
│                                                             │
│  → company-context updates + signals                        │
└─────────────────────────────────────────────────────────────┘
```

#### Board / Investor Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Medium (market pressure, growth expectations) |
| **Volume** | 1-2/month |
| **Participants** | Investors, board |
| **Typical Duration** | 60 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRIVACY-GATED                                              │
│                                                             │
│  These calls may have confidentiality requirements.         │
│  Default: Don't send to PM workspace                        │
│  Exception: If Woody explicitly flags for PM context        │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Partnership Calls

**Participants:** James Hinkson, Pete Belliston, Tanner Mattson

#### Partner Meetings

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Medium (integration requests, market intel) |
| **Volume** | 10-15/week total |
| **External Participants** | HubSpot team, integration partners |
| **Typical Duration** | 30-45 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED → STRUCTURED                                 │
│                                                             │
│  AskElephant extracts:                                      │
│  • Integration requests                                     │
│  • Partner feedback on product                              │
│  • Market/competitive intel                                 │
│  • Co-selling requirements                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Engineering Calls

**Participants:** Bryan Lund, Kaden Wilkinson, team

#### Internal Engineering Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | Low (implementation details, not customer signal) |
| **Volume** | 30-50/week total |
| **Participants** | Internal only |
| **Typical Duration** | 15-30 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  SKIP for PM workspace                                      │
│                                                             │
│  • Standups, pairing, code reviews                          │
│  • No customer signal value                                 │
│  • Exception: Architecture decisions that affect product    │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Marketing Calls

**Participants:** Tony Mickelsen, team

#### Customer Reference Calls

| Attribute | Value |
|-----------|-------|
| **PM Signal Value** | High (case study material, success stories) |
| **Volume** | 2-5/week |
| **External Participants** | Happy customers |
| **Typical Duration** | 30-45 minutes |

**Processing Recommendation:**
```
┌─────────────────────────────────────────────────────────────┐
│  PRE-PROCESSED + RAW                                        │
│                                                             │
│  AskElephant extracts:                                      │
│  • Success metrics (quotable)                               │
│  • Use case details                                         │
│  • Quotable testimonials                                    │
│  • Feature highlights                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: Processing Strategy by Call Type

### Send to PM Workspace

| Call Type | Volume | Processing | Include Raw | Signal Level |
|-----------|--------|------------|-------------|--------------|
| **AE Discovery** | 10-15/wk | Structured | On request | High |
| **AE Demo** | 8-12/wk | Structured | On request | High |
| **CSM Onboarding** | 10-15/wk | Structured | On request | High |
| **CSM QBR/Check-in** | 15-25/wk | Structured | If churn signals | Very High |
| **CSM Renewal** | 3-5/wk | Structured | **Always** | Critical |
| **CSM Escalation** | 5-10/wk | Structured | If P1/P2 | High |
| **Product Research** | 3-8/wk | Structured | **Always** | Critical |
| **Leadership Strategy** | 5-10/wk | Structured | On request | High |
| **Partner Meetings** | 10-15/wk | Structured | No | Medium |
| **SDR Qualification** | 20-30/wk | Structured | No | Medium |
| **Marketing Reference** | 2-5/wk | Structured | On request | Medium |

### Do NOT Send to PM Workspace (Default)

| Call Type | Volume | Reason |
|-----------|--------|--------|
| SDR Cold Calls | 150-200/wk | Volume, low signal |
| Engineering Internal | 30-50/wk | No customer signal |
| AE Negotiation/Close | 5-8/wk | Mostly commercial |
| Board/Investor | 1-2/mo | Confidential |
| Internal Planning | 5-10/wk | Context only |

---

## Webhook Payload Specification

### Standard Payload (Structured)

```json
{
  "event_type": "call.processed",
  "call_id": "call_abc123",
  
  // Call metadata
  "call_metadata": {
    "title": "QBR - Acme Corp",
    "date": "2026-02-01T14:00:00Z",
    "duration_minutes": 45,
    "source": "zoom"
  },
  
  // Classification (AskElephant determines)
  "classification": {
    "call_type": "csm_qbr",
    "pm_signal_value": "high",
    "recommended_level": "L2",
    "include_transcript": false
  },
  
  // Account context (from AskElephant/CRM)
  "account": {
    "id": "acc_xyz",
    "name": "Acme Corp",
    "tier": "enterprise",
    "arr": 120000,
    "tenure_months": 8,
    "health_score": 85
  },
  
  // Participants
  "participants": {
    "internal": [
      { "name": "Eli Gomez", "role": "CSM", "slack_id": "U060G4DK1CZ" }
    ],
    "external": [
      { "name": "Jane Smith", "role": "VP Sales", "is_champion": true }
    ]
  },
  
  // Pre-extracted signals (AskElephant AI)
  "signals": {
    "satisfaction": {
      "overall": "positive",
      "nps_proxy": 8
    },
    "feature_requests": [
      {
        "request": "Bulk field editing",
        "priority": "high",
        "quote": "We need to update 500 contacts at once"
      }
    ],
    "churn_signals": [],
    "expansion_signals": [
      { "type": "new_team", "potential_seats": 15 }
    ],
    "competitive_mentions": [],
    "key_quotes": [
      {
        "topic": "success",
        "quote": "Our forecast accuracy improved by 20%",
        "sentiment": "positive",
        "speaker": "Jane Smith"
      }
    ]
  },
  
  // Summary (AskElephant AI)
  "summary": {
    "tldr": "Positive QBR with Acme. High satisfaction, expansion opportunity for CS team. One feature request for bulk editing.",
    "action_items": [
      { "owner": "Tyler", "task": "Review bulk editing request", "due": "2026-02-08" }
    ],
    "sentiment": "positive",
    "topics": ["qbr", "expansion", "feature-request"]
  },
  
  // Transcript (conditional)
  "transcript": {
    "available": true,
    "included": false,
    "url": "askelephant://calls/abc123/transcript"
  }
}
```

### Full Payload (With Transcript)

Same as above, but with:

```json
{
  "transcript": {
    "available": true,
    "included": true,
    "full_text": "...",
    "speakers": [
      {
        "name": "Eli Gomez",
        "segments": [
          { "start": 0, "end": 45, "text": "Thanks for joining today..." }
        ]
      }
    ]
  }
}
```

---

## Signal Router Integration

### AskElephant Pre-Classification

AskElephant should classify calls before sending:

```yaml
classification_rules:
  # Critical - always L3+
  - condition: "call_type == 'csm_renewal' AND renewal_likelihood == 'at_risk'"
    level: "L3"
    include_transcript: true
    
  - condition: "call_type == 'product_research'"
    level: "L2"
    include_transcript: true
    
  - condition: "churn_signals.length > 0"
    level: "L3"
    include_transcript: true
    
  # High - L2
  - condition: "call_type in ['ae_discovery', 'ae_demo', 'csm_onboarding']"
    level: "L2"
    include_transcript: false
    
  - condition: "account.tier == 'enterprise' AND sentiment == 'negative'"
    level: "L2"
    include_transcript: true
    
  # Medium - L1 or L2
  - condition: "call_type == 'csm_qbr' AND satisfaction.overall == 'positive'"
    level: "L1"
    include_transcript: false
    
  # Default
  - condition: "true"
    level: "L1"
    include_transcript: false
```

### PM Workspace Signal Router Override

PM workspace can override AskElephant's classification:

```yaml
router_overrides:
  # Upgrade based on patterns
  - condition: "signals_7d.same_topic >= 3"
    override_level: "L3"
    
  - condition: "account.arr >= 100000"
    min_level: "L2"
```

---

## Implementation Checklist

### AskElephant Side

- [ ] Add call type classification to transcript processing
- [ ] Add PM signal value scoring
- [ ] Add structured signal extraction (feature requests, churn signals, etc.)
- [ ] Add account context enrichment
- [ ] Implement classification rules
- [ ] Build webhook endpoint with payload format
- [ ] Add transcript inclusion logic
- [ ] Add "send to PM workspace" toggle in settings

### PM Workspace Side

- [ ] Build webhook receiver
- [ ] Integrate with signal router
- [ ] Handle both structured and raw payloads
- [ ] Map AskElephant classification to L1-L4
- [ ] Store transcripts for on-demand retrieval

---

## Estimated Signal Volume

| Source | Weekly Volume | To PM Workspace |
|--------|---------------|-----------------|
| AE calls | 20-25 | 20-25 |
| CSM calls | 35-50 | 35-50 |
| Product research | 3-8 | 3-8 |
| SDR qualification | 20-30 | 5-10 (filtered) |
| Leadership | 5-10 | 5-10 |
| Partners | 10-15 | 5-10 (filtered) |
| **Total** | **~130** | **~80-100** |

At ~80-100 signals/week, with L1 (log only) for ~60%, L2 (report) for ~30%, L3 (initiative) for ~10%.

---

*Created: February 1, 2026*
*Status: Ready for AskElephant integration planning*
