# FGA Engine — Design Brief

## Overview

Design the customer-facing layer for AskElephant's Fine-Grained Authorization engine. The backend is built. This brief covers the AI-assisted configuration experience, permission explanation UX, audit interface, and guided setup flows.

**Design Principle:** Access controls are a language problem, not a configuration problem. The UI should feel like talking to a smart assistant, not filling out a policy form.

---

## Design Pillars

### 1. AI-First Configuration

Admins describe what they want in plain English. The AI translates to policy rules. Forms are the fallback, not the primary interface.

### 2. Transparent by Default

Every policy shows its plain-language equivalent. Every access decision is explainable. Users always know _why_ they can or can't see something.

### 3. Safe by Design

Impact previews before every change. Rollback capability. Safety nets that prevent self-lockout. Confirmation on destructive actions.

### 4. Progressive Disclosure

Start with "Team Sharing" (simple). Reveal "Custom Policies" (intermediate). Offer "Advanced Mode" (raw editor) for power users. Never force complexity on simple use cases.

---

## Key Screens

### Screen 1: Authorization Dashboard (Settings → Authorization)

**Entry point for admins. Shows the health of access controls at a glance.**

**Layout:**

- Top bar: Page title + "FGA Enabled/Disabled" badge (existing) + "Ask AI" floating button
- Summary cards row: Total policies, Active policies, Recent changes, Users affected
- Entity domain grid (existing, 9 domains) — each card shows policy count + health indicator
- "Condition Groups" card (existing, marked "Advanced")
- Quick Actions: "Set Up Team Sharing", "Review Audit Log", "Ask AI for Help"

**Empty State (first visit):**

- Hero illustration: Shield with AI sparkle
- "Welcome to Access Controls"
- "Your workspace is currently open — everyone can see everything. Want to set up access rules?"
- [Get Started with AI] [Keep Open for Now] [Learn More]

**States:** Loading (skeleton cards), Populated (policy counts per domain), Empty (first-time), Error (API failure with retry)

### Screen 2: AI Policy Assistant (Slide-over panel or modal)

**The primary configuration interface. Chat-style interaction.**

**Layout:**

- Chat interface (similar to Global Chat) but scoped to authorization
- Pre-built prompts as chips: "Set up team sharing", "Restrict to attendees only", "Show me who can see [resource]"
- Message history with AI responses
- When AI generates a policy → inline "Policy Preview Card" with:
  - Plain-language description
  - Impact summary (X users, Y resources affected)
  - [Apply] [Modify] [Cancel] buttons
  - Expandable "Technical Details" section showing the raw policy

**AI Response Patterns:**

- **Policy creation:** Shows proposed policy → impact preview → confirmation
- **Explain query:** "Who can see the Xerox meetings?" → Visual list of users with access and why
- **Suggestion:** "3 users have been requesting access to Marketing calls. Add them?" → one-click accept
- **Error/conflict:** "This policy conflicts with [existing policy]. Here's how to resolve it."

### Screen 3: Domain Policies View (Settings → Authorization → [Domain])

**Policies for a specific entity domain (e.g., Engagements).**

**Layout:**

- Breadcrumb: Authorization → Engagements
- Policy list (existing ag-grid table, enhanced):
  - Each row shows: Effect badge (Allow/Deny), Actions, Principal (in plain language), Scope, Description
  - Row click → edit in Policy Form Dialog (existing)
  - "Created by AI" badge on AI-generated policies
- Action bar: [+ Create Policy] [Ask AI] [Filter] [Search]
- Empty state: "No custom policies for Engagements. System defaults apply. [Set up with AI]"

### Screen 4: Impact Preview (Inline in AI assistant or standalone modal)

**Shown before any policy change takes effect.**

**Layout:**

- Two-column comparison: "Before" vs "After"
- Summary metrics: Users gaining access (+12), Users losing access (-3), Resources affected (1,200 meetings)
- Expandable list of affected users grouped by change type
- Warning callout if any users lose access: "3 users will lose access to meetings they currently see. Review the list below."
- [Confirm & Apply] [Simulate for 24h] [Cancel]

### Screen 5: Access Denied Experience (End user — in meeting/resource views)

**What regular users see when they can't access something.**

**Layout (banner component, not a page):**

- Yellow/amber banner at top of meeting page or in-place of content
- Icon: Shield with lock
- Primary text: "This meeting is restricted"
- Secondary text (AI-generated): "Only meeting attendees can view this recording. This was set by your workspace admin."
- Actions: [Request Access] [Learn More]
- "Request Access" → confirms ("Request sent to [Admin]. You'll be notified.") → creates access request record

### Screen 6: Audit Log (Settings → Authorization → Audit Log tab)

**Compliance-ready log of all authorization changes.**

**Layout:**

- Filters: Date range, Domain, Changed by, Change type (created/updated/deleted/rollback)
- Table: Timestamp, User, Action, Policy description (plain language), Before/After diff
- Each row expandable to show full technical diff
- [Export CSV] button
- "Summarize this week's changes" → AI generates plain-language summary
- Rollback button per entry (with impact preview before undo)

---

## Component Library

### New Components Needed

| Component              | Type             | Description                                              |
| ---------------------- | ---------------- | -------------------------------------------------------- |
| `PolicyAssistantPanel` | Slide-over panel | Chat interface for AI-assisted policy configuration      |
| `ImpactPreviewCard`    | Card             | Shows before/after policy change impact                  |
| `PolicyPreviewCard`    | Card (in chat)   | AI-generated policy with plain-language + technical view |
| `AccessDeniedBanner`   | Banner           | Explains why user can't access a resource                |
| `AccessRequestButton`  | Button           | One-click request access with confirmation               |
| `AuditLogTable`        | Table            | Filterable audit log with diff view                      |
| `AuditLogDiffView`     | Expandable row   | Before/after policy state comparison                     |
| `PolicyBadge`          | Badge            | "Created by AI" / "System Default" / "Custom" indicators |
| `SetupWizardStep`      | Step component   | Multi-step guided setup with AI                          |
| `TemplateSelector`     | Card grid        | Pre-built policy templates (Open, Team, Attendees)       |

### Existing Components to Enhance

| Component                | Enhancement                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `authorization.tsx`      | Add empty state, summary cards row, "Ask AI" button          |
| `policies-table.tsx`     | Add "Created by AI" badge column, plain-language description |
| `policy-form-dialog.tsx` | Add impact preview before save                               |
| `nav-viewer.tsx`         | Keep existing Shield icon + badge (no change needed)         |

---

## AI Assistant Interaction Patterns

### Prompt Templates (Pre-built chips)

| Chip Label                   | AI Action                                         |
| ---------------------------- | ------------------------------------------------- |
| "Set up team sharing"        | Guides through team-based sharing setup           |
| "Restrict to attendees only" | Creates attendees-only policy for selected domain |
| "Who can see [resource]?"    | Runs `explainPermitted` and visualizes results    |
| "Show recent changes"        | Summarizes audit log                              |
| "Add a new user to [team]"   | Updates group membership                          |
| "What policies exist?"       | Lists all active policies with plain descriptions |

### AI Response Types

1. **Policy Proposal** — Shows card with plain language + impact + confirm/modify/cancel
2. **Explanation** — Visual breakdown of who has access and why
3. **Suggestion** — Proactive recommendation based on access patterns
4. **Confirmation** — "Done! Policy is now active. Here's what changed."
5. **Clarification** — "I'm not sure what you mean. Did you mean X or Y?"
6. **Error** — "This conflicts with [policy]. Here's how to resolve it."

---

## States & Edge Cases

### Loading States

- Dashboard: Skeleton cards for policy counts and domain grid
- AI Assistant: Typing indicator while AI processes
- Impact Preview: Skeleton while calculating affected users

### Error States

- AI can't parse intent → "I didn't quite get that. Try one of these:" + template chips
- Policy conflicts → AI explains conflict with resolution options
- API failure → Retry button with explanation
- Feature flag disabled → Redirect to Team settings (existing behavior)

### Edge Cases

- Admin creates policy that locks themselves out → Safety net prevents this with warning
- Policy affects 0 users → "This policy doesn't affect anyone yet. It will apply when matching users/resources exist."
- Two admins edit policies simultaneously → Optimistic UI with conflict resolution on save
- Workspace with no teams defined → AI suggests setting up teams first before team-based sharing

---

## Accessibility

- AI assistant supports keyboard navigation (Tab through chips, Enter to send)
- Impact preview uses color + icon (not color alone) for gain/loss indicators
- Audit log table supports screen reader with proper ARIA labels
- Access denied banner has appropriate ARIA role="alert"
- All interactive elements have focus states and keyboard shortcuts

---

## Mobile Considerations

- AI assistant as bottom sheet on mobile
- Impact preview as full-screen modal on mobile
- Access denied banner collapses to single line with expand
- Audit log switches to card layout on small screens

---

## Animation & Transitions

- AI policy card slides in from right when generated
- Impact numbers count up/down when preview calculates
- "Applied!" confirmation uses subtle checkmark animation
- Policy row highlight fades when recently changed (audit trail indicator)

---

## Open Design Questions

1. Should the AI assistant live in the Global Chat sidebar or be a separate panel scoped to Authorization?
2. Should "Request Access" notifications go to Slack, email, or in-app only?
3. How do we handle the existing raw policy editor — hide it behind "Advanced Mode" toggle or separate tab?
4. Should the audit log support real-time updates (WebSocket) or refresh-based?

---

_Last updated: 2026-02-08_
