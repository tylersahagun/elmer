# Research: Settings Redesign

## Summary
Settings page redesign based on verbal recording audit. Key focus on privacy agent scope clarification - workspace settings now explicitly run on managers/owners only, not users. Includes clear labeling and user ability to mark things public.

## Source
- **Meeting:** Product Planning Session
- **Date:** 2026-01-16
- **Participants:** Skylar, Tyler, Woody, Bryan

## Key Decisions Made

### Decision 1: Prototype Today
**Status:** Committed
**Details:**
> "Settings. Are you moving to the emergency settings today? Yeah. This one probably is the most I can go now. We're gonna pretty much a copy of the same with rep workspace. Last night, I did a verbal recording audit of all the things."

**Timeline:** Today

### Decision 2: Privacy Agent Scope - Managers/Owners Only
**Status:** CONFIRMED (Verbal Yes from all)
**Details:**
> "The privacy agent on the workspace settings is only going to run managers and owners for now, but we're going to change the title and how explicit it says that this is for managers and owners only."

**Key Points:**
- Workspace settings run on managers/owners calls ONLY
- NOT on user calls
- Must be explicitly labeled

### Decision 3: Users Can Mark Public (Not Private)
**Status:** CONFIRMED
**Details:**
> "Users should not be able to mark things private, but they should be able to mark things public."

> "If they're the host of the meeting, I don't care if they have the public."

**Rationale:** Users can't change things back to public if agent marks private, so don't let agent run on their calls

### Decision 4: Clear Labeling Required
**Status:** Required
**Details:**
> "The thing that's important is that on the workspace settings, it doesn't say workspace. Like, will it work there? Like, you have to make it feel like this is a manager owner setting, not a workspace setting."

**Requirement:** Make it feel like "manager/owner setting" not "workspace setting"

### Decision 5: Personal Settings Option
**Status:** Required
**Details:**
> "If you want to change your own personal settings, do it here on the personal setting."

**Flow:**
- Workspace settings: Managers/owners only
- Personal settings: Available to individuals

## Key Quotes

**On Privacy Agent Scope:**
> "We are not having the privacy agent on any users' calls, the user as it will."

**On Clarity:**
> "In the workspace settings for the privacy issue, it would be relabeled to state very clearly this rule set will run on any manager or owner calls in the workspace. If you'd like your own private settings, this is where you can do it."

**Verbal Confirmations:**
> "Verbal yes for me. I'm on work."
> "Yeah."
> "Okay. It's on the same."

## User Problems Identified
| Problem | Severity | Frequency | Evidence |
|---------|----------|-----------|----------|
| Confusion about privacy scope | High | Common | Long discussion about what runs on whom |
| Users can't undo privacy agent changes | High | Common | "Users, because they can't change it to private or public, if it marks as private, they can't change it back" |
| Workspace vs personal settings unclear | High | Common | "It doesn't say workspace... you have to make it feel like this is a manager owner setting" |

## Privacy Agent Rules Summary

| Setting Type | Runs On | User Can Change |
|--------------|---------|-----------------|
| Workspace Privacy Settings | Managers & Owners only | N/A |
| Personal Privacy Settings | Individual (self) | Yes |
| User Calls | NOT affected by workspace | User can mark PUBLIC only |

## Feedback Request
**Details:**
> "We need to add something where they can, like, where maybe we do ask for feedback where it's like, we'd like you we'd like to control user's privacy settings, you know, submit feedback here."

**Purpose:** Gauge demand for user-level privacy control

## Action Items
| Owner | Task | Timeline |
|-------|------|----------|
| Skylar/Tyler | Build settings prototype | Today |
| Team | Update workspace settings labeling | Today |
| Team | Add "personal settings" section | Today |
| Team | Add feedback request for user privacy control | Today |
| Jason | Implement privacy agent changes | Today (end of day for open beta) |

## Dependencies
- Privacy Determination Agent v2
- FGA Engine (for future user group controls)
- User Onboarding (privacy settings education)

## Open Questions
1. How do we communicate the scope change to existing users?
2. Should personal privacy settings be part of user onboarding?
3. What's the path to enabling user-level privacy control in the future?

## Related Initiatives
- Privacy Determination Agent (current/privacy-determination-agent-v2)
- FGA Engine (current/fga-engine)
- User Onboarding
- Admin Onboarding
