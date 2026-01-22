# Roadmap: Elmer Multi-User Collaboration

## Overview

Transform elmer from a single-user PM orchestrator into a multi-tenant team collaboration platform. This roadmap progresses from foundational schema changes through authentication, workspace ownership, collaboration features, and data migration, culminating in comprehensive testing. Each phase builds on the previous, with authentication enabling ownership, ownership enabling invitations, and invitations enabling role enforcement.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Schema & Auth Foundation** - Database schema extensions and Auth.js configuration ✓
- [~] **Phase 2: User Registration** - Email/password signup ✓, Google OAuth paused
- [~] **Phase 3: Session Management** - Login ✓, logout ✓, password reset paused (needs email service)
- [x] **Phase 4: Workspace Ownership** - User-owned workspaces and workspace switcher ✓
- [x] **Phase 5: Invitation System** - Invite links for workspace collaboration ✓
- [x] **Phase 6: Role Enforcement** - Permission checks in API and UI ✓
- [x] **Phase 7: Activity Logging** - Audit trail for workspace actions ✓
- [ ] **Phase 8: Data Migration** - Assign existing data to first user
- [ ] **Phase 9: UI Integration** - Landing page, protected routes, auth state in nav
- [ ] **Phase 10: Testing & Hardening** - Comprehensive auth and permission tests

## Phase Details

### Phase 1: Schema & Auth Foundation
**Goal**: Establish database schema and Auth.js infrastructure required for all subsequent phases
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-06
**Success Criteria** (what must be TRUE):
  1. Users table exists with id, email, name, image, passwordHash, emailVerified columns
  2. workspaceMembers table exists with userId, workspaceId, role columns
  3. invitations table exists with token, email, role, expiresAt columns
  4. activityLogs table exists with action, targetType, targetId, metadata columns
  5. Auth.js is configured with JWT strategy and Drizzle adapter
  6. `npm run db:migrate` creates all new tables without errors
**Plans**: TBD

Plans:
- [x] 01-01: Database schema extensions (users, workspaceMembers, invitations, activityLogs) ✓
- [x] 01-02: Auth.js configuration with Drizzle adapter ✓

**Completed:** 2026-01-22 | 2 plans | ~50 minutes

### Phase 2: User Registration
**Goal**: Users can create accounts with email/password or Google OAuth
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, USER-01
**Success Criteria** (what must be TRUE):
  1. User can fill signup form (email, password, name) and account is created
  2. Password is hashed with bcryptjs before storage
  3. User can click "Sign in with Google" and account is created from OAuth profile
  4. User record includes name, email, and avatar (from Google or default)
  5. Duplicate email registrations are rejected with clear error message
**Plans**: TBD

Plans:
- [x] 02-01: Signup page with email/password form and validation ✓
- [~] 02-02: Google OAuth provider configuration and callback handling (PAUSED)

**Partial Completion:** 2026-01-22 | Plan 02-01 complete, Plan 02-02 paused per user request
**Note:** Google OAuth can be enabled later by configuring credentials in .env.local

### Phase 3: Session Management
**Goal**: Users can log in, stay logged in, and recover forgotten passwords
**Depends on**: Phase 2
**Requirements**: AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can log in with email/password and is redirected to dashboard
  2. User can log in with Google OAuth and is redirected to dashboard
  3. User session persists across browser refresh (JWT in httpOnly cookie)
  4. User can click "Forgot password" and receives email with reset link
  5. User can reset password via email link and log in with new password
  6. User can log out and session cookie is cleared
**Plans**: TBD

Plans:
- [x] 03-01: Login page with email/password ✓
- [ ] 03-02: Password reset flow (PAUSED - requires email service)
- [x] 03-03: Logout functionality and session management ✓

**Partial Completion:** 2026-01-22 | Plans 03-01, 03-03 complete. Plan 03-02 paused pending email service.
**Note:** Password reset requires email service (Resend/SendGrid). Login/logout working.

### Phase 4: Workspace Ownership
**Goal**: Users own workspaces and can switch between them
**Depends on**: Phase 3
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06
**Success Criteria** (what must be TRUE):
  1. Authenticated user can create a new workspace
  2. Workspace creator is automatically added as Admin member
  3. User can see all workspaces they belong to in dropdown
  4. User can switch between workspaces and UI updates accordingly
  5. Admin can rename their workspace
  6. Workspace displays member list with roles
  7. First-time user is prompted to create workspace on first login
**Plans**: TBD

Plans:
- [x] 04-01: Workspace creation with automatic admin membership ✓
- [x] 04-02: Workspace switcher and first-time user flow ✓
- [x] 04-03: Workspace settings and member management ✓

**Completed:** 2026-01-22 | All plans complete.

### Phase 5: Invitation System
**Goal**: Admins can invite collaborators via email with magic links
**Depends on**: Phase 4
**Requirements**: INVT-01, INVT-02, INVT-03, INVT-04, INVT-05, INVT-06, INVT-07, INVT-08
**Success Criteria** (what must be TRUE):
  1. Admin sees Share button in workspace UI
  2. Admin can enter email and select role in invite modal
  3. Invited user receives email with branded template
  4. Magic link in email creates user account if needed
  5. Magic link adds user to workspace with selected role
  6. Expired links (>7 days) show clear error message
  7. Already-used links show clear error message
**Plans**: TBD

Plans:
- [x] 05-01: Invitation service and API endpoints ✓
- [x] 05-02: Invitation UI for admins (Share button, invite modal) ✓
- [x] 05-03: Accept invitation flow ✓

**Completed:** 2026-01-22 | All plans complete.
**Note:** Email sending not implemented - admins copy/share invite links directly.

### Phase 6: Role Enforcement
**Goal**: Permissions are enforced in API routes and reflected in UI
**Depends on**: Phase 5
**Requirements**: ROLE-01, ROLE-02, ROLE-03, ROLE-04, ROLE-05, ROLE-06
**Success Criteria** (what must be TRUE):
  1. requireWorkspaceAccess() helper validates membership and role
  2. All workspace API routes use requireWorkspaceAccess()
  3. Admin can invite, Member cannot invite, Viewer cannot invite
  4. Member can edit projects, Viewer cannot edit projects
  5. Viewer can view projects but not trigger jobs
  6. UI hides Share button for non-admins
  7. UI disables edit actions for viewers
  8. User cannot modify their own role via API
**Plans**: TBD

Plans:
- [x] 06-01: Permission service with requireWorkspaceAccess helper ✓
- [x] 06-02: Update all API routes with permission checks ✓
- [x] 06-03: Role-based UI rendering (conditional buttons, disabled states) ✓

**Completed:** 2026-01-22 | All plans complete.

### Phase 7: Activity Logging
**Goal**: Track who did what, when for audit and accountability
**Depends on**: Phase 6
**Requirements**: ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, ACTV-06
**Success Criteria** (what must be TRUE):
  1. Project creation logs activity with actor and target
  2. Stage transitions log activity with actor and target
  3. Member invitations log activity with inviter and invitee email
  4. Member joins log activity when invitation accepted
  5. Job triggers log activity with actor
  6. Activity feed displays in workspace settings with timestamps
**Plans**: TBD

Plans:
- [x] 07-01: Activity service with logging functions ✓
- [x] 07-02: Integrate activity logging into existing operations ✓
- [x] 07-03: Activity feed UI in workspace settings ✓

**Completed:** 2026-01-22 | All plans complete.

### Phase 8: Data Migration
**Goal**: Existing workspaces and projects are owned by first user
**Depends on**: Phase 7
**Requirements**: MIGR-01, MIGR-02, MIGR-03, MIGR-04, MIGR-05
**Success Criteria** (what must be TRUE):
  1. Migration script assigns all orphaned workspaces to first authenticated user
  2. Workspace assignments include admin role in workspaceMembers
  3. Migration runs in database transaction (all-or-nothing)
  4. Migration can be run multiple times without duplicating data
  5. Existing stage transitions updated with actor attribution
  6. Post-migration, user can access all previously existing workspaces
**Plans**: TBD

Plans:
- [ ] 08-01: Migration script with transaction and idempotency
- [ ] 08-02: Backfill actor attribution in existing records

### Phase 9: UI Integration
**Goal**: Auth flows integrate seamlessly with existing elmer UI
**Depends on**: Phase 8
**Requirements**: USER-02, USER-03
**Success Criteria** (what must be TRUE):
  1. Landing page shows for unauthenticated users with login/signup CTAs
  2. Authenticated users redirected from landing to dashboard
  3. User avatar and name display in navigation header
  4. Unauthenticated users redirected from dashboard to login
  5. Auth state updates immediately after login/logout
  6. User can view basic profile information
**Plans**: TBD

Plans:
- [ ] 09-01: Landing page with auth CTAs
- [ ] 09-02: Navigation auth state (avatar, name, logout)
- [ ] 09-03: Protected route middleware configuration

### Phase 10: Testing & Hardening
**Goal**: Comprehensive tests verify auth and permissions work correctly
**Depends on**: Phase 9
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Unit tests pass for password hashing, token generation
  2. Integration tests pass for signup, login, logout flows
  3. Integration tests pass for invitation send and accept
  4. Permission tests verify cross-user workspace access denied
  5. Permission tests verify role enforcement for each role level
  6. Migration tests verify idempotency and correctness
**Plans**: TBD

Plans:
- [ ] 10-01: Authentication flow tests (signup, login, logout, reset)
- [ ] 10-02: Invitation system tests (send, accept, expire, reuse)
- [ ] 10-03: Permission enforcement tests (cross-user, role levels)
- [ ] 10-04: Migration script tests

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema & Auth Foundation | 2/2 | ✓ Complete | 2026-01-22 |
| 2. User Registration | 1/2 | Partial (OAuth paused) | 2026-01-22 |
| 3. Session Management | 2/3 | Partial (reset paused) | 2026-01-22 |
| 4. Workspace Ownership | 3/3 | ✓ Complete | 2026-01-22 |
| 5. Invitation System | 3/3 | ✓ Complete | 2026-01-22 |
| 6. Role Enforcement | 3/3 | ✓ Complete | 2026-01-22 |
| 7. Activity Logging | 3/3 | ✓ Complete | 2026-01-22 |
| 8. Data Migration | 0/2 | Not started | - |
| 9. UI Integration | 0/3 | Not started | - |
| 10. Testing & Hardening | 0/4 | Not started | - |

---
*Roadmap created: 2026-01-21*
*Last updated: 2026-01-22 after Phase 7 completion*
