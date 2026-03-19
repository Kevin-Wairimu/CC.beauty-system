import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // Ensure the URI targets cc_beauty if not already specified
    let finalUri = mongoUri;
    if (finalUri && !finalUri.includes("/cc_beauty")) {
      // Logic to insert cc_beauty before the query parameters
      if (finalUri.includes("?")) {
        finalUri = finalUri.replace("?", "cc_beauty?");
      } else if (!finalUri.endsWith("/")) {
        finalUri = finalUri + "/cc_beauty";
      } else {
        finalUri = finalUri + "cc_beauty";
      }
    }

    const conn = await mongoose.connect(
      finalUri || "mongodb://localhost:27017/cc_beauty",
    );

    console.log(
      ` CC Beauty System connected to Database: ${conn.connection.name}`,
    );
    console.log(` Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
