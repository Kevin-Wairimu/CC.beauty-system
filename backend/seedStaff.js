import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const seedStaff = async () => {
  try {
    await connectDB();
    const staffData = [
      {
        name: "Steve",
        email: "steve@ccbeauty.com",
        password: "password123",
        role: "staff",
        specialization: ["NAILS"],
      },
      {
        name: "Martha",
        email: "martha@ccbeauty.com",
        password: "password123",
        role: "staff",
        specialization: ["MAKEUP"],
      },
      {
        name: "Sam",
        email: "sam@ccbeauty.com",
        password: "password123",
        role: "staff",
        specialization: ["MAKEUP", "LASHES", "NAILS"],
      },
      {
        name: "Wangari",
        email: "wangari@ccbeauty.com",
        password: "password123",
        role: "staff",
        specialization: ["HAIR", "EYEBROWS"],
      },
      {
        name: "Milka",
        email: "milka@ccbeauty.com",
        password: "password123",
        role: "staff",
        specialization: ["HAIR", "FACIAL"],
      },
      {
        name: "Ceisey",
        email: "ceisey@ccbeauty.com",
        password: "password123",
        role: "admin",
        specialization: ["WIGS", "NAILS"],
      },
    ];

    for (const s of staffData) {
      // Find by name OR email to be safer during updates
      let user = await User.findOne({
        $or: [{ email: s.email }, { name: s.name, role: "staff" }],
      });

      if (!user) {
        await User.create(s);
        console.log(`Created staff: ${s.name}`);
      } else {
        user.specialization = s.specialization;
        user.role = "staff";
        // Keep existing email if they matched by name
        await user.save();
        console.log(`Updated staff: ${user.name} (${user.email})`);
      }
    }

    console.log("--- STAFF COLLECTION SYNCED ---");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedStaff();
