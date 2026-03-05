# Research: User Onboarding

## Summary
User onboarding initiative focused on improving the first-time experience for new AskElephant users. The team is implementing a carousel-based onboarding flow, automated communications, and gamification elements to drive adoption.

## Source
- **Meeting:** Product Planning Session
- **Date:** 2026-01-16
- **Participants:** Woody, Tyler, Bryan, Skylar, Kenzie

## Key Decisions Made

### Decision 1: Carousel-Based Onboarding
**Status:** In Progress (Adam's PR almost ready)
**Details:**
> "Adam has a PR. It's almost ready for review. It's turned the whole onboarding to a carousel, so it feels very cohesive."

**Implications:**
- More cohesive user experience
- Easier to iterate on individual steps
- Better consultative approach to help users understand "why"

### Decision 2: Slack Welcome Message
**Status:** Planned (Today's brick)
**Details:**
> "When a new user signs in from the first time, I wanted to send them a Slack message welcoming them there. The second they sign in, they get a Slack message. It teaches them about how to do the internal search and ask questions there."

**Implications:**
- Meet users where they already are
- Introduce internal search functionality early
- Creates immediate touchpoint

### Decision 3: Automated Email Sequence
**Status:** In Progress (Kenzie working on it)
**Details:**
> "Kenzie is doing her goals to have two. We said three, but the third one's not well enough defined. So if we have two emails that will automatically send when a new user signs in for the first time, they get an email. Twenty-four hours later, they'll get the second email."

**Target:** 7 email sequence (2 emails MVP for today)

### Decision 4: Gamification Checklist
**Status:** Designed
**Details:**
> "The next thing we're doing, Adam and I's design, is a little pop up on the side of steps. And then when they finish it, it'll show a confetti. And it will be certain things that they need to do to experience it."

**Elements:**
- Side panel with steps checklist
- Confetti celebration on completion
- Tasks include: using internal search, other core features

## User Problems Identified
| Problem | Severity | Frequency | Evidence |
|---------|----------|-----------|----------|
| Users don't understand "why" for consultative operating side | Medium | Common | "We're trying to just improve some of the imagery and the consultative operating side through helping them to understand why they're doing those things" |
| PostHog tracking issues | Medium | Common | "I'm gonna get that freaking PostHog thing fixed so I can track if the users are doing more of the things that we're supposed to track" |

## Action Items
| Owner | Task | Timeline |
|-------|------|----------|
| Woody | Slack welcome message on first sign-in | Today |
| Kenzie | 2 automated emails (day 1 + day 2) | Today |
| Adam | Carousel PR review-ready | Today |
| Woody | Fix PostHog tracking | Today |

## Open Questions
1. What imagery best explains the "why" for consultative features?
2. What should be included in emails 3-7 of the sequence?
3. What specific tasks should be in the gamification checklist?

## Related Initiatives
- Admin Onboarding (separate but related)
- Settings Redesign (privacy settings could be part of onboarding)
