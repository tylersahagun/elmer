# Flagship Meeting Recap PRD

> **Merged:** This initiative is now consolidated into `chief-of-staff-recap-hub`.  
> Source of truth: `pm-workspace-docs/initiatives/chief-of-staff-recap-hub/`.

## Overview

**Owner:** Tyler Sahagun  
**Target Release:** Q1 2026  
**Status:** Draft  
**Strategic Pillar:** Data Knowledge + Trust Foundation

Transform the meeting recap experience from a workflow byproduct into a first-class, flagship artifact. Users configure their meeting summaries through natural conversation, see beautiful dedicated views, and edit outputs in-place without navigating to workflows.

This initiative establishes the "zero to one" foundation for AskElephant's core value proposition: turning customer conversations into trusted, actionable insights.

---

## Outcome Chain

```
Chat-based meeting recap configuration enables natural language template setup
  → so that users can customize recaps without learning workflow complexity
    → so that they actually use and trust AI-generated meeting content
      → so that they engage more deeply with AskElephant daily
        → so that we reduce adoption-related churn (currently 42%)
          → so that NRR improves and expansion opportunities increase
```

**Secondary Chain (Communication Channels):**

```
Channel selection (Slack, HubSpot, Teams, email) for recap delivery
  → so that recaps arrive where users already work
    → so that manual CRM logging decreases
      → so that rep productivity increases
        → so that customers see ROI on AskElephant investment
```

---

## Problem Statement

### The Problem

Today, to get a meeting recap, users must:

1. Navigate to Workflows
2. Create or find the right workflow
3. Configure prompts, triggers, and output settings
4. Test with a real call (no preview)
5. Wait for output in a chat thread
6. If they don't like it, hunt for the workflow to edit

**This is unacceptable for our flagship experience.**

The result: 42% of churn is "failure to adopt" — users never see value because the complexity barrier is too high.

### Who Has This Problem

| Persona          | Pain Level | Current Workaround                        |
| ---------------- | ---------- | ----------------------------------------- |
| **Sales Rep**    | High       | Ignores AI outputs, takes manual notes    |
| **CSM**          | High       | Uses separate note tool (Fathom, Granola) |
| **Sales Leader** | Medium     | Gets inconsistent recap quality from team |
| **RevOps**       | Low        | Doesn't interact with recaps directly     |

### Why Now

1. **Sam's directive (Jan 27):** "Prioritize a flagship meeting summary experience"
2. **Churn data:** 42% of churns are adoption failure (Slack synthesis)
3. **Competitive pressure:** Fathom wins on simplicity despite fewer features
4. **Global Chat readiness:** Feb 1 beta enables in-place editing pattern
5. **Portable Artifacts:** Matt's work unblocks dedicated artifact views

### Evidence

| Source                  | Quote                                                                            |
| ----------------------- | -------------------------------------------------------------------------------- |
| Tyler-Sam (Jan 28)      | "You should never have to actually edit a workflow just to get a meeting recap"  |
| Sam (Jan 27)            | "A workflow an average user doesn't wanna deal with... it's too complicated"     |
| Tyler (Council, Jan 26) | "Here's 47 workflow outputs and chats that you will never look at"               |
| CSM Team (Slack)        | "Workflows will not re-run when you make changes... onboarding gap"              |
| Customer (Slack)        | "Gong workflows are pretty shit, to be honest. So I'm happier with this system." |
| Churn Data              | 42% of churns attributed to "failure to adopt"                                   |

---

## Goals & Non-Goals

### Goals (Measurable)

| Goal                              | Metric                        | Target                            |
| --------------------------------- | ----------------------------- | --------------------------------- |
| Reduce time to first custom recap | Setup completion time         | < 3 minutes (from ~30 min)        |
| Increase recap engagement         | Views per user per week       | 3x baseline                       |
| Reduce adoption churn             | "Failure to adopt" churn rate | -30%                              |
| Improve output customization      | Users with custom templates   | 50%+ of active users              |
| Enable channel delivery           | Recaps delivered externally   | 25% of recaps pushed to Slack/CRM |
| Increase ops trust in sharing     | Audit trail + source usage    | 80% of shared recaps verified     |

### Non-Goals

| Non-Goal                                      | Reasoning                                                             |
| --------------------------------------------- | --------------------------------------------------------------------- |
| **Replace Workflows entirely**                | Power users still need full workflow builder; this is the "easy path" |
| **Build custom templates for every use case** | AI should generate from natural language; we don't ship 100 templates |
| **Real-time in-call summaries**               | Out of scope; focus on post-meeting experience first                  |
| **Multi-language support**                    | English only for MVP; i18n in future                                  |
| **Mobile-native experience**                  | Web-first; mobile gets responsive version                             |

---

## User Personas

### Primary: Sales Representative ("Rachel Rep")

**Job-to-be-done:** Get useful meeting notes without extra work

**Current pain:**

- Workflow setup is intimidating
- Outputs buried in chat threads
- Editing requires finding workflow, then prompt, then the right section
- Notes don't match how she thinks about different call types

**Success looks like:**

- Finishes meeting, sees beautiful recap in 2 clicks
- Different templates for discovery vs demo vs follow-up calls
- Says "I want it more bullet-pointed" and it changes for all future calls
- Clicks one button to push to HubSpot deal timeline

**Trust factors:**

- Needs to verify AI didn't hallucinate before sharing
- Wants to know recap matches call type correctly
- Must be able to edit before pushing externally

### Secondary: Customer Success Manager ("Casey CSM")

**Job-to-be-done:** Track customer health through conversation insights

**Current pain:**

- Configuring separate workflows for onboarding vs QBR vs escalation
- No visibility into which template ran on which call
- Can't quickly adjust format for different account types

**Success looks like:**

- Onboarding calls auto-get onboarding template
- QBRs auto-get QBR template with renewal focus
- One click to share recap with account team in Slack

**Trust factors:**

- Accuracy on customer name/company critical
- Must not expose internal notes to customer
- Wants confirmation before external share

### Tertiary: Sales Leader ("Larry Leader")

**Job-to-be-done:** Review team calls efficiently, coach effectively

**Current pain:**

- Inconsistent recap quality across team
- Has to open each meeting, find the chat, scroll to output
- Can't enforce recap standards across team

**Success looks like:**

- Team uses consistent templates by call type
- Coaching tab surfaces coaching insights alongside recap
- Can see recap + coaching in one view without navigation

**Trust factors:**

- Needs to trust AI coaching suggestions are accurate
- Wants to know which rep customized which templates

---

## User Stories

### Epic 1: Chat-Based Configuration

**As a** Sales Rep,  
**I want to** configure my meeting recap templates through a conversation,  
**So that** I can describe what I want in plain English instead of learning workflow settings.

#### Acceptance Criteria

- [ ] Onboarding flow asks "What types of calls do you have?" via chat
- [ ] User can respond naturally (e.g., "discovery calls, demos, follow-ups")
- [ ] System creates tagged templates for each type mentioned
- [ ] User can say "I want more bullet points" and AI adjusts template
- [ ] Live preview shows example output as user configures
- [ ] Configuration completes in < 3 minutes
- [ ] Delivery channel defaults set during setup (Slack/HubSpot/Teams/email)

---

### Epic 2: Dedicated Artifact Views

**As a** Sales Rep,  
**I want to** see my meeting recap as a dedicated, beautiful page,  
**So that** I can quickly scan the content without digging through chat threads.

#### Acceptance Criteria

- [ ] Meeting page has tabs: Recap | Coaching | Prep | [Custom]
- [ ] Each tab shows polished artifact (not raw markdown)
- [ ] User can pin/unpin tabs
- [ ] Default tab is "Recap"
- [ ] Tabs only appear if content exists (no empty tabs)
- [ ] Mobile-responsive layout

---

### Epic 3: In-Place Editing

**As a** Sales Rep,  
**I want to** edit my recap template directly from the meeting page,  
**So that** I don't have to navigate to workflows when I see something I don't like.

#### Acceptance Criteria

- [ ] Feedback icon visible on recap artifact (PostHog-style dotted line)
- [ ] Clicking opens global chat with recap context pre-loaded
- [ ] User can say "Make this more concise" or "Add a section for next steps"
- [ ] AI updates the template (affects future calls)
- [ ] Current recap regenerates with new template (optional user choice)
- [ ] Change is visible immediately in preview
- [ ] "Template impact" preview shows which call types will change before saving

---

### Epic 4: Per-Meeting-Type Templates

**As a** Sales Rep,  
**I want to** have different recap formats for different call types,  
**So that** discovery calls, demos, and follow-ups each have appropriate structure.

#### Acceptance Criteria

- [ ] Meeting tags (Discovery, Demo, Onboarding, QBR, Internal) map to templates
- [ ] User can create custom tags with custom templates
- [ ] Auto-detection suggests tag based on calendar + participants
- [ ] User can override auto-detected tag
- [ ] If multiple tags apply, user selects primary template
- [ ] Recap header includes a one-click "Change meeting type" action (esp. low confidence)

---

### Epic 5: Communication Channel Selection

**As a** Sales Rep,  
**I want to** send my recap to Slack, HubSpot, or email,  
**So that** my notes arrive where I already work without copy-pasting.

#### Acceptance Criteria

- [ ] Recap page has "Share" button with channel options
- [ ] Channels include: Slack (DM/channel), HubSpot (deal/contact activity), Teams, Email
- [ ] User can set default channel during template setup
- [ ] Preview shows how recap will appear in selected channel
- [ ] Explicit confirmation before external send (trust safeguard)
- [ ] Share blocked if privacy determination is pending
- [ ] Pre-share checklist summarizes privacy status + destination audience
- [ ] Share action logged (timestamp + destination + actor)

---

### Epic 6: Auto-Running Meeting Prep

**As a** Sales Rep,  
**I want to** see meeting prep automatically before my calls,  
**So that** I'm prepared without manually triggering a workflow.

#### Acceptance Criteria

- [ ] Prep tab populates automatically 1 hour before scheduled meeting
- [ ] Prep runs without user intervention
- [ ] Prep visible as tab on meeting page (not hidden in artifact)
- [ ] User can regenerate prep on demand
- [ ] Prep includes: attendee background, recent interactions, key points from last meeting

---

### Epic 7: Audit Trail + Source Attribution

**As a** RevOps / Operations gatekeeper,  
**I want to** see where recap content came from and who shared it,  
**So that** I can approve sharing and maintain compliance.

#### Acceptance Criteria

- [ ] Recap view shows sources (transcript, CRM, calendar) with confidence
- [ ] Audit trail lists template edits, share actions, and privacy overrides
- [ ] Audit trail is a primary panel with export affordance for ops
- [ ] Share log includes actor, destination, and timestamp
- [ ] Export audit trail (CSV/PDF) from the recap view
- [ ] Ops can export the audit trail for compliance

---

## Requirements

### Must Have (MVP)

| Req    | Description                                     | Rationale                                         |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| **R1** | Chat-based template configuration               | Core value proposition; removes workflow friction |
| **R2** | Live preview during configuration               | Users need to see output before committing        |
| **R3** | Tabbed artifact view on meeting page            | Dedicated experience vs buried in chat            |
| **R4** | Recap tab as default                            | Most common artifact type                         |
| **R5** | Per-meeting-type templates (3 default)          | Discovery, Demo, Follow-up as starting templates  |
| **R6** | In-place feedback icon → global chat            | Closes the edit loop without navigation           |
| **R7** | Template persistence per user                   | Personal customization saved                      |
| **R8** | Audit trail + source attribution + export       | Ops visibility + compliance readiness             |
| **R9** | Privacy gating + share confirmation + checklist | Prevents accidental external exposure             |

### Should Have

| Req     | Description                | Rationale                       |
| ------- | -------------------------- | ------------------------------- |
| **R10** | Slack channel selection    | Top channel request             |
| **R11** | HubSpot activity push      | Core CRM integration value      |
| **R12** | Auto-detected meeting type | Reduces manual tagging friction |
| **R13** | Coaching tab               | Pairs with recap for full value |
| **R14** | Prep tab (auto-run)        | Proactive intelligence vision   |
| **R15** | Custom tags creation       | Power user flexibility          |

### Could Have

| Req     | Description                                | Rationale                        |
| ------- | ------------------------------------------ | -------------------------------- |
| **R16** | Teams channel selection                    | Secondary channel                |
| **R17** | Email recap delivery                       | Requested but lower priority     |
| **R18** | Team template inheritance                  | Leader → rep template cascade    |
| **R19** | Template analytics                         | See which templates perform best |
| **R20** | Regenerate current recap with new template | Nice-to-have for immediate fix   |

---

## User Flows

### Flow 1: First-Time Template Setup

**Trigger:** User completes onboarding or clicks "Configure Recap" in settings

**Steps:**

```
1. Chat opens: "Let's set up your meeting recaps! What types of calls do you have?"
                                        ↓
2. User responds: "Discovery calls, demos, and follow-ups"
                                        ↓
3. AI: "Great! I'll create templates for each. Let's start with Discovery calls.
       Here's a preview → [ARTIFACT PREVIEW]
       What would you change?"
                                        ↓
4. User: "Make it more bullet-pointed, less narrative"
                                        ↓
5. AI updates preview, shows new artifact
                                        ↓
6. User: "Perfect"
                                        ↓
7. AI: "Discovery template saved! Now let's do Demos..."
                                        ↓
8. AI: "Choose delivery channels (Slack, HubSpot, Teams, email) for default sharing."
                                       ↓
9. User selects channels
                                       ↓
10. AI: "All set! Your recaps will now use these templates automatically.
       You can always edit them by clicking the feedback icon on any recap."
```

**Outcome:** User has 3 custom templates in < 3 minutes

**Error states:**

- User doesn't respond → reminder after 30s, save partial progress
- User says something unclear → AI asks clarifying question
- Preview fails to generate → show skeleton with "Generating preview..."

**Trust recovery:**

- Always show "You can change this anytime"
- Provide "Reset to default" option

---

### Flow 2: Viewing Recap After Meeting

**Trigger:** Meeting ends, user navigates to meeting page

**Steps:**

```
1. Meeting page loads with tab bar: [Recap] [Coaching] [Prep]
                                        ↓
2. Recap tab active by default, shows polished artifact
                                        ↓
3. User scans recap, sees something they don't like
                                        ↓
4. User clicks feedback icon (top-right corner)
                                        ↓
5. Global chat opens with context: "I'm looking at the recap for [meeting].
  What would you like to change?"
                                        ↓
6. User: "Add a section for competitor mentions"
                                        ↓
7. AI: "I'll add that to your Discovery template. Preview: [ARTIFACT]
       Apply to future calls?"
                                        ↓
8. User: "Yes"
                                        ↓
9. Template saved, confirmation shown
```

**Outcome:** Template updated without leaving meeting page

**Error states:**

- Global chat unavailable → show "Edit in Workflows" fallback link
- AI can't parse request → ask clarifying question

**Trust recovery:**

- Show "This changes future recaps, not past ones" (or offer to regenerate)
- Undo option for template changes

---

### Flow 3: Sharing Recap to Channel

**Trigger:** User clicks "Share" on recap artifact

**Steps:**

```
1. Share modal opens with channel options:
  [Slack] [HubSpot] [Teams] [Email] [Copy]
                                        ↓
2. User selects "HubSpot"
                                        ↓
3. Modal shows: "Add to: [Deal: Acme Corp Q1] | [Contact: John Smith]"
  Preview: [How it will appear in HubSpot]
                                        ↓
4. User confirms "Add to Deal" + checks explicit share confirmation
                                        ↓
5. Recap pushed to HubSpot activity timeline
                                        ↓
6. Success confirmation with link to view in HubSpot
```

**Outcome:** Recap in CRM without copy-paste

**Error states:**

- HubSpot disconnected → prompt reconnection
- Deal/contact not found → search interface
- Push fails → retry with error message

**Trust recovery:**

- Always show preview before send
- "Edit before sending" option
- Confirmation required (no auto-push without consent)

---

## Trust & Privacy Considerations

### Privacy Determination Integration

- **Prerequisite:** Privacy Determination Agent must classify meeting privacy BEFORE recap generates
- **Behavior:** If meeting is "Private," recap only visible to attendees
- **Sharing:** Private meeting recaps cannot be shared externally without explicit override
- **Audit:** Log all share actions for compliance
- **Share Gate:** Explicit confirmation before any external delivery
- **Share Block:** Share blocked while privacy status is pending (status chip shown)

### Trust Safeguards

| Risk                                  | Mitigation                                                   |
| ------------------------------------- | ------------------------------------------------------------ |
| AI hallucinates customer name/company | Show source attribution; user can verify before sharing      |
| Wrong template applied                | Show detected type; user can override before recap generates |
| Recap shared to wrong channel         | Confirmation modal with preview; undo within 30s             |
| Template edit has unintended effects  | "Preview on sample meeting" before saving template           |
| Auto-detected tag is wrong            | Allow manual override; learn from corrections                |
| Ops cannot audit sharing              | Audit trail panel + exportable log                           |

### Data Handling

- Templates stored per-user in user preferences
- No meeting content stored in template (only structure/prompts)
- Share audit log retained for compliance
- User can delete all templates (reset to defaults)

---

## Success Metrics

### North Star

**Recap Engagement Rate:** % of meetings where user views the recap within 24 hours

| Baseline         | Target | Timeline |
| ---------------- | ------ | -------- |
| ~15% (estimated) | 50%    | Q2 2026  |

### Leading Indicators

| Metric                         | Current | Target  | Rationale                       |
| ------------------------------ | ------- | ------- | ------------------------------- |
| Template setup completion rate | N/A     | 80%+    | Users finish configuration      |
| Time to first custom template  | ~30 min | < 3 min | Friction reduction              |
| In-place edits per user/month  | N/A     | 2+      | Users actively customizing      |
| Channel shares per user/month  | N/A     | 5+      | Value flowing to external tools |

### Lagging Indicators

| Metric                   | Current | Target  | Rationale         |
| ------------------------ | ------- | ------- | ----------------- |
| "Failure to adopt" churn | 42%     | < 30%   | Primary outcome   |
| NPS for meeting recaps   | Unknown | 40+     | User satisfaction |
| Weekly active users      | X       | X + 20% | Engagement lift   |

### Guardrails

| Guardrail                            | Threshold | Action if Exceeded      |
| ------------------------------------ | --------- | ----------------------- |
| Template errors (wrong type applied) | < 5%      | Improve detection model |
| Share failures                       | < 1%      | Investigation required  |
| Template setup abandonment           | < 30%     | UX simplification       |

---

## Strategic Alignment Checklist

- [x] **Outcome chain complete:** Feature → engagement → retention → NRR
- [x] **Persona validated:** Sales Rep primary, CSM secondary, Leader tertiary
- [x] **Trust implications assessed:** Privacy determination integration, confirmation before share
- [x] **Not in anti-vision territory:** This IS our flagship experience, not generic notes
- [x] **Evidence exists:** 5+ signal sources, quantified churn data, leadership alignment

### Strategic Fit Score: 28/30

| Dimension           | Score | Notes                                                |
| ------------------- | ----- | ---------------------------------------------------- |
| Trust Foundation    | 5/5   | Builds confidence through polished, reliable outputs |
| Outcome Orientation | 5/5   | Clear chain to retention and engagement              |
| Human Empowerment   | 5/5   | Chat config keeps humans in control                  |
| Data Capture        | 4/5   | Improves recap utility, not capture itself           |
| Differentiation     | 5/5   | Unique chat-first config approach                    |
| Expansion Driver    | 4/5   | Better recaps → more engagement → expansion          |

---

## Technical Considerations

### Architecture Notes (For Engineering)

- **Template Storage:** User preferences in Firestore (existing pattern)
- **Recap Generation:** Existing workflow engine, new output rendering
- **Chat Configuration:** Extends global chat with template context
- **Channel Integrations:** Slack (existing), HubSpot (existing), Teams (new)
- **Meeting Type Detection:** ML model on calendar metadata + participant list

### Dependencies

| Dependency            | Owner    | Status            |
| --------------------- | -------- | ----------------- |
| Global Chat           | Rob      | Feb 1 beta        |
| Portable Artifacts    | Matt     | In progress       |
| Privacy Determination | Jason    | Awaiting sign-off |
| HubSpot Activity Push | Palmer   | CRM-ETE scope     |
| Slack Integration     | Existing | ✅ Available      |

### Performance Requirements

- Recap artifact loads in < 500ms
- Template preview generates in < 2s
- Channel push completes in < 5s
- Chat response time < 3s

---

## Risks & Mitigations

| Risk                                       | Impact | Likelihood | Mitigation                                 |
| ------------------------------------------ | ------ | ---------- | ------------------------------------------ |
| Meeting type detection inaccurate          | Medium | Medium     | Manual override + learning loop            |
| Users confused by chat config              | High   | Low        | Progressive disclosure; fallback to wizard |
| Template changes break existing workflows  | High   | Medium     | Migration path; parallel systems           |
| Channel push permissions fail              | Medium | Medium     | Clear error messages; reconnection flow    |
| Scope creep into full workflow replacement | High   | Medium     | Explicit non-goal; phase gating            |

---

## Open Questions

1. **Migration:** How do existing workflow power users transition? Parallel paths or migration wizard?
2. **Templates Marketplace:** Should users be able to share/import templates?
3. **Team Hierarchy:** Can leaders set templates that override individual user settings?
4. **Offline Support:** What happens if meeting recap can't generate (e.g., API failure)?
5. **Multiple Templates:** If a call matches multiple types, how do we handle?
6. **Branding:** Should recap artifacts have AskElephant branding for external share?

---

## Timeline

| Milestone               | Target Date | Status         |
| ----------------------- | ----------- | -------------- |
| PRD Complete            | 2026-01-28  | ✅ Draft       |
| Design Brief            | 2026-01-31  | ⬜ Not Started |
| Engineering Feasibility | 2026-02-03  | ⬜ Not Started |
| Prototype (Storybook)   | 2026-02-07  | ⬜ Not Started |
| Sam/Leadership Review   | 2026-02-10  | ⬜ Not Started |
| Development Start       | 2026-02-14  | ⬜ Not Started |
| Beta                    | TBD         | ⬜             |
| GA                      | TBD         | ⬜             |

---

_Last updated: 2026-01-30_  
_Owner: Tyler Sahagun_
