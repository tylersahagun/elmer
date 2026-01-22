# Phase 2 Research: User Registration

**Phase:** 2 - User Registration
**Researched:** 2026-01-22
**Goal:** Users can create accounts with email/password or Google OAuth

## Phase Requirements

- **AUTH-01**: User can sign up with email and password
- **AUTH-02**: User can sign in with Google OAuth (Gmail)
- **USER-01**: User profile created on first sign up (name, email, avatar)

## Success Criteria

1. User can fill signup form (email, password, name) and account is created
2. Password is hashed with bcryptjs before storage
3. User can click "Sign in with Google" and account is created from OAuth profile
4. User record includes name, email, and avatar (from Google or default)
5. Duplicate email registrations are rejected with clear error message

---

## 1. Existing Infrastructure (from Phase 1)

### Auth.js Configuration

Phase 1 established the Auth.js foundation at `orchestrator/src/auth.ts`:

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider will be added in Phase 2
  ],
  // ... callbacks for JWT/session
})
```

### Database Schema

Users table already exists with required columns:
- `id` (text, primary key, nanoid)
- `email` (text, unique, not null)
- `name` (text, nullable)
- `image` (text, nullable)
- `passwordHash` (text, nullable - for credentials auth)
- `emailVerified` (timestamp, nullable)
- `createdAt`, `updatedAt` (timestamps)

### Existing UI Components

The orchestrator has a complete shadcn/ui component library:
- `Input` - Standard text input with validation states
- `Button` - Multiple variants (default, outline, ghost, destructive)
- `Card` - Container with header, content, footer
- `Label` - Form labels with accessibility
- `Alert` - For error/success messages

---

## 2. Credentials Provider Implementation

### Adding Credentials Provider to Auth.js

```typescript
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// In providers array:
Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, credentials.email as string),
    })

    if (!user || !user.passwordHash) {
      return null
    }

    const passwordMatch = await bcrypt.compare(
      credentials.password as string,
      user.passwordHash
    )

    if (!passwordMatch) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }
  },
})
```

**Key decisions:**
- Credentials provider only handles LOGIN (authorize)
- Signup is a separate API route that creates the user first
- bcryptjs for password comparison (Edge-compatible)

---

## 3. Signup Flow Architecture

### Signup API Route

Create `src/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check for existing user
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await db.insert(users).values({
      id: nanoid(),
      email,
      name: name || email.split("@")[0],
      passwordHash,
      image: null, // Default avatar handled in UI
    }).returning()

    return NextResponse.json(
      { user: { id: newUser.id, email: newUser.email, name: newUser.name } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
```

**Key decisions:**
- 12 rounds for bcrypt (balance of security and performance)
- Default name from email prefix if not provided
- Return minimal user info (no password hash)
- HTTP 409 for duplicate email (Conflict)

---

## 4. Google OAuth Configuration

### Google Cloud Console Setup

Required steps (documented for user):
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://elmer.studio/api/auth/callback/google` (production)
4. Copy Client ID and Client Secret to `.env.local`

### Environment Variables

```bash
# .env.local
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### OAuth Flow

Auth.js handles the OAuth flow automatically:
1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. Google redirects back with authorization code
4. Auth.js exchanges code for tokens
5. Auth.js creates/updates user and account records
6. JWT session created

**Account linking:** If user signs up with email/password first, then later signs in with Google using the same email, Auth.js links the accounts automatically.

---

## 5. Signup Page UI

### File: `src/app/signup/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      // Create account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Signup failed")
      }

      // Auto-login after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Account created but login failed")
      }

      router.push("/") // Redirect to dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Get started with Elmer</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

---

## 6. Password Validation

### Client-side Validation

```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
}

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
  }
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    return `Password must be less than ${PASSWORD_REQUIREMENTS.maxLength} characters`
  }
  return null
}
```

### Server-side Validation

```typescript
// In signup route
if (password.length < 8) {
  return NextResponse.json(
    { error: "Password must be at least 8 characters" },
    { status: 400 }
  )
}
```

**Decision:** Keep password requirements simple for v1:
- Minimum 8 characters
- No complexity requirements (uppercase, numbers, symbols)
- Maximum 128 characters (prevent DoS via bcrypt)

---

## 7. Error Handling

### Error States to Handle

| Scenario | HTTP Status | User Message |
|----------|-------------|--------------|
| Missing email/password | 400 | "Email and password are required" |
| Invalid email format | 400 | "Please enter a valid email address" |
| Password too short | 400 | "Password must be at least 8 characters" |
| Duplicate email | 409 | "An account with this email already exists" |
| Server error | 500 | "Something went wrong. Please try again." |
| Google OAuth error | - | "Failed to sign in with Google" |

### Error Display

Use `Alert` component with `variant="destructive"` for errors.

---

## 8. File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/auth.ts` | Modify | Add Credentials provider |
| `src/app/api/auth/signup/route.ts` | Create | Signup API endpoint |
| `src/app/signup/page.tsx` | Create | Signup form UI |
| `src/components/icons/google.tsx` | Create | Google icon for OAuth button |
| `.env.local` | Modify | Add Google OAuth credentials |

---

## 9. Testing Checklist

After Phase 2 completion, verify:

- [ ] Signup form renders at `/signup`
- [ ] Email/password signup creates user in database
- [ ] Password is hashed (not stored in plaintext)
- [ ] Duplicate email shows error message
- [ ] Google OAuth button redirects to Google
- [ ] Google OAuth creates user with name, email, avatar
- [ ] After signup, user is logged in automatically
- [ ] After Google OAuth, user is logged in automatically

---

## 10. Pitfalls to Avoid

| Pitfall | Prevention |
|---------|------------|
| Storing plaintext passwords | Always use bcrypt.hash() before insert |
| Leaking password hash in response | Only return id, email, name from API |
| Missing CSRF protection | Auth.js handles this automatically |
| OAuth redirect URI mismatch | Double-check Google Console settings |
| bcrypt timing attacks | Use bcrypt.compare() not === |
| No rate limiting | Defer to Phase 10 (testing) |

---

## 11. Dependencies

### Already Installed (Phase 1)

- `next-auth@beta`
- `@auth/drizzle-adapter`
- `bcryptjs`
- `@types/bcryptjs`

### No New Dependencies Required

Phase 2 uses existing packages.

---

*Phase 2 Research Complete*
*Ready for planning*
