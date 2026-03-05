# Research: Meeting Summary

**Initiative:** Meeting Summary (Chief of Staff Experience)
**Phase:** Define
**Owner:** Tyler Sahagun
**Last Updated:** 2026-02-18
**Sources:** Internal transcripts, Slack signals, customer feedback, G2 reviews, vendor research, academic papers

---

## TL;DR

Meeting summaries are trapped in workflow mechanics today — users can't access, edit, or trust them as artifacts. Internal evidence from Sam, Adam, and customer feedback (Neighbor, Guardian Health, BuildWitt, Grant Chandler) consistently reveals the same pattern: summaries are buried in chat threads, require workflow navigation to access, and offer no format control. Externally, Fathom (5.0/5 G2) sets the UX bar with 30-second delivery and 18+ templates, but no competitor offers an **editable summary artifact with section-level AI rewrite and save-as-template persistence**. Academic research confirms hybrid human-AI workflows deliver 30-50% better accuracy than AI-only approaches. The opportunity is clear: elevate meeting summary from a workflow output to a first-class, editable, templatized artifact that builds trust through transparency and control.

---

## Strategic Alignment

**Rating: Strong**

Meeting Summary directly advances AskElephant's core identity as a revenue outcome system:

1. **Outcome-oriented, not commodity.** This isn't generic meeting notes — it's structured, per-meeting-type artifacts with evidence linking, action extraction, and format control. Directly counters the anti-vision of "generic AI summaries without action/outcome orientation."

2. **Trust through control.** Section-level editing, evidence links, and privacy controls operationalize the principle that "AI orchestrates outcomes; it does not replace people." Users verify and refine, they don't blindly accept.

3. **Foundation for the Chief of Staff ladder.** Sam's "Zero to One" framework positions meeting summary as the base layer: Level 0.5 (automated notes) → Level 1 (customized templates per call type) → Level 1+ (coaching, prep, automated actions). Without a strong summary artifact, the entire Chief of Staff value chain collapses.

4. **PLG wedge potential.** A beautiful, zero-config meeting summary is the single-player experience that drives self-serve adoption — the "daily brief as PLG wedge" Rob and Sam discussed at all-hands.

**Anti-Vision Risk:** Low. This is explicitly NOT building another note-taker. Template selection, section-level AI edit, and save-as-template create a fundamentally different artifact model than commodity summarization.

---

## Primary JTBD

> "When I finish a customer meeting, I want a polished recap I can immediately share — in the right format, with the right details emphasized — without navigating workflows, re-prompting AI, or manually editing for 15 minutes."

**Supporting Quote (Sam, 2026-01-28):**

> "Right now, to generate a meeting recap, you have to go to workflows, and you have to create work with all these notes, and this config and go through a lot of different things."

**Supporting Quote (Grant Chandler, customer, 2026-02-13):**

> Every time he used ChatGPT, Gemini, or the Gmail polish button to draft customer emails, he had to re-explain his voice, intent, and sales methodology from scratch. The AI would generate stiff, corporate-sounding copy. He'd spend an hour rewriting.

---

## Key Findings

### Finding 1: Summary output is trapped in workflow mechanics

**Evidence:** Internal brainstorm (2026-01-30) and Tyler-Sam discussion (2026-01-28) both confirm the same structural problem: summaries require workflow navigation, appear as chat outputs rather than standalone artifacts, and can't be edited in-place.

> "These workflows don't generate a chat. They generate artifacts." — Sam (2026-01-30)

> "Instead of having all of those workflow outputs on the left-hand side... maybe it's like a tab view. You click on it and it opens up, and there you have your beautifully crafted meeting recap." — Sam (2026-01-28)

**Impact:** Users can't find, share, or trust summaries because they don't feel like "real" documents.

### Finding 2: Per-meeting-type template formatting is a top request

**Evidence:** Both internal strategy sessions and customer feedback (Neighbor, Opkey/Workday) show demand for format control by meeting type. Fathom and Fireflies already offer 18+ pre-built templates (MEDDPICC, BANT, SPICED, Team Meeting, Sales Call, Interview).

> "For every meeting that's tagged, every meeting type, I will have a special meeting summary for that." — Sam (2026-01-28)

> "Sarah manually edits recap emails after generation because the default template includes unwanted sections." — Neighbor customer feedback (2026-02-13, #customer-feedback)

**Impact:** One-size-fits-all summaries force manual editing every time. Different meeting types (discovery, QBR, onboarding, follow-up) have fundamentally different information needs.

### Finding 3: Users need section-level control, not full regeneration

**Evidence:** Customer feedback from Neighbor (recap email customization) and Grant Chandler (re-prompting frustration) show users want to adjust specific sections without losing the rest. Academic research confirms "hybrid human-AI workflows report 30-50% better summary accuracy and contextual relevance compared to AI-only approaches."

> "Sarah manually edits recap emails after generation because the default template includes unwanted sections (intro sentences, key discussion points)." — Neighbor onboarding (2026-02-13)

> "Grant learned how to duplicate and customize workflows for different contexts: one for customer emails, one for partner communications, one for internal team updates." — Grant Chandler onboarding (2026-02-13)

**Impact:** Without section-level control, users either accept imperfect output or regenerate entirely — losing good content alongside bad.

### Finding 4: Trust in AI-generated summaries is fragile and must be earned through transparency

**Evidence:** Meetily (open-source project) found that smaller AI models frequently hallucinate, miss action items, misattribute statements to speakers, and struggle with domain-specific terminology. Users reported "context issues, omitted decisions, and false information in summaries." Google/MIT research shows that transparency dashboards (showing AI's internal reasoning) increase user sense of control and trust.

> "They were very inaccurate. And often, there was just way too many of them, and no one was using them, so we got rid of them." — Adam, on AskElephant's legacy action items (2026-01-30)

> "Users reported problems with context issues, omitted decisions, and false information in summaries — critical failures for a tool meant to capture accurate meeting records." — Meetily research (2026)

**Impact:** One bad summary destroys trust for weeks. Evidence links (timestamp citations, speaker attribution) are not nice-to-have — they're the mechanism that lets users verify AI output and maintain confidence.

### Finding 5: Speed of delivery is table stakes — Fathom delivers in 30 seconds

**Evidence:** Fathom's 5.0/5 G2 rating (6,200+ reviews) is partially driven by instant post-meeting delivery. G2 data shows all top-rated tools exceed 90% satisfaction on transcription accuracy and automated note-taking.

> "Fathom automatically generates AI-powered meeting summaries delivered in under 30 seconds after calls end." — Fathom product page

**Impact:** Users expect summaries immediately after call end. Delays of more than 2-3 minutes feel broken. AskElephant must match this speed or lose the first-impression battle.

### Finding 6: Customers actively build workarounds when summary format doesn't match their needs

**Evidence:** Multiple customer accounts show pattern of requesting custom workflows for meeting recap formatting — Guardian Health (meeting notes to HubSpot), Neighbor (payout-specific extraction), Opkey/Workday (daily revenue intelligence summary), BuildWitt (CS renewal prep from call data).

> "Mark calls completed if no show. Update the meeting object notes or description with the meeting summary. Summary has action items and questions → make those into HubSpot tasks." — Customer support ticket #2481 (2026-02-14, #team-support-sla)

> "Can we have workflow built that sends out a daily summary on this prompt?" — Opkey customer request (2026-02-18)

**Impact:** Each workaround is a signal that the default summary experience is insufficient. These customers are building bespoke solutions that a proper template system would handle out of the box.

### Finding 7: The meeting page is cluttered — summary must be the default, dominant artifact

**Evidence:** Multiple stakeholders flagged the current meeting page as overwhelming. The brainstorm session (2026-01-30) aligned on removing workflow chips and shifting to artifact modules.

> "I go to this meeting... it's just a lot of things I could click here. There's a lot of options for me. Cannot have that." — Sam (2026-01-30)

> "Part of the problem is that, like, you have so many outputs and it's just so muddied by the view." — Sam (2026-01-28)

**Impact:** If the summary competes for attention with other UI elements, users won't engage with it. Summary must be the primary, default-visible artifact on the meeting page.

---

## User Problems

| Problem                                       | Severity     | Frequency          | Evidence                                                                            | Persona         |
| --------------------------------------------- | ------------ | ------------------ | ----------------------------------------------------------------------------------- | --------------- |
| Summaries require workflow navigation         | **Critical** | Every meeting      | Sam (2026-01-28): "you have to go to workflows"                                     | All             |
| Summary output lives in chat, not as artifact | **Critical** | Every meeting      | Sam (2026-01-30): "These workflows don't generate a chat. They generate artifacts." | All             |
| No format control by meeting type             | **High**     | Every meeting      | Sam (2026-01-28), Neighbor, Fathom benchmark                                        | All             |
| Can't edit sections without full regeneration | **High**     | Frequent           | Neighbor (recap editing), Grant Chandler (re-prompting)                             | Reps, CSMs      |
| Summary accuracy and trust issues             | **High**     | Moderate           | Adam (2026-01-30): "very inaccurate"; Meetily research                              | All             |
| Meeting page is cluttered and confusing       | **High**     | Every visit        | Sam (2026-01-30): "lot of things I could click"                                     | New users, reps |
| No way to save customized format as default   | **Medium**   | Post-customization | No competitor offers save-as-template                                               | Power users     |
| Delivery speed not meeting Fathom benchmark   | **Medium**   | Every meeting      | Fathom: 30 seconds post-call                                                        | All             |

---

## Competitive Signals

### From Internal Discussions

| Signal                                                                    | Competitor                 | Type                 | Source                     |
| ------------------------------------------------------------------------- | -------------------------- | -------------------- | -------------------------- |
| Fathom sets UX bar with 5.0/5 G2 and 30-sec delivery                      | Fathom                     | praise               | Deep dive (2026-02-18)     |
| Gong's prep is account-centric, not persona-aware                         | Gong                       | comparison           | Deep dive (2026-02-18)     |
| Fireflies mini apps are "clever UX but shallow"                           | Fireflies                  | comparison           | Deep dive (2026-02-18)     |
| Customer (Stat) using Grain, switching to Gong for "better UI"            | Gong, Grain                | switch-trigger       | #case-studies (2026-02-13) |
| Customer (Grant) frustrated with ChatGPT/Gemini/Fireflies re-prompting    | ChatGPT, Gemini, Fireflies | gap                  | #case-studies (2026-02-13) |
| Customer (VLCM) cited "10x better information quality" vs. previous tools | Generic competitors        | praise (AskElephant) | #case-studies (2026-02-17) |
| ITS customer displaced Gong in favor of AskElephant for workflow fit      | Gong                       | switch-trigger       | #case-studies (2026-02-18) |

### From External Research

| Signal                                                                       | Competitor | Type               | Source                      |
| ---------------------------------------------------------------------------- | ---------- | ------------------ | --------------------------- |
| Fathom offers 18+ templates, auto-classification by meeting type             | Fathom     | feature-parity     | Fathom docs (2026-02-18)    |
| Fireflies 200+ mini apps for role-specific extraction                        | Fireflies  | feature-parity     | Fireflies docs (2026-02-18) |
| Gong AI Briefer shows source traceability (timestamped snippets)             | Gong       | feature-parity     | Gong help docs (2026-02-18) |
| HubSpot Breeze audit cards show "exactly which CRM actions agents performed" | HubSpot    | trust-pattern      | HubSpot Jan 2026 update     |
| Otter.ai "Live Summary" — real-time scrolling summary for latecomers         | Otter.ai   | feature-innovation | LinkedIn (2026-02)          |
| Granola AI "Recipes" — custom templates for meeting types without bot        | Granola    | feature-innovation | Feisworld review (2026-01)  |
| No competitor offers section-level AI edit + save-as-template                | All        | opportunity-gap    | Deep dive (2026-02-18)      |

---

## User Breakdown

### Sales Reps

**Primary need:** Polished post-call recaps they can share with buyers and log to CRM without manual editing.

**Key pain:** Re-prompting AI for each meeting, manual HubSpot data entry, workflow navigation friction.

**What they'd value most:** (1) Auto-generated recap in their voice/format, (2) one-click CRM push, (3) evidence links to demonstrate what was discussed.

> "Grant would spend an hour rewriting and tweaking just to get something that felt authentic." — Grant Chandler onboarding

### Sales Leaders

**Primary need:** Team-level visibility into meeting quality without reviewing every call manually.

**Key pain:** Coaching overhead, inconsistent meeting documentation across reps, no structured way to assess methodology adherence.

**What they'd value most:** (1) Standardized templates across the team, (2) summary-driven coaching signals, (3) deal context in every recap.

> "Phillip reviews new rep calls in real-time, identifies coaching opportunities, and provides targeted feedback on call quality and discovery depth." — VLCM case study

### CSMs

**Primary need:** Renewal prep context from past meetings, automated follow-up recaps, payout/churn signal extraction.

**Key pain:** Manual line-by-line prep, scattered data across HubSpot/tickets/emails, recap templates that don't match CS workflows.

**What they'd value most:** (1) CS-specific templates (QBR, renewal, onboarding), (2) automated delivery to inbox, (3) custom section extraction (e.g., payout mentions, churn signals).

> "Sarah manually edits recap emails after generation because the default template includes unwanted sections." — Neighbor

---

## Quantitative Context

| Metric                                                       | Value                              | Source                       |
| ------------------------------------------------------------ | ---------------------------------- | ---------------------------- |
| Fathom G2 rating                                             | 5.0/5 (6,200+ reviews)             | G2, Feb 2026                 |
| Fathom transcription accuracy                                | 98% (G2 metric)                    | G2, Feb 2026                 |
| Fathom summary delivery speed                                | <30 seconds post-call              | Fathom product page          |
| Fireflies AI summary templates                               | 18+ pre-built                      | Fireflies docs               |
| Fireflies mini apps                                          | 200+ across verticals              | Fireflies docs               |
| Gong full license cost                                       | $100-175/user/month                | G2 + vendor research         |
| Fathom Business plan                                         | $20/user/month                     | Fathom pricing page          |
| Human-AI hybrid improvement                                  | 30-50% better accuracy vs. AI-only | Workmate.com research (2025) |
| Note-taking time reduction (AI tools)                        | Up to 70% reduction                | Workmate.com research (2025) |
| AI meeting summary savings                                   | ~15 min/meeting (Avoma claim)      | Avoma marketing              |
| Slack messages mentioning "meeting summary"                  | 6,566 total across workspace       | Slack search (2026-02-18)    |
| Slack messages mentioning "summary template OR recap format" | 508 total across workspace         | Slack search (2026-02-18)    |

**Baselines needed:**

- Current AskElephant summary generation time (seconds post-call)
- Current summary engagement rate (views / total meetings)
- Current manual editing rate (how often users modify summaries)
- Current CRM push completion rate (summaries logged to HubSpot)

---

## Research Gaps

| Gap                                                         | Priority | Method to Close                                                   |
| ----------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| No external customer interviews on summary editing behavior | **P0**   | 5 customer interviews (2 reps, 2 leaders, 1 CSM)                  |
| No data on current summary generation latency               | **P0**   | PostHog query on workflow execution times                         |
| No data on summary engagement/view rates                    | **P0**   | PostHog funnel: meeting created → summary viewed → summary shared |
| Unknown: which meeting types account for majority of volume | **P1**   | PostHog or DB query: meeting type distribution                    |
| No evidence on section-level edit UX expectations           | **P1**   | 3 usability sessions with interactive prototype                   |
| Unknown: what template defaults would satisfy 80% of users  | **P1**   | Survey of top 20 active accounts on preferred formats             |
| No measurement of current CRM push rates from summaries     | **P2**   | PostHog: workflow completions → HubSpot push events               |
| Unknown: customer willingness to pay for summary features   | **P2**   | Pricing conversation in existing CSM QBRs                         |

---

## Feedback Plan

### Methods

| Method                            | Audience                 | Purpose                                                            | Timing                       |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------ | ---------------------------- |
| Customer interviews (5)           | 2 reps, 2 leaders, 1 CSM | Validate template defaults, section-edit expectations, trust model | Pre-prototype (next 2 weeks) |
| Usability testing (3 sessions)    | Active users             | Test template picker UX, section-level AI rewrite flow             | With v1 prototype            |
| PostHog instrumentation           | All users                | Measure summary view rate, edit rate, template selection, CRM push | At feature launch            |
| Thumbs up/down + feedback capture | All users                | ALHF loop for summary quality improvement                          | At feature launch            |
| CSM QBR conversations             | Top 20 accounts          | Template preference survey, pricing signal collection              | Within 4 weeks               |

### Interview Guide (Draft)

1. Walk me through what happens after your last customer call ended. Where did the summary go?
2. If you could wave a magic wand, what would the perfect post-meeting recap look like?
3. How often do you edit AI-generated summaries? What do you typically change?
4. If the summary had different formats for different call types (discovery, QBR, follow-up) — which 3 formats would you need first?
5. When you see an AI-generated insight in a summary, what would make you trust it? What makes you distrust it?
6. Do you share meeting recaps with customers? If not, why not? If so, what do you edit before sharing?

### Key Instruments

- **Summary engagement funnel** (PostHog): Meeting created → Summary generated → Summary viewed → Summary edited → Summary shared/pushed to CRM
- **Template adoption tracking**: Which templates selected, which custom sections added/removed
- **ALHF capture**: Thumbs up/down per section, optional voice feedback ("I don't like how wordy this is")
- **NPS micro-survey**: After 10th summary viewed, "How useful is your meeting summary?" (1-5)

---

## Open Questions

1. **Template defaults**: What 3-5 templates should ship as defaults? (Likely: General, Discovery/Sales, QBR, Onboarding, Internal)
2. **Chat-first vs. settings-first configuration**: Sam proposed chat-based template setup (2026-01-28). Is this the right first interaction or should we start with a simpler template picker?
3. **Section-level edit scope**: Should AI rewrite be per-section, per-paragraph, or per-sentence? What level of granularity do users expect?
4. **Save-as-template permissions**: Can individual reps create templates, or only admins? What about team templates vs. personal templates?
5. **Delivery channel priority**: In-app artifact vs. Slack DM vs. email delivery — which channel gets the most engagement?
6. **Privacy controls for sharing**: What gating is needed before a summary can be shared externally? (e.g., strip internal notes, require approval)
7. **Speed target**: Can we match Fathom's 30-second benchmark? What's the minimum acceptable latency?
8. **Migration path**: How do we handle existing workflow-based summary users? Parallel run or hard cutover?

---

## References

### Internal Sources

- [Meeting Page View Brainstorm](../../../signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md) — Sam, Adam, Skylar (2026-01-30)
- [Tyler & Sam - Flagship Meeting Recap UX](../../../signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md) — Tyler, Sam (2026-01-28)
- [Competitive Deep Dive](../competitive-landscape-deep-dive.md) — All competitors (2026-02-18)
- [Meeting Summary Competitive Landscape](./competitive-landscape.md) — Feature matrix (2026-02-17)
- Slack #customer-feedback: Neighbor onboarding (2026-02-13), PayHOA feedback (2026-02-18)
- Slack #case-studies: VLCM (2026-02-17), Grant Chandler (2026-02-13), BuildWitt (2026-02-17), Stat (2026-02-13)
- Slack #team-support-sla: Support ticket #2481 (2026-02-14), Issue #2334 (2026-02-10)

### External Sources

- Fathom product: [fathom.ai](https://fathom.ai), [What's New](https://fathom.ai/whats-new), [Customizing AI Summaries](https://help.fathom.video/en/articles/3239809)
- Gong AI Briefer: [help.gong.io](https://help.gong.io/understanding-ai-briefs), [Meeting Prep](https://help.gong.io/docs/get-ready-for-meetings-with-ai-powered-meeting-prep)
- Fireflies mini apps: [fireflies.ai/apps](https://fireflies.ai/apps), [Summary customization](https://guide.fireflies.ai/articles/9547055509)
- G2 comparison: [Highest-rated meeting AI tools 2025](https://summarizemeeting.com/en/comparison/g2-highest-rated)
- Workmate.com: [AI for Meeting Summaries: Best Practices](https://www.workmate.com/blog/ai-for-meeting-summaries-best-practices-to-automate-notes)
- Meetily (OSS): [Our Quest for Meeting Summary Accuracy](https://meetily.ai/blog/our-quest-for-meeting-summary-accuracy)
- Google/MIT: [Designing a Dashboard for Transparency and Control of Conversational AI](https://arxiv.org/abs/2406.07882)
- LearnAI24: [Turn Meetings into Momentum with AI Summaries](https://learnai24.com/how-to/turn-meetings-into-momentum-with-ai-summaries/)
- UserEvidence: [The Evidence Gap 2025](https://userevidence.com/report/the-evidence-gap-2025/)

---

## Prototype Feedback (v1)

### Skylar Sanford — Design Lead (2026-02-18)

**Context:** 4-minute walkthrough of Meeting Summary v1 Storybook prototype. Skylar reviewed all story variants including template selection, AI editing, and loading states.

**Overall impression:** Positive on structure and evidence linking. Concerns about visual density, action item passivity, and edit interaction model.

#### Verbatim Quotes

> "I want this to feel more full screen because, like, right away, I mean, you have to scroll through."

> "I actually respect the restraint here for not trying to go super colorful in a lot of emojis, but it needs a slightly a little bit. It's almost on the other side of the spectrum where it's just super stale."

> "I like that it's showing quotes. That's actually really great."

> "I don't know how I love about every little section being in a card per se."

> "Anytime we actually present action items, they need to be, like, a checkbox. And so sure, I may not be completing it here, but I could. And then if I see this action elsewhere, I need to be able to, like, check it off."

> "I think not seeing where AskElephant is gonna do these action items for me is what's really missing."

> "Next steps — there needs to be a piece of pulling these into out of the summary object here and actually into just the meeting itself in a way or, like, the deal."

> "I would expect to be able to click edit and, like, be able to chat, but it's, like, specifically referencing this portion."

> "I would imagine, like, hashtag discovery call summary template, and I can make changes to it. But if I wanted to make changes to the pain points, maybe it's that same context, hashtag discovery call template summary, but then it's already adding it to the prompt."

> "By adding edit to each section, it's inviting me to edit each section uniquely. And how do we reference that? I think slide out."

#### Issues Raised

| Issue                                                           | Severity     | Category      | v2 Recommendation                                                                                           |
| --------------------------------------------------------------- | ------------ | ------------- | ----------------------------------------------------------------------------------------------------------- |
| Prototype feels cramped, not full-screen                        | **Major**    | Layout        | Expand to full-width in engagement context; reduce chrome                                                   |
| Visually too stale / flat — needs warmth                        | **Minor**    | Visual design | Add subtle hierarchy cues, section accents, slightly warmer palette                                         |
| Every section in its own card feels heavy                       | **Minor**    | Visual design | Test borderless sections with dividers instead of card borders                                              |
| Action items are passive — no checkbox or completion affordance | **Major**    | Interaction   | Add checkbox to action items; show "AskElephant will do X" state                                            |
| Missing: what AskElephant will execute on the user's behalf     | **Critical** | Core value    | Show which actions the system will handle (CRM push, email draft, task create) vs. what needs user action   |
| Next steps should escape the summary into the meeting/deal      | **Major**    | Architecture  | Action items and next steps should link to or create objects in the parent meeting or deal context          |
| Section edit should open chat with pre-filled context           | **Major**    | Interaction   | Edit button opens Global Chat slide-out with `#discovery-call-template > pain-points` pre-seeded as context |
| Template editing should use chat-based interaction model        | **Medium**   | Interaction   | Reference template via hashtag in chat; section-specific edits add section context to prompt                |
| Edit slide-out pattern preferred over inline editing            | **Medium**   | Interaction   | Use slide-out panel (not modal) for AI edit; keeps summary visible alongside chat                           |

#### Design Principles Extracted

1. **Full-screen artifact feel** — The summary should feel like a document you're reading, not a widget on a busy page.
2. **Action items must be actionable** — Every action item needs a completion affordance AND visibility into what AskElephant will automate.
3. **Chat-as-edit-interface** — Section editing should route through Global Chat with pre-seeded context (template reference + section reference).
4. **Escape the summary** — Next steps and action items should create real objects (tasks, deal updates, calendar entries) outside the summary.
5. **Slide-out, not modal** — Editing in a slide-out keeps the summary visible for reference.

### Palmer Turley — Engineering Lead (2026-02-18)

**Context:** 25-minute walkthrough of Meeting Summary v1 prototype that evolved into a deep strategic discussion about configuration architecture, first-class data objects, PLG, and the role of implicit configuration. Palmer brings the engineering lens — what's buildable, what creates structural debt, and what matches real user behavior.

**Overall impression:** Palmer sees the meeting summary as the surface layer over a deeper architectural shift. The summary itself should be a thin TLDR; the real value is in structured, persistent data objects (action items, pain points, objections) that escape the summary and live across the platform. Configuration must be implicit and opinionated, not a settings page.

#### Verbatim Quotes

> "My main thing was just the configuration stuff. That's gonna be a problem for, like, everything that we build. So it kinda feels like that's a prerequisite of figuring that out of how do we manage scoping of configuration?"

> "Can you just set it up for the whole workspace? And then can you have a separate one for just your team? And then maybe someone on the team wants theirs a little bit different. So they set up their own, and then we'd find the most granular configuration. That's the one we use."

> "If you're the owner of this meeting, but there are multiple internal people, they're expecting to see their summary when they go in there, but you have a different one. So they walk in there and are like, what the hell is going on here?"

> "There's, like, different cards which kinda suggest that there's actually different pieces of data that we're just bringing together. It's not just like a meeting summary text blob."

> "What if the about them was actually attached to the company so that that was context that goes further than just a meeting summary."

> "Maybe your meeting summary is not you're customizing what data gets extracted. You're customizing what you're seeing based on what the meeting was. If it's a demo call, you do care about objections. But if it's an internal meeting, you don't care about objections."

> "If you get a big text block, no matter how pretty we make that text, like, it's hard to just digest raw text. I look at this. I'm gonna read headers, and I couldn't care less about bullet points."

> "What are people wanting to get from their meeting summaries? They're wanting to get a quick TLDR. Action items, which we should be extracting separately ourselves."

> "I imagine that our ICP, our average user, is a lot more like me. I'm certainly not a power user of AI. And so when I see the configuration, it's like, I'm out."

> "We extract that from the transcript, put it in this field, and we use it nowhere." (on existing meeting description field)

> "Having more first class fine grained objects gives us more. An about them in a meeting summary is a one time use. But what if the about them was actually attached to the company?"

> "Part of it too is like I don't want to have to configure stuff. I want to just use the app, and as I'm using it, it says, I realized you look at all of your meeting preps at 8am. Do you want me to just start sending those to you at 8am?" (Tyler, with Palmer's strong agreement)

> "Configuration could easily just be, like, markdown files that get injected in certain situations. Like, oh, now I've stumbled onto action items. Let me go look up what stuff you've written about action items that will help guide me to tailor this experience to you." (Palmer, on implicit config)

#### Issues Raised

| Issue                                                              | Severity     | Category     | v2 Recommendation                                                                                                                                          |
| ------------------------------------------------------------------ | ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration scoping is undefined (me vs team vs workspace)       | **Critical** | Architecture | Define 3-tier config: workspace defaults → team overrides → personal overrides. Most granular wins.                                                        |
| Multi-viewer summary conflict (my template vs yours)               | **Critical** | Architecture | Single-player first: each user sees their own template applied to the same meeting data                                                                    |
| Section cards imply first-class data objects — not just formatting | **Major**    | Architecture | Sections should be structured data entities, not just visual blocks. Pain points, action items, objections are persistent data.                            |
| Data should escape the summary into company/deal objects           | **Major**    | Architecture | Pain points → company. Objections → deal (with overcome status). Action items → tasks with lifecycle.                                                      |
| Text blobs don't get read — headers only                           | **Major**    | UX           | Lead with structured, scannable sections. TLDR first. Detailed content expandable, not default.                                                            |
| Existing meeting description field extracted but unused            | **Medium**   | Quick win    | Surface the existing `description` field on My Meetings cards as an immediate TLDR improvement                                                             |
| Users are NOT AI power users — configuration kills adoption        | **Critical** | PLG          | Opinionated defaults. Zero-config first experience. No setup required to get a great summary.                                                              |
| Dynamic template should be inferred, not selected                  | **Major**    | Intelligence | Meeting type → template mapping should be automatic based on title, participants, deal stage, call context. User picks only when the system guesses wrong. |
| Need data on most common workflow prompts for meeting summaries    | **Medium**   | Research     | Query active workflows with "summary" in title; analyze prompt patterns across customers                                                                   |

#### Architectural Insights (Engineering-Informed)

1. **Summary = TLDR layer; sections = first-class objects** — Palmer's key architectural insight is that the meeting summary display is a _view_ over structured data objects (action items, pain points, objections, about-them), not a monolithic text document. These objects should have independent lifecycles — action items track completion, objections track overcome status, about-them persists to the company record.

2. **Configuration hierarchy: workspace → team → personal** — The most granular config wins. When Tyler is the meeting owner with a custom template but 3 other AE attendees have the workspace default, each sees their own configured view. Single-player first, then team, then workspace.

3. **Implicit configuration > explicit settings** — Palmer's Codex analogy: the system should discover user patterns and adapt, like reading an `AGENTS.md` when entering a new directory. "I've stumbled onto action items. Let me look up what you've written about action items." Apply this to meeting summaries: observe which sections users expand, which they skip, which they edit — and adapt the template over time without asking.

4. **Existing quick win: surface `description` field** — Palmer revealed they already extract a meeting description/TLDR from transcripts via the processing pipeline and store it in a GraphQL field. It's used nowhere in the UI. Surfacing this on the My Meetings page is a zero-engineering-cost improvement that validates the TLDR value prop.

5. **Workflow analysis for template defaults** — Query the most commonly used active meeting summary workflows. Look at prompts that have been stable for 2+ weeks. This reveals what templates customers have organically built, which should inform the curated default set.

#### Design Principles Extracted

1. **Opinionated defaults, Overwatch not HubSpot** — Ship with curated templates per meeting type. Don't make users build from scratch. "We know our ICP. We know what users want. Why do we need to let you customize?"
2. **Structured data, not text blobs** — Every section in the summary is a first-class data object with a lifecycle beyond the meeting.
3. **Implicit config via pattern recognition** — The system learns what you care about by watching what you engage with, not by asking you to fill out settings.
4. **Single-player first** — Every user has their own summary view. Team sharing and template inheritance come later.
5. **Shareable artifact as PLG wedge** — The meeting summary is the "show, don't tell" moment that drives organic growth. It must be beautiful enough to share externally.

---

## Synthesis: Skylar + Palmer v1 Feedback

### Converging Insights (Both Agree)

| Theme                                        | Skylar (Design)                                                          | Palmer (Engineering)                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Action items need to DO things**           | "Not seeing where AskElephant is gonna do these action items for me"     | "Action items, which we should be extracting separately ourselves" with status tracking |
| **Data should escape the summary**           | "Next steps should pull out of the summary into the meeting or the deal" | "What if the about them was actually attached to the company?"                          |
| **Cards-as-sections is the right direction** | Doesn't love visual weight but values the structure                      | Sees them as first-class data objects with independent lifecycles                       |
| **Edit via chat, not settings**              | "#template > section pre-seeded in chat"                                 | "Configuration could be markdown files injected in certain situations"                  |
| **Zero-config default experience**           | Implied: full-screen artifact, not a config page                         | Explicit: "When I see configuration, it's like, I'm out."                               |

### Diverging Priorities

| Skylar (Design)                        | Palmer (Engineering)                            |
| -------------------------------------- | ----------------------------------------------- |
| Full-screen visual feel, reduce chrome | Multi-viewer architecture, config scoping       |
| Warm up the visual palette             | Surface existing description field (quick win)  |
| Slide-out edit panel UX                | Dynamic template inference from meeting context |
| Section borders → dividers             | Sections → persistent first-class data objects  |

### v2 Priority Stack (Informed by Both)

1. **Make action items actionable** — Checkboxes + show what AskElephant will automate (Skylar: Critical, Palmer: Major)
2. **Full-screen artifact feel** — Reduce chrome, expand layout (Skylar: Major)
3. **Structured sections as data objects** — Not just visual cards, but persistent entities (Palmer: Major)
4. **Dynamic template inference** — Auto-detect meeting type from context, don't force manual selection (Palmer: Major)
5. **Opinionated defaults** — Ship 3-5 curated templates; zero config to get started (Palmer: Critical, Skylar: implied)
6. **Escape the summary** — Action items → tasks, pain points → company, objections → deal (Both: Major)
7. **Chat-based edit with section context** — Slide-out Global Chat with pre-seeded template + section reference (Skylar: Major, Palmer: aligned)
8. **Surface existing description field** — Quick win: show TLDR on My Meetings cards (Palmer: Medium, zero cost)
9. **Warm up visual hierarchy** — Less flat, more scannable, headers-first reading pattern (Skylar: Minor, Palmer: "I read headers only")

---

_Research compiled 2026-02-18. Skylar + Palmer prototype feedback added 2026-02-18. Next step: Run `/iterate meeting-summary` to produce v2 incorporating both feedback sets._
