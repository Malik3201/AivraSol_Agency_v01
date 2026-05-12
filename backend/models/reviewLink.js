import mongoose from "mongoose";

const reviewLinkSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    client_name: { type: String, trim: true, default: "" },
    client_email: { type: String, trim: true, lowercase: true, default: "" },
    project_name: { type: String, trim: true, default: "" },
    is_used: { type: Boolean, default: false, index: true },
    used_at: { type: Date, default: null },
    expires_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const ReviewLink =
  mongoose.models.ReviewLink || mongoose.model("ReviewLink", reviewLinkSchema);
