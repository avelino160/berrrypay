import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sales, products, checkouts } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, and, gte } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Get total revenue
  const [revenueResult] = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${sales.amount} AS DECIMAL)), 0)`,
    })
    .from(sales)
    .where(and(eq(sales.userId, user.id), eq(sales.status, "completed")));

  // Get total sales count
  const [salesCount] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(sales)
    .where(eq(sales.userId, user.id));

  // Get products count
  const [productsCount] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(products)
    .where(eq(products.userId, user.id));

  // Get checkouts count
  const [checkoutsCount] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(checkouts)
    .where(eq(checkouts.userId, user.id));

  // Get recent sales (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSales = await db
    .select()
    .from(sales)
    .where(
      and(
        eq(sales.userId, user.id),
        gte(sales.createdAt, thirtyDaysAgo)
      )
    )
    .orderBy(sql`${sales.createdAt} DESC`)
    .limit(10);

  return NextResponse.json({
    totalRevenue: parseFloat(revenueResult?.total || "0"),
    totalSales: Number(salesCount?.count || 0),
    totalProducts: Number(productsCount?.count || 0),
    totalCheckouts: Number(checkoutsCount?.count || 0),
    recentSales,
  });
}
