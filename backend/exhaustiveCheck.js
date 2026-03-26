import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const exhaustiveCheck = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- EXHAUSTIVE USER LIST ---');
    const users = await User.find({}).sort({ name: 1 });
    console.log(`Total users in DB: ${users.length}`);
    
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Name: "${u.name}", Email: "${u.email}", Role: "${u.role}", Specs: [${u.specialization.join(', ')}]`);
    });

    // We will look for "kevin", "Martha" duplicates, and "Ceisey wairimu"
    // Then we can delete them by ID.

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

exhaustiveCheck();
