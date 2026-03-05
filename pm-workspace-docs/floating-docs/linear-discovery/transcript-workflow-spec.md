# AskElephant Transcript → Linear Feedback Workflow
## Full Design Specification

**Date:** February 27, 2026  
**Status:** Planning — no changes made  
**Goal:** Automatically extract customer feature requests and product feedback from AskElephant call transcripts and attach them to the Linear `Requests` team as properly attributed, deduplicated issues — with company name, call link, participants, and MRR — without requiring a CSM or PM to do anything manually.

**Scope:** This workflow captures **feature requests and customer voice only**. It does not create bug reports. If a customer mentions a bug on a call, that is out of scope for this workflow and should be filed separately through the normal support channel. The signal this workflow is listening for is: what do customers wish the product could do?

---

## What This Workflow Produces

For every processed call transcript where a customer expresses a feature request or product feedback, Linear receives:

```
REQUEST team — Triage state

Issue: "Support bi-directional sync for HubSpot custom objects"
  Type: feature-request · Area: area/integrations · Priority: High
  
  Customer Requests:
    └── Acme Corp ($220k MRR)
          Quote: "We have custom objects in HubSpot for deal stages and we 
                  can't see any of that data in AskElephant right now."
          Source: [AskElephant call — Feb 27, 2026] ← clickable link
          Participants: John Smith (Director of Sales), Jane Doe (VP Revenue)
```

A single call can produce multiple issues (or multiple Customer Requests added to existing issues). Each one is attributed to the company at the call level, with every external participant's name in the body.

---

## Data Available from an AskElephant Transcript

Before designing the workflow, this is the raw material it has to work with:

| Field | Source | Used For |
|---|---|---|
| `call.id` | AskElephant | Unique identifier for dedup tracking |
| `call.url` | AskElephant | The `attachmentUrl` passed to Linear — creates clickable source link |
| `call.date` | AskElephant | Context in issue body |
| `call.duration` | AskElephant | Context in issue body |
| `call.title` | AskElephant (calendar sync) | Context |
| `call.participants[]` | AskElephant speaker ID | Who was on the call, internal vs. external |
| `participant.name` | AskElephant / CRM sync | Display in issue body |
| `participant.email` | AskElephant / CRM sync | Used to look up HubSpot contact |
| `participant.is_internal` | AskElephant | Separate internal from external |
| `transcript.segments[]` | AskElephant | The actual words, attributed to speaker |
| `company.name` | HubSpot (via CRM sync) | Linear customer name |
| `company.domain` | HubSpot | Linear `customerUpsert` domain match |
| `company.hubspot_id` | HubSpot | Used as `externalId` in Linear customer |
| `company.mrr` | HubSpot | Linear customer `revenue` field |
| `company.tier` | HubSpot | Linear customer `tierId` |

---

## Workflow Architecture

```
AskElephant
  │
  ├── TRIGGER: transcript.processed webhook fires
  │
  ├── STEP 1 ── Parse call metadata
  │              Extract: date, duration, title, call URL
  │              Separate participants: internal vs. external
  │              If no external participants → SKIP (internal call)
  │
  ├── STEP 2 ── Enrich company from HubSpot
  │              Look up each external participant email in HubSpot
  │              Resolve to company: name, domain, MRR, tier, HubSpot ID
  │              If no HubSpot match → use email domain as fallback company name
  │
  ├── STEP 3 ── Extract feature request signals from transcript
  │              AI pass over full transcript segments
  │              For each signal: quote, speaker, classification, confidence
  │              Discard: bug reports, internal discussion, admin topics, praise only
  │
  ├── STEP 4 ── For each signal: deduplication check
  │              Search Linear REQUEST team by keywords + semantic similarity
  │              If match (confidence ≥ 0.75) → PATH B (add to existing)
  │              If no match → PATH A (create new issue)
  │
  ├── PATH A ── Create new Linear issue
  │     │        issueCreate in REQUEST team, Triage state
  │     │        AI-generated title + structured body (see template below)
  │     │        Labels: area/*, type: feature-request | improvement
  │     │
  │     └──────> customerUpsert (company, domain, HubSpot ID, MRR, tier)
  │              customerNeedCreate (issueId, customerExternalId, body, attachmentUrl)
  │
  ├── PATH B ── Add to existing Linear issue
  │     │        customerUpsert (same as above — idempotent)
  │     │        customerNeedCreate (existing issueId, customerExternalId, body, attachmentUrl)
  │     │        issueAddComment (add new signal as a comment on the existing issue)
  │     │
  │     └──────> [Company request count on that issue increments]
  │              [Revenue exposure on that issue increases]
  │
  └── STEP 5 ── Post Slack summary notification
                 Post to #epd-all (or #linear-intake-feed):
                 "3 signals from Acme Corp call — 2 new issues, 1 added to existing"
                 Links to each issue
```

---

## Step 3: Signal Extraction — The Extraction Prompt

This is the AI instruction that reads the transcript and finds feedback. Run this as a structured extraction, not a summarization.

**System prompt:**
```
You are extracting customer feature requests and product feedback from a sales or 
customer success call transcript.

Your job is to find every moment where a customer (external participant) expresses:
- A feature they wish the product had
- A capability that is missing or not yet built
- A workflow they cannot complete because the product doesn't support it yet
- A comparison to a competitor's capability they want AskElephant to match
- Strong positive feedback about an existing feature (voice of the customer signal)

Do NOT flag:
- Bug reports or technical errors ("it's broken", "it crashed", "error message") — 
  these are out of scope for this workflow
- Compliments with no embedded product ask
- Internal team discussion
- Administrative or scheduling topics
- Vague statements with no specific, actionable product request

Be conservative: only flag signals where you can write a clear, one-line feature 
request title from what the customer said.
```

**Extraction output schema per signal:**
```json
{
  "signal_id": "unique_id",
  "verbatim_quote": "exact words from transcript, including speaker attribution",
  "speaker_name": "John Smith",
  "speaker_is_external": true,
  "context_before": "1-2 sentences immediately before the quote",
  "context_after": "1-2 sentences immediately after the quote",
  "classification": "feature-request | improvement | competitive-mention | voice-of-customer",
  "suggested_title": "one-line feature request title suitable for a Linear issue",
  "suggested_area": "area/conversations | area/integrations | area/automations | area/insights-search | area/platform | area/mobile-desktop",
  "confidence": 0.0-1.0,
  "urgency_language_detected": true/false,
  "urgency_language_quote": "we can't move forward without this / this is blocking our workflow"
}
```

**Classification values:**
- `feature-request` — Customer is asking for something the product doesn't yet have
- `improvement` — Customer wants an existing feature to work differently or better
- `competitive-mention` — Customer references a capability a competitor has that AskElephant lacks
- `voice-of-customer` — Strong positive signal about an existing feature worth capturing ("this saved us 3 hours a week")

**Confidence thresholds:**
- `≥ 0.85` — Auto-submit to Linear (clear, direct product ask with named feature)
- `0.60 – 0.84` — Queue for human review (possible request, ambiguous or indirect)
- `< 0.60` — Discard (too vague, not actionable)

The review queue for 0.60–0.84 confidence items is a daily Slack digest: "5 signals from today's calls are pending review — confirm or dismiss." This keeps the auto-submitted issues high-quality while not losing borderline signals.

---

## Step 4: Deduplication Search

Before creating any new issue, run a search against the LINEAR API:

```graphql
query IssueSearch($term: String!, $teamId: String!) {
  issueSearch(query: $term, filter: { team: { id: { eq: $teamId } } }) {
    nodes {
      id
      title
      description
      state { name }
      customerNeeds { nodes { customer { name } } }
    }
  }
}
```

Run this twice:
1. With the `suggested_title` as the search term
2. With 3-5 keywords extracted from the verbatim quote

If any result has a title/description that semantically overlaps with the extracted signal, it's a candidate duplicate. Apply a second AI classification pass: "Are these two requests about the same underlying product need?" with yes/no + confidence.

**What "match" means in practice:**
- "Support custom HubSpot objects" = matches "Bi-directional HubSpot custom object sync" → PATH B
- "Export meeting transcripts to Notion" ≠ "Notion Integration" (too broad) → PATH A, create specific issue

**Never merge if:**
- The existing issue is in `Won't Do` or `Done` state — create a new issue (customer has re-raised it), reference the closed one in the description
- The existing issue has already been moved to the Development team — add a comment to that issue instead of creating a duplicate, and note in the comment that it came from a transcript

---

## Step 5: Linear API Calls — Exact Sequence

### 5a. Customer Upsert (run once per company per call)

Use `customerUpsert` — not `customerCreate`. This handles the case where the company already exists in Linear from Pylon, Intercom, or a previous transcript.

```graphql
mutation CustomerUpsert($input: CustomerUpsertInput!) {
  customerUpsert(input: $input) {
    success
    customer { id name externalIds domains }
  }
}
```

```json
{
  "input": {
    "name": "Acme Corp",
    "domains": ["acme.com"],
    "externalId": "hs-company-12345678",
    "revenue": 18333,
    "size": 45
  }
}
```

- `externalId`: HubSpot company ID, prefixed `hs-company-` to namespace it
- `revenue`: monthly MRR in dollars (not ARR — Linear's field is monthly)
- `domains`: company email domain — this is how Linear deduplicates companies across integrations

Linear will match by domain first. If Acme Corp already exists, it adds `hs-company-12345678` to their `externalIds` list. Future calls can use `customerExternalId: "hs-company-12345678"` directly.

---

### 5b. Issue Create (PATH A only — new issues)

```graphql
mutation IssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue { id identifier url }
  }
}
```

```json
{
  "input": {
    "teamId": "3db8af11-ae15-4568-ab02-e1003b4c6a1b",
    "stateId": "<Triage state ID for REQUEST team>",
    "title": "Support bi-directional sync for HubSpot custom objects",
    "description": "<see body template below>",
    "labelIds": ["<feature-request label ID>", "<area/integrations label ID>"],
    "priority": 2
  }
}
```

Priority mapping from signal:
- `urgency_language_detected: true` (e.g., "we can't move forward without this") → priority 2 (High)
- `classification: feature-request` + confidence ≥ 0.85 → priority 3 (Medium)
- `classification: improvement` → priority 3 (Medium)
- `classification: competitive-mention` → priority 3 (Medium)
- `classification: voice-of-customer` → priority 4 (Low) — captured for context, not urgent action

---

### 5c. Customer Need Create (both paths)

```graphql
mutation CustomerNeedCreate($input: CustomerNeedCreateInput!) {
  customerNeedCreate(input: $input) {
    success
    need { id body attachment { url } }
  }
}
```

```json
{
  "input": {
    "issueId": "<issue UUID>",
    "customerExternalId": "hs-company-12345678",
    "body": "<see body template below>",
    "attachmentUrl": "https://app.askelephant.com/calls/abc123",
    "priority": 1
  }
}
```

The `attachmentUrl` is the AskElephant call URL. This creates a visible attachment on the Linear issue — anyone clicking the Customer Request link can jump directly to the call recording and transcript. This is the most important field for providing evidence.

`priority: 1` = "Important" — use this for any signal where the customer expressed strong need language.

---

### 5d. Add Comment (PATH B only — existing issues)

When adding to an existing issue, also post a comment so the history is visible:

```graphql
mutation CommentCreate($input: CommentCreateInput!) {
  commentCreate(input: $input) {
    success
    comment { id }
  }
}
```

```json
{
  "input": {
    "issueId": "<existing issue UUID>",
    "body": "<see comment template below>"
  }
}
```

---

## Issue Body Template (PATH A — new issues)

This is the `description` field on the newly created issue:

```markdown
## What the customer said

> "[exact verbatim quote from transcript, with speaker name]"

**Context:** [1-2 sentences immediately surrounding the quote for full clarity]

---

## Call details

| | |
|---|---|
| **Date** | February 27, 2026 |
| **Company** | Acme Corp |
| **Call recording** | [View in AskElephant →](https://app.askelephant.com/calls/abc123) |
| **Duration** | 42 minutes |
| **Call title** | Quarterly Business Review |

---

## Participants

**Customer (Acme Corp):**
- John Smith — Director of Sales (john@acme.com)
- Jane Doe — VP of Revenue (jane@acme.com)

**Internal (AskElephant):**
- Tyler Sahagun — PM
- Sam Ho — Customer Success

---

## Auto-classification
- **Signal type:** Feature request
- **Suggested area:** Integrations
- **Confidence:** 0.92
- **Urgency language detected:** No

*This issue was created automatically by the AskElephant transcript workflow.*
*Source call: [AskElephant call abc123](https://app.askelephant.com/calls/abc123)*
```

---

## Customer Need Body Template (both paths)

This is the `body` field on the `customerNeedCreate` — it shows under the Customer Request entry in Linear:

```markdown
**Quote:** "We have custom objects in HubSpot for deal stages and we can't see any 
of that data in AskElephant right now."

**Speaker:** John Smith, Director of Sales

**Context:** [Customer was describing their CRM workflow. After this, they mentioned 
they'd evaluated a competitor specifically because of this capability.]

**Call:** [Feb 27, 2026 — 42 min QBR](https://app.askelephant.com/calls/abc123)

**All participants:** John Smith (Dir. Sales), Jane Doe (VP Revenue) + 2 internal
```

---

## Comment Template (PATH B — adding to existing issues)

Posted as a comment on the existing issue when a duplicate is detected:

```markdown
**New signal from Acme Corp — Feb 27, 2026**

> "[verbatim quote from new call]"
> — John Smith, Director of Sales

**Call:** [View in AskElephant →](https://app.askelephant.com/calls/abc123)

**Participants:** John Smith, Jane Doe (Acme Corp) + Tyler Sahagun, Sam Ho (internal)

*This signal was detected as matching this existing issue (0.88 confidence).  
A Customer Request has been attached to associate Acme Corp's demand.*
```

---

## Step 5: Slack Notification

After processing completes for a call, post a summary to `#linear-intake-feed` (or `#epd-all` during rollout):

```
🎙️ Transcript processed: Acme Corp QBR (Feb 27, 2026 · 42 min)

3 signals captured:
  → NEW  [REQUEST-247] Support bi-directional sync for HubSpot custom objects
  → NEW  [REQUEST-248] Mobile push notifications for meeting prep reminders  
  → ADDED TO  [REQUEST-189] Export transcripts to Google Drive
            (Acme Corp now the 4th company requesting this · $220k MRR)

CSMs on call: Sam Ho · Tyler Sahagun
Participants: John Smith, Jane Doe (Acme Corp)
```

This gives the PM team instant visibility without needing to check Linear, and signals to CSMs that their call generated tracked demand.

---

## Human Review Queue (0.60–0.84 confidence)

Low-confidence signals don't get auto-submitted. They queue for a daily review. Once per day, post to `#epd-all`:

```
📋 5 signals pending review from today's calls

  ? "I think there might be a way to do this but it's not obvious"
    → Acme Corp QBR · Speaker: John Smith · Confidence: 0.71
    [Submit as REQUEST] [Dismiss]

  ? "It would be nice if the summary could be customized"
    → Widget Inc Demo · Speaker: Sarah Lee · Confidence: 0.65
    [Submit as REQUEST] [Dismiss]
    
  ... 3 more
```

The PM or triage captain clicks Submit or Dismiss in Slack. Submit triggers the full PATH A or PATH B flow immediately. Dismiss logs the decision with a reason dropdown (too vague, not our problem, already exists, etc.).

---

## Edge Cases

| Scenario | Handling |
|---|---|
| **Internal-only call** (no external participants) | Skip entirely — no customer signals to capture |
| **Multiple companies on one call** (partner call, multi-vendor) | Attribute signals to the company whose representative said them |
| **Call with no extracted signals** | Log "transcript processed, 0 signals" — no Linear issues created |
| **Company not in HubSpot** | Use email domain to infer company name, create Linear customer with domain only (no MRR) |
| **Transcript partially processed** | Set retry after 5 minutes; max 3 retries before flagging for manual review |
| **AskElephant call already processed** | Check call ID against a processed-calls log before running — avoid double-submissions |
| **Existing issue in `Won't Do` state** | Do not add to it — create a new issue (customer has re-raised) with a reference to the closed issue |
| **Signal is about a competitor, not a product gap** | Classify as `competitive-mention`, route to a separate label or Slack channel, do not create REQUEST issue |

---

## Phased Build Plan

### Phase 1 — Manual Trigger (Week 1-2)
Build the workflow but require a human to kick it off:
- After every significant customer call, PM or CSM clicks "Extract feedback" in AskElephant
- Workflow runs, shows extracted signals for review before submitting to Linear
- All signals require human confirmation — no auto-submit yet
- Goal: validate the extraction quality and dedup logic before automation

### Phase 2 — Auto-Submit High-Confidence (Week 3-4)
- Signals with confidence ≥ 0.85 auto-submit to Linear Triage
- Signals 0.60–0.84 queue for daily review
- Monitor false positive rate — if more than 15% of auto-submitted issues get marked Won't Do or duplicate within 1 week, tighten the threshold
- Add the Slack notification to `#linear-intake-feed`

### Phase 3 — Full Automation (Week 5+)
- All calls with external participants automatically processed after transcript finalizes
- Review queue handles borderline signals
- Monthly audit: check that dedup accuracy is holding, no company over- or under-represented
- Add `tierId` to customer upsert once tiers are configured in Linear

---

## Linear IDs Reference

These are the actual team and label IDs for the AskElephant workspace:

```
REQUEST team ID: 3db8af11-ae15-4568-ab02-e1003b4c6a1b
  ↑ The only team this workflow ever creates issues in

Labels applied by this workflow (type):
  feature-request, improvement
  (bug, question, spike, initiative exist in Linear but are not used by this workflow)

Labels (area):
  area/mobile-desktop, area/platform, area/integrations,
  area/automations, area/insights-search, area/conversations
```

Fetch the Triage state ID for the REQUEST team at build time:

```graphql
query RequestTeamStates {
  team(id: "3db8af11-ae15-4568-ab02-e1003b4c6a1b") {
    states { nodes { id name type } }
  }
}
```

Filter for `type: "triage"` — that state ID is the `stateId` used in every `issueCreate` call this workflow makes.
