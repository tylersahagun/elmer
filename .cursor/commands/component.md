# /component - Create UI Component with Storybook Story

Create a new UI component with its corresponding Storybook story file.

## Usage

```
/component [name] [category]
```

- `name`: Component name (PascalCase, e.g., `ActionButton`)
- `category`: Optional. One of: `atoms`, `molecules`, `organisms`, `brand` (default: `atoms`)

## Examples

```
/component StatusBadge atoms
/component MetricCard molecules
/component FilterPanel organisms
```

## Workflow

### Step 1: Determine Location

Based on category, place files in:

| Category | Location |
|----------|----------|
| atoms | `prototypes/src/components/atoms/[Name]/` |
| molecules | `prototypes/src/components/molecules/[Name]/` |
| organisms | `prototypes/src/components/organisms/[Name]/` |
| brand | `prototypes/src/components/brand/[Name]/` |

### Step 2: Create Component File

Create `[Name].tsx`:

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface [Name]Props {
  /** Prop description */
  className?: string;
}

const [Name] = React.forwardRef<HTMLDivElement, [Name]Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('', className)}
        {...props}
      >
        [Name] Component
      </div>
    );
  }
);
[Name].displayName = '[Name]';

export { [Name] };
```

### Step 3: Create Story File

Create `[Name].stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { [Name] } from './[Name]';

const meta: Meta<typeof [Name]> = {
  title: '[Category]/[Name]',
  component: [Name],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of the [Name] component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define prop controls
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

// Add more stories for variants, states, etc.
```

### Step 4: Create Index File

Create `index.ts`:

```typescript
export * from './[Name]';
```

### Step 5: Update Category Index

Add export to the category's `index.ts`:

```typescript
export * from './[Name]';
```

### Step 6: Validate

Run validation:

```bash
cd prototypes
npm run storybook:validate
npm run storybook  # Preview locally
```

## Output

Reply with:
1. Files created
2. Storybook preview instructions
3. Next step suggestions

## Notes

- Always follow the naming convention: PascalCase for components
- Story title should match the category: `Atoms/[Name]`, `Molecules/[Name]`, etc.
- Include `tags: ['autodocs']` for automatic documentation
- Add argTypes for all configurable props
