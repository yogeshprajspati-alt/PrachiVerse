import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

// Helper to find the API key in various environments (Vite, CRA, or standard Node)
const getApiKey = () => {
  // 1. Check for Vite environment variable (most likely for this stack)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  // 2. Check for Create React App or standard process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_KEY || process.env.API_KEY;
  }
  return '';
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.warn("Missing API Key. Please set VITE_API_KEY or REACT_APP_API_KEY in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Schema for generating a structured exam question
const questionSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "The question text (very short, max 25 words)." },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Array of 4 concise options."
    },
    correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer." },
    explanation: { type: Type.STRING, description: "One sentence explanation focusing on the key concept." },
    topic: { type: Type.STRING, description: "The specific sub-topic." }
  },
  required: ["text", "options", "correctAnswerIndex", "explanation", "topic"],
};

export const generatePracticeQuestion = async (subject: Subject, topic?: string, previousQuestions: string[] = []): Promise<Question | null> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Create a context of previous questions to avoid (limit to last 8 to save tokens)
    const ignoreList = previousQuestions.slice(-8).map(q => `"${q}"`).join(", ");

    const prompt = `Generate a very short, high-yield multiple-choice question for NEET ${subject}. 
    ${topic ? `Focus specifically on the topic: "${topic}".` : `Focus on "sure-shot" topics that come in NEET every year.`}
    Strictly based on NCERT direct lines or standard formulas.
    Keep the question text extremely brief and direct.
    
    ${ignoreList ? `IMPORTANT: Do NOT generate any of the following questions (or similar variations): ${ignoreList}. Create a distinct new question.` : ''}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.65, // Increased randomness to prevent repetition
      },
    });

    const data = JSON.parse(response.text);
    
    return {
      id: crypto.randomUUID(),
      subject,
      ...data
    };
  } catch (error) {
    console.error("Error generating question:", error);
    return null;
  }
};

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: "You are Prachi's expert NEET tutor. Provide very short, direct answers. Focus on high-yield topics and 'must-know' facts for NEET. Be encouraging but brief.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error in chat:", error);
    return "I'm having trouble connecting to the study server right now. Please try again.";
  }
};

export const generateMotivationalQuote = async (): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate a short, powerful, and personalized motivational quote for a student named Prachi preparing for NEET 2026. 
    It should be encouraging, focus on consistency, discipline, or the dream of becoming a doctor. 
    Keep it under 20 words. No hashtags.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating quote:", error);
    return "Dream it. Believe it. Achieve it. You got this, Prachi!";
  }
};