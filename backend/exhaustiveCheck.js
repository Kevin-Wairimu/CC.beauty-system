import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();
connectDB();

const exhaustiveCheck = async () => {
  try {
    console.log("--- EXHAUSTIVE USER LIST ---");
    const users = await User.find({}).sort({ name: 1 });
    console.log(`Total users in DB: ${users.length}`);

    users.forEach((u) => {
      console.log(
        `- ID: ${u._id}, Name: "${u.name}", Email: "${u.email}", Role: "${u.role}", Specs: [${u.specialization.join(", ")}]`,
      );
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

exhaustiveCheck();
