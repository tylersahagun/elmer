# Product Sync - ROICX Expansion Discussion

> **Source**: Product Sync - Monday, Jan 26, 2026
> **Participants**: Tyler Sahagun (PM), Erika Vasquez (CS/Sales), Sam Ho (Leadership)
> **Duration**: 28 minutes
> **Status**: Processed

---

## TL;DR

Erika is managing ROICX Solutions, a large call center client with 60 seats and potential for 100-200 more. The customer is Microsoft-oriented (Teams, Excel) with no CRM for their operations team, creating friction with AskElephant's current capabilities. Key blockers: Composio isn't in workflow automation yet, Teams notifications aren't supported (only Slack), and Excel/Sheets automation is risky to support. Leadership guidance: non-ICP customers without CRM = high churn risk, recommend webhook approach to let customer own automation.

---

## Key Decisions

1. **Do NOT promise Composio automation** - It works in chat but not in workflow triggers yet
2. **Teams notifications = gap** - Customer can't receive Slack-style alerts without Teams support
3. **Webhook approach recommended** - Let ROICX own automation via Zapier/internal team, AskElephant provides data
4. **Non-ICP strategy** - Accept that non-ICP customers may churn; don't build custom solutions for them
5. **Tyler to work with Caden** on Composio workflow integration timing

---

## Action Items

| Who   | What                                                       | When                  |
| ----- | ---------------------------------------------------------- | --------------------- |
| Tyler | Work with Caden on Composio in workflows progress          | Today                 |
| Erika | Show webhook node in workflows to ROICX                    | Before client meeting |
| Erika | Ask ROICX if they have internal enablement team for Zapier | Client meeting        |
| Erika | Create manual workflow trigger for call info lookup        | Before client meeting |
| Erika | Suggest third HubSpot workspace to CEO                     | Client meeting        |

---

## Problems Extracted

### Customer Pain Points

> "Currently, they have a Google Sheet that they manually, after every call, go into the Google Sheet and say, we met with AskElephant. This is the main point of contact at AskElephant. This is their favorite thing about our ICX."
> — Erika describing ROICX workflow

> "They get overwhelmed when there's a lot going on. Even with our onboarding calls, I think they get a little lost in the sauce. They're pretty old school."
> — Erika on ROICX's technology adoption

> "His fear is just around company culture, to be honest. He was like, well, I don't want the operations team to point fingers at the sales team."
> — Erika on CEO's data separation concern

### Product/Technical Limitations

> "With Composeo, what the piece that we're missing right now to actually do the automation piece is that it's not existing in workflows yet."
> — Tyler on Composio status

> "We haven't tested it with Teams. We haven't actually tested out that. Like, does it work with Microsoft Sheets?"
> — Tyler on Microsoft integration readiness

> "Composeo, and it doesn't support, like, Teams transcripts yet from from what it indicates."
> — Sam on Composio Teams limitation

### Support Risk

> "You'll be stuck in this forever support loop on a call every week when something breaks because someone viewed something."
> — Sam on spreadsheet automation danger

> "This is kind of what I fell into a lot with... Previ, where it was like, oh, yeah. We can support this podcast integration through Zapier. And then it was two times a week on an hour long call with them trying to debug and fix."
> — Tyler on prior support trap experience

---

## Feature Requests

1. **Microsoft Teams notifications** - Push insights/alerts to Teams instead of Slack
2. **Excel/Sheets automation** - Auto-update spreadsheets after meetings (NOT recommended to build)
3. **Composio in workflow automation** - Trigger integrations from meeting events (in progress)
4. **Manual workflow trigger for data lookup** - Workaround for automation gap

---

## Personas Mentioned

- **Operations Team** (non-ICP) - ROICX operations team managing client relationships via Excel
- **RevOps/Enablement** - Suggested ROICX should have internal team own Zapier automation
- **Sales Rep** - ROICX sales team has HubSpot, operations team doesn't
- **CS/Account Manager** - Erika's role managing expansion

---

## Strategic Alignment Assessment

### ⚠️ ICP Concern - Medium-High Risk

ROICX is **not ideal ICP**:

- No CRM for the team we're selling to
- Microsoft stack (Teams, Excel) vs our Slack/Google focus
- "Old school" technology adoption
- CEO has data silo requirements

**Sam's guidance:**

> "Strategy is about what you're not going to do. So find out where you have success and double down on where you have the highest likelihood of success as opposed to spreading around on non-ICPs."

> "We should probably expect anyone that's not our ICP to have high churn that we don't care about."

### ✅ Aligned with Product Vision

- Not building custom spreadsheet automation (anti-vision: commodity features)
- Recommending webhook approach preserves AskElephant as data source, not automation engine
- Human-centered: suggesting they use their own tools/teams for automation

### ⚠️ Revenue vs. Risk Tradeoff

- 60 seats signed, potential 100-200 more = significant revenue
- But only 16 of 60 seats invited = adoption risk
- Support burden could exceed revenue value

---

## Hypothesis Matches

### Existing Hypotheses

- **composio-agent-framework** - Direct relevance; customer waiting on Composio in workflows

### Hypothesis Candidates

- **Teams notification integration** - Multiple signals now suggest Teams parity with Slack is needed
- **Non-ICP identification scoring** - Could we flag accounts likely to churn based on tech stack?

---

## Customer Context

**Company**: ROICX Solutions
**Industry**: Call center / outsourcing
**Size**: Hundreds of employees across teams
**Tech Stack**:

- Microsoft (Teams, Excel)
- HubSpot (sales + partnerships teams only)
- No CRM for operations team

**AskElephant Usage**:

- 60 seats purchased for operations team
- 12 seats for sales/partnerships
- Only 16 of 60 ops seats invited

**Organizational Structure**:

- Sales team → HubSpot instance 1
- Partnerships team → HubSpot instance 2
- Operations team → Excel spreadsheet (no CRM)
- CEO mandates team data separation ("data contamination" fear)

**Current Manual Process**:

- After every call, update Excel with:
  - Director, client name, start date, close date
  - Active status, business scope, website
  - POCs, email, criteria
  - Health score (manual calculation)

---

## Competitive Intel

- Customer could use **Microsoft Copilot** for their automation needs (Sam's suggestion)
- This would be more reliable than anything we build for non-ICP use case

---

## Follow-up Signals Needed

- [ ] Outcome of Erika's ROICX client meeting
- [ ] Composio in workflows timeline from Caden
- [ ] Teams notification support decision

---

## Related Signals

- `sig-2026-01-24-council-of-product` - Composio NOT live to customers, revenue team confusion
- `sig-2026-01-21-crispy-product-feedback` - HubSpot dependency discussions

---

## Metadata

```yaml
signal_id: sig-2026-01-26-product-sync-roicx
type: transcript
source: product-sync
topic: roicx-expansion-composio-teams-limitations
captured_at: 2026-01-26T10:00:00.000000
status: processed
initiative: composio-agent-framework
severity: medium
word_count: 4200
```
