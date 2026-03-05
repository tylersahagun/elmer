# PMM Video Command

Create a Remotion-based PMM video from a structured brief.

## Usage

```
/pmm-video [initiative-name]
```

Optionally include notes:

```
/pmm-video release-lifecycle-process emphasize churn impact
```

## Behavior

**Delegates to**: `remotion-video` subagent

The subagent will:

1. Run an interactive intake (AskQuestion) to capture intent and constraints
2. Load or create the PMM brief and relevant initiative docs
3. Map the brief into a Remotion composition
4. Update or create the video composition in `remotion-pmm/`
5. Produce preview instructions and render steps
6. Log output details in `pm-workspace-docs/status/videos/README.md`

## Interactive intake (required)

The intake captures:

- What you want included in the video
- What you explicitly do not want
- How the video should be built and managed (assets, cadence, update model)
- Tone, duration, CTA, and persona

## Prerequisites

- Brief should exist at `pm-workspace-docs/initiatives/active/[name]/pmm-video-brief.md`
- Remotion project should exist at `remotion-pmm/`
- Prototype is not required; intake answers can drive the brief directly.

If missing, the subagent should create a draft brief using the template at:
`pm-workspace-docs/initiatives/_template/pmm-video-brief.md`

## Output

- Remotion composition: `remotion-pmm/src/` (project-specific)
- Rendered output: `remotion-pmm/out/`
- Log entry: `pm-workspace-docs/status/videos/README.md`
