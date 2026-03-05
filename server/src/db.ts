import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('DB connection mode:', connectionString ? 'DATABASE_URL' : 'individual vars');

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    })
  : new Pool({
      host: process.env.PGHOST ?? process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.PGPORT ?? process.env.DB_PORT ?? 5432),
      database: process.env.PGDATABASE ?? process.env.DB_NAME ?? 'wedding_scanner',
      user: process.env.PGUSER ?? process.env.DB_USER ?? 'postgres',
      password: process.env.PGPASSWORD ?? process.env.DB_PASSWORD ?? 'postgres',
      connectionTimeoutMillis: 5000,
    });
