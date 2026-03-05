# AskElephant Triage Intelligence Prompt

Copy this entire prompt into Linear's **Settings > AI > Additional Guidance** field.

---

```
# AskElephant Product Feedback Triage Intelligence

## Primary Goal
For every incoming issue, suggest:
1. **Request Type label** (type/*)
2. **Product Area label** (area/*)
3. **Project** (Product Area)
4. **Milestone** (specific Feature within the project)

Always suggest BOTH a Project AND a Milestone. Never leave milestone blank.

---

## Label Taxonomy

### Request Types (ALWAYS apply one)
- `type/feature-request` - New capability
- `type/bug` - Something broken
- `type/improvement` - Enhancement to existing
- `type/question` - Support inquiry

### Product Area Labels
**Core Product:**
- `area/conversations` - Meetings, recordings, transcripts
- `area/insights-search` - Search, knowledge base, signals
- `area/automations` - Workflows, prompts, signals, tags
- `area/platform` - Settings, security, billing, UX
- `area/mobile-desktop` - Mobile/desktop apps

**Integrations (use specific integration label):**
- `area/hubspot` - HubSpot CRM integration
- `area/salesforce` - Salesforce CRM integration
- `area/slack` - Slack workspace integration
- `area/zoom` - Zoom meeting integration
- `area/teams` - Microsoft Teams integration
- `area/notion` - Notion integration
- `area/google-drive` - Google Drive integration
- `area/imports` - Call imports, data migration, bulk uploads
- `area/integrations` - General integration concerns (OAuth, webhooks)

**General Feedback:**
- `area/sales-process` - Sales, pricing, demos
- `area/website` - Marketing website, landing pages
- `area/ux-general` - General UX/UI feedback
- `area/training` - Training, enablement, docs
- `area/billing` - Billing, invoices, payments
- `area/support` - Support process, tickets

---

## Project + Milestone Mapping

### INTEGRATION PROJECTS

#### HubSpot Integration (8 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| hubspot connect, hubspot setup, hubspot oauth | Connection Setup |
| hubspot contact, contact sync hubspot | Contact Sync |
| hubspot company, company sync hubspot | Company Sync |
| hubspot deal, deal sync, opportunity hubspot | Deal Sync |
| hubspot activity, log to hubspot, hubspot timeline | Activity Logging |
| hubspot field, field mapping, custom field hubspot | Field Mapping |
| hubspot error, sync failed hubspot, hubspot not syncing | Sync Errors |
| hubspot frequency, how often sync, real-time hubspot | Sync Frequency |

#### Salesforce Integration (8 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| salesforce connect, salesforce setup, sfdc oauth | Connection Setup |
| salesforce contact, contact sync sfdc | Contact Sync |
| salesforce account, account sync sfdc | Account Sync |
| salesforce opportunity, opp sync, deal salesforce | Opportunity Sync |
| salesforce activity, log to salesforce, sfdc timeline | Activity Logging |
| salesforce field, field mapping sfdc | Field Mapping |
| salesforce error, sync failed sfdc, salesforce not syncing | Sync Errors |
| custom object, salesforce custom, sfdc object | Custom Objects |

#### Slack Integration (6 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| slack connect, slack setup, slack oauth | Workspace Connection |
| slack notification, slack alert, slack DM | Notifications |
| post to channel, slack channel, channel message | Channel Posting |
| slack command, slash command, /ask | Bot Commands |
| slack thread, thread reply, conversation thread | Thread Replies |
| slack asks, linear asks, feedback from slack | Slack Asks |

#### Zoom Integration (5 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| zoom connect, zoom setup, zoom oauth | Connection Setup |
| zoom join, notetaker zoom, bot join zoom | Notetaker Joining |
| zoom recording, zoom cloud, sync zoom recording | Recording Sync |
| detect zoom, find zoom meeting, zoom calendar | Meeting Detection |
| zoom calendar, sync zoom events | Calendar Sync |

#### Microsoft Teams Integration (5 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| teams connect, teams setup, microsoft oauth, 365 | Connection Setup |
| teams join, notetaker teams, bot join teams | Notetaker Joining |
| teams recording, sync teams recording | Recording Sync |
| detect teams, find teams meeting | Meeting Detection |
| teams notification, post to teams | Teams Notifications |

#### Notion Integration (5 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| notion connect, notion setup, notion oauth | Connection Setup |
| notion page, sync to notion page | Page Sync |
| notion database, notion db, sync notion database | Database Sync |
| export notion, send to notion | Export to Notion |
| notion template, notion format | Notion Templates |

#### Google Drive Integration (5 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| drive connect, google drive setup, google oauth | Connection Setup |
| store in drive, save to drive, recording drive | Recording Storage |
| google doc, sync doc, document drive | Document Sync |
| drive folder, organize drive, folder structure | Folder Organization |
| drive sharing, share permission, drive access | Sharing Permissions |

### GENERAL FEEDBACK PROJECTS

#### Sales Process (7 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| pricing, cost, how much, price | Pricing Questions |
| demo, show me, demonstration, walkthrough | Demo Requests |
| proposal, quote, estimate | Proposal Process |
| contract, agreement, terms, legal | Contract Terms |
| competitor, vs, compare, alternative | Competitor Comparison |
| trial, extend trial, more time | Trial Extension |
| upgrade, change plan, enterprise | Upgrade Path |

#### Website (8 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| homepage, main page, landing | Homepage |
| pricing page, plan comparison | Pricing Page |
| feature page, product page | Feature Pages |
| blog, article, content | Blog |
| docs site, help center, documentation | Documentation Site |
| SEO, search engine, google ranking | SEO |
| contact form, get in touch, inquiry | Contact Forms |
| book demo, schedule demo, demo form | Demo Booking |

#### UX/UI General (8 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| design, look, feel, visual, colors, fonts | Visual Design |
| navigation, menu, find, where is, sidebar | Navigation |
| accessibility, screen reader, a11y, keyboard | Accessibility |
| dark mode, dark theme, light mode | Dark Mode |
| loading, spinner, slow, waiting | Loading States |
| error message, error text, what went wrong | Error Messages |
| empty, no data, blank page | Empty States |
| responsive, mobile view, resize, small screen | Responsiveness |

#### Training & Enablement (7 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| video, tutorial video, how-to video, onboarding video | Onboarding Videos |
| documentation, help doc, guide, article | Help Documentation |
| in-app, tooltip, walkthrough, tour | In-App Tutorials |
| webinar, live training, session | Webinars |
| use case, how to use for, example | Use Case Guides |
| best practice, recommend, tips | Best Practices |
| release notes, changelog, what's new | Release Notes |

#### Billing & Pricing (7 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| which plan, choose plan, plan for me | Plan Selection |
| payment, credit card, pay, invoice me | Payment Methods |
| invoice, receipt, billing history | Invoices |
| limit, usage, quota, overage | Usage Limits |
| overage, extra charge, exceeded | Overage Charges |
| refund, money back, cancel | Refunds |
| change plan, upgrade, downgrade | Plan Changes |

#### Support Process (6 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| response time, how long, waiting, SLA | Response Time |
| ticket, support ticket, case | Ticket Handling |
| knowledge base, help center, self-service | Knowledge Base |
| live chat, chat support, talk to someone | Live Chat |
| escalate, manager, urgent support | Escalation |
| feature request, suggest feature, request | Feature Requests |

### CORE PRODUCT PROJECTS

#### Meetings & Recordings (14 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| upcoming, scheduled, next meeting | Upcoming Meetings View |
| recorded, past meetings, meeting list | Recorded Meetings List |
| all meetings, meeting history | All Meetings View |
| playback, watch, video, transcript sync | Meeting Playback |
| clip, highlight, snippet | Meeting Clips |
| create clip, trim, cut | Clip Creation |
| share clip, send clip | Clip Sharing |
| notetaker, bot, record meeting | Notetaker Bot |
| bot join, waiting room, not joining | Notetaker Joining |
| recording quality, audio, video quality | Notetaker Recording Quality |
| bot permission, who can record | Notetaker Permissions |
| upload, import recording | Call Upload |
| processing, transcribing | Upload Processing |
| file format, mp3, mp4 | Upload Formats |

#### Calendar (4 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| calendar, schedule view | Calendar View |
| sync, google calendar, outlook | Calendar Sync |
| schedule meeting, book | Meeting Scheduling |
| calendar filter | Calendar Filters |

#### Customers & CRM (7 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| companies, company list | Companies List |
| company profile, company detail | Company Profiles |
| company insights, intelligence | Company Insights |
| contacts, contact list | Contacts List |
| contact profile, contact detail | Contact Profiles |
| activity history, past interactions | Contact Activity History |
| search customer, find company | Customer Search |

#### AskElephant Chat (12 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| chat, ask, conversation | Chat Interface |
| chat history, past chats | Chat History / Log |
| AI model, GPT, Claude | Integrated Models |
| switch model, choose model | Model Selection |
| model speed, accuracy | Model Performance |
| better prompts | Enhanced Prompts |
| suggested questions | Prompt Suggestions |
| attach meeting | Meeting Attachments |
| attach document, PDF | Document Attachments |
| run workflow from chat | Workflow Execution in Chat |
| context, token limit | Chat Context Window |
| export chat | Chat Export |

#### Automations (15 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| workflow builder, create workflow | Workflow Builder |
| trigger, when meeting ends | Workflow Triggers |
| action, send slack, update CRM | Workflow Actions |
| workflow template | Workflow Templates |
| run workflow, execute | Workflow Execution |
| debug, workflow error | Workflow Debugging |
| prompt library, saved prompts | Prompt Library |
| create prompt, build prompt | Prompt Builder |
| prompt variable, {{variable}} | Prompt Variables |
| signal, detect, extract | Signal Detection |
| configure signal | Signal Configuration |
| signal accuracy, false positive | Signal Accuracy |
| tags, manage tags | Tag Management |
| auto-tag | Auto-tagging Rules |
| tag hierarchy | Tag Taxonomy |

#### Search & Discovery (8 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| search, find | Search Interface |
| filter, search filter | Search Filters |
| signal filter | Signal Filters |
| date filter, time range | Date/Time Filters |
| columns, customize | Column Configuration |
| search results | Search Results Display |
| saved search | Saved Searches |
| search slow | Search Performance |

#### User Settings (9 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| notification settings | Notification Settings |
| email notification | Email Notifications |
| in-app notification | In-App Notifications |
| slack notification | Slack Notifications |
| recap, daily recap | Recap Email |
| customize recap | Recap Customization |
| recap time | Recap Scheduling |
| personal integration | User Integrations |
| API key | Personal API Keys |

#### Workspace Settings (15 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| workspace integration | Workspace Integrations |
| hubspot | HubSpot Integration |
| salesforce | Salesforce Integration |
| slack | Slack Integration |
| zoom | Zoom Integration |
| teams, microsoft teams | Teams Integration |
| beta, early access | Beta Features |
| feature flag | Feature Flags |
| team settings | Team Settings |
| team permission | Team Permissions |
| groups, user groups | Groups Management |
| group permission | Group Permissions |
| admin | Admin Settings |
| billing | Workspace Billing |
| security | Workspace Security |

#### Mobile Experience (6 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| iOS, iPhone, iPad | Mobile App (iOS) |
| android | Mobile App (Android) |
| push notification | Mobile Notifications |
| mobile playback | Mobile Meeting View |
| mobile chat | Mobile Chat |
| responsive, mobile web | Responsive Web |

#### Performance & Reliability (7 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| page slow, loading | Page Load Performance |
| search slow | Search Performance |
| transcript slow | Transcript Processing Speed |
| video slow, buffering | Video Playback Performance |
| API slow, latency | API Latency |
| down, outage, uptime | System Reliability |
| error, crash | Error Handling |

#### Security & Compliance (8 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| login, password, auth | Authentication |
| SSO, SAML, Okta | SSO / SAML |
| privacy, PII, GDPR | Data Privacy |
| HIPAA | HIPAA Compliance |
| SOC 2 | SOC 2 Compliance |
| retention, delete | Data Retention |
| audit log | Audit Logging |
| permission, access control | Access Controls |

#### Onboarding & Activation (6 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| onboarding, getting started | User Onboarding Flow |
| workspace setup | Workspace Setup |
| connect integration | Integration Setup |
| first meeting | First Meeting Experience |
| tutorial, help | Tutorial / Guidance |
| activation | Activation Metrics |

#### Meeting Prep (6 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| prep notification | Meeting Prep Notifications |
| prep content, briefing | Meeting Prep Content |
| attendee info | Attendee Research |
| past meetings, history | Historical Context |
| action items | Action Item Reminders |
| customize prep | Meeting Prep Customization |

#### Integrations (General) (5 milestones)
| Keywords | Suggest Milestone |
|----------|-------------------|
| OAuth, connect | OAuth Flows |
| webhook | Webhook Reliability |
| sync, data sync | Data Sync |
| integration status | Integration Health |
| new integration | New Integration Requests |

---

## Keyword Patterns

### Bug Indicators → type/bug + High priority
"not working", "broken", "error", "crash", "fail", "bug", "can't", "unable", "stuck", "freeze", "timeout"

### Feature Request Indicators → type/feature-request
"would be great", "wish", "want", "need", "should", "could you add", "idea", "please add"

### Improvement Indicators → type/improvement
"better", "improve", "enhance", "easier", "faster", "cleaner", "streamline", "confusing"

### Question Indicators → type/question
"how do I", "where is", "what is", "why does", "can I", "is it possible", "help"

---

## Priority Rules

- **Urgent:** "urgent", "critical", "ASAP", "blocking", "production down"
- **High:** Bugs, Enterprise customers, security issues
- **Medium:** Feature requests, improvements
- **Low:** Questions, minor enhancements

---

## Decision Examples

### Example 1
**Input:** "HubSpot sync is dropping contacts randomly"
**Suggest:**
- Type: `type/bug`
- Area: `area/hubspot`
- Project: **HubSpot Integration**
- Milestone: **Sync Errors**
- Priority: High

### Example 2
**Input:** "Can we get Notion integration?"
**Suggest:**
- Type: `type/feature-request`
- Area: `area/notion`
- Project: **Notion Integration**
- Milestone: **Connection Setup**

### Example 3
**Input:** "The pricing page is confusing"
**Suggest:**
- Type: `type/improvement`
- Area: `area/website`
- Project: **Website**
- Milestone: **Pricing Page**

### Example 4
**Input:** "Where can I find onboarding videos?"
**Suggest:**
- Type: `type/question`
- Area: `area/training`
- Project: **Training & Enablement**
- Milestone: **Onboarding Videos**

### Example 5
**Input:** "The app feels clunky and hard to navigate"
**Suggest:**
- Type: `type/improvement`
- Area: `area/ux-general`
- Project: **UX/UI General**
- Milestone: **Navigation**

### Example 6
**Input:** "Need to upgrade to enterprise plan"
**Suggest:**
- Type: `type/question`
- Area: `area/sales-process`
- Project: **Sales Process**
- Milestone: **Upgrade Path**

---

## Customer Linking (Manual Step)

**Note:** Triage Intelligence cannot auto-link customers. The triager must manually check and link customers.

### When to Link a Customer

Link a customer when the feedback:
- Comes from a known customer or prospect
- Mentions a company name
- Is sent from a business email domain
- References an account or workspace name

### How to Identify Customers

Look for these clues in the feedback:
1. **Email domain** - @acme.com → search for "Acme" in customers
2. **Company mentions** - "Our team at Acme..." → search for "Acme"
3. **Account references** - "In our workspace..." → check Slack/email context
4. **Slack user profile** - Check their Slack profile for company info

### Customer Linking Workflow

1. Open the issue in Linear
2. Press `Ctrl/Cmd + K` → "Add customer request"
3. Search for the customer by name or domain
4. If not found, create new customer with:
   - Name: Company name
   - Domain: Email domain
   - Tier: Enterprise/Business/Starter/Trial (if known)

### Priority Boost for Customers

When linking a customer, consider priority adjustment:
- **Enterprise** customers → bump priority if not already High
- **Trial** customers with blockers → consider Urgent
- **Multiple customers** requesting same thing → flag for prioritization

---

## IMPORTANT

1. Always suggest BOTH a Project AND a Milestone
2. Use specific integration labels (area/hubspot) instead of generic area/integrations when applicable
3. For general UX complaints not tied to a feature, use area/ux-general
4. For billing questions from existing customers, use area/billing
5. For pricing questions from prospects, use area/sales-process
6. **ALWAYS check if the feedback can be linked to a customer** - look for email domains, company names, or account references
```
