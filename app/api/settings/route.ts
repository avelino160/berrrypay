import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [userSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, user.id))
    .limit(1);

  if (!userSettings) {
    // Create default settings
    const [newSettings] = await db
      .insert(settings)
      .values({
        userId: user.id,
        pixKey: null,
        pixKeyType: null,
        businessName: null,
        logoUrl: null,
        primaryColor: "#8B5CF6",
        webhookUrl: null,
      })
      .returning();
    return NextResponse.json(newSettings);
  }

  return NextResponse.json(userSettings);
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const [existingSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, user.id))
    .limit(1);

  if (!existingSettings) {
    const [newSettings] = await db
      .insert(settings)
      .values({
        userId: user.id,
        ...body,
      })
      .returning();
    return NextResponse.json(newSettings);
  }

  const [updatedSettings] = await db
    .update(settings)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(settings.userId, user.id))
    .returning();

  return NextResponse.json(updatedSettings);
}
