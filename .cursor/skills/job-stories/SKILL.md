---
name: job-stories
description: Generate JTBD-style job stories for engineering and product handoff.
sourcePlugin: pm-execution
sourceAsset: job-stories
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: define
requiredArtifacts: [prd, research, jtbd-context]
producedArtifacts: [job_stories]
---

# Job Stories

Express implementation needs through job stories that preserve situation, motivation, and outcome.

## Graph Edges

- reads_context -> PRD, research, JTBD context
- produces -> job_stories
