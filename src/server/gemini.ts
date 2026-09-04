import { GoogleGenAI } from "@google/genai";

// Shared Gemini client utility initialized server-side with User-Agent telemetry
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
