# Pitfalls Research

**Domain:** Multi-user authentication and workspace collaboration
**Researched:** 2026-01-21
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Insecure Password Storage

**What goes wrong:**
Passwords stored in plain text or with weak hashing. Database breach exposes all user credentials.

**Why it happens:**
Developers use MD5/SHA1 for speed, or store passwords directly for "simplicity."

**How to avoid:**
- Use bcryptjs with cost factor 10+ (auto-salted)
- Never store plain passwords, even temporarily
- Use Auth.js Credentials provider which handles hashing patterns

**Warning signs:**
- Password column is varchar without "hash" in name
- No hashing library in dependencies
- Password appears readable in database

**Phase to address:**
Phase 1: Schema & Auth Foundation

---

### Pitfall 2: Session Fixation / Hijacking

**What goes wrong:**
Session tokens predictable or stolen via XSS, allowing attackers to impersonate users.

**Why it happens:**
Custom session implementation without security expertise, cookies without proper flags.

**How to avoid:**
- Use Auth.js (handles session security automatically)
- Set cookies: `httpOnly: true`, `secure: true`, `sameSite: 'lax'`
- Regenerate session ID after authentication
- Use JWT with short expiration + refresh pattern

**Warning signs:**
- Session tokens are sequential or timestamp-based
- Cookies accessible via JavaScript (no httpOnly)
- No CSRF protection on auth forms

**Phase to address:**
Phase 2: User Registration & Phase 3: Session Management

---

### Pitfall 3: Invitation Link Security Holes

**What goes wrong:**
Invite tokens guessable, never expire, or reusable. Unauthorized users gain workspace access.

**Why it happens:**
Using UUIDs or timestamps as tokens, no expiration logic, not marking tokens as used.

**How to avoid:**
- Generate cryptographically secure tokens (nanoid or crypto.randomBytes)
- 7-day maximum expiration
- One-time use: mark as accepted immediately
- Store token hash, not plain token (prevents database leak)

**Warning signs:**
- Token is UUID or auto-increment ID
- No `expiresAt` column in invitations table
- Token can be used multiple times

**Phase to address:**
Phase 5: Invitation System

---

### Pitfall 4: Broken Access Control (BOLA/IDOR)

**What goes wrong:**
Users access resources by guessing IDs without ownership verification. User A can see User B's workspaces.

**Why it happens:**
API routes check authentication but not authorization. Assuming "logged in = has access."

**How to avoid:**
- ALWAYS check workspace membership before returning data
- Use server-side session for user ID (never trust client)
- Implement `requireWorkspaceAccess()` helper used everywhere
- Write tests for cross-user access attempts

**Warning signs:**
- API routes only check `if (!session) return 401`
- User ID comes from request body, not session
- No workspace membership queries in API routes

**Phase to address:**
Phase 6: Role Enforcement

---

### Pitfall 5: Role Escalation

**What goes wrong:**
Users promote themselves to admin, or members modify admin-only settings.

**Why it happens:**
Role stored in client state and trusted, or role checks only in UI.

**How to avoid:**
- Store role in database, never in JWT claims (mutable)
- Check role server-side on every privileged operation
- Prevent users from modifying their own role
- Only admins can invite new admins

**Warning signs:**
- Role stored in localStorage or JWT
- No role parameter in API permission checks
- Users can call `/api/members/:id` with role in body

**Phase to address:**
Phase 6: Role Enforcement

---

### Pitfall 6: Incomplete Data Migration

**What goes wrong:**
Existing workspaces/projects orphaned after auth launch. Users can't access their own data.

**Why it happens:**
Migration script misses edge cases, runs partially, or isn't idempotent.

**How to avoid:**
- Migration assigns ALL unowned workspaces to first user
- Run migration in transaction (all-or-nothing)
- Make migration idempotent (safe to run multiple times)
- Test migration on production data copy first

**Warning signs:**
- Some workspaces have `ownerId = null` after migration
- Projects visible before auth, invisible after
- Migration fails halfway, leaves partial state

**Phase to address:**
Phase 8: Data Migration

---

### Pitfall 7: Email Deliverability Issues

**What goes wrong:**
Invite emails land in spam, or never arrive. Users can't join workspaces.

**Why it happens:**
Sending from unverified domain, no SPF/DKIM, poor sender reputation.

**How to avoid:**
- Use reputable provider (Resend, SendGrid, Postmark)
- Verify domain with SPF, DKIM, DMARC records
- Use dedicated subdomain for transactional email (mail.yourdomain.com)
- Include unsubscribe link (even for transactional)
- Test with mail-tester.com before launch

**Warning signs:**
- Emails arrive in spam folder during testing
- "From" address is noreply@resend.dev (not your domain)
- No SPF record on domain DNS

**Phase to address:**
Phase 5: Invitation System

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip email verification | Faster signup flow | Fake accounts, spam | MVP only, add in v1.1 |
| Store role in JWT | Fewer DB queries | Role changes require re-login | Never for mutable roles |
| No activity logging | Faster development | No audit trail, compliance issues | Never for team products |
| Single-table inheritance (users + admins) | Simpler schema | Query complexity, null columns | Acceptable with good indexes |
| Soft-delete invitations | Keep history | Table bloat | Acceptable with cleanup job |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google OAuth | Hardcoding redirect URI | Use `AUTH_URL` env var, set in Google Console |
| Resend | Using test API key in prod | Separate API keys per environment |
| Resend | No domain verification | Verify domain before launch, takes 24-48h |
| Auth.js | Missing AUTH_SECRET | Generate with `openssl rand -base64 32` |
| Auth.js | Wrong callback URL | Must match exactly: `/api/auth/callback/google` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 membership queries | Slow page loads | Eager load memberships with workspaces | 50+ workspaces per user |
| Unindexed email lookup | Slow login | Add unique index on users.email | 10k+ users |
| Activity log table scan | Settings page timeout | Add index on (workspaceId, createdAt) | 100k+ activity events |
| JWT in every header | Large request payload | Store minimal claims, fetch full user | Many custom claims |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Leaking user emails in API | Privacy violation, spam | Only return emails to workspace members |
| Timing attack on login | Username enumeration | Same response time for valid/invalid emails |
| No rate limiting on invite | Spam victims | Limit to 10 invites per hour per user |
| Logging passwords | Credential exposure | Never log request bodies on auth routes |
| Invite token in URL query | Token in logs/referrer | Use POST with token in body for acceptance |

## UX Pitfalls

Common user experience mistakes in auth and collaboration.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Redirect loop on login error | User stuck, confused | Show error message on login page |
| No feedback during invite | User unsure if sent | Toast: "Invitation sent to sarah@..." |
| Generic "Access denied" | User doesn't know why | "You need admin access to invite members" |
| Logout clears workspace selection | User has to re-navigate | Remember last workspace in localStorage |
| Magic link expires silently | User clicks dead link | Show "This link has expired. Request a new one." |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Login form:** Often missing validation messages — verify email format, password length errors shown
- [ ] **OAuth flow:** Often missing error handling — verify failure redirects to login with error message
- [ ] **Invite email:** Often missing mobile preview — test email renders correctly on mobile
- [ ] **Role enforcement:** Often missing Viewer restrictions — verify viewers can't trigger jobs
- [ ] **Activity log:** Often missing pagination — verify 1000+ events don't crash page
- [ ] **Workspace switcher:** Often missing empty state — verify "Create first workspace" shown
- [ ] **Password reset:** Often missing token invalidation — verify token can't be reused
- [ ] **Session refresh:** Often missing silent refresh — verify session extends before expiry

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Plain text passwords | HIGH | Force password reset for all users, hash existing if possible |
| Leaked invite tokens | MEDIUM | Invalidate all pending invites, regenerate tokens |
| Broken access control | HIGH | Audit all API routes, add comprehensive tests |
| Failed migration | MEDIUM | Restore from backup, fix script, re-run |
| Email blacklisted | HIGH | New sending domain, warm up reputation (weeks) |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Insecure password storage | Phase 1: Schema & Auth Foundation | Verify bcryptjs in deps, passwordHash column |
| Session hijacking | Phase 3: Session Management | Verify httpOnly cookies in browser dev tools |
| Invite link holes | Phase 5: Invitation System | Test: expired link returns error, used link returns error |
| Broken access control | Phase 6: Role Enforcement | Test: User A cannot access User B's workspace |
| Role escalation | Phase 6: Role Enforcement | Test: Member cannot promote self to admin |
| Data migration failure | Phase 8: Data Migration | Verify all workspaces have owner after migration |
| Email deliverability | Phase 5: Invitation System | Test: email arrives in inbox (not spam) |

## Sources

- OWASP Authentication Cheat Sheet (owasp.org)
- OWASP Access Control Cheat Sheet (owasp.org)
- Auth.js security documentation (authjs.dev/security)
- Resend deliverability guide (resend.com/docs/deliverability)
- HaveIBeenPwned password breach analysis (haveibeenpwned.com)

---
*Pitfalls research for: Multi-user authentication and workspace collaboration*
*Researched: 2026-01-21*
