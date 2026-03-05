# Chief of Staff Source Packet

Last updated: 2026-02-17  
Owner: Tyler

## Purpose

This packet consolidates reusable evidence for the Chief of Staff parent initiative and five sub-initiatives:

- Meeting Summary
- Meeting Prep
- Daily Brief
- Weekly Brief
- Action Items

## Strategic framing

Chief of Staff is a proactive, interactive operating experience for revenue teams. It is not a meeting-only dashboard and not workflow configuration UI. It converts fragmented signals (meetings, CRM, Slack, email, calendar, tasks) into role-aware actions and trusted artifacts.

## Core user problem (synthesis)

Users currently navigate workflow sprawl to get value:

1. Find the right workflow/recipe
2. Open meeting
3. Open a workflow output
4. Duplicate/edit workflow to change format
5. Re-route it to correct audience and hope settings are right

This creates high friction, low trust, and low reuse of outputs.

## Supporting evidence and quotes

### Internal leadership/product signals

- "Tell me what you've done, what needs approval, and what's scheduled." (Rob)
- "I don't want to click a meeting then a workflow out of a thousand workflows." (Sam)
- "These workflows don't generate a chat. They generate artifacts." (Sam)
- "Right now, to generate a meeting recap, you have to go to workflows..." (Tyler)
- "Part of the problem is that... you have so many outputs and it's just so muddied by the view." (Tyler)
- "If I log in at 8AM, my home page is actually different than if I log in at 5PM." (Rob feedback synthesis)
- "Each meeting is like its own card... boom boom boom... I just saved four hours." (Rob feedback synthesis)

Primary source docs:

- `pm-workspace-docs/initiatives/archived/chief-of-staff-recap-hub/prd.md`
- `pm-workspace-docs/initiatives/archived/chief-of-staff-recap-hub/research.md`
- `pm-workspace-docs/initiatives/active/agent-command-center/prd.md`
- `pm-workspace-docs/initiatives/active/agent-command-center/prototype-notes.md`
- `pm-workspace-docs/floating-docs/chief-of-staff-slack-draft-for-rob.md`

## Existing quantitative anchors

- Adoption-related churn signal: 42% (internal synthesis reference)
- v10 prototype validation: 88% would-use, 4.35/5 average
- v10 top feature: rapid-fire meeting clearing (4.7/5)

## Outcome matrix draft (parent initiative)

### Customer outcome

Revenue users can review, edit, and execute post-meeting and daily/weekly decisions in one proactive flow, without workflow setup burden.

### Business outcome

Higher daily active usage and lower adoption churn through faster time-to-value and stronger action completion.

### Success properties (4)

1. Time to first useful artifact (meeting summary or brief) under 2 minutes
2. Daily/weekly brief engagement from cross-signal inputs (not meeting-only) above 50% of targeted users
3. Action completion within 24 hours above 60% for surfaced recommendations
4. Adoption churn trend improves versus baseline cohort

## Sub-initiative evidence mapping

### Meeting Summary

- Pain: summary exists as workflow output, not editable first-class artifact
- Needed capabilities: template library, AI rewrite, section-level edit, meeting-type defaults

### Meeting Prep

- Pain: prep requires manual context gathering from prior calls, CRM, and open tasks
- Needed capabilities: pre-meeting context pack and role/persona-specific prep checklist

### Daily Brief

- Pain: meeting-only lens misses operational context
- Needed capabilities: "newspaper" style readout across meetings, Slack, CRM, email/calendar, and suggested actions

### Weekly Brief

- Pain: weak historical continuity and trend tracking
- Needed capabilities: weekly rollup, carry-forward items, and progress against goals

### Action Items

- Pain: actions are scattered and easy to miss
- Needed capabilities: consolidated action queue, rationale/evidence, approval/edit flow, and follow-up scheduling intelligence

## Hypothesis set for feedback linking

- `hyp-chief-of-staff-first-class-artifacts`: First-class artifacts will increase recap and brief engagement
- `hyp-chief-of-staff-cross-signal-brief`: Cross-signal daily/weekly brief will outperform meeting-only recap view
- `hyp-chief-of-staff-action-first`: Action-first ordering improves completion and perceived value
- `hyp-chief-of-staff-template-edit-loop`: AI-editable templates reduce setup time and increase trust

## Open research gaps

1. External customer validation for daily and weekly brief interaction model (2-3 interviews minimum)
2. Baseline instrumentation for approval completion and action completion rates
3. Persona-level thresholding for what auto-runs versus what requests approval
4. Historical snapshot behavior for daily brief (immutable daily snapshots vs dynamic feed)
