# Object Association Research: How to Match Meetings to HubSpot Objects

**Date:** 2026-01-09
**Author:** Tyler Sahagun + AI Analysis
**Status:** Active Research
**Problem:** Making the HubSpot agent configuration agnostic to object types while ensuring correct associations

---

## Executive Summary

The HubSpot agent needs to be **object-agnostic** — users should be able to update deals, contacts, companies, or custom objects after a meeting. The core challenge is: **"How do we reliably know which specific HubSpot object to update?"**

This is fundamentally a **matching/association** problem with different complexity levels:
- **Companies**: Straightforward (domain matching)
- **Contacts**: Moderately easy (email matching from attendees)
- **Deals**: Complex (multiple deals per company/contact)
- **Custom Objects**: Highly variable (no standard association patterns)

---

## Current System Analysis

### How `searchDealsWithAi` Works Today

The existing deal-finding logic follows this chain:

```
AskElephant Meeting
       ↓
   Engagement ID
       ↓
   Associated Companies (internal AE data)
       ↓
   Match by Domain → HubSpot Companies
       ↓
   Filter by Pipeline + Probability Range
       ↓
   Get up to 25 candidate deals per company
       ↓
   [If 1 deal] → Return it
   [If multiple] → Use AI to select best match
```

### AI Selection Criteria (Current)

When multiple deals are candidates, the AI applies these heuristics (in order):

1. **Contact Overlap** - deals with contacts who are meeting attendees
2. **Contemporaneous Meetings** - deals with HubSpot meetings near this meeting's time
3. **Deal Stage** - prefer advanced stages
4. **Name/Description Relevance** - semantic match to meeting title
5. **Deal Type** - match meeting purpose
6. **Recency** - most recently modified

### Strengths of Current Approach

- ✅ Handles the "happy path" well (single deal per company)
- ✅ AI fallback is smart and considers multiple signals
- ✅ Filters by pipeline/probability reduce candidates

### Weaknesses (Why It Fails)

- ❌ **Opaque decision-making** — users don't see why a deal was selected
- ❌ **No confidence indicator** — was this a 95% match or 51%?
- ❌ **No user correction** — if wrong deal selected, no easy fix
- ❌ **Deals-only** — different logic needed for contacts, companies, custom objects
- ❌ **Meeting-dependent** — requires meeting context; won't work for triggered workflows

---

## The Object Association Problem

### Association Paths by Object Type

| Target Object | Primary Association Path | Fallback | Complexity |
|---------------|--------------------------|----------|------------|
| **Company** | Meeting attendees → Contact → Company domain | Direct HubSpot company lookup | Low |
| **Contact** | Meeting attendee email → HubSpot Contact | Phone number match | Low-Medium |
| **Deal** | Company → Active deals → AI selection | Contact → Deals | High |
| **Meeting (HS)** | Same-time HubSpot meeting | Attendee overlap | Medium |
| **Ticket** | Company → Open tickets | Contact → Tickets | High |
| **Custom Object** | Must define association rules | Varies by object | Very High |

### Why Deals Are Hard

A single company might have:
- 1 deal per salesperson (team selling)
- Multiple deals in different pipelines (new business vs. upsell)
- Deals for different products/services
- Expired deals still in system

**Example from James's workflow:**
> "I need to update the probability on the right deal. We have 15 open deals with Acme Corp — one per product line. If the AI picks the wrong one, my forecast is wrong."

---

## Proposed Solution Architecture

### Design Principle: **Progressive Disambiguation**

Instead of trying to solve association in one step, break it into layers:

```
Layer 1: Auto-detect what we're confident about
       ↓
Layer 2: Ask user to confirm/correct ambiguous associations
       ↓
Layer 3: Remember user's choice for future runs
```

### Solution Options

#### Option A: Pre-Association at Meeting Level

**Concept:** Before workflows run, establish object associations on the meeting record itself.

**How it works:**
1. When meeting is recorded, automatically detect associated HubSpot objects
2. Show associations in meeting sidebar (Contact: John, Company: Acme, Deal: ?)
3. User can confirm/correct before or after the call
4. Workflow uses confirmed associations

**Pros:**
- User control at the right moment (before data flows)
- Single source of truth for associations
- Works for all object types

**Cons:**
- Requires new UI on meeting page
- Extra step for users
- What if they forget to associate?

**Recommended for:** High-stakes workflows where accuracy is critical

---

#### Option B: Association Node in Workflow

**Concept:** Add an explicit "Find Object" step that resolves the association with configurable rules.

**How it works:**
```
Trigger: New Meeting
    ↓
Find Contact (by: attendee email) → outputs: contact_id
    ↓
Find Company (by: contact's company) → outputs: company_id
    ↓
Find Deal (by: company + pipeline + rules) → outputs: deal_id
    ↓
Update Deal Properties (using: deal_id)
```

**Configuration UI for "Find Deal" node:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Find Deal                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Match by:                                                       │
│  ┌──────────────────────────────────────────────────┐           │
│  │ Company + Pipeline + Stage Range        [▾]      │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  Pipeline: [New Business ▾]                                      │
│  Stage: [Demo Completed] to [Negotiation]                       │
│                                                                  │
│  If multiple deals match:                                        │
│  (●) Use most recently modified                                  │
│  ( ) Use deal with most meeting overlap                          │
│  ( ) Use AI to select best match                                 │
│  ( ) Pause and ask user to select                                │
│                                                                  │
│  If no deals match:                                              │
│  ( ) Create new deal                                             │
│  (●) Skip this workflow run                                      │
│  ( ) Use fallback deal: [___________]                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Explicit, visible, configurable
- User understands exactly what's happening
- Composable — chain multiple "Find" nodes
- Works for any object type

**Cons:**
- More nodes = more complexity
- Slows down first-time setup

**Recommended for:** Power users, complex workflows

---

#### Option C: Association Rules in Property Config

**Concept:** Within the property configuration UI, define association context inline.

**How it works:**
```
┌─────────────────────────────────────────────────────────────────┐
│ HubSpot Agent Configuration                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Target Object: [Deal ▾]                                        │
│                                                                  │
│  ─── Association Settings ───────────────────────────────────   │
│                                                                  │
│  How to find the right deal:                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Match meeting attendees → HubSpot Contact → Deal  [▾]  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Filter to pipeline: [New Business ▾]                           │
│  Filter to stages: [All active stages ▾]                        │
│                                                                  │
│  If multiple matches:                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Most recent activity                              [▾]  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [x] Show preview before syncing (see matched object)           │
│                                                                  │
│  ─── Properties to Update ───────────────────────────────────   │
│  ... (existing config) ...                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Integrated into existing config flow
- Doesn't require additional workflow nodes
- "Association" is clearly part of the setup

**Cons:**
- Adds complexity to already-complex config UI
- Rules are hidden inside config (not visible in workflow canvas)

**Recommended for:** Standard use cases, simpler workflows

---

#### Option D: Smart Defaults + Preview/Confirm

**Concept:** Auto-match with high confidence, but always show what will be updated before executing.

**How it works:**
1. System attempts to auto-match using best-effort heuristics
2. Before syncing, show preview:
   ```
   ┌──────────────────────────────────────────────────────────┐
   │ Pre-Sync Preview                                         │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │  Meeting: Discovery Call with John @ Acme Corp           │
   │                                                          │
   │  Matched Objects:                                        │
   │  ├─ Company: Acme Corporation (98% confidence)    [✓]   │
   │  ├─ Contact: John Smith (100% confidence)          [✓]   │
   │  └─ Deal: Acme - Enterprise Renewal (72% conf.)   [✓]   │
   │           ↳ 2 other possible deals [show options]        │
   │                                                          │
   │  Properties to Update:                                   │
   │  ├─ Next Step: "Send proposal" → Deal                   │
   │  ├─ Probability: 40% → 65% → Deal                       │
   │  └─ Last Touch: 2026-01-09 → Contact                    │
   │                                                          │
   │        [Cancel]  [Edit Matches]  [Confirm & Sync]       │
   │                                                          │
   └──────────────────────────────────────────────────────────┘
   ```
3. User can:
   - Confirm (proceed with matched objects)
   - Edit (swap to different object)
   - Cancel (abort sync)

**Pros:**
- Transparent — user sees exactly what will happen
- Correctable — user can fix mistakes before they happen
- Confidence scores build trust

**Cons:**
- Requires user interaction (not fully automated)
- May slow down high-volume use cases

**Recommended for:** Building initial trust, skeptic users, new customers

---

## Recommended Approach: Hybrid Model

Based on the jury feedback (50.6% pass rate, major concerns about visibility and control), I recommend a **layered approach**:

### MVP (Address Critical Trust Issues)

1. **Default to Option D (Preview/Confirm)** for all object associations
   - Always show matched objects before syncing
   - Display confidence scores
   - Allow one-click correction

2. **Implement Option C (Inline Association Config)** for power users
   - Let users define matching rules in config
   - Option to skip preview for trusted configurations

### Future Iterations

3. **Add Option B (Association Nodes)** for complex workflows
   - Separate "Find Deal" / "Find Contact" nodes
   - Visual representation in workflow canvas

4. **Implement Option A (Pre-Association)** for enterprise
   - Association sidebar on meeting page
   - Admin-controlled association workflows

---

## Association Patterns for Each Object Type

### Deals

```javascript
const dealAssociationStrategy = {
  // Step 1: Start from meeting
  fromMeeting: async (meetingId) => {
    const attendees = await getExternalAttendees(meetingId);
    const contacts = await matchToHubSpotContacts(attendees);
    const companies = await getCompaniesFromContacts(contacts);
    const deals = await getDealsFromCompanies(companies);
    return deals;
  },
  
  // Step 2: Filter candidates
  filterCandidates: (deals, config) => {
    return deals.filter(d => 
      d.pipeline === config.pipeline &&
      d.probability >= config.minProbability &&
      d.probability <= config.maxProbability &&
      config.stages.includes(d.stage)
    );
  },
  
  // Step 3: Rank and select
  rankCandidates: (deals, meeting) => {
    return deals.map(deal => ({
      ...deal,
      score: calculateMatchScore(deal, meeting),
      reasons: explainScore(deal, meeting)
    })).sort((a, b) => b.score - a.score);
  },
  
  // Step 4: Decision
  selectDeal: (rankedDeals, config) => {
    const top = rankedDeals[0];
    
    if (rankedDeals.length === 1) {
      return { deal: top, confidence: 0.95, needsConfirmation: false };
    }
    
    if (top.score > 0.9 && rankedDeals[1].score < 0.5) {
      return { deal: top, confidence: 0.85, needsConfirmation: false };
    }
    
    // Multiple close matches — need user input
    return { 
      deal: top, 
      confidence: top.score, 
      needsConfirmation: true,
      alternatives: rankedDeals.slice(1, 4)
    };
  }
};
```

### Contacts

```javascript
const contactAssociationStrategy = {
  fromMeeting: async (meetingId) => {
    const attendees = await getExternalAttendees(meetingId);
    return Promise.all(attendees.map(async (attendee) => {
      const contact = await findHubSpotContactByEmail(attendee.email);
      return {
        attendee,
        hubspotContact: contact,
        confidence: contact ? 1.0 : 0
      };
    }));
  },
  
  // For meetings with multiple external attendees
  selectPrimaryContact: (matches, config) => {
    if (config.primaryContactRule === 'first_speaker') {
      // Use transcript to identify first external speaker
    }
    if (config.primaryContactRule === 'calendar_organizer') {
      // Use calendar event organizer
    }
    // Default: use first attendee
    return matches[0];
  }
};
```

### Companies

```javascript
const companyAssociationStrategy = {
  fromMeeting: async (meetingId) => {
    const attendees = await getExternalAttendees(meetingId);
    const domains = extractDomainsFromEmails(attendees);
    const companies = await findHubSpotCompaniesByDomains(domains);
    return companies.map(c => ({
      company: c,
      confidence: 1.0 // Domain match is high confidence
    }));
  },
  
  // For meetings with multiple companies
  selectPrimaryCompany: (companies, config) => {
    if (config.primaryCompanyRule === 'most_attendees') {
      // Count attendees per company domain
    }
    if (config.primaryCompanyRule === 'existing_relationship') {
      // Prefer company with existing deals/history
    }
    return companies[0];
  }
};
```

### Custom Objects

```javascript
const customObjectAssociationStrategy = {
  // Custom objects require explicit association definition
  defineAssociation: (objectType, config) => {
    return {
      // How to find candidates
      searchCriteria: config.searchFilters, // e.g., { property: 'related_company', operator: 'equals', value: '{{company_id}}' }
      
      // Which field links to standard objects
      associationField: config.associationProperty, // e.g., 'company__c'
      associationObjectType: config.associationObjectType, // e.g., 'company'
      
      // How to select when multiple match
      selectionRule: config.selectionRule // e.g., 'most_recent', 'ai_select', 'ask_user'
    };
  },
  
  fromMeeting: async (meetingId, associationConfig) => {
    // First, resolve the associated standard object
    const standardObject = await resolveStandardAssociation(
      meetingId, 
      associationConfig.associationObjectType
    );
    
    if (!standardObject) return [];
    
    // Then, search for custom objects linked to it
    return searchCustomObjects(
      associationConfig.objectType,
      {
        ...associationConfig.searchCriteria,
        [associationConfig.associationField]: standardObject.id
      }
    );
  }
};
```

---

## Configuration UI Proposal

### Step 1: Object Type Selection (with Association Hints)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HubSpot Agent Configuration                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  What do you want to update after each call?                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🏢 Company                                                  │   │
│  │  Matched via: attendee email domains                         │   │
│  │  Confidence: Usually high (single match)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  👤 Contact                                                  │   │
│  │  Matched via: attendee email address                         │   │
│  │  Confidence: High (direct email match)                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  💰 Deal                                            [SELECT] │   │
│  │  Matched via: company → active deals                         │   │
│  │  Confidence: Varies (may have multiple deals)                │   │
│  │  Tip: Configure pipeline filters to improve matching         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ⚙️ Custom Object                                            │   │
│  │  Matched via: configurable association rules                 │   │
│  │  Requires: association field definition                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2: Association Configuration (for Deals)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Deal Association Settings                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔗 How to find the deal                                            │
│                                                                      │
│  Start from: ● Meeting attendees → Company → Deals                  │
│              ○ Meeting attendees → Contact → Deals                  │
│              ○ Specific company: [______________] (for testing)     │
│                                                                      │
│  ─── Filters (narrow down candidates) ───────────────────────────   │
│                                                                      │
│  Pipeline: [New Business ▾] [Upsell ▾] [+ Add]                      │
│                                                                      │
│  Deal Stage: [Any stage ▾]                                          │
│  ○ Only active stages (probability 1-99%)                           │
│  ● Custom range: [10%] to [90%]                                     │
│                                                                      │
│  Deal Type: [All types ▾]                                           │
│                                                                      │
│  ─── Multiple Match Resolution ──────────────────────────────────   │
│                                                                      │
│  When multiple deals match, use:                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  🤖 AI Selection (considers attendees, timing, deal stage)   │  │
│  │  📊 Most Recent Activity (last modified deal)                │  │
│  │  👥 Best Contact Match (most overlapping attendees)          │  │
│  │  ⏸️ Pause & Ask Me (manual selection each time)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ─── Preview & Confirmation ─────────────────────────────────────   │
│                                                                      │
│  [x] Show preview before syncing (recommended)                      │
│  [ ] Auto-sync if confidence > [85%]                                │
│                                                                      │
│                              [Continue →]                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 3: No Match Handling

```
┌─────────────────────────────────────────────────────────────────────┐
│ What if no deal matches?                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  If no deals match the criteria above:                              │
│                                                                      │
│  ● Skip this meeting (don't update anything)                        │
│  ○ Create a new deal with template: [___________]                   │
│  ○ Use fallback deal ID: [___________]                              │
│  ○ Notify me in Slack: [#sales-ops ▾]                               │
│                                                                      │
│  [Advanced: Custom fallback logic via prompt]                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Recommendations

### Phase 1: Foundation (MVP)

1. **Refactor `searchDealsWithAi` into composable functions**
   - `findCandidates(meeting, objectType, filters)`
   - `rankCandidates(candidates, meeting)`
   - `selectBestMatch(rankedCandidates, config)`

2. **Add transparency layer**
   - Return `{ selected, confidence, alternatives, reasoning }`
   - Store selection decision in workflow run for audit

3. **Implement preview mode**
   - New API endpoint: `POST /api/hubspot/preview-sync`
   - Returns matched objects + proposed changes without executing

4. **Add to config UI**
   - Association settings section (per Option C above)
   - Preview toggle

### Phase 2: Enhanced Matching

1. **Extend to all standard object types**
   - Company association (simple)
   - Contact association (with multi-attendee handling)
   - Meeting association (time-based matching)

2. **Add association nodes for workflows** (Option B)
   - `FindDeal`, `FindContact`, `FindCompany` as workflow actions
   - Outputs available to downstream nodes

3. **Improve AI selection**
   - Add user feedback loop (was this the right deal? Y/N)
   - Train on historical corrections

### Phase 3: Custom Objects & Enterprise

1. **Custom object association builder**
   - Define association field
   - Define search criteria template
   - Test with sample data

2. **Pre-association on meeting page** (Option A)
   - Association sidebar
   - Admin configuration for auto-association rules

3. **Batch association management**
   - View/edit associations across multiple meetings
   - Bulk correction tools

---

## Open Questions

1. **Should associations be stored on the meeting record?**
   - Pro: Reusable across workflows, auditable
   - Con: More data to manage, sync complexity

2. **What's the right default for "multiple match" scenarios?**
   - AI selection is convenient but opaque
   - "Ask user" is safe but adds friction
   - Most recent is deterministic but may not be correct

3. **How do we handle custom objects with no standard association pattern?**
   - Require explicit configuration?
   - Infer from HubSpot association definitions?
   - Prompt-based dynamic association?

4. **Performance: Is previewing every sync too slow for high-volume users?**
   - Consider: batch preview, async preview, confidence-based auto-skip

---

## Next Steps

1. [ ] Review with engineering: feasibility of composable association functions
2. [ ] Prototype the association config UI in Storybook
3. [ ] Test preview/confirm flow with 3-5 users
4. [ ] Gather more data on custom object usage patterns
5. [ ] Define metrics for association accuracy

---

_This research directly addresses the jury feedback about "Configuration complexity" (248 mentions) and "Testing before go-live" (248 mentions) by making associations explicit, transparent, and previewable._

