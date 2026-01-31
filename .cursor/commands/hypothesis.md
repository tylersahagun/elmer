# Hypothesis Management

Manage problem hypotheses through their lifecycle: active → validated → committed → retired.

**Delegates to**: hypothesis-manager

## Usage

- `/hypothesis new [name]` - Create a new hypothesis
- `/hypothesis validate [name]` - Move hypothesis to validated (requires evidence)
- `/hypothesis commit [name]` - Commit to roadmap and create initiative
- `/hypothesis retire [name]` - Archive hypothesis with reason
- `/hypothesis list [status]` - List hypotheses by status
- `/hypothesis show [name]` - Show hypothesis details

## Subcommands

### `hypothesis new [name]`

Create a new hypothesis in `pm-workspace-docs/hypotheses/active/[name].md`.

**Process:**

1. Ask for problem statement (who, what, when, impact)
2. Ask for initial evidence (signal source, quote)
3. Ask for persona affected
4. Create hypothesis file from template
5. Update `pm-workspace-docs/hypotheses/_index.json`
6. Suggest: "Add more evidence, then run `hypothesis validate [name]`"

**Template location:** `pm-workspace-docs/hypotheses/_template.md` (fallback to `elmer-docs/hypotheses/_template.md`)

### `hypothesis validate [name]`

Move hypothesis from `active/` to `validated/` after gathering sufficient evidence.

**Validation criteria:**

- [ ] 3+ independent evidence sources
- [ ] Clear persona identification
- [ ] Severity/frequency assessed
- [ ] Outcome chain articulated

**Process:**

1. Read hypothesis from `pm-workspace-docs/hypotheses/active/[name].md`
2. Check validation criteria
3. If criteria not met, show what's missing
4. If criteria met:
   - Move file to `pm-workspace-docs/hypotheses/validated/[name].md`
   - Update status in file
   - Update `pm-workspace-docs/hypotheses/_index.json`
5. Suggest: "Ready to commit? Run `hypothesis commit [name]`"

### `hypothesis commit [name]`

Commit hypothesis to roadmap and create an initiative.

**Process:**

1. Read hypothesis from `pm-workspace-docs/hypotheses/validated/[name].md`
2. Move file to `pm-workspace-docs/hypotheses/committed/[name].md`
3. Create initiative folder: `elmer-docs/initiatives/[name]/`
4. Create `_meta.json` with:
   - `hypothesis_id`: `hyp-[name]`
   - `phase`: `discovery`
   - `status`: `on_track`
   - `personas`: from hypothesis
   - `pillar`: infer from problem
5. Create `research.md` seeded with hypothesis evidence
6. Update `pm-workspace-docs/hypotheses/_index.json`
7. Regenerate roadmap: `python scripts/generate-roadmap.py`
8. Suggest: "Initiative created! Run `/research [name]` to continue discovery"

### `hypothesis retire [name]`

Archive a hypothesis that was invalidated, deprioritized, or completed.

**Process:**

1. Ask for retirement reason:
   - `invalidated` - Evidence contradicted hypothesis
   - `deprioritized` - Not pursuing now
   - `completed` - Initiative shipped
   - `merged` - Combined with another hypothesis
2. Move file to `pm-workspace-docs/hypotheses/retired/[name].md`
3. Add retirement reason and date to file
4. Update `pm-workspace-docs/hypotheses/_index.json`

### `hypothesis list [status]`

List hypotheses by status.

**Statuses:** `active`, `validated`, `committed`, `retired`, `all`

**Output format:**

```markdown
# Hypotheses: [Status]

| Name   | Persona   | Evidence | Severity   | Age    |
| ------ | --------- | -------- | ---------- | ------ |
| [name] | [persona] | [count]  | [severity] | [days] |
```

### `hypothesis show [name]`

Show full hypothesis details from any status folder.

**Process:**

1. Search all status folders for `[name].md`
2. Display full content
3. Show linked initiative if committed

## File Locations

- Template: `pm-workspace-docs/hypotheses/_template.md` (fallback: `elmer-docs/hypotheses/_template.md`)
- Index: `pm-workspace-docs/hypotheses/_index.json`
- Active: `pm-workspace-docs/hypotheses/active/`
- Validated: `pm-workspace-docs/hypotheses/validated/`
- Committed: `pm-workspace-docs/hypotheses/committed/`
- Retired: `pm-workspace-docs/hypotheses/retired/`

## Index Schema

```json
{
  "hypotheses": [
    {
      "id": "hyp-[name]",
      "name": "Human Readable Name",
      "status": "active|validated|committed|retired",
      "initiative_id": "[name]" // only if committed
      "personas": ["sales-rep"],
      "evidence_count": 3,
      "severity": "high|medium|low",
      "frequency": "common|occasional|rare",
      "created_at": "ISO8601",
      "validated_at": "ISO8601" // if validated
    }
  ]
}
```

## Workflow Integration

```
Signal ──► hypothesis new ──► hypothesis validate ──► hypothesis commit ──► /research
                  │                    │                      │
                  │                    │                      └── Creates initiative
                  │                    └── Requires 3+ evidence
                  └── Creates in active/
```
