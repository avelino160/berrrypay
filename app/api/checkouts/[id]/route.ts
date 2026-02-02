import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkouts } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [checkout] = await db
    .select()
    .from(checkouts)
    .where(and(eq(checkouts.id, parseInt(id)), eq(checkouts.userId, user.id)))
    .limit(1);

  if (!checkout) {
    return NextResponse.json({ message: "Checkout not found" }, { status: 404 });
  }

  return NextResponse.json(checkout);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const [checkout] = await db
    .update(checkouts)
    .set({
      ...body,
      totalAmount: body.totalAmount !== undefined ? String(body.totalAmount) : undefined,
      customAmount: body.customAmount !== undefined ? String(body.customAmount) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(checkouts.id, parseInt(id)), eq(checkouts.userId, user.id)))
    .returning();

  if (!checkout) {
    return NextResponse.json({ message: "Checkout not found" }, { status: 404 });
  }

  return NextResponse.json(checkout);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [deleted] = await db
    .delete(checkouts)
    .where(and(eq(checkouts.id, parseInt(id)), eq(checkouts.userId, user.id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ message: "Checkout not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Checkout deleted" });
}
