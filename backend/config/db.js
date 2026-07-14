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

// NOTE: Make sure DATABASE_URL includes `?pgbouncer=true&sslmode=require&connect_timeout=30`
// when connecting through Supabase's pooler (port 6543). The longer connect_timeout
// gives Supabase time to wake a paused/idle project before Prisma gives up.
//
// ssl: { rejectUnauthorized: false } (not just `true`) — Supabase's pooler
// presents a certificate chain that Node's default TLS verification doesn't
// trust, which surfaces as "self-signed certificate in certificate chain".
// This disables strict chain verification while keeping the connection
// encrypted, which is the standard approach for Supabase/PgBouncer poolers.
const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  // Supabase free-tier projects can go idle and take a few seconds to wake up.
  // These give the pool more breathing room instead of failing fast.
  connectionTimeoutMillis: 30000, // 30s to establish a connection
  idleTimeoutMillis: 30000,       // close idle clients after 30s
  max: 10,                        // cap pool size (pgbouncer transaction mode prefers small pools)
});

pool.on('error', (err) => {
  // Prevents an idle client error from crashing the whole process
  console.error('Unexpected PostgreSQL pool error:', err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Attempts a lightweight connectivity check with retries.
 * Handles the common Supabase free-tier "cold start" case where the
 * first connection attempt times out (ETIMEDOUT) while the project wakes up.
 */
const connectDB = async (retries = 3, delayMs = 2000) => {
  if (!connectionString) {
    console.error('PostgreSQL Connection Error: DATABASE_URL environment variable is not defined.');
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`PostgreSQL Connected${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);
      return;
    } catch (error) {
      const isTimeout = error?.code === 'ETIMEDOUT' || /timeout/i.test(error?.message ?? '');
      const isLastAttempt = attempt === retries;

      if (isTimeout && !isLastAttempt) {
        console.warn(
          `PostgreSQL connection attempt ${attempt}/${retries} timed out (likely Supabase waking up). Retrying in ${delayMs}ms...`
        );
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      // Log the full error, not just .message, so the real cause is visible
      console.error('PostgreSQL Connection Error:', error);
      if (error.message?.includes('relation "Service" does not exist')) {
        console.error('HINT: Tables are missing. Run "npx prisma db push" or seed the database.');
      }
      if (error.message?.includes('self-signed certificate')) {
        console.error('HINT: TLS chain verification issue. Ensure ssl is set to { rejectUnauthorized: false } for pooled Supabase connections.');
      }
      if (isTimeout) {
        console.error('HINT: Connection timed out after retries. Check if your Supabase project is paused, or increase connect_timeout in DATABASE_URL.');
      }
      return;
    }
  }
};

export { prisma, connectDB };
export default connectDB;