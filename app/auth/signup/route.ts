import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// In-memory user storage (for demo purposes)
const users: { name: string; email: string; password: string }[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Signup request body:", body);

    let { name, email, password } = body;

    // Trim inputs and standardize email
    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // Validate input
    if (!name || !email || !password) {
      console.log("Validation failed: missing fields");
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    users.push({
      name,
      email,
      password: hashedPassword,
    });

    console.log("User created successfully:", email);

    // Return success message
    return NextResponse.json(
      { message: "Signup successful. Please login." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
