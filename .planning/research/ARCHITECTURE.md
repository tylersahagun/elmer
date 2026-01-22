# Architecture Research

**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Landing  │  │  Auth    │  │  Kanban  │  │ Settings │        │
│  │  Page    │  │  Pages   │  │  Board   │  │  Pages   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
├───────┴─────────────┴─────────────┴─────────────┴────────────────┤
│                      AUTH MIDDLEWARE                              │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Auth.js Session Check → Role Check → Workspace Access │      │
│  └────────────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│                        API LAYER                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  /api/auth/*   /api/workspaces/*   /api/invitations/*  │      │
│  └────────────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                   │
│  ┌─────────┐  ┌───────────────┐  ┌──────────────┐               │
│  │  Users  │  │  Workspaces   │  │  Invitations │               │
│  │         │──│  Members      │──│              │               │
│  └─────────┘  └───────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Auth Middleware | Validate session, check permissions | Next.js middleware + Auth.js |
| User Service | CRUD users, password hashing | Drizzle queries + bcryptjs |
| Workspace Service | CRUD workspaces, membership management | Drizzle queries |
| Invitation Service | Create/accept invites, send emails | Drizzle + Resend |
| Permission Service | Check role-based access | Utility functions |
| Activity Service | Log and query audit events | Drizzle queries |

## Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth-related pages (no layout)
│   │   ├── login/page.tsx         # Login page
│   │   ├── signup/page.tsx        # Signup page
│   │   ├── reset-password/page.tsx
│   │   └── accept-invite/page.tsx # Magic link handler
│   ├── (dashboard)/               # Authenticated pages (with layout)
│   │   ├── layout.tsx             # Dashboard layout with auth check
│   │   ├── workspace/[id]/        # Existing workspace pages
│   │   └── settings/              # User/workspace settings
│   └── api/
│       ├── auth/[...nextauth]/    # Auth.js route handlers
│       ├── invitations/           # Invitation CRUD
│       └── workspaces/            # Updated with auth
├── lib/
│   ├── auth/
│   │   ├── config.ts              # Auth.js configuration
│   │   ├── providers.ts           # Google + Credentials providers
│   │   └── helpers.ts             # getCurrentUser, requireAuth
│   ├── db/
│   │   └── schema.ts              # Add users, members, invitations tables
│   ├── services/
│   │   ├── user-service.ts        # User CRUD operations
│   │   ├── workspace-service.ts   # Workspace + membership
│   │   ├── invitation-service.ts  # Invite flow
│   │   └── activity-service.ts    # Audit logging
│   ├── email/
│   │   ├── resend.ts              # Email client
│   │   └── templates/             # React Email templates
│   └── permissions/
│       └── check.ts               # Role-based permission checks
├── middleware.ts                  # Auth + workspace access middleware
└── components/
    ├── auth/                      # Login/signup forms
    ├── workspace/
    │   ├── WorkspaceSwitcher.tsx  # Notion-style dropdown
    │   └── ShareButton.tsx        # Invite modal trigger
    └── settings/
        └── MembersTable.tsx       # Workspace member management
```

### Structure Rationale

- **(auth)/ route group:** Unauthenticated pages with minimal layout
- **(dashboard)/ route group:** Protected pages with sidebar, header
- **lib/services/:** Business logic separate from API routes (testable)
- **lib/permissions/:** Centralized permission checks (DRY)
- **middleware.ts:** Global auth check, redirect unauthenticated users

## Architectural Patterns

### Pattern 1: Workspace-Scoped Access

**What:** All data access goes through workspace membership check
**When to use:** Every API route that touches workspace data
**Trade-offs:** Slightly more queries, but bulletproof access control

**Example:**
```typescript
// lib/permissions/check.ts
export async function requireWorkspaceAccess(
  userId: string,
  workspaceId: string,
  minimumRole?: 'admin' | 'member' | 'viewer'
) {
  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.userId, userId),
      eq(workspaceMembers.workspaceId, workspaceId)
    ),
  })
  
  if (!membership) throw new Error('Access denied')
  if (minimumRole && !hasMinimumRole(membership.role, minimumRole)) {
    throw new Error('Insufficient permissions')
  }
  
  return membership
}
```

### Pattern 2: Middleware Auth Chain

**What:** Layered authentication in Next.js middleware
**When to use:** Protect all dashboard routes
**Trade-offs:** Adds latency but centralizes auth logic

**Example:**
```typescript
// middleware.ts
import { auth } from "@/lib/auth/config"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    if (isLoggedIn) return Response.redirect(new URL('/', req.url))
    return
  }
  
  // Protected routes
  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Pattern 3: Role-Based UI Rendering

**What:** Conditionally render UI based on user role
**When to use:** Buttons, menus, forms that require specific permissions
**Trade-offs:** Requires passing role down, but clean UX

**Example:**
```typescript
// components/workspace/ShareButton.tsx
export function ShareButton({ workspaceId, userRole }: Props) {
  // Only admins can invite
  if (userRole !== 'admin') return null
  
  return (
    <Button onClick={() => setInviteDialogOpen(true)}>
      Share
    </Button>
  )
}
```

## Data Flow

### Authentication Flow

```
[User visits /login]
    ↓
[Choose: Google OAuth or Email/Password]
    ↓
[Auth.js validates credentials]
    ↓
[Create/update user record in database]
    ↓
[Create JWT session token]
    ↓
[Set HTTP-only cookie]
    ↓
[Redirect to dashboard]
```

### Invitation Flow

```
[Admin clicks Share]
    ↓
[Enter email + select role]
    ↓
[Create invitation record with token]
    ↓
[Send email via Resend]
    ↓
[Recipient clicks magic link]
    ↓
[/accept-invite validates token]
    ↓
[Create user if needed]
    ↓
[Create workspace membership]
    ↓
[Log activity]
    ↓
[Redirect to workspace]
```

### Permission Check Flow

```
[API Request to /api/projects]
    ↓
[Middleware: Is user authenticated?]
    ↓
[Route handler: Extract workspaceId from request]
    ↓
[requireWorkspaceAccess(userId, workspaceId, 'member')]
    ↓
[Return data or 403 Forbidden]
```

## Database Schema Extensions

```typescript
// Add to src/lib/db/schema.ts

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'), // null for OAuth users
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['admin', 'member', 'viewer'] }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  uniqueMembership: unique().on(table.workspaceId, table.userId),
}))

export const invitations = pgTable('invitations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  email: text('email').notNull(),
  role: text('role', { enum: ['admin', 'member', 'viewer'] }).notNull(),
  token: text('token').notNull().unique(),
  invitedBy: text('invited_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(), // e.g., 'project.created', 'member.invited'
  targetType: text('target_type'), // 'project', 'workspace', 'member'
  targetId: text('target_id'),
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current schema is fine, single Postgres instance |
| 1k-10k users | Add indexes on frequently queried columns (email, workspaceId) |
| 10k+ users | Consider connection pooling (PgBouncer), read replicas |

### Scaling Priorities

1. **First bottleneck:** Session validation on every request → Use JWT (stateless)
2. **Second bottleneck:** Membership queries → Add composite index on (workspaceId, userId)

## Anti-Patterns

### Anti-Pattern 1: Checking Permissions in UI Only

**What people do:** Only hide buttons, don't check permissions on backend
**Why it's wrong:** Anyone can call API directly, bypass UI restrictions
**Do this instead:** Always check permissions in API routes AND hide UI elements

### Anti-Pattern 2: Storing Passwords in Plain Text

**What people do:** Store passwords directly in database
**Why it's wrong:** Database breach = all passwords exposed
**Do this instead:** Hash with bcryptjs, minimum 10 rounds

### Anti-Pattern 3: Long-Lived Invite Tokens

**What people do:** Invite links that never expire
**Why it's wrong:** Old emails get forwarded, accounts compromised
**Do this instead:** 7-day expiration, one-time use tokens

### Anti-Pattern 4: Checking User ID from Client

**What people do:** Trust user ID sent in request body
**Why it's wrong:** Users can spoof other user IDs
**Do this instead:** Always get user ID from server session

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google OAuth | OAuth 2.0 callback | Requires Google Cloud Console project |
| Resend | REST API | Requires domain verification for production |
| Neon (existing) | Drizzle adapter | No changes needed, just new tables |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Auth → Workspace | User ID in session | Middleware extracts, passes to routes |
| Workspace → Projects | Workspace membership check | Before any project operation |
| Invitation → Email | Service-to-service | InvitationService calls EmailService |

## Sources

- Auth.js v5 architecture (authjs.dev/getting-started)
- Next.js middleware patterns (nextjs.org/docs/app/building-your-application/routing/middleware)
- Multi-tenant SaaS patterns (planetscale.com/blog/multi-tenant-saas-database-design)
- OWASP authentication best practices (owasp.org/www-project-cheat-sheets)

---
*Architecture research for: Multi-user authentication and workspace collaboration*
*Researched: 2026-01-21*
