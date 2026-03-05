# Research: Meeting Summary

**Initiative:** Meeting Summary  
**Phase:** Build  
**Owner:** Tyler Sahagun  
**Last Updated:** 2026-03-04  
**Research Coverage:** Company context, archive PRD/research (Feb 2026), internal transcripts (Jan 28 + Jan 30, 2026), Slack (#customer-feedback 124 matches, #voice-of-the-customer 53 matches, #case-studies 187 matches, #proj-babar 23 matches), Pylon (unavailable — MCP errored)

---

## TL;DR

Meeting Summary is P0 for the May 4 Chief of Staff launch. Customer signal is exceptionally high-volume and consistent: users across 15+ accounts have independent evidence that the default summary format is wrong (verbose, not meeting-type-aware, buried in workflow outputs), and they're building workarounds or churning. The **learning agent decision** (no template picker; implicit config via chat and behavioral observation) is directionally correct and well-supported by evidence — but the v1 architecture for how preferences are stored, retrieved, and applied at generation time has not been technically specified. The critical unknowns before PRD completion are: (1) generation latency baseline — Skylar is actively blocked and the Fathom <30s bar is far from met, (2) release gate criteria are undefined, (3) the implicit config data model is unspecified by Palmer, and (4) chat performance degrades on multi-line input (Perfect Afternoon signal), which breaks the L4 feedback loop. There is strong competitive pressure (Momentum replacement eval at Dealfront, Fathom/Fireflies comparison at Ampleo) and at least three customers (Quigley, ITS, Class) proving that AE's workflow automation creates measurable outcomes — but Meeting Summary must be the credible foundation that justifies the platform's intelligence claim.

---

## Strategic Alignment

**Score: Strong**

| Dimension | Assessment |
|---|---|
| Trust Foundation | ✅ Evidence links, privacy-before-share, correction-via-chat all operationalize trust |
| Outcome Orientation | ✅ Clear chain: summary → follow-up execution → CRM data quality → revenue outcomes |
| Human Empowerment | ✅ Learning agent keeps humans in control — they teach the system, not configure settings |
| Data Capture | ✅ Sections as first-class data objects (Palmer model) directly improve downstream data quality |
| Differentiation | ✅ No competitor has implicit config model + section-level edit + learning persistence |
| Expansion Driver | ✅ Summary is the PLG wedge; every shared recap is a viral loop |

**Strategic fit score: 28–30 / 30 — Strong alignment, proceed**

**Anti-vision check:** The only risk is feature scope drift toward "generic AI notes." The learning agent model and section-as-data-object architecture are the guard rails that prevent this. The PRD must explicitly state that every section must have an outcome orientation — summaries are not meeting transcripts reformatted; they are structured intelligence with action hooks.

**Aligned with product principles:**
- Principle 5 (AI-First UX): "Your settings are not toggles anymore...It's a chat...AI first." — This is exactly the design.
- Principle 7 (ALHF): "Manager feedback should compound across agents, turning human corrections into shared system improvements." — Chat corrections to the learning agent ARE this principle.
- Principle 9 (Agent-First Primary Interaction): Meeting Summary as a contextual artifact produced by CoS agent, not a destination.

**Concerns:**
- The anti-vision test: *"Generic AI summaries without action/outcome orientation."* If the learning agent ships without reliable action item extraction and the event page redesign doesn't foreground outcomes, we cross this line.
- Trust gap: The learning agent model requires users to trust that their corrections are being persisted and applied. If corrections appear not to "stick," trust collapses immediately. The feedback loop transparency ("Your preference was saved: Discovery calls will now be more concise") is a P0 trust feature.

---

## Primary JTBD

> **"When I finish a customer meeting, I want a polished recap immediately available — in the right format for this meeting type, with action items I can act on — so I can share it confidently and move to the next thing without 15 minutes of editing."**

**Supporting quotes:**

> "Right now, to generate a meeting recap, you have to go to workflows, and you have to create work with all these notes, and this config and go through a lot of different things."
> — Sam, Head of Product (Tyler/Sam Transcript, 2026-01-28) [ARCHIVE]

> "For every meeting that's tagged, every meeting type, I will have a special meeting summary for that."
> — Sam (2026-01-28) [ARCHIVE]

> "As an onboarder, I want meeting summaries to automatically generate customized recap emails so that I don't have to manually copy and paste the same prompt into AskElephant for every client meeting."
> — Brooke Griffiths, CSM, Janie (~Jan 2026) [ARCHIVE]

**Secondary JTBD (Sales Leader):**

> "When I want to coach a rep, I want consistent, structured summaries across my team's calls — so I can scan for patterns, risks, and coaching moments without listening to recordings."

**Tertiary JTBD (CSM):**

> "When I'm preparing for a renewal or escalation, I want a summary that surfaces the risk signals and relationship health — already contextualized for my role — so I can walk in prepared without manual research."

---

## Key Findings

### Finding 1: Summary output is architecturally trapped — it's a workflow output, not a first-class artifact [ARCHIVE + CONFIRMED]

**Evidence:**
> "These workflows don't generate a chat. They generate artifacts." — Sam (Jan 30 brainstorm, 2026-01-30) [ARCHIVE]  
> "Instead of having all of those workflow outputs on the left-hand side... maybe it's like a tab view." — Sam (2026-01-28) [ARCHIVE]

**Impact:** Users can't find, share, or trust summaries because they don't feel like "real" documents. This is the root cause of every verbosity and format complaint — users can't even fix it without navigating to workflow settings. Palmer's event page redesign (Monday target) and Skylar's end-to-end flow are the direct response to this finding.

---

### Finding 2: Default summary verbosity is the #1 format complaint — blocking CRM push [ARCHIVE + CONFIRMED by 5+ new signals]

**Evidence:**
> "As a CSM/Sales team member, I want meeting summaries pushed to HubSpot to be concise and scannable so that I can quickly extract key information without scrolling through verbose details." — Bryan Roy / Scott Hemmeter, Quotivity (~Jan 2026) [ARCHIVE]  
> "Sarah manually edits recap emails after generation because the default template includes unwanted sections." — Neighbor (~Feb 2026) [ARCHIVE]  
> "Grant spent an hour rewriting just to get something that felt authentic." — Grant Chandler onboarding [ARCHIVE]  
> "It's not dialed in well enough... The ball was dropped. So it's too too big, too robust now, too too broad. We wanna focus it in." — Brittani Oliver, Klas Research (2026-03-04, #voice-of-the-customer) [NEW]

**Impact:** Verbose summaries are not a cosmetic problem. They block CRM push (Quotivity), require manual editing before sharing (Neighbor, Grant), and cause customers to distrust AI output (Klas Research). The learning agent must have "conciseness" as a first-class inference dimension — not just section selection, but length and density of each section.

---

### Finding 3: Meeting-type formatting is a top-requested and unmet capability [ARCHIVE + CONFIRMED]

**Evidence:**
> "For every meeting that's tagged, every meeting type, I will have a special meeting summary for that." — Sam (2026-01-28) [ARCHIVE]  
> "As a trainer (Jeff), I want to automatically generate structured training session recaps that include pre-meeting agenda context, post-session outcomes, and mapped feature coverage against the statement of work." — Blair MacKinnon / Jeff Schaffner, Set2Close (~Jan 2026) [ARCHIVE]  
> "As a Therapist or DC, I want to receive meeting summaries that extract only the information relevant to my role." — Cody Robinson, The Carpenter's Shed (2026-03-04) [ARCHIVE]

**Impact:** The learning agent must support meeting-type inference from the very first meeting. The cold start problem (first meeting with no behavioral data) is not solved by asking users to select a template — it must be solved by calendar metadata inference (title, participants, deal stage). Template starter set should include: Discovery, Demo, QBR, Onboarding/CS, Training Session, Internal, General.

---

### Finding 4: Users build manual workarounds when defaults don't fit — evidence of strong latent demand [ARCHIVE + CONFIRMED]

**Evidence:**
> "As an onboarder, I want meeting summaries to automatically generate customized recap emails so that I don't have to manually copy and paste the same prompt into AskElephant for every client meeting." — Brooke Griffiths, Janie (~Jan 2026) [ARCHIVE]  
> "Manual two-step process. McKayla receives deal info from sales, reviews AskElephant summaries, then manually sends welcome email to client." — McKayla Kowallis, Link-X (2026-03-04) [ARCHIVE]  
> "After every call, they copy a transcript from Elephant and put it manually into Cloud. Just can't happen. It's, like, painful to hear that stuff." — Andrew Lee, Head of AI Ops, Redo (2026-03-04, #voice-of-the-customer) [NEW]

**Impact:** Every workaround is a signal that the default summary experience fails to produce what users need. The learning agent's core value proposition is eliminating these per-meeting manual rituals. Redo's "copy transcript to Cloud" signal is particularly damning — users are bypassing the summary entirely and going back to the raw transcript.

---

### Finding 5: Trust in AI summaries is fragile — built-in quality signals are required [ARCHIVE + CONFIRMED]

**Evidence:**
> "They were very inaccurate. And often, there was just way too many of them, and no one was using them, so we got rid of them." — Adam, on legacy AskElephant action items (2026-01-30) [ARCHIVE]  
> "I'm not an emoji guy, and whenever I see emojis, it is a clear indicator that AI is involved now. And so, like, just not having emojis or making things a little bit more clear." — Tanner Tovey, ChargeZoom (2026-03-04, #voice-of-the-customer) [NEW]

**Impact:** Two trust signals from this new data: (1) action item accuracy was so poor it was removed, and the port-from-recap-email fix (Cursor agent synthesis, Signal 15 in previous research) is the known-good solution. (2) Visual design of summaries must avoid emoji and generic-AI aesthetics — Tanner's signal confirms that emoji usage in AI output is a trust-negative signal for professional sales contexts.

---

### Finding 6: Generation latency is a P0 blocker — Skylar flagged it, Fathom sets the bar [ARCHIVE + CONFIRMED]

**Evidence:**
> "I've basically been stuck with this and it's just so so bad. My personal expectation is I don't want ANYTHING to have to load if it's presaved and predetermined to be my default template." — Skylar (~Feb 2026, #proj-babar) [ARCHIVE]  
> "Fathom automatically generates AI-powered meeting summaries delivered in under 30 seconds after calls end." — Fathom product page [ARCHIVE]

**Impact:** If the default template is pre-set and the meeting transcript is processed, there should be zero load time for the user. The current latency is bad enough that Skylar — AskElephant's own designer — is "basically stuck." This is not a nice-to-have optimization; it must be solved before open beta.

---

### Finding 7: Action items need checkboxes, automation visibility, and reliable extraction [ARCHIVE + CONFIRMED]

**Evidence:**
> "Anytime we actually present action items, they need to be, like, a checkbox." — Skylar prototype feedback (2026-02-18) [ARCHIVE]  
> "I think not seeing where AskElephant is gonna do these action items for me is what's really missing." — Skylar (2026-02-18) [ARCHIVE]  
> "Action Items Are Broken — James reports 6+ months of underwhelm, BUT the fix already exists: the recap email workflow extracts action items well. Port that prompt logic to meeting summaries." — Cursor agent synthesis (~Feb 2026, #proj-babar) [ARCHIVE]

**Impact:** The recap email prompt is a known-good, tested solution for action item extraction. It should be the initialization point for the learning agent's action item section — not rebuilt from scratch. Action items that are not actionable (no checkbox, no automation preview) actively destroy trust.

---

### Finding 8: Sharing is a first-class capability — privacy controls must gate it, interactive sharing is the long-term vision [ARCHIVE + NEW]

**Evidence:**
> "As a sales manager, I want to automatically include shareable meeting links in follow-up emails so that clients can interact with call transcripts and ask questions directly." — Pinny Ackerman, GetPeyd (~Jan 2026) [ARCHIVE]  
> "As a CSM or partner manager, I want to control whether a meeting summary is sent to external participants." — April Nuttall, Boostability (~Jan 2026) [ARCHIVE]  
> "As a sales rep, I want to generate meeting summaries in AskElephant automatically, but choose manually which ones to push to HubSpot, so that I maintain privacy control." — Alex Beian, Turftank (2026-02-25) [NEW]

**Impact:** Privacy control before share is confirmed as table stakes by at least 3 independent signals. For v1, link sharing with privacy gate is the right scope. Interactive sharing (recipient can query transcript) is the compelling long-term vision from GetPeyd and should be in the backlog.

---

### Finding 9: Sections should escape the summary into deal and company objects [ARCHIVE + CONFIRMED by multiple case studies]

**Evidence:**
> "What if the about them was actually attached to the company so that that was context that goes further than just a meeting summary." — Palmer (2026-02-18) [ARCHIVE]  
> "Next steps — there needs to be a piece of pulling these into out of the summary object here and actually into just the meeting itself in a way or, like, the deal." — Skylar (2026-02-18) [ARCHIVE]  
> "Meeting summaries are being generated in AskElephant, but they're not consistently landing in HubSpot where they need to be." — Guardian HT case study signal (2026-03-04, #case-studies) [NEW]

**Impact:** Guardian HT's broken HubSpot sync is a concrete validation of Palmer's architectural model: sections as data objects that can independently flow to CRM records. The "sections escape the summary" architecture must be a PRD requirement, not an architectural aspiration.

---

### Finding 10: Chat performance is a critical dependency for the learning agent's feedback loop [ARCHIVE + CONFIRMED]

**Evidence:**
> "If you have really any prompt that's probably longer than maybe one or two lines, it will like, the page will stall, and then I'll get the like, it has to wait or, like, wait like, wait for the page or just exit and kind of give up on it." — Danielle Wisneski, Perfect Afternoon (~Feb 2026, #voice-of-the-customer) [ARCHIVE]

**Impact:** The learning agent's L4 (chat corrections — "Make future discovery call summaries more concise") depends on a reliable chat interface. If multi-line chat inputs cause page stalls, the entire implicit config feedback loop breaks. This is a hard dependency that must be resolved before the learning agent's correction pathway is considered viable.

---

### Finding 11: Emoji-free, professional design is a trust signal for sales teams [NEW]

**Evidence:**
> "I'm not an emoji guy, and whenever I see emojis, it is a clear indicator that AI is involved now. And so, like, just not having emojis or making things a little bit more clear." — Tanner Tovey, ChargeZoom (Skylar CoS Prototype feedback session, 2026-03-04) [NEW]

**Impact:** The Skylar v1 prototype feedback explicitly called for removing the "too stale / flat" aesthetic — but the corrective must avoid the opposite error of emoji overuse. Professional, minimalist design is the signal of a tool to be trusted in customer-facing contexts.

---

### Finding 12: AE is being evaluated as a Momentum/Gong replacement — summary quality is a critical evaluation criterion [NEW]

**Evidence:**
> "Current Momentum Usage: Call recording, CRM field updates, risk flagging, executive briefs, soft validation rules, win tracking, smart clips, retroactive field population." — Stuart Moss, Dealfront (2026-03-04, #customer-feedback) [NEW]  
> "Call Focus: AskElephant fit, pricing, competitive differentiation vs. Fireflies and Fathom" — Brandon Dith-Berry, Ampleo (2026-03-04, #customer-feedback) [NEW]

**Impact:** Two active competitive evaluations where meeting summary quality is on the line. The summary must credibly cover: executive briefs (Dealfront need), risk flagging, and structured CRM updates — not just text summaries. Ampleo is evaluating us against Fathom and Fireflies directly.

---

## User Problems

| Problem | Severity | Frequency | Evidence (Quote) | Persona |
|---|---|---|---|---|
| Summary buried in workflow outputs — not a first-class artifact | Critical | Every meeting | "These workflows don't generate a chat. They generate artifacts." — Sam | All |
| Default summary is verbose and not scannable | Critical | Every meeting | "Too big, too robust, too too broad. We wanna focus it in." — Brittani Oliver, Klas | All |
| No meeting-type formatting — same template for all meetings | High | Every meeting | "For every meeting type, I will have a special meeting summary." — Sam | All |
| Can't edit sections without regenerating the whole summary | High | Frequent | "Sarah manually edits recap emails" every time — Neighbor | Reps, CSMs |
| Action items are inaccurate, no checkboxes, no automation visibility | High | Every meeting | "Very inaccurate... no one was using them, so we got rid of them." — Adam | All |
| Generation latency blocks usage and trust | High | Every meeting | "Basically been stuck with this and it's just so so bad." — Skylar | All |
| No implicit persistence of user corrections — prompts re-pasted manually | High | Every meeting | "Manually copy and paste the same prompt into AskElephant for every client meeting." — Janie | CSM, Reps |
| Summary doesn't flow to HubSpot reliably | High | Per workflow | "Not consistently landing in HubSpot where they need to be." — Guardian HT | RevOps, CSMs |
| Meeting page cluttered — summary competes for attention | Medium | Every visit | "It's just a lot of things I could click here. Cannot have that." — Sam | New users, reps |
| No privacy controls before sharing | Medium | Per share event | "Choose manually which ones to push to HubSpot" — Turftank | All |
| Mobile copy/paste from recap emails is broken | Medium | Field use | "Can't long-press to copy text from recap email on mobile." — Mobrium | Field reps |
| Emoji/AI-looking design undermines professional trust | Medium | First impression | "Emojis are a clear indicator that AI is involved now." — Tanner Tovey | All (sales) |
| Summaries for unintended meetings clutter CRM | Medium | Ongoing | "Only create meeting summaries for meetings where tracked user actually participated" — TurfTank | Admin/RevOps |

---

## Feature Requests

| Request | Customer / Source | Priority | Implicit Config Relevance |
|---|---|---|---|
| Per-meeting-type formatting (not generic) | Sam (Jan 28), Set2Close, Carpenter's Shed, KAJAE | P0 | Core learning agent output |
| Concise, scannable summaries (not verbose blobs) | Quotivity, Neighbor, Klas Research, Grant Chandler | P0 | First learning dimension |
| In-place section editing via chat (no workflow nav) | Sam (Jan 28), Palmer, Skylar | P0 | L4 correction pathway |
| Action items: checkboxes + automation preview | Skylar, Cursor agent synthesis | P0 | Core UX for all personas |
| Summary as first-class artifact tab on event page | Sam (Jan 28, Jan 30), Skylar, Tyler | P0 | Event page redesign scope |
| Fast generation (<30 seconds) | Skylar, Fathom benchmark | P0 | Infrastructure requirement |
| Privacy-before-share controls | Turftank, Boostability, PRD | P0 | Trust requirement |
| Summary → HubSpot push (selective, not automatic) | Quotivity, Guardian HT, Turftank, Link-X | P1 | Sections-as-data-objects |
| Meeting type inference from calendar metadata | Palmer (Feb 18), Sam (Jan 28) | P1 | L2 of learning agent |
| Save editing preference for future meetings | Multiple | P1 | Core learning agent pitch |
| Role-based summary views (same meeting, different view per viewer) | Carpenter's Shed | P1 | Multi-viewer architecture |
| Recurring meeting aggregate summaries | KAJAE, Atlanta Creative | P2 | Weekly Brief agent scope |
| Interactive sharing (recipient can query transcript) | GetPeyd | P2 | Future sharing vision |
| Multilingual summaries | Boostability | P2 | International expansion |
| Slide deck artifact from recording | Guardian HT (VOTC) | P2 | Artifact format variety |
| Mobile-first sharing UX | Mobrium | P2 | Mobile experience gap |

---

## User Breakdown

### Sales Representative

**Primary need:** A polished, immediately available post-meeting recap in the format that matches this meeting type — ready to share with the buyer or log to HubSpot in under 2 minutes.

**Key pain:** Re-prompting AI with the same instructions for every meeting. Manual editing every time because the default doesn't fit. CRM push takes too long because summaries are too verbose or arrive in wrong format.

**What they'd value most:**
1. Zero-config first meeting — summary generates in the right format automatically
2. One correction persists forever ("Make discovery calls more concise" → done permanently)
3. Evidence links — they can confidently share because sources are verifiable

**Supporting quote:**
> "Grant would spend an hour rewriting and tweaking just to get something that felt authentic." — Grant Chandler onboarding [ARCHIVE]

---

### Sales Leader

**Primary need:** Team-level consistency in how meetings are documented so coaching, forecasting, and deal inspection are efficient.

**Key pain:** Every rep has a different default format. No standardization across meeting types. Coaching requires rewatching recordings instead of scanning structured summaries.

**What they'd value most:**
1. Standardized templates across the team (workspace-level config)
2. Clear action items with completion visibility — who owns what
3. Risk signals surfaced in the summary without manual extraction

**Supporting quote:**
> "50% → near 100% note-taking compliance" with AskElephant workflows — Quigley case study (2026-03-04) [NEW]  
> "Forecasting accuracy: 90%+ with AskElephant + HubSpot integration" — ITS case study (2026-03-04) [NEW]

---

### CSM

**Primary need:** Renewal prep context and handoff clarity from past meetings — structured sections for sentiment, risk signals, commitments made.

**Key pain:** QBR summaries are formatted differently each time. Handoffs from sales are manual (summary → review → welcome email). No way to see trending topics or sentiment across a customer's meeting history.

**What they'd value most:**
1. CS-specific templates (QBR, renewal, onboarding, handoff)
2. Handoff automation — summary sections flow to the deal and trigger downstream actions
3. External sharing with privacy controls

**Supporting quote:**
> "McKayla receives deal info from sales, reviews AskElephant summaries, then manually sends welcome email to client. As Link-X scales, this becomes a bottleneck." — Link-X onboarding (2026-03-04) [ARCHIVE]

---

## Learning Agent Implications

*This section is specific to the architectural decision logged 2026-03-04: NO template picker — learning agent that infers meeting type and user preferences from behavioral patterns, correctable via chat.*

### Evidence FOR the learning agent model (implicit config)

| Evidence | Signal | Source |
|---|---|---|
| Users hate explicit configuration | "When I see the configuration, it's like, I'm out." — Palmer (Feb 18 prototype review) | Internal [ARCHIVE] |
| Same prompt re-pasted every meeting | Janie's Brooke is copy-pasting the same prompt for every client meeting | Customer (#customer-feedback) [ARCHIVE] |
| Chat-based config is the preferred vision | Sam proposed a chat flow that walks through "what are the most common types of calls" with live preview | Internal transcript (Jan 28) [ARCHIVE] |
| Palmer's Codex analogy | "Configuration could just be markdown files injected in certain situations. Let me look up what stuff you've written about action items." | Internal (Feb 18) [ARCHIVE] |
| Tyler/Palmer strong agreement | "I don't want to have to configure stuff. I want to just use the app, and as I'm using it, it says, I realized you look at all of your meeting preps at 8am." | Internal (Feb 18) [ARCHIVE] |
| Product principle alignment | Product Principle 5 (AI-First UX): "Your settings are not toggles anymore...It's a chat...AI first." | product-vision.md |

### Evidence AGAINST or raising trust concerns

| Concern | Signal | Source |
|---|---|---|
| Multi-viewer template conflict | "If you're the owner but there are multiple internal people, they're expecting to see their summary when they go in there, but you have a different one. So they walk in and are like, what the hell is going on here?" — Palmer | Internal (Feb 18) [ARCHIVE] |
| Cold start produces generic output | No evidence the learning agent starts from a better position than the current broken default — it needs L1 initialization | Research gap |
| Chat performance kills the feedback loop | Page stalls on multi-line prompts today — L4 (chat corrections) depends on this being fixed | Perfect Afternoon VOTC [ARCHIVE] |
| Correction persistence isn't visible | Users need explicit confirmation that their correction was saved and will be applied — silent learning feels untrustworthy | No evidence of current trust design |
| Team-level config conflicts with personal config | A workspace admin sets a standard template; a rep overrides it; a new rep joins and gets neither | Architecture gap |

### The Cold Start Problem

The learning agent cannot start from zero. For the first meeting, there is no behavioral data and no explicit preference. The solution:

| Layer | Mechanism | Source Evidence | Status |
|---|---|---|---|
| **L1: Seed defaults from known-good prompts** | Initialize with recap email prompt logic (already proven to extract action items well). Use General template with sensible defaults for first meeting. | Cursor agent synthesis (#proj-babar, Feb 2026) | Ready — Palmer is already working on "extracting notes from workflow chats" which is the same prompt [ARCHIVE] |
| **L2: Meeting type inference from metadata** | Infer from calendar event title, attendee list, deal stage in CRM (not transcript analysis — too slow). Tag → template mapping. | Sam (Jan 28 transcript), Palmer (Feb 18) | Needs scoping — Palmer to spec |
| **L3: Behavioral observation** | Track which sections users expand, skip, or edit. After 3+ meetings of same type, adjust default sections. | Archive research | Architecture not yet designed |
| **L4: Chat corrections** | "Make future discovery call summaries more concise" → stored as a user-level preference JSON that modifies the generation prompt. | Sam (Jan 28), Palmer (Feb 18) | Depends on chat performance fix |
| **L5: Explicit nudge** | After 5th meeting of a type where user consistently edits the same section: "You always edit Pain Points — want me to adjust your default?" | Design proposal | UX not yet designed |

### What "correction via chat" needs to feel like for a rep

Based on Sam's vision (Jan 28 transcript) and Skylar's prototype feedback (Feb 18):

1. **Seeded context in the chat** — Clicking "Edit" on a section opens global chat with the template and section pre-populated as context (e.g., `#discovery-call-template > pain-points`). The rep isn't starting from scratch.
2. **Immediate preview** — The chat edit shows a diff before applying, so the rep can see exactly what changes.
3. **Explicit persistence confirmation** — A toast or banner: "Preference saved. Future discovery call summaries will apply this format." The rep knows the system heard them.
4. **Reversible** — "Reset to default" always available. Learning should never feel like a trap.
5. **Single-player first** — For open beta, each user's corrections only affect their own view. Team-level template inheritance is v2.

### Open architecture questions for the learning agent (must be resolved before PRD)

1. **Data model for learned preferences**: Does the implicit config live as a user-level JSON record? A vector embedding? A modifier injected into the generation prompt at runtime? Palmer needs to spec this.
2. **Scope of learning**: User-level only for v1, or workspace-level from day 1? Multi-viewer conflict risk (Palmer's concern) argues for user-level first.
3. **When does L2 inference run**: At meeting creation (calendar sync time) or at summary generation time? Calendar-time is better for cold start but requires CRM integration.
4. **Version control for corrections**: If a user corrects the model, then corrects the correction — does the system keep history or just the latest state?
5. **Is L3 (behavioral observation) in scope for May 4?**: L1 + L2 + L4 might be sufficient for open beta. L3 adds complexity. Decide scope explicitly.

---

## Competitive Signals

| Competitor | Meeting Summary Capability | Key Differentiator | AE Gap / Opportunity |
|---|---|---|---|
| Fathom | 5.0/5 G2 (6,200+ reviews), 30-sec delivery, 18+ templates, auto-classification by meeting type | Speed + zero config | AE gap: latency. AE opportunity: learning persistence (Fathom doesn't remember corrections) |
| Gong | AI Briefer with timestamped source traceability, account-centric meeting prep | Enterprise, account-centric, trust via citations | AE gap: CRM depth. AE opportunity: section-level edit (Gong is read-only) |
| Fireflies.ai | 200+ mini apps, 18+ templates, custom sections, role-specific extraction | Extensibility breadth | AE gap: template variety. AE opportunity: AE learns, Fireflies configures |
| Granola | "Recipes" — custom templates without a bot, no-bot approach | Bot-free, private | AE gap: privacy/no-bot. AE opportunity: outcomes orientation vs. Granola's pure notes |
| Otter.ai | Live Summary (real-time scrolling summary for latecomers) | Real-time | AE gap: live summary. AE opportunity: post-meeting structured artifact |
| Momentum (acquired by Salesforce) | Risk flagging, executive briefs, soft validation rules, win tracking, smart clips | Enterprise CRM intelligence | AE opportunity: Dealfront (current Momentum user) actively evaluating AE as replacement [NEW] |
| Ampleo (evaluating Fathom/Fireflies) | Unified meeting data + HubSpot integration | Integration breadth | AE competitive eval signal: Ampleo wants unified data — AE must demonstrate CRM integration superiority [NEW] |

**Key competitive insight (NEW):** AE is being evaluated as a direct Momentum replacement by at least one account (Dealfront/Stuart Moss). Momentum's feature set includes: call recording, CRM field updates, risk flagging, executive briefs, soft validation rules, win tracking, smart clips, retroactive field population. This is the feature set Meeting Summary must credibly address to win competitive replacements.

**AE's unique position:** No competitor has all three of: (a) implicit config / learning persistence, (b) section-level AI edit with chat interface, (c) sections as first-class data objects that flow to CRM records. This is the differentiated position and must be the PRD's stated competitive advantage.

---

## Quantitative Context

| Metric | Value | Source |
|---|---|---|
| Fathom G2 rating | 5.0/5 (6,200+ reviews) | G2, Feb 2026 [ARCHIVE] |
| Fathom summary delivery speed | <30 seconds post-call | Fathom product page [ARCHIVE] |
| Fireflies AI summary templates | 18+ pre-built | Fireflies docs [ARCHIVE] |
| Human-AI hybrid improvement over AI-only | 30–50% better accuracy | Workmate.com research (2025) [ARCHIVE] |
| Note-taking time reduction (AI tools) | Up to 70% | Workmate.com research (2025) [ARCHIVE] |
| Meeting summary savings per meeting | ~15 min (Avoma claim) | Avoma marketing [ARCHIVE] |
| Slack messages mentioning "meeting summary" | 6,566 total across workspace | Slack search (Feb 2026) [ARCHIVE] |
| Quigley note-taking compliance with AE | 50% → near 100% | #case-studies (2026-03-04) [NEW] |
| ITS forecast accuracy with AE + HubSpot | 90%+ | #case-studies (2026-03-04) [NEW] |
| #customer-feedback signals about "meeting summary" since Jan 2026 | 124 total matches | Slack search (2026-03-04) [NEW] |
| #voice-of-the-customer signals about "summary" since Jan 2026 | 53 total matches | Slack search (2026-03-04) [NEW] |

**Baselines urgently needed (none established):**
- Current AskElephant summary generation time (p50/p95 seconds post-call)
- Current summary engagement rate (views / total meetings with transcripts)
- Current manual editing rate (what % of summaries are modified before sharing)
- Current CRM push completion rate from summaries
- % of users who generate recurring meeting summaries vs. ad-hoc

---

## Research Gaps

| Gap | Priority | Method to Close | Suggested Owner | When |
|---|---|---|---|---|
| **Generation latency baseline** — current p50/p95 is unknown; Skylar is blocked by it today | **P0** | Palmer: pull from logs or PostHog workflow execution times | Palmer | Before open beta |
| **Release gates for Meeting Summary** — undefined; Tyler committed 2026-02-24 | **P0** | Tyler defines and team reviews | Tyler | Immediately |
| **Learning agent v1 data model** — how preferences are stored/retrieved/applied is unspecified | **P0** | Palmer architecture spike (1–2 day timeboxed) | Palmer | Before build kickoff |
| **Chat performance for multi-line inputs** — Perfect Afternoon confirmed page stall; L4 depends on this | **P0** | Palmer: reproduce, profile, fix. Dependency for implicit config | Palmer / Eng | Before open beta |
| **Nic Suder (ObservePoint) feedback details** — Skylar ran a full feedback session; notes in Notion but not synthesized | **P1** | Tyler: read Notion notes → extract findings into this doc | Tyler | This week |
| **Jeff Moss (partner) CoS feedback** — Robert's EOD (2026-03-04) mentions expert feedback not yet captured | **P1** | Robert: share notes with Tyler | Robert | This week |
| **Skylar's UX teardown findings** — she did a focused note-taker UX teardown (~Feb 2026); outputs not captured | **P1** | Skylar: publish findings to #proj-babar or Notion | Skylar | This week |
| **Implicit config v1 scope decision** — is L1+L2+L4 sufficient for May 4? Or must L3 (behavioral observation) be included? | **P1** | Tyler decision with Palmer and Skylar input | Tyler | Before PRD |
| **Template default set validation** — which 5–6 templates ship in v1? (Current proposal: General, Discovery, Demo, QBR, Onboarding, Training Session) | **P1** | Validate with top 10 accounts via 3-question survey (Robert) | Robert | Next 2 weeks |
| **Sharing scope for open beta** — link share only? Email delivery? Interactive sharing? | **P1** | Skylar's end-to-end prototype will answer this visually; align post-demo | Tyler + Skylar | Post-prototype |
| **PostHog baseline metrics** — engagement rate, view rate, editing rate, generation time not tracked | **P1** | Palmer: instrument PostHog funnel. Dashboard URL exists but no baselines set | Palmer | Before beta |
| **Pylon customer tickets** — MCP server unavailable; summary/recap/template tickets not pulled | **P2** | Request Ben Harrison or CS team to pull Pylon tickets on summary quality | Tyler / Robert | This week |
| **Multilingual summary use case** — Boostability signal; not scoped but needs tracking | **P2** | Log as future backlog item; flag for international roadmap | Tyler | Backlog |
| **Interactive sharing (recipient queries transcript)** — GetPeyd signal; different architecture | **P2** | Log as v2+ vision item; don't block v1 scope | Tyler | Backlog |

---

## Feedback Plan

| Method | Audience | Instrument | Timing | Status |
|---|---|---|---|---|
| Prototype feedback sessions (internal) | Crispy + internal team | End-to-end prototype (Skylar building now) | This week (2026-03-04 today with Crispy) | Active |
| Customer feedback sessions (external) | 3+ customers (Robert's commitment) | End-to-end prototype demo | Before 2026-03-14 | In progress |
| Focus group (internal) | AskElephant team | To be organized by Robert | 2026-03-10 target | Not started |
| Nic Suder (ObservePoint) feedback synthesis | Single customer | Notion notes exist; need synthesis | This week | Gap — unprocessed |
| PostHog funnel instrumentation | All users | Meeting created → Summary generated → Summary viewed → Summary edited → Summary shared | Before beta (2026-04-15) | Not started |
| In-app micro-feedback | Active users | After 5th summary view: "How useful is your meeting summary?" (1–5) | At GA | Not started |
| ALHF capture (thumbs up/down per section) | Active users | Thumbs up/down + optional voice note | At GA | Not started |
| Template validation survey | Top 10 accounts | 3-question: preferred format, meeting types, sections | Next 2 weeks | Not started |

---

## Questions to Answer Before PRD

These are specific, answerable questions that must be resolved before Tyler can write a complete PRD for the learning agent model. They are not open-ended — each has an owner and a method.

1. **What is the current summary generation latency?** (Palmer: check logs or PostHog. Fathom's bar is <30s.)
2. **What are the hard release gates for Meeting Summary to qualify for open beta and May 4 GA?** (Tyler defines. Examples: summary generates in <30s, action items have checkboxes, privacy gate exists before share, event page redesign is live.)
3. **How does the learning agent store and retrieve user preferences?** (Palmer: one-day architecture spike. JSON user config? Prompt modifier at generation time? This affects the entire build estimate.)
4. **Is L3 (behavioral observation) in scope for May 4?** (Tyler decision with Palmer input. L3 adds significant complexity. L1+L2+L4 may be the right v1 scope.)
5. **Which 5–6 templates ship in v1?** (Tyler + Robert: validate with top 10 accounts this week. Current proposal: General, Discovery, Demo, QBR, Onboarding, Training Session.)
6. **What does "sharing" mean for open beta?** (Link share only? Email? Slack? The Skylar prototype must answer this question visually before the PRD is locked.)
7. **Is chat performance fixed or roadmapped before open beta?** (Perfect Afternoon signal: multi-line inputs cause page stalls. If not fixed, L4 must be removed from v1 scope.)
8. **What are the details of Nic Suder's feedback session?** (Tyler: read Notion notes this week. This is likely the highest-signal single-customer input available.)
9. **What did Jeff Moss (partner, CS expert) say about Chief of Staff?** (Robert: share notes this week.)
10. **What did Skylar's UX teardown of note-takers reveal?** (Skylar: publish findings. Particularly any adaptive/learning patterns from competitors.)

---

## Open Questions

1. **Multi-viewer architecture for v1**: Palmer flagged the multi-viewer summary conflict (two AE employees attend the same meeting — whose template renders?). Decision: user-level summaries only for v1 (single-player first). Needs explicit confirmation from Tyler.
2. **Agent-first paradigm vs. event page redesign**: The decision log (Feb 18) states "do not over-invest in the meeting page UX itself" — but the event page redesign IS the current sprint. The reconciliation: the event page redesign is the short-term container; the CoS agent is the long-term access point. Both are true.
3. **Migration path for existing workflow-based summary users**: Palmer is building "extracting notes from workflow chats" (bridge work). How do we handle users who have invested in custom workflow configurations? Parallel run or deprecation path?
4. **Meeting type tagging dependency**: The learning agent's L2 (meeting type inference) works best when meetings are tagged. If a meeting has no calendar metadata, no meeting type, and no prior behavioral data — what does the user see? This is the true cold start edge case.
5. **Chief of Staff 5-agent coordination**: Meeting Summary is one of 5 agents. How does the summary inform the other 4 agents? (E.g., does the learning agent's preferences apply when the Weekly Brief agent aggregates summaries? Does the Action Items agent use the same section data?)
6. **North Star metric baseline**: The outcome target is ">60% of users with recorded meetings view summary at least once per week." The current baseline is unknown. Without a baseline, the target is a guess.

---

## Synthesis: What We Know vs. What We Need to Validate

### What We Know (High Confidence)

| Theme | Evidence | Confidence |
|---|---|---|
| Summary verbosity is the #1 format complaint | Quotivity, Neighbor, Klas Research, Grant Chandler (all independent) | **High** |
| Meeting-type formatting is unmet but deeply wanted | Sam (x2), Set2Close, Carpenter's Shed, KAJAE, Janie | **High** |
| Implicit config (chat corrections) is the right model | Sam transcript, Palmer Feb 18, decisions.md | **High** |
| Action items need checkboxes + automation visibility + better extraction | Skylar (prototype feedback), Cursor synthesis, Adam (legacy failure) | **High** |
| Generation latency is P0 — Fathom <30s is the bar | Skylar "so so bad", Fathom benchmark, archive research | **High** |
| Summary sections should be data objects, not text blobs | Palmer architectural model, Guardian HT CRM sync failure, Link-X handoff gap | **High** |
| Privacy-before-share is table stakes | Turftank, Boostability, TurfTank specific signal, PRD | **High** |
| The recap email prompt is a known-good initializer for action items | Cursor synthesis, Palmer "extracting workflow chats" | **Medium-High** |
| Chat performance is a dependency risk for implicit config | Perfect Afternoon (page stalling on multi-line prompts) | **Medium-High** |
| Emoji-free, professional design is required for sales trust | ChargeZoom / Tanner Tovey VOTC | **Medium** |
| AE is being evaluated as Momentum replacement | Dealfront discovery call (2026-03-04) | **Medium** |

### What We Need to Validate (Gaps)

| Question | Method | Owner | Timeline |
|---|---|---|---|
| Current summary generation latency (p50/p95) | PostHog / log analysis | Palmer | Before open beta |
| Release gates for Meeting Summary | Tyler defines | Tyler | Immediately |
| Learning agent v1 data model | Palmer spike | Palmer | Before build kickoff |
| Does sharing need to be interactive (recipient queries)? | Post-prototype alignment | Tyler + Skylar | Post-Skylar prototype |
| Which 5–6 templates ship in v1? | Top 10 account survey | Tyler / Robert | Next 2 weeks |
| Nic Suder feedback details | Notion notes synthesis | Tyler | This week |
| Jeff Moss CoS feedback | Robert shares | Robert | This week |
| Skylar UX teardown findings | Skylar publishes | Skylar | This week |

---

## References

### Internal Sources — Transcripts

| Source | Date | Link |
|---|---|---|
| Tyler / Sam — Flagship Meeting Recap UX | 2026-01-28 | `pm-workspace-docs/signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md` |
| Meeting Page View Brainstorm (Sam, Adam, Skylar) | 2026-01-30 | `pm-workspace-docs/signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md` |
| Skylar + Palmer prototype feedback (v1) | 2026-02-18 | `pm-workspace-docs/initiatives/active/chief-of-staff-experience/archive/meeting-summary/research.md` |

### Internal Sources — Archive

| Source | Date | Link |
|---|---|---|
| Chief of Staff archive research | 2026-02-18 | `pm-workspace-docs/initiatives/active/chief-of-staff-experience/archive/meeting-summary/research.md` |
| Chief of Staff archive PRD | 2026-02-18 | `pm-workspace-docs/initiatives/active/chief-of-staff-experience/archive/meeting-summary/prd.md` |
| Decisions log | 2026-03-04 | `pm-workspace-docs/initiatives/active/meeting-summary/decisions.md` |

### Internal Sources — Slack

| Source | Date | Link |
|---|---|---|
| Quotivity — summary verbosity blocking HubSpot | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1768255707533829) |
| TurfTank — meeting targeting + email formatting | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1768406325481239) |
| Janie — manual prompt copy/paste per meeting | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1768242558583289) |
| The Carpenter's Shed — role-based summaries | 2026-03-04 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772221554818969) |
| Set2Close — training session recap structure | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1767735414705739) |
| GetPeyd — shareable meeting links (interactive) | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1767723853189159) |
| Boostability — multilingual + consent controls | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1768327383623939) |
| Mobrium — mobile copy/paste from recap emails | ~Feb 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1771967077780119) |
| KAJAE — recurring meeting reports per attendee | ~Jan 2026 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1768241582896119) |
| Link-X — sales-to-CS handoff automation | 2026-03-04 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772578656861769) |
| Dealfront — Momentum replacement evaluation | 2026-03-04 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772211802954479) |
| Ampleo — evaluating AE vs Fathom/Fireflies | 2026-03-04 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772059684479379) |
| Turftank — selective HubSpot publish | 2026-02-25 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772035101371119) |
| Atlanta Creative — aggregate multi-meeting insights | 2026-03-04 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772143444265459) |
| Riv Solar — meeting insights for field reps at scale | 2026-03-04 | [#customer-feedback](https://askelephant.slack.com/archives/C08KRKSDMEF/p1772139966486519) |
| Perfect Afternoon — chat stalling on multi-line prompts | ~Feb 2026 | [#voice-of-the-customer](https://askelephant.slack.com/archives/C0988DXLWAW/p1771526930646949) |
| ChargeZoom (Tanner Tovey) — no emojis in CoS prototype | 2026-03-04 | [#voice-of-the-customer](https://askelephant.slack.com/archives/C0988DXLWAW/p1772231929159619) |
| Klas Research — Coach Warren workflow too broad | 2026-03-04 | [#voice-of-the-customer](https://askelephant.slack.com/archives/C0988DXLWAW/p1772580332871899) |
| Guardian HT — slide deck generation request | 2026-03-04 | [#voice-of-the-customer](https://askelephant.slack.com/archives/C0988DXLWAW/p1772562858387089) |
| Redo (Andrew Lee) — manual transcript copy to Cloud | 2026-03-04 | [#voice-of-the-customer](https://askelephant.slack.com/archives/C0988DXLWAW/p1771970664319389) |
| Impact Lab (Eva McCann) — multi-meeting context for MEDDPIC | 2026-03-04 | [#voice-of-the-customer](https://askelephant.slack.com/archives/C0988DXLWAW/p1771977735275639) |
| Quigley — 50% → 100% note-taking compliance | 2026-03-04 | [#case-studies](https://askelephant.slack.com/archives/C08KS9TCDNG/p1772580638369219) |
| ITS — 90%+ forecast accuracy | 2026-03-04 | [#case-studies](https://askelephant.slack.com/archives/C08KS9TCDNG/p1772642155600559) |
| Skylar — latency flagged | ~Feb 2026 | [#proj-babar](https://askelephant.slack.com/archives/C0AG7RM23GE/p1771887558863219) |
| Palmer — extracting notes from workflow chats | 2026-03-03 | [#proj-babar](https://askelephant.slack.com/archives/C0AG7RM23GE/p1772563954062109) |
| Cursor — port recap email prompt to meeting summary | ~Feb 2026 | [#proj-babar](https://askelephant.slack.com/archives/C0AG7RM23GE/p1771630276265999) |
| Skylar — Crispy feedback session today | 2026-03-04 | [#proj-babar](https://askelephant.slack.com/archives/C0AG7RM23GE/p1772648390516199) |
| Robert — Jeff Moss CoS feedback + focus group | 2026-03-04 | [#proj-babar](https://askelephant.slack.com/archives/C0AG7RM23GE/p1772643469167899) |
| Skylar — UX teardown of note-takers | ~Feb 2026 | [#proj-babar](https://askelephant.slack.com/archives/C0AG7RM23GE/p1771869032370039) |
| Nic Suder (ObservePoint) feedback — full session | ~Feb 2026 | [Notion](https://www.notion.so/ask-elephant/Nic-Suder-ObservePoint-313f79b2c8ac80acb256cf124923af29) |

### External Research

| Source | Topic | Link |
|---|---|---|
| Fathom product page | Summary delivery speed, templates | [fathom.ai](https://fathom.ai) |
| Gong AI Briefer | Source traceability, meeting prep | [help.gong.io](https://help.gong.io/understanding-ai-briefs) |
| Fireflies mini apps | 200+ apps, template customization | [fireflies.ai/apps](https://fireflies.ai/apps) |
| Meetily OSS research | Summary hallucination patterns | [meetily.ai](https://meetily.ai/blog/our-quest-for-meeting-summary-accuracy) |
| Google/MIT transparency dashboard | Trust through AI transparency | [arxiv.org](https://arxiv.org/abs/2406.07882) |
| Workmate.com | Human-AI hybrid improvement stats | [workmate.com](https://www.workmate.com/blog/ai-for-meeting-summaries-best-practices-to-automate-notes) |

---

### Data Note — Pylon

Pylon MCP server was unavailable during this research run (MCP server errored). Customer support tickets mentioning "summary", "recap", "meeting notes", or "template" were not pulled. **This is a P2 research gap** — Ben Harrison (Head of CS) or the support team should pull relevant Pylon tickets to complement the Slack signal analysis.

---

*Research compiled 2026-03-04 by PM Research Agent. Complete replacement of prior partial research.md. Sources: #customer-feedback (124 matches), #voice-of-the-customer (53 matches), #case-studies (187 matches), #proj-babar (23 matches), Chief of Staff archive, internal transcripts, company context. Pylon unavailable.*

---

## Structured Output (JSON)

```json
{
  "project": "meeting-summary",
  "artifacts_written": ["research.md"],
  "alignment": "strong",
  "key_problems": [
    "Summary verbosity is default behavior, blocks CRM push, drives manual editing",
    "No meeting-type formatting — same output for all meeting types",
    "Generation latency is P0 — blocking usage today",
    "Action items are inaccurate, non-interactive, no automation visibility",
    "Learning agent cold start and v1 architecture are unspecified"
  ],
  "feature_requests": [
    "Per-meeting-type formatting with learning persistence",
    "Concise, scannable sections with outcome orientation",
    "Chat-based correction that persists preferences",
    "Action items with checkboxes and automation preview",
    "Privacy-before-share controls"
  ],
  "primary_jtbd": "When I finish a customer meeting, I want a polished recap immediately available — in the right format for this meeting type, with action items I can act on — so I can share it confidently without 15 minutes of editing.",
  "user_breakdown_available": false,
  "feedback_method": "interview-plan",
  "next_action": "pm — but 4 P0 gaps must be closed first: latency baseline, release gates, learning agent data model, chat performance fix"
}
```
