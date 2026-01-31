import { db } from "@/lib/db";
import { workspaces, workspaceMembers, users } from "@/lib/db/schema";
import { eq, notExists, asc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface AssignWorkspacesResult {
  success: boolean;
  assignedCount: number;
  targetUser: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  workspaceIds: string[];
  error?: string;
}

/**
 * Assigns all orphaned workspaces (workspaces without any members) to the first user.
 * This migration is idempotent - running it multiple times has no effect if already done.
 *
 * @returns Migration result with count of assigned workspaces
 */
export async function assignOrphanedWorkspaces(): Promise<AssignWorkspacesResult> {
  try {
    // Find the first user by creation date
    const firstUser = await db.query.users.findFirst({
      orderBy: [asc(users.createdAt)],
    });

    if (!firstUser) {
      return {
        success: false,
        assignedCount: 0,
        targetUser: null,
        workspaceIds: [],
        error: "No users found in the database. Please create a user first.",
      };
    }

    // Find all workspaces that don't have any members
    // Using a subquery to find workspaces not in workspaceMembers
    const orphanedWorkspaces = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(
        notExists(
          db
            .select()
            .from(workspaceMembers)
            .where(eq(workspaceMembers.workspaceId, workspaces.id)),
        ),
      );

    if (orphanedWorkspaces.length === 0) {
      return {
        success: true,
        assignedCount: 0,
        targetUser: {
          id: firstUser.id,
          email: firstUser.email,
          name: firstUser.name,
        },
        workspaceIds: [],
      };
    }

    const existingWorkspaces = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(
        inArray(
          workspaces.id,
          orphanedWorkspaces.map((ws) => ws.id),
        ),
      );
    const existingIds = new Set(existingWorkspaces.map((ws) => ws.id));
    const eligibleWorkspaces = orphanedWorkspaces.filter((ws) =>
      existingIds.has(ws.id),
    );

    if (eligibleWorkspaces.length === 0) {
      return {
        success: true,
        assignedCount: 0,
        targetUser: {
          id: firstUser.id,
          email: firstUser.email,
          name: firstUser.name,
        },
        workspaceIds: [],
      };
    }

    // Create membership entries for all orphaned workspaces
    const membershipInserts = eligibleWorkspaces.map((ws) => ({
      id: nanoid(),
      workspaceId: ws.id,
      userId: firstUser.id,
      role: "admin" as const,
      joinedAt: new Date(),
    }));

    // Insert all memberships in a single batch
    await db.insert(workspaceMembers).values(membershipInserts);

    console.log(
      `✅ Assigned ${membershipInserts.length} workspaces to user ${firstUser.email}`,
    );

    return {
      success: true,
      assignedCount: membershipInserts.length,
      targetUser: {
        id: firstUser.id,
        email: firstUser.email,
        name: firstUser.name,
      },
      workspaceIds: eligibleWorkspaces.map((ws) => ws.id),
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return {
      success: false,
      assignedCount: 0,
      targetUser: null,
      workspaceIds: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
