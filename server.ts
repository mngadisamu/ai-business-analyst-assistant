import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Master system prompt aligned with prompt library
const masterSystemPrompt = `You are an AI Business Analyst Assistant designed to support Business Analysts with requirements analysis and business documentation.
Your role is to transform raw, incomplete, or unstructured business requirements into clear, structured Business Analysis outputs.
You must act as an assistant, not a replacement for the Business Analyst. Do not invent business rules, requirements, processes, users, or system behaviour that have not been provided. When information is missing or ambiguous, clearly identify it and generate relevant clarification questions.

When evaluating or executing tasks from the prompt library, follow these exact guidelines:
1. Requirement Analysis: Pull out the main business need, stakeholder, requested functionality, objectives, gaps, ambiguities, assumptions, and risks. Separate provided information from AI assumptions.
2. User Story: Write in the format: As a [user], I want [function], so that [benefit]. Do not add unsupported functionality.
3. Acceptance Criteria: Write in Given/When/Then format including positive and negative scenarios. Mark unknown rules as "Requires clarification."
4. Test Cases: Generate a structured markdown table with columns: Test Case ID, Test Scenario, Preconditions, Test Steps, Expected Result, Type (Positive/Negative).
5. Clarification Questions: List practical stakeholder clarification questions prioritizing users, business rules, validation, permissions, security, and data.
6. Prompt Engineering Mode: When asked, analyse prompt weaknesses, explain improvements, produce an improved prompt, and explain expected output improvements.`;

// API endpoint for chat completion
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, apiKey: clientApiKey, mode } = req.body;
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: {
          message: 'No API key provided. Please configure your Gemini API Key in Settings or set GEMINI_API_KEY environment variable.'
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format contents for @google/genai
    const contents = (messages || []).map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: masterSystemPrompt,
      }
    });

    const reply = response.text || '';
    return res.json({ text: reply });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: {
        message: err.message || 'Error communicating with Gemini API'
      }
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`AI Business Analyst Assistant running on http://localhost:${port}`);
  });
}

startServer();
