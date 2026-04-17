const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../../../middleware/jwt');
const { asyncHandler } = require('../../../middleware/validate');
const { ValidationError } = require('../../../libraries/errors');

const router = express.Router();

// Initialize the new Gemini SDK
// It automatically picks up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

// Restrict AI calls to prevent bill shock
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window` (here, per minute)
  message: { success: false, message: 'Too many requests to the AI Support bot, please try again after a minute' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Protect all support routes
router.use(authenticateToken);

// @route   POST /support/ask
// @desc    Ask the Gemini bot a question
// @access  Private
router.post('/ask', aiLimiter, asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError("Prompt is required and must be a string");
  }

  // System instruction to frame the AI's persona
  const systemInstruction = `You are the technical support assistant for StudentSolution.ai, a platform designed to help students discover and share digital tools. 
Answer concisely. Be helpful, enthusiastic, and focus on resolving user queries about finding tools, using the upvote system, or understanding notifications.`;

  // Provide the combined context to gemini-2.5-flash
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${systemInstruction}\n\nUser Question: ${prompt}`,
  });

  return res.json({
    success: true,
    data: {
      answer: response.text
    }
  });
}));

module.exports = router;
