// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db"; // adjust path if needed (src/db/index.ts)
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";

// Temporary hardcoded password for testing only
// Baad mein bcrypt use kar lenge real password ke liye
const TEST_PASSWORD = "admin123"; // ← Yeh change kar dena apne according

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Basic input check
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email aur password dono bhariye" },
        { status: 400 }
      );
    }

    // User dhundho database mein
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.name,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json({ error: "User nahi mila" }, { status: 401 });
    }

    const user = userList[0];

    // Account active check (employee chhod gaya toh block)
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account deactivate ho chuka hai" },
        { status: 403 }
      );
    }

    // Password check (temporary hardcoded)
    if (password !== TEST_PASSWORD) {
      return NextResponse.json({ error: "Galat password" }, { status: 401 });
    }

    // Login success → simple session cookie set karo
    const sessionPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const response = NextResponse.json({
      success: true,
      message: "Login ho gaya!",
      user: sessionPayload,
    });

    // Cookie set (httpOnly for security)
    response.cookies.set("admin-session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Server mein dikkat aa gayi" },
      { status: 500 }
    );
  }
}
