import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents (USD)
  imageUrl: text("image_url"),
  deliveryUrl: text("delivery_url"),
  whatsappUrl: text("whatsapp_url"),
  deliveryFiles: jsonb("delivery_files").$type<string[]>().default([]),
  noEmailDelivery: boolean("no_email_delivery").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const checkouts = pgTable("checkouts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  publicUrl: text("public_url"),
  views: integer("views").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  config: jsonb("config").$type<CheckoutConfig>().default({
    timerMinutes: 10,
    timerText: "Oferta Especial por Tempo Limitado!",
    heroTitle: "Promoção por tempo limitado",
    heroBadgeText: "7 DIAS",
    heroImageUrl: "",
    benefitsList: [
      { icon: "zap", title: "ACESSO IMEDIATO", subtitle: "Seu produto disponível em instantes" },
      { icon: "shield", title: "PAGAMENTO SEGURO", subtitle: "Dados protegidos e criptografados" }
    ],
    privacyText: "Your information is 100% secure",
    safeText: "Safe purchase",
    deliveryText: "Delivery via E-mail",
    approvedText: "Approved content",
    testimonial: {
      name: "Marisa Correia",
      imageUrl: "",
      rating: 5,
      text: "\"Acreditem em mim, essa é a melhor compra que vocês vão fazer esse ano. Não percam a chance!\""
    },
    upsellProducts: [] as number[],
    payButtonText: "Buy now",
    footerText: "BerryPay © 2026. All rights reserved.",
    primaryColor: "#22a559",
    showChangeCountry: true,
    showTimer: false,
  }),
});

export type CheckoutConfig = {
  timerMinutes: number;
  timerText: string;
  heroTitle: string;
  heroBadgeText: string;
  heroImageUrl: string;
  benefitsList: { icon: string; title: string; subtitle: string }[];
  privacyText: string;
  safeText: string;
  deliveryText: string;
  approvedText: string;
  testimonial: {
    name: string;
    imageUrl: string;
    rating: number;
    text: string;
  };
  upsellProducts: number[];
  payButtonText: string;
  footerText: string;
  primaryColor: string;
  showChangeCountry: boolean;
  showTimer: boolean;
};

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  paypalClientId: text("paypal_client_id"),
  paypalClientSecret: text("paypal_client_secret"),
  paypalWebhookId: text("paypal_webhook_id"),
  facebookPixelId: text("facebook_pixel_id"),
  utmfyToken: text("utmfy_token"),
  environment: text("environment").default("sandbox"), // sandbox or production
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  checkoutId: integer("checkout_id"),
  productId: integer("product_id"),
  amount: integer("amount").notNull(),
  status: text("status").notNull(), // pending, paid, failed, captured
  customerEmail: text("customer_email"),
  paypalOrderId: text("paypal_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCheckoutSchema = createInsertSchema(checkouts).omit({ id: true, createdAt: true, views: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Checkout = typeof checkouts.$inferSelect;
export type InsertCheckout = z.infer<typeof insertCheckoutSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

// Request Types
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;

export type CreateCheckoutRequest = InsertCheckout;
export type UpdateCheckoutRequest = Partial<InsertCheckout>;

export type UpdateSettingsRequest = Partial<InsertSettings>;

// Dashboard Stats Type
export type DashboardStats = {
  salesToday: number;
  revenuePaid: number;
  salesApproved: number;
  revenueTarget: number; // For the progress bar
  revenueCurrent: number;
  chartData: { name: string; sales: number }[];
};
