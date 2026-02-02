import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export async function GET() {
  try {
    const products = await storage.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = insertProductSchema.parse(body);
    const product = await storage.createProduct(input);
    return NextResponse.json(product, { status: 201 });
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
