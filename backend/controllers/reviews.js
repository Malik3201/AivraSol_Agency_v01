import fs from "fs";
import path from "path";
import { ReviewLink } from "../models/reviewLink.js";
import { Review } from "../models/review.js";
import {
  categorize,
  validateReviewFiles,
  MAX_FILES,
} from "../middleware/reviewUpload.js";

const ALLOWED_SERVICE_CATEGORIES = new Set([
  "Website Development",
  "UI/UX Design",
  "Branding",
  "Mobile App Development",
  "Social Media Design",
  "SEO",
  "E-commerce",
  "Custom Software",
  "Other",
]);

const ALLOWED_STATUSES = new Set(["pending", "approved", "rejected"]);

function isValidUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function safeText(value, max = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parseProjectLinks(raw) {
  if (raw === undefined || raw === null || raw === "") return [];
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed)) return null;
  const cleaned = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const url = safeText(item.url, 1000);
    if (!url) continue;
    if (!isValidUrl(url)) return false;
    cleaned.push({
      label: safeText(item.label, 60) || "Other",
      url,
    });
  }
  return cleaned;
}

function getBackendBase(req) {
  const envBase = process.env.BACKEND_URL || process.env.PUBLIC_BACKEND_URL;
  if (envBase) return envBase.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

function buildMediaList(req, files) {
  const base = getBackendBase(req);
  return files.map((file) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    return {
      filename: file.filename,
      originalName: file.originalname,
      url: `${base}/uploads/reviews/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      kind: categorize(ext),
    };
  });
}

function unlinkSafe(absPath) {
  fs.unlink(absPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.warn("Failed to remove file:", absPath, err.message);
    }
  });
}

function cleanupUploaded(files = []) {
  for (const f of files) {
    if (f?.path) unlinkSafe(f.path);
  }
}

// Public: POST /reviews/:token  (multipart/form-data)
export async function submitReview(req, res) {
  const uploaded = Array.isArray(req.files) ? req.files : [];
  try {
    const { token } = req.params || {};
    if (!token) {
      cleanupUploaded(uploaded);
      return res
        .status(400)
        .json({ success: false, message: "Invalid review link." });
    }

    const link = await ReviewLink.findOne({ token });
    if (!link) {
      cleanupUploaded(uploaded);
      return res
        .status(404)
        .json({ success: false, message: "Invalid review link." });
    }
    if (link.is_used) {
      cleanupUploaded(uploaded);
      return res.status(409).json({
        success: false,
        message: "Thank you! You have already submitted your review.",
      });
    }
    if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
      cleanupUploaded(uploaded);
      return res
        .status(410)
        .json({ success: false, message: "This review link has expired." });
    }

    const client_name = safeText(req.body?.client_name, 120);
    const review_text = safeText(req.body?.review_text, 4000);
    const ratingRaw = req.body?.rating;
    const rating = Number(ratingRaw);

    if (!client_name) {
      cleanupUploaded(uploaded);
      return res
        .status(400)
        .json({ success: false, message: "Client name is required" });
    }
    if (!review_text) {
      cleanupUploaded(uploaded);
      return res
        .status(400)
        .json({ success: false, message: "Review text is required" });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      cleanupUploaded(uploaded);
      return res
        .status(400)
        .json({ success: false, message: "Rating must be a number 1-5" });
    }

    const company_name = safeText(req.body?.company_name, 120);
    const project_name = safeText(req.body?.project_name, 200);
    const service_category = safeText(req.body?.service_category, 60);
    if (service_category && !ALLOWED_SERVICE_CATEGORIES.has(service_category)) {
      cleanupUploaded(uploaded);
      return res
        .status(400)
        .json({ success: false, message: "Invalid service category" });
    }

    const projectLinks = parseProjectLinks(req.body?.project_links);
    if (projectLinks === null) {
      cleanupUploaded(uploaded);
      return res.status(400).json({
        success: false,
        message: "project_links must be a JSON array of { label, url } objects",
      });
    }
    if (projectLinks === false) {
      cleanupUploaded(uploaded);
      return res.status(400).json({
        success: false,
        message: "One or more project_links contains an invalid URL",
      });
    }

    if (uploaded.length > MAX_FILES) {
      cleanupUploaded(uploaded);
      return res
        .status(400)
        .json({ success: false, message: `Maximum ${MAX_FILES} files allowed` });
    }
    const sizeError = validateReviewFiles(uploaded);
    if (sizeError) {
      cleanupUploaded(uploaded);
      return res.status(400).json({ success: false, message: sizeError });
    }

    // Atomic single-doc update is our concurrency guard: only the first request
    // to flip is_used from false→true will match. The second concurrent request
    // gets a null result and returns "already submitted".
    const claimed = await ReviewLink.findOneAndUpdate(
      { _id: link._id, is_used: false },
      { $set: { is_used: true, used_at: new Date() } },
      { new: true }
    );
    if (!claimed) {
      cleanupUploaded(uploaded);
      return res.status(409).json({
        success: false,
        message: "Thank you! You have already submitted your review.",
      });
    }

    let review;
    try {
      review = await Review.create({
        review_link_id: link._id,
        client_name,
        company_name,
        project_name,
        service_category,
        project_links: projectLinks,
        review_text,
        rating,
        media_files: buildMediaList(req, uploaded),
        status: "pending",
      });
    } catch (createErr) {
      console.error("Failed to create review, rolling back link:", createErr);
      await ReviewLink.updateOne(
        { _id: link._id },
        { $set: { is_used: false, used_at: null } }
      ).catch(() => {});
      cleanupUploaded(uploaded);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save review" });
    }

    return res.json({
      success: true,
      message:
        "Thank you! Your review has been submitted successfully and is awaiting approval.",
      reviewId: review._id,
    });
  } catch (error) {
    console.error("submitReview error:", error);
    cleanupUploaded(uploaded);
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit review" });
  }
}

// Admin: GET /admin/reviews?status=pending|approved|rejected
export async function listAdminReviews(req, res) {
  try {
    const { status } = req.query || {};
    const filter = {};
    if (status) {
      if (!ALLOWED_STATUSES.has(String(status))) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status filter" });
      }
      filter.status = status;
    }
    const reviews = await Review.find(filter)
      .sort({ created_at: -1 })
      .populate("review_link_id", "token client_name client_email project_name")
      .lean();
    return res.json({
      success: true,
      message: "Reviews loaded",
      reviews,
    });
  } catch (error) {
    console.error("listAdminReviews error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load reviews" });
  }
}

// Admin: GET /admin/reviews/:id
export async function getAdminReview(req, res) {
  try {
    const { id } = req.params || {};
    if (!id)
      return res.status(400).json({ success: false, message: "id required" });
    const review = await Review.findById(id)
      .populate("review_link_id", "token client_name client_email project_name")
      .lean();
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    return res.json({ success: true, review });
  } catch (error) {
    console.error("getAdminReview error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load review" });
  }
}

async function setStatus(req, res, status) {
  try {
    const { id } = req.params || {};
    if (!id)
      return res.status(400).json({ success: false, message: "id required" });
    const review = await Review.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    return res.json({
      success: true,
      message: `Review ${status}`,
      review,
    });
  } catch (error) {
    console.error("setStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update review status" });
  }
}

export const approveReview = (req, res) => setStatus(req, res, "approved");
export const rejectReview = (req, res) => setStatus(req, res, "rejected");

// Admin: PATCH /admin/reviews/:id
export async function updateAdminReview(req, res) {
  try {
    const { id } = req.params || {};
    if (!id)
      return res.status(400).json({ success: false, message: "id required" });

    const update = {};
    const body = req.body || {};

    if (body.client_name !== undefined) {
      const v = safeText(body.client_name, 120);
      if (!v)
        return res
          .status(400)
          .json({ success: false, message: "client_name cannot be empty" });
      update.client_name = v;
    }
    if (body.company_name !== undefined)
      update.company_name = safeText(body.company_name, 120);
    if (body.project_name !== undefined)
      update.project_name = safeText(body.project_name, 200);
    if (body.service_category !== undefined) {
      const v = safeText(body.service_category, 60);
      if (v && !ALLOWED_SERVICE_CATEGORIES.has(v))
        return res
          .status(400)
          .json({ success: false, message: "Invalid service category" });
      update.service_category = v;
    }
    if (body.review_text !== undefined) {
      const v = safeText(body.review_text, 4000);
      if (!v)
        return res
          .status(400)
          .json({ success: false, message: "review_text cannot be empty" });
      update.review_text = v;
    }
    if (body.rating !== undefined) {
      const r = Number(body.rating);
      if (!Number.isFinite(r) || r < 1 || r > 5)
        return res
          .status(400)
          .json({ success: false, message: "rating must be 1-5" });
      update.rating = r;
    }
    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.has(String(body.status)))
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      update.status = body.status;
    }
    if (body.project_links !== undefined) {
      const links = parseProjectLinks(body.project_links);
      if (links === null)
        return res
          .status(400)
          .json({ success: false, message: "Invalid project_links" });
      if (links === false)
        return res
          .status(400)
          .json({ success: false, message: "Invalid URL in project_links" });
      update.project_links = links;
    }

    if (Object.keys(update).length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });

    const review = await Review.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    return res.json({ success: true, message: "Review updated", review });
  } catch (error) {
    console.error("updateAdminReview error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update review" });
  }
}

// Admin: DELETE /admin/reviews/:id
export async function deleteAdminReview(req, res) {
  try {
    const { id } = req.params || {};
    if (!id)
      return res.status(400).json({ success: false, message: "id required" });

    const review = await Review.findById(id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    for (const media of review.media_files || []) {
      if (!media?.filename) continue;
      const abs = path.resolve(
        process.cwd(),
        "uploads",
        "reviews",
        media.filename
      );
      unlinkSafe(abs);
    }

    await Review.deleteOne({ _id: id });
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("deleteAdminReview error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete review" });
  }
}

// Public: GET /reviews/approved
export async function listApprovedReviews(_req, res) {
  try {
    const reviews = await Review.find({ status: "approved" })
      .sort({ created_at: -1 })
      .select(
        "client_name company_name project_name service_category project_links review_text rating media_files created_at"
      )
      .lean();
    return res.json({
      success: true,
      message: "Approved reviews loaded",
      reviews,
    });
  } catch (error) {
    console.error("listApprovedReviews error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load reviews" });
  }
}
