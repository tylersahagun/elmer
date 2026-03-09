---
name: prioritize-assumptions
description: Prioritize assumptions by risk and expected learning value to choose the next experiment.
sourcePlugin: pm-product-discovery
sourceAsset: prioritize-assumptions
delegationPattern: discovery-experimentation
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [assumptions, project-state, validation-history]
producedArtifacts: [prioritized_assumptions, next_test_recommendation]
---

# Prioritize Assumptions

Score and sort assumptions so teams test the highest-risk, highest-learning items first.

## Graph Edges

- reads_context -> assumptions, project state, validation history
- produces -> prioritized_assumptions, next_test_recommendation
