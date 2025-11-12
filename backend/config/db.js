import mongoose from "mongoose";
import { AdminAuth } from "../models/adminAuth.js";

// ✅ Global cache for Vercel or serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// ✅ Helper to safely get environment variables
const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

// ✅ Function to ensure a default admin exists
let defaultAdminPromise = null;

async function ensureDefaultAdmin() {
  try {
    const email = "admin@aivrasol.com";
    const password = "admin123"; // ✅ default password

    const existingAdmin = await AdminAuth.findOne({ email });

    if (!existingAdmin) {
      await AdminAuth.create({ email, password });
      console.log("✅ Default admin created:", email);
    } else {
      console.log("ℹ️ Default admin already exists:", email);
    }
  } catch (err) {
    console.error("❌ Error creating default admin:", err.message);
  }
}

// ✅ MongoDB connection function (with caching)
export const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUrl = requiredEnv("MONGODB_URL");
    const dbName = process.env.MONGODB_DB;

    cached.promise = mongoose
      .connect(mongoUrl, {
        dbName: dbName || undefined,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // avoid infinite hang
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully");
        return mongooseInstance.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;

  // 🧠 Run default admin creation once
  if (!defaultAdminPromise) {
    defaultAdminPromise = ensureDefaultAdmin();
  }
  await defaultAdminPromise;

  return cached.conn;
};
