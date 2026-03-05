# Multi-Agent + A2UI Decision Memo

Date: 2026-02-01  
Status: Draft  
Owner: Tyler Sahagun

## Decision

Adopt AI SDK 6 (Verse Cell 6) as the agent runtime foundation and proceed with a staged conversion to a multi-agent, A2UI-aligned team experience **only if** we can prove team-level outcome impact in a scoped pilot. Default to a hybrid path: validate outcomes in the existing workspace while preparing the web-first architecture in parallel.

## Context

We have mature single-player workflows (commands, skills, subagents, signals) and a large research corpus. Two new docs propose a full A2UI multi-agent conversion and a broader team app. AI SDK 6 introduces agents, tool approval, MCP OAuth/resources/prompts, structured outputs, and DevTools that directly reduce risk in these proposals.

## Outcome Chain (Required)

Multi-agent + A2UI transparency and approvals  
 → higher trust and clarity in agent actions  
 → greater team adoption of autonomous workflows  
 → faster, higher-quality PM output (PRDs, prototypes, signal synthesis)  
 → measurable revenue outcomes (time-to-close, win-rate enablement, retention)

## Options and Tradeoffs

### Option A: Cursor-first autonomy (fastest)

- Pros: Leverages current system, short timeline, low infra cost
- Cons: Single-user, no true team adoption, limited UI transparency
- Optimizes for: speed, proof of value

### Option B: Web-first team app (platform path)

- Pros: Multi-user adoption, true A2UI UX, scalable tool integrations
- Cons: 18-26 week build, infra cost, higher complexity
- Optimizes for: long-term platform leverage

### Option C: Hybrid (recommended)

- Pros: Keeps momentum, validates outcomes, de-risks infra build
- Cons: Requires strict scope control and phased governance
- Optimizes for: balanced risk and validated investment

## Recommendation

Proceed with **Option C (Hybrid)**. Validate outcomes in the current workspace while aligning design and architecture to AI SDK 6 and A2UI patterns. If pilot metrics prove team adoption and trust improvement, commit to full web migration.

## Why This Fits Our Vision

- Trust-first automation: tool approval + action transparency match the trust pillar
- Human-centered AI: agents act with visible reasoning and user control
- Outcome focus: reduces manual PM work while improving delivery quality

## Risks

- Scope creep into “generic agent platform” (anti-vision risk)
- Underestimating infra effort and team bandwidth
- Trust regressions if approval UX is weak or opaque

## Dependencies

- Brian: feasibility + infra capacity planning
- Skylar/Adam: A2UI UX direction and approval design
- Kenzi: positioning if this becomes a team product

## Success Criteria for the Pilot

- 30-50% reduction in time to produce a PRD or prototype notes
- Demonstrable quality improvement (fewer reworks, clearer decision logs)
- At least 2 team members using the system weekly

## Next Steps

1. Define pilot scope and metrics (1-2 weeks)
2. Align on A2UI UX patterns and tool-approval interaction
3. Run pilot in existing workspace while drafting migration plan
