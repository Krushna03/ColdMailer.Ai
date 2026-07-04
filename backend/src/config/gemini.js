import '../loadEnv.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/email.prompts.js";

const geminiapiKey = process.env.GEMINIAPIKEY;
const genAI = new GoogleGenerativeAI(geminiapiKey);

const MODEL_NAMES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-pro"
];

const createModelInstance = (modelName) => {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.3,
    },
  }, {
    requestOptions: { timeout: 10000 }
  });
};

export const models = MODEL_NAMES.map(name => ({
  name,
  instance: createModelInstance(name)
}));

// Export the primary model for backward compatibility
export const model = models[0].instance;