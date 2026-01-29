import { db } from "./db";
import {
  products, checkouts, settings, sales,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Checkout, type InsertCheckout, type UpdateCheckoutRequest,
  type Settings, type InsertSettings, type UpdateSettingsRequest,
  type DashboardStats
} from "@shared/schema";
import { eq, sql, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Checkouts
  getCheckouts(): Promise<Checkout[]>;
  getCheckout(id: number): Promise<Checkout | undefined>;
  createCheckout(checkout: InsertCheckout): Promise<Checkout>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.createdAt);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Checkouts
  async getCheckouts(): Promise<Checkout[]> {
    return await db.select().from(checkouts).orderBy(checkouts.createdAt);
  }

  async getCheckout(id: number): Promise<Checkout | undefined> {
    const [checkout] = await db.select().from(checkouts).where(eq(checkouts.id, id));
    return checkout;
  }

  async createCheckout(checkout: InsertCheckout): Promise<Checkout> {
    const [newCheckout] = await db.insert(checkouts).values(checkout).returning();
    return newCheckout;
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    
    if (existing) {
      const [updated] = await db.update(settings)
        .set(updates)
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create default if not exists
      const [created] = await db.insert(settings).values(updates as InsertSettings).returning();
      return created;
    }
  }

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    // Mock stats based on the screenshot placeholders for now, 
    // but implemented with real query logic structure for future.
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sales Today
    const [salesTodayResult] = await db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`sum(${sales.amount})`
    })
    .from(sales)
    .where(and(
      eq(sales.status, 'paid'),
      gte(sales.createdAt, today)
    ));

    // Total Revenue
    const [revenueResult] = await db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`sum(${sales.amount})`
    })
    .from(sales)
    .where(eq(sales.status, 'paid'));

    return {
      salesToday: Number(salesTodayResult?.total || 0),
      revenuePaid: Number(revenueResult?.total || 0),
      salesApproved: Number(revenueResult?.count || 0),
      revenueTarget: 1000000, // 10k in cents
      revenueCurrent: Number(revenueResult?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();
