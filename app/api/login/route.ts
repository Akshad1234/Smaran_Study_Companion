import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory user storage (for demo; use DB in production)
const users: { name: string; email: string; password: string }[] = [];

// Secret key for JWT (store securely in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Handle GET requests (browser test)
export async function GET() {
  return NextResponse.json({
    message: "Login API is working. Use POST with { email, password } to log in.",
  });
}

// ✅ Handle POST requests (actual login)
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const passwordClean = password.trim();

    // Find user in memory
    const user = users.find((u) => u.email === emailClean);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(passwordClean, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Redirect to dashboard (or login success page)
    const response = NextResponse.redirect(new URL("/api", req.url));

    // Optionally set token in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
