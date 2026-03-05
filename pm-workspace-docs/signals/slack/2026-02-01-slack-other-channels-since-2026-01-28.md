# Slack Signal Digest: Additional Channels (Jan 28 - Feb 1)

**Source:** Slack (#product-forum, #design-ux, #team-dev, #team-dev-code-review, #epd-all, #general, #growth, #revenue, #team-partners)  
**Captured:** 2026-02-01  
**Range:** Since 2026-01-28T03:42:00Z

## TL;DR

Additional channels surfaced workflow builder friction, a resolved onboarding loop, and a still-open filter selection bug. Team-dev flagged a global chat integration mismatch (Composio vs existing integrations) that likely needs prompt/tool prioritization tweaks. Revenue/growth chatter highlights a $137k ARR Quota win, launch of the AIQ event series, a request for Teamwork integration, and a large wave of new workspaces/seats with a couple subscription cancellations.

## Key Decisions

- Automations page access remains **Managers/Owners only**; Users can still create tags via the search page.  
  Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769708236879499?thread_ts=1769708236.879499

## Action Items

- Log workflow builder feedback to Linear (acknowledged in thread).  
  Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769797082893999?thread_ts=1769797082.893999
- Update messaging/docs on call download capability (customer confusion).  
  Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769716679858399?thread_ts=1769716679.858399
- Tweak global chat prompt/tooling to prefer connected integrations before Composio.  
  Permalink: https://askelephant.slack.com/archives/C06SP2T5SSD/p1769629785147089?thread_ts=1769629785.147089
- Follow up on trust center access request for Greg Berke.  
  Permalink: https://askelephant.slack.com/archives/C07KLA3HF34/p1769714914174669
- Track ASK-4643/VAN-501 (internal search responding to any Slack message).  
  Permalink: https://askelephant.slack.com/archives/C0649EFMM7T/p1769716027738879?thread_ts=1769716027.738879

## Problems Identified

### Problem 1: Onboarding loop reappears for active users

> "I keep getting put through the onboarding flow for some reason. Anyone know why?"  
> Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769635092626379?thread_ts=1769635092.626379

- **Persona:** Internal (team), possibly end users
- **Severity:** Medium
- **Frequency:** Intermittent
- **Status:** Resolved (fix shipped; follow-ups report no recurrence)

### Problem 2: Workflow builder performance slowness

> "It is taking like a solid 15-30 seconds everytime I click a new button in the workflow builder..."  
> Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769706596025959?thread_ts=1769706596.025959

- **Persona:** Builders / RevOps
- **Severity:** Medium
- **Frequency:** Short-lived spike
- **Status:** Resolved (self-resolved within ~30 minutes)

### Problem 3: Filter selection bug (refresh doesn't fix)

> "da hell. refresh doesn't fix it"  
> Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769731585924949?thread_ts=1769731585.924949

- **Persona:** Internal (team)
- **Severity:** Medium
- **Frequency:** Unknown
- **Status:** Open

### Problem 4: Download calls capability confusion

> "Jillian @ Design Ergonomics thought she couldn't download calls because AskElephant said it can't."  
> Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769716679858399?thread_ts=1769716679.858399

- **Persona:** Customers (CSMs, end users)
- **Severity:** Medium
- **Frequency:** Unknown
- **Status:** Open (content/UX guidance gap)

### Problem 5: Global chat integration mismatch (Composio vs existing)

> "Regular chat is trying to use the existing integration, and it seems global chat didn't and is asking me to connect with Composio."  
> Permalink: https://askelephant.slack.com/archives/C06SP2T5SSD/p1769629785147089?thread_ts=1769629785.147089

- **Persona:** Internal (team) / admins
- **Severity:** Medium
- **Frequency:** Repeatable in global chat
- **Status:** Open (prompt/tooling priority fix proposed)

### Problem 6: Internal search responding to any Slack message

> "Ask Elephant is responding to people in Slack... just responding to any sort of message." (VAN-501 / ASK-4643)  
> Permalink: https://askelephant.slack.com/archives/C0649EFMM7T/p1769716027738879?thread_ts=1769716027.738879

- **Persona:** Customers using Slack channel integrations
- **Severity:** High
- **Frequency:** Ongoing (reported)
- **Status:** Tracked in Linear

## Feature Requests

- **Teamwork integration** request (Composio board upvote).  
  Permalink: https://askelephant.slack.com/archives/C07KLA3HF34/p1769963209040429
- **Export/migrate to Gong** questions (need documented migration path).  
  Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769703305514769?thread_ts=1769703305.514769

## Notable Signals

### Product Feedback & Ops

- Workflow builder feedback captured; to be logged in Linear.  
  Permalink: https://askelephant.slack.com/archives/C093A29CKPU/p1769797082893999?thread_ts=1769797082.893999
- Team-dev discussion suggests shifting prompt priority to prefer connected tools before Composio in global chat.  
  Permalink: https://askelephant.slack.com/archives/C06SP2T5SSD/p1769629785147089?thread_ts=1769629785.147089
- Managed connection pooling rolled to production (infra risk/monitoring).  
  Permalink: https://askelephant.slack.com/archives/C06SP2T5SSD/p1769672962616479?thread_ts=1769672962.616479
- pnpm migration announced for `elephant-ai`.  
  Permalink: https://askelephant.slack.com/archives/C06SP2T5SSD/p1769761004863219?thread_ts=1769761004.863219

### Design & Market Signals

- Team discussing MCP apps/AI browser-native chat as future UI layer.  
  Permalink: https://askelephant.slack.com/archives/C06HZEGBLAU/p1769617149049569

### Revenue & Growth

- **Quota win:** ~$137k ARR.  
  Permalink: https://askelephant.slack.com/archives/C07KLA3HF34/p1769802676029659
- **AIQ event series** launch (Feb 12, CS audience).  
  Permalink: https://askelephant.slack.com/archives/C07KLA3HF34/p1769730948245369?thread_ts=1769730948.245369
- **Trust center access** requested for Greg Berke (Fifth Dimension).  
  Permalink: https://askelephant.slack.com/archives/C07KLA3HF34/p1769714914174669
- **New workspaces/seats**: Fifth Dimension, Jamerson, Prophetic Software, Opkey, Distro, n2uitive, Demo AskElephant.  
  Signal source: #growth
- **Subscription cancellations**: Cobalt, Boomcloud.  
  Signal source: #growth

## Problems Status Tracking

### problems_open

- Filter selection bug (refresh doesn’t fix it).
- Download calls capability confusion (content gap).
- Global chat integration preference mismatch (prompt/tool priority).

### problems_resolved

- Onboarding loop retriggering (fix shipped, no recurrence reported).
- Workflow builder slowness spike (self-resolved).

### problems_workaround

- None recorded.

### problems_tracked

- ASK-4643 / VAN-501 internal search responding to any Slack message.
