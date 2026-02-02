import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const sale = await storage.getSaleByPaypalOrderId(orderId);
    if (sale) {
      await storage.updateSaleStatus(sale.id, "paid");
    }
    return NextResponse.json({ status: "COMPLETED" });
  } catch (error) {
    console.error("PayPal Capture Order Error:", error);
    return NextResponse.json({ message: "Erro ao capturar pedido PayPal" }, { status: 500 });
  }
}
