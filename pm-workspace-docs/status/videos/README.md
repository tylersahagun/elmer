# PMM Video Generation Log

This directory tracks generated PMM videos and their metadata.

## How to Generate Videos

### Via Command

```bash
/pmm-video [initiative-name]
```

This triggers the `remotion-video` subagent which:

1. Runs interactive intake to capture intent
2. Loads initiative docs (PRD, research, brief)
3. Creates/updates the Remotion composition
4. Provides preview and render instructions

### Via GitHub Actions

1. Add the `generate-video` label to a PR
2. On merge, the video-generation workflow runs automatically
3. Video is uploaded as an artifact (30-day retention)

### Manual Render

```bash
cd remotion-pmm
npm run dev          # Preview at http://localhost:3000
npm run render       # Render to video file
```

## Available Compositions

| ID                 | Type           | Duration | Use Case                        |
| ------------------ | -------------- | -------- | ------------------------------- |
| `Announcement`     | Feature launch | 34s      | New feature releases            |
| `Demo`             | Walkthrough    | 64s+     | Product demos, sales enablement |
| `Recap`            | Summary        | 29s      | Sprint reviews, release notes   |
| `ReleaseHighlight` | Brief-driven   | Variable | Data-driven updates             |

## Video Log

| Date                      | Initiative | Composition | Output | Notes |
| ------------------------- | ---------- | ----------- | ------ | ----- |
| _No videos generated yet_ |            |             |        |       |

## Output Location

Videos are rendered to:

- Local: `remotion-pmm/out/`
- CI: GitHub Actions artifacts

## Brief Format

Video briefs should be placed at:

- `pm-workspace-docs/initiatives/[name]/pmm-video-brief.md`
- Or JSON: `remotion-pmm/briefs/[name].json`

See `pm-workspace-docs/initiatives/_template/pmm-video-brief.md` for the template.
