---
sourcePlugin: pm-marketing-growth
sourceAsset: north-star-pair
delegationPattern: validation-learning
importStrategy: import
executionMode: server
phase: validate
requiredArtifacts: [initiative-goals, product-metrics, strategy-context]
producedArtifacts: [north_star_definition, metrics_alignment_note]
---

# North Star

**Uses**: north-star-metric

Define initiative-level success framing through a north-star metric workflow.

## Graph Edges

- uses_skill -> north-star-metric
- reads_context -> initiative goals, product metrics, strategy context
- produces -> north_star_definition, metrics_alignment_note
