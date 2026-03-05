---
title: "User Cohorting by Job Title"
updated_at: "2026-01-27"
owner: "pm"
source: "personas/archetypes + company-context/personas.md"
---

# User Cohorting by Job Title (Persona-Informed)

## Purpose
Create a consistent, persona-aligned way to bucket users by job title so we can understand who is using AskElephant and why.

This is grounded in our core personas:
- Sales Representative
- Sales Leader
- Customer Success Manager
- Operations / Technical Evaluator (RevOps, Sales Ops, CRM Admin)
- Strategic Consultant / Subject Matter Expert

## Primary Cohorts (Persona Mapped)

### 1) Sales Rep (Individual Contributor)
**Persona:** Sales Representative  
**Common titles:** Account Executive, AE, SDR, BDR, Sales Development Rep, Inside Sales Rep, SMB AE, Mid-Market AE, Enterprise AE, Field Sales Rep

### 2) Sales Leader
**Persona:** Sales Leader  
**Common titles:** Sales Manager, Director of Sales, VP of Sales, Head of Sales, Head of Revenue, CRO, Head of Sales Development, Regional Sales Manager

### 3) Customer Success
**Persona:** Customer Success Manager  
**Common titles:** CSM, Customer Success Manager, Enterprise CSM, Strategic CSM, Account Manager (CS org), Director of Customer Success

### 4) Operations / RevOps / CRM Admin
**Persona:** Operations / Technical Evaluator  
**Common titles:** RevOps Manager, Sales Ops, Revenue Operations Analyst, GTM Systems Manager, CRM Admin, Salesforce Admin, HubSpot Admin, Operations Manager, Technical Ops

### 5) Strategic Consultant / SME
**Persona:** Strategic Consultant  
**Common titles:** Strategy Lead, Principal Consultant, Solutions Architect, Director of Professional Services, Head of Strategy, Technical Evangelist, AI Lead

## Secondary Cohorts (Non-core but useful)

### 6) Marketing / Growth
**Why:** Often influences revenue workflows, but not primary product persona.
**Common titles:** Demand Gen, Growth Marketing, Marketing Ops, VP Marketing

### 7) Product / Engineering
**Why:** Internal champions, integrations, and configuration support.
**Common titles:** Product Manager, Product Ops, Engineering Manager, Solutions Engineer

### 8) Executive Sponsor
**Why:** Budget authority, adoption approvals.
**Common titles:** CEO, COO, CRO, VP Revenue, VP Sales, GM

### 9) Other / Unknown
**Why:** Catch-all for ambiguous or missing titles.
**Common titles:** "Owner", "Founder", "Consultant", blanks

## Cohorting Rules (Deterministic)

1) Normalize title: lowercase, strip punctuation, expand common abbreviations.
2) Exact matches take precedence over fuzzy matches.
3) If multiple matches, choose the most specific persona (e.g., "revops manager" → Operations over Leader).
4) If no title, assign `Other / Unknown`.

## Example Mapping Keywords

**Sales Rep**
- "account executive", "ae", "sdr", "bdr", "sales development", "inside sales", "sales rep"

**Sales Leader**
- "sales manager", "director of sales", "vp of sales", "head of sales", "cro", "head of revenue"

**Customer Success**
- "customer success", "csm", "account manager", "client success"

**Operations / RevOps**
- "revops", "revenue operations", "sales ops", "crm admin", "salesforce admin", "hubspot admin", "systems"

**Strategic Consultant**
- "consultant", "solutions architect", "strategy", "professional services", "evangelist"

**Marketing / Growth**
- "marketing", "demand gen", "growth", "field marketing", "mops"

**Product / Engineering**
- "product", "engineering", "developer", "solutions engineer"

**Executive Sponsor**
- "ceo", "coo", "cfo", "cto", "vp", "president", "general manager"

## Insights We Can Pull Once Cohorted
- Adoption by persona vs. account size
- Usage depth by persona (sessions, workflows created, CRM updates)
- Retention and expansion by persona (who sticks, who champions)
- Cohort-specific pain points and trust blockers

## Next Step (Data Needed)
To generate the actual list of users and assign cohorts, we need the source of truth for users (PostHog, HubSpot, app DB, CSV export).
