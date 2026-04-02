import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const uri = process.env.MONGO_URI;

console.log('--- Testing MongoDB Connection ---');
console.log('URI:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined');

async function testConnection() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Success! Connected to MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
