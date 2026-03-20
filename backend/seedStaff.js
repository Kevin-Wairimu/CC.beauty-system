import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const seedStaff = async () => {
  try {
    const staffData = [
      {
        name: 'Steve',
        email: 'steve@ccbeauty.com',
        password: 'password123',
        role: 'staff',
        specialization: ['NAILS']
      },
      {
        name: 'Martha',
        email: 'martha@ccbeauty.com',
        password: 'password123',
        role: 'staff',
        specialization: ['MAKEUP']
      },
      {
        name: 'Sam',
        email: 'sam@ccbeauty.com',
        password: 'password123',
        role: 'staff',
        specialization: ['MAKEUP', 'LASHES', 'NAILS']
      },
      {
        name: 'Wangari',
        email: 'wangari@ccbeauty.com',
        password: 'password123',
        role: 'staff',
        specialization: ['HAIR', 'RECEPTIONIST']
      },
      {
        name: 'Milka',
        email: 'milka@ccbeauty.com',
        password: 'password123',
        role: 'staff',
        specialization: ['HAIR']
      },
      {
        name: 'Ceisey',
        email: 'ceisey@ccbeauty.com',
        password: 'password123',
        role: 'staff',
        specialization: ['WIGS', 'NAILS']
      }
    ];

    for (const s of staffData) {
      const exists = await User.findOne({ email: s.email });
      if (!exists) {
        await User.create(s);
        console.log(`Created staff: ${s.name}`);
      } else {
        exists.specialization = s.specialization;
        exists.role = 'staff';
        await exists.save();
        console.log(`Updated staff: ${s.name}`);
      }
    }

    console.log('--- STAFF COLLECTION SYNCED ---');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedStaff();
