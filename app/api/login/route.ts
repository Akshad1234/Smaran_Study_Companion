import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory user storage (for demo; use DB in production)
const users: { name: string; email: string; password: string }[] = [];

// Secret key for JWT (store securely in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Handle POST requests (login)
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const emailClean = email.trim().toLowerCase();
    const passwordClean = password.trim();

    // Find user
    const user = users.find((u) => u.email === emailClean);

    if (!user) {
      // ❌ Redirect to login if user not found
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(passwordClean, user.password);
    if (!isPasswordValid) {
      // ❌ Redirect to login if password is wrong
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Redirect to /api if login successful
    const response = NextResponse.redirect(new URL("/api", req.url));

    // Save token in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1h
    });

    return response;
  } catch (error) {
    // ❌ On error → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
