# Remotion Integration Plan for PM Workspace

## Executive Summary

This document outlines a comprehensive strategy for integrating Remotion (programmatic video creation) into the PM workspace workflow, enabling automated PMM video generation after work completion.

---

## Part 1: Understanding Remotion

### Core Concepts

**What Remotion Is:**

- A React-based framework for creating videos programmatically
- Videos are defined as React components that render differently at each frame
- Uses `useCurrentFrame()` hook to get current frame number (starting at 0)
- Compositions define video metadata: `id`, `component`, `durationInFrames`, `width`, `height`, `fps`

**Key Mental Model:**

```
Video = f(frame) → React Component → Rendered Frame → Stitched Video
```

**Default Settings:**

- Frame rate: 30 fps
- Resolution: 1920×1080
- Frame enumeration starts at 0

### Core Components & APIs

| Component                              | Purpose                           | Example                  |
| -------------------------------------- | --------------------------------- | ------------------------ |
| `<Composition>`                        | Defines a renderable video        | Root.tsx registration    |
| `useCurrentFrame()`                    | Gets current frame number         | Animation logic          |
| `interpolate()`                        | Animates values over time         | Opacity, position        |
| `spring()`                             | Physics-based animation           | Bouncy entrances         |
| `<Sequence>`                           | Places elements at specific times | Staggered reveals        |
| `<Series>`                             | Sequential element display        | Slides, segments         |
| `<TransitionSeries>`                   | Sequences with transitions        | Fade/wipe between scenes |
| `<AbsoluteFill>`                       | Layered positioning               | Overlays, backgrounds    |
| `<Video>`, `<Audio>`, `<Img>`, `<Gif>` | Media embedding                   | Assets                   |

### Rendering Options

| Method                                 | Use Case                           | Trigger      |
| -------------------------------------- | ---------------------------------- | ------------ |
| **CLI** (`npx remotion render`)        | Local development, one-off renders | Manual       |
| **Node.js SSR** (`@remotion/renderer`) | Server automation, CI/CD           | Programmatic |
| **Lambda** (`@remotion/lambda`)        | Scalable cloud rendering           | API trigger  |
| **GitHub Actions**                     | CI-triggered video generation      | Git events   |
| **Client-side** (WebCodecs)            | Browser-based, no server           | Web app      |

### Best Prompting Practices (for AI Video Generation)

**DO:**

- Use the `--blank` template with TailwindCSS for AI prompting
- Install Remotion Skills (`npx skills add remotion-dev/skills`)
- Use the MCP server for Cursor/VS Code context
- Keep compositions deterministic (use `random(seed)` not `Math.random()`)
- Use `staticFile()` for public folder assets
- Add `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'` to interpolate

**DON'T:**

- Use `Math.random()` (breaks determinism)
- Mix frame-based and time-based thinking
- Forget to register compositions in Root.tsx
- Use external URLs without proper loading states

### Good vs Bad Use Cases

| ✅ Good For                      | ❌ Not Ideal For              |
| -------------------------------- | ----------------------------- |
| Product demos with data          | Live video editing            |
| Automated release videos         | Real-time streaming           |
| Personalized customer videos     | One-off complex VFX           |
| Social media content at scale    | Cinema-quality production     |
| GitHub Unwrapped-style summaries | Interactive video players     |
| Feature announcements            | Videos without code structure |

---

## Part 2: PM Workspace Integration Architecture

### Where Remotion Fits in the Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                    PM WORKSPACE FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /research → /PM → /proto → /validate → /iterate → /share       │
│       │         │       │                            │           │
│       ▼         ▼       ▼                            ▼           │
│   Research    PRD   Storybook              PR Merged/Released    │
│   Synthesis   Docs  Prototype                        │           │
│                                                      │           │
│                                          ┌───────────┴──────┐    │
│                                          │  NEW: /video     │    │
│                                          │  Remotion PMM    │    │
│                                          │  Video Generator │    │
│                                          └───────────┬──────┘    │
│                                                      │           │
│                                                      ▼           │
│                                          Product Marketing Video │
│                                          - Feature announcement  │
│                                          - Release recap         │
│                                          - Demo walkthrough      │
└──────────────────────────────────────────────────────────────────┘
```

### Integration Points

1. **Post-Merge Hook** (GitHub Actions)
   - Triggered on merge to main
   - Extracts PR title, description, linked issues
   - Generates release video automatically

2. **Manual PMM Command** (`/video`)
   - PM or PMM triggers video generation
   - Uses PRD, design brief, and prototype screenshots
   - Outputs announcement video

3. **Batch Release Videos**
   - Weekly/monthly compilation of shipped features
   - Uses Linear/Notion data for content

### Proposed Command: `/video`

```
/video [initiative-name] [--type=announcement|demo|recap]
```

**What it does:**

1. Loads initiative context (PRD, design brief, screenshots)
2. Routes to `video-generator` subagent
3. Applies `remotion-builder` skill
4. Generates parameterized video composition
5. Renders via CLI or triggers Lambda render

---

## Part 3: Agent Architecture

### New Subagent: `video-generator`

**File:** `.cursor/agents/video-generator.md`

```markdown
# Video Generator Subagent

## Identity

You are a specialized Remotion video creation agent. You create
programmatic videos from PM documentation for product marketing.

## Context Loading

Load these files for context:

- `pm-workspace-docs/initiatives/{name}/prd.md`
- `pm-workspace-docs/initiatives/{name}/design-brief.md`
- `elephant-ai/web/src/components/prototypes/{name}/`
- Screenshots from Chromatic/Storybook

## Process

1. Extract key messaging from PRD (problem, solution, impact)
2. Identify visual assets (prototype screenshots, icons)
3. Structure video: Hook → Problem → Solution → Demo → CTA
4. Generate Remotion composition with proper timing
5. Render video using CLI or Lambda

## Output Location

`pm-workspace/videos/{initiative-name}/`

## Constraints

- Keep videos under 60 seconds for social
- Use AskElephant brand colors and fonts
- Ensure all animations are deterministic
- Include captions/subtitles data
```

### New Skill: `remotion-builder`

**File:** `.cursor/skills/remotion-builder/SKILL.md`

````markdown
# Remotion Builder Skill

## Overview

Step-by-step procedure for creating Remotion video compositions.

## Prerequisites

- Node.js 16+
- Remotion project initialized (`npx create-video@latest --blank`)
- TailwindCSS installed
- Remotion skills added (`npx skills add remotion-dev/skills`)

## Video Structure Template

### Standard Announcement Video (45-60s)

| Segment  | Frames    | Duration | Content                      |
| -------- | --------- | -------- | ---------------------------- |
| Hook     | 0-60      | 2s       | Attention-grabbing statement |
| Problem  | 60-180    | 4s       | User pain point              |
| Solution | 180-360   | 6s       | Feature introduction         |
| Demo     | 360-900   | 18s      | Prototype walkthrough        |
| Benefits | 900-1080  | 6s       | Key value props              |
| CTA      | 1080-1200 | 4s       | Next steps                   |

### Code Patterns

**Composition Registration:**

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { FeatureAnnouncement } from "./FeatureAnnouncement";

export const Root = () => (
  <Composition
    id="FeatureAnnouncement"
    component={FeatureAnnouncement}
    durationInFrames={1200}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      title: "New Feature",
      subtitle: "Solve your problem",
      screenshots: [],
    }}
  />
);
```
````

**Animated Text Entrance:**

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});

const translateY =
  spring({
    fps,
    frame,
    config: { damping: 200 },
  }) * -50;
```

**Sequential Scenes:**

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <HookScene title={title} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={120}>
    <ProblemScene pain={painPoint} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={180}>
    <SolutionScene feature={featureName} />
  </Series.Sequence>
</Series>
```

## Rendering Commands

**Local Preview:**

```bash
npm run dev
```

**Render Video:**

```bash
npx remotion render FeatureAnnouncement out/announcement.mp4
```

**With Custom Props:**

```bash
npx remotion render FeatureAnnouncement out/video.mp4 \
  --props='{"title":"Meeting Privacy Agent"}'
```

## Quality Checklist

- [ ] All text readable at 1080p
- [ ] Animations use spring() for natural motion
- [ ] No Math.random() calls
- [ ] Assets loaded via staticFile()
- [ ] Captions/subtitles JSON exported
- [ ] Video under target duration

````

### New Command: `/video`

**File:** `.cursor/commands/video.md`

```markdown
# /video Command

Generate a product marketing video for an initiative.

## Usage
````

/video [initiative-name] [--type=TYPE]

```

## Types
- `announcement` - Feature launch video (default)
- `demo` - Product walkthrough
- `recap` - Release summary

## Process
1. Load initiative documentation
2. Delegate to `video-generator` subagent
3. Generate Remotion composition
4. Render and output to `videos/` folder

## Example
```

/video meeting-privacy-agent --type=announcement

```

## Prerequisites
- Initiative must have completed PRD
- Prototype screenshots available
- Remotion project initialized in workspace
```

---

## Part 4: Implementation Roadmap

### Phase 1: Setup (Week 1)

- [ ] Initialize Remotion project in pm-workspace
- [ ] Install dependencies and skills
- [ ] Configure MCP server in Cursor
- [ ] Create base video templates

### Phase 2: Integration (Week 2)

- [ ] Create `video-generator` subagent
- [ ] Create `remotion-builder` skill
- [ ] Create `/video` command
- [ ] Test with existing initiative

### Phase 3: Automation (Week 3)

- [ ] GitHub Actions workflow for merge-triggered videos
- [ ] Lambda setup for scalable rendering
- [ ] Integration with Chromatic for screenshots

### Phase 4: AskElephant Integration (Future)

- [ ] API endpoint for video generation
- [ ] Meeting highlight videos
- [ ] Customer-specific recap videos

---

## Part 5: File Structure

```
pm-workspace/
├── .cursor/
│   ├── agents/
│   │   └── video-generator.md      # NEW
│   ├── commands/
│   │   └── video.md                # NEW
│   ├── skills/
│   │   └── remotion-builder/       # NEW
│   │       └── SKILL.md
│   └── rules/
│       └── video-creation.mdc      # NEW (optional)
├── remotion/                       # NEW - Remotion project
│   ├── src/
│   │   ├── index.ts               # Entry point
│   │   ├── Root.tsx               # Composition registry
│   │   ├── components/            # Reusable video components
│   │   │   ├── TextReveal.tsx
│   │   │   ├── ScreenshotSlide.tsx
│   │   │   └── CallToAction.tsx
│   │   └── compositions/          # Video templates
│   │       ├── FeatureAnnouncement.tsx
│   │       ├── DemoWalkthrough.tsx
│   │       └── ReleaseRecap.tsx
│   ├── public/                    # Static assets
│   │   ├── fonts/
│   │   └── brand/
│   ├── package.json
│   └── remotion.config.ts
├── videos/                        # Output directory
│   └── {initiative-name}/
│       ├── announcement.mp4
│       └── props.json
└── .github/
    └── workflows/
        └── video-generation.yml   # NEW
```

---

## Part 6: Example Video Prompt

When the `/video` command is run, here's how the AI should generate:

**Input:**

```
/video meeting-privacy-agent --type=announcement
```

**AI Process:**

1. Load PRD: Extracts problem, solution, personas
2. Load Design Brief: Visual style, key screens
3. Load Screenshots: From Storybook/Chromatic

**Generated Composition Props:**

```json
{
  "title": "Meeting Privacy Agent",
  "tagline": "Protect sensitive conversations automatically",
  "problem": "Sales teams share confidential info in meetings",
  "solution": "AI detects sensitive content and auto-protects",
  "features": [
    "Automatic detection of PII, financial data, HR info",
    "Rule-based privacy settings",
    "Audit trail for compliance"
  ],
  "screenshots": [
    "/public/screenshots/privacy-detection.png",
    "/public/screenshots/rules-config.png",
    "/public/screenshots/audit-log.png"
  ],
  "cta": "Try it in AskElephant today"
}
```

---

## Appendix: Key Remotion Resources

- **LLMs.txt (System Prompt):** https://www.remotion.dev/llms.txt
- **MCP Server:** `npx @remotion/mcp@latest`
- **Skills:** `npx skills add remotion-dev/skills`
- **Documentation:** https://www.remotion.dev/docs
- **AI Docs:** https://www.remotion.dev/docs/ai/
- **Templates:** https://www.remotion.dev/templates/
