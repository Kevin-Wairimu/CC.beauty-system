import pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is missing. Database connection will fail if not using a driver adapter correctly or if the URL is required by the adapter.");
}

const isLocal = connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));

// NOTE: Make sure DATABASE_URL includes `?pgbouncer=true&sslmode=require`
// when connecting through Supabase's pooler (port 6543). With sslmode=require
// set properly in the connection string, we no longer need to disable
// certificate verification.
const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : true,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  if (!connectionString) {
    console.error('PostgreSQL Connection Error: DATABASE_URL environment variable is not defined.');
    return;
  }

  try {
    // Simple query to test connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log('PostgreSQL Connected');
  } catch (error) {
    // Log the full error, not just .message, so the real cause is visible
    console.error('PostgreSQL Connection Error:', error);
    if (error.message?.includes('relation "Service" does not exist')) {
      console.error('HINT: Tables are missing. Run "npx prisma db push" or seed the database.');
    }
  }
};

export { prisma, connectDB };
export default connectDB;