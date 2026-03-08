import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getCurrentAppUser } from "@/lib/auth/server";
import {
  createConvexWorkspace,
  listConvexWorkspaces,
} from "@/lib/convex/server";
import { slugifyWorkspaceName } from "@/lib/workspaces/path";

function getClerkPrimaryEmail(
  user: Awaited<ReturnType<typeof currentUser>>,
) {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null
  );
}

async function getWorkspaceRouteIdentity() {
  const { userId } = await clerkAuth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  return {
    clerkUserId: userId,
    email: getClerkPrimaryEmail(user),
    name: user?.fullName ?? user?.username ?? null,
    image: user?.imageUrl ?? null,
  };
}

export async function GET() {
  try {
    const identity = await getWorkspaceRouteIdentity();
    if (!identity) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const workspaces = await listConvexWorkspaces(
      identity.clerkUserId,
      identity.email,
    );
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Failed to get workspaces:", error);
    return NextResponse.json(
      { error: "Failed to get workspaces" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getWorkspaceRouteIdentity();
    if (!identity) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, description, githubRepo, contextPath } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let actorUserId: string | undefined;
    try {
      const appUser = await getCurrentAppUser();
      actorUserId = appUser?.id;
    } catch (error) {
      console.warn(
        "Workspace creation continuing without local app-user bridge.",
        error,
      );
    }

    const normalizedName = String(name).trim();
    const workspace = await createConvexWorkspace({
      clerkUserId: identity.clerkUserId,
      name: normalizedName,
      slug: slugifyWorkspaceName(normalizedName),
      description,
      githubRepo,
      contextPath,
      actorUserId,
      actorEmail: identity.email ?? undefined,
      actorName: identity.name ?? undefined,
      actorImage: identity.image ?? undefined,
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Failed to create workspace:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create workspace";
    const status = message.includes("already taken") ? 409 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
