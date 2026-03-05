# Tier-Based Project Templates

Database templates for the Projects DB. When creating a new project, select the appropriate tier template to get a pre-populated project page with the correct launch checklist and auto-created nested pages.

## How to use in Notion

1. Open the Projects DB
2. Click the dropdown arrow next to "+ New"
3. Select the tier template (e.g., "P1 Launch (Major)")
4. A new project page is created with:
   - Pre-populated properties (PMM Tier, Launch Planning Status = Not Started)
   - Page body with Overview, Key Links, Key Decisions, Launch Checklist
   - Nested pages auto-created per tier (see table below)
5. Fill in the project name and content
6. As you complete each nested page, copy its URL into the corresponding URL column

## Templates

| Template | File | PMM Tier | Auto-Created Nested Pages |
|----------|------|----------|--------------------------|
| P1 Launch (Major) | `p1-major-launch.md` | p1 | KB Article, SOP, Marketing Brief, Customer Email, FAQ, PRD, Design Brief, Eng Spec, Research, Metrics |
| P2 Launch (Significant) | `p2-significant-launch.md` | p2 | KB Article, SOP, FAQ, PRD, Design Brief (optional), Eng Spec |
| P3 Launch (Minor) | `p3-minor-launch.md` | p3 | KB Article |
| P4 Launch (Internal-only) | `p4-internal-only.md` | p4 | None |

## Nested page content

The nested pages auto-created by each tier use the same content structure as the standalone templates in the parent directory (`../`). When Notion creates the nested pages, it copies the template content into each one.

## Adding more docs to existing projects

If a project needs a document its tier didn't auto-generate, use the standalone templates in the parent directory. See `../README.md` for the full list.

## Reference

- Schema proposal: `pm-workspace-docs/audits/notion-schema-proposal.md`
- Migration SOP: `pm-workspace-docs/audits/notion-migration-sop.md`
- Standalone templates: `pm-workspace-docs/templates/notion-pages/README.md`
