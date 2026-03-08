import { auth as clerkAuth } from "@clerk/nextjs/server";
import { AppAuthenticationError, getCurrentAppUser, requireCurrentAppUser } from "@/lib/auth/server";
import { getWorkspaceMembership } from "@/lib/db/queries";
import { getConvexWorkspaceAccess, listConvexWorkspaceMembers } from "@/lib/convex/server";
import {
  canUseCoordinatorViewerAccess,
  normalizeViewerEmail,
} from "@/lib/auth/coordinator-viewer";
import type { WorkspaceRole } from "@/lib/db/schema";

/**
 * Role hierarchy - higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
};

/**
 * Role hierarchy as array - higher index = more permissions
 */
const ROLE_HIERARCHY_ARRAY: WorkspaceRole[] = ["viewer", "member", "admin"];

/**
 * Permission error types
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHENTICATED" | "NOT_MEMBER" | "INSUFFICIENT_ROLE",
    public status: number
  ) {
    super(message);
    this.name = "PermissionError";
  }
}

export class UnauthenticatedError extends PermissionError {
  constructor() {
    super("Authentication required", "UNAUTHENTICATED", 401);
  }
}

export class NotMemberError extends PermissionError {
  constructor() {
    super("Not a member of this workspace", "NOT_MEMBER", 403);
  }
}

export class InsufficientRoleError extends PermissionError {
  constructor(requiredRole: WorkspaceRole) {
    super(
      `This action requires ${requiredRole} role or higher`,
      "INSUFFICIENT_ROLE",
      403
    );
  }
}

/**
 * Check if a role has at least the required permission level
 */
export function hasPermission(
  userRole: WorkspaceRole,
  requiredRole: WorkspaceRole
): boolean {
  const userLevel = ROLE_HIERARCHY_ARRAY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY_ARRAY.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Get the role level for comparison
 */
export function getRoleLevel(role: WorkspaceRole): number {
  return ROLE_HIERARCHY_ARRAY.indexOf(role);
}

/**
 * Check if user can perform admin actions
 */
export function canAdmin(role: WorkspaceRole): boolean {
  return role === "admin";
}

/**
 * Check if user can perform edit actions (admin or member)
 */
export function canEdit(role: WorkspaceRole): boolean {
  return hasPermission(role, "member");
}

/**
 * Check if user can view (any role)
 */
export function canView(role: WorkspaceRole): boolean {
  return hasPermission(role, "viewer");
}

/**
 * Workspace membership with role information
 */
export interface WorkspaceMembership {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

/**
 * Require workspace access with optional role requirement
 * 
 * @param workspaceId - The workspace to check access for
 * @param requiredRole - Minimum role required (default: viewer)
 * @returns The user's membership if authorized
 * @throws PermissionError if not authorized
 * 
 * @example
 * // In an API route:
 * const membership = await requireWorkspaceAccess(workspaceId, "admin");
 * // membership.role is guaranteed to be "admin"
 */
export async function requireWorkspaceAccess(
  workspaceId: string,
  requiredRole: WorkspaceRole = "viewer"
): Promise<WorkspaceMembership & { userId: string }> {
  const { userId: clerkUserId } = await clerkAuth();
  if (!clerkUserId) {
    throw new UnauthenticatedError();
  }

  // Check Convex membership first (source of truth for newly created workspaces)
  const convexAccess = await getConvexWorkspaceAccess(workspaceId, clerkUserId);
  const convexMembership = (convexAccess as { membership?: { role: WorkspaceRole; workspaceId: string } } | null)?.membership;
  let currentAppUser = null;
  let convexMembers: Array<{
    _id: string;
    userId?: string;
    clerkUserId: string;
    role: WorkspaceRole;
    joinedAt: number;
    email?: string;
  }> | null = null;

  if (convexMembership) {
    if (!hasPermission(convexMembership.role, requiredRole)) {
      throw new InsufficientRoleError(requiredRole);
    }

    let fallbackUserId = clerkUserId;
    try {
      currentAppUser = await getCurrentAppUser();
      if (currentAppUser?.id) {
        fallbackUserId = currentAppUser.id;
      }
    } catch (error) {
      console.warn(
        "Convex workspace access succeeded but local app user resolution failed; continuing with Clerk identity fallback.",
        error,
      );
    }

    return {
      id: `${workspaceId}:${clerkUserId}`,
      userId: fallbackUserId,
      workspaceId: convexMembership.workspaceId,
      role: convexMembership.role,
      joinedAt: new Date(),
    };
  }

  try {
    currentAppUser ??= await getCurrentAppUser();
  } catch (error) {
    console.warn(
      "Direct Convex workspace membership lookup failed to resolve the local app user bridge.",
      error,
    );
  }

  const currentAppUserEmail = normalizeViewerEmail(currentAppUser?.email);
  if (currentAppUserEmail) {
    try {
      convexMembers = await listConvexWorkspaceMembers(workspaceId) as Array<{
        _id: string;
        userId?: string;
        clerkUserId: string;
        role: WorkspaceRole;
        joinedAt: number;
        email?: string;
      }>;
      const bridgedMembership = convexMembers.find(
        (member) => normalizeViewerEmail(member.email) === currentAppUserEmail,
      );

      if (bridgedMembership) {
        if (!hasPermission(bridgedMembership.role, requiredRole)) {
          throw new InsufficientRoleError(requiredRole);
        }

        return {
          id: bridgedMembership._id,
          userId: currentAppUser.id ?? bridgedMembership.userId ?? clerkUserId,
          workspaceId,
          role: bridgedMembership.role,
          joinedAt: new Date(bridgedMembership.joinedAt),
        };
      }
    } catch (error) {
      if (error instanceof PermissionError) {
        throw error;
      }
      console.warn(
        "Convex workspace email bridge lookup failed; falling back to legacy membership.",
        error,
      );
    }
  }

  if (
    canUseCoordinatorViewerAccess({
      workspaceId,
      clerkUserId,
      email: currentAppUserEmail,
      requiredRole,
      convexMembersCount: convexMembers?.length ?? null,
    })
  ) {
    console.warn(
      "Allowing coordinator viewer access without a Convex membership mirror.",
      { workspaceId, clerkUserId, email: currentAppUserEmail },
    );
    return {
      id: `${workspaceId}:${clerkUserId}:internal-viewer`,
      userId: currentAppUser?.id ?? clerkUserId,
      workspaceId,
      role: "viewer",
      joinedAt: new Date(),
    };
  }

  // Fallback to legacy app-user membership while migration is in progress
  let appUser;
  try {
    appUser = currentAppUser ?? (await requireCurrentAppUser());
  } catch (error) {
    if (error instanceof AppAuthenticationError) {
      throw new UnauthenticatedError();
    }
    throw error;
  }

  if (!appUser?.id) {
    throw new UnauthenticatedError();
  }

  // Fallback to legacy Drizzle membership while migration is in progress
  const membership = await getWorkspaceMembership(workspaceId, appUser.id);
  if (!membership) {
    throw new NotMemberError();
  }

  // Check role
  if (!hasPermission(membership.role, requiredRole)) {
    throw new InsufficientRoleError(requiredRole);
  }

  return {
    id: membership.id,
    userId: appUser.id,
    workspaceId: membership.workspaceId,
    role: membership.role,
    joinedAt: membership.joinedAt,
  };
}

/**
 * Get current user's workspace membership without throwing
 * Returns null if not authenticated or not a member
 */
export async function getWorkspaceAccessSafe(
  workspaceId: string
): Promise<(WorkspaceMembership & { userId: string }) | null> {
  try {
    return await requireWorkspaceAccess(workspaceId, "viewer");
  } catch {
    return null;
  }
}

/**
 * Helper to handle permission errors in API routes
 */
export function handlePermissionError(error: unknown): {
  error: string;
  status: number;
} {
  if (error instanceof PermissionError) {
    return {
      error: error.message,
      status: error.status,
    };
  }
  
  console.error("Unexpected error:", error);
  return {
    error: "An unexpected error occurred",
    status: 500,
  };
}

/**
 * Permission requirements for different operations
 */
export const PERMISSION_REQUIREMENTS = {
  // Workspace operations
  "workspace.view": "viewer" as WorkspaceRole,
  "workspace.edit": "admin" as WorkspaceRole,
  "workspace.delete": "admin" as WorkspaceRole,
  
  // Member operations
  "members.view": "viewer" as WorkspaceRole,
  "members.invite": "admin" as WorkspaceRole,
  "members.remove": "admin" as WorkspaceRole,
  "members.changeRole": "admin" as WorkspaceRole,
  
  // Project operations
  "project.view": "viewer" as WorkspaceRole,
  "project.create": "member" as WorkspaceRole,
  "project.edit": "member" as WorkspaceRole,
  "project.delete": "admin" as WorkspaceRole,
  
  // Job operations
  "job.view": "viewer" as WorkspaceRole,
  "job.trigger": "member" as WorkspaceRole,
  "job.cancel": "member" as WorkspaceRole,
} as const;

export type PermissionAction = keyof typeof PERMISSION_REQUIREMENTS;

/**
 * Check if user can perform a specific action
 */
export function canPerformAction(
  userRole: WorkspaceRole,
  action: PermissionAction
): boolean {
  const requiredRole = PERMISSION_REQUIREMENTS[action];
  return hasPermission(userRole, requiredRole);
}

/**
 * Check workspace access without authentication (for testing)
 * Returns membership if found, null otherwise
 */
export async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<WorkspaceMembership | null> {
  const membership = await getWorkspaceMembership(workspaceId, userId);
  
  if (!membership) {
    return null;
  }

  return {
    id: membership.id,
    userId,
    workspaceId: membership.workspaceId,
    role: membership.role,
    joinedAt: membership.joinedAt,
  };
}
