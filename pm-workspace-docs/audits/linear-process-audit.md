# Linear Process Audit

**Date:** 2026-01-31
**Auditor:** Tyler (via PM copilot)

---

## Current State Summary

### PM Workspace

| Metric                | Count                     |
| --------------------- | ------------------------- |
| Total initiatives     | 24 (excluding \_template) |
| With Linear mapping   | ~5-6 (estimated 20-25%)   |
| P0 initiatives        | 8                         |
| P1 initiatives        | 4                         |
| Stale (>14d in phase) | ~3-4                      |

**Sample of P0/P1 Initiatives:**

| Initiative                           | Phase     | Priority | Linear Project ID | Mapped? |
| ------------------------------------ | --------- | -------- | ----------------- | ------- |
| flagship-meeting-recap               | build     | P1       | None              | No      |
| crm-exp-ete                          | build     | P0       | `2f33a114-...`    | Yes     |
| rep-workspace                        | build     | P0       | None              | No      |
| feature-availability-audit           | build     | P0       | None              | No      |
| deprecate-deprecating-the-pipe-dream | discovery | P1       | `313bc3ff-...`    | Yes     |

**Finding:** 3 of 5 P0/P1 initiatives sampled are NOT mapped to Linear projects.

### Linear

| Metric                                            | Count                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| Total projects                                    | 50                                              |
| Teams                                             | 3 (Product, IT, Development)                    |
| Workflow labels (needs-prd, ready-to-build, etc.) | 0                                               |
| Area labels                                       | 18                                              |
| Type labels                                       | 4 (bug, feature-request, improvement, question) |
| Feature labels                                    | 15                                              |

**Team Structure:**

| Team        | Members                         | Focus                 |
| ----------- | ------------------------------- | --------------------- |
| Product     | 4 (Tyler, Sam, Ivan, Support)   | Product direction     |
| Development | 15 (Bryan, Skylar, Jason, etc.) | Engineering execution |
| IT          | 1 (Kaden)                       | Infrastructure        |

**Notable Projects (matching PM initiatives):**

| Linear Project            | Likely PM Initiative                 |
| ------------------------- | ------------------------------------ |
| Deprecating the Pipedream | deprecate-deprecating-the-pipe-dream |
| CRM Agent Upgrades        | crm-exp-ete                          |
| Universal Signals         | universal-signal-tables              |
| Call & Data Imports       | call-import-engine                   |
| Admin Onboarding          | admin-onboarding                     |
| Global Chat               | internal-search                      |
| Noxon Usability           | product-usability                    |

---

## Gap Analysis

### Critical Gaps

| Area                               | Current State                 | Desired State                                                                                           | Gap Severity |
| ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| **Workflow Labels**                | 0 workflow labels exist       | 7 labels (needs-prd, needs-design, needs-eng-spec, needs-decisions, ready-to-build, in-review, blocked) | **High**     |
| **Linear Project Mapping**         | ~20-25% of initiatives mapped | 100% of active (P0/P1) initiatives mapped                                                               | **High**     |
| **Sync Direction**                 | One-way (Linear → PM)         | Bidirectional                                                                                           | **Medium**   |
| **Release Criteria**               | Not tracked in Linear         | Checklist per project                                                                                   | **High**     |
| **Documentation Quality Standard** | No standard exists            | Ivan Test template                                                                                      | **High**     |
| **Team Collaboration Workflow**    | Undocumented                  | Label-based handoffs documented                                                                         | **Medium**   |

### AGENTS.md Gaps

| Feature                                    | Documented? | Needed? |
| ------------------------------------------ | ----------- | ------- |
| `/morning` command                         | No          | Yes     |
| `/team` command                            | No          | Yes     |
| `/triage` command                          | No          | Yes     |
| `/block` command                           | No          | Yes     |
| Linear workflow (label-based handoffs)     | No          | Yes     |
| Ivan Test / documentation quality standard | No          | Yes     |
| Bidirectional `/sync-linear`               | No          | Yes     |

### Label Gap Detail

**Existing Labels (relevant to workflow):**

- `needs more detail` - Similar concept but not granular
- `won't do` - Workflow state but for rejection

**Missing Workflow Labels:**

- `needs-prd` - PM work required
- `needs-design` - Design work required
- `needs-eng-spec` - Engineering spec required
- `needs-decisions` - Open questions blocking progress
- `ready-to-build` - All inputs ready, passes Ivan Test
- `in-review` - Stakeholder review needed
- `blocked` - External blocker

---

## Recommendations

### Immediate Actions (Phase A)

1. **Create workflow labels in Linear**
   - Add 7 workflow labels to the Development team
   - Use consistent naming: `workflow/needs-prd`, etc.

2. **Create release criteria template**
   - Standard checklist for all projects
   - Template in PM workspace for sync

3. **Create Ivan Test template**
   - Documentation quality standard
   - Checklist for engineer-ready PRDs

4. **Map P0/P1 initiatives to Linear projects**
   - Either create new projects or link to existing
   - Update `_meta.json` with `linear_project_id`

5. **Enhance `/sync-linear` for bidirectional sync**
   - Push initiative data to Linear
   - Pull task breakdown back

6. **Create `/team` command**
   - Pull real-time team status from Linear
   - Group by assignee

7. **Update AGENTS.md**
   - Document new commands
   - Document Linear workflow

### Future Actions (Phase B)

8. **Create `/morning` command** - Daily planning
9. **Create `/triage` command** - Batched communication
10. **Set up Google Tasks** - Replace TickTick
11. **Add time blocking** - Calendar integration

---

## Linear Project → Initiative Mapping Candidates

Based on name matching:

| Linear Project            | PM Initiative                        | Confidence            | Action              |
| ------------------------- | ------------------------------------ | --------------------- | ------------------- |
| CRM Agent Upgrades        | crm-exp-ete                          | 100% (already mapped) | None                |
| Deprecating the Pipedream | deprecate-deprecating-the-pipe-dream | 100% (already mapped) | None                |
| Universal Signals         | universal-signal-tables              | 95%                   | Update `_meta.json` |
| Call & Data Imports       | call-import-engine                   | 95%                   | Update `_meta.json` |
| Admin Onboarding          | admin-onboarding                     | 95%                   | Update `_meta.json` |
| Global Chat               | internal-search                      | 90%                   | Update `_meta.json` |
| Noxon Usability           | product-usability                    | 90%                   | Update `_meta.json` |
| Privacy Experience        | privacy-determination-agent          | 80%                   | Verify              |
| HubSpot Integration       | hubspot-agent-config-ui              | 80%                   | Verify              |

**Unmapped (need new Linear projects):**

- flagship-meeting-recap
- rep-workspace
- feature-availability-audit
- release-lifecycle-process
- composio-agent-framework
- chief-of-staff-hub
- chief-of-staff-recap-hub

---

## Audit Methodology

1. Glob all `_meta.json` files in `pm-workspace-docs/initiatives/`
2. Query Linear via MCP: `LINEAR_LIST_LINEAR_PROJECTS`, `LINEAR_LIST_LINEAR_LABELS`, `LINEAR_LIST_LINEAR_TEAMS`
3. Grep AGENTS.md for new commands/workflows
4. Compare current vs desired state per plan

---

## Next Steps

1. Create workflow labels in Linear
2. Create engineer-ready PRD template (Ivan Test)
3. Create release criteria template
4. Update initiative `_meta.json` with Linear mappings
5. Build `/team` command
6. Update AGENTS.md with new workflow
