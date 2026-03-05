# Internal Search Marketing Email Validation

> **Date:** January 16, 2026  
> **Feature:** Internal Search (Beta)  
> **Email Subject:** "What can you actually do with your meetings?"

---

## Summary

The marketing email is **largely accurate** with one claim that needs nuance. The Internal Search feature is a powerful natural-language query system that searches across meetings, companies, contacts, and more.

---

## Claim-by-Claim Validation

### ✅ Claim 1: "Ask AskElephant any question in natural language"

**Status:** ACCURATE

**Evidence from codebase:**
- The internal search agent accepts natural language queries via `inputSchema` with a string query parameter
- System prompt explicitly states: "Parse the user's natural-language request and identify the concrete outcome they expect"
- Supports synonymous terms automatically (accounts/orgs/organizations/companies/customers/clients)

```typescript
// From internal-search.ts
const description = `Unified internal search orchestrator that understands natural-language 
questions about the workspace and uses specialized agents to find customers (companies, 
contacts), engagements(meetings, calls, emails), chats, team members (users), workflows, 
signals, and tooling metadata.`
```

**Recommendation:** Keep as-is.

---

### ✅ Claim 2: "Need to know a customer's main objections before your next call?"

**Status:** ACCURATE (with context)

**How it works:**
- Internal search can find meetings by company and search transcript content semantically
- Meeting search uses vector embeddings for **semantic similarity** (not just keyword matching)
- Can search across meeting transcripts, workflow outputs, and chat summaries

**Evidence from codebase:**
```typescript
// From perform-meeting-query.ts
`Searches for meetings/engagements based on semantic similarity and rich filter criteria. 
This tool lets you search meetings by semantic meaning—not just keywords—while still 
leveraging filters such as search text, date ranges, duration, participants, and more.`
```

**Caveats:**
- Requires meetings to be recorded and processed
- Works best when workflows have extracted structured insights
- Can search transcript text directly OR find workflow-generated summaries

**Recommendation:** Keep as-is. The semantic search capability makes this claim valid.

---

### ✅ Claim 3: "Want to see what commitments you made to [Company] last month?"

**Status:** ACCURATE

**How it works:**
- Can filter meetings by company name/ID
- Supports date range filtering with natural language ("last month")
- Searches meeting transcripts and workflow outputs (like action items, summaries)
- Returns links to the actual meetings/records

**Evidence from codebase:**
```typescript
// From internal-search.ts
`Key object relationships:
- MEETINGS (mtg_*) → COMPANIES (cmp_*): meetings are linked to companies through their participants
- CHATS (chat_*) → MEETINGS: Workflows create chats associated with meetings (engagements) 
to provide meeting summaries, coaching notes, etc.`
```

**Recommendation:** Keep as-is.

---

### ⚠️ Claim 4: "Want to know which deals are at risk and why?"

**Status:** PARTIALLY ACCURATE - Needs nuance

**What the feature CAN do:**
- Search for health score data and signals that indicate risk
- Find existing workflow outputs about deal risk or churn indicators
- Surface meetings where risk-related topics were discussed
- Query signal values like sentiment scores or negative indicators

**What the feature CANNOT do (directly):**
- Real-time deal risk analysis (must query existing analysis)
- Direct CRM deal stage querying (requires activating CRM tools)
- Generate new risk assessments on the fly

**Evidence from codebase:**
```typescript
// From internal-search.ts - Data limitations
`Specialized analysis (sentiment, churn risk, business needs, etc.)
- These insights must already exist as workflow outputs or stored chats to be returned. 
If the user wants a new analysis, surface the closest stored outputs so that the 
calling agent has the context to generate the analysis.`
```

**However, the system does support:**
- Health Score Agent that calculates risk scores
- Signal-based tracking of risk indicators across meetings
- Workflow automation for identifying at-risk signals

**Recommended revision options:**

**Option A (More accurate):**
> "Want to see which deals might be at risk based on your recent conversations?"

**Option B (Keep but add context):**
> "Want to know which deals are at risk and why? Internal search surfaces the signals and conversation patterns that indicate risk."

---

### ✅ Claim 5: "No more hunting through meetings or notes"

**Status:** ACCURATE

**Evidence:**
- Unified search across 8+ entity types in one query
- Semantic search means users don't need exact keywords
- Always returns links to source records
- Can traverse relationships (contact → company → meetings)

**Recommendation:** Keep as-is.

---

### ✅ Claim 6: "This is where your data actually works for you"

**Status:** ACCURATE (and aligned with product vision)

**Evidence:**
This aligns perfectly with the product vision:
> "Taking unstructured data from one place and giving it to the right person at the right time and the right format." — Woody Klemetson, CEO

**Recommendation:** Keep as-is.

---

## Overall Assessment

| Claim | Status | Action Needed |
|-------|--------|---------------|
| Natural language questions | ✅ Accurate | None |
| Customer objections | ✅ Accurate | None |
| Commitments made | ✅ Accurate | None |
| Deals at risk | ⚠️ Partial | Minor revision recommended |
| No more hunting | ✅ Accurate | None |
| Data works for you | ✅ Accurate | None |

**Verdict:** Email is ready to send with minor optional revision to claim #4 for precision.

---

## Technical Capabilities Summary (For Marketing Reference)

### What Internal Search Can Find:
- **Companies** - customers, prospects, partners by name, domain, or ID
- **Contacts** - people by name, email, phone, company association
- **Meetings** - by semantic meaning, date range, participants, company
- **Chats** - AI-generated summaries, workflow outputs, coaching notes
- **Team Members** - internal users by name or role
- **Workflows** - automation configurations and outputs
- **Signals** - extracted data points (sentiment, objections, commitments)
- **Signal Values** - specific extracted values from meetings

### Key Differentiators:
1. **Semantic search** - finds by meaning, not just keywords
2. **Relationship traversal** - connects companies ↔ contacts ↔ meetings
3. **Natural language** - no query syntax to learn
4. **Always links to source** - every result links to the original record
5. **CRM integration** - can activate HubSpot/Salesforce tools when needed
