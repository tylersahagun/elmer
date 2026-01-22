# Phase 1 Research: Schema & Auth Foundation

**Phase:** 1 - Schema & Auth Foundation
**Researched:** 2026-01-21
**Goal:** Establish database schema and Auth.js infrastructure required for all subsequent phases

## Phase Requirements

- **AUTH-06**: Passwords are securely hashed with bcryptjs

## Success Criteria

1. Users table exists with id, email, name, image, passwordHash, emailVerified columns
2. workspaceMembers table exists with userId, workspaceId, role columns
3. invitations table exists with token, email, role, expiresAt columns
4. activityLogs table exists with action, targetType, targetId, metadata columns
5. Auth.js is configured with JWT strategy and Drizzle adapter
6. `npm run db:migrate` creates all new tables without errors

---

## 1. Schema Design Decisions

### Users Table

The users table must support both OAuth (Google) and credentials (email/password) authentication:

```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'), // null for OAuth-only users
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**Key decisions:**
- `passwordHash` is nullable for OAuth users
- `emailVerified` timestamp (not boolean) matches Auth.js expectations
- Use `nanoid()` for IDs (already in codebase)
- Unique constraint on email prevents duplicate accounts

### Auth.js Required Tables

Auth.js with Drizzle adapter requires additional tables for session management:

```typescript
// Sessions table (for database session strategy, but we use JWT)
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
})

// Accounts table (stores OAuth provider info)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  providerUnique: unique().on(table.provider, table.providerAccountId),
}))

// Verification tokens (for email verification, password reset)
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}))
```

**Note:** Even though we use JWT strategy, the accounts table is still needed for OAuth account linking.

### Workspace Members Table

```typescript
export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'member', 'viewer'] }).notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  uniqueMembership: unique().on(table.workspaceId, table.userId),
}))
```

**Key decisions:**
- Composite unique constraint prevents duplicate memberships
- `onDelete: cascade` on both FKs ensures cleanup
- Three-role model: admin, member, viewer (matching PROJECT.md decisions)
- Default role is 'member' for invited users

### Invitations Table

```typescript
export const invitations = pgTable('invitations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role', { enum: ['admin', 'member', 'viewer'] }).notNull().default('member'),
  token: text('token').notNull().unique(),
  invitedBy: text('invited_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Key decisions:**
- `token` is unique for lookup
- `acceptedAt` is null until invitation used (one-time use check)
- `expiresAt` enforces 7-day expiration
- Store `invitedBy` for audit trail

### Activity Logs Table

```typescript
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // e.g., 'project.created', 'member.invited'
  targetType: text('target_type'), // 'project', 'workspace', 'member', etc.
  targetId: text('target_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Key decisions:**
- `userId` uses `set null` on delete (preserve history if user deleted)
- Dot-notation action names for namespacing
- `metadata` JSONB for flexible context storage

---

## 2. Auth.js v5 Configuration

### Installation

```bash
npm install next-auth@beta @auth/drizzle-adapter bcryptjs
npm install -D @types/bcryptjs
```

### File Structure

```
src/
├── auth.ts                     # Main Auth.js config (export { handlers, auth, signIn, signOut })
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts    # Route handlers
├── lib/
│   ├── auth/
│   │   └── adapter.ts          # Custom Drizzle adapter (if needed)
│   └── db/
│       └── schema.ts           # Add auth tables here
└── middleware.ts               # Auth middleware for protected routes
```

### Core Configuration

```typescript
// src/auth.ts
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider added in Phase 2
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
```

### Route Handlers

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

---

## 3. Migration Strategy

### Approach

Generate migration using Drizzle Kit, which creates SQL migration files:

```bash
npm run db:generate  # Creates migration file in drizzle/
npm run db:migrate   # Applies migration to database
```

### Expected Migration File

The migration should create:
1. `users` table
2. `sessions` table
3. `accounts` table (for OAuth)
4. `verification_tokens` table
5. `workspace_members` table
6. `invitations` table
7. `activity_logs` table

### Rollback Consideration

For safety, migrations should be reversible. Drizzle generates forward migrations only, but we can manually add down migrations if needed.

---

## 4. Type Definitions

### Extended Session Types

```typescript
// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

### Role Types

```typescript
// src/lib/db/schema.ts (or separate types file)
export type WorkspaceRole = 'admin' | 'member' | 'viewer'

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  admin: 3,
  member: 2,
  viewer: 1,
}
```

---

## 5. Environment Variables

Required environment variables for Phase 1:

```bash
# Auth.js
AUTH_SECRET=          # Generate: openssl rand -base64 32
AUTH_URL=http://localhost:3000

# Google OAuth (can be placeholder until Phase 2)
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
```

`AUTH_SECRET` is required even for local development. `AUTH_URL` helps with redirect URI handling.

---

## 6. Pitfalls to Avoid (Phase 1 Specific)

| Pitfall | Prevention |
|---------|------------|
| Missing `passwordHash` column | Include in users table, nullable for OAuth |
| Wrong column names for Auth.js | Use snake_case in DB, match adapter expectations |
| Missing unique constraint on accounts | Add composite unique on (provider, providerAccountId) |
| No cascade delete on memberships | Add `onDelete: cascade` to both FKs |
| Forgetting AUTH_SECRET env var | Fail early with clear error if not set |

---

## 7. Verification Checklist

After Phase 1 completion, verify:

- [ ] `npm run db:generate` succeeds
- [ ] `npm run db:migrate` creates tables
- [ ] `users` table has all required columns
- [ ] `workspace_members` table has unique constraint
- [ ] `invitations` table has token unique constraint
- [ ] `activity_logs` table exists
- [ ] Auth.js config file exists at `src/auth.ts`
- [ ] Route handlers exist at `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `AUTH_SECRET` environment variable is set

---

## 8. File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/db/schema.ts` | Modify | Add 7 new tables |
| `src/auth.ts` | Create | Auth.js configuration |
| `src/app/api/auth/[...nextauth]/route.ts` | Create | Route handlers |
| `src/types/next-auth.d.ts` | Create | Type extensions |
| `drizzle/*.sql` | Generate | Migration file |
| `.env.local` | Modify | Add AUTH_SECRET, AUTH_URL |
| `package.json` | Modify | Add dependencies |

---

*Phase 1 Research Complete*
*Ready for planning*
