# Requirements: Elmer Multi-User Collaboration

**Defined:** 2026-01-21
**Core Value:** Enable PM teams to collaborate on product initiatives in shared workspaces while maintaining clear ownership, audit trails, and permission controls.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign up with email and password ✓
- [~] **AUTH-02**: User can sign in with Google OAuth (Gmail) — PAUSED
- [~] **AUTH-03**: User can reset password via email link — PAUSED
- [x] **AUTH-04**: User session persists across browser refresh ✓
- [x] **AUTH-05**: User can sign out and session is cleared ✓
- [x] **AUTH-06**: Passwords are securely hashed with bcryptjs ✓

### User Management

- [x] **USER-01**: User profile created on first sign up (name, email, avatar) ✓
- [x] **USER-02**: User profile displays in navigation when logged in ✓
- [x] **USER-03**: User can view their profile information ✓

### Workspace Ownership

- [x] **WORK-01**: User can create a new workspace ✓
- [x] **WORK-02**: Workspace creator automatically becomes Admin ✓
- [x] **WORK-03**: User can switch between workspaces via dropdown ✓
- [x] **WORK-04**: User can rename their owned workspaces ✓
- [x] **WORK-05**: User can view list of workspace members ✓
- [x] **WORK-06**: First-time user is prompted to create initial workspace ✓

### Invitation System

- [x] **INVT-01**: Admin can invite users by email address ✓
- [x] **INVT-02**: Admin can select role when inviting (Admin/Member/Viewer) ✓
- [~] **INVT-03**: Invited user receives email with magic link — PAUSED (link shared manually)
- [x] **INVT-04**: Magic link creates account if user doesn't exist ✓
- [x] **INVT-05**: Magic link adds user to workspace with selected role ✓
- [x] **INVT-06**: Invitation tokens expire after 7 days ✓
- [x] **INVT-07**: Invitation tokens are single-use ✓
- [x] **INVT-08**: Share button visible in workspace UI for admins ✓

### Role-Based Access Control

- [x] **ROLE-01**: Admin role can invite members, configure workspace, manage members ✓
- [x] **ROLE-02**: Member role can view and edit projects, trigger jobs, create documents ✓
- [x] **ROLE-03**: Viewer role has read-only access to projects and documents ✓
- [x] **ROLE-04**: Permission checks enforced in all API routes ✓
- [x] **ROLE-05**: Unauthorized actions hidden in UI based on role ✓
- [x] **ROLE-06**: Users cannot promote themselves to higher role ✓

### Activity Logging

- [x] **ACTV-01**: Log when project is created ✓
- [x] **ACTV-02**: Log when project stage changes ✓
- [x] **ACTV-03**: Log when member is invited ✓
- [x] **ACTV-04**: Log when member joins workspace ✓
- [x] **ACTV-05**: Log when job is triggered ✓
- [x] **ACTV-06**: Activity feed viewable in workspace settings ✓

### Data Migration

- [x] **MIGR-01**: First authenticated user owns all existing workspaces ✓
- [x] **MIGR-02**: First authenticated user owns all existing projects ✓
- [x] **MIGR-03**: Migration runs in transaction (all-or-nothing) ✓
- [x] **MIGR-04**: Migration is idempotent (safe to run multiple times) ✓
- [x] **MIGR-05**: Existing stage transitions get actor attribution ✓

### Testing

- [x] **TEST-01**: Unit tests for authentication flows ✓
- [x] **TEST-02**: Integration tests for invitation system ✓
- [x] **TEST-03**: Permission enforcement tests (API routes) ✓
- [x] **TEST-04**: Cross-user access denied tests ✓
- [x] **TEST-05**: Migration script tests ✓

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Authentication

- **AUTH-V2-01**: Email verification for new accounts
- **AUTH-V2-02**: Two-factor authentication (TOTP)
- **AUTH-V2-03**: SSO/SAML enterprise authentication
- **AUTH-V2-04**: Magic link login (not just for invites)

### Workspace Management

- **WORK-V2-01**: Workspace templates (clone structure)
- **WORK-V2-02**: Workspace archiving
- **WORK-V2-03**: Workspace transfer to another user
- **WORK-V2-04**: Bulk member invite via CSV

### Invitation Enhancements

- **INVT-V2-01**: Pending invitations management UI
- **INVT-V2-02**: Resend invitation option
- **INVT-V2-03**: Invitation expiry notification

### User Settings

- **USER-V2-01**: User can change display name
- **USER-V2-02**: User can upload custom avatar
- **USER-V2-03**: User can change password
- **USER-V2-04**: User can delete account

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Magic link general login | Adds email dependency for every login; OAuth + password sufficient |
| Project-level permissions | Complexity; workspace roles cover 95% of cases |
| Public workspaces | Security risk; workspaces contain company context |
| Guest/time-limited access | Complexity; defer to v2 |
| Real-time presence | High complexity, minimal value for PM workflow |
| User-to-user messaging | Scope creep; use Slack/email instead |
| Custom roles | Three-role model sufficient; enterprise feature |
| Team billing | Payment integration deferred; free tier first |
| Granular notification preferences | Standard emails sufficient for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Paused |
| AUTH-03 | Phase 3 | Paused |
| AUTH-04 | Phase 3 | Complete |
| AUTH-05 | Phase 3 | Complete |
| AUTH-06 | Phase 1 | Complete |
| USER-01 | Phase 2 | Complete |
| USER-02 | Phase 9 | Complete |
| USER-03 | Phase 9 | Complete |
| WORK-01 | Phase 4 | Complete |
| WORK-02 | Phase 4 | Complete |
| WORK-03 | Phase 4 | Complete |
| WORK-04 | Phase 4 | Complete |
| WORK-05 | Phase 4 | Complete |
| WORK-06 | Phase 4 | Complete |
| INVT-01 | Phase 5 | Complete |
| INVT-02 | Phase 5 | Complete |
| INVT-03 | Phase 5 | Paused |
| INVT-04 | Phase 5 | Complete |
| INVT-05 | Phase 5 | Complete |
| INVT-06 | Phase 5 | Complete |
| INVT-07 | Phase 5 | Complete |
| INVT-08 | Phase 5 | Complete |
| ROLE-01 | Phase 6 | Complete |
| ROLE-02 | Phase 6 | Complete |
| ROLE-03 | Phase 6 | Complete |
| ROLE-04 | Phase 6 | Complete |
| ROLE-05 | Phase 6 | Complete |
| ROLE-06 | Phase 6 | Complete |
| ACTV-01 | Phase 7 | Complete |
| ACTV-02 | Phase 7 | Complete |
| ACTV-03 | Phase 7 | Complete |
| ACTV-04 | Phase 7 | Complete |
| ACTV-05 | Phase 7 | Complete |
| ACTV-06 | Phase 7 | Complete |
| MIGR-01 | Phase 8 | Complete |
| MIGR-02 | Phase 8 | Complete |
| MIGR-03 | Phase 8 | Complete |
| MIGR-04 | Phase 8 | Complete |
| MIGR-05 | Phase 8 | Complete |
| TEST-01 | Phase 10 | Complete |
| TEST-02 | Phase 10 | Complete |
| TEST-03 | Phase 10 | Complete |
| TEST-04 | Phase 10 | Complete |
| TEST-05 | Phase 10 | Complete |

**Coverage:**
- v1 requirements: 42 total
- Completed: 39
- Paused: 3 (AUTH-02, AUTH-03, INVT-03 — need external service config)

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-22 after Phase 10 completion*
