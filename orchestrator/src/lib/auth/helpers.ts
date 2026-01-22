import { auth } from "@/auth"
import { redirect } from "next/navigation"

/**
 * Get the current authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Require authentication. Redirects to login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  return session.user
}

/**
 * Get session for API routes.
 * Returns null if not authenticated.
 */
export async function getSessionForApi() {
  const session = await auth()
  return session
}
