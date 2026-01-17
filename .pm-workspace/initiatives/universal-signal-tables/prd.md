# Universal Signal Tables PRD

## Overview
- **Owner:** Tyler, Skyler
- **Target Release:** Q1 2026
- **Status:** Ready for Development
- **Strategic Pillar:** Data Knowledge, Trend Visibility
- **2026 Initiative:** Workflow Builder / AI Assistant Tool

---

## Outcome Chain

```
Universal Signal Tables enables leaders to create AI-powered columns on engagement data
  → so that they can extract structured insights from calls without manual review
    → so that they make data-driven coaching and strategy decisions
      → so that they improve rep performance and deal outcomes
        → so that quota capacity and win rates increase
```

---

## Problem Statement

Sales leaders have rich conversational data across thousands of calls but no way to systematically extract, filter, and aggregate insights. Currently:

- **Insights are locked in transcripts** requiring manual review or one-off AI queries
- **Signal configuration is burdensome** (2+ hours for complex setups like School AI's 25 annotations)
- **Leaders don't know the question to ask** — they need exploration tools, not pre-built reports
- **RevOps gatekeeping** delays getting new data fields by weeks/months

### Evidence

> "Right now, I cannot tell you which competitor has been brought up the most, if we win or lose, what they like about that competitor." — Woody Klemetson, CEO

> "Every sales leader pretends like they're confident, but they are tiny little kids inside crying for real... I don't know what question to ask on how to help my team convert more deals." — Woody Klemetson, CEO

> "Clay scares people. I hear at least a couple times a week from SDR leaders that they don't know how to use Clay or that Clay is too complicated for anyone to use." — Adia Toll, SDR

- [x] User quotes (from kickoff discussion)
- [x] Leadership direction (Woody sponsoring, Matt as revenue partner)
- [ ] Churn/support data (to be gathered)
- [ ] Competitive pressure (Gong aggregation research needed)

---

## Goals & Non-Goals

### Goals (Measurable)

| Goal | Metric | Target | Timeline |
|------|--------|--------|----------|
| Reduce time to insight | Time from question → answer | < 5 minutes (vs hours/days) | MVP |
| Leader engagement | Weekly active leaders using tables | 50%+ of leader users | 90 days |
| Simplify signal creation | Time to create extraction pattern | < 5 minutes (vs 2+ hours) | MVP |
| Expansion driver | Upsell from tables feature | Track as leading indicator | 6 months |

### Non-Goals (v1)

| Exclusion | Reasoning |
|-----------|-----------|
| External data enrichment (web scraping, CRM pulls) | Prove value with call data first; avoids Clay-direct competition |
| Entity selection beyond engagements | Start simple; companies/deals can come in v2 |
| Dynamic/auto-refreshing data | Cost control; users understand point-in-time snapshots |
| Rep self-service building | This is a leadership tool; reps may consume, not build |
| Dashboard/graph export | Focus on table insights; visualization is v2 |
| More than 5 columns | Constraint forces focus; prevents "scary Clay" complexity |

---

## User Personas

### Primary: Roger the Revenue Leader

- **Job-to-be-done:** Understand patterns across my team's deals to make better coaching and strategy decisions
- **Current pain:** Makes decisions based on emotion and anecdote; can't aggregate call insights; dependent on RevOps for new data fields
- **Success looks like:** Can answer "which competitors come up most?" in 5 minutes instead of never
- **Trust factors:** Needs to see AI's work; won't trust black-box answers; wants to iterate and refine

### Secondary: Otis the RevOps Strategist

- **Job-to-be-done:** Create reliable datasets for analysis without manual data entry
- **Current pain:** Leaders constantly asking for new fields; current signals too complex to configure
- **Success looks like:** Can hand leaders a self-service tool instead of being bottleneck
- **Trust factors:** Cares about data accuracy and consistency; wants to validate before sharing

---

## User Stories

### Epic: Engagement Exploration

**As a** Sales Leader,
**I want to** create a table of my team's engagements with up to 5 AI-extracted columns,
**So that** I can quickly answer questions about patterns across calls without manual review.

**Acceptance Criteria:**
- [ ] Can view list of engagements (calls, meetings) with metadata
- [ ] Can filter by date range, rep, meeting type
- [ ] Can add up to 5 AI columns with custom prompts
- [ ] Column extraction runs on filtered dataset
- [ ] Results persist and can be returned to

---

### Epic: AI-Assisted Building

**As a** Sales Leader,
**I want to** describe what I'm looking for in natural language,
**So that** AI can help me build the right columns and filters without complex configuration.

**Acceptance Criteria:**
- [ ] Chat input accepts natural language questions
- [ ] AI suggests columns and filters based on intent
- [ ] Builder panel shows what AI configured (transparency)
- [ ] Can manually edit AI-generated configuration
- [ ] Can iterate via chat or direct editing

---

### Epic: Conditional Execution

**As a** Sales Leader,
**I want to** run column B only if column A returns a specific value,
**So that** I can focus my analysis and save costs on irrelevant rows.

**Acceptance Criteria:**
- [ ] Can set dependency between columns
- [ ] Column skips execution if condition not met
- [ ] Visual indicator shows execution dependencies
- [ ] Cost savings visible to user (tokens not spent)

---

## Requirements

### Must Have (MVP)

| # | Requirement | Acceptance Criteria |
|---|-------------|---------------------|
| 1 | Engagement table view | Display engagements with metadata (date, rep, meeting type, duration) |
| 2 | Filter panel | Filter by date range, rep, meeting type, keywords |
| 3 | AI column creation (max 5) | User can add column with custom prompt; AI extracts from transcripts |
| 4 | Chat-assisted building | Natural language input → AI generates column/filter configuration |
| 5 | Builder panel (transparency) | Show what AI configured; allow manual editing |
| 6 | Conditional execution | Column B runs only if Column A meets condition |
| 7 | Persistent saves | Tables saved with timestamp; user can return to view |
| 8 | Re-run on new data | User can manually trigger extraction on new engagements (paid) |

### Should Have (Fast Follow)

| # | Requirement | Notes |
|---|-------------|-------|
| 9 | Column templates | Pre-built common extractions (competitors, objections, next steps) |
| 10 | Graduate to signal | Promote ad-hoc column to ongoing signal extraction |
| 11 | Entity grouping | Group engagements by company for roll-up view |
| 12 | Export to CSV | Basic data export for external analysis |

### Could Have (v2+)

| # | Requirement | Notes |
|---|-------------|-------|
| 13 | Companies/Deals as row entity | Full entity-level tables |
| 14 | External enrichment | Web scraping, CRM data pulls |
| 15 | Dashboard/graph creation | Visual outputs from table data |
| 16 | Workflow triggers | "If column = X, trigger action Y" |

---

## User Flows

### Flow: First Table Creation

**Trigger:** Leader clicks "New Table" or types question in chat
**Steps:**
1. Select entity type: Engagements (only option in v1)
2. Apply filters: Date range, rep(s), meeting type
3. Add columns via chat ("I want to know if competitors were mentioned") or manual builder
4. Preview sample results on 3-5 engagements
5. Run full extraction on filtered dataset
6. Review, iterate, save

**Outcome:** Saved table with extracted data ready for analysis
**Error states:** 
- Extraction fails on some rows → Show partial results with error indicators
- No results match filter → Suggest broadening filters
- Token limit reached → Prompt to narrow scope or upgrade

**Trust recovery:** Show AI's work; allow manual correction; explain any failures

---

### Flow: Returning to Saved Table

**Trigger:** Leader opens saved table from list
**Steps:**
1. View saved table with original data (point-in-time)
2. See "last run" timestamp
3. Optional: Click "Run on new data" to process new engagements since last run
4. View updated results alongside original

**Outcome:** Updated table with fresh extractions
**Error states:** 
- Original table definition invalid → Explain what changed, offer to recreate
- No new engagements → Inform user, no cost incurred

---

### Flow: Conditional Column Setup

**Trigger:** User adds column with dependency
**Steps:**
1. Create Column A: "Was a competitor mentioned? (Yes/No)"
2. Create Column B: "Which competitor and what was said about them?"
3. Set Column B dependency: "Only run if Column A = Yes"
4. Visual shows connection between columns
5. On execution, Column B skips rows where Column A = No

**Outcome:** Focused analysis with cost savings
**Trust recovery:** Clear indication of which rows were skipped and why

---

## Trust & Privacy Considerations

| Consideration | Approach |
|---------------|----------|
| **Data access** | Tables use engagement data already captured; no new privacy implications |
| **AI transparency** | Builder panel shows exactly what prompts are running; users can edit |
| **Error visibility** | Partial failures show clearly; users understand what worked vs. didn't |
| **Cost transparency** | Show token usage; conditional execution saves visible |
| **Data freshness** | Clear timestamp on all tables; "stale" vs "fresh" indicators |

---

## Technical Considerations

### Architecture
- Built on existing engagement/transcript infrastructure
- AI columns use same extraction patterns as current signals
- Tables stored as user-owned objects with filter/column configuration
- Extraction jobs queue through existing processing pipeline

### Dependencies
- Engagement data pipeline (existing)
- Transcript access (existing)
- Current Signals extraction infrastructure (extend)
- Global Chat completion (~Jan 9) for chat UI patterns

### Reliability Risks
| Risk | Mitigation |
|------|------------|
| Long extraction times | Show progress; allow background processing |
| Prompt quality variance | Provide templates; surface extraction examples |
| Token cost spikes | Conditional execution; 5-column limit; preview before full run |

---

## Success Metrics

### North Star
**Leaders using tables to make decisions weekly** — Measures actual value delivery

### Leading Indicators
| Metric | Target |
|--------|--------|
| Tables created per leader per week | 2+ |
| Time from table creation to insight | < 5 minutes |
| Column template usage | 40%+ (indicates discoverability) |
| Re-run rate on saved tables | 30%+ (indicates ongoing value) |

### Guardrails (What We Don't Want to Break)
| Metric | Threshold |
|--------|-----------|
| Current Signals usage | No decrease |
| Extraction accuracy | Maintain current levels |
| Page load time | < 2 seconds |

### Trust Metrics
| Metric | Target |
|--------|--------|
| "AI did what I expected" rating | 4+/5 |
| Manual override rate | < 20% (high = AI not trusted) |
| Repeat usage after first table | 60%+ |

---

## Strategic Alignment

- [x] **Outcome chain complete**: Insights → Decisions → Quota capacity
- [x] **Persona validated**: Sales Leader (Roger), RevOps (Otis)
- [x] **Trust implications assessed**: Transparency via builder; no new privacy concerns
- [x] **Not in anti-vision territory**: Not "better notes" — structured insights tool
- [x] **Supports 2026 initiative**: Workflow Builder / AI Assistant Tool
- [x] **Human-centered**: Leaders explore, AI assists — doesn't replace judgment

---

## Competitive Positioning

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Clay | Prospect enrichment; external data; complex | We own engagement data; simpler; call-native |
| Gong/Chorus | Some aggregation; analytics focus | Self-service exploration; real-time column creation |
| HubSpot/Salesforce | Structured reports on CRM data | Extract structure from unstructured conversations |

**Our angle:** "Clay for your own conversations" — but simpler, faster, and no scary complexity.

---

## Open Questions

1. **Pricing model** — Usage-based vs included in tier? Affects adoption.
2. **Template library** — What are the top 10 column templates to ship with MVP?
3. **Graduation path UX** — How does a column become an ongoing signal?
4. **Mobile experience** — Read-only or edit capability on mobile?

---

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Kickoff complete | 2026-01-07 | ✅ |
| Research complete | 2026-01-07 | ✅ |
| PRD complete | 2026-01-07 | ✅ |
| Prototype v1 | 2026-01-08 | 🔄 In Progress |
| Design review | 2026-01-10 | ⬜ |
| Engineering handoff | 2026-01-10 (post-Global Chat) | ⬜ |
| Alpha (internal) | 2026-01-24 | ⬜ |
| Beta (design partners) | 2026-02-07 | ⬜ |
| GA | TBD | ⬜ |

---

*Last updated: 2026-01-07*
*Owner: Tyler, Skyler*
