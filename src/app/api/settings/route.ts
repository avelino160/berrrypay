import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function GET() {
  try {
    const settings = await storage.getSettings();
    if (!settings) {
      return NextResponse.json({ environment: 'sandbox' });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = insertSettingsSchema.partial().parse(body);
    const settings = await storage.updateSettings(input);
    return NextResponse.json(settings);
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
