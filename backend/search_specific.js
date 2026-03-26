import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const searchUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- GLOBAL USER SEARCH ---');
    const users = await User.find({
      $or: [
        { name: { $regex: /kevin/i } },
        { name: { $regex: /ceisey/i } },
        { email: { $regex: /kevin/i } },
        { email: { $regex: /ceisey/i } }
      ]
    });
    console.log(`Found: ${users.length}`);
    
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Name: "${u.name}", Email: "${u.email}", Role: "${u.role}"`);
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

searchUsers();
