import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export const Faq = mongoose.models.Faq || mongoose.model("Faq",faqSchema)