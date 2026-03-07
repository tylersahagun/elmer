"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

/**
 * Drop-in replacement for next-auth's useSession().
 * Returns user + loading state, backed by Clerk + Convex auth.
 */
export function useCurrentUser(): {
  user: CurrentUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
} {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [resolvedUser, setResolvedUser] = useState<{
    clerkUserId: string;
    user: CurrentUser;
  } | null>(null);

  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn || !clerkUser) {
      return;
    }

    if (resolvedUser?.clerkUserId === clerkUser.id) {
      return;
    }

    let cancelled = false;

    const fallbackUser: CurrentUser = {
      id: clerkUser.id,
      name: clerkUser.fullName ?? clerkUser.username ?? null,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      image: clerkUser.imageUrl ?? null,
    };

    void fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to resolve current app user");
        }
        return (await res.json()) as CurrentUser;
      })
      .then((appUser) => {
        if (!cancelled) {
          setResolvedUser({ clerkUserId: clerkUser.id, user: appUser });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedUser({ clerkUserId: clerkUser.id, user: fallbackUser });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clerkUser, isClerkLoaded, isSignedIn, resolvedUser?.clerkUserId]);

  const isResolvingUser = Boolean(
    isClerkLoaded &&
      isSignedIn &&
      clerkUser &&
      resolvedUser?.clerkUserId !== clerkUser.id,
  );

  if (!isClerkLoaded || (isSignedIn && isResolvingUser)) {
    return { user: null, isLoaded: false, isSignedIn: false };
  }

  if (!isSignedIn || !clerkUser) {
    return { user: null, isLoaded: true, isSignedIn: false };
  }

  return {
    user: resolvedUser?.user ?? null,
    isLoaded: true,
    isSignedIn: Boolean(isSignedIn),
  };
}
