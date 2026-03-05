# Client Usage Metrics - Placement Research

> Last updated: 2026-02-08
> Analyst: Tyler Sahagun

## Codebase Analysis

### Existing Structure

The elephant-ai web app has the following relevant areas:

1. **Admin routes** (`routes/admin/`) - Internal-only pages like user management, workspace admin
2. **Settings routes** (`routes/workspaces/$workspaceId/settings/`) - Per-workspace settings including health-score, billing, team
3. **Components** (`components/`) - Includes existing `health-score/` components
4. **Prototypes** (`components/prototypes/`) - Design exploration area (AgentCommandCenter, DeprecatePipedream, FGAEngine)

### Existing Patterns

- **Prototypes follow versioned structure:** `prototypes/[InitiativeName]/v[N]/` with component, stories, mock-data, types
- **Admin pages** live in `routes/admin/` and use `AdminIndicator` component
- **Health-score components** already exist at `components/health-score/` — potential integration point

### Placement Decision

| Option                           | Location                                                   | Pros                                            | Cons                                             | Recommendation         |
| -------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ | ---------------------- |
| **A: Admin page**                | `routes/admin/client-health`                               | Internal-only, appropriate for CS tool          | Not workspace-scoped, harder to filter by CSM    | Possible for V1        |
| **B: Settings sub-page**         | `routes/workspaces/$workspaceId/settings/`                 | Follows existing pattern (health-score is here) | Settings feels wrong for a dashboard; too buried | No                     |
| **C: Standalone prototype**      | `components/prototypes/ClientUsageMetrics/v1/`             | Fastest for validation; Storybook-deployable    | Not yet in production routing                    | **Selected for now**   |
| **D: New top-level admin route** | `routes/admin/client-health` alongside `/admin/workspaces` | Clean separation; admin-only access             | Needs new nav item                               | Best for production V1 |

### Decision: Start as Prototype (Option C), target Admin route (Option D) for production

**Rationale:**

- Prototype-first allows rapid iteration without touching production routing
- Existing `health-score/` components may provide reusable pieces
- Admin placement makes sense since this is an internal CS/Sales tool, not a client-facing feature
- Similar to how AgentCommandCenter went through 9 prototype versions before production placement

### Integration Points

| Existing Component     | Relevance                                 | Reuse Potential                         |
| ---------------------- | ----------------------------------------- | --------------------------------------- |
| `health-score/`        | Direct overlap in health scoring concepts | High — may extend or complement         |
| `settings-v2/`         | Settings panel patterns                   | Medium — layout patterns                |
| `ui/` (118 primitives) | shadcn/ui components                      | High — Badge, Card, Table, etc.         |
| `signals/`             | Signal display patterns                   | Low — different data model              |
| `admin-indicator.tsx`  | Admin-only access badge                   | High — use for access control indicator |

### Data Flow

```
PostHog Events (per workspace_id)
  → PostHog Trends API (aggregated)
    → Backend API endpoint (/api/admin/client-health)
      → React Query hook (useClientHealth)
        → ClientHealthDashboard component
```

---

_Decision made: 2026-02-08 by Tyler Sahagun_
_Production target: Admin route at `/admin/client-health`_
_Prototype location: `components/prototypes/ClientUsageMetrics/v1/`_
