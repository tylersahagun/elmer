# Design Handoff Command

Hand off a PM prototype to a designer for visual refinement.

## Usage

```
/design-handoff [initiative-name]
```

## Behavior

**Uses**: `design-companion` skill

This command validates prototype readiness and generates the complete handoff package.

## Process

1. **Validate Readiness**
   - Check PRD, design-brief, prototype-notes exist
   - Verify Chromatic URL is available
   - Confirm state stories (Loading, Error, Success, Empty)
   - Confirm flow stories (Flow_HappyPath, Flow_ErrorRecovery)

2. **Choose Workflow**
   - **A: Figma Refinement** - Designer owns final pixels
   - **B: Code-First** - Storybook stays source of truth
   - **C: Token Update** - Designer refines tokens only
   - **D: Hybrid** - Both Figma and Storybook maintained

3. **Generate Package**
   - `design-handoff.md` - Full handoff brief
   - `design-handoff-slack.md` - Copy-paste Slack message
   - Update `_meta.json` with handoff state

## Prerequisites

Prototype must exist with:
- All state stories (Loading, Error, Success, Empty)
- Flow stories (Flow_HappyPath, Flow_ErrorRecovery)
- Chromatic URL deployed

**If missing:** Run `/proto [name]` first.

## Workflow Selection Guide

| Feature Type | Workflow | Why |
|--------------|----------|-----|
| Brand-critical | **A** | Designer needs pixel control |
| Internal tool | **B** | Speed > polish |
| Spacing/color tweaks | **C** | No new components |
| Complex multi-screen | **D** | Need both exploration + sync |

## Output Files

```
pm-workspace-docs/initiatives/active/[name]/
├── design-handoff.md        # Full brief for designer
├── design-handoff-slack.md  # Slack message template
└── _meta.json               # Updated with handoff state
```

## After Designer Completes

| Workflow | Designer Delivers | PM Runs |
|----------|-------------------|---------|
| A | Figma URL | `/figma-sync [name] [url]` |
| B | Feedback | `/iterate [name]` |
| C | Token updates | Update tokens, rebuild |
| D | Figma URL + contract | `/figma-sync [name] [url]` |

## Handoff States

Track with `/status [name]`:
- `awaiting_design` - Waiting for designer
- `in_progress` - Designer working
- `ready_for_sync` - Designer done
- `complete` - Synced and approved
