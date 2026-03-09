---
name: summarize-interview
description: Summarize interview transcripts into structured research findings for PM intake and prioritization.
sourcePlugin: pm-product-discovery
sourceAsset: summarize-interview
delegationPattern: intake-prioritization
importStrategy: import
executionMode: server
phase: discovery
requiredArtifacts: [transcript, product-vision, strategic-guardrails, personas]
producedArtifacts: [research_summary, signal_observation]
---

# Summarize Interview

Convert transcript-level signal into concise research output that downstream PM workflows can reuse.

## Graph Edges

- reads_context -> product-vision, strategic-guardrails, personas, transcript/signal
- produces -> research_summary, signal_observation
