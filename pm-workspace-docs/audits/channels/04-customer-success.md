# Channel Audit: Customer Success

**Audit Date:** January 24, 2026  
**Time Range:** Last 90 days (Oct 26, 2025 - Jan 24, 2026)  
**Channels Audited:** 11

---

## #customer-feedback

| Metric | Value |
|--------|-------|
| **Members** | 21 |
| **Messages (90 days)** | 1,535 |
| **Activity Level** | Extremely High (17+ msgs/day) |
| **Stated Purpose** | None documented |

### Actual Usage

- **Automated Bot Posts** (99%): AskElephant bot extracting customer feedback from calls
- **Discussion** (1%): Occasional human comments on feedback

### Key Pattern
Almost entirely automated. The AskElephant bot extracts feedback from customer calls and posts it here. Very high volume but low human engagement.

### Recommendation
**Add Purpose Statement + Review Process** - Suggest: "Automated customer feedback extraction from calls. Review weekly for patterns."

Consider adding a synthesis/summary process to surface actionable insights from high volume.

### Routing Guidance
Use #customer-feedback for:
- Automated feedback posts
- Commenting on feedback patterns
- Flagging urgent feedback

NOT for:
- Quotable testimonials (use #customer-quotes)
- Churn signals (use #churn-alert)

---

## #customer-quotes

| Metric | Value |
|--------|-------|
| **Members** | 37 |
| **Messages (90 days)** | 200 |
| **Activity Level** | Moderate |
| **Stated Purpose** | None documented |

### Actual Usage

- **Automated Quote Posts** (70%): AskElephant bot extracting quotes
- **Manual Shoutouts** (20%): Team sharing customer wins
- **Discussion** (10%): Comments, questions about quotes

### Key Pattern
Mix of automated and manual posts. Format improvements noted by team ("loving these new quotes").

### Recommendation
**Add Purpose Statement** - Suggest: "Quotable customer testimonials - automated extraction + manual sharing. Use for marketing, case studies, and team motivation."

### Routing Guidance
Use #customer-quotes for:
- Notable customer quotes
- Testimonials for marketing
- Customer success stories

NOT for:
- General feedback (use #customer-feedback)
- Bug reports from customers (use #product-issues)

---

## #churn-alert

| Metric | Value |
|--------|-------|
| **Members** | 33 |
| **Messages (90 days)** | High |
| **Activity Level** | High |
| **Stated Purpose** | None documented |

### Actual Usage

- **Churn Risk Signals** (80%): Automated alerts + manual reports
- **Intervention Discussion** (20%): Save strategies

### Recommendation
**Add Purpose Statement** - Suggest: "Churn risk alerts and intervention tracking. High priority - respond quickly."

---

## #team-csm

| Metric | Value |
|--------|-------|
| **Members** | 19 |
| **Messages (90 days)** | Moderate-High |
| **Activity Level** | Moderate-High |
| **Stated Purpose** | None documented |

### Actual Usage

- **Team Coordination** (40%): Account coverage, handoffs
- **Customer Issues** (30%): Escalating customer problems
- **Process** (20%): CSM workflows, tools
- **Celebrations** (10%): Customer wins

### Recommendation
**Add Purpose Statement** - Suggest: "Customer Success team coordination, account management, and escalations."

---

## #customer-message-queue

| Metric | Value |
|--------|-------|
| **Members** | 19 |
| **Messages (90 days)** | Moderate |
| **Activity Level** | Moderate |
| **Stated Purpose** | None documented |

### Actual Usage

- **Message Queue** (100%): Customer messages awaiting response

### Recommendation
**Add Purpose Statement** - Suggest: "Customer messages requiring response. Claim and respond within SLA."

---

## #cs-rep-scorecards

| Metric | Value |
|--------|-------|
| **Members** | 7 |
| **Messages (90 days)** | Low |
| **Activity Level** | Low |
| **Stated Purpose** | None documented |

### Actual Usage

- **Rep Performance** (100%): CSM scorecards and metrics

---

## #cs-team-wins

| Metric | Value |
|--------|-------|
| **Members** | 5 |
| **Messages (90 days)** | Low |
| **Activity Level** | Low |
| **Stated Purpose** | None documented |

### Actual Usage

- **Celebrations** (100%): CSM team wins

### Recommendation
**Consider Consolidating** - Could merge celebration posts into #team-csm.

---

## #case-studies

| Metric | Value |
|--------|-------|
| **Members** | 17 |
| **Messages (90 days)** | Low |
| **Activity Level** | Low |
| **Stated Purpose** | None documented |

### Actual Usage

- **Case Study Development** (100%): Customer stories for marketing

### Recommendation
**Add Purpose Statement** - Suggest: "Customer case study development and coordination."

---

## #macro-insights

| Metric | Value |
|--------|-------|
| **Members** | 9 |
| **Messages (90 days)** | Low |
| **Activity Level** | Low |
| **Stated Purpose** | Aggregating macro-level needs from customers to drive engineering and product visibility |

### Actual Usage

- **Strategic Insights** (100%): Pattern recognition across customers

### Recommendation
**Keep As-Is** - Clear purpose, low volume is appropriate for strategic insights.

---

## #clozeloop-scorecard

| Metric | Value |
|--------|-------|
| **Members** | 7 |
| **Messages (90 days)** | Low |
| **Activity Level** | Low |
| **Stated Purpose** | None documented |

### Actual Usage

- **Single Customer Tracking** (100%): ClozeLoop engagement

### Recommendation
**Consider Archiving** - Customer-specific channels should be archived when no longer active.

---

## Summary: Customer Success Channels

| Channel | Activity | Purpose Clarity | Action Needed |
|---------|----------|-----------------|---------------|
| #customer-feedback | Very High (automated) | Missing | Add purpose + synthesis process |
| #customer-quotes | Moderate | Missing | Add purpose statement |
| #churn-alert | High | Missing | Add purpose statement |
| #team-csm | Moderate-High | Missing | Add purpose statement |
| #customer-message-queue | Moderate | Missing | Add purpose statement |
| #cs-rep-scorecards | Low | Missing | Add purpose statement |
| #cs-team-wins | Low | Missing | Consider consolidating |
| #case-studies | Low | Missing | Add purpose statement |
| #macro-insights | Low | Clear | Keep as-is |
| #clozeloop-scorecard | Low | Missing | Consider archiving |

### Communication Map

```
CUSTOMER SUCCESS ROUTING

Customer at churn risk?
├─ Yes → #churn-alert (urgent)
└─ No → Continue

Great customer quote?
├─ Yes → #customer-quotes
└─ No → Continue

Customer message needs response?
├─ Yes → #customer-message-queue
└─ No → Continue

CSM team coordination?
├─ Yes → #team-csm
└─ No → Continue

Strategic customer insight (pattern)?
├─ Yes → #macro-insights
└─ No → Continue

Case study candidate?
├─ Yes → #case-studies
└─ No → #customer-feedback (general)
```
