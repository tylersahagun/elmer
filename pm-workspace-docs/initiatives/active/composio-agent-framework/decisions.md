# Decisions: Composio Agent Framework

## Decision Log

### 2026-01-22: Two-Phase Approach
**Decision:** Split implementation into short-term (Universal Agent Node) and long-term (Agent Configurator)

**Context:** Need to ship workflow integration capability quickly while building toward better UX

**Rationale:** 
- Short-term validates demand and unlocks immediate value
- Long-term provides dramatically better UX
- Learnings from short-term inform long-term design

**Decided by:** Tyler, Woody

---

### 2026-01-22: Service Account Recommendation
**Decision:** Recommend service accounts for workspace-level integrations

**Context:** When admins connect integrations for workflows, actions appear as that admin

**Rationale:**
- Transparency about who/what is acting
- Aligned with Linear's agent guidelines
- Prevents confusion ("why did my admin create this task?")

**Decided by:** Tyler

---

### 2026-01-22: Agent Templates with User Opt-in
**Decision:** Long-term architecture uses admin-created templates that users opt into with personal auth

**Context:** Some integrations (email, calendar) can't use service accounts

**Rationale:**
- Solves workspace vs user auth problem
- Empowers users to control their own automation
- Enables personal integrations (email drafts, calendar)
- Creates adoption flywheel (templates as discovery)

**Decided by:** Tyler
