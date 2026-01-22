import { db } from "@/lib/db";
import {
  stageTransitionEvents,
  workspaceMembers,
  projects,
  activityLogs,
} from "@/lib/db/schema";
import { eq, and, like, isNull, notExists } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface BackfillActorsResult {
  success: boolean;
  stageTransitionsUpdated: number;
  activityLogsCreated: number;
  error?: string;
}

/**
 * Backfills actor attribution in stage transition events.
 * Updates events with "user" as actor to reference the workspace admin.
 * This migration is idempotent.
 */
export async function backfillActors(): Promise<BackfillActorsResult> {
  try {
    let stageTransitionsUpdated = 0;
    let activityLogsCreated = 0;

    // Find all stage transition events with "user" as actor (not "user:{id}")
    const genericUserTransitions = await db
      .select({
        id: stageTransitionEvents.id,
        cardId: stageTransitionEvents.cardId,
        workspaceId: stageTransitionEvents.workspaceId,
        fromStage: stageTransitionEvents.fromStage,
        toStage: stageTransitionEvents.toStage,
        actor: stageTransitionEvents.actor,
      })
      .from(stageTransitionEvents)
      .where(eq(stageTransitionEvents.actor, "user"));

    // Update each transition to reference the workspace admin
    for (const transition of genericUserTransitions) {
      // Find the admin for this workspace
      const admin = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, transition.workspaceId),
          eq(workspaceMembers.role, "admin")
        ),
      });

      if (admin) {
        await db
          .update(stageTransitionEvents)
          .set({ actor: `user:${admin.userId}` })
          .where(eq(stageTransitionEvents.id, transition.id));
        stageTransitionsUpdated++;
      }
    }

    // Find all projects that don't have a "project.created" activity log
    const projectsWithoutCreationLog = await db
      .select({
        id: projects.id,
        name: projects.name,
        workspaceId: projects.workspaceId,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(
        notExists(
          db
            .select()
            .from(activityLogs)
            .where(
              and(
                eq(activityLogs.targetType, "project"),
                eq(activityLogs.targetId, projects.id),
                eq(activityLogs.action, "project.created")
              )
            )
        )
      );

    // Create activity logs for existing projects
    for (const project of projectsWithoutCreationLog) {
      // Find the admin for this workspace
      const admin = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, project.workspaceId),
          eq(workspaceMembers.role, "admin")
        ),
      });

      if (admin) {
        await db.insert(activityLogs).values({
          id: nanoid(),
          workspaceId: project.workspaceId,
          userId: admin.userId,
          action: "project.created",
          targetType: "project",
          targetId: project.id,
          metadata: {
            projectName: project.name,
            backfilled: true,
          },
          createdAt: project.createdAt, // Use original creation date
        });
        activityLogsCreated++;
      }
    }

    console.log(
      `✅ Backfill complete: ${stageTransitionsUpdated} transitions updated, ${activityLogsCreated} activity logs created`
    );

    return {
      success: true,
      stageTransitionsUpdated,
      activityLogsCreated,
    };
  } catch (error) {
    console.error("Backfill failed:", error);
    return {
      success: false,
      stageTransitionsUpdated: 0,
      activityLogsCreated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
