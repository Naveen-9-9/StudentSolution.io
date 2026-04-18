const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../../../middleware/jwt');
const { asyncHandler } = require('../../../middleware/validate');
const { ValidationError } = require('../../../libraries/errors');

const router = express.Router();

// Initialize the new Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Restrict AI calls to prevent bill shock
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests to the AI Support bot, please try again after a minute' }
});

async function generateWithRetry(modelName, prompt, options = {}, retries = 3, delay = 500) {
  const systemInstruction = `You are the technical support assistant for StudentSolution.ai, a platform designed to help students discover and share digital tools. 
Answer concisely. Be helpful, enthusiastic, and focus on resolving user queries about finding tools, using the upvote system, or understanding notifications.`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `${systemInstruction}\n\nUser Question: ${prompt}`,
        ...options
      });
      return response;
    } catch (error) {
      // 503 Service Unavailable or 429 Rate Limit from Gemini
      const isTransient = error.message?.includes('503') || error.status === 'UNAVAILABLE' || error.message?.includes('high demand');
      
      if (isTransient && i < retries - 1) {
        console.log(`Gemini busy (retry ${i + 1}/${retries}). Waiting ${delay}ms...`);
        await sleep(delay * (i + 1)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

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

  const modelName = 'gemini-2.5-flash';

  try {
    const response = await generateWithRetry(modelName, prompt);
    const text = response.text; // The new genai SDK exposes text as a property directly

    return res.json({
      success: true,
      data: {
        answer: text
      }
    });
  } catch (error) {
    if (error.message?.includes('503') || error.status === 'UNAVAILABLE') {
      res.status(503).json({
        success: false,
        message: 'The AI Support assistant is currently experiencing high demand. Please try again in a few seconds.'
      });
    } else {
      throw error;
    }
  }
}));

module.exports = router;
