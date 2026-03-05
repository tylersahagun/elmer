# GTM Brief: Release Lifecycle Process

## Overview

This initiative has **two GTM components:**

1. **Internal enablement** (primary) - Training Revenue teams on the new process
2. **Customer-facing beta program** (secondary) - Introducing self-serve beta features

**Related PRD:** [prd.md](./prd.md)  
**Status:** Not Started  
**Launch Tier:** P2 (Internal = P3, Customer Beta UI = P2)

---

## Value Proposition

### Internal

> "Always know what features are available, to whom, and when they're changing."

### Customer-Facing

> "Be the first to try new AskElephant features with our Beta Program."

---

## Target Segments

### Internal Audiences

| Audience        | Key Message                      | Priority |
| --------------- | -------------------------------- | -------- |
| **Sales**       | Know exactly what to demo        | P0       |
| **CS**          | Support customers accurately     | P0       |
| **Engineering** | Clear path from code to customer | P1       |
| **Product**     | Manage lifecycle efficiently     | P1       |
| **Marketing**   | Plan launches with visibility    | P2       |

### External Audiences

| Audience        | Key Message                            | Priority |
| --------------- | -------------------------------------- | -------- |
| **Power Users** | Early access to new features           | P1       |
| **Admins**      | Control what your team can try         | P2       |
| **All Users**   | Clear expectations on feature maturity | P2       |

---

## Key Messages

### For Revenue Team

1. **"Same view, same features"**  
   What you see in demos is what customers see (except clearly marked betas)

2. **"Weekly updates, no surprises"**  
   Every Monday, you'll know what's changed and what's coming

3. **"One source of truth"**  
   Notion doc + Slack channel + weekly meeting = you'll always know

4. **"Beta badge = set expectations"**  
   If you see a beta badge, so will the customer

### For Customers

1. **"Try it first"**  
   Get access to new features before general release

2. **"Your feedback shapes the product"**  
   Beta features evolve based on what you tell us

3. **"Clear expectations"**  
   Beta badge means "this may change" — no surprises

4. **"Easy control"**  
   Turn features on or off anytime in Settings

---

## Competitive Positioning

### Beta Program Comparison

| Company         | Beta Program           | Self-Serve | User Control |
| --------------- | ---------------------- | ---------- | ------------ |
| Gong            | Invite only            | ❌         | ❌           |
| Chorus          | None public            | ❌         | ❌           |
| Clari           | Enterprise only        | ❌         | ❌           |
| **AskElephant** | Open beta + self-serve | ✅         | ✅           |

### Differentiation

- **Transparency:** We show you exactly what stage a feature is in
- **Control:** You decide what betas to try, not us
- **Speed:** We ship faster because you can try things earlier

---

## Internal Enablement Plan

### Week 1: Process Rollout

| Activity                       | Owner | Audience    | Format         |
| ------------------------------ | ----- | ----------- | -------------- |
| Stage definitions announcement | Tyler | All company | Slack + doc    |
| Revenue team deep-dive         | Tyler | Sales + CS  | 30-min meeting |
| Process documentation          | Tyler | All         | Notion page    |

### Week 2+: Ongoing Enablement

| Activity                   | Owner   | Cadence    | Format           |
| -------------------------- | ------- | ---------- | ---------------- |
| Weekly release notes       | Tyler   | Monday     | Meeting + Notion |
| Stage change announcements | Tyler   | Per change | Slack            |
| Quarterly process review   | Product | Quarterly  | All-hands        |

### Training Materials Needed

| Material                                  | Priority | Status    |
| ----------------------------------------- | -------- | --------- |
| Stage definitions doc                     | P0       | To create |
| "How to check feature availability" guide | P0       | To create |
| "How to enable beta for customer" SOP     | P1       | To create |
| FAQ for Revenue team                      | P1       | To create |

---

## Customer-Facing Launch Plan

### Launch Tier: P2

**Justification:**

- Self-serve beta is a notable feature
- Differentiates from competitors
- Worth a product email mention + KB article
- Not worth full campaign (internal process)

### Launch Activities

| Activity            | Do It?   | Owner     | Notes                           |
| ------------------- | -------- | --------- | ------------------------------- |
| Press release       | ❌       | —         | Not newsworthy enough           |
| Blog post           | 🟡 Maybe | Marketing | Brief mention in product update |
| Product email       | ✅       | Kenzie    | Feature in monthly update       |
| Social post         | 🟡 Maybe | Marketing | LinkedIn mention                |
| In-app notification | ✅       | Product   | Point to Settings               |
| KB article          | ✅       | Tyler     | "How to use Beta Features"      |
| CS talking points   | ✅       | Tyler     | How to introduce to customers   |

### Launch Timeline

| Milestone             | Date   | Activity                               |
| --------------------- | ------ | -------------------------------------- |
| Beta UI ships         | Mar 1  | In-app notification + KB article       |
| Monthly product email | Mar 15 | Feature beta program                   |
| CS outreach           | Mar 1+ | Proactive mention to engaged customers |

---

## Messaging for Beta UI Launch

### In-App Notification

```
🧪 New: Try Beta Features

Be the first to try new AskElephant features.
Go to Settings → Beta Features to get started.

[Go to Settings] [Dismiss]
```

### Email Snippet (for product update)

```
## Try New Features First

We've launched our Beta Program! Now you can try
new AskElephant features before they're released
to everyone.

Go to Settings → Beta Features to see what's
available. Look for the Beta badge throughout
the app to know when you're using a beta feature.

[Try Beta Features →]
```

### Knowledge Base Article Outline

1. **What is the Beta Program?**

   - Early access to new features
   - Features may change based on feedback

2. **How do I enable beta features?**

   - Go to Settings → Beta Features
   - Toggle on features you want to try

3. **What do the badges mean?**

   - Alpha: Very early, invite-only (you may see this if invited)
   - Beta: Available to try, may change

4. **How do I give feedback?**

   - Use existing feedback channels
   - Contact support

5. **Can I turn off a beta feature?**
   - Yes, anytime in Settings

---

## CS Talking Points

### When to Mention Beta Program

- Customer asks about upcoming features
- Customer is a power user who'd appreciate early access
- Customer is frustrated about feature gap (beta might address it)

### How to Introduce

> "Did you know we have a Beta Program? You can try new features before they're released to everyone. Just go to Settings → Beta Features. If you see something with a Beta badge, that means it's still being refined, but we'd love your feedback!"

### When NOT to Mention

- Customer is struggling with core features
- Customer has complained about instability
- Feature they need is in Alpha (internal only)

---

## Metrics to Track

### Internal Adoption

| Metric                          | Target   | How                 |
| ------------------------------- | -------- | ------------------- |
| Revenue team awareness          | >90%     | Survey              |
| Weekly release notes attendance | >80%     | Meeting attendance  |
| Feature availability questions  | Decrease | Support ticket tags |

### Customer Adoption (Post Beta UI)

| Metric                   | Target        | How           |
| ------------------------ | ------------- | ------------- |
| Beta settings page views | >20% of users | PostHog       |
| Beta feature opt-in rate | >5%           | PostHog       |
| Beta feature feedback    | Track volume  | Intercom tags |

---

## Open Questions

1. **Beta program name:** Just "Beta Features" or give it a name? ("AskElephant Labs"?)
2. **Customer communication:** Announce beta program broadly or let it spread organically?
3. **Incentives:** Any recognition for beta participants? (Early adopter badge?)
4. **Feedback mechanism:** Build in-app feedback or use existing channels?

---

## Summary

| Component           | Tier | Key Activities                                 |
| ------------------- | ---- | ---------------------------------------------- |
| Internal enablement | P3   | Training, docs, weekly notes                   |
| Beta UI launch      | P2   | Product email, KB article, in-app notification |

Focus is on **internal process adoption first**, then **soft launch of customer-facing beta program** without major marketing investment.

---

_GTM Owner: Tyler (internal) / Kenzie (customer)_  
_Last Updated: January 13, 2026_
