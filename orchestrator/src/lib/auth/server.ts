import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";

export interface AppUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  image: string | null;
}

export class AppAuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AppAuthenticationError";
  }
}

function getClerkPrimaryEmail(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null
  );
}

/**
 * Get the current authenticated user from Clerk.
 * The `id` field is the Clerk user ID (no Postgres user table involved).
 */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  const { userId } = await clerkAuth();
  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const email = getClerkPrimaryEmail(clerkUser);

  if (!clerkUser || !email) {
    return null;
  }

  return {
    id: clerkUser.id,
    clerkUserId: clerkUser.id,
    email,
    name: clerkUser.fullName ?? clerkUser.username ?? null,
    image: clerkUser.imageUrl ?? null,
  };
}

export async function requireCurrentAppUser(): Promise<AppUser> {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new AppAuthenticationError();
  }

  return appUser;
}
