# PM Command

Create full project documentation (PRD, Design Brief, Engineering Spec, GTM Brief).

## Usage

```
/pm [initiative-name]
```

## Behavior

**Uses**: `prd-writer` skill

This command will:

1. Load company context (product-vision, strategic-guardrails, personas)
2. Load existing research if available
3. **Check strategic alignment** before proceeding
4. Generate four documentation artifacts
5. Save to initiative folder
6. Commit and push changes

## Strategic Alignment Check

Before generating docs, the skill will verify:

- [ ] Clear outcome chain exists
- [ ] Evidence supports the need
- [ ] Specific persona identified
- [ ] Not in anti-vision territory
- [ ] Trust implications considered
- [ ] End-to-end experience: All 5 steps addressed (Discovery, Activation, Usage, Ongoing Value, Feedback)
- [ ] Feedback method defined for post-launch learning
- [ ] Ownership assigned (PM, Eng Lead, Design Lead)

**If gaps detected**: Will ask clarifying questions instead of generating incomplete docs.

## Output Files

All saved to `pm-workspace-docs/initiatives/active/[name]/`:

| File                  | Description                                      |
| --------------------- | ------------------------------------------------ |
| `prd.md`              | Problem, personas, requirements, success metrics |
| `design-brief.md`     | User flows, states, interactions, accessibility  |
| `engineering-spec.md` | Technical approach, data model, APIs, risks      |
| `gtm-brief.md`        | Value prop, positioning, enablement needs        |

## Prerequisites

For best results, run `/research [name]` first to gather evidence.

## Outcome Chain Requirement

Every PRD must include:

```
[Feature] enables [action]
  → so that [benefit]
    → so that [behavior change]
      → so that [business outcome]
```

## Next Steps

After PM docs are complete:

- Ready to build? Run `/proto [name]`
- Need more research? Run `/research [name]`
- Check status: Run `/status [name]`
