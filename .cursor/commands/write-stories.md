---
sourcePlugin: pm-execution
sourceAsset: write-stories
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: define
requiredArtifacts: [prd, personas, prototype-notes]
producedArtifacts: [implementation_story_pack]
---

# Write Stories

**Uses**: user-stories, job-stories

Create implementation-ready story packs from validated product intent.

## Graph Edges

- uses_skill -> user-stories, job-stories
- reads_context -> PRD, personas, prototype notes
- produces -> implementation_story_pack
