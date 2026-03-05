# Channel Audit: Company-Wide

**Audit Date:** January 24, 2026  
**Time Range:** Last 90 days (Oct 26, 2025 - Jan 24, 2026)  
**Channels Audited:** 6

---

## #general

| Metric | Value |
|--------|-------|
| **Members** | 47 (full company) |
| **Messages (90 days)** | 565 |
| **Activity Level** | Very High (6+ msgs/day) |
| **Stated Purpose** | Announcements and team-wide conversations |

### Actual Usage

- **Leadership Announcements** (40%): Company updates from leadership (Andrew, Ben, Woody), policy changes, PTO instructions, All-hands logistics
- **Celebrations** (30%): Birthdays, team wins, customer success stories, shoutouts
- **Office Logistics** (15%): Break area availability, office events, Tandem coordination
- **Product Wins** (10%): Customer testimonials, Rebuy success stories, team accomplishments
- **Social/Misc** (5%): GIFs, reactions to company news, casual threads

### Key Contributors
- Leadership (Andrew, Woody, Ben, Robert)
- Engineering (Kaden) for 1Password/security items
- CS/Sales for customer wins

### Recommendation
**Keep As-Is** - Well-utilized for its intended purpose. Clear separation from #watering-hole for social content.

### Routing Guidance
Use #general for:
- Company-wide announcements
- Leadership communications
- Office/policy updates
- Celebrating team/customer wins

NOT for:
- Social banter (use #watering-hole)
- Team-specific discussions (use #team-* channels)

---

## #watering-hole

| Metric | Value |
|--------|-------|
| **Members** | 45 |
| **Messages (90 days)** | High |
| **Activity Level** | Very High |
| **Stated Purpose** | Everything else - jokes, ideas, GIFs |

### Actual Usage

- **Social Content** (50%): Memes, jokes, random thoughts
- **Off-Topic Discussion** (25%): Non-work conversations
- **GIFs/Media** (15%): Reactions, entertainment
- **Informal Ideas** (10%): Casual brainstorming, questions

### Recommendation
**Keep As-Is** - Healthy company culture channel. Good separation from #general.

### Routing Guidance
Use #watering-hole for:
- Social posts, memes, jokes
- Non-work conversation
- Informal team bonding

NOT for:
- Announcements (use #general)
- Work discussions (use appropriate team channel)

---

## #ai-news

| Metric | Value |
|--------|-------|
| **Members** | 43 |
| **Messages (90 days)** | Moderate-High |
| **Activity Level** | Moderate |
| **Stated Purpose** | None documented |

### Actual Usage

- **Industry News** (60%): AI announcements, new model releases, competitor updates
- **Discussion** (25%): Team reactions, analysis
- **Internal AI Updates** (15%): AskElephant AI capabilities, experiments

### Recommendation
**Add Purpose Statement** - Popular channel but undocumented. Suggest: "Industry AI news, competitor updates, and internal AI experiments."

### Routing Guidance
Use #ai-news for:
- AI industry news and developments
- Competitor AI announcements
- Internal AI experiments to share

NOT for:
- Customer feedback about AI features (use #customer-feedback)
- AI bugs (use #product-issues)

---

## #incidents

| Metric | Value |
|--------|-------|
| **Members** | 44 |
| **Messages (90 days)** | 29 |
| **Activity Level** | Low (incident-driven) |
| **Stated Purpose** | incident.io announcements channel |

### Actual Usage

- **Incident Tracking** (95%): incident.io bot posts for Critical/Major incidents
- **Team Discussion** (5%): Severity questions, status updates

### Recent Incidents (90 days)
1. **Cloudflare Outage** (Critical) - Full app unavailable
2. **API 429 Errors** (Critical) - Container deploy failure
3. **Login Issues** (Major) - Valkey caching client
4. **Pipedream Outage** (Critical) - Upstream provider down

### Key Pattern
All messages are from incident.io bot or responses in incident threads. No misuse or noise.

### Recommendation
**Keep As-Is** - Working exactly as intended. Well-structured incident management.

### Routing Guidance
Use #incidents for:
- Viewing ongoing incidents
- Understanding system status
- Incident post-mortems

NOT for:
- Reporting bugs (use #product-issues)
- Reporting outages (use incident.io to declare incident)

---

## #access-requests

| Metric | Value |
|--------|-------|
| **Members** | 45 |
| **Messages (90 days)** | 59 |
| **Activity Level** | Low-Moderate |
| **Stated Purpose** | None documented |

### Actual Usage

- **Linear Ticket Notifications** (70%): IT-* tickets for access requests
- **Discussion/Follow-up** (30%): Clarifications, status updates

### Common Request Types
- Claude/Claude Code access
- GitHub ChatGPT integration
- 1Password vault access
- Google Cloud logs access
- Composio review
- Super user access

### Key Pattern
Well-integrated with Linear for tracking. Requests handled by Kaden (IT). Clear workflow.

### Recommendation
**Add Purpose Statement** - Suggest: "Request access to tools and systems. Tracked via Linear IT project."

### Routing Guidance
Use #access-requests for:
- New tool/system access requests
- Permission changes
- Vendor reviews

NOT for:
- General IT issues (use Linear IT project directly)
- Password resets (use 1Password)

---

## #phishing-reports

| Metric | Value |
|--------|-------|
| **Members** | 41 |
| **Messages (90 days)** | 1 |
| **Activity Level** | Very Low (nearly dormant) |
| **Stated Purpose** | None documented |

### Actual Usage

- **Phishing Reports** (100%): Only 1 report in 90 days

### Concern
Very low utilization despite 41 members. Either:
1. Phishing attempts are rare (good)
2. Team isn't reporting (concern)
3. Awareness needs improvement

### Recommendation
**Add Purpose Statement + Awareness** - Suggest periodic reminders about reporting phishing. Add purpose: "Report suspicious emails, texts, or links here. Forward phishing attempts for security review."

### Routing Guidance
Use #phishing-reports for:
- Forwarding suspicious emails
- Reporting potential security threats
- Asking "is this legit?"

NOT for:
- General security questions
- Access requests (use #access-requests)

---

## Summary: Company-Wide Channels

| Channel | Activity | Purpose Clarity | Action Needed |
|---------|----------|-----------------|---------------|
| #general | Very High | Clear | None |
| #watering-hole | Very High | Clear | None |
| #ai-news | Moderate | Missing | Add purpose statement |
| #incidents | Low (expected) | Clear | None |
| #access-requests | Moderate | Missing | Add purpose statement |
| #phishing-reports | Very Low | Missing | Add purpose + awareness |

### Communication Map

```
COMPANY-WIDE COMMUNICATION ROUTING

Company announcement?
├─ Yes → #general
└─ No → Continue

Social/fun content?
├─ Yes → #watering-hole
└─ No → Continue

AI industry news?
├─ Yes → #ai-news
└─ No → Continue

System incident happening?
├─ Yes → Declare via incident.io → auto-posts to #incidents
└─ No → Continue

Need tool/system access?
├─ Yes → Create Linear IT ticket → auto-posts to #access-requests
└─ No → Continue

Suspicious email/phishing?
├─ Yes → #phishing-reports
└─ No → Use appropriate team/project channel
```
