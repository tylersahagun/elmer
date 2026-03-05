---
id: slack-product-forum-2026-02-19
type: slack
source: "#product-forum"
topic: "General Product Feedback & Bugs"
capture_date: 2026-02-19
participants:
  - Jason Harmon
  - Ben
  - Tyler Sahagun
  - Skylar
  - Matt Bennett
  - Sam Ho
  - Kaden
  - James
  - Erika
  - Wyatt Cooper
status: "pending_review"
---

# Slack: #product-forum Digest (Feb 9 - Feb 19, 2026)

## TL;DR

The team identified critical issues with the Privacy Agent incorrectly marking calls as private, preventing important workflows from running (like Hubspot logging and churn alerts). Sam Ho recommended force-disabling the feature pending Product Council review. Additionally, multiple UI bugs were reported and triaged: users received generic "invalid code" errors instead of "inactive seat" warnings, composio background logic was erroneously triggered without user consent (now opt-in via a toggle), and the impersonation feature incorrectly attributes workflow creations to the impersonated user rather than the AskElephant admin. Pest Share provided a massive list of 16 feature requests for their premium use cases.

## Key Decisions

- **Privacy Agent**: Sam Ho recommended force-disabling the Privacy Agent feature due to harm outweighing value. Final call to be made in Product Council.
- **Composio Opt-In**: Composio tools were moved to an opt-in toggle in chats to prevent accidental email drafting and sensitive actions.
- **Welcome Email**: ASK-5137 created to disable/update the hardcoded "Welcome" email for new customers, which was redundant to the new onboarding flow.

## Action Items

- **Ben**: Proactively communicate with CSM team regarding the Privacy Agent issues for affected users.
- **Sam Ho/Product Council**: Make final call on whether to fully disable the Privacy Agent.
- **Jake / Engineering**: ASK-5166 to implement inactive seat error rather than generic "invalid code".
- **Jason / Backend**: Consider how to attribute manual workflow creation during impersonation (potentially an 'impersonator' ID).

## Problems Identified

### Privacy Agent Over-Aggressive Tagging

- **Description**: The Privacy Agent is marking calls as private for innocuous reasons like discussing being sick or company restructures, resulting in workflows not running.
- **Impact**: Missed HubSpot logs, customer quotes, and churn alerts.
- **Scope**: Platform-wide for users/workspaces with the feature enabled.
- **Status**: [Mitigation Proposed] Force disable feature; discuss in Product Council.
- **Customer Mentions**: Transwest (via Tyler)

> "My recommendation is that we force disable the feature as it's likely causing significant harm over potential value." - Sam Ho

### Workflows Missing "Create as Impersonator" Attribution

- **Description**: When admins impersonate customers to build workflows, the creation is attributed to the customer, polluting audit logs and hiding internal tracking.
- **Impact**: Makes it hard to track which customers are actually building vs using.
- **Scope**: Internal Workflow Builder & Audit Logs
- **Status**: [Under Investigation]

### Inactive Seat Login Errors are Generic

- **Description**: Users without active seats see "Invalid code" when logging in via magic link, leading to 1-2 support tickets weekly.
- **Impact**: Unnecessary support burden and poor UX.
- **Scope**: Authentication
- **Status**: [Fix in PR] ASK-5166 created, Cursor submitted a draft PR.

### Composio Tools Firing Unexpectedly

- **Description**: Broad prompts caused Composio to draft and even send emails instead of returning text.
- **Impact**: Incorrect emails sent to customers externally (experienced by Erika).
- **Scope**: AI Agents
- **Status**: [Fixed] Toggled to opt-in within the chat interface.

## Feature Requests

- **Pest Share Mega-list**:
  - Revenue Operations Agent (forecast, segmenting, routing)
  - Org Chart Integration (Rippling auto-populating permission levels)
  - Privacy Rule Enhancements (separate personal/business emails)
  - EOS/90.io Integration
  - Fulfillment Automation (auto-close tickets)
  - Deal Stage Workflow Triggers
  - Snowflake Data Warehouse Integration
  - Chrome Extension (compose agent in browser)
  - Screen Recording (desktop app)
  - Wiki/KB Integration
  - Deal Stage Alignment Notifications
  - Training & Enablement Portal
  - Customer Education Workflow
  - Forecasting Beyond HubSpot
  - iPad Desktop View
  - User Feedback Aggregation
- **Data Picker/Time UI**: Request to improve the time/date picker UI when uploading recordings.

## Verified Workarounds

- **Adding users failing due to Auth Claims limits**: Clearing cookies resolves the blockage caused by Cloudflare human verification challenges.

## Strategic Alignment

- **Product Usability**: Aligning login errors with the actual cause (inactive seat) improves UX and removes support burden.
- **Enterprise Controls**: Admin impersonation and accurate audit logs are crucial for scaling to larger organizations and giving them visibility into our team's edits.
