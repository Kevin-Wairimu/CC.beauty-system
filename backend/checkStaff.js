import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- Checking ALL Users (Search for Kevin/Duplicates) ---');
    const users = await User.find({});
    console.log(`Total found: ${users.length}`);
    
    users.forEach(u => {
      const lowerName = u.name.toLowerCase();
      if (lowerName.includes('kevin') || lowerName.includes('ceisey') || lowerName.includes('martha')) {
          console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Specs: [${u.specialization.join(', ')}]`);
      }
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkStaff();
