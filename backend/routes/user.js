import express from 'express'
import { getServices } from '../controllers/Service.js';
import { getProjects } from '../controllers/projects.js';
import { getFaqs } from '../controllers/faqs.js';
import { getTestimonials } from '../controllers/testimonials.js';
import { getTechStacks } from '../controllers/techStack.js';
import { validateReviewToken } from '../controllers/reviewLinks.js';
import { listApprovedReviews, submitReview } from '../controllers/reviews.js';
import { reviewUpload } from '../middleware/reviewUpload.js';

const userRouter = express.Router()

userRouter.get("/services", getServices);
userRouter.get("/projects", getProjects);
userRouter.get("/faqs",getFaqs)
userRouter.get("/testimonials",getTestimonials)
userRouter.get("/techStacks",getTechStacks)

// public reviews surface
userRouter.get("/review-links/:token", validateReviewToken)
userRouter.post(
  "/reviews/:token",
  // Multer with built-in error handling: convert multer errors to 400 JSON
  // instead of bubbling them to the global error handler.
  (req, res, next) => {
    const handler = reviewUpload.array("media", 10);
    handler(req, res, (err) => {
      if (err) {
        const message =
          err?.code === "LIMIT_FILE_SIZE"
            ? "One of the files exceeds the maximum allowed size"
            : err?.code === "LIMIT_FILE_COUNT"
            ? "Too many files uploaded"
            : err?.message || "Upload failed";
        return res.status(400).json({ success: false, message });
      }
      next();
    });
  },
  submitReview
)
userRouter.get("/reviews/approved", listApprovedReviews)


export default userRouter