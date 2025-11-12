import mongoose from "mongoose";
import { Schema } from "mongoose";

const adminAuthSchema = new Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true, trim: true },
});

export const AdminAuth =
  mongoose.models.AdminAuth || mongoose.model("AdminAuth", adminAuthSchema);
