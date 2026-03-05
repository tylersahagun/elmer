# Remotion Overview (PMM Video POC)

This hub captures the essential Remotion concepts, where it fits in our PM workflow, and how to get started quickly.

## What Remotion is

Remotion is a framework for creating videos programmatically using React components. It lets us treat video like UI: reusable components, timelines, props, and data‑driven rendering. [Remotion Docs](https://www.remotion.dev/docs) provide the canonical getting started and API references.

## Core concepts (PMM‑friendly)

- **Composition**: A video scene described as a React component + a duration + a resolution.
- **Timeline**: A sequence of compositions (or a single composition with timed layers).
- **Render**: The act of turning compositions into a video file.
- **Assets**: Images, videos, audio, or SVG used in frames.
- **Props / Data**: JSON inputs that drive the visuals (feature highlights, quotes, metrics).

## Why this fits AskElephant

- Outcome‑oriented artifacts (post‑prototype, post‑release) that tell a clear story.
- Controlled, repeatable PMM content with reliable inputs (PRD, prototype notes, release notes).
- Avoids “generic AI summaries” by explicitly mapping to outcomes and trust guardrails.

## Quick start (developer setup)

Remotion’s recommended scaffold uses `npx create-video@latest`, then `npm run dev` to preview. [Creating a new project](https://www.remotion.dev/docs) documents prerequisites and basic workflows. The API reference lives at [remotion.dev/docs/api](https://www.remotion.dev/docs/api).

## Where to go next

- Prompting and authoring guidance: `prompting-guide.md`
- Use‑case and anti‑use‑case framing: `use-cases.md`
- Workflow integration: `workflow-integration.md`
