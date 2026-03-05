# Jason Harmon — AskElephant Profile

**Title:** Software Engineer | **Tenure:** 7 months | **Location:** Eagle Mountain, UT
**Reports to:** Bryan Lund (Senior Software Engineer) | **Department:** EPD

---

## Part 1: Personality Assessment

_Based on 2,299 Slack messages across 23+ channels, meeting transcripts, and team interactions._

---

### Communication DNA

Jason is one of the most naturally transparent communicators on the engineering team. Across nearly 2,300 Slack messages, a consistent pattern emerges: he tells you what he is doing, why he is doing it, and what he found — without being asked.

**Channel Presence:**

| Channel               | Weight     | What It Reveals                                                                                                            |
| --------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| #team-dev-code-review | Heaviest   | Takes code review seriously; asks for feedback on his own work and provides it for others                                  |
| #product-issues       | High       | Doesn't just close tickets — investigates, explains findings, and links root causes                                        |
| #product-updates      | Regular    | Shares work publicly with preview links, Looms, and "sneak peek" posts                                                     |
| #team-dev             | Active     | Asks questions, proposes ideas, shares data ("Results of the user role reconciliation script, in case anyone was curious") |
| #product-forum        | Consistent | Weighs in on product direction, connects dots between features                                                             |
| #office-utah          | Casual     | Shows personality (Jersey Mike's > everything, apparently)                                                                 |

**Communication Style:**

- **Shows, doesn't just tell.** Jason shares Loom recordings, preview links, and raw output data. When he ran a reconciliation script that processed 9,569 users, he posted the full summary because "in case anyone was curious."
- **Proactively transparent about problems he causes.** When a deployment issue broke calendar OAuth, he identified it, took ownership ("glitch in deployment timing"), and documented the fix. No finger-pointing, no burying.
- **Asks permission before acting.** "Is there a good reason for this?" before changing attendee logic. "Could I just get a quick approval of this script?" before running in production. He respects existing decisions and asks before altering them.
- **Gives credit generously.** "shoutout Adam for the designs" ... "thanks to everyone for the help on this one, especially Yu-Chun and Kaden." He names people, consistently.

---

### Personality Traits

**1. Builder's Mindset**
Jason does not ship and forget. When the workflow UI released with "a couple small bumps," he stayed engaged — working closely with Tyler, Ty, and Erika to smooth them out, running SQL adjustments, and posting in #product-updates to keep everyone in the loop. He treats the launch as the beginning, not the end.

**2. Intellectual Honesty**
He does not pretend to know things he does not. When asked about a product issue: "sorry, still a little confused here. Could you give me some more details?" When discussing a fix's feasibility: "I wouldn't say there is an easy fix. It is fixable, and I did look into it a little, but it's not as trivial as it seems at first." He would rather be accurate than fast.

**3. Data-Driven Thinking**
When he finds a problem, he quantifies it first:

- "We have 451 engagements with past start_at but no end_at"
- "This ultimately means that 154,216 contacts lack company_id"
- "Average of 1.38 seconds per contact. With 124,402 contacts, estimated time is 47.8 hours."

He frames problems in terms of scope and impact before proposing solutions.

**4. Receptive to Feedback**
"100%. thanks so much for the feedback!" ... "love the thoughts" ... "open to suggestion" ... "give it to me straight. I'm not attached to any of it." He actively solicits critique on his own work and responds without defensiveness.

**5. Team-Oriented Problem Solver**
Jason treats bugs as collaboration opportunities. He tags specific people for help, asks for reviews before production runs, and loops stakeholders into decisions. When a script was running too slowly (47.8-hour estimate), his response was "would love the code" when a teammate offered help — no ego.

**6. Casual but Professional**
He is comfortable in #office-utah debating sandwich chains and in #team-dev sharing detailed technical analyses. He can switch registers fluidly — casual banter with colleagues, structured problem statements in #team-dev, clear explanations in #product-issues for non-technical stakeholders.

---

### How Jason Shows Up in Meetings

From team meetings and Council of Product transcripts:

- **Ownership with transparency.** When asked about the privacy determination agent status: "I don't know where it's at in terms of marketing and stuff" — honest about the boundary of his knowledge rather than speculating.
- **Action-oriented.** Tasked with creating a Loom walkthrough for privacy agent sign-off. Doesn't push back on requests that have clear purpose.
- **Product-aware engineer.** He doesn't just build features — he thinks about release stages, feature flags, and whether users will actually encounter what he's shipping.

---

### Personality Summary

> Jason Harmon is a transparent, data-minded builder who treats his teammates' time with respect. He shows his work, admits what he doesn't know, quantifies problems before solving them, and celebrates other people's contributions more than his own. He is the kind of engineer who makes a team more functional just by being on it — not because he's the loudest voice, but because when he speaks, the information is reliable.

---

## Part 2: AskElephant Impact Analysis

_Based on 85 completed Linear issues, 25+ merged PRs tracked in activity reports, and work documented across Slack and meeting transcripts._

---

### By the Numbers

| Metric                              | Value |
| ----------------------------------- | ----- |
| **Linear Issues Completed**         | 85    |
| **Linear Projects Touched**         | 6     |
| **PRs Tracked in Activity Reports** | 25+   |
| **Slack Messages**                  | 2,299 |
| **Primary Channels Active**         | 23+   |

---

### Impact Area 1: Privacy Determination Agent — _His Flagship_

**26 completed issues** across Privacy Determination Agent P1 and P2

Jason became the primary engineer on the Privacy Determination Agent — one of AskElephant's most strategically important features for enterprise trust and compliance. His work spanned:

- **Architecture:** Pulled the privacy agent out of the configurable agent paradigm into its own dedicated system
- **Simulation & Testing:** Built a privacy simulation modal for internal testing
- **Configuration:** Implemented privacy rules, logging, and configuration interfaces
- **UI Integration:** Created onboarding popovers, settings integration, and beta features page
- **Cross-functional:** Worked with product (Tyler) and leadership (Ben) on sign-off processes

This was not inherited work — Jason took ownership of a complex, high-stakes feature and drove it from internal tooling to customer-facing beta.

---

### Impact Area 2: Workflow Builder UI — _Visible Customer Impact_

Jason designed and shipped a complete UI overhaul of AskElephant's workflow builder:

- Created a Loom walkthrough before shipping for team feedback
- Deployed to staging for internal mob testing, then to production
- Proactively identified post-launch issues (node spacing, positioning)
- Wrote SQL to adjust node positions for existing workflows
- Managed the URL-as-source-of-truth refactor for search state

**Key PRs:**

- #5170: Workflow URL as search source of truth
- Auto recap email workflow button fix (#5180)
- Node position adjustments (SQL scripts, PRs #3332, #3387)

His post-launch message: "Hope building a workflow is just a little bit better now" — understated, characteristic.

---

### Impact Area 3: Authentication & User Roles — _Critical Infrastructure_

Identified and fixed a systemic bug where user role updates in the app were not syncing to the authentication backend:

- **Discovered** the root cause: role changes weren't propagated to Firebase Auth
- **Wrote and ran** a reconciliation script that processed 9,569 users (224 updated, 6,380 stale auth records cleaned up, 62-minute runtime)
- **Prevented recurrence** by updating logic to auto-sync roles on change
- **Posted results** to #team-dev for visibility

This was a security-critical fix that Jason identified, proposed, implemented, and deployed with minimal direction.

---

### Impact Area 4: Data Quality & CRM Integrity — _Backend Stewardship_

Jason repeatedly found and fixed data quality problems that no one else had surfaced:

- **451 engagements** with null `end_at` — wrote code to add a fallback, opened PR #3268
- **154,216 contacts** missing `company_id` — identified an early return bug in `enrichContactDetailsFromCrm`, fixed it (PR #3291), then wrote a backfill script (PR #3300)
- **Contact export scripts** for large-scale data migration (PR #3361)
- Proposed retry with exponential backoff for timeout errors during contact updates

He treats data correctness as a first-class concern, not an afterthought.

---

### Impact Area 5: Billing & Payments — _Stripe Integration_

- Stripe billing tweaks (#5107)
- Scheduled email migration (#5035)
- Removed obsolete scheduled email sender columns (#5024)
- Fixed seat counter display on team page (ASK-4451)

---

### Impact Area 6: Onboarding & User Activation — _Growth-Critical Work_

9 completed Linear issues in onboarding:

- **State refactor** (ASK-4859) — Rebuilt onboarding state management
- **Metadata improvements** (ASK-4858) — Better tracking of onboarding progress
- **Persona step** (ASK-4650) — Added user persona selection to onboarding
- **PostHog tracking** (ASK-4633) — Instrumented onboarding analytics ("first time logged in" event)
- **Restart fix** (#5198) — Prevented users from being re-triggered for completed onboarding

**PRs:**

- #5401: Onboarding state refactor
- #5198: Onboarding restart fix
- #5067: Add first login PostHog tracking

---

### Impact Area 7: UI/UX Polish — _Death by a Thousand Improvements_

Jason consistently ships small, user-visible improvements that compound:

- Alert banner positioning fixes (#5161, #5177)
- Word breaking in engagement details (#5169)
- Invite team member cosmetic improvements (#5168)
- Auto-logout toggle fix (#5106)
- Resend rawBody issues (#5085)
- Beta features settings page (#5400)

**W05 alone:** 8 PRs merged, all UI improvements and bug fixes.

---

### Impact Area 8: Feature Flags & DevOps — _Platform Thinking_

Most recently, Jason took on improving how AskElephant evaluates feature flags:

- Implemented server-side feature flag caching (ASK-4947)
- Investigated Valkey for low-latency flag evaluation
- Posted a careful deployment notice to #product-forum: "I will be keeping an eye on things to make sure things run smoothly"
- Separated lint hooks for better DX (#5383)

This shows evolution from feature work to platform-level concerns — a sign of growing engineering maturity.

---

### Evolution Timeline

| Period         | Focus                                                         | Growth Signal                                |
| -------------- | ------------------------------------------------------------- | -------------------------------------------- |
| **Months 1-2** | Thumbnail bugs, graphql codegen issues, learning the codebase | Asking questions, figuring out local dev     |
| **Months 2-3** | Auth/role reconciliation, engagement data fixes               | Finding systemic bugs nobody else noticed    |
| **Months 3-4** | Workflow UI overhaul, CRM data quality (154K contacts)        | Shipping user-facing features end-to-end     |
| **Months 4-5** | Privacy Determination Agent (full ownership)                  | Leading a strategically important initiative |
| **Months 5-6** | Onboarding, billing, PostHog instrumentation                  | Broader surface area, growth-critical work   |
| **Month 7**    | Feature flag infrastructure, beta features page, agent skills | Platform thinking, DX improvements           |

---

### Who He Collaborates With

| Person                   | Relationship                                       |
| ------------------------ | -------------------------------------------------- |
| **Bryan Lund** (manager) | Technical guidance, code review                    |
| **Kaden**                | Frequent code review partner, caching discussions  |
| **Yu-Chun**              | Auth/permissions collaboration                     |
| **Tyler (PM)**           | Product feedback loops, workflow UI, privacy agent |
| **Ty (CEO)**             | Direct feedback on workflow UI, product direction  |
| **Erika**                | Product issues triage, workflow testing            |
| **Adam**                 | Design collaboration, UI polish                    |
| **Palmer**               | Agent framework, chat memory discussions           |
| **Woody**                | Devin-driven features, event log collapsibles      |
| **Eli**                  | Product issue investigation and responses          |

---

### Summary: Jason's AskElephant Story

Jason Harmon joined AskElephant 7 months ago and has evolved from an engineer learning the codebase to someone who owns critical features, identifies systemic data problems, ships user-facing improvements at a steady pace, and thinks at the platform level.

His contributions span the full stack — from SQL scripts that fix 154,000 records to polished UI components that make workflows "just a little bit better." He has touched authentication, billing, CRM integration, privacy compliance, onboarding, workflows, feature flags, and the design system.

But what makes Jason's impact distinctive is not just the breadth. It is the _pattern_ of how he works:

1. **He finds problems nobody assigned.** The 451 null `end_at` engagements. The 154K contacts without `company_id`. The auth role sync gap. He finds these by paying attention.
2. **He quantifies before he builds.** Every problem comes with numbers. Every solution comes with scope.
3. **He ships and stays.** When the workflow UI launched with bumps, he was there in #product-updates working through them in real time.
4. **He makes the team better.** By sharing results, giving credit, and asking for help without ego.

Jason has become someone the team relies on — not for one thing, but for the willingness to go wherever the product needs him, do the unglamorous work, and leave things better than he found them.
