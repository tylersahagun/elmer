import { auth } from "@/auth";
import { getWorkspaceMembership } from "@/lib/db/queries";
import type { WorkspaceRole } from "@/lib/db/schema";

/**
 * Role hierarchy - higher index = more permissions
 */
const ROLE_HIERARCHY: WorkspaceRole[] = ["viewer", "member", "admin"];

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
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Get the role level for comparison
 */
export function getRoleLevel(role: WorkspaceRole): number {
  return ROLE_HIERARCHY.indexOf(role);
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
  // Check authentication
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }

  const userId = session.user.id;

  // Check membership
  const membership = await getWorkspaceMembership(workspaceId, userId);

  if (!membership) {
    throw new NotMemberError();
  }

  // Check role
  if (!hasPermission(membership.role, requiredRole)) {
    throw new InsufficientRoleError(requiredRole);
  }

  return {
    id: membership.id,
    userId,
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
