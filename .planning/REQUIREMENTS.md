# Requirements: Elmer Multi-User Collaboration

**Defined:** 2026-01-21
**Core Value:** Enable PM teams to collaborate on product initiatives in shared workspaces while maintaining clear ownership, audit trails, and permission controls.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can sign in with Google OAuth (Gmail)
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can sign out and session is cleared
- [ ] **AUTH-06**: Passwords are securely hashed with bcryptjs

### User Management

- [ ] **USER-01**: User profile created on first sign up (name, email, avatar)
- [ ] **USER-02**: User profile displays in navigation when logged in
- [ ] **USER-03**: User can view their profile information

### Workspace Ownership

- [ ] **WORK-01**: User can create a new workspace
- [ ] **WORK-02**: Workspace creator automatically becomes Admin
- [ ] **WORK-03**: User can switch between workspaces via dropdown
- [ ] **WORK-04**: User can rename their owned workspaces
- [ ] **WORK-05**: User can view list of workspace members
- [ ] **WORK-06**: First-time user is prompted to create initial workspace

### Invitation System

- [ ] **INVT-01**: Admin can invite users by email address
- [ ] **INVT-02**: Admin can select role when inviting (Admin/Member/Viewer)
- [ ] **INVT-03**: Invited user receives email with magic link
- [ ] **INVT-04**: Magic link creates account if user doesn't exist
- [ ] **INVT-05**: Magic link adds user to workspace with selected role
- [ ] **INVT-06**: Invitation tokens expire after 7 days
- [ ] **INVT-07**: Invitation tokens are single-use
- [ ] **INVT-08**: Share button visible in workspace UI for admins

### Role-Based Access Control

- [ ] **ROLE-01**: Admin role can invite members, configure workspace, manage members
- [ ] **ROLE-02**: Member role can view and edit projects, trigger jobs, create documents
- [ ] **ROLE-03**: Viewer role has read-only access to projects and documents
- [ ] **ROLE-04**: Permission checks enforced in all API routes
- [ ] **ROLE-05**: Unauthorized actions hidden in UI based on role
- [ ] **ROLE-06**: Users cannot promote themselves to higher role

### Activity Logging

- [ ] **ACTV-01**: Log when project is created
- [ ] **ACTV-02**: Log when project stage changes
- [ ] **ACTV-03**: Log when member is invited
- [ ] **ACTV-04**: Log when member joins workspace
- [ ] **ACTV-05**: Log when job is triggered
- [ ] **ACTV-06**: Activity feed viewable in workspace settings

### Data Migration

- [ ] **MIGR-01**: First authenticated user owns all existing workspaces
- [ ] **MIGR-02**: First authenticated user owns all existing projects
- [ ] **MIGR-03**: Migration runs in transaction (all-or-nothing)
- [ ] **MIGR-04**: Migration is idempotent (safe to run multiple times)
- [ ] **MIGR-05**: Existing stage transitions get actor attribution

### Testing

- [ ] **TEST-01**: Unit tests for authentication flows
- [ ] **TEST-02**: Integration tests for invitation system
- [ ] **TEST-03**: Permission enforcement tests (API routes)
- [ ] **TEST-04**: Cross-user access denied tests
- [ ] **TEST-05**: Migration script tests

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
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| AUTH-06 | Phase 1 | Pending |
| USER-01 | Phase 2 | Pending |
| USER-02 | Phase 9 | Pending |
| USER-03 | Phase 9 | Pending |
| WORK-01 | Phase 4 | Pending |
| WORK-02 | Phase 4 | Pending |
| WORK-03 | Phase 4 | Pending |
| WORK-04 | Phase 4 | Pending |
| WORK-05 | Phase 4 | Pending |
| WORK-06 | Phase 4 | Pending |
| INVT-01 | Phase 5 | Pending |
| INVT-02 | Phase 5 | Pending |
| INVT-03 | Phase 5 | Pending |
| INVT-04 | Phase 5 | Pending |
| INVT-05 | Phase 5 | Pending |
| INVT-06 | Phase 5 | Pending |
| INVT-07 | Phase 5 | Pending |
| INVT-08 | Phase 5 | Pending |
| ROLE-01 | Phase 6 | Pending |
| ROLE-02 | Phase 6 | Pending |
| ROLE-03 | Phase 6 | Pending |
| ROLE-04 | Phase 6 | Pending |
| ROLE-05 | Phase 6 | Pending |
| ROLE-06 | Phase 6 | Pending |
| ACTV-01 | Phase 7 | Pending |
| ACTV-02 | Phase 7 | Pending |
| ACTV-03 | Phase 7 | Pending |
| ACTV-04 | Phase 7 | Pending |
| ACTV-05 | Phase 7 | Pending |
| ACTV-06 | Phase 7 | Pending |
| MIGR-01 | Phase 8 | Pending |
| MIGR-02 | Phase 8 | Pending |
| MIGR-03 | Phase 8 | Pending |
| MIGR-04 | Phase 8 | Pending |
| MIGR-05 | Phase 8 | Pending |
| TEST-01 | Phase 10 | Pending |
| TEST-02 | Phase 10 | Pending |
| TEST-03 | Phase 10 | Pending |
| TEST-04 | Phase 10 | Pending |
| TEST-05 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after initial definition*
