# Research: Speaker ID / Voice Print

## Summary
Technical initiative to identify speakers in recordings using voice print technology. Bryan has done extensive POC work that needs to be handed off to Dylan. Working towards a technical POC with GCP cloud console integration.

## Source
- **Meeting:** Product Planning Session
- **Date:** 2026-01-16
- **Participants:** Bryan, Woody, Tyler, Skylar

## Key Decisions Made

### Decision 1: Bryan Handing Off to Dylan
**Status:** In Progress
**Details:**
> "Speaker ID. So speaker ID, I've done a ton of POC work with findings with limited success that I need to pass off to Dylan. And there's a lot better because I've been working on it a while, so that's gonna be a chunk of my day. It's really just something to get information that I've gathered."

**Implication:** Knowledge transfer is the immediate priority

### Decision 2: Working Towards Technical POC
**Status:** In Progress
**Details:**
> "I wanna make sure that he's all well on his way to know how to proceed on that project."

**Goal:** Get Dylan unblocked and productive on the POC

## Technical Research

### Agoma's Approach
**Source:** Deep research by Woody
**Details:**
> "I did a deep research on Agoma and how they do it, and they did use an open source model that they fine tuned."

**Implication:** Fine-tuning open source models is a viable approach

### GCP Cloud Console
**Details:**
> "This one's uniquely complex and kind of a strange way that has to do with, like, GCP and working through the cloud console and all that stuff."

**Implication:** Significant cloud infrastructure work required

### Voice Print Collection
**Details:**
> "Somewhere in line between... three letter test almost thirty to forty second grade is worth a shit statement."

> "They take a... they say it's a thirty to forty second read through to get your voice print. It feels like insane."

**Benchmark:** 30-40 seconds of speech to create voice print

### Quality Considerations
**Details:**
> "We can always increase quality of this going forward, so I have some ideas how to do that. But, ideally, it'll just happen naturally through meetings. But we could do that too for onboarding process if we decide that we need to. Any decision needs to be made right now, though. Let's get to the POC of the technical up, and then we can decide what we need to do short of quality."

**Strategy:** 
1. Get POC working first
2. Decide on quality improvements later
3. Could integrate into onboarding if needed

## User Problems Identified
| Problem | Severity | Frequency | Evidence |
|---------|----------|-----------|----------|
| Inaccurate speaker identification | High | Common | "Limited success" from POC work |
| Need voice samples for identification | Medium | Common | 30-40 second voice print requirement |
| Complex cloud infrastructure | High | N/A | GCP cloud console complexity |

## Technical Considerations
- Open source model fine-tuning (Agoma approach)
- GCP cloud console integration
- 30-40 second voice print minimum
- Quality can be improved over time
- Could collect voice prints during onboarding

## Action Items
| Owner | Task | Timeline |
|-------|------|----------|
| Bryan | Hand off POC findings to Dylan | Today |
| Bryan | Share deep research on Agoma approach | Done (Slacked) |
| Dylan | Continue technical POC | After handoff |
| Team | Decide on quality requirements | After POC |

## Dependencies
- GCP Cloud Console access and setup
- Dylan's availability (currently on other projects)
- Voice sample collection strategy

## Open Questions
1. What open source model should we fine-tune?
2. How do we collect voice prints for existing users?
3. What's the minimum acceptable accuracy for MVP?
4. Should voice print collection be part of user onboarding?
5. How do we handle meetings with unknown speakers?

## Related Initiatives
- User Onboarding (voice print collection opportunity)
- Privacy Determination Agent (speaker privacy implications)
