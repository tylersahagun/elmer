import { NextResponse } from "next/server";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      null;

    if (!clerkUser || !email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    return NextResponse.json({
      id: clerkUser.id,
      clerkUserId: clerkUser.id,
      email,
      name: clerkUser.fullName ?? clerkUser.username ?? null,
      image: clerkUser.imageUrl ?? null,
    });
  } catch (error) {
    console.error("Failed to resolve current app user:", error);
    return NextResponse.json(
      { error: "Failed to resolve current user" },
      { status: 500 },
    );
  }
}
