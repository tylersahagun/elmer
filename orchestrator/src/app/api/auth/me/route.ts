import { NextResponse } from "next/server";
import {
  AppAuthenticationError,
  requireCurrentAppUser,
} from "@/lib/auth/server";

export async function GET() {
  try {
    const user = await requireCurrentAppUser();
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof AppAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Failed to resolve current app user:", error);
    return NextResponse.json(
      { error: "Failed to resolve current user" },
      { status: 500 },
    );
  }
}
