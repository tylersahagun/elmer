---
name: analyze-feature-requests
description: Analyze inbound feature requests and synthesize demand signals for intake triage.
sourcePlugin: pm-product-discovery
sourceAsset: analyze-feature-requests
delegationPattern: intake-prioritization
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [signals, initiatives, personas]
producedArtifacts: [feature_request_summary, demand_signal]
---

# Analyze Feature Requests

Review qualitative feedback and identify patterns that indicate true feature demand.

## Graph Edges

- reads_context -> signals, linked initiatives, personas
- produces -> feature_request_summary, demand_signal
