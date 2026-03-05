# Feedback and Hypothesis Linking Map

## Hypothesis -> Project mapping

| Hypothesis ID | Project |
| --- | --- |
| hyp-chief-of-staff-platform | Chief of Staff Experience (parent) |
| hyp-chief-of-staff-first-class-artifacts | Meeting Summary |
| hyp-chief-of-staff-action-first | Meeting Prep, Action Items |
| hyp-chief-of-staff-cross-signal-brief | Daily Brief, Weekly Brief |
| hyp-chief-of-staff-recap-hub | Chief of Staff Experience (related historical) |
| hyp-proactive-approval-hub | Chief of Staff Experience, Action Items |

## Signal/Product feedback -> Project mapping

| Signal ID | Suggested Project Link |
| --- | --- |
| sig-2026-02-09-rob-feedback-agent-command-center-v9 | Chief of Staff Experience |
| sig-2026-02-01-signal-synthesis-week-5 | Chief of Staff Experience |
| sig-2026-01-30-meeting-page-view-brainstorm | Meeting Summary, Action Items |
| sig-2026-01-29-product-conversation-sam-ho-skylar-sanford | Chief of Staff Experience |
| sig-2026-01-29-product-vision-robert-henderson | Chief of Staff Experience |

## Product feedback linking requirements

- Product Feedback DB relation `Project` must exist and point to Projects DB.
- If missing, follow the Phase 3 manual relation setup documented in:
  - `pm-workspace-docs/status/notion/admin/notion-db-architecture-2026-02-16.md`

## Notes

- Direct linking in Notion was blocked this session due unavailable Notion MCP.
- Execution-ready linking steps are documented in:
  - `pm-workspace-docs/status/notion/chief-of-staff-notion-update-plan-2026-02-17.md`
