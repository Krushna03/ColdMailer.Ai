import { models } from "../config/gemini.js";

// Helper to execute Gemini generation with fallback support.
const executeWithFallback = async (executeFn) => {
  let lastError = null;

  for (const modelInfo of models) {
    try {
      console.log(`Attempting AI generation with model: ${modelInfo.name}`);
      const result = await executeFn(modelInfo.instance);

      if (!result || !result.response) {
        throw new Error('Invalid response from AI model');
      }

      const generatedText = result.response.text();

      if (!generatedText || typeof generatedText !== 'string' || !generatedText.trim()) {
        throw new Error('Empty or invalid response from AI model');
      }

      return {
        success: true,
        data: generatedText
      };
    } catch (error) {
      console.error(`GoogleGenerativeAI Service Error with model ${modelInfo.name}:`, error);
      lastError = error;

      // Unrecoverable authentication error - abort fallback loop
      if (error.message?.includes('API_KEY') || error.message?.includes('authentication')) {
        return {
          success: false,
          error: 'AI service authentication failed. Please contact support.',
          statusCode: 500
        };
      }

      console.warn(`Fallback triggered: model ${modelInfo.name} failed. Trying next model...`);
    }
  }

  // If we reach here, all models have failed
  if (lastError) {
    if (lastError.message?.includes('quota') || lastError.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'AI service is temporarily unavailable (rate limited or quota exceeded). Please try again later.',
        statusCode: 503
      };
    }

    return {
      success: false,
      error: `The AI generation service encountered an issue: ${lastError.message || 'unknown error'}. Please check your prompt or try again later.`,
      statusCode: 500
    };
  }

  return {
    success: false,
    error: 'All AI models failed to generate content.',
    statusCode: 500
  };
};

export const generateAIContent = async (prompt) => {
  return executeWithFallback((modelInstance) =>
    modelInstance.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        },
      ],
    })
  );
};

export const generateAIContentWithRole = async (prompt, role = 'user') => {
  return executeWithFallback((modelInstance) =>
    modelInstance.generateContent({
      contents: [
        {
          role,
          parts: [{ text: prompt }]
        },
      ],
    })
  );
};

