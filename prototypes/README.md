# Prototypes

Standalone Storybook prototypes for PM Workspace.

## Quick Start

```bash
npm install        # First time only
npm run storybook  # Opens http://localhost:6006
```

## Structure

```
prototypes/
├── .storybook/           # Storybook configuration
├── src/
│   ├── components/
│   │   ├── ui/           # Shared UI primitives (shadcn/ui style)
│   │   ├── Button/       # Example component
│   │   └── [ProjectName]/ # Your prototype components
│   ├── lib/
│   │   └── utils.ts      # Utility functions (cn, etc.)
│   └── index.css         # Global styles (Tailwind)
├── package.json
└── tailwind.config.js
```

## Creating a Prototype

### 1. Create the folder

```bash
mkdir src/components/YourPrototype
```

### 2. Create the component

```typescript
// src/components/YourPrototype/YourPrototype.tsx
import * as React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface YourPrototypeProps {
  // Define your props
}

export function YourPrototype({ ...props }: YourPrototypeProps) {
  return (
    <div className="rounded-lg border p-4">
      {/* Your component */}
    </div>
  );
}
```

### 3. Create stories

```typescript
// src/components/YourPrototype/YourPrototype.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourPrototype } from './YourPrototype';

const meta = {
  title: 'Prototypes/YourPrototype',  // Use 'Prototypes/' prefix
  component: YourPrototype,
  tags: ['autodocs'],
} satisfies Meta<typeof YourPrototype>;

export default meta;
type Story = StoryObj<typeof meta>;

// Design options (always create 2-3)
export const OptionA_MaxControl: Story = { args: { ... } };
export const OptionB_Balanced: Story = { args: { ... } };
export const OptionC_Efficient: Story = { args: { ... } };

// Required AI states
export const Loading: Story = { args: { isLoading: true } };
export const Error: Story = { args: { error: 'Something went wrong' } };
export const Empty: Story = { args: { data: [] } };
```

### 4. Export from index

```typescript
// src/components/YourPrototype/index.ts
export { YourPrototype } from './YourPrototype';
export type { YourPrototypeProps } from './YourPrototype';
```

## Best Practices

### Design Options

Always create 2-3 design directions for comparison:

| Option | User Control | Trust Required | Best For |
|--------|-------------|----------------|----------|
| A | Maximum | Low | New users, skeptics |
| B | Balanced | Medium | Most users |
| C | Minimal | High | Power users |

### Required AI States

Every AI-driven component needs these stories:

- Loading - Initial loading state
- LoadingLong - Extended loading (>3 seconds)
- Success - Happy path
- Error - Error with recovery action
- LowConfidence - AI uncertainty state
- Empty - No data state

## Available UI Components

The ui/ folder contains shadcn/ui-style components:

- button, input, label, select, switch
- tabs, textarea, tooltip, badge
- collapsible, separator, multi-select

Import them like:

```typescript
import { Button } from '../ui/button';
import { Input } from '../ui/input';
```

## Commands

```bash
npm run storybook       # Start development server
npm run build-storybook # Build static version
```

## Example

See src/components/ExamplePrototype/ for a complete example with:
- Multiple design options
- All required AI states
- Proper TypeScript types
- Storybook stories with documentation
