import express from "express";
import fetch from "node-fetch"; // npm i node-fetch@2

const aivaRouter = express.Router();

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  "AIzaSyCOC369SvktPO-3_5ZbKP7pBMEobvkaDe0"; // ← your key

aivaRouter.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages missing or invalid" });
  }

  try {
    // Merge messages into plain text for Gemini
    const userPrompt = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
        }),
      }
    );

    const data = await response.json();

    // 🧠 Robust handling
    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({
        choices: [
          { message: { content: `⚠️ Gemini Error: ${data.error.message}` } },
        ],
      });
    }

    const aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Sorry, I couldn’t generate a response right now.";

    res.json({ choices: [{ message: { content: aiResponse } }] });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({
      choices: [
        { message: { content: "⚠️ Server error. Please try again later." } },
      ],
    });
  }
});

export default aivaRouter;
