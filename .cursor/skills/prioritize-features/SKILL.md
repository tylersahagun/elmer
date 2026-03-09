---
name: prioritize-features
description: Prioritize candidate features using demand evidence, strategic fit, and initiative status context.
sourcePlugin: pm-product-discovery
sourceAsset: prioritize-features
delegationPattern: intake-prioritization
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [signals, initiative-status, roadmap]
producedArtifacts: [prioritized_feature_candidates]
---

# Prioritize Features

Rank feature opportunities so Chief-of-Staff workflows can route work into the right initiative lane.

## Graph Edges

- reads_context -> signals, initiative status, roadmap context
- produces -> prioritized_feature_candidates
