---
name: identify-assumptions-existing
description: Identify assumptions and unresolved risks in already-shipped or in-flight product areas.
sourcePlugin: pm-product-discovery
sourceAsset: identify-assumptions-existing
delegationPattern: discovery-experimentation
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [project-docs, signals, personas]
producedArtifacts: [assumptions_list, test_candidates]
---

# Identify Assumptions (Existing)

Map uncertain beliefs in current product workflows to accelerate targeted experimentation.

## Graph Edges

- reads_context -> existing project docs, signals, personas
- produces -> assumptions_list, test_candidates
