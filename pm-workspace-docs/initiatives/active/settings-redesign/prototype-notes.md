# Prototype Notes: Settings Redesign

## Current State

The settings page already exists with a tabbed interface (Personal / Workspace / Beta Features). The key issue is that workspace privacy settings don't clearly communicate that they only apply to managers and owners, not regular users.

**Existing components affected:**
- `routes/workspaces/$workspaceId/settings/index.tsx` - Main settings page
- `routes/workspaces/$workspaceId/settings/components/workspace-settings-tab.tsx` - Workspace content
- `routes/workspaces/$workspaceId/settings/components/personal-settings-tab.tsx` - Personal content
- `components/privacy/privacy-rules.tsx` - Privacy agent configuration

## Prototype Goals

1. **Demonstrate clear scope messaging** - Show how "Manager & Owner Only" badge and alert improve clarity
2. **Show feedback mechanism** - CTA for users wanting user-level privacy control
3. **Validate navigation discovery** - Confirm users can find settings easily
4. **Test in-context appearance** - See how redesigned sections fit with existing page structure

## Context Prototype

### Files Created

```
elephant-ai/web/src/components/prototypes/SettingsRedesign/
├── index.ts                           # Exports
├── types.ts                           # TypeScript interfaces
├── PrivacySettingsRedesign.tsx        # Core privacy components
│   ├── ScopeIndicator                 # Badge showing scope
│   ├── WorkspacePrivacySettings       # Manager/Owner privacy config
│   └── PersonalPrivacySettings        # Individual user preferences
├── contexts/
│   ├── SettingsPageContext.tsx        # Full page context mock
│   │   ├── MockSidebar                # Navigation context
│   │   ├── SettingsTabs               # Tab bar with badge
│   │   ├── SettingsPageInContext      # Full page demo
│   │   └── SettingsNavigationDiscovery # User journey view
└── SettingsRedesign.stories.tsx       # Storybook stories
```

### Storybook Stories

| Story | Shows |
|-------|-------|
| `ScopeIndicators` | Badge components for scope messaging |
| `WorkspacePrivacy` | Redesigned workspace privacy section |
| `PersonalPrivacyManager` | Personal settings for managers |
| `PersonalPrivacyUser` | Personal settings for regular users |
| `InContext_WorkspaceTab` | Full page in workspace tab |
| `InContext_PersonalTab` | Full page in personal tab |
| `InContext_NonOwner` | Page view for non-owners |
| `NavigationDiscovery` | User journey to find settings |
| `Comparison_WorkspaceVsPersonal` | Side-by-side of both modes |

### Key Design Decisions

1. **Amber color for scope indicator** - Draws attention without being alarming
2. **Alert banner at top** - Impossible to miss the scope clarification
3. **Feature request CTA** - Bottom of section, doesn't interrupt main flow
4. **Badge in tab bar** - Subtle but visible indicator of scope

## Iterations

### Iteration 1 (2026-01-16)
**Date:** 2026-01-16
**Changes:**
- Created initial context prototype
- Added ScopeIndicator badge component
- Built WorkspacePrivacySettings with explicit messaging
- Built PersonalPrivacySettings with role-based options
- Created full page context with mock navigation
- Added navigation discovery view showing user journey

**Key Elements:**
- Amber alert banner: "These privacy rules apply to manager and owner calls only"
- Scope badge: "Managers & Owners Only" or "Your Meetings Only"
- Feature request CTA: "Want privacy controls for user calls too?"
- Tab badge: Workspace tab shows "(Manager & Owner)"

**Feedback:** 
- Jury evaluation: 52% combined pass (below 60% threshold)
- Applicable concerns: onboarding guidance, visibility into AI behavior, navigation

### Iteration 2 (2026-01-16)
**Date:** 2026-01-16
**Trigger:** Jury evaluation feedback

**Jury Feedback Addressed:**

| Feedback | Solution |
|----------|----------|
| Need clearer onboarding guidance (18 mentions) | Enhanced tooltips with step-by-step explanations |
| Need better visibility into what it's doing (14 mentions) | PrivacyAgentPreview component showing exactly what agent will do |
| Navigation confusion | SettingsNavigationLink component for cross-navigation |
| Compliance/security concerns (30 mentions) | Trust messaging throughout UI |
| Edge case concerns | EdgeCaseExplanation tooltip for manager+user meetings |

**New Components Added:**

```
elephant-ai/web/src/components/prototypes/SettingsRedesign/v2/
├── index.ts                           # V2 exports
├── PrivacySettingsV2.tsx              # Enhanced privacy components
│   ├── ScopeIndicatorV2               # Badge with detailed tooltip
│   ├── WhatsNewBanner                 # For existing users
│   ├── PrivacyAgentPreview            # Shows what agent will do
│   ├── SettingsNavigationLink         # Cross-navigation links
│   ├── EdgeCaseExplanation            # Mixed meeting tooltip
│   ├── WorkspacePrivacySettingsV2     # Enhanced workspace settings
│   └── PersonalPrivacySettingsV2      # Enhanced personal settings
├── SettingsPageV2.tsx                 # Full page context
└── SettingsRedesignV2.stories.tsx     # V2 Storybook stories
```

**New Stories:**

| Story | Shows |
|-------|-------|
| `V2_WhatsNewBanner` | Banner for existing users |
| `V2_PrivacyAgentPreview` | Preview of agent behavior |
| `V2_NavigationLinks` | Cross-setting navigation |
| `V2_ScopeIndicators` | Enhanced scope badges |
| `V2_EdgeCaseExplanation` | Mixed meeting tooltip |
| `V2_WorkspacePrivacy` | Full workspace section |
| `V2_PersonalPrivacy_Manager` | Personal for managers |
| `V2_PersonalPrivacy_User` | Personal for regular users |
| `V2_InContext_WorkspaceTab` | Full page workspace |
| `V2_InContext_PersonalTab` | Full page personal |
| `V2_InContext_ReturningUser` | Page without What's New |
| `V2_InContext_NonOwner` | Non-owner view |
| `V2_Comparison` | Side-by-side comparison |

**Key Enhancements:**

1. **What's New Banner** - Explains changes to existing users, dismissible
2. **Enhanced Tooltips** - Step-by-step explanation of how Privacy Agent works
3. **Privacy Agent Preview** - Shows exactly what active rules will do
4. **Cross-Navigation** - Easy links between workspace/personal settings
5. **Edge Case Tooltip** - Explains manager+user meeting handling
6. **Trust Messaging** - Security/compliance assurance throughout
7. **Help Links** - Links to documentation for deeper learning

**Open Questions:**
- Should What's New banner persist across sessions or be dismissible once?
- How long should banner be shown to existing users?
- Should Privacy Agent Preview update in real-time as rules are toggled?

## Production Checklist

Before promoting to production:

- [ ] Update `workspace-settings-tab.tsx` with scope messaging
- [ ] Update `personal-settings-tab.tsx` with scope messaging  
- [ ] Update `privacy-rules.tsx` with ScopeIndicator component
- [ ] Update `index.tsx` to add badge to Workspace tab
- [ ] Create `ScopeIndicator` as reusable UI component
- [ ] Add feature request tracking/submission endpoint
- [ ] Update help docs / KB articles
- [ ] QA with actual managers/owners/users
- [ ] Measure support ticket impact post-launch

## Related Decisions

### Privacy Agent Scope Decision
**Date:** 2026-01-16
**Deciders:** Woody, Bryan, Skylar, Tyler
**Decision:** Workspace privacy settings apply to managers/owners only. Users can mark public but not private.

**Rationale:**
> "Users, because they can't change it to private or public, if it marks as private, they can't change it back. So until we give people the ability to let decide if they want their users to have private meetings or not, then it doesn't make sense for us to turn it on for people."

---

## Iteration History

| Version | Date | Changes | Trigger |
|---------|------|---------|---------|
| V1 | 2026-01-16 | Initial context prototype | `/context-proto` |
| V2 | 2026-01-16 | Enhanced onboarding, visibility, navigation | Jury feedback |

---

*Last updated: 2026-01-16*
*Total iterations: 2*
*Owner: Skylar/Tyler*
