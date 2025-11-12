import express from 'express'
import { getServices } from '../controllers/Service.js';
import { getProjects } from '../controllers/projects.js';
import { getFaqs } from '../controllers/faqs.js';
import { getTestimonials } from '../controllers/testimonials.js';
import { getTechStacks } from '../controllers/techStack.js';
const userRouter = express.Router()

userRouter.get("/services", getServices);
userRouter.get("/projects", getProjects);
userRouter.get("/faqs",getFaqs)
userRouter.get("/testimonials",getTestimonials)
userRouter.get("/techStacks",getTechStacks)


export default userRouter