---
sourcePlugin: pm-execution
sourceAsset: write-prd
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: define
requiredArtifacts: [research, project-state, company-context]
producedArtifacts: [prd_document, structured_memory_entry]
---

# Write PRD

**Uses**: create-prd

Generate a full PRD draft grounded in research and strategic context.

## Graph Edges

- uses_skill -> create-prd
- reads_context -> research, project state, company context
- produces -> prd_document, structured_memory_entry
