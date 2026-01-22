# Feature Research

**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email/password login | Basic auth, fallback for non-Google users | MEDIUM | Need secure password storage, validation |
| Google OAuth login | Most users prefer OAuth convenience | LOW | Single click, no password to remember |
| Password reset | Users forget passwords constantly | MEDIUM | Email flow with secure token |
| Session persistence | "Remember me" across browser refresh | LOW | JWT or cookie-based, standard pattern |
| User profile | Need to know who's logged in | LOW | Name, email, avatar from OAuth |
| Workspace creation | Users need to organize their work | LOW | Simple form, name + description |
| Email invitations | Standard way to add collaborators | MEDIUM | Email template, magic link, role selection |
| Role display | Users need to know their permissions | LOW | Badge/label showing Admin/Member/Viewer |
| Logout | Exit session securely | LOW | Clear cookies, redirect to login |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Magic link invites | Frictionless onboarding for collaborators | MEDIUM | Auto-create account + join workspace in one click |
| Workspace switcher | Notion-style fast context switching | LOW | Dropdown in header, instant workspace change |
| Activity log | Audit trail for PM decisions | MEDIUM | Track who did what, when |
| Role-based UI | Hide actions user can't perform | LOW | Clean UX, no permission errors |
| Share button | Figma-style one-click sharing | LOW | Opens invite modal from any workspace view |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Magic link login (general) | Passwordless convenience | Email dependency for every login, delivery issues | OAuth + password, magic links only for invites |
| Public share links | Easy external sharing | Workspaces contain company context, security risk | Email invites only, explicit access control |
| Granular permissions | Per-project access control | Complexity explosion, hard to reason about | Simple 3-role model covers 95% of cases |
| Real-time presence | See who's online | Implementation complexity, minimal value for PM workflow | Activity log instead |
| SSO/SAML | Enterprise requirement | Complex setup, maintenance burden | Defer to v2, Gmail OAuth covers most users |
| Team billing | Multi-seat licensing | Billing complexity, payment integration | Free tier first, add billing when needed |
| User-to-user messaging | Direct collaboration | Scope creep, use Slack/email instead | Link to external tools |

## Feature Dependencies

```
[Email/Password Auth]
    └──requires──> [User Table Schema]
                       └──requires──> [Database Migration]

[Google OAuth]
    └──requires──> [User Table Schema]
    └──requires──> [Google Cloud Console Setup]

[Workspace Invites]
    └──requires──> [User Authentication]
    └──requires──> [Email Service (Resend)]
                       └──requires──> [Domain Verification]

[Role Enforcement]
    └──requires──> [Workspace Membership Table]
    └──requires──> [User Authentication]

[Activity Log]
    └──requires──> [User Authentication]
    └──requires──> [Actor Attribution]

[Magic Link Invites] ──enhances──> [Workspace Invites]

[Workspace Switcher] ──requires──> [Multiple Workspace Support]
```

### Dependency Notes

- **All features require User Table Schema:** Must establish users table first
- **Invites require working email:** Resend setup + domain verification needed
- **Role enforcement requires workspace membership:** Need junction table before permissions
- **Activity log requires actor attribution:** Update existing transition events to include user IDs

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate team collaboration.

- [x] User authentication (Gmail OAuth + email/password)
- [x] Password reset via email link
- [x] User profile (name, email, avatar)
- [x] Session persistence (JWT)
- [x] User-owned workspaces
- [x] Workspace switcher (dropdown in header)
- [x] Email invitations with role selection
- [x] Magic link invite acceptance
- [x] Three roles: Admin, Member, Viewer
- [x] Permission enforcement (API + UI)
- [x] Activity logging (basic audit trail)
- [x] Data migration (existing data → first user)

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Email verification for new signups — Add when spam becomes issue
- [ ] Pending invitations management — Add when teams request it
- [ ] Workspace settings page — Add when admins need more control
- [ ] Profile settings page — Add when users request avatar changes
- [ ] Bulk invite (CSV upload) — Add when teams are >10 people

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] SSO/SAML — Enterprise requirement, complex
- [ ] Custom roles — Granular permissions
- [ ] Workspace templates — Clone workspace structure
- [ ] Guest access (time-limited) — External stakeholder preview
- [ ] Team billing — Multi-seat subscriptions

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Gmail OAuth | HIGH | LOW | P1 |
| Email/password login | HIGH | MEDIUM | P1 |
| Password reset | MEDIUM | MEDIUM | P1 |
| Session persistence | HIGH | LOW | P1 |
| User profile | MEDIUM | LOW | P1 |
| Workspace ownership | HIGH | MEDIUM | P1 |
| Workspace switcher | HIGH | LOW | P1 |
| Email invitations | HIGH | MEDIUM | P1 |
| Magic link invites | HIGH | MEDIUM | P1 |
| Role enforcement | HIGH | MEDIUM | P1 |
| Activity logging | MEDIUM | MEDIUM | P1 |
| Data migration | HIGH | MEDIUM | P1 |
| Email verification | LOW | MEDIUM | P2 |
| Pending invites UI | LOW | LOW | P2 |
| Profile settings | LOW | LOW | P3 |
| SSO/SAML | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Notion | Figma | Linear | Our Approach |
|---------|--------|-------|--------|--------------|
| Auth methods | Google, Apple, Email, SAML | Google, Email, SAML | Google, Email, SAML | Google + Email (v1), SAML later |
| Workspace model | Workspace → Pages | Team → Projects | Team → Projects | Workspace → Projects |
| Invite flow | Email + magic link | Email + magic link | Email + magic link | Same — proven pattern |
| Roles | Admin, Member, Guest | Owner, Admin, Editor, Viewer | Admin, Member | Admin, Member, Viewer |
| Share UI | Share button top-right | Share button top-right | Settings → Members | Share button (Figma pattern) |
| Activity log | Page history | Version history | Issue history | Workspace-level activity |

## Sources

- Notion collaboration model (notion.so/help)
- Figma team management (help.figma.com)
- Linear team features (linear.app/docs)
- Auth.js provider patterns (authjs.dev)

---
*Feature research for: Multi-user authentication and workspace collaboration*
*Researched: 2026-01-21*
