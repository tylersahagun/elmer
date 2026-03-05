# Design Brief: Settings Page Redesign

## Overview

Redesign the Settings experience based on the new Figma file to unify personal + workspace settings, reduce fragmentation, and surface Beta Features inside the new Settings IA. The page should feel clean, scannable, and consistent with existing UI patterns while preserving all current functionality.

Figma: https://www.figma.com/design/JGTWtD8UHTS5PkMF4a11MT/Settings-page?node-id=0-1

Key frame (desktop): `Settings / Breakpoint=Desktop` (node `1:2836`)

## Recent Signal (2026-02-03)

Linked signal: `sig-2026-02-03-alpha-beta-feature-flags`

- Alpha visibility should be dynamic (only show when a user has an alpha flag).
- Customer self-toggle for alpha features is undecided; avoid hard-coding without policy decision.
- “Learn more” should only appear when docs exist (hide when missing).
- Integration placement preference leans toward a non-Settings area for better discovery.

## Design Goals

- Make settings discoverable and navigable with a clear IA (Workspace vs Personal).
- Preserve existing settings functionality with minimal behavior changes.
- Integrate Beta Features UI into Settings without burying it or duplicating entry points.
- Keep permission boundaries obvious (Owners/Managers vs standard users).

## Primary Users

- **Workspace Owners/Managers**: Configure workspace defaults, security, and API keys.
- **Standard Users**: Adjust personal profile and notetaker preferences.
- **Internal users**: Access Demo Mode and Beta Features without exposing internals to customers.

## Information Architecture (from Figma)

**Workspace**

- General
- Notetaker
- Security
- API keys

**Personal**

- Profile
- Notetaker
- Security
- Meeting tools

## Section Mapping (Figma → Current Settings)

| Figma Section                    | Current Implementation                                | Notes                                                         |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| Workspace / General              | `WorkspaceForm`, `Copyable` for Workspace ID + Domain | Currently in `WorkspaceSettingsTab`                           |
| Workspace / Notetaker            | `BotSettingsForm` (workspace)                         | Currently in `WorkspaceSettingsTab`                           |
| Workspace / Security             | `SecuritySettings`, `PrivacyRules` (flagged)          | Currently in `WorkspaceSettingsTab`                           |
| Workspace / API keys             | `ApiKeysTable`                                        | Currently in `WorkspaceSettingsTab`                           |
| Workspace / Meeting recap emails | Workspace auto-recap config                           | Currently in `WorkspaceSettingsTab`                           |
| Personal / Profile               | `AccountSettingsForm`                                 | Currently in `PersonalSettingsTab`                            |
| Personal / Notetaker             | `BotSettingsForm` (person)                            | Currently in `PersonalSettingsTab`                            |
| Personal / Security              | “Meetings are private” + `PrivacyRules`               | Manager+ only, in `PersonalSettingsTab`                       |
| Personal / Meeting tools         | Connected accounts + notifications                    | “Connected accounts”, notifications, and workflow preferences |
| Personal / Meeting recap emails  | User auto-recap config                                | Currently in `PersonalSettingsTab`                            |
| Personal / Delete account        | “Contact support” CTA                                 | Currently in `PersonalSettingsTab`                            |

## Beta Features Placement

**Intent:** Users should discover Beta Features from Settings, with clear stage badges and demo-mode context.

**Proposed placement (default):**

- Add a **Workspace → Beta features** entry in the sidebar.
- Render the Beta Features UI within the Settings shell (not a standalone route), preserving the existing `/settings/beta-features` route for backward compatibility.

**Release stage rules (new lifecycle):**

- **Alpha** tab visible only to internal users (AskElephant).
- **Invite-only Beta** and **Open Beta** both show a **Beta** badge in UI.
- **Open Beta** is opt-in via Early Access; **Invite-only Beta** is allowlist-only (no public toggle).

## Interaction Notes

- Sidebar groups (“Workspace”, “Personal”) should be sticky for long content.
- Section headers follow shadcn Section Header pattern in Figma.
- Section content uses cards with consistent spacing and max-width.
- Non-owners should not see workspace sections; show empty state or auto-filter.

## States & Variants

- **Loading**: Skeletons for section cards.
- **Permission gated**: Workspace group hidden or collapsed for non-owners.
- **Demo Mode**: Beta Features banner appears for internal users when enabled.

## Accessibility & UX

- Sidebar navigation should be keyboard navigable (tab + arrow support if using listbox).
- Section headings should be `<h2>` for screen reader structure.
- Avoid color-only indicators for status (use labels/Badges).

## Open Questions (Design Review)

- Should Beta Features live as a dedicated **Settings section** or remain a separate route linked from Settings?
- Should “Meeting tools” include **Notifications** and **Connected accounts** together or split?
- Are there any legacy settings that should be removed or deprecated with this redesign?
