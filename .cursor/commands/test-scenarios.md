---
sourcePlugin: pm-execution
sourceAsset: test-scenarios-command
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: validate
requiredArtifacts: [prd, stories, prototype-notes]
producedArtifacts: [test_scenario_pack]
---

# Test Scenarios

**Uses**: test-scenarios

Package validation scenarios for QA, rollout readiness, and handoff.

## Graph Edges

- uses_skill -> test-scenarios
- reads_context -> PRD, stories, prototype notes
- produces -> test_scenario_pack
