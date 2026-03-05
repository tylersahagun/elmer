# Transcript: Alpha/Beta Feature Flags Visibility & Integrations Placement

**Date:** 2026-02-03  
**Source:** Internal meeting  
**Participants:** Unknown Speaker 1, Unknown Speaker 2

## TL;DR

The team aligned on a staged rollout model (internal build → alpha invite-only → beta opt-in → GA) and wants a dynamic UI that shows customers which alpha features are enabled for them (with possible on/off control). Messaging and definitions for alpha/beta need to be clear and dynamic, and the “Learn more” link should only appear when documentation exists. There’s also a preference to surface integrations/connectors outside Settings for better discovery.

## Key Decisions

- Beta is the default for customers; alpha is secondary and invitation-only.
- GA features are removed from the beta list; beta features are removed from the alpha list.
- Alpha features should appear only when a customer has at least one alpha flag enabled (dynamic visibility).
- “Learn more” should link to documentation when available; hide the callout if no docs exist.
- Integrations/connectors should live outside Settings for better discovery (tentative).

## Action Items

- Investigate feasibility of showing customer-specific alpha flags in UI and via impersonation.
- Decide if customers can self-toggle alpha features or only view status.
- Finalize alpha copy (e.g., “early test version of a feature”).
- Ensure “Learn more” callout is dynamic and backed by documentation.
- Confirm placement for integrations/connectors outside Settings.

## Problems Identified

### Problem 1: Customers lack visibility into enabled alpha features

> “We should see which alpha features they have access to.”

- **Persona:** Workspace admin / Customer
- **Severity:** Medium
- **Frequency:** Current

### Problem 2: Policy is unclear on customer control of alpha toggles

> “I don't know if we allow them to turn it… We don't know.”

- **Persona:** Product/Engineering, Customer admin
- **Severity:** Medium
- **Frequency:** Current

### Problem 3: Alpha messaging is static and can mislead users

> “Our features are for internal testing… I would remove that.”

- **Persona:** Customer
- **Severity:** Medium
- **Frequency:** Current

### Problem 4: Documentation links may be missing or inconsistent

> “The learn more call out… if there's not documentation, we can remove that.”

- **Persona:** Customer, Support
- **Severity:** Medium
- **Frequency:** Ongoing

### Problem 5: Integrations are buried in Settings, reducing discovery

> “Integration should live outside of [settings]… it gives more weight to itself.”

- **Persona:** Customer
- **Severity:** Medium
- **Frequency:** Ongoing

## Feature Requests

- Dynamic alpha features section that appears only when flags are enabled.
- Customer-facing visibility into which alpha features are on (via direct view or impersonation).
- Optional self-serve enable/disable controls for alpha features.
- Clear alpha/beta definitions (“early test version”) and dynamic messaging.
- “Learn more” documentation links that are present only when docs exist.
- Dedicated integrations/connectors area outside Settings.

## Strategic Alignment

- ✅ Trust & transparency (visibility into feature access and status).
- ✅ Human-centered control (opt-in and potential self-disable).
- ⚠️ Outcome chain not fully articulated (needs measurable impact).
- ⚠️ Requires clarity on privacy/trust implications of exposing toggles.

## Hypothesis Candidates

1. Showing alpha feature access in UI reduces support friction and increases trust.
2. Allowing customers to self-disable unstable features reduces churn risk.
3. Surfacing integrations outside Settings increases discovery and adoption.

## Notes

- Composio referenced as an example of a feature in alpha/beta status.
- Alpha is invite-only; beta is opt-in for all customers; GA removes features from beta list.

## Raw Transcript

[0:00:00] Unknown Speaker 1: So we have an alpha stage, which is

[0:00:09] Unknown Speaker 2: Okay. So I

[0:00:10] Unknown Speaker 1: invite well, it's like internal testing for our team, or it is something that we can invite people to, like how we currently use feature flags. Right?

[0:00:20] Unknown Speaker 2: Okay.

[0:00:20] Unknown Speaker 1: And I think that part of that is if somebody is we're inviting someone to alpha features, then they

[0:00:27] Unknown Speaker 2: should also be able to see in the UI what is enabled for them. Okay.

[0:00:35] Unknown Speaker 1: Is that fair?

[0:00:36] Unknown Speaker 2: Yeah. So if we impersonate somebody

[0:00:40] Unknown Speaker 1: Mhmm.

[0:00:41] Unknown Speaker 2: We should see which alpha features they have

[0:00:43] Unknown Speaker 1: access to. Like, we

[0:00:44] Unknown Speaker 2: don't have Composio as a beta feature yet.

[0:00:47] Unknown Speaker 1: But where there's plenty of customers that are using it today, we should be able to they should be able to see if they have it on or not, and then kinda control that too. Turn it off, turn it on. And people are gonna push that control

[0:00:59] Unknown Speaker 2: to the user as well.

[0:01:02] Unknown Speaker 1: I don't know if we allow them to turn it. I can I don't have an a good answer for that? That's not just

[0:01:09] Unknown Speaker 2: We don't know.

[0:01:10] Unknown Speaker 1: Sure if

[0:01:10] Unknown Speaker 2: have that. Capability.

[0:01:11] Unknown Speaker 1: Yeah. I don't know. Okay.

[0:01:13] Unknown Speaker 2: Yeah. So then if that's the case Wow. Then for customers, there's kind of a dynamic view. So by the way I mean, it makes sense that it's kinda logical here. I feel like beta should be the default.

[0:01:27] Unknown Speaker 2: Yep. And alpha should be secondary for our team. Mhmm. But for customers okay. Gosh.

[0:01:34] Unknown Speaker 2: There's a matrix here. So what you're saying is for our team, Ben can go personally, somebody can see what alpha features they have access to. Mhmm. Right. Can that customer go in, not control it, but can they visibly see what alpha stuff they have access to?

[0:01:49] Unknown Speaker 2: Yeah. Yeah. I think that it should be

[0:01:51] Unknown Speaker 1: a dynamic view where if they're added on a feature flag, then they can see I have the at least one. Yep. Then it appears for them and it says, I have Composio enabled, and they can actually, don't see why not turn it off or on and say, hey. If you have any issues with this and it's breaking your thing, you can come here and turn it off. I think that that actually makes a lot of sense.

[0:02:11] Unknown Speaker 2: K. We should investigate if that's possible.

[0:02:13] Unknown Speaker 1: Yeah. I can

[0:02:13] Unknown Speaker 2: do that. Okay.

[0:02:15] Unknown Speaker 1: Actually, even having it the beta be the default and alpha is there, and there's even a call out of, like, this blank spot of

[0:02:24] Unknown Speaker 2: I don't

[0:02:24] Unknown Speaker 1: know if you have a preference.

[0:02:26] Unknown Speaker 2: I don't. So What about delta and theta? Okay. I don't know what you guys are.

[0:02:33] Unknown Speaker 1: You're good.

[0:02:34] Unknown Speaker 2: That's a good question because we could have a blank spot or, like, I think I prefer it's nothing, and they were not they're none the wiser. But the moment they have one alpha feature turned on, now they have this dynamic toggle here.

[0:02:46] Unknown Speaker 1: Yeah. I think that's great.

[0:02:48] Unknown Speaker 2: K. K. This is cool. Is this going in settings? Yep.

[0:02:59] Unknown Speaker 2: Yeah.

[0:02:59] Unknown Speaker 1: So we have I'm just gonna reiterate. Internal like, a build phase. This is not visible to anyone. Alpha is internal testing, so AskElephant employees, and people that are invited specifically through, like, it is it is a very conscious decision. It is not we're trying to get people on an alpha.

[0:03:18] Unknown Speaker 1: Then we have beta, which is open beta, meaning that there is a beta section and the features that are in beta, anyone can opt into. We're not forcing it onto them. And then just general availability, which is we're releasing something.

[0:03:31] Unknown Speaker 2: And and if it's general availability, it is Yeah. Removed from the beta list.

[0:03:37] Unknown Speaker 1: Yep. It yeah. It's removed from the beta list. If it's in beta, it's removed from the alpha list, like and there's a very clear like, we will have own process on moving them through those things. K.

[0:03:49] Unknown Speaker 1: Yeah.

[0:03:52] Unknown Speaker 2: I So this messaging also needs to be slightly dynamic then. Our features are for internal testing.

[0:04:04] Unknown Speaker 1: I would remove that.

[0:04:06] Unknown Speaker 2: Yeah. What's the name of No. So I think it's Yep. Alpha features. So I'm gonna put I'm gonna put quick definition.

[0:04:18] Unknown Speaker 2: It's like it's like earliest available version of the feature. Made

[0:04:28] Unknown Speaker 1: some mistake before that.

[0:04:29] Unknown Speaker 2: I'm I'm reading it for the lowest common denominator, which is the user. Feature features may be unstable, changing if you like, or. You're

[0:04:45] Unknown Speaker 1: saying when I if you're here I'm

[0:04:47] Unknown Speaker 2: just gonna say early. Over Early.

[0:04:57] Unknown Speaker 1: Can you say early test version? Early test version. Am I wrong? I like it.

[0:05:07] Unknown Speaker 2: What's going on here?

[0:05:08] Unknown Speaker 1: I also might even say early test version of a feature, which never mind. So on. Never mind. Never mind. I don't care.

[0:05:15] Unknown Speaker 2: Oh, this is not on. That's fine.

[0:05:23] Unknown Speaker 1: K. Also, a a piece to know is the learn more is something that is actually dynamic, that learn more call out, where we can, in post hoc, link it to documentation. Mhmm. And if there's not documentation, we can remove that so there's not a call out.

[0:05:39] Unknown Speaker 2: So you're

[0:05:39] Unknown Speaker 1: saying The question is, do do we wanna make sure that there is always documentation for it? We're always linking to it. And I think the answer is yes. Correct. K.

[0:05:47] Unknown Speaker 1: And also, the how to access, I don't have a preference on it, on if it's there or not.

[0:05:52] Unknown Speaker 2: Wait. This needs to be height hub.

[0:06:00] Unknown Speaker 1: Yeah. So I made

[0:06:01] Unknown Speaker 2: I mean, at least on the component side, it should be dynamic. Sweet. But I need to look into what's going on there. Okay. So let's reset this.

[0:06:21] Unknown Speaker 2: Beautiful. This needs to go replace that. And there's really no difference of context between alpha b. Maybe alpha, there might be no documentation. Yeah.

[0:06:34] Unknown Speaker 2: That might be

[0:06:35] Unknown Speaker 1: That is possible.

[0:06:37] Unknown Speaker 2: Yeah. Tyler, you got can I show you something?

[0:06:44] Unknown Speaker 1: Heck yeah, dude. Absolutely.

[0:06:47] Unknown Speaker 2: I'll follow.

[0:06:48] Unknown Speaker 1: I wanna change pace for one second.

[0:06:51] Unknown Speaker 2: K. I Like, slower?

[0:06:54] Unknown Speaker 1: Think that if we don't try to also include integrations or is that if that's its own page.

[0:07:04] Unknown Speaker 2: No. I want I I agree. I agree. I I think it's an easy thing.

[0:07:10] Unknown Speaker 1: Do you think it should be part of settings, like how Clot has connectors? I think I think

[0:07:15] Unknown Speaker 2: I like calling it connectors.

[0:07:17] Unknown Speaker 1: I love connections.

[0:07:18] Unknown Speaker 2: I think integration should live outside of six. Why is that? I think that the nature of our product integrations is, like, an important piece. I think that it's, at times, more paramount than some settings and discoverability because in some ways, it's like a feature area, but it's not a place you're going in every every day. So that's why it's not top of the map.

[0:07:48] Unknown Speaker 2: So at the very least, I think it would just be a tertiary thing. Okay. Something that's like beta is like lower than tertiary. So I think when people are trying to find integrations, it also gives more weight to itself if versus it being buried into a settings area.

[0:08:10] Unknown Speaker 1: Okay. I like it.

[0:08:12] Unknown Speaker 2: It's like you didn't need to, you just wanted to hear my Alright.

[0:08:15] Unknown Speaker 1: There's some things that I have, like, very strong opinions about. And others, I'm like, I have an opinion, but there's nothing driving it.

[0:08:25] Unknown Speaker 2: It's just an opinion. So hi. 24, and you are gonna be 24. You guys with beta. I like that, like, each of these are kinda different colors.
