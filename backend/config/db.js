import pg from 'pg';
const { Pool, types } = pg;
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

// FIX: This bypasses the self-signed certificate error globally for this process
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;

// Parse numbers from Postgres numeric to JS float
types.setTypeParser(1700, function(val) {
  return parseFloat(val);
});

// Explicit SSL configuration for pg Pool
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    // Simple query to test connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log(' PostgreSQL Connected (Supabase via Pooler)');
  } catch (error) {
    console.error(` PostgreSQL Connection Error: ${error.message}`);
  }
};

export { prisma, connectDB };
export default connectDB;
