import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(import.meta.dirname, '../../../.env') });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME || 'cs360',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT || '3001'),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
