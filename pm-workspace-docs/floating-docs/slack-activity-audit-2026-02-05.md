# Slack Activity Audit: Tyler Sahagun

**Generated:** February 5, 2026  
**Period:** November 1, 2025 - February 5, 2026 (~3 months)  
**Slack ID:** U08JVM8LBP0

---

## 1. Total Message Volume

| Metric                                  | Count                    |
| --------------------------------------- | ------------------------ |
| **Total messages (all channels + DMs)** | **3,042**                |
| Messages per working day (~65 days)     | **~47 messages/day**     |
| DM vs. public channel ratio             | ~75% DMs / ~25% channels |

This is an extremely high volume. 47 messages/day means Tyler is spending **significant time in reactive communication** rather than deep product work.

---

## 2. Channel Breakdown

| Channel                | Messages | Tyler's Role in Channel                          |
| ---------------------- | -------- | ------------------------------------------------ |
| **product-forum**      | 78       | Primary responder to cross-functional questions  |
| **product-requests**   | 29       | Fielding feature requests, answering feasibility |
| **team-dev**           | 17       | Coordinating standup, reporting bugs, status     |
| **product-updates**    | 13       | Posting release comms, defending decisions       |
| **product-issues**     | 5        | Confirming bugs, routing to engineers            |
| **council-of-product** | 4+       | Defending urgency, alpha state conversations     |
| **exp-global-chat**    | 4+       | Feature advocacy, design feedback routing        |
| **customer-feedback**  | 3+       | Hunting down Pylon tickets, PostHog replays      |
| **team-support**       | 1+       | Customer championing                             |
| **watering-hole**      | 1+       | Personal (diploma celebration)                   |
| **DMs**                | ~2,800+  | Majority of activity - see DM analysis below     |

**Key insight:** Tyler is the **default answer person** across nearly every product-adjacent channel. He's fielding questions in product-forum that should go through Pylon/Linear, answering technical feasibility in product-requests without looping in engineering first, and personally hunting down PostHog session replays for customer issues.

---

## 3. Top 10 Most Revealing Messages (Asked vs. Volunteered)

### Message 1: "I've been trying to transition this elsewhere"

**Channel:** #product-forum | **Classification: VOLUNTEERED (self-aware)**

> "I've been trying to transition this elsewhere anyway so this was a great alarm bell to really make that happen"

Tyler acknowledges owning work he shouldn't be. The "alarm bell" was likely someone pointing out he was the single point of failure. He **knows** he's carrying too much but hasn't successfully handed it off.

---

### Message 2: "okay let me see if I have that capability...might take me a bit"

**Channel:** #product-forum | **Classification: VOLUNTEERED**

> "okay let me see if I have that capability...might take me a bit"

Someone in product-forum asked about something, and Tyler immediately volunteers to investigate, even acknowledging it might not be in his wheelhouse. This is the pattern: **accept first, figure out later**.

---

### Message 3: "I am TRULY sorry for my awful response time, i've been drowning"

**Channel:** DM | **Classification: PATTERN (overwhelm)**

> "of course!!! I am TRULY sorry for my awful response time, i've been drowning a bit haha but I am happy to help wherever I can!"

Apologizing for slow responses while committing to help with anything. The "happy to help wherever I can" is the tell -- **no boundary on what he'll take on**.

---

### Message 4: "I'll join standup a few minutes late I am trying to find something for Woody"

**Channel:** #team-dev | **Classification: ASKED (by CEO)**

> "I'll join standup a few minutes late I am trying to find something for Woody"

The CEO (Woody) has Tyler doing research tasks. Tyler **delays his own standup** with the dev team to fulfill a CEO request. This suggests the CEO views Tyler as an executor, not a strategic partner.

---

### Message 5: "It is opt-in right now. Decision was made with Marketing & Sam, that should have been relayed back to you, I dropped the ball there."

**Channel:** DM to Woody (CEO) | **Classification: ASKED + ACCOUNTABILITY GAP**

> "It is opt-in right now. Decision was made with Marketing & Sam, that should have been relayed back to you, I dropped the ball there."

Tyler is **defending product decisions to the CEO** and taking blame for communication failures. This suggests the CEO is going directly to Tyler about product decisions that should flow through a more structured process.

---

### Message 6: "I will look into that this morning and report back"

**Channel:** DM to Sam Ho (manager) | **Classification: ASKED**

> "I will look into that this morning and report back"

Sam asks Tyler to investigate something. Tyler immediately commits to doing it that morning. No pushback, no clarification on priority vs. existing work.

---

### Message 7: "Would you mind giving this a look for Matt?"

**Channel:** DM to Palmer (engineer) | **Classification: VOLUNTEERED (code review)**

> "Would you mind giving this a look for Matt? It's adding a duration filter to the new meeting trigger in workflows"

Tyler is **coordinating code reviews between engineers**. This is engineering management work, not PM work. He's asking one engineer to review another engineer's PR.

---

### Message 8: "Could you help me track down an error when you have time?"

**Channel:** DM to engineer | **Classification: VOLUNTEERED (bug hunting)**

> "Could you help me track down an error when you have time?" [followed by full 502 error dump]

Tyler is personally debugging production errors and then asking engineers for help. A PM should be filing issues, not debugging Cloudflare 502s with stack traces.

---

### Message 9: "someone (me) broke our linear labels...I am working right now to restore that..."

**Channel:** #team-dev | **Classification: VOLUNTEERED (tooling admin)**

> "someone (me) broke our linear labels...I am working right now to restore that..."

Tyler is doing **Linear workspace administration** -- configuring labels, breaking them, fixing them. This is ops/admin work that's consuming his time.

---

### Message 10: "I don't have one but I can get with Kaden to find one... if we prioritize it, that can be done within 2-3 weeks"

**Channel:** #product-forum | **Classification: ASKED (cross-functional) + OVERCOMMIT**

> "I don't have one but I can get with Kaden to find one we have done before. Because we don't have a FIRM process we can likely get just about any meta data they would like. Any timeline estimate would be a little hand wavy from me to be perfectly honest but if we prioritize it, that can be done within 2-3 weeks"

Tyler is giving engineering timelines in a public channel ("hand wavy" by his own admission), then later corrects himself: "I have misspoken and for that I shall be rebuked by Bryan." **He's making commitments on behalf of engineering without consulting engineering.**

---

## 4. Pattern Analysis: Who Asks Tyler for Things?

### People Who Ask Tyler Most (by DM frequency)

| Person                        | Slack ID         | Role                                                            | Nature of Asks |
| ----------------------------- | ---------------- | --------------------------------------------------------------- | -------------- |
| **U08QCGQFD1A (James)**       | Sales/CS         | Feature feasibility, HubSpot integrations, customer workarounds |
| **U098Z93UV71 (Matt)**        | Engineer         | Code reviews, Loom feedback, technical questions                |
| **U0605SZVBDJ (Woody - CEO)** | CEO              | Product decisions, feature flag status, research tasks          |
| **U0A99G89V43 (Sam Ho)**      | Manager          | Investigation requests, strategy alignment                      |
| **U08L75ZGCV8 (Dylan)**       | Engineer         | Feature flag consolidation, technical help                      |
| **U094PHNHCN8 (Jamis)**       | Friend/colleague | Personal support, life balance, role clarity                    |
| **U0AA8E78V4P**               | Unknown          | Engineering estimation, error tracking                          |
| **U092MH288P3 (Erika)**       | CS/Support       | Customer issue escalation, API key tracking                     |
| **U094MHCL68M (Jason)**       | Engineer         | Linear project time estimates, feature coordination             |

### Types of Asks Tyler Receives

| Ask Type                                | Frequency  | Should Tyler Own This?             |
| --------------------------------------- | ---------- | ---------------------------------- |
| **Feature feasibility questions**       | Very High  | YES - core PM                      |
| **Bug investigation/triage**            | High       | PARTIALLY - should file, not debug |
| **Engineering timeline estimates**      | Medium     | NO - engineering should estimate   |
| **Code review coordination**            | Medium     | NO - engineering lead's job        |
| **Customer workarounds**                | Medium     | NO - support/CS job                |
| **Production error debugging**          | Low-Medium | NO - engineering job               |
| **Tool administration (Linear, flags)** | Medium     | NO - ops/admin job                 |
| **CEO ad-hoc research**                 | Low-Medium | DEPENDS - if strategic, yes        |

---

## 5. Evidence of Tyler Saying "Yes" When He Should Redirect

### Pattern: "I can help with that"

- "I can help with that, we've done it in workflows that is the easiest way" (product-requests, responding to a customer feature need)
- "I can probably help you with that later" (DM to engineer)
- "HOWEVER if that is adequate for her I can help facilitate" (product-forum, about a customer request)
- "I would love a fast fix script to help out a client that is time sensitive" (DM, requesting engineering work for a client)
- "ill look into this..." (team-dev, investigating a tech issue)

### Pattern: Over-apologizing for not doing even more

- "TRULY sorry for my awful response time"
- "sorry this is all AI I need to kill this branch...."
- "sorry I was in a 1:1 with Bryan that went long"
- "sorry I had drafted a response yesterday and never sent it"
- "Sorry just read, under a feature flag and turned on for us only"

### Tyler's Own Self-Assessment (from voice memo to coach)

> "I tend to overpromise and underdeliver. I'm having a really hard time defining the lines. I spend way too much time spinning my wheels on things that aren't important and then dropping glass balls. I need to know what my superpower should be."

---

## 6. Evidence of Leadership Direction on Tyler's Role

### From Tyler's DM to Woody (CEO)

Tyler is explaining and defending product decisions directly to the CEO, suggesting the CEO goes to Tyler directly rather than through Sam (Tyler's manager). The CEO appears to treat Tyler as a **first responder** rather than a strategic product leader.

### From the Council of Product channel

Tyler is participating in product council discussions, pushing urgency ("I agree just want to make sure the urgency is communicated"), scoping alpha releases ("We are trying to get it into an alpha state by EOD"), and asking for business context ("Tell me more...are there deals we are looking to close that need this or existing customers?").

This suggests Tyler IS being positioned as the product decision-maker, but the **boundary between "make the decision" and "do the work" is completely blurred**.

### Absence of Direction

**Notable finding:** The search for messages FROM leadership TO Tyler (@-mentioning him) returned **zero results** in public channels. This means leadership direction is happening exclusively in DMs and meetings -- there's no public record of Tyler being given clear priorities or boundaries.

---

## 7. Summary of Findings

### What Tyler IS (by behavior):

- **Support escalation point** (hunting down Pylon tickets, PostHog replays)
- **Engineering coordinator** (PR reviews, code review requests, timeline estimates)
- **Tool administrator** (Linear labels, feature flags, Notion docs)
- **Customer workaround architect** (building workflow solutions for specific clients)
- **Bug debugger** (personally investigating 502 errors with stack traces)
- **Cross-functional answer machine** (47 messages/day, responding to everyone)

### What Tyler SHOULD be (as PM):

- **Strategic product decision-maker** (which he does in council-of-product)
- **PRD author** (he does create Notion docs/help center guides)
- **Customer insight synthesizer** (he does this well when he has time)
- **Stakeholder alignment facilitator** (he's doing this ad-hoc, not structured)

### The Core Disconnect:

Tyler's ~3,042 messages in 3 months reveal that **roughly 60-70% of his Slack activity is reactive** -- responding to asks, investigating issues, coordinating between people, and volunteering for tasks that should belong to engineering, support, or ops. Only ~30% appears to be proactive PM work (posting updates, sharing docs, gathering feedback, making product decisions).

### Red Flags:

1. **No public leadership direction visible** -- Tyler's priorities appear to be set by whoever messages him
2. **DM-heavy communication** (~75%) -- important decisions and asks are invisible to the team
3. **"I can help with that" reflex** -- Tyler defaults to accepting work rather than routing it
4. **Engineering work creep** -- code reviews, bug debugging, Linear admin
5. **CEO bypass** -- Woody goes directly to Tyler, not through Sam, for product questions
6. **Apologetic tone** -- Tyler apologizes for not being even MORE available

---

## Recommendations

1. **Establish "Tyler doesn't do this" list**: Code reviews, production debugging, Linear admin, engineering estimates
2. **Route customer escalations through Pylon/Linear**, not Tyler's DMs
3. **Make leadership direction public**: Sprint goals, weekly priorities should be in a shared channel
4. **Set DM boundaries**: Default to threads in public channels for product questions
5. **Time-box reactive work**: First 30 min of day for Slack, then deep work blocks
6. **Audit the 47 messages/day**: Target 20/day by routing, not absorbing
