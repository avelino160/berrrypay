import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkouts, products } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userCheckouts = await db
    .select()
    .from(checkouts)
    .where(eq(checkouts.userId, user.id));

  return NextResponse.json(userCheckouts);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      productIds,
      customAmount,
      allowCustomAmount,
      collectEmail,
      collectPhone,
      collectAddress,
      successUrl,
      cancelUrl,
      isActive,
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Calculate total from products if productIds provided
    let totalAmount = customAmount ? String(customAmount) : "0";
    if (productIds && productIds.length > 0) {
      const selectedProducts = await db
        .select()
        .from(products)
        .where(
          and(
            inArray(products.id, productIds),
            eq(products.userId, user.id)
          )
        );
      
      totalAmount = selectedProducts
        .reduce((sum, p) => sum + parseFloat(p.price), 0)
        .toString();
    }

    const [checkout] = await db
      .insert(checkouts)
      .values({
        userId: user.id,
        name,
        description: description || null,
        slug: nanoid(10),
        productIds: productIds || [],
        totalAmount,
        customAmount: customAmount ? String(customAmount) : null,
        allowCustomAmount: allowCustomAmount ?? false,
        collectEmail: collectEmail ?? true,
        collectPhone: collectPhone ?? false,
        collectAddress: collectAddress ?? false,
        successUrl: successUrl || null,
        cancelUrl: cancelUrl || null,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(checkout, { status: 201 });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
