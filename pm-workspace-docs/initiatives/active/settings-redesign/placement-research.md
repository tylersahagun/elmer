# Placement Research: Settings Redesign

## Summary

Settings Redesign is an **enhancement to existing pages**, not a new page or panel. The settings infrastructure already exists and is well-integrated into the navigation. This initiative focuses on improving clarity and messaging within the existing settings structure.

## Codebase Analysis

### Current Settings Location

```
elephant-ai/web/src/routes/workspaces/$workspaceId/settings/
├── index.tsx                    # Main settings page with tabs
├── account.tsx                  # Legacy personal settings (redirects to new)
├── workspace.tsx                # Legacy workspace settings (redirects to new)
├── team.tsx                     # Team management
├── integrations.tsx             # Integration settings
├── components/
│   ├── personal-settings-tab.tsx    # Personal settings content
│   ├── workspace-settings-tab.tsx   # Workspace settings content
│   └── beta-features-tab.tsx        # Beta opt-in content
```

### Navigation Entry Point

Settings is accessed via:
1. User profile dropdown in sidebar → "Settings" menu item
2. Direct URL: `/workspaces/{id}/settings`

**Current navigation code** (`nav-viewer.tsx` lines 112-119):
```typescript
...(unifiedSettingsEnabled
  ? [
      {
        title: 'Settings',
        url: Routes.settings.root(viewer.currentWorkspace.id) + '?tab=personal',
        icon: SettingsIcon,
      },
    ]
  : [/* legacy settings */]),
```

### UI Components Used

| Component | Source | Purpose |
|-----------|--------|---------|
| `Page` | `@/components/ui/page` | Root container |
| `PageTabs` | `@/components/ui/page` | Tab navigation |
| `PageHeader` | `@/components/ui/page` | Header with title |
| `PageContent` | `@/components/ui/page` | Scrollable content |
| `Section` | `@/components/section` | Content sections |
| `PrivacyRules` | `@/components/privacy/privacy-rules` | Privacy agent config |

### Privacy Rules Component

Currently at `components/privacy/privacy-rules.tsx`:
- Has `mode="user"` and `mode="workspace"` variants
- Used in both PersonalSettingsTab and WorkspaceSettingsTab
- **Gap identified**: Current text says "Workspace rules are applied to all members" - needs clarification that it's managers/owners only

## Placement Decision

| Decision | Value |
|----------|-------|
| **Integration Type** | Existing page enhancement |
| **Primary Location** | `routes/.../settings/components/workspace-settings-tab.tsx` |
| **Secondary Location** | `routes/.../settings/components/personal-settings-tab.tsx` |
| **Navigation Entry** | Sidebar profile dropdown → Settings |
| **Parent Context** | Settings page with Personal/Workspace/Beta tabs |

### Rationale

1. **No new navigation needed** - Settings is already discoverable
2. **Tab structure appropriate** - Personal vs Workspace separation is correct
3. **Privacy component exists** - Just needs messaging updates
4. **Role-based visibility works** - Workspace tab only shows for owners

## Required Changes

### 1. Workspace Settings Tab (`workspace-settings-tab.tsx`)

**Current**: Privacy section has generic "Workspace rules apply to all members" text

**Required**: 
- Add "Manager & Owner Only" badge next to tab title
- Replace description with explicit scope: "This rule set will run on any manager or owner calls in the workspace"
- Add feature request CTA for user-level privacy control

### 2. Personal Settings Tab (`personal-settings-tab.tsx`)

**Current**: Shows privacy rules for managers with "Meetings are private by default" toggle

**Required**:
- Add scope indicator badge ("Your Meetings Only")
- Clarify that users can mark meetings PUBLIC only (not private)
- Improve messaging around workspace vs personal scope

### 3. Settings Index (`index.tsx`)

**Current**: Tab labels are "Personal" and "Workspace"

**Required**:
- Add badge or subtitle to Workspace tab: "(Manager & Owner)"
- Consider tooltip explaining scope on hover

### 4. Privacy Rules Component (`privacy-rules.tsx`)

**Current**: Description text doesn't clarify manager/owner scope

**Required**:
- Update workspace mode description
- Add scope indicator component
- Add feature request CTA at bottom

## Mock Dependencies for Prototype

These parts are mocked in the prototype:

| Mock | Reason |
|------|--------|
| Sidebar navigation | Too complex to import; visual-only |
| GraphQL queries | Data fetching not needed for UI prototype |
| Authentication hooks | Role simulation instead |
| Toast notifications | UI feedback only |

## Production Migration Path

When promoting from prototype to production:

1. **Update existing components** (not replace)
   - Modify `workspace-settings-tab.tsx` messaging
   - Modify `personal-settings-tab.tsx` messaging
   - Update `privacy-rules.tsx` with scope indicators

2. **Add new components**
   - `ScopeIndicator` badge component (could live in `components/ui/`)
   - Feature request CTA component

3. **Update tab labels**
   - Add badge to Workspace tab in `index.tsx`

4. **No routing changes needed**
   - All URLs remain the same
   - Navigation structure unchanged

## Adjacent Features

Settings page sits alongside:
- **Team settings** - User management (same page)
- **Integration settings** - CRM connections (same dropdown)
- **Workflow settings** - Automation config (different page)

Privacy settings specifically relate to:
- **Privacy Determination Agent** - Backend processing
- **FGA Engine** - Future permissions model
- **Meeting recording** - What gets captured

## Open Questions for Production

1. **Feature flag needed?** Should redesigned messaging be behind a flag initially?
2. **A/B test?** Should we measure impact on settings-related support tickets?
3. **Documentation update?** KB articles may need updating to match new terminology

---

*Last updated: 2026-01-16*
*Generated by: /context-proto settings-redesign*
