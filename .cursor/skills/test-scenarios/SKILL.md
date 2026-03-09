---
name: test-scenarios
description: Build validation scenario sets for implementation and QA handoff.
sourcePlugin: pm-execution
sourceAsset: test-scenarios-skill
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: validate
requiredArtifacts: [prd, stories, prototype-states]
producedArtifacts: [test_scenarios]
---

# Test Scenarios

Create a reusable test-design packet spanning happy paths, edge cases, and failure handling.

## Graph Edges

- reads_context -> PRD, stories, prototype states
- produces -> test_scenarios
