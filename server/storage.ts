import { db } from "./db";
import {
  users, products, checkouts, settings, sales,
  type User, type InsertUser,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Checkout, type InsertCheckout, type UpdateCheckoutRequest,
  type Settings, type InsertSettings, type UpdateSettingsRequest,
  type DashboardStats
} from "@shared/schema";
import { eq, sql, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

  // Adicionando assinaturas para os métodos extras usados dinamicamente
  getCheckoutBySlug(slug: string): Promise<Checkout | undefined>;
  incrementCheckoutViews(id: number): Promise<void>;

  // Stats
  getDashboardStats(period?: string): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.createdAt);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product as any).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product> {
    const [updated] = await db.update(products).set(updates as any).where(eq(products.id, id)).returning();
    if (!updated) throw new Error("Produto não encontrado");
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

  async getCheckoutBySlug(slug: string): Promise<Checkout | undefined> {
    const [checkout] = await db.select().from(checkouts).where(eq(checkouts.slug, slug));
    return checkout;
  }

  async incrementCheckoutViews(id: number): Promise<void> {
    await db.update(checkouts)
      .set({ views: sql`${checkouts.views} + 1` })
      .where(eq(checkouts.id, id));
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
      const [created] = await db.insert(settings).values({
        ...updates,
        environment: "production"
      } as InsertSettings).returning();
      return created;
    }
  }

  // Stats
  async getDashboardStats(period?: string): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date = new Date();

    if (period === "0") { // Hoje
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === "1") { // Ontem
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(today);
      endDate.setDate(today.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === "7") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (period === "90") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 90);
    } else { // Default 30 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
    }

    // Sales for the period
    const [periodSalesResult] = await db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`sum(${sales.amount})`
    })
    .from(sales)
    .where(and(
      eq(sales.status, 'paid'),
      gte(sales.createdAt, startDate),
      lt(sales.createdAt, new Date(endDate.getTime() + 1))
    ));

    // Get chart data
    let chartData: { name: string; sales: number }[] = [];
    
    if (period === "0" || period === "1") {
      // Hourly breakdown
      const hourlyResults = await db.select({
        hour: sql<number>`EXTRACT(HOUR FROM ${sales.createdAt})`,
        total: sql<number>`sum(${sales.amount})`
      })
      .from(sales)
      .where(and(
        eq(sales.status, 'paid'),
        gte(sales.createdAt, startDate),
        lt(sales.createdAt, new Date(endDate.getTime() + 1))
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${sales.createdAt})`);

      for (let i = 0; i < 24; i++) {
        const found = hourlyResults.find(h => Number(h.hour) === i);
        chartData.push({
          name: `${i.toString().padStart(2, '0')}:00`,
          sales: Number(found?.total || 0) / 100 // Convert cents to real
        });
      }
      // Add 23:59
      const lastHour = hourlyResults.find(h => Number(h.hour) === 23);
      chartData.push({ name: "23:59", sales: Number(lastHour?.total || 0) / 100 });
    } else {
      // Daily breakdown
      const dailyResults = await db.select({
        day: sql<string>`TO_CHAR(${sales.createdAt}, 'DD/MM')`,
        total: sql<number>`sum(${sales.amount})`
      })
      .from(sales)
      .where(and(
        eq(sales.status, 'paid'),
        gte(sales.createdAt, startDate),
        lt(sales.createdAt, new Date(endDate.getTime() + 1))
      ))
      .groupBy(sql`TO_CHAR(${sales.createdAt}, 'DD/MM')`);

      const days = period === "7" ? 7 : (period === "90" ? 90 : 30);
      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(new Date().getDate() - i);
        const dayStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const found = dailyResults.find(r => r.day === dayStr);
        chartData.push({
          name: dayStr,
          sales: Number(found?.total || 0) / 100
        });
      }
    }

    return {
      salesToday: Number(periodSalesResult?.total || 0) / 100,
      revenuePaid: Number(periodSalesResult?.total || 0) / 100,
      salesApproved: Number(periodSalesResult?.count || 0),
      revenueTarget: 10000, // 10k in real
      revenueCurrent: Number(periodSalesResult?.total || 0) / 100,
      chartData
    };
  }
}

export const storage = new DatabaseStorage();
