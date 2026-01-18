# /storybook - Storybook Management Commands

Manage and validate Storybook stories for UI components.

## Usage

```
/storybook [action]
```

Actions:
- `validate` - Check for missing stories
- `check` - Validate + build
- `preview` - Start local Storybook
- `coverage` - Show coverage report
- `missing` - List components without stories

## Commands

### Validate Story Coverage

```bash
cd prototypes
npm run storybook:validate
```

Checks all components in `prototypes/src/components/` have corresponding `.stories.tsx` files.

### Full Check (Validate + Build)

```bash
cd prototypes
npm run storybook:check
```

Validates stories exist AND verifies the build succeeds.

### Start Local Preview

```bash
cd prototypes
npm run storybook
```

Opens Storybook at http://localhost:6006

### Build for Production

```bash
cd prototypes
npm run build-storybook
```

Builds static Storybook to `storybook-static/`.

## CI/CD Integration

The following happens automatically:

### On Pull Requests

1. **Story validation** - Checks all components have stories
2. **Storybook build** - Catches build errors
3. **Chromatic deploy** - Creates preview URL
4. **PR comment** - Posts preview link

### On Push to Main

1. **Story validation** - Ensures standards
2. **Chromatic deploy** - Updates production Storybook
3. **Auto-accept changes** - Baseline updates automatically

## URLs

| Environment | URL |
|-------------|-----|
| Production | https://main--696c2c54e35ea5bca2a772d8.chromatic.com |
| Chromatic Dashboard | https://www.chromatic.com/builds?appId=696c2c54e35ea5bca2a772d8 |
| Local | http://localhost:6006 |

## Story Requirements

Every component needs these stories:

### Basic Components

```typescript
export const Default: Story = { ... };
export const AllVariants: Story = { ... };  // if has variants
export const Disabled: Story = { ... };     // if can be disabled
```

### Interactive Components

```typescript
export const Default: Story = { ... };
export const Loading: Story = { ... };
export const Error: Story = { ... };
export const Empty: Story = { ... };
```

### AI-Powered Components

```typescript
export const Loading: Story = { ... };
export const LoadingLong: Story = { ... };
export const Success: Story = { ... };
export const Error: Story = { ... };
export const LowConfidence: Story = { ... };
export const Empty: Story = { ... };
```

## Troubleshooting

### Missing Stories Error

```
❌ Components missing stories:
  📦 atoms/NewComponent/NewComponent.tsx
     → Expected: atoms/NewComponent/NewComponent.stories.tsx
```

**Fix**: Create the story file following the template in `.cursor/rules/storybook-standards.mdc`

### Build Failures

```
Build failed with error...
```

**Fix**: Check the error message, usually:
- Import errors (wrong paths)
- TypeScript errors in stories
- Missing exports

### Chromatic Failures

Visual changes detected? Review and accept in Chromatic dashboard.

## Related Commands

- `/component [name]` - Create component with story
- `/proto [name]` - Create prototype with stories
- `/validate [name]` - Run jury evaluation
