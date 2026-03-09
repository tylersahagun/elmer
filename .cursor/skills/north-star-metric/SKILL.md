---
name: north-star-metric
description: Define a north-star metric and supporting metric tree for initiative success tracking.
sourcePlugin: pm-marketing-growth
sourceAsset: north-star-pair
delegationPattern: validation-learning
importStrategy: import
executionMode: server
phase: validate
requiredArtifacts: [initiative-goals, product-metrics, strategy-context]
producedArtifacts: [north_star_definition, metrics_alignment_note]
---

# North Star Metric

Frame success measurement around a single north-star metric with aligned leading indicators.

## Graph Edges

- reads_context -> initiative goals, product metrics, strategy context
- produces -> north_star_definition, metrics_alignment_note
