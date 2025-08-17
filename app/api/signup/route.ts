import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// In-memory user storage (for demo purposes)
const users: { name: string; email: string; password: string }[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { name, email, password } = body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "Signup successful. Please login." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ✅ Add this GET handler below your POST function
export async function GET() {
  return NextResponse.json({ message: "Signup API: use POST to register." });
}
