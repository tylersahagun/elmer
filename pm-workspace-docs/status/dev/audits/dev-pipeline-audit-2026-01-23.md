# Development Pipeline Integration Audit

**Generated:** 2026-01-23 20:00
**Type:** Full System Test & Gap Analysis

---

## Executive Summary

| Category           | Status         | Score |
| ------------------ | -------------- | ----- |
| Linear Sync        | ⚠️ Partial     | 40%   |
| GitHub Sync        | ❌ Not Working | 10%   |
| Initiative Mapping | ❌ Misaligned  | 30%   |
| Overall System     | ⚠️ Needs Work  | 25%   |

**Bottom Line:** The framework is in place, but **critical mapping misalignment** between PM initiatives and engineering's actual Linear projects makes the system ineffective. GitHub integration requires engineering process changes that haven't been adopted.

---

## Test Results

### 1. Linear Sync Test

**Cycle 79** (Jan 13 - Jan 27, 2026)

- Progress: **28%** (14/50 issues completed)
- Days Remaining: 4
- Team: Development (ASK)

**In-Progress Issues Found:** 14

| Issue    | Title                              | Assignee | Project                |
| -------- | ---------------------------------- | -------- | ---------------------- |
| ASK-4592 | Global Chat first time experience  | Skylar   | -                      |
| ASK-4583 | BBL (Internal CLI POC)             | Matt     | -                      |
| ASK-4575 | Engagement card re-design          | Adam     | -                      |
| ASK-4568 | HubSpot app card poc               | Palmer   | -                      |
| ASK-4549 | Context window bug                 | Palmer   | -                      |
| ASK-4532 | User registry for admin onboarding | Jason    | -                      |
| ASK-4527 | Copy engagements to workspace      | Jason    | -                      |
| ASK-4525 | WORKFLOW_DETAIL page context       | Dylan    | **Global Chat**        |
| ASK-4515 | My day view                        | Adam     | -                      |
| ASK-4477 | Condensed chat input UX            | Skylar   | **Global Chat**        |
| ASK-4350 | Cursor commands for elephant-ai    | Kaden    | -                      |
| ASK-4290 | Switch monorepo to pnpm            | Kaden    | -                      |
| ASK-4038 | Mobile recording failed            | Eduardo  | -                      |
| ASK-3923 | Desktop engagement UI              | -        | **Engagement Capture** |

**Finding:** Only **3 of 14** in-progress issues (21%) are assigned to Linear projects. The rest have NO project assignment.

---

### 2. GitHub Sync Test

**Merged PRs (Last 48 hours):** 30

**Top Contributors:**

- Matt (mnox): 7 PRs
- Eduardo (egueiros): 7 PRs
- Adam (aoshumway8): 2 PRs
- Dylan (DyShallow): 2 PRs
- Kaden (kdawgwilk): 4 PRs
- Palmer (PalmerTurley34): 3 PRs
- Jason (jasonharmongit): 1 PR
- Dependabot: 6 PRs

**Label Usage:**
| Label | Count |
|-------|-------|
| `initiative:*` | **0** |
| `dependencies` | 6 (dependabot) |
| `javascript` | 6 (dependabot) |
| No labels | 24 |

**Branch Naming Analysis:**
| Pattern | Count | Example |
|---------|-------|---------|
| `ASK-XXXX-*` | 8 | `ASK-4591-engagements-card-queries` |
| `user/feature-*` | 12 | `dylan/voiceprint-pt-1`, `eduardo/mobile-push-fix` |
| `feat/*` | 0 | - |
| `fix/*` | 0 | - |

**Finding:** **Zero PRs** use our initiative label or branch naming conventions.

---

### 3. Initiative Mapping Analysis

#### Our Mapped Initiatives vs. Reality

| PM Initiative           | Mapped To Linear Project | Active Issues | Match?           |
| ----------------------- | ------------------------ | ------------- | ---------------- |
| internal-search         | Search & Discovery       | **0**         | ❌ Wrong project |
| hubspot-agent-config-ui | HubSpot Integration      | ~5            | ⚠️ Partial       |
| universal-signal-tables | Universal Signals        | **1**         | ⚠️ Stale         |
| call-import-engine      | Call & Data Imports      | ~3            | ✅ Valid         |
| crm-exp-ete             | CRM Agent Upgrades       | ~10           | ✅ Valid         |
| admin-onboarding        | Admin Onboarding         | ~3            | ✅ Valid         |
| settings-redesign       | Workspace Settings       | ~5            | ⚠️ Partial       |

#### Linear Projects WITH Active Work But NO Initiative

| Linear Project              | Active Issues | Assignees            | Status         |
| --------------------------- | ------------- | -------------------- | -------------- |
| **Global Chat**             | 10+           | Dylan, Skylar, Bryan | 🔴 NOT MAPPED  |
| **Engagement Capture**      | 5+            | Eduardo              | 🔴 NOT MAPPED  |
| **SSO & User Provisioning** | 5+            | Kaden                | 🔴 NOT MAPPED  |
| **(No Project)**            | ~11           | Various              | 🔴 UNTRACKABLE |

**Critical Finding:** The most active engineering work (Global Chat) has **no corresponding PM initiative**.

---

## Gap Analysis

### Critical Gaps

#### 1. Initiative ↔ Linear Project Mismatch (SEVERITY: HIGH)

**Problem:** We mapped PM initiatives to Linear projects that don't match where engineers actually track work.

**Evidence:**

- `internal-search` → "Search & Discovery" has 0 active issues
- Actual search/chat work is in "Global Chat" project (05066db9)
- We don't have a "Global Chat" initiative

**Impact:** Cannot track what engineering is actually building

**Fix:**

1. Create new initiative: `global-chat` mapped to project `05066db9-89d7-432c-bffd-234ca92af024`
2. Consider merging `internal-search` into it
3. Audit all mappings against active Linear projects

#### 2. Low Project Assignment Rate (SEVERITY: HIGH)

**Problem:** Engineers don't consistently assign issues to Linear projects.

**Evidence:**

- Only 21% of in-progress issues have project assignments
- Most work happens without project context

**Impact:** Even with correct mappings, most work is invisible

**Fix:**

1. Short-term: Use team + label heuristics for grouping
2. Medium-term: Work with engineering to improve project hygiene
3. Long-term: Consider Linear project as optional, use labels/milestones instead

#### 3. GitHub Label Convention Not Adopted (SEVERITY: MEDIUM)

**Problem:** Engineers aren't using `initiative:*` labels on PRs.

**Evidence:**

- 0% adoption after implementation
- No communication to engineering team

**Impact:** Cannot track shipped work by initiative

**Fix:**

1. **Alternative approach:** Use Linear issue ID in branch names to reverse-lookup
   - Branch `ASK-4591-*` → Linear issue ASK-4591 → Project → Initiative
   - This requires NO process changes from engineering
2. Add label automation via GitHub Actions
3. Or accept low mapping rate and focus on other metrics

#### 4. Branch Naming Mismatch (SEVERITY: LOW)

**Problem:** Engineers use `user/feature` or `ASK-XXXX-*` patterns, not `feat/initiative-*`.

**Evidence:**

- 0 branches match our convention
- Existing pattern (`ASK-XXXX-*`) actually contains useful data

**Impact:** Cannot use branch prefix matching

**Fix:**

- **Use what exists:** Parse `ASK-XXXX` from branch names and resolve via Linear API
- This is more reliable than asking engineers to change behavior

---

## Recommendations

### Immediate Actions (This Week)

1. **Fix Internal Search Mapping**

   ```
   Current: internal-search → Search & Discovery (aa8ce4dd)
   Should be: internal-search → Global Chat (05066db9)
   ```

2. **Create Missing Initiative**

   - Create `global-chat` initiative
   - Link to Linear project: `05066db9-89d7-432c-bffd-234ca92af024`
   - Map existing `internal-search` research to it

3. **Update Sync Strategy**
   - Accept that most issues won't have projects
   - Build "unlinked work" as a visible category
   - Use Linear issue references in branches for reverse mapping

### Short-Term (Next 2 Weeks)

4. **Add Reverse Mapping Logic**

   - Parse `ASK-XXXX` from branch names
   - Call Linear API to get project
   - Auto-associate PRs with initiatives

5. **Simplify GitHub Requirements**

   - Remove `initiative:*` label requirement (low adoption)
   - Focus on automated mapping via Linear refs
   - Keep branch prefix as optional enhancement

6. **Communicate with Engineering**
   - Don't mandate new processes
   - Ask for feedback on what they'd actually use
   - Consider their existing workflows

### Medium-Term (Next Month)

7. **Add Visibility Dashboard**

   - Show work by initiative (where mapped)
   - Show unlinked work (majority of activity)
   - Track mapping coverage over time

8. **Automate Status Generation**
   - GitHub Action to run `/sync-dev` daily
   - Post to Slack or save to status folder
   - No manual invocation required

---

## Revised Architecture

Based on findings, here's how the system should actually work:

```
┌─────────────────────────────────────────────────────────────┐
│                     REALITY CHECK                          │
├─────────────────────────────────────────────────────────────┤
│ What works:                                                 │
│ ├── Linear API access ✅                                   │
│ ├── Cycle progress tracking ✅                             │
│ ├── GitHub API access ✅                                   │
│ └── Basic PR listing ✅                                    │
├─────────────────────────────────────────────────────────────┤
│ What doesn't work:                                          │
│ ├── Initiative → Linear mapping (wrong projects)           │
│ ├── PR labels (0% adoption)                                │
│ ├── Branch prefixes (not used)                             │
│ └── Most issues untracked (no project)                     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   REVISED APPROACH                          │
├─────────────────────────────────────────────────────────────┤
│ 1. FIX MAPPINGS                                            │
│    - Audit Linear projects that have active work           │
│    - Create/update initiatives to match                    │
│                                                             │
│ 2. USE EXISTING SIGNALS                                     │
│    - Branch names contain ASK-XXXX references              │
│    - Linear issues have project assignments (sometimes)     │
│    - Reverse-lookup: PR → branch → ASK-ID → Linear → Init  │
│                                                             │
│ 3. ACCEPT PARTIAL COVERAGE                                 │
│    - Not all work will be mapped                           │
│    - "Unlinked" is a valid category                        │
│    - Focus on what IS visible, not perfection              │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix: Raw Data

### Active Linear Projects (with recent work)

| Project                 | ID                                   | State   | Teams    |
| ----------------------- | ------------------------------------ | ------- | -------- |
| Global Chat             | 05066db9-89d7-432c-bffd-234ca92af024 | started | VAN, ASK |
| CRM Agent Upgrades      | 2f33a114-1968-4240-990b-ba3fe02c23be | started | VAN, ASK |
| Engagement Capture      | 91b41c27-bcb3-4b6a-919d-93d686ab15c1 | backlog | ASK      |
| SSO & User Provisioning | a8095485-ee29-41b5-9111-f052759a9622 | started | VAN, ASK |
| Admin Onboarding        | fb8f1181-d633-4220-a9a7-c1ce8ba11643 | backlog | ASK      |
| HubSpot Integration     | a647b6d3-7a49-4cad-9c64-708897016408 | started | EPD      |

### Team Reference

| Team                | Key | ID                                   |
| ------------------- | --- | ------------------------------------ |
| Development         | ASK | 2b25052e-675d-4530-90c6-f2b6085d15e2 |
| Vanguard            | VAN | 51c213c2-9404-4fc8-846a-22c456fc2691 |
| Core Experience     | CEX | ab724e37-e2b5-48a2-91dd-cfb11d648e09 |
| Product             | EPD | ff631bc1-8b68-4900-937f-969fe4a3b532 |
| Customer Experience | CX  | c3d0dc92-5e37-4f71-9c0d-7fc9f5dfac0d |
| IT                  | IT  | 943a02c9-a455-4167-beca-d4349b3c8fc3 |
