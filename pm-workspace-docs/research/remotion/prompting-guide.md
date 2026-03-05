# Remotion Prompting Guide (PMM Videos)

This guide standardizes how we prompt and structure Remotion videos to stay aligned with AskElephant outcomes and trust principles.

## When to use prompting

- Early exploration of a video concept before code polish.
- Drafting a new composition with a clear storyboard and assets list.
- Rapid iteration on a specific narrative (problem → insight → outcome).

If you are using Claude Code, Remotion documents a workflow that starts with `npx create-video@latest`, then `npm run dev` and `claude` in a separate terminal. [Prompting videos with Claude Code](https://www.remotion.dev/docs/ai/claude-code).

## Required inputs (non‑negotiable)

- **Narrative goal**: “What behavior/outcome should the viewer take?”
- **Persona**: Sales rep, sales leader, CSM, or RevOps (from `company-context/personas.md`).
- **Evidence**: Quote or metric that grounds the story (from research or release notes).
- **Call‑to‑action**: What should the viewer do after watching?

## Interactive intake (recommended)

Before drafting prompts, capture:

- **Include**: must‑have points, scenes, assets, metrics, or quotes
- **Exclude**: sensitive items, claims, or topics to avoid
- **Build/manage**: asset sources, cadence, update model, and render format

## Composition spec (what your prompt must define)

- **Title / Hook**: 3–7 words, outcome‑focused.
- **Scenes**: 4–8 scenes with durations (seconds) and a 1‑line objective each.
- **Visual style**: Typography + color scheme aligned to brand.
- **Assets**: Logos, screenshots, icons, or illustration needs.
- **Audio**: Optional music or VO notes.
- **Output**: Resolution, fps, and total duration.

## Suggested prompt template

Use this as the starting point for the Remotion subagent or Claude Code:

```
Goal: <Outcome for viewer>
Persona: <Rep/Leader/CSM/RevOps>
Evidence: <quote or metric>
CTA: <what to do next>

Composition:
- Title: <hook>
- Scenes (duration in seconds):
  1) <scene objective>
  2) <scene objective>
  3) <scene objective>
  4) <scene objective>
- Visual style: <brand notes>
- Assets needed: <screenshots/icons/logos>
- Audio: <music/VO notes>
- Output: <resolution>, <fps>, <total duration>

Remotion request:
- Create a composition named <Name>
- Use props from <path to brief JSON>
- Include gentle transitions between scenes
- Export a preview-ready composition
```

## Quality gates (before rendering)

- **Outcome chain** is explicit (problem → insight → behavior change → business impact).
- **Trust** is preserved: no misleading claims or generic AI hype.
- **Evidence** is cited on screen when possible.
- **Brevity**: 30–90 seconds unless explicitly longer.

## Rendering notes

Remotion’s standard dev workflow uses `npm run dev` for preview and `npm run remotion` for studio, depending on template. [Creating a new project](https://www.remotion.dev/docs) documents the default scripts.
