# Release Lifecycle System Integration Audit

## Overview

This document audits how the new release lifecycle (Alpha → Invite-only Beta → Open Beta → GA) integrates with the existing Product System in Notion and Linear.

**Audit Date:** January 14, 2026  
**Owner:** Tyler Sahagun

Companion worksheet: `pm-workspace-docs/initiatives/release-lifecycle-process/feature-flag-categorization.md`

---

## Current State Analysis

### 1. Notion Project Phases (Development Lifecycle)

The existing **Project Phase** property tracks _development work_:

```
Discovery → Definition → Build → Test → Done
```

This is **development-focused** — it answers "what stage of building is this?"

### 2. Product Areas Status

The **Product Areas** database has a Status field:

- Live
- Beta
- Coming Soon
- Deprecated

This is closer to release stage but is applied to the _product area_, not individual features.

### 3. New Release Lifecycle (Customer Availability)

The new release lifecycle tracks _customer availability_:

```
Alpha → Invite-only Beta → Open Beta → GA
```

This is **release-focused** — it answers "who can use this and how?"

---

## Gap: Two Different Dimensions

**Project Phase** and **Release Stage** are orthogonal:

| Project Phase | Release Stage    | Example                                             |
| ------------- | ---------------- | --------------------------------------------------- |
| Build         | Alpha            | Privacy Agent being developed, internal testing     |
| Test          | Invite-only Beta | Privacy Agent feature-complete, invite-only testing |
| Done          | Open Beta        | Privacy Agent shipped, opt-in via Early Access      |
| Done          | GA               | Privacy Agent is core feature                       |

A project can be "Done" from a development perspective but still in "Beta" from a release perspective.

---

## Recommendations

### 1. Add "Release Stage" Property to Projects Database

**Action:** Create new Select property in Projects database

| Property      | Type   | Values                                                 |
| ------------- | ------ | ------------------------------------------------------ |
| Release Stage | Select | Alpha, Invite-only Beta, Open Beta, GA, Not Applicable |

**Default:** "Not Applicable" (for internal projects, tech debt, etc.)

**Automation:** When Project Phase = "Done", prompt to set Release Stage

### 2. Update Product System Guide

Add section explaining the distinction:

```markdown
## Development vs Release Lifecycle

### Project Phase (Development)

Tracks engineering progress: Discovery → Definition → Build → Test → Done

### Release Stage (Customer Availability)

Tracks who can use it: Alpha → Invite-only Beta → Open Beta → GA

A project is "Done" when engineering work completes.
A feature reaches "GA" when it's available to all users without badges.
```

### 3. Add Release Stage to GTM Plans

**Current fields:**

- Launch Tier (P0-P3)
- Status

**Add:**

- Current Release Stage (relation to what's live now)
- Target Release Stage (what stage will this launch achieve)

### 4. Update Product Areas Database

**Current Status options:** Live, Beta, Coming Soon, Deprecated

**Recommended Status options:**

- Alpha (internal only)
- Invite-only Beta
- Open Beta (opt-in)
- Live (GA, no badge)
- Deprecated

This aligns Product Areas with the release lifecycle.

---

## Linear Integration

### Current Linear State

- Projects in Linear are for engineering work
- No explicit release stage tracking
- Milestones exist but aren't standardized

### Recommended Linear Labels

Create a **Release Stage** label group:

| Label               | Color  | Description        |
| ------------------- | ------ | ------------------ |
| `stage:alpha`       | Cyan   | Internal testing   |
| `stage:invite-beta` | Indigo | Invite-only beta   |
| `stage:open-beta`   | Indigo | Open beta (opt-in) |
| `stage:ga`          | Gray   | Core feature       |

### Linear Milestones for Release

Create standardized milestones for each project:

```
[Project Name] - Alpha Ready
[Project Name] - Invite-only Beta Ready
[Project Name] - Open Beta Ready
[Project Name] - GA Ready
```

Each milestone has exit criteria (see below).

---

## "Release Ready" Definitions

### Alpha Ready

| Criteria                   | Required | Owner       |
| -------------------------- | -------- | ----------- |
| Feature works end-to-end   | ✓        | Engineering |
| Behind feature flag        | ✓        | Engineering |
| Internal documentation     | ✓        | Product     |
| "How it works" dialog copy | ✓        | Product     |
| Error handling in place    | ✓        | Engineering |
| Basic analytics tracking   | ✓        | Engineering |

**Who can access:** Internal team only (via feature flag)

### Invite-only Beta Ready

| Criteria                               | Required | Owner       |
| -------------------------------------- | -------- | ----------- |
| All Alpha criteria                     | ✓        | —           |
| Allowlist conditions added             | ✓        | Engineering |
| Knowledge base article (draft)         | ✓        | Product     |
| Revenue team notified                  | ✓        | Product     |
| Training prepared (if customer-facing) | ✓        | Product     |
| PostHog stage metadata set             | ✓        | Product     |

**Who can access:** Invited customers + internal

### Open Beta Ready (Opt-in)

| Criteria                                           | Required | Owner       |
| -------------------------------------------------- | -------- | ----------- |
| All Invite-only Beta criteria                      | ✓        | —           |
| Knowledge base article published                   | ✓        | Product     |
| Internal training complete                         | ✓        | Product     |
| ≥2 weeks in Invite-only Beta with no critical bugs | ✓        | Engineering |
| Feedback incorporated                              | ✓        | Product     |
| GTM Plan created                                   | ✓        | Product     |
| Badge displays correctly in UI                     | ✓        | Engineering |

**Who can access:** Any user who opts in via Early Access

### GA Ready

| Criteria                                    | Required | Owner       |
| ------------------------------------------- | -------- | ----------- |
| All Open Beta criteria                      | ✓        | —           |
| ≥2 weeks in Open Beta with no critical bugs | ✓        | Engineering |
| Customer feedback positive                  | ✓        | Product     |
| GTM launch activities complete              | ✓        | Marketing   |
| Release notes published                     | ✓        | Product     |
| Badge removed                               | ✓        | Engineering |
| Feature flag removed from code              | ✓        | Engineering |

**Who can access:** All users (core feature)

---

## TTL Summary

| Stage            | Max Duration | What Happens at Expiry                                     |
| ---------------- | ------------ | ---------------------------------------------------------- |
| Alpha            | 90 days      | Review: progress to Invite-only Beta or deprecate          |
| Invite-only Beta | 60 days      | Review: progress to Open Beta or extend with justification |
| Open Beta        | 90 days      | Review: progress to GA or extend with justification        |
| GA               | Permanent    | —                                                          |

---

## Documentation Requirements by Stage

| Document                   | Alpha | Invite-only Beta | Open Beta | GA       |
| -------------------------- | ----- | ---------------- | --------- | -------- |
| Internal Notion doc        | ✓     | ✓                | ✓         | ✓        |
| "How it works" dialog      | ✓     | ✓                | ✓         | —        |
| Knowledge base (draft)     | —     | ✓                | ✓         | —        |
| Knowledge base (published) | —     | —                | ✓         | ✓        |
| Release notes              | —     | —                | ✓         | ✓        |
| Internal training          | —     | ✓                | ✓         | —        |
| Customer comms             | —     | Optional         | Optional  | If P1/P2 |

---

## Communication Matrix

| Stage Transition   | Notify                | Channel                    | Timing        |
| ------------------ | --------------------- | -------------------------- | ------------- |
| → Alpha            | Engineering Slack     | #engineering               | Same day      |
| → Invite-only Beta | Revenue team          | #product-updates + meeting | Same day      |
| → Open Beta        | All teams             | #product-updates + meeting | 1 week before |
| → GA               | All teams + customers | Slack + email + in-app     | Coordinated   |

---

## Proposed Notion Schema Changes

### Projects Database

Add properties:

```
Release Stage (Select)
  - Alpha
  - Invite-only Beta
  - Open Beta
  - GA
  - Not Applicable

Release Stage Updated (Date)
  - Auto-set when Release Stage changes

TTL Warning (Formula)
  - Calculates days remaining based on stage
```

### Product Areas Database

Update Status options:

```
Current: Live, Beta, Coming Soon, Deprecated
New: Alpha, Invite-only Beta, Open Beta, Live, Deprecated
```

### GTM Plans Database

Add properties:

```
Current Release Stage (Select)
Target Release Stage (Select)
```

---

## Next Steps

1. [ ] **Notion Updates**

   - Add Release Stage property to Projects database
   - Update Product Areas status options
   - Update GTM Plans schema

2. [ ] **Linear Setup**

   - Create stage:\* label group
   - Define milestone templates

3. [ ] **Product System Guide Update**

   - Add release lifecycle section
   - Update checklists with release criteria

4. [ ] **Team Training**

   - Revenue team on release stages
   - Engineering on milestone requirements
   - Marketing on launch coordination

5. [ ] **Prototype to Production**
   - Ship Beta Features UI from v4 prototype
   - Implement stage badges in product

---

## Appendix: Comparison Table

| Dimension        | What it Tracks           | Owner       | Location         |
| ---------------- | ------------------------ | ----------- | ---------------- |
| Project Phase    | Development progress     | Engineering | Notion Projects  |
| Release Stage    | Customer availability    | Product     | Notion Projects  |
| Linear Milestone | Engineering deliverables | Engineering | Linear           |
| GTM Launch Tier  | Marketing investment     | Marketing   | Notion GTM Plans |
| PostHog Stage    | Feature flag metadata    | Product     | PostHog          |

---

_Last Updated: January 14, 2026_  
_Owner: Tyler Sahagun_
