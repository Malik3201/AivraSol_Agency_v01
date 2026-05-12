import mongoose from "mongoose";

const projectLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Other" },
    url: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const mediaFileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    url: { type: String, required: true },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    kind: {
      type: String,
      enum: ["image", "video", "document", "design", "other"],
      default: "other",
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    review_link_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewLink",
      required: true,
      index: true,
    },
    client_name: { type: String, required: true, trim: true },
    company_name: { type: String, trim: true, default: "" },
    project_name: { type: String, trim: true, default: "" },
    service_category: { type: String, trim: true, default: "" },
    project_links: { type: [projectLinkSchema], default: [] },
    review_text: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    media_files: { type: [mediaFileSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
