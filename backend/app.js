import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import adminRouter from "./routes/admin.js";
import userRouter from "./routes/user.js";
import aivaRouter from "./routes/aiva.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Add localhost origins for development if no origins specified
const developmentOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const allAllowedOrigins = allowedOrigins.length > 0 
  ? allowedOrigins 
  : developmentOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/aiva', aivaRouter);

// ✅ connect once when server starts
connectDb();

app.get("/health", (req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || "n/a" })
);

app.get("/__diag", (req, res) => {
  res.json({
    envHasMongoUrl: Boolean(process.env.MONGODB_URL),
    mongooseState: mongoose.connection.readyState,
    now: new Date().toISOString(),
  });
});

app.use("/admin", adminRouter);
app.use("/", userRouter);

app.get("/", (req, res) => res.send("Server Started"));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
});

export default app;
