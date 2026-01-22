# Elmer Multi-User Collaboration

## What This Is

A multi-user authentication and workspace collaboration system for elmer, transforming it from a single-user PM orchestrator into a team collaboration platform. Users can sign up with Gmail OAuth or email/password, create workspaces for their product initiatives, and invite teammates to collaborate with role-based permissions (Admin/Member/Viewer).

## Core Value

Enable PM teams to collaborate on product initiatives in shared workspaces while maintaining clear ownership, audit trails, and permission controls. Every user should be able to invite collaborators and start working together within minutes of signing up.

## Requirements

### Validated

<!-- Existing elmer capabilities that work today -->

- ✓ Kanban board with 11 workflow stages (inbox → discovery → PRD → design → prototype → validate → tickets → build → alpha → beta → GA) — existing
- ✓ Project management (create, update, delete, stage transitions) — existing
- ✓ Workspace configuration containers — existing
- ✓ AI job processing system (AgentExecutor + ExecutionWorker for automated PM work) — existing
- ✓ Document generation (PRDs, design briefs, engineering specs, GTM briefs) — existing
- ✓ Prototype generation via Cursor agent integration — existing
- ✓ PostgreSQL database with Drizzle ORM — existing
- ✓ Next.js 16 with React 19, TypeScript stack — existing
- ✓ Background worker system for async jobs — existing
- ✓ Knowledge base sync for workspace context — existing
- ✓ Stage automation with configurable recipes — existing

### Active

<!-- New capabilities for multi-user collaboration -->

**Authentication:**
- [ ] Gmail OAuth login (Google sign-in button)
- [ ] Email/password signup and login
- [ ] Password reset via email link
- [ ] Session management across browser refresh
- [ ] Email verification for new accounts
- [ ] Secure password hashing and storage

**User Management:**
- [ ] User profile creation (name, email, avatar)
- [ ] User settings page (edit profile, change password)
- [ ] Account creation flow with onboarding
- [ ] First-time user creates initial workspace

**Workspace Ownership:**
- [ ] User-owned workspaces (user creates and owns workspace)
- [ ] Workspace switcher dropdown (Notion-style, in header)
- [ ] Create new workspace from switcher
- [ ] Rename/delete owned workspaces
- [ ] Workspace member list display

**Invitation System:**
- [ ] Email invitation with role selection (Admin/Member/Viewer)
- [ ] Magic link generation for invite acceptance
- [ ] Invite email sending (with workspace context)
- [ ] One-click join via magic link (auto-creates account if needed)
- [ ] Share button in workspace UI (opens invite modal)
- [ ] Pending invitations list and management
- [ ] Revoke invitations before acceptance

**Role-Based Access Control:**
- [ ] Admin role: Full access, can invite, configure workspace, manage members
- [ ] Member role: View and edit projects, trigger jobs, create documents
- [ ] Viewer role: Read-only access to projects and documents
- [ ] Permission enforcement in API routes
- [ ] Permission checks in UI (hide/disable unauthorized actions)
- [ ] Workspace collaborator list with roles displayed

**Activity Logging:**
- [ ] Audit trail of workspace actions (who did what, when)
- [ ] Activity feed in workspace settings
- [ ] Log key events: project created, stage changed, job triggered, member invited, role changed
- [ ] Activity timestamps and actor attribution

**Data Migration:**
- [ ] Assign all existing workspaces to first authenticated user
- [ ] Assign all existing projects to workspace owners
- [ ] Migration script for existing data
- [ ] Backfill actor attribution in transition events

**Testing:**
- [ ] Unit tests for authentication flows
- [ ] Integration tests for invitation system
- [ ] Permission enforcement tests (API and UI)
- [ ] Activity logging tests
- [ ] Migration script tests

### Out of Scope

- Magic link authentication for general login — Only for invite acceptance; users still need email/password or OAuth for regular login
- Project-level permissions within workspace — All workspace members see all projects; roles control actions, not visibility
- Public workspaces or guest access — All workspaces are private; collaboration requires explicit email invitation
- SSO/SAML enterprise auth — v1 focused on Gmail OAuth + email/password
- User-to-user direct messaging — Use external communication tools
- Notification preferences — All users receive standard email notifications
- Workspace templates or cloning — Each workspace created fresh
- Granular permission customization — Three roles only (Admin/Member/Viewer), no custom permissions

## Context

**Existing System:**
Elmer is a fully functional PM orchestration tool with:
- Glassmorphic Kanban UI for managing product initiatives
- AI-powered document generation (PRDs, specs, briefs)
- Prototype building via Cursor agent with Storybook integration
- Synthetic jury validation using Condorcet voting
- Linear/Jira ticket generation from validated prototypes
- Background job system with retry logic and progress tracking
- Configurable automation per workflow stage

**Current State:**
- Single-user/single-tenant deployment (no auth, no user accounts)
- Workspaces exist as configuration containers but aren't owned
- Projects track actor as simple text ("user", "automation", "worker:{id}")
- Database has no `users` table or authentication system
- Designed for solo PM or small team sharing the same instance

**Why Multi-User:**
- Enable team collaboration on product initiatives
- Allow PMs to invite designers, engineers, stakeholders
- Provide audit trail of who made decisions
- Support multiple independent workspaces per user
- Make elmer shareable like Notion or Figma

**Migration Challenge:**
Existing production data (workspaces, projects, documents) needs to be owned by someone when multi-user launches. Strategy: First user to authenticate becomes owner of all existing data.

## Constraints

- **Tech Stack**: Must use existing elmer stack (TypeScript, Next.js 16, React 19, PostgreSQL, Drizzle ORM)
- **Deployment**: Must work with current hosting setup (Vercel + Neon Postgres serverless)
- **Database**: Extend existing Drizzle schema, maintain backward compatibility during migration
- **UI Framework**: Use existing Radix UI + Tailwind CSS v4 for consistency
- **Email Delivery**: Need email service for invites and password resets (e.g., Resend, SendGrid, or similar)
- **Session Security**: HTTPOnly cookies with secure flags, CSRF protection for auth flows

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| User-owned workspaces | Matches Notion/Figma model where users create spaces and invite others | — Pending |
| Gmail OAuth + Email/Password dual auth | OAuth for convenience, email/password as fallback for non-Google users | — Pending |
| Three-role permission model (Admin/Member/Viewer) | Simple enough to understand, covers 95% of collaboration patterns | — Pending |
| Magic links for invites only | Reduces invite friction without complicating general authentication | — Pending |
| All workspace members see all projects | Simpler data model, roles control permissions not visibility | — Pending |
| First user owns all existing data | Clean migration path for brownfield deployment | — Pending |
| Activity log for audit compliance | PM decisions need attribution, especially in regulated industries | — Pending |
| No SSO in v1 | Gmail OAuth covers most users, enterprise SSO deferred to v2 | — Pending |

---
*Last updated: 2026-01-21 after initialization*
