# Slack Sync - February 5, 2026

**Channels scanned:** #sales-closed-won, #team-sales, #sdr-stats, #expansion-opportunities, #churn-alert, #team-partners, #product-updates, #product-issues, #customer-quotes

---

## Revenue Team Wins

### Deals Closed (#sales-closed-won)

| Deal                       | Amount            | ICP Fit | Key Insight                                                                                                                                             |
| -------------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Snapshot Interactive**   | $2,400-$16,200    | 95%     | Won over 2x-priced competitor on customer service + scale (5% to 100% call monitoring). Josh Moquin chose partnership model.                            |
| **doTERRA Essential Oils** | $300              | 68%     | Organic self-education win. Ben Robinson discovered via direct traffic, 7 visits/16 pages, no sales friction. Pilot stage at 5,000-employee enterprise. |
| **Motus Studio**           | New Deal (1 Seat) | --      | New deal closed                                                                                                                                         |

### SDR Activity (#sdr-stats)

**Adia Barkley** posted team conversion benchmarks:

| SDR            | Conv-to-Pitch | Pitch-to-Meeting |
| -------------- | ------------- | ---------------- |
| Mike Haimowitz | ~75-82%       | ~28-35%          |
| Carter         | ~65-75%       | ~35-45%          |
| Jamis Benson   | ~78-85%       | ~25-40%          |

**Daily stats (2/4):**

- **Carter**: 7 conversations, 6 pitches, **2 meetings scheduled**
- **Unknown SDR**: 1 conversation, 0 pitches, 0 meetings

### Referrals & Pipeline (#team-sales)

- **Ben Harrison** referred **Matt Kelly** (SVP Sales at CareStar, 20+ years experience) -- Julie Kelly's (ELB) husband. Interested in AskElephant for his sales org. Ben Kinard tagged for intro meeting. _6 eyes, 4 fire reactions from team._
- Onboarding booking link updated (Ty Whittaker + Erika calendar)
- Motivational LinkedIn share -- sales mindset/"professional paranoid" post

### Partners (#team-partners)

- Partner re-allocations completed with new team member Matt
- **Revenue targets shared**: $3.5M this quarter, $10M+ this year
- Several new potential partners in pipeline for coming weeks

### Expansion (#expansion-opportunities)

No activity today.

### Churn (#churn-alert)

No activity today.

---

## Engineering Updates

### Shipped / Wins (#product-updates)

**P99 Latency Below 5 Seconds (All Day)**

- Previously: 45-50 seconds p99
- Now: Consistently below 5 seconds since early last week
- Shoutout to **Kaden Wilkinson** for infrastructure collaboration
- Next focus: individual experience optimization (workflows page, search page)
- _Reactions: fire x4, heart x3, LFG x2_

### Bugs Filed Today (#product-issues)

| Issue    | Priority | Summary                                                                                          |
| -------- | -------- | ------------------------------------------------------------------------------------------------ |
| ASK-4992 | Medium   | HubSpot Contact Card timeout on longer queries                                                   |
| ASK-4990 | **High** | Chat claims no access to transcripts on meeting page                                             |
| ASK-4985 | **High** | Recurring meeting fails to set recording settings (Chili Publish customer)                       |
| ASK-4983 | **High** | "Create" button in Run Workflow menu opens wrong menu (Create Prompt instead of Create Workflow) |
| ASK-4982 | Medium   | Feature request: Cancel workflow run mid-execution                                               |
| ASK-4981 | Low      | "Open Chat" from workflow run list enters the run instead of staying in list view                |

**Triage note**: 3 High-priority bugs filed today. ASK-4990 (transcript access) directly impacts perceived AI quality. ASK-4985 (recording settings) affects a specific customer (Chili Publish).

---

## Customer Signals

### Quotes (#customer-quotes)

> "I'll be honest with you, Ben. I think we definitely see that for our sales reps, the interface that AskElephant offers is much more smoother, easier, and, you know, cool to use."
> -- _Customer on Motus Studio engagement_

> "We've tried doing some stuff with, like, ChatGPT and sending transcripts through there, and it is helpful. But it's just extremely time consuming. So something like AskElephant if it can present those things to us quicker, sooner, update the fields in HubSpot, like, all that stuff, I see kind of value too."
> -- _Scott Crow, call with Michael Cook_

**Internal love signal**: Veronika sent a highlight "#tylerisawesome2026" (posted by Sam Bernstein)

---

## Structured Data

```json
{
  "date": "2026-02-05",
  "deals_closed": [
    {
      "company": "Snapshot Interactive",
      "amount": "$2,400-$16,200",
      "icp_fit": "95%",
      "won_by": "Customer service model + scale capability"
    },
    {
      "company": "doTERRA Essential Oils",
      "amount": "$300",
      "icp_fit": "68%",
      "won_by": "Organic self-education, direct traffic"
    },
    {
      "company": "Motus Studio",
      "amount": "1 Seat",
      "icp_fit": null,
      "won_by": null
    }
  ],
  "sdr_meetings_booked": 2,
  "sdr_pitches": 6,
  "expansion_opportunities": 0,
  "churn_alerts": 0,
  "bugs_filed": {
    "high": 3,
    "medium": 2,
    "low": 1
  },
  "engineering_wins": ["P99 latency below 5s consistently (down from 45-50s)"],
  "customer_quotes": 2,
  "referrals": ["Matt Kelly (SVP Sales, CareStar) via Ben Harrison"]
}
```
