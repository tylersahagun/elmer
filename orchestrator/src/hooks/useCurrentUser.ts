"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";

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
  const { user, isLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();

  if (!isLoaded) {
    return { user: null, isLoaded: false, isSignedIn: false };
  }

  if (!user) {
    return { user: null, isLoaded: true, isSignedIn: false };
  }

  return {
    user: {
      id: user.id,
      name: user.fullName ?? user.username ?? null,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      image: user.imageUrl ?? null,
    },
    isLoaded: true,
    isSignedIn: isAuthenticated,
  };
}
