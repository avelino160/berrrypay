import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const checkout = await storage.getCheckoutBySlug(slug);
    if (!checkout) {
      return NextResponse.json({ message: "Checkout não encontrado" }, { status: 404 });
    }
    
    const product = await storage.getProduct(checkout.productId);
    if (!product) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 });
    }

    await storage.incrementCheckoutViews(checkout.id);
    
    return NextResponse.json({ checkout, product });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
