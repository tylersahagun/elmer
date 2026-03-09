---
name: user-stories
description: Generate implementation-ready user stories from PRD and persona context.
sourcePlugin: pm-execution
sourceAsset: user-stories
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: define
requiredArtifacts: [prd, personas, prototype-notes]
producedArtifacts: [user_stories]
---

# User Stories

Translate product intent into clear user-centered implementation stories.

## Graph Edges

- reads_context -> PRD, personas, prototype notes
- produces -> user_stories
