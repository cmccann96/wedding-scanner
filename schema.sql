-- Run this once against your Railway PostgreSQL database
CREATE TABLE IF NOT EXISTS saved_items (
  id SERIAL PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  product JSONB NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);
