# Project Research Summary

**Project:** Elmer Multi-User Collaboration
**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Executive Summary

This project transforms elmer from a single-user PM orchestrator into a multi-tenant team collaboration platform. The recommended approach uses **Auth.js v5** for authentication (supporting Gmail OAuth and email/password), **Resend** for transactional emails (invitations, password reset), and a **workspace membership model** similar to Notion/Figma.

The architecture extends the existing Drizzle/PostgreSQL schema with four new tables: `users`, `workspaceMembers`, `invitations`, and `activityLogs`. All existing API routes must be updated to check workspace membership before returning data. The biggest risk is **broken access control** — ensuring User A cannot access User B's workspaces — which requires systematic permission checks throughout the codebase.

Key success factors: (1) Use Auth.js instead of custom auth to avoid security footguns, (2) Implement `requireWorkspaceAccess()` helper used everywhere, (3) Test cross-user access attempts explicitly, (4) Migrate existing data carefully with transaction-wrapped script.

## Key Findings

### Recommended Stack

**Summary from STACK.md:**

The existing Next.js 16 + Drizzle + PostgreSQL stack is ideal for adding authentication. Auth.js v5 provides native integration with the App Router and supports both OAuth and credentials providers with minimal configuration.

**Core technologies:**
- **Auth.js v5**: Native Next.js integration, handles OAuth + credentials, session management, JWT strategy for Edge compatibility
- **bcryptjs**: Pure JS password hashing, works on Vercel Edge (no native dependencies)
- **Resend**: Modern email API with React Email templates, excellent deliverability, generous free tier
- **nanoid** (existing): URL-safe tokens for magic links and invite tokens

### Expected Features

**Summary from FEATURES.md:**

**Must have (table stakes):**
- Email/password + Google OAuth login
- Password reset via email
- Session persistence (JWT)
- Workspace creation and switching
- Email invitations with role selection
- Three-role permission model (Admin/Member/Viewer)

**Should have (competitive):**
- Magic link invite acceptance (frictionless onboarding)
- Activity logging (audit trail for PM decisions)
- Role-based UI rendering (hide unauthorized actions)

**Defer (v2+):**
- SSO/SAML (enterprise complexity)
- Granular per-project permissions
- Guest access / public workspaces

### Architecture Approach

**Summary from ARCHITECTURE.md:**

The architecture follows a **workspace-scoped access pattern** where every API request validates workspace membership before returning data. Auth.js middleware handles session validation, then route handlers call `requireWorkspaceAccess(userId, workspaceId, minimumRole)` to verify permissions.

**Major components:**
1. **Auth Middleware** — Validates JWT session, redirects unauthenticated users
2. **Permission Service** — Centralized `requireWorkspaceAccess()` used by all API routes
3. **Invitation Service** — Creates tokens, sends emails, handles acceptance
4. **Activity Service** — Logs audit events for compliance

### Critical Pitfalls

**Top 5 from PITFALLS.md:**

1. **Insecure password storage** — Use bcryptjs with cost 10+, never store plain passwords
2. **Broken access control (BOLA)** — Always check workspace membership, never trust client-provided user IDs
3. **Invitation link security holes** — Cryptographic tokens, 7-day expiry, one-time use
4. **Role escalation** — Check roles server-side, prevent self-promotion
5. **Email deliverability** — Verify domain, configure SPF/DKIM before launch

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Schema & Auth Foundation
**Rationale:** All subsequent work depends on user table and Auth.js configuration
**Delivers:** Database schema with users, workspaceMembers, invitations, activityLogs tables + Auth.js setup
**Addresses:** AUTH foundation, WORK ownership structure
**Avoids:** Schema migration issues by establishing foundation first

### Phase 2: User Registration
**Rationale:** Users need accounts before anything else works
**Delivers:** Signup form, password hashing, Google OAuth flow
**Uses:** Auth.js Credentials + Google providers, bcryptjs
**Implements:** User service layer

### Phase 3: Session Management
**Rationale:** Login flows require session handling
**Delivers:** Login page, session persistence, logout, password reset
**Addresses:** SESSION persistence, PASSWORD reset features
**Avoids:** Session hijacking via proper cookie configuration

### Phase 4: Workspace Ownership
**Rationale:** Workspaces must be owned before sharing
**Delivers:** User → Workspace relationship, workspace switcher, first workspace creation flow
**Uses:** workspaceMembers table, membership service
**Implements:** Workspace ownership model

### Phase 5: Invitation System
**Rationale:** Collaboration requires inviting others
**Delivers:** Invite modal, email sending, magic link acceptance, pending invites UI
**Uses:** Resend, React Email templates, invitation tokens
**Avoids:** Email deliverability issues via domain verification

### Phase 6: Role Enforcement
**Rationale:** Permissions give invitations meaning
**Delivers:** Permission checks in API routes, role-based UI, member management
**Addresses:** ROLE-based access control features
**Avoids:** Broken access control, role escalation

### Phase 7: Activity Logging
**Rationale:** Audit trail needed for team accountability
**Delivers:** Activity log writes on key actions, activity feed UI
**Implements:** Activity service

### Phase 8: Data Migration
**Rationale:** Existing data must be owned before auth is required
**Delivers:** Migration script assigning existing workspaces/projects to first user
**Avoids:** Data orphaning, migration failures via transaction + idempotency

### Phase 9: UI Integration
**Rationale:** Auth UI needs to integrate with existing dashboard
**Delivers:** Landing page, protected routes, auth state in navigation
**Uses:** Next.js middleware, conditional rendering

### Phase 10: Testing & Hardening
**Rationale:** Security must be verified before launch
**Delivers:** Auth flow tests, permission tests, cross-user access tests
**Addresses:** Testing requirements from PROJECT.md
**Avoids:** All security pitfalls via explicit verification

### Phase Ordering Rationale

- **Schema first (Phase 1):** Foundation for all subsequent work
- **Auth before ownership (Phases 2-3 before 4):** Users must exist before owning things
- **Ownership before invites (Phase 4 before 5):** Workspaces need owners before sharing
- **Invites before roles (Phase 5 before 6):** People need to join before permissions matter
- **Migration late (Phase 8):** All features ready before migrating real data
- **Testing last (Phase 10):** Verify everything works together

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Invitation System):** Email template design, domain verification process
- **Phase 8 (Data Migration):** Edge cases in existing data, transaction handling

Phases with standard patterns (skip research-phase):
- **Phase 1 (Schema):** Well-documented Drizzle patterns
- **Phase 2-3 (Auth):** Auth.js has extensive documentation
- **Phase 6 (Roles):** Standard RBAC patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Auth.js v5 is mature, well-documented |
| Features | HIGH | Standard SaaS collaboration patterns |
| Architecture | HIGH | Matches Notion/Figma proven models |
| Pitfalls | HIGH | OWASP guidelines are definitive |

**Overall confidence:** HIGH

### Gaps to Address

- **Email domain verification:** Resend requires domain verification for production; must be done before Phase 5 testing
- **Google OAuth credentials:** Need Google Cloud Console project setup; should be done early
- **Existing data audit:** Need to understand exact state of current workspaces/projects before Phase 8

## Sources

### Primary (HIGH confidence)
- Auth.js v5 documentation (authjs.dev)
- Next.js 16 authentication patterns (nextjs.org)
- OWASP Authentication Cheat Sheet (owasp.org)
- Drizzle ORM adapter documentation (orm.drizzle.team)

### Secondary (MEDIUM confidence)
- Notion collaboration model (notion.so/help)
- Figma team management (help.figma.com)
- Resend documentation (resend.com/docs)

### Tertiary (LOW confidence)
- Community patterns for multi-tenant SaaS — validated against OWASP

---
*Research completed: 2026-01-21*
*Ready for roadmap: yes*
