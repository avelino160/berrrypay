import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, user.id));

  return NextResponse.json(userProducts);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, imageUrl, stock, isActive } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { message: "Name and price are required" },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        userId: user.id,
        name,
        description: description || null,
        price: String(price),
        imageUrl: imageUrl || null,
        stock: stock ?? null,
        isActive: isActive ?? true,
        slug: nanoid(10),
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
