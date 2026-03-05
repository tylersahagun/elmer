# AskElephant Slack Channel Audit
**Date:** March 4, 2026  
**Purpose:** Internal comms spring cleaning initiative  
**Source:** Live Slack API via Composio MCP  

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total channels | **564** |
| Active channels | **380** |
| Archived channels | **184** |
| Public channels | 534 |
| Private channels | 30 |
| `ext-` (customer-shared) channels | 170 |
| `proj-` (project) channels | 61 |

**Top finding:** No explicit comms-cleanup discussions exist in Slack yet — this audit is ahead of the conversation. However, structural redundancy across the product feedback channels is clear and actionable.

---

## 1. Complete Channel List

### Core Internal Channels (Active, by member count)

| Channel | Members | Type | Notes |
|---------|---------|------|-------|
| #customer-quotes2025612 | 190 | Public | Likely an auto-archive candidate (year suffix) |
| #critical-risk-accounts | 58 | Public | High-value retention channel |
| #pga-nam-sept-2025-cohort-7-partners | 56 | Public | Partner cohort |
| **#product-issues** | **51** | Public | Bug triage — very high volume |
| #general | 49 | Public | All-hands |
| #watering-hole | 47 | Public | Social |
| #access-requests | 47 | Public | IT/ops |
| #incidents | 46 | Public | incident.io integration |
| #ai-news | 45 | Public | External AI news |
| #phishing-reports | 43 | Public | Security |
| #churn-alert | 42 | Public | Revenue risk |
| #customer-quotes | 40 | Public | Customer advocacy |
| **#product-forum** | **39** | Public | Product discussion (catch-all) |
| #product-updates | 38 | Public | Release announcements |
| #office-utah | 36 | Public | Local office |
| #growth | 35 | Public | Growth team |
| #se-am-handoffs | 35 | Public | Sales handoffs |
| #pga-nam-jan-2026-cohort-partners | 34 | Public | Partner cohort |
| **#product-requests** | **33** | Public | Feature requests |
| #competitors | 31 | Public | Competitive intel |
| #epd-all | 30 | Public | Eng/Product/Design |
| #team-sales | 30 | Public | Sales team |
| #team-dev | 28 | Public | Dev team |
| #revenue | 28 | **Private** | Revenue leadership |
| #proj-peanut | 28 | Public | Active project |
| #product-marketing-updates | 27 | Public | PMM updates |
| #alloy-insiders | 27 | Public | Partner program |
| #team-dev-code-review | 26 | Public | Eng code review |
| #proj-workflows | 26 | Public | Active project |
| #proj-mobile | 25 | Public | Active project |
| #customer-feedback | 25 | Public | Customer signals |
| #askelephant-internal-workflow-requests | 23 | Public | Workflow proposals |
| #proj-desktop-app | 23 | Public | Active project |

### Active `proj-` Project Channels (33 active)

| Channel | Members |
|---------|---------|
| #proj-peanut | 28 |
| #proj-workflows | 26 |
| #proj-mobile | 25 |
| #proj-desktop-app | 23 |
| #proj-signals | 18 |
| #proj-meeting-sharing | 18 |
| #proj-product-analytics | 18 |
| #proj-notetaker | 17 |
| #proj-privacy-agent | 16 |
| #proj-crm-agent-upgrades | 16 |
| #proj-onboarding-v2 | 14 |
| #proj-composio | 14 |
| #proj-usage-dashboard | 14 |
| #proj-knowledge-base | 13 |
| #proj-billing | 12 |
| #proj-product-clarity-and-communication | 12 |
| #proj-babar | 12 |
| #proj-save-redo | 12 |
| #proj-public-api | 12 |
| #proj-pricing | 11 |
| #proj-dominate-utah | 11 |
| #proj-usability | 11 |
| #proj-settings-refresh | 11 |
| #proj-mcp-server | 11 |
| #proj-observability-quality | 10 |
| #proj-notification-engine | 9 |
| #proj-design-system-v2 | 9 |
| #proj-revenue-dashboards | 8 |
| #proj-referrals | 7 |
| #proj-sso-user-provisioning | 7 |
| #proj-self-signup | 6 |
| #proj-voiceprint | 5 |
| #proj-save-pestshare | 1 |

### `ext-` Customer Shared Channels (170 total)

Active customer-shared channels (selected by member count):

| Channel | Members |
|---------|---------|
| #ext-kixie-askelephant | 27 |
| #ext-schoolai-askelephant | 26 |
| #ext-motivositychannel | 29 |
| #ext-531social | 18 |
| #ext-aske-buildwitt | 17 |
| #ext-aske-perryweather | 16 |
| #ext-agility | 16 |
| #ext-propeller | 14 |
| #ext-hexmodal-askelephant | 13 |
| #ext-pearagon | 12 |
| #ext-pestshare-askelephant | 12 |
| #ext-sequifi | 19 |

### Archived Channels (184)

Prominent archived clusters:
- **Old incident rooms:** `#ir-1-bots-not-joining`, `#ir-2-meeting-processing-failing`, `#ir-calendar-v2`, `#ir-call-not-showing`, `#inc-12-app-down` through `#inc-16-...` — all properly archived ✓
- **Old proj- channels (28 archived):** `#proj-action-items`, `#proj-agents`, `#proj-bot-reliability`, `#proj-calendar-prep`, `#proj-calendaring`, `#proj-chat-v2`, `#proj-crm-update`, `#proj-crm-update-ui`, `#proj-event-details`, `#proj-gong-call-imports`, `#proj-hipaa`, `#proj-hub`, `#proj-hubspot`, `#proj-knowledge-bases`, `#proj-rag`, `#proj-talk-to-company-mvp`, `#proj-tiktok`, `#proj-ui-ux-cleanup`, `#proj-updating-search`
- **Old test channels:** `#test-zapier`, `#test-slack-scheduled-msg-workflow`, `#slack-app-tests`, `#scorecard-test-2`
- **Stale social channels:** `#ajedrez`, `#interest-mental-health`, `#coaching-ideas`, `#pivot-ideas`
- **Old external pilots:** `#ext-hona`, `#ext-orbital`, `#ext-plena-askelephant`, `#ext-redo-askelephant`, `#ext-schoolai`, `#ext-vend-qualiti`

---

## 2. Key Product Channel Deep Dive

### #product-issues (C06G5TME1S7)
**51 members | Created Jan 2024 | Has 4 pinned messages**

**What it's used for:** Primary bug triage queue feeding the Development team. Nearly all messages are automated Pylon bot alerts (≈60% of traffic) announcing new issues in the triage queue with Linear issue IDs.

**Recent themes:**
- Timezone/date handling errors (ASK-5700, ASK-5689)
- UI/UX glitches (auto-scroll, click-to-copy navigation)
- Integration-specific failures (HubSpot batch tools, Slack node, Web-Search tool)
- Performance problems (slow chat, "still thinking" timeouts)

**Signal:** Very high volume, highly automated. Pylon dominates. This is working as intended as a bug-intake funnel → Linear. The main issue is **signal-to-noise** when humans add comments vs. bot messages.

**Previous names:** (2 name changes per API — was likely renamed from an earlier naming convention)

---

### #product-requests (C07NZNWNCD7)
**33 members | Created Sep 2024**

**What it's used for:** Customer-driven feature requests, usually posted by CSMs/CROs with a "from [Person] @ [Company]" pattern.

**Recent themes:**
- Branding/UI customization (notetaker image, transcript wording, email layout)
- Integration & security (SSO/Okta provisioning, Gemini-only mode, HubSpot reconnection alerts)
- Knowledge base & document handling (bulk upload, separate documents tab)
- Workflow & automation extensions (stop workflow mid-build, email from-address, role-based access)

**Signal:** Semi-formal intake process is emerging organically (people use "from X @ Y" prefixes). Some requests that are really workflow-automation asks are landing here instead of #askelephant-internal-workflow-requests. **Overlap with that channel is a clear consolidation opportunity.**

**Previous names:** 1 name change

---

### #product-forum (C093A29CKPU)
**39 members | Created Jun 2025**

**What it's used for:** Open-ended product discussion, edge-case questions, internal knowledge sharing. Functions as a "catch-all" for anything that isn't a clear bug or formal request.

**Recent themes:**
- Analytics & granularity (leaders asking for product usage metrics)
- Integration status & alerts (HubSpot/Slack reconnection, Salesforce Agent feature flag)
- UX quirks (transcript missing tags, global chat talking to itself)
- Operational questions (how to re-process transcripts, private-link handling, calendar selection)

**Signal:** Relatively new channel (Jun 2025). Getting mixed use — some discussions that belong in #product-issues or #product-requests are landing here. Volume is moderate. **Needs clearer purpose definition and routing guidance.**

**Purpose in channel:** "Welcome to our internal space for open discussion about the product experience."

---

### #askelephant-internal-workflow-requests (C07J31TU9B4)
**23 members | Created Aug 2024**

**What it's used for:** Design and propose custom workflow automations, both for internal ops and for customer implementations.

**Recent themes:**
- Sales-pipeline automation (HubSpot deal triggers, churn-alert workflows)
- Meeting-prep & post-call automation (pre-meeting reminders, recap-email generation, meeting notes → HubSpot)
- Insight extraction (sentiment capture, MEDDPIC scoring, competitor tracking)
- Operational health (automated CRM data entry, health score aggregation)

**Signal:** Has a semi-formal templated request format (title + "What does the workflow do?" bullets). This is working well. The main issue is **workflow-related feature requests from #product-requests bleeding in here** — and vice versa.

---

## 3. Search Results: Channel Cleanup & Comms Discussions

| Query | Results | Insight |
|-------|---------|---------|
| "channel cleanup OR slack cleanup" | 3,355 total but 0 relevant — matches were generic use of those words | No explicit cleanup conversation happening |
| "spring cleaning OR comms cleanup OR consolidate channel" | **0 results** | No prior discussion — this audit is pioneering |
| "internal comms communication consolidate channels" | 340 matches — all general comms usage, not about channel structure | |
| "help-product OR help-eng OR help-engineering" | **0 results** | These channels do not exist yet |
| "bug triage OR triage process OR product request OR feature request" | 560 total matches | High volume, suggests these concepts are well-known |
| "in:#product-issues triage" | **1,043 messages** | Confirms extremely high triage volume in product-issues |

**Key finding:** There are **no existing conversations about channel structure or comms cleanup.** This initiative is being launched fresh. No grassroots movement to reference yet.

---

## 4. Redundancy & Consolidation Opportunities

### Overlap Matrix

| Channel A | Channel B | Overlap Type | Recommendation |
|-----------|-----------|--------------|----------------|
| #product-requests | #askelephant-internal-workflow-requests | Workflow-automation requests landing in both | Add explicit routing guidance in both channel topics |
| #product-forum | #product-issues | Bug discussions sometimes start in forum before being filed | Pin a routing guide in #product-forum |
| #product-forum | #product-requests | Feature ideas discussed in forum, not formalized | Same routing guide |
| #customer-feedback | #product-requests | Customer signal overlap | Clarify: #customer-feedback = raw voice, #product-requests = actionable asks |
| #customer-quotes | #customer-quotes2025612 | Duplicate-looking channels | Archive #customer-quotes2025612 (year suffix suggests migration artifact) |

### Archive Candidates (Active channels that may be stale)

- `#proj-save-pestshare` — 1 member, likely dormant
- `#customer-quotes2025612` — 190 members but year-suffix suggests accidental duplicate
- `#devin-prompt-builder` — 8 members, niche use
- `#clozeloop-scorecard` — 7 members
- `#test-local-app`, `#test-staging-app` — test channels with 9 members each

### New Channels Worth Creating

Based on the audit gaps:
- **`#help-product`** — currently zero results; a self-service help channel for customers/CSMs to ask product questions before filing a request (reduces noise in #product-forum)
- **`#help-eng`** or **`#dev-support`** — zero results currently; internal engineering help channel

---

## 5. Recommended Spring Cleaning Actions

### Immediate (no discussion needed)
1. **Archive `#customer-quotes2025612`** — appears to be a migration artifact (year suffix)
2. **Archive `#proj-save-pestshare`** — 1 member, inactive
3. **Update channel topics** for #product-issues, #product-requests, #product-forum, and #askelephant-internal-workflow-requests with clear scope and routing instructions
4. **Pin a routing guide** in #product-forum pointing to the right channel for bugs vs. requests vs. workflow proposals

### Short-term (needs discussion)
5. **Define and post a "Slack channel guide"** in #general — with the 4-quadrant model: bugs → #product-issues, feature ideas → #product-requests, workflow automations → #askelephant-internal-workflow-requests, general discussion → #product-forum
6. **Evaluate creating `#help-product`** as a self-service triage entry point for CSMs and customers
7. **Consider archiving `#proj-*` channels** whose Linear projects are Done/Archived (cross-reference with Linear)

### Longer-term
8. **Evaluate `#product-forum` vs. `#product-requests` merge** — if the forum remains low-signal, consider consolidating into a single structured channel
9. **Implement Pylon → channel routing** to reduce bot noise in #product-issues (separate bot-only messages from human discussion using threads or a dedicated `#product-issues-raw` channel)
10. **Quarterly channel review cadence** — set a reminder to run this audit every quarter

---

## Appendix: Full Active Channel Count by Category

| Category | Active Count |
|----------|-------------|
| `ext-` customer-shared | ~130 active |
| `proj-` project channels | 33 active, 28 archived |
| Internal team/function | ~80 |
| Revenue & customer signals | ~15 |
| Social/culture | ~10 |
| Test/experimental | ~5 |
| Partner programs (`pga-`, `alloy-`, etc.) | ~10 |
| **Total active** | **380** |

---

*Audit generated: March 4, 2026 via Slack API (564 channels scanned)*
