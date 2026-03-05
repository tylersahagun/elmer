# AskElephant Transcript Processing Workflow

> Internal workflow specification for processing transcripts and sending webhooks to PM workspace

---

## Overview

This document specifies how AskElephant should process transcripts from every call across the organization and deliver structured signals to the PM workspace.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    ASKELEPHANT TRANSCRIPT PROCESSING PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   CALL ENDS                                                                         │
│       │                                                                             │
│       ▼                                                                             │
│   ┌───────────────────┐                                                            │
│   │ 1. TRANSCRIPTION  │  Speech-to-text, speaker diarization                       │
│   └─────────┬─────────┘                                                            │
│             │                                                                       │
│             ▼                                                                       │
│   ┌───────────────────┐                                                            │
│   │ 2. ENRICHMENT     │  Match participants, pull account context                  │
│   └─────────┬─────────┘                                                            │
│             │                                                                       │
│             ▼                                                                       │
│   ┌───────────────────┐                                                            │
│   │ 3. CLASSIFICATION │  Determine call type, internal participant role            │
│   └─────────┬─────────┘                                                            │
│             │                                                                       │
│             ▼                                                                       │
│   ┌───────────────────┐                                                            │
│   │ 4. EXTRACTION     │  Role-specific signal extraction                           │
│   └─────────┬─────────┘                                                            │
│             │                                                                       │
│             ▼                                                                       │
│   ┌───────────────────┐                                                            │
│   │ 5. SCORING        │  PM signal value, recommended level                        │
│   └─────────┬─────────┘                                                            │
│             │                                                                       │
│             ▼                                                                       │
│   ┌───────────────────┐                                                            │
│   │ 6. WEBHOOK        │  Format and send to PM workspace                           │
│   └───────────────────┘                                                            │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Transcription

Standard AskElephant transcription pipeline. No changes needed.

**Output:**
```json
{
  "call_id": "call_abc123",
  "transcript": {
    "full_text": "...",
    "segments": [
      {
        "speaker_id": "spk_001",
        "speaker_name": "Eli Gomez",
        "start_ms": 0,
        "end_ms": 45000,
        "text": "Thanks for joining today's QBR..."
      }
    ]
  },
  "duration_seconds": 2700,
  "recording_source": "zoom"
}
```

---

## Stage 2: Enrichment

### 2.1 Participant Matching

Match speakers to known users and external contacts.

```python
def enrich_participants(transcript, meeting_metadata):
    participants = {
        "internal": [],
        "external": []
    }
    
    for speaker in transcript.segments:
        # Match to internal employee
        employee = match_to_employee(speaker.speaker_name, speaker.email)
        if employee:
            participants["internal"].append({
                "id": employee.id,
                "name": employee.name,
                "email": employee.email,
                "role": employee.title,
                "department": employee.department,
                "slack_id": employee.slack_id,
                "reports_to": employee.manager
            })
        else:
            # External participant
            contact = match_to_crm_contact(speaker.speaker_name, speaker.email)
            participants["external"].append({
                "name": speaker.speaker_name,
                "email": speaker.email,
                "role": contact.title if contact else None,
                "company": contact.company if contact else None,
                "is_champion": contact.is_champion if contact else False,
                "is_decision_maker": contact.is_decision_maker if contact else False
            })
    
    return participants
```

### 2.2 Account Context

Pull account context from CRM for external participant's company.

```python
def enrich_account(participants, crm_client):
    external_company = get_primary_company(participants["external"])
    
    if not external_company:
        return None
    
    account = crm_client.get_account(external_company)
    
    return {
        "id": account.id,
        "name": account.name,
        "tier": classify_tier(account.arr),  # enterprise/growth/starter/free
        "arr": account.arr,
        "mrr": account.mrr,
        "tenure_months": months_since(account.close_date),
        "health_score": account.health_score,
        "csm": account.owner,
        "renewal_date": account.renewal_date,
        "industry": account.industry,
        "employee_count": account.employee_count,
        "integrations": account.active_integrations,
        "recent_tickets": count_recent_tickets(account.id, days=30)
    }

def classify_tier(arr):
    if arr >= 100000:
        return "enterprise"
    elif arr >= 30000:
        return "growth"
    elif arr >= 10000:
        return "starter"
    else:
        return "free"
```

**Output:**
```json
{
  "participants": {
    "internal": [
      {
        "id": "emp_eli",
        "name": "Eli Gomez",
        "role": "Client Success Manager",
        "department": "Customer Experience",
        "slack_id": "U060G4DK1CZ"
      }
    ],
    "external": [
      {
        "name": "Jane Smith",
        "role": "VP Sales",
        "company": "Acme Corp",
        "is_champion": true,
        "is_decision_maker": true
      }
    ]
  },
  "account": {
    "id": "acc_acme",
    "name": "Acme Corp",
    "tier": "enterprise",
    "arr": 120000,
    "tenure_months": 8,
    "health_score": 85,
    "renewal_date": "2026-06-15"
  }
}
```

---

## Stage 3: Classification

### 3.1 Internal Participant Role Classification

Determine the primary internal participant's role for processing rules.

```python
# Employee role mapping
ROLE_CLASSIFICATION = {
    # SDR roles
    "SDR": "sdr",
    "SDR 2": "sdr",
    "Founding SDR": "sdr_lead",
    
    # AE roles
    "Account Executive": "ae",
    "AE": "ae",
    "Senior Account Executive": "ae_senior",
    
    # CSM roles
    "Client Success Manager": "csm",
    "CSM": "csm",
    "CSM 1": "csm",
    "Expansion CSM": "csm_expansion",
    "CS": "csm",
    
    # Support roles
    "Technical Support": "support",
    "Solutions Engineer": "solutions_engineer",
    
    # Partnership roles
    "PRM": "partnerships",
    "Head of Hubspot Partnership": "partnerships_lead",
    
    # Product roles
    "Junior PM": "product",
    "GM and Vice President of Product": "product_leadership",
    "Growth Designer": "design",
    "Jr. Designer": "design",
    
    # Engineering roles
    "Software Engineer": "engineering",
    "Senior Software Engineer": "engineering_lead",
    "Data Engineer": "engineering",
    "Head of Engineering": "engineering_leadership",
    
    # Marketing roles
    "VP of Marketing": "marketing_leadership",
    "Marketing Associate": "marketing",
    "Marketing Intern": "marketing_intern",
    
    # Leadership
    "Founder": "executive",
    "Head of Growth": "revenue_leadership",
    "Head of Sales": "sales_leadership",
    "Head of Customer Experience": "cx_leadership"
}

def classify_internal_role(participants):
    """Returns the primary internal participant's role classification"""
    internal = participants.get("internal", [])
    
    if not internal:
        return "unknown"
    
    # Priority: leadership > individual contributor
    for p in internal:
        role = ROLE_CLASSIFICATION.get(p["role"], "unknown")
        if "leadership" in role or "lead" in role:
            return role
    
    # Return first match
    return ROLE_CLASSIFICATION.get(internal[0]["role"], "unknown")
```

### 3.2 Call Type Classification

Determine the call type based on participants and context.

```python
def classify_call_type(participants, account, meeting_metadata):
    internal_role = classify_internal_role(participants)
    has_external = len(participants.get("external", [])) > 0
    
    # Internal-only calls
    if not has_external:
        return classify_internal_call(internal_role, meeting_metadata)
    
    # External calls by role
    call_type_map = {
        # SDR calls
        "sdr": classify_sdr_call(account, meeting_metadata),
        "sdr_lead": classify_sdr_call(account, meeting_metadata),
        
        # AE calls
        "ae": classify_ae_call(account, meeting_metadata),
        "ae_senior": classify_ae_call(account, meeting_metadata),
        
        # CSM calls
        "csm": classify_csm_call(account, meeting_metadata),
        "csm_expansion": classify_csm_call(account, meeting_metadata),
        
        # Support calls
        "support": "support_call",
        "solutions_engineer": "solutions_call",
        
        # Partnership calls
        "partnerships": "partner_call",
        "partnerships_lead": "partner_call",
        
        # Product calls
        "product": "product_research",
        "product_leadership": "product_research",
        "design": "design_research",
        
        # Leadership calls
        "executive": "executive_external",
        "revenue_leadership": "executive_external",
        "sales_leadership": "sales_leadership_call",
        "cx_leadership": "cx_leadership_call"
    }
    
    return call_type_map.get(internal_role, "unknown_external")

def classify_sdr_call(account, meeting_metadata):
    duration = meeting_metadata.get("duration_seconds", 0)
    
    if duration < 300:  # < 5 minutes
        return "sdr_cold_call"
    else:
        return "sdr_qualification"

def classify_ae_call(account, meeting_metadata):
    title = meeting_metadata.get("title", "").lower()
    
    if "demo" in title:
        return "ae_demo"
    elif "discovery" in title:
        return "ae_discovery"
    elif any(x in title for x in ["negotiation", "pricing", "contract"]):
        return "ae_negotiation"
    elif account and account.get("tenure_months", 0) == 0:
        return "ae_discovery"  # New prospect
    else:
        return "ae_general"

def classify_csm_call(account, meeting_metadata):
    title = meeting_metadata.get("title", "").lower()
    
    if "qbr" in title or "quarterly" in title or "business review" in title:
        return "csm_qbr"
    elif "onboarding" in title or "kickoff" in title:
        return "csm_onboarding"
    elif "renewal" in title:
        return "csm_renewal"
    elif "escalation" in title or "issue" in title or "urgent" in title:
        return "csm_escalation"
    elif account:
        # Infer from account context
        tenure = account.get("tenure_months", 0)
        if tenure < 2:
            return "csm_onboarding"
        elif account.get("renewal_date"):
            days_to_renewal = days_until(account["renewal_date"])
            if days_to_renewal < 60:
                return "csm_renewal"
        return "csm_checkin"
    else:
        return "csm_general"

def classify_internal_call(internal_role, meeting_metadata):
    title = meeting_metadata.get("title", "").lower()
    
    if any(x in title for x in ["standup", "daily", "sync"]):
        return "internal_standup"
    elif any(x in title for x in ["planning", "sprint", "roadmap"]):
        return "internal_planning"
    elif any(x in title for x in ["1:1", "one on one"]):
        return "internal_1on1"
    elif any(x in title for x in ["all hands", "company meeting"]):
        return "internal_allhands"
    elif "product" in internal_role or "design" in internal_role:
        return "internal_product"
    elif "engineering" in internal_role:
        return "internal_engineering"
    else:
        return "internal_general"
```

**Output:**
```json
{
  "classification": {
    "internal_role": "csm",
    "call_type": "csm_qbr",
    "has_external": true,
    "is_internal_only": false
  }
}
```

---

## Stage 4: Extraction

Role-specific signal extraction pipelines.

### 4.1 Extraction Router

```python
def extract_signals(transcript, classification, account):
    call_type = classification["call_type"]
    
    # Route to appropriate extractor
    extractors = {
        # SDR extractors
        "sdr_cold_call": extract_sdr_cold,
        "sdr_qualification": extract_sdr_qualification,
        
        # AE extractors
        "ae_discovery": extract_ae_discovery,
        "ae_demo": extract_ae_demo,
        "ae_negotiation": extract_ae_negotiation,
        
        # CSM extractors
        "csm_onboarding": extract_csm_onboarding,
        "csm_checkin": extract_csm_checkin,
        "csm_qbr": extract_csm_qbr,
        "csm_renewal": extract_csm_renewal,
        "csm_escalation": extract_csm_escalation,
        
        # Support extractors
        "support_call": extract_support,
        "solutions_call": extract_solutions,
        
        # Product extractors
        "product_research": extract_product_research,
        "design_research": extract_design_research,
        
        # Leadership extractors
        "executive_external": extract_executive,
        "internal_product": extract_internal_product,
        "internal_allhands": extract_internal_allhands,
        
        # Partnership extractors
        "partner_call": extract_partner
    }
    
    extractor = extractors.get(call_type, extract_generic)
    return extractor(transcript, account)
```

### 4.2 SDR Extractors

```python
def extract_sdr_cold(transcript, account):
    """Minimal extraction for cold calls - only flag interesting signals"""
    return {
        "send_to_pm": False,  # Default: don't send
        "flag_for_review": False,
        "flags": []
    }

def extract_sdr_qualification(transcript, account):
    """Extract qualification signals"""
    prompt = """
    Analyze this SDR qualification call transcript and extract:
    
    1. PAIN POINTS: What problems did the prospect mention?
       - Quote the exact words used
       - Rate severity (high/medium/low)
    
    2. CURRENT TOOLS: What solutions are they currently using?
       - Competitors mentioned
       - Satisfaction with current solution
    
    3. ICP FIT: Based on this call, rate ICP fit 1-10
       - Company size signals
       - Use case alignment
       - Budget signals
    
    4. OBJECTIONS: What concerns or pushback was raised?
    
    5. NEXT STEPS: What was agreed for follow-up?
    
    Return structured JSON.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": result.get("icp_fit", 0) >= 7 or len(result.get("pain_points", [])) >= 2,
        "pain_points": result.get("pain_points", []),
        "current_tools": result.get("current_tools", []),
        "icp_fit": result.get("icp_fit"),
        "objections": result.get("objections", []),
        "next_steps": result.get("next_steps", []),
        "key_quotes": extract_key_quotes(result)
    }
```

### 4.3 AE Extractors

```python
def extract_ae_discovery(transcript, account):
    """Extract deep discovery signals"""
    prompt = """
    Analyze this AE discovery call and extract:
    
    1. BUSINESS PROBLEMS (Critical)
       - What specific problems does this company face?
       - What is the business impact of each problem?
       - Quote exact words from decision makers
       - Who owns each problem?
    
    2. SUCCESS CRITERIA
       - What would success look like for them?
       - What metrics do they care about?
       - Timeline expectations?
    
    3. DECISION PROCESS
       - Who are the stakeholders?
       - What is their evaluation process?
       - Timeline to decision?
       - Budget situation?
    
    4. COMPETITIVE LANDSCAPE
       - What are they using today?
       - What alternatives are they considering?
       - Why are they looking to change?
    
    5. CHAMPION SIGNALS
       - Is there an internal champion?
       - How engaged are they?
       - What's their motivation?
    
    Return structured JSON with verbatim quotes.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": True,  # Always send discovery calls
        "business_problems": [
            {
                "problem": p["problem"],
                "impact": p["impact"],
                "quote": p["quote"],
                "owner": p.get("owner"),
                "severity": p.get("severity", "medium")
            }
            for p in result.get("business_problems", [])
        ],
        "success_criteria": result.get("success_criteria", []),
        "decision_process": result.get("decision_process", {}),
        "competitive_context": result.get("competitive_landscape", {}),
        "champion_signals": result.get("champion_signals", {}),
        "key_quotes": extract_key_quotes(result)
    }

def extract_ae_demo(transcript, account):
    """Extract demo reaction signals"""
    prompt = """
    Analyze this product demo call and extract:
    
    1. FEATURE REACTIONS
       For each feature shown, capture:
       - Feature name
       - Reaction: positive / negative / question / neutral
       - Exact quote if notable
       - Who reacted (role)
    
    2. AHA MOMENTS
       - Moments where prospects showed excitement
       - "That's exactly what we need" type reactions
       - Capture timestamp if possible
    
    3. CONCERNS / OBJECTIONS
       - What worried them?
       - What questions indicated gaps?
       - Integration concerns?
       - Security/compliance concerns?
    
    4. FEATURE REQUESTS / GAPS
       - "Can it do X?" questions that we can't answer yes to
       - Features they expected but didn't see
    
    5. COMPETITIVE COMPARISONS
       - Did they compare to competitors?
       - What features did competitors have that we don't?
    
    Return structured JSON.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": True,
        "feature_reactions": result.get("feature_reactions", []),
        "aha_moments": result.get("aha_moments", []),
        "objections": result.get("concerns", []),
        "feature_gaps": result.get("feature_requests", []),
        "competitive_mentions": result.get("competitive_comparisons", []),
        "key_quotes": extract_key_quotes(result)
    }

def extract_ae_negotiation(transcript, account):
    """Extract negotiation/pricing signals"""
    prompt = """
    Analyze this negotiation/pricing call and extract:
    
    1. PRICING FEEDBACK
       - Reactions to pricing
       - Specific objections
       - Comparison to competitors' pricing
    
    2. DEAL BLOCKERS
       - What's preventing close?
       - Technical blockers?
       - Commercial blockers?
    
    3. WIN/LOSS SIGNALS
       - Are we winning or losing?
       - Confidence level
    
    Return structured JSON.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": len(result.get("deal_blockers", [])) > 0,
        "pricing_feedback": result.get("pricing_feedback", {}),
        "deal_blockers": result.get("deal_blockers", []),
        "win_loss_signals": result.get("win_loss_signals", {}),
        "key_quotes": extract_key_quotes(result)
    }
```

### 4.4 CSM Extractors

```python
def extract_csm_onboarding(transcript, account):
    """Extract onboarding friction and expectations"""
    prompt = """
    Analyze this customer onboarding call and extract:
    
    1. SETUP FRICTION
       - What setup steps were difficult?
       - What confused them?
       - What documentation was missing?
       - Quote their frustrations
    
    2. INTEGRATION ISSUES
       - Which integrations are they setting up?
       - What problems did they encounter?
       - What's blocking them?
    
    3. USE CASE EXPECTATIONS
       - What do they expect to accomplish?
       - Primary use case
       - Secondary use cases
       - Any expectation mismatches?
    
    4. FEATURE QUESTIONS
       - What features did they ask about?
       - What capabilities did they expect that we don't have?
    
    5. SUCCESS CRITERIA
       - What metrics will they track?
       - Timeline to value?
    
    Return structured JSON with verbatim quotes.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": True,
        "setup_friction": result.get("setup_friction", []),
        "integration_issues": result.get("integration_issues", []),
        "use_case_expectations": result.get("use_case_expectations", {}),
        "feature_questions": result.get("feature_questions", []),
        "success_criteria": result.get("success_criteria", {}),
        "key_quotes": extract_key_quotes(result)
    }

def extract_csm_qbr(transcript, account):
    """Extract QBR/check-in signals"""
    prompt = """
    Analyze this QBR/check-in call and extract:
    
    1. SATISFACTION SIGNALS
       - Overall sentiment (positive/neutral/negative)
       - NPS-like signals (would they recommend?)
       - Specific praise or complaints
       - Quote satisfaction statements
    
    2. FEATURE REQUESTS
       - New features they want
       - Improvements to existing features
       - Priority level (critical/high/medium/low)
       - Use case context
    
    3. CHURN RISK SIGNALS (Critical)
       - Any mentions of alternatives
       - Budget concerns
       - Adoption issues
       - Frustration signals
       - "We might not renew" type statements
    
    4. EXPANSION SIGNALS
       - New teams that could use product
       - Additional seat potential
       - New use cases emerging
    
    5. SUCCESS STORIES
       - What's working well?
       - Metrics improvements
       - ROI statements
       - Quotable testimonials
    
    6. COMPETITIVE MENTIONS
       - Any competitors mentioned?
       - Comparisons made?
    
    Return structured JSON with verbatim quotes.
    """
    
    result = llm_extract(prompt, transcript)
    
    # Determine if churn signals warrant immediate attention
    churn_signals = result.get("churn_risk_signals", [])
    has_churn_risk = len(churn_signals) > 0
    
    return {
        "send_to_pm": True,
        "include_transcript": has_churn_risk,  # Include raw if churn risk
        "satisfaction": {
            "overall": result.get("satisfaction", {}).get("overall", "neutral"),
            "nps_proxy": calculate_nps_proxy(result.get("satisfaction", {})),
            "sentiment_quotes": result.get("satisfaction", {}).get("quotes", [])
        },
        "feature_requests": result.get("feature_requests", []),
        "churn_signals": churn_signals,
        "expansion_signals": result.get("expansion_signals", []),
        "success_stories": result.get("success_stories", []),
        "competitive_mentions": result.get("competitive_mentions", []),
        "key_quotes": extract_key_quotes(result)
    }

def extract_csm_renewal(transcript, account):
    """Extract renewal decision signals - CRITICAL"""
    prompt = """
    Analyze this renewal call and extract:
    
    1. RENEWAL LIKELIHOOD (Critical)
       - Will they renew? (yes/likely/uncertain/unlikely/no)
       - Confidence level
       - Key deciding factors
    
    2. DECISION FACTORS
       - What factors are they weighing?
       - Who has final say?
       - What would make them stay?
       - What would make them leave?
    
    3. CHURN RISK REASONS (Critical)
       - Why might they not renew?
       - Specific complaints
       - Budget issues
       - Competitor attraction
       - Adoption problems
       - Quote their concerns exactly
    
    4. COMPETITIVE PRESSURE
       - Are they evaluating alternatives?
       - Which competitors?
       - What are competitors offering?
    
    5. SAVE OPPORTUNITIES
       - What would change their mind?
       - Price sensitivity?
       - Feature requests that would save the deal?
    
    6. VALUE CONFIRMATION
       - What value have they received?
       - ROI statements
       - Success metrics
    
    Return structured JSON with ALL verbatim quotes preserved.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": True,
        "include_transcript": True,  # ALWAYS include for renewal
        "renewal_likelihood": result.get("renewal_likelihood", "uncertain"),
        "decision_factors": result.get("decision_factors", []),
        "churn_risk_reasons": result.get("churn_risk_reasons", []),
        "competitive_pressure": result.get("competitive_pressure", {}),
        "save_opportunities": result.get("save_opportunities", []),
        "value_confirmation": result.get("value_confirmation", []),
        "key_quotes": extract_key_quotes(result, preserve_all=True)
    }

def extract_csm_escalation(transcript, account):
    """Extract escalation/support signals"""
    prompt = """
    Analyze this escalation/support call and extract:
    
    1. ISSUE DETAILS
       - What is the problem?
       - Severity (P1/P2/P3/P4)
       - Impact on customer
       - How long has it been happening?
    
    2. STEPS TO REPRODUCE
       - What actions trigger the issue?
       - Environment details
    
    3. WORKAROUND PROVIDED
       - Was a workaround given?
       - Is it acceptable to customer?
    
    4. CUSTOMER FRUSTRATION
       - How frustrated are they? (1-10)
       - Quote frustration statements
       - Churn risk from this issue?
    
    5. RESOLUTION
       - Was it resolved?
       - Next steps?
       - Timeline communicated?
    
    Return structured JSON.
    """
    
    result = llm_extract(prompt, transcript)
    
    severity = result.get("issue_details", {}).get("severity", "P3")
    
    return {
        "send_to_pm": severity in ["P1", "P2"],
        "include_transcript": severity == "P1",
        "issue_details": result.get("issue_details", {}),
        "steps_to_reproduce": result.get("steps_to_reproduce", []),
        "workaround": result.get("workaround", {}),
        "customer_frustration": result.get("customer_frustration", {}),
        "resolution": result.get("resolution", {}),
        "key_quotes": extract_key_quotes(result)
    }
```

### 4.5 Product Research Extractors

```python
def extract_product_research(transcript, account):
    """Extract user research signals - HIGHEST PRIORITY"""
    prompt = """
    Analyze this product/user research call and extract EVERYTHING:
    
    1. KEY INSIGHTS
       - Major findings from this research
       - Evidence strength (strong/moderate/weak)
       - Supporting quotes (VERBATIM)
    
    2. JOBS TO BE DONE
       - What jobs is the user trying to accomplish?
       - Current solutions they use
       - Pain with current solutions
       - Desired outcome
    
    3. WORKFLOW OBSERVATIONS
       - How do they currently do this task?
       - Steps in their process
       - Friction points
       - Workarounds they've created
    
    4. FEATURE REACTIONS
       - If prototypes were shown, what were reactions?
       - What excited them?
       - What confused them?
       - What's missing?
    
    5. QUOTES (Critical - preserve ALL notable quotes)
       - Topic of quote
       - Exact verbatim quote
       - Speaker
       - Timestamp
       - Sentiment
    
    6. PERSONA SIGNALS
       - What persona does this user represent?
       - Tech savviness
       - Role in organization
       - Decision-making authority
    
    7. COMPETITIVE CONTEXT
       - What tools do they use today?
       - What do they like/dislike about alternatives?
    
    Return structured JSON with ALL verbatim quotes preserved exactly as spoken.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": True,
        "include_transcript": True,  # ALWAYS include for research
        "key_insights": result.get("key_insights", []),
        "jobs_to_be_done": result.get("jobs_to_be_done", []),
        "workflow_observations": result.get("workflow_observations", []),
        "feature_reactions": result.get("feature_reactions", []),
        "verbatim_quotes": result.get("quotes", []),
        "persona_signals": result.get("persona_signals", {}),
        "competitive_context": result.get("competitive_context", {}),
        "key_quotes": extract_key_quotes(result, preserve_all=True)
    }
```

### 4.6 Internal Call Extractors

```python
def extract_internal_product(transcript, account):
    """Extract product team internal call signals"""
    prompt = """
    Analyze this internal product call and extract:
    
    1. DECISIONS MADE
       - What was decided?
       - Who made the decision?
       - Rationale
    
    2. ACTION ITEMS
       - Who is doing what?
       - Deadlines?
    
    3. ROADMAP/PRIORITY CHANGES
       - Any changes to priorities?
       - New items added?
       - Items deprioritized?
    
    4. STRATEGIC CONTEXT
       - Leadership quotes about direction
       - "We should/shouldn't" statements
       - Principles articulated
    
    Return structured JSON.
    """
    
    result = llm_extract(prompt, transcript)
    
    has_strategic_content = (
        len(result.get("decisions", [])) > 0 or
        len(result.get("roadmap_changes", [])) > 0 or
        len(result.get("strategic_context", [])) > 0
    )
    
    return {
        "send_to_pm": has_strategic_content,
        "include_transcript": False,
        "is_context_update": True,  # Route to company-context, not signals
        "decisions": result.get("decisions", []),
        "action_items": result.get("action_items", []),
        "roadmap_changes": result.get("roadmap_changes", []),
        "strategic_context": result.get("strategic_context", []),
        "key_quotes": extract_key_quotes(result)
    }

def extract_internal_allhands(transcript, account):
    """Extract all-hands meeting signals"""
    prompt = """
    Analyze this all-hands/company meeting and extract:
    
    1. ANNOUNCEMENTS
       - Major announcements
       - Company updates
    
    2. LEADERSHIP QUOTES
       - Strategic statements from leadership
       - Vision/mission reinforcement
       - Cultural statements
    
    3. METRICS/RESULTS
       - Any metrics shared
       - Performance updates
    
    4. ROADMAP PREVIEWS
       - Upcoming features mentioned
       - Timeline hints
    
    Return structured JSON with leadership quotes verbatim.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": True,
        "include_transcript": False,
        "is_context_update": True,
        "announcements": result.get("announcements", []),
        "leadership_quotes": result.get("leadership_quotes", []),
        "metrics": result.get("metrics", []),
        "roadmap_previews": result.get("roadmap_previews", []),
        "key_quotes": extract_key_quotes(result)
    }
```

### 4.7 Partner Call Extractors

```python
def extract_partner(transcript, account):
    """Extract partner meeting signals"""
    prompt = """
    Analyze this partner meeting and extract:
    
    1. INTEGRATION REQUESTS
       - What integrations are they asking for?
       - Priority level
       - Use case
    
    2. PARTNER FEEDBACK
       - Feedback on our product
       - What their customers say
       - Competitive positioning
    
    3. MARKET INTEL
       - What are they seeing in the market?
       - Competitive movements
       - Customer trends
    
    4. CO-SELLING REQUIREMENTS
       - What do they need to sell us?
       - Enablement gaps
    
    Return structured JSON.
    """
    
    result = llm_extract(prompt, transcript)
    
    return {
        "send_to_pm": len(result.get("integration_requests", [])) > 0,
        "include_transcript": False,
        "integration_requests": result.get("integration_requests", []),
        "partner_feedback": result.get("partner_feedback", []),
        "market_intel": result.get("market_intel", []),
        "co_selling_requirements": result.get("co_selling_requirements", []),
        "key_quotes": extract_key_quotes(result)
    }
```

---

## Stage 5: Scoring

### 5.1 PM Signal Value Scoring

```python
def score_pm_value(call_type, signals, account):
    """Score the PM signal value of this call"""
    
    base_scores = {
        # Critical - always high value
        "product_research": 100,
        "csm_renewal": 100,
        "design_research": 95,
        
        # High value
        "ae_discovery": 85,
        "ae_demo": 85,
        "csm_onboarding": 80,
        "csm_qbr": 80,
        "csm_escalation": 75,
        
        # Medium value
        "sdr_qualification": 60,
        "partner_call": 55,
        "solutions_call": 50,
        
        # Low value
        "ae_negotiation": 40,
        "csm_checkin": 35,
        "internal_product": 30,
        
        # Very low / skip
        "sdr_cold_call": 5,
        "internal_engineering": 5,
        "internal_standup": 5
    }
    
    score = base_scores.get(call_type, 20)
    
    # Adjust based on signals found
    adjustments = []
    
    # Churn signals are critical
    if signals.get("churn_signals") or signals.get("churn_risk_reasons"):
        adjustments.append(("churn_signals", +30))
    
    # Feature requests valuable
    if len(signals.get("feature_requests", [])) >= 2:
        adjustments.append(("multiple_feature_requests", +15))
    
    # High-value account
    if account and account.get("tier") == "enterprise":
        adjustments.append(("enterprise_account", +15))
    
    if account and account.get("arr", 0) >= 100000:
        adjustments.append(("high_arr", +10))
    
    # Negative sentiment
    satisfaction = signals.get("satisfaction", {})
    if satisfaction.get("overall") == "negative":
        adjustments.append(("negative_sentiment", +20))
    
    # Rich quotes
    if len(signals.get("key_quotes", [])) >= 5:
        adjustments.append(("rich_quotes", +10))
    
    # Apply adjustments
    for reason, adjustment in adjustments:
        score = min(100, score + adjustment)
    
    return {
        "score": score,
        "adjustments": adjustments,
        "rationale": generate_score_rationale(base_scores.get(call_type), adjustments)
    }
```

### 5.2 Recommended Signal Level

```python
def recommend_signal_level(pm_value_score, signals, account, call_type):
    """Recommend L1/L2/L3/L4 based on scoring"""
    
    # L4 is never auto-assigned (requires human approval)
    
    # L3: Create/progress initiative
    if (
        pm_value_score >= 85 or
        call_type == "csm_renewal" or
        call_type == "product_research" or
        len(signals.get("churn_signals", [])) > 0 or
        len(signals.get("churn_risk_reasons", [])) > 0 or
        (account and account.get("arr", 0) >= 100000 and 
         signals.get("satisfaction", {}).get("overall") == "negative")
    ):
        return {
            "level": "L3",
            "reason": determine_l3_reason(signals, account, call_type)
        }
    
    # L2: Report and surface
    if (
        pm_value_score >= 60 or
        call_type in ["ae_discovery", "ae_demo", "csm_onboarding", "csm_qbr"] or
        len(signals.get("feature_requests", [])) >= 2 or
        account and account.get("tier") == "enterprise"
    ):
        return {
            "level": "L2",
            "reason": determine_l2_reason(signals, account, call_type)
        }
    
    # L1: Log only (default)
    return {
        "level": "L1",
        "reason": "Standard signal - log for pattern detection"
    }
```

---

## Stage 6: Webhook Delivery

### 6.1 Should Send Decision

```python
def should_send_to_pm_workspace(call_type, signals, scoring):
    """Final decision on whether to send to PM workspace"""
    
    # Never send
    never_send = [
        "sdr_cold_call",
        "internal_engineering",
        "internal_standup",
        "internal_1on1"
    ]
    
    if call_type in never_send:
        return False
    
    # Always send
    always_send = [
        "product_research",
        "design_research",
        "csm_renewal",
        "csm_escalation"
    ]
    
    if call_type in always_send:
        return True
    
    # Conditional send
    if signals.get("send_to_pm", False):
        return True
    
    if scoring["score"] >= 50:
        return True
    
    return False
```

### 6.2 Webhook Payload Assembly

```python
def assemble_webhook_payload(
    call_id,
    call_metadata,
    participants,
    account,
    classification,
    signals,
    scoring,
    transcript
):
    """Assemble the final webhook payload"""
    
    include_transcript = (
        signals.get("include_transcript", False) or
        scoring["recommended_level"]["level"] == "L3" and 
        classification["call_type"] in ["csm_renewal", "product_research"]
    )
    
    payload = {
        "event_type": "call.processed",
        "event_version": "1.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        
        "call_id": call_id,
        
        "call_metadata": {
            "title": call_metadata.get("title"),
            "date": call_metadata.get("date"),
            "duration_minutes": call_metadata.get("duration_seconds", 0) // 60,
            "source": call_metadata.get("recording_source")
        },
        
        "classification": {
            "internal_role": classification["internal_role"],
            "call_type": classification["call_type"],
            "pm_signal_value": scoring["score"],
            "recommended_level": scoring["recommended_level"]["level"],
            "level_reason": scoring["recommended_level"]["reason"]
        },
        
        "participants": {
            "internal": [
                {
                    "name": p["name"],
                    "role": p["role"],
                    "department": p.get("department"),
                    "slack_id": p.get("slack_id")
                }
                for p in participants.get("internal", [])
            ],
            "external": [
                {
                    "name": p["name"],
                    "role": p.get("role"),
                    "company": p.get("company"),
                    "is_champion": p.get("is_champion", False),
                    "is_decision_maker": p.get("is_decision_maker", False)
                }
                for p in participants.get("external", [])
            ]
        },
        
        "account": account,  # Full account context
        
        "signals": sanitize_signals(signals),  # Extracted signals
        
        "summary": {
            "tldr": generate_tldr(classification, signals),
            "action_items": signals.get("action_items", []),
            "topics": extract_topics(signals),
            "sentiment": determine_overall_sentiment(signals)
        },
        
        "transcript": {
            "available": True,
            "included": include_transcript,
            "word_count": len(transcript.get("full_text", "").split()),
            "url": f"askelephant://calls/{call_id}/transcript"
        }
    }
    
    # Include transcript if flagged
    if include_transcript:
        payload["transcript"]["full_text"] = transcript.get("full_text")
        payload["transcript"]["segments"] = transcript.get("segments")
    
    return payload
```

### 6.3 Webhook Delivery

```python
def send_webhook(payload, config):
    """Send webhook to PM workspace"""
    
    webhook_url = config["pm_workspace_webhook_url"]
    secret = config["pm_workspace_webhook_secret"]
    
    # Sign payload
    payload_json = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        secret.encode(),
        payload_json.encode(),
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-AskElephant-Signature": signature,
        "X-AskElephant-Event": payload["event_type"],
        "X-AskElephant-Timestamp": payload["timestamp"]
    }
    
    # Send with retry
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                log_webhook_success(payload["call_id"])
                return True
            elif response.status_code >= 500:
                # Server error - retry
                time.sleep(2 ** attempt)
                continue
            else:
                # Client error - don't retry
                log_webhook_failure(payload["call_id"], response.status_code, response.text)
                return False
                
        except requests.exceptions.Timeout:
            time.sleep(2 ** attempt)
            continue
        except Exception as e:
            log_webhook_error(payload["call_id"], str(e))
            return False
    
    log_webhook_failure(payload["call_id"], "max_retries_exceeded")
    return False
```

---

## Person-Specific Configuration

### Configuration by Employee

```yaml
# askelephant_pm_workspace_config.yaml

employees:
  # Executive
  - name: "Woody Klemetson"
    slack_id: "U0605SZVBDJ"
    role_class: "executive"
    send_external_calls: true
    send_internal_calls: true  # For strategic context
    always_include_transcript: false
    privacy_override: true  # Can mark calls as private
    
  # Product Team - HIGH PRIORITY
  - name: "Sam Ho"
    slack_id: "U0A99G89V43"
    role_class: "product_leadership"
    send_external_calls: true
    send_internal_calls: true
    always_include_transcript: true  # VP wants full context
    
  - name: "Tyler Sahagun"
    slack_id: "U08JVM8LBP0"
    role_class: "product"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: true  # PM needs full research context
    
  - name: "Skylar Sanford"
    slack_id: "U081YKKDGR5"
    role_class: "design"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: true
    
  - name: "Adam Shumway"
    slack_id: "U0932C4LFEV"
    role_class: "design"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  # Sales Leadership
  - name: "Ben Kinard"
    slack_id: "U09MLGSC5AL"
    role_class: "sales_leadership"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Robert Henderson"
    slack_id: "U07C4GVH5GQ"
    role_class: "revenue_leadership"
    send_external_calls: true
    send_internal_calls: true
    always_include_transcript: false
    
  # AEs
  - name: "Michael Cook"
    slack_id: "U09V1J1VBL4"
    role_class: "ae"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Reuben Tang"
    slack_id: "U09KCQ48NQN"
    role_class: "ae"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  # SDRs - Lower priority, filter more aggressively
  - name: "Adia Barkley"
    slack_id: "U07JRK6MGL9"
    role_class: "sdr_lead"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    filter_cold_calls: true  # Skip most cold calls
    
  - name: "Carter Thomas"
    slack_id: "U09S5QQCGS1"
    role_class: "sdr"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    filter_cold_calls: true
    min_call_duration_seconds: 300  # Only send if > 5 min
    
  - name: "Jamis Benson"
    slack_id: "U094PHNHCN8"
    role_class: "sdr"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    filter_cold_calls: true
    min_call_duration_seconds: 300
    
  - name: "Michael Haimowitz"
    slack_id: "U098Q4N5PEJ"
    role_class: "sdr"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    filter_cold_calls: true
    min_call_duration_seconds: 300
    
  # CSM Team - HIGH PRIORITY
  - name: "Ben Harrison"
    slack_id: "U092NQWH9PF"
    role_class: "cx_leadership"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Eli Gomez"
    slack_id: "U060G4DK1CZ"
    role_class: "csm"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Erika Vasquez"
    slack_id: "U092MH288P3"
    role_class: "csm"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Parker Alexander"
    slack_id: "U098T59RUMT"
    role_class: "csm_expansion"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Tyler Whittaker"
    slack_id: "U08GHTYTWVC"
    role_class: "csm"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Jasmin Beckwith"
    slack_id: "U09EWCXS01J"
    role_class: "csm"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  # Support
  - name: "Jake Allen"
    slack_id: "U09DY6JC5NU"
    role_class: "support"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    only_send_if_severity: ["P1", "P2"]  # Only escalations
    
  - name: "Matt Bennett"
    slack_id: "U098Z93UV71"
    role_class: "solutions_engineer"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  # Partnerships
  - name: "James Hinkson"
    slack_id: "U08QCGQFD1A"
    role_class: "partnerships_lead"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Pete Belliston"
    slack_id: "U07FAMYTG87"
    role_class: "ae_senior"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Tanner Mattson"
    slack_id: "U0A6T7A92T0"
    role_class: "partnerships"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    
  # Engineering - Generally skip
  - name: "Bryan Lund"
    slack_id: "U086JDRUYFJ"
    role_class: "engineering_lead"
    send_external_calls: false
    send_internal_calls: false
    always_include_transcript: false
    
  - name: "Kaden Wilkinson"
    slack_id: "U06EPEY9WNM"
    role_class: "engineering_leadership"
    send_external_calls: false
    send_internal_calls: false
    always_include_transcript: false
    
  # Engineering ICs - Skip all
  - name: "Dylan Shallow"
    slack_id: "U08L75ZGCV8"
    role_class: "engineering"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Eduardo Gueiros"
    slack_id: "U07TKK5JH5G"
    role_class: "engineering"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Jason Harmon"
    slack_id: "U094MHCL68M"
    role_class: "engineering"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Matt Noxon"
    slack_id: "U097YDR3L5P"
    role_class: "engineering"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Palmer Turley"
    slack_id: "U074WTX6KAN"
    role_class: "engineering"
    send_external_calls: false
    send_internal_calls: false
    
  # Marketing - Selective
  - name: "Tony Mickelsen"
    slack_id: "U09952LTB9S"
    role_class: "marketing_leadership"
    send_external_calls: true  # Customer reference calls
    send_internal_calls: false
    always_include_transcript: false
    only_call_types: ["marketing_reference", "marketing_analyst"]
    
  - name: "McKenzie Sacks"
    slack_id: "U093GUAJLUF"
    role_class: "marketing"
    send_external_calls: true
    send_internal_calls: false
    always_include_transcript: false
    only_call_types: ["marketing_reference"]
    
  # Marketing interns - Skip
  - name: "Coco Marriott"
    slack_id: "U0A7QEB951T"
    role_class: "marketing_intern"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Hayden Enloe"
    slack_id: "U0A46SB8ZT4"
    role_class: "marketing_intern"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Kayson Lewis"
    slack_id: "U0A1EUF96SY"
    role_class: "marketing_intern"
    send_external_calls: false
    send_internal_calls: false
    
  - name: "Quinn Bean"
    slack_id: "U0A1AV0RMEZ"
    role_class: "marketing_intern"
    send_external_calls: false
    send_internal_calls: false
    
  # Ops - Skip
  - name: "Andrew Brown"
    slack_id: "U0749RC9ZRR"
    role_class: "operations"
    send_external_calls: false
    send_internal_calls: false
```

---

## Full Processing Flow

```python
def process_transcript_for_pm_workspace(call_id, transcript_data, meeting_metadata):
    """Main entry point for PM workspace processing"""
    
    # Load config
    config = load_pm_workspace_config()
    
    # Stage 1: Already done - transcript_data contains transcript
    
    # Stage 2: Enrichment
    participants = enrich_participants(transcript_data, meeting_metadata)
    account = enrich_account(participants, crm_client)
    
    # Check person-specific config
    primary_internal = get_primary_internal_participant(participants)
    person_config = config["employees"].get(primary_internal["slack_id"])
    
    if not person_config:
        log.info(f"No PM config for {primary_internal['name']}, skipping")
        return None
    
    # Stage 3: Classification
    classification = {
        "internal_role": classify_internal_role(participants),
        "call_type": classify_call_type(participants, account, meeting_metadata),
        "has_external": len(participants.get("external", [])) > 0,
        "is_internal_only": len(participants.get("external", [])) == 0
    }
    
    # Check if this call type should be sent for this person
    if classification["is_internal_only"] and not person_config.get("send_internal_calls"):
        log.info(f"Internal call for {primary_internal['name']}, skipping")
        return None
    
    if not classification["is_internal_only"] and not person_config.get("send_external_calls"):
        log.info(f"External calls disabled for {primary_internal['name']}, skipping")
        return None
    
    # Check call type filter
    if person_config.get("only_call_types"):
        if classification["call_type"] not in person_config["only_call_types"]:
            log.info(f"Call type {classification['call_type']} not in allowed list")
            return None
    
    # Check duration filter for SDRs
    if person_config.get("min_call_duration_seconds"):
        if meeting_metadata.get("duration_seconds", 0) < person_config["min_call_duration_seconds"]:
            log.info(f"Call too short ({meeting_metadata.get('duration_seconds')}s)")
            return None
    
    # Check cold call filter
    if person_config.get("filter_cold_calls") and classification["call_type"] == "sdr_cold_call":
        log.info(f"Cold call filtered for {primary_internal['name']}")
        return None
    
    # Stage 4: Extraction
    signals = extract_signals(transcript_data, classification, account)
    
    # Stage 5: Scoring
    pm_value = score_pm_value(classification["call_type"], signals, account)
    recommended_level = recommend_signal_level(
        pm_value["score"], signals, account, classification["call_type"]
    )
    pm_value["recommended_level"] = recommended_level
    
    # Should send?
    if not should_send_to_pm_workspace(classification["call_type"], signals, pm_value):
        log.info(f"Call {call_id} below threshold, not sending")
        return None
    
    # Override transcript inclusion based on person config
    if person_config.get("always_include_transcript"):
        signals["include_transcript"] = True
    
    # Stage 6: Webhook
    payload = assemble_webhook_payload(
        call_id=call_id,
        call_metadata=meeting_metadata,
        participants=participants,
        account=account,
        classification=classification,
        signals=signals,
        scoring=pm_value,
        transcript=transcript_data
    )
    
    success = send_webhook(payload, config)
    
    return {
        "call_id": call_id,
        "sent": success,
        "classification": classification,
        "level": recommended_level["level"],
        "pm_value_score": pm_value["score"]
    }
```

---

## Summary: Who Gets What

| Role Class | Send External | Send Internal | Include Transcript | Filter |
|------------|---------------|---------------|-------------------|--------|
| **executive** | ✅ | ✅ | On request | Privacy override |
| **product_leadership** | ✅ | ✅ | ✅ Always | None |
| **product** | ✅ | ❌ | ✅ Always | None |
| **design** | ✅ | ❌ | ✅ (Tyler), ❌ (Adam) | None |
| **sales_leadership** | ✅ | ❌ | ❌ | None |
| **revenue_leadership** | ✅ | ✅ | ❌ | None |
| **ae** | ✅ | ❌ | ❌ | None |
| **ae_senior** | ✅ | ❌ | ❌ | None |
| **sdr_lead** | ✅ | ❌ | ❌ | Cold calls |
| **sdr** | ✅ | ❌ | ❌ | Cold calls, < 5 min |
| **cx_leadership** | ✅ | ❌ | ❌ | None |
| **csm** | ✅ | ❌ | ❌ | None |
| **csm_expansion** | ✅ | ❌ | ❌ | None |
| **support** | ✅ | ❌ | ❌ | P3/P4 severity |
| **solutions_engineer** | ✅ | ❌ | ❌ | None |
| **partnerships_lead** | ✅ | ❌ | ❌ | None |
| **partnerships** | ✅ | ❌ | ❌ | None |
| **engineering_leadership** | ❌ | ❌ | N/A | All |
| **engineering** | ❌ | ❌ | N/A | All |
| **marketing_leadership** | ✅ | ❌ | ❌ | Only reference calls |
| **marketing** | ✅ | ❌ | ❌ | Only reference calls |
| **marketing_intern** | ❌ | ❌ | N/A | All |
| **operations** | ❌ | ❌ | N/A | All |

---

## Estimated Weekly Volume to PM Workspace

| Source | Raw Calls | After Filtering | L1 | L2 | L3 |
|--------|-----------|-----------------|----|----|----| 
| AE calls | 20-25 | 20-25 | 5 | 15 | 5 |
| CSM calls | 35-50 | 35-50 | 15 | 25 | 10 |
| SDR calls | 150-200 | 10-15 | 10 | 5 | 0 |
| Product/Design | 10-15 | 10-15 | 0 | 5 | 10 |
| Leadership | 10-15 | 5-10 | 2 | 5 | 3 |
| Partnerships | 10-15 | 5-10 | 5 | 5 | 0 |
| Support | 20-30 | 3-5 | 0 | 3 | 2 |
| Marketing | 5-10 | 2-5 | 2 | 3 | 0 |
| **Total** | **260-360** | **90-135** | **39** | **66** | **30** |

~90-135 signals/week to PM workspace (down from 260-360 raw calls)

---

*Created: February 1, 2026*
*Status: Ready for AskElephant engineering review*
