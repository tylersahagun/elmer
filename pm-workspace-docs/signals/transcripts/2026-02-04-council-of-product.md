# Transcript: Council of Product - Weekly Sync

**Date:** 2026-02-04
**Source:** Internal Product Meeting
**Duration:** 82 minutes
**Participants:** Bryan, Sam, Woody, Tony, Skylar, Rob, Tyler (speaker attribution mixed)

## TL;DR

Council of Product focused on the CRM/HubSpot experience and Global Chat as an entry experience. Major gaps: we lack analytics on CRM workflow enablement and drop-off, users cannot see what AskElephant is doing or fix errors easily, and internal comms are feature-led rather than end-to-end story-led. Action emphasis: instrument HubSpot workflow usage in PostHog, deprecate non-working HubSpot nodes, ship training/videos and a clear end-to-end CRM agent narrative, and clarify builder vs user experience. Global Chat is viewed as an AI-first interface, but only if trust/permissions and training are solid.

## Key Decisions

- **CRM experience remains priority:** Global Chat is not a pivot away from CRM updates; it should be an interface into workflows, not a replacement.
- **Wait for data before heavy investment:** Use PostHog analytics to validate where HubSpot workflow adoption is breaking before large rework.
- **Deprecate non-working HubSpot nodes:** Stop new usage of v1/v2 nodes and plan migration off them.
- **Product storytelling shift:** Updates should be communicated as end-to-end user journeys (setup → value → adjust → ongoing), not isolated features.

## Action Items

- [ ] **Instrument HubSpot workflow usage in PostHog** (tool usage, workflow enablement, drop-off points) and backfill data where possible.
- [ ] **Deprecate non-working HubSpot nodes** (v1/v2) and prevent new workflows from using them.
- [ ] **Confirm release status** for the new HubSpot engagement page experience and gather initial partner feedback.
- [ ] **Create training content** (Looms): workflow builder overview, HubSpot agent walkthrough, structured HubSpot agent usage, and end-to-end CRM agent journey.
- [ ] **Rename HubSpot agent variants** to reduce confusion (e.g., “templated/structured” vs “custom/DIY”).
- [ ] **Define the end-to-end CRM agent story** (setup → value visibility → adjust/fix → ongoing use) and share with revenue team.
- [ ] **Schedule hackathon demo time** (end of week) and confirm attendance.
- [ ] **Align on Linear boundaries** (product vs engineering granularity, finish lines) and discuss workspace/label structure.

## Problems Identified

### Problem 1: No clear analytics on CRM workflow adoption

We have conversation data, but lack operational metrics on tool usage, workflow enablement, and drop-off.

### Problem 2: Users can’t see or trust what AskElephant is doing

Users lack a single place to see CRM updates, understand changes, or fix errors; value is hidden behind multiple clicks.

### Problem 3: Workflow builder trust breaks after first failure

Users use AI to generate the skeleton, but then abandon prompts and manually edit when it fails.

### Problem 4: HubSpot agent surface area is confusing

Too many overlapping node/agent choices; naming does not clarify when to use each.

### Problem 5: Product comms are feature-first, not story-first

Revenue team needs a coherent user story to communicate value and roadmap progression.

### Problem 6: Global Chat adoption blocked by trust/permissions

Concern about unintended actions (e.g., emails sent without approval) blocks “chat-first” entry.

### Problem 7: Tracking boundaries in Linear remain unclear

Engineering wants discrete finish lines; product seeks longer-lived ownership; system needs clarity.

## Feature Requests & Ideas

- **Global Chat as entry experience** with permission gating (“allow once”) and proactive prompts.
- **Notification engine** for completed work and value surfaced (Slack + in-app).
- **Single-page CRM update view** showing what changed and why, with human-in-loop approvals.
- **Inline assistant for workflow builder** to edit prompts or suggest fixes when users change nodes.
- **Structured HubSpot agent** with explicit object/property control and editable dependencies.
- **Product slides “Now / Next / Later”** to communicate progress and build confidence weekly.

## Research & Evidence Needed

- **Workflow usage analytics:** who enables HubSpot workflows, where they drop off, and time-to-value.
- **User journey study:** setup vs ongoing usage; how users discover value and how they fix mistakes.
- **Builder vs user experience split:** validate needs for RevOps/admins vs everyday reps.
- **Adoption drivers:** measure how often users log into AskElephant vs Slack vs CRM for updates.
- **10 real workflow examples:** gather before/after quality and where edits were made.

## Strategic Alignment

- ✅ **CRM agent upgrades** align with “Outcomes > Outputs” and revenue operating system goals.
- ✅ **Global Chat as AI-first UX** aligns with product principles if trust/permissions are solved.
- ⚠️ **Transparency gap** risks trust foundation and perceived value.
- ⚠️ **Comms gap** risks internal and customer confidence in roadmap.

## Key Quotes

> “The big piece we’re missing is actually the data… we don’t have good data to tell us what the actual technical problem is.”

> “There isn’t ever one place where it’s telling me, ‘This is what’s happening’… I don’t know how to fix it.”

> “We need to deprecate… the v1 and v2 that are actually causing more friction than anything.”

> “We need to create videos… RevOps people have not seen that.”

> “We’re in feature mindset… we need the end-to-end story.”

## Related Initiatives

- `global-chat`
- `crm-exp-ete` / HubSpot agent upgrades
- `workflow-builder`
- `notification-engine`
- `chief-of-staff-hub` / rep workspace
- `posthog-instrumentation`

## Related Signals

- `sig-2026-01-26-council-of-product`
- `sig-2026-01-26-hubspot-salesforce-update`
- `sig-2026-01-16-internal-crm-exp-ete-planning`
- `sig-2026-02-01-voice-memo-workflow-clarity-worries`
