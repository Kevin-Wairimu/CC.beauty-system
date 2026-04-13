import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Service from './models/Service.js';

dotenv.config();
connectDB();

const checkServices = async () => {
  try {
    const services = await Service.find({});
    const categories = [...new Set(services.map(s => s.category.toUpperCase()))];
    console.log('--- Service Categories ---');
    console.log(categories);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkServices();
