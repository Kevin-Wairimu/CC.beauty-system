import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';

dotenv.config();

const checkServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
