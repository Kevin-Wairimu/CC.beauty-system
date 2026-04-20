import pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Database connection will fail.");
}

const pool = new Pool({ 
  connectionString,
  ssl: connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) ? false : {
    rejectUnauthorized: false
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    // Simple query to test connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log(' PostgreSQL Connected');
  } catch (error) {
    console.error(` PostgreSQL Connection Error: ${error.message}`);
  }
};

export { prisma, connectDB };
export default connectDB;
