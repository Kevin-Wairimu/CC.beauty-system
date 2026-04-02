import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const promoteCeisey = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find Ceisey and update role to admin
    const user = await User.findOneAndUpdate(
      { name: 'Ceisey' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(` Success! ${user.name} is now an ADMIN.`);
      console.log(`Role: ${user.role}`);
      console.log(`Specs (kept): [${user.specialization.join(', ')}]`);
    } else {
      console.log(' Ceisey not found in database.');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

promoteCeisey();
