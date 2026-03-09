---
name: create-prd
description: Produce a structured PRD from research evidence and initiative context.
sourcePlugin: pm-execution
sourceAsset: create-prd
delegationPattern: definition-handoff
importStrategy: import
executionMode: server
phase: define
requiredArtifacts: [research, initiative-metadata, strategic-guardrails]
producedArtifacts: [prd_document]
---

# Create PRD

Generate PRD-ready content that ties user evidence to business outcomes and scoped delivery.

## Graph Edges

- reads_context -> research, initiative metadata, guardrails
- produces -> prd_document
