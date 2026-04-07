import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoUri, {
      family: 4, // Forces IPv4 — critical for some local Windows/ISP environments
      serverSelectionTimeoutMS: 30000, // Increase initial timeout to 30 seconds
      connectTimeoutMS: 30000, // Timeout for the driver to establish a TCP connection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);

    if (error.message.includes("IP that isn't whitelisted")) {
      console.log(
        "Suggestion: Check MongoDB Atlas > Network Access. Ensure 0.0.0.0/0 is added.",
      );
    } else if (
      error.message.includes("bad auth") ||
      error.message.includes("Authentication failed")
    ) {
      console.log(
        "Suggestion: Check your password. If it contains special characters like '!', '@', or '#', they MUST be URL-encoded (e.g., '!' becomes '%21').",
      );
    }

    process.exit(1);
  }
};

export default connectDB;
