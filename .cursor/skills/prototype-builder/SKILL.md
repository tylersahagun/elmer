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
  render: () => <ComponentJourney />,
};

export const Flow_ErrorRecovery: Story = {
  render: () => <ComponentErrorJourney />,
};
```

| Prototype Type   | Required Flows    |
| ---------------- | ----------------- |
| Simple feature   | 1 (happy path)    |
| AI feature       | 2 (happy + error) |
| Complex workflow | 3+                |

## Component Structure

Always use versioned folders in `prototypes/src/components/`:

```
prototypes/src/components/[Initiative]/
├── index.ts            # Re-exports latest
├── v1/
│   ├── Component.tsx
│   ├── Component.stories.tsx
│   ├── ComponentJourney.tsx
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

## Chromatic Deployment

After building, deploy to Chromatic:

```bash
cd prototypes
npm run build-storybook
CHROMATIC_PROJECT_TOKEN="chpt_46b823319a0135f" npm run chromatic
```

**Production URL:** `https://main--696c2c54e35ea5bca2a772d8.chromatic.com`

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

- Single option - Always explore 2-3 directions
- Missing states - All AI states required
- States without flows - Always include Flow\_\* stories
- Confident wrongness - Show uncertainty
- Surveillance vibes - "Helps YOU" not "reports ON you"
