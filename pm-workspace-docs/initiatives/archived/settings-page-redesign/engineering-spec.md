# Engineering Spec: Settings Page Redesign

## Summary

Implement the new Settings page IA from Figma and integrate Beta Features UI into the unified Settings shell. Preserve all existing settings functionality and permission rules while consolidating entry points.

## PR Strategy

- **Beta Features base**: PR #5136 (Beta Features UI v4 + Demo Mode) is open/draft. Confirm demo-mode wrapper changes from #5150 are present.
- **Settings shell**: PR #5278 (early-access settings redesign shell) is open/draft; use this as the base branch for Settings IA work.
- **Consolidation plan**: Rebase #5278 on `main`, then cherry-pick Beta Features components from #5136 if needed. Keep #5150 closed.

## Scope

**In scope**

- Unified Settings layout with sidebar + section cards.
- Reorganized Personal/Workspace settings content.
- Beta Features UI embedded into Settings shell.
- Legacy settings routes redirecting to new sections.

**Out of scope**

- New settings feature functionality.
- Changes to underlying GraphQL schema or settings mutations.

## Primary Files

- Unified Settings route: `elephant-ai/web/src/routes/workspaces/$workspaceId/settings/index.tsx`
- Settings content components: `elephant-ai/web/src/routes/workspaces/$workspaceId/settings/components/*`
- Legacy routes: `account.tsx`, `workspace.tsx`
- Beta features UI: `elephant-ai/web/src/components/beta-features/*`
- Navigation: `elephant-ai/web/src/components/navigation/nav-viewer.tsx`
- Routing: `elephant-ai/web/src/routes/index.ts`

## Architecture Notes

### Layout

- Use a Settings shell with a left sidebar (Workspace + Personal groups).
- Right panel renders section cards in sequence or anchored routing.
- Keep max width aligned with Figma (~750px content column).

### Section Composition

- Reuse existing components in `PersonalSettingsTab` and `WorkspaceSettingsTab` by splitting into section components (e.g., `WorkspaceSecuritySection`, `PersonalNotetakerSection`).
- Create a small mapping layer to render “Workspace” vs “Personal” sections based on permissions.

### Beta Features Integration

- Render `BetaFeaturesSettings` inside the Settings shell.
- Maintain `/settings/beta-features` route for direct linking (redirect or render inside shell).
- Preserve demo-mode behavior for internal users (banner + toggle).

## Feature Flags

- `unified-settings-page`: gate new Settings layout if needed during rollout.
- `beta-features-v4-ui`: Beta Features UI exposure (existing in PR #5136).
- `useFeatureFlagWithDemoMode`: ensures demo mode hides beta flags in nav and chat.

## Permissions

- **Workspace group**: only Owners/Managers.
- **Personal group**: all users.
- **Beta features**: visible to all users; workspace-level toggles gated by Owner/Manager (current behavior).
- **Demo mode**: internal users only.

## Analytics

- Maintain existing `createAnalyticsId` usage for settings toggles.
- Add analytics IDs for sidebar navigation clicks and Beta Features entry.

## QA / Test Plan

**Roles**

- Owner: sees Workspace + Personal sections, Beta Features workspace toggles.
- Manager: sees Workspace + Personal sections, Beta Features workspace toggles.
- Standard user: Personal only, Beta Features personal toggles only.
- Internal user: Demo Mode toggle visible; Beta Features banner reflects demo state.

**Scenarios**

- Legacy routes `/settings/account` and `/settings/workspace` redirect to new IA.
- Beta Features entry works from Settings shell and from direct route.
- Notifications, integrations, bot settings, and recap email settings still work.
- Demo Mode hides beta-flagged nav items but Settings still loads.

## QA Matrix (Execution)

Status: Pending execution after early-access flag is live.

- [ ] Owner + flag **off** → legacy settings route behavior
- [ ] Owner + flag **on** → workspace + personal sections render; beta features section visible
- [ ] Manager + flag **on** → workspace + personal sections render; beta toggles gated
- [ ] Standard user + flag **on** → personal only; workspace sections hidden
- [ ] Internal user + flag **on** → demo mode toggle visible; demo banner renders

## Dependencies

- Resolve open comment threads in PR #5136 and #5278 before merging.
- Align IA and grouping with Design (Adam/Skylar).

## Open Questions

- Should Beta Features live as a dedicated Settings section or remain a separate route?
- Should “Meeting tools” include Notifications + Connected accounts or split?
- Any settings to deprecate in the redesigned IA?
