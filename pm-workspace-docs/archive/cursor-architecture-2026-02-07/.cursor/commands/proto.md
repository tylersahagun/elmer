# Prototype Command

Build interactive Storybook prototypes with multiple creative directions.

## Usage

```
/proto [initiative-name]
```

Optionally include specific instructions:

```
/proto hubspot-config add validation toggle
```

## Behavior

**Delegates to**: `proto-builder` subagent

The subagent will:

1. Load PRD and Design Brief from initiative folder
2. Load design system from `.interface-design/system.md`
3. Load `figma-spec*.json` and `figma-language.md` when present for token/style grounding
4. Create 2-3 creative options (Max Control, Balanced, Efficient)
5. Implement all required AI states (Loading, Success, Error, etc.)
6. Create interactive Flow\_\* stories for user journeys
7. Create discovery flow (how does user find this feature?)
8. Create activation flow (first-time setup/onboarding without hand-holding)
9. Create day-2 flow (returning user, ongoing value)
10. Create a full interactive demo (live click-through) and walkthrough
11. Build and deploy to Chromatic
12. Document in prototype-notes.md
13. Commit and push changes

## Prerequisites

- PRD should exist at `pm-workspace-docs/initiatives/active/[name]/prd.md`
- Design Brief should exist at `pm-workspace-docs/initiatives/active/[name]/design-brief.md`

If these don't exist, run `/pm [name]` first.

Optional but recommended for higher visual fidelity:
- Run `/figma-sync [name] [figma-url]` first so `/proto` can reuse extracted tokens, variants, and design language.

## Output

- Components: `elephant-ai/web/src/components/prototypes/[Initiative]/v1/`
- Stories: All options + all states + Flow\_\* journeys + Demo + Walkthrough
- Notes: `pm-workspace-docs/initiatives/active/[name]/prototype-notes.md`
- Chromatic URL for sharing

## Next Steps

After prototype is complete:

- Ready for validation? Run `/validate [name]`
- Need feedback? Share Chromatic URL with stakeholders
- Need iteration? Run `/iterate [name]` after gathering feedback
