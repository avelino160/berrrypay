import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkouts, products, settings, sales } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [checkout] = await db
    .select()
    .from(checkouts)
    .where(and(eq(checkouts.slug, slug), eq(checkouts.isActive, true)))
    .limit(1);

  if (!checkout) {
    return NextResponse.json({ message: "Checkout not found" }, { status: 404 });
  }

  // Get products if any
  let checkoutProducts: typeof products.$inferSelect[] = [];
  if (checkout.productIds && checkout.productIds.length > 0) {
    checkoutProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, checkout.productIds));
  }

  // Get seller settings
  const [sellerSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, checkout.userId))
    .limit(1);

  return NextResponse.json({
    checkout,
    products: checkoutProducts,
    settings: sellerSettings ? {
      businessName: sellerSettings.businessName,
      logoUrl: sellerSettings.logoUrl,
      primaryColor: sellerSettings.primaryColor,
      pixKey: sellerSettings.pixKey,
      pixKeyType: sellerSettings.pixKeyType,
    } : null,
  });
}

// Process payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();

  const [checkout] = await db
    .select()
    .from(checkouts)
    .where(and(eq(checkouts.slug, slug), eq(checkouts.isActive, true)))
    .limit(1);

  if (!checkout) {
    return NextResponse.json({ message: "Checkout not found" }, { status: 404 });
  }

  const {
    customerEmail,
    customerName,
    customerPhone,
    amount,
  } = body;

  // Create sale record
  const [sale] = await db
    .insert(sales)
    .values({
      userId: checkout.userId,
      checkoutId: checkout.id,
      amount: String(amount || checkout.totalAmount),
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      paymentMethod: "pix",
      status: "pending",
      metadata: {},
    })
    .returning();

  // Get seller PIX settings
  const [sellerSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, checkout.userId))
    .limit(1);

  return NextResponse.json({
    sale,
    pixKey: sellerSettings?.pixKey,
    pixKeyType: sellerSettings?.pixKeyType,
  });
}
