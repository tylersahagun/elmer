---
sourcePlugin: pm-product-discovery
sourceAsset: discover
delegationPattern: discovery-experimentation
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [initiative-docs, product-vision, signals]
producedArtifacts: [discovery_plan, hypothesis_candidates]
---

# Discover

**Uses**: identify-assumptions-new, identify-assumptions-existing, prioritize-assumptions, brainstorm-experiments-new, brainstorm-experiments-existing

Create a discovery packet that maps assumptions and proposes experiment plans.

## Graph Edges

- uses_skill -> identify-assumptions-new, identify-assumptions-existing, prioritize-assumptions, brainstorm-experiments-new, brainstorm-experiments-existing
- reads_context -> initiative docs, product vision, signals
- produces -> discovery_plan, hypothesis_candidates
