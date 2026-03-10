import { useQuery } from "convex/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
type WorkspaceRole = "admin" | "member" | "viewer";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface WorkspaceMember {
  id: string;
  userId: string;
  clerkUserId?: string;
  role: WorkspaceRole;
  joinedAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface UseWorkspaceRoleResult {
  role: WorkspaceRole | null;
  isAdmin: boolean;
  canEdit: boolean;
  canView: boolean;
  isLoading: boolean;
  membership: WorkspaceMember | null;
}

/**
 * Hook to get the current user's role in a workspace
 * and provide permission helpers
 */
export function useWorkspaceRole(workspaceId: string | null): UseWorkspaceRoleResult {
  const { user, isSignedIn } = useCurrentUser();

  const rawMembership = useQuery(
    api.memberships.getMyMembership,
    workspaceId && isSignedIn ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
  ) as
    | {
        _id: string;
        userId?: string;
        clerkUserId: string;
        role: WorkspaceRole;
        joinedAt: number;
        displayName?: string;
        email?: string;
        image?: string;
      }
    | null
    | undefined;

  const membership: WorkspaceMember | null = rawMembership
    ? {
        id: rawMembership._id,
        userId: rawMembership.userId ?? user?.id ?? rawMembership.clerkUserId,
        clerkUserId: rawMembership.clerkUserId,
        role: rawMembership.role,
        joinedAt: new Date(rawMembership.joinedAt),
        user: {
          id: rawMembership.userId ?? user?.id ?? rawMembership.clerkUserId,
          name: rawMembership.displayName ?? user?.name ?? null,
          email: rawMembership.email ?? user?.email ?? "",
          image: rawMembership.image ?? user?.image ?? null,
        },
      }
    : null;
  const role = membership?.role || null;

  return {
    role,
    isAdmin: role === "admin",
    canEdit: role === "admin" || role === "member",
    canView: role !== null,
    isLoading: workspaceId ? rawMembership === undefined : false,
    membership,
  };
}

/**
 * Permission check helpers (for use outside React components)
 */
export function hasPermission(
  userRole: WorkspaceRole | null,
  requiredRole: WorkspaceRole
): boolean {
  if (!userRole) return false;
  
  const hierarchy: WorkspaceRole[] = ["viewer", "member", "admin"];
  const userLevel = hierarchy.indexOf(userRole);
  const requiredLevel = hierarchy.indexOf(requiredRole);
  
  return userLevel >= requiredLevel;
}

export function canPerformAction(
  userRole: WorkspaceRole | null,
  action: 
    | "invite"
    | "edit_workspace"
    | "delete_project"
    | "create_project"
    | "edit_project"
    | "trigger_job"
    | "view"
): boolean {
  if (!userRole) return false;

  switch (action) {
    case "invite":
    case "edit_workspace":
    case "delete_project":
      return userRole === "admin";
    case "create_project":
    case "edit_project":
    case "trigger_job":
      return userRole === "admin" || userRole === "member";
    case "view":
      return true;
    default:
      return false;
  }
}
