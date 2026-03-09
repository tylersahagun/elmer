---
name: cohort-analysis
description: Analyze retention and adoption cohorts to identify behavior trends and learning opportunities.
sourcePlugin: pm-data-analytics
sourceAsset: cohort-analysis
delegationPattern: validation-learning
importStrategy: import
executionMode: server
phase: validate
requiredArtifacts: [metrics-data, initiative-state, retention-adoption-context]
producedArtifacts: [cohort_insight]
---

# Cohort Analysis

Generate cohort-level insights that support retention and adoption decision-making.

## Graph Edges

- reads_context -> metrics data, initiative state, retention/adoption context
- produces -> cohort_insight
