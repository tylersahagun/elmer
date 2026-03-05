# Feature Parity Communication Plan

**Date:** January 13, 2026  
**Context:** Feature flag audit revealed significant feature parity gaps across customer base

---

## Executive Summary

Our feature flag audit identified that customers experience up to **17% variance** in available features. Some customers (like Redo) have access to 49 features while baseline customers only see 42. This creates support burden, sales friction, and customer confusion.

---

## Internal Communication (CS/Sales Enablement)

### 🎯 For Customer Success Team

**Subject: Feature Availability Reference Guide - Updated January 2026**

---

**Key Points to Know:**

1. **Baseline Experience (Most Customers)**
   - 42 core features are available to ALL customers
   - This includes: Meeting recording, transcription, CRM sync, workflows, chat, etc.

2. **Beta Features (Some Customers)**
   - The following features are in limited availability:
   
   | Feature | Who Has It | How to Get It |
   |---------|------------|---------------|
   | Internal Search | 16 named workspaces | Request via CS |
   | Dashboard Beta | 15 workspaces + beta opt-in | Beta enrollment |
   | Extractions Table | ~25 workspaces | Request via CS |
   | Knowledge Bases | 6 workspaces | Request via CS |
   | Gmail Integration | Redo + 3 users | Nylas dependency |
   | Gong Import | 8 workspaces | Request via CS |

3. **Integration Availability**

   | Integration | Status | Notes |
   |-------------|--------|-------|
   | HubSpot | ✅ GA | All customers |
   | Salesforce | ✅ GA (basic) | All customers |
   | Salesforce Agent | 🔵 Limited | ~30 specific users |
   | Slack | ✅ GA | All customers |
   | Notion | 🔵 Limited | ~10 targets |
   | Linear | 🔵 Limited | 1 workspace |
   | Monday.com | 🔵 Limited | 3 domains |
   | Google Suite | 🔴 Internal Only | Not available |
   | Gong | 🔵 Limited | 8 workspaces |

4. **How to Check a Customer's Features**
   - PostHog → Feature Flags → Search by email/workspace
   - Or ask in #product-support Slack

---

### 📊 Feature Lookup by Customer

**Tier 1 - Premium Beta (Most Features)**
- Redo - 49 features
- Tilt - 46 features
- Agility Ads - 45 features

**Tier 2 - Beta Enrolled (44-45 features)**
- Cinch, ELB Learning, Boostly, Sendoso, KlientBoost
- Salesforce power users (Broadvoice, Chili Publish, Doxel AI)

**Tier 3 - Standard (42 features)**
- All other customers

---

### ❓ Common Customer Questions

**Q: "I heard you have [feature X], but I don't see it"**
> "That feature is currently in limited beta testing. I can check if your workspace qualifies for early access. Would you like me to submit a request?"

**Q: "Why does [other company] have features we don't?"**
> "We roll out new features gradually to ensure stability. Some customers are in our beta program which gives early access. Would you like to learn about our beta program?"

**Q: "When will [feature] be available to everyone?"**
> "I don't have a specific date, but I can add your interest to our feedback system so the product team knows there's demand. In the meantime, I can show you how to accomplish something similar with our current features."

---

## External Communication Templates

### Template 1: Beta Program Invitation

**Subject:** You're invited to AskElephant Beta 🐘

Hi [Name],

Based on your engagement with AskElephant, we'd like to invite you to our Beta program!

**What you get:**
- Early access to new features before general release
- Direct input into product direction
- Priority support for beta features

**Current beta features include:**
- Enhanced Dashboard with team analytics
- Workflows V2 with advanced automation
- And more coming soon...

**How to join:**
1. Go to Settings → Beta Features
2. Toggle "Opt into Beta Features"
3. New features will appear within 24 hours

Questions? Reply to this email or reach out to your CSM.

Best,
The AskElephant Team

---

### Template 2: Feature Request Response

**Subject:** RE: [Feature] Request

Hi [Name],

Thanks for reaching out about [feature]!

**Current Status:** This feature is currently in limited beta with select customers.

**What we're doing:**
- Gathering feedback from beta users
- Refining the experience
- Planning broader rollout

**Your options:**
1. **Join the waitlist** - I've added you to our interest list for this feature
2. **Beta program** - If you'd like early access to features like this, consider our beta program
3. **Alternative approach** - In the meantime, here's how you can accomplish something similar: [alternative]

I'll personally follow up when this feature becomes more widely available.

Best,
[CSM Name]

---

### Template 3: Feature Parity Explanation (Sales)

**For prospects asking about features they saw in a demo/competitor comparison:**

Hi [Name],

Great question about [feature]!

Here's the breakdown:

**Available Now (All Plans):**
- [List relevant GA features]

**Coming Soon:**
- [Feature they asked about] - Currently in beta, targeting Q[X] for general availability
- We can discuss early access if this is critical for your use case

**Not on Roadmap:**
- [Be honest if something isn't planned]

Would it be helpful to schedule a call to walk through what's available today and discuss your specific needs?

Best,
[Sales Rep]

---

## Roadmap Communication

### Features Planned for GA (Q1 2026)

Based on the audit, these features should be prioritized for general availability:

| Feature | Current State | Recommended Action | Est. Timeline |
|---------|---------------|-------------------|---------------|
| `global-chat-enabled` | 10% beta | GA candidate | Q1 2026 |
| `extractions-table` | 20% beta | GA candidate | Q1 2026 |
| `chat-tool-internal-search` | 15% beta | GA candidate | Q1 2026 |
| `dashboard-beta` | 15% beta (18mo) | GA or sunset | Q1 2026 |

### Deprecation Notice Template

**For features being sunset:**

Hi [Customer],

We wanted to give you advance notice about an upcoming change.

**What's changing:**
[Feature name] will be retired on [date].

**Why:**
We're consolidating this functionality into [replacement] to provide a better experience.

**What you need to do:**
- [Migration steps if any]
- [Timeline]

**Questions?**
Reach out to your CSM or reply to this email.

Thanks for your continued partnership.

The AskElephant Team

---

## Internal Slack Announcement

**For #customer-success and #sales channels:**

---

📊 **Feature Flag Audit Complete - What You Need to Know**

We completed an audit of our 116 feature flags. Here's the TLDR:

**The Good:**
- 42 features are available to ALL customers
- Core product is consistent across the board

**The Challenge:**
- 32 features are in "limited beta" creating ~23 different customer experiences
- Some customers (Redo, Tilt) have significantly more features than baseline

**What This Means for You:**

1️⃣ **Before promising a feature**, check PostHog or ask in #product-support

2️⃣ **Common beta features customers ask about:**
- Internal search (16 workspaces have it)
- Dashboard analytics (15 workspaces)  
- Gmail integration (very limited)
- Salesforce agent (specific users only)

3️⃣ **New resources:**
- Feature lookup guide: [link]
- Customer tier reference: [link]
- Beta enrollment process: [link]

**Questions?** Drop them in this thread!

cc: @cs-team @sales-team

---

## Metrics to Track

After rolling out these communications:

| Metric | Baseline | Target |
|--------|----------|--------|
| Feature-related support tickets | TBD | -30% |
| "Where is X feature" questions | TBD | -50% |
| Beta enrollment rate | TBD | +25% |
| CS time spent on feature questions | TBD | -40% |

---

## Next Steps

1. [ ] Review this plan with CS leadership
2. [ ] Create PostHog dashboard for feature flag lookups
3. [ ] Update internal knowledge base
4. [ ] Schedule CS enablement session
5. [ ] Draft customer-facing beta program page
6. [ ] Create feature roadmap public page

---

*Generated from Feature Flag Audit - January 13, 2026*
