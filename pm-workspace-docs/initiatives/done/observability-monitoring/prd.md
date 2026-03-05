# Automated Metrics & Observability System - PRD

## Overview

Build an automated system that ensures every new feature in AskElephant launches with comprehensive metrics coverage. This includes standardized PostHog events for usage tracking, LangSmith projects for AI quality monitoring, automated evaluation pipelines, and unified dashboards that provide real-time visibility into feature health, AI performance, and cost attribution.

## Problem Statement

**Today's pain:** When new AI features launch, the team can't quickly answer basic questions like:
- How many users are using this feature?
- Is the AI response quality good?
- What's our cost per feature/workspace/model?
- Are there regressions from prompt or model changes?

**Evidence:**
- Product team lacks visibility into AI chat feature adoption and quality
- Engineering manually adds events inconsistently, leading to gaps
- No automated evaluation means regressions are discovered reactively
- Cost attribution is opaque—can't identify high-cost workspaces or features

## Target Personas

- [x] **Engineering Team**: Need automated instrumentation, less boilerplate
- [x] **Product Team (Tyler)**: Need unified dashboards, feature health metrics
- [x] **Data Team**: Need standardized event schemas, clean data pipelines
- [x] **Leadership**: Need cost visibility, ROI metrics per feature

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| % of AI features with LangSmith tracing | ~50% | 100% | 8 weeks |
| Time to visibility for new features | Days/Never | < 1 hour | 12 weeks |
| Automated eval coverage for AI features | 0% | 80% | 12 weeks |
| Mean time to detect AI regression | Unknown (reactive) | < 24 hours | 12 weeks |
| Event naming consistency | Mixed | 100% standardized | 4 weeks |

## User Stories

### Epic: Feature Registry & Auto-Instrumentation

**As a** product engineer,
**I want to** register my new feature in a manifest and have all metrics automatically configured,
**So that** I don't have to manually implement events, dashboards, and tracing.

#### Acceptance Criteria
- [ ] Feature registry schema defined in TypeScript
- [ ] TypeScript decorator `withFeatureMetrics()` auto-emits start/complete/fail events
- [ ] Python decorator `@with_feature_metrics()` for functions_py
- [ ] CLI tool to onboard new features: creates LangSmith projects, suggests PostHog dashboard

---

### Epic: Unified AI Quality Dashboard

**As a** product manager,
**I want to** see a single dashboard showing AI feature health across quality, latency, and cost,
**So that** I can quickly identify underperforming features and prioritize improvements.

#### Acceptance Criteria
- [ ] PostHog dashboard template with: usage volume, latency P50/P95, error rate, cost
- [ ] LangSmith metrics synced to PostHog for unified view
- [ ] Per-feature breakdown (global chat, agents, workflows, etc.)
- [ ] Alerting when thresholds exceeded

---

### Epic: Automated LLM Evaluation Pipeline

**As an** AI/ML engineer,
**I want** production traces automatically sampled and evaluated daily,
**So that** I catch quality regressions before users report them.

#### Acceptance Criteria
- [ ] LangSmith rules auto-sample traces into evaluation datasets
- [ ] Scheduled Cloud Function runs evaluators daily (relevance, coherence, faithfulness)
- [ ] Evaluation results sent to PostHog for tracking over time
- [ ] Slack/email alert when evaluation scores drop below threshold

---

### Epic: Cost Attribution & Budgeting

**As a** finance/operations stakeholder,
**I want to** see LLM costs broken down by feature, workspace, and model,
**So that** I can budget appropriately and identify cost optimization opportunities.

#### Acceptance Criteria
- [ ] All LLM calls tagged with `feature` property (already partially done)
- [ ] Daily cost report aggregated from LangSmith/PostHog
- [ ] Top 10 cost drivers by workspace visible
- [ ] Model cost comparison available

## Scope

### In Scope
- Feature registry schema and initial population
- Auto-instrumentation decorators (TS + Python)
- CLI for feature onboarding
- LangSmith→PostHog metrics sync
- Daily automated evaluation pipeline
- PostHog dashboard templates
- Alerting integration (Slack)
- Cost attribution reporting

### Out of Scope
- Real-time quality gating (blocking low-quality responses)
- User feedback loop integration (thumbs up/down → eval datasets)
- A/B testing infrastructure for prompts
- Custom ML model training/fine-tuning
- Third-party observability integrations (Datadog, etc.)

### Future Considerations
- Prompt version management and rollback
- User-facing AI quality indicators
- Predictive cost forecasting
- Cross-feature attribution (tracking feature chains)

## Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Add feature to registry                                     │
│  2. Run `npx tsx scripts/onboard-feature <id>`                  │
│  3. Wrap functions with `withFeatureMetrics()`                  │
│  4. Deploy → Metrics flow automatically                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME DATA FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Feature Code] ─────┬────────────────────────────────────────▶ │
│                      │                                          │
│                      ├─▶ PostHog (usage events, costs)          │
│                      │                                          │
│                      └─▶ LangSmith (traces, evals)              │
│                              │                                  │
│                              ▼                                  │
│                      [Hourly Sync Job]                          │
│                              │                                  │
│                              ▼                                  │
│                      PostHog (unified metrics)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Wireframes/Mockups

**PostHog Dashboard Template Layout:**
- Row 1: Total AI Requests | Error Rate | Avg Latency | Daily Cost
- Row 2: Requests by Feature (bar chart) | Latency P95 by Feature
- Row 3: Cost by Model (pie) | Cost Trend (line)
- Row 4: Evaluation Scores Over Time (line chart)

### Prototype
- To be created in `prototypes/src/components/MetricsDashboard/`

## Technical Considerations

### Existing Infrastructure Leverage
- ✅ PostHog already integrated (web, mobile, backend)
- ✅ LangSmith already integrated via `wrapAISDK()` and `@traceable`
- ✅ OpenTelemetry exporting to Google Cloud
- ✅ `captureEvent()` helper in `functions/src/contexts/infra/analytics/`

### New Components Needed
1. **Feature Registry**: New TypeScript module
2. **Decorators**: New utilities in both TS and Python
3. **Sync Job**: Cloud Function (scheduled, hourly/daily)
4. **Onboarding CLI**: Node.js script using LangSmith + PostHog APIs
5. **Evaluation Cloud Function**: Scheduled, using LangSmith SDK

### API Dependencies
- LangSmith REST API (projects, datasets, runs, evaluations)
- PostHog API (dashboards, insights, cohorts)
- Firebase Scheduler for Cloud Functions

### Performance Considerations
- LangSmith traces are already async, no latency impact
- PostHog events are batched, minimal overhead
- Evaluation jobs run off-peak (6am daily)
- Sync jobs sample, don't process all data

## Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| LangSmith API access | External | LangChain | ✅ Already configured |
| PostHog API access | External | PostHog | ✅ Already configured |
| Firebase Scheduler | Infrastructure | Eng | ✅ Available |
| Updated `@posthog/ai` package | External | PostHog | ✅ In use |
| LangSmith `langsmith` SDK | External | LangChain | ✅ In use |

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| LangSmith API rate limits | Medium | Low | Batch operations, exponential backoff |
| PostHog data volume costs | Medium | Medium | Sample evaluations, use rollups |
| Developer adoption friction | High | Medium | Make registry easy, provide CLI tooling |
| Sync job failures | Low | Low | Idempotent design, alerting on failures |
| Schema migration for registry | Medium | Medium | Version schema, backwards compat |

## Timeline

### Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Research Complete | 2026-01-08 | ✅ Done |
| PRD Approved | 2026-01-10 | ⬜ Pending |
| Phase 1: Feature Registry | 2026-01-24 | ⬜ Not Started |
| Phase 2: Auto-Instrumentation | 2026-02-07 | ⬜ Not Started |
| Phase 3: Dashboard Automation | 2026-02-21 | ⬜ Not Started |
| Phase 4: Evaluation Pipeline | 2026-03-14 | ⬜ Not Started |
| Phase 5: Unified Observability | 2026-03-28 | ⬜ Not Started |
| Phase 6: Maintenance Systems | 2026-04-04 | ⬜ Not Started |

## Open Questions

- [ ] What percentage of traces should auto-populate eval datasets? (Proposed: 10-20%)
- [ ] Who owns the alerting escalation for AI degradation? (Proposed: AI/Platform team)
- [ ] How long to retain LangSmith traces vs. PostHog events? (Propose: 30d traces, 2y events)
- [ ] Should we expose any quality metrics to end users (confidence scores)?
- [ ] How to handle cost attribution when fallback models are used?

---

*Last updated: 2026-01-08*
*Owner: Tyler Sahagun*

