---
name: identify-assumptions-new
description: Identify key assumptions and risks for net-new initiative concepts.
sourcePlugin: pm-product-discovery
sourceAsset: identify-assumptions-new
delegationPattern: discovery-experimentation
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [initiative-brief, research, personas]
producedArtifacts: [assumptions_list, risk_map]
---

# Identify Assumptions (New)

Surface what must be true for a new initiative to succeed before heavy implementation begins.

## Graph Edges

- reads_context -> initiative brief, research, personas
- produces -> assumptions_list, risk_map
