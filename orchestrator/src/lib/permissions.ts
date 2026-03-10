import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getConvexWorkspaceAccess, listConvexWorkspaceMembers } from "@/lib/convex/server";
import {
  canUseCoordinatorViewerAccess,
  normalizeViewerEmail,
} from "@/lib/auth/coordinator-viewer";

export type WorkspaceRole = "viewer" | "member" | "admin";

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
 * Require workspace access with optional role requirement.
 *
 * Authorization is Convex-only. There is no Postgres/Drizzle fallback.
 * Identity is Clerk (clerkUserId). Membership is stored in Convex workspaceMembers.
 *
 * @param workspaceId - The workspace to check access for
 * @param requiredRole - Minimum role required (default: viewer)
 * @returns The user's membership if authorized
 * @throws PermissionError if not authorized
 */
export async function requireWorkspaceAccess(
  workspaceId: string,
  requiredRole: WorkspaceRole = "viewer"
): Promise<WorkspaceMembership & { userId: string }> {
  const { userId: clerkUserId } = await clerkAuth();
  if (!clerkUserId) {
    throw new UnauthenticatedError();
  }

  // Primary path: Convex membership lookup by Clerk user ID
  const convexAccess = await getConvexWorkspaceAccess(workspaceId, clerkUserId);
  const convexMembership = (convexAccess as { membership?: { role: WorkspaceRole; workspaceId: string } } | null)?.membership;

  if (convexMembership) {
    if (!hasPermission(convexMembership.role, requiredRole)) {
      throw new InsufficientRoleError(requiredRole);
    }
    return {
      id: `${workspaceId}:${clerkUserId}`,
      userId: clerkUserId,
      workspaceId: convexMembership.workspaceId,
      role: convexMembership.role,
      joinedAt: new Date(),
    };
  }

  // Email bridge: user was added by email before their Clerk ID was recorded.
  // Resolve their Clerk email and scan workspace members for a match.
  type ConvexMember = {
    _id: string;
    userId?: string;
    clerkUserId: string;
    role: WorkspaceRole;
    joinedAt: number;
    email?: string;
  };
  let convexMembers: ConvexMember[] | null = null;

  let currentEmail: string | null = null;
  try {
    const clerkUser = await currentUser();
    currentEmail = normalizeViewerEmail(
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      null
    );
  } catch {
    // If Clerk user resolution fails, we proceed without email bridge
  }

  if (currentEmail) {
    try {
      convexMembers = await listConvexWorkspaceMembers(workspaceId) as ConvexMember[];
      const bridgedMembership = convexMembers?.find(
        (member) => normalizeViewerEmail(member.email) === currentEmail,
      );

      if (bridgedMembership) {
        if (!hasPermission(bridgedMembership.role, requiredRole)) {
          throw new InsufficientRoleError(requiredRole);
        }
        return {
          id: bridgedMembership._id,
          userId: bridgedMembership.userId ?? clerkUserId,
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
        "Convex workspace email bridge lookup failed.",
        error,
      );
    }
  }

  // Coordinator viewer bridge for bootstrapping the coordinator workspace
  if (
    canUseCoordinatorViewerAccess({
      workspaceId,
      clerkUserId,
      email: currentEmail,
      requiredRole,
      convexMembersCount: convexMembers?.length ?? null,
    })
  ) {
    console.warn(
      "Allowing coordinator viewer access without a Convex membership mirror.",
      { workspaceId, clerkUserId, email: currentEmail },
    );
    return {
      id: `${workspaceId}:${clerkUserId}:internal-viewer`,
      userId: clerkUserId,
      workspaceId,
      role: "viewer",
      joinedAt: new Date(),
    };
  }

  throw new NotMemberError();
}

/**
 * Get current user's workspace membership without throwing.
 * Returns null if not authenticated or not a member.
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
