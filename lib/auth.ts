import { cookies } from "next/headers"
import { db } from "./db"
import { users } from "./schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

const SESSION_COOKIE_NAME = "berrypay_session"

export async function createSession(userId: number) {
  const sessionToken = Buffer.from(`${userId}-${Date.now()}-${Math.random()}`).toString("base64")
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE_NAME, `${userId}:${sessionToken}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })
  
  return sessionToken
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  const [userId] = sessionCookie.value.split(":")
  const id = parseInt(userId)
  
  if (isNaN(id)) {
    return null
  }
  
  const [user] = await db.select().from(users).where(eq(users.id, id))
  return user || null
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}
