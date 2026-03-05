# GA Launch Checklist: Project Babar — May 4, 2026

**Week**: 10 (Apr 30 – May 4)
**Owner**: Full Team
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: A sequential, gate-checked checklist for the GA launch. Nothing ships until each gate is confirmed.

---

## Gate 1: Pre-Launch Verification (Apr 30 – May 1)

All items must be TRUE before any feature flags are touched.

### Product Gate
- [ ] Beta advancement criteria from `week9-beta-runbook.md` all confirmed
- [ ] Final PostHog baselines captured and documented
- [ ] Tyler and Sam Ho sign off on PQL conversion path being measurable
- [ ] Release communication drafted and reviewed (blog post, in-app banner, email — Robert owns)

### Design Gate
- [ ] Skylar final sign-off on production UI (80% polish standard confirmed)
- [ ] All empty/degraded states functional in staging
- [ ] No visual regressions introduced in Week 9 fixes

### Engineering Gate
- [ ] Zero P0 bugs open in staging
- [ ] All PostHog events verified firing correctly on staging
- [ ] Load test results documented and passed (`engineering-spec.md` Week 8 targets)
- [ ] Gmail/Slack token refresh working for 100% of beta users
- [ ] Rollback procedure documented and tested (feature flags can be re-enabled in < 5 minutes)
- [ ] Database migrations applied and verified in staging

---

## Gate 2: Feature Flag Removal (May 1 – May 2)

### Deployment Sequence

1. Coordinate deploy window: **Tuesday or Wednesday morning, 9 AM PT** (low-traffic)
2. Palmer removes `project_babar_beta` feature flag from the flag service
3. Verifies `/chief-of-staff` route loads correctly for 5 production users
4. Tyler manually checks feed rendering on his own account
5. If any issue: re-enable flag immediately, post to `#eng-incidents`, investigate before retry

---

## Gate 3: 72-Hour Post-Launch Monitoring (May 2 – May 4)

### Live Monitors (Palmer sets up alerts before flag removal)

| Signal | Alert Threshold | Action |
|---|---|---|
| Ingestion worker queue depth | > 1,000 unprocessed events per user | Palmer notified immediately |
| `/api/v1/agent/feed` error rate | > 1% | Palmer investigates; if > 5%, flag re-enabled |
| Gmail/Slack token refresh failures | > 5% of connected users | Palmer notified; if > 15%, disable ingestion for affected users |
| LLM synthesis errors (Impact Reports) | > 10% failure rate | Disable synthesis, fall back to transcript-only view |
| PostHog `cos_session_started` day-1 | < 20 users (sanity check) | Verify feature flag correctly removed |

### Day-1 Success Signals (Check at EOD May 2)
- `cos_session_started` fired for > X% of active users
- `cos_integration_connected` fired for > Y new users
- `cos_feed_item_reviewed` fired for > Z% of users who loaded the page
- Zero reports of cross-user data leakage

### Day-3 Success Signals (Check at EOD May 4)
- Draft approval rate > 50%
- Action completion rate > 40%
- Alert fatigue indicator < 30%
- Tyler + Sam Ho confirm PQL baseline measurement is running

---

## Hotfix Protocol

| Severity | Definition | Response |
|---|---|---|
| P0 | Feed does not load for > 5% of users; data leak detected; drafts sending without approval | Immediate flag re-enable + Palmer on-call |
| P1 | Impact Reports not generating within 30 min of meeting end | Disable synthesis worker; serve transcript-only fallback |
| P2 | Specific integration (e.g., Slack) broken for > 20% of connected users | Disable that integration's ingestion; notify affected users |
| P3 | Visual or copy bug; no functional impact | Queue for next deploy; no emergency response |

---

## Release Communication Checklist (Robert Henderson)

- [ ] Blog post published on release day (May 2)
- [ ] In-app announcement banner live for all users
- [ ] Email to active users sent (Tyler approves copy)
- [ ] Slack post to `#product-updates` with demo screenshot or Loom

---

## Post-Launch: 30-Day Review (Scheduled Jun 2)

Tyler schedules a 30-day review meeting for Jun 2 with the following agenda:
1. PQL count toward 100 PQL goal
2. Daily engagement rate trend (Week 1 → Week 4 post-launch)
3. Top 3 user feedback themes from the beta Slack channel
4. Decision: Is the Agent experience strong enough to add team features, or does single-player need more iteration?

---

_Last updated: 2026-02-26_
_Owner: Tyler Sahagun_
