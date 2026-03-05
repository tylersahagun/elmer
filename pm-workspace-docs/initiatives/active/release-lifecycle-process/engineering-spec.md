# Engineering Spec: Release Lifecycle Process

## Overview

Technical implementation for the release lifecycle process, including PostHog metadata, beta toggle API, and frontend components.

**Related PRD:** [prd.md](./prd.md)  
**Status:** Not Started  
**Type:** Technical Spec  
**Complexity:** Medium  
**Estimated Effort:** 2-3 weeks

## Recent Signal (2026-02-03)

Linked signal: `sig-2026-02-03-alpha-beta-feature-flags`

- Alpha visibility should be dynamic (only show when a user has an alpha flag).
- Customer self-toggle for alpha features is undecided; require feasibility + policy decision.
- “Learn more” should only appear when docs exist (hide when missing).
- Beta should be default; alpha is invite-only; GA removes from beta list.

---

## Technical Overview

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    PostHog      │────▶│   Backend API    │────▶│   Frontend      │
│  Feature Flags  │     │                  │     │   Settings UI   │
│  + Metadata     │     │  Beta Service    │     │   + Badges      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
   stage: "beta"          User prefs             Toggle controls
   ttl_start: date        Workspace policy       Stage badges
   ttl_days: 90           Analytics events       Toast feedback
```

### Key Decisions

1. **PostHog as source of truth** for feature flags and stage metadata
2. **User preferences** stored in database for beta opt-ins
3. **No workspace blocking** in Phase 1 (all users can opt-in)
4. **Real-time toggle effect** (no page refresh required)

---

## Data Model

### PostHog Flag Metadata Schema

Add metadata to PostHog feature flags:

```json
{
  "key": "auto-tagging-v2",
  "name": "Auto-Tagging V2",
  "active": true,
  "filters": { ... },
  "metadata": {
    "stage": "beta",
    "ttl_start": "2025-11-01",
    "ttl_days": 90,
    "description": "Automatically tag meetings based on content",
    "kb_article": "https://help.askelephant.ai/auto-tagging",
    "category": "automation",
    "owner": "palmer@askelephant.ai"
  }
}
```

### User Preferences Table

```sql
-- Extend existing user_preferences or create new table
CREATE TABLE user_beta_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  enabled_features JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- Example enabled_features value:
-- ["auto-tagging-v2", "global-chat-enabled", "internal-search"]
```

### Index for Performance

```sql
CREATE INDEX idx_user_beta_preferences_user_workspace
ON user_beta_preferences(user_id, workspace_id);
```

---

## API Design

### GET `/api/beta-features`

Returns available beta features for the current user.

**Request:**

```http
GET /api/beta-features
Authorization: Bearer {token}
```

**Response:**

```json
{
  "features": [
    {
      "key": "auto-tagging-v2",
      "name": "Auto-Tagging V2",
      "description": "Automatically tag meetings based on content",
      "stage": "beta",
      "enabled": true,
      "kb_article": "https://help.askelephant.ai/auto-tagging",
      "category": "automation"
    },
    {
      "key": "internal-search",
      "name": "Internal Search",
      "description": "Search across all your meetings and contacts",
      "stage": "alpha",
      "enabled": false,
      "kb_article": null,
      "category": "search"
    }
  ],
  "meta": {
    "total_available": 5,
    "total_enabled": 2
  }
}
```

**Logic:**

1. Get all flags with `stage` in ["alpha", "beta"] from PostHog
2. Filter to flags that are active
3. Get user's enabled features from preferences
4. Merge and return

### POST `/api/beta-features/{key}/toggle`

Enable or disable a beta feature for the current user.

**Request:**

```http
POST /api/beta-features/auto-tagging-v2/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": true
}
```

**Response (Success):**

```json
{
  "success": true,
  "feature": {
    "key": "auto-tagging-v2",
    "name": "Auto-Tagging V2",
    "enabled": true
  },
  "message": "Auto-Tagging V2 has been enabled"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Feature not found or not available for beta",
  "code": "FEATURE_NOT_AVAILABLE"
}
```

**Logic:**

1. Validate feature exists and is in alpha/beta stage
2. Update user_beta_preferences
3. Track analytics event
4. Return updated state

### GET `/api/beta-features/status` (Internal)

Returns all features with stage information for internal dashboard.

**Request:**

```http
GET /api/beta-features/status
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "stages": {
    "lab": [
      {
        "key": "process-agent",
        "name": "Process Agent",
        "ttl_start": "2025-12-15",
        "ttl_days": 90,
        "days_remaining": 45,
        "owner": "noxon@askelephant.ai"
      }
    ],
    "alpha": [...],
    "beta": [...],
    "ga": [...]
  },
  "ttl_warnings": [
    {
      "key": "privacy-agent",
      "stage": "alpha",
      "days_remaining": 12
    }
  ]
}
```

---

## Backend Service

### BetaFeatureService

```typescript
// services/BetaFeatureService.ts

export class BetaFeatureService {
  constructor(private posthog: PostHogService, private db: Database) {}

  async getAvailableFeatures(
    userId: string,
    workspaceId: string
  ): Promise<BetaFeature[]> {
    // 1. Get all flags with stage metadata from PostHog
    const allFlags = await this.posthog.getFeatureFlags();

    // 2. Filter to alpha/beta stages
    const betaFlags = allFlags.filter((f) =>
      ["alpha", "beta"].includes(f.metadata?.stage)
    );

    // 3. Get user's enabled features
    const userPrefs = await this.db.userBetaPreferences.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    const enabledKeys = userPrefs?.enabled_features || [];

    // 4. Merge and return
    return betaFlags.map((flag) => ({
      key: flag.key,
      name: flag.metadata?.name || flag.key,
      description: flag.metadata?.description || "",
      stage: flag.metadata?.stage,
      enabled: enabledKeys.includes(flag.key),
      kb_article: flag.metadata?.kb_article,
      category: flag.metadata?.category,
    }));
  }

  async toggleFeature(
    userId: string,
    workspaceId: string,
    featureKey: string,
    enabled: boolean
  ): Promise<void> {
    // 1. Validate feature exists and is beta/alpha
    const flag = await this.posthog.getFeatureFlag(featureKey);
    if (!flag || !["alpha", "beta"].includes(flag.metadata?.stage)) {
      throw new Error("Feature not available for beta");
    }

    // 2. Update user preferences
    const userPrefs = await this.db.userBetaPreferences.upsert({
      where: { userId_workspaceId: { userId, workspaceId } },
      create: {
        userId,
        workspaceId,
        enabled_features: enabled ? [featureKey] : [],
      },
      update: {
        enabled_features: enabled
          ? { push: featureKey }
          : { filter: (k) => k !== featureKey },
      },
    });

    // 3. Track analytics
    await this.posthog.capture({
      distinctId: userId,
      event: enabled ? "beta_feature_enabled" : "beta_feature_disabled",
      properties: {
        feature_key: featureKey,
        feature_stage: flag.metadata?.stage,
        workspace_id: workspaceId,
      },
    });
  }

  async isFeatureEnabled(
    userId: string,
    workspaceId: string,
    featureKey: string
  ): Promise<boolean> {
    // Check if user has opted into this beta feature
    const userPrefs = await this.db.userBetaPreferences.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    return userPrefs?.enabled_features?.includes(featureKey) || false;
  }
}
```

### Feature Flag Evaluation Update

Update the existing feature flag evaluation to check beta preferences:

```typescript
// services/FeatureFlagService.ts (modification)

async evaluateFlag(
  userId: string,
  workspaceId: string,
  flagKey: string
): Promise<boolean> {
  const flag = await this.posthog.getFeatureFlag(flagKey);

  // If flag is beta/alpha stage, check user opt-in
  if (['alpha', 'beta'].includes(flag.metadata?.stage)) {
    const betaService = new BetaFeatureService(this.posthog, this.db);
    return betaService.isFeatureEnabled(userId, workspaceId, flagKey);
  }

  // Otherwise, use standard PostHog evaluation
  return this.posthog.isFeatureEnabled(flagKey, userId);
}
```

---

## Frontend Components

### React Query Hooks

```typescript
// hooks/useBetaFeatures.ts

export function useBetaFeatures() {
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ["beta-features"],
    queryFn: () => api.get("/api/beta-features").then((r) => r.data.features),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.post(`/api/beta-features/${key}/toggle`, { enabled }),
    onMutate: async ({ key, enabled }) => {
      // Optimistic update
      await queryClient.cancelQueries(["beta-features"]);
      const previous = queryClient.getQueryData(["beta-features"]);
      queryClient.setQueryData(["beta-features"], (old: BetaFeature[]) =>
        old.map((f) => (f.key === key ? { ...f, enabled } : f))
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      queryClient.setQueryData(["beta-features"], context?.previous);
      toast.error("Failed to update feature");
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });

  return {
    features: features || [],
    isLoading,
    toggleFeature: (key: string, enabled: boolean) =>
      toggleMutation.mutate({ key, enabled }),
    isToggling: toggleMutation.isPending,
  };
}
```

### Settings Panel Component

```tsx
// components/settings/BetaFeaturesSettings.tsx

export function BetaFeaturesSettings() {
  const { features, isLoading, toggleFeature, isToggling } = useBetaFeatures();

  if (isLoading) {
    return <BetaFeaturesSkeleton />;
  }

  if (features.length === 0) {
    return (
      <EmptyState
        icon={<BeakerIcon />}
        title="No beta features available"
        description="Check back soon for new features to try!"
      />
    );
  }

  return (
    <SettingsSection>
      <SettingsHeader
        title="Beta Features"
        description="Try new features before they're released to everyone. Beta features may change or be removed."
      />
      <div className="space-y-3">
        {features.map((feature) => (
          <BetaFeatureCard
            key={feature.key}
            feature={feature}
            onToggle={(enabled) => toggleFeature(feature.key, enabled)}
            disabled={isToggling}
          />
        ))}
      </div>
    </SettingsSection>
  );
}
```

### Stage Badge Component

```tsx
// components/ui/StageBadge.tsx

const stageConfig = {
  lab: {
    label: "Experimental",
    emoji: "🧪",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
  alpha: {
    label: "Alpha",
    emoji: "🔷",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  beta: {
    label: "Beta",
    emoji: "🟡",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
};

interface StageBadgeProps {
  stage: "lab" | "alpha" | "beta";
  size?: "sm" | "md";
  showEmoji?: boolean;
}

export function StageBadge({
  stage,
  size = "sm",
  showEmoji = true,
}: StageBadgeProps) {
  const config = stageConfig[stage];

  return (
    <Tooltip content={`This feature is in ${stage}. Some things may change.`}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
          config.className
        )}
      >
        {showEmoji && <span>{config.emoji}</span>}
        {config.label}
      </span>
    </Tooltip>
  );
}
```

---

## Analytics Events

### Events to Track

| Event                     | Properties                     | Trigger                           |
| ------------------------- | ------------------------------ | --------------------------------- |
| `beta_features_viewed`    | `feature_count`                | User opens Beta Features settings |
| `beta_feature_enabled`    | `feature_key`, `feature_stage` | User enables a feature            |
| `beta_feature_disabled`   | `feature_key`, `feature_stage` | User disables a feature           |
| `beta_feature_discovered` | `feature_key`, `location`      | User first sees beta badge        |

### PostHog Implementation

```typescript
// Track when user views beta settings
posthog.capture("beta_features_viewed", {
  feature_count: features.length,
  enabled_count: features.filter((f) => f.enabled).length,
});

// Track toggle events (in service)
posthog.capture("beta_feature_enabled", {
  feature_key: featureKey,
  feature_stage: flag.metadata?.stage,
  workspace_id: workspaceId,
});
```

---

## Migration Plan

### Phase 1: Add Metadata to Existing Flags

```typescript
// Script to add stage metadata to all flags
const flagsToUpdate = [
  { key: "auto-tagging-v2", stage: "beta", ttl_days: 90 },
  { key: "internal-search", stage: "alpha", ttl_days: 60 },
  // ... all flags
];

for (const flag of flagsToUpdate) {
  await posthog.updateFeatureFlag(flag.key, {
    metadata: {
      stage: flag.stage,
      ttl_start: new Date().toISOString(),
      ttl_days: flag.ttl_days,
    },
  });
}
```

### Phase 2: Database Migration

```sql
-- Migration: create_user_beta_preferences
CREATE TABLE IF NOT EXISTS user_beta_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  enabled_features JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_user_beta_preferences_user_workspace
ON user_beta_preferences(user_id, workspace_id);
```

### Phase 3: Deploy API + Frontend

1. Deploy backend API endpoints
2. Deploy frontend components
3. Add Settings navigation item
4. Monitor for issues

---

## Testing Strategy

### Unit Tests

- `BetaFeatureService.getAvailableFeatures()` - correct filtering
- `BetaFeatureService.toggleFeature()` - state updates
- `StageBadge` - renders correctly for each stage
- `BetaFeatureCard` - toggle interaction

### Integration Tests

- API endpoints return correct data
- Toggle persists across sessions
- PostHog events fire correctly

### E2E Tests

- Full flow: Settings → Enable feature → Feature appears → Badge visible
- Toggle on/off cycle
- Empty state when no features

---

## Rollout Plan

| Week   | Deliverable                                |
| ------ | ------------------------------------------ |
| Week 1 | PostHog metadata migration + API endpoints |
| Week 2 | Frontend components + Settings integration |
| Week 3 | Testing + bug fixes + launch               |

---

## Open Technical Questions

1. **Caching:** How long to cache beta feature list client-side?
2. **Real-time sync:** If admin enables for workspace, how does user UI update?
3. **PostHog limits:** Any rate limits on metadata updates?
4. **Rollback:** Emergency disable mechanism for beta features?

---

_Engineering Owner: TBD_  
_Last Updated: January 13, 2026_
