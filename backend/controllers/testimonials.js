import { Testimonial } from "../models/testimonials.js";

export async function getTestimonials(req, res) {
  const getAll = await Testimonial.find();
  if (getAll.length === 0) return res.json({ success: true, message: "no testimonials added yet" });
  res.json({ success: true, message: "all testimonials are sent", testimonials: getAll });
}

export async function addTestimonial(req, res) {
  const { name, designation, message, image, rating, order, active } = req.body || {};
  if (!name || !message) return res.json({ success: false, message: "All required fields must be filled" });
  const existing = await Testimonial.findOne({ name, message });
  if (existing) return res.json({ success: false, message: "this testimonial already exists" });
  const newTestimonial = await Testimonial.create({ name, designation, message, image, rating, order, active });
  res.json({ success: true, message: "new testimonial added", newTestimonial });
}

export async function editTestimonial(req, res) {
  const { id } = req.params || {};
  const { name, designation, message, image, rating, order, active } = req.body || {};
  if (!id) return res.json({ success: false, message: "testimonial id is required for update" });
  if (!name || !message) return res.json({ success: false, message: "All required fields must be filled" });
  const updated = await Testimonial.findByIdAndUpdate(
    { _id: id },
    { name, designation, message, image, rating, order, active },
    { new: true }
  );
  if (!updated) return res.json({ success: false, message: "testimonial not found" });
  res.json({ success: true, message: "testimonial updated", updated });
}

export async function deleteTestimonial(req, res) {
  const { id } = req.params || {};
  if (!id) return res.json({ success: false, message: "testimonial id is required for delete" });
  const deleted = await Testimonial.findByIdAndDelete(id);
  if (!deleted) return res.json({ success: false, message: "testimonial not found" });
  res.json({ success: true, message: "testimonial deleted" });
}
