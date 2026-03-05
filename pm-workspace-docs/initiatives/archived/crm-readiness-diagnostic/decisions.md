# Decisions: CRM Readiness Diagnostic

> Track key decisions made during this initiative.

---

## Decision Log

| Date | Decision | Rationale | Stakeholders |
|------|----------|-----------|--------------|
| 2026-01-21 | Created initiative from hypothesis | Strong evidence (4 signals, 90%+ problem frequency, high severity) | Tyler |
| 2026-01-21 | v2 prototype: Softer messaging | Jury feedback: 31% felt blamed by RED status; skeptic approval only 54% | Tyler |
| 2026-01-21 | v2 prototype: Added video tutorials | Jury feedback: 42% said guidance was too vague | Tyler |
| 2026-01-21 | v2 prototype: Added "who can fix" badges | Sales reps didn't know if they could fix issues themselves | Tyler |

---

## 🆕 CRITICAL: Pending Strategic Decision

### Target Audience: Customer vs. Partner

**Question:** Should CRM Readiness Diagnostic be customer-facing, partner-only, or hybrid?

**Context:** Internal feedback session revealed that the current customer-facing design could threaten HubSpot partner business relationships. Partners like Crispy make their money by doing CRM diagnostics and remediation—our tool could be seen as "stealing their work."

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) Customer-Facing** (current v2) | Available to all AskElephant customers | Helps self-serve customers; unblocks activation | Threatens partner business model; could damage relationships |
| **B) Partner-Only** | Premium tool only for certified partners | Strengthens partner channel; premium revenue (~$500/mo); partners love it | Self-serve customers still blocked; no path without partner |
| **C) Hybrid** | Basic for customers, advanced for partners | Best of both worlds; partners get exclusive features | More complex to build; positioning must be careful |

**Evidence:**

> "If we make it super easy for us to simulate the fix and fix and go do that, then it comes up with a question of why is Crispy even needed?"
> — Internal feedback

> "This is a tool only for partners, and it's part of our partner program. We wanna give you more billable hours."
> — Tyler (proposed pivot)

> "They would want essentially that to be almost private. Creating that moat around their money making tool."
> — Internal feedback

**Stakeholders Needed:**
- [ ] James (internal perspective)
- [ ] Crispy (partner perspective - show prototype directly)
- [ ] Tyler (product decision)

**Recommendation:** Hybrid approach with partner-first features. Basic diagnostic for customers (traffic light + "get partner help" CTA), advanced diagnostic with playbooks and methodology config for partners.

**Status:** 🔴 BLOCKING - Needs input before v3

---

## Pending Decisions

### 1. Solution Scope ← BLOCKED BY STRATEGIC DECISION

**Question:** Do we build diagnostic only, diagnostic + remediation, or full partner enablement suite?

**Options:**
- A) Diagnostic only (show readiness score)
- B) Diagnostic + guided remediation (AI helps fix issues) ⚠️ HIGH RISK per partner feedback
- C) Partner enablement tools (diagnostic + playbooks for partners) ← ELEVATED

**Status:** Blocked pending strategic decision

### 2. Gating Strategy

**Question:** Should we gate AskElephant features behind CRM health checks?

**Options:**
- A) Soft gate (warnings only)
- B) Hard gate (block workflows that would fail)
- C) No gating (diagnostic is informational only)

**Status:** Pending customer research

### 3. Messaging Approach ← RESOLVED

**Question:** How do we communicate "your CRM isn't ready" without blaming customers?

**Decision:** "Opportunities to unlock full value" framing with normalization ("90% of HubSpots have gaps")

**Rationale:** Jury validation showed 31% felt blamed; v2 messaging tested better

**Status:** ✅ Resolved in v2 prototype

### 4. 🆕 Auto-Fix Feature

**Question:** Should we include "one-click fix" functionality?

**Options:**
- A) Yes - full auto-remediation
- B) Partial - only for simple issues (e.g., create workflow rule)
- C) No - diagnostic only, manual fix instructions
- D) Partner-only - auto-fix available only to partners

**Evidence:**
> "Everything you're saying up until this point... But the [auto-fix] definitely scares you."
> — Internal feedback

**Recommendation:** Option D (partner-only) or Option C (no auto-fix)

**Status:** Pending strategic decision

---

## Decision Templates

When making decisions, document:
1. The specific question being decided
2. Options considered
3. Decision rationale
4. Who was involved
5. Any dissent or concerns
