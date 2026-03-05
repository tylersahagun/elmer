# Design Brief: Chief Of Staff Recap Hub

## Overview

The Chief Of Staff Recap Hub is the primary daily experience that merges approvals, proactive actions, and flagship recap artifacts into one place. The design must remove workflow friction, build trust through visibility, and make automation feel proactive instead of noisy.

## Design Principles

### 1. Proactive Clarity

Always answer: what happened, what needs approval, what is scheduled.

### 2. Approval by Exception

Low-risk actions should auto-run. High-risk actions should be obvious, reviewable, and fast to approve.

### 3. Flagship Artifacts

Recaps, prep, and coaching should feel like dedicated products, not workflow outputs.

### 4. AI-First Configuration

Users should describe what they want in natural language, not learn workflow settings.

### 5. Trust by Transparency

Every action shows source, confidence, and an audit trail.

## Primary Users

- **Sales Rep:** Wants quick recaps and next actions without setup friction.
- **Sales Leader:** Needs an approvals queue and team visibility.
- **RevOps:** Requires compliance, auditability, and policy tiers.
- **CSM:** Needs prep and recap consistency across accounts.

## Core Experience

### Daily Hub (Primary Entry)

- Three buckets: **Done**, **Needs Approval**, **Scheduled**
- Each card shows: action summary, owner, rationale, source, confidence, and recency
- Global CTA: “Review approvals” and “See today’s recap”

### Flagship Recap Artifacts

- Meeting page with tabs: **Recap**, **Prep**, **Coaching**
- Recap is default; other tabs appear only when data exists
- Feedback icon opens global chat for in-place template edits

### Template Configuration Chat

- Split view: left chat, right live artifact preview
- Time-to-complete indicator (< 3 minutes)
- Progress indicator (step 1 of 3)
- Delivery channel defaults (Slack, HubSpot, Teams, Email)

### Chat-Based Configuration

- Chat-driven onboarding: “What call types do you have?”
- Live preview updates as user changes format
- Save templates per call type with simple confirmation
- One-click meeting type override in recap header

### Share Modal (External Delivery)

- Channel icons + destination picker (Slack/HubSpot/Teams/Email/Copy)
- Preview of how recap appears in destination
- Pre-share checklist + explicit confirmation
- Privacy status chip and “Share blocked” state

### Audit & Sources Panel

- Inline panel with source attribution + privacy status
- Audit log entries for templates and shares
- Exportable audit log for ops compliance

## Key Flows

### Flow 1: Daily Hub Entry

1. User opens app or receives daily summary
2. Hub shows Done / Needs Approval / Scheduled buckets
3. User approves or edits top actions
4. Auto-run items remain in Done with audit context

### Flow 2: Configure Recap Templates

1. Chat asks for meeting types
2. User responds; previews update
3. User confirms templates for each type
4. Recaps auto-apply without workflow edits

### Flow 3: Review Recap + Edit

### Flow 4: Share Recap to Channel

1. User clicks Share on recap
2. Channel modal opens with preview
3. Privacy status check + confirmation required
4. Share success logged in audit trail

5. User opens meeting page recap tab
6. Clicks feedback icon to modify template
7. Chat applies changes to future recaps, optional regenerate

## Key Screens & States

### Daily Hub States

| State       | Description           | Treatment                                   |
| ----------- | --------------------- | ------------------------------------------- |
| **Loading** | Data fetching         | Skeleton cards per bucket                   |
| **Empty**   | No actions yet        | Simple explanation + “Record a meeting” CTA |
| **Partial** | Some buckets empty    | Show empty bucket tips                      |
| **Full**    | All buckets populated | Standard layout                             |
| **Error**   | Data failed to load   | Inline error + retry                        |

### Approval Card States

| State              | Treatment                    |
| ------------------ | ---------------------------- |
| **Needs Approval** | Highlight + quick actions    |
| **Auto-Run**       | Label + confidence indicator |
| **Blocked**        | Error reason + resolve CTA   |

### Recap Artifact States

### Share Modal States

| State       | Treatment                               |
| ----------- | --------------------------------------- |
| **Loading** | Destination lookup + preview skeleton   |
| **Ready**   | Preview + confirmation checkbox         |
| **Blocked** | Privacy pending copy + disabled confirm |
| **Error**   | Inline error + fallback (copy instead)  |

### Meeting Type Detection States

| State         | Treatment                      |
| ------------- | ------------------------------ |
| **High Conf** | Confident chip + quick confirm |
| **Low Conf**  | “Might be…” banner + override  |
| **Unknown**   | Manual selection prompt        |

| State            | Treatment                         |
| ---------------- | --------------------------------- |
| **Generating**   | Skeleton + “Generating recap…”    |
| **Ready**        | Polished artifact view            |
| **Needs Review** | Banner prompting edit or approval |
| **Error**        | Explain failure + retry           |

## Trust & Privacy

- Approval tiers by risk and data sensitivity
- Privacy determination before any external share
- Confirmation required for external delivery
- Audit log visible from hub and meeting pages
- Share blocked while privacy is pending

## Approval Tiers by Persona (Draft)

| Persona      | Auto-Run (Low Risk)                             | Needs Approval (Medium/High)                      |
| ------------ | ----------------------------------------------- | ------------------------------------------------- |
| Sales Rep    | Calendar follow-ups, task reminders             | Recap sharing, CRM writebacks, external emails    |
| Sales Leader | Team summary updates, low-risk coaching prompts | Recap approval, template changes, escalations     |
| RevOps       | Internal metadata updates                       | Policy changes, external sharing, audit overrides |
| CSM          | Internal risk flags, prep summaries             | Customer-facing emails, CRM updates               |

## Action Card Anatomy (Copy + Fields)

- **Title:** “Draft recap ready for approval”
- **Owner:** “Owner: Alex Rivera”
- **Rationale:** “Why now: customer requested recap in last call”
- **Source:** “Source: HubSpot + Meeting transcript”
- **Confidence:** “Confidence: Medium — verify key outcomes”
- **Primary CTA:** “Review & approve”
- **Secondary CTAs:** “Edit”, “Snooze”

## Audit Surface (Where It Shows)

- **Inline on cards:** “Audit: 2 approvals, last edited by Sam”
- **Right rail:** “Policy tier + approval history”
- **Meeting page:** “Change log” tab for recap templates

## Content Architecture

- **Hub:** Daily focus and actions
- **Meeting Page:** Deep context (recap/prep/coaching)
- **Global Chat:** Configuration and edits

## Accessibility & Performance

- All actions keyboard accessible
- Color not the only indicator for status
- Recap artifact loads under 500ms after ready state
- Chat interactions respond under 3s

## Open Questions for Design Review

- Rep-first vs leader-first default view for v1
- What qualifies as low-risk auto-run by persona?
- Should recap configuration appear during onboarding or first recap view?

---

_Last updated: 2026-01-29_  
_Owner: Tyler Sahagun_
