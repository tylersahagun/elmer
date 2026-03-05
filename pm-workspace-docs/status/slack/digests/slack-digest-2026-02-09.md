# Slack Update: Feb 6-9, 2026

**Generated:** 2026-02-09
**Period:** Since last check (Feb 6, ~72 hours ago)
**Channels Scanned:** 12
**Messages Analyzed:** ~70

---

## 🔴 Act (4) — Needs Your Response

### 1. Robert Henderson Asking for Prototypes

**Channel:** #council-of-product | **From:** Robert Henderson | **Time:** Feb 7
**Link:** [View](https://askelephant.slack.com/archives/C09EUN0JWCR/p1770484555676779)

> "@sam.ho @Tyler @Skylar do you guys have any prototypes of the projects we are working on? I haven't seen any in the past couple of weeks and would like to get a pulse on where we are at."

**Why it matters:** Robert (Head of Growth) is asking for prototype visibility across projects. Sam replied "Let's get these added to the pages linked from notion project doc." Robert also tagged you again later with an image.

**Recommendation:** Share links to recent prototypes. You have active prototypes for several initiatives. Respond with a summary of what's available and where they can be found.

**Suggested response:**

> "Hey Robert! Good call. We have prototypes for Client Usage Metrics and Composio Agent Framework in various stages. Let me compile links and add them to the Notion project pages. I'll have that updated by EOD."

---

### 2. SFDC Dev Account Password Request

**Channel:** MPDM (Tyler/Benjamin/Michael/Dylan) | **From:** Michael Cook | **Time:** Feb 9
**Link:** [View](https://askelephant.slack.com/archives/C0AESP32A7J/p1770664162273979)

> "Hey Tyler - SFDC Dev account is asking for a password update. Can you change the password and send me the new one please?"

**Why it matters:** Blocking Michael's work. Simple action item.

**Recommendation:** Handle the password reset and send to Michael directly.

---

### 3. Sam Ho DMs — CRM Node & Channel Questions

**Channel:** DM with Sam | **From:** Sam Ho | **Time:** Feb 9
**Links:**

- [View](https://askelephant.slack.com/archives/D0AAGBZN8TS/p1770656036642039) — "what is the crm node he is referring to?"
- [View](https://askelephant.slack.com/archives/D0AAGBZN8TS/p1770656236649129) — "got it, are these shared in a particular channel?"

**Why it matters:** Sam is asking follow-up questions that need your context. These are likely about the Notion projects doc you shared in #epd-all or a specific engineering discussion.

**Recommendation:** Reply to Sam with the specific context he's asking about. Check what conversation preceded these messages.

---

### 4. Ben Harrison Requesting Churn Alert Review

**Channel:** #churn-alert | **From:** Ben Harrison | **Time:** Feb 9
**Link:** [View](https://askelephant.slack.com/archives/C08KRLHDBCK/p1770656805626749)

> "@Ty @James Can we review?" (in thread about churn alert misassignments)

**Why it matters:** Ben is flagging that churn alert data has assignment issues — agents are picking up wrong signals, and there's a broken HubSpot workflow. James already acknowledged the broken workflow and is fixing it.

**Recommendation:** Check in on the fix status. The immediate HubSpot workflow issue is being handled by James, but the broader data quality issue (wrong company assignments) may need product attention.

**Suggested response:**

> "Saw this — James is on the workflow fix. For the assignment data quality issue, let me sync with Pete on the audit results and see if there's a systemic issue we need to address."

---

## 🟡 Decide (4) — Review and Evaluate

### 1. Settings V2 Confusion & Rollback

**Channel:** #product-forum | **From:** Jason, Matt Bennett, Ben Harrison | **Time:** Feb 9
**Links:**

- [View](https://askelephant.slack.com/archives/C093A29CKPU/p1770656693964419) — Jason's announcement
- [View](https://askelephant.slack.com/archives/C093A29CKPU/p1770657889277279) — "is the beta features toggle gone?"
- [View](https://askelephant.slack.com/archives/C093A29CKPU/p1770657313329619) — "I turned settings v2 off by default"

**Summary:** Significant internal confusion about Settings V2 this morning:

- Matt asked "is the beta features toggle gone?"
- Ben asked "How would Wyatt connect his calendar?"
- Jason turned Settings V2 off by default since "this feature is not ready for broad internal use"
- There's a duplicate privacy rules section appearing
- Tyler (other Tyler) flagged "2 privacy rules sections"

**Why it matters:** This is your initiative (settings redesign). The premature internal rollout caused confusion. Jason handled the immediate rollback but there are still UX issues to resolve.

**Decision needed:** (1) Should Settings V2 be re-enabled for internal testing once stabilized? (2) Do you need to clarify the rollout plan with Jason? (3) Address the duplicate privacy rules bug.

---

### 2. Internal Search Accuracy Issue

**Channel:** #product-forum | **From:** Ben Harrison | **Time:** Feb 9
**Link:** [View](https://askelephant.slack.com/archives/C093A29CKPU/p1770658040756259)

> "I asked through Global Chat, to pull all the instances a specific AskE employee met with a specific company... It said there was 1 meeting; I asked it multiple times and tried to refine my ask. Same result. I then pulled the company up manually in AskElephant and I can see biweekly calls held and recorded."

**Why it matters:** Ben (CX Lead) found a significant accuracy gap in Global Chat/Internal Search. If CX can't trust search results, customer-facing teams won't either. Dylan is investigating.

**Decision needed:** Track this as a signal. Is this a known limitation of internal search, or a regression?

---

### 3. Engagement Workflows Not Auto-Executing (ASK-5031)

**Channel:** #product-issues | **From:** Pylon (via Linear) | **Time:** Feb 9
**Link:** [View](https://askelephant.slack.com/archives/C06G5TME1S7/p1770663221118269)

**Summary:** New bug — engagement workflows (James recap email, HubSpot deal workflows) failed to auto-execute after a meeting in the Partnership workspace. Required manual intervention.

**Why it matters:** Workflow reliability is a core value proposition. This also connects to the Active Parks renewal blocker (see Capture section). If workflows aren't executing reliably, it undermines trust.

**Decision needed:** Monitor priority. Is this a one-off or systemic? Connect with engineering on root cause.

---

### 4. Bryan's Question About Notion Doc Timing

**Channel:** #epd-all | **From:** Bryan Lund | **Time:** Feb 9
**Link:** [View](https://askelephant.slack.com/archives/C0649EFMM7T/p1770658089649079)

> "Should we hold off on posting this while it's no longer a 'work in progress' or are we planning on living in that state for a while?"

**Why it matters:** Bryan (Engineering lead) is asking about the Notion Projects Database you shared with EPD. Tyler (other Tyler) also asked about adding Salesforce Agent and Signals to the doc. You already responded that it'll only be WIP for a day or two.

**Recommendation:** Follow through — make sure the Notion doc is updated and polished within the next day as promised.

---

## 🟢 Aware (5) — For Context

- **Settings Overhaul UI v1 Done** — ASK-5004 marked Done by Bryan - #product-issues - [View](https://askelephant.slack.com/archives/C06G5TME1S7/p1770655245827119)
- **Palmer's Workflow Update** — HubSpot/SFDC triggered workflows now support specific property selection for "Updated" triggers - #product-updates - [View](https://askelephant.slack.com/archives/C093P8NNJ01/p1770657612009769)
- **Company Merge Bug** — Dylan working on ASK-5028 (ObservePoint merge errors), asking about root cause of duplicate companies - #product-issues - [View](https://askelephant.slack.com/archives/C06G5TME1S7/p1770662243832699)
- **Deprecated GraphQL Tickets Canceled** — Jason canceled ASK-5005 and ASK-5006 (settings-related cleanup) since approach changed - #product-issues
- **Billing Email Churn Workflow** — Tyler (you) already implemented the billing@askelephant.ai churn alert workflow Woody requested - #churn-alert - [View](https://askelephant.slack.com/archives/C08KRLHDBCK/p1770490703843039)

---

## 📊 Capture (4) — Product Signals

| Signal                                                                                               | Type     | Source             | Link                                                                         | Initiative               |
| ---------------------------------------------------------------------------------------------------- | -------- | ------------------ | ---------------------------------------------------------------------------- | ------------------------ |
| orbb.com churn risk — competitor (Gong), dissatisfaction, missing features, price objections         | churn    | #churn-alert       | [View](https://askelephant.slack.com/archives/C08KRLHDBCK/p1770660601404799) | competitive-positioning  |
| Active Parks renewal blocker — HubSpot workflow output not appearing in deal records (criticality 5) | feedback | #customer-feedback | [View](https://askelephant.slack.com/archives/C08KRKSDMEF/p1770662313711339) | deprecate-legacy-hubspot |
| Venchrz — auto-populate HubSpot fields (criticality 5), conditional workflow logic (criticality 4)   | feedback | #customer-feedback | [View](https://askelephant.slack.com/archives/C08KRKSDMEF/p1770663651232769) | crm-agent-upgrades       |
| Salesforce AE onboarding — admin access blocker, workflow builder UX, meeting prep automation        | feedback | #customer-feedback | [View](https://askelephant.slack.com/archives/C08KRKSDMEF/p1770661706403539) | composio-agent-framework |

---

## Summary

**Triage breakdown:**

- 🔴 **4 Act** — needs response today (~15 min)
- 🟡 **4 Decide** — review and evaluate this week
- 🟢 **5 Aware** — for context, no action
- 📊 **4 Captured** — product signals to track

**Recommended focus order:**

1. **Sam Ho DMs** — reply to your manager's questions - [View](https://askelephant.slack.com/archives/D0AAGBZN8TS/p1770656036642039)
2. **Robert's prototype request** — share prototype links, update Notion - [View](https://askelephant.slack.com/archives/C09EUN0JWCR/p1770484555676779)
3. **SFDC password reset** — quick unblock for Michael - [View](https://askelephant.slack.com/archives/C0AESP32A7J/p1770664162273979)
4. **Churn alert review** — check in with Ben on data quality - [View](https://askelephant.slack.com/archives/C08KRLHDBCK/p1770656805626749)
5. **Settings V2 rollback** — sync with Jason on stabilization plan - [View](https://askelephant.slack.com/archives/C093A29CKPU/p1770656693964419)

**Time estimate:** ~15 minutes to clear all 🔴 Act items
