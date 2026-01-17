# Research Summary: LLM Message Analysis & Per-Customer Metrics

**Date:** 2026-01-10  
**Participants:** Tyler Sahagun (PM), AI Copilot (Technical Analysis)  
**Type:** Technical Discovery / Infrastructure Analysis

---

## TL;DR

AskElephant needs visibility into LLM behavior at a per-customer level—tracking what questions users ask, which fail, and distinguishing manual queries from automated workflows. **The infrastructure already supports most of this** (PostHog groups by workspace, LangSmith traces include metadata, manual vs. automated is tracked). The gap is primarily in **event completeness, topic categorization, and dashboard creation**—not fundamental architecture. This strongly aligns with the **Trend Visibility** strategic pillar.

---

## Strategic Alignment

**Score:** Strong ✅

### Aligned:

- ✅ **Strong outcome chain:** Per-customer AI visibility → CSMs identify issues proactively → faster resolution → retention → revenue outcome
- ✅ **Trust considered:** Transparency into what AI does builds trust; surfacing failures prevents silent degradation
- ✅ **Clear persona:** CSM persona explicitly called out (monitoring customer health via AI behavior)
- ✅ **Human empowerment:** Gives CSMs tools to be proactive rather than reactive
- ✅ **Supports 2026 initiative:** Workflow Builder / AI Assistant Tool (observability for automation)

### Concerns:

- ⚠️ **Scope creep risk:** Could expand from "CSM visibility tool" to "general analytics platform"—need to keep focused
- ⚠️ **Privacy implications:** Question content analysis needs PII considerations before implementation
- ⚠️ **Topic classification accuracy:** LLM-based classifiers can drift; need evaluation framework

---

## Key Findings

### Current Infrastructure State

| Component | Status | Per-Customer Ready? |
|-----------|--------|---------------------|
| **PostHog** | ✅ Integrated | ✅ Yes - groups by `workspaceId` |
| **LangSmith** | ✅ Integrated | ⚠️ Partial - metadata exists but no dashboards |
| **OpenTelemetry** | ✅ Integrated | ⚠️ Infra-focused, not customer-focused |
| **Manual vs Automated** | ✅ Tracked | ✅ Yes - `Agents.WorkflowAgent` flag |
| **Question topics** | ❌ Not tracked | ❌ Needs classification layer |
| **Agent success/failure** | ⚠️ Partial | ⚠️ Only `run_started`, no completion events |
| **Tool call outcomes** | ⚠️ Partial | ⚠️ In LangSmith traces, not aggregated |

### Data Already Available

```typescript
// Every LLM call already includes:
{
  viewerId: userId | 'WorkflowAgent',  // Manual vs automated
  workspaceId: 'wrks_...',             // Per-customer segmentation
  feature: 'agent-node',               // What type of call
  threadId: '...',                     // Conversation continuity
  chatId: '...',                       // Specific chat context
}
```

### Events That Exist

- `agents:run_started` ✅
- `workflows:run_started/completed/failed` ✅
- `pipelines:run_started/completed/failed` ✅
- `$ai_embedding` (PostHog) ✅

### Events That Are Missing

- `agents:run_completed` ❌
- `agents:run_failed` ❌
- `agents:tool_called` ❌
- `agents:tool_failed` ❌
- `chat:question_asked` (with topic) ❌
- `chat:question_answered` (with quality signal) ❌

---

## User Problems

### 1. Lack of Clarity into Customer AI Usage

> "One of the most common issues that we have right now is just a lack of clarity into what customers are actually asking and the behavior of the language model itself."

- **Severity:** High
- **Frequency:** Ongoing operational gap
- **Persona:** CSM, RevOps, Engineering

### 2. No Per-Customer AI Health View

> "CSMs are able to identify more information about those things based on the current infrastructure that we have"

- **Severity:** High  
- **Frequency:** Every customer interaction is blind
- **Persona:** CSM

### 3. Manual vs Automated Query Confusion

> "I want to be able to know which queries are being manually processed and others that are automations that are generated from workflows."

- **Severity:** Medium
- **Frequency:** Common when debugging customer issues
- **Persona:** CSM, Engineering

### 4. No Topic Trend Analysis

> "I want to be able to see trends of what people are asking...the most commonly asked questions categorized across many systems"

- **Severity:** High
- **Frequency:** Strategic planning gap
- **Persona:** Product, CSM, Leadership

### 5. Scale of Data Challenge

> "We have probably tens of thousands of queries going across every day, and they're not always going to have the same exact words."

- **Severity:** High
- **Frequency:** Continuous
- **Persona:** Engineering, Product

---

## Feature Ideas

### 1. Complete Event Lifecycle Tracking

- **Idea:** Add `agents:run_completed/failed` and `tool_called/failed` events
- **Outcome chain:** 
  - Complete events → CSMs see failure patterns → identify at-risk customers → proactive outreach → retention
- **Effort:** 3-5 days backend

### 2. PostHog CSM Dashboard

- **Idea:** Build per-workspace dashboard showing AI health metrics
- **Outcome chain:**
  - Dashboard → CSMs monitor customer AI health → spot issues before escalation → proactive support → NPS/retention
- **Effort:** 1 week

### 3. Topic Classification Pipeline

- **Idea:** Add lightweight LLM classifier for question categorization on save
- **Outcome chain:**
  - Topic tagging → product sees demand patterns → build features users actually need → expansion
- **Effort:** 1-2 sprints

### 4. Semantic Clustering System

- **Idea:** Use existing embedding infrastructure + pgvector for question similarity
- **Outcome chain:**
  - Clustering → discover unanswered question patterns → improve AI responses → customer satisfaction
- **Effort:** 2-3 sprints

---

## Tool Comparison

| Use Case | Best Tool | Rationale |
|----------|-----------|-----------|
| Per-customer dashboards | **PostHog** | Native workspace grouping, already integrated |
| Deep trace debugging | **LangSmith** | Full conversation replay, prompt debugging |
| Infrastructure performance | **Cloud Trace (OTel)** | Already set up, latency analysis |
| Topic trends at scale | **PostHog + classifier** | Aggregation + visualization strengths |
| Semantic clustering | **Custom (embeddings + pgvector)** | Already have embedding infrastructure |

**Recommendation:** PostHog as primary CSM tool; LangSmith for engineering deep-dives.

---

## Insights

1. **Infrastructure is largely ready** - The hard work of instrumenting LLM calls with metadata is done. The gap is event completeness and dashboard creation.

2. **Manual vs automated is already tracked** - The `Agents.WorkflowAgent` pattern permeates the codebase. No new schema needed.

3. **LangSmith is better for debugging, PostHog for dashboards** - LangSmith lacks native per-customer aggregation; PostHog is built for it.

4. **Question embeddings are already generated** - The `embed()` function in `ai.ts` can be reused for clustering.

5. **Topic classification needs careful design** - At tens of thousands of queries/day, need efficient classification (not per-query LLM call).

---

## Questions to Answer Before PRD

1. **Privacy scope:** Can we store question text for trend analysis, or only anonymized embeddings/topics?

2. **Topic taxonomy:** What are the 10-15 categories that matter? (Meeting search, CRM update, Email draft, etc.)

3. **CSM workflow:** How do CSMs want to consume this? Dashboard polling? Slack alerts? In-app?

4. **Quality signals:** Beyond success/failure, what indicates a "good" vs "bad" response? User regeneration? Thumbs up/down?

5. **Historical backfill:** Do we need to analyze past queries, or only going forward?

6. **LangSmith role:** Should engineering have a separate deep-dive tool, or unify everything in PostHog?

---

## Open Questions

1. What is the exact CSM workflow for using this data today (if any)?
2. Are there specific customers where AI issues are already known but undiagnosed?
3. What's the acceptable latency for topic classification? Real-time or batch?
4. Do we have existing question taxonomies from support tickets or feature requests?
5. How does this relate to the "Trend Visibility" strategic pillar work already planned?

---

## Recommended Next Steps

### Phase 1: Quick Wins (1 sprint)

1. Add `agents:run_completed` and `agents:run_failed` events
2. Add `is_manual: true/false` property to all chat events
3. Build initial PostHog dashboard: questions by workspace, manual/auto split, failure rates

### Phase 2: Topic Analysis (1-2 sprints)

1. Define topic taxonomy (10-15 categories)
2. Implement lightweight classifier (rule-based or small LLM)
3. Add topic to PostHog events
4. Build "trending topics" dashboard

### Phase 3: Semantic Clustering (2-3 sprints)

1. Store question embeddings in pgvector
2. Build nightly clustering job
3. Surface "emerging patterns" and "unanswered question types"
4. Create "what's missing" report for product

---

## Strategic Fit Assessment

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| **Trust Foundation** | 4 | Transparency into AI behavior increases trust |
| **Outcome Orientation** | 5 | Clear path: visibility → proactive CSM → retention |
| **Human Empowerment** | 5 | Gives CSMs tools to support customers better |
| **Data Capture** | 3 | Builds on existing capture, doesn't improve it |
| **Differentiation** | 4 | Per-customer AI observability is rare in market |
| **Expansion Driver** | 4 | Better AI = happier customers = expansion |

**Total Score: 25/30** → Strong alignment, proceed to PRD

---

## ✅ Recommendation: Ready for PRD

This initiative has:
- ✅ Clear persona (CSM)
- ✅ Strong outcome chain (visibility → proactive support → retention)
- ✅ Evidence of need (operational gap acknowledged)
- ✅ Technical feasibility confirmed (infrastructure exists)
- ✅ Strategic alignment (Trend Visibility pillar)

**Suggested PRD scope:** Phase 1 + Phase 2 as MVP. Phase 3 as fast-follow.

---

## References

- `elephant-ai/functions/src/contexts/infra/analytics/` - PostHog integration
- `elephant-ai/functions/src/contexts/llm/ai.ts` - LLM call instrumentation
- `elephant-ai/functions/src/contexts/llm/agents/agents.context.ts` - Agent execution tracking
- `elephant-ai/functions/src/types/elephant.ts` - `Agents.WorkflowAgent` definition

