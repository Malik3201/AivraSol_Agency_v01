import mongoose from "mongoose";

const techStackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true }, 
  icon: { type: String, trim: true },
  level: { type: String, trim: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

export const TechStack = mongoose.models.TechStack || mongoose.model("TechStack", techStackSchema);
