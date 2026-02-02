import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ message: "Username já existe." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      username,
      password: hashedPassword,
    });

    const cookieStore = await cookies();
    cookieStore.set('userId', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
