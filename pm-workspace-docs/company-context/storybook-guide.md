# Storybook Guide for AskElephant

## Overview

Storybook is used in elephant-ai as a **component library and design system documentation tool**, NOT as a full application preview. You will see individual components in isolation, not the entire platform flow.

## Current Coverage

### By the Numbers

| Metric | Count |
|--------|-------|
| Story files | 92 |
| Total React components | 541 |
| **Coverage** | **~17%** |

### What HAS Stories

Storybook coverage focuses on:

1. **UI Primitives** (`components/ui/`) - **Best coverage**
   - Button, Input, Select, Checkbox, Dialog, Drawer
   - Card, Badge, Avatar, Tooltip, Tabs
   - Form elements, Date pickers, Combobox
   - Theme colors visualization

2. **Engagement Components** (`components/engagements/`)
   - MyEngagementCard, MyUpcomingEngagementCard
   - EngagementTranscript, MediaClipDurationSlider
   - Log history events (status changes, privacy updates)

3. **Person/Contact Components** (`components/person/`)
   - PersonAvatarWithName, ParticipantAvatar
   - ContactDetail, AvatarStack

4. **Chat Components** (`components/chat/messages/`)
   - Message display components

5. **Navigation Components** (`components/navigation/`)
   - ContentHeader, 404 page

6. **Miscellaneous**
   - ErrorPageContent, SplashScreen, Section
   - AvatarEditor, ObjectLink, NoContent

### What DOESN'T Have Stories

| Area | Has Stories? |
|------|--------------|
| Routes/Pages | ❌ No |
| Workflows | ❌ No |
| Integrations | ❌ No |
| AI Agents | ❌ No |
| Calendar | ❌ No |
| Filters | ❌ No |
| Signals | ❌ No |
| Tags | ❌ No |
| Search | ❌ No |
| Permissions | ❌ No |
| Knowledge Base | ❌ No |
| Health Score | ❌ No |
| Contacts (full) | ❌ No |
| Company views | Partial |

## Story Patterns Used

### Pattern 1: UI Component with Variants

```typescript
// Standard shadcn/ui style
const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {...},
} satisfies Meta<typeof Button>;

export const Default: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
```

### Pattern 2: GraphQL Fragment Components

```typescript
// Uses makeFragmentData for realistic mock data
const engagementFragment = (overrides?: object) =>
  makeFragmentData({
    id: '1',
    title: 'Meeting Title',
    // ... realistic data
  }, MyEngagementCardFragment);

const meta = {
  title: 'elephant/My Engagement Card',
  component: MyEngagementCard,
  args: { engagement: engagementFragment() },
};
```

## Running Storybook

### Local Development

```bash
# From elephant-ai root
npm run storybook          # Starts on http://localhost:6006

# Or from workspace
npm run storybook -w web
```

### Building Static Version

```bash
npm run build-storybook    # Outputs to web/storybook-static/
```

## Deployment

### PR Previews (Firebase Hosting)

When you push a PR that changes story files, CI automatically:
1. Detects changes in `web/.storybook/**` or `web/**/*.stories.tsx`
2. Builds Storybook
3. Deploys to Firebase Hosting preview channel
4. Comments on PR with preview URL

### Chromatic (Visual Testing)

```bash
npm run chromatic          # Publishes to Chromatic for visual diff testing
```

Note: Chromatic is not in CI - run manually when needed.

## File Organization

```
elephant-ai/web/
├── .storybook/
│   ├── main.ts           # Config: story paths, addons
│   └── preview.tsx       # Global decorators, providers
└── src/
    └── components/
        ├── ui/
        │   ├── button.tsx
        │   └── button.stories.tsx    # Co-located
        └── engagements/
            ├── my-engagement-card.tsx
            └── my-engagement-card.stories.ts
```

## Global Providers (preview.tsx)

Stories are wrapped with:
- `MemoryRouter` - React Router context
- `MockedProvider` - Apollo GraphQL mocks
- `UrqlProvider` - URQL GraphQL client
- `AuthContext.Provider` - Mock auth user
- `AnalyticsProvider` - Mock analytics
- `TooltipProvider` - Radix tooltip context
- Theme toggling (light/dark)

## What Storybook IS Good For

✅ **Exploring the design system** - See all button variants, form elements, etc.
✅ **Component API documentation** - Props, variants, examples via autodocs
✅ **Isolated development** - Build components without running full app
✅ **Visual regression testing** - Chromatic catches unintended changes
✅ **Onboarding new devs** - Quick way to see available components

## What Storybook IS NOT

❌ **Full app preview** - Can't navigate through the product
❌ **Real data testing** - Uses mocked data only
❌ **Integration testing** - No real API calls
❌ **User flow testing** - Single components, not journeys

## Expanding Coverage

To add a new story:

```typescript
// components/my-component/my-component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MyComponent } from './my-component';

const meta = {
  title: 'category/MyComponent',  // e.g., 'ui/Button', 'elephant/EngagementCard'
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

## Prototype Components

Prototypes are now built directly in the elephant-ai codebase:

**Location:** `elephant-ai/web/src/components/prototypes/`

This allows prototypes to:
- Use real UI components from `@/components/ui/`
- Appear in the same Storybook as production components
- Be tested in context (e.g., inside WorkflowNodeSheet)
- Go through normal PR review

Navigate to "Prototypes" section in Storybook to see active prototypes.

```bash
# All components in one Storybook
cd elephant-ai
npm run storybook -w web
```

