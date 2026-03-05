# Design Brief: Call Import Engine

## Overview

**Scope:** v1 has **no customer-facing UI**. This is a backend architecture + internal process project. Design work is limited to internal tools, documentation, and future-state exploration.

**Why no UI in v1:** The immediate goal is making imports support-manageable, not self-service. A customer-facing portal is explicitly deferred to v2.

---

## Internal Process Flow

### Import Request Journey

```
Customer mentions import need (Sales/Onboarding call)
  ↓
Sales/CS checks Platform Support Matrix (internal doc)
  ↓
CS confirms: Supported / Not Supported / Manual Upload Only
  ↓
If supported: CS collects credentials/export from customer
  ↓
CS submits import request (Slack? Form? TBD)
  ↓
Import queued and processed (night batch)
  ↓
CS receives completion notification
  ↓
CS confirms with customer, explains capabilities
```

### Key Decision Points

1. **Platform check:** Yes/No/Maybe based on matrix
2. **Credential collection:** API key vs. file export
3. **Timeline setting:** Based on volume + platform rate limits
4. **Capability messaging:** What imported calls can/can't do

---

## Internal Tools Needed (v1)

### 1. Platform Support Matrix

**Format:** Internal doc or Notion database

| Field | Description |
|-------|-------------|
| Platform Name | e.g., Gong, Grain, Fathom |
| Support Status | ✅ Supported / 🔄 In Progress / ❌ Not Supported / 📁 Manual Upload |
| Import Method | API / File Upload / OAuth |
| Metadata Available | Participants, Title, Duration, Transcript |
| Rate Limits | e.g., 10K/day |
| Estimated Timeline | e.g., "5K calls = 1 day" |
| Notes | Any special considerations |

### 2. Import Request Form (Simple)

**Fields needed:**
- Customer name
- Platform
- Estimated call count
- Credentials/access (secure field)
- Urgency (onboarding, deal, retention)
- Requested completion date

### 3. Status Dashboard (Future)

For v1, status updates via Slack notifications. Future: internal dashboard showing active imports, progress, failures.

---

## Key Screens/States (Future v2 - Customer Self-Service)

> **Note:** These are NOT in v1 scope. Documented here for architecture consideration.

### Import Setup Screen
- Platform selector (supported platforms only)
- OAuth flow or credential input
- Volume estimate
- Timeline preview
- Pricing display (if applicable)

### Import Progress Screen
- Progress bar / call count
- Estimated completion
- Error summary (if any)
- "View imported calls" CTA

### Imported Calls Indicator
- Badge or icon on imported calls in meeting list
- Tooltip: "Imported from [Platform] on [Date]"

---

## Interaction Patterns

### For Internal Users (CS/Support)
- Matrix lookup for quick yes/no
- Form submission for request
- Slack notifications for updates
- Manual intervention for errors

### For Customers (v1)
- Verbal/email communication only
- No in-product visibility of import status
- Post-import: calls appear in meeting list like any other

---

## Edge Cases

### Error States
| State | Handling |
|-------|----------|
| Invalid credentials | Immediate notification to CS; re-request from customer |
| Partial failure (some calls fail) | Continue with valid calls; log failures; notify CS |
| Complete failure (API down) | Retry queue; notify CS if >24hr delay |
| Rate limit exceeded | Automatic backoff; extend timeline; notify CS |

### Empty States
| State | Handling |
|-------|----------|
| No calls found | Confirm with customer; check date range/filters |
| Platform not supported | Offer manual upload alternative or decline |

### Loading States
- For batch jobs, loading is irrelevant (async)
- CS receives notification on completion

---

## Accessibility Considerations

N/A for v1 (no customer-facing UI).

Future: Any self-service portal must meet WCAG 2.1 AA standards.

---

## Design References

### Similar Patterns in Product
- HubSpot integration setup flow (OAuth + config)
- Zapier webhook configuration

### Competitor/Industry Patterns
- Gong data export (ironically what we're importing from)
- Salesforce Data Import Wizard
- Migration assistants in Notion, Asana, etc.

---

## Future Design Explorations

When we move to v2 (self-service), explore:

1. **AI-first import setup:** "I want to import 5,000 calls from Gong" → guided flow
2. **Real-time progress:** WebSocket updates during import
3. **Smart timeline:** Based on volume + rate limits, show expected completion
4. **Failure recovery:** "3 calls failed - retry?" vs. silent logging

---

## Notes for Engineering

- No frontend work required in v1
- Consider API design for future self-service (statuses, progress, callbacks)
- Admin endpoints for CS to trigger/monitor imports would help transition to v2
