"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useCurrentUser } from "./useCurrentUser";

export interface PresenceEntry {
  _id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  location: string;
  projectId?: string | null;
  documentId?: string | null;
  lastSeen?: number;
}

export function derivePresenceContext(pathname: string) {
  const projectMatch = pathname.match(/\/projects\/([^/?]+)/);
  const documentMatch = pathname.match(/\/documents\/([^/?]+)/);
  return {
    location: pathname,
    projectId: projectMatch?.[1],
    documentId: documentMatch?.[1],
  };
}

export function filterPresenceByProject(
  entries: PresenceEntry[] | undefined,
  projectId?: string | null,
) {
  if (!entries?.length || !projectId) {
    return [];
  }

  return entries.filter((entry) => entry.projectId === projectId);
}

export function usePresenceHeartbeat(workspaceId?: string, pathname?: string) {
  const { user, isSignedIn, isLoaded } = useCurrentUser();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const upsertPresence = useMutation(api.presence.upsert);
  const clearPresence = useMutation(api.presence.clear);

  const context = useMemo(
    () => (pathname ? derivePresenceContext(pathname) : null),
    [pathname],
  );

  useEffect(() => {
    if (
      !workspaceId ||
      !context ||
      !user ||
      !isLoaded ||
      !isSignedIn ||
      !isConvexAuthenticated
    ) {
      return;
    }

    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      await upsertPresence({
        workspaceId: workspaceId as Id<"workspaces">,
        displayName: user.name ?? user.email ?? user.id,
        avatarUrl: user.image ?? undefined,
        location: context.location,
        projectId: context.projectId as Id<"projects"> | undefined,
        documentId: context.documentId,
      });
    };

    void tick();
    const interval = window.setInterval(() => void tick(), 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      void clearPresence({ workspaceId: workspaceId as Id<"workspaces"> });
    };
  }, [
    clearPresence,
    context,
    isLoaded,
    isSignedIn,
    isConvexAuthenticated,
    upsertPresence,
    user,
    workspaceId,
  ]);
}

export function useWorkspacePresence(workspaceId?: string) {
  return useQuery(
    api.presence.byWorkspace,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
  ) as PresenceEntry[] | undefined;
}

export function useDocumentPresence(workspaceId?: string, documentId?: string) {
  return useQuery(
    api.presence.byDocument,
    workspaceId && documentId
      ? {
          workspaceId: workspaceId as Id<"workspaces">,
          documentId,
        }
      : "skip",
  ) as PresenceEntry[] | undefined;
}
