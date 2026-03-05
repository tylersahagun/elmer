# CRM Agent Upgrades — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c0f79b2c8ac81a1935fc59c6e634170
- Linear project: https://linear.app/askelephant/project/crm-agent-upgrades-926f1768afb4
- Phase: Build
- GTM plan: https://www.notion.so/2cef79b2c8ac80068466f80bf2dd72b2

## Outstanding Tasks (Linear)
Linear project issues: 44 total.
Top items:
- [ ] VAN-407: Migrate HS agent to agent architecture
  - https://linear.app/askelephant/issue/VAN-407/migrate-hs-agent-to-agent-architecture
- [ ] VAN-409: Support user-level HubSpot connections
  - https://linear.app/askelephant/issue/VAN-409/add-support-for-user-level-hubspot-connections
- [ ] ASK-4480: Workflow action for configurable updates
  - https://linear.app/askelephant/issue/ASK-4480/workflow-action-for-configurable-updates
- [ ] ASK-4479: Add reasoning text to integration push events
  - https://linear.app/askelephant/issue/ASK-4479/add-reasoning-text-to-integration-push-events
- [ ] ASK-4372: Start saving create events
  - https://linear.app/askelephant/issue/ASK-4372/start-saving-create-events
- [ ] ASK-4313: Support all object types in CRM updates UI
  - https://linear.app/askelephant/issue/ASK-4313/support-all-object-types-in-crm-updates-ui

## MVP → Beta → GA Lifecycle
- MVP: HubSpot agent on new architecture + predictable updates
- Beta: Visibility layer + audit log + limited approval flow
- GA: Salesforce/HubSpot parity + configurable permissions + stable ops

## Next Work (Estimate)
- 4–6 weeks: agent migration + data architecture + integration updates
- 2–4 weeks: visibility UI + HITL and rollout hardening

## Design/UX Gaps and Proposed Flows
No design resources allocated; need minimal trust surfaces.
- CRM update review flow:
  1. After meeting, user sees “CRM updates prepared.”
  2. User reviews field changes and confirms.
  3. Audit log shows before/after and workflow source.
- Trust: show reason, data source, and ability to undo.
