# PostHog Framework Improvement Plan

**Generated:** 2026-01-23  
**Based on:** Web research synthesis in `metrics-framework-best-practices.md`

---

## Summary of Recommended Improvements

Based on industry best practices research, here are the key improvements to make to AskElephant's PostHog analytics framework:

### 1. Add North Star Metric Tracking

**Current Gap:** No defined North Star metric in the framework.

**Recommendation:** Add a new `/posthog north-star` command and track:

```markdown
North Star Candidate: "Workspaces with ≥3 successful workflow runs per week"

Why:

- Captures automated value (the core "agentic" value proposition)
- Leading indicator of retention and expansion
- Within product team's control
- Differentiates from competitors (not just meeting notes)
```

**Implementation:**

- Add North Star definition to `posthog-analyst.md`
- Create dedicated insight tracking this metric
- Include in all dashboards as context

---

### 2. Implement Aha Moment Detection

**Current Gap:** Value Ladder exists but no validated "aha moment" per persona.

**Recommendation:** Add `/posthog aha-moment [persona]` mode:

```markdown
Process:

1. Create behavioral cohort of retained users (90+ days)
2. Identify common early behaviors they share
3. Test hypothesis: "Users who do X in first N days retain Y% better"
4. Validate with retention comparison
5. Document aha moment per persona
```

**Proposed Aha Moments to Test:**

| Persona   | Candidate Aha Moment                              | To Validate       |
| --------- | ------------------------------------------------- | ----------------- |
| Sales Rep | "Received briefing before 3 meetings in 7 days"   | Compare retention |
| Manager   | "Viewed team dashboard with ≥5 meetings"          | Compare retention |
| RevOps    | "1 workflow ran successfully ≥3 times in 14 days" | Compare retention |

---

### 3. Add Customer Health Score

**Current Gap:** No composite health score for workspaces.

**Recommendation:** Add `/posthog health-score` mode:

```markdown
Health Score = Weighted composite of:

- Usage Score (30%): DAU/MAU ratio for workspace
- Value Score (25%): Workflow success rate + tier reached
- Trend Score (20%): WoW usage change
- Fit Score (15%): Integrations enabled
- Technical Score (10%): Error rate for workspace

Output: Score 0-100 → Healthy / Stable / At-Risk / Critical
```

**Use Cases:**

- Success team prioritization
- Churn prediction
- Expansion identification

---

### 4. Enhance Cohort Library

**Current Gap:** Cohorts defined but not comprehensive.

**Recommendation:** Add these standard cohort templates:

**Risk Cohorts:**

- `at-risk-usage-drop`: Usage dropped >30% WoW
- `at-risk-engagement-cliff`: No login 14+ days after active
- `dormant`: Last active >30 days

**Power User Cohorts:**

- `power-user-engagement`: Top 10% by engagement score
- `champion`: High usage + invited others

**Expansion Cohorts:**

- `seat-ceiling`: >85% seat utilization
- `feature-ceiling`: Using features from higher tier
- `growth-momentum`: >20% WoW usage increase

---

### 5. Add Expansion Signals Mode

**Current Gap:** No expansion/upsell signal tracking.

**Recommendation:** Add `/posthog expansion` mode:

```markdown
Track signals:

1. Usage ceiling proximity (% of plan limits)
2. Team growth (member invites, new users)
3. Feature upgrade interest (clicks on locked features)
4. Power user emergence (individual usage >3x average)

Output: Expansion Readiness Score per workspace
```

---

### 6. Add Engagement Scoring

**Current Gap:** No weighted engagement score.

**Recommendation:** Add engagement score calculation:

```markdown
Event Weights:

- workflows:run_completed (success): 100 pts
- hubspot_agent:contact_synced: 80 pts
- chat:conversation_created: 50 pts
- meeting:processed: 40 pts
- search:query_executed: 20 pts
- login: 5 pts

Engagement Score = Sum(events × weights) / Max possible
```

**Use:** Power user identification, health score input

---

### 7. Improve Churn Prediction

**Current Gap:** Basic alerts exist but no churn prediction model.

**Recommendation:** Add `/posthog churn-risk` mode:

```markdown
Churn Risk Signals:

- Login frequency drop >50%: +30 risk points
- Core feature unused 7+ days: +25 risk points
- Session duration <50% baseline: +20 risk points
- Support ticket surge: +15 risk points
- NPS detractor: +10 risk points

Risk Score 0-100 → Low / Medium / High / Critical
```

---

### 8. Add JTBD Analytics

**Current Gap:** No job-completion tracking.

**Recommendation:** Frame analytics around jobs, not just features:

| Job                   | Completion Event          | Success Metric             |
| --------------------- | ------------------------- | -------------------------- |
| Prep for meetings     | `briefing:viewed`         | Viewed >30s before meeting |
| Follow up after calls | `email:sent`              | Sent within 24hr           |
| Automate busywork     | `workflows:run_completed` | Success rate >90%          |
| Track deals           | `crm:update_synced`       | Update within 1hr          |

---

## Implementation Priority

### P1: High Impact, Low Effort (This Month)

1. **Define North Star Metric** - Add to all dashboards
2. **Create standard cohort library** - Build in PostHog UI
3. **Document aha moment hypothesis** - Per persona

### P2: High Impact, Medium Effort (Next Month)

4. **Build Health Score v1** - Rule-based, manual calculation
5. **Add expansion signals** - Track ceiling proximity
6. **Implement engagement scoring** - Weighted event points

### P3: Foundation for Future (Ongoing)

7. **Validate aha moments** - Retention analysis per cohort
8. **Churn prediction model** - Build and tune
9. **JTBD analytics** - Frame metrics around jobs

---

## Files to Update

| File                                                                | Change                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `.cursor/agents/posthog-analyst.md`                                 | Add new modes (north-star, aha-moment, health-score, expansion, churn-risk) |
| `pm-workspace-docs/status/posthog/analysis/posthog-cohorts.md`      | Expand cohort library                                                       |
| `pm-workspace-docs/status/posthog/analysis/posthog-health-score.md` | NEW - Health score definitions                                              |
| `pm-workspace-docs/status/posthog/analysis/posthog-north-star.md`   | NEW - North Star tracking                                                   |
| `.cursor/commands/posthog.md`                                       | Document new modes                                                          |

---

## Next Steps

1. Review this improvement plan
2. Decide on North Star Metric definition
3. Prioritize which improvements to implement first
4. Update posthog-analyst subagent with new modes
5. Build health score framework
6. Create expansion signal tracking

---

_Based on research in `metrics-framework-best-practices.md`_
