---
name: ab-test-analysis
description: Analyze A/B experiment outcomes and summarize implications for product decisions.
sourcePlugin: pm-data-analytics
sourceAsset: ab-test-analysis
delegationPattern: validation-learning
importStrategy: import
executionMode: server
phase: validate
requiredArtifacts: [experiment-results, metrics-context, initiative-state]
producedArtifacts: [experiment_analysis]
---

# A/B Test Analysis

Convert experiment result data into decision-ready analysis for validate-to-learn loops.

## Graph Edges

- reads_context -> experiment results, metrics context, initiative state
- produces -> experiment_analysis
