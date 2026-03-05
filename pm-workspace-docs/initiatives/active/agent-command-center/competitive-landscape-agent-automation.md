# Competitive Analysis: Agent-Building & Automation Platforms

**Initiatives:** Workflow Builder, CRM Automation Layer, Agent Command Center  
**Date:** 2026-02-12  
**Competitors:** Relay.app, Gumloop, StackAI, Lindy.ai  

---

## TL;DR

Four adjacent competitors—**Relay.app**, **Gumloop**, **StackAI**, and **Lindy.ai**—occupy the AI agent and automation platform space. **Relay.app** and **Gumloop** are closest to AskElephant's workflow builder vision: visual workflow builders with human-in-the-loop, CRM integrations, and AI orchestration. **Lindy.ai** overlaps most with meeting intelligence (recording, summarization, CRM sync) and positions as a "text your AI assistant" consumer of workflow outputs. **StackAI** targets enterprise document intelligence and RAG, less directly comparable but shares governance and integration patterns.

**Key takeaway:** AskElephant's differentiation is **meeting-context-first automation**—workflows that trigger from conversation signals (deal mentions, commitments, risk) rather than generic event triggers. Competitors optimize for breadth of integrations and ease of building; AskElephant can own **outcome-oriented, meeting-grounded workflows** with built-in trust (privacy determination, evidence visibility).

---

## Competitor Profiles

### 1. Relay.app

| Dimension | Details |
|-----------|---------|
| **Positioning** | "Build an AI team that works for you" / "The easiest way to create AI agents" |
| **Target Market** | Teams and individuals (small business to enterprise). Personas: marketing, partnerships, operations, service businesses. Trusted by Cursor, Lumos, Motion, Ramp, Skyflow, Tavus. |
| **Key Features** | **Agent model**: Give agent a name → Teach skill in plain English → Give feedback to improve. **Workflow primitives**: Triggers (app events, schedule, manual, webhook, form, table, mailhook, batch, RSS), Steps (apps, AI, human-in-the-loop, webhooks, scraping, utilities). **Human-in-the-loop** is a core differentiator: approvals, manual data inputs, tasks, manual path selection; enable review on any AI step. **Sequences** = reusable sub-workflows. **Tables** = structured data for stateful agents. **MCP Servers** = expose tools to ChatGPT/Claude. |
| **Integrations** | 100+ apps: Gong, HubSpot, Gmail, Slack, Notion, Stripe, Salesforce, Linear, Fathom, Fireflies.ai, etc. Per-app fine-grained access control (labels, databases, read vs write). Multiple connections per app. |
| **AI Capabilities** | GPT, Claude, Gemini; built-in extraction, classification, summarization, translation, audio transcription, TTS, image gen. AI credits per plan or bring-your-own API key. Enterprise: private models via Bedrock, Vertex, Azure. |
| **Pricing** | **Free**: $0, 1 user, 500 AI credits/mo, 200 steps/mo. **Professional**: $19/mo (annual), 1 user, 5K AI credits, 750 steps. **Team**: $69/mo (annual), 10 users, 5K AI credits, 2K steps, shared workflows/connections. **Enterprise**: Custom, SOC2/GDPR. AI credit add-ons: 10K=$19, 100K=$149, etc. |
| **What Makes Them Unique** | (1) **Plain-English skill teaching** → visual workflow you can inspect; (2) **Human-in-the-loop** as first-class primitive—pause for approval before high-impact actions; (3) **Task history** so you see exactly what ran; (4) **Merging paths** after conditionals—no copy-paste across branches; (5) Clean UI praised over Zapier/Make. |
| **Relevance to AskElephant** | **High.** Relay is an adjacent pattern for workflow builder UX: prompt-to-workflow, visual editor, human approval for CRM writes. David Karp persona already evaluates Relay.app. AskElephant can adopt: prompt-to-workflow, approval steps, task history. Differentiate: meeting-triggered workflows (e.g., "when deal risk mentioned"), privacy-before-trigger, outcome chain visibility. |

---

### 2. Gumloop

| Dimension | Details |
|-----------|---------|
| **Positioning** | "The AI automation platform built for everyone" / "Data, apps, and AI in an intuitive drag and drop interface" |
| **Target Market** | Marketing, Sales, Operations, Engineering, Support. Enterprise: Instacart, Webflow, Shopify, Albert.io. Emphasizes "any team member" and "without writing a single line of code." |
| **Key Features** | **Visual builder** with 125+ native nodes. **AI Router** = AI decides next step. **Prompt-to-create** = build as fast as you imagine. **Background workflows** from HubSpot, Gmail, calendar, etc. **Interfaces & templates** = put work in everyone's hands. **MCP support**. **One subscription** = no add-ons, no per-model fees. Use cases: social sentiment reports, Salesforce book-of-business enrichment, Stripe lead scoring + demo booking, Zendesk ticket triage. |
| **Integrations** | Apollo, Salesforce, HubSpot, Gmail, Slack, Google Sheets/Docs/Calendar, Airtable, Linear, Zendesk, Notion, Expensify, QuickBooks, Loops, Mailgun, etc. Triggers: Contact Added, Spreadsheet Row, Email Received, Calendar Event. |
| **AI Capabilities** | OpenAI, Anthropic, Gemini, Copilot, Perplexity, Meta. AI nodes: Ask AI, Web Research, Extract Data, Generate Text, Generate Image, Categorizer, Route. **AI Router** lets AI choose next step. **AI Proxy** support, **AI Model Restriction** for org control. |
| **Pricing** | **Contact sales** or **Get started**; no public pricing on site. Enterprise: SOC2, GDPR, AICPA, VPC deployments, AI proxy, audit logging, access controls. |
| **What Makes Them Unique** | (1) **Department-specific templates** (Marketing, Sales, Ops, Support) with ready-made flows; (2) **AI Router** for dynamic branching; (3) **Prompt to create**—natural language to build; (4) **No per-model fees**—one subscription; (5) Enterprise focus: VPC, audit logs, credential scoping. |
| **Relevance to AskElephant** | **High.** Gumloop's Salesforce/HubSpot + AI analysis + email/calendar flows mirror CRM automation use cases. Their "read Salesforce → AI analyze → update CRM" pattern is analogous to meeting → AI extract → CRM update. AskElephant differentiates: meeting as trigger (not just contact/email), privacy-first, evidence-backed outcomes. |

---

### 3. StackAI

| Dimension | Details |
|-----------|---------|
| **Positioning** | "The Enterprise AI Transformation Platform" / "Orchestrate AI Agents to understand data and take actions" |
| **Target Market** | Finance, Risk, Operations teams. Industries: Healthcare, Industrials, Insurance, Banking, Wealth Management, Construction, Law, IT, HR. IT and Enterprise Architecture teams. Customers: YMCA Retirement Fund, UCLA, Alliad. |
| **Key Features** | **Document Intelligence**: extraction from PDFs/scans/forms (OCR), RAG knowledge retrieval, document generation. **Workflows** = LLM + action steps (e.g., extract financials → summarize → email). **Interfaces** = forms for upload, display. Use cases: underwriting, IT support desk, ticket triage, CRM enrichment, RFP drafting. **100+ enterprise integrations**. **On-premise** deployment. |
| **Integrations** | Salesforce, HubSpot, Jira, Zendesk, Google Workspace, Slack, etc. CRM enrichment, document ingestion, API-based. |
| **AI Capabilities** | LLM steps (Anthropic Claude, etc.), extraction, RAG, structured output. HIPAA, SOC 2, GDPR, ISO 27001 certified. |
| **Pricing** | **Get a Demo** / **Try It Now**; no public pricing. Enterprise-led. |
| **What Makes Them Unique** | (1) **Document-first**—unstructured → structured; (2) **Governed workflows** for regulated industries; (3) **End-to-end**: workflows + interfaces + integrations; (4) **Industry verticals** (healthcare, finance, legal); (5) G2 "Leaders" quadrant for satisfaction. |
| **Relevance to AskElephant** | **Medium.** StackAI is document/process automation, not meeting-first. Relevant patterns: governed workflows, interface + workflow coupling, RAG for context. AskElephant's meeting recap → structured output is adjacent; StackAI doesn't own conversation context. |

---

### 4. Lindy.ai

| Dimension | Details |
|-----------|---------|
| **Positioning** | "The Ultimate AI Assistant For Work" / "Text your AI assistant. Get answers. Get things done." |
| **Target Market** | Professionals drowning in busywork (45 min/day meeting admin, 1.2 hrs/day inbox). Personas: sales, marketing, support, recruiting. "40,000+ professionals." Pro: individuals. Enterprise: teams. |
| **Key Features** | **Proactive AI**: manages inbox, meetings, calendar. **iMessage/chat interface** = "text your assistant." **Actions**: book meetings, send emails, update CRM, create tasks. **Proactive alerts** = important emails, meeting reminders, deal updates via text. **Meeting recording & summarization**. **Learns from feedback** = memories over time. **App Builder** = describe app in natural language, Lindy builds from code to QA (separate product). |
| **Integrations** | Hundreds: Gmail, Slack, Calendar, CRM, etc. "Read Slack, cross-reference calendar, draft in Gmail" without asking. |
| **AI Capabilities** | General-purpose AI assistant. Meeting notes, scheduling, email drafts, CRM updates. "ChatGPT with access to all your apps." |
| **Pricing** | **Pro**: $49.99/mo (or $59.99 annual); iMessage 24/7, inbox management, meeting scheduling/prep/follow-up, recording, learns style, hundreds of integrations. **Enterprise**: Contact us; SSO, SCIM, audit logs, dedicated support. 7-day free trial, 60 sec setup. |
| **What Makes Them Unique** | (1) **Consumer-grade UX**—text your assistant, iMessage; (2) **Proactive** not reactive—fixes problems before they surface; (3) **Meeting + CRM**—"raw conversations into structured, actionable CRM data" (Interlaced testimonial); (4) **Replace executive assistant** messaging; (5) Lindy Build = prompt-to-app (different product). |
| **Relevance to AskElephant** | **Direct overlap.** Lindy explicitly does meeting recording, summarization, CRM sync, and "structured actionable CRM data." They compete for the same "meeting → CRM" outcome. Lindy's angle: personal assistant, text-based. AskElephant's: revenue outcomes, deal-level intelligence, trust/privacy, team-wide. Lindy has a Meetings solution page. |

---

## Comparative Matrix

| Capability | Relay.app | Gumloop | StackAI | Lindy.ai | AskElephant (Current) |
|------------|-----------|---------|---------|----------|----------------------|
| **Workflow builder** | Visual + prompt-to-workflow | Drag-and-drop + prompt | Visual workflow | App Builder (separate) | Workflows exist, config UX evolving |
| **Meeting trigger** | Via integrations (Fathom, Fireflies) | Via calendar/meeting apps | Indirect | Native meeting recording/summary | **Core**—meeting-first |
| **CRM integration** | HubSpot, Salesforce, etc. | HubSpot, Salesforce, Apollo | Salesforce, HubSpot | CRM integrations | HubSpot, Salesforce (native) |
| **Human-in-the-loop** | **Leading**—approvals, review toggles | Basic | Not emphasized | Approval flow | Approval hub concept |
| **AI orchestration** | Built-in AI steps, multi-model | AI Router, multiple models | LLM steps, RAG | General AI | Meeting → extract → CRM |
| **Explainability** | Task history, visual workflow | Visual flow | Workflow visibility | Limited | Evidence, source quotes |
| **Target persona** | Teams, ops, marketing | All departments | Enterprise, Finance/Risk | Individual professionals | Revenue teams, RevOps |
| **Pricing transparency** | Free–$69/mo visible | Contact sales | Demo only | $50/mo Pro visible | — |
| **Meeting-context depth** | Shallow (integrations) | Shallow | None | **Native** | **Core differentiator** |
| **Privacy/trust** | SOC2, GDPR | SOC2, GDPR, VPC | HIPAA, SOC2, GDPR | GDPR, SOC2, HIPAA | Privacy Determination Agent |

---

## Shared Patterns (What AskElephant Can Learn)

### 1. **Prompt-to-Workflow**

- **Relay**: "Teach a skill in plain English" → visual workflow.
- **Gumloop**: "Prompt to create—build as fast as you can imagine."
- **Pattern**: Natural language as entry; visual editor for inspection/editing.
- **AskElephant**: Chat-first config ("AI first") aligns. Ensure prompt generates inspectable workflow, not black box.

### 2. **Human-in-the-Loop as First-Class**

- **Relay**: Approval steps, manual inputs, review toggle on AI steps. "Pause before high-impact actions."
- **Gumloop**: Less prominent.
- **Pattern**: Users want control before CRM writes, payment sends, external comms.
- **AskElephant**: Proactive hub "what needs approval" is aligned. Make approval the default for sensitive actions.

### 3. **Visual Workflow Explainability**

- **Relay**: "Every step is explicit... you always know what runs, in what order, and why."
- **Gumloop**: Drag-and-drop nodes, flow visibility.
- **StackAI**: Workflow + interface shown together.
- **Pattern**: Automation must be inspectable. Users fear "AI did something I can't see."
- **AskElephant**: Show workflow steps, evidence (source quotes), and run history.

### 4. **Task/Run History**

- **Relay**: "Full task history so you can review exactly what happened."
- **Pattern**: Post-run auditability.
- **AskElephant**: "What you've done, what needs approval, what's scheduled" echoes this. Add per-workflow run log.

### 5. **Template / Gallery**

- **Relay**: Skill templates, shareable.
- **Gumloop**: Department templates (Marketing, Sales, Support).
- **Lindy**: Templates page.
- **Pattern**: Reduce time-to-value with pre-built flows.
- **AskElephant**: Meeting-type templates, industry workflows (e.g., "QBR follow-up," "risk escalation").

### 6. **Integration Depth**

- All four: 100+ integrations, app event triggers.
- **AskElephant**: Meeting as primary trigger is unique. Deepen HubSpot/Salesforce field mapping.

### 7. **Proactive vs Reactive**

- **Lindy**: "Proactive, not reactive"—fix problems before they surface.
- **AskElephant**: "When I'm proactive, AI is reactive. When AI is proactive, I'm reactive." Proactive hub is core.

---

## UX Patterns for Explainable, Accessible Automation

| Pattern | Implementations | AskElephant Application |
|---------|-----------------|--------------------------|
| **Plain-language intent** | Relay (teach skill), Gumloop (prompt), Lindy (text assistant) | Chat-based config; "I want to update HubSpot when..." |
| **Visual flow** | Relay, Gumloop, StackAI | Workflow builder with nodes; collapse to summary for non-builders |
| **Approval checkpoint** | Relay (approval step, review toggle) | "Approve before CRM write" as default for high-risk |
| **Run history** | Relay (task history) | Per-workflow run log: triggered, steps executed, result |
| **Evidence linkage** | AskElephant differentiator | "Updated from this meeting quote" with source |
| **Template library** | All four | Meeting-type and outcome templates |
| **Role-based access** | Gumloop (Admin vs Member, credential scopes) | RevOps builds; reps use |
| **One-click test** | Relay ("easily see what you're testing") | Test workflow with sample meeting |

---

## Strategic Recommendations

### Match (Table Stakes)

1. **Visual workflow builder** with trigger → steps → action.
2. **Approval step** before CRM writes or external comms.
3. **Run/task history**—what ran, when, result.
4. **Template library** for common meeting → CRM flows.

### Leapfrog (Opportunity Gaps)

1. **Meeting as trigger**—not just "email received" or "deal stage changed." Triggers like: "Risk mentioned," "Commitment made," "Competitor discussed."
2. **Privacy-before-trigger**—workflow doesn't run until privacy is determined. Competitors don't own this.
3. **Evidence-first outcomes**—every CRM update links to source quote. Competitors show "AI did X"; AskElephant shows "AI did X because of this."
4. **Outcome chain visibility**—"This workflow exists so that [revenue outcome]." Tie workflow to business outcome, not just task completion.

### Ignore

1. **Generic breadth**—Don't compete on 100+ integrations. Own meeting + CRM depth.
2. **Consumer assistant positioning**—Lindy's "text your assistant" is different. Stay B2B revenue-team focused.
3. **Document intelligence**—StackAI's document extraction is adjacent; meeting extraction is core.

### Risks If We Don't Act

- **Lindy** and others will own "meeting → CRM" messaging if AskElephant doesn't ship workflow builder with meeting-triggered flows.
- **Relay** and **Gumloop** will be the default for "connect meeting tools to CRM" if we're not credible as an automation layer.
- **David Karp-style buyers** (evaluating Relay.app) need a clear "AskElephant does this, but meeting-native" story.

---

## Appendix: Source URLs

- [Relay.app](https://www.relay.app/) | [Pricing](https://www.relay.app/pricing) | [How It Works](https://www.relay.app/how-it-works)
- [Gumloop](https://www.gumloop.com/)
- [StackAI](https://www.stack-ai.com/) | [Demo](https://www.stack-ai.com/demo)
- [Lindy.ai](https://www.lindy.ai/) | [Pricing](https://www.lindy.ai/pricing) | [App Builder](https://www.lindy.ai/app-builder)
