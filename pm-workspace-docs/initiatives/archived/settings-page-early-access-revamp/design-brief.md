# Design Brief: Settings Page & Early Access Revamp

## Overview

Design a unified Settings experience that embeds the Early Access (beta/alpha) UI with clear stage messaging, privacy scope clarity, and dynamic documentation links. This consolidates the settings IA redesign and the beta features UI.

**Figma:** https://www.figma.com/design/JGTWtD8UHTS5PkMF4a11MT/Settings-page?node-id=0-1

**Merged from:**

- `settings-page-redesign/design-brief.md`
- `release-lifecycle-process/design-brief.md`
- `settings-redesign/prd.md` (privacy scope decisions)

---

## Design Goals

1. Discoverability: Users can find Settings and Beta Features quickly.
2. Clarity: Stage badges and scope messaging remove ambiguity.
3. Control: Users can opt into betas with clear expectations.
4. Trust: Messaging is transparent about instability and scope.

---

## Information Architecture

**Workspace**

- General
- Notetaker
- Security / Privacy (manager-owner scope)
- API keys
- Beta Features

**Personal**

- Profile
- Notetaker
- Security
- Meeting tools

---

## Beta Features Placement

- Beta Features is a Workspace section inside Settings.
- Maintain legacy `/settings/beta-features` route for direct links.

**Release stage rules:**

- Alpha visible only when a user has alpha flags.
- Invite-only Beta and Open Beta use the same Beta badge.
- GA removes the item from the beta list.

**Dynamic behaviors:**

- "Learn more" visible only when docs exist.
- Alpha copy uses "early test version of a feature".

---

## Privacy Scope Messaging

- Workspace privacy rules apply to managers/owners only.
- Users can mark meetings public, not private.
- Provide clear labels and an explanatory banner.

---

## States & Variants

- Loading: skeleton cards for sections.
- Permission gated: hide workspace sections for non-owners.
- Demo mode: internal banner for demo users.

---

## Accessibility

- Sidebar and section headers are keyboard navigable.
- Use headings for structure; avoid color-only indicators.

---

## Open Questions

1. Should integrations live outside Settings for better discovery?
2. Should alpha toggles be self-serve or view-only?
3. Should Meeting tools be split (notifications vs connected accounts)?
