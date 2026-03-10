import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

/**
 * Get the current authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  return { id: userId }
}

/**
 * Require authentication. Redirects to login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }
  return { id: userId }
}

/**
 * Get session for API routes.
 * Returns null if not authenticated.
 */
export async function getSessionForApi() {
  const { userId } = await auth()
  if (!userId) return null
  return { user: { id: userId } }
}
