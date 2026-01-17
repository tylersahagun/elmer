# Storybook Guide

## Overview

Storybook is used as a **component library and design system documentation tool**. You see individual components in isolation, which is perfect for prototyping and design exploration.

---

## Running Storybook

### Standalone Prototypes (Default)

```bash
cd prototypes
npm install        # First time only
npm run storybook  # Starts on http://localhost:6006
```

### Product Repo Prototypes (When Configured)

```bash
cd product-repos/[repo-name]
npm run storybook  # Check package.json for exact command
```

---

## Story Organization

### Prototypes

All prototypes use the `Prototypes/` prefix:

```typescript
const meta = {
  title: 'Prototypes/[ProjectName]/[ComponentName]',
  component: ComponentName,
  tags: ['autodocs'],
};
```

### UI Components

Base components use category prefixes:

```typescript
const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
};
```

---

## File Organization

### Standalone Prototypes

```
prototypes/
├── .storybook/
│   ├── main.ts           # Config: story paths, addons
│   └── preview.tsx       # Global decorators, providers
└── src/
    ├── ui/               # Shared UI components
    ├── lib/              # Utilities
    └── [ProjectName]/    # Prototype components
        ├── Component.tsx
        └── Component.stories.tsx
```

### Product Repo Prototypes

```
product-repos/[repo]/
├── .storybook/           # Repo-specific config
└── src/components/
    ├── prototypes/       # Prototype components
    │   └── [ProjectName]/
    └── ui/               # UI primitives
```

---

## Creating Stories

### Basic Pattern

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Prototypes/[ProjectName]/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithProps: Story = {
  args: {
    variant: 'primary',
    isLoading: false,
  },
};
```

### Required AI States

Every AI-driven component needs these stories:

```typescript
export const Loading: Story = {
  args: { isLoading: true },
};

export const LoadingLong: Story = {
  args: { isLoading: true, loadingMessage: 'Analyzing...' },
};

export const Success: Story = {
  args: { status: 'success', data: mockData },
};

export const Error: Story = {
  args: { status: 'error', error: 'Something went wrong' },
};

export const LowConfidence: Story = {
  args: { confidence: 0.3, showWarning: true },
};

export const Empty: Story = {
  args: { data: [] },
};
```

### Creative Options Pattern

For prototypes, create multiple design directions:

```typescript
// High user control
export const OptionA_MaxControl: Story = {
  args: {
    showConfirmation: true,
    autoSave: false,
    showEvidence: true,
  },
};

// Balanced
export const OptionB_Balanced: Story = {
  args: {
    showConfirmation: true,
    autoSave: false,
  },
};

// Streamlined
export const OptionC_Efficient: Story = {
  args: {
    showConfirmation: false,
    autoSave: true,
  },
};
```

---

## Building Static Version

```bash
cd prototypes  # or product-repos/[repo]
npm run build-storybook    # Outputs to storybook-static/
```

---

## Best Practices

### Do

✅ Co-locate stories with components (`Component.stories.tsx` next to `Component.tsx`)
✅ Use autodocs for API documentation
✅ Create all AI states (loading, error, empty, low-confidence)
✅ Explore multiple design directions for prototypes
✅ Use realistic mock data

### Don't

❌ Create stories for pages/routes (Storybook is for components)
❌ Make API calls in stories (use mocked data)
❌ Skip error/empty states
❌ Use only one design option

---

## Storybook IS Good For

- Exploring the design system
- Component API documentation
- Isolated development
- Visual comparison of options
- Prototype review and feedback

## Storybook IS NOT For

- Full app preview
- Real data testing
- Integration testing
- User flow testing
