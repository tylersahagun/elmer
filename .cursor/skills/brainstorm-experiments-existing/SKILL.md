---
name: brainstorm-experiments-existing
description: Design practical experiment options for improving existing product workflows.
sourcePlugin: pm-product-discovery
sourceAsset: brainstorm-experiments-existing
delegationPattern: discovery-experimentation
importStrategy: adapt
executionMode: server
phase: discovery
requiredArtifacts: [metrics, assumptions, signals]
producedArtifacts: [experiment_options]
---

# Brainstorm Experiments (Existing)

Generate and structure experiment candidates to improve known product surfaces.

## Graph Edges

- reads_context -> existing product metrics, assumptions, signals
- produces -> experiment_options
