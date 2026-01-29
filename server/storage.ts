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

    return {
      salesToday: Number(periodSalesResult?.total || 0),
      revenuePaid: Number(periodSalesResult?.total || 0),
      salesApproved: Number(periodSalesResult?.count || 0),
      revenueTarget: 1000000,
      revenueCurrent: Number(periodSalesResult?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();
