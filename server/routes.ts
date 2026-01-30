import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  registerObjectStorageRoutes(app);
  
  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(api.products.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(id, input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Checkouts

  app.post(api.checkouts.create.path, async (req, res) => {
    try {
      const input = api.checkouts.create.input.parse(req.body);
      const checkout = await storage.createCheckout(input);
      res.status(201).json(checkout);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    if (!settings) {
      // Return empty default settings if none exist
      return res.json({ environment: 'sandbox' });
    }
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Stats
  app.get(api.stats.get.path, async (req, res) => {
    const period = req.query.period as string;
    const stats = await storage.getDashboardStats(period);
    res.json(stats);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  const settings = await storage.getSettings();
  
  if (!settings) {
    // Seed basic settings
    await storage.updateSettings({
      environment: 'production',
      paypalClientId: '',
      paypalClientSecret: '',
    });

    console.log('Database seeded with default settings');
  }
}
