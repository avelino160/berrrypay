-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  delivery_url TEXT,
  whatsapp_url TEXT,
  delivery_files JSONB DEFAULT '[]',
  no_email_delivery BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create checkouts table
CREATE TABLE IF NOT EXISTS checkouts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  public_url TEXT,
  views INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  config JSONB DEFAULT '{}'
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  paypal_client_id TEXT,
  paypal_client_secret TEXT,
  paypal_webhook_id TEXT,
  facebook_pixel_id TEXT,
  utmfy_token TEXT,
  environment TEXT DEFAULT 'sandbox'
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  checkout_id INTEGER,
  product_id INTEGER,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  customer_email TEXT,
  paypal_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings row if not exists
INSERT INTO settings (id, environment) 
VALUES (1, 'sandbox') 
ON CONFLICT (id) DO NOTHING;
