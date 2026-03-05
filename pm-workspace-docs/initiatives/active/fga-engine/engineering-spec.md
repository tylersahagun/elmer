# FGA Engine — Engineering Spec (UI Layer)

## Overview

The FGA backend is built (`contexts/authorization/`, 57 files). This spec covers the **frontend work** needed to deliver the AI-assisted customer journey described in the PRD.

**Key constraint:** The backend GraphQL API, DB schema, and policy engine are stable. This is primarily frontend + AI integration work.

---

## Architecture

### Existing Backend (No Changes Needed for MVP)

```
contexts/authorization/
├── userCan()                    # Unified entry point — used by all feature code
├── drizzle-filter-builder.ts    # Translates policies → SQL WHERE clauses
├── entity-domain-registry.ts    # 9 domains: engagements, companies, contacts, etc.
├── system-default-policies.ts   # Baseline open-access policies seeded per workspace
├── authorization.feature-flag.ts # PostHog `fga-engine-beta` check
├── resolvers/
│   ├── Query/explainPermitted   # Already built — returns why user can/can't access
│   ├── Query/policy             # CRUD read
│   ├── Query/entityDomainInfo   # Domain metadata
│   ├── Mutation/createPolicy    # Policy creation
│   ├── Mutation/updatePolicy    # Policy update
│   ├── Mutation/deletePolicy    # Policy deletion
│   └── ... (condition groups, attach/detach)
└── schema.graphql               # Full GraphQL schema for authorization
```

### New Frontend Work

```
apps/web/src/
├── components/authorization/
│   ├── policy-assistant-panel.tsx    # NEW — AI chat interface
│   ├── impact-preview-card.tsx       # NEW — Before/after impact visualization
│   ├── access-denied-banner.tsx      # NEW — End-user denial explanation
│   ├── access-request-button.tsx     # NEW — One-click request access
│   ├── audit-log-table.tsx           # NEW — Filterable audit log
│   ├── audit-log-diff-view.tsx       # NEW — Before/after policy diff
│   ├── setup-wizard.tsx              # NEW — First-time guided setup
│   ├── template-selector.tsx         # NEW — Pre-built policy templates
│   ├── policy-badge.tsx              # NEW — "Created by AI" / "System Default"
│   ├── policies-table.tsx            # ENHANCE — Add AI badge, plain-language
│   ├── policy-form-dialog.tsx        # ENHANCE — Add impact preview
│   └── ... (existing components)
├── routes/.../settings/
│   ├── authorization.tsx              # ENHANCE — Empty state, summary, AI button
│   ├── authorization-audit.tsx        # NEW — Audit log route
│   └── authorization-domain.tsx       # NEW or ENHANCE — Domain-specific view
└── hooks/
    └── useExplainPermitted.ts         # NEW — Hook wrapping explainPermitted query
```

### New Backend Work (Minimal)

| Item                   | Description                                                           | Complexity    |
| ---------------------- | --------------------------------------------------------------------- | ------------- |
| `AI Policy Parser`     | LangChain/LLM integration to parse natural language → FGA policy JSON | Medium        |
| `Impact Calculator`    | Given a policy diff, calculate affected users/resources               | Medium        |
| `Audit Log Query`      | GraphQL query for policy change history (data already logged)         | Low           |
| `Access Request`       | Mutation to create access request + notification                      | Low           |
| `AI Suggestion Engine` | Analyze access request patterns → suggest group changes               | Low (Phase 2) |

---

## Technical Approach

### AI Policy Assistant

**Backend:** New GraphQL mutation `generatePolicyFromNaturalLanguage(input: String!): PolicySuggestion!`

- Uses LLM (existing LangChain infrastructure) with system prompt containing:
  - FGA schema (entity domains, actions, condition types)
  - Current workspace's existing policies (context)
  - User/group information for the workspace
- Returns structured `PolicySuggestion` with `plainLanguageDescription`, `policies[]`, `impactEstimate`
- Runs behind `fga-engine-beta` feature flag

**Frontend:** `PolicyAssistantPanel` component

- Reuse existing chat patterns from Global Chat if architecture allows
- Otherwise, standalone slide-over panel with message list + input
- Pre-built prompt chips as quick actions
- Policy preview cards rendered inline in chat

### Impact Preview

**Backend:** New GraphQL query `previewPolicyImpact(policyInput: PolicyInput!): PolicyImpact!`

- Runs the proposed policy through the filter builder without committing
- Counts affected users and resources per domain
- Returns `{ usersGainingAccess: Int, usersLosingAccess: Int, resourcesAffected: Int, affectedUsers: [User!]! }`

**Frontend:** `ImpactPreviewCard` component

- Two-column before/after layout
- Color-coded counts (green for gaining, red for losing)
- Expandable list of affected users
- Used both in AI assistant responses and in the policy form dialog

### Access Denied Experience

**Frontend:** `AccessDeniedBanner` component

- Renders when a resource query returns `null` with a `PERMISSION_DENIED` error code
- Calls `explainPermitted` (already built) to get the reason
- Displays plain-language explanation
- "Request Access" button calls new `requestAccess` mutation

**Backend:** New `requestAccess` mutation

- Creates an `access_request` record (new table or use existing notification system)
- Sends notification to workspace admin (Novu or in-app)
- Admin approves/denies from notification or audit log

### Audit Log

**Backend:** The `authz_policies` table already has `createdAt`, `updatedAt`, `createdByUserId`. Need:

- New `policy_audit_log` table or query change history from existing update timestamps
- Alternative: use the existing comparison engine (`authorization.comparison.ts`) to diff policy states

**Frontend:** `AuditLogTable` with filters, diff view, export button

---

## Data Model Changes

### New Tables (if needed)

```sql
-- Access requests (when users request access to denied resources)
CREATE TABLE access_requests (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  requester_user_id TEXT NOT NULL REFERENCES users(id),
  resource_type TEXT NOT NULL,          -- e.g., 'engagement'
  resource_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied
  reviewed_by_user_id TEXT REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Policy change audit log (append-only)
CREATE TABLE policy_audit_log (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  policy_id TEXT NOT NULL,
  action TEXT NOT NULL,                  -- created, updated, deleted, rollback
  changed_by_user_id TEXT NOT NULL REFERENCES users(id),
  previous_state JSONB,
  new_state JSONB,
  source TEXT NOT NULL DEFAULT 'manual', -- manual, ai_assistant, system
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### New GraphQL Types

```graphql
type PolicySuggestion {
  plainLanguageDescription: String!
  policies: [PolicyInput!]!
  impactEstimate: PolicyImpact!
  confidence: Float!
}

type PolicyImpact {
  usersGainingAccess: Int!
  usersLosingAccess: Int!
  resourcesAffected: Int!
  affectedUsers: [AffectedUser!]!
}

type AffectedUser {
  user: User!
  changeType: AccessChangeType! # GAINING, LOSING, UNCHANGED
  reason: String!
}

type AccessRequest {
  id: ID!
  requester: User!
  resourceType: String!
  resourceId: String!
  status: AccessRequestStatus!
  reviewedBy: User
  reviewedAt: DateTime
  createdAt: DateTime!
}
```

---

## Feature Flag Strategy

| Flag                  | Scope     | Purpose                                                          |
| --------------------- | --------- | ---------------------------------------------------------------- |
| `fga-engine-beta`     | Workspace | Gates all FGA UI routes and nav item (existing)                  |
| `fga-ai-assistant`    | Workspace | Gates the AI Policy Assistant (new — allows incremental rollout) |
| `fga-access-requests` | Workspace | Gates the "Request Access" button for end users (new)            |

**Rollout plan:**

1. `fga-engine-beta` → Internal team → 5-10 beta workspaces → GA (big bang)
2. `fga-ai-assistant` → Internal → beta workspaces (may lag behind main flag)
3. `fga-access-requests` → After AI assistant is stable

---

## Performance Considerations

- **Policy evaluation:** Already benchmarked via `authorization.metrics.ts`. Target <50ms per `userCan()` call.
- **Impact preview:** May need to scan all users × resources for a domain. Cache user counts per workspace. Timeout at 5s for very large workspaces.
- **AI policy parsing:** LLM call latency ~1-3s. Show typing indicator. Consider streaming response.
- **Audit log:** Paginated query with cursor-based pagination. Index on `(workspace_id, created_at)`.

---

## Risks & Mitigations

| Risk                                | Impact                         | Likelihood | Mitigation                                                 |
| ----------------------------------- | ------------------------------ | ---------- | ---------------------------------------------------------- |
| AI generates incorrect policy       | Data leak or lockout           | Medium     | Mandatory human confirmation, impact preview, rollback     |
| Impact preview calculation too slow | Poor UX during policy creation | Low        | Cache user counts, set timeout with graceful fallback      |
| Beta workspace hits edge case       | Support escalation             | Medium     | Direct Slack channel for beta feedback, quick flag disable |
| LLM hallucinates policy structure   | 500 error on policy creation   | Low        | Structured output validation before creating policy        |

---

## Milestones

| Phase                     | Work                                                              | Duration | Dependencies       |
| ------------------------- | ----------------------------------------------------------------- | -------- | ------------------ |
| **Phase 1: Foundation**   | Empty states, summary cards, plain-language display, audit log    | 2 weeks  | None               |
| **Phase 2: AI Assistant** | Policy assistant panel, natural language → policy, impact preview | 3 weeks  | LLM infrastructure |
| **Phase 3: End User UX**  | Access denied banner, explain permission, request access          | 2 weeks  | Phase 1            |
| **Phase 4: Guided Setup** | First-time wizard, template selector, onboarding flow             | 1 week   | Phase 2            |
| **Phase 5: Polish**       | Proactive suggestions, rollback, simulation, export               | 2 weeks  | Phases 1-4         |

**Total estimate:** 10 weeks (can parallelize Phases 2 and 3)

---

_Last updated: 2026-02-08_
