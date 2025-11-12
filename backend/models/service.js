import mongoose from "mongoose";
const { Schema } = mongoose;

const serviceSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  description: { type: String, required: true, trim: true },
  icon: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  featured: { type: Boolean, default: false, required: true },
});

export const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
