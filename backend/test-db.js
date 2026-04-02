import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
  const mongoUri = process.env.MONGO_URI;
  console.log('Testing MONGO_URI from .env (masked):', mongoUri ? mongoUri.replace(/:([^@]+)@/, ':****@') : 'undefined');

  if (!mongoUri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 10000,
      family: 4 // Use IPv4
    });
    console.log(`✅ Connection successful to: ${conn.connection.name}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  }
};

testConnection();
