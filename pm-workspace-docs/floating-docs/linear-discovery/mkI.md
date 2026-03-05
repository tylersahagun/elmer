# Customer Voice → Linear: System Design & Operational Model

**Date:** February 27, 2026  
**Status:** Planning only — no changes to Linear, Slack, or AskElephant  
**Scope:** Full system from intake through roadmapping, with operational rhythms

---

## 1. Intake Pipeline Design

### The Four Sources and How They Connect

Each source has a distinct connection path. The principle: use Linear-native mechanisms first, custom AskElephant workflows only where native integration gaps exist.

---

#### Pylon (Help Center)

Pylon offers two distinct integration paths. Use both in layers — the native integration for real-time routing, the MCP for the intelligence layer that runs on top of it.

---

**Layer 1: Native Pylon-Linear Integration (Real-Time)**

Pylon has a direct Linear integration. Configure it to automatically create a Linear issue in the `Requests` team (key: `REQUEST`) whenever a ticket is opened or tagged. Everything lands in Triage first — do not route directly to `Product` or `Development` on intake.

Required configuration:
- Map Pylon ticket type "bug" → label `bug` in REQUEST Triage
- Map Pylon ticket type "feature request" / "question" → label `feature-request` in REQUEST Triage
- Pass through: customer email, company name, Pylon ticket URL as a comment
- Enable two-way sync: when a Linear issue moves to `Shipped`, the Pylon ticket closes with a resolution note

**What the native integration gets wrong:** It relies on whoever filed the Pylon ticket to tag it correctly. A customer who types "your product is broken when I try to X" may get tagged as "question" by the CX team, which means it lands in REQUEST rather than ASK. Classification accuracy is only as good as the CX team's tagging discipline.

---

**Layer 2: Pylon MCP Batch Processing (Daily Intelligence Pass)**

Pylon has a published MCP server (`marcinwyszynski/pylon-mcp`) that exposes `pylon_get_issues` with date/status filters. This enables a daily automated sweep that runs an AI classification pass on top of the native integration — without requiring the CX team to do manual routing.

**How the daily sweep would work (AskElephant workflow):**

```
TRIGGER: Daily at end of business day (or hourly for high-volume periods)

STEP 1 — Pull new Pylon tickets
  pylon_get_issues(created_after: last_run_timestamp, status: open)

STEP 2 — For each ticket, AI classification pass
  - Read ticket title + body + any customer replies
  - Classify: bug | feature-request | question | account-management | billing
  - Assess severity: critical (blocking) | high | medium | low
  - Extract: customer name, company, verbatim description of the ask

STEP 3 — Deduplication check against Linear
  - Search REQUEST team for issues with semantic similarity > 0.75
  - If match: add Customer Request to existing issue + attach Pylon ticket link
              Skip to STEP 5
  - If no match: continue to STEP 4

STEP 4 — Create or route issue
  - feature-request / improvement:
      Create issue in REQUEST Triage with AI-generated title + description
      Attach Customer Request with company + MRR (pull from HubSpot)
  - bug (non-critical):
      Create issue in ASK Triage with label: bug
  - bug (critical / "blocking" language detected):
      Create issue in ASK Triage, priority: Urgent, notify on-call
  - question:
      Tag as answered if KB article exists (via pylon_get_knowledge_base_articles)
      Or route to CX for reply — do not create Linear issue

STEP 5 — Comment on Pylon ticket
  - Post internal note on Pylon ticket: "Routed to Linear [issue link]"
  - Closes the loop so CX knows the ticket was captured
```

**Comparison: when to rely on which layer**

| | Native Integration | MCP Batch |
|---|---|---|
| Speed | Real-time | End of day (or hourly) |
| Classification | Manual (CX tags it) | AI-driven from content |
| Deduplication | None | Semantic search before creating |
| Customer enrichment | Basic (Pylon contact) | Can pull MRR from HubSpot |
| Setup complexity | Low (point-and-click) | Medium (requires workflow build) |
| Coverage | Only explicitly-tagged tickets | Catches mis-tagged and untagged |

**Recommended approach:** Turn on the native integration now (zero effort, immediate coverage). Build the MCP batch workflow as the Phase 2 automation. The native integration ensures nothing falls through the cracks in the interim; the MCP batch adds the classification and dedup intelligence that the native integration lacks.

**Bug routing exception (applies to both layers):** Even bugs route to REQUEST Triage by default so the triage captain makes the call. The sole exception is tickets where the Pylon tag is `critical` or the content contains language like "site down," "data loss," "all users affected" — those route directly to ASK Triage with `Urgent` priority, bypassing REQUEST entirely.

---

#### Gmail / Email

**Connection method:** Linear provides a per-team email address (e.g., `team+requests@linear.app`). Configure Gmail forwarding rules or a filter to forward inbound customer email threads to that address. New issue is created in REQUEST Triage with the email body as the description.

**Practical setup:**

- Create a Gmail filter: any email from known customer domains (or CC'd to `support@`, `cs@`, etc.) matching keywords like "feature", "request", "would love", "wish", "bug", "broken", "not working" → forward to the REQUEST team email address
- AskElephant's email-processing workflow should supplement this for unstructured email threads where keyword matching isn't reliable — extract the core ask and create a structured issue rather than dumping raw email text

**What Linear-native email intake doesn't do:** It doesn't deduplicate or classify. That work happens at triage.

---

#### Slack

There are three distinct mechanisms available in Linear's Slack integration. Each has a different friction level and use case. Use all three — they complement rather than replace each other.

---

**Mechanism 1: Emoji Reaction (`:ticket:`) — Zero-Friction Capture**

Available on Business and Enterprise plans. Configure a Slack emoji (`:ticket:` is standard) as a trigger in Linear's Slack integration settings. When anyone reacts to a Slack message with that emoji:

1. Linear's AI reads the message content
2. Generates an issue title (not the raw message — an interpreted, clean title like "Visual heatmap overlay for roadmap")
3. Opens the Asks form pre-populated with: AI-generated title, verbatim message as description, and — if the channel is linked to a Linear customer entity — the customer automatically associated
4. The submitter reviews/confirms and sends

This is the lowest-friction mechanism in the entire system. A CSM in `#ext-kixie-askelephant` sees a customer request, reacts with `:ticket:`, confirms the auto-populated form, done. No copy-paste, no switching apps, no remembering field names. This is what the screenshot shows.

**For `#ext-*` channels specifically:** Make sure each channel is linked to its corresponding Linear customer entity. When the emoji trigger fires from a linked channel, the customer is pre-associated with the issue — which is what enables the revenue-weighted prioritization to work.

---

**Mechanism 2: `@Linear` Agent — Conversational Issue Creation**

Linear launched a native Slack AI agent in October 2025, available on all plans. Mention `@Linear` anywhere in Slack and the agent:
- Reads the full thread context (not just one message)
- Infers the issue type, title, description, and suggested labels from the conversation
- Creates the issue with natural language confirmation

Usage patterns:
- `@Linear` (no text) — agent infers everything from thread context
- `@Linear create a high-priority bug for the HubSpot sync issue Chris described` — explicit instructions override inferences
- Works in threads where the signal spans multiple messages (which the emoji reaction can't handle cleanly)

This is the best mechanism when the relevant context is spread across a thread — a 10-message back-and-forth about a customer's problem where the actual ask only becomes clear at the end.

**This is likely what you've been using as "Agent One."** It's the `@Linear` agent built into the Slack integration, not a separate app.

---

**Mechanism 3: Asks Templates — Structured Intake with Required Fields**

Configured Ask templates enforce required fields at submission time. Create two:

| Template | Routes To | Required Fields |
|---|---|---|
| **Report a Bug** | ASK team, Triage state | Severity (Urgent/High/Medium), description, steps to reproduce |
| **Request a Feature** | REQUEST team, Triage state | Summary (one sentence), which customers asked for this, any context |

Access via `/ask` command or the Linear shortcut in Slack. Unlike the emoji trigger, templates give the submitter a form to fill — which is useful when you want to enforce minimum quality (e.g., CSMs filing from `#ext-*` channels and needing to specify severity).

**When to use which:**

| Scenario | Best Mechanism |
|---|---|
| CSM sees a quick one-line feature request in customer channel | `:ticket:` emoji reaction |
| Thread has 10 messages of back-and-forth, ask buried in context | `@Linear` agent mention |
| CSM needs to specify severity, reproduction steps, or structured fields | Asks template |
| Internal PM wants to file a request they heard on a call | `:ticket:` emoji or Asks template |

Install all three in: `#ext-*` customer channels, `#product-requests`, `#product-issues` (transition), `#epd-all`.

---

**Automated Slack Monitoring (AskElephant workflow — future state)**

AskElephant should passively monitor key channels for feature intent and bug language, then surface a prompt: "I noticed a potential feature request in this thread — should I file it in Linear?" This acts as a safety net for the signals that no one reacted to or @-mentioned the agent for. The three manual mechanisms above handle the cases where someone actively recognizes a signal; the AskElephant monitor catches the ones that almost slipped through.

---

#### AskElephant Transcripts

**Connection method:** AskElephant workflow (not yet built). This is the highest-signal source because it captures what customers say in calls, not just what CSMs remember to file later.

**Full specification:** See [`transcript-workflow-spec.md`](./transcript-workflow-spec.md) for the complete design — extraction prompts, Linear API sequence, issue/body templates, confidence thresholds, edge cases, and phased build plan.

**How it works (summary):**

1. **Trigger:** Transcript processing completes for any call with external participants
2. **Extract:** AI pass finds all spans where a customer expresses a feature request, limitation, or bug — outputs verbatim quote, speaker, classification, confidence score, and suggested area label
3. **Enrich:** Look up each external participant in HubSpot to get company name, domain, MRR, tier, and HubSpot company ID
4. **Dedup:** Search Linear semantically before creating — match ≥ 0.75 = add Customer Request to existing issue, no new issue created
5. **Route:** All signals → REQUEST Triage. This workflow only creates feature requests and improvements — bugs are out of scope and are not captured here. Competitive mentions → flagged separately, no issue created.
6. **Attach company:** `customerUpsert` (not `customerCreate`) so existing Linear customers from Pylon or other integrations are matched rather than duplicated
7. **Attach source:** `customerNeedCreate` with `attachmentUrl` = AskElephant call URL — creates a clickable link on the Customer Request that goes directly to the transcript
8. **Participants:** All external participants (name, title, email) in the Customer Need body. Internal participants listed separately.
9. **Notify:** Slack summary after each call: issues created, Customer Requests added, companies attributed

**Confidence gating:**
- `≥ 0.85` → auto-submit to Linear Triage
- `0.60–0.84` → daily Slack review queue (human confirm/dismiss)
- `< 0.60` → discarded

**Core API pattern:**
```graphql
# Match or create company safely across integrations
customerUpsert(domains: ["acme.com"], externalId: "hs-12345", revenue: 18333)

# Create new issue (or use existing from dedup match)
issueCreate(teamId: REQUEST_TEAM_ID, state: Triage, title: "...", description: "...")

# Attach customer + call link as a single operation — creates clickable source link
customerNeedCreate(
  issueId: "<uuid>",
  customerExternalId: "hs-12345",
  body: "verbatim quote + context + all participant names",
  attachmentUrl: "https://app.askelephant.com/calls/abc123"
)
```

---

### Routing Summary

| Source                 | Signal Type                | Destination                                            | Method                                    |
| ---------------------- | -------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| Pylon                  | Feature request / question | REQUEST Triage                                         | Pylon-Linear native integration           |
| Pylon                  | Bug (normal)               | REQUEST Triage → moved to ASK by triage captain        | Pylon-Linear integration + human routing  |
| Pylon                  | Bug (critical/incident)    | ASK Triage, Urgent                                     | Pylon-Linear integration with type filter |
| Gmail                  | Any customer email         | REQUEST Triage                                         | Linear team email address + Gmail filter  |
| Slack `#ext-*`         | Any                        | REQUEST or ASK Triage                                  | Linear Asks template (CSM-triggered)      |
| Slack internal         | Feature idea               | REQUEST Triage                                         | Linear Asks "Request a Feature" template  |
| Slack internal         | Bug report                 | ASK Triage                                             | Linear Asks "Report a Bug" template       |
| AskElephant transcript | Feature request / improvement | REQUEST Triage (or Customer Request added to existing) | AskElephant workflow — feature requests only, bugs out of scope |
| Incident.io            | Operational incident       | ASK Triage                                             | Existing integration (no change)          |

---

## 2. Linear Team & Triage Configuration

### Requests Team (REQUEST) — The Product Feedback Hub

**Core principle:** REQUEST is the intake inbox, not a planning space. Issues stay here until they are either validated (and linked to an EPD project) or closed. No engineering work happens in REQUEST.

#### Workflow States (already configured correctly)

| State                     | Type      | What it means                                                  |
| ------------------------- | --------- | -------------------------------------------------------------- |
| **Triage**                | triage    | Newly arrived, not yet reviewed                                |
| **Needs Info**            | unstarted | Valid candidate but missing context — needs customer follow-up |
| **Backlog**               | backlog   | Reviewed, valid, low priority — parked                         |
| **Validated**             | started   | High-confidence customer need, ready to link to a project      |
| **Ready for Engineering** | started   | Linked to EPD project, spec'd, waiting for engineering cycle   |
| **Shipped**               | completed | Feature delivered                                              |
| **Done**                  | completed | Resolved without shipping (e.g., answered a question)          |
| **Won't Do**              | canceled  | Declined — add a comment explaining why                        |

#### Required Fields (configure as templates)

Every REQUEST issue should require these before leaving Triage:

- **Type label** — one of: `feature-request`, `improvement`, `bug`, `question`
- **Area label** — one of: `area/conversations`, `area/integrations`, `area/automations`, `area/insights-search`, `area/platform`, `area/mobile-desktop`
- **Customer Request link** — at least one customer associated with MRR/tier
- **Priority** — Urgent, High, Medium, Low (not "None" for anything in Backlog or above)

Create two issue templates in REQUEST to enforce this:

- **"Feature Request"** — pre-fills type: `feature-request`, prompts for area and customer
- **"Bug Report"** — pre-fills type: `bug`, prompts for severity and reproduction steps

#### Customer Requests Configuration

Customer Requests is the feature that makes demand aggregation work. Configuration steps:

1. Set `Requests` team as the default destination for all new customer request issues
2. Create customer entities in Linear for each account — pull from HubSpot: company name, ARR, tier, CSM owner, status (Active / Trial / Churned)
3. Configure customer tiers to match your pricing: Enterprise, Growth, Starter (or equivalent)
4. Link each `#ext-*` Slack channel to its corresponding Linear customer entity — this enables Asks filed from those channels to automatically associate the right customer

**How deduplication works in practice:**  
When a triage captain opens a new Triage issue, Linear's **Triage Intelligence** surfaces a "Possible duplicates" panel in the sidebar. This is an AI-powered feature that searches existing issues by semantic similarity — not just keyword matching. When you merge two issues:

- Both issues' Customer Request links are preserved on the surviving issue
- The merged issue now shows the combined customer count and total MRR from all linked customers
- All comments and source links from both issues are preserved

This means the "Most Requested Features" view gets more accurate over time, not noisier — aggregating demand rather than fragmenting it across dozens of one-off issues.

#### Custom Views to Create in REQUEST

| View Name                    | Filter / Sort                                                     | Purpose                      |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------- |
| **Unreviewed Triage**        | State = Triage                                                    | Daily triage captain queue   |
| **Needs Follow-up**          | State = Needs Info, updated > 3 days ago                          | Stale items requiring action |
| **Most Requested**           | All active states, sorted by Customer Request count DESC          | Weekly prioritization        |
| **Revenue-Weighted Backlog** | State = Backlog or Validated, sorted by total requesting MRR DESC | Quarterly planning input     |
| **Enterprise Requests**      | Customer tier = Enterprise, state ≠ Done/Won't Do                 | Enterprise customer pulse    |
| **This Week's Intake**       | Created this week                                                 | Weekly review snapshot       |
| **Ready for Roadmap**        | State = Validated, priority = High or Urgent                      | Promotion candidates         |

#### SLA Configuration

Set SLAs on the REQUEST team to ensure time-sensitive feedback doesn't age out:

- **Urgent**: acknowledge within 24h (move out of Triage or respond to customer)
- **High + bug**: respond within 1 business week
- **Stale Needs Info**: auto-escalate to triage captain after 5 business days with no update

---

### Product Team (EPD) — Roadmap & Validation

**Role:** EPD is where validated requests become candidate projects, and candidate projects become roadmap commitments. Issues here represent opportunities or problem statements, not engineering tasks.

**Connection to Requests:** When a REQUEST issue moves to `Validated`, it should be linked to the relevant EPD project (or a new candidate project is created). The Customer Request evidence lives on the REQUEST issue — EPD projects aggregate across all their linked request issues.

**Project organization — product pillars:**

Consolidate existing EPD projects under seven durable pillars (create Project Groups):

| Pillar                      | Examples of current projects                                  |
| --------------------------- | ------------------------------------------------------------- |
| **Conversations**           | Meetings & Recordings, Notetaker, Speaker ID, Voiceprinting   |
| **Integrations**            | HubSpot, Salesforce, Slack, Zoom, Teams, Google Drive, Notion |
| **Automations**             | Workflow Builder, Chief of Staff Agent, Composio              |
| **Insights & Search**       | Universal Signals, Analytics, Usage Dashboard, Search         |
| **Platform**                | Public API, MCP Server, SOC 2, Security & Compliance, Billing |
| **Mobile & Desktop**        | Mobile v2, Desktop App                                        |
| **Onboarding & Activation** | Onboarding v2, Settings Refresh, Design System v2             |

These align with the existing `area/*` labels, which is intentional — the same taxonomy works at the issue level (Requests team) and project level (EPD team).

---

### Development Team (ASK) — Engineering Execution

**Role:** ASK receives validated, scoped, ready-to-build work from EPD projects, plus bug reports that need immediate engineering attention.

**Bug routing:** All bugs arrive in ASK Triage. The engineering lead (or rotating triage captain) decides:

- Is this a known issue? → Link to existing bug issue, add customer context, close the duplicate
- Is this a new bug? → Accept, assign to a project (or a "Bug Jar" project for ad-hoc fixes), prioritize
- Is this critical / production down? → Escalate immediately, skip normal triage

---

## 3. Slack Channel Consolidation

### Design Principle

The goal is not to eliminate Slack discussion — it's to ensure every actionable signal from Slack has a clear path to Linear. Informational channels (updates, announcements, discussion) are fine to keep. Redundant intake channels should be consolidated once automation is live.

### Recommended Structure

#### Keep (Unchanged Purpose)

| Channel              | Keep Because                                                                           |
| -------------------- | -------------------------------------------------------------------------------------- |
| `#product-updates`   | Release announcements — informational, not an intake channel                           |
| `#product-forum`     | Internal product discussion — valuable for ideas, but not a signal source to route     |
| `#product-learnings` | Knowledge sharing — low volume, no action required                                     |
| `#incidents`         | Operational incidents via incident.io — separate workflow, don't mix with product bugs |
| `#team-dev`          | Dev team coordination — keep separate from customer feedback                           |
| `#epd-all`           | EPD-wide communication — keep, but add Linear Asks shortcut for ad-hoc issue filing    |
| `#churn-alert`       | Business-critical signal with its own workflow — don't fold into product feedback      |
| `#customer-quotes`   | Marketing/sales use case — keep, but not a feedback pipeline channel                   |
| `#design-ux`         | Design discussion — keep                                                               |

#### Configure with Linear Asks (Priority)

These channels get Linear Asks templates installed. The channel itself stays active; the integration is the change.

| Channel                              | Install Ask Template                 | Why                                                                                                          |
| ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| All `#ext-*` customer channels (20+) | "Request a Feature" + "Report a Bug" | Richest source of direct customer voice; CSMs should be able to file issues without leaving the conversation |
| `#product-requests`                  | "Request a Feature"                  | Transition bridge before eventual archiving                                                                  |
| `#product-issues`                    | "Report a Bug"                       | Transition bridge before eventual archiving                                                                  |
| `#epd-all`                           | Both                                 | Internal team can file requests they hear about                                                              |
| `#partner-bugs-and-issues`           | "Report a Bug"                       | Partner bugs need to route to ASK too                                                                        |

#### Archive (After Automation is Live — Phase 3)

Don't archive these immediately. Run parallel for 4–6 weeks, confirm signal is captured in Linear, then archive with a pinned message pointing to the new workflow.

| Channel                   | Archive Because                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `#product-requests`       | Replaced by Pylon integration + Asks in `#ext-*` channels + AskElephant workflow              |
| `#product-issues`         | Replaced by same + Asks "Report a Bug" template                                               |
| `#voice-of-the-customer`  | Customer voice now lives in Linear Customer Requests view                                     |
| `#customer-feedback`      | Subsumed by AskElephant transcript workflow + Pylon intake                                    |
| `#solution-request`       | These are feature requests by another name — route through REQUEST                            |
| `#agent-requests`         | Route through REQUEST with `area/automations` label                                           |
| `#partner-feedback`       | Consolidate with `#partner-bugs-and-issues`, then route through same pipeline                 |
| `#notetaker-issue-quotes` | Notetaker bugs → ASK via standard intake; quotes → `#customer-quotes` or AskElephant workflow |

#### Monitor but Don't Change

| Channel                                    | Reason                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `#partner-bugs-and-issues`                 | Keep active until partner bug routing is automated; add "Report a Bug" Asks template as bridge |
| `#internal-hubspot-agent`                  | Separate CRM agent workflow — don't cross-contaminate                                          |
| `#support-chat-log`                        | Review after Pylon integration is live; may become redundant                                   |
| `#sales-closed-won` / `#sales-closed-lost` | Important for HubSpot customer entity creation but not a feedback channel                      |

### Final Minimal Channel Structure for Product Feedback

Once fully rolled out, the authoritative intake surface is:

1. **Pylon** — for support-originated tickets
2. **Linear Asks in `#ext-*` channels** — for CSM-captured customer voice
3. **AskElephant transcript workflow** — for call-sourced signals
4. **Gmail forward** — for email-sourced signals
5. **`#epd-all` Asks** — for internal team submissions

The individual feedback channels (`#product-requests`, `#product-issues`, etc.) become redundant and can be archived.

---

## 4. Roadmapping & Planning Cadences

### The Feedback → Roadmap Flow

```
Customer Signal (Pylon / Slack / Email / Transcript)
        ↓
AskElephant Workflow or Linear Native Integration
        ↓
REQUEST team — Triage state
        ↓  [Daily: triage captain]
  ├── Bug? → Move to ASK Triage → Engineering handles
  ├── Needs info? → Needs Info state → CSM follows up
  ├── Duplicate? → Merge with canonical issue → Customer Request added
  └── Valid request? → Backlog state with area/* + priority
        ↓  [Weekly: PM review]
  ├── Pattern emerging? → Create candidate project in EPD
  └── High-signal? → Promote to Validated → Link to EPD project
        ↓  [Monthly: feedback intelligence]
  Review top requests by customer count + MRR
  Identify unaddressed themes → new candidate projects
        ↓  [Quarterly: roadmap planning]
  Candidate projects → Prioritized by demand + strategic fit
  → Assigned to Initiatives → Staffed → Cycles created
```

### The Three Planning Layers in Linear

| Layer           | Linear Object                           | Question It Answers                                 |
| --------------- | --------------------------------------- | --------------------------------------------------- |
| Strategic bets  | **Initiatives**                         | What big things are we working toward this year?    |
| Scoped work     | **Projects** (EPD + ASK)                | What specific capabilities are being built?         |
| Demand evidence | **Customer Requests** on REQUEST issues | Which customers want this and how much is at stake? |

The roadmap is the Initiatives view. Each initiative contains EPD projects. Each EPD project links to REQUEST issues (validated requests). Each REQUEST issue has Customer Requests with company + MRR attached.

This means at any point you can answer:

- "What are customers asking for most?" → Sort REQUEST by Customer Request count
- "Which requests have the most revenue at stake?" → Sort by total requesting MRR
- "What does Acme Corp care about?" → Open Acme Corp's customer page in Linear
- "How is Initiative X progressing?" → Open the initiative, check project health

---

### Daily: Triage Captain Review (10–15 minutes)

**Who:** Rotating triage captain from REQUEST team members (Tyler, Sam, Matt, Ivan)  
**When:** Morning, before the day starts  
**Linear view:** "Unreviewed Triage" custom view

**Protocol:**

1. Open the view — scan for new Triage items
2. For each item:
   - Check the "Possible duplicates" panel (Triage Intelligence sidebar) — if a duplicate is surfaced, merge the issues. The Customer Request from the new issue carries over to the canonical issue.
   - Is it a bug? Move to ASK Triage. Add a comment with the customer context and source link.
   - Does it need more info? Move to "Needs Info" state, leave a comment tagging the relevant CSM.
   - Is it valid? Apply area/\* label, set priority, move to Backlog.
3. Check "Needs Follow-up" view — any Needs Info items that are 3+ days stale?

**Target:** Zero unreviewed Triage items by end of each morning.

---

### Weekly: Product Feedback Review (30 minutes)

**Who:** Tyler + available product team members  
**When:** Monday morning or Friday afternoon  
**Linear views:** "This Week's Intake" → "Most Requested" → "Revenue-Weighted Backlog"

**Agenda:**

1. **Intake review (10 min)** — Open "This Week's Intake." What came in? Any surprises? Any clusters forming around the same theme?
2. **Demand check (10 min)** — Open "Most Requested." Has any issue crossed a threshold (e.g., 5+ customers, $500k+ total MRR) that warrants promotion? If so, move to Validated and link to or create a candidate EPD project.
3. **Project linkage (10 min)** — For each newly Validated item, verify it is linked to the relevant EPD project. If no project exists for that area, create a candidate project with a description and the linked requests — don't start it, just park it as a named candidate.

**Output:** Updated backlog priorities, new candidate projects documented in EPD.

---

### Monthly: Feedback Intelligence Report (1 hour)

**Who:** Tyler  
**When:** First Monday of the month  
**Linear views:** "Revenue-Weighted Backlog," "Enterprise Requests," Customer page views for top accounts

**Agenda:**

1. **Volume snapshot** — Total requests received this month. Total merged as duplicates. Total moved to Validated. Total closed as Won't Do.
2. **Top 10 by demand** — Most-requested features by customer count. Any movement since last month?
3. **Top 10 by revenue** — Most-requested features by total requesting MRR. Are the same themes dominant, or are there enterprise-specific patterns?
4. **Segment analysis** — Are enterprise customers requesting different things than growth/starter customers? Flag any enterprise-specific patterns.
5. **Unaddressed themes** — Are there recurring request themes (3+ issues in the same area) that don't yet have a candidate project? If so, create the candidate project now.
6. **Initiative health check** — Pull the Initiatives view. For each active initiative, look at the linked EPD projects and their associated customer requests. Is the initiative still addressing the right demand?

**Output:** 1-page "Product Feedback Intelligence" report shared with leadership and revenue team. This is the artifact that closes the loop: customers and CSMs see that feedback is being tracked and actioned.

---

### Quarterly: Roadmap Planning (Half-day, ~3 hours)

**Who:** Tyler + Sam + Engineering lead + 1 revenue team representative  
**When:** Last week of the quarter  
**Linear views:** "Ready for Roadmap," EPD project list (filtered by No Cycle), Initiatives view

**Step 1 — Demand audit (45 min)**  
Open "Revenue-Weighted Backlog." Print or screen-share the top 20 candidate projects sorted by total requesting MRR. For each:

- How many unique customers asked for this?
- What is the total MRR exposure?
- Does it align with at least one active initiative?
- What is the rough engineering complexity?

**Step 2 — Prioritization (45 min)**  
Apply a simple scoring pass to each candidate project:

| Factor                           | Weight |
| -------------------------------- | ------ |
| Customer count                   | 25%    |
| Total requesting MRR             | 30%    |
| Strategic initiative alignment   | 25%    |
| Engineering complexity (inverse) | 20%    |

Assign each candidate a tier: **This Quarter** / **Next Quarter** / **Backlog** / **Won't Do**.

**Step 3 — Initiative mapping (30 min)**  
For "This Quarter" projects:

- Assign each to an existing initiative or create a new initiative
- Set initiative target date, owner, and success criteria
- Verify the customer requests on the underlying REQUEST issues match the initiative's stated goal — if they don't, the initiative may be solving the wrong problem

**Step 4 — Cycle creation and staffing (45 min)**

- Create a new Linear Cycle for the quarter with the "This Quarter" projects
- Assign project leads from EPD and ASK teams
- Move projects from Backlog/Triage to "Planned" or "Started"
- Create the first batch of engineering issues for each project in ASK (or confirm existing issues are linked)

**Step 5 — Communicate (15 min)**

- Update the Initiatives page with the new quarter's plan — this is the artifact leadership reads
- Post a summary in `#epd-all` and `#product-updates` explaining what's in and what's not, with brief rationale
- For "Won't Do" items with significant customer demand, notify the relevant CSMs with the reasoning so they can communicate to customers

**Output:** Updated Initiatives view, staffed Cycles, updated REQUEST issues reflecting roadmap decisions (Won't Do items closed with explanation).

---

### Quarter-over-Quarter: Retrospective (1 hour, following quarter kickoff)

**Questions to answer from Linear data:**

- Requests received vs. closed: what was the throughput ratio?
- Average time from Triage → Shipped for high-priority items — is it improving?
- How many customer requests had the features that shipped? Did we build what customers actually wanted?
- Which initiatives had the most pre-existing customer demand before they were kicked off? (validates demand-led planning)
- What request themes have been in Backlog for 2+ quarters without a project? Why? Are they truly low-priority or just hard?

---

## Appendix: What the Priority View Actually Looks Like

When this system is fully operational, the quarterly planning session starts with this view:

```
REQUEST team → "Revenue-Weighted Backlog" → Sorted by Total Requesting MRR

Issue: "Support custom field sync between AskElephant and HubSpot"
  Label: area/integrations · feature-request · High
  Customer Requests: 12 customers · $1.4M total MRR
  Companies: Acme Corp ($220k) · Widget Inc ($180k) · StrivePharmacy ($95k) · ...
  Linked Project: HubSpot Integration (EPD)
  Sources: 4 Pylon tickets · 3 transcript mentions · 2 Slack Asks · 3 emails

Issue: "Call summary auto-send to Salesforce opportunity"
  Label: area/integrations · feature-request · High
  Customer Requests: 9 customers · $980k total MRR
  Companies: ...

Issue: "Mobile push notifications for meeting prep"
  Label: area/mobile-desktop · feature-request · Medium
  Customer Requests: 7 customers · $610k total MRR
  ...
```

Every row shows: what customers want, how many, how much revenue is tied to it, and where it stands. Planning starts from this list. Gut instinct is a tiebreaker, not the primary signal.
