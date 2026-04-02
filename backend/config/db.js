import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoUri, {
      family: 4, // Forces IPv4 (Fixes many Windows/ISP issues)
      serverSelectionTimeoutMS: 5000, // Fails faster if connection is impossible
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);

    if (error.message.includes("IP that isn't whitelisted")) {
      console.log(
        " Double-check Atlas: Network Access > IP Whitelist (0.0.0.0/0)",
      );
    } else if (error.message.includes("Could not connect to any servers")) {
      console.log(
        " Network Block Detected: Your ISP or Firewall is likely blocking port 27017.",
      );
      console.log(
        " Recommended Fix: Try a VPN or a different network (like a Mobile Hotspot).",
      );
    }

    process.exit(1);
  }
};

export default connectDB;
