import express from "express";
import fetch from "node-fetch";
import { Project } from "../models/projects.js";
import { Service } from "../models/service.js";
import { TechStack } from "../models/techStack.js";
import { Faq } from "../models/faqs.js";
import { Testimonial } from "../models/testimonials.js";

const aivaRouter = express.Router();

// Secure API configuration from environment variables
const LONGCAT_API_URL = process.env.LONGCAT_API_URL || "https://api.longcat.chat/openai/v1/chat/completions";
const LONGCAT_API_KEY = process.env.LONGCAT_API_KEY;
const LONGCAT_MODEL = process.env.LONGCAT_MODEL || "LongCat-Flash-Chat";

// Validate required environment variables
if (!LONGCAT_API_KEY) {
  console.error("❌ LONGCAT_API_KEY is not set in environment variables");
}

/**
 * Fetch all website data from MongoDB
 */
async function fetchWebsiteData() {
  try {
    const [projects, services, techStacks, faqs, testimonials] = await Promise.all([
      Project.find({}).select("title slug description types technologies client featured").lean(),
      Service.find({}).select("name slug description featured").lean(),
      TechStack.find({ active: true }).select("name category level description").lean(),
      Faq.find({ active: true }).select("question answer category").lean(),
      Testimonial.find({ active: true }).select("name designation message rating").lean(),
    ]);

    return {
      projects: projects || [],
      services: services || [],
      techStacks: techStacks || [],
      faqs: faqs || [],
      testimonials: testimonials || [],
    };
  } catch (error) {
    console.error("Error fetching website data:", error);
    return {
      projects: [],
      services: [],
      techStacks: [],
      faqs: [],
      testimonials: [],
    };
  }
}

/**
 * Build comprehensive context from website data
 */
function buildSystemContext(data) {
  const { projects, services, techStacks, faqs, testimonials } = data;

  // Format services
  const servicesText = services.length > 0
    ? services.map(s => `- **${s.name}**: ${s.description}`).join("\n")
    : "No services data available yet.";

  // Format projects
  const projectsText = projects.length > 0
    ? projects.slice(0, 15).map(p => 
        `- **${p.title}** (${p.types?.join(", ") || "N/A"}): ${p.description}\n  Technologies: ${p.technologies?.join(", ") || "N/A"}`
      ).join("\n")
    : "No projects data available yet.";

  // Format tech stacks by category
  const techByCategory = techStacks.reduce((acc, tech) => {
    const category = tech.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tech.name);
    return acc;
  }, {});

  const techStackText = Object.keys(techByCategory).length > 0
    ? Object.entries(techByCategory)
        .map(([category, techs]) => `**${category}**: ${techs.join(", ")}`)
        .join("\n")
    : "No tech stack data available yet.";

  // Format FAQs
  const faqsText = faqs.length > 0
    ? faqs.slice(0, 10).map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
    : "No FAQs data available yet.";

  // Format testimonials
  const testimonialsText = testimonials.length > 0
    ? testimonials.slice(0, 5).map(t => 
        `"${t.message}" - ${t.name}, ${t.designation || "Client"} (${t.rating}/5 stars)`
      ).join("\n")
    : "No testimonials data available yet.";

  return `You are **Aiva**, AivraSol's AI assistant — a web, AI & software agency that builds exceptional digital solutions.

**RESPONSE RULES:**
- Keep responses SHORT (2-4 sentences max, unless listing items)
- Be IMPRESSIVE and confident, not verbose
- Use emojis sparingly (max 1-2 per response)
- End with ONE clear call-to-action
- Be conversational, warm, and direct

**COMPANY:**
AivraSol specializes in: Custom Web Development | AI Solutions | MERN Stack | UI/UX Design

**SERVICES:**
${servicesText}

**PROJECTS (Top Examples):**
${projectsText.split('\n').slice(0, 10).join('\n')}

**TECH STACK:**
${techStackText}

**QUICK ANSWERS:**
${faqsText.split('\n\n').slice(0, 5).join('\n\n')}

**TESTIMONIALS:**
${testimonialsText.split('\n').slice(0, 2).join('\n')}

**RESPONSE EXAMPLES:**
- Services: "We build modern web apps, AI chatbots, and custom software using React, Node.js, and MongoDB. Want to see our portfolio? 🚀"
- Projects: "Check out our AI Chatbot — intelligent customer support with OpenAI integration. Interested in something similar?"
- Contact: "Reach us through our contact form for a free consultation. What's your project idea?"

**KEY:** Be brief, confident, and always include ONE next step.`;
}

/**
 * Main chat endpoint - handles all AI assistant requests
 */
aivaRouter.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request: messages array is required",
      });
    }

    // Fetch latest website data
    const websiteData = await fetchWebsiteData();

    // Build system context with website data
    const systemContext = buildSystemContext(websiteData);

    // Format messages for LongCat API (OpenAI-compatible format)
    const formattedMessages = [
      {
        role: "system",
        content: systemContext,
      },
      ...messages.map(msg => ({
        role: msg.role || "user",
        content: msg.content || "",
      })),
    ];

    // Call LongCat API
    const response = await fetch(LONGCAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LONGCAT_API_KEY}`,
      },
      body: JSON.stringify({
        model: LONGCAT_MODEL,
        messages: formattedMessages,
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("LongCat API Error:", response.status, errorText);
      
      return res.status(response.status).json({
        success: false,
        error: "AI service temporarily unavailable. Please try again.",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to explore our services and portfolio directly on the website.",
      });
    }

    const data = await response.json();

    // Extract AI response
    const aiMessage = data.choices?.[0]?.message?.content || 
                     "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

    // Return formatted response
    res.json({
      success: true,
      content: aiMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("AI Assistant Error:", error);
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
      content: "I apologize for the inconvenience. Our AI assistant is experiencing technical difficulties. Please try again later or contact our team directly through the contact form.",
    });
  }
});

/**
 * Health check endpoint
 */
aivaRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Aiva AI Assistant",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

export default aivaRouter;
