---
name: prototype-builder
description: Build human-centric AI prototypes with multiple creative directions, required states, and interactive flow stories. Use when creating Storybook components or UI mockups.
---

# Prototype Builder Skill

Specialized knowledge for building Storybook prototypes that meet human-centric AI design standards.

## When to Use

- Creating new UI prototypes
- Building Storybook stories
- Implementing AI feature states
- Designing interactive user flows

## Inputs

Before building, check for these initiative artifacts:

- `pm-workspace-docs/initiatives/active/[name]/prd.md` (REQUIRED)
- `pm-workspace-docs/initiatives/active/[name]/design-brief.md` (REQUIRED)
- `pm-workspace-docs/initiatives/active/[name]/visual-directions.md` (recommended)
- `pm-workspace-docs/initiatives/active/[name]/competitive-landscape.md` (optional, for competitive context)
- `.interface-design/system.md` (design system tokens)
- `figma-spec*.json` and `figma-language.md` (when present, for Figma token grounding)

### When Visual Directions Exist

If `visual-directions.md` exists and a direction has been chosen:

1. **Read the chosen direction** -- its design vocabulary, component names, and mockup images become the visual reference for the prototype
2. **Do NOT reinvent the visual language** -- the validated mockup defines the look and feel
3. **Focus the prototype on functionality** -- interactions, state transitions, data loading, error handling, and user flows
4. The 2-3 Storybook creative options should vary on **interaction pattern** and **information density**, NOT on visual style (which is already settled)

If `visual-directions.md` does NOT exist, the prototype proceeds as before with full creative freedom on visual direction.

## Design Principles

### Trust Before Automation

- New features start as suggestions, not automations
- Show receipts (evidence) for every AI decision
- Make confidence levels explicit
- Graceful failure > silent failure

### Emotional Design

- **Visceral**: Does it look trustworthy at first glance?
- **Behavioral**: Does it work predictably?
- **Reflective**: Does user feel augmented, not replaced?

### Persona Awareness

- **Reps fear**: Surveillance, replacement, embarrassment
- **Managers fear**: Losing touch, surveillance culture
- **RevOps fear**: Ungovernable AI, lack of auditability

## Creative Exploration (Required)

For each major component, create 2-3 directions:

| Direction | User Control | Trust Required | Best Persona        |
| --------- | ------------ | -------------- | ------------------- |
| Option A  | Maximum      | Low            | New users, skeptics |
| Option B  | Balanced     | Medium         | Most users          |
| Option C  | Minimal      | High           | Power users         |

### When Visual Directions Are Validated

If `visual-directions.md` has a chosen direction, the creative exploration shifts:

- **Visual style is fixed** -- all options use the validated direction's design vocabulary and component patterns
- **Options vary on behavior** -- how much control, how much AI autonomy, how information is prioritized
- Use the design vocabulary terms from `visual-directions.md` (e.g., "glass metric cards", "activity river") as actual component names in the prototype

| Direction | Visual Style        | Interaction Model          | Information Density             |
| --------- | ------------------- | -------------------------- | ------------------------------- |
| Option A  | Validated direction | Manual-first, user drives  | Detailed, all data visible      |
| Option B  | Validated direction | Balanced, AI suggests      | Curated, progressive disclosure |
| Option C  | Validated direction | AI-driven, user supervises | Summary-first, drill-down       |

## Required AI States

Every AI feature needs ALL states:

| State           | Visual        | Copy              | Animation        |
| --------------- | ------------- | ----------------- | ---------------- |
| Loading (short) | Spinner       | None              | Pulse            |
| Loading (long)  | Progress      | "Analyzing..."    | Transitions      |
| Success         | Check, muted  | Affirming         | Scale+fade 150ms |
| Error           | Warning       | Honest + solution | Gentle shake     |
| Low Confidence  | Muted, dotted | "I think..."      | None             |
| Empty           | Illustration  | Encouraging       | Fade in          |

## Required: Flow Stories

Every prototype MUST include interactive journey stories:

```typescript
export const Flow_HappyPath: Story = {
  render: () => <ComponentJourney scenario="happy" />,
};

export const Flow_ErrorRecovery: Story = {
  render: () => <ComponentJourney scenario="error" />,
};
```

| Prototype Type   | Required Flows                                  |
| ---------------- | ----------------------------------------------- |
| Simple feature   | 1 (happy path)                                  |
| AI feature       | 2 (happy + error)                               |
| Complex workflow | 3+                                              |
| Any feature      | + Discovery flow (how user finds this)          |
| Any feature      | + Activation flow (first-time setup/onboarding) |
| AI feature       | + Day-2 flow (returning user, ongoing value)    |

### Experience Flow Requirements

Every prototype MUST tell the full user story, not just show the feature:

1. **Discovery flow** - How does the user know this feature exists? Start from the user's natural context (e.g., dashboard, sidebar, notification), not from the feature itself.
2. **Activation flow** - What does first-time setup look like? Can the user enable/configure this without CSM assistance?
3. **Day-2 flow** - What does the returning user see? What value compounds over time?

```typescript
export const Flow_Discovery: Story = {
  render: () => <ComponentJourney scenario="discovery" />,
};

export const Flow_Activation: Story = {
  render: () => <ComponentJourney scenario="first-time-setup" />,
};

export const Flow_Day2: Story = {
  render: () => <ComponentJourney scenario="returning-user" />,
};
```

## Required: Interactive Demo + Walkthrough

Every version MUST include:

- **Interactive demo** story (live click-through of the full experience)
- **Walkthrough** story (step-by-step narration of the flow)

```typescript
export const Demo_Clickthrough: Story = {
  render: () => <Demo />,
};

export const Walkthrough: Story = {
  render: () => <Walkthrough />,
};
```

## Codebase Consistency (Required)

Prototypes must look and feel like they belong in the existing app. Before building any component:

### Use What Already Exists

1. **Check `elephant-ai/web/src/components/ui/`** for available shadcn/ui primitives. Use `Button`, `Card`, `Badge`, `Sheet`, `Dialog`, `Select`, `Input`, `Tabs`, etc. directly. Do NOT recreate these.
2. **Check existing domain folders** in `elephant-ai/web/src/components/` for patterns. If there's already a `health-score/` folder with `HealthScoreCard.tsx`, reference how it structures props, handles states, and applies styles.
3. **Check existing pages** in `elephant-ai/web/src/pages/` or `elephant-ai/web/src/app/` for layout conventions. Match the same padding, spacing, header patterns, and content area structure.

### Match Visual Patterns

- **Card patterns**: Follow the existing Card → CardHeader → CardContent structure with the same spacing (`p-6`, `pt-0`)
- **Status colors**: Use the established palette (emerald for success, amber for warning, rose for error, blue for info)
- **Typography**: Use the same text size hierarchy (`text-sm` for body, `text-xs` for secondary, `font-medium` for labels)
- **Borders and shadows**: Follow the existing `border bg-card shadow-sm` pattern for cards
- **Icons**: Use Lucide icons at the same sizes as existing components (`h-4 w-4` inline, `h-5 w-5` standalone)

### When the Design System File May Be Stale

The `.interface-design/system.md` file is a snapshot. If a prototype looks inconsistent with the live app, check the actual component source files in `elephant-ai/web/src/components/ui/` — the source code is always authoritative over the design system document.

## Component Structure

Always use versioned folders. The initiative root should contain only `index.ts` and version folders (no loose components or views). All version-specific components (new or adapted AskElephant components) live inside the version folder:

```
prototypes/[Initiative]/
├── index.ts           # Re-exports latest
├── v1/
│   ├── Component.tsx
│   ├── Component.stories.tsx
│   ├── ComponentJourney.tsx
│   ├── Demo.tsx
│   ├── Demo.stories.tsx
│   ├── Walkthrough.tsx
│   ├── Walkthrough.stories.tsx
│   └── types.ts
```

## Tech Stack

- React 18 + TypeScript (strict)
- Tailwind CSS
- shadcn/ui from `@/components/ui/`

## Storybook Title Pattern

```typescript
const meta = {
  title: "Prototypes/[Initiative]/v1/[ComponentName]",
  component: ComponentName,
};
```

For demo and walkthrough, use:

```typescript
title: "Prototypes/[Initiative]/v1/Demo";
title: "Prototypes/[Initiative]/v1/Walkthrough";
```

## Image Generation for Mockups (Cursor 2.4)

When a quick visual is needed before building full components, use image generation:

### When to Generate Images

- **Early concept exploration** - Before committing to code
- **Stakeholder communication** - Quick visuals for feedback
- **Design exploration** - Testing multiple directions rapidly
- **Architecture diagrams** - Visualizing data flows or system design

### How to Use

Describe the mockup in natural language:

```
"Generate an image of a dashboard showing user engagement metrics with a sidebar navigation, using a clean modern design with blue accent colors"
```

### Best Practices

- Reference existing design system colors/patterns in descriptions
- Generated images save to `assets/` by default
- Use for exploration, not final implementation
- Follow up with coded Storybook components for production

### Example Prompts

| Use Case         | Prompt Example                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Dashboard mockup | "A meeting insights dashboard with cards showing action items, sentiment trends, and speaker breakdown" |
| Mobile view      | "Mobile-first meeting summary view with collapsible sections and swipe actions"                         |
| Error state      | "Error message UI showing a failed CRM sync with retry option and helpful guidance"                     |
| Flow diagram     | "User flow diagram from meeting recording to CRM update showing each step"                              |

---

## Anti-Patterns

🚩 Single option - Always explore 2-3 directions
🚩 Missing states - All AI states required
🚩 States without flows - Always include Flow\_\* stories
🚩 Missing interactive demo or walkthrough
🚩 Loose components/views at initiative root
🚩 Confident wrongness - Show uncertainty
🚩 Surveillance vibes - "Helps YOU" not "reports ON you"
🚩 Prototype starts at the feature, not at the user's natural entry point
🚩 No discovery flow - How does the user know this exists?
🚩 No activation/onboarding flow - First-time experience missing
🚩 No "day 2" story - What does the returning user see?