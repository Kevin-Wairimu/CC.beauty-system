import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cc_beauty', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('💡 HINT: If you see ETIMEDOUT, your current IP address might not be whitelisted in MongoDB Atlas.');
    console.log('Please go to MongoDB Atlas -> Network Access -> Add IP Address (Allow Access From Anywhere or Add Current IP Address).');
    process.exit(1);
  }
};

export default connectDB;
