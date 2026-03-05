# Context Review Command

Review and promote pending context candidates from signals into canonical docs.

## Usage

```
/context-review
```

## Behavior

**Delegates to**: `context-reviewer` subagent

The subagent will:

1. Scan `pm-workspace-docs/signals/_index.json` for pending `context_candidates`
2. Group candidates by target file and section
3. Ask for approval before applying updates
4. Update target docs and candidate statuses
5. Write to `pm-workspace-docs/company-context/CHANGELOG.md`

## Output Location

- Company context: `pm-workspace-docs/company-context/`
- Roadmap notes: `pm-workspace-docs/roadmap/roadmap.json`
- Changelog: `pm-workspace-docs/company-context/CHANGELOG.md`

## Notes

- Run `/roadmap refresh` after approving roadmap updates to regenerate
  `roadmap.md`, `roadmap-gantt.md`, and `roadmap-kanban.md`.
