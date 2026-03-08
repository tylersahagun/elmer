/**
 * Deprecated compatibility re-export.
 *
 * New code should import the legacy bridge from
 * "@/lib/auth/legacy-next-auth" so the remaining NextAuth surface is explicit
 * instead of looking like the primary app auth layer.
 */
export { handlers, auth, signIn, signOut } from "@/lib/auth/legacy-next-auth"
