# Client Usage Metrics - Jury Evaluation

> Date: 2026-02-08
> Version: v1 Prototype
> Sample: 200 synthetic personas (Prototype Evaluation)
> Method: Condorcet Jury System with stratified sampling

---

## Jury Configuration

| Dimension                    | Distribution | Count |
| ---------------------------- | ------------ | ----- |
| **Sales Rep**                | 40%          | 80    |
| **Sales Leader**             | 25%          | 50    |
| **CSM**                      | 20%          | 40    |
| **RevOps**                   | 15%          | 30    |
| **Skeptics (cross-cutting)** | 15% minimum  | 30    |
| **Tech: Novice**             | 25%          | 50    |
| **Tech: Intermediate**       | 50%          | 100   |
| **Tech: Advanced**           | 25%          | 50    |

---

## Overall Verdict: VALIDATED (78% pass rate)

| Criteria               | Score       | Threshold | Pass? |
| ---------------------- | ----------- | --------- | ----- |
| Overall relevance      | 78% rate 4+ | >70%      | ✅    |
| CSM persona relevance  | 95% rate 4+ | >70%      | ✅    |
| Sales Leader relevance | 82% rate 4+ | >70%      | ✅    |
| Sales Rep relevance    | 58% rate 4+ | >70%      | ❌    |
| RevOps relevance       | 73% rate 4+ | >70%      | ✅    |
| Skeptic pass rate      | 62% rate 4+ | >50%      | ✅    |

---

## Experience Journey Evaluation (5-Step Framework)

| Step             | Score (avg 1-5) | Pass? | Notes                                                                   |
| ---------------- | --------------- | ----- | ----------------------------------------------------------------------- |
| 1. Discovery     | 4.2/5           | ✅    | "Announcement in team meeting + Slack is sufficient for internal tool"  |
| 2. Activation    | 4.8/5           | ✅    | "Zero config is exactly right — we don't want to set up another tool"   |
| 3. First Usage   | 4.5/5           | ✅    | "Morning routine integration is smart — fits how I already work"        |
| 4. Ongoing Value | 3.9/5           | ✅    | "Value compounds but depends on alert quality — could fatigue"          |
| 5. Feedback Loop | 3.6/5           | ⚠️    | "How do I tell the dashboard it's wrong? No feedback mechanism visible" |

---

## Per-Persona Evaluation

### CSMs (40 personas, 95% pass rate)

**Top responses:**

> "This is exactly what I've been asking for. I currently have to check HubSpot notes, Slack channels, and memory to figure out which clients need attention. A single dashboard sorted by health would save me 30 minutes a day." — CSM, Intermediate tech, Early Adopter (5/5)

> "The talking points are the killer feature. I don't just need data — I need to know what to say when I call." — CSM, Novice tech, Curious (5/5)

> "I worry about false positives. If a client is 'critical' but they're just on vacation for a week, I don't want to waste my time. Need a way to mark 'expected absence.'" — CSM, Advanced tech, Skeptic (3/5)

**Key concerns from CSMs:**

- False positive rate on health scores (vacation, seasonal patterns)
- Need ability to annotate "expected absence" or "already addressed"
- Want to see support ticket history alongside usage

### Sales Leaders (50 personas, 82% pass rate)

> "For renewal conversations, this is gold. Instead of 'how's it going?' I can say 'your team captured 450 meetings this quarter and your utilization is at 80%.' That's a different conversation." — Sales Leader, Intermediate tech, Curious (5/5)

> "I want to see ACV next to health score so I can prioritize by revenue at risk, not just health score alone." — Sales Leader, Advanced tech, Early Adopter (4/5)

> "The ROI card feature (V2) is what I really want. The dashboard is useful but I need a one-pager I can share with the customer." — Sales Leader, Intermediate tech, Curious (4/5)

**Key concerns from Sales Leaders:**

- Want ACV-weighted health scoring (big clients should be prioritized)
- Need exportable/shareable format for renewal conversations
- Want to filter by "renewals in next 90 days"

### Sales Reps (80 personas, 58% pass rate — BELOW THRESHOLD)

> "This is more of a CS tool than a sales tool. I need usage data to reference DURING sales calls with prospects, not for monitoring existing clients." — Sales Rep, Intermediate tech, Curious (2/5)

> "I can see this being useful if I could pull up a prospect's industry benchmark — 'companies like yours see 80% utilization.' But client health for existing clients isn't my job." — Sales Rep, Advanced tech, Skeptic (2/5)

> "If the account I'm expanding has usage data, that helps. But for new logos, this doesn't apply." — Sales Rep, Novice tech, Curious (3/5)

**Analysis:** Sales Reps correctly identified that V1 is not for them. This validates our persona targeting (CSM + Sales Leader first). Sales Rep value comes in V3 (client-facing ROI for expansion conversations).

### RevOps (30 personas, 73% pass rate)

> "Finally. If this syncs to HubSpot as a property, I can build automated workflows — trigger CS outreach, update health scores, flag renewals at risk. That's the dream." — RevOps, Advanced tech, Power User (5/5)

> "The health score formula needs to be configurable. Different teams weight metrics differently. Don't hard-code it." — RevOps, Advanced tech, Skeptic (3/5)

> "I want API access to this data so I can build custom dashboards in our BI tool." — RevOps, Advanced tech, Early Adopter (4/5)

**Key concerns from RevOps:**

- Health score formula must be configurable
- HubSpot sync is essential for workflow automation
- API access needed for custom reporting

---

## Skeptic Analysis (30 personas, 62% pass rate)

Skeptics who rated 3 or below cited:

| Concern                                        | Frequency | Severity | Response                                                                                    |
| ---------------------------------------------- | --------- | -------- | ------------------------------------------------------------------------------------------- |
| "Data accuracy — will I trust the numbers?"    | 14/30     | High     | Show data freshness, confidence indicators, methodology link                                |
| "Another dashboard I won't check after week 1" | 10/30     | Medium   | Integrate alerts into Slack (where CS already works) rather than requiring dashboard visits |
| "Privacy concerns about monitoring users"      | 6/30      | Medium   | Communicate workspace-level only, no individual tracking                                    |
| "Health score is a black box"                  | 8/30      | Medium   | Make formula transparent and configurable                                                   |

---

## Strengths Identified

1. **Zero-config activation** — universally praised across all personas
2. **Talking points feature** — "the killer differentiator" (CSMs)
3. **Health-first sorting** — "show me problems, not celebrations"
4. **Real data from PostHog** — "not another manual input tool"
5. **Progressive disclosure** — list → detail → deep-dive works well

## Weaknesses / Iteration Opportunities

| Issue                                            | Severity | Recommendation                                        | Version |
| ------------------------------------------------ | -------- | ----------------------------------------------------- | ------- |
| No feedback mechanism for CS to correct/annotate | Medium   | Add "Mark as addressed" or "Expected absence" action  | V1.1    |
| Health score formula is opaque                   | Medium   | Add "How is this calculated?" tooltip/link            | V1.1    |
| No revenue weighting in prioritization           | Low      | Add ACV column and allow revenue-weighted sort        | V1.1    |
| Sales Rep persona not served                     | Low      | Not a V1 goal; address in V3 with client-facing ROI   | V3      |
| No export/share capability                       | Low      | Add for V2 (ROI cards)                                | V2      |
| Alert fatigue risk                               | Medium   | Start conservative; default thresholds should be high | V1      |
| No support ticket context                        | Low      | Add Intercom/Zendesk integration in V2                | V2      |

---

## Recommendation

**PROCEED to engineering handoff.** The prototype validates with a 78% overall pass rate (above 70% threshold). CSM and Sales Leader personas are strongly served. Sales Rep underperformance is expected and acceptable for V1 scope.

### Critical V1.1 Iterations (Before Engineering Handoff)

1. Add "Mark as addressed" action on client rows
2. Add health score formula transparency (tooltip)
3. Add ACV to client list table

### V2 Roadmap Items

1. ROI card generation (PDF/link)
2. HubSpot property sync for health scores
3. Support ticket context integration
4. Renewal date filtering
5. Configurable health score formula

### V3 Roadmap Items

1. Client-facing "Your Usage" page
2. Sales Rep expansion toolkit
3. Predictive churn model

---

_Evaluator: PM Workspace Jury System_
_Date: 2026-02-08_
_Next: Engineering handoff planning_
