# External Systems Data Collection Guide

**Purpose:** Document data needs from Linear and GitHub (elephant-ai repo) that cannot be accessed via pm-workspace artifacts.

**Collection Period:** December 2025 - February 2026 (approximately 2-3 months)

**Status:** 🟡 Partial - GitHub complete (automated), Linear needs manual collection

---

## Overview

The pm-workspace repository provides extensive commit history and initiative tracking (analyzed in Plan 01-03). However, two critical data sources remain:

1. **Linear** - Issue assignments, completion patterns, and project tracking
2. **GitHub (elephant-ai repo)** - Product codebase contributions and PR activity

These systems reveal Tyler's actual work allocation between PM activities (pm-workspace) and product development (elephant-ai).

---

## LINEAR DATA NEEDED (DATACOL-09)

### Why This Matters

Linear assignments show:
- What leadership expects Tyler to deliver
- Completion rates (do assignments get done?)
- Time from assignment to completion (velocity)
- Types of work assigned (bugs, features, docs, strategy)
- Project associations (which initiatives Tyler is tied to)

This data validates or contradicts pm-workspace activity patterns.

### How to Collect Linear Data

#### Option 1: Linear Web UI (Recommended)

1. **Navigate to Issues view** in Linear workspace
2. **Filter by assignee:** Select "Tyler" or your user
3. **Filter by date range:**
   - Created date: After December 1, 2025
   - OR Updated date: After December 1, 2025
4. **Export or manually review** the filtered list
5. **Count issues by status:** Backlog, To Do, In Progress, Done, Cancelled

#### Option 2: Linear Search

Use Linear's search with filters:
```
assignee:tyler created:>=2025-12-01
```

Or for updated issues:
```
assignee:tyler updated:>=2025-12-01
```

#### Option 3: Linear API (Advanced)

If you have API access, query:
- Issues assigned to Tyler's user ID
- Filter by `createdAt` or `updatedAt` >= 2025-12-01
- Export fields: title, status, project, labels, created date, updated date, completed date

### Data Collection Template

---

#### LINEAR SUMMARY

**Total issues assigned to Tyler (Dec 1, 2025 - Feb 5, 2026):**

**Breakdown by status:**
- Backlog: X issues
- To Do: X issues
- In Progress: X issues
- Done: X issues
- Cancelled/Won't Do: X issues

**Completion metrics:**
- Completion rate: X% (Done / Total)
- Drop rate: X% (Cancelled / Total)
- In-flight: X issues currently in progress

**Average time to completion:**
- From assignment to "Done": X days (estimate based on sample)
- Fastest completion: X days
- Slowest completion: X days
- Median completion: X days

**Issues by type/label:**
- Bug: X issues
- Feature: X issues
- Documentation: X issues
- Research/Analysis: X issues
- Chore/Maintenance: X issues
- Strategy/Planning: X issues
- Other: X issues

**Issues by project:**
- Project 1 name: X issues
- Project 2 name: X issues
- Project 3 name: X issues
- No project: X issues

**Priority distribution:**
- Urgent: X issues
- High: X issues
- Medium: X issues
- Low: X issues
- No priority: X issues

---

#### LINEAR PATTERN OBSERVATIONS

**Assignment patterns:**
- Who assigns issues to Tyler most frequently?
- Are assignments explicit or inferred (Tyler self-assigns)?
- Do assignments align with PM rubric expectations (execution, insight, vision, influence)?

**Completion patterns:**
- What types of issues get completed fastest?
- What types of issues get dropped/cancelled?
- Evidence of overcommitment (many issues in progress simultaneously)?
- Issues completed vs new issues assigned (accumulation pattern)?

**Time allocation evidence:**
- How much time do Linear issues suggest Tyler spends on product work vs PM work?
- Do issue types match conversation expectations (execution, coordination, strategy)?
- Evidence of scope creep (issues added mid-project)?

**Project association patterns:**
- Is Tyler tied to many projects simultaneously?
- Are project associations clear or ambiguous?
- Do projects in Linear match initiatives in pm-workspace?

---

## GITHUB DATA NEEDED (DATACOL-10)

### Why This Matters

GitHub activity on the **elephant-ai** repository (product codebase) shows:
- Tyler's direct product code contributions
- Time spent in product repo vs pm-workspace repo
- Types of changes (code, docs, config)
- PR review activity (contributing to team)
- Commit frequency (consistent vs bursty)

**Note:** Plan 01-03 analyzed pm-workspace commits (118 commits, Dec-Feb). This focuses on elephant-ai product repo activity to understand code vs PM work ratio.

### How to Collect GitHub Data

#### Option 1: GitHub Web UI

1. **Navigate to elephant-ai repository**
2. **Go to "Insights" → "Contributors"** to see Tyler's commit activity
3. **Filter by date range:** Use date selector or manually review commit list
4. **Go to "Pull Requests"** and filter:
   - Author: Tyler
   - Created: December 1, 2025 - February 5, 2026
5. **Review commit history:**
   - Click on Tyler's profile in Contributors view
   - Review individual commits for type (code, docs, config)

#### Option 2: GitHub Search

Use GitHub's search with filters:
```
repo:askelephant/elephant-ai author:tylersahagun created:>=2025-12-01
```

For PRs:
```
repo:askelephant/elephant-ai author:tylersahagun is:pr created:>=2025-12-01
```

#### Option 3: Git CLI (if elephant-ai repo is cloned)

```bash
# Clone repo if needed
git clone git@github.com:askelephant/elephant-ai.git

# Count Tyler's commits since Dec 1, 2025
git log --author="Tyler" --since="2025-12-01" --oneline | wc -l

# Get detailed commit stats
git log --author="Tyler" --since="2025-12-01" --stat

# See file types changed
git log --author="Tyler" --since="2025-12-01" --name-only | sort | uniq -c | sort -rn
```

### Data Collection Template

---

#### GITHUB (elephant-ai) SUMMARY

**Total commits by Tyler (Dec 1, 2025 - Feb 5, 2026):** 10 direct commits

**Commit frequency:**
- Average commits per week: ~1.5 commits/week (10 commits / 67 days = 9.4 weeks)
- Most active week: Varies (clustered around PR work)
- Least active week: Multiple weeks with no direct commits
- Days with no activity: ~60+ days (commits are PR-driven, not steady)

**Commit distribution over time:**
- December 2025: ~3 commits
- January 2026: ~5 commits
- February 2026 (partial): ~2 commits

**Pull Requests:**
- Total PRs authored: 29 PRs
- PRs merged: 10 PRs (34% merge rate)
- PRs open: 13 PRs (45% still open)
- PRs closed (not merged): 6 PRs (21% closed without merge)

**PR review activity:**
- PRs reviewed (commented/approved): Not collected in this analysis
- PR review comments: Not collected in this analysis

**Types of changes:**
- Code changes (features, integrations): ~65% (19 PRs with feat/fix/Integration)
- Documentation: ~3% (1 PR with docs)
- Configuration/chores: ~14% (4 PRs with chore/ci/fix)
- Prototypes: ~18% (5 PRs explicitly marked prototype/prototypes)

**PR Categories (from titles):**
1. feat(web) - 4 PRs (settings UI, demo mode, beta features)
2. feat(beta-features) - 2 PRs (release lifecycle, settings)
3. feat(dialpad) - 2 PRs (integration)
4. feat(prototypes) - 2 PRs (PM components, HubSpot config)
5. Integrations - 3 PRs (Dialpad, Sendoso, CloudTalk)
6. Bug fixes - 3 PRs (RingCentral, Gong, workflows)
7. Feature flags - 2 PRs (cleanup, privacy columns)
8. Other - 11 PRs (analytics, CRM, early-access, feedback analysis)

**Lines of code:**
- Lines added: 62,703 lines (across merged PRs)
- Lines deleted: 221 lines
- Net change: +62,482 lines (massive net addition)

---

#### GITHUB PATTERN OBSERVATIONS

**Code vs PM work allocation:**
- Percentage of Tyler's time in product code (elephant-ai commits / total commits):
  - elephant-ai: 10 direct commits
  - pm-workspace: 118 commits (from Plan 01-03)
  - Ratio: **7.8% product code, 92.2% PM work** (by commit count)
  - **However:** 29 PRs with 62k+ lines added suggests significant product code involvement beyond direct commits
  - **Interpretation:** Tyler creates PRs with substantial code (prototypes, integrations, features) but may be working in branches or with tooling that generates code

**Types of product contributions:**
- **Primary:** Feature development (web UI, beta features, settings redesign, prototypes)
- **Secondary:** Integrations (Dialpad, Sendoso, CloudTalk, HubSpot CRM)
- **Tertiary:** Bug fixes (RingCentral, Gong, workflows)
- **Minimal:** Documentation (only 1 docs PR)
- **Pattern:** Tyler is writing features and building integrations, not just coordinating

**Collaboration indicators:**
- PR review activity: Not analyzed (would need additional data collection)
- PR merge rate: 34% (10/29) - **relatively low**, suggests either:
  - PRs are exploratory/prototype (18% are explicitly prototypes)
  - PRs are long-lived and still under review
  - Some PRs may be abandoned (6 closed without merge)
- 13 PRs still open suggests either ongoing work or review bottlenecks

**Technical depth:**
- **Substantial, not trivial:** Average PR has 2,162 lines added (62,703 / 29 PRs)
- **System-wide changes:** Multiple PRs with 10k+ lines (prototypes, integrations, settings)
- **Feature-level work:** Beta features lifecycle, settings UI redesign, agent configurations
- **This contradicts Bryan's guidance:** "Don't do discovery, don't write code" - Tyler is clearly writing substantial product code

**Velocity & sustainability:**
- **Bursty, not consistent:** 10 commits over 67 days = ~1.5/week, but likely clustered
- **PR-driven work:** Most code happens in PR contexts, not steady commits
- **Evidence of concurrent work:** 13 open PRs + 29 total PRs over 2 months = high WIP
- **Sustainability concern:** 45% of PRs still open after up to 2 months suggests accumulation
- **After-hours work:** Not analyzed (would need timestamp data)

**Key finding:** Tyler's product code work is more extensive than commit count suggests. The 29 PRs with 62k lines of code represent significant technical contribution, contradicting the "PM should not code" guidance from conversations.

---

## COMPARISON ANALYSIS TEMPLATE

After collecting both Linear and GitHub data, answer these cross-system questions:

### Work Allocation

**Question 1: How much of Tyler's time goes to product code vs PM work?**

Data points:
- PM workspace commits: 118 (from Plan 01-03)
- elephant-ai commits: 10 direct commits (from GitHub summary above)
- elephant-ai PRs: 29 PRs with 62,703 lines added
- Total commits: 128 (118 PM + 10 product)
- Commit ratio: **7.8% product code, 92.2% PM work**
- **But:** PR volume and line count suggest significantly more product code involvement than commits indicate

Interpretation:
- **Does NOT align with Bryan's guidance:** "Don't code" - Tyler authored 29 PRs with substantial code
- **May align with Sam's "share outcomes":** If prototypes are considered "outcomes" not "production code"
- **18% of PRs are explicitly prototypes** - this might be acceptable PM work?
- **Contradiction:** Tyler is coding extensively (integrations, features, UI) despite role guidance to coordinate, not implement

**Question 2: Do Linear assignments match actual work outputs?**

Data points:
- Linear issues assigned: X
- Linear issues completed: X
- PM workspace initiatives: 27 total, 11 recently active (from Plan 01-03)
- elephant-ai PRs: X

Interpretation:
- Are Linear assignments getting completed or dropping?
- Is Tyler working on things not assigned in Linear?
- Disconnect between assignment system (Linear) and work tracking (pm-workspace)?

### Completion Patterns

**Question 3: What's the completion rate on assigned items?**

Data points:
- Linear completion rate: X%
- PM workspace initiatives completed: Y (from Plan 01-03 - need to count "done" status)
- elephant-ai PR merge rate: X%

Interpretation:
- Is Tyler finishing what he starts?
- Are there patterns in what gets completed vs dropped?
- Does completion rate align with "overcommitment" concern from conversations?

### Priority Alignment

**Question 4: Do Linear priorities match actual work execution?**

Data points:
- Linear urgent/high priority issues: X
- Linear urgent/high completion rate: X%
- PM workspace recent activity: 11/27 initiatives active (from Plan 01-03)

Interpretation:
- Are high-priority Linear issues getting done?
- Is Tyler working on initiatives not reflected in Linear?
- Evidence of "working on wrong things" (PROJECT.md pain point #3)?

### Type Distribution

**Question 5: What types of work is Tyler actually doing?**

Data points:
- PM workspace work allocation: 40% initiatives, 24% tooling, 18% docs (from Plan 01-03)
- Linear issue types: X% features, Y% bugs, Z% docs
- elephant-ai commit types: X% code, Y% docs, Z% config

Interpretation:
- Does work type distribution align with PM rubric expectations?
- Is tooling/automation work (24% from pm-workspace) tracked in Linear?
- Is elephant-ai code work (X commits) part of PM role or scope creep?

### Context Switching

**Question 6: How many concurrent workstreams is Tyler managing?**

Data points:
- PM workspace concurrent initiatives: 5-11 (from Plan 01-03)
- Linear issues in progress: X
- GitHub open PRs: X
- Slack threads (from slack-patterns.md): X concurrent threads

Interpretation:
- Total concurrent work items: X
- Is this sustainable?
- Does concurrent work volume explain "context switching" pain point (PROJECT.md pain point #1)?

---

## SYNTHESIS QUESTIONS

After collecting Linear, GitHub, and Slack data, synthesize findings:

### Gap Analysis Prep (for Phase 3)

1. **Stated expectation vs actual work:** Do Linear assignments (leadership expectations) match pm-workspace + elephant-ai activity (Tyler's actual work)?

2. **Overcommitment evidence:** Is Tyler working on more things than can reasonably be completed? (Linear backlog + pm-workspace initiatives + GitHub PRs)

3. **Role boundary confusion:** Is Tyler doing "don't do this" work from Bryan's guidance? (coding, deep discovery, research)

4. **Cross-functional coordination visibility:** Is there evidence of Tyler's "superpower" in Linear/GitHub? Or just individual contributor work?

5. **PM workspace scope creep:** Is the 24% tooling time in pm-workspace tracked as valuable work in Linear? Or is it unrecognized effort?

### Pattern Validation (for Phase 2)

6. **Time allocation claim:** Tyler's brain dump says "70% on discovery/roadmap". Does Linear + GitHub data support this?

7. **Completion patterns:** Are there specific types of work that consistently get completed vs dropped?

8. **Urgency vs importance:** Are urgent issues getting done at expense of important strategic work?

9. **Communication volume correlation:** Does Slack message volume correlate with Linear issue assignment volume?

10. **Sustainability indicators:** Evidence of after-hours work, weekend commits, or burnout patterns?

---

## NEXT STEPS

After completing this data collection:

1. **Fill in Linear Summary** with actual numbers from Linear workspace
2. **Fill in GitHub Summary** with actual numbers from elephant-ai repo
3. **Complete Comparison Analysis** with cross-system insights
4. **Answer Synthesis Questions** to prepare for Phase 2 and Phase 3
5. **Document key patterns** (3-5 major observations)
6. **Signal completion** by updating status at top of document to 🟢 Complete
7. **Notify** by typing "data collected" to resume plan execution

**Estimated time:** 30-45 minutes of focused data collection

---

## ALTERNATIVE: SKIP EXTERNAL DATA

If Linear/GitHub access is unavailable or time-constrained, you can proceed with available data only.

**Impact of skipping:**
- ❌ No validation of stated workload vs actual assignments
- ❌ No product code contribution visibility
- ❌ No completion rate metrics
- ❌ Cannot validate "70% on discovery" claim with hard data
- ✅ Can still proceed with pm-workspace + conversation data for analysis
- ✅ Phase 2 pattern analysis will note data limitations

**To skip:** Type "skip external data" when prompted, and document assumptions made without this data.

---

*External systems data collection guide created: 2026-02-05*
*Part of Phase 1: Data Collection - Plan 01-04*
