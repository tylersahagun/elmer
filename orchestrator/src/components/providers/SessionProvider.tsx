"use client";

// NextAuth SessionProvider removed — auth is now handled by Clerk + ConvexProviderWithClerk.
// This stub keeps existing imports working during the migration.
// TODO: remove all useSession() call sites and delete this file.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
