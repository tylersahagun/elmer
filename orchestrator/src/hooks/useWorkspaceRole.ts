import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { WorkspaceRole } from "@/lib/db/schema";

interface WorkspaceMember {
  id: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
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
  const { data: session } = useSession();

  const { data: members, isLoading } = useQuery<WorkspaceMember[]>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) return [];
        throw new Error("Failed to fetch members");
      }
      return res.json();
    },
    enabled: !!workspaceId && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const membership = members?.find((m) => m.userId === session?.user?.id) || null;
  const role = membership?.role || null;

  return {
    role,
    isAdmin: role === "admin",
    canEdit: role === "admin" || role === "member",
    canView: role !== null,
    isLoading,
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
