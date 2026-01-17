# Decision Log: LLM Message Analysis & User Metrics

## 2026-01-10: Tool Selection

**Decision:** Use PostHog as primary CSM dashboard tool; LangSmith for engineering deep-dives

**Context:** Evaluated both tools for per-customer LLM observability

**Options Considered:**
1. LangSmith only
2. PostHog only
3. PostHog primary + LangSmith for debugging

**Rationale:**
- PostHog has native workspace grouping (`groups: { company: workspaceId }`)
- LangSmith lacks native per-customer aggregation dashboards
- LangSmith excels at individual trace debugging
- Both are already integrated—leverage existing work

**Status:** Proposed (pending PRD)

---

## 2026-01-10: Manual vs Automated Tracking

**Decision:** Leverage existing `Agents.WorkflowAgent` pattern—no new schema needed

**Context:** Need to distinguish user-initiated queries from workflow-generated queries

**Rationale:**
- `viewerId === Agents.WorkflowAgent` already used throughout codebase
- `chat_messages.userId` is null for workflow-generated messages
- `__isRealUserSendingMessage` flag exists in AgentRunContext
- Adding to PostHog events requires only property addition

**Status:** Confirmed (infrastructure exists)

---

## 2026-01-10: Phased Rollout Approach

**Decision:** Three-phase approach—events first, topics second, clustering third

**Context:** Scope could expand to full analytics platform; need to constrain

**Options Considered:**
1. Build everything at once
2. Start with dashboards only
3. Phased: events → topics → clustering

**Rationale:**
- Phase 1 is quick (3-5 days) and unblocks CSM visibility
- Phase 2 adds product value (topic trends)
- Phase 3 is advanced ML—can defer if Phase 1-2 sufficient
- Maintains quality-over-velocity principle

**Status:** Proposed (pending PRD)

