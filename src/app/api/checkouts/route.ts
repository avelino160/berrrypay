import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertCheckoutSchema } from "@shared/schema";
import { z } from "zod";
import { headers } from "next/headers";

export async function GET() {
  try {
    const checkouts = await storage.getCheckouts();
    return NextResponse.json(checkouts);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = insertCheckoutSchema.parse(body);
    
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:5000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const publicUrl = `${baseUrl}/checkout/${input.slug}`;
    
    const checkout = await storage.createCheckout({
      ...input,
      publicUrl
    });
    return NextResponse.json(checkout, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({
        message: err.errors[0].message,
        field: err.errors[0].path.join('.'),
      }, { status: 400 });
    }
    console.error("Create checkout error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
