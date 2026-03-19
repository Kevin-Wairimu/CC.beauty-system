import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const purgeUsers = async () => {
  try {
    // List of emails to KEEP (Your actual accounts)
    const keepEmails = ['admin@ccbeauty.com', 'kevinwairimu300@gmail.com'];
    
    console.log('Purging test credentials...');
    
    // Delete everyone NOT in the keep list
    const result = await User.deleteMany({ email: { $nin: keepEmails } });
    
    console.log(`Successfully removed ${result.deletedCount} test users.`);
    
    // Ensure admin@ccbeauty.com is definitely an ADMIN
    const admin = await User.findOne({ email: 'admin@ccbeauty.com' });
    if (admin) {
      admin.role = 'admin';
      await admin.save();
      console.log('Verified admin@ccbeauty.com as System Director.');
    } else {
      // Create it if it somehow doesn't exist
      await User.create({
        name: 'Studio Director',
        email: 'admin@ccbeauty.com',
        password: 'password123', // You should change this after login
        role: 'admin'
      });
      console.log('Created fresh Admin account: admin@ccbeauty.com');
    }

    console.log('--- DATABASE CLEANUP COMPLETE ---');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

purgeUsers();
