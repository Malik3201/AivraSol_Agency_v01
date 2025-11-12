import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  types: { type: [String], required: true },
  technologies: { type: [String], default: [] },
  image: { type: String, required: true },
  gallery: { type: [String], default: [] },
  liveUrl: { type: String },
  githubUrl: { type: String },
  client: { type: String },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
export const Project = mongoose.models.Project || mongoose.model("Project",projectSchema)
