# Research Command

Analyze user research, transcripts, and feedback with strategic alignment lens.

## Usage

```
/research [initiative-name]
```

Then paste or reference the transcript/feedback to analyze.

## Behavior

**Delegates to**: `research-analyzer` subagent

The subagent will:
1. Load company context (product-vision, strategic-guardrails, personas)
2. Extract key insights with verbatim quotes
3. Assess strategic alignment
4. Flag red flags and concerns
5. Save research to `pm-workspace-docs/initiatives/active/[name]/research.md`
6. Suggest next steps

## Examples

```
/research hubspot-config
[paste transcript]
```

```
/research crm-sync
@pm-workspace-docs/meeting-notes/2026-01-23-customer-call.md
```

## Output Location

- Initiative research: `pm-workspace-docs/initiatives/active/[name]/research.md`
- Meeting notes: `pm-workspace-docs/meeting-notes/`
- Signals: `pm-workspace-docs/signals/`

## Next Steps

After research is complete:
- Ready for PRD? Run `/pm [name]`
- More research needed? Schedule follow-up interviews
