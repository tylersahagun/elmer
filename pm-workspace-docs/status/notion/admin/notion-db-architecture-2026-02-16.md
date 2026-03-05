# Notion Database Architecture -- 2026-02-16

## Changes Made

### Phase 1: Tasks Database Created
- **ID**: `309f79b2-c8ac-8118-a808-c5e39a2b86f3`
- **URL**: https://www.notion.so/309f79b2c8ac8118a808c5e39a2b86f3
- Two-way relation to Projects Database (synced column: "Tasks")
- Select options seeded: Priority (P1-P4), Type (7 options), Source (6 options)
- Status type with default To-do / In progress / Done groups

### Phase 2: Projects Database Updated
- Added **Pillar** select: Revenue Growth, GTM Enablement, Customer Trust, Platform Foundation
- Added **Quarter** select: Q1-Q4 2026, 2027+
- These absorb what the Initiatives database tracked

### PRDs Database (created earlier in session)
- **ID**: `309f79b2-c8ac-81f8-8b3e-e5ea480f7bc6`
- Two-way relation to Projects Database (synced column: "PRDs")

### Phase 3: Manual Relations Needed
The API cannot add relation properties to existing databases. You need to add these 5 relation columns manually in the Notion UI:

1. **Product Feedback** (`308f79b2-c8ac-81d1-a3ff-f1dad31a4edd`) -- add "Project" relation
2. **Product Requests** (`308f79b2-c8ac-811c-a91d-cc43a4494fb0`) -- add "Project" relation
3. **Knowledge Base** (`308f79b2-c8ac-815f-bb31-faee10b84d61`) -- add "Project" relation
4. **Decision Log** (`308f79b2-c8ac-81fe-bf79-cc546d804e84`) -- add "Project" relation
5. **Product Roadmap** (`308f79b2-c8ac-815d-9357-dc8da420b702`) -- add "Project" relation

For each: Click + > Relation > select "Projects Database" > toggle "Show on Projects Database" ON > name column "Project"

### Phase 4: Initiatives Archived
Archived `308f79b2-c8ac-8192-95b9-ee43402eb692`. Data preserved below.

## Archived Initiatives Data (for reference)

| Initiative | Pillar | Quarter | Outcome |
|-----------|--------|---------|---------|
| CRM Agent Excellence | Platform Foundation | Q1 2026 | 95% CRM sync reliability; 50% reduction in CRM-related support tickets |
| Revenue Intelligence Suite | Revenue Growth | Q1 2026 | Increase revenue-attributed insights usage by 40% among sales leaders |
| Privacy & Trust Foundation | Customer Trust | Q1 2026 | Zero privacy-related churn incidents; pass enterprise security reviews in under 2 weeks |
| Self-Serve Onboarding | GTM Enablement | Q2 2026 | Reduce time-to-value from 14 days to 3 days for new accounts |

## Current Database Map

| Database | ID | Relation to Projects |
|----------|-----|---------------------|
| Projects Database (HUB) | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` | -- |
| Tasks | `309f79b2-c8ac-8118-a808-c5e39a2b86f3` | dual (API) |
| PRDs | `309f79b2-c8ac-81f8-8b3e-e5ea480f7bc6` | dual (API) |
| Product Feedback | `308f79b2-c8ac-81d1-a3ff-f1dad31a4edd` | NEEDS MANUAL |
| Product Requests | `308f79b2-c8ac-811c-a91d-cc43a4494fb0` | NEEDS MANUAL |
| Knowledge Base | `308f79b2-c8ac-815f-bb31-faee10b84d61` | NEEDS MANUAL |
| Decision Log | `308f79b2-c8ac-81fe-bf79-cc546d804e84` | NEEDS MANUAL |
| Product Roadmap | `308f79b2-c8ac-815d-9357-dc8da420b702` | NEEDS MANUAL |
| GTM | `296f79b2-c8ac-8056-82d2-e2c49a1b53ef` | dual (pre-existing) |

## Recommended Views (Phase 5 -- create manually in Notion)

### Tasks Database
| View | Type | Filter/Group |
|------|------|-------------|
| My Day | List | Due today OR Priority P1, not Done |
| This Week | Table | Due this week, sort by Priority |
| By Project | Table | Group by Project relation |
| Waiting On | Table | Status = Waiting |
| Inbox | Table | Source != Manual, Status = To Do |

### Projects Database
| View | Type | Filter/Group |
|------|------|-------------|
| Active Board | Board | Group by Project Phase, filter not Done |
| By Pillar | Table | Group by Pillar |
| Launch Tracker | Table | Filter Customer-Facing = true, sort by Target Launch Date |
| All Projects | Table | None |

### Product Feedback
| View | Type | Filter/Group |
|------|------|-------------|
| Untriaged | Table | No Related Project |
| By Feature Area | Board | Group by Feature Area |
| Churn Signals | Table | Tags contains "Churn driver" OR Sentiment = Critical |

### Product Requests
| View | Type | Filter/Group |
|------|------|-------------|
| Untriaged | Table | PM Priority = empty |
| By Priority | Board | Group by PM Priority |
| Revenue Impact | Table | Sort by Revenue Impact desc |
