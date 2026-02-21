import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const poolConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { host: env.DB_HOST, port: env.DB_PORT, database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD };

export const pool = new Pool({ ...poolConfig, max: 20, idleTimeoutMillis: 30000 });

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
