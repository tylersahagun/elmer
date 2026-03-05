# Remotion Builder Skill

## Overview

This skill provides step-by-step procedures for creating programmatic videos with Remotion in the PM workspace context. It covers everything from project setup to production rendering.

## Prerequisites

Before using this skill, ensure:

- [ ] Node.js 16+ installed
- [ ] Remotion project initialized in workspace
- [ ] TailwindCSS configured
- [ ] Remotion skills installed

## Setup Procedure

### First-Time Setup

```bash
# From pm-workspace root
cd remotion

# If not initialized yet:
npx create-video@latest --blank
# Select: TailwindCSS: Yes, Skills: Yes

# Install dependencies
npm install

# Add Remotion MCP to Cursor (one-time)
# Settings > MCP > Add:
{
  "mcpServers": {
    "remotion-documentation": {
      "command": "npx",
      "args": ["@remotion/mcp@latest"]
    }
  }
}
```

### Project Structure

```
remotion/
├── src/
│   ├── index.ts                    # Entry point (don't modify)
│   ├── Root.tsx                    # Composition registry
│   ├── components/                 # Reusable video components
│   │   ├── AnimatedText.tsx
│   │   ├── Screenshot.tsx
│   │   ├── FeatureList.tsx
│   │   ├── CallToAction.tsx
│   │   └── Logo.tsx
│   └── compositions/               # Video templates by initiative
│       └── {InitiativeName}/
│           ├── index.tsx           # Main composition export
│           ├── Announcement.tsx    # Announcement video
│           ├── Demo.tsx            # Demo walkthrough
│           └── scenes/             # Scene components
├── public/
│   ├── brand/                      # Brand assets
│   │   ├── logo.png
│   │   └── fonts/
│   ├── screenshots/                # Prototype screenshots
│   └── icons/
├── package.json
├── remotion.config.ts
└── tailwind.config.js
```

---

## Core Patterns

### Pattern 1: Basic Composition Structure

```tsx
// compositions/{Name}/Announcement.tsx
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Solution } from "./scenes/Solution";
import { Demo } from "./scenes/Demo";
import { CTA } from "./scenes/CTA";

export interface AnnouncementProps {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  features: string[];
  screenshots: string[];
  cta: string;
}

export const Announcement: React.FC<AnnouncementProps> = (props) => {
  return (
    <AbsoluteFill className="bg-slate-900">
      <Series>
        <Series.Sequence durationInFrames={60}>
          <Hook title={props.title} tagline={props.tagline} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <Problem text={props.problem} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={180}>
          <Solution text={props.solution} features={props.features} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={540}>
          <Demo screenshots={props.screenshots} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <CTA text={props.cta} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
```

### Pattern 2: Animated Text Component

```tsx
// components/AnimatedText.tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface AnimatedTextProps {
  children: string;
  delay?: number;
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  const opacity = interpolate(adjustedFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = spring({
    fps,
    frame: adjustedFrame,
    config: { damping: 200, stiffness: 100 },
  });

  const y = interpolate(translateY, [0, 1], [30, 0]);

  return (
    <div
      className={className}
      style={{
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {children}
    </div>
  );
};
```

### Pattern 3: Screenshot Carousel

```tsx
// components/ScreenshotCarousel.tsx
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  staticFile,
} from "remotion";

interface ScreenshotCarouselProps {
  screenshots: string[];
  framesPerSlide?: number;
}

export const ScreenshotCarousel: React.FC<ScreenshotCarouselProps> = ({
  screenshots,
  framesPerSlide = 90,
}) => {
  const frame = useCurrentFrame();
  const currentIndex = Math.floor(frame / framesPerSlide) % screenshots.length;
  const progress = (frame % framesPerSlide) / framesPerSlide;

  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(progress, [0, 0.1, 0.9, 1], [0.95, 1, 1, 1.02], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex items-center justify-center">
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(screenshots[currentIndex])}
          style={{ width: 1400, height: "auto" }}
        />
      </div>
    </AbsoluteFill>
  );
};
```

### Pattern 4: Feature List with Stagger

```tsx
// components/FeatureList.tsx
import { useCurrentFrame } from "remotion";
import { AnimatedText } from "./AnimatedText";

interface FeatureListProps {
  features: string[];
  staggerDelay?: number;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  staggerDelay = 15,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <AnimatedText
            delay={index * staggerDelay}
            className="text-2xl text-slate-200"
          >
            {feature}
          </AnimatedText>
        </div>
      ))}
    </div>
  );
};
```

### Pattern 5: Transitions Between Scenes

```tsx
// Using TransitionSeries for smooth scene transitions
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";

export const VideoWithTransitions: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene1 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({ durationInFrames: 20 })}
        presentation={fade()}
      />
      <TransitionSeries.Sequence durationInFrames={120}>
        <Scene2 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({ durationInFrames: 15 })}
        presentation={wipe()}
      />
      <TransitionSeries.Sequence durationInFrames={90}>
        <Scene3 />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

---

## Composition Registration

Always register new compositions in `Root.tsx`:

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { Announcement } from "./compositions/MeetingPrivacyAgent/Announcement";

export const Root: React.FC = () => {
  return (
    <>
      {/* Existing compositions */}

      {/* New composition */}
      <Composition
        id="MeetingPrivacyAgentAnnouncement"
        component={Announcement}
        durationInFrames={1200} // 40 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Meeting Privacy Agent",
          tagline: "Protect sensitive conversations automatically",
          problem:
            "Sales teams inadvertently share confidential information...",
          solution: "AI-powered privacy detection that works in real-time",
          features: [
            "Automatic PII detection",
            "Custom privacy rules",
            "Compliance audit trail",
          ],
          screenshots: [
            "screenshots/privacy-detection.png",
            "screenshots/rules-config.png",
            "screenshots/audit-log.png",
          ],
          cta: "Try it in AskElephant today →",
        }}
      />
    </>
  );
};
```

---

## Rendering Commands

### Local Preview

```bash
cd remotion
npm run dev
# Opens http://localhost:3000
```

### Render Single Video

```bash
npx remotion render MeetingPrivacyAgentAnnouncement \
  ../videos/meeting-privacy-agent/announcement.mp4
```

### Render with Custom Props

```bash
npx remotion render MeetingPrivacyAgentAnnouncement \
  ../videos/meeting-privacy-agent/announcement.mp4 \
  --props='{"title":"Custom Title","tagline":"Custom tagline"}'
```

### Render from Props File

```bash
# Create props file
cat > ../videos/meeting-privacy-agent/props.json << 'EOF'
{
  "title": "Meeting Privacy Agent",
  "tagline": "Your meetings, protected"
}
EOF

# Render
npx remotion render MeetingPrivacyAgentAnnouncement \
  ../videos/meeting-privacy-agent/announcement.mp4 \
  --props=../videos/meeting-privacy-agent/props.json
```

### Render Options

```bash
npx remotion render CompositionId output.mp4 \
  --codec=h264 \              # h264, h265, vp8, vp9, prores
  --crf=18 \                  # Quality (lower = better, 0-51)
  --scale=1 \                 # Output scale multiplier
  --frames=0-100 \            # Render subset
  --concurrency=4 \           # Parallel frames
  --log=verbose               # Debug output
```

---

## Quality Checklist

Before finalizing any video:

### Technical

- [ ] All assets load (no 404s in console)
- [ ] Composition registered in Root.tsx
- [ ] Duration matches storyboard
- [ ] No `Math.random()` usage
- [ ] All paths use `staticFile()`

### Visual

- [ ] Text readable at 1080p
- [ ] Brand colors consistent
- [ ] Animations smooth (no jank)
- [ ] Screenshots high-res
- [ ] No clipping/overflow issues

### Content

- [ ] Messaging matches PRD
- [ ] CTA clear and actionable
- [ ] Under target duration
- [ ] No typos/errors

### Export

- [ ] Video renders without errors
- [ ] File size reasonable (<50MB for social)
- [ ] Props saved to JSON for reproducibility
- [ ] Storyboard documented

---

## Troubleshooting

### "Cannot find module" Error

```bash
# Ensure dependencies installed
npm install

# Check for missing Remotion packages
npm install @remotion/transitions @remotion/gif
```

### Slow Rendering

```bash
# Reduce concurrency if memory issues
npx remotion render CompositionId out.mp4 --concurrency=2

# Or increase for faster renders
npx remotion render CompositionId out.mp4 --concurrency=8
```

### Assets Not Loading

```tsx
// Wrong - will fail
<Img src="/screenshots/demo.png" />;

// Correct - use staticFile
import { staticFile } from "remotion";
<Img src={staticFile("screenshots/demo.png")} />;
```

### Non-Deterministic Errors

```tsx
// Wrong - breaks reproducibility
const x = Math.random() * 100;

// Correct - deterministic random
import { random } from "remotion";
const x = random("my-seed") * 100;
```

---

## Lambda Rendering (Advanced)

For production-quality, scalable rendering:

```bash
# Deploy Lambda function (one-time)
npx remotion lambda functions deploy

# Deploy site
npx remotion lambda sites create src/index.ts --site-name=pm-videos

# Render on Lambda
npx remotion lambda render pm-videos MeetingPrivacyAgentAnnouncement
```

See: https://www.remotion.dev/docs/lambda/setup
