# Lightweight Forecasting & ETA-Confidence Computation

**Created:** 2026-02-21  
**Purpose:** Runbook specifying how to compute lightweight capacity and ETA confidence bands using historical Linear throughput (ignoring story points).

## 1. Core Principles

- **Ignore Story Points:** Story points are unreliable cross-team.
- **Historical Throughput:** Use a 4–8 week moving average of completed issues per person per item type.
- **Item Types:** Group issues by their Linear label/type (e.g., Bug, Feature, Chore, Epic).
- **Auto-Correction:** If scope changes, ETA bands adjust automatically.

## 2. Weekly Capacity Snapshot Generation

A weekly script/sync process pulls from Linear and computes throughput baselines.

### Step 1: Fetch 8-Week History
1. Query Linear API for issues resolved in the last 8 weeks.
2. Group by: `Assignee` + `Item Type` (Issue Label).
3. Calculate **Weekly Velocity**: `Total Completed / 8 weeks`.
   - *Example:* Developer A completed 16 Features and 8 Bugs in 8 weeks.
   - *Velocity:* 2 Features/week, 1 Bug/week.

### Step 2: Calculate Team Capacity
Aggregate the individual velocities into a team-level throughput matrix.

| Team / Assignee | Item Type | Historical Velocity (per week) |
|-----------------|-----------|--------------------------------|
| Frontend Team   | Feature   | 10                             |
| Frontend Team   | Bug       | 5                              |
| Backend Team    | Feature   | 8                              |

### Step 3: Assess Current Backlog (Load)
1. For each `Milestone` in Notion, fetch active Linear issues linked to that milestone.
2. Sum the remaining open issues by `Team` and `Item Type`.

## 3. Computing ETA Confidence Bands

### Step 1: Base ETA Calculation
- `Remaining Weeks = Open Issues / Historical Velocity`
- *Example:* Milestone "Beta Release" has 15 Feature issues assigned to Frontend Team.
- `Base Weeks to Complete = 15 / 10 = 1.5 weeks`.

### Step 2: Apply Volatility Buffers (Confidence Bands)
Multiply the Base ETA by historical volatility factors (e.g., average scope creep rate).

- **Optimistic (High Confidence):** Base Weeks * 1.0
- **Realistic (Medium Confidence):** Base Weeks * 1.3
- **Pessimistic (Low Confidence):** Base Weeks * 1.7

### Step 3: Compare to Target Date
Compare the computed Realistic ETA to the Milestone's `Target Date`.

- If `Realistic ETA <= Target Date`: Confidence is **High**
- If `Realistic ETA` is within 1 week after `Target Date`: Confidence is **Medium**
- If `Realistic ETA > 1 week` after `Target Date`: Confidence is **Low** (At Risk)

## 4. Notion Sync Contract

Write the resulting metrics back to the Notion `Milestones` Database:

- **ETA Confidence:** Update the Select field (High, Medium, Low).
- **Forecast Notes:** Optional text field to output the raw calculation (e.g., "Forecast: 1.5 - 2.5 weeks based on 10 issues/week throughput").

## 5. What-If Scenario Triggers (Over-Capacity Flags)
- If the sum of `Realistic ETAs` for all active milestones assigned to a team exceeds the available weeks before their deadlines, flag the team as **Over-Capacity**.
- Output this to a `Capacity Snapshot` report in `pm-workspace-docs/status/`.
- Provide trade-off suggestions: "Deprioritizing Milestone B brings Milestone A back to High Confidence."