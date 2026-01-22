# Stack Research

**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Auth.js (NextAuth v5) | 5.x | Authentication framework | Native Next.js 16 integration, supports OAuth + credentials, session management built-in |
| bcryptjs | 3.x | Password hashing | Battle-tested, async hashing, no native deps (works in Vercel Edge) |
| Resend | 4.x | Transactional email | Modern API, excellent deliverability, good free tier (100 emails/day) |
| React Email | 3.x | Email templates | JSX-based templates, works with Resend, type-safe |
| nanoid | 5.x | Token generation | Already in codebase, URL-safe tokens for magic links |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @auth/drizzle-adapter | 1.x | Auth.js + Drizzle integration | Store users/sessions in existing Postgres |
| jose | 5.x | JWT operations | Magic link tokens, secure invite links |
| zod | 3.x | Input validation | Already used in Next.js, validate auth inputs |
| iron-session | 8.x | Alternative session | Only if Auth.js doesn't fit (not recommended) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| react-email | Email preview | Dev server to preview email templates locally |
| Drizzle Studio | Database inspection | Already available via `npm run db:studio` |

## Installation

```bash
# Core auth
npm install next-auth@beta @auth/drizzle-adapter

# Password hashing (Edge-compatible)
npm install bcryptjs
npm install -D @types/bcryptjs

# Email
npm install resend react-email @react-email/components

# Token generation (already have nanoid)
npm install jose
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Auth.js v5 | Lucia Auth | If you need more control over session storage |
| Auth.js v5 | Clerk | If you want managed auth (adds vendor dependency) |
| Resend | SendGrid | If you already have SendGrid account |
| Resend | Postmark | If you need higher volume (better for transactional) |
| bcryptjs | argon2 | If not deploying to Edge (argon2 needs native bindings) |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| bcrypt (native) | Requires native compilation, fails on Vercel Edge | bcryptjs (pure JS) |
| Firebase Auth | Vendor lock-in, complex for simple use case | Auth.js |
| Passport.js | Old patterns, not designed for React Server Components | Auth.js |
| Custom JWT auth | Security footguns, maintenance burden | Auth.js with JWT sessions |
| Magic link for all auth | Adds email dependency for every login | Only for invites, use password for regular login |

## Stack Patterns by Variant

**If deploying to Vercel Edge:**
- Use bcryptjs (pure JS implementation)
- Use Auth.js with JWT strategy (not database sessions)
- Use Neon serverless driver (already configured)

**If deploying to Node.js (self-hosted):**
- Can use bcrypt native for better performance
- Can use database sessions for easier revocation
- Standard pg driver works fine

## Auth.js Configuration Pattern

```typescript
// src/auth.ts
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validate and return user
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string
      return session
    },
  },
})
```

## Email Provider Configuration

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Usage
await resend.emails.send({
  from: 'elmer <noreply@yourdomain.com>',
  to: email,
  subject: 'Workspace Invitation',
  react: InviteEmailTemplate({ inviterName, workspaceName, inviteLink }),
})
```

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next-auth@5.x | Next.js 16 | Requires Next.js 14+ |
| @auth/drizzle-adapter@1.x | drizzle-orm@0.45+ | Must match Drizzle version |
| bcryptjs@3.x | All Node.js | Pure JS, no native deps |
| resend@4.x | Node.js 18+ | Modern fetch API |

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Auth.js
AUTH_SECRET= # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000 # or production URL

# Email
RESEND_API_KEY=

# Existing (unchanged)
DATABASE_URL=
ANTHROPIC_API_KEY=
```

## Sources

- Auth.js v5 documentation (authjs.dev)
- Next.js 16 authentication patterns (nextjs.org/docs)
- Resend documentation (resend.com/docs)
- Drizzle ORM adapter docs (orm.drizzle.team)
- bcryptjs npm package (pure JS bcrypt)

---
*Stack research for: Multi-user authentication and workspace collaboration*
*Researched: 2026-01-21*
