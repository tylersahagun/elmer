# Placement Research: CRM Readiness Diagnostic

> **Initiative:** `crm-readiness-diagnostic`
> **Created:** 2026-01-21
> **Purpose:** Determine optimal location for CRM readiness diagnostic components in the `elephant-ai` codebase

---

## Feature Classification

| Attribute | Value | Notes |
|-----------|-------|-------|
| **Type** | component-family | Diagnostic engine + score UI + issue cards + remediation guidance |
| **Scope** | integrated | Connects to HubSpot, embedded in settings/onboarding flows |
| **Domain** | integrations | Specifically CRM/HubSpot integration health |

### Feature Components

1. **CRM Readiness Score** — Overall health score with traffic light indicator (Green/Yellow/Red)
2. **Issue Detail Cards** — Individual cards for each detected configuration problem
3. **Remediation Guidance** — How-to-fix instructions with links to HubSpot
4. **Readiness Summary Panel** — Aggregate view shown in settings/integrations

---

## Recommended Location

### Primary Recommendation

```
elephant-ai/web/src/components/integrations/crm-readiness/
├── CrmReadinessScore.tsx           # Main score component with traffic light
├── CrmReadinessScore.stories.tsx   # Storybook stories
├── CrmIssueCard.tsx                # Individual issue card
├── CrmIssueCard.stories.tsx        # Storybook stories
├── CrmReadinessPanel.tsx           # Full panel combining score + issues
├── CrmReadinessPanel.stories.tsx   # Storybook stories
├── hooks/
│   └── useCrmReadiness.ts          # Hook for fetching/caching diagnostic data
├── types.ts                        # TypeScript interfaces
└── index.ts                        # Barrel export
```

**Rationale:**
- Groups with existing integrations components (`integrations/icons.tsx`, `integrations/utils.ts`)
- Clear domain ownership: "this is about CRM integration health"
- Follows existing pattern of domain-specific folders (`crm-update/`, `health-score/`, `signals/`)
- Easy to import from integration settings page

### Alternative Options Considered

| Option | Path | Pros | Cons | Decision |
|--------|------|------|------|----------|
| **A** | `components/crm-update/` | Already CRM-related | Different concern (field updates, not health) | ❌ Rejected - scope mismatch |
| **B** | `components/health-score/` | Similar scoring pattern | Different domain (engagement health, not CRM config) | ❌ Rejected - domain mismatch |
| **C** | `components/onboarding/` | Shown during onboarding | Also shown in settings (not just onboarding) | ❌ Rejected - too narrow |
| **D** | `components/integrations/hubspot/` | HubSpot-specific | Could expand to Salesforce later; keep generic | ❌ Rejected - too specific |

---

## Integration Points

### Navigation Entry Points

The diagnostic should be accessible from multiple places:

| Location | Entry Point | Priority |
|----------|-------------|----------|
| **Settings > Integrations** | After HubSpot connected, show readiness panel inline | P0 |
| **Onboarding Flow** | After OAuth, before workflow creation | P1 |
| **Workflow Builder** | Warning banner if CRM not ready | P2 |
| **Global Chat** | "Check my HubSpot health" command | P2 |

### Primary Embedding Context: Settings > Integrations

```
File: web/src/routes/workspaces/$workspaceId/settings/integrations.tsx
```

After the HubSpot `<Integration />` component renders (when connected), add:

```tsx
{isHubspot && connected && (
  <CrmReadinessPanel workspaceId={workspaceId} />
)}
```

This placement ensures:
- Diagnostic appears where users manage their HubSpot connection
- Only shown when HubSpot is connected (not for disconnected state)
- Naturally adjacent to "Import Calls from HubSpot" button

### Secondary Embedding Context: Onboarding

Could be added to post-OAuth onboarding step:

```
File: web/src/components/onboarding/signup-step2-form.tsx (or new step)
```

Show abbreviated readiness check after HubSpot OAuth completes.

### Data Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| **useCrmReadiness** | Custom hook | Fetches diagnostic data from backend |
| **GraphQL Query** | `CrmReadinessQuery` | New query to add |
| **HubSpot Integration Status** | Existing | From `IntegrationDetailsFragment` |
| **Workspace Context** | Existing | From `useCurrentWorkspace` |

### API Requirements (Backend)

New GraphQL query needed:

```graphql
query CrmReadiness($workspaceId: ID!) {
  crmReadiness(workspaceId: $workspaceId) {
    score           # 0-100
    status          # GREEN | YELLOW | RED
    issues {
      id
      severity      # CRITICAL | WARNING | INFO
      title
      description
      howToFix
      hubspotLink   # Deep link to HubSpot setting
    }
    lastChecked     # ISO timestamp
  }
}
```

---

## Existing Patterns to Follow

### Similar Components

| Component | Path | Pattern to Reuse |
|-----------|------|------------------|
| `HealthScoreDetailsCard` | `components/health-score/health-score-details-card.tsx` | Card + score display + dropdown menu pattern |
| `Integration` | `routes/.../settings/integrations.tsx` | Integration-specific rendering, conditional UI based on state |
| `ConnectToCRMPlatform` | `components/connect-to-crm-platform.tsx` | CRM-related card UI, navigation to settings |

### Code Patterns

**Analytics tracking:**
```tsx
const analyticsId = createAnalyticsId('component-crm-readiness');
// Use: data-analyticsid={analyticsId('button-refresh')}
```

**Card structure:**
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
```

**Icons:**
```tsx
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
// Green: CheckCircle2, Yellow: AlertTriangle, Red: XCircle
```

### Reusable Utilities

| Import | From | Purpose |
|--------|------|---------|
| `Card`, `CardContent`, etc. | `@/components/ui/card` | Card layout |
| `Button` | `@/components/ui/button` | Action buttons |
| `Tooltip`, `TooltipContent` | `@/components/ui/tooltip` | Help text |
| `Separator` | `@/components/ui/separator` | Visual dividers |
| `createAnalyticsId` | `@/lib/utils` | Analytics tracking |
| `useCurrentWorkspace` | `@/hooks/useCurrentWorkspace` | Workspace context |

---

## Component File Structure

When building, create this structure:

```
elephant-ai/web/src/components/integrations/crm-readiness/
├── CrmReadinessScore.tsx           # Traffic light score indicator
│   - Props: { score: number, status: 'GREEN' | 'YELLOW' | 'RED' }
│   - Displays: Circle with color, percentage, status text
│
├── CrmReadinessScore.stories.tsx   # Storybook coverage
│   - Stories: Green, Yellow, Red, Loading
│
├── CrmIssueCard.tsx                # Individual issue card
│   - Props: { issue: CrmIssue, onDismiss?: () => void }
│   - Displays: Title, description, how-to-fix, HubSpot link
│
├── CrmIssueCard.stories.tsx        # Storybook coverage
│   - Stories: Critical, Warning, Info, With link, Without link
│
├── CrmReadinessPanel.tsx           # Full panel for settings page
│   - Props: { workspaceId: string }
│   - Combines: Score + issue list + refresh button
│   - Uses: useCrmReadiness hook
│
├── CrmReadinessPanel.stories.tsx   # Storybook coverage
│   - Stories: Ready (green), NeedsWork (yellow), NeedsHelp (red), Loading, Error
│
├── hooks/
│   └── useCrmReadiness.ts          # Data fetching hook
│       - Returns: { data, loading, error, refetch }
│       - Caches: Results for 1 hour
│
├── types.ts                        # TypeScript interfaces
│   - CrmReadinessStatus = 'GREEN' | 'YELLOW' | 'RED'
│   - CrmIssue = { id, severity, title, description, howToFix, hubspotLink }
│   - CrmReadinessData = { score, status, issues, lastChecked }
│
└── index.ts                        # Barrel exports
    - export { CrmReadinessScore } from './CrmReadinessScore'
    - export { CrmIssueCard } from './CrmIssueCard'
    - export { CrmReadinessPanel } from './CrmReadinessPanel'
    - export { useCrmReadiness } from './hooks/useCrmReadiness'
    - export * from './types'
```

---

## UI/UX Specifications

### Traffic Light Score Display

| Status | Color | Icon | Message |
|--------|-------|------|---------|
| **GREEN** | `text-green-600 bg-green-50` | `CheckCircle2` | "Your HubSpot is ready for AskElephant" |
| **YELLOW** | `text-yellow-600 bg-yellow-50` | `AlertTriangle` | "A few things to improve for best results" |
| **RED** | `text-red-600 bg-red-50` | `XCircle` | "Important configuration needed" |

### Issue Card Severity

| Severity | Style | Priority Display |
|----------|-------|------------------|
| **CRITICAL** | `border-red-500` | Show first, prominent |
| **WARNING** | `border-yellow-500` | Show after critical |
| **INFO** | `border-slate-300` | Show last, collapsible |

### Messaging (Non-Accusatory)

❌ Don't say: "Your HubSpot is misconfigured" / "You have problems"
✅ Do say: "Optimization opportunities" / "Ways to unlock full potential"

---

## Pre-Flight Checklist

Before building the prototype:

- [x] Confirmed component doesn't already exist (searched for `diagnostic`, `readiness`, `crm-health`)
- [x] Identified all UI primitives to import from `@/components/ui/`
- [x] Mapped data dependencies (new hook + GraphQL query needed)
- [x] Documented navigation integration approach (Settings > Integrations)
- [x] Listed similar components for pattern reference (`health-score-details-card.tsx`)
- [ ] Backend API endpoint defined (needs engineering input)
- [ ] HubSpot API permissions confirmed (needs engineering input)

---

## Open Questions for Engineering

1. **What HubSpot API endpoints can we use to check:**
   - Object association patterns (deals → contacts → companies)
   - Property existence and population rates
   - Data freshness (last updated timestamps)

2. **Performance considerations:**
   - How long will diagnostic take? (<30 sec target)
   - Should we cache results? (Suggest: yes, 1 hour TTL)
   - Background job vs. on-demand?

3. **Permissions:**
   - Do we need additional OAuth scopes for HubSpot?
   - Owner-only, or all workspace members can see?

---

## Next Steps

1. **Prototype UI** — `/proto crm-readiness-diagnostic` to build Storybook components
2. **API Design** — Work with backend team to define GraphQL schema
3. **Integration** — After prototype validation, integrate into `integrations.tsx`
4. **Testing** — Connect to real HubSpot account and validate diagnostic accuracy

---

## References

- [PRD: CRM Readiness Diagnostic](./prd.md)
- [Research: CRM Readiness Diagnostic](./research.md)
- [Integrations Settings Page](../../../elephant-ai/web/src/routes/workspaces/$workspaceId/settings/integrations.tsx)
- [Health Score Card Pattern](../../../elephant-ai/web/src/components/health-score/health-score-details-card.tsx)
