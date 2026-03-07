import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getUserByEmail, upsertUserByEmail } from "@/lib/db/queries";

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

  const appUser = await upsertUserByEmail({
    email,
    name: clerkUser.fullName ?? clerkUser.username ?? null,
    image: clerkUser.imageUrl ?? null,
  });

  if (!appUser) {
    return null;
  }

  return {
    id: appUser.id,
    clerkUserId: clerkUser.id,
    email: appUser.email,
    name: appUser.name,
    image: appUser.image,
  };
}

export async function requireCurrentAppUser(): Promise<AppUser> {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new AppAuthenticationError();
  }

  return appUser;
}

export async function getAppUserByEmail(email: string): Promise<AppUser | null> {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    clerkUserId: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
