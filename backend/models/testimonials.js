import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  designation: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  image: { type: String, trim: true },
  rating: { type: Number, default: 5 },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

export const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
