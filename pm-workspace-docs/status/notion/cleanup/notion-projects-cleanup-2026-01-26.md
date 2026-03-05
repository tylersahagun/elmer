# Notion Projects Database Cleanup Report

**Date:** 2026-01-26
**Action:** Cleanup, Schema Audit, and Workflow Mapping
**Status:** ✅ COMPLETE

---

## Cleanup Summary

### Archived: 37 Projects

- **7 duplicates** merged (kept most recent version)
- **30 stale/empty Discovery projects** removed

### Remaining: 12 Projects

| Project                          | Phase     | Linear | GTM | Roadmap |
| -------------------------------- | --------- | ------ | --- | ------- |
| Global Chat                      | Build     | ✅     | ✅  | ✅      |
| CRM Agent Upgrades               | Build     | ✅     | ✅  | ✅      |
| Privacy Determination Agent (v2) | Build     | ✅     | ✅  | ✅      |
| FGA engine                       | Build     | ✅     | ❌  | ✅      |
| **Settings Redesign**            | Build     | ❌     | ❌  | ❌      |
| **Rep Workspace**                | Build     | ❌     | ❌  | ❌      |
| Notification Engine              | Test      | ✅     | ❌  | ✅      |
| Capture Visibility               | Done      | ✅     | ✅  | ✅      |
| Observability & Monitoring       | Done      | ✅     | ❌  | ✅      |
| Call Import Engine               | Discovery | ❌     | ✅  | ❌      |
| Universal Signal Tables          | Discovery | ❌     | ❌  | ❌      |
| Feature Flag Audit & Cleanup     | Discovery | ❌     | ❌  | ❌      |

### Action Required: Linear Links

Settings Redesign and Rep Workspace are in **Build** phase but missing Linear links.

**Possible Linear matches:**

- Settings Redesign → "Workspace Settings" or "User Settings" in Linear
- Rep Workspace → "Customers & CRM" or needs new project

---

## Schema Audit

### Current Properties (27 total)

#### Keep (Essential - 10)

| Property               | Type      | Why Keep                              |
| ---------------------- | --------- | ------------------------------------- |
| **Project name**       | Title     | Primary identifier                    |
| **Project Phase**      | Status    | Lifecycle tracking (Discovery → Done) |
| **Linear Link**        | URL       | Links to engineering work             |
| **Priority**           | Select    | P0-P4 prioritization                  |
| **Outcome**            | Rich Text | Expected business outcome             |
| **Start date**         | Date      | Timeline tracking                     |
| **End Date**           | Date      | Timeline tracking                     |
| **GTM**                | Relation  | Links to Launch Planning              |
| **Roadmap Initiative** | Relation  | Strategic context                     |
| **AI summary**         | Rich Text | Quick context for AI tools            |

#### Review (Useful but Underused - 7)

| Property                   | Type   | Recommendation               |
| -------------------------- | ------ | ---------------------------- |
| **Engineering**            | People | Keep - useful for ownership  |
| **Design**                 | People | Keep - useful for ownership  |
| **Sponsors**               | People | Keep - stakeholder tracking  |
| **Project Type**           | Select | Keep - useful categorization |
| **Figma Link**             | URL    | Keep - but encourage use     |
| **Last meaningful update** | Date   | Keep - staleness tracking    |
| **Attach file**            | Files  | Keep - documentation         |

#### Remove (Redundant/Unused - 10)

| Property                   | Type     | Why Remove                                |
| -------------------------- | -------- | ----------------------------------------- |
| **Design Briefs**          | Relation | Moved to Figma - remove relation          |
| **Eng Specs**              | Relation | Lives in Linear - remove relation         |
| **Customer Conversations** | Relation | Never used - 0/12 projects                |
| **Feedback**               | Relation | Never used - 0/12 projects                |
| **Tasks**                  | Relation | Duplicates Linear tasks                   |
| **GTM Plans**              | Relation | Duplicate of GTM                          |
| **📤 GTM / Launch Plans**  | Relation | Duplicate of GTM                          |
| **🎫 Product Tickets**     | Relation | Never used consistently                   |
| **Blocked by**             | Relation | Self-referential complexity               |
| **Blocking**               | Relation | Self-referential complexity               |
| **Parent item**            | Relation | Only used for sub-projects (now archived) |
| **Sub-item**               | Relation | Only used for sub-projects (now archived) |

---

## Recommended Schema (Simplified to 12 Properties)

```
Core (Always Visible):
├── Project name (Title)
├── Project Phase (Status: Discovery → Definition → Build → Test → Done)
├── Priority (Select: P0, P1, P2, P3, P4)
├── Linear Link (URL)
├── Outcome (Rich Text)

Planning:
├── Start date (Date)
├── End Date (Date)
├── GTM / Launch Plan (Relation → Launch Planning)
├── Roadmap Initiative (Relation → Roadmap)

People:
├── Engineering (People)
├── Design (People)
├── Sponsors (People)

Optional:
├── Figma Link (URL)
├── AI summary (Rich Text)
├── Project Type (Select: Roadmap, Reactive, Tech Debt, Experiment)
```

---

## Suggested Views

### 1. Active Work (Default)

- Filter: Phase = Build, Test
- Sort: Priority (P0 first)
- Show: Name, Phase, Priority, Linear Link, Engineering

### 2. Pipeline

- Filter: Phase = Discovery, Definition
- Group by: Priority
- Show: Name, Phase, Outcome, Start date

### 3. Shipped

- Filter: Phase = Done - Beta, Done - Full Release
- Sort: End Date (newest first)
- Show: Name, GTM, End Date

### 4. Needs Attention

- Filter: Phase = Build/Test AND (Linear Link empty OR GTM empty)
- Show: Name, Phase, missing fields

---

## Completed Actions

### 1. Schema Cleanup ✅

Removed 12 redundant properties:

- Design Briefs, Eng Specs (moved to Figma/Linear)
- Customer Conversations, Feedback (never used)
- Tasks, GTM Plans, 📤 GTM / Launch Plans (duplicates)
- 🎫 Product Tickets (inconsistent)
- Blocked by, Blocking, Parent item, Sub-item (complexity)

**Before:** 27 properties → **After:** 15 properties

### 2. Linear Links ✅

- Settings Redesign → Workspace Settings (11d0e1b8-1f1f-4654-ab72-e37e37db747d)
- Rep Workspace → Needs new Linear project (P0 priority - create manually)

### 3. Workflow Mapping ✅

Created comprehensive mapping: `pm-workspace-docs/audits/notion-workflow-mapping.md`

## Remaining Actions (Manual in Notion)

### Create Views in Notion UI:

| View                | Type  | Filter             | Group By      |
| ------------------- | ----- | ------------------ | ------------- |
| **Active Work**     | Table | Phase = Build/Test | -             |
| **Pipeline**        | Board | Phase ≠ Done       | Project Phase |
| **Shipped**         | Table | Phase = Done       | -             |
| **Needs Attention** | Table | Linear/GTM empty   | -             |
| **By Person**       | Table | -                  | Engineering   |

### Still Missing:

- Rep Workspace needs Linear project created
- Universal Signal Tables, Feature Flag Audit, Call Import Engine need Linear links
