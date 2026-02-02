import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const stats = await storage.getDashboardStats(period, productId);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
