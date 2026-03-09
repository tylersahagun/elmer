---
name: brainstorm-experiments-new
description: Generate experiment options for zero-to-one initiative discovery.
sourcePlugin: pm-product-discovery
sourceAsset: brainstorm-experiments-new
delegationPattern: discovery-experimentation
importStrategy: adapt
executionMode: server
phase: discovery
requiredArtifacts: [initiative-brief, research, personas]
producedArtifacts: [experiment_options]
---

# Brainstorm Experiments (New)

Design low-cost tests that quickly validate or invalidate new initiative assumptions.

## Graph Edges

- reads_context -> new initiative brief, research, personas
- produces -> experiment_options
