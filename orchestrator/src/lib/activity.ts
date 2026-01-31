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

  // Agent actions
  AGENT_ENABLED: "agent.enabled",
  AGENT_DISABLED: "agent.disabled",
  AGENT_DELETED: "agent.deleted",
  AGENT_SYNCED: "agent.synced",

  // Skill actions
  SKILL_CREATED: "skill.created",
  SKILL_IMPORTED: "skill.imported",
  SKILL_SYNCED: "skill.synced",
  SKILL_DELETED: "skill.deleted",

  // Automation actions
  AUTOMATION_COLUMN_UPDATED: "automation.column_updated",

  // Sync workflow actions
  SYNC_STARTED: "sync.started",
  SYNC_COMPLETED: "sync.completed",
  SYNC_FAILED: "sync.failed",

  // Integration actions
  INTEGRATION_CONNECTED: "integration.connected",
  INTEGRATION_DISCONNECTED: "integration.disconnected",
  SIGNALS_INGESTED: "signals.ingested",
  DOCUMENT_PUBLISHED: "document.published",
  TICKETS_SYNCED: "tickets.synced",
} as const;

export type ActivityAction =
  (typeof ActivityActions)[keyof typeof ActivityActions];

/**
 * Target types for activity logs
 */
export type ActivityTargetType =
  | "project"
  | "workspace"
  | "member"
  | "invitation"
  | "job"
  | "agent"
  | "skill"
  | "integration"
  | "sync";

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
  },
) {
  const { targetType, targetId, metadata } = options || {};

  const entry = await db
    .insert(activityLogs)
    .values({
      id: nanoid(),
      workspaceId,
      userId,
      action,
      targetType,
      targetId,
      metadata,
      createdAt: new Date(),
    })
    .returning();

  return entry[0];
}

/**
 * Helper: Log project creation
 */
export async function logProjectCreated(
  workspaceId: string,
  userId: string,
  projectId: string,
  projectName: string,
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
  toStage: string,
) {
  return logActivity(
    workspaceId,
    userId,
    ActivityActions.PROJECT_STAGE_CHANGED,
    {
      targetType: "project",
      targetId: projectId,
      metadata: { projectName, fromStage, toStage },
    },
  );
}

/**
 * Helper: Log member invited
 */
export async function logMemberInvited(
  workspaceId: string,
  userId: string,
  email: string,
  role: string,
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
  role: string,
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
  email: string,
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
  projectName?: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.JOB_TRIGGERED, {
    targetType: "job",
    targetId: jobId,
    metadata: { jobType, projectName },
  });
}

/**
 * Helper: Log agent enabled/disabled
 */
export async function logAgentToggled(
  workspaceId: string,
  userId: string,
  agentId: string,
  agentName: string,
  enabled: boolean,
) {
  const action = enabled
    ? ActivityActions.AGENT_ENABLED
    : ActivityActions.AGENT_DISABLED;
  return logActivity(workspaceId, userId, action, {
    targetType: "agent",
    targetId: agentId,
    metadata: { agentName, enabled },
  });
}

/**
 * Helper: Log agent deleted
 */
export async function logAgentDeleted(
  workspaceId: string,
  userId: string,
  agentId: string,
  agentName: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.AGENT_DELETED, {
    targetType: "agent",
    targetId: agentId,
    metadata: { agentName },
  });
}

/**
 * Helper: Log agents synced
 */
export async function logAgentsSynced(
  workspaceId: string,
  userId: string,
  count: number,
  source: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.AGENT_SYNCED, {
    targetType: "workspace",
    targetId: workspaceId,
    metadata: { count, source },
  });
}

/**
 * Helper: Log skill created
 */
export async function logSkillCreated(
  workspaceId: string,
  userId: string | null,
  skillId: string,
  skillName: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.SKILL_CREATED, {
    targetType: "skill",
    targetId: skillId,
    metadata: { skillName },
  });
}

/**
 * Helper: Log skill imported from marketplace
 */
export async function logSkillImported(
  workspaceId: string,
  userId: string | null,
  skillId: string,
  skillName: string,
  sourceId: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.SKILL_IMPORTED, {
    targetType: "skill",
    targetId: skillId,
    metadata: { skillName, sourceId },
  });
}

/**
 * Helper: Log skills synced
 */
export async function logSkillsSynced(
  workspaceId: string,
  userId: string | null,
  count: number,
  skillsPath?: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.SKILL_SYNCED, {
    targetType: "workspace",
    targetId: workspaceId,
    metadata: { count, skillsPath },
  });
}

/**
 * Helper: Log sync workflow started
 */
export async function logSyncStarted(
  workspaceId: string,
  userId: string | null,
  syncType: string,
  target?: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.SYNC_STARTED, {
    targetType: "sync",
    metadata: { syncType, target },
  });
}

/**
 * Helper: Log sync workflow completed
 */
export async function logSyncCompleted(
  workspaceId: string,
  userId: string | null,
  syncType: string,
  details?: { itemsProcessed?: number; duration?: number; target?: string },
) {
  return logActivity(workspaceId, userId, ActivityActions.SYNC_COMPLETED, {
    targetType: "sync",
    metadata: { syncType, ...details },
  });
}

/**
 * Helper: Log sync workflow failed
 */
export async function logSyncFailed(
  workspaceId: string,
  userId: string | null,
  syncType: string,
  error: string,
) {
  return logActivity(workspaceId, userId, ActivityActions.SYNC_FAILED, {
    targetType: "sync",
    metadata: { syncType, error },
  });
}
