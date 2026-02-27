import { model } from "../index.js";

export const generateAIContent = async (prompt) => {
  try {
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        },
      ],
    });

    if (!result || !result.response) {
      return {
        success: false,
        error: 'Failed to generate content: Invalid response from AI model',
        statusCode: 502
      };
    }

    const generatedText = result.response.text();

    if (!generatedText || typeof generatedText !== 'string' || !generatedText.trim()) {
      return {
        success: false,
        error: 'Failed to generate content: Empty or invalid response',
        statusCode: 502
      };
    }

    return {
      success: true,
      data: generatedText
    };
  } catch (error) {
    if (error.message?.includes('API_KEY') || error.message?.includes('authentication')) {
      return {
        success: false,
        error: 'AI service authentication failed. Please contact support.',
        statusCode: 500
      };
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'AI service is temporarily unavailable. Please try again later.',
        statusCode: 503
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to generate content from AI service',
      statusCode: 500
    };
  }
};

export const generateAIContentWithRole = async (prompt, role = 'user') => {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role,
          parts: [{ text: prompt }]
        },
      ],
    });

    if (!result || !result.response) {
      return {
        success: false,
        error: 'Failed to generate content: Invalid response from AI model',
        statusCode: 502
      };
    }

    const generatedText = result.response.text();

    if (!generatedText || typeof generatedText !== 'string' || !generatedText.trim()) {
      return {
        success: false,
        error: 'Failed to generate content: Empty or invalid response',
        statusCode: 502
      };
    }

    return {
      success: true,
      data: generatedText
    };
  } catch (error) {
    if (error.message?.includes('API_KEY') || error.message?.includes('authentication')) {
      return {
        success: false,
        error: 'AI service authentication failed. Please contact support.',
        statusCode: 500
      };
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'AI service is temporarily unavailable. Please try again later.',
        statusCode: 503
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to generate content from AI service',
      statusCode: 500
    };
  }
};

