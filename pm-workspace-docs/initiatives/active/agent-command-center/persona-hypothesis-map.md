# Agent Command Center v3 — Hypothesis & Signal Map

**Purpose:** Map all related hypotheses, signals, and use cases to the three persona modes the Agent Command Center must serve. Identify gaps, best practices to bake in, and opportunities the v3 prototype validates or doesn't yet address.

---

## The Three Persona Modes

| Mode | Who | Relationship to ACC | Primary Need |
|------|-----|---------------------|--------------|
| **Configurators** | RevOps admins, sales leaders, partners | Set up agents, define rules, monitor accuracy | "I configure it once and it runs forever" |
| **Elsewhere Workers** | Sales reps in HubSpot, CSMs in Slack, leaders in dashboards | Consume agent output where they already work | "Don't make me switch tabs" |
| **Daily Drivers** | Power users who live in AskElephant — reps, leaders, solo reps | ACC is home base — morning hub, approvals, deal context | "This is where I start my day" |

---

## Mode 1: Configurators

### Who are they?
RevOps admins, sales leaders who own automation, CSM ops, partners (agencies). They care about getting agents right, trusting the output, and not muddying the CRM.

### Related Hypotheses (7)

| Hypothesis | Status | Key Insight for ACC v3 |
|------------|--------|----------------------|
| **Agent Skills Reduce Config** (`hyp-agent-skills-reduce-config`) | Active | Chat-based config alone may not be enough. Pre-built "skills" (RevOps Expert, Meeting Summary Template) act as expert knowledge the agent draws on. ACC's question dialog could offer skill selection: "Which expertise should this agent use?" |
| **Workflow Templates Reduce Setup** (`hyp-workflow-templates-reduce-setup`) | Active | 16+ documented workflow patterns from real customers (Sentiment Score, MEDDIC Scorecard, Solution Mapping). The ACC suggestion cards should evolve from generic prompts to *template-based starts*: "Set up a Discovery Call agent (used by 47 customers)" |
| **HubSpot Agent Config UI** (`hyp-hubspot-agent-config-ui`) | Committed | 100+ hours to configure via workflow builder. ACC's chat-based config directly addresses this — validated at 83% would-use. But the committed hypothesis means eng is already working on this. ACC needs to *replace* the old UI, not coexist with it. |
| **Proactive Approval Hub** (`hyp-proactive-approval-hub`) | Active | Approval fatigue is real. ACC v3's morning hub with approve/reject on approval cards directly implements this hypothesis. **This hypothesis is validated by v3.** |
| **Workflow Versioning Onboarding Gap** (`hyp-workflow-versioning-onboarding-gap`) | Active | Users can't version or roll back agent configs. ACC should consider: "Show me the history of this agent's configuration changes" as an artifact type. |
| **CRM Readiness Diagnostic** (`hyp-crm-readiness-diagnostic`) | Validated | Before configuring a CRM agent, users need to know if their CRM is "ready" (fields exist, data quality baseline). ACC could surface this as a pre-configuration step: "Let me check your HubSpot setup first..." |
| **Chief of Staff Recap Hub** (`hyp-chief-of-staff-recap-hub`) | Active | Recap templates (Meeting Summary, Meeting Prep, Daily Briefing, Weekly Reporting) should be configurable through ACC. The question dialog pattern works perfectly: "What type of recap template do you want?" |

### What v3 already validates for Configurators

- Chat-based configuration (question dialog scored 4.5/5 activation)
- Agent preview artifact (before/after diff) shows exactly what will happen
- Approval gating (high-risk needs approval, low-risk auto-runs)
- James (RevOps, Early Adopter) scored 4.8/5 — highest of all jurors

### Gaps for Configurators

1. **No template library** — Suggestion cards are generic. Should offer real workflow templates from customer patterns (16+ documented)
2. **No skills layer** — Agent config doesn't show what "expert knowledge" the agent uses. Skills would reduce instruction quality burden
3. **No version history** — Can't see or roll back agent config changes
4. **No CRM readiness check** — Agent config assumes CRM is ready; should validate first
5. **No bulk agent management** — Configure one agent at a time; admins managing 10+ agents need a list view

### Best Practices to Add

- **Progressive disclosure in config**: Start simple ("What should happen after discovery calls?") then let users drill into advanced settings only if they want
- **Live preview on real data**: "Let me show you what this agent would have done on your last 3 calls" (already in PRD but not yet in prototype)
- **Config validation**: Before activating, run agent on test data and show results
- **Template marketplace signals**: "47 other customers use this template" — social proof

---

## Mode 2: Elsewhere Workers

### Who are they?
Reps who live in HubSpot/Salesforce. CSMs who live in Slack. Leaders who live in dashboards. They *benefit* from agents but don't open AskElephant daily. They need agent output delivered where they already work.

### Related Hypotheses (4)

| Hypothesis | Status | Key Insight for ACC v3 |
|------------|--------|----------------------|
| **HubSpot Sidebar Integration** (`hyp-hubspot-sidebar-integration`) | Active | "I would love a global chat to be a card on the record sidebar in HubSpot directly. I would use the fuck out of that." ACC outputs (recaps, CRM diffs, action items) need to be consumable *inside HubSpot* — not just shareable to Slack. A HubSpot CRM card that shows the latest agent activity per deal is the MVP. |
| **Native CRM Integration Competitive** (`hyp-native-crm-integration-competitive`) | Active | Gong wins on native Salesforce integration. ACC's share menu (Issue #6) is step 1, but the real win is *embedding* ACC artifact summaries directly in CRM records. This is the "Elsewhere Worker" killer feature. |
| **Automation Beats Gong Positioning** (`hyp-automation-beats-gong-positioning`) | Active | AskElephant wins when automation is the value prop, not coaching. For Elsewhere Workers, the value is "your CRM updated itself correctly after every call." They don't need to see ACC — they need to see results in HubSpot. |
| **One-Seat Adoption Churn** (`hyp-one-seat-adoption-churn`) | Active | 42% of churns are adoption failures on 1-seat accounts. These are the *most likely* Elsewhere Workers — solo reps who won't learn a new app. Agent output must reach them via email digest, Slack summary, or CRM card *without* requiring ACC login. |

### What v3 already validates for Elsewhere Workers

- Share menu (Slack, HubSpot, Email, Copy) is in place
- Artifact panel is sharable
- Tomiko (Leader, Power User) scored 4.7/5 specifically because of share-to-Slack

### Gaps for Elsewhere Workers

1. **No HubSpot CRM card** — The #1 requested integration. A sidebar card showing latest agent actions per deal would serve Elsewhere Workers without requiring tab switch
2. **No email digest** — Solo reps / 1-seat customers need a daily email: "Your agents did 5 things today. 1 needs your approval. [Approve in email]"
3. **No Slack bot integration** — Agent activity should post to Slack channels or DMs. "Your Acme Corp deal was updated: Deal Stage → Proposal"
4. **No in-CRM approval** — Approval currently requires ACC login. "Approve" button in email or Slack message would reduce friction massively
5. **No mobile experience** — Reps on the go need at minimum a mobile-responsive morning hub or a push notification → approve flow

### Best Practices to Add

- **Meet users where they are**: Don't require ACC login for routine approvals. Email + Slack + CRM card should handle 80% of daily interactions
- **Breadcrumb back to ACC**: Every out-of-app touchpoint should have a "See full details in AskElephant" link that deeplinks to the right artifact
- **Digest cadence options**: Daily, real-time, weekly. Let users choose how agent output reaches them
- **Action in notification**: Every notification should be actionable (Approve/Reject/View) — not just informational

---

## Mode 3: Daily Drivers

### Who are they?
Reps who open AskElephant every morning. Leaders who review team activity. Solo reps who use it for self-coaching. These users make ACC their *home base*.

### Related Hypotheses (5)

| Hypothesis | Status | Key Insight for ACC v3 |
|------------|--------|----------------------|
| **Rep Workspace Viral Anchor** (`hyp-rep-workspace-viral-anchor`) | Active | "It gives us an anchor point of this is where you live." ACC v3's morning hub IS this anchor point. The jury validated it at 4.2/5 ongoing value (up from 2.8). **This hypothesis is validated by v3.** |
| **Chief of Staff Daily Hub** (`hyp-chief-of-staff-daily-hub`) | Active | "Tell me what you've done, what needs approval, and what's scheduled." ACC v3's morning hub directly implements this with the summary strip (done/approvals/scheduled/time saved). **This hypothesis is validated by v3.** |
| **Proactive Deal Intelligence** (`hyp-proactive-deal-intelligence`) | Active | Beyond explicit action items, AI should suggest strategic moves: "Deals like this that won did X." This is the *next layer* for Daily Drivers — ACC morning hub + proactive suggestions = "not just what happened, but what you should do." |
| **Solo Rep Self-Coaching** (`hyp-solo-rep-self-coaching`) | Active | "Pull out the common questions that have been asked across all my transcripts." ACC could surface coaching artifacts: "Across your last 10 discovery calls, you asked about budget 80% of the time but only 30% about decision timeline." This is a new artifact type for the split panel. |
| **Artifact-First Recap Alignment** (`hyp-artifact-first-recap-alignment`) | Active | Sam wants concrete artifact screenshots for board/pitch. ACC v3's artifact panel IS the delivery mechanism for recaps, prep, coaching. The prototype itself can be used as the screenshot for alignment. **This hypothesis is partially validated.** |

### What v3 already validates for Daily Drivers

- Morning hub with done/approvals/scheduled (4.2/5 ongoing value)
- Artifact panel for recaps, agent previews, activity summaries, CRM diffs
- Correction flow ("that's wrong" → corrected diff)
- Chat as the single orchestration surface
- Eileen (Rep, Curious) scored 4.6: "The morning hub is exactly what I wanted"

### Gaps for Daily Drivers

1. **No deal-centric view** — Pipeline mirrored from HubSpot with AI context per deal. This is Epic 5 in the PRD (P1). Jared from Maple explicitly asked for this.
2. **No self-coaching artifacts** — Cross-call pattern analysis ("What questions do I get asked most?"), performance trends, call comparison. New artifact type for solo reps.
3. **No proactive suggestions** — Morning hub shows what happened, but not "what you should do." Deal intelligence suggestions would elevate the morning hub from reactive to proactive.
4. **No team view** — Sarah (Leader, Curious) scored 3.6 and specifically said "I manage 8 reps. I need to see THEIR agent activity." A "My Team" toggle on the morning hub is the leader-mode gap.
5. **No weekly review artifact** — Sam mentioned "Weekly Reporting" as a Chief of Staff artifact. ACC should generate a weekly rollup artifact automatically.

### Best Practices to Add

- **Personalized morning briefing**: Don't just show what agents did — highlight what's most important based on user's role and deal context
- **Deal context in chat**: When a user asks "What happened with Acme?", pull ALL deal context — not just the last call. Cross-reference meetings, CRM changes, emails, Slack mentions.
- **Coaching as a feature, not surveillance**: Frame self-coaching as "your personal performance coach" — private, opt-in, no manager visibility. Address the Rep fear of "AI tracking my performance."
- **Compounding value**: Show users how the system gets smarter over time. "Your agent's accuracy improved 12% this month based on your corrections" — ties to ALHF principle.

---

## Hypothesis Validation Status via v3

| Hypothesis | Status Before | v3 Validates? | Notes |
|------------|--------------|---------------|-------|
| `hyp-rep-workspace-viral-anchor` | Active | **Yes** | Morning hub = anchor point. 83% would-use. |
| `hyp-chief-of-staff-daily-hub` | Active | **Yes** | Done/approvals/scheduled directly implemented. |
| `hyp-proactive-approval-hub` | Active | **Yes** | Approval cards with approve/reject in morning hub. |
| `hyp-artifact-first-recap-alignment` | Active | **Partial** | Artifact panel exists; needs Sam to see screenshots. |
| `hyp-proactive-deal-intelligence` | Active | **No** | Not yet — need proactive suggestions in morning hub. |
| `hyp-solo-rep-self-coaching` | Active | **No** | Not yet — need coaching artifact type. |
| `hyp-agent-skills-reduce-config` | Active | **No** | Not yet — need skills layer in question dialog. |
| `hyp-workflow-templates-reduce-setup` | Active | **No** | Not yet — suggestion cards should use real templates. |
| `hyp-hubspot-sidebar-integration` | Active | **No** | Not yet — need CRM card for Elsewhere Workers. |
| `hyp-native-crm-integration-competitive` | Active | **No** | Not yet — competitive positioning, not prototype. |
| `hyp-one-seat-adoption-churn` | Active | **No** | Not yet — need email/Slack digest for non-login users. |
| `hyp-automation-beats-gong-positioning` | Active | **Partial** | ACC demonstrates automation value; needs demo story. |

---

## Priority Recommendations for Build Phase

### P0 — Must Have for Launch

These are already validated by v3 and should be built as-is:
1. Morning hub (done/approvals/scheduled/time saved)
2. Chat-based agent configuration with question dialog
3. Artifact panel (recap, agent preview, CRM diff, activity summary)
4. Toast confirmations with undo
5. Correction flow
6. Share menu

### P1 — Should Have for Stickiness

These address the biggest gaps for Daily Drivers and Elsewhere Workers:
7. **Team view toggle** on morning hub (Leader persona gap)
8. **Deal-centric view** — pipeline mirrored from CRM (Epic 5)
9. **HubSpot CRM card** — agent activity per deal in HubSpot sidebar
10. **Email/Slack digest** — for 1-seat / Elsewhere Workers
11. **Proactive suggestions** in morning hub ("Based on your Acme call, you should...")

### P2 — Growth & Differentiation

These create long-term moats and compound value:
12. **Self-coaching artifacts** — cross-call patterns, performance trends
13. **Template library** — real workflow templates from customer patterns
14. **Skills layer** — expert knowledge modules for agent config
15. **Weekly rollup artifact** — automated weekly report
16. **In-notification approvals** — approve from email/Slack without ACC login
17. **Agent version history** — roll back config changes

---

## Signal Sources That Should Continue Feeding ACC

| Signal Source | What to Watch For | How It Feeds ACC |
|---------------|-------------------|------------------|
| `#churn-alert` | Adoption failure reasons | Validates onboarding improvements needed |
| `#customer-feedback` | "I wish I could..." statements | Feature requests for artifact types |
| `#competitors` | Gong/Chorus feature releases | Competitive pressure on CRM integration |
| James Hinkson | RevOps config pain points | Configurator persona improvements |
| Maple (Jared) | Solo rep self-coaching needs | Daily Driver coaching artifacts |
| Council of Product | Priority shifts | Strategic direction for ACC scope |
| Workflow request channel | New template patterns | Template library candidates |

---

*Created: 2026-02-07*
*Owner: Tyler*
*Related: v3-validation-report-20260207.md, prd.md, research.md*
