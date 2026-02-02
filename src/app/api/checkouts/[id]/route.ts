import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertCheckoutSchema } from "@shared/schema";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkout = await storage.getCheckout(parseInt(id));
    if (!checkout) {
      return NextResponse.json({ message: "Checkout não encontrado" }, { status: 404 });
    }
    return NextResponse.json(checkout);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = insertCheckoutSchema.partial().parse(body);
    const checkout = await storage.updateCheckout(parseInt(id), input);
    return NextResponse.json(checkout);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({
        message: err.errors[0].message,
        field: err.errors[0].path.join('.'),
      }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
