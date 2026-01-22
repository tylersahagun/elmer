import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate email and password are present
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check for existing user with same email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12)

    // Generate unique ID
    const userId = nanoid()

    // Default name to email prefix if not provided
    const userName = name || email.split("@")[0]

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name: userName,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      })

    // Return user without passwordHash
    return NextResponse.json(
      { user: newUser },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
