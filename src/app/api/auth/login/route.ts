import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const user = await storage.getUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Username ou senha incorretos." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('userId', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
