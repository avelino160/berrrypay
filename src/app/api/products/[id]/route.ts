import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await storage.getProduct(parseInt(id));
    if (!product) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 });
    }
    return NextResponse.json(product);
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
    const input = insertProductSchema.partial().parse(body);
    const product = await storage.updateProduct(parseInt(id), input);
    return NextResponse.json(product);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await storage.deleteProduct(parseInt(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
