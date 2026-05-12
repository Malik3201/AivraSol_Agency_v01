import crypto from "crypto";
import { ReviewLink } from "../models/reviewLink.js";
import { Review } from "../models/review.js";

const DEFAULT_EXPIRY_DAYS = 30;

function getFrontendUrl() {
  const url = process.env.FRONTEND_URL || "http://localhost:5173";
  return url.replace(/\/+$/, "");
}

function buildPublicLink(token) {
  return `${getFrontendUrl()}/review/${token}`;
}

// Public: GET /review-links/:token
// Returns the lifecycle state of a token so the public submission page can
// decide whether to show the form, "already used", "expired", or "invalid".
export async function validateReviewToken(req, res) {
  try {
    const { token } = req.params || {};
    if (!token) {
      return res
        .status(400)
        .json({ status: "invalid", message: "Invalid review link." });
    }

    const link = await ReviewLink.findOne({ token });
    if (!link) {
      return res.json({
        status: "invalid",
        message: "Invalid review link.",
      });
    }

    if (link.is_used) {
      return res.json({
        status: "used",
        message: "Thank you! You have already submitted your review.",
      });
    }

    if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
      return res.json({
        status: "expired",
        message: "This review link has expired.",
      });
    }

    return res.json({
      status: "valid",
      data: {
        client_name: link.client_name || "",
        project_name: link.project_name || "",
      },
    });
  } catch (error) {
    console.error("validateReviewToken error:", error);
    return res
      .status(500)
      .json({ status: "invalid", message: "Unable to validate review link." });
  }
}

// Admin: POST /admin/review-links
export async function createReviewLink(req, res) {
  try {
    const {
      client_name = "",
      client_email = "",
      project_name = "",
      expires_at,
    } = req.body || {};

    const token = crypto.randomBytes(32).toString("hex");

    let expiry = null;
    if (expires_at) {
      const parsed = new Date(expires_at);
      if (Number.isNaN(parsed.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expires_at value" });
      }
      expiry = parsed;
    } else {
      expiry = new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    }

    const link = await ReviewLink.create({
      token,
      client_name: String(client_name || "").trim(),
      client_email: String(client_email || "").trim(),
      project_name: String(project_name || "").trim(),
      expires_at: expiry,
    });

    return res.json({
      success: true,
      message: "Review link generated",
      reviewLink: link,
      url: buildPublicLink(token),
    });
  } catch (error) {
    console.error("createReviewLink error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate review link" });
  }
}

// Admin: GET /admin/review-links
export async function listReviewLinks(_req, res) {
  try {
    const links = await ReviewLink.find().sort({ created_at: -1 }).lean();
    const frontend = getFrontendUrl();
    const now = Date.now();

    const enriched = links.map((l) => {
      let status = "unused";
      if (l.is_used) status = "used";
      else if (l.expires_at && new Date(l.expires_at).getTime() < now)
        status = "expired";

      return {
        ...l,
        status,
        url: `${frontend}/review/${l.token}`,
      };
    });

    return res.json({
      success: true,
      message: "Review links loaded",
      reviewLinks: enriched,
    });
  } catch (error) {
    console.error("listReviewLinks error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load review links" });
  }
}

// Admin: DELETE /admin/review-links/:id
// Refuses to delete a link that already has an associated review, to keep the
// audit trail intact. Pass ?force=true to override.
export async function deleteReviewLink(req, res) {
  try {
    const { id } = req.params || {};
    const force = String(req.query?.force || "").toLowerCase() === "true";
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "review link id is required" });
    }

    const link = await ReviewLink.findById(id);
    if (!link) {
      return res
        .status(404)
        .json({ success: false, message: "Review link not found" });
    }

    const linkedReview = await Review.findOne({ review_link_id: id }).lean();
    if (linkedReview && !force) {
      return res.status(409).json({
        success: false,
        message:
          "This link has an associated review. Delete the review first or pass force=true.",
      });
    }

    await ReviewLink.deleteOne({ _id: id });
    return res.json({ success: true, message: "Review link deleted" });
  } catch (error) {
    console.error("deleteReviewLink error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete review link" });
  }
}
