# FGA Engine — GTM Brief

## Positioning

### One-Liner

**AI-powered access controls that let admins describe security policies in plain English — no configuration screens, no authorization vocabulary required.**

### Elevator Pitch

AskElephant now lets workspace admins set up access controls by simply telling the AI what they want: "Only meeting attendees should see recordings, but managers should see their whole team's calls." The AI creates the rules, shows who's affected, and applies them with one click. Enterprise-grade security, zero configuration complexity.

### Competitive Differentiation

- **Gong/Chorus:** Role-based access with manual configuration screens. No AI assistance. No impact preview.
- **AskElephant:** AI translates plain-English intent into access rules. Impact preview shows exactly who gains/loses access. Meeting-attendance as the unique trust boundary.

---

## Customer Story

### Before FGA

> "Every time we onboarded a new rep, I had to manually share 6 months of team calls. When someone left, I had to remember to revoke access to everything. And for our Xerox pilot, their security team wanted proof of who could see what — I had nothing to show them."
> — _Composite enterprise admin persona_

### After FGA

> "I told the AI: 'My team should share all calls, but executive conversations stay with attendees only.' It created two policies and showed me exactly who was affected. I confirmed, and it was done. When our new hire started Monday, they could see everything immediately. When Xerox's security team asked for an audit, I exported the log in 30 seconds."

### Transformation Moment

The admin realizes they just configured enterprise-grade access controls in a 2-minute conversation — something that would have required a support ticket and engineering changes before.

---

## Target Audience

| Segment                                  | Message                                                                                  | Channel                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Enterprise prospects** (deal blockers) | "AskElephant now meets enterprise security requirements with AI-powered access controls" | Sales demo, security review deck         |
| **Existing enterprise customers**        | "You asked for configurable access — it's here. Set it up in 5 minutes with AI."         | In-app banner, email, CSM outreach       |
| **Mid-market admins**                    | "Team sharing just got easier. Your team's calls are automatically shared."              | In-app discovery, product changelog      |
| **Revenue leaders**                      | "New hires see team history on day one. No manual sharing required."                     | Product update email, Slack announcement |

---

## PMM Tier

**P4 (Internal Only for Beta → P2 at GA)**

- Beta: Internal announcement only, direct outreach to beta workspaces
- GA: Changelog, help center, sales enablement deck, in-app announcement

---

## Launch Plan

### Beta Launch (Q1 2026)

| Material                    | Owner      | Status      |
| --------------------------- | ---------- | ----------- |
| Internal demo video         | Tyler      | Not started |
| Beta feedback Slack channel | Tyler      | Not started |
| Feature flag rollout plan   | Matt Noxon | Not started |
| Help center draft           | Tyler      | Not started |

### GA Launch (Q2 2026)

| Material                                                  | Owner          | Status      |
| --------------------------------------------------------- | -------------- | ----------- |
| Revenue team training deck                                | Tyler + Kenzi  | Not started |
| Help center article: "Setting up access controls with AI" | Tyler          | Not started |
| Changelog entry                                           | Tyler          | Not started |
| In-app walkthrough (guided setup)                         | Tyler + Design | Not started |
| Security review one-pager (for enterprise prospects)      | Tyler          | Not started |
| #product-updates Slack post                               | Tyler          | Not started |
| Customer email: Beta invite → GA announcement             | Tyler + CS     | Not started |

---

## Enablement for Revenue Team

### Key Talking Points

1. **"Our access controls are AI-powered"** — Admins describe what they want in English, AI creates the rules
2. **"You can see exactly who's affected before any change"** — Impact preview builds trust
3. **"Meeting attendance is the default trust boundary"** — Unique to AskElephant, aligns with how teams actually work
4. **"Full audit trail for compliance"** — Exportable log of every access change
5. **"Zero-config default is open"** — No breaking changes, admins opt-in to restrictions

### Common Objections

| Objection                                         | Response                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| "We need SOC 2 compliant access controls"         | "Our FGA engine provides audit logging, role-based access, and configurable policies — all exportable for compliance review."                     |
| "Can admins lock themselves out?"                 | "No — we have safety nets that prevent workspace owners from removing their own access."                                                          |
| "What if the AI gets the policy wrong?"           | "Every AI-generated policy shows a plain-language summary and requires manual confirmation. You can also preview impact and rollback any change." |
| "How do regular users know what they can access?" | "Users see clear explanations when access is restricted, and can request access with one click."                                                  |

---

## Success Criteria for Launch

| Metric                        | Target        | Measurement     |
| ----------------------------- | ------------- | --------------- |
| Beta workspaces enrolled      | 5-10          | Manual tracking |
| Beta NPS                      | >40           | In-app survey   |
| Setup completion rate         | >80%          | PostHog funnel  |
| AI-assisted policy creation   | >90%          | PostHog events  |
| Enterprise deals unblocked    | 1+            | CRM tracking    |
| Access-denied support tickets | <5% of events | Intercom        |

---

_Last updated: 2026-02-08_
