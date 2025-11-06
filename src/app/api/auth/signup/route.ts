import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please set it in your .env.local file."
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token (auto-login after signup)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = newUser;

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Signup successful. You are now logged in.",
        user: userWithoutPassword,
      },
      { status: 201 }
    );

    // Set JWT as httpOnly cookie (same as login)
    response.cookies.set("token", token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 1 week (matches JWT expiry)
      path: "/", // Cookie available for all routes
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Signup failed" },
      { status: 500 }
    );
  }
}
