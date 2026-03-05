# Prototype Notes: Release Lifecycle Process

**Date:** January 13, 2026  
**Prototype Location:** `prototypes/src/components/BetaFeatures/`  
**Storybook Path:** `Prototypes/ReleaseLifecycle/`

---

## Overview

Interactive prototypes for the Beta Features Settings UI, implementing three creative directions to enable informed design decisions.

---

## Components Built

### 1. StageBadge

Reusable badge component for indicating feature maturity.

| Stage    | Visual | Use Case                 |
| -------- | ------ | ------------------------ |
| 🔷 Alpha | Blue   | Internal testing         |
| 🟡 Beta  | Amber  | Invite-only or open beta |

**Variants:**

- `StageBadge` - Default with tooltip
- `StageBadgeInline` - Compact for inline text
- `StageBadgeNav` - Minimal for navigation items

### 2. BetaFeatureCard

Individual feature toggle card with three design options.

### 3. BetaFeaturesSettings

Main settings panel with three creative directions.

---

## Creative Options

### Option A: Maximum Control

**Philosophy:** Every beta feature requires explicit confirmation before enabling.

**Visual Treatment:**

- Confirmation dialog appears before enabling
- Warning about feature stage inline
- More text-heavy, informational

**Best For:**

- Low-trust users
- High-stakes features (privacy, data)
- Enterprise customers with compliance concerns
- New users unfamiliar with beta programs

**Tradeoffs:**
| Pro | Con |
|-----|-----|
| ✅ Maximum informed consent | ❌ More friction to explore |
| ✅ Reduces accidental enablement | ❌ May feel paternalistic |
| ✅ Clear warning per-feature | ❌ Slower for power users |

**Story:** `OptionA_MaxControl`

---

### Option B: Balanced (RECOMMENDED)

**Philosophy:** Simple toggle with immediate effect and toast feedback.

**Visual Treatment:**

- Standard switch toggle
- Toast notification confirms action
- Shows feature location when enabled
- Clean, familiar pattern

**Best For:**

- Most users
- Building trust progressively
- Balancing control with efficiency
- Users familiar with settings patterns

**Tradeoffs:**
| Pro | Con |
|-----|-----|
| ✅ Quick and easy | ❌ Less ceremony for risky features |
| ✅ Clear feedback via toast | ❌ User may not read toast |
| ✅ Familiar toggle pattern | |
| ✅ Shows next steps (location) | |

**Story:** `OptionB_Balanced`

---

### Option C: Experiments Explorer

**Philosophy:** Discovery-focused experience that makes beta testing feel special.

**Visual Treatment:**

- Large, clickable cards (whole card is toggle)
- Gamified progress indicator ("3 of 5 experiments active")
- Hero header with branding
- Grid layout for visual impact

**Best For:**

- Power users who enjoy experimentation
- Companies with strong beta culture
- Early-stage products building community
- Users who want to feel like insiders

**Tradeoffs:**
| Pro | Con |
|-----|-----|
| ✅ Most engaging/exciting | ❌ Takes more screen space |
| ✅ Builds community feeling | ❌ May feel too playful for enterprise |
| ✅ Large click targets | ❌ Click-to-toggle less familiar |
| ✅ Progress gamification | ❌ Harder to scan quickly |

**Story:** `OptionC_Labs`

---

## Comparison Table

| Criteria                 | Option A (Confirm) | Option B (Balanced) | Option C (Explorer) |
| ------------------------ | ------------------ | ------------------- | ------------------- |
| **Trust level required** | Low                | Medium              | High                |
| **User control**         | Maximum            | Balanced            | Click-to-toggle     |
| **Efficiency**           | Lower              | Medium              | Highest             |
| **Learning curve**       | Medium             | Lowest              | Medium              |
| **Best persona**         | Cautious users     | Most users          | Power users         |
| **Screen space**         | Compact            | Compact             | Spacious            |
| **Enterprise fit**       | High               | High                | Medium              |
| **Excitement factor**    | Low                | Medium              | High                |

---

## Recommendation

**Option B (Balanced)** is recommended for initial release because:

1. **Familiar pattern** - Toggle switches are universally understood
2. **Low friction** - Users can quickly explore without barriers
3. **Clear feedback** - Toast confirms action and provides next steps
4. **Scalable** - Works well with 1 feature or 20 features
5. **Enterprise-appropriate** - Professional without being boring

### Consider Hybrid Approach

For specific high-stakes features (e.g., Privacy Determination Agent), use Option A's confirmation dialog while keeping Option B for most features. This provides:

- Default ease for routine betas
- Extra caution for sensitive features

---

## States Implemented

All options include these states:

| State             | Visual Treatment                |
| ----------------- | ------------------------------- |
| **Default**       | Features listed with toggles    |
| **Loading**       | Skeleton cards                  |
| **Empty**         | Friendly message + illustration |
| **Error**         | Error message + retry button    |
| **Toggling**      | Spinner on affected toggle      |
| **Success Toast** | Bottom-right confirmation       |

---

## Accessibility Checklist

- [x] Keyboard navigable (Tab + Space to toggle)
- [x] ARIA labels on all interactive elements
- [x] Color + text for badges (not color-only)
- [x] Focus states visible
- [x] Screen reader announcements for stage

---

## Open Questions for Stakeholder Review

1. **Confirmation for specific features?** Should high-stakes features (privacy, data) use Option A confirmation even if we go with Option B default?

2. **Badge placement elsewhere?** Where else should badges appear? (Navigation, page headers, tooltips)

3. **Empty state design:** Should we show a more elaborate illustration or keep it simple?

4. **Mobile adaptation:** How should the Experiments Explorer (Option C) adapt to mobile?

5. **Feature categories:** Should we group features by category (Automation, AI, Privacy) or show flat list?

---

## How to Review

### Local Development

```bash
cd prototypes
npm run storybook
# Opens at http://localhost:6006
```

### Navigation

1. Go to **Prototypes → ReleaseLifecycle → SettingsPanel**
2. View all three options and their states
3. Use **📊 All Options Comparison** story for side-by-side view
4. Interact with toggles to see toast notifications

### Key Stories to Review

| Story                 | What to Evaluate               |
| --------------------- | ------------------------------ |
| `Comparison`          | All three options side-by-side |
| `OptionB_Balanced`    | Recommended default experience |
| `OptionA_MaxControl`  | High-control alternative       |
| `OptionC_Labs`        | Discovery-focused alternative  |
| `StageBadge/AllSizes` | Badge system overview          |

---

## Files Created

```
prototypes/src/components/BetaFeatures/
├── types.ts                    # TypeScript types + mock data
├── StageBadge.tsx              # Badge component + variants
├── BetaFeatureCard.tsx         # Three card options
├── BetaFeaturesSettings.tsx    # Three settings panel options
├── BetaFeatures.stories.tsx    # All Storybook stories
└── index.ts                    # Exports
```

---

## PostHog Integration

The prototype is now wired up to PostHog's Early Access Feature Management system.

### Production Component Location

```
elephant-ai/web/src/components/beta-features/
├── BetaFeaturesSettings.tsx    # Main settings UI
├── StageBadge.tsx              # Badge components
├── types.ts                    # Type definitions
└── index.ts                    # Exports
```

**Branch:** `feat/beta-features-ui`

### How It Works

1. **Fetch features:** `posthog.getEarlyAccessFeatures()` retrieves available beta features
2. **Toggle enrollment:** `posthog.updateEarlyAccessFeatureEnrollment(key, boolean)` opts users in/out
3. **Check status:** `posthog.isFeatureEnabled(key)` checks current state

### Creating Early Access Features in PostHog

**Option 1: Migration Script (Recommended for bulk)**

```bash
cd pm-workspace-docs/scripts
# Configure environment
export POSTHOG_API_KEY="phx_your_key"
export POSTHOG_PROJECT_ID="12345"

# Run migration
npx ts-node migrate-flags-to-early-access.ts
```

See `pm-workspace-docs/scripts/MIGRATION-README.md` for full documentation.

**Option 2: Manual via PostHog UI**

1. Go to PostHog → Feature Flags → Early Access Management
2. Click "Create early access feature"
3. Fill in name, description, stage, and link to feature flag
4. **Release** the feature (required for users to see it)

### PostHog API Endpoints

| Endpoint                                      | Method | Purpose              |
| --------------------------------------------- | ------ | -------------------- |
| `/api/projects/:id/early_access_feature/`     | GET    | List all EA features |
| `/api/projects/:id/early_access_feature/`     | POST   | Create EA feature    |
| `/api/projects/:id/early_access_feature/:id/` | PATCH  | Update EA feature    |

### Stage Mapping

| PostHog Stage | UI Tab      | Description             |
| ------------- | ----------- | ----------------------- |
| `concept`     | Coming Soon | Users register interest |
| `alpha`       | Alpha       | Internal testing        |
| `beta`        | Beta        | Stable, pre-GA          |

### Testing Locally

```bash
# Start dev server
cd elephant-ai && npm run dev -w web

# Navigate to Settings → Beta Features
# Or view in Storybook
npm run storybook -w web
```

### Important Notes

1. **Features must be released** in PostHog before `getEarlyAccessFeatures()` returns them
2. **Opt-in overrides flag conditions** - User opt-in/out takes precedence over release conditions
3. **Scope support** - Add `{ scope: "workspace" }` to flag properties for workspace-level features

---

## Next Steps

1. ✅ **Prototype built** - Components in `feat/beta-features-ui` branch
2. ✅ **PostHog integration** - Using Early Access Feature Management API
3. ✅ **Migration script** - Bulk migrate flags to EA features
4. ⬜ **Create EA features** - Run migration script for target flags
5. ⬜ **Release features** - Mark as released in PostHog UI
6. ⬜ **QA testing** - Verify toggle behavior end-to-end
7. ⬜ **Stakeholder review** - Demo to product/leadership
8. ⬜ **Merge to main** - Ship to production

---

_Last Updated: January 20, 2026_
