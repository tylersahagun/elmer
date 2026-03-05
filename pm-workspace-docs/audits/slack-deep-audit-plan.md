# Slack Deep Audit Plan

**Objective:** Create a comprehensive communication map showing actual channel usage vs. stated purpose for all 114 channels.

**Output:** A definitive guide for "where should this communication go?"

---

## Phase 1: Data Collection (Per Channel)

### For Each Channel, Collect:

| Data Point | Method | Purpose |
|------------|--------|---------|
| **Channel metadata** | Already collected | Name, members, stated purpose/topic |
| **Last 100 messages** | `SLACK_FETCH_CONVERSATION_HISTORY` | Understand recent activity patterns |
| **Message frequency** | Timestamp analysis | Activity level (daily/weekly/monthly) |
| **Top contributors** | Message analysis | Who drives conversation |
| **Message types** | Content analysis | Questions, announcements, discussions, bot posts |
| **Cross-references** | Link/mention analysis | How channels connect |

### Analysis Framework Per Channel:

```markdown
## #channel-name

**Stated Purpose:** [from topic/purpose field]
**Actual Usage:** [derived from conversation analysis]
**Activity Level:** High/Medium/Low/Dormant
**Message Types:** 
  - X% Announcements
  - X% Questions/Support
  - X% Discussion/Collaboration
  - X% Bot/Automated
  - X% Social/Off-topic

**Key Themes:** [top 3-5 themes from content]
**Top Contributors:** [roles, not names - "Engineering", "Sales", etc.]
**Decision Authority:** Who answers questions / makes decisions here
**Cross-Channel Overlap:** Channels with similar content
**Recommendation:** Keep as-is / Clarify purpose / Merge with X / Archive
```

---

## Phase 2: Execution Batches

### Batch 1: High-Impact Company Channels (6 channels)
Priority: These affect everyone
- #general
- #watering-hole  
- #access-requests
- #phishing-reports
- #incidents
- #ai-news

### Batch 2: Product & Engineering (10 channels)
Priority: Core product development communication
- #epd-all
- #team-dev
- #team-dev-code-review
- #team-dev-schema-updates
- #product-issues
- #product-requests
- #product-updates
- #product-forum
- #product-learnings
- #design-ux

### Batch 3: Sales & Revenue (14 channels)
Priority: Revenue-critical communication
- #team-sales
- #revenue
- #sales-closed-won
- #sales-closed-lost
- #demo-request
- #deal-marqvision
- #deal-intervention
- #expansion-opportunities
- #next-steps
- #aske-vs-gong
- #competitors
- #rb2b
- #altitude-training
- #sales-linkedin-stuff

### Batch 4: Customer Success (11 channels)
Priority: Customer health and retention
- #team-csm
- #customer-quotes
- #customer-feedback
- #customer-message-queue
- #churn-alert
- #cs-rep-scorecards
- #cs-team-wins
- #case-studies
- #macro-insights
- #clozeloop-scorecard
- #customer-gift-request

### Batch 5: Marketing & Growth (7 channels)
- #marketing
- #growth
- #product-marketing
- #linkedin-posts
- #linkedin-post-ideas
- #memes-to-create
- #daily-ai

### Batch 6: Project Channels (6 channels)
- #proj-workflows
- #proj-mobile
- #proj-desktop-app
- #proj-notetaker
- #proj-pricing
- #proj-referrals

### Batch 7: Partner Program (6 channels)
- #team-partners
- #hubspot-partners
- #partner-mentions
- #partner-feedback
- #partnership-opportunities
- #digitalj2-onboarding

### Batch 8: Internal Operations (8 channels)
- #askelephant-internal-workflow-requests
- #call-review-queue
- #calendar-connection
- #alerts
- #bug-bounty
- #test-staging-app
- #test-local-app
- #workflow-testing

### Batch 9: External Partner Channels (35 channels)
Sample approach - audit 5 representative channels deeply, spot-check others:
- Deep audit: #ext-kixie-askelephant, #ext-motivositychannel, #ext-schoolai-askelephant, #ext-buildwitt, #ext-sequifi
- Spot-check remaining 30 for patterns

### Batch 10: Culture & Office (6 channels)
- #office-utah
- #gaming
- #out-of-context-quotes
- #new-hire-referrals
- #devin-prompt-builder
- #demo-for-demo

---

## Phase 3: Output Deliverables

### Deliverable 1: Channel Communication Map (Primary)

A definitive routing guide:

```markdown
# AskElephant Communication Routing Guide

## When you need to...

### Report a bug or product issue
→ **#product-issues** - Include steps to reproduce, screenshots
  - NOT #team-dev (that's for dev discussions)
  - NOT #product-forum (that's for experience discussions)

### Share customer feedback
→ **#customer-feedback** - For general feedback
→ **#customer-quotes** - For quotable testimonials
→ **#macro-insights** - For strategic/recurring themes
  - NOT #churn-alert (only for churn risk signals)

### Announce something to the whole company
→ **#general** - Company-wide announcements
  - NOT #watering-hole (that's for social/casual)
  - NOT #epd-all (that's EPD-specific)

[...etc for all common communication needs]
```

### Deliverable 2: Channel Overlap Matrix

Visual showing which channels have overlapping content:

| Channel A | Channel B | Overlap % | Recommendation |
|-----------|-----------|-----------|----------------|
| #product-issues | #product-forum | 15% | Clarify: issues=bugs, forum=experience |
| #customer-feedback | #macro-insights | 25% | Define: feedback=raw, insights=synthesized |

### Deliverable 3: Channel Health Report

| Channel | Activity | Purpose Clarity | Recommendation |
|---------|----------|-----------------|----------------|
| #general | High | Clear | Keep |
| #team-dev-doc-scrape | Dormant | Unclear | Archive |

### Deliverable 4: Updated Purpose Statements

Suggested topic/purpose text for channels lacking documentation.

---

## Execution Approach

### Option A: Automated Deep Dive (Recommended)
- Use `SLACK_SEARCH_MESSAGES` with `in:#channel-name` for each channel
- Pull last 30 days of messages (recent patterns)
- Analyze message content, types, and contributors
- **Estimated time:** 2-3 hours of processing

### Option B: Sampling Approach
- Pull 50 messages from each channel
- Focus on message types and themes
- **Estimated time:** 1 hour of processing

### Option C: Hybrid (Most Thorough)
- Deep dive (100+ messages) for high-impact channels (Batches 1-5)
- Sample (50 messages) for lower-priority channels
- Spot-check external partner channels for patterns
- **Estimated time:** 3-4 hours of processing

---

## Questions Before Execution

1. **Time range preference?** Last 30 days vs. last 90 days vs. all-time sample?
2. **Depth preference?** Option A, B, or C above?
3. **Privacy consideration?** Should I avoid naming specific users in the analysis?
4. **Output format?** Single comprehensive doc vs. separate files per category?
5. **External channels (`ext-*`):** Deep audit all 35 or sample 5-10 representative ones?

---

## Ready to Execute

Once you confirm preferences, I'll:
1. Extract channel IDs from the original data
2. Batch-process conversation history
3. Analyze and categorize content
4. Generate the communication map and recommendations

**Next step:** Confirm your preferences above, and I'll begin with Batch 1 (High-Impact Company Channels).
