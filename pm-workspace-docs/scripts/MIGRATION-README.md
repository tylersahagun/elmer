# PostHog Early Access Feature Migration

This script automates the migration of PostHog feature flags to Early Access Features, enabling the Beta Features Settings UI in AskElephant.

## Prerequisites

1. **PostHog Personal API Key** with these scopes:
   - `early_access_feature:write` - Create/update early access features
   - `feature_flag:read` - Read existing feature flags

2. **PostHog Project ID** - Found in your project URL

## Setup

```bash
# 1. Navigate to scripts directory
cd pm-workspace-docs/scripts

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your PostHog credentials

# 3. Install dependencies (if needed)
npm install dotenv
```

## Configuration

Edit `migrate-flags-to-early-access.ts` and update the `FLAG_MIGRATIONS` array:

```typescript
const FLAG_MIGRATIONS: FlagMigration[] = [
  {
    flagKey: 'your-feature-flag-key',  // Must exist in PostHog
    name: 'Display Name',               // Shown in Beta Features UI
    description: 'User-facing description',
    stage: 'beta',                       // 'concept' | 'alpha' | 'beta'
    scope: 'personal',                   // 'personal' | 'workspace'
    documentationUrl: 'https://...',     // Optional KB link
    category: 'navigation',              // Optional grouping
  },
  // ... more flags
];
```

### Stage Mapping

| PostHog Stage | AskElephant UI Tab | User Access |
|---------------|-------------------|-------------|
| `concept` | Coming Soon | Register interest only |
| `alpha` | Labs | Self-serve opt-in, experimental |
| `beta` | Beta | Self-serve opt-in, stable |
| `general-availability` | N/A (remove from EA) | Available to all |

### Scope Types

| Scope | Description | Who Can Toggle |
|-------|-------------|----------------|
| `personal` | Affects only the user's account | Any user |
| `workspace` | Affects entire organization | Workspace owners/managers |

## Usage

```bash
# Run the migration
npx ts-node migrate-flags-to-early-access.ts

# Or with node directly (requires ts-node)
./migrate-flags-to-early-access.ts
```

## What the Script Does

1. **Fetches** all existing feature flags from PostHog
2. **Fetches** all existing early access features
3. **For each flag in FLAG_MIGRATIONS:**
   - Validates the feature flag exists
   - Creates or updates the early access feature
   - Links it to the existing feature flag

## After Migration

### 1. Release Features in PostHog

Early access features must be **released** before they appear in `getEarlyAccessFeatures()`:

1. Go to PostHog → Feature Flags → Early Access Management
2. Click on each feature
3. Click **Release** to make it available

### 2. Verify in AskElephant

1. Start the dev server: `cd elephant-ai && npm run dev -w web`
2. Navigate to **Settings → Beta Features**
3. Verify features appear and toggles work

### 3. Test Enrollment

```typescript
// In browser console with PostHog loaded:
posthog.getEarlyAccessFeatures((features) => {
  console.log('Available features:', features);
});

// Toggle a feature:
posthog.updateEarlyAccessFeatureEnrollment('feature-key', true);
```

## Troubleshooting

### "Feature flag not found"
- Verify the `flagKey` exactly matches the PostHog flag key
- Check the flag exists and is active in PostHog

### "API error (401)"
- Verify your API key is correct
- Ensure the API key has required scopes

### "API error (403)"
- Your API key may not have `early_access_feature:write` scope
- Create a new key with the correct permissions

### Features not appearing in UI
- Features must be **released** in PostHog after creation
- Check browser console for `getEarlyAccessFeatures` errors
- Verify PostHog is initialized correctly in your app

## API Reference

- [Early Access Features API](https://posthog.com/docs/api/early-access-feature)
- [Feature Flags API](https://posthog.com/docs/api/feature-flags)
- [Early Access Feature Management](https://posthog.com/docs/feature-flags/early-access-feature-management)

## Related Files

- `elephant-ai/web/src/components/beta-features/BetaFeaturesSettings.tsx` - UI component
- `elephant-ai/web/src/components/beta-features/types.ts` - Type definitions
- `pm-workspace-docs/initiatives/release-lifecycle-process/prd.md` - Product requirements
- `pm-workspace-docs/initiatives/release-lifecycle-process/engineering-spec.md` - Technical spec
