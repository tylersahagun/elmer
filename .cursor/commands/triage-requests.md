---
sourcePlugin: pm-product-discovery
sourceAsset: triage-requests
delegationPattern: intake-prioritization
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [signals-inbox, initiatives, personas]
producedArtifacts: [triage_report, project_recommendations]
---

# Triage Requests

**Uses**: analyze-feature-requests, prioritize-features

Route inbound requests into prioritized project recommendations.

## Graph Edges

- uses_skill -> analyze-feature-requests, prioritize-features
- reads_context -> signals inbox, initiatives, personas
- produces -> triage_report, project_recommendations
