import express from "express";
import { adminLogin, adminLogout } from "../controllers/adminAuth.js";
import {
  addService,
  deleteService,
  editService,
  getServices,
} from "../controllers/Service.js";
import {
  addProject,
  deleteProject,
  editProject,
  getProjects,
} from "../controllers/projects.js";
import { addFaq, deleteFaq, editFaq, getFaqs} from "../controllers/faqs.js";
import { addTestimonial, deleteTestimonial, editTestimonial, getTestimonials } from "../controllers/testimonials.js";
import { addTechStack, deleteTechStack, editTechStack, getTechStacks } from "../controllers/techStack.js";
import {
  createReviewLink,
  deleteReviewLink,
  listReviewLinks,
} from "../controllers/reviewLinks.js";
import {
  approveReview,
  deleteAdminReview,
  getAdminReview,
  listAdminReviews,
  rejectReview,
  updateAdminReview,
} from "../controllers/reviews.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
const adminRouter = express.Router();

//Admin Auth
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout/:id", adminLogout);

//Admin Services
adminRouter.get("/service", getServices);
adminRouter.post("/service-add", addService);
adminRouter.put("/service-edit/:id", editService);
adminRouter.delete("/service-delete/:id", deleteService);

//admin Projects
adminRouter.get("/project", getProjects);
adminRouter.post("/project-add", addProject);
adminRouter.put("/project-edit/:id", editProject);
adminRouter.delete("/project-delete/:id", deleteProject);

//admin FAQs
adminRouter.get("/faq",getFaqs)
adminRouter.post("/faq-add",addFaq)
adminRouter.put("/faq-edit/:id",editFaq)
adminRouter.delete("/faq-delete/:id",deleteFaq)

//admin testimonials
adminRouter.get("/testimonials",getTestimonials)
adminRouter.post("/testimonial-add",addTestimonial)
adminRouter.put("/testimonial-edit/:id",editTestimonial)
adminRouter.delete("/testimonial-delete/:id",deleteTestimonial)

//admin tech Stack
adminRouter.get("/techStack",getTechStacks)
adminRouter.post("/techStack-add",addTechStack)
adminRouter.put("/techStack-edit/:id",editTechStack)
adminRouter.delete("/techStack-delete/:id",deleteTechStack)

// admin review links (protected with JWT verifyAdmin middleware)
adminRouter.get("/review-links", verifyAdmin, listReviewLinks);
adminRouter.post("/review-links", verifyAdmin, createReviewLink);
adminRouter.delete("/review-links/:id", verifyAdmin, deleteReviewLink);

// admin reviews
adminRouter.get("/reviews", verifyAdmin, listAdminReviews);
adminRouter.get("/reviews/:id", verifyAdmin, getAdminReview);
adminRouter.patch("/reviews/:id/approve", verifyAdmin, approveReview);
adminRouter.patch("/reviews/:id/reject", verifyAdmin, rejectReview);
adminRouter.patch("/reviews/:id", verifyAdmin, updateAdminReview);
adminRouter.delete("/reviews/:id", verifyAdmin, deleteAdminReview);

export default adminRouter;
