# Research: Composio Connection & Credential Management

**Date:** 2026-02-09  
**Participant:** Tyler Sahagun (pre-meeting review)  
**Type:** UX Gap Analysis + Meeting Prep  
**Context:** Preparing for meeting with Kaden (blocked on next steps) about Composio's Universal Agent in Workflows  
**Notion Board:** [Composio in Workflows](https://www.notion.so/ask-elephant/Composio-in-Workflows-302f79b2c8ac808c9449c98f41753432)

---

## TL;DR

The Universal Agent node is functionally built but has critical UX gaps around **connection management, permission visibility, and testing**. There are three separate places where users connect tools (user-level in chats, workspace-level in integrations, and inside the workflow node), with no clear rationale for why. The Zapier model—a centralized App Connections page showing who uses what credentials and which automations rely on them—is the gold standard we should aim for. **This is not about blocking the release, but about defining the minimum viable credential UX that ships with Phase 1.**

---

## Strategic Alignment

**Score:** Strong ✅ (aligns with existing PRD)

This research directly addresses Open Question #7 (Workspace vs. User-Level Auth) and #9 (Tool Discovery at Scale) from the PRD, which were already flagged but unresolved.

---

## Problems Identified (From Tyler's Review)

### Problem 1: Three Disconnected Connection Surfaces 🔴 Critical

> "I have three different places that I can see my connections. I have my user level connections on chats and in my integrations page, I have workspace level connections, and then I have the one inside of here. I actually don't have a clear understanding of why I'm connecting in three separate places for the exact same tools."

**Where connections live today:**
| Surface | Level | Who Sees It | Purpose |
|---------|-------|-------------|---------|
| Chat integrations panel | User-level | Only the user | Personal tools (Gmail, Calendar) used in chat |
| Workspace integrations page | Workspace-level | Admins | Shared tools for workflows |
| Inside Universal Agent node | Node-level? | Workflow builder | Tools for this specific agent |

**The confusion:** If I connect Linear in the chat panel, does the workflow node see it? If I connect Slack in the workflow node, can other workflows use it? Can other people use my connection?

**Zapier comparison:** Zapier has ONE centralized "App Connections" page where you can see every connection, who has access, and which Zaps use each credential. No ambiguity.

**Severity:** 🔴 Critical — This is a trust and comprehension issue  
**Persona:** All users (especially RevOps/Admins managing connections)

---

### Problem 2: Permission Visibility Gap 🔴 Critical

> "We need to make a decision about who can see these toolings, what you have access to. If I have connected to Linear, but then now... who can see that?"

**Current state:** No clear indication of:
- Who can use a connected tool
- Whether a connection is scoped to one workflow or all workflows
- Whether connecting a tool in one place makes it available everywhere
- Whether other team members can see/use your connections

**Zapier comparison:** Each connection shows:
- Who has access (avatar badges)
- How many Zaps use it
- Which specific Zaps/automations are connected to each credential
- You can filter Zaps by connection to audit usage

**Severity:** 🔴 Critical — Prerequisite for customer-facing release  
**Persona:** Admins, RevOps

---

### Problem 3: Tool Selection UX — No Search, No Rationale 🟡 High

> "There's only a select number of connections and that is through some of the requests that we have gotten. So noticeably missing are things like Chat. The other thing is it's not clear why we have the tools that we do. If Composio has so many, how are we going to manage them? There's not like a search option."

**Current state (from docs):**
- 32 tools enabled (curated based on customer requests)
- No search when browsing available toolkits
- No explanation of why certain tools were included/excluded
- Missing expected tools (Chat not available in workflows)
- Tool selection inside node pagination (50 at a time) is clunky

**Severity:** 🟡 High  
**Persona:** Workflow builders (admins, RevOps)

---

### Problem 4: Agent Context Isolation 🟡 High

> "Each universal agent will create a new chat and that means that if I'm passing the input from one to another it doesn't have the context of everything there. I want to know if it's possible to actually have it be either attached to a single conversation or completely remove it from conversations and be able to daisy chain these agent nodes together."

**Two sub-issues:**
1. **Multi-agent context sharing:** Can two Universal Agent nodes in a workflow share a conversation instead of each creating a new one?
2. **Agent chaining without conversations:** Can agent nodes be piped together as pure compute (no chat thread) where output of one feeds input of next?

**Current behavior:** Each node creates 1 conversation. Data passes only through explicit template variables (`{{$nodeId.agentResponse}}`).

**Severity:** 🟡 High (affects workflow builder power users)  
**Persona:** RevOps, power users building complex workflows

---

### Problem 5: No Testing Framework 🟡 High

> "We don't have a true testing framework, this is really just dependent on you run it, and then you hope that thing works on the other platform."

**Current state:** Only manual run → check → verify in target system. No:
- Dry run / preview mode
- Sandbox environments for external tool calls
- Regression testing for workflows
- Automated verification that actions completed in target systems

**Severity:** 🟡 High  
**Persona:** Workflow builders, engineering

---

### Problem 6: Customer Exposure Risk 🟡 High

> "I want to make sure that I don't connect myself in front of customers as quickly as possible."

**Current state:**
- `COMPOSIO_ENABLED` feature flag gates the Universal Agent node
- But once enabled, there's no protection against personal credential leaks
- If Tyler connects his Gmail for testing, that connection could theoretically be used by customer workflows
- No clear separation between "admin testing" and "customer production"

**Severity:** 🟡 High  
**Persona:** Tyler (PM), admins

---

## Zapier Model Analysis (From Screenshots)

Tyler attached 5 screenshots showing Zapier's connection management. Key patterns:

### Zapier App Connections Page
- **Centralized list** of all connected apps with:
  - App name and version
  - Number of Zaps using each connection
  - Last modified date
  - People with access (avatar badges)
  - Reconnect button for expired OAuth tokens

### Zapier Apps View  
- Shows ALL apps the workspace uses (even without active connections)
- Tags (e.g., "Premium")
- Expired connections flagged clearly
- Connection count vs. Zap count visible
- Connection users listed

### Zapier Zap Builder (Account Picker)
- When building a Zap, you select from existing connections
- Shows "Shared" vs "Personal" connections
- Shows connection version
- "+ Connect a new account" option inline

### Key Zapier Design Patterns to Learn From:
1. **Single source of truth** for connections (App Connections page)
2. **Audit trail** — See which automations use which credentials
3. **Sharing model** — Connections can be shared or personal
4. **Version visibility** — App versions shown on connections
5. **Folder organization** — Zaps can be organized into folders
6. **Connection health** — Expired/broken connections flagged proactively

---

## Recommendations for Meeting with Kaden

### What to Unblock (Small Lifts — Ship with Phase 1)

| # | Item | Effort | Why Now |
|---|------|--------|---------|
| 1 | **Connection Inventory Page** — Single page showing all Composio connections, who owns them, which workflows use them | Medium | Prerequisite for trust. Without this, admins fly blind. |
| 2 | **Clear scoping labels** — In the workflow node, show whether a connection is "Workspace" (everyone) vs "Personal" (just you) | Small | Prevents the "who can use my credentials?" confusion |
| 3 | **Toolkit search** — Add search to the toolkit/tool picker in the Universal Agent node config | Small | 32 tools today, will grow. Search is table stakes. |
| 4 | **Connection surface consolidation plan** — Decide: are chat connections, workspace connections, and node connections the same pool? Document the answer. | Small (decision) | The 3-surface confusion is the #1 UX issue |
| 5 | **"Don't connect personal accounts" guardrails** — Warning banner when connecting OAuth that says "This connection will be available to all workspace workflows" | Small | Prevents Tyler's "connected myself in front of customers" fear |

### What to Research (Before Phase 2)

| # | Item | Why |
|---|------|-----|
| 1 | **Agent conversation chaining** — Can we attach multiple agent nodes to one conversation? Or pipe structured output without creating chat threads? | Power user request, affects architecture |
| 2 | **Testing framework options** — What do Zapier/Make/n8n offer for testing? Can we build dry-run mode? | No testing = no confidence |
| 3 | **Connection sharing model** — Design a Zapier-like sharing model where connections can be personal, shared, or workspace-wide | Phase 2 requirement |
| 4 | **Tool curation strategy** — Who decides which of Composio's 877 integrations we expose? What's the bar for "ready"? | 32 today with no explanation of why |

### What to Defer (Phase 2+)

- Full App Connections management page (Zapier-style)
- Per-user opt-in connections for personal agents
- Agent template marketplace/sharing
- Connection health monitoring and auto-reconnect

---

## SCQA Framework (For Product Discussion)

### Situation

The Universal Agent workflow node is functionally built. Kaden has 32 toolkits connected through Composio, the feature flag (`COMPOSIO_ENABLED`) is in place, and documentation exists. Ivan is migrating chats (ASK-4996, in code review) and workflows (ASK-4997, in progress) to the Composio backbone. The core capability works — an admin can drop an agent node into a workflow, connect integrations, write natural language instructions, and the agent takes real actions in third-party tools.

### Complication

Users currently encounter **three separate surfaces** to connect the exact same tools — user-level connections in chats, workspace-level connections on the integrations page, and a third connection flow inside the Universal Agent node itself. There is no visibility into who can use a connection, which workflows rely on which credentials, or whether connecting in one surface makes it available everywhere else. The 32 enabled toolkits have no search, no rationale for why they were chosen, and noticeably missing tools (like Chat). Meanwhile, each Universal Agent node creates an isolated conversation, meaning multi-agent workflows can't share context. And there is no testing framework beyond "run it and hope the external system reflects the change."

This matters because **Kaden is blocked waiting for product decisions** on the connection model, and we cannot put this in front of customers if an admin connecting their personal Gmail in the node builder unknowingly shares that credential across the entire workspace.

### Question

**What is the minimum viable credential UX that must ship with the Universal Agent node before we can responsibly enable it for customers?**

Sub-questions:
1. Should connections be one shared pool or separate by surface? (Architecture decision)
2. What permission/visibility must exist at launch? (UX minimum bar)
3. What can Kaden start building this week to unblock Phase 1? (Scope decision)

### Answer

**Ship Phase 1 with five credential UX additions, defer the full Zapier-style management page to Phase 2.**

| # | Ship Now (Phase 1) | Owner | Effort | Unblocks |
|---|-------------------|-------|--------|----------|
| 1 | **Decide the connection model** — One pool or separate? Document it. If one pool, remove the redundant surfaces. If separate, explain why in the UI. | Tyler + Kaden | Decision (1 day) | Everything else |
| 2 | **Scoping labels** — Show "Workspace" or "Personal" badge on every connection in the node config | Kaden | Small (2-3 days) | Permission confusion |
| 3 | **"Shared connection" warning** — When connecting OAuth inside the node, show: "This connection will be available to all workspace workflows. Use a service account for shared automations." | Kaden | Small (1-2 days) | Tyler's "connected myself in front of customers" fear |
| 4 | **Toolkit search** — Add search bar to the toolkit and tool picker in the Universal Agent config panel | Kaden | Small (2-3 days) | Tool discovery at scale (PRD Q#9) |
| 5 | **Connection usage indicator** — Show "Used by X workflows" count on each connection (even if it's just a number, no drill-down yet) | Kaden | Medium (3-5 days) | Audit trail for admins |

**Defer to Phase 2:**
- Full App Connections management page (Zapier-style)
- Per-user opt-in connections for personal agents
- Agent conversation chaining / shared context
- Dry-run testing mode
- Connection health monitoring

**This gets us to "responsibly customer-facing" without the full Zapier vision.** The architectural decision (item #1) is the critical path — everything else follows from it.

---

## STAR Framework (For Presenting the Work Done)

### Situation

AskElephant is migrating from Pipedream to Composio as our integration backbone. The Universal Agent workflow node — which lets admins automate actions across 30+ third-party services using natural language — is functionally built and feature-flagged. Kaden has been working on the implementation, and engineering (Ivan) is migrating existing chat and workflow integrations to Composio. The initiative is in the **validate** phase with a 92% jury pass rate on the broader Agent Framework, and we have a [Notion board](https://www.notion.so/ask-elephant/Composio-in-Workflows-302f79b2c8ac808c9449c98f41753432) tracking the workstream.

### Task

As PM, I need to define the **minimum viable credential UX** for Phase 1 so that:
1. We can responsibly enable the Universal Agent for customers (not just internal)
2. Kaden gets unblocked on the specific product decisions he needs
3. We don't accumulate UX debt that makes Phase 2 (Agent Configurator) harder

The specific gaps I identified through my review:
- 3 disconnected connection surfaces with no unified model
- No permission visibility (who can use what)
- No toolkit search (32 tools today, growing)
- No testing framework
- Risk of personal credential leakage to workspace

### Action

1. **Conducted a UX gap analysis** — Walked through the entire connection flow in all three surfaces, documented each friction point with severity ratings
2. **Benchmarked against Zapier** — Captured 5 screenshots of Zapier's App Connections model as a reference architecture (centralized connections page, usage counts, sharing controls, credential audit trail)
3. **Mapped to existing PRD open questions** — Connected each problem to previously flagged but unresolved questions (#7: Workspace vs User-Level Auth, #9: Tool Discovery at Scale)
4. **Proposed a phased solution** — Separated "ship now" (5 small-to-medium items) from "ship later" (full management page, testing framework, conversation chaining)
5. **Created a meeting agenda** — Structured the upcoming meeting around the 3 decisions needed, 5 items to scope, and Kaden's specific blockers

### Result (Expected)

- **Immediate:** Kaden gets 3 clear product decisions and 5 scoped work items he can start on this week
- **Phase 1 outcome:** Universal Agent ships to customers with minimum viable credential safety — scoping labels, shared-connection warnings, toolkit search, and usage indicators
- **Phase 2 setup:** The connection model decision made now directly informs the full App Connections page and per-user opt-in architecture
- **Risk mitigated:** No personal credential leakage, no admin confusion about what's shared, no "why did Tyler's Gmail send that" incidents

---

## Toolkit Curation Strategy: What to Expose, Who Decides, and How to Scale

### The Scale Problem

[Composio offers 877 toolkits with 11,000+ tools](https://composio.dev/toolkits). We currently expose 32. As customers adopt the Universal Agent, toolkit requests will come in immediately. We need a decision framework before this becomes a support bottleneck.

### The Core Question

**Should we curate which toolkits customers can use, or let them self-serve from the full Composio catalog?**

There are three models, each with real trade-offs:

### Option A: Curated Allowlist (Current State)

We hand-pick which of Composio's 877 toolkits are available. Engineering adds them to a whitelist.

| Pros | Cons |
|------|------|
| We control quality — only tested toolkits go live | Every new toolkit is a PM/eng bottleneck |
| Reduces support burden from broken integrations | Customers can't self-serve what they need |
| We can ensure documentation exists before launch | "Why can't I use X?" becomes a recurring complaint |
| Simpler permission model | 32 of 877 = 3.6% coverage — gap will be obvious |

**When this makes sense:** Early phase when we don't trust Composio's quality across the board, and when we don't have monitoring to catch failures at scale.

### Option B: Open Catalog with Tiers

Expose the full Composio catalog, but with tiered status labels so customers know what to expect.

| Tier | Meaning | Example | Who Enables |
|------|---------|---------|-------------|
| **Verified** | Tested by AskElephant, documented, supported | Slack, HubSpot, Gmail, Linear | Available by default |
| **Community** | Available via Composio, not tested by us, limited support | Airtable, Trello, PandaDoc | Customer self-service, "use at your own risk" badge |
| **Beta** | Recently requested, in evaluation | Figma, Intercom | Request → enabled within 24h, feedback collected |

| Pros | Cons |
|------|------|
| Customers can self-serve without waiting | Broken toolkits create support tickets |
| Reduces PM/eng bottleneck for new requests | "Community" tier may feel second-class |
| Scales with Composio's catalog growth | Need monitoring to detect failures |
| Clear expectations via tier labels | More complex UI to communicate tiers |

**When this makes sense:** When we have basic monitoring in place and are willing to accept some toolkit-level failures in exchange for broader coverage.

### Option C: Super Admin Toolkit Manager

Build an internal admin tool that lets AskElephant staff (or customer workspace admins) toggle toolkits on/off from the full Composio catalog, with a lightweight review process.

| Pros | Cons |
|------|------|
| Fast response to customer requests (toggle, not deploy) | Requires building admin UI |
| Centralizes the decision in one interface | Still gated by internal review unless we give admin access to customers |
| Can add audit log of who enabled what and when | Admin overhead for every request |
| Could evolve into customer-facing admin in Phase 2 | Doesn't solve the "should we let customers decide?" question on its own |

**When this makes sense:** As a bridge between curated (A) and open (B) — reduces the engineering bottleneck without giving up quality control entirely.

### Proposed Path: A → C → B

**Phase 1 (Now):** Stay with **Option A (Curated Allowlist)** but add a lightweight request process:
- Customers request toolkits via Slack or in-app form
- PM (Tyler) triages against a checklist (see below)
- Engineering enables via config, not code deploy
- Target: 24-48h turnaround for "easy adds"

**Phase 1.5 (Next sprint):** Build **Option C (Super Admin toggle)** so enabling a new toolkit is a checkbox, not a PR. This unblocks the request → enable pipeline.

**Phase 2 (Agent Configurator):** Move toward **Option B (Open Catalog with Tiers)** once we have:
- Toolkit health monitoring (error rates, latency)
- Customer-facing tier labels (Verified / Community / Beta)
- Self-service enable/disable for workspace admins

### Toolkit Evaluation Checklist (For Incoming Requests)

When a customer or internal team requests a new toolkit, run through this:

| # | Check | Pass Criteria | Blocking? |
|---|-------|---------------|-----------|
| 1 | **Composio support level** | Toolkit exists on [composio.dev/toolkits](https://composio.dev/toolkits) with documented auth flow | Yes |
| 2 | **Auth type** | OAuth2 preferred. API Key acceptable. No auth = auto-approve. | No (but flag if unusual) |
| 3 | **Read vs Write tools** | Identify which tools are read-only vs write (destructive). Write tools need more scrutiny. | No |
| 4 | **Customer use case** | Requester can articulate what workflow they'll build with it | Yes |
| 5 | **AskElephant persona fit** | Toolkit serves sales, CS, RevOps, or leadership workflows (not dev-only tools with no customer use case) | No (soft) |
| 6 | **Quick smoke test** | Connect toolkit, run one read + one write tool, verify results | Yes |
| 7 | **Documentation** | At minimum, add to the toolkit list in the Universal Agent docs | Yes |

**Fast-track criteria** (skip to enable immediately):
- Toolkit is in Composio's "top 30" by popularity
- Customer is in active pilot/POC and this is a blocker
- Toolkit is read-only (no destructive actions)

### What We Should NOT Expose (Guardrails)

Even in an open catalog model, some toolkits should be restricted:

| Category | Example Toolkits | Why Restrict |
|----------|-----------------|--------------|
| **Infrastructure/DevOps** | AWS, GCP, Docker, Kubernetes | Destructive potential, not our persona |
| **Payment/Financial** | Stripe (write), PayPal (write) | Financial risk, compliance implications |
| **Social media posting** | Twitter (post), LinkedIn (post) | Brand risk if agent posts on behalf of user |
| **Authentication/Identity** | Auth0, Okta | Security-critical, should not be agent-controlled |
| **Database direct access** | Supabase (write), MongoDB (write) | Data integrity risk |

**Principle:** If a toolkit failure could cause financial loss, brand damage, or data destruction, it should require explicit admin approval and cannot be self-served.

### Decision Needed in Meeting

Add to the meeting agenda:
1. **Do we stay curated (A) for Phase 1?** (Recommended: Yes)
2. **Should we build the super admin toggle (C) as Phase 1.5?** (Recommended: Yes, small lift)
3. **Who owns incoming toolkit requests?** (Proposed: Tyler triages, Kaden enables)
4. **What's the turnaround SLA for new toolkit requests?** (Proposed: 24-48h for easy adds, 1 week for complex)

---

## Meeting Agenda Proposal

**Meeting:** Composio Universal Agent — Next Steps  
**Attendees:** Tyler, Kaden, [others TBD]  
**Duration:** 45-60 min

### 1. Current State (5 min)
- What's built: Universal Agent node, 32 toolkits, feature-flagged
- What's blocked: Kaden waiting on decisions

### 2. Connection Management Decisions (15 min)
- **Decision needed:** Are chat connections, workspace connections, and node connections the same pool?
- **Decision needed:** When someone connects in the node builder, who else can use it?
- **Decision needed:** Do we need a connections inventory page for Phase 1, or can we ship without?
- Show Zapier screenshots as reference model

### 3. Toolkit Curation Strategy (10 min)
- **Decision needed:** Do we stay curated (32 toolkits) or open the catalog?
- **Proposal:** Curated now → Super admin toggle next sprint → Open catalog with tiers in Phase 2
- **Decision needed:** Who owns incoming toolkit requests? (Proposed: Tyler triages, Kaden enables)
- **Decision needed:** What's the turnaround SLA? (Proposed: 24-48h easy adds, 1 week complex)
- Review the evaluation checklist and guardrails (what we should NOT expose)

### 4. Small Lift Items for Phase 1 (10 min)
- Toolkit search in node config
- Scoping labels (Workspace vs Personal)
- "This is shared" warning on OAuth connection
- Review the 5 items from recommendations table

### 5. Testing Strategy (5 min)
- Current: Manual run and pray
- Proposal: Research dry-run mode for Phase 2
- For now: Document manual testing checklist

### 6. What Kaden Needs to Proceed (5 min)
- Specific decisions/specs Kaden is waiting on
- Assign owners and dates for each item

---

## Verbatim Quotes (Key Excerpts)

> "I have three different places that I can see my connections. I have my user level connections on chats and in my integrations page, I have workspace level connections, and then I have the one inside of here so I actually don't have a clear understanding of why I'm connecting in three separate places for the exact same tools."

> "We need to make a decision about who can see these toolings, what you have access to."

> "It's not clear why we have the tools that we do. If Composio has so many, how are we going to manage them? There's not like a search option."

> "Each universal agent will create a new chat and that means that if I'm passing the input from one to another it doesn't have the context of everything there."

> "We don't have a true testing framework, this is really just dependent on you run it, and then you hope that thing works on the other platform."

> "I'm not trying to say we shouldn't be exposing this to customers. I just think that there's more work that needs to be done."

> "I want to make sure that I don't connect myself in front of customers as quickly as possible."

---

## Related

- **PRD Open Question #7:** Workspace vs. User-Level Auth (this research directly addresses)
- **PRD Open Question #9:** Tool discovery at scale
- **Notion Board:** [Composio in Workflows](https://www.notion.so/ask-elephant/Composio-in-Workflows-302f79b2c8ac808c9449c98f41753432)
- **Blocker in _meta.json:** Revenue team confused about Composio availability
- **Zapier Reference:** Screenshots saved to workspace assets
