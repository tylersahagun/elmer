# PRD: LLM Message Analysis & Per-Customer Metrics

> **Status:** Draft - Pending Research Review  
> **Owner:** Tyler Sahagun  
> **Created:** 2026-01-10

---

## Problem Statement

CSMs and internal teams lack visibility into per-customer AI behavior. When customers report issues with AskElephant's AI responses or automations, we cannot:

1. See what questions customers are asking
2. Identify failure patterns by customer
3. Distinguish manual queries from automated workflow queries
4. Understand trending topics or unmet needs at scale

This reactive posture means we discover issues from customer complaints rather than proactive monitoring.

---

## Target Persona

**Primary:** CSM
- Needs per-customer AI health view
- Wants proactive issue identification
- Key workflow: Monitoring customer health, renewal prep

**Secondary:** Product, Engineering
- Needs trend analysis for roadmap planning
- Wants to identify gaps in AI capabilities

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to identify AI issues | Customer reports (reactive) | Same-day detection (proactive) |
| CSM AI visibility | None | Per-customer dashboard |
| Topic coverage tracking | None | Known taxonomy with gap identification |

---

## Proposed Solution

### Phase 1: Event Completeness + Basic Dashboard (1 sprint)

**Events to add:**
- `agents:run_completed`
- `agents:run_failed`
- `is_manual` property on all chat events

**Dashboard:**
- Questions per workspace (volume)
- Manual vs automated split
- Failure rate by workspace
- Tool usage breakdown

### Phase 2: Topic Classification (1-2 sprints)

**Classifier:**
- Lightweight LLM or rule-based classifier
- 10-15 topic taxonomy

**Dashboard additions:**
- Trending topics by workspace
- Topic distribution across customer base
- "What are customers asking about?"

### Phase 3: Semantic Clustering (Future)

- Store embeddings in pgvector
- Nightly clustering job
- "Emerging patterns" discovery

---

## Out of Scope

- User-facing analytics (customer self-service)
- Real-time alerting (future consideration)
- Response quality scoring (Phase 2/3)
- Historical backfill of existing data

---

## Open Questions

1. Privacy: Can we store question text or only anonymized topics?
2. Taxonomy: What are the 10-15 topic categories?
3. Delivery: Dashboard polling vs Slack alerts?

---

## Dependencies

- PostHog integration (exists)
- LangSmith integration (exists)
- Agent execution context (exists)

---

## Timeline

| Phase | Scope | Duration |
|-------|-------|----------|
| Phase 1 | Events + Basic Dashboard | 1 sprint |
| Phase 2 | Topic Classification | 1-2 sprints |
| Phase 3 | Semantic Clustering | 2-3 sprints (future) |

---

## References

- Research: `.elmer/initiatives/llm-message-analysis-user-metrics/research.md`
- Decisions: `.elmer/initiatives/llm-message-analysis-user-metrics/decisions.md`

