import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { checkoutId, productId } = await request.json();
    const product = await storage.getProduct(productId);
    if (!product) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 });
    }

    const settings = await storage.getSettings();
    if (!settings?.paypalClientId || !settings?.paypalClientSecret) {
      return NextResponse.json({ message: "PayPal não configurado" }, { status: 500 });
    }

    const mockOrderId = `PAYPAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    await storage.createSale({
      checkoutId,
      productId,
      amount: product.price,
      status: "pending",
      paypalOrderId: mockOrderId
    } as any);

    return NextResponse.json({ id: mockOrderId });
  } catch (error) {
    console.error("PayPal Create Order Error:", error);
    return NextResponse.json({ message: "Erro ao criar pedido PayPal" }, { status: 500 });
  }
}
