import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sales, checkouts } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userSales = await db
    .select({
      sale: sales,
      checkout: checkouts,
    })
    .from(sales)
    .leftJoin(checkouts, eq(sales.checkoutId, checkouts.id))
    .where(eq(sales.userId, user.id))
    .orderBy(desc(sales.createdAt));

  return NextResponse.json(userSales.map(({ sale, checkout }) => ({
    ...sale,
    checkout,
  })));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      checkoutId,
      amount,
      customerEmail,
      customerName,
      customerPhone,
      paymentMethod,
      status,
      metadata,
    } = body;

    const [sale] = await db
      .insert(sales)
      .values({
        userId: user.id,
        checkoutId: checkoutId || null,
        amount: String(amount),
        customerEmail: customerEmail || null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        paymentMethod: paymentMethod || "pix",
        status: status || "pending",
        metadata: metadata || {},
      })
      .returning();

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
