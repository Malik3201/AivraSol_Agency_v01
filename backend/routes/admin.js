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


export default adminRouter;
