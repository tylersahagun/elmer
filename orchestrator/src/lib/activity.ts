import { db } from "./db";
import { activityLogs } from "./db/schema";
import { nanoid } from "nanoid";

/**
 * Activity action types for consistent logging
 */
export const ActivityActions = {
  // Project actions
  PROJECT_CREATED: "project.created",
  PROJECT_STAGE_CHANGED: "project.stage_changed",
  PROJECT_ARCHIVED: "project.archived",
  PROJECT_DELETED: "project.deleted",
  
  // Member actions
  MEMBER_INVITED: "member.invited",
  MEMBER_JOINED: "member.joined",
  MEMBER_REMOVED: "member.removed",
  MEMBER_ROLE_CHANGED: "member.role_changed",
  
  // Invitation actions
  INVITATION_REVOKED: "invitation.revoked",
  
  // Job actions
  JOB_TRIGGERED: "job.triggered",
  JOB_COMPLETED: "job.completed",
  JOB_FAILED: "job.failed",
  
  // Workspace actions
  WORKSPACE_UPDATED: "workspace.updated",
  WORKSPACE_CREATED: "workspace.created",
  
  // Knowledge sync
  KNOWLEDGE_SYNCED: "knowledge.synced",
} as const;

export type ActivityAction = (typeof ActivityActions)[keyof typeof ActivityActions];

/**
 * Target types for activity logs
 */
export type ActivityTargetType = "project" | "workspace" | "member" | "invitation" | "job";

/**
 * Log an activity to the workspace activity feed
 */
export async function logActivity(
  workspaceId: string,
  userId: string | null,
  action: ActivityAction | string,
  options?: {
    targetType?: ActivityTargetType;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { targetType, targetId, metadata } = options || {};
  
  const entry = await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId,
    action,
    targetType,
    targetId,
    metadata,
    createdAt: new Date(),
  }).returning();
  
  return entry[0];
}

/**
 * Helper: Log project creation
 */
export async function logProjectCreated(
  workspaceId: string,
  userId: string,
  projectId: string,
  projectName: string
) {
  return logActivity(workspaceId, userId, ActivityActions.PROJECT_CREATED, {
    targetType: "project",
    targetId: projectId,
    metadata: { projectName },
  });
}

/**
 * Helper: Log project stage change
 */
export async function logProjectStageChanged(
  workspaceId: string,
  userId: string,
  projectId: string,
  projectName: string,
  fromStage: string | null,
  toStage: string
) {
  return logActivity(workspaceId, userId, ActivityActions.PROJECT_STAGE_CHANGED, {
    targetType: "project",
    targetId: projectId,
    metadata: { projectName, fromStage, toStage },
  });
}

/**
 * Helper: Log member invited
 */
export async function logMemberInvited(
  workspaceId: string,
  userId: string,
  email: string,
  role: string
) {
  return logActivity(workspaceId, userId, ActivityActions.MEMBER_INVITED, {
    targetType: "invitation",
    metadata: { email, role },
  });
}

/**
 * Helper: Log member joined
 */
export async function logMemberJoined(
  workspaceId: string,
  userId: string,
  role: string
) {
  return logActivity(workspaceId, userId, ActivityActions.MEMBER_JOINED, {
    targetType: "member",
    targetId: userId,
    metadata: { role },
  });
}

/**
 * Helper: Log invitation revoked
 */
export async function logInvitationRevoked(
  workspaceId: string,
  userId: string,
  email: string
) {
  return logActivity(workspaceId, userId, ActivityActions.INVITATION_REVOKED, {
    targetType: "invitation",
    metadata: { email },
  });
}

/**
 * Helper: Log job triggered
 */
export async function logJobTriggered(
  workspaceId: string,
  userId: string,
  jobId: string,
  jobType: string,
  projectName?: string
) {
  return logActivity(workspaceId, userId, ActivityActions.JOB_TRIGGERED, {
    targetType: "job",
    targetId: jobId,
    metadata: { jobType, projectName },
  });
}
