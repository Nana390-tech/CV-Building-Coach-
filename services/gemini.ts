import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAIContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a helpful CV assistant for A2-level ESL students. Keep answers simple, professional, and encouraging.",
      }
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Could not generate content. Please try again.");
  }
};

export const checkEnglish = async (text: string, context: string) => {
  const prompt = `Review and correct the following ${context} for an A2-level ESL student CV. 
  Fix spelling, capitalization, and formatting only. Do not invent facts.
  
  Text to check:
  ${text}`;
  return generateAIContent(prompt);
};

export const improveWriting = async (text: string, context: string) => {
  const prompt = `Rewrite the following ${context} to be more professional but keep the English simple (A2-B1 level). 
  Text: ${text}`;
  return generateAIContent(prompt);
};