import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory user storage (must match signup)
const users: { name: string; email: string; password: string }[] = [];

// Secret key for JWT (store in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

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

    // Return user info + token
    return NextResponse.json(
      {
        message: "Login successful",
        user: { name: user.name, email: user.email },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
